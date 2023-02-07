//Importation mongoose
const mongoose = require('mongoose');
//importation mongoose-unique-validator
const uniqueValidator = require('mongoose-unique-validator');

//Le modèle de base pour le signup (enregistrer un nouvel utilisateur)
const userSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

//Sécurité ajoutée pour ne pas enregistrer 2 fois la même adresse mail
userSchema.plugin(uniqueValidator);

//Exportation du module
module.exports = mongoose.model('User', userSchema);