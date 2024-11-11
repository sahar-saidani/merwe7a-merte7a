const mongoose = require ("mongoose")
const villesParGouvernorat = {
    'Ariana': ['Ariana Ville', 'Soukra', 'Raoued', 'Kalaat El Andalous'],
    'Béja': ['Béja Nord', 'Béja Sud', 'Nefza', 'Téboursouk','Testour','Goubellat','Medjez El Bab'],
    'Ben Arous': ['Ben Arous', 'Radès', 'Hammam Lif', 'Mourouj','Hammam Chott','Ezzahra','Mégrine','Mornag','Fouchana'],
    'Tunis': ['La Marsa', 'Carthage', 'Le Kram', 'Bab Souika'],
}
const OffreSchema = new mongoose.Schema({
    name:{
        type:String,
        required :[true,'must provide name'],
        maxlength :[20,'name can not be more than 20 characters'],

    },
    image:{
        type :String,
        required:[true,'must provide image'],
        match: [/\.(png)$/i, 'Le fichier doit être une image PNG (extension .png)'],
    },
    gouvernorat_arrivée :{
        type :String,
        required: [true, 'Le gouvernorat d\'arrivée est requis'],
        enum:['Ariana', 'Béja', 'Ben Arous', 'Bizerte', 'El Kef', 'Gabes', 'Gafsa',
      'Jendouba', 'Kairouan', 'Kasserine', 'Kebili', 'Mahdia', 'Manouba',
      'Medenine', 'Monastir', 'Nabeul', 'Sfax', 'Sidi Bouzid', 'Siliana',
      'Sousse', 'Tataouine', 'Tozeur', 'Tunis', 'Zaghouan']

    },
    lieu_arrivée:{
        type: String,
        required: [true, 'La ville d\'arrivée est requise']
    },
    
    dateDepart: {
        type: Date,
        required: [true, 'La date de départ est requise']
    },
    heureDepart: {
        type: String,
        required: [true, 'L\'heure de départ est requise'],
        match: [/^\d{2}:\d{2}$/, 'Le format de l\'heure doit être HH:mm'],
    },
    phoneNumber: {
        type: String,
        required: [true, 'Le numéro de téléphone est requis'],
        match: [/^\d{8}$/, 'Le numéro de téléphone doit contenir 8 chiffres']
    }
})
module.exports = mongoose.model('Offre',OffreSchema);