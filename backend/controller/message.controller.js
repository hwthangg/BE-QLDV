import mongoose from "mongoose";
import Account from "../model/account.model.js";
import Message from "../model/message.model.js";
import { sendResponse } from "../utils/response.js";

const MessageController = () => {
  // Tạo tin nhắn mới
  const createMessage = async (req, res) => {
    try {
      const sender = req.userId;
      const { recipientId, text } = req.body;

      const message = new Message({
        members: [sender, recipientId],
        sender,
        text
      });

      await message.save();

      return sendResponse(res, 201, "Gửi tin nhắn thành công", message);
    } catch (error) {
      console.log(error?.message);
      return sendResponse(res, 500, error.message);
    }
  };

  // Lấy danh sách tin nhắn giữa 2 người dùng
  const getMessages = async (req, res) => {
    try {
      const userId = req.userId;
      const { otherUserId } = req.params;

      const messages = await Message.find({
        members: { $all: [userId, otherUserId] }
      }).sort({ createdAt: 1 });

      return sendResponse(res, 200, "Lấy tin nhắn thành công", messages);
    } catch (error) {
      console.log(error?.message);
      return sendResponse(res, 500, error.message);
    }
  };

  const getContactList = async (req, res) => {
    try {
      const userId = req.userId;
      const account = await Account.findById(userId).lean();
      console.log(userId, account)
      let contacts = [];

      if (account.role === 'admin') {
        contacts = await Account.find({ role: 'manager' }).populate('chapterId').lean();
      } else if (account.role === 'manager') {
        const [admins, managers, members] = await Promise.all([
          Account.find({ role: 'admin' }).lean(),
          Account.find({ role: 'manager' }).populate('chapterId').lean(),
          Account.find({ role: 'member', chapterId: account.chapterId }).lean()
        ]);
        contacts = [...admins, ...managers, ...members];
      } else if (account.role === 'member') {
        const [managers, members] = await Promise.all([
          Account.find({ role: 'manager', chapterId: account.chapterId }).lean(),
          Account.find({ role: 'member', chapterId: account.chapterId }).lean()
        ]);
        contacts = [...managers, ...members];
      }

      const result = await Promise.all(
        contacts.map(async (item) => {
          // const userObjectId = new mongoose.Types.ObjectId(userId);
          // const contactObjectId = new mongoose.Types.ObjectId(item._id);

          const lastMessages = await Message.find({
            // members: { $all: [userObjectId, contactObjectId] }
             members: { $all: [userId, item._id] }
          })
            .sort({ createdAt: -1 })
            .limit(1)
            .lean();

          const lastMessage = lastMessages[0];

          return {

            id: item._id,
            avatar: item.avatar,
            fullname: item.fullname,
            role: item.role,
            chapter: item.chapterId?.name || null,
            lastMessage: lastMessage?.text || null,
            sender: lastMessage?.sender || null

          };
        })
      );

      return sendResponse(res, 200, "Lấy tin nhắn thành công", result);
    } catch (error) {
      console.log(error?.message);
      return sendResponse(res, 500, error.message);
    }
  };



  return {
    createMessage,
    getMessages,
    getContactList
  };
};

export default MessageController();
