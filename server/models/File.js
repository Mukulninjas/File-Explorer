const mongoose = require("mongoose");

const FileSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    required: true, 
    enum: ['file', 'folder'] 
  },
  description: { 
    type: String, 
    default: '' 
  },
  parentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "File", 
    default: null 
  },
  url: String,
  size: Number,
  mimeType: String,
  isDeleted: { 
    type: Boolean, 
    default: false 
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for children
FileSchema.virtual('children', {
  ref: 'File',
  localField: '_id',
  foreignField: 'parentId'
});

module.exports = mongoose.model("File", FileSchema);
