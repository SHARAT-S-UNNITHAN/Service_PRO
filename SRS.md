# SOFTWARE REQUIREMENT SPECIFICATION (SRS)
## Service Marketplace Platform

---

## 1. INTRODUCTION

### 1.1 Introduction
The Service Marketplace Platform is a full-stack web application that connects customers seeking various home/office services (plumbing, electrical, cleaning, AC repair, etc.) with verified service providers in their local area. The platform enables users to discover providers through intelligent search, book services, and leave reviews. Service providers can register, manage their profiles, accept/reject bookings, and build reputation through customer reviews and ratings. An administrative dashboard allows platform owners to verify providers, manage complaints, and analyze platform performance.

### 1.2 Scope

**Core Features Implemented:**
- User Registration & Authentication (Three roles: Customer, Provider, Admin)
- Provider registration with document uploads (ID proof, profile photo, license)
- Provider verification system (admin approval required)
- Smart Service Search (search by service type and location)
- Booking Management System (request, accept, reject, complete workflow)
- Review & Rating System
- OTP-based Verification for completed work (ensures trust)
- Admin Dashboard (provider approval, analytics, complaint management)
- Email Notifications (booking alerts, OTP codes)
- Real-time Analytics (earnings, spending trends, platform statistics)

**User Roles:**
| Role | Description |
|------|-------------|
| User (Customer) | Searches providers, books services, submits reviews, files complaints |
| Provider | Manages profile, accepts/rejects/completes bookings, receives reviews |
| Admin | Verifies providers, manages complaints, views analytics, platform oversight |

### 1.3 Overview

**Project Type:** Full-stack Web Application (MERN Stack variant with SQLite)

**Technology Stack:**
- Frontend: React 19 with Material-UI 7 and Tailwind CSS 3.4
- Backend: Express.js 5 with Node.js
- Database: SQLite3 (file-based relational database)
- Authentication: JWT (JSON Web Tokens) with bcrypt password hashing
- File Storage: Local disk storage with Multer middleware
- Email: Nodemailer for transactional emails

---

## 2. SYSTEM ANALYSIS

### 2.1 Existing System

The traditional service marketplace relies on:
- Word-of-mouth referrals
- Phone directory listings
- Physical classified ads in newspapers
- Local bulletin boards
- Unverified classified websites

### 2.1.1 Limitations of Existing System

| Limitation | Description |
|------------|-------------|
| No Verification | No systematic provider verification process |
| No Tracking | Difficult to track booking status and history |
| No Accountability | No unified review/reputation system |
| Search Difficulty | No intelligent search by service type + location |
| Manual Process | All coordination done via phone calls |
| No Analytics | No data on provider performance or platform usage |

### 2.2 Proposed System

A现代化的全栈Web应用程序，具有:
- Role-based authentication with JWT tokens
- Provider verification workflow (pending → verified/rejected)
- Smart search with ML-based scoring algorithm
- Complete booking lifecycle management
- OTP verification for work completion
- Real-time analytics dashboards

**Key Features:**
1. Smart Provider Search - ML-style scoring based on rating, reviews, response time
2. OTP Completion Flow - Customer confirms work done with OTP from provider
3. Multi-role Dashboards - Separate dashboards for User, Provider, Admin
4. Email Notifications - Automatic alerts for booking events
5. Analytics - Earnings trends, spending patterns, platform statistics

### 2.2.1 Advantages of Proposed System

| Advantage | Description |
|-----------|-------------|
| Verified Providers | Admin verification ensures reliability |
| Trackable Bookings | Complete booking history with status tracking |
| Reputation System | Reviews and ratings build provider trust |
| Smart Search | ML-based ranking shows best providers first |
| Trust via OTP | OTP verification prevents fraudulent bookings |
| Data Analytics | Insights into platform performance |

### 2.3 Feasibility Study

#### 2.3.1 Technical Feasibility

