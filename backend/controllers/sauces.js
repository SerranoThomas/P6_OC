const Sauce = require('../models/Sauce');
const fs = require('fs');

//Création d'une sauce
exports.createSauce = (req, res, next) =>{
    //On parse l'objet envoyé dans la requête
    const sauceObject = JSON.parse(req.body.sauce);
    console.log(sauceObject);
  //On supprime l'id de l'objet car il va être généré automatiquement par la BDD
    delete sauceObject._id;
    //On supprime aussi le champs userId qui correspond au créateur de l'objet car on ne fait pas confiance au client, 
    delete sauceObject._userId;
    const sauce = new Sauce({
        ...sauceObject,
        //On utilise donc le userId présent dans le token d'authentification, qu'on génère grâce au middleware auth
        userId : req.auth.userId,
        //On génère l'url de l'image
        imageUrl : `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    });
    //On enregistre l'objet que l'on vient de créer dans la BDD
    sauce.save()
    .then(() =>{
        //On retourne un statu 201 pour un objet créé
        res.status(201).json({message : 'Sauce créée !'})
    })
    .catch(error => {
        res.status(400).json({error})
    });
}; 

//Suppression d'une sauce
exports.deleteSauce = (req,res,next)=>{
    //On récupère l'objet à supprimer grâce à la méthode findOne
    Sauce.findOne({_id: req.params.id})
    .then(sauce => {
        //Si l'id de l'utilisateur qui cherche à supprimer la sauce est différent de celui récupéré dans le token, on renvoit une erreur 400
        if (sauce.userId != req.auth.userId){
            res.status(401).json({message : 'Non autorisé !'})
        }else{
            //Sinon, on récupère l'image dans l'objet récupéré
            const filename = sauce.imageUrl.split('/images')[1];
            //Puis on supprime l'objet grâce à la méthode unlink, en passant en argument l'image à supprimer
            fs.unlink(`images/${filename}`, () =>{
                //On utilise ensuite la méthode deletOne pour supprimer la sauce récupérée
                Sauce.deleteOne({ _id: req.params.id})
                .then(()=>{
                    res.status(200).json({message : 'Sauce supprimée'})
                })
                .catch(error => res.status(401).json({error}));
            });
        };
    })
    .catch(error =>{ 
        res.status(500).json({error})
    });
};
//Affichage d'une sauce unique
exports.getOneSauce = (req, res, next) =>{
    //On récupère l'objet à sélectionner avec la méthode findOne, en passant en argument l'id de l'objet en question
    Sauce.findOne({ _id : req.params.id })
    .then(sauce =>{
        //On retourne la sauce au format json
        res.status(201).json(sauce)
    })
    .catch(error => {
        res.status(400).json({error})
    });
};

//
exports.modifySauce = (req,res,next) =>{
    //On check si la modification comprend une image
    const sauceObject = req.file ? {
        //Si c'est le cas, on récupère notre objet en parsant la chaine de caractère et recréant l'url de l'image
        ...JSON.parse(req.body.sauce),
        imageUrl : `${req.protocol}://${req.get('host')}/images/${req.file.filename}`

    } : //Si pas de file transmis, on récupère l'objet directement dans le corps de la requete
    { 
        ...req.body
    }
    //On supprime l'user id de la requete pour éviter que qqun créé un objet à son nom puis le modifie pour le réassigner à qqun d'autre
    delete sauceObject._userId
    //On récupère l'objet à sélectionner avec la méthode findOne, en passant en argument l'id de l'objet en question
    Sauce.findOne({ _id : req.params.id })
    .then( sauce =>{
        //Si l'id de l'utilisateur qui cherche à le modifier est différent de celui récupéré dans le token, on renvoit une erreur 400
         if (sauce.userId != req.auth.userId){
            res.status(400).json({message : 'Non-autorisé'})
         } else {
            //Sinon, on update l'enregistrement, en passant en argument l'enregistrement à mettre à jour (via l'id), avec quel objet
            Sauce.updateOne({ _id : req.params.id}, {...sauceObject, _id: req.params.id})
            .then(()=>{
                res.status(200).json({message : 'Objet modifié' })
            })
            .catch(error => {
                res.status(401).json({error})
            });
         };
    })
    .catch(error => {
        res.status(400).json({error})
    });
};

//Afficher toutes les sauces
exports.getAllSauce = (req, res, next) => {
    //on utilise la méthode find pour récupérer toutes les sauces présentes dans la BDD
    Sauce.find()
    .then((sauces) => {
        //Si pas d'erreur, on retourne un statu 200 et on affiche ces différentes sauces
        res.status(200).json(sauces)
    })
    .catch((error) => {
        //Sinon on renvoi une erreur 400 
        res.status(400).json({ error })
    });
};

//like/dislike une sauce
exports.likeASauce = (request, response, next) => {
  //On sélectionne une sauce en question
    Sauce.findOne({ _id: request.params.id })
      .then((sauce) => {
        switch (request.body.like) {
          // Like = 1 => L'utilisateur aime la sauce (like = +1)
          case 1:
            //Si l'array usersLiked ne comprend pas encore le userId en question et que l'utilisateur like la sauce
            if (!sauce.usersLiked.includes(request.body.userId) && request.body.like === 1) {
              //alors on update la sauce en question en incrémentant le like, et en passant le userId de l'utilisateur dans l'array usersLiked
              Sauce.updateOne({ _id: request.params.id }, {$inc: { likes: 1 }, $push: { usersLiked: request.body.userId }})
                .then(() => {
                  response.status(201).json({ message: "La sauce a été likée !" });
                })
                .catch((error) => {
                  response.status(400).json({ error: error });
                });
            }
            break;
          //L'utilisateur n'aime pas la sauce 
          case -1:
          // Like = -1 => L'utilisateur aime la sauce
            if (!sauce.usersDisliked.includes(request.body.userId) && request.body.like === -1) {
              Sauce.updateOne({ _id: request.params.id },
                { $inc: { dislikes: 1 }, $push: { usersDisliked: request.body.userId }, }
              )
                .then( () => {
                  response.status(201).json({ message: "La sauce a été dislikée !" });
                })
                .catch( (error) => {
                  response.status(400).json({ error: error });
                });
            }
            break;
          //Annulation du like par l'utilisateur
          case 0:
            if (sauce.usersLiked.includes(request.body.userId)) {
              Sauce.updateOne({ _id: request.params.id },
                { $inc: { likes: -1 }, $pull: { usersLiked: request.body.userId }, }
              )
                .then( () => {
                  response.status(200).json({ message: "Le like de la sauce a été annulé !" });
                })
                .catch((error) => {
                  response.status(400).json({ error });
                });
            }
            //Annulation du dislike 
            if (sauce.usersDisliked.includes(request.body.userId)) {
              Sauce.updateOne(
                { _id: request.params.id },
                { $inc: { dislikes: -1 }, $pull: { usersDisliked: request.body.userId }, }
              )
                .then( () => {
                  response.status(200).json({ message: "Le dislike de la sauce a été annulé !" });
                })
                .catch( (error)  => {
                  response.status(400).json({ error });
                });
            }
            break;
        }
      })
      .catch( (error) => {
        response.status(404).json({ error });
      });
  };