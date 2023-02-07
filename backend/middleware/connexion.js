//Middleware qui permet de limiter le nombre de tentatives de connexion dans une période donnée
const expressLimit = require("express-limit").limit;

//Limitation des connexions
const maximumAttempts = expressLimit({
    //délai en millisecondes
    windowMs: 5 * 60 * 1000, //5 minutes
    //tentatives de connexions autorisées
    max: 50, //50 essais max
    message:
       "Votre compte est bloqué pendant quelques minutes suite aux tentatives de connexions échouées !",
});

module.exports = maximumAttempts;