// Lancement du serveur Express.js
const express = require('express')
const app = express()

//-----------------------------------INIT BDD-----------------------------------
// En premier lieu, on charge la librairie "mongoose" qui va nous faciliter la communication avec la base de données MongoDB
var mongoose = require('mongoose')

// Ensuite, on ouvre une connexion à notre base de données MongoDB
// Ici, la base de données est sur votre poste en local, pour y accéder, on renseigne donc l'adresse IP locale 127.0.0.1
// On dit que l'on souhaite utiliser la base de données "db_pot", on peut la nommer comme on le souhaite
// Inutile de la créer à l'avance, c'est MongoDB qui va la créer à la volée quand nous allons l'utiliser
mongoose.connect('mongodb://127.0.0.1/db_pot')

// 2 lignes de configurations, vous devez les ajouter dans votre code mais nous n'allons pas essayer de comprendre pourquoi pour le moment
// La seconde ligne sert à afficher un message d'erreur dans la console si une erreur MongoDB survient
mongoose.Promise = global.Promise
mongoose.connection.on('error', console.error.bind(console, 'Une erreur de connexion MongoDB est survenue :'))

// Ensuite, on défini une collection
// Ici, on va créer une collection qui va contenir des articles à vendre pour exemple
var histo_etats_Schema = new mongoose.Schema({
  nom_plante: String,
  temperature: Number,
  humidite: Number,
  luminosite: Number,
  reservoir: Number,
  date : Date
})
var histo_etats = mongoose.model('histo_etats', histo_etats_Schema)

//-----------------------------------FIN INIT BDD-----------------------------------

// Quand on appelera le lien "/" de notre serveur, c'est ce code qui sera exécuté
app.get('/', function (req, res) {
  // actions exécutées
  console.log('quelqu\'un a appelé le lien "/", je lui réponds "Hello World!".')
  res.send('Ici c\' est la plante!')
})
 
// Quand on appelera le lien "/toto" de notre serveur, c'est ce code qui sera exécuté
app.get('/toto', function (req, res) {
  // actions exécutées
  console.log('quelqu\'un a appelé le lien "/toto", je lui réponds "Bonjour toto".')
  res.send('Bonjour toto')
})
 
// Si des paramètres sont passés dans le lien, ils peuvent être récupéré comme ceci :
// Par exemple, si on appelle le lien /voir?pseudo=david
app.get('/voir', function (req, res) {
  // req.query contient un objet contenant tous les paramètres
  console.log(req.query) // Affichera : { "pseudo": "david" }
  // Pour récupérer un paramètre précis, on pourra faire :
  console.log(req.query.pseudo) // Affichera : david
 
  console.log('quelqu\'un a appelé le lien "/voir", bonjour ' + req.query.pseudo + '.')
  res.send('Bonjour ' + req.query.pseudo + '')
})

app.get('/alerteNiveauEau', function (req, res) {
  res.send('Alerte Niveayu eau')
})

app.get('/etatGlobal', function (req, res) { //température, humidité, luminosité, réservoir
  console.log(req.query) //https://allowed-holy-magpie.ngrok-free.app/etatGlobal?nom=test&temperature=25&humidite=20&luminosite=789&reservoir=2&date=2023-09-25 08:15:00
  var nouvelEtat = new histo_etats({
    nom_plante: req.query.nom,
    temperature: req.query.temperature,
    humidite: req.query.humidite/2,
    luminosite: req.query.luminosite,
    reservoir: req.query.reservoir,
    date : req.query.date
  })
  // Enregistrer le nouveau document dans la base de données MongoDB
  nouvelEtat.save(function (err) {
    if (err) {
      console.log('Une erreur MongoDB s\'est produite...')
      res.send('Erreur lors de l\'ajout')
      console.log(err)
    } else {
      console.log('Le nouvel élément de l\'histo a bien été enregistré.')
      res.send('Bien ajouté à la DB')
    }
  })
})

app.get('/recherche', function (req, res) { //https://allowed-holy-magpie.ngrok-free.app/etatGlobal?nom=test
  //http://localhost:8000/recherche?nom=test
  // Chercher des documents
  // Ici, pour l'exemple, on va chercher tous les articles dont le champ "nomDeLArticle" est égal à "Banane de Guadeloupe"
  // La méthode .find() est l'équivalent du requête SQL
  histo_etats.find({ 'nom_plante': req.query.nom }, function (err, resultats) {
    if (err) {
      console.log('Une erreur MongoDB s\'est produite...')
      console.log(err)
    } else {
      console.log('Résultats de la recherche :')
      console.log(resultats)
      console.log(resultats[0].temperature)
      res.send("liste états plante test :" + resultats + " température : " + resultats[0].temperature)
      
    }
  })
})

app.get('/last_recherche', function (req, res) {
  console.log("Requête reçue sur /last_recherche avec paramètres : ", req.query); // Affiche les paramètres de la requête

  histo_etats.find({ 'nom_plante': req.query.nom })
    .sort({ date: -1 })
    .limit(1)
    .exec(function (err, resultats) {
      if (err) {
        console.log("Une erreur MongoDB s'est produite...");
        console.log(err);
        res.status(500).send("Erreur du serveur");
      } else if (resultats.length === 0) {
        console.log("Aucun document trouvé pour /last_recherche");
        res.status(404).send("Aucun document trouvé");
      } else {
        console.log("Résultat le plus récent de la recherche : ", resultats[0]);
        res.json(resultats[0]);
      }
    });
});



/*
const http = require('http')
http.get("http://ADRESSE_SIGFOX/refresh", function (response) { //Demande de rafraichissement des infos
  console.log("response = " + response)
})
*/ 
// Plusieurs paramètres peuvent être passés en même temps dans le lien, dans ce cas, ils doivent être séparés par des "&" :
// Par exemple, le lien suivant peut être appelé : /voir?pseudo=david&age=27&ville=angers
// Dans ce cas, si on fait console.log(req.query) affichera : { "pseudo": "david", "age": "27", "ville": "angers" }
 
// On démarre le serveur sur le port 8000
app.listen(8000, function () {
  console.log('Le serveur écoute sur son port 8000')
})

