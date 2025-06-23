const express = require("express");
const app = express();
const PORT = process.env.PORT || 10000;

// Parse incoming JSON requests
app.use(express.json());

// ✅ Stripe Webhook Endpoint
app.post("/stripe-webhook", (req, res) => {
  console.log("✅ Stripe event received:", req.body);
  res.sendStatus(200);
});

// ✅ Root Route for basic GET check
app.get("/", (req, res) => {
  res.send("✅ Valdosta Connect backend is running.");
});

// Start the server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
