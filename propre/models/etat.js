const mongoose = require('mongoose');

const etatSchema = new mongoose.Schema({
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

module.exports = mongoose.model('etat_hexa', etatSchema);
