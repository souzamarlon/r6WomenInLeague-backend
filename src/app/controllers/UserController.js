import * as Yup from 'yup';
import { Op } from 'sequelize';
import User from '../models/User';
import Friendship from '../models/Friendship';

import Cache from '../../config/Cache';

class UserController {
  async index(req, res) {
    const {
      play_style,
      competition,
      ranked,
      times,
      page,
      per_page,
    } = req.query;
    const offset = (page - 1) * per_page;
    const limit = per_page;

    if (!play_style) {
      const cached = await Cache.get('allUsers');
      if (cached) {
        return res.json(cached);
      }

      const allUsers = await User.findAll({
        offset,
        limit,
        order: [['id', 'DESC']],
        where: {
          id: { [Op.ne]: req.userId },
          banned: false,
        },
        attributes: [
          'id',
          'name',
          'email',
          'uplay',
          'ranked',
          'competition',
          'times',
          'play_style',
          'discord_user',
          'region',
        ],
        include: [
          {
            model: Friendship,
            as: 'user',
            required: false,
            where: {
              user_friend: { [Op.ne]: req.userId },
            },
          },
          {
            model: Friendship,
            as: 'friend',
            required: false,
            where: {
              user_id: { [Op.ne]: req.userId },
            },
          },
        ],
      });

      await Cache.set('allUsers', allUsers);

      return res.json(allUsers);
    }

    const cached = await Cache.get('users');
    if (cached) {
      return res.json(cached);
    }

    const users = await User.findAll({
      offset,
      limit,
      order: [['id', 'DESC']],
      where: {
        play_style,
        competition,
        ranked,
        times,
        id: { [Op.ne]: req.userId },
        banned: false,
      },
      attributes: [
        'id',
        'name',
        'email',
        'uplay',
        'ranked',
        'competition',
        'times',
        'play_style',
        'discord_user',
        'region',
      ],
      include: [
        {
          model: Friendship,
          as: 'user',
          required: false,
          where: {
            user_friend: { [Op.ne]: req.userId },
          },
        },
        {
          model: Friendship,
          as: 'friend',
          required: false,
          where: {
            user_id: { [Op.ne]: req.userId },
          },
        },
      ],
    });

    return res.json(users);
  }

  async store(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string().required(),
      email: Yup.string().email().required(),
      password: Yup.string().required().min(6),
      region: Yup.string().required(),
    });
    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }
    const userExists = await User.findOne({ where: { email: req.body.email } });
    const uplayExists = await User.findOne({
      where: { uplay: req.body.uplay },
    });

    if (userExists) {
      return res
        .status(400)
        .json({ error: 'This email address is already used!' });
    }

    if (uplayExists) {
      return res
        .status(400)
        .json({ error: 'This Uplay Nickname is already used!' });
    }

    const {
      name,
      email,
      uplay,
      ranked,
      competition,
      times,
      play_style,
      region,
    } = await User.create(req.body);

    return res.json({
      name,
      email,
      uplay,
      ranked,
      competition,
      times,
      play_style,
      region,
    });
  }

  async update(req, res) {
    const schema = Yup.object().shape({
      name: Yup.string(),
      email: Yup.string().email(),
      uplay: Yup.string(),
      ranked: Yup.boolean(),
      competition: Yup.boolean(),
      times: Yup.string(),
      play_style: Yup.string(),
      discord_user: Yup.string(),
      oldPassword: Yup.string().min(6),
      password: Yup.string()
        .min(6)
        .when('oldPassword', (oldPassword, field) =>
          oldPassword ? field.required() : field
        ),
      confirmPassword: Yup.string().when('password', (password, field) =>
        password ? field.required().oneOf([Yup.ref('password')]) : field
      ),
    });

    if (!(await schema.isValid(req.body))) {
      return res.status(400).json({ error: 'Validation fails' });
    }

    const { email, uplay, oldPassword } = req.body;
    const user = await User.findByPk(req.userId);

    if (email !== user.email) {
      const userExists = await User.findOne({
        where: { email },
      });

      if (userExists) {
        return res
          .status(400)
          .json({ error: 'This email address is already used!' });
      }
    }

    if (uplay !== user.uplay) {
      const uplayExists = await User.findOne({
        where: { uplay },
      });

      if (uplayExists) {
        return res
          .status(400)
          .json({ error: 'This Uplay Nickname is already used!' });
      }
    }

    if (oldPassword && !(await user.checkPassword(oldPassword))) {
      return res.status(401).json({ error: 'Password does not match!' });
    }

    const { id, name } = await user.update(req.body);
    return res.json({
      id,
      name,
      email,
      uplay,
    });
  }
}

export default new UserController();
