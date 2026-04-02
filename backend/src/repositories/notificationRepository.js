const { getDatabase } = require("../config/database");

function getExecutor(client) {
  return client || getDatabase();
}

function mapNotification(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    title: row.title,
    message: row.message,
    senderId: row.sender_id,
    senderRole: row.sender_role,
    senderName: row.sender_name,
    senderEmail: row.sender_email,
    scope: row.scope,
    companyId: row.company_id,
    companyName: row.company_name || null,
    targetType: row.target_type,
    isRead: typeof row.is_read === "boolean" ? row.is_read : null,
    readAt: row.read_at || null,
    recipientId: row.recipient_id || null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    recipientCount: row.recipient_count !== undefined ? Number(row.recipient_count) : undefined
  };
}

exports.createNotification = async (payload, client) => {
  const db = getExecutor(client);
  const { rows } = await db.query(
    `INSERT INTO notifications (title, message, sender_id, sender_role, scope, company_id, target_type)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id, title, message, sender_id, sender_role, scope, company_id, target_type, created_at, updated_at`,
    [
      payload.title,
      payload.message,
      payload.senderId,
      payload.senderRole,
      payload.scope,
      payload.companyId || null,
      payload.targetType
    ]
  );

  return mapNotification(rows[0]);
};

exports.updateNotification = async (notificationId, payload, client) => {
  const db = getExecutor(client);
  const fields = [];
  const values = [];

  if (payload.title !== undefined) {
    values.push(payload.title);
    fields.push(`title = $${values.length}`);
  }

  if (payload.message !== undefined) {
    values.push(payload.message);
    fields.push(`message = $${values.length}`);
  }

  if (payload.targetType !== undefined) {
    values.push(payload.targetType);
    fields.push(`target_type = $${values.length}`);
  }

  if (!fields.length) {
    return exports.findById(notificationId, client);
  }

  values.push(notificationId);
  const { rows } = await db.query(
    `UPDATE notifications
     SET ${fields.join(", ")}, updated_at = NOW()
     WHERE id = $${values.length}
     RETURNING id, title, message, sender_id, sender_role, scope, company_id, target_type, created_at, updated_at`,
    values
  );

  return mapNotification(rows[0]);
};

exports.findById = async (notificationId, client) => {
  const db = getExecutor(client);
  const { rows } = await db.query(
    `SELECT
       n.id,
       n.title,
       n.message,
       n.sender_id,
       n.sender_role,
       sender.name AS sender_name,
       sender.email AS sender_email,
       n.scope,
       n.company_id,
       c.name AS company_name,
       n.target_type,
       n.created_at,
       n.updated_at,
       COUNT(nr.id) AS recipient_count
     FROM notifications n
     INNER JOIN users sender ON sender.id = n.sender_id
     LEFT JOIN companies c ON c.id = n.company_id
     LEFT JOIN notification_recipients nr ON nr.notification_id = n.id
     WHERE n.id = $1
     GROUP BY n.id, sender.id, c.id
     LIMIT 1`,
    [notificationId]
  );

  return mapNotification(rows[0]);
};

exports.insertRecipients = async (notificationId, userIds, client) => {
  const db = getExecutor(client);

  if (!userIds.length) {
    return [];
  }

  const placeholders = userIds
    .map((_, index) => `($1, $${index + 2})`)
    .join(", ");

  await db.query(
    `INSERT INTO notification_recipients (notification_id, user_id)
     VALUES ${placeholders}
     ON CONFLICT (notification_id, user_id) DO NOTHING`,
    [notificationId, ...userIds]
  );

  return userIds;
};

exports.replaceRecipients = async (notificationId, userIds, client) => {
  const db = getExecutor(client);
  await db.query(`DELETE FROM notification_recipients WHERE notification_id = $1`, [notificationId]);
  return exports.insertRecipients(notificationId, userIds, client);
};

