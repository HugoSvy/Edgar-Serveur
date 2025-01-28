const express = require('express');
const router = express.Router();

// Route pour /alerte_eau
router.get('/alerteNiveauEau', (req, res) => {
  res.send('Alerte Niveau eau');
});

// Ajouter d'autres routes spécifiques à /alerte_eau ici si besoin

module.exports = router;
