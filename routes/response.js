const express = require("express");
const {
  createResponse,
  responseCount,
  getReplyResponse,
  updateResponse,
  deleteResponse,
} = require("../controllers/response");
const { protect } = require("../middleware");

const router = express.Router();

router.post("/create", protect, createResponse);
router.get("/count", responseCount);
router.get("/replyResponse", getReplyResponse);
router.put("/update", updateResponse);
router.delete("/delete", deleteResponse);

module.exports = router;
