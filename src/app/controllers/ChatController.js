import Chat from '../schemas/Chat';

class ChatController {
  async store(req, res) {
    const senderId = req.userId;
    const receiverId = req.params.id;
    const { message } = req.body;

    console.log(senderId, receiverId, message);

    const messageCreated = await Chat.create({
      senderId,
      receiverId,
      messages: [{ user: senderId, message }],
    });

    return res.json(messageCreated);
  }
}

export default new ChatController();
