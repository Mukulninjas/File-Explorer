require("dotenv").config();
const express = require('express');
const app = express();
const cors = require("cors");
const path = require('path');
const fs = require('fs');
const port = process.env.PORT || 5000;
const connectMongoDb = require('./services/mongodb');
const fileRouter = require('./routes/fileRoutes');

app.use(cors({credentials:true,origin:process.env.APP_URL}));
app.use(express.json());
connectMongoDb();

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)){
    fs.mkdirSync(uploadsDir);
}

app.use('/uploads', express.static(uploadsDir));
app.use('/api', fileRouter);

app.get('/', (req, res) => {
    res.send('Hello, from file explorer!');
  });

app.listen(port, ()=>{
    console.log(`Server running on port ${port}`);
});