const express = require("express");
const router = express.Router();
const pool = require("../utils/db");
const moment = require("moment");

// 前端傳過來的資料 (更改賣家視角的訂單內容)
router.post("/api/sellerOrders", async (req, res) => {
  await pool.query(
    `UPDATE order_list
    SET recip_name = IF(? != '', ?, recip_name),
        recip_phone = IF(? != '', ?, recip_phone),
        recip_address = IF(? != '', ?, recip_address)
    WHERE id = 1`,
    [
      req.body.inputName,
      req.body.inputName,
      req.body.inputPhone,
      req.body.inputPhone,
      req.body.inputAddress,
      req.body.inputAddress,
    ]
  );
  res.json({message: "success"});
});

// 後台賣家視角的order_list
router.get("/api/orderSeller/:sellerid", async (req, res, next) => {
  const page = req.query.page || 1;
  let [results] = await pool.execute(
    "SELECT COUNT(*) AS total FROM order_list"
  );
  const total = results[0].total;
  const perPage = 3;
  const totalPage = Math.ceil(total / perPage);

  const limit = perPage;
  const offset = perPage * (page - 1);

  let [data] = await pool.query(
    `SELECT ol.*, 
            ds.*, 
            u.id, 
            u.name, 
            s.sellers_number, 
            pt.*,
            ol.id AS orId, 
            ds.status AS deliStatus
      FROM order_list ol 
      JOIN delivery_status ds 
      ON ol.delivery_status = ds.id
      JOIN users u 
      ON ol.user_id = u.id
      JOIN sellers s 
      ON ol.sellers_id = s.sellers_number
      JOIN payment_type pt 
      ON ol.payment_method = pt.id
      WHERE ol.sellers_id = ?
      LIMIT ? 
      OFFSET ?`,
    [req.params.sellerid, limit, offset]
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

// 後台賣家視角的order list detail
router.get(
  "/api/orderSeller/:sellerid/orders/:orId",
  async (req, res, next) => {
    let [data] = await pool.query(
      `SELECT ol.*, 
              old.order_list_id, 
              old.product_name, 
              old.price, 
              old.amount, 
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
              ds.status AS deliStatus, 
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
      WHERE ol.sellers_id = ? 
      AND 
      ol.id = ?`,
      [req.params.sellerid, req.params.orId]
    );
    res.json(
      data.map((v) => {
        v.date = moment(v.date).utc().format("YYYY-MM-DD");
        return v;
      })
    );
  }
);
module.exports = router;
