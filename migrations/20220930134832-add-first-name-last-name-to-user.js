'use strict'

module.exports = {
  async up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn('Users', 'firstName', {
          type: Sequelize.DataTypes.STRING
        }, { transaction: t }),
        queryInterface.addColumn('Users', 'lastName', {
          type: Sequelize.DataTypes.STRING
        }, { transaction: t })
      ])
    })
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn('Users', 'firstName', { transaction: t }),
        queryInterface.removeColumn('Users', 'lastName', { transaction: t })
      ])
    })
  }
}
