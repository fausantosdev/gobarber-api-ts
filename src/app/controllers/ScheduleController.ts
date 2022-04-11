import { Request, Response } from 'express'
import { startOfDay, endOfDay, parseISO } from 'date-fns'
import { Op } from 'sequelize'

import AppointmentModel from '../models/Appointment'
import UserModel from '../models/User'

class ScheduleController {
  async index (req: Request, res: Response) {
    try {
      const checkUserProvider = await UserModel.findOne({
        where: { id: req.userId, provider: true }
      })

      if (!checkUserProvider) {
        res.status(401).json({ error: 'Usuário não é um prestador de serviço' })
      }

      const { date } = req.query
      const parsedDate = parseISO(date)

      const appointments = await AppointmentModel.findAll({
        where: {
          provider_id: req.userId, // Usuário logado.
          canceled_at: null,
          // Irá listar apenas os agendamentos do dia corrente.
          date: {
            [Op.between]: [// Operador de comparação, que está entre dois valores.
              startOfDay(parsedDate),
              endOfDay(parsedDate)
            ]
          }
        },
        order: ['date']
      })

      return res.json(appointments)
    } catch (error) {
      return res.status(500).json({ error })
    }
  }
}

export default new ScheduleController()
