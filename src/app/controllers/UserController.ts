import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import * as Yup from 'yup'

import User from '../models/User'

class UserController {
  async store (req: Request, res: Response) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().email().required(),
      password: Yup.string().min(6).required()
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Faltam alguns dados'
      })
    }

    const emailExists = await User.findOne({ where: { email: req.body.email } })

    if (emailExists) {
      return res.status(400).json({
        error: 'Email já cadastrado'
      })
    }

    const { name, email, password_hash } = await User.create(req.body)

    return res.json({
      name,
      email,
      password_hash
    })
  }

  async update (req: Request, res: Response) {
    const { email, oldPassword } = req.body

    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      oldPassword: Yup.string().min(6),
      password: Yup.string().min(6).when('oldPassword', (oldPassword, field) => {
        return oldPassword ? field.required() : field
      }),
      confirmPassword: Yup.string().when('password', (password, field) => {
        return password ? field.required().oneOf([Yup.ref('password')]) : field
      })
    })

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({
        error: 'Faltam alguns dados'
      })
    }

    const userExists = await User.findByPk(req.userId)

    if (email && email !== userExists.email) {
      const emailExists = await User.findOne({ where: { email } })

      if (emailExists) {
        return res.status(400).json({
          error: 'Email já cadastrado'
        })
      }
    }

    if (oldPassword && !(await bcrypt.compare(oldPassword, userExists.password_hash))) {
      return res.status(401).json({
        error: 'Senha incorreta'
      })
    }

    const { id, name, provider } = await userExists.update(req.body)

    return res.json({
      id,
      name,
      email,
      provider
    })
  }
}

export default new UserController()
