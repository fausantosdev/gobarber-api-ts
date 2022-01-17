import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { promisify } from 'util'

import authConfig from '../../config/auth'

export default async (req: Request, res: Response, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader) {
    return res.status(401).json({
      error: 'Token não enviado'
    })
  }

  const [, token] = authHeader.split(' ')

  try {
    const decoded = await promisify(jwt.verify)(token, authConfig.secret)

    req.userId = decoded.id

    console.log(decoded)
  } catch (error) {
    return res.status(401).json({
      error
    })
  }

  return next()
}
