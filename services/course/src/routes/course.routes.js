const router = require('express').Router();
const {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  enrollCourse,
  getMyEnrollments,
  deleteCourse  
} = require('../controllers/course.controller');

// Public routes — koi bhi dekh sakta hai
router.get('/', getAllCourses);
router.get('/my-enrollments', getMyEnrollments);
router.get('/:id', getCourseById);

// Protected routes — JWT chahiye (Gateway handle karta hai)
router.post('/', createCourse);
router.put('/:id', updateCourse);
router.post('/:id/enroll', enrollCourse);
router.delete('/:id', deleteCourse);

module.exports = router;