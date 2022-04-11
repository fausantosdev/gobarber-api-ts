import ejs from 'ejs'
import { format, parseISO } from 'date-fns'
import pt from 'date-fns/locale/pt'
import { resolve } from 'path'

import Mail from '../../lib/Mail'

class CreateAppointment {
  get key () {
    return 'CreateAppointment'
  }

  async handle ({ data }) {
    const { dataNotification: dt } = data

    const viewsPath = resolve(__dirname, '..', 'views', 'emails')

    const dataMail = await ejs.renderFile(`${viewsPath}/createAppointment.ejs`, {
      user: dt.user,
      email: dt.email,
      date: dt.date
    })

    await Mail.sendMail({
      to: `${dt.user} <${dt.email}>`,
      subject: 'Novo agendamento!',
      // text: 'Você tem un novo cancelamento [2]',
      html: dataMail
    })
  }
}

export default new CreateAppointment()
