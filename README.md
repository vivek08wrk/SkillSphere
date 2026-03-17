# SkillSphere 🎓

A production-ready microservices-based online learning platform built with Node.js, Next.js, PostgreSQL, Redis, Docker, and Stripe.

---

## 🏗️ Architecture
```
Client (Next.js) → API Gateway → Microservices
                                  ├── Auth Service
                                  ├── User Service
                                  ├── Course Service
                                  ├── Payment Service
                                  └── Notification Service
                                        ↓
                              PostgreSQL + Redis
```

---

## 🚀 Tech Stack

### Backend
| Technology | Purpose |
|---|---|
| Node.js + Express | Microservices |
| PostgreSQL | Primary Database |
| Prisma ORM | Database queries |
| Redis | Caching + Pub/Sub |
| JWT | Authentication |
| Stripe | Payment Gateway |
| Nodemailer | Email notifications |
| Docker | Containerization |

### Frontend
| Technology | Purpose |
|---|---|
| Next.js 14 | React Framework |
| Tailwind CSS | Styling |
| Stripe.js | Payment UI |
| React Hot Toast | Notifications |

---

## 📁 Project Structure
```
SkillSphere/
├── gateway/                  # API Gateway (Port 3000)
├── services/
│   ├── auth/                 # Auth Service (Port 3001)
│   ├── user/                 # User Service (Port 3002)
│   ├── course/               # Course Service (Port 3003)
│   ├── payment/              # Payment Service (Port 3004)
│   └── notification/         # Notification Service (Port 3005)
├── frontend/                 # Next.js Frontend (Port 3006)
├── docker-compose.yml
└── README.md
```

---

## ⚙️ Services Overview

### 🚪 API Gateway (Port 3000)
- Single entry point for all requests
- JWT verification
- Rate limiting
- Request proxying to services
- CORS handling

### 🔐 Auth Service (Port 3001)
- User registration & login
- JWT access + refresh tokens
- bcrypt password hashing
- Token refresh & logout

### 👤 User Service (Port 3002)
- User profile management
- Redis caching for fast responses
- Profile update with cache invalidation

### 📚 Course Service (Port 3003)
- Course CRUD operations
- Student enrollment
- Redis caching
- Event subscriber (auto-enrollment on payment)

### 💳 Payment Service (Port 3004)
- Stripe payment integration
- Payment intent creation
- Webhook handling
- Event publishing on payment success

### 🔔 Notification Service (Port 3005)
- Redis event subscriber
- Email notifications via Nodemailer
- Welcome email on registration
- Enrollment confirmation on payment

---

## 🔄 Event-Driven Architecture
```
Payment Service ──publishes──► Redis Pub/Sub ──triggers──► Course Service
                                                    └──────────► Notification Service

Events:
├── PAYMENT_COMPLETED → Auto-enroll student + Send email
└── USER_REGISTERED   → Send welcome email
```

---

## 🛠️ Local Setup

### Prerequisites
- Docker Desktop
- Node.js 18+
- Git

### 1. Clone the repository
```bash
git clone https://github.com/vivek08wrk/SkillSphere.git
cd SkillSphere
```

### 2. Create environment file
Create `.env` in root directory:
```env
STRIPE_SECRET_KEY=sk_test_xxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxx
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=SkillSphere <your_gmail@gmail.com>
```

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxx
```

### 3. Start all services
```bash
docker-compose up --build
```

### 4. Run database migrations
```bash
docker exec skillsphere_auth npx prisma db push --skip-generate
docker exec skillsphere_user npx prisma db push --skip-generate
docker exec skillsphere_course npx prisma db push --skip-generate
docker exec skillsphere_payment npx prisma db push --skip-generate
```

### 5. Start Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## 🌐 Access Points

| Service | URL |
|---|---|
| Frontend | http://localhost:3006 |
| API Gateway | http://localhost:3000 |
| Auth Service | http://localhost:3001 |
| User Service | http://localhost:3002 |
| Course Service | http://localhost:3003 |
| Payment Service | http://localhost:3004 |
| Notification Service | http://localhost:3005 |

---

## 📡 API Endpoints

### Auth
```
POST /auth/register     → Register new user
POST /auth/login        → Login user
POST /auth/refresh      → Refresh access token
POST /auth/logout       → Logout user
```

### Courses
```
GET    /courses              → Get all published courses
GET    /courses/:id          → Get course by ID
POST   /courses              → Create course (Instructor)
PUT    /courses/:id          → Update course (Instructor)
DELETE /courses/:id          → Delete course (Instructor)
POST   /courses/:id/enroll   → Enroll in course (Student)
GET    /courses/my-enrollments → Get my enrollments (Student)
```

### Payments
```
POST /payments          → Create payment intent
GET  /payments          → Get my payments
POST /payments/webhook  → Stripe webhook
```

### Users
```
GET /users/profile      → Get my profile
PUT /users/profile      → Update my profile
GET /users/:id          → Get user by ID
```

---

## 💳 Test Payment

Use Stripe test card:
```
Card Number : 4242 4242 4242 4242
Expiry      : 12/26
CVC         : 123
```

---

## 🐳 Docker Commands
```bash
# Start all services
docker-compose up -d

# Rebuild specific service
docker-compose build --no-cache <service_name>

# View logs
docker logs skillsphere_<service> --tail 20

# Stop all services
docker-compose down

# Clear Redis cache
docker exec skillsphere_redis redis-cli FLUSHALL
```

---

## 👤 User Roles

| Role | Permissions |
|---|---|
| STUDENT | Browse courses, Purchase, View enrollments |
| INSTRUCTOR | Create/Edit/Delete own courses, View earnings |
| ADMIN | Full access to all resources |

---

## 🔐 Environment Variables

| Variable | Service | Description |
|---|---|---|
| JWT_SECRET | Auth, Gateway | JWT signing secret |
| DATABASE_URL | All services | PostgreSQL connection string |
| REDIS_URL | All services | Redis connection string |
| STRIPE_SECRET_KEY | Payment | Stripe secret key |
| STRIPE_WEBHOOK_SECRET | Payment | Stripe webhook secret |
| EMAIL_USER | Notification | Gmail address |
| EMAIL_PASS | Notification | Gmail app password |

---

## 🗺️ Roadmap

- [x] Auth Service
- [x] API Gateway
- [x] User Service + Redis Cache
- [x] Course Service + Enrollments
- [x] Payment Service + Events
- [x] Notification Service + Email
- [x] Docker Compose
- [x] Next.js Frontend
- [x] Stripe Payment Gateway
- [ ] AWS Deployment
- [ ] Real-time notifications (Socket.io)
- [ ] Course content/videos
- [ ] Reviews & ratings

---

## 👨‍💻 Author

**Vivek** — Full Stack Developer

---

## 📄 License

MIT License