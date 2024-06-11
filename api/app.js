const express = require("express");
const app = express();
const morgan = require("morgan");
const cors = require('cors')
const createError = require("http-errors");
const dotenv = require('dotenv');
const connectDB = require('./helpers/init_mongodb.js');
// const patientRoute = require('./entities/patient/patientRoutes.js')
const adminRoute = require('./entities/admin/adminRoute.js')
const doctorRoute = require('./entities/doctor/doctorRoutes.js');
const wardRoute = require('./entities/ward/wardRoutes.js')
const departmentRoute = require('./entities/department/departmentRoutes.js')
const nurseRoute = require('./entities/nurse/nurseRoutes.js')


// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

const PORT = process.env.PORT || 5050;

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(morgan("dev"));
app.use(cors())

app.get("/", (req, res) => {
  res.send({ message: "Welcome to sam clinic" });
});

// Protected Routes
app.use('/api', adminRoute, doctorRoute, wardRoute, departmentRoute, nurseRoute);


// Fallback route for undefined routes
app.use(async (req, res, next) => {
  next(createError.NotFound("This route does not exist"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({
    error: {
      message: err.message,
    },
  });
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});

module.exports = app;
