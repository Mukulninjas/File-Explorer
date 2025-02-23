const express = require("express");
const File = require("../models/File");
const { upload } = require("../services/cloudinary");
const { body, validationResult } = require('express-validator');

const router = express.Router();

router.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const { originalname, size, mimetype, path } = req.file;
    const { parentId, description } = req.body;
    
    const file = new File({
      name: originalname,
      type: "file",
      description,
      parentId: parentId || null,
      url: path,
      size,
      mimeType: mimetype
    });

    await file.save();
    res.status(201).json(file);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const validateFolder = [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('description').optional().trim(),
    body('parentId').optional().isMongoId(),
];

router.post("/folder", validateFolder, async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const { name, parentId, description } = req.body;
        const folder = new File({ 
            name, 
            type: "folder", 
            parentId: parentId || null,
            description 
        });

        await folder.save();
        res.status(201).json(folder);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get("/files/filter", async (req, res) => {
    try {
        const { name, description, dateFrom, dateTo } = req.query;
        
        const query = { isDeleted: false };
        
        if (name) {
            query.name = { $regex: name, $options: 'i' };
        }
        
        if (description) {
            query.description = { $regex: description, $options: 'i' };
        }
        
        if (dateFrom || dateTo) {
            query.createdAt = {};
            if (dateFrom) {
                query.createdAt.$gte = new Date(dateFrom);
            }
            if (dateTo) {
                query.createdAt.$lte = new Date(dateTo);
            }
        }

        const files = await File.find(query)
            .lean()
            .select('name type description createdAt updatedAt url size mimeType')
            .sort({ type: -1, name: 1 });

        res.json(files);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.get("/:parentId?", async (req, res) => {
    try {
        res.set('Cache-Control', 'public, max-age=300');

        const files = await File.find({ 
            parentId: req.params.parentId || null,
            isDeleted: false 
        })
        .lean()
        .select('name type description createdAt updatedAt url size mimeType')
        .sort({ type: -1, name: 1 });

        res.json(files);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.delete("/:id", async (req, res) => {
  try {
    const file = await File.findById(req.params.id);
    if (!file) return res.status(404).json({ message: "File not found" });

    file.isDeleted = true;
    await file.save();
    
    res.json({ message: "Deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/files/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description } = req.body;

        const file = await File.findById(id);
        if (!file) {
            return res.status(404).json({ message: "File not found" });
        }

        // Update the fields
        file.name = name;
        file.description = description;

        await file.save();
        res.json(file);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
