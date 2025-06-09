import Message from "../../model/message.model.js"
import { verifyToken } from "../jwt.js";
import { onlineUsers } from "./access.js"

export const chat = (io, socket) => {
  const token = socket.handshake.auth?.token;
  const decode = verifyToken(token);
  const userId = decode?.id;
  socket.on('chat', async (data) => {
    console.log(onlineUsers)
    const { partnerId, text } = data
    console.log(partnerId, text)

    io.to(onlineUsers[partnerId]).emit('chat', ({ id: '', text: text, sender: userId }))

  })
}