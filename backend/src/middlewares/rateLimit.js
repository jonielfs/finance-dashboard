const rateLimit = require("express-rate-limit");

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 5,
  message: {
    error: "Muitas tentativas de cadastro. Tente novamente mais tarde.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: {
    error: "Muitas tentativas de login. Aguarde alguns minutos.",
  },
});

module.exports = {
  registerLimiter,
  loginLimiter,
};