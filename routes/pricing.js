// routes/pricing.js
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const pool = req.app.locals.pool;
  try {
    // Fetch plans
    const plansResult = await pool.query('SELECT * FROM plans ORDER BY id');
    const plans = plansResult.rows;

    // Fetch features and group them by plan_id
    const featuresResult = await pool.query('SELECT * FROM plan_features ORDER BY plan_id');
    const features = featuresResult.rows;

    const pricingData = plans.map(plan => ({
      ...plan,
      features: features.filter(feature => feature.plan_id === plan.id)
    }));

    res.json(pricingData);
  } catch (error) {
    console.error('Error fetching pricing data:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

module.exports = router;
