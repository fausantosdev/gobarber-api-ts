import { Request, Response } from 'express'
import * as Yup from 'yup'
import { startOfHour, parseISO, isBefore, format, subHours } from 'date-fns'
import pt from 'date-fns/locale/pt'

import Appointment from '../models/Appointment'
import UserModel from '../models/User'
import FileModel from '../models/File'
import Notification from '../schemas/Notification'

import Queue from '../../lib/Queue'

import CancellationMail_JOB from '../jobs/CancellationMail'
import CreateAppointment_JOB from '../jobs/CreateAppointment'

class AppointmentController {
  async index (req: Request, res: Response) {
    const { page = 1 } = req.query
    try {
      const appointments = await Appointment.findAll({
        where: { // Todos os agendamentos do usuário logado!
          user_id: req.userId,
          canceled_at: null
        },
        attributes: ['id', 'date', 'past', 'cancelable'],
        order: [
          'date'
        ],
        limit: 2,
        offset: (parseInt(page) - 1) * 2,
        include: [
          {
            model: UserModel,
            as: 'user',
            attributes: ['id', 'name']
          },
          {
            model: UserModel,
            as: 'provider',
            attributes: ['id', 'name'],
            include: [
              {
                model: FileModel,
                as: 'avatar',
                attributes: ['id', 'path', 'url']
              }
            ]
          }

        ]
      })

      return res.json(appointments)
    } catch (error) {
      return res.status(500).json({ error })
    }
  }

  async store (req: Request, res: Response) {
    const schema = Yup.object().shape({
      provider_id: Yup.number().required(),
      date: Yup.date().required()
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Validation fails'
      })
    }

    const { provider_id, date } = req.body

    const isProvider = await UserModel.findOne({
      where: {
        id: provider_id,
        provider: true
      }
    })

    if (!isProvider) {
      return res.status(401).json({
        error: 'Usuário não é um pestador de serviço'
      })
    }
    /**
     * parseISO transforma a string da hora em um objeto Date do javascript.
     *
     * startOfHour pega o início da hora. EX: 19:55 = 9:00.
     *
     * Checa se a data é passada.
     */
    const hourStart = startOfHour(parseISO(date))

    if (isBefore(hourStart, new Date())) {
      return res.status(400).json({ error: 'Data passada não é permitida' })
    }

    /**
     * Chega se não há agendamento no mesmo horário com mesmo prestador.
     * caso encontre, o horário não estará disponível.
     */
    const checkAvailability = await Appointment.findOne({
      where: {
        provider_id, // Id do prestador de serviço escolhido.
        canceled_at: null, // Se o agendamento estiver cancelado, a data estará disponível.
        date: hourStart // Se a hora for igual
      }
    })

    if (checkAvailability) {
      return res.status(400).json({ error: 'Horário não disponível' })
    }

    try {
      const appointment = await Appointment.create({
        user_id: req.userId,
        provider_id,
        date: hourStart// Evita agendamento em horas quebradas.
      })

      // Notify appointment provider

      const user = await UserModel.findByPk(req.userId)

      const formattedDate = format(hourStart, "'dia' dd 'de' MMMM', às' H:mm'h'", { locale: pt })

      await Notification.create({
        // eslint-disable-next-line quotes
        content: `Novo agendamento de ${user.name} para ${formattedDate}.`,
        user: provider_id// Qual usuário vai receber a notificação.
      })

      const dataNotification = {
        user: user.name,
        email: isProvider.email,
        date: formattedDate
      }

      await Queue.add(CreateAppointment_JOB.key, {
        dataNotification
      })

      return res.json(appointment)
    } catch (error) {
      return res.json(error)
    }
  }

  async delete (req: Request, res: Response) {
    const appointment = await Appointment.findByPk(req.params.id, {
      include: [
        {
          model: UserModel,
          as: 'provider',
          attributes: ['name', 'email']
        },
        {
          model: UserModel,
          as: 'user',
          attributes: ['name']
        }
      ]
    })

    if (!appointment) {
      return res.status(401).json({
        error: 'Não existe agendamento com esse id'
      })
    }

    if (appointment.user_id !== req.userId) { // Se não foi ele que marcou, ele não pode cancelar.
      return res.status(401).json({
        error: 'Você não tem permissão para cancelar esse agendamento.'
      })
    }

    const dateWithSub = subHours(appointment.date, 2)// Remove 2 horas.

    if (isBefore(dateWithSub, new Date())) {
      return res.status(401).json({
        error: 'Você só pode cancelar agendamentos com duas horas de antecesdência.'
      })
    }

    appointment.canceled_at = new Date()

    if (await appointment.save()) {
      await Queue.add(CancellationMail_JOB.key, {
        appointment
      })

      return res.json(appointment)
    } else {
      return res.status(500).json({
        error: 'Ocorreu um erro ao cancelar seu agendamento'
      })
    }
  }
}

export default new AppointmentController()
