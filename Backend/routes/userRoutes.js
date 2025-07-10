const express = require("express");
const router = express.Router();
const {register, login} = require("../controllers/userController");
const { validateRegister, validateLogin } = require("../middleware/userValidation");

router.post("/register",validateRegister,register);
router.post("/login",validateLogin, login);

module.exports= router;