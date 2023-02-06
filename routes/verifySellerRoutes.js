const express = require("express");
const router = express.Router();
const pool = require("../utils/db");


// 驗證成賣家
router.post("/api/verifySeller", async (req, res) => {
  const { error } = verifyValidation(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });
  let result = await pool.execute(
    "INSERT INTO `sellers`(`sellers_number`, `company_name`, `tax_id`, `description`,`valid`) VALUES (?, ?, ?, ?, ?)",
    [
      req.body.user_id,
      req.body.store_name,
      req.body.taxID,
      req.body.storeIntro,
      1,
    ]
  );
  try {
    res.status(200).json({
      message: "success",
      member_id: result[0].insertId,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "Seller not verified." });
  }
});

module.exports = router;