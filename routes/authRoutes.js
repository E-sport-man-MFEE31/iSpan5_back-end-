const router = require("express").Router();
const pool = require("../utils/db");
const registerValidation = require("../validation").registerValidation;
const loginValidation = require("../validation").loginValidation;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const saltRounds = 10;

router.post("/register", async (req, res) => {
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).json({ message: error.details[0].message });

  let [members] = await pool.execute("SELECT * FROM users WHERE email = ?", [
    req.body.email,
  ]);
  if (members.length > 0) {
    return res.status(400).json({
      errors: [
        {
          message: "email 已經註冊過",
        },
      ],
    });
  }

  const password_hash = await bcrypt.hash(req.body.password, saltRounds);

  let result = await pool.execute(
    "INSERT INTO `users`(`name`, `password`, `email`, `address`, `phone`) VALUES (?, ?, ?, ?, ?)",
    [
      req.body.user_name,
      password_hash,
      req.body.email,
      req.body.address,
      req.body.phone,
    ]
  );

  try {
    res.status(200).json({
      message: "success",
      member_id: result[0].insertId,
    });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "User not saved." });
  }
});

router.post("/login", async (req, res) => {
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let [members] = await pool.execute("SELECT * FROM users WHERE email = ?", [
    req.body.email,
  ]);
  if (members.length == 0) {
    return res.status(401).json({
      errors: [
        {
          message: "帳號或密碼錯誤",
        },
      ],
    });
  }
  let member = members[0];

  let result = await bcrypt.compare(req.body.password, member.password);
  if (result === false) {
    return res.status(401).json({
      errors: [
        {
          message: "帳號或密碼錯誤",
        },
      ],
    });
  }
  const tokenObject = { _id: member._id, email: member.email };
  const token = jwt.sign(tokenObject, process.env.PASSPORT_SECRET, {
    expiresIn: "1d",
  });

  let retMember = {
    id: member.id,
    name: member.name,
    email: member.email,
  };

  req.session.member = retMember;

  res.json({
    message: "success",
    token: "JWT " + token,
    member,
  });
});

router.get("/logout", (req, res, next) => {
  req.session.member = null;
  res.status(202).json({ message: "user logout" });
});


module.exports = router;
