'use strict';
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directories exist
const uploadDirAvatars = path.join(__dirname, '../../public/uploads/avatars');
const uploadDirEventsImages = path.join(__dirname, '../../public/uploads/events/images');
const uploadDirEventsResources = path.join(__dirname, '../../public/uploads/events/resources');

[uploadDirAvatars, uploadDirEventsImages, uploadDirEventsResources].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const createStorage = (destDir, prefix) => multer.diskStorage({
  destination: (req, file, cb) => cb(null, destDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const userId = req.user?.id || 'sys';
    const filename = `${prefix}-${userId}-${Date.now()}${ext}`;
    cb(null, filename);
  }
});

const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const resourceFilter = (req, file, cb) => {
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip',
    'application/x-zip-compressed'
  ];
  if (allowedTypes.includes(file.mimetype) || file.mimetype.startsWith('text/')) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF, Word, PowerPoint, and ZIP files are allowed'), false);
  }
};

const uploadAvatar = multer({
  storage: createStorage(uploadDirAvatars, 'avatar'),
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: imageFilter
});

const uploadEventImage = multer({
  storage: createStorage(uploadDirEventsImages, 'event-img'),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: imageFilter
});

const uploadEventResource = multer({
  storage: createStorage(uploadDirEventsResources, 'event-res'),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
  fileFilter: resourceFilter
});

module.exports = {
  uploadAvatar,
  uploadEventImage,
  uploadEventResource
};
