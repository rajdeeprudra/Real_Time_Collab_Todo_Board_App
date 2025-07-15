const express = require("express");
const router = express.Router();
const {register, login, getUsers} = require("../controllers/userController");
const { validateRegister, validateLogin } = require("../middleware/userValidation");

router.post("/register",validateRegister,register);
router.post("/login",validateLogin, login);
router.get("/", getUsers);

module.exports= router;