const Reservation = require('../models/reservation')
const Offre = require('../models/offre')
const Passenger = require('../models/passenger')
const Covoitureur = require('../models/covoitureur')
const sendEmail = require('../services/emailService')
const { StatusCodes } = require('http-status-codes')



const createReservation = async (req, res) => {
  const { passengerId, offerId, numbreplacereservée} = req.body//recuperation des ellements

  const offer = await Offre.findById(offerId)//recherche
  const passenger = await Passenger.findById(passengerId)
  const driver = await Covoitureur.findById(offer.createdBy)

  if (numbreplacereservée > offer.nombreplacerestant) { //verif que le nombre demandee ne depasse pas le nombre dispo
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: 'Le nombre de places demandées dépasse le nombre de places disponibles.',
    })
  }
  const reservation = await Reservation.create({//creation du reservation
    passenger: passengerId,
    offer: offerId,
    numbreplacereservée,
  })
  // Envoi d'un email au covoitureur
  await sendEmail(
    driver.email,
    'Nouvelle demande de réservation',
    `Le passager ${passenger.name} a demandé ${numbreplacereservée} places pour votre trajet vers ${offer.lieu_arrivée}.`)

  res.status(StatusCodes.CREATED).json({ message: 'Réservation créée avec succès.', reservation })
};




const confirmReservation = async (req, res) => {
  const { reservationId } = req.params;

  const reservation = await Reservation.findById(reservationId)
  if (!reservation) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Réservation introuvable.' })
  }

  const offer = reservation.offer;

  if (reservation.numbreplacereservée > offer.nombreplacerestant) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: 'Le nombre de places demandées dépasse le nombre de places restantes.',
    });
  }
  // Décrémenter le nombre de places restantes
  offer.nombreplacerestant -= reservation.numbreplacereservée;
  await offer.save(); //pour enregistrer les modif 

  // Mise à jour du statut de la réservation
  reservation.status = 'confirmed';
  await reservation.save();

  // Envoi d'un email au passager
  await sendEmail(
    reservation.passenger.email,//le mail eli mechilou lmessage
    'Réservation confirmée',//l'objet du mail
    `Votre réservation pour le trajet vers ${offer.destination} a été confirmée.`//le message
  );

  res.status(StatusCodes.OK).json({ message: 'Réservation confirmée.' });
};




const rejectReservation = async (req, res) => {
  const { reservationId } = req.params;

  const reservation = await Reservation.findById(reservationId)
  if (!reservation) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Réservation introuvable.' })
  }
  // Envoi d'un email au passager
  await sendEmail(
    reservation.passenger.email,
    'Réservation annulée',
    'Votre réservation a été annulée. Nous sommes désolés pour le désagrément.'
  );

  // Suppression de la réservation
  await Reservation.findByIdAndDelete(reservationId)
  res.status(StatusCodes.OK).json({ message: 'Réservation annulée et supprimée.' })
};




module.exports = {
  createReservation,
  confirmReservation,
  rejectReservation,
}


