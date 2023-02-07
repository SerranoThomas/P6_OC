require('dotenv').config();
//Importations nécessaires au fonctionnement des packages différents
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

//Déclaration des variables routers
const userRoutes = require('./routes/user');
const saucesRoute = require('./routes/sauce');

//Variables d'environnement pour me connecter à la BDD
const mongo_username = process.env.MONGODB_USERNAME;
const mongo_pwd = process.env.MONGODB_PWD;
const mongo_cluster = process.env.MONGODB_CLUSTER;


//On déclare la constante app
const app = express();

//On sécurise nos en-têtes HTTP via helmet
app.use(helmet.contentSecurityPolicy());
app.use(helmet.crossOriginEmbedderPolicy());
app.use(helmet.crossOriginOpenerPolicy());
app.use(helmet.crossOriginResourcePolicy({ policy: 'same-site' }));
app.use(helmet.dnsPrefetchControl());
app.use(helmet.expectCt());
app.use(helmet.frameguard());
app.use(helmet.hidePoweredBy());
app.use(helmet.hsts());
app.use(helmet.ieNoOpen());
app.use(helmet.noSniff());
app.use(helmet.originAgentCluster());
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy());
app.use(helmet.xssFilter());

//Connexion à la BDD
mongoose.connect(`mongodb+srv://${mongo_username}:${mongo_pwd}@${mongo_cluster}.mongodb.net/?retryWrites=true&w=majority`,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

//On ajoute les headers pour éviter l'erreur CORS
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
  });

app.use(cors());

//Middleware qui permet d'extraire le corps JSON du frontend
app.use(express.json());

//Enregistrement des routeurs
app.use('/api/auth', userRoutes);
app.use('/api/sauces', saucesRoute);

//Middleware pour servir le dossier image
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;