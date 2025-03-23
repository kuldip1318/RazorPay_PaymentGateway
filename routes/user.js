// routes/user.js
const express = require("express");
const router = express.Router();

// Base route: GET /user
router.get("/", (req, res) => {
  // Extract headers (they are case-insensitive)
  const { xuserid: XUserId, companyid: CompanyId } = req.headers;
  res.json({
    message: "User information retrieved from headers",
    XUserId: XUserId || null,
    CompanyId: CompanyId || null,
  });
});

// Sub-route: GET /user/subscription
router.get("/subscription", async (req, res) => {
  const pool = req.app.locals.pool;
  
  // Extract userId from headers instead of cookies
  const userId = req.headers['xuserid'];
  
  if (!userId) {
    return res
      .status(401)
      .json({ error: "User not authenticated: missing XUserId header" });
  }
  
  try {
    // Query the active subscription for the user (if any)
    const result = await pool.query(
      `SELECT s.*, p.name AS plan_name
       FROM subscriptions s
       JOIN plans p ON s.plan_id = p.id
       WHERE s.user_id = $1 AND s.status = 'active'
       ORDER BY s.start_date DESC
       LIMIT 1`,
      [userId]
    );
    
    if (result.rowCount === 0) {
      // No active subscription found; return default plan values
      return res.json({ plan: "Free", is_annual: false });
    }
    
    // Return the active subscription record
    return res.json(result.rows[0]);
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
