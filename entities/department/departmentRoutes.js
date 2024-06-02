const router = require('express').Router()
const departmentController = require('./departmentController')

router.post('/departments', departmentController.newDepartment)
router.get('/departments', departmentController.getAllDepartments)
router.get('/departments/:id', departmentController.getDepartmentById)
router.put('/departments/:id', departmentController.updateDepartment)
router.delete('/departments/:id', departmentController.deleteDepartment)

module.exports = router