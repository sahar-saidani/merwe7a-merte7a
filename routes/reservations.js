const { createReservation,
    confirmReservation,
    rejectReservation,
    cancelReservation,
    updateReservation,
    deleteReservation,}=require('../controllers/reservation')
const express=require('express')
const router = express.Router()
router.route('/').post(createReservation)
router.route('/confirme/:id').patch(confirmReservation)//par le covoitureur
router.route('/annulée/:id').patch(cancelReservation)//par le passager
router.route('/update/:id').patch(updateReservation)//par le passager
router.route('/refuse/:id').patch(rejectReservation)//par le covoitureur
router.route('/delete/:id').patch(deleteReservation)//par l'admin

module.exports=router