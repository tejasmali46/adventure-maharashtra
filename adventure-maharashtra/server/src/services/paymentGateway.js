import crypto from 'crypto';

const RAZORPAY_KEY_ID = process.env.RAZORPAY_KEY_ID || 'rzp_test_adventure_mh_sandbox';
const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'adv_mh_secret_key_2026';

/**
 * Creates an order either via Razorpay SDK (if live keys configured)
 * or via realistic cryptographically-sound Sandbox Gateway.
 */
export async function createGatewayOrder({ amountPaise, currency = 'INR', receipt }) {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET && !process.env.RAZORPAY_KEY_ID.includes('sandbox')) {
    try {
      const Razorpay = (await import('razorpay')).default;
      const rzp = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID,
        key_secret: process.env.RAZORPAY_KEY_SECRET
      });
      const order = await rzp.orders.create({
        amount: amountPaise,
        currency,
        receipt: receipt.slice(0, 40)
      });
      return {
        provider: 'RAZORPAY',
        orderId: order.id,
        amountPaise: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID
      };
    } catch (err) {
      console.warn('[PaymentGateway]: Live Razorpay initialization failed, falling back to Sandbox Gateway:', err.message);
    }
  }

  // Realistic Sandbox Gateway implementation
  const orderId = `order_sandbox_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  return {
    provider: 'MOCK_SANDBOX',
    orderId,
    amountPaise,
    currency,
    keyId: RAZORPAY_KEY_ID
  };
}

/**
 * Computes official HMAC SHA-256 signature for verification & sandbox testing
 */
export function computeGatewaySignature(orderId, paymentId, secret = RAZORPAY_KEY_SECRET) {
  return crypto
    .createHmac('sha256', secret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex');
}

/**
 * Verifies payment signature integrity with timing-safe comparison
 */
export function verifyGatewaySignature(orderId, paymentId, signature, secret = RAZORPAY_KEY_SECRET) {
  if (!orderId || !paymentId || !signature) return false;
  const expectedSignature = computeGatewaySignature(orderId, paymentId, secret);
  
  const sigBuffer = Buffer.from(signature, 'utf8');
  const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

  // timingSafeEqual requires equal length buffers
  if (sigBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(sigBuffer, expectedBuffer);
}

/**
 * Generates test simulated payment credentials with matching valid HMAC SHA-256 signature
 */
export function generateSandboxPaymentPayload(orderId) {
  const paymentId = `pay_sandbox_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const signature = computeGatewaySignature(orderId, paymentId);
  return {
    razorpay_order_id: orderId,
    razorpay_payment_id: paymentId,
    razorpay_signature: signature
  };
}