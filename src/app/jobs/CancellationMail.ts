import ejs from 'ejs'
import { format, parseISO } from 'date-fns'
import pt from 'date-fns/locale/pt'
import { resolve } from 'path'

import Mail from '../../lib/Mail'

class CancellationMail {
  get key () { // Chave única do job.
    return 'CancellationMail'
  }

  async handle ({ data }) { // A tarefa que vai executar quando o processo for executado.
    const { appointment } = data

    const viewsPath = resolve(__dirname, '..', 'views', 'emails')

    const dataMail = await ejs.renderFile(`${viewsPath}/cancelationMail.ejs`, {
      provider: appointment.provider.name,
      user: appointment.user.name,
      date: format(parseISO(appointment.date), "'dia' dd 'de' MMMM', às' H:mm'h'", { locale: pt })
    })

    await Mail.sendMail({
      to: `${appointment.provider.name} <${appointment.provider.email}>`,
      subject: 'Agendamento cancelado [1.2]',
      // text: 'Você tem un novo cancelamento [2]',
      html: dataMail
    })
  }
}

export default new CancellationMail()
