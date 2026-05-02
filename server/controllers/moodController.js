const moodService = require('../services/moodService');

async function getMoods(req, res) {
  try {
    const data = await moodService.list(req.user.id, req.query);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function postMood(req, res) {
  try {
    const mood = await moodService.create(req.user.id, req.body);
    res.status(201).json(mood);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function putMood(req, res) {
  try {
    const mood = await moodService.update(req.user.id, req.params.id, req.body);
    if (!mood) return res.status(404).json({ message: 'Record not found' });
    res.json(mood);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function deleteMood(req, res) {
  try {
    const ok = await moodService.remove(req.user.id, req.params.id);
    if (!ok) return res.status(404).json({ message: 'Record not found' });
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

module.exports = { getMoods, postMood, putMood, deleteMood };
