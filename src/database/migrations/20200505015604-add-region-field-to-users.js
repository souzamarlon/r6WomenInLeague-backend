module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('users', 'region', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: (queryInterface) => {
    return queryInterface.removeColumn('users', 'region');
  },
};
