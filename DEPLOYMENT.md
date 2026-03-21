# Deployment Guide

## Prerequisites

- Node.js 18+ and pnpm installed
- MongoDB database (MongoDB Atlas or local instance)
- Environment variables configured

## Environment Setup

### 1. Create `.env.local` file

```bash
cp .env.example .env.local
```

### 2. Configure Environment Variables

```env
# MongoDB Connection
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/internship_eval?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-very-secure-random-jwt-secret-key-min-32-characters

# API Base URL (for production)
NEXT_PUBLIC_API_URL=https://yourdomain.com
```

## Local Development

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Run Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

### 3. Seed Test Data (Optional)

```bash
pnpm tsx scripts/seed.ts
```

This will create test users:
- **Student**: student@example.com / password123
- **Company**: company@example.com / password123
- **Supervisor**: supervisor@example.com / password123

## Deployment to Vercel

### 1. Push to GitHub

```bash
git add .
git commit -m "Initial commit"
git push origin main
```

### 2. Connect to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New Project"
3. Import your GitHub repository
4. Select Next.js as the framework
5. Click "Deploy"

### 3. Configure Environment Variables in Vercel

1. Go to Project Settings → Environment Variables
2. Add the following variables:
   - `MONGODB_URI`
   - `JWT_SECRET`

### 4. Deploy

The project will automatically deploy when you push changes to your GitHub repository.

## Production Checklist

- [ ] MongoDB URI is set correctly
- [ ] JWT_SECRET is a strong, random string (min 32 characters)
- [ ] API_BASE_URL is configured for production domain
- [ ] Email/notifications are configured (if needed)
- [ ] CORS settings are properly configured
- [ ] Database backups are configured in MongoDB Atlas
- [ ] SSL/HTTPS is enabled
- [ ] Rate limiting is configured on API routes
- [ ] Error logging is configured (e.g., Sentry)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify token

### Stages
- `GET /api/stages` - Get all stages
- `POST /api/stages` - Create new stage
- `GET /api/stages/[id]` - Get stage details
- `PUT /api/stages/[id]` - Update stage
- `DELETE /api/stages/[id]` - Delete stage

### Reports
- `GET /api/reports` - Get all reports
- `POST /api/reports` - Create new report
- `GET /api/reports/[id]` - Get report details
- `PUT /api/reports/[id]` - Update report
- `DELETE /api/reports/[id]` - Delete report
- `POST /api/reports/[id]/review` - Review report
- `POST /api/reports/[id]/grade` - Grade report

### Certificates
- `GET /api/certificates` - Get all certificates
- `POST /api/certificates` - Create new certificate
- `GET /api/certificates/[id]` - Get certificate details
- `PUT /api/certificates/[id]` - Update certificate
- `GET /api/certificates/[id]/download` - Download certificate PDF

## Troubleshooting

### MongoDB Connection Issues
- Verify MongoDB URI is correct
- Check IP whitelist in MongoDB Atlas
- Ensure network connectivity

### Authentication Issues
- Verify JWT_SECRET is set
- Check token format in requests
- Ensure Authorization header is correct

### File Upload Issues
- Check multer configuration
- Verify file size limits
- Ensure proper permissions

## Support

For issues or questions, please refer to the main README.md or open an issue on GitHub.
