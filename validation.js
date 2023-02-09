const Joi = require("joi");

// Register Validation
const registerValidation = (data) => {
  const schema = Joi.object({
    user_name: Joi.string().max(50).required(),
    email: Joi.string()
      .min(6)
      .max(50)
      .required()
      .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } }),
    password: Joi.string()
      .pattern(new RegExp("^[a-zA-Z0-9]{6,30}$"))
      .required(),
    repeatPassword: Joi.ref("password"),
    address: Joi.string().min(6).required(),
    phone: Joi.string().min(7).required(),
  });

  return schema.validate(data);
};

const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string()
      .min(6)
      .max(50)
      .required()
      .email({ minDomainSegments: 2, tlds: { allow: ["com", "net"] } }),
    password: Joi.string()
      .pattern(new RegExp("^[a-zA-Z0-9]{6,30}$"))
      .required(),
  });
  return schema.validate(data);
};

const verifyValidation = (data) => {
  const schema = Joi.object({
    store_name: Joi.string().min(3).max(16).required(),
    taxID: Joi.string().pattern(new RegExp("^[0-9]{8}$")).required(),
    storeIntro: Joi.string().min(5).required(),
  });
  return schema.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.verifyValidation = verifyValidation;
