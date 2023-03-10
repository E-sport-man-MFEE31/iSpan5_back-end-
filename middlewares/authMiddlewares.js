function checkLogin(req, res, next) {
  if (req.session.member) {
    // session 有資料，表示登入過
    next();
  } else {
    // req.session 沒有 member 這個值 -> 尚未登入
    res.status(400).json({ msg: "尚未登入" });
  }
}

function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    // 將 'Bearer Token' 格式轉換成 'Token'
    const token = authHeader.split(" ")[1];
    // 驗證 JWT
    jwt.verify(token, process.env.PASSPORT_SECRET, (err, user) => {
      if (err) {
        return res.status(403).json({ message: "Invalid token" });
      }
      req.user = user;
      next();
    });
  } else {
    res.status(401).json({ message: "Unauthorized request" });
  }
}

module.exports = {
  checkLogin,
  authenticateJWT
};
