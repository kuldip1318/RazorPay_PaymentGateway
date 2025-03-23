const express = require("express");
const router = express.Router();

// You might want to use a signature validator for security
router.post("/", async (req, res) => {
  const pool = req.app.locals.pool;
  const {
    subscription_id,
    payment_id,
    amount,
    currency,
    status, // e.g., "captured", "failed"
  } = req.body;

  if (!subscription_id || !payment_id) {
    return res.status(400).json({ error: "Missing subscription_id or payment_id" });
  }

  try {
    // Insert payment details into payments table
    const insertResult = await pool.query(
      `INSERT INTO payments (subscription_id, payment_id, amount, currency, status)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [subscription_id, payment_id, amount, currency, status]
    );

    console.log("Payment recorded:", insertResult.rows[0]);
    res.json({ status: "Payment recorded successfully" });
  } catch (error) {
    console.error("Error recording payment:", error);
    res.status(500).json({ error: "Payment record insertion failed" });
  }
});

module.exports = router;
