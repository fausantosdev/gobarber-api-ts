import { Model, DataTypes, Optional } from 'sequelize'

import database from '../../database'

type TypeFile = {
  name: string,
  path: string,
  url: string
}

interface IFileCreationAttributes extends Optional<TypeFile, 'url'>{}

export interface IFileModel extends Model<TypeFile, IFileCreationAttributes>, TypeFile{}

const FileModel = database.connection?.define<IFileModel>('File',
  {
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    path: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    url: {
      type: DataTypes.VIRTUAL,
      get () : string {
        return `http://localhost:3333/files/${this.path}`
      }

    }
  },
  {
    timestamps: true
  }
)

/* FileModel?.sync(
FileModel?.sync({ force: true }) */

export default FileModel
