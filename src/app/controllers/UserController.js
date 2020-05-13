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

    // This If it will return all the users in the Dashboard page.
    if (!play_style) {
      //   const cached = await Cache.get('allUsers');
      //   if (cached) {
      //     return res.json(cached);
      //   }

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
            attributes: ['user_id', 'user_friend', 'accepted', 'expose_fake'],
            // where: {
            //   user_friend: { [Op.ne]: req.userId },
            // },
          },
          {
            model: Friendship,
            as: 'friend',
            required: false,
            attributes: ['user_id', 'user_friend', 'accepted', 'expose_fake'],
            // where: {
            //   user_id: { [Op.ne]: req.userId },
            // },
          },
        ],
      });

      // await Cache.set('allUsers', allUsers);

      // user_id = Armazena o usuário que enviou a solicitação e user_friend armazena o usuário que recebeu a solicitação.
      const { userId } = req;

      // Find the friends which userId added and removed from the array.
      allUsers.filter(async function test(x) {
        x.user.forEach((value) =>
          value.user_friend === userId
            ? allUsers.splice(
                allUsers.findIndex((v) => v.id === value.user_id),
                1
              )
            : null
        );
      });

      // Find the friends which added your userId and removed from the array.
      allUsers.filter(async function test2(x) {
        x.friend.forEach((value) =>
          value.user_id === userId
            ? allUsers.splice(
                allUsers.findIndex((v) => v.id === value.user_friend),
                1
              )
            : null
        );
      });

      return res.json(allUsers);
    }

    // It will return the users based on the queries. This users will appear in the search page.

    // const cacheKey = `play_style:${play_style}:users${page}`;
    // const cached = await Cache.get(cacheKey);

    // if (cached) {
    //   return res.json(cached);
    // }

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

    // await Cache.set(cacheKey, users);

    return res.json(users);
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

    if (uplay) {
      await Cache.invalidate('allUsers');
    }

    // It will delete all the keys when it has a new user
    // Its not working yet
    // await Cache.invalidatePrefix(`play_style:${play_style}:users`);

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
