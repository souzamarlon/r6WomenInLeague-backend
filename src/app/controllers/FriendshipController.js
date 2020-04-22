import * as Yup from 'yup';

import Friendship from '../models/Friendship';

class FriendshipController {
  async store(req, res) {
    const user_id = req.userId;
    const { user_friend } = req.body;

    const friendCreated = await Friendship.create({ user_id, user_friend });

    return res.json(friendCreated);
  }
}

export default new FriendshipController();
