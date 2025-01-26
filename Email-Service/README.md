# Nodemailer Email Service

This project demonstrates how to send emails using [Nodemailer](https://nodemailer.com/) in a Node.js environment. It includes a basic email-sending function with support for plain text and HTML content.

## Features

- Send emails using Gmail as the email service.
- Supports plain text and HTML email content.
- Secure authentication with environment variables.

## Prerequisites

Ensure you have the following installed on your system:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/)

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/Dhsrthn/pragyan-25-hackathon.git
cd Email-Service
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory and add the following:

```
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-email-password-or-app-password
PORT=3000
```

> **Note:** For Gmail accounts, you may need to enable "Less Secure Apps" or create an App Password for better security.

### 4. Run the Application

```bash
npm start
```