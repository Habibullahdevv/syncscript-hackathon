import dotenv from 'dotenv';

// Load environment variables first
dotenv.config();

import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('Starting database seed...');

  // Create owner demo user
  const ownerPassword = await bcrypt.hash('owner123', 10);
  const owner = await prisma.user.upsert({
    where: { email: 'owner@demo.com' },
    update: {},
    create: {
      email: 'owner@demo.com',
      name: 'Demo Owner',
      passwordHash: ownerPassword,
      role: 'owner',
    },
  });

  console.log('✓ Created owner demo user:', owner.email);

  // Create contributor demo user
  const contributorPassword = await bcrypt.hash('contributor123', 10);
  const contributor = await prisma.user.upsert({
    where: { email: 'contributor@demo.com' },
    update: {},
    create: {
      email: 'contributor@demo.com',
      name: 'Demo Contributor',
      passwordHash: contributorPassword,
      role: 'contributor',
    },
  });

  console.log('✓ Created contributor demo user:', contributor.email);

  console.log('\nDemo users seeded successfully!');
  console.log('Owner: owner@demo.com / owner123');
  console.log('Contributor: contributor@demo.com / contributor123');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
