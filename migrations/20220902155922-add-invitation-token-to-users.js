'use strict'

module.exports = {
  up (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.addColumn('Users', 'invitationToken', {
          type: Sequelize.DataTypes.STRING
        }, { transaction: t })
      ])
    })
  },

  down (queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(t => {
      return Promise.all([
        queryInterface.removeColumn('Users', 'invitationToken', { transaction: t })
      ])
    })
  }
}
