const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoutes = require('./Routes/userRoutes');
const dotenv = require('dotenv');
dotenv.config();

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/users', userRoutes);

// Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
