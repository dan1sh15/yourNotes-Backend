const User = require("../models/User");
const Notes  = require("../models/Notes");

exports.createNote = async (req, res) => {
    try {

        const {title, description, tag} = req.body;

        if(!title || !description) {
            return res.status(401).json({
                success: false,
                message: "All fields are required",
            });
        }

        const newNote = await Notes.create({
            title,
            description,
            tag,
        });

        await User.findByIdAndUpdate(req.user.id, {
            $push: {
                notes: newNote._id,
            }, 
        }, {
            new: true,
        },);

        return res.status(200).json({
            success: true,
            message: "New Note added successfully",
            data: newNote,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error creating a note, please try again",
        });
    }
};

exports.getAllNotes = async (req, res) => {
    try {
        
        const userId = req.user.id;

        const notes = await User.findById(userId).populate("notes").exec();

        if(!notes) {
            return res.status(401).json({
                success: false,
                message: "Error fetching notes, please try again",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Notes fetched successfully",
            data: notes,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error fetching notes, please try again",
            data: error.message,
        });
    }
};

exports.editNote = async (req, res) => {
    try {
        
        const id = req.params.id;
        const {title, description, tag} = req.body;

        const newNote = {};

        if(title) newNote.title = title;
        if(description) newNote.description = description;
        if(tag) newNote.tag = tag;

        let note = await Notes.findById(id);

        if(!note) {
            return res.status(401).json({
                success: false,
                message: "Cannot find Note",
            });
        }

        note = await Notes.findByIdAndUpdate(id, {
            $set: newNote
        }, {new: true});


        return res.status(200).json({
            success: true,
            message: "Notes updated successfully",
            note,
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Error editing note, please try again",
        });
    }
};

exports.deleteNote = async (req, res) => {
    try {
        
        const id = req.params.id;
        const userId = req.user.id;

        const note = await Notes.findById(id);

        if(!note) {
            return res.status(401).json({
                success: false,
                message: "Cannot find note",
            });
        }

        await Notes.findByIdAndDelete(id);
        const userData = await User.findByIdAndUpdate(userId, {
            $pull: {
                "notes": {
                    _id: id
                }
            }
        });

        if(!userData) {
            return res.status(400).json({
                success: false,
                message: "Cannot update the user details",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Note Deleted successfully",
            userData
        });

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: "Cannot delete note, please try again",
        });
    }
}