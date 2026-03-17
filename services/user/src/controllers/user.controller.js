const { PrismaClient } = require('@prisma/client');
const { getCache, setCache, deleteCache } = require('../cache');

const prisma = new PrismaClient();

// ── GET MY PROFILE ──────────────────────────────────────────
const getMyProfile = async (req, res, next) => {
  try {
    // Gateway ne yeh headers set kiye the JWT verify ke baad
    const userId = req.headers['x-user-id'];

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized'
      });
    }

    // ── CACHE CHECK ───────────────────────────────
    // WHY `user:${userId}` format:
    // Redis mein keys organize karne ka convention
    // user:abc123, user:xyz789 — clearly pata chalta hai
    const cacheKey = `user:${userId}`;
    const cachedUser = await getCache(cacheKey);

    if (cachedUser) {
      // Cache mein mila — DB hit nahi hua!
      return res.json({
        success: true,
        data: cachedUser,
        source: 'cache' // Debug ke liye
      });
    }

    // ── DB FETCH ──────────────────────────────────
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        bio: true,
        avatar: true,
        createdAt: true
        // password kabhi return mat karo!
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // ── CACHE SAVE ────────────────────────────────
    // DB se mila, ab cache mein save karo
    // Agla request cache se milega
    await setCache(cacheKey, user);

    res.json({
      success: true,
      data: user,
      source: 'database'
    });

  } catch (error) {
    next(error);
  }
};

// ── UPDATE MY PROFILE ────────────────────────────────────────
const updateMyProfile = async (req, res, next) => {
  try {
    const userId = req.headers['x-user-id'];
    const { firstName, lastName, bio, avatar } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        // Sirf woh fields update karo jo bheje gaye hain
        // WHY: Agar firstName nahi bheja toh undefined na ho jaaye
        ...(firstName && { firstName }),
        ...(lastName && { lastName }),
        ...(bio && { bio }),
        ...(avatar && { avatar })
      },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        bio: true,
        avatar: true,
        updatedAt: true
      }
    });

    // ── CACHE INVALIDATE ──────────────────────────
    // WHY delete: Profile update hua toh purana
    // cache stale ho gaya — delete karo
    // Agle request pe fresh data DB se aayega
    // aur nayi cache set hogi
    await deleteCache(`user:${userId}`);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });

  } catch (error) {
    next(error);
  }
};

// ── GET USER BY ID (Admin/Public) ────────────────────────────
const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Cache check
    const cacheKey = `user:${id}`;
    const cachedUser = await getCache(cacheKey);

    if (cachedUser) {
      return res.json({
        success: true,
        data: cachedUser,
        source: 'cache'
      });
    }

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
        firstName: true,
        lastName: true,
        bio: true,
        avatar: true,
        createdAt: true
      }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    await setCache(cacheKey, user);

    res.json({
      success: true,
      data: user,
      source: 'database'
    });

  } catch (error) {
    next(error);
  }
};

// ── GET ALL USERS (Admin Only) ───────────────────────────────
const getAllUsers = async (req, res, next) => {
  try {
    // WHY role check yahan bhi:
    // Gateway JWT verify karta hai
    // but role authorization service level pe bhi honi chahiye
    // Defense in depth — multiple layers of security
    const userRole = req.headers['x-user-role'];

    if (userRole !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    // Pagination
    // WHY: 10000 users ek saath return karna DB aur network dono kill karega
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          role: true,
          firstName: true,
          lastName: true,
          createdAt: true
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.user.count()
      // WHY transaction: Dono queries ek saath chalao
      // Consistent data mile — beech mein koi naya user na aaye
    ]);

    res.json({
      success: true,
      data: {
        users,
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

module.exports = {
  getMyProfile,
  updateMyProfile,
  getUserById,
  getAllUsers
};