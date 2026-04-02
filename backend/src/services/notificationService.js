const notificationRepository = require("../repositories/notificationRepository");
const ApiError = require("../utils/ApiError");
const { getDatabase } = require("../config/database");
const { ROLES } = require("../utils/roleHierarchy");

const TARGET_TYPES = {
  ALL_USERS: "ALL_USERS",
  ALL_OWNERS: "ALL_OWNERS",
  COMPANY_ALL: "COMPANY_ALL",
  COMPANY_ADMINS: "COMPANY_ADMINS",
  SELECTED_OWNERS: "SELECTED_OWNERS"
};

const SCOPE = {
  PLATFORM: "PLATFORM",
  COMPANY: "COMPANY"
};

const SEND_TARGETS_BY_ROLE = {
  [ROLES.SUPER_ADMIN]: [TARGET_TYPES.ALL_USERS, TARGET_TYPES.ALL_OWNERS, TARGET_TYPES.SELECTED_OWNERS],
  [ROLES.OWNER]: [TARGET_TYPES.COMPANY_ALL, TARGET_TYPES.COMPANY_ADMINS],
  [ROLES.ADMIN]: [TARGET_TYPES.COMPANY_ALL],
  [ROLES.EMPLOYEE]: []
};

function getSendPermissions(role) {
  const allowedTargetTypes = SEND_TARGETS_BY_ROLE[role] || [];

  return {
    canSend: allowedTargetTypes.length > 0,
    allowedTargetTypes,
  };
}

function assertCanSend(actor, targetType) {
  const permissions = getSendPermissions(actor.role);

  if (!permissions.canSend) {
    throw new ApiError(403, "You do not have permission to send notifications");
  }

  if (!permissions.allowedTargetTypes.includes(targetType)) {
    throw new ApiError(403, "You do not have permission to send notifications to the selected audience");
  }
}

function resolveNotificationScope(actor, targetType) {
  if ([TARGET_TYPES.ALL_USERS, TARGET_TYPES.ALL_OWNERS, TARGET_TYPES.SELECTED_OWNERS].includes(targetType)) {
    if (actor.role !== ROLES.SUPER_ADMIN) {
      throw new ApiError(403, "Only SUPER_ADMIN can send platform-wide notifications");
    }

    return {
      scope: SCOPE.PLATFORM,
      companyId: null
    };
  }

  if (!actor.company_id) {
    throw new ApiError(403, "Company-scoped notifications require a valid company");
  }

  return {
    scope: SCOPE.COMPANY,
    companyId: actor.company_id
  };
}

async function resolveRecipientUserIds(actor, targetType, selectedOwnerIds = [], client) {
  switch (targetType) {
    case TARGET_TYPES.ALL_USERS:
      return notificationRepository.listAllUserIds(client);
    case TARGET_TYPES.ALL_OWNERS:
      return notificationRepository.listOwnerUserIds(client);
    case TARGET_TYPES.SELECTED_OWNERS: {
      if (!selectedOwnerIds.length) {
        throw new ApiError(422, "selectedOwnerIds is required for SELECTED_OWNERS notifications");
      }

      const ownerIds = await notificationRepository.listSelectedOwnerUserIds(selectedOwnerIds, client);

      if (ownerIds.length !== selectedOwnerIds.length) {
        throw new ApiError(422, "One or more selected owners are invalid");
      }

      return ownerIds;
    }
    case TARGET_TYPES.COMPANY_ALL:
      return notificationRepository.listCompanyUserIds(actor.company_id, client);
    case TARGET_TYPES.COMPANY_ADMINS:
      return notificationRepository.listCompanyAdminUserIds(actor.company_id, client);
    default:
      throw new ApiError(422, "Unsupported notification target type");
  }
}

function canManageNotification(actor, notification) {
  if (!notification) {
    return false;
  }

  if (Number(notification.senderId) === Number(actor.id)) {
    return true;
  }

  if (actor.role === ROLES.SUPER_ADMIN && notification.scope === SCOPE.PLATFORM) {
    return true;
  }

  if (
    actor.role === ROLES.OWNER &&
    notification.scope === SCOPE.COMPANY &&
    Number(notification.companyId) === Number(actor.company_id) &&
    notification.senderRole === ROLES.ADMIN
  ) {
    return true;
  }

  return false;
}

