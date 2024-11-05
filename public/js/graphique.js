$(document).ready(function() 
{
    var monGraphique = null
    function initGraphique(){
        monGraphique = new Chart('myChart', {
            type: 'line',
            data: {
            //Par défaut, les dates sont celles des températures. Nous formatons également la date grâce à la fonction "formatDate"
            labels: listeTemperaturesGraphique.map(item => formatDate(item.date)),
            datasets: [
                {
                label: 'Température',
                //IDEM qu'avec les dates mais avec les températures
                data: listeTemperaturesGraphique.map(item => item.temperature),
                yAxisID: 'A',
                backgroundColor: 'rgba(255, 238, 186, 0.4)',
                borderColor: 'rgba(255, 125, 0, 1)',
                borderWidth: 1,
                spanGaps: true
                },
                {
                label: 'led',
                //Ici et pour les solutions précédentes, on mappe les dates des leds avec les dates en abcisse
                data: listeLEDGraphique.map(item => ({x: formatDate(item.date), y: item.etat})),
                yAxisID: 'B',
                backgroundColor: 'rgba(184, 218, 255, 0.4)',
                borderColor: 'rgba(184, 218, 255, 1)',
                borderWidth: 1,
                spanGaps: true,
                steppedLine: 'before'
                }
            ]
            },
            options: {
            scales: {
                xAxes: [{
                type: 'time',
                time: {
                    unit: 'minute'
                },
                }],
                yAxes: [
                {
                    id: 'A',
                    ticks: {
                    beginAtZero: true
                    }
                },
                {
                    id: 'B',
                    ticks: {
                    min: 0,
                    max: 2,
                    beginAtZero: true
                    }
                }
                ]
            }
            }
        })
    }

    function formatDate(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');
        //Retourner sur le format "YYYY-MM-DD HH:MM:SS"
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      }
    //Initialisation du graphique une fois la page chargée : $(document).ready
    initGraphique()

    const socket = io()
    
    socket.on('connect', function () {
    //Vérifier que l'on est bien connecté au serveur
    console.log('Connexion établie avec le serveur')
  })

  socket.on('temperature', function (data) {
    var date_conv = formatDate(data.date)
    // Si la date existe déjà dans les labels, on ne la rajoute pas.
    if (!monGraphique.data.labels.includes(date_conv)) {
      monGraphique.data.labels.push(date_conv)
    }
    
    // On cherche l'index de la date ajoutée pour l'associer aux datasets
    const index = monGraphique.data.labels.indexOf(date_conv);
  
    // Si des valeurs pour l'état de LED ne sont pas encore présentes à cet index, on les ajoute avec "null"
    if (monGraphique.data.datasets[1].data.length <= index) {
      monGraphique.data.datasets[1].data.push(null)
    }
  
    // Ajouter la température à la bonne date
    monGraphique.data.datasets[0].data[index] = data.temperature
  
    monGraphique.update()

    //Mettre à jour le tableau
    //Récupération de l'objet 'tbody' de la table qui nous intéresse
    const tableBody = document.getElementById('tableTemp').querySelector('tbody')
    //Création d'un objet ligne
    const newRow = document.createElement('tr')
    //Remplir la ligne avec les colonnes de données
    newRow.innerHTML = `<td>${new Date(data.date)}</td><td>${data.temperature} °C</td>`
    //On ajoute la ligne HTML à la page
    tableBody.appendChild(newRow)
  });
  
  socket.on('led', function (data) {
    var date_conv = formatDate(data.date)
    // Si la date existe déjà dans les labels, on ne la rajoute pas.
    if (!monGraphique.data.labels.includes(date_conv)) {
      monGraphique.data.labels.push(date_conv)
    }
    
    // On cherche l'index de la date ajoutée pour l'associer aux datasets
    const index = monGraphique.data.labels.indexOf(date_conv)
  
    // Si des valeurs pour la température ne sont pas encore présentes à cet index, on les ajoute avec "null"
    if (monGraphique.data.datasets[0].data.length <= index) {
      monGraphique.data.datasets[0].data.push(null)
    }
  
    // Ajouter l'état de la LED à la bonne date
    monGraphique.data.datasets[1].data[index] = data.etat
  
    monGraphique.update()

    //Mettre à jour le tableau
    //Récupération de l'objet 'tbody' de la table qui nous intéresse
    const ledTableBody = document.getElementById('tableLED').querySelector('tbody')
    //Création d'un objet ligne
    const newRow = document.createElement('tr')
    //Remplir la ligne avec les colonnes de données
    newRow.innerHTML = `<td>${new Date(data.date)}</td><td>${data.etat}</td>`
    //On ajoute la ligne HTML à la page
    ledTableBody.appendChild(newRow)

  })

  socket.on('gps', function (data) {

    //Mettre à jour le tableau
    //Récupération de l'objet 'tbody' de la table qui nous intéresse
    const ledTableBody = document.getElementById('tableGPS').querySelector('tbody')
    //Création d'un objet ligne
    const newRow = document.createElement('tr')
    //Remplir la ligne avec les colonnes de données
    newRow.innerHTML = `<td>${new Date(data.date)}</td><td>${data.latitude}</td><td>${data.longitude}</td>`
    //On ajoute la ligne HTML à la page
    ledTableBody.appendChild(newRow)

  })
})