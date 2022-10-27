import {
  Table,
  Column,
  Model,
  Unique,
  AllowNull,
  CreatedAt,
  UpdatedAt,
  DeletedAt
} from 'sequelize-typescript'

@Table
export default class User extends Model {
  @Column
  @AllowNull
    firstName: string | undefined

  @Column
  @AllowNull
    lastName: string | undefined

  @Column
  @Unique
    phone!: string

  @Column
  @Unique
    msjId!: number

  @Column
  @AllowNull
    password: string | undefined

  @Column
  @AllowNull
    invitationToken: string | undefined

  @CreatedAt
    creationDate!: Date

  @UpdatedAt
  @AllowNull
    updatedOn: Date | undefined

  @DeletedAt
  @AllowNull
    deletionDate: Date | undefined
}
