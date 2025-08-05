# Faculty Evaluation System - Test Guide

## Features Implemented

### 1. Static Admin Login
- **Credentials**: admin@college.com / password
- **Location**: Admin Login page
- **Functionality**: Static admin login with predefined credentials

### 2. Faculty Signup with Department
- **Location**: Signup page
- **Features**: 
  - Department dropdown with 14 departments
  - Name field (instead of username for faculty)
  - Email and password fields
  - Role selection (Faculty/Student)

### 3. Faculty Login with Review Data
- **Location**: Faculty Login page
- **Features**:
  - Login with email/password
  - Stores faculty info in localStorage
  - Shows faculty name and department in dashboard
  - Displays reviews for that specific faculty member

### 4. Student Review Form with Faculty Dropdown
- **Location**: Review Form page
- **Features**:
  - Department dropdown (filters faculty)
  - Faculty dropdown (shows faculty from selected department)
  - All rating fields
  - Suggestions field
  - Form validation

### 5. Dynamic User Profile
- **Location**: User Profile page
- **Features**:
  - Shows different info based on user role (Admin/Faculty/Student)
  - Editable profile information
  - Department field for faculty
  - Logout functionality

### 6. Dashboard Updates
- **Admin Dashboard**: Shows admin name, logout functionality
- **Faculty Dashboard**: Shows faculty name, department, recent reviews
- **Student Dashboard**: Shows student name, logout functionality

## Testing Steps

### 1. Test Admin Login
1. Go to homepage
2. Click "Admin Login"
3. Use credentials: admin@college.com / password
4. Should redirect to admin dashboard
5. Check profile shows admin info

### 2. Test Faculty Signup
1. Go to signup page
2. Select "Faculty" role
3. Fill in name, email, password
4. Select department from dropdown
5. Submit form
6. Should show success message

### 3. Test Faculty Login
1. Go to faculty login page
2. Use faculty credentials from signup
3. Should redirect to faculty dashboard
4. Check dashboard shows faculty name and department
5. Check reviews section (empty initially)

### 4. Test Student Signup
1. Go to signup page
2. Select "Student" role
3. Fill in username, email, password
4. Submit form
5. Should show success message

### 5. Test Student Login
1. Go to student login page
2. Use student credentials from signup
3. Should redirect to student dashboard
4. Check dashboard shows student name

### 6. Test Review Form
1. Login as student
2. Go to review form
3. Check department dropdown loads
4. Select department
5. Check faculty dropdown filters correctly
6. Fill in all required fields
7. Submit review
8. Should show success message

### 7. Test Faculty Review Display
1. Login as faculty
2. Check dashboard shows recent reviews
3. Reviews should appear after students submit them

### 8. Test User Profile
1. Login as any user type
2. Click profile icon
3. Check profile shows correct user info
4. Test edit functionality
5. Test logout functionality

## API Endpoints

### Backend Routes
- `POST /api/adminlogin` - Admin login
- `POST /api/facultylogin` - Faculty login
- `POST /api/login` - Student login
- `POST /api/signup` - User signup
- `GET /api/faculty` - Get all faculty
- `POST /api/review` - Submit review
- `GET /api/review/faculty/:name/:department` - Get faculty reviews

### Frontend Routes
- `/` - Homepage
- `/adminlogin` - Admin login
- `/facultylogin` - Faculty login
- `/studentlogin` - Student login
- `/signup` - Signup page
- `/admindash` - Admin dashboard
- `/facultydash` - Faculty dashboard
- `/studentdash` - Student dashboard
- `/reviewform` - Review form
- `/userprofile` - User profile

## Database Models

### Faculty Model
- email (unique)
- name
- department
- password (hashed)
- role

### Student Model
- email (unique)
- username
- password (hashed)
- role

### Admin Model
- email (unique)
- name
- password (hashed)
- role

### Review Model
- studentName
- admissionNo
- branchSemester
- teacherName
- teacherSubject
- teacherDepartment
- ratings (object)
- suggestions
- overallEvaluation
- timestamps

## Security Features
- Password hashing with bcryptjs
- Input validation
- Error handling
- Session management with localStorage
- Role-based access control 