exports.listForUser = async (userId, options = {}) => {
  const db = getDatabase();
  const limit = options.limit ? Number(options.limit) : 50;
  const unreadOnly = Boolean(options.unreadOnly);
  const params = [userId, limit];
  const unreadFilter = unreadOnly ? "AND nr.is_read = FALSE" : "";
  const { rows } = await db.query(
    `SELECT
       n.id,
       n.title,
       n.message,
       n.sender_id,
       n.sender_role,
       sender.name AS sender_name,
       sender.email AS sender_email,
       n.scope,
       n.company_id,
       c.name AS company_name,
       n.target_type,
       nr.id AS recipient_id,
       nr.is_read,
       nr.read_at,
       n.created_at,
       n.updated_at
     FROM notification_recipients nr
     INNER JOIN notifications n ON n.id = nr.notification_id
     INNER JOIN users sender ON sender.id = n.sender_id
     LEFT JOIN companies c ON c.id = n.company_id
     WHERE nr.user_id = $1
       ${unreadFilter}
     ORDER BY COALESCE(nr.read_at, n.created_at) DESC, n.created_at DESC
     LIMIT $2`,
    params
  );

  return rows.map(mapNotification);
};

exports.countUnreadForUser = async (userId) => {
  const db = getDatabase();
  const { rows } = await db.query(
    `SELECT COUNT(*) AS unread_count
     FROM notification_recipients
     WHERE user_id = $1 AND is_read = FALSE`,
    [userId]
  );

  return Number(rows[0]?.unread_count || 0);
};

exports.markAsRead = async (notificationId, userId) => {
  const db = getDatabase();
  const { rows } = await db.query(
    `UPDATE notification_recipients
     SET is_read = TRUE,
         read_at = COALESCE(read_at, NOW())
     WHERE notification_id = $1 AND user_id = $2
     RETURNING id, notification_id, user_id, is_read, read_at`,
    [notificationId, userId]
  );

  return rows[0] || null;
};

exports.hasRecipient = async (notificationId, userId) => {
  const db = getDatabase();
  const { rows } = await db.query(
    `SELECT id
     FROM notification_recipients
     WHERE notification_id = $1 AND user_id = $2
     LIMIT 1`,
    [notificationId, userId]
  );

  return Boolean(rows[0]);
};

exports.deleteNotification = async (notificationId, client) => {
  const db = getExecutor(client);
  const { rowCount } = await db.query(`DELETE FROM notifications WHERE id = $1`, [notificationId]);
  return rowCount > 0;
};

exports.listAllUserIds = async (client) => {
  const db = getExecutor(client);
  const { rows } = await db.query(`SELECT id FROM users ORDER BY id ASC`);
  return rows.map((row) => row.id);
};

exports.listOwnerUserIds = async (client) => {
  const db = getExecutor(client);
  const { rows } = await db.query(`SELECT id FROM users WHERE role = 'OWNER' ORDER BY id ASC`);
  return rows.map((row) => row.id);
};

exports.listSelectedOwnerUserIds = async (ownerIds, client) => {
  const db = getExecutor(client);

  if (!ownerIds.length) {
    return [];
  }

  const { rows } = await db.query(
    `SELECT id
     FROM users
     WHERE role = 'OWNER' AND id = ANY($1::bigint[])
     ORDER BY id ASC`,
    [ownerIds]
  );

  return rows.map((row) => row.id);
};

exports.listCompanyUserIds = async (companyId, client) => {
  const db = getExecutor(client);
  const { rows } = await db.query(
    `SELECT id
     FROM users
     WHERE company_id = $1
     ORDER BY id ASC`,
    [companyId]
  );

  return rows.map((row) => row.id);
};

exports.listCompanyAdminUserIds = async (companyId, client) => {
  const db = getExecutor(client);
  const { rows } = await db.query(
    `SELECT id
     FROM users
     WHERE company_id = $1 AND role = 'ADMIN'
     ORDER BY id ASC`,
    [companyId]
  );

  return rows.map((row) => row.id);
};

exports.listOwnerTargets = async () => {
  const db = getDatabase();
  const { rows } = await db.query(
    `SELECT
       u.id,
       u.name,
       u.email,
       u.company_id,
       c.name AS company_name
     FROM users u
     LEFT JOIN companies c ON c.id = u.company_id
     WHERE u.role = 'OWNER'
     ORDER BY c.name ASC NULLS LAST, u.name ASC NULLS LAST, u.id ASC`
  );

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    companyId: row.company_id,
    companyName: row.company_name || null
  }));
};
