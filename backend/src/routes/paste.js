import express from 'express';
import multer from 'multer';
import { Paste } from '../models/Paste.js';
import crypto from 'crypto';
import fs from 'fs';

const router = express.Router();
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE_MB || 10) * 1024 * 1024;

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: MAX_FILE_SIZE },
});

// Generate unique 4-digit ID
async function generateUniqueId() {
  const MAX_ATTEMPTS = 100;
  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const id = String(Math.floor(Math.random() * 10000)).padStart(4, '0');
    const existing = await Paste.findOne({ id });
    if (!existing) {
      return id;
    }
  }
  throw new Error('Unable to generate unique ID after maximum attempts');
}

// POST /api/paste - Create a new paste
router.post('/paste', upload.single('file'), async (req, res) => {
  try {
    const { content, contentType, duration } = req.body;
    const expiryMinutes = Math.min(
      parseInt(duration) || parseInt(process.env.PASTE_DEFAULT_EXPIRY_MINUTES || 60),
      parseInt(process.env.PASTE_MAX_EXPIRY_MINUTES || 1440)
    );

    let pasteContent = content;
    let pasteContentType = contentType || 'text';
    let fileName = null;
    let fileSize = 0;
    let mimeType = 'text/plain';

    console.log(`[PASTE] Processing new ${contentType} upload...`);

    if (req.file) {
      // File upload handling
      fileName = req.file.originalname;
      fileSize = req.file.size;
      mimeType = req.file.mimetype;
      pasteContent = req.file.buffer.toString('base64');
      pasteContentType = (contentType === 'image') ? 'image' : 'file';
    } else if (content) {
      // Text/Link handling
      fileSize = content.length;
      if (contentType === 'image') {
        mimeType = 'image/png';
      }
    } else {
      return res.status(400).json({ error: 'No content provided' });
    }

    if (fileSize > MAX_FILE_SIZE) {
      return res.status(413).json({ 
        error: `File size exceeds limit of ${process.env.MAX_FILE_SIZE_MB}MB` 
      });
    }

    const id = await generateUniqueId();
    const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);

    const paste = new Paste({
      id,
      content: pasteContent,
      contentType: pasteContentType,
      fileName,
      fileSize,
      mimeType,
      expiresAt,
      fingerprint: req.fingerprint,
    });

    await paste.save();
    console.log(`[PASTE] Successfully created paste: ${id} (${pasteContentType}, ${fileSize} bytes)`);

    res.status(201).json({
      id,
      expiresAt,
      expiryMinutes,
      message: 'Paste created successfully',
    });
  } catch (error) {
    console.error('Error creating paste:', error);
    if (error.status === 429) {
      return res.status(429).json({ error: 'Too many uploads. Please try again later.' });
    }
    res.status(500).json({ error: error.message });
  }
});

// GET /api/paste/:id - Fetch a paste
router.get('/paste/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^\d{4}$/.test(id)) {
      return res.status(400).json({ error: 'Invalid paste ID format' });
    }

    const paste = await Paste.findOne({ id });

    if (!paste) {
      console.log(`[PASTE] Fetch failed: ${id} (Not found or expired)`);
      return res.status(404).json({ error: 'Paste not found or expired' });
    }

    const now = new Date();
    if (now > paste.expiresAt) {
      console.log(`[PASTE] Fetch failed: ${id} (Found but expired)`);
      await Paste.deleteOne({ _id: paste._id });
      return res.status(404).json({ error: 'Paste has expired' });
    }

    console.log(`[PASTE] Successfully retrieved: ${id} (${paste.contentType})`);

    // Return data based on content type
    if (paste.contentType === 'file' || paste.contentType === 'image') {
      res.json({
        id: paste.id,
        contentType: paste.contentType,
        fileName: paste.fileName,
        mimeType: paste.mimeType || 'image/png',
        content: paste.content, // base64
        createdAt: paste.createdAt,
        expiresAt: paste.expiresAt,
      });
    } else {
      res.json({
        id: paste.id,
        content: paste.content,
        contentType: paste.contentType,
        createdAt: paste.createdAt,
        expiresAt: paste.expiresAt,
      });
    }
  } catch (error) {
    console.error('Error fetching paste:', error);
    res.status(500).json({ error: error.message });
  }
});

// DELETE /api/paste/:id - Delete a paste (optional, for manual cleanup)
router.delete('/paste/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!/^\d{4}$/.test(id)) {
      return res.status(400).json({ error: 'Invalid paste ID format' });
    }

    const result = await Paste.deleteOne({ id });

    if (result.deletedCount === 0) {
      console.log(`[PASTE] Delete failed: ${id} (Not found)`);
      return res.status(404).json({ error: 'Paste not found' });
    }

    console.log(`[PASTE] Manually deleted: ${id}`);
    res.json({ message: 'Paste deleted successfully' });
  } catch (error) {
    console.error('Error deleting paste:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
