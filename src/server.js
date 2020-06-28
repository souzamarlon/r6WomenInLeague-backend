import app from './app';

const server = require('http').Server(app);
const io = require('socket.io')(server);

const connectedUsers = {};

io.on('connection', (socket) => {
  const { user } = socket.handshake.query;

  console.log(user, socket.id);

  connectedUsers[user] = socket.id;
  // console.log('Nova conexão', socket.id);

  // socket.on('Hello', message => {
  //     console.log(message)})
});

server.listen(3333);
