// // routes/orders.js
// const express = require("express");
// const router = express.Router();
// const Razorpay = require("razorpay");

// const razorpayInstance = new Razorpay({
//   key_id: process.env.RAZORPAY_LIVE_KEY_ID,
//   key_secret: process.env.RAZORPAY_KEY_SECRET,
// });

// router.post("/", async (req, res) => {
//     const { amount, currency, receipt, subscriptionId, planId } = req.body;
    
//     if (!subscriptionId || !planId) {
//       return res.status(400).json({ error: "subscriptionId and planId are required" });
//     }
    
//     const options = {
//       amount: amount * 100, // convert rupees to paise
//       currency,
//       receipt,
//       notes: {
//         subscription_id: subscriptionId.toString(),
//         plan_id: planId.toString(),
//       },
//     };
    
//     try {
//       const order = await razorpayInstance.orders.create(options);
//       res.json(order);
//     } catch (error) {
//       console.error("Error creating Razorpay order:", error);
//       res.status(500).json({ error: "Order creation failed" });
//     }
//   });
  
//   module.exports = router;

// routes/orders.js
const express = require("express");
const router = express.Router();
const Razorpay = require("razorpay");

const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_LIVE_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

router.post("/", async (req, res) => {
  const { amount, currency, receipt, subscriptionId, planId } = req.body;
  
  if (!subscriptionId || !planId) {
    return res.status(400).json({ error: "subscriptionId and planId are required" });
  }
  
  const options = {
    amount: amount * 100, // convert rupees to paise
    currency,
    receipt,
    notes: {
      subscription_id: subscriptionId.toString(),
      plan_id: planId.toString(),
    },
  };
  
  try {
    const order = await razorpayInstance.orders.create(options);
    res.json(order);
  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    res.status(500).json({ error: "Order creation failed" });
  }
});

module.exports = router;
