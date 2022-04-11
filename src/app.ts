import express, { Express } from 'express'
import path from 'path'

import routes from './routes'

class App {
    server: Express
    connection: any

    constructor () {
      this.server = express()
      this.middlewares()
      this.routes()
      // this.isConnected()
      // this.connection = database.connection
    }

    middlewares () {
      this.server.use(express.json())

      // this.server.use('view engine', 'ejs')

      this.server.use('/files', express.static(path.resolve(__dirname, '..', 'tmp', 'uploads')))
    }

    routes () {
      this.server.use(routes)
    }
}

export default new App().server
