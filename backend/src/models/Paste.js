import mongoose from 'mongoose';

const pasteSchema = new mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    content: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    contentType: {
      type: String,
      enum: ['text', 'image', 'link', 'file'],
      required: true,
    },
    fileName: {
      type: String,
      default: null,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    mimeType: {
      type: String,
      default: 'text/plain',
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    fingerprint: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

// Auto-delete expired documents
pasteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Paste = mongoose.model('Paste', pasteSchema);
