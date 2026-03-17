const paymentSuccessEmail = (data) => {
  return {
    to: data.studentEmail || 'student@example.com',
    subject: '🎉 Enrollment Confirmed — SkillSphere',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 40px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; }
          .header p { color: rgba(255,255,255,0.8); margin: 10px 0 0; }
          .body { padding: 40px; }
          .card { background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0; border-left: 4px solid #2563eb; }
          .card p { margin: 5px 0; color: #374151; }
          .card strong { color: #111827; }
          .btn { display: inline-block; background: #2563eb; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0; }
          .footer { background: #f8fafc; padding: 20px; text-align: center; color: #9ca3af; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Enrollment Confirmed!</h1>
            <p>You're all set to start learning</p>
          </div>
          <div class="body">
            <p style="color: #374151; font-size: 16px;">
              Congratulations! Your payment was successful and you have been enrolled in the course.
            </p>
            <div class="card">
              <p><strong>Payment ID:</strong> ${data.paymentId}</p>
              <p><strong>Amount Paid:</strong> $${data.amount}</p>
              <p><strong>Course ID:</strong> ${data.courseId}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-IN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</p>
            </div>
            <p style="color: #374151;">
              You can now access your course from your dashboard. Happy learning!
            </p>
            <a href="http://localhost:3006/dashboard" class="btn">
              Go to Dashboard →
            </a>
          </div>
          <div class="footer">
            <p>© 2024 SkillSphere. All rights reserved.</p>
            <p>This is an automated email. Please do not reply.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

const welcomeEmail = (data) => {
  return {
    to: data.email,
    subject: '👋 Welcome to SkillSphere!',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; background: #f4f4f4; margin: 0; padding: 0; }
          .container { max-width: 600px; margin: 40px auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #2563eb, #7c3aed); padding: 40px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; }
          .body { padding: 40px; }
          .btn { display: inline-block; background: #2563eb; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; margin: 20px 0; }
          .footer { background: #f8fafc; padding: 20px; text-align: center; color: #9ca3af; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>👋 Welcome to SkillSphere!</h1>
          </div>
          <div class="body">
            <p style="color: #374151; font-size: 16px;">
              Hi <strong>${data.email}</strong>,
            </p>
            <p style="color: #374151;">
              Your account has been created successfully. Start exploring our courses and begin your learning journey today!
            </p>
            <a href="http://localhost:3006/courses" class="btn">
              Browse Courses →
            </a>
          </div>
          <div class="footer">
            <p>© 2024 SkillSphere. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `
  };
};

module.exports = { paymentSuccessEmail, welcomeEmail };