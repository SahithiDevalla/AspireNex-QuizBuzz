const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require("body-parser");
const userRoutes = require('./routes/users');
const quizRoutes = require('./routes/quizzes');
require('dotenv').config();

const app = express();
const path = require("path");
let server;

// Middleware config
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true, limit: '20mb' }));
app.use(bodyParser.json({ limit: '20mb' }));

app.use('/api/users/', userRoutes);
app.use('/api/quizzes/', quizRoutes);

// Serve static files from the React app
app.use(express.static(path.resolve(__dirname, "client", "build")));

app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
});

// Define the PORT variable
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.DB_URI, {
    useUnifiedTopology: true,
    useNewUrlParser: true
})
.then(() => console.log('Database connection established'))
.catch(err => console.log('Error connecting to mongodb instance: ', err));

// Start the server
server = app.listen(PORT, () => {
    console.log(`Node server running on port: ${PORT}`);
});
