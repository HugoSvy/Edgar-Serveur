// PROPRE
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
app.use(cors());

// Importation des routes
const indexRoutes = require('./routes/index');
const alerteEauRoutes = require('./routes/alerteEau');

// Connexion à MongoDB
mongoose.connect('mongodb://127.0.0.1/db_pot', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("Connexion MongoDB réussie.");
}).catch((error) => {
  console.error('Une erreur de connexion MongoDB est survenue :', error);
});

// Utilisation des routes
app.use('/', indexRoutes);
app.use('/alerte_eau', alerteEauRoutes);

// Démarrage du serveur
app.listen(8000, () => {
  console.log('Le serveur écoute sur le port 8000');
});
