// routes/getUserCompany.js
const express = require("express");
const router = express.Router();

router.get("/", (req, res) =>  {
  // `req.cookies` is populated by cookie-parser middleware
  const { userId, companyId } = req.cookies;

  console.log("Cookies received:", req.cookies);

  res.json({
    message: "Cookies received",
    userId: userId || null,
    companyId: companyId || null,
  });
});

module.exports = router;
