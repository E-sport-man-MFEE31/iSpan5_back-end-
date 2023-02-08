const router = require("express").Router();
const pool = require("../utils/db");

router.get("/:id", async (req, res) => {
  let [user] = await pool.execute("SELECT * FROM users WHERE id = ?", [
    req.params.id,
  ]);
  res.status(200).json({
    message: "success",
    user,
  });
});

router.post("/:id", async (req, res) => {
  const { user_name, email, address, phone } = req.body;
  try {
    if (req.files) {
      let { thumbnail } = req.files;
      thumbnail.mv("./uploads/" + thumbnail.name);
      thumbnail = "/uploads/" + thumbnail.name;
      let [user] = await pool.execute(
        "UPDATE users SET name = ?, email = ?, address = ?, phone = ?, thumbnail = ? WHERE id = ?",
        [user_name, email, address, phone, thumbnail, req.params.id]
      );
    } else {
      let [user] = await pool.execute(
        "UPDATE users SET name = ?, email = ?, address = ?, phone = ? WHERE id = ?",
        [user_name, email, address, phone, req.params.id]
      );
    }

    res.status(200).json({
      message: "success",
      data: {
        user_name,
        email,
        phone,
        address,
        file_name: avatar.name,
        file_mimetype: avatar.mimetype,
        file_size: avatar.size,
      },
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
