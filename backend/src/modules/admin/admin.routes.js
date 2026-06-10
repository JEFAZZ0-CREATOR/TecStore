const { Router } = require('express');
const authMiddleware  = require('../../shared/middlewares/auth.middleware');
const adminMiddleware = require('../../shared/middlewares/admin.middleware');
const ctrl = require('./admin.controller');

const router = Router();

router.use(authMiddleware, adminMiddleware);

router.get('/stats',                        ctrl.getStats);
router.get('/analytics',                    ctrl.getAnalytics);
router.get('/activity',                     ctrl.getActivity);
router.get('/users',                        ctrl.listUsers);
router.get('/users/:id',                    ctrl.getUserDetail);
router.patch('/users/:id/role',             ctrl.updateUserRole);
router.delete('/users/:id',                 ctrl.deleteUser);
router.get('/orders',                       ctrl.listOrders);
router.patch('/orders/:id/status',          ctrl.updateOrderStatus);
router.get('/products',                     ctrl.listProducts);
router.patch('/products/:id/availability',  ctrl.toggleProductAvailability);
router.delete('/products/:id',              ctrl.deleteProduct);

module.exports = router;
