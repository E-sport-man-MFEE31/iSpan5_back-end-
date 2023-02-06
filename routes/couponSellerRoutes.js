const express = require("express");
const router = express.Router();
const pool = require("../utils/db");
const moment = require("moment");

// 優惠券
router.get("/api/couponSeller", async (req, res, next) => {
  let [data] = await pool.query(
    `SELECT coupon.*, coupon.id AS couponId FROM coupon ORDER BY coupon.id DESC`
  );
  res.json(
    data.map((v) => {
      v.start_time = moment(v.start_time).utc().format("YYYY-MM-DD");
      v.end_time = moment(v.end_time).utc().format("YYYY-MM-DD");
      v.created_at = moment(v.created_at).utc().format("YYYY-MM-DD");
      return v;
    })
  );
});

module.exports = router;
