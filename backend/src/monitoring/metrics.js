const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({ uptime: process.uptime(), env: process.env.NODE_ENV, timestamp: Date.now() });
});

module.exports = router;
