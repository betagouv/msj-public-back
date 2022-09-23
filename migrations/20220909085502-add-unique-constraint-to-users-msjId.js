'use strict'

module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface
      .addConstraint('Users', {
        type: 'UNIQUE',
        fields: ['msjId'],
        name: 'unique_user_msd_id'
      })
  },

  async down (queryInterface, Sequelize) {
    queryInterface.removeConstraint('Users', 'unique_user_msd_id')
  }
}
