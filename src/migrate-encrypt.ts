
import User from './models/user';
import sequelize from './models';

console.log("ENCRYPTION_KEY:", process.env.ENCRYPTION_KEY);
console.log("HMAC_KEY:", process.env.HMAC_KEY);
console.log("IV_LENGTH:", process.env.IV_LENGTH);

(async () => {
  try {
    console.log("ENCRYPTION_KEY:", process.env.ENCRYPTION_KEY);
    console.log("HMAC_KEY:", process.env.HMAC_KEY);
    console.log("IV_LENGTH:", process.env.IV_LENGTH);

    await sequelize.sync();
    // Récupérer tous les utilisateurs existants
    const users = await User.findAll();

    // Parcourir chaque utilisateur et mettre à jour les valeurs chiffrées
    for (const user of users) {
      const updateData: Partial<User> = {};

      // Chiffrer le prénom si présent
      if (user.firstName) {
        updateData.firstName = User.encrypt(user.firstName);
      }

      // Chiffrer le nom de famille si présent
      if (user.lastName) {
        updateData.lastName = User.encrypt(user.lastName);
      }

      // Chiffrer et hacher le numéro de téléphone si présent
      if (user.phone) {
        const encryptedPhone = User.encrypt(user.phone);
        updateData.phone = encryptedPhone;
        updateData.phoneHash = User.generatePhoneHash(encryptedPhone);
      }

      // Mettre à jour l'utilisateur dans la base de données
      await User.update(updateData, { where: { id: user.id } });
    }

    console.log('Migration terminée avec succès !');
  } catch (error) {
    console.error('Erreur pendant la migration :', error);
  }
})();
