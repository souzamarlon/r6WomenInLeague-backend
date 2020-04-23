import Friendship from '../models/Friendship';

class FriendshipController {
  async store(req, res) {
    const user_id = req.userId;
    const { user_friend } = req.body;

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
