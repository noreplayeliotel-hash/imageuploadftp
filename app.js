const express = require('express');
const path = require('path');
const fs = require('fs');

const errorHandler = require('./middleware/errorHandler');
const afficheimage = require("./services/affiche");
const uploadimage = require("./routes/imageRoutes");

const app = express();

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use("/afficheimage", afficheimage);


app.use('/uploads',uploadimage);



// Error handling middleware
app.use(errorHandler);

module.exports = app;