| Component | Technology | Version |
|-----------|-----------|---------|
| Runtime | Node.js | v18+ |
| Framework | Express.js | ^5.2.1 |
| Database | SQLite3 | ^5.1.7 |
| Auth | jsonwebtoken | ^9.0.3 |
| Hashing | bcrypt/bcryptjs | ^6.0.0 |
| Security | helmet | ^8.1.0 |
| CORS | cors | ^2.8.6 |
| Upload | multer | ^2.1.1 |
| Email | nodemailer | ^8.0.4 |
| Frontend | React | ^19.2.4 |
| UI Library | @mui/material | ^7.3.9 |
| CSS | Tailwind CSS | ^3.4.17 |
| Charts | recharts | ^3.8.1 |

**Status: ✅ All technologies are established and production-ready**

#### 2.3.2 Operational Feasibility

- Simple role-based access control
- Intuitive dashboard interfaces
- Real-time booking status updates
- Automated email notifications
- Self-explanatory user flows

**Status: ✅ System can be operated with minimal training**

#### 2.3.3 Economical Feasibility

| Cost Factor | Assessment |
|------------|------------|
| License Costs | Zero - all open-source technologies |
| Hosting | Low - can run on local infrastructure |
| Maintenance | Low - SQLite requires no DBA |
| Development | Moderate - requires skilled developers |

**Status: ✅ Cost-effective solution**

---

## 3. SYSTEM SPECIFICATION

### 3.1 System Specifications

#### 3.1.1 Hardware Specifications

| Requirement | Minimum | Recommended |
|-------------|---------|-------------|
| Processor | Intel Core i5 / equivalent | Intel Core i7 / equivalent |
| RAM | 8 GB | 16 GB |
| Storage | 50 GB available | 100 GB+ available |
| Network | Internet connection | Broadband |

#### 3.1.2 Software Specifications

| Requirement | Specification |
|-------------|----------------|
| Node.js | v18 or higher |
| npm | v9 or higher |
| Browser (Dev) | Chrome 90+, Firefox 88+, Safari 14+ |
| OS | Windows 10+, macOS 11+, Ubuntu 20.04+ |

---

### 3.2 Technology Overview

#### 3.2.1 Backend and Frontend

**Backend Project Structure:**
```
server/
├── index.js              # Main Express server entry point
├── db.js               # SQLite database schema & connections
├── package.json        # Server dependencies
├── .env               # Environment variables
├── routes/
│   ├── auth.js        # /signup, /login, /provider/register
│   ├── user.js       # /user/* (bookings, reviews, profile)
│   ├── provider.js   # /provider/* (bookings, status, profile)
│   ├── admin.js      # /admin/* (verification, management)
│   └── completion.js # OTP verification routes
├── middleware/
│   ├── auth.js       # JWT authentication & role checking
│   └── multer.js     # File upload configuration
├── services/
│   └── emailService.js # Nodemailer email templates
└── uploads/          # Uploaded files (photos, documents)
```

**Backend Dependencies (package.json):**
```json
{
  "express": "^5.2.1",
  "sqlite3": "^5.1.7",
  "jsonwebtoken": "^9.0.3",
  "bcrypt": "^6.0.0",
  "bcryptjs": "^3.0.3",
  "cors": "^2.8.6",
  "helmet": "^8.1.0",
  "multer": "^2.1.1",
  "nodemailer": "^8.0.4",
  "dotenv": "^17.3.1"
}
```

