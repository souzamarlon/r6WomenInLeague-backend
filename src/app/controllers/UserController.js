import { Op } from 'sequelize';
import User from '../models/User';
import Friendship from '../models/Friendship';

import Cache from '../../config/Cache';

class UserController {
  async index(req, res) {
    // console.log(req.io, req.connectedUsers);
    const {
      play_style,
      competition,
      ranked,
      times,
      page,
      per_page,
    } = req.query;
    const offset = (page - 1) * per_page;
    const limit = page * per_page;

    // user_id = Armazena o usuário que enviou a solicitação e user_friend armazena o usuário que recebeu a solicitação.
    const { userId } = req;

    // This "If" it will return all the users.
    if (!play_style) {
      // It will create a cache with all the users available to logged user.
      const cacheKeyAllUsers = `user:${req.userId}:AllUsers${page}`;

      // It will get the keys based on the cacheKeyAllUsers.
      const cached = await Cache.get(cacheKeyAllUsers);

      // If the key exists it will return the cache saved.
      if (cached) {
        return res.json(cached);
      }

      const allUsers = await User.findAll({
        // offset,
        // limit,
        order: [['id', 'DESC']],
        where: {
          id: { [Op.ne]: userId },
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
            attributes: ['user_id', 'user_friend', 'accepted', 'expose_fake'],
            where: {
              user_friend: { [Op.eq]: req.userId },
            },
          },
          {
            model: Friendship,
            as: 'friend',
            required: false,
            attributes: ['user_id', 'user_friend', 'accepted', 'expose_fake'],
            where: {
              user_id: { [Op.eq]: req.userId },
            },
          },
        ],
      });

      const filterUsers = allUsers.filter(function (entry) {
        return entry.friend.length || entry.user.length ? null : entry;
      });

      const getUsersByPage = filterUsers.slice(offset, limit);

      // It will save the cache in the redis database
      await Cache.set(cacheKeyAllUsers, getUsersByPage);

      return res.json(getUsersByPage);
    }

    // It will return the users based on the queries. This users will appear in the search page.

    const cacheKey = `play_style:${play_style}:competition:${competition}:ranked:${ranked}:times:${times}:users${page}`;

    // It will get the keys based on the cacheKey.
    const cached = await Cache.get(cacheKey);

    // If the key exists it will return the cache saved.
    if (cached) {
      return res.json(cached);
    }

    const users = await User.findAll({
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
            user_friend: { [Op.eq]: req.userId },
          },
        },
        {
          model: Friendship,
          as: 'friend',
          required: false,
          where: {
            user_id: { [Op.eq]: req.userId },
          },
        },
      ],
    });

    const filterSearchUsers = users.filter(function (entry) {
      return entry.friend.length || entry.user.length ? null : entry;
    });

    const getUsersByPage = filterSearchUsers.slice(offset, limit);

    await Cache.set(cacheKey, getUsersByPage);

    return res.json(getUsersByPage);
  }

  async store(req, res) {
    const userExists = await User.findOne({ where: { email: req.body.email } });
    const uplayExists = await User.findOne({
      where: { uplay: req.body.uplay },
    });

    if (userExists) {
      // throw new Error('This email address is already used!');
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

    // It will delete all the keys when it has a new user.

    if (uplay) {
      await Cache.invalidatePrefix('user');
      await Cache.invalidatePrefix(`play_style:${play_style}`);
    }

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
    const {
      email,
      uplay,
      ranked,
      competition,
      times,
      play_style,
      oldPassword,
    } = req.body;

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

    if (
      play_style !== user.play_style ||
      ranked !== user.ranked ||
      competition !== user.competition ||
      times !== user.times
    ) {
      await Cache.invalidatePrefix(
        `play_style:${play_style}:competition:${competition}:ranked:${ranked}:times:${times}`
      );
      await Cache.invalidatePrefix(
        `play_style:${user.play_style}:competition:${user.competition}:ranked:${user.ranked}:times:${user.times}`
      );
    }

    const { id, name, discord_user, region } = await user.update(req.body);

    return res.json({
      id,
      name,
      email,
      uplay,
      discord_user,
      ranked,
      competition,
      times,
      play_style,
      region,
    });
  }
}

export default new UserController();
