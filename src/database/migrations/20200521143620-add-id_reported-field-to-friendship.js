module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn('friendships', 'id_reported', {
      type: Sequelize.INTEGER,
      references: { model: 'users', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      allowNull: true,
    });
  },

  down: (queryInterface) => {
    return queryInterface.removeColumn('friendships', 'id_reported');
  },
};
