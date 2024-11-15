const Passenger = require('../models/passenger')
const checkPasswordUsage = require('../utils/checkPasswordUsage')
const { StatusCodes } = require('http-status-codes')
const { BadRequestError, UnauthenticatedError } = require('../errors')
const register = async (req, res) => {
    const { email, password } = req.body
    const { isPasswordUsed, message } = await checkPasswordUsage(email, password);
  if (isPasswordUsed) {
    return res.status(StatusCodes.BAD_REQUEST).json({ message });
  }
    const passenger = await Passenger.create({ ...req.body })//await pour attendre la creation dans la base de donnees
    const token = passenger.createJWT()
    res.status(StatusCodes.CREATED).json({passenger: { name: passenger.name }, token })
}

const login = async (req, res) => {
  const { email, password } = req.body

 if (!email || !password) {
    throw new BadRequestError('Please provide email and password')
  }
  const passenger = await Passenger.findOne({ email })
  if (!passenger) {
    throw new UnauthenticatedError('Invalid Credentials')
  }
  const isPasswordCorrect = await passenger.comparePassword(password)
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError('Invalid Credentials')
  }
  // compare password
  const token = passenger.createJWT()
  res.status(StatusCodes.OK).json({ passenger: { name: passenger.name }, token })
}

module.exports = {
  register,
  login,
}