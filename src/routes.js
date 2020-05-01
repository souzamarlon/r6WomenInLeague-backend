import { Router } from 'express';

import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import FriendshipController from './app/controllers/FriendshipController';

import SessionController from './app/controllers/SessionController';

import FileController from './app/controllers/FileController';

import R6PlayerInfoController from './app/controllers/R6PlayerInfoController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/sessions', SessionController.store);
routes.post('/users', UserController.store);

routes.post('/files', upload.single('file'), FileController.store);

// Admin features:
routes.use(authMiddleware);

routes.get('/users', UserController.index);
routes.put('/users', UserController.update);

routes.get('/friendship', FriendshipController.index);
routes.post('/friendship', FriendshipController.store);
routes.put('/friendship/:id', FriendshipController.update);

routes.get('/stats', R6PlayerInfoController.index);

export default routes;
