const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const { createClient } = require('redis');

const prisma = new PrismaClient();

const redisClient = createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});
redisClient.connect().catch(console.error);

// ── HELPER: Tokens Generate Karo ───────────────────────────
const generateTokens = (userId, role) => {
  // Access Token — short lived (15 min)
  const accessToken = jwt.sign(
    { userId, role },           // payload — kya store karna hai token mein
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );

  // Refresh Token — long lived (7 days)
  const refreshToken = jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d' }
  );

  return { accessToken, refreshToken };
};

// ── REGISTER ────────────────────────────────────────────────
const register = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    // 1. Check karo user already exist karta hai kya
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: 'Email already registered' 
      });
    }

    // 2. Password hash karo
    // WHY 12 rounds: Higher = more secure but slower
    // 12 is sweet spot for production
    const hashedPassword = await bcrypt.hash(password, 12);

    // 3. User banao DB mein
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: role || 'STUDENT'
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true
        // WHY select: Password field return mat karo kabhi
      }
    });

    await redisClient.publish('USER_REGISTERED', JSON.stringify({
  eventName: 'USER_REGISTERED',
  data: {
    userId: user.id,
    email: user.email,
    role: user.role,
    name: user.name || null,
    password: user.password
  },
  timestamp: new Date().toISOString()
}));

    // 4. Tokens generate karo
    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    // 5. Refresh token DB mein save karo
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 din baad expire

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt
      }
    });

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user,
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    next(error); // Global error handler ko bhejo
  }
};

// ── LOGIN ───────────────────────────────────────────────────
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // 1. User dhundo
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // WHY same message for wrong email AND wrong password?
      // Attacker ko yeh pata nahi chalna chahiye ki email exist karta hai ya nahi
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // 2. Password verify karo
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }

    // 3. Tokens generate karo
    const { accessToken, refreshToken } = generateTokens(user.id, user.role);

    // 4. Refresh token save karo
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt
      }
    });

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
    name: user.name || null,
    password: user.password
        },
        accessToken,
        refreshToken
      }
    });

  } catch (error) {
    next(error);
  }
};

// ── REFRESH TOKEN ────────────────────────────────────────────
const refreshToken = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: 'Refresh token required' 
      });
    }

    // 1. Token verify karo
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    } catch {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid or expired refresh token' 
      });
    }

    // 2. DB mein check karo token exist karta hai
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!storedToken || storedToken.expiresAt < new Date()) {
      return res.status(401).json({ 
        success: false, 
        message: 'Refresh token expired or not found' 
      });
    }

    // 3. Naya access token do
    const accessToken = jwt.sign(
      { userId: storedToken.user.id, role: storedToken.user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
    );

    res.json({
      success: true,
      data: { accessToken }
    });

  } catch (error) {
    next(error);
  }
};

// ── LOGOUT ──────────────────────────────────────────────────
const logout = async (req, res, next) => {
  try {
    const { refreshToken: token } = req.body;

    if (token) {
      // Refresh token DB se delete karo
      // WHY: Token blacklist karo taaki reuse na ho sake
      await prisma.refreshToken.deleteMany({
        where: { token }
      });
    }

    res.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });

  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, refreshToken, logout };