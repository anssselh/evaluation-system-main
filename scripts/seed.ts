import mongoose from 'mongoose';
import bcryptjs from 'bcryptjs';

// Models
const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  role: String,
  profileComplete: Boolean,
  createdAt: Date,
});

const StageSchema = new mongoose.Schema({
  title: String,
  description: String,
  company: String,
  startDate: Date,
  endDate: Date,
  status: String,
  studentId: mongoose.Schema.Types.ObjectId,
  createdAt: Date,
});

const User = mongoose.model('User', UserSchema);
const Stage = mongoose.model('Stage', StageSchema);

async function seed() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined');
    }

    await mongoose.connect(mongoUri);
    console.log('[v0] Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await Stage.deleteMany({});
    console.log('[v0] Cleared existing data');

    // Create test users
    const hashedPassword = await bcryptjs.hash('password123', 10);

    const student = await User.create({
      email: 'student@example.com',
      password: hashedPassword,
      name: 'Jean Dupont',
      role: 'student',
      profileComplete: true,
      createdAt: new Date(),
    });

    const company = await User.create({
      email: 'company@example.com',
      password: hashedPassword,
      name: 'TechCorp Inc',
      role: 'company',
      profileComplete: true,
      createdAt: new Date(),
    });
    console.log('[v0] Created test users');

    // Create test stages
    const startDate = new Date(2024, 0, 15);
    const endDate = new Date(2024, 5, 15);

    await Stage.create({
      title: 'Full Stack Development Internship',
      description: 'Developing web applications using Next.js and MongoDB',
      company: 'TechCorp Inc',
      startDate,
      endDate,
      status: 'active',
      studentId: student._id,
      createdAt: new Date(),
    });

    console.log('[v0] Created test stages');
    console.log('[v0] Seed completed successfully');

    await mongoose.disconnect();
  } catch (error) {
    console.error('[v0] Seed error:', error);
    process.exit(1);
  }
}

seed();
