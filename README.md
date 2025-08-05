# Faculty Evaluation System

A comprehensive web-based faculty evaluation system that allows students to submit reviews for faculty members, faculty to view their reviews, and administrators to manage the system.

## Features

### 🔐 Authentication System
- **Static Admin Login**: Pre-configured admin credentials (configurable via environment variables)
- **Faculty Login**: Secure login with email and password
- **Student Login**: Secure login with email and password
- **User Registration**: Signup for faculty and students with role-based forms

### 👨‍🏫 Faculty Management
- **Department Assignment**: Faculty can be assigned to specific departments
- **Profile Management**: Faculty can view and edit their profile information
- **Review Dashboard**: Faculty can view reviews submitted by students
- **Performance Analytics**: View average ratings and feedback

### 👨‍🎓 Student Features
- **Review Submission**: Submit detailed reviews for faculty members
- **Faculty Selection**: Dropdown menus for department and faculty selection
- **Rating System**: Comprehensive rating system with multiple criteria
- **Profile Management**: Students can manage their profile information

### 👨‍💼 Admin Features
- **System Overview**: Dashboard with system statistics
- **User Management**: View and manage all users
- **Review Analytics**: Comprehensive review analysis and reporting
- **System Configuration**: Admin-level system settings

### 📊 Review System
- **Comprehensive Ratings**: 12 different rating criteria
- **Department-based Filtering**: Filter faculty by department
- **Real-time Updates**: Reviews appear immediately after submission
- **Feedback System**: Students can provide suggestions and comments

## Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **bcryptjs** - Password hashing
- **CORS** - Cross-origin resource sharing

### Frontend
- **React.js** - Frontend framework
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling framework
- **React Icons** - Icon library

## Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Backend Setup
```bash
cd backend
npm install
```

#### Environment Variables Setup
1. Copy the example environment file:
   ```bash
   cp env.example .env
   ```

2. Edit the `.env` file with your configuration:
   ```env
   # MongoDB Connection
   MONGO_URI=mongodb://localhost:27017/faculty_evaluation
   
   # Server Port
   PORT=5000
   
   # Static Admin Credentials
   ADMIN_EMAIL=admin@college.com
   ADMIN_PASSWORD=password
   ADMIN_NAME=Admin
   
   # JWT Secret (optional)
   JWT_SECRET=your_jwt_secret_key_here
   
   # Environment
   NODE_ENV=development
   ```

3. Start the backend server:
   ```bash
   npm start
   ```

### Frontend Setup
```bash
cd frontend
npm install
```

Start the frontend development server:
```bash
npm start
```

## Usage

### Admin Access
1. Navigate to the homepage
2. Click "Admin Login"
3. Use credentials from your `.env` file (default: `admin@college.com` / `password`)
4. Access admin dashboard with full system control

### Faculty Registration
1. Go to signup page
2. Select "Faculty" role
3. Fill in name, email, password
4. Select department from dropdown
5. Submit registration

### Student Registration
1. Go to signup page
2. Select "Student" role
3. Fill in username, email, password
4. Submit registration

### Submitting Reviews
1. Login as a student
2. Navigate to review form
3. Select department and faculty
4. Fill in all required fields
5. Submit review

### Viewing Reviews (Faculty)
1. Login as faculty
2. Dashboard shows recent reviews
3. View average ratings and feedback
4. Access detailed review analytics

## API Endpoints

### Authentication
- `POST /api/adminlogin` - Admin login
- `POST /api/facultylogin` - Faculty login
- `POST /api/login` - Student login
- `POST /api/signup` - User registration

### Faculty Management
- `GET /api/faculty` - Get all faculty members
- `GET /api/faculty/department/:department` - Get faculty by department

### Review Management
- `POST /api/review` - Submit new review
- `GET /api/review` - Get all reviews
- `GET /api/review/faculty/:name/:department` - Get reviews for specific faculty

## Database Schema

### Faculty Collection
```javascript
{
  email: String (unique),
  name: String,
  department: String,
  password: String (hashed),
  role: String (default: 'Faculty')
}
```

### Student Collection
```javascript
{
  email: String (unique),
  username: String,
  password: String (hashed),
  role: String (default: 'Student')
}
```

### Review Collection
```javascript
{
  studentName: String,
  admissionNo: String,
  branchSemester: String,
  teacherName: String,
  teacherSubject: String,
  teacherDepartment: String,
  ratings: {
    conceptExplanation: Number,
    subjectKnowledge: Number,
    contentOrganization: Number,
    classTiming: Number,
    learningEnvironment: Number,
    studentParticipation: Number,
    feedbackQuality: Number,
    resourceUtilization: Number,
    innovation: Number,
    accessibility: Number,
    supportiveness: Number,
    professionalism: Number
  },
  suggestions: String,
  overallEvaluation: Number,
  createdAt: Date,
  updatedAt: Date
}
```

## Security Features

- **Password Hashing**: All passwords are hashed using bcryptjs
- **Input Validation**: Server-side validation for all inputs
- **Error Handling**: Comprehensive error handling and logging
- **Session Management**: Secure session management with localStorage
- **Role-based Access**: Different access levels for admin, faculty, and students
- **Environment Variables**: Secure configuration management

## Departments Available

1. Computer Science
2. Information Technology
3. Electronics & Communication
4. Mechanical Engineering
5. Civil Engineering
6. Electrical Engineering
7. Chemical Engineering
8. Biotechnology
9. Mathematics
10. Physics
11. Chemistry
12. English
13. Economics
14. Management

## Environment Variables

### Required Variables
- `MONGO_URI` - MongoDB connection string
- `PORT` - Server port (default: 5000)
- `ADMIN_EMAIL` - Static admin email
- `ADMIN_PASSWORD` - Static admin password
- `ADMIN_NAME` - Static admin display name

### Optional Variables
- `JWT_SECRET` - JWT token secret key
- `NODE_ENV` - Environment mode

For detailed setup instructions, see `backend/ENV_SETUP.md`.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the development team or create an issue in the repository. 