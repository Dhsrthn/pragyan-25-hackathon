const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  service: "Gmail",
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Email template
const emailTemplate = `
  <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);">
    <div style="background-color: #4caf50; color: #fff; padding: 20px; text-align: center;">
      <h1 style="margin: 0; font-size: 24px;">Welcome to Acrewise</h1>
    </div>
    <div style="padding: 20px;">
      <p style="font-size: 16px; line-height: 1.6;">
        Hello <strong>[Recipient's Name]</strong>,
      </p>
      <p style="font-size: 16px; line-height: 1.6;">
        Thank you for choosing [Platform Name]! We're thrilled to have you on board. Below are some helpful links to get started with our platform.
      </p>
      <div style="margin: 20px 0; text-align: center;">
        <a href="[Website Link]" style="background-color: #4caf50; color: #fff; padding: 10px 20px; font-size: 16px; text-decoration: none; border-radius: 4px;">Explore Now</a>
      </div>
      <p style="font-size: 16px; line-height: 1.6;">
        If you have any questions, feel free to reply to this email or reach out to our support team. We're here to help you every step of the way.
      </p>
    </div>
    <div style="background-color: #f9f9f9; padding: 10px; text-align: center; font-size: 14px; color: #777;">
      <p style="margin: 0;">[Company Name], All rights reserved.</p>
      <p style="margin: 0;">123 Your Address, City, State, ZIP</p>
    </div>
  </div>
`;

/**
 * Send personalized email
 * @param {Object} options - Email configuration
 * @returns {Promise} - Email sending result
 */
async function sendEmail(options) {
  const { 
    to, 
    subject, 
    platformName = 'Acrewise', 
    websiteLink = 'https://www.acrewise.com' 
  } = options;

  // Extract recipient name
  const recipientName = to.split('@')[0]
    .split('.')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  // Personalize template
  const personalizedHtml = emailTemplate
    .replace('[Recipient\'s Name]', recipientName)
    .replace('[Platform Name]', platformName)
    .replace('[Website Link]', websiteLink);

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject: subject || `Welcome to ${platformName}`,
      html: personalizedHtml,
    });

    return {
      success: true,
      messageId: info.messageId,
      recipientName
    };
  } catch (error) {
    console.error('Email sending error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Send Email Route
router.post('/send-email', async (req, res) => {
  try {
    const result = await sendEmail(req.body);
    
    if (result.success) {
      res.status(200).json({
        message: 'Email sent successfully',
        recipientName: result.recipientName,
        messageId: result.messageId
      });
    } else {
      res.status(500).json({
        message: 'Failed to send email',
        error: result.error
      });
    }
  } catch (error) {
    res.status(500).json({ 
      message: 'Unexpected error', 
      error: error.message 
    });
  }
});

module.exports = { router, sendEmail };