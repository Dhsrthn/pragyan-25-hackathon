const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');
const { router: emailRoutes, sendEmail } = require('./emailRoutes');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use('/api', emailRoutes);

// Optional: Basic health check route
app.get('/', (req, res) => {
  res.json({ 
    status: 'Server is running', 
    message: 'Email service is active' 
  });
});

// Enable CORS for all routes


// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Optional: Export for testing or other uses
module.exports = app;