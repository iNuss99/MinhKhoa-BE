const express = require('express');
const authRoute = require('./auth.route');
const studentRoute = require('./student.route');

const router = express.Router();

router.use('/auth', authRoute);
router.use('/students', studentRoute);

module.exports = router;
