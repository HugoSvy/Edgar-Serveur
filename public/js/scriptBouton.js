
$(document).ready(function() 
{
    //Récupération des objets de la page qui nous intéresse
    const $spinner_led = $('#loading_led')
    const $successMessage_led = $('#success_led')
    const $spinner_temperature = $('#loading_temperature')
    const $successMessage_temperature = $('#success_temperature')
    const $spinner_gps = $('#loading_gps')
    const $successMessage_gps = $('#success_gps')
    const $spinner_buzzer = $('#loading_buzzer')
    const $successMessage_buzzer = $('#success_buzzer')

    const $sliderS = $('#controlTempo')
    const $sliderMS = $('#controlTempoMS')

    //Initialisation du texte des slider
    if($sliderS)
    {
        const valueinit = $sliderS.val()
        $('#tempoValue').text('Temps : ' + valueinit + 's')
    }
    if($sliderMS)
    {
        const valueinit = $sliderMS.val()
        $('#tempoValueMS').text('Temps : ' + valueinit + 'ms')
    }

    if($('#selectNumber'))
    {
        $('#selectNumber').val('0')
    }

    //Envoi des requêtes sur un clic sur les boutons. Le 2ème paramètre permet de choisir les bons spinner et message de succès lors de la requête (0=led, 1=temperature, 2=gps, 3=buzzer) 
    $('#switch').click(function() {
        envoyerRequete("http://192.168.1.51:3000/led?etat=switch", 0)
    })

    $('#allumer').click(function() {
        envoyerRequete("http://192.168.1.51:3000/led?etat=allumer", 0)
    })

    $('#eteindre').click(function() {
        envoyerRequete("http://192.168.1.51:3000/led?etat=eteint", 0)
    })

    $('#temperature').click(function() {
        envoyerRequete("http://192.168.1.51:3000/demander_temperature", 1)
    })

    $('#blink').click(function() {
        envoyerRequete("http://192.168.1.51:3000/led?etat=blink", 0)
    })

    //Mettre à jour en temps réel le texte du slider avec la valeur du slider
    $('#controlTempo').on('input', function() {
        const value = $(this).val()
        $('#tempoValue').text('Temps : ' + value + 's')
    })

    $('#allumeTempo').click(function() {
        //Récupération de la valeur du slider
        const tempoValue = $('#controlTempo').val()
        envoyerRequete("http://192.168.1.51:3000/led?etat=allumer&intervalle=s&temps=" + tempoValue, 0)
    })

    $('#eteintTempo').click(function() {
        //Récupération de la valeur du slider
        const tempoValue = $('#controlTempo').val()
        envoyerRequete("http://192.168.1.51:3000/led?etat=eteint&intervalle=s&temps=" + tempoValue, 0)
    })

    //Mettre à jour en temps réel le texte du slider avec la valeur du slider
    $('#controlTempoMS').on('input', function() {
        const value = $(this).val()
        $('#tempoValueMS').text('Temps : ' + value + 'ms')
    })

    $('#allumeTempoMS').click(function() {
        //Récupération de la valeur du slider
        const tempoValue = $('#controlTempoMS').val()
        envoyerRequete("http://192.168.1.51:3000/led?etat=allumer&intervalle=ms&temps=" + tempoValue, 0)
    })

    $('#eteintTempoMS').click(function() {
        //Récupération de la valeur du slider
        const tempoValue = $('#controlTempoMS').val()
        envoyerRequete("http://192.168.1.51:3000/led?etat=eteint&intervalle=ms&temps=" + tempoValue, 0)
    })

    $('#led').click(function() {
        envoyerRequete("http://192.168.1.51:3000/led?etat=state", 0)
    })

    $('#gps').click(function() {
        envoyerRequete("http://192.168.1.51:3000/demander_gps", 2)
    })

    $('#buzzer').click(function() {
        envoyerRequete("http://192.168.1.51:3000/buzzer", 3)
    })

    $('#programmerLED').click(function() {
        var init = ''
        //Récupérer l'option sélectionnée avec les boutons radios
        if($('#option1').is(':checked'))
        {
            init='a'
        }
        else if($('#option2').is(':checked'))
        {
            init='e'
        }

        var chaine = ''

        $('#conteneurInputField input').each(function()
        {
            var value = $(this).val()
            if(value)
            {
                chaine += value + ';'
            }
        })

        //Enlever le dernier ";"
        chaine = chaine.slice(0, -1)

        console.log(chaine)

        envoyerRequete("http://192.168.1.51:3000/programmation?init=" + init +"&chaine=" + chaine, 0)
    })

    $('#selectNumber').on('change', function() {
        var nombreFields = $(this).val()
        //Vider le conteneur d'input field avant de les ajouter
        $('#conteneurInputField').empty()

        for (var i=1; i<= nombreFields; i++)
        {
            //Créer la chaîne HTML à ajouter au conteneur pour chaque input field
            var inputField = $('<div>', {class:'form-group mb-3' })
                .append($('<labe>', {for: 'inputField'+ i, text:'Temps de l\'occurence '+ i + ' :' }))
                .append($('<input>', {type: 'number', class: 'form-control', id: 'inputFiled' + i, placeholder: 'Entrez un nombre', min:1, max:100, required:true}))
            $('#conteneurInputField').append(inputField)
        }
    })

    $('#conteneurInputField').on('change', 'input[type="number"]',function() {
        var value = $(this).val()
        //Borner les valeurs entre 1 et 100
        if(value <1)
        {
            $(this).val('1')
        }
        else if(value>100)
        {
            $(this).val('100')
        }
    })

    const envoyerRequete = (url,temperature) => {
        //Sélection du spinner à afficher en fonction du 2ème paramètre
        if(temperature==1)
        {
            $spinner = $spinner_temperature
        }
        else if(temperature==0){
            $spinner = $spinner_led
        }
        else if(temperature==2){
            $spinner = $spinner_gps
        }
        else if(temperature==3){
            $spinner = $spinner_buzzer
        }


        $spinner.show();

        $.get(url)
            .done(function() {
                afficherMessageSucces(temperature)
            })
            .fail(function(jqXHR, textStatus, errorThrown) {
                console.error('Erreur:', textStatus, errorThrown)
            })
            .always(function() {
                $spinner.hide()  // Masquer le spinner une fois la requête terminée
            })
        }
    
    const afficherMessageSucces = (temperature) => {
        //Sélection du message de succès de la requête à afficher en fonction du 2ème paramètre
        if(temperature==1)
        {
            $successMessage = $successMessage_temperature
        }
        else if(temperature==0){
            $successMessage = $successMessage_led
        }
        else if(temperature==2){
            $successMessage = $successMessage_gps
        }
        else if(temperature==3){
            $successMessage = $successMessage_buzzer
        }
        $successMessage.show()  // Affiche le message de succès
        setTimeout(() => {
            $successMessage.hide();
        }, 1500)
    };
    
})
