
// const express = require("express");
// const router = express.Router();

// router.post("/", async (req, res) => {
//   const pool = req.app.locals.pool;
//   const { payment_id, order_id, subscription_id, plan_id } = req.body;
  
//   console.log("Update Subscription Request Received:", req.body);
  
//   try {
//     // Retrieve plan name from the plans table using plan_id
//     const planQuery = await pool.query("SELECT name FROM plans WHERE id = $1", [plan_id]);
//     const planName = planQuery.rows.length > 0 ? planQuery.rows[0].name : "Unknown";
    
//     const updateResult = await pool.query(
//       `UPDATE subscriptions
//        SET status = 'active',
//            start_date = NOW(),
//            end_date = NOW() + INTERVAL '1 month',
//            payment_reference = $1,
//            plan = $2
//        WHERE id = $3`,
//       [payment_id, planName, subscription_id]
//     );
    
//     console.log("Subscription update rowCount:", updateResult.rowCount);
//     if (updateResult.rowCount === 0) {
//       console.error("No subscription record updated for subscription_id:", subscription_id);
//       return res.status(404).json({ error: "Subscription not found" });
//     }
    
//     res.json({ status: "Subscription updated successfully" });
//   } catch (error) {
//     console.error("Error updating subscription:", error);
//     res.status(500).json({ error: "Subscription update failed" });
//   }
// });

// module.exports = router;


const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  const pool = req.app.locals.pool;
  const { payment_id, order_id, subscription_id, plan_id } = req.body;
  
  console.log("Update Subscription Request Received:", req.body);
  
  try {
    // Retrieve plan name from the plans table using plan_id
    const planQuery = await pool.query("SELECT name FROM plans WHERE id = $1", [plan_id]);
    const planName = planQuery.rows.length > 0 ? planQuery.rows[0].name : "Unknown";
    
    // Update the subscription to active
    const updateResult = await pool.query(
      `UPDATE subscriptions
       SET status = 'active',
           start_date = NOW(),
           end_date = NOW() + INTERVAL '1 month',
           payment_reference = $1,
           plan = $2
       WHERE id = $3
       RETURNING id`,
      [payment_id, planName, subscription_id]
    );
    
    if (updateResult.rowCount === 0) {
      console.error("No subscription record updated for subscription_id:", subscription_id);
      return res.status(404).json({ error: "Subscription not found" });
    }
    
    // Initialize usage limits for each plan feature
    const featuresResult = await pool.query(
      `SELECT feature_key FROM plan_features WHERE plan_id = $1`,
      [plan_id]
    );
    
    for (const feature of featuresResult.rows) {
      // Check if a record already exists to avoid duplicates
      const usageCheck = await pool.query(
        `SELECT id FROM usage_limits WHERE subscription_id = $1 AND feature_key = $2`,
        [subscription_id, feature.feature_key]
      );
      if (usageCheck.rowCount === 0) {
        await pool.query(
          `INSERT INTO usage_limits (subscription_id, feature_key, used_count, reset_date)
           VALUES ($1, $2, 0, NOW() + INTERVAL '1 month')`,
          [subscription_id, feature.feature_key]
        );
      }
    }
    
    console.log("Subscription updated and usage limits initialized.");
    res.json({ status: "Subscription updated successfully" });
  } catch (error) {
    console.error("Error updating subscription:", error);
    res.status(500).json({ error: "Subscription update failed" });
  }
});

module.exports = router;
