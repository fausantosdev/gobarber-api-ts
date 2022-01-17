import { Sequelize } from 'sequelize'
import databaseConfigs from '../config/database'
import { Mongoose, connect } from 'mongoose'

class Database {
  connection: Sequelize | null
  auth: any
  mongodb: Mongoose

  constructor () {
    this.connection = null
    this.auth = databaseConfigs
    this.init()
    this.initMongo()
  }

  async init () {
    this.connection = new Sequelize(this.auth.development)

    try {
      await this.connection.authenticate()
      console.log('Connection has been established successfully.')
    } catch (error) {
      console.error('Unable to connect to the database:', error)
    }
  }

  async initMongo () {
    try {
      this.mongodb = await connect('mongodb://localhost:27017/gobarber_db',
        {
          useNewUrlParser: true,
          useFindAndModify: true,
          useUnifiedTopology: true
        })

      this.mongodb.connection

      console.log('Mongo connected')
    } catch (error) {
      console.log(`Mongo error: ${error}`)
    }
  }
}

export default new Database()
