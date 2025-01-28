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
  device: String,
  data: String,
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
  time: String,
  station: String
});

const message_db = mongoose.model('sigfox', message_schema);

const etat = new mongoose.Schema({
  device: String,
  data: String,
  TypeMessage: String,
  Temp: String,
  Humidite: String,
  Luminosite: String,
  Reservoir: String,
  TempExtreme: String,
  Date: String,
  time: String,
  station: String
});

const etat_db = mongoose.model('etat hexa', etat);

//-----------------------------------FIN INIT BDD-----------------------------------

// Route principale
app.get('/', (req, res) => {
  console.log('quelqu\'un a appelé le lien "/", je lui réponds "Hello World!".');
  res.send('Ici c\' est la plante!');
});

app.get('/hexa', (req, res) => {
  console.log('quelqu\'un a appelé le lien "/hexa".');
  // Exemple d'utilisation
  //const encodedHex = "244671753048";
  //2 2342 625 25000 1 2
  const encodedHex = req.query.hexa;
  const sizes = {
    TypeMessage: 4, // Taille du TypeMessage en bits
    Temp: 10,       // Taille de la température en bits
    Humidite: 10,   // Taille de l'humidité en bits
    Luminosite: 16, // Taille de la luminosité en bits
    Reservoir: 2,   // Taille du réservoir en bits
    TempExtreme: 4  // Taille des températures extrêmes en bits
  };

  const decodedValues = decode(encodedHex, sizes);
  //console.log(decodedValues);

  const now = new Date();
  const formattedDate = now.toLocaleString("fr-FR", { //à changer dans le futur 
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  
  console.log("Date formatée :", formattedDate);
  
  const etat = new etat_db({
    TypeMessage: decodedValues.TypeMessage,
    Temp: decodedValues.Temp,
    Humidite: decodedValues.Humidite,
    Luminosite: decodedValues.Luminosite,
    Reservoir: decodedValues.Reservoir,
    TempExtreme: decodedValues.TempExtreme,
    Date: formattedDate 
  });
  console.log(etat);

  etat.save((err) => {
    if (err) {
      console.error('Une erreur MongoDB s\'est produite lors de l\'enregistrement:', err);
      res.status(500).send('Erreur lors de l\'ajout');
    } else {
      console.log('Le nouvel élément de l\'histo a bien été enregistré.');
      res.send('Bien ajouté à la DB');
    }
  });
});


// Route pour /config
app.get('/config', (req, res) => {
  const id = req.query.id; 
  console.log('Quelqu\'un a appelé le lien "/config", je lui réponds avec un JSON.');
  
  const sizes = {
    TypeMessage: 4,  // Taille du TypeMessage en bits
    Temp: 10,        // Taille de la température en bits
    Humidite: 10,    // Taille de l'humidité en bits
    Luminosite: 16,  // Taille de la luminosité en bits
    Reservoir: 2,    // Taille du réservoir en bits
    TempExtreme: 4   // Taille des températures extrêmes en bits
  };

  const temp = 27.3;
  const humid = 625;
  const lumi = 30000;
  const reserv = 1;
  const tempMax = 2;

  const config = {
    [id]: {
      TypeMessage: 2, //mettre à 4
      Temp: temp, // Conversion en dixièmes avant encodage
      Humidite: humid,
      Luminosite: lumi,
      Reservoir: reserv,
      TempExtreme: tempMax,
      //Date: ,
    }
  };

  if (id) {

    const valuesToEncode = config[id];

    //encodage
    const EncodedHex = encode(valuesToEncode, sizes);
    console.log(EncodedHex);

    const response = {
      [id]: { // Utilisation des crochets pour définir la clé dynamiquement
        "config": EncodedHex,
      }
    };
    res.json(response);
  } else {
    res.send('Paramètre id manquant.');
  }
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

// Route pour /last_recherche : recherche du dernier état par nom de plante
app.get('/last_recherche2', (req, res) => {
  const { device } = req.query;

  etat_db.find({ 'device': device })
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

//https://tolerant-namely-swift.ngrok-free.app/message?id={device}&time={time}&data={data}&station={station}
app.get('/message', (req, res) => {
  
  // Afficher les paramètres reçus pour débogage
  console.log('/message a été appelé');
  console.log('Paramètres reçus:', req.query);

  // Assurez-vous que les noms des paramètres correspondent
  const { device, time, data, station } = req.query;

  // Vérification pour s'assurer que les valeurs sont présentes et valides
  if (!device || !time || !data || !station) {
    return res.status(400).send('Paramètres manquants ou invalides.');
  }

  const encodedHex = req.query.data;
  const sizes = {
    TypeMessage: 4, // Taille du TypeMessage en bits
    Temp: 10,       // Taille de la température en bits
    Humidite: 10,   // Taille de l'humidité en bits
    Luminosite: 16, // Taille de la luminosité en bits
    Reservoir: 2,   // Taille du réservoir en bits
    TempExtreme: 4  // Taille des températures extrêmes en bits
  };

  const decodedValues = decode(encodedHex, sizes);
  //console.log(decodedValues);

  const now = new Date();
  const formattedDate = now.toLocaleString("fr-FR", { //à changer dans le futur 
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  
  console.log("Date formatée :", formattedDate);
  
  const etat = new etat_db({
    device: device,
    data: data,
    TypeMessage: decodedValues.TypeMessage,
    Temp: decodedValues.Temp,
    Humidite: decodedValues.Humidite,
    Luminosite: decodedValues.Luminosite,
    Reservoir: decodedValues.Reservoir,
    TempExtreme: decodedValues.TempExtreme,
    Date: formattedDate,
    time: time,
    station: station 
  });
  //console.log(etat);

  // Afficher le nouvel objet pour débogage
  console.log('Nouvel état créé:', etat);

  // Sauvegarder dans la base de données
  etat.save((err) => {
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

function decode(encodedHex, sizes) {
  // Étape 1 : Conversion de l'hexadécimal en une chaîne binaire
  console.log(encodedHex);
  let binaryString = "";
  console.log('Etape 1 : conversion hexa en binaire');
  for (let i = 0; i < encodedHex.length; i++) {
      binaryString += parseInt(encodedHex[i], 16).toString(2).padStart(4, "0");
      console.log(binaryString);
  }

  // Étape 2 : Découper la chaîne binaire en chainons selon les tailles spécifiées
  console.log('Etape 2 : decouper chaine binaire en chainons selon taille spe');
  let startIndex = 0;
  const values = {};
  for (let [key, size] of Object.entries(sizes)) {
      values[key] = binaryString.slice(startIndex, startIndex + size);
      console.log(values[key]);
      startIndex += size;
  }

  // Étape 3 : Conversion des chainons en valeurs lisibles
  console.log('Etape 3 : conversion des chainons en valeurs lisibles');
  for (let key in values) {
      values[key] = parseInt(values[key], 2); // Convertir chaque valeur en décimal
      console.log(values[key]);
  }
  //convertir la temp
  values.Temp = values.Temp/10;

  return values;
}

function encode(values, sizes) {
  // Étape 1 : Convertir chaque valeur en une chaîne binaire avec les tailles spécifiées
  console.log('Étape 1 : conversion des valeurs en binaire');
  let binaryString = "";
  for (let [key, size] of Object.entries(sizes)) {
      let binaryValue = values[key];
      
      // Si le champ est "Temp", appliquer l'échelle inversée
      if (key === "Temp") {
          binaryValue = Math.round(binaryValue * 10); // Multiplier par 10 pour restaurer la valeur originale
      }

      // Convertir en binaire et compléter avec des zéros pour atteindre la taille spécifiée
      const binarySegment = binaryValue.toString(2).padStart(size, "0");
      binaryString += binarySegment;
      console.log(`${key} (${binaryValue}) : ${binarySegment}`);
  }

  // Étape 1.5 : Vérifier si la chaîne binaire fait un multiple de 8 bits
  const padding = 8 - (binaryString.length % 8);
  if (padding !== 8) {
      binaryString = binaryString.padEnd(binaryString.length + padding, "0");
      console.log(`Chaîne binaire complétée avec ${padding} zéro(s) pour atteindre un multiple de 8 bits.`);
  }

  // Étape 2 : Convertir la chaîne binaire en une chaîne hexadécimale
  console.log('Étape 2 : conversion de la chaîne binaire en hexadécimal');
  let encodedHex = "";
  for (let i = 0; i < binaryString.length; i += 4) {
      const binaryChunk = binaryString.slice(i, i + 4);
      const hexValue = parseInt(binaryChunk, 2).toString(16);
      encodedHex += hexValue;
      console.log(`Chunk binaire : ${binaryChunk} => Hex : ${hexValue}`);
  }

  return encodedHex.toUpperCase(); // Retourner la chaîne hexadécimale en majuscules
}