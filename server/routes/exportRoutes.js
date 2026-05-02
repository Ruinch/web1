const router = require('express').Router();
const auth = require('../middleware/auth');
const { exportJson, exportCsv } = require('../controllers/exportController');
router.use(auth);
router.get('/json', exportJson);
router.get('/csv', exportCsv);
module.exports = router;
