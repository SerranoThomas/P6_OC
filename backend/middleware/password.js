const passwordValidator = require('password-validator');

// Création du schéma du mot de passe
const passwordSchema = new passwordValidator();
// Le schéma que doit respecter le mot de passe
passwordSchema
.is().min(8)                                    // Minimum length 8
.is().max(100)                                  // Maximum length 100
.has().uppercase(1)                              // Must have uppercase letters
.has().lowercase(1)                              // Must have lowercase letters
.has().digits(1)                                // Must have at least 1 digits
.has().not().spaces()                           // Should not have spaces
.is().not().oneOf(['Passw0rd', 'Password123','Azerty12','Azerty123']); // Blacklist these values

//Vérification du mot de passe
module.exports =  (req, res, next) => {
    console.log('-->PASSWORD VALIDATOR')
    if (passwordSchema.validate(req.body.password)) {
        console.log(passwordSchema.validate());
        console.log(passwordSchema.validate(req.body.password,{list : true}));
        next();
        
    } else {
        console.log(passwordSchema.validate());
        console.log(passwordSchema.validate(req.body.password,{ list : true }));
        
        return res.status(400).json({
        message:
                `Le mot de passe n'est pas assez fort ${passwordSchema.validate(req.body.password,{list : true})}`
        });
    };
};