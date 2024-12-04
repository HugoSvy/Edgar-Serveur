// Lancement du serveur Express.js
const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')

const app = express()
app.use(cors())

//-----------------------------------INIT BDD-----------------------------------

// Connexion à MongoDB avec gestion d'erreur et message de succès
mongoose.connect('mongodb://127.0.0.1/db_pot', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("Connexion MongoDB réussie.");
}).catch((error) => {
  console.error('Une erreur de connexion MongoDB est survenue :', error);
});

const histo_etats_Schema = new mongoose.Schema({
  nom_plante: String,
  temperature: Number,
  humidite: Number,
  luminosite: Number,
  reservoir: Number,
  date: Date
});

const HistoEtat = mongoose.model('histo_etats', histo_etats_Schema);

const message_schema = new mongoose.Schema({
  device: String,
  data: String,
  time: String
});

const message_db = mongoose.model('sigfox', message_schema);

//-----------------------------------FIN INIT BDD-----------------------------------

// Route principale
app.get('/', (req, res) => {
  console.log('quelqu\'un a appelé le lien "/", je lui réponds "Hello World!".');
  res.send('Ici c\' est la plante!');
});

// Route pour /toto
app.get('/toto', (req, res) => {
  console.log('Quelqu\'un a appelé le lien "/toto", je lui réponds avec un JSON.');
  const response = {
    "1234": {
      "downlinkData": "1234567890123456"
    }
  };
  res.json(response);
});

// Route pour /voir avec récupération de paramètres
app.get('/voir', (req, res) => {
  const pseudo = req.query.pseudo;
  if (pseudo) {
    console.log(`quelqu'un a appelé le lien "/voir", bonjour ${pseudo}.`);
    res.send(`Bonjour ${pseudo}`);
  } else {
    res.send('Paramètre pseudo manquant.');
  }
});

// Route pour /alerteNiveauEau
app.get('/alerteNiveauEau', (req, res) => {
  res.send('Alerte Niveau eau');
});

// Route pour /etatGlobal : enregistrement d'un nouvel état
app.get('/etatGlobal', (req, res) => {
  const { nom, temperature, humidite, luminosite, reservoir, date } = req.query;

  const nouvelEtat = new HistoEtat({
    nom_plante: nom,
    temperature: Number(temperature),
    humidite: Number(humidite) / 2,
    luminosite: Number(luminosite),
    reservoir: Number(reservoir),
    date: new Date(date)
  });

  nouvelEtat.save((err) => {
    if (err) {
      console.error('Une erreur MongoDB s\'est produite lors de l\'enregistrement:', err);
      res.status(500).send('Erreur lors de l\'ajout');
    } else {
      console.log('Le nouvel élément de l\'histo a bien été enregistré.');
      res.send('Bien ajouté à la DB');
    }
  });
});

// Route pour /recherche : recherche par nom de plante
app.get('/recherche', (req, res) => {
  const { nom } = req.query;

  HistoEtat.find({ 'nom_plante': nom }, (err, resultats) => {
    if (err) {
      console.error('Une erreur MongoDB s\'est produite lors de la recherche:', err);
      res.status(500).send('Erreur lors de la recherche');
    } else if (resultats.length === 0) {
      res.status(404).send("Aucun document trouvé pour ce nom.");
    } else {
      console.log('Résultats de la recherche :', resultats);
      res.json(resultats);
    }
  });
});

// Route pour /last_recherche : recherche du dernier état par nom de plante
app.get('/last_recherche', (req, res) => {
  const { nom } = req.query;

  HistoEtat.find({ 'nom_plante': nom })
    .sort({ date: -1 })
    .limit(1)
    .exec((err, resultats) => {
      if (err) {
        console.error("Une erreur MongoDB s'est produite lors de la dernière recherche:", err);
        res.status(500).send("Erreur du serveur");
      } else if (resultats.length === 0) {
        res.status(404).send("Aucun document trouvé");
      } else {
        console.log("Résultat le plus récent de la recherche :", resultats[0]);
        res.json(resultats[0]);
      }
    });
});

//https://tolerant-namely-swift.ngrok-free.app/message?id={device}&time={time}&data={data}
app.get('/message', (req, res) => {
  
  // Afficher les paramètres reçus pour débogage
  console.log('Paramètres reçus:', req.query);

  // Assurez-vous que les noms des paramètres correspondent
  const { device, time, data } = req.query;

  // Vérification pour s'assurer que les valeurs sont présentes et valides
  if (!device || !time || !data) {
    return res.status(400).send('Paramètres manquants ou invalides.');
  }

  // Créer un nouvel objet HistoEtat
  const message = new message_db({
    device: device,
    data: data,
    time: time
  });

  // Afficher le nouvel objet pour débogage
  console.log('Nouvel état créé:', message);

  // Sauvegarder dans la base de données
  message.save((err) => {
    if (err) {
      console.error('Erreur MongoDB lors de l\'enregistrement:', err);
      return res.status(500).send('Erreur lors de l\'ajout dans la DB');
    } else {
      console.log('Le nouvel élément a bien été enregistré.');
      return res.status(200).send('Bien ajouté à la DB');
    }
  });
});


// Démarrage du serveur
app.listen(8000, () => {
  console.log('Le serveur écoute sur le port 8000');
});
