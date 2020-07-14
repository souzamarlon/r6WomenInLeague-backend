import Chat from '../schemas/Chat';
import User from '../models/User';

class ChatController {
  async index(req, res) {
    const { userId } = req;
    const { id } = req.params;

    const userInfo = await User.findOne({
      where: {
        id,
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
    });

    const targetSocket = req.connectedUsers[id];
    // console.log('test', req.connectedUsers);
    // console.log('test', targetSocket);

    const messagesReceived = await Chat.findOne({
      $and: [
        {
          $or: [{ senderId: { $eq: userId } }, { senderId: { $eq: id } }],
        },
        {
          $or: [{ receiverId: { $eq: userId } }, { receiverId: { $eq: id } }],
        },
      ],
    });

    return res.json({ userInfo, status: !!targetSocket, messagesReceived });
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

    const targetSocket = await req.connectedUsers[receiverId];

    // If the target is connected it will send the messages in real time.
    if (targetSocket) {
      const { _id } = messageCreated;

      req.io.to(targetSocket).emit('sendMessage', {
        chatId: _id,
        user: senderId,
        message,
        status: targetSocket,
      });
    }

    return res.json(messageCreated);
  }

  async update(req, res) {
    const senderId = req.userId;
    const { id } = req.params;
    const { message } = req.body;

    const allMessages = await Chat.findById(id);

    // I need to know who it will receive the message by socket Io.
    const receiverId =
      allMessages.senderId === senderId
        ? allMessages.receiverId
        : allMessages.senderId;

    if (!allMessages) {
      return res.status(401).json({ error: 'Any message was found!' });
    }

    // Chat Id
    const filterById = { _id: id };

    const messageUpdate = await Chat.findOneAndUpdate(
      filterById,
      { $push: { messages: { user: senderId, message } } },
      {
        new: true,
      }
    );

    const messagesLength = messageUpdate.messages.length - 1;

    const lastMessage = messageUpdate.messages[messagesLength];

    const targetSocket = await req.connectedUsers[receiverId];

    const { _id, user } = lastMessage;

    // If the target is connected it will send the messages in real time.
    if (targetSocket) {
      req.io.to(targetSocket).emit('sendMessage', {
        _id,
        user,
        message,
        status: targetSocket,
      });
    }

    return res.json(lastMessage);
  }
}

export default new ChatController();
