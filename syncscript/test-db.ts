import 'dotenv/config';
import { prisma } from './src/lib/prisma';

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...\n');

    // Test connection
    await prisma.$connect();
    console.log('✅ Database connected successfully\n');

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        passwordHash: true,
      },
    });

    console.log('📊 Total users in database:', users.length);
    console.log('\n👥 User list:');
    users.forEach((u) => {
      console.log(`  - ${u.email}`);
      console.log(`    Name: ${u.name}`);
      console.log(`    Role: ${u.role}`);
      console.log(`    Has password: ${u.passwordHash ? 'Yes' : 'No'}`);
      console.log('');
    });

    // Get all vaults
    const vaults = await prisma.vault.findMany({
      include: {
        vaultUsers: true,
        sources: true,
      },
    });

    console.log('🗄️  Total vaults:', vaults.length);
    vaults.forEach((v) => {
      console.log(`  - ${v.name} (${v.sources.length} sources, ${v.vaultUsers.length} users)`);
    });

    await prisma.$disconnect();
    console.log('\n✅ Database test completed successfully');
  } catch (error) {
    console.error('❌ Database test failed:', error);
    process.exit(1);
  }
}

testDatabase();
