
const Connect = require('./bd/connect')
const express =require("express")
const app = express()
const offres = require ('./routes/offres')
require('dotenv').config()
app.use(express.json())
app.use('/api/v1/offre' , offres)
const port= 4000 
const start = async() => {//start est une fonction asynchrone.
    try{
        await Connect(process.env.MONGO_URI)//démarre le serveur sur le port défini (3000).
        app.listen(port, console.log(`server is listening on port ${port}`))//bonne pratique pour connaitre le serveur ye5dim ou pas (sa3at si on est connecter lil base de donnes)
    }catch(error){
        console.log(error)
    }
}
start()
