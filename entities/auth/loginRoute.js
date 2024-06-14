const express = require("express");
const { loginUser } = require("./login");
const router = express.Router();


router.post("/user/login", loginUser);

module.exports = router