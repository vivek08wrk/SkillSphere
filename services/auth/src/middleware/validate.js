// WHY validation middleware:
// Controller mein validation likhoge toh code messy hoga
// Middleware mein likhne se controller clean rehta hai — sirf business logic

const validateRegister = (req, res, next) => {
  const { email, password, role } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email and password are required' 
    });
  }

  // Basic email format check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Invalid email format' 
    });
  }

  if (password.length < 6) {
    return res.status(400).json({ 
      success: false, 
      message: 'Password must be at least 6 characters' 
    });
  }

  // Role valid hai ya nahi
  const validRoles = ['STUDENT', 'INSTRUCTOR'];
  if (role && !validRoles.includes(role)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Role must be STUDENT or INSTRUCTOR' 
    });
  }

  next(); // Validation pass — controller ko jaane do
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email and password are required' 
    });
  }

  next();
};

module.exports = { validateRegister, validateLogin };