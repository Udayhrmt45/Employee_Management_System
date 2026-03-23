const env = require("../config/env");
const { getRazorpayClient, verifyPaymentSignature } = require("../config/razorpay");
const { getDatabase } = require("../config/database");
const paymentRepository = require("../repositories/paymentRepository");
const ApiError = require("../utils/ApiError");
const cacheHelper = require("../utils/cacheHelper");
const { CACHE_NAMESPACES } = cacheHelper;

function validateAmount(amount) {
  const normalizedAmount = Number(amount);

  if (!normalizedAmount || normalizedAmount <= 0) {
    throw new ApiError(400, "Valid amount is required");
  }

  return normalizedAmount;
}

function buildOrderPayload(companyId, payload) {
  return {
    amount: payload.amount,
    currency: payload.currency || "INR",
    receipt: `${companyId}-${Date.now()}`,
    notes: {
      companyId: String(companyId),
      plan: payload.plan
    }
  };
}

exports.createOrder = async (companyId, payload) => {
  const amount = validateAmount(payload.amount);

  const razorpay = getRazorpayClient();
  const order = await razorpay.orders.create(buildOrderPayload(companyId, { ...payload, amount }));

  return {
    keyId: env.razorpay.keyId,
    order,
    plan: payload.plan
  };
};

exports.verifyPayment = async (companyId, payload) => {
  const razorpay = getRazorpayClient();
  const isValidSignature = verifyPaymentSignature({
    orderId: payload.razorpayOrderId,
    paymentId: payload.razorpayPaymentId,
    signature: payload.razorpaySignature
  });

  if (!isValidSignature) {
    throw new ApiError(401, "Invalid Razorpay payment signature");
  }

  const db = getDatabase();
  const client = await db.connect();

  try {
    await client.query("BEGIN");
    const razorpayPayment = await razorpay.payments.fetch(payload.razorpayPaymentId);
    const company = await paymentRepository.findCompanyById(companyId, client);

    if (!company) {
      throw new ApiError(404, "Company not found");
    }

    await paymentRepository.updateCompanyPlan(companyId, payload.plan, client);

    const payment = await paymentRepository.createPaymentRecord(
      {
        companyId,
        razorpayPaymentId: payload.razorpayPaymentId,
        amount: Number(razorpayPayment.amount || 0) / 100,
        currency: razorpayPayment.currency || "INR",
        plan: payload.plan,
        status: "PAID"
      },
      client
    );

    await client.query("COMMIT");
    await cacheHelper.invalidateNamespace(CACHE_NAMESPACES.COMPANY_SUBSCRIPTION, companyId);

    return {
      companyId,
      planType: payload.plan,
      payment
    };
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

exports.getSubscription = async (companyId) => {
  const cacheKey = cacheHelper.buildCacheKey(CACHE_NAMESPACES.COMPANY_SUBSCRIPTION, companyId);

  return cacheHelper.getOrSetJson(cacheKey, async () => {
    const company = await paymentRepository.findCompanyById(companyId);

    if (!company) {
      throw new ApiError(404, "Company not found");
    }

    return {
      company,
      latestPayment: await paymentRepository.findLatestPaymentByCompanyId(companyId)
    };
  });
};
