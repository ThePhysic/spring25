const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const messageSchema = new Schema({
  content: { type: String }
})

const messageModel = mongoose.model("Message", messageSchema)

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {
    console.log('a user connected');

    // Fetch older messages:
    messageModel.find({})
      .then(messages =>  {
        console.log("Previous messages:", messages);
      })
      .catch(err => {
        console.error("Error retrieving previous messages:", err);
      })

    socket.on('disconnect', () => {
      console.log('user disconnected');
    });

    socket.on('chat message', (msg) => {
        const message = new messageModel();
        message.content = msg.message;
        message.save().then(m => {
          io.emit("chat message", msg);
        })
        console.log(msg);
    });
});

server.listen(3000, async function() {
  await mongoose.connect("mongodb+srv://thephysic:TFjmlbZuLPP3YydF@cluster0.j2fnd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
  console.log('listening on *:3000');
});
