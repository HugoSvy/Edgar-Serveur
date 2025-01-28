const express = require('express');
const router = express.Router();
const Etat = require('../models/etat'); // Importer le modèle

router.get('/liste_etats', async (req, res) => {
  try {
    const etats = await Etat.find(); // Récupérer tous les états dans MongoDB
    res.json(etats);
  } catch (error) {
    res.status(500).send('Erreur lors de la récupération des états.');
  }
});

router.get('/last_recherche', async (req, res) => {
    try {
      const etats = await Etat.find();
      res.json(etats);
    } catch (error) {
      res.status(500).send('Erreur lors de la récupération des états.');
    }
  });

module.exports = router;
