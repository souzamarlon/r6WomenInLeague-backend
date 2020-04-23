module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('friendships', 'expose_fake', {
      type: Sequelize.BOOLEAN,
      defaultValue: false,
      allowNull: true,
    });
  },

  down: (queryInterface) => {
    return queryInterface.removeColumn('friendships', 'expose_fake');
  },
};
