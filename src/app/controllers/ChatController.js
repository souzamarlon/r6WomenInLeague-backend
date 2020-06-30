import Chat from '../schemas/Chat';

class ChatController {
  async index(req, res) {
    const allMessages = await Chat.find({
      $and: [
        {
          $or: [
            { senderId: { $eq: req.userId } },
            { senderId: { $eq: req.params.id } },
          ],
        },
        {
          $or: [
            { receiverId: { $eq: req.userId } },
            { receiverId: { $eq: req.params.id } },
          ],
        },
      ],
    });

    return res.json(allMessages);
  }

  async store(req, res) {
    const senderId = req.userId;
    const receiverId = req.params.id;
    const { message } = req.body;

    const messageCreated = await Chat.create({
      senderId,
      receiverId,
      messages: [{ user: senderId, message }],
    });

    return res.json(messageCreated);
  }
}

export default new ChatController();
