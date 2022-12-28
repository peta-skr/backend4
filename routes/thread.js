const express = require("express");
const {
  createThread,
  getAllTreads,
  getThread,
  getThreadByTag,
  favoriteThread,
  removeFavoriteThread,
  getThreadOnlyThreaddata,
  bookmarkThread,
  removeBookmark,
  deleteThread,
  getTags,
  updateThread,
  bookMarklist,
  likeList,
  deleteTag,
  reportThread,
  getReportThread,
  getMyThreads,
  checkSameUser,
} = require("../controllers/thread");
const { protect } = require("../middleware");

const router = express.Router();

router.post("/create", protect, createThread);
router.get("/getAll", getAllTreads);
router.get("/", getThread);
router.get("/tag", getThreadByTag);
router.post("/favoriteThread", protect, favoriteThread);
router.delete("/removeFavoriteThread", protect, removeFavoriteThread);
router.get("/getOnlyThread", getThreadOnlyThreaddata);
router.post("/bookmark", protect, bookmarkThread);
router.delete("/removeBookmark", protect, removeBookmark);
router.delete("/delete", protect, deleteThread);
router.get("/tags", getTags);
router.put("/update", protect, updateThread);
router.get("/bookmark", protect, bookMarklist);
router.get("/like", protect, likeList);
router.delete("/tag/delete", deleteTag);
router.post("/report/thread", protect, reportThread);
router.get("/reports", protect, getReportThread);
router.get("/user/threads", protect, getMyThreads);
router.get("/user/check", protect, checkSameUser);

module.exports = router;
