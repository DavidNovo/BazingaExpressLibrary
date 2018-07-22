var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/users', function (req, res, next) {
  res.send('Listing of current users -- NOT IMPLEMENTED');
});

module.exports = router;
