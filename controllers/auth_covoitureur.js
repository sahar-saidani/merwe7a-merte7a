
const Covoitureur = require('../models/covoitureur')
const checkPasswordUsage = require('../utils/checkPasswordUsage')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthenticatedError } = require('../errors')


const register = async (req, res) => {
    const { email, password } = req.body
    const { isPasswordUsed, message } = await checkPasswordUsage(email, password);
  if (isPasswordUsed) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message });
  }
    const covoitureur = await Covoitureur.create(req.body)//await pour attendre la creation dans la base de donnees
    const token =covoitureur.createJWT()
    res.status(StatusCodes.CREATED).json({covoitureur: { name: covoitureur.name }, token })
}

const login = async (req, res) => {
  const { email, password } = req.body

 if (!email || !password) {
    throw new BadRequestError('Please provide email and password')
  }
  const covoitureur = await Covoitureur .findOne({ email})
  if (!covoitureur) {
    throw new UnauthenticatedError('Invalid Credentials')
  }
  const isPasswordCorrect = await covoitureur.comparePassword(password)
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError('Invalid Credentials')
  }
  // compare password
  const token = covoitureur.createJWT()
  res.status(StatusCodes.OK).json({ covoitureur: { name: covoitureur.name }, token })
}

module.exports = {
  register,
  login,
}