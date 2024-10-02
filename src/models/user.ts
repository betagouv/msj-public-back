import { DataTypes } from 'sequelize';
import { Table, Column, Model, BeforeCreate, BeforeUpdate, AfterFind } from 'sequelize-typescript';
import * as crypto from 'crypto';

@Table
export default class User extends Model {
  @Column({ type: DataTypes.STRING, allowNull: true })
  firstName: string | undefined;

  @Column({ type: DataTypes.STRING, allowNull: true })
  lastName: string | undefined;

  @Column({ type: DataTypes.STRING, allowNull: false, unique: true })
  phone!: string; // Stocke le numéro de téléphone chiffré

  @Column({ type: DataTypes.STRING, allowNull: true, unique: true })
  phoneHash: string | undefined; // Stocke le HMAC du numéro de téléphone brut

  @Column({ type: DataTypes.STRING, allowNull: true })
  password: string | undefined;

  @Column({ type: DataTypes.STRING, allowNull: true })
  invitationToken: string | undefined;

  @Column({ type: DataTypes.INTEGER, allowNull: false, unique: true })
  msjId!: number

  static hmacKey = process.env.HMAC_KEY;

  static encryptionKey = Buffer.from(process.env.ENCRYPTION_KEY!, 'hex');
  static ivLength = parseInt(process.env.IV_LENGTH!, 10);

  // Fonction pour chiffrer le téléphone
  static encrypt(text: string) {
    if (!User.encryptionKey) {
      throw new Error('ENCRYPTION_KEY is not defined in the environment variables.');
    }
    if (!User.ivLength) {
      throw new Error('IV_LENGTH is not defined in the environment variables.');
    }
    const iv = crypto.randomBytes(User.ivLength);
    const cipher = crypto.createCipheriv('aes-256-cbc', User.encryptionKey, iv);
    let encrypted = cipher.update(text, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
  }

  static decrypt(text: string) {
    if (!User.encryptionKey) {
      throw new Error('ENCRYPTION_KEY is not defined in the environment variables.');
    }

    const parts = text.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = Buffer.from(parts[1], 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(User.encryptionKey), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }

  // Fonction pour générer le HMAC du numéro de téléphone
  static generatePhoneHash(plainPhone: string) {
    if (!User.hmacKey) {
      throw new Error('HMAC_KEY is not defined in the environment variables.');
    }
    return crypto.createHmac('sha256', User.hmacKey).update(plainPhone).digest('hex');
  }

  // Chiffrement des colonnes avant création ou mise à jour
  @BeforeCreate
  // @BeforeUpdate
  static encryptSensitiveData(instance: User) {
    if (instance.firstName) {
      instance.firstName = User.encrypt(instance.firstName);
    }
    if (instance.lastName) {
      instance.lastName = User.encrypt(instance.lastName);
    }
    if (instance.phone) {
      // Générer le HMAC du numéro de téléphone brut
      instance.phoneHash = User.generatePhoneHash(instance.phone);

      // Chiffrer le numéro de téléphone
      instance.phone = User.encrypt(instance.phone);
    }
  }
  // Déchiffrement des colonnes après lecture
  @AfterFind
  static decryptSensitiveData(instance: User | User[]) {
    if (Array.isArray(instance)) {
      instance.forEach((user) => User.decryptFields(user));
    } else if (instance) {
      User.decryptFields(instance);
    }
  }
  private static decryptFields(user: User) {
    if (user.firstName) {
      user.firstName = User.decrypt(user.firstName);
    }
    if (user.lastName) {
      user.lastName = User.decrypt(user.lastName);
    }
    if (user.phone) {
      user.phone = User.decrypt(user.phone);
    }
  }
}