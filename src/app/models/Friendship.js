import Sequelize, { Model } from 'sequelize';

class Friendship extends Model {
  static init(sequelize) {
    super.init(
      {
        accepted: Sequelize.BOOLEAN,
        expose_fake: Sequelize.BOOLEAN,
      },
      {
        sequelize,
      }
    );

    return this;
  }

  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'user_id', as: 'user' });
    this.belongsTo(models.User, {
      foreignKey: 'user_friend',
      as: 'friend',
    });
  }
}

export default Friendship;
