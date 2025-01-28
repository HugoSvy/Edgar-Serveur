// Fonction pour décoder
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
    values.Temp = values.Temp / 10;

    return values;
}

// Fonction pour encoder
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

// Export des fonctions
module.exports = { encode, decode };