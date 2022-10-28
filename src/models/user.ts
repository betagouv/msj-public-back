import { DataTypes } from 'sequelize'
import { Table, Column, Model } from 'sequelize-typescript'

@Table
export default class User extends Model {
  @Column({ type: DataTypes.STRING, allowNull: true })
    firstName: string | undefined

  @Column({ type: DataTypes.STRING, allowNull: true })
    lastName: string | undefined

  @Column({ type: DataTypes.STRING, allowNull: false, unique: true })
    phone!: string

  @Column({ type: DataTypes.INTEGER, allowNull: false, unique: true })
    msjId!: number

  @Column({ type: DataTypes.STRING, allowNull: true })
    password: string | undefined

  @Column({ type: DataTypes.STRING, allowNull: true })
    invitationToken: string | undefined
}
