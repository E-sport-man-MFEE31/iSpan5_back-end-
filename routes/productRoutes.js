const express = require("express");
const router = express.Router();
const pool = require("../utils/db");

router.get("/", async (req, res, next) => {
  const page = req.query.page || 1;
  let [result] = await pool.query("select count(*) as total from product_list");
  const total = result[0].total;
  const perPage = 25;
  const totalPage = Math.ceil(total / perPage);
  const limit = perPage;
  const offset = perPage * (page - 1);

  let [data] = await pool.query(
    "select id, product_name, images, price, storage, rate, favorites from product_list limit ? offset ?",
    [limit, offset]
  );
  res.status(200).json({
    pagination: {
      total,
      perPage,
      totalPage,
      page,
    },
    data,
  });
});

router.get("/:productID", async (req, res, next) => {
  let [data] = await pool.query(
    "select id, product_name, images, price, storage, rate, favorites from product_list where id = ?",
    [req.params.productID]
  );
  res.status(200).json(data);
});

module.exports = router;
