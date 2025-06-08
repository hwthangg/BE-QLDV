import Registration from '../model/registration.model.js';
import { sendResponse } from '../utils/response.js';

const RegistrationController = () => {
  const createRegistration = async (req, res) => {
    try {
      const { eventId } = req.body
      const accountId = req.userId
      const registration = new Registration({ eventId: eventId, accountId: accountId })
      await registration.save()

      return sendResponse(res, 201, 'Đăng ký sự kiện thành công');
    } catch (error) {
      console.log(error?.message);
      return sendResponse(res, 500, error.message);
    }
  };

  const checkIn = async (req, res) => {
    try {
      const { id } = req.params
      const registration = await Registration.findById(id)
      registration.status = 'attended'

      await registration.save()
      return sendResponse(res, 200, 'Điểm danh sự kiện thành công');
    } catch (error) {
      console.log(error?.message);
      return sendResponse(res, 500, error.message);
    }
  };

const getParticipants = async (req, res) => {
  try {
    const { eventId, search, accountId } = req.query;

    let participants = await Registration.find({ eventId }).populate('accountId').populate('eventId')

    // Lọc theo từ khóa tìm kiếm (fullname hoặc cardCode)
    if (search) {
      const searchLower = search.toLowerCase();
      participants = participants.filter(item => {
        const account = item.accountId;
        if (!account) return false;
        return (
          account.fullname?.toLowerCase().includes(searchLower) ||
          account.cardCode?.toLowerCase().includes(searchLower)
        );
      });
    }

    // Lọc theo accountId (nếu có)
    if (accountId) {
      participants = participants.filter(item => {
        return item.accountId && item.accountId._id.toString() === accountId;
      });
    }

    return sendResponse(res, 200, 'Lấy danh sách người tham gia thành công', participants);
  } catch (error) {
    console.log(error?.message);
    return sendResponse(res, 500, error.message);
  }
};


  return {
    createRegistration,
    checkIn,
    getParticipants
  };
};

export default RegistrationController();
