const express = require("express");
const { auth } = require("../middlewares/Auth");
const { getAllNotes, createNote, editNote, deleteNote } = require("../controllers/Notes");
const router = express.Router();

router.get("/getAllNotes", auth, getAllNotes);
router.post("/createNote", auth, createNote);
router.put("/editNote/:id", auth, editNote);
router.delete("/deleteNote/:id", auth, deleteNote);

module.exports = router;