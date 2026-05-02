const router = require('express').Router();
const auth = require('../middleware/auth');
const { getMoods, postMood, putMood, deleteMood } = require('../controllers/moodController');
router.use(auth);
router.get('/', getMoods);
router.post('/', postMood);
router.put('/:id', putMood);
router.delete('/:id', deleteMood);
module.exports = router;
