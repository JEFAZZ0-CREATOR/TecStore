const Stripe = require('stripe');
const { STRIPE_SECRET } = require('../../config/index');

const stripe = STRIPE_SECRET ? new Stripe(STRIPE_SECRET) : null;

exports.createPaymentIntent = async ({ amount, currency = 'usd', metadata = {} }) => {
  if (!stripe) {
    return { id: `mock_${Date.now()}`, client_secret: 'mock_client_secret', amount, currency, status: 'requires_payment_method' };
  }
  return stripe.paymentIntents.create({
    amount,
    currency,
    metadata,
    automatic_payment_methods: { enabled: true },
  });
};

exports.retrievePayment = async (paymentId) => {
  if (!stripe) {
    return { id: paymentId, status: 'succeeded' };
  }
  return stripe.paymentIntents.retrieve(paymentId);
};
