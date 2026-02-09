// server/routes/routes.js
const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const profileController = require('../controllers/profileController');
const requestController = require('../controllers/requestController');
const authMiddleware = require('../middleware/authMiddleware');

// AUTH
router.post('/register', authController.register);
router.post('/login', authController.login);

// PROFILES
router.post('/profiles', authMiddleware, profileController.saveProfile);
router.get('/profiles', profileController.getProfiles);

// REQUESTS
router.post('/request', authMiddleware, requestController.sendRequest);
router.get('/requests/:id', authMiddleware, requestController.getUserRequests);
router.put('/request/:id', authMiddleware, requestController.updateRequest);

module.exports = router;
