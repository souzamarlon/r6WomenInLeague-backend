import { Router } from 'express';

import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import FriendshipController from './app/controllers/FriendshipController';

import SessionController from './app/controllers/SessionController';

import FileController from './app/controllers/FileController';

import R6PlayerInfoController from './app/controllers/R6PlayerInfoController';
import ChatController from './app/controllers/ChatController';

import authMiddleware from './app/middlewares/auth';

import validateUserStore from './app/validators/UserStore';
import validateUserUpdate from './app/validators/UserUpdate';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/sessions', SessionController.store);
routes.post('/users', validateUserStore, UserController.store);

routes.post('/files', upload.single('file'), FileController.store);
routes.get('/stats', R6PlayerInfoController.index);

// Admin features:
routes.use(authMiddleware);

routes.get('/users', UserController.index);
routes.put('/users', validateUserUpdate, UserController.update);

routes.get('/friendship', FriendshipController.index);
routes.post('/friendship/:id', FriendshipController.store);
routes.put('/friendship/:id', FriendshipController.update);
routes.delete('/friendship/:id', FriendshipController.delete);

routes.post('/chat/:id', ChatController.store);

export default routes;
