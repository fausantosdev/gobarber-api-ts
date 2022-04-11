import { Model, DataTypes, Optional } from 'sequelize'
import bcrypt from 'bcryptjs'

import database from '../../database'

import File from './File'

type TypeUser = {
  id: number,
  name: string,
  email: string,
  password: string
  password_hash: string,
  provider: boolean,
}

interface IUserCreationAttributes extends Optional<TypeUser, 'id' | 'provider' | 'password_hash'>{}

export interface IUserModel extends Model<TypeUser, IUserCreationAttributes>, TypeUser{}

const UserModel = database.connection?.define<IUserModel>('User',
  {
    id: {
      type: DataTypes.NUMBER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(20),
      unique: true,
      allowNull: false
    },
    password: {
      type: DataTypes.VIRTUAL
    },
    password_hash: {
      type: DataTypes.STRING(255)
      // allowNull: false
    },
    provider: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    }
  },
  {
    timestamps: true,
    hooks: {
      beforeSave: async (user: any) => {
        if (user.password) {
          user.password_hash = await bcrypt.hash(user.password, 8)
        }
      }
    }
  }
)

UserModel.belongsTo(File, {
  foreignKey: 'avatar_id', as: 'avatar'
})

/* UserModel?.sync(
UserModel?.sync({ force: true }) */

export default UserModel
