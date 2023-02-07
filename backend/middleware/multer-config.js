//On importe le package
const multer = require('multer');
//On créé un dictionnaire
const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};
//On stock les images en local
const storage = multer.diskStorage({
  //On définit que les images seront stockées dans le dossier images
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  //On détermine le nom du fichier
  filename: (req, file, callback) => {
    //On garde le nom original du fichier, et remplaçant les éventuels espaces par des "_"
    const name = file.originalname.split(' ').join('_');
    //On définit les extensions basées sur le dictionnaire créé plus haut
    const extension = MIME_TYPES[file.mimetype];
    //On définit la forme final du nom des fichiers
    callback(null, name + Date.now() + '.' + extension);
  }
});
//On exporte le middleware en appelant multer et en passant l'objet storage avec la méthode single pour dire que le fichier est unique
module.exports = multer({storage: storage}).single('image');