import nodemailer from 'nodemailer'

import mailConfig from '../config/mail'

class Mail {
  transporter: any
  data: any

  constructor () {
    const { host, port, secure, auth } = mailConfig
    this.transporter = nodemailer.createTransport({ host, port, secure, auth: auth.user ? auth : null })

    // this.configureTemplates()
  }

  async configureTemplates () {
    // const viewsPath = resolve(__dirname, '..', 'app', 'views', 'emails')

    /* ejs.openDelimiter = '{{'
    ejs.closeDelimiter = '}}' */

    /* this.data = await ejs.renderFile(`${viewsPath}/cancelation.ejs`, {
      teste: 'Este é um teste'
    }) */
  }

  sendMail (messsage) {
    return this.transporter.sendMail({
      ...mailConfig.default,
      ...messsage
    })
  }
}

export default new Mail()
