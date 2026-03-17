const { PrismaClient } = require('@prisma/client');
const { getCache, setCache, deleteCache } = require('../cache');

const prisma = new PrismaClient();

// ── CREATE COURSE (Instructor only) ─────────────────────────
const createCourse = async (req, res, next) => {
  try {
    const instructorId = req.headers['x-user-id'];
    const userRole = req.headers['x-user-role'];

    // Role check — sirf instructor ya admin course bana sakta hai
    if (userRole !== 'INSTRUCTOR' && userRole !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Only instructors can create courses'
      });
    }

   const body = req.body || {};
const { title, description, price, thumbnail, isPublished } = body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    const course = await prisma.course.create({
      data: {
        title,
        description,
        price: price || 0,
        thumbnail,
        instructorId
        // isPublished default false — draft mode mein rahega
      }
    });

    // Courses list cache delete karo
    // WHY: Naya course aaya — cached list outdated ho gayi
    await deleteCache('courses:all');

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: course
    });

  } catch (error) {
    next(error);
  }
};

// ── GET ALL COURSES (Public) ─────────────────────────────────
const getAllCourses = async (req, res, next) => {
  try {
    const instructorId = req.headers['x-user-id'];
    const role = req.headers['x-user-role'];
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Instructor apne sab courses dekhe
    // Student sirf published dekhe
    const where = role === 'INSTRUCTOR'
      ? { instructorId }           // Instructor ke apne sab courses
      : { isPublished: true };     // Students ke liye sirf published

    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          title: true,
          description: true,
          price: true,
          thumbnail: true,
          instructorId: true,
          isPublished: true,
          createdAt: true,
          _count: { select: { enrollments: true } }
        }
      }),
      prisma.course.count({ where })
    ]);

    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// ── GET SINGLE COURSE ────────────────────────────────────────
const getCourseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cacheKey = `course:${id}`;

    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json({
        success: true,
        data: cached,
        source: 'cache'
      });
    }

    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        // Enrollment count include karo
        _count: {
          select: { enrollments: true }
        }
      }
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    await setCache(cacheKey, course);

    res.json({
      success: true,
      data: course,
      source: 'database'
    });

  } catch (error) {
    next(error);
  }
};

// ── UPDATE COURSE (Instructor only) ─────────────────────────
const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const instructorId = req.headers['x-user-id'];
    const userRole = req.headers['x-user-role'];

    console.log('Update body:', req.body);

    

    // Course exist karta hai?
    const course = await prisma.course.findUnique({
      where: { id }
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Sirf apna course update kar sakta hai instructor
    // Admin sab update kar sakta hai
    if (userRole !== 'ADMIN' && course.instructorId !== instructorId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own courses'
      });
    }

    const { title, description, price, thumbnail, isPublished } = req.body;

    const updated = await prisma.course.update({
  where: { id },
  data: {
    ...(title !== undefined && { title }),
    ...(description !== undefined && { description }),
    ...(price !== undefined && { price }),
    ...(thumbnail !== undefined && { thumbnail }),
    ...(isPublished !== undefined && { isPublished })
  }
});

    // Cache invalidate karo
    await deleteCache(`course:${id}`);
    await deleteCache('courses:all');

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: updated
    });

  } catch (error) {
    next(error);
  }
};

// ── ENROLL IN COURSE (Student) ───────────────────────────────
const enrollCourse = async (req, res, next) => {
  try {
    const { id: courseId } = req.params;
    const studentId = req.headers['x-user-id'];

    // Course exist karta hai?
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (!course.isPublished) {
      return res.status(400).json({
        success: false,
        message: 'Course is not published yet'
      });
    }

    // Already enrolled?
    const existing = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: { studentId, courseId }
        // WHY yeh syntax: @@unique([studentId, courseId]) se
        // Prisma automatically compound key banata hai
      }
    });

    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Already enrolled in this course'
      });
    }

    const enrollment = await prisma.enrollment.create({
      data: { studentId, courseId }
    });

    // Student ki enrolled courses cache delete karo
    await deleteCache(`enrollments:${studentId}`);

    res.status(201).json({
      success: true,
      message: 'Enrolled successfully',
      data: enrollment
    });

  } catch (error) {
    next(error);
  }
};

// ── GET MY ENROLLMENTS ───────────────────────────────────────
const getMyEnrollments = async (req, res, next) => {
  try {
    console.log('ALL HEADERS:', req.headers);
    const studentId = req.headers['x-user-id']; 
     console.log('STUDENT ID:', studentId);

    if (!studentId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    const cacheKey = `enrollments:${studentId}`;
    const cached = await getCache(cacheKey);
    if (cached) {
      return res.json({ success: true, data: cached, source: 'cache' });
    }

    const enrollments = await prisma.enrollment.findMany({
      where: { studentId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            description: true,
            thumbnail: true,
            instructorId: true
          }
        }
      }
    });

    await setCache(cacheKey, enrollments);

    res.json({ success: true, data: enrollments, source: 'database' });
  } catch (err) {
    next(err);
  }
};

// ── DELETE COURSE (Instructor only) ─────────────────────────
const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const instructorId = req.headers['x-user-id'];
    const userRole = req.headers['x-user-role'];

    const course = await prisma.course.findUnique({ where: { id } });

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (userRole !== 'ADMIN' && course.instructorId !== instructorId) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own courses'
      });
    }

    await prisma.course.delete({ where: { id } });

    await deleteCache(`course:${id}`);
    await deleteCache('courses:all');

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};



module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  enrollCourse,
  getMyEnrollments,
  deleteCourse 
};