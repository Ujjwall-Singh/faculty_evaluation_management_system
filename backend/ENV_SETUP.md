# Environment Variables Setup

## Creating .env File

1. Copy the `env.example` file to `.env`:
   ```bash
   cp env.example .env
   ```

2. Edit the `.env` file with your actual values:

## Environment Variables

### Required Variables

```env
# MongoDB Connection
MONGO_URI=mongodb://localhost:27017/faculty_evaluation

# Server Port
PORT=5000

# Static Admin Credentials
ADMIN_EMAIL=admin@college.com
ADMIN_PASSWORD=password
ADMIN_NAME=Admin

# JWT Secret (if you want to add JWT authentication later)
JWT_SECRET=your_jwt_secret_key_here

# Environment
NODE_ENV=development
```

### Variable Descriptions

- **MONGO_URI**: Your MongoDB connection string
- **PORT**: The port on which the server will run (default: 5000)
- **ADMIN_EMAIL**: Static admin email for login
- **ADMIN_PASSWORD**: Static admin password for login
- **ADMIN_NAME**: Static admin display name
- **JWT_SECRET**: Secret key for JWT token generation (optional)
- **NODE_ENV**: Environment mode (development/production)

## Default Admin Credentials

The default static admin credentials are:
- **Email**: admin@college.com
- **Password**: password

You can change these in the `.env` file.

## Security Notes

1. **Never commit .env file to version control**
2. **Use strong passwords in production**
3. **Change default credentials in production**
4. **Use environment-specific .env files**

## Example .env for Production

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/faculty_evaluation
PORT=5000
ADMIN_EMAIL=admin@yourdomain.com
ADMIN_PASSWORD=your_secure_password_here
ADMIN_NAME=System Administrator
JWT_SECRET=your_very_secure_jwt_secret_key
NODE_ENV=production
``` 