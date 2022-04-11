import Bee from 'bee-queue'

import CancellationMail from '../app/jobs/CancellationMail'
import CreateAppointment from '../app/jobs/CreateAppointment'

import redisConfig from '../config/redis'

const jobs = [
  CancellationMail,
  CreateAppointment
]

class Queue {
  queues: any// Todos os jobs são armazenados aeui.

  // OBS: uma fila diferente para cada background job.
  constructor () {
    this.queues = {}// Um objeto que receberá todas as filas.

    this.init()// Inicializa as filas.
  }

  async init () {
    jobs.forEach(({ key, handle }) => {
      //         [key: CancellationMail, key: CreateAppointment]
      this.queues[key] = {
        bee: new Bee(key, { // Instância do bee que conecta com o redis.
          redis: redisConfig
        }), // Ex: { CancellationMail: {queue, handle} }
        handle// Recebe as informações e executa os processos(EX: disparo de email, qualquer tarefa que precise ser feita em background)
      }
    })

    // console.log(this.queues)
  }

  // Adiciona novos jobs dentro da fila.
  add (queue, data) {
    return this.queues[queue].bee.createJob(data)
      .retries(3)
      .save()
  }

  // Processa as filas em tempo real.
  proccesQueue () {
    jobs.forEach(job => { // Job em sí.
      const { bee, handle } = this.queues[job.key]

      bee
        .on('failed', this.handleFailure)
        .on('succeeded', this.handleSuccess)
        .process(handle)
    })
  }

  handleFailure (job, error) {
    console.log(`Queue ${job.queue.name}: FAILE`, error)
  }

  handleSuccess (job) {
    console.log(`Queue ${job.queue.name}: SUCCESS`)
  }
}

export default new Queue()
