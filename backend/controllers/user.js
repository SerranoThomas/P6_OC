//Importation pour utilisation des variables d'environnement
require('dotenv').config();
//Importation de bcrypt pour hash le mdp
const bcrypt = require('bcrypt');
//Importation de jsonwebtoken
const jwt = require('jsonwebtoken');
//Importation du modele user
const User = require('../models/User');

//Fonction pour s'inscrire sur la plateforme
exports.signup = (req,res,next) =>{
    //On hash le mdp, on le sale 10 fois pour qu'il soit suffisamment sécurisé mais que cela ne prenne pas trop de temps
    bcrypt.hash(req.body.password, 10)
    .then(hash => {
        //Si le hash est réussi, on créé un nouveau User dans la BDD
        const user = new User({
            email : req.body.email,
            password : hash
        });
        //On enregistre ce nouveau user dans la base de donnée
        user.save()
        .then(() => res.status(201).json({message : 'Utilisateur créé !'}))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
}

//Fonction pour se connecter à la plateforme
exports.login = (req, res, next) => {
    //On trouve l'utilisateur en question
    User.findOne({ email: req.body.email })
        .then(user => {
            if (!user) {
                return res.status(401).json({ error: 'Utilisateur non trouvé !' });
            }
            //On compare le mdp hashé à celui de la base de donné 
            bcrypt.compare(req.body.password, user.password)
                .then(valid => {
                    if (!valid) {
                        return res.status(401).json({ error: 'Mot de passe incorrect !' });
                    }
                    //Si le mdp est validé, on retourne l'id de l'utilisateur, et le token avec la méthode jwt.sign
                    res.status(200).json({
                        //Encodage du userId pour la création de nouveau objet (objet et userId seront liés)
                        userId: user._id,
                        token: jwt.sign(
                            { userId: user._id }, //payload
                            `${process.env.JWT_KEY_TOKEN}`,//clé secrète
                            { expiresIn: '24h' } //délais d'expiration du token
                        )
                    });
                })
                .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
 };