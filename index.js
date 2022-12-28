const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const responseRoutes = require("./routes/response");
const threadRoutes = require("./routes/thread");

const app = express();
const port = 5000;

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(cors());

app.use("/", authRoutes);
app.use("/thread", threadRoutes);
app.use("/response", responseRoutes);

app.get("/", (req, res) => {
  res.send("up");
});

app.listen(port, () => {
  console.log(`server is running on port ${port}`);
});
