import { Router } from 'express'
import multer from 'multer'
import multerConfig from './config/multer'

import UserController from './app/controllers/UserController'
import SessionController from './app/controllers/SessionController'
import FileController from './app/controllers/FileController'

import authMiddleware from './app/middlewares/auth'
import ProviderController from './app/controllers/ProviderController'
import AppointmentController from './app/controllers/AppointmentController'
import ScheduleController from './app/controllers/ScheduleController'
import NotificationController from './app/controllers/NoticicationControler'
import AvailableController from './app/controllers/AvailableController'

const routes = Router()
const upload = multer(multerConfig)

routes.post('/user', UserController.store)
routes.post('/auth/login', SessionController.store)

routes.use(authMiddleware)

routes.put('/user', UserController.update)
routes.post('/files', upload.single('file'), FileController.store)

routes.get('/providers', ProviderController.index)
routes.get('/providers/:providerId/available', AvailableController.index)

routes.post('/appointments', AppointmentController.store)
routes.get('/appointments', AppointmentController.index)
routes.delete('/appointments/:id', AppointmentController.delete)

routes.get('/appointments', AppointmentController.index)

routes.get('/schedules', ScheduleController.index)

routes.get('/notification', NotificationController.index)
routes.put('/notification/:id', NotificationController.update)

export default routes
