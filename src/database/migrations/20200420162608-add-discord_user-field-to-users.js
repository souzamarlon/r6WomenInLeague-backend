module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('users', 'discord_user', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  down: (queryInterface) => {
    return queryInterface.removeColumn('users', 'discord_user');
  },
};
