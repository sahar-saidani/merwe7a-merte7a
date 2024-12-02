const {getAllOffres,
       getOffre,
       deleteOffre,
       updateOffre,
       createOffre,
       getVilles ,
       getAllgouvernerat,
       getAllOffresco,
       getOffreco,

}=require("../controllers/offres")
const auth = require('../middleware/authentification')

const express=require("express")
const router = express.Router()
router.route("/consulter").get(auth,getAllOffresco)
router.route("/consulter/:id").get(auth,getOffreco)
router.route("/creation/").post(auth,createOffre)
router.route("/update/:id").patch(auth,updateOffre)
router.route("/delete/:id").delete(auth,deleteOffre)
router.route("/gouvernorats").get(getAllgouvernerat)
router.route("/villes/:gouvernorat").get(getVilles)
router.route("/rechercher").get(getAllOffres)
router.route("/rechercher/:id").get(getOffre)


module.exports = router