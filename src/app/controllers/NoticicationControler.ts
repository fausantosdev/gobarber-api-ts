import { Request, Response } from 'express'
import UserModel from '../models/User'

import Notification from '../schemas/Notification'

class NotificationController {
  async index (req: Request, res: Response) {
    const isProvider = await UserModel.findOne({
      where: {
        id: req.userId,
        provider: true
      }
    })

    if (!isProvider) {
      return res.status(401).json({
        error: 'Usuário não é um pestador de serviço'
      })
    }

    // Falta fazer com que o usuário não marque agendamento com ele mesmo!!!!
    try {
      const notifications = await Notification.find({
        user: req.userId
      })
        .sort({ createdAt: -1 })
        .limit(20)

      return res.json(notifications)
    } catch (error) {
      return res.status(401).json(error)
    }
  }

  async update (req: Request, res: Response) {
    try {
      const notification = await Notification.findByIdAndUpdate(req.params.id, { read: true }, { new: true })// Depois de atualizar, ele retrna a nova ublicação atualisada.

      return res.json(notification)
    } catch (error) {
      return res.json(error)
    }
  }
}

export default new NotificationController()
