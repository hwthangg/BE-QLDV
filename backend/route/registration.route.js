import express from 'express'
import RegistrationController from '../controller/registration.controller.js'


const RegistrationRoute = express.Router()

RegistrationRoute.post('/', RegistrationController.createRegistration)
RegistrationRoute.patch('/:id', RegistrationController.checkIn)
RegistrationRoute.get('/', RegistrationController.getParticipants)
RegistrationRoute.get('/:id', RegistrationController.getMyRegistrations)

export default RegistrationRoute