// server.js
require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const session = require('express-session');
const cors = require('cors');
const cron = require('node-cron');
const cookieParser = require('cookie-parser');

const app = express();

// Configure CORS to allow credentials from the frontend
app.use(cors({
  origin: ['http://localhost:3000'],
  credentials: true,
}));

// Use cookie-parser to parse cookies from incoming requests
app.use(cookieParser());

// Set up session middleware (if used)
app.use(session({
  secret: 'your-secret-key', // replace with a secure secret in production
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 24 * 60 * 60 * 1000 } // 1 day
}));

// Use express.json with raw body capture
app.use(express.json({
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}));

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
app.locals.pool = pool;

// Import API routes
const pricingRoutes = require('./routes/pricing'); // assumed to exist
const subscriptionsRoutes = require('./routes/subscriptions');
const ordersRoutes = require('./routes/orders');       // assumed to exist
const paymentWebhookRoutes = require('./routes/paymentwebhook'); // optional
const updateSubscriptionRoutes = require('./routes/update-subscription');
const userRoutes = require('./routes/user'); // our updated user.js
const getUserCompanyRoutes = require('./routes/getUserCompany'); // optional
const userSubscriptionsRouter = require("./routes/user-subscriptions");
const updateUsageRoutes = require('./routes/update_usage');

// Mount routes
app.use('/payment_getway/pricing', pricingRoutes);
app.use('/payment_getway/subscriptions', subscriptionsRoutes);
app.use('/payment_getway/create-order', ordersRoutes);
app.use('/payment_getway/payment-webhook', paymentWebhookRoutes);
app.use('/payment_getway/update-subscription', updateSubscriptionRoutes);
app.use('/payment_getway/user', userRoutes);           // This mounts GET /api/user and GET /api/user/subscription
app.use('/payment_getway/get-user-company', getUserCompanyRoutes); // optional
app.use("/payment_getway/user-subscriptions", userSubscriptionsRouter);
app.use('/payment_getway/update-usage', updateUsageRoutes);

// Cron job (if needed)
cron.schedule('0 0 1 * *', async () => {
  try {
    await pool.query(`
      UPDATE usage_limits
      SET used_count = 0,
          reset_date = NOW() + INTERVAL '1 month'
      WHERE reset_date < NOW()
    `);
    console.log('Usage counters reset successfully');
  } catch (error) {
    console.error('Error resetting usage counters:', error);
  }
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
