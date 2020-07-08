import 'dotenv/config';
import express from 'express';
import http from 'http';
import socketIo from 'socket.io';

import Youch from 'youch';
// import * as Sentry from '@sentry/node';
import path from 'path';
import cors from 'cors';
// import { io, connectedUsers } from './socketio';

import 'express-async-errors';

import routes from './routes';

// import sentryConfig from './config/sentry';

import './database';

const connectedUsers = {};
const friendSocket = {};

class App {
  constructor() {
    this.app = express();

    this.server = http.createServer(this.app);
    this.io = socketIo(this.server);

    // Sentry.init(sentryConfig);

    this.middleware();
    this.socketIo();
    this.routes();
    this.exceptionHandler();
  }

  middleware() {
    // this.app.use(Sentry.Handlers.requestHandler());
    this.app.use(cors());

    this.app.use(express.json());
    this.app.use(
      '/files',
      express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
    );
  }

  routes() {
    this.app.use(routes);
    // this.app.use(Sentry.Handlers.errorHandler());
  }

  socketIo() {
    this.io.on('connection', (socket) => {
      const { user } = socket.handshake.query;

      connectedUsers[user] = socket.id;

      socket.on('disconnect', () => {
        if (connectedUsers[user] === socket.id) {
          delete connectedUsers[user];
        }
      });
    });

    this.app.use((req, res, next) => {
      req.io = this.io;
      req.connectedUsers = connectedUsers;

      return next();
    });
  }

  exceptionHandler() {
    this.app.use(async (err, req, res, next) => {
      if (process.env.NODE_ENV === 'development') {
        const errors = await new Youch(err, req).toJSON();

        return res.status(500).json(errors);
      }

      return res.status(500).json({ error: 'internal server error' });
    });
  }
}

export default new App().server;
