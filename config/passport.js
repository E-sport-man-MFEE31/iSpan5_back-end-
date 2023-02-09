const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;
const pool = require("../utils/db");

// 設定 Facebook 策略
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "/auth/facebook/callback",
    },
    (accessToken, refreshToken, profile, cb) => {
      pool.query(
        `SELECT * FROM users WHERE facebook_id = ${profile.id}`,
        (error, results) => {
          if (error) throw error;
          if (results.length > 0) {
            return cb(null, results[0]);
          }
          const newUser = {
            name: profile.displayName,
            email: profile.emails[0].value,
            facebook_id: profile.id,
            thumbnail: profile.photos[0].value,
          };
          pool.query("INSERT INTO users SET ?", newUser, (error) => {
            if (error) throw error;
            return cb(null, newUser);
          });
        }
      );
    }
  )
);

// 設置 Passport 和 Google OAuth 策略
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    (accessToken, refreshToken, profile, cb) => {
      // 這裏可以在 MySQL 中查找或創建用戶
      pool.query(
        "SELECT * FROM users WHERE google_id = ?",
        [profile.id],
        (err, results) => {
          if (err) throw err;
          if (results.length > 0) {
            return cb(null, results[0]);
          }
          const newUser = {
            name: profile.displayName,
            email: profile.emails[0].value,
            google_id: profile.id,
            thumbnail: profile.photos[0].value,
          };
          pool.query("INSERT INTO users SET ?", newUser, (error) => {
            if (error) throw error;
            return cb(null, newUser);
          });
        }
      );
    }
  )
);

// 序列化與反序列化使用者物件
// passport.serializeUser((user, cb) => {
//   console.log("Serializing user now");
//   cb(null, user.id);
// });
// passport.deserializeUser((id, cb) => {
//   pool.query(`SELECT * FROM users WHERE id = ${id}`, (error, results) => {
//     if (error) throw error;
//     console.log("Found user.");
//     cb(null, results[0]);
//   });
// });
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});
