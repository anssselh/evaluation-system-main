# Internship Evaluation System

A comprehensive full-stack application for managing internship programs with multi-role authentication, stage tracking, report submissions, and certificate generation.

## Features

### Core Features
- **Multi-Role Authentication**: JWT-based authentication for Students, Companies, and Supervisors
- **Stage Management**: Create and manage internship stages with detailed information
- **Report System**: Students can submit reports with supervisors reviewing and providing feedback
- **Certificate Generation**: Companies can generate completion certificates with blockchain hashing
- **Dashboard System**: Role-specific dashboards for each user type
- **PDF Export**: Generate and download certificates as PDFs

### Technical Highlights
- **MongoDB Integration**: Scalable NoSQL database with Mongoose ORM
- **JWT Authentication**: Secure token-based authentication
- **SHA-256 Blockchain Hashing**: Certificate integrity verification
- **Role-Based Access Control**: Differentiated access for three user roles
- **Modern UI**: Built with Shadcn/UI and Tailwind CSS
- **Responsive Design**: Mobile-first approach

## Tech Stack

### Frontend
- **Next.js 16**: React framework with App Router
- **React 19.2**: Latest React features
- **Tailwind CSS 4**: Utility-first CSS framework
- **Shadcn/UI**: High-quality UI components
- **TypeScript**: Type-safe development

### Backend
- **Next.js API Routes**: Serverless API functions
- **MongoDB**: NoSQL database
- **Mongoose**: ODM for MongoDB
- **JWT**: Secure authentication
- **Bcrypt**: Password hashing

### Additional Libraries
- **Sonner**: Toast notifications
- **Zod**: Schema validation
- **html2pdf**: Client-side PDF generation

## Project Structure

```
app/
├── api/
│   ├── auth/
│   │   ├── register/
│   │   ├── login/
│   │   └── verify/
│   ├── stages/
│   │   ├── route.ts (GET, POST)
│   │   └── [id]/
│   │       └── route.ts (GET, PUT, DELETE)
│   ├── reports/
│   │   ├── route.ts (GET, POST)
│   │   └── [id]/
│   │       └── route.ts (GET, PUT, DELETE, PATCH)
│   └── certificates/
│       ├── route.ts (GET, POST)
│       ├── [id]/
│       │   ├── route.ts (GET, PUT, DELETE)
│       │   └── download/
│       │       └── route.ts (GET)
├── dashboard/
│   ├── layout.tsx
│   ├── student/
│   │   ├── page.tsx
│   │   ├── stages/
│   │   ├── reports/
│   │   └── certificates/
│   ├── company/
│   │   ├── page.tsx
│   │   ├── stages/
│   │   └── certificates/
│   └── supervisor/
│       ├── page.tsx
│       ├── reports/
│       └── students/
├── page.tsx (Auth page)
└── layout.tsx

lib/
├── mongodb.ts (DB connection)
├── jwt.ts (JWT utilities)
├── validation.ts (Zod schemas)
├── auth-middleware.ts (Auth checks)
└── certificate-generator.ts (Certificate HTML/PDF)

models/
├── User.ts
├── Stage.ts
├── Report.ts
└── Certificate.ts

hooks/
└── use-certificate-download.ts
```

## Setup Instructions

### Prerequisites
- Node.js 18+
- MongoDB Atlas account or local MongoDB instance
- npm or pnpm

### Environment Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd internship-evaluation-system
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Create `.env.local` file with the following variables:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/internship-eval?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

4. Run the development server:
```bash
npm run dev
# or
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## User Roles

### Student
- Create internship stages
- Submit reports documenting their experience
- Download completion certificates
- View supervisor feedback

**Dashboard Access**: `/dashboard/student`
**Pages**: Stages, Reports, Certificates

### Company
- Manage active internship programs
- View student information
- Generate completion certificates
- Track internship progress

**Dashboard Access**: `/dashboard/company`
**Pages**: Active Stages, Certificates

### Supervisor
- Oversee student internship progress
- Review student reports
- Provide feedback and ratings
- View list of supervised students

**Dashboard Access**: `/dashboard/supervisor`
**Pages**: Student List, Reports Review

## Authentication Flow

1. User registers with email, password, and role
2. Password is hashed with bcrypt before storage
3. Login validates credentials and returns JWT token
4. Token is stored in localStorage (client-side)
5. All API requests include token in Authorization header
6. Middleware validates token before allowing access

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/verify` - Verify token

### Stages
- `GET /api/stages` - Get user's stages
- `POST /api/stages` - Create new stage
- `GET /api/stages/[id]` - Get stage details
- `PUT /api/stages/[id]` - Update stage
- `DELETE /api/stages/[id]` - Delete stage

