import jwt from 'jsonwebtoken';
import { promisify } from 'util';

import User from '../models/User';

import authConfig from '../../config/auth';

export default async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Token not provided!' });
  }

  const [, token] = authHeader.split(' ');

  try {
    const decoded = await promisify(jwt.verify)(token, authConfig.secret);

    // exp is a time in Unix
    req.userId = decoded.id;

    const { banned } = await User.findByPk(req.userId);

    if (banned) {
      return res.status(401).json({ error: 'User was banned!' });
    }

    return next();
  } catch (err) {
    return res.status(401).json({ error: 'Token invalid!' });
  }
};
