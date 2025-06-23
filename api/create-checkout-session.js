const Stripe = require('stripe');
const express = require('express');
const cors = require('cors');

const stripe = new Stripe('YOUR_SECRET_STRIPE_KEY');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/create-checkout-session', async (req, res) => {
  const { email, user_id } = req.body;

  const session = await stripe.checkout.sessions.create({
    customer_email: email,
    mode: 'subscription',
    line_items: [
      {
        price: 'YOUR_STRIPE_PRICE_ID', // e.g. price_1234...
        quantity: 1
      }
    ],
    subscription_data: {
      trial_period_days: 3,
      metadata: {
        supabase_user_id: user_id
      }
    },
    success_url: 'https://yourapp.com/success',
    cancel_url: 'https://yourapp.com/cancel'
  });

  res.json({ url: session.url });
});

module.exports = app;
