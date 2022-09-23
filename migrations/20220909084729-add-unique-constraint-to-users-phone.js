'use strict'

module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface
      .addConstraint('Users', {
        type: 'UNIQUE',
        fields: ['phone'],
        name: 'unique_user_phone'
      })
  },

  async down (queryInterface, Sequelize) {
    queryInterface.removeConstraint('Users', 'unique_user_phone')
  }
}
