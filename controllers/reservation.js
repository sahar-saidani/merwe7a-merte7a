const Reservation = require('../models/reservation')
const Offre = require('../models/offre')
const Passenger = require('../models/passenger')
const sendEmail = require('../services/emailService')
const { StatusCodes } = require('http-status-codes')
const Covoitureur= require ("../models/covoitureur")






// creation se fait par le passenger en appuiant sur le bouton "reserver"
const createReservation = async (req, res) => {
  const { passenger :passengerId, offre: offerId, numbreplacereservée} = req.body//recuperation des ellements
  console.log('Offer ID:', offerId)
  const offer = await Offre.findById(offerId)//recherche
  if (!offer) {
    return res.status(404).json({ msg: 'Offre non trouvée' });
  }
  const passenger = await Passenger.findById(passengerId)
  const driver = await Covoitureur.findById(offer.createdBy)

  if (numbreplacereservée > offer.nombreplacerestant) { //verif que le nombre demandee ne depasse pas le nombre dispo
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: 'Le nombre de places demandées dépasse le nombre de places disponibles.',
    })
  }
  const reservation = await Reservation.create({//creation du reservation
    passenger: passengerId,
    offre: offerId,
    numbreplacereservée,
  })
  // Envoi d'un email au covoitureur
  await sendEmail(
    driver.email,
    'Nouvelle demande de réservation',
    `Le passager ${passenger.name} a demandé ${numbreplacereservée} places pour votre trajet vers ${offer.lieu_arrivée}.`)

  res.status(StatusCodes.CREATED).json({ message: 'Réservation créée avec succès.', reservation })
} 





// le covoitureur confirme la reservation ( appuie sur une boutton "confimer")
const confirmReservation = async (req, res) => {
  const { reservationId } = req.params;

  try {
    const reservation = await Reservation.findById(reservationId);
    console.log(reservation)
    if (!reservation) {
      return res.status(StatusCodes.NOT_FOUND).json({ message: 'Réservation introuvable.' });
    }

    const offer = reservation.offre;

    if (reservation.numbreplacereservée > offer.nombreplacerestant) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        message: 'Le nombre de places demandées dépasse le nombre de places restantes.',
      });
    }

    // Décrémenter le nombre de places restantes
    offer.nombreplacerestant -= reservation.numbreplacereservée;
    await offer.save();

    // Mise à jour du statut de la réservation
    reservation.status = 'confirmed';
    await reservation.save();

    // Appel à la fonction pour mettre à jour la balance du conducteur uniquement si la réservation est confirmée
    if (reservation.status === 'confirmed') {
      await updateDriverBalanceForReservation(reservation._id);
    }

    // Envoi de l'email au passager
    const passenger = await Passenger.findById(reservation.passenger);
    await sendEmail(
      passenger.email,
      'Réservation confirmée',
      `Votre réservation de ${reservation.numbreplacereservée} place(s) a été confirmée pour le trajet vers ${offer.lieu_arrivée}.`
    );

    res.status(StatusCodes.OK).json({
      message: 'Réservation confirmée par le covoitureur et email envoyé au passager.',
    });
  } catch (error) {
    console.error(error);
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      message: 'Une erreur est survenue lors de la confirmation de la réservation.',
    });
  }
};







//le covoitureur refuse la reservation (appuie sur une boutton "rejeter" )
const rejectReservation = async (req, res) => {
  const { reservationId } = req.params;

  const reservation = await Reservation.findById(reservationId);
  if (!reservation) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Réservation introuvable.' });
  }

  // Mise à jour du statut en "rejected"
  reservation.status = 'rejected';
  await reservation.save();

  // Envoi d'un email au passager
  await sendEmail(
    reservation.passenger.email,
    'Réservation annulée',
    'Votre réservation a été annulée par le covoitureur.'
  );

  res.status(StatusCodes.OK).json({ message: 'Réservation rejetée avec succès.' });
}






const deleteReservation = async (req, res) => { //supression par l'admin
  const { reservationId } = req.params;

  const reservation = await Reservation.findById(reservationId);
  if (!reservation) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Réservation introuvable.' });
  }

  // Suppression de la réservation
  await Reservation.findByIdAndDelete(reservationId);

  res.status(StatusCodes.OK).json({ message: 'Réservation supprimée avec succès.' });
}




//en appuiant sur bouton "modifier"
const updateReservation = async (req, res) => {
  const { reservationId } = req.params;
  const { numbreplacereservée } = req.body;

  const reservation = await Reservation.findById(reservationId);
  if (!reservation) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Réservation introuvable.' });
  }

  const offer = await Offre.findById(reservation.offre);

  // Vérifier que le nombre de places demandées ne dépasse pas les places restantes
  if (numbreplacereservée > offer.nombreplacerestant) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: 'Le nombre de places demandées dépasse le nombre de places restantes.',
    });
  }

  // Mise à jour du nombre de places réservées
  reservation.numbreplacereservée = numbreplacereservée;
  await reservation.save();

  res.status(StatusCodes.OK).json({
    message: 'Réservation mise à jour avec succès.',
    reservation,
  });
}






//en appuiant sur bouton "annuler"
const cancelReservation = async (req, res) => {
  const { reservationId } = req.params;

  // Récupérer la réservation
  const reservation = await Reservation.findById(reservationId);
  if (!reservation) {
    return res.status(StatusCodes.NOT_FOUND).json({ message: 'Réservation introuvable.' });
  }
  const offer = await Offre.findById(reservation.offre);
  const now = new Date();
  // Calculer l'heure de départ combinée avec la date
  const departureTime = new Date(`${offer.dateDepart}T${offer.heureDepart}:00`);
  // Vérifier que l'heure actuelle est inférieure à l'heure de départ
  if (now >= departureTime) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: 'L\'annulation de la réservation est impossible car l\'heure de départ est déjà passée.',
    });
  }

// Annuler la réservation et réajuster le nombre de places restantes
  offer.nombreplacerestant += reservation.numbreplacereservée;
  await offer.save();
  // Mise à jour du statut de la réservation
  reservation.status = 'annulée';
  await reservation.save();

  // Envoi d'un email au covoitureur pour l'annulation
  const driver = await Covoitureur.findById(offer.createdBy);
  await sendEmail(
    driver.email,
    'Réservation annulée',
    `Le passager ${reservation.passenger.name} a annulé sa réservation pour le trajet vers ${offer.lieu_arrivée}.`
  );

  res.status(StatusCodes.OK).json({ message: 'Réservation annulée et places réajustées.' });
};




const updateDriverBalanceForReservation = async (reservationId) => {
  const reservation = await Reservation.findById(reservationId).populate('offre');
  if (!reservation || reservation.status !== 'confirmed') {
    return; // Ne pas mettre à jour si la réservation n'est pas confirmée
  }

  const offer = reservation.offre;
  const driver = await Covoitureur.findById(offer.createdBy);
  const totalAmount = (reservation.numbreplacereservée) * offer.prixparplace;

  // Calcul du montant total après commission
  const commission = 0.2 * totalAmount;

  // Mise à jour du solde du covoitureur
  driver.solde += totalAmount;
  driver.montant_payé -= commission; // Réduction du montant payé

  await driver.save();
  console.log(`Solde du covoitureur mis à jour. Nouveau solde: ${driver.solde}`);
}





module.exports = {
  createReservation,
  confirmReservation,
  rejectReservation,
  cancelReservation,
  updateReservation,
  deleteReservation,
}


