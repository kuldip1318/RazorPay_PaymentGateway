// utils/usageTracker.js
async function incrementUsage(pool, subscriptionId, featureKey) {
    try {
      await pool.query(
        `UPDATE usage_limits 
         SET used_count = used_count + 1 
         WHERE subscription_id = $1 AND feature_key = $2`,
        [subscriptionId, featureKey]
      );
    } catch (error) {
      console.error('Error incrementing usage:', error);
    }
  }
  
  async function isUsageExceeded(pool, subscriptionId, featureKey, limitValue) {
    const result = await pool.query(
      `SELECT used_count FROM usage_limits 
       WHERE subscription_id = $1 AND feature_key = $2`,
      [subscriptionId, featureKey]
    );
    if (result.rowCount === 0) return false;
    const usedCount = result.rows[0].used_count;
    return usedCount >= parseInt(limitValue, 10);
  }
  
  module.exports = { incrementUsage, isUsageExceeded };
  