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
      messages: { user: senderId, message },
    });

    return res.json(messageCreated);
  }

  async update(req, res) {
    const senderId = req.userId;
    const receiverId = req.params.id;
    const { message } = req.body;

    const allMessages = await Chat.findOne({
      $and: [
        {
          $or: [
            { senderId: { $eq: senderId } },
            { senderId: { $eq: receiverId } },
          ],
        },
        {
          $or: [
            { receiverId: { $eq: senderId } },
            { receiverId: { $eq: receiverId } },
          ],
        },
      ],
    });

    if (!allMessages) {
      return res.status(401).json({ error: 'Any message was found!' });
    }

    const messageUpdate = await allMessages.update({
      $push: { messages: { user: senderId, message } },
    });

    return res.json(messageUpdate);
  }
}

export default new ChatController();
