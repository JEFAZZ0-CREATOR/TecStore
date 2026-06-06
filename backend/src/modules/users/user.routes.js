const express = require('express');
const { getProfile, listUsers, updateUser, uploadAvatar } = require('./user.controller');
const { authMiddleware } = require('../../shared/middlewares');
const { validateRequest } = require('../../shared/middlewares');
const { userUpdateSchema } = require('./user.validator');
const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, path.join(__dirname, '../../../uploads/avatars'))
	},
	filename: function (req, file, cb) {
		const ext = path.extname(file.originalname)
		cb(null, `${req.user.id}${ext}`)
	}
})

const upload = multer({ storage })

const router = express.Router();
router.get('/', authMiddleware, listUsers);
router.get('/me', authMiddleware, getProfile);
router.put('/me', authMiddleware, validateRequest(userUpdateSchema), updateUser);
router.put('/me/avatar', authMiddleware, upload.single('avatar'), uploadAvatar);

module.exports = router;