function mapNotificationWithPermissions(notification, actor) {
  return {
    ...notification,
    canEdit: canManageNotification(actor, notification),
    canDelete: canManageNotification(actor, notification)
  };
}

exports.sendNotification = async (actor, payload) => {
  assertCanSend(actor, payload.targetType);
  const db = getDatabase();
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const scopeDetails = resolveNotificationScope(actor, payload.targetType);
    const recipientUserIds = await resolveRecipientUserIds(actor, payload.targetType, payload.selectedOwnerIds, client);

    if (!recipientUserIds.length) {
      throw new ApiError(400, "No recipients matched the selected audience");
    }

    const notification = await notificationRepository.createNotification({
      title: payload.title,
      message: payload.message,
      senderId: actor.id,
      senderRole: actor.role,
      scope: scopeDetails.scope,
      companyId: scopeDetails.companyId,
      targetType: payload.targetType
    }, client);

    await notificationRepository.insertRecipients(notification.id, recipientUserIds, client);
    await client.query("COMMIT");

    const hydrated = await notificationRepository.findById(notification.id);
    return mapNotificationWithPermissions(hydrated, actor);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

exports.listNotifications = async (actor, query = {}) => {
  const [notifications, unreadCount, ownerTargets] = await Promise.all([
    notificationRepository.listForUser(actor.id, query),
    notificationRepository.countUnreadForUser(actor.id),
    actor.role === ROLES.SUPER_ADMIN ? notificationRepository.listOwnerTargets() : Promise.resolve([])
  ]);

  const permissions = getSendPermissions(actor.role);

  return {
    notifications: notifications.map((notification) => mapNotificationWithPermissions(notification, actor)),
    unreadCount,
    permissions,
    availableOwners: ownerTargets
  };
};

exports.markAsRead = async (actor, notificationId) => {
  const hasRecipient = await notificationRepository.hasRecipient(notificationId, actor.id);

  if (!hasRecipient) {
    throw new ApiError(404, "Notification not found for the authenticated user");
  }

  const recipient = await notificationRepository.markAsRead(notificationId, actor.id);
  return recipient;
};

async function getManagedNotificationOrThrow(actor, notificationId) {
  const notification = await notificationRepository.findById(notificationId);

  if (!notification) {
    throw new ApiError(404, "Notification not found");
  }

  if (!canManageNotification(actor, notification)) {
    throw new ApiError(403, "You do not have permission to modify this notification");
  }

  return notification;
}

exports.updateNotification = async (actor, notificationId, payload) => {
  const existingNotification = await getManagedNotificationOrThrow(actor, notificationId);
  const nextTargetType = payload.targetType || existingNotification.targetType;

  if (payload.targetType) {
    assertCanSend(actor, nextTargetType);
  }

  if (existingNotification.scope === SCOPE.COMPANY && Number(existingNotification.companyId) !== Number(actor.company_id || existingNotification.companyId)) {
    throw new ApiError(403, "You do not have permission to modify notifications outside your company");
  }

  const db = getDatabase();
  const client = await db.connect();

  try {
    await client.query("BEGIN");

    const updatedNotification = await notificationRepository.updateNotification(notificationId, {
      title: payload.title,
      message: payload.message,
      targetType: payload.targetType
    }, client);

    const shouldRefreshRecipients = payload.targetType !== undefined || payload.selectedOwnerIds !== undefined;

    if (shouldRefreshRecipients) {
      const actorContext = {
        ...actor,
        company_id: existingNotification.companyId || actor.company_id
      };
      const recipientUserIds = await resolveRecipientUserIds(actorContext, nextTargetType, payload.selectedOwnerIds || [], client);

      if (!recipientUserIds.length) {
        throw new ApiError(400, "No recipients matched the selected audience");
      }

      await notificationRepository.replaceRecipients(notificationId, recipientUserIds, client);
    }

    await client.query("COMMIT");

    const hydrated = await notificationRepository.findById(updatedNotification.id);
    return mapNotificationWithPermissions(hydrated, actor);
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

exports.deleteNotification = async (actor, notificationId) => {
  await getManagedNotificationOrThrow(actor, notificationId);
  const deleted = await notificationRepository.deleteNotification(notificationId);

  if (!deleted) {
    throw new ApiError(404, "Notification not found");
  }

  return { id: Number(notificationId) };
};
