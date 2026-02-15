import 'dotenv/config';
import { prisma } from './src/lib/prisma';
import bcrypt from 'bcryptjs';

async function testAuth() {
  try {
    console.log('🔐 Testing authentication flow...\n');

    const testEmail = 'test@example.com';
    const testPassword = 'test123';

    // Step 1: Find user
    console.log('Step 1: Finding user in database...');
    const user = await prisma.user.findUnique({
      where: { email: testEmail },
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }
    console.log('✅ User found:', user.email);
    console.log('   ID:', user.id);
    console.log('   Name:', user.name);
    console.log('   Role:', user.role);
    console.log('   Has password hash:', !!user.passwordHash);
    console.log('');

    // Step 2: Verify password
    console.log('Step 2: Verifying password...');
    if (!user.passwordHash) {
      console.log('❌ No password hash found');
      return;
    }

    const isValidPassword = await bcrypt.compare(testPassword, user.passwordHash);
    console.log('✅ Password valid:', isValidPassword);
    console.log('');

    // Step 3: Test with demo users
    console.log('Step 3: Testing demo users...\n');

    const demoUsers = [
      { email: 'owner@demo.com', password: 'owner123' },
      { email: 'contributor@demo.com', password: 'contributor123' },
      { email: 'viewer@demo.com', password: 'viewer123' },
    ];

    for (const demo of demoUsers) {
      const demoUser = await prisma.user.findUnique({
        where: { email: demo.email },
      });

      if (demoUser && demoUser.passwordHash) {
        const valid = await bcrypt.compare(demo.password, demoUser.passwordHash);
        console.log(`${valid ? '✅' : '❌'} ${demo.email}: password ${valid ? 'valid' : 'invalid'}`);
      } else {
        console.log(`❌ ${demo.email}: user not found or no password`);
      }
    }

    console.log('\n✅ Authentication test completed');
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Auth test failed:', error);
    process.exit(1);
  }
}

testAuth();
