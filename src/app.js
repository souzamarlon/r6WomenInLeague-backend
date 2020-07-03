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

class App {
  constructor() {
    this.server = express();

    this.app = http.createServer(this.server);
    this.io = socketIo(this.app);

    // Sentry.init(sentryConfig);
    this.socketIo();
    this.middleware();
    this.routes();
    this.exceptionHandler();
  }

  middleware() {
    // this.server.use(Sentry.Handlers.requestHandler());
    this.server.use(cors());

    this.server.use(express.json());
    this.server.use(
      '/files',
      express.static(path.resolve(__dirname, '..', 'tmp', 'uploads'))
    );
  }

  routes() {
    this.server.use(routes);
    // this.server.use(Sentry.Handlers.errorHandler());
  }

  socketIo() {
    this.io.on('connection', (socket) => {
      const { user } = socket.handshake.query;

      connectedUsers[user] = socket.id;

      // socket.on('sendMessage', (data) => {
      //   console.log(data);
      // });
    });

    this.server.use((req, res, next) => {
      req.io = this.io;
      req.connectedUsers = connectedUsers;

      return next();
    });
  }

  exceptionHandler() {
    this.server.use(async (err, req, res, next) => {
      if (process.env.NODE_ENV === 'development') {
        const errors = await new Youch(err, req).toJSON();

        return res.status(500).json(errors);
      }

      return res.status(500).json({ error: 'internal server error' });
    });
  }
}

export default new App().app;
