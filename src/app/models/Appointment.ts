import { Model, DataTypes, Optional } from 'sequelize'
import { isBefore, subHours } from 'date-fns'

import database from '../../database'
import UserModel from './User'

type TypeAppointment = {
  id: number,
  date: Date,
  user_id: number,
  provider_id: number,
  canceled_at: Date,
  past: String,
  cancelable: String
}

interface IAppointmentCreationAttributes extends Optional<TypeAppointment, 'id' | 'canceled_at' | 'user_id' | 'provider_id' | 'past' | 'cancelable'>{}

export interface IAppointmentModel extends Model<TypeAppointment, IAppointmentCreationAttributes>, TypeAppointment{}

const AppointmentModel = database.connection?.define<IAppointmentModel>('Appointment',
  {
    id: {
      type: DataTypes.NUMBER,
      autoIncrement: true,
      primaryKey: true
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false
    },
    user_id: {
      type: DataTypes.NUMBER,
      allowNull: false
    },
    provider_id: {
      type: DataTypes.NUMBER,
      allowNull: false
    },
    canceled_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    past: {
      type: DataTypes.VIRTUAL,
      get () { // Se a data de anterior a data atual. true se já passou, false se não.
        return isBefore(this.date, new Date())
      }
    },
    cancelable: {
      type: DataTypes.VIRTUAL,
      get () {
        return isBefore(new Date(), subHours(this.date, 2))
      }
    }
  },
  {
    timestamps: true
  }
)

AppointmentModel.belongsTo(UserModel, {
  foreignKey: 'user_id', as: 'user'
})

AppointmentModel.belongsTo(UserModel, {
  foreignKey: 'provider_id', as: 'provider'
})

/* AppointmentModel?.sync(
AppointmentModel?.sync({ force: true }) */

export default AppointmentModel
