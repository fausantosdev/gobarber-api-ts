import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import * as Yup from 'yup'

import User from '../models/User'
import authConfig from '../../config/auth'

class SessionController {
  async store (req: Request, res: Response) { // Adicionar o YUP
    const { email, password } = req.body

    const schema = Yup.object().shape({
      email: Yup.string().email().required(),
      password: Yup.string().min(6).required()
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Faltam alguns dados'
      })
    }

    const emailExists = await User.findOne({ where: { email } })

    if (!emailExists) {
      return res.status(401).json({
        error: 'Usuário não encontrado'
      })
    }

    if (!(await bcrypt.compare(password, emailExists.password_hash))) {
      return res.status(401).json({
        error: 'Senha incorreta'
      })
    }

    const { id, name } = emailExists

    const { secret, expiresIn } = authConfig

    return res.json({
      user: {
        id,
        name,
        email
      },
      token: jwt.sign({ id }, secret, {
        expiresIn
      })
    })
  }
}

export default new SessionController()
