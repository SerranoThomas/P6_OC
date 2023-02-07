//Middleware qui permet de vérifier l'authentification de l'utilisateur à chaque requête
require('dotenv').config();
const jwt = require('jsonwebtoken');
 
module.exports = (req, res, next) => {
   try {
    //On récupère le token en question
       const token = req.headers.authorization.split(' ')[1];
       //on vérifie que le token récupéré correspond à notre base de donnée
       const decodedToken = jwt.verify(token, `${process.env.JWT_KEY_TOKEN}`);
       //on récupère le userId décodé pat le jwt.verify
       const userId = decodedToken.userId;
        //on ajoute l'objet userId à l'objet de requête
       req.auth = {
           userId: userId
       };
	next();
   } catch(error) {
       res.status(401).json({ error });
   }
};