import { Op } from 'sequelize';
import Friendship from '../models/Friendship';
import User from '../models/User';

class FriendshipController {
  async index(req, res) {
    const { accepted, page, per_page } = req.query;
    const offset = (page - 1) * per_page;
    const limit = per_page;

    if (accepted) {
      const friendList = await Friendship.findAll({
        offset,
        limit,
        order: [['id', 'ASC']],
        where: {
          accepted,
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
            ],
          },
        ],
      });
      return res.json(friendList);
    }

    const friendList = await Friendship.findAll({
      offset,
      limit,
      order: [['id', 'ASC']],
      where: {
        accepted: false,
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
          ],
        },
      ],
    });

    return res.json(friendList);
  }

  async store(req, res) {
    const user_id = req.userId;
    const { user_friend } = req.body;

    const friendRequested = await Friendship.findAll({
      where: {
        user_friend: { [Op.or]: [req.userId, user_friend] },
        user_id: { [Op.or]: [req.userId, user_friend] },
      },
    });

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

    return res.json(friendCreated);
  }

  async update(req, res) {
    const findFriend = await Friendship.findByPk(req.params.id);

    const newUpdate = await findFriend.update(req.body);
    return res.json(newUpdate);
  }
}

export default new FriendshipController();
