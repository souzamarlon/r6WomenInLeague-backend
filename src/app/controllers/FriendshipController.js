import { Op } from 'sequelize';
import Friendship from '../models/Friendship';
import User from '../models/User';
import Cache from '../../config/Cache';

class FriendshipController {
  async index(req, res) {
    const { accepted, page, per_page } = req.query;
    const offset = (page - 1) * per_page;
    const limit = per_page;

    const user_id = req.userId;

    if (accepted) {
      const friendList = await Friendship.findAll({
        offset,
        limit,
        order: [['id', 'ASC']],
        where: {
          accepted,
          expose_fake: false,
          [Op.or]: [{ user_id: req.userId }, { user_friend: req.userId }],
        },
        include: [
          {
            model: User,
            as: 'user',
            required: false,
            where: {
              banned: false,
            },
            attributes: [
              'id',
              'name',
              'uplay',
              'ranked',
              'competition',
              'times',
              'play_style',
              'discord_user',
              'region',
            ],
          },
          {
            model: User,
            as: 'friend',
            required: false,
            where: {
              banned: false,
            },
            attributes: [
              'id',
              'name',
              'uplay',
              'ranked',
              'competition',
              'times',
              'play_style',
              'discord_user',
              'region',
            ],
          },
        ],
      });
      // const targetSocket = req.connectedUsers[id];

      const statusAdded = friendList.map((data) => ({
        id: data.id,
        user_id: data.user_id,
        user_friend: data.user_friend,
        user: data.user,
        friend: data.friend,
        status:
          data.user_id === user_id
            ? !!req.connectedUsers[data.user_friend]
            : !!req.connectedUsers[data.user_id],
      }));

      return res.json(statusAdded);
    }

    const friendList = await Friendship.findAll({
      offset,
      limit,
      order: [['id', 'ASC']],
      where: {
        accepted: false,
        expose_fake: false,
        [Op.or]: [{ user_id: req.userId }, { user_friend: req.userId }],
      },
      include: [
        {
          model: User,
          as: 'user',
          required: false,
          where: {
            banned: false,
          },
          attributes: [
            'id',
            'name',
            'uplay',
            'ranked',
            'competition',
            'times',
            'play_style',
            'discord_user',
            'region',
          ],
        },
        {
          model: User,
          as: 'friend',
          required: false,
          where: {
            banned: false,
          },
          attributes: [
            'id',
            'name',
            'uplay',
            'ranked',
            'competition',
            'times',
            'play_style',
            'discord_user',
            'region',
          ],
        },
      ],
    });

    return res.json(friendList);
  }

  async store(req, res) {
    const user_id = req.userId;
    const user_friend = req.params.id;

    const friendRequested = await Friendship.findAll({
      where: {
        user_friend: { [Op.or]: [req.userId, user_friend] },
        user_id: { [Op.or]: [req.userId, user_friend] },
      },
    });

    const { play_style } = await User.findByPk(user_friend);

    if (user_friend === req.userId) {
      return res
        .status(400)
        .json({ error: 'You can not send friend request to yourself.' });
    }

    if (friendRequested.length) {
      return res
        .status(400)
        .json({ error: 'You already have a friend request' });
    }

    const friendCreated = await Friendship.create({ user_id, user_friend });

    await Cache.invalidatePrefix(`user:${user_id}`);
    await Cache.invalidatePrefix(`user:${user_friend}`);
    await Cache.invalidatePrefix(`play_style:${play_style}`);

    return res.json(friendCreated);
  }

  async update(req, res) {
    const findFriend = await Friendship.findByPk(req.params.id);

    const { expose_fake, id_reported } = req.body;

    // It will check if this user received a report.
    if (expose_fake) {
      const findReports = await Friendship.findAll({
        where: {
          id_reported,
        },
      });

      // If this user already 4 reports, it will receive a ban in the fifth report.
      if (findReports.length >= 4) {
        const userReported = await User.findByPk(id_reported);

        const {
          id,
          name,
          play_style,
          uplay,
          banned,
        } = await userReported.update({
          banned: true,
        });

        // It will update the table friendship with last report.
        await findFriend.update(req.body);

        // The cache will be deleted
        await Cache.invalidatePrefix('user');
        await Cache.invalidatePrefix(`play_style:${play_style}`);

        return res.json({ id, name, play_style, uplay, banned });
      }
    }

    const { accepted } = await findFriend.update(req.body);

    return res.json({ accepted, expose_fake, id_reported });
  }

  async delete(req, res) {
    const { id } = req.params;

    const findFriend = await Friendship.findByPk(id);

    const deleted = await findFriend.destroy();

    return res.json(deleted);
  }
}

export default new FriendshipController();
