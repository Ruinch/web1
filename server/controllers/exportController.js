const moodService = require('../services/moodService');

async function exportJson(req, res) {
  try {
    const moods = await moodService.exportAll(req.user.id);
    res.setHeader('Content-Disposition', 'attachment; filename="moods.json"');
    res.json({ exported_at: new Date().toISOString(), items: moods });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function exportCsv(req, res) {
  try {
    const moods = await moodService.exportAll(req.user.id);
    const header = 'id,mood,habits,comment,created_at';
    const rows = moods.map(m => [m.id, m.mood, `"${(m.habits || []).join('|')}"`, `"${String(m.comment).replaceAll('"', '""')}"`, m.created_at].join(','));
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="moods.csv"');
    res.send([header, ...rows].join('\n'));
  } catch (err) {
    res.status(500).send(err.message);
  }
}

module.exports = { exportJson, exportCsv };
