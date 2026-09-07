const express = require('express');
const maintenanceRoutes = require('./maintenance.routes');
const applicationsRoutes = require('./applications.routes');
const postingsRoutes = require('./postings.routes');
const stagesRoutes = require('./stages.routes');
const insightsRoutes = require('./insights.routes');

const router = express.Router();

router.use(maintenanceRoutes);
router.use(applicationsRoutes);
router.use(postingsRoutes);
router.use(stagesRoutes);
router.use(insightsRoutes);

module.exports = router;