**Frontend Project Structure:**
```
client/
├── src/
│   ├── App.js                # React Router configuration
│   ├── index.js              # React DOM entry point
│   ├── index.css             # Global Tailwind styles
│   ├── pages/
│   │   ├── Home.jsx         # Landing page with search
│   │   ├── Login.jsx        # User login
│   │   ├── Signup.jsx       # User registration
│   │   ├── ProvSignup.jsx   # Provider registration
│   │   ├── SearchPage.jsx   # Search results
│   │   ├── UniversalSearchPage.jsx # Navbar search
│   │   ├── ProviderDetail.jsx # Public provider profile
│   │   ├── Profile.jsx      # User profile page
│   │   ├── About.jsx        # About page
│   │   ├── HelpCenter.jsx   # Help page
│   │   ├── FAQs.jsx         # FAQ page
│   │   ├── Terms.jsx       # Terms of service
│   │   ├── Privacy.jsx     # Privacy policy
│   │   ├── Safety.jsx      # Safety guidelines
│   │   ├── UserDashboard.jsx    # Customer dashboard
│   │   ├── ProvDashboard.jsx    # Provider dashboard
│   │   └── AdminDashboard.jsx  # Admin dashboard
│   ├── components/
│   │   ├── Navbar.jsx      # Top navigation
│   │   ├── Footer.jsx     # Page footer
│   │   ├── RoleRoute.jsx   # Protected route wrapper
│   │   ├── ExploreSection.jsx # Service categories
│   │   ├── admin/
│   │   │   ├── AdminSidebar.jsx
│   │   │   ├── DashboardSection.jsx
│   │   │   ├── AdminAnalytics.jsx
│   │   │   ├── ProvidersSection.jsx
│   │   │   ├── CustomersSection.jsx
│   │   │   ├── ComplaintsSection.jsx
│   │   │   ├── HelpCenterSection.jsx
│   │   │   └── ProviderDetailAdmin.jsx
│   │   ├── provider/
│   │   │   ├── Sidebar.jsx
│   │   │   ├── DashboardOverview.jsx
│   │   │   ├── BookingsSection.jsx
│   │   │   ├── AnalyticsSection.jsx
│   │   │   ├── ProfileSection.jsx
│   │   │   ├── ReviewsSection.jsx
│   │   │   ├── DocumentsSection.jsx
│   │   │   ├── NotificationsSection.jsx
│   │   │   └── OtpCompletionModal.jsx
│   │   └── user/
│   │       ├── UserSidebar.jsx
│   │       ├── MyBookings.jsx
│   │       ├── ProfileInfo.jsx
│   │       ├── OtpNotifications.jsx
│   │       └── ConfirmWorkModal.jsx
│   └── hooks/
│       └── useTheme.js    # Theme hook
├── public/
│   └── index.html
├── package.json
├── tailwind.config.js
└── postcss.config.js
```

**Frontend Dependencies (package.json):**
```json
{
  "react": "^19.2.4",
  "react-dom": "^19.2.4",
  "react-router-dom": "^7.13.1",
  "@mui/material": "^7.3.9",
  "@emotion/react": "^11.14.0",
  "@emotion/styled": "^11.14.1",
  "@fortawesome/react-fontawesome": "^3.2.0",
  "axios": "^1.13.6",
  "recharts": "^3.8.1",
  "tailwindcss": "^3.4.17"
}
```

**Database Schema (Tables):**

| Table | Primary Key | Purpose |
|-------|------------|---------|
| users | id | Authentication (email, password, role) |
| providers | id | Provider profiles with verification status |
| provider_professions | (provider_id, profession) | Services offered by providers |
| customers | id | Customer profiles |
| bookings | id | Service requests with status |
| reviews | id | Provider ratings and feedback |
| provider_complaints | id | Complaint management |
| booking_otps | id | OTP codes for work completion |

---

## API ENDPOINTS SUMMARY

### Public Routes
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/signup` | POST | User registration |
| `/login` | POST | User login |
| `/provider/register` | POST | Provider registration with docs |
| `/providers/:id` | GET | Public provider profile |
| `/search/providers` | GET | Search by service & location |
| `/api/search` | GET | Universal navbar search |

### User Routes (Protected)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/user/profile` | GET/PUT | User profile management |
| `/user/bookings` | GET/POST | List/create bookings |
| `/user/reviews` | GET/POST | List/create reviews |
| `/user/otp-notifications` | GET | OTP notifications list |
| `/user/complaints` | POST | Submit complaint |

