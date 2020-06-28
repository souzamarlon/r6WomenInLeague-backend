import Sequelize from 'sequelize';
import mongoose from 'mongoose';
import User from '../app/models/User';
import Friendship from '../app/models/Friendship';

import File from '../app/models/File';

import databaseConfig from '../config/database';

const models = [User, File, Friendship];

class Database {
  constructor() {
    // Using connection string URI:
    if (process.env.DATABASE_URL) {
      this.connection = new Sequelize(process.env.DATABASE_URL, {
        dialect: 'postgres',
        define: {
          timestamps: true,
          underscored: true,
          underscoredALL: true,
        },
      });
    } else {
      // Use this connection if you are not using connection string URI
      this.connection = new Sequelize(databaseConfig);
    }

    this.init();
    this.associate();
    this.mongo();
  }

  init() {
    models.forEach((model) => model.init(this.connection));
  }

  associate() {
    models.forEach((model) => {
      if (model.associate) {
        model.associate(this.connection.models);
      }
    });
  }

  mongo() {
    this.mongoConnection = mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useFindAndModify: true,
      useUnifiedTopology: true,
    });
  }
}

export default new Database();
