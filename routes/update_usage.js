const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  const pool = req.app.locals.pool;
  const { subscription_id, feature_key, increment_by } = req.body;

  // Default increment_by is 1 if not provided
  const inc = increment_by || 1;

  if (!subscription_id || !feature_key) {
    return res.status(400).json({ error: "subscription_id and feature_key are required" });
  }

  try {
    // Increment the usage count
    const updateResult = await pool.query(
      `UPDATE usage_limits
       SET used_count = used_count + $1
       WHERE subscription_id = $2 AND feature_key = $3
       RETURNING used_count`,
      [inc, subscription_id, feature_key]
    );

    if (updateResult.rowCount === 0) {
      return res.status(404).json({ error: "Usage record not found" });
    }

    res.json({
      status: "Usage updated",
      new_count: updateResult.rows[0].used_count,
    });
  } catch (error) {
    console.error("Error updating usage limit:", error);
    res.status(500).json({ error: "Failed to update usage" });
  }
});

module.exports = router;
