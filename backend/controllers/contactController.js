const ContactMessage = require("../models/ContactMessage");

const getAdminEmails = () =>
  (process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || "alokuc123@gmail.com")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

const isContactAdmin = (user) => {
  const userEmail = String(user?.email || "").toLowerCase();
  return getAdminEmails().includes(userEmail);
};

const createContactMessage = async (req, res, next) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !phone || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "All contact fields are required",
      });
    }

    const contactMessage = await ContactMessage.create({
      userId: req.user?._id || null,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      subject: subject.trim(),
      message: message.trim(),
    });

    res.status(201).json({
      success: true,
      message: "Contact message sent successfully",
      contactMessage,
    });
  } catch (error) {
    next(error);
  }
};

const getContactMessages = async (req, res, next) => {
  try {
    if (!isContactAdmin(req.user)) {
      return res.status(403).json({
        success: false,
        message: "Only admin can view contact messages",
      });
    }

    const messages = await ContactMessage.find().sort({ createdAt: -1 });
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    res.status(200).json({
      success: true,
      canManageContactMessages: true,
      stats: {
        totalMessages: messages.length,
        todayMessages: messages.filter((item) => item.createdAt >= today).length,
        emailMessages: messages.filter((item) => Boolean(item.email)).length,
      },
      messages,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createContactMessage,
  getContactMessages,
};
