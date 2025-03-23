// routes/user-subscriptions.js
const express = require("express");
const router = express.Router();

router.get("/", async (req, res) => {
  console.log("Request received on /user-subscriptions");
  console.log("Cookies:", req.cookies);

  const pool = req.app.locals.pool;
  const userId = req.headers.xuserid;

  if (!userId) {
    console.log("Error: No userId cookie found");
    return res.status(401).json({ error: "User not authenticated: missing userId cookie" });
  }

  try {
    console.log(`Querying active subscription for userId: ${userId}`);
    const result = await pool.query(
      `SELECT plan, is_annual 
       FROM subscriptions 
       WHERE user_id = $1 AND status = 'active'
       ORDER BY start_date DESC
       LIMIT 1`,
      [userId]
    );

    if (result.rowCount === 0) {
      console.log(`No active subscription found for userId: ${userId}`);
      return res.json({ plan: "Free", is_annual: false });
    }

    console.log("Active subscription retrieved:", result.rows[0]);
    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching user subscription:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
