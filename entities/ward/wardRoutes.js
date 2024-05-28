const router = require('express').Router()
const wardController = require('./wardController')

router.post('/wards/new', wardController.createWard)
router.get('/wards', wardController.getAllWards)
router.get('/wards/:id', wardController.getWardById)
router.get('/departments/:id/wards', wardController.getWardsByDepartment)
router.put('/wards/:id', wardController.updateWard)
router.delete('/wards/:id', wardController.deleteWard)

module.exports = router