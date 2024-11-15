const { createReservation,
        confirmReservation,
        rejectReservation}=require('../controllers/reservation')
const express=require('express')
const router = express.Router()
router.route('/').post(createReservation)
router.route('/confirme/:id').patch(confirmReservation)
router.route('/refuse/:id').delete(rejectReservation)

module.exports=router