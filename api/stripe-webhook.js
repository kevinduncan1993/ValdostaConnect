require('dotenv').config(); // Load environment variables

const express = require('express');
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const app = express();

// Stripe requires raw body for webhook verification
app.use('/stripe-webhook', express.raw({ type: 'application/json' }));

app.post('/stripe-webhook', async (req, res) => {
  console.log('🔥 Webhook hit');

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  console.log('✅ Event type:', event.type);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const supabase_user_id = session.metadata?.supabase_user_id;

    console.log('✅ Webhook received');
    console.log('📦 Session metadata:', session.metadata);
    console.log('🆔 Supabase User ID:', supabase_user_id);

    if (!supabase_user_id) {
      console.error('⚠️ Supabase user ID is missing in metadata.');
      return res.status(400).send('Missing user ID');
    }

    try {
      const response = await fetch(`${process.env.SUPABASE_URL}/rest/v1/users`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          apikey: process.env.SUPABASE_SERVICE_ROLE_KEY,
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        body: JSON.stringify([{ id: supabase_user_id, is_active: true }]),
      });

      const result = await response.json();
      console.log('📬 Supabase response:', result);
    } catch (err) {
      console.error('❌ Error updating Supabase:', err);
    }
  }

  res.status(200).send('Webhook received');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Webhook server running on port ${PORT}`);
});
