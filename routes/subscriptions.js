// // routes/subscriptions.js
// const express = require("express");
// const router = express.Router();

// router.post("/", async (req, res) => {
//   const pool = req.app.locals.pool;
  
//   // Check for user authentication
//   if (!(req.session && req.session.userId)) {
//     return res.status(401).json({ error: "User not authenticated" });
//   }
//   const userId = req.session.userId;

//   const { planId, isAnnual } = req.body;
//   if (!planId) {
//     return res.status(400).json({ error: "Plan ID is required" });
//   }

//   try {
//     const subscriptionInsert = await pool.query(
//       `INSERT INTO subscriptions (user_id, plan_id, is_annual, start_date, end_date, status, plan)
//        VALUES ($1, $2, $3, NOW(), NOW() + INTERVAL '1 month', $4, $5)
//        RETURNING id`,
//       [userId, planId, isAnnual, "pending", "Free"]
//     );
//     console.log("Subscription created successfully:", subscriptionInsert.rows[0]);
//     res.json(subscriptionInsert.rows[0]);
//   } catch (error) {
//     console.error("Error creating subscription:", error);
//     res.status(500).json({ error: "Error creating subscription" });
//   }
// });

// module.exports = router;

// routes/subscriptions.js
const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  const pool = req.app.locals.pool;
  
  // Extract userId from cookies (using cookie-parser)
  const userId = req.headers.xuserid;
  if (!userId) {
    return res.status(401).json({ error: "User not authenticated: missing userId headers" });
  }
  
  const { planId, isAnnual } = req.body;
  if (!planId) {
    return res.status(400).json({ error: "Plan ID is required" });
  }
  
  try {
    const subscriptionInsert = await pool.query(
      `INSERT INTO subscriptions (user_id, plan_id, is_annual, start_date, end_date, status, plan)
       VALUES ($1, $2, $3, NULL, NULL, 'pending', 'Free')
       RETURNING id`,
      [userId, planId, isAnnual]
    );
    console.log("Subscription created successfully:", subscriptionInsert.rows[0]);
    res.json(subscriptionInsert.rows[0]); // e.g., { id: 12 }
  } catch (error) {
    console.error("Error creating subscription:", error);
    res.status(500).json({ error: "Error creating subscription" });
  }
});

module.exports = router;
