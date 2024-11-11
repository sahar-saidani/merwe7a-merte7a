const {getAllOffres,
      deleteOffre,
      updateOffre,
      createOffre,
      getVilles ,
      getAllgouvernerat,}=require("../controllers/offres")

const express=require("express")
const router = express.Router()
router.route("/").get(getAllOffres).post(createOffre)
router.route("/:id").patch(updateOffre).delete(deleteOffre)
router.route("/gouvernorats").get(getAllgouvernerat)
router.route("/villes/:gouvernorat").get(getVilles )
module.exports = router