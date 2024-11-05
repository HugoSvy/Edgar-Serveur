function simulateSensorData() {
    setInterval(() => {
      const temperature = (Math.random() * 10 + 15).toFixed(1);
      const light = Math.floor(Math.random() * 10000);
      const brightness = Math.floor(Math.random() * 100);
      const waterLevel = Math.max(0, parseFloat(document.querySelector('#waterLevel span').textContent) - Math.random() * 70).toFixed(1);
  
      document.querySelector('#temperature span').textContent = temperature;
      document.querySelector('#light span').textContent = light;
      document.querySelector('#brightness span').textContent = brightness;
      document.querySelector('#waterLevel span').textContent = waterLevel;
  
      if (waterLevel < 15) {
        document.getElementById('notification').style.display = 'block';
      } else {
        document.getElementById('notification').style.display = 'none';
      }
    }, 2000);
  }
  
  // Fonction de prise de photo, en commentaire pour l'intégration future
  // function takePhoto() {
  //   console.log("Prendre une photo pour l'identification de la plante.");
  // }
  
  simulateSensorData();
  