### Provider Routes (Protected)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/provider/profile` | GET/PUT | Provider profile |
| `/provider/status` | GET | Verification status |
| `/provider/professions` | GET | Provider professions |
| `/provider/bookings` | GET | List bookings |
| `/provider/bookings/:id/accept` | PATCH | Accept booking |
| `/provider/bookings/:id/reject` | PATCH | Reject booking |
| `/provider/bookings/:id/complete` | PATCH | Complete booking |
| `/provider/reviews` | GET | Provider reviews |

### Admin Routes (Protected)
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/admin/providers` | GET | List providers |
| `/admin/providers/:id/verify` | PATCH | Verify provider |
| `/admin/providers/:id/reject` | PATCH | Reject provider |
| `/admin/complaints` | GET | List complaints |
| `/admin/analytics` | GET | Platform analytics |

### Analytics Routes
| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/provider/earnings/trend` | GET | Earnings (30 days) |
| `/api/provider/performance/weekly` | GET | Weekly performance |
| `/api/customer/spending/trend` | GET | Spending (6 months) |
| `/api/admin/overview` | GET | Platform overview |
| `/api/admin/leaderboard` | GET | Top providers |

---

*Document Version: 1.0*
*Generated from: Service Marketplace Project Codebase*

---

## 4. SYSTEM DESIGN AND DEVELOPMENT

### 4.1 Infrastructure Design
The system follows a client-server architecture with React frontend and Node.js/Express backend:
- Frontend: React 19 with Material-UI 7 and Tailwind CSS 3.4
- Backend: Express.js 5 with Node.js
- Database: SQLite3 (file-based relational database)
- Authentication: JWT tokens with role-based access control
- File Storage: Local filesystem with Multer middleware
- Email: Nodemailer for transactional emails

### 4.2 Input Design
User input forms include:
- Registration forms: Name, email, phone, password, role selection
- Provider registration: Profile photo, ID proof, profession selection
- Search filters: Location, profession, price range, rating
- Booking form: Date, time, address, description
- Review form: Rating (1-5), comment
- Complaint form: Description, evidence

### 4.3 Output Design
The system provides multiple output formats:
- Dashboard views: Role-specific dashboards with data tables
- Search results: Provider cards with ratings, prices
- Analytics charts: Earnings/spending trends, platform statistics
- Booking status: Real-time status updates (Pending, Accepted, Completed)
- Email notifications: OTP codes, booking confirmations

### 4.4 Data Flow Diagram

#### 4.4.1 Level 0 DFD
- Single system boundary with external entities: User, Provider, Admin
- Data flows: Authentication, Booking requests, Status updates

#### 4.4.2 Level 1 User DFD
- Processes: Search providers, Make bookings, View history, Submit reviews
- Data stores: Users, Providers, Bookings

#### 4.4.3 Level 1 Admin DFD
- Processes: Verify providers, Handle complaints, View analytics
- Data stores: Providers, Complaints, Bookings

### 4.5 Analysis Tools

#### 4.5.1 Use-Case Diagram
- User: Register, Search, Book, Review, Track booking
- Provider: Register, Accept/Reject, Complete work, View analytics
- Admin: Verify provider, Handle complaint, View analytics

### 4.6 Database Design
Tables designed with proper relationships:
- users: id, name, email, password, role, created_at
- providers: user_id, profession, hourly_rate, verified, rating
- provider_professions: id, name
- customers: user_id, address, phone
- bookings: customer_id, provider_id, status, date, amount
- reviews: booking_id, rating, comment
- provider_complaints: id, provider_id, description, status
- booking_otps: id, booking_id, otp, verified

### 4.7 Entity-Relationship Diagram
ERD shows relationships:
- users (1) → (1) providers
- users (1) → (1) customers
- providers (1) → (N) bookings
- customers (1) → (N) bookings
- bookings (1) → (1) reviews
- providers (1) → (N) complaints

---

## 5. SYSTEM TESTING

### 5.1 Introduction

#### 5.1.1 Types of Testing

##### 5.1.1.1 White Box Testing
- Database query validation
- API endpoint response verification
- JWT token generation and validation tests

##### 5.1.1.2 Black Box Testing
- User registration flow testing
- Provider search functionality
- Booking creation and status updates

