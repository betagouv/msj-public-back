'use strict'

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Users', 'phoneHash', {
      type: Sequelize.STRING,
      allowNull: true, // Permettre temporairement les valeurs nulles pour les enregistrements existants
    })
  },
  down: async (queryInterface) => {
    await queryInterface.removeColumn('Users', 'phoneHash')
  },
}
