// Import mongoose
const mongoose = require("mongoose");

// Connect mongoose with MongoDB
mongoose.connect(`mongodb+srv://${process.env.DB_USER_PASS}@cluster0.eobuf6f.mongodb.net/mern-project`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,

});

mongoose.connection.once("open", () => {
  console.log("MongoDB is connected");
});