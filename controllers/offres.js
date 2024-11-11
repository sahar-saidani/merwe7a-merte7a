const Offre = require("../models/offre")
const villesParGouvernorat = require("../models/lieu")
const getAllOffres =async(req,res)=>{
    try{
        const offre = await Offre.find({})
        res.status(200).json({offre}) 
    }catch(error){
        res.status(500).json({msg:error})
    }
}
const createOffre = async(req,res)=>{
    try{
        const offre =await Offre.create(req.body)
        res.status(201).json({offre}) 

    }catch(error){
        res.status(500).json({msg:error})
    }
}
const updateOffre = async(req,res)=>{
    try{
        const {id:OffreID} = req.params
        const offre= await Offre.findOneAndUpdate({_id:OffreID},req.body,{
            new: true,
            runValidators :true
        })
        res.status(200).json({})

    }catch(error){
        res.status(500).json({msg:error})
    }
}
const deleteOffre =async(req,res)=>{
    try{
        const {id:OffreID} = req.params
        const offre=await Offre.findOneAndDelete({_id:OffreID})
        if (!offre){
            res.status(404).json(`no offre with this ${OffreID}`)
        }
        res.status(200).json(offre)
    }catch(error){
        res.status(500).json({msg:error})
    }
    
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
    deleteOffre,
    updateOffre,
    createOffre,
    getVilles ,
    getAllgouvernerat,
    
}