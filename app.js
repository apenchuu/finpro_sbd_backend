require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

const defaultOrigins = ['http://localhost:3000'];
const allowedOrigins = process.env.CORS_ORIGIN
  ? [...new Set(process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean).concat(defaultOrigins))]
  : defaultOrigins;

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.use('/user', require('./routes/userRoutes'));
app.use('/freelancer-profile', require('./routes/freelancerProfileRoutes'));
app.use('/freelancer-skill', require('./routes/freelancerSkillRoutes'));
app.use('/projects', require('./routes/projectRoutes'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
