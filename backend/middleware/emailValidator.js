const validator = require('validator');

module.exports = (req, res, next) =>{
    var email = req.body.email;
    console.log('-->EMAIL VALIDATOR');
    console.log(email);
    if (validator.isEmail(email)){
        console.log(validator.isEmail(email));
        console.log(`L'email ${email} est valide`);
        next();
    } else{
        res.status(400).json({message : `L'email ${email} n'est pas valide`});
    };
};