const express = require("express");
const {
  getUser,
  register,
  getMe,
  updateProfile,
  signInWithEmail,
  getAllUser,
  deleteUser,
} = require("../controllers/auth");
const { protect } = require("../middleware");

const router = express.Router();

// router.get("/api/verify", register);
router.get("/api/verify", protect, register);
router.post("/signup", protect, signInWithEmail);
router.get("/users", getUser);
router.get("/me", getMe);
router.get("/allUser", getAllUser);
router.put("/update/:id", updateProfile);
router.delete("/delete", protect, deleteUser);

module.exports = router;
