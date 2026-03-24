// scripts/test-login.ts
import * as dotenv from 'dotenv';
import * as path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

async function test() {
  await mongoose.connect(process.env.MONGODB_URI!);

  const user = await mongoose.connection.db
    .collection('users')
    .findOne({ email: 'company@example.com' });

  if (!user) {
    console.log('❌ User not found in DB');
    return;
  }

  console.log('✅ User found:', user.email, '| role:', user.role);
  console.log('   password hash:', user.password);

  const match = await bcrypt.compare('hashedPassword', user.password);
  console.log('   password match:', match ? '✅ YES' : '❌ NO');

  await mongoose.disconnect();
}

test().catch(console.error);