### Reports
- `GET /api/reports` - Get reports
- `POST /api/reports` - Create report
- `GET /api/reports/[id]` - Get report details
- `PUT /api/reports/[id]` - Update/review report
- `PATCH /api/reports/[id]` - Submit report
- `DELETE /api/reports/[id]` - Delete report

### Certificates
- `GET /api/certificates` - Get certificates
- `POST /api/certificates` - Generate certificate
- `GET /api/certificates/[id]` - Get certificate details
- `PUT /api/certificates/[id]` - Update certificate
- `DELETE /api/certificates/[id]` - Delete certificate
- `GET /api/certificates/[id]/download` - Download certificate PDF

## Database Models

### User
```typescript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'student' | 'company' | 'supervisor',
  phone: String,
  address: String,
  companyName: String,
  department: String,
  position: String
}
```

### Stage
```typescript
{
  title: String,
  description: String,
  studentId: ObjectId (ref: User),
  companyId: ObjectId (ref: User),
  supervisorId: ObjectId (ref: User),
  position: String,
  department: String,
  startDate: Date,
  endDate: Date,
  duration: Number,
  address: String,
  phone: String,
  email: String,
  tasks: [String],
  achievements: [String],
  status: 'in_progress' | 'completed' | 'cancelled'
}
```

### Report
```typescript
{
  stageId: ObjectId (ref: Stage),
  studentId: ObjectId (ref: User),
  supervisorId: ObjectId (ref: User),
  title: String,
  content: String,
  activitiesPerformed: [String],
  competenciesDeveloped: [String],
  challenges: [String],
  learnings: [String],
  rating: Number (0-5),
  feedback: String,
  submittedAt: Date,
  status: 'draft' | 'submitted' | 'reviewed'
}
```

### Certificate
```typescript
{
  stageId: ObjectId (ref: Stage),
  studentId: ObjectId (ref: User),
  companyId: ObjectId (ref: User),
  certificateNumber: String (unique),
  issueDate: Date,
  expiryDate: Date,
  competencies: [String],
  achievements: [String],
  certificateUrl: String,
  blockchainHash: String (SHA-256),
  blockchainStatus: 'pending' | 'confirmed' | 'failed',
  status: 'generated' | 'sent' | 'verified'
}
```

## Certificate Generation

Certificates are generated with:
- Professional HTML template
- SHA-256 blockchain hash for verification
- Student and company information
- Competencies and achievements
- Issue and expiry dates
- PDF export capability via html2pdf

The blockchain hash ensures certificate integrity by creating a unique hash based on:
- Certificate number
- Student name
- Issue timestamp

## Security Features

1. **Password Hashing**: Bcrypt with salt rounds
2. **JWT Tokens**: Secure token-based authentication
3. **Authorization Middleware**: Role-based access control
4. **Input Validation**: Zod schemas for all inputs
5. **SQL Injection Prevention**: Mongoose parameterized queries
6. **CORS Ready**: API structure supports CORS setup

## Future Enhancements

1. **Blockchain Integration**: Store certificates on Ethereum/Polygon
2. **Email Notifications**: Send confirmations and reports
3. **Real Blockchain**: Integrate with actual blockchain networks
4. **Advanced Analytics**: Charts and reporting dashboards
5. **File Uploads**: Upload documents and media
6. **Internationalization**: Multi-language support
7. **API Rate Limiting**: Prevent abuse
8. **Audit Logging**: Track all operations

## Development Tips

### Adding a New API Route
1. Create route file in `app/api/[resource]/route.ts`
2. Use `requireAuth()` or `requireRole()` middleware
3. Validate inputs with Zod schemas
4. Connect to database with `connectDB()`
5. Return proper JSON responses

### Adding a New Page
1. Create folder structure in `app/dashboard/[role]/[page]/`
2. Use 'use client' for client components
3. Fetch data in useEffect with token from localStorage
4. Use Shadcn components for UI
5. Handle loading and error states

### Testing
```bash
# Run development server
npm run dev

# Test authentication flow
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"123456","role":"student"}'
```

## Troubleshooting

### MongoDB Connection Issues
- Verify connection string in `.env.local`
- Check MongoDB Atlas whitelist for your IP
- Ensure database exists

### JWT Token Issues
- Clear localStorage and re-login
- Check JWT_SECRET is consistent
- Verify token expiration with JWT_EXPIRE

### PDF Generation
- Ensure html2pdf library is loaded in layout
- Check browser console for errors
- Fallback to HTML download if PDF fails

## License

MIT License - feel free to use this project for educational purposes.

## Support

For issues or questions, please create an issue in the repository or contact the development team.
