const crypto = require("crypto");
const Razorpay = require("razorpay");

const env = require("./env");

let razorpayClient;

function getRazorpayClient() {
  if (!razorpayClient) {
    razorpayClient = new Razorpay({
      key_id: env.razorpay.keyId,
      key_secret: env.razorpay.keySecret
    });
  }

  return razorpayClient;
}

function verifyPaymentSignature({ orderId, paymentId, signature }) {
  const generatedSignature = crypto
    .createHmac("sha256", env.razorpay.keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  return generatedSignature === signature;
}

module.exports = {
  getRazorpayClient,
  verifyPaymentSignature
};
