import { Router } from 'express';

import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import FriendshipController from './app/controllers/FriendshipController';

import SessionController from './app/controllers/SessionController';

import FileController from './app/controllers/FileController';

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

routes.post('/friendship', FriendshipController.store);
routes.put('/friendship/:id', FriendshipController.update);

export default routes;
