const express = require('express');
const router = express.Router();
const { getUsers, updateUserRole, deleteUser, getRevenue } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All admin routes must be protected and restricted to 'admin' role
router.use(protect);
router.use(authorize('admin'));

router.get('/users', getUsers);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);

router.get('/revenue', getRevenue);

module.exports = router;
