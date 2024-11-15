const Offre = require("../models/offre")
const villesParGouvernorat = require("../models/lieu")
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, NotFoundError } = require('../errors')
const removeExpiredOffres = async () => {
    const today = new Date()//date d'aujourdhui
    try {
      await Offre.deleteMany({ dateDepart: { $lt: today } }) //$lt segnifie less than en MongoDB
      console.log("Offres expirées supprimées avec succès")
    } catch (error) {
      console.error("Erreur lors de la suppression des offres expirées", error)
    }
  }

const getAllOffresco =async(req,res)=>{
        await removeExpiredOffres()
        const offre = await Offre.find({createdBy: req.user.userId })
        res.status(StatusCodes.OK).json({ offre, count: offre.length })
    
}
const getAllOffres =async(req,res)=>{
  await removeExpiredOffres()
  const offre = await Offre.find({})
  res.status(StatusCodes.OK).json({ offre})

}
const getOffreco = async (req, res) => {
    const {
      user: { userId },
      params: { id: OffreId },
    } = req
  
    const offre = await Offre.findOne({
      _id: OffreId,
      createdBy: userId,
    })
    if (!offre) {
      throw new NotFoundError(`No offre with id ${OffreId}`)
    }
    res.status(StatusCodes.OK).json({ offre })
  }
const getOffre = async (req, res) => {
    const OffreId = req.params
    const offre = await Offre.findOne({_id: OffreId})
    
    if (!offre) {
      throw new NotFoundError(`No offre with id ${OffreId}`)
    }
    res.status(StatusCodes.OK).json({ offre })
  }
const ajusterGouvernoratEtLieu = (offre) => {
    if (offre.lieu_arrivée !== 'FST') {
      offre.gouvernorat_depart = 'Tunis';
      offre.lieu_depart = 'FST';
    }
  
    if (offre.lieu_depart !== 'FST') {
      offre.gouvernorat_arrivée = 'Tunis';
      offre.lieu_arrivée = 'FST';
    }
  
    return offre;
}
const createOffre = async(req,res)=>{
        req.body.createdBy = req.user.userId
        const data = ajusterGouvernoratEtLieu(req.body) //ta3mil verif 3al req.body eli bich yraja3lik l'offre modifiée 
        const offre =await Offre.create(data)
        res.status(StatusCodes.CREATED).json({ offre }) 

    
    
}
const updateOffre = async(req,res)=>{
    const {
        user: { userId },
        params: { id: OffreID },
      } = req
    const dataoffre = ajusterGouvernoratEtLieu(req.body)
    const offre= await Offre.findByIdAndUpdate({_id:OffreID,createdBy:userId},dataoffre,{
            new: true,
            runValidators :true
        })
    if (!job) {
        throw new NotFoundError(`No job with id ${jobId}`)
    }
        res.status(StatusCodes.OK).json({ job })
    }
    
const deleteOffre =async(req,res)=>{
        const {
            params:{id:OffreID},
            user:{ userId} }= req
        const offre=await Offre.findByIdAndRemove({_id:OffreID,createdBy :userId })
        if (!offre){
            throw new NotFoundError(`No job with id ${jobId}`)
        }
        res.status(StatusCodes.OK).send()
    
}
const getAllgouvernerat = async(req, res)=> {
    try {
      const gouvernorats = await Object.keys(villesParGouvernorat);
      res.status(200).json(gouvernorats);
    } catch (error) {
      res.status(500).json({ message: "Erreur lors de la récupération des gouvernorats", error });
    }
}
const getVilles = async (req, res) =>{
    const { gouvernorat } = req.params;
    const villes = await villesParGouvernorat[gouvernorat];
  
    if (!villes) {
      return res.status(404).json({ message: `Le gouvernorat '${gouvernorat}' est introuvable` });
    }
    res.status(200).json(villes);
}
module.exports ={
    getAllOffres,
    getOffreco,
    deleteOffre,
    updateOffre,
    createOffre,
    getVilles ,
    getAllgouvernerat,
    getAllOffresco,
    getOffre,
    
}