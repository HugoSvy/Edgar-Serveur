// Lancement du serveur Express.js

const express = require('express')

const app = express()
app.set('view engine', 'ejs')

app.use('/', express.static('views'))

// Quand on appelera le lien "/page-html" de notre serveur, on répondra avec du texte brut correspondant à la structure et aux balises d'une page HTML :

app.get('/page-html', function (req, res) {

  console.log('quelqu\'un a appelé le lien "/page-html".')

  // 3ème changement : au lieu d'utiliser res.send(), on utilise res.render() :
  // res.render() va utiliser le moteur de vue qu'on a configuré plus loin ci-dessus, EJS
  // Par défaut, le moteur de vue EJS va chercher les fichiers HTML qu'on lui indique dans le dossier "views"
  // En indiquant "ma_page_html.ejs", il ira chercher le fichier "views/ma_page_html.ejs"
  res.render('ma_page_html.ejs')

})

// Le moteur de vue EJS permet aussi de passer des variables à nos pages HTML
// Dans le fichier HTML, nous avons écrit : <%= uneVariable %>
// "<%= uneVariable %>" sera remplacé par le contenu de uneVariable, cela permet de personnaliser la page HTML en fonction d'éléments extérieurs, par exemple, en fonction de l'utilisateur connecté ou autre
// Voici un exemple avec une variable simple et un tableau :
app.get('/page-html-avec-variable', function(req, res) {
    var prenom = "Alphonse"
  
    var maListeDeTemperatures = [
      { nom: "Banane de Guadeloupe", prix: 2.25 },
      { nom: "Vélo de course", prix: 435 },
      { nom: "Écharpe douce", prix: 17 }
    ]
  
    res.render('ma_page_html.ejs', {
      uneVariable: prenom,
      listeTemperatures: maListeDeTemperatures,
    })
  })

// On démarre le serveur sur le port 8000

app.listen(8000, function () {

  console.log('Le serveur écoute sur son port 8000')

})