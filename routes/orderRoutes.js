const express = require("express");
const router = express.Router();
const pool = require("../utils/db");
const moment = require("moment");

// 買家前台顯示的訂單 (買家所買的所有訂單)
router.post("/api/orders", async (req, res, next) => {
  const page = req.query.page || 1;
  let [results] = await pool.execute(
    "SELECT COUNT(*) AS total FROM order_list"
  );
  const total = results[0].total;
  const perPage = 5;
  const totalPage = Math.ceil(total / perPage);

  const limit = perPage;
  const offset = perPage * (page - 1);

  console.log(req.body);
  let [data] = await pool.query(
    `SELECT ol.id,
            ol.date, 
            ol.user_id, 
            ol.payment_price, 
            ol.payment_method, 
            ol.order_list_status, 
            pt.*, 
            ds.*,
            ol.id AS orId,
            ds.status AS deliStatus
    FROM order_list ol
    JOIN payment_type pt 
    ON ol.payment_method = pt.id
    JOIN delivery_status ds 
    ON ol.delivery_status = ds.id
    WHERE (CASE WHEN ? != "全部訂單" THEN ds.status = ? ELSE 1 = 1 END) 
    AND 
    (CASE WHEN ? != '' THEN ol.id = ? ELSE ol.id IS NOT NULL END)
    LIMIT ? 
    OFFSET ?`,
    [
      req.body.statusFilter,
      req.body.statusFilter,
      req.body.searchWord,
      req.body.searchWord,
      limit,
      offset,
    ]
  );
  res.json({
    pagination: {
      total,
      perPage,
      totalPage,
      page,
    },
    data,
  });
});

// 買家點進去所可以得到的訂單資料
router.get("/api/:user_id/orders/:orId", async (req, res, next) => {
  let [data] = await pool.query(
    `SELECT ol.*,
            old.order_list_id,
            old.product_name, 
            old.price, old.amount, 
            ols.*, 
            s.id, 
            s.sellers_number, 
            s.company_name, 
            u.id, 
            u.name, 
            u.phone, 
            ds.*, 
            dw.*, 
            pt.*,
            ol.id AS orId, 
            ols.status AS orderStatus, 
            ds.status AS dStatus, 
            dw.delivery_way_name AS deliWay
      FROM order_list ol
      JOIN order_list_detail old 
      ON ol.id = old.order_list_id
      JOIN order_list_status ols 
      ON ol.order_list_status = ols.id
      JOIN sellers s 
      ON ol.sellers_id = s.sellers_number
      JOIN users u 
      ON ol.user_id = u.id
      JOIN delivery_status ds 
      ON ol.delivery_status = ds.id
      JOIN delivery_way dw 
      ON ol.delivery_way = dw.id
      JOIN payment_type pt 
      ON ol.payment_method = pt.id
      WHERE ol.user_id = ? 
      AND ol.id = ?`,
    [req.params.user_id, req.params.orId]
  );

  res.json(
    data.map((v) => {
      v.date = moment(v.date).utc().format("YYYY-MM-DD");
      return v;
    })
  );
});
module.exports = router;