##### 5.1.1.3 Unit Testing
- Individual component rendering in React
- Route protection middleware
- Form validation functions

##### 5.1.1.4 Integration Testing
- Frontend-backend API integration
- Authentication flow across components
- Payment/booking workflow

##### 5.1.1.5 Validation Testing
- Input form validation (email, phone, password)
- Required field validation
- Data type validation

##### 5.1.1.6 Output Testing
- Dashboard data display accuracy
- Search result matching
- Analytics calculation verification

### 5.2 Test Cases

| Test Case | Input | Expected Output |
|----------|-------|----------------|
| User Registration | Valid user details | User created, redirect to login |
| Provider Search | Location, profession filter | Filtered provider list |
| Book Service | Booking details | Booking created with "Pending" status |
| Complete Work | Valid OTP | Status changed to "Completed" |

---

## 6. SYSTEM IMPLEMENTATION

### 6.1 Introduction
The Service Marketplace Platform is a full-stack web application implementing:
- User authentication and authorization
- Provider verification workflow
- OTP-based work completion
- Real-time analytics

### 6.2 Implementation Procedure
1. Install dependencies: npm install in both client and server directories
2. Initialize database: sqlite3 server/app.db < server/db.js
3. Start backend: node server/index.js (port 5000)
4. Start frontend: npm start (port 3000)
5. Access: http://localhost:3000

---

## 7. WEBSITE MAINTENANCE FOR EXPENSE TRACKER

### 7.1 Corrective Maintenance
- Bug fixes for reported issues
- Database schema updates
- API error handling improvements

### 7.2 Adaptive Maintenance
- Browser compatibility updates
- Security patches
- New feature integrations

### 7.3 Perfective Maintenance
- UI/UX improvements
- Performance optimization
- Additional analytics features

### 7.4 Preventive Maintenance
- Database backup automation
- Security audits
- Code refactoring

---

## 8. CONCLUSION

The Service Marketplace Platform successfully provides:
- Secure role-based authentication for Users, Providers, and Admins
- Provider verification workflow ensuring service quality
- OTP-based work completion preventing fraudulent activities
- Comprehensive analytics for informed decision-making
- Complaint management for dispute resolution
- Email notifications for real-time updates

The system is fully functional and meets all specified requirements.

---

## 9. FUTURE ENHANCEMENT

- Payment gateway integration (Razorpay, Stripe)
- Real-time chat between users and providers
- Mobile application (React Native)
- AI-based provider recommendations
- Multi-language support
- Calendar integration
- Video calling for consultations
- Subscription plans for providers

---

## 10. APPENDIX

### 10.1 Screenshots
- Home page with search functionality
- User dashboard with booking history
- Provider dashboard with earnings analytics
- Admin dashboard with platform statistics
- Booking confirmation and OTP completion modals

### 10.2 Sample Source Code

Database Schema (server/db.js):
```javascript
const db = new sqlite3.Database('./app.db');
db.run(`CREATE TABLE IF NOT EXISTS users (...)`);
db.run(`CREATE TABLE IF NOT EXISTS providers (...)`);
```

Backend Routes (server/index.js):
```javascript
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/provider', providerRoutes);
app.use('/api/admin', adminRoutes);
```

Frontend Routing (client/src/App.js):
```javascript
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/dashboard" element={<RoleRoute />} />
</Routes>
```

### 10.3 Gantt Chart
- Week 1-2: Requirements Analysis
- Week 3-4: System Design
- Week 5-8: Development
- Week 9-10: Testing
- Week 11: Deployment

---

## 11. REFERENCE

- React Documentation: https://react.dev 
- Express.js: https://expressjs.com
- SQLite3: https://www.sqlite.org
- JWT: https://jwt.io
- Node.js: https://nodejs.org
- Tailwind CSS: https://tailwindcss.com
- Nodemailer: https://nodemailer.com

---

*Document Version: 1.0*
*Generated from: Service Marketplace Project Codebase*
