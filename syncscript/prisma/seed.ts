// CRITICAL: Load dotenv BEFORE any other imports
import 'dotenv/config';

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

  // Create viewer demo user
  const viewerPassword = await bcrypt.hash('viewer123', 10);
  const viewer = await prisma.user.upsert({
    where: { email: 'viewer@demo.com' },
    update: {},
    create: {
      email: 'viewer@demo.com',
      name: 'Demo Viewer',
      passwordHash: viewerPassword,
      role: 'viewer',
    },
  });

  console.log('✓ Created viewer demo user:', viewer.email);

  // Create demo vaults for owner
  const vault1 = await prisma.vault.upsert({
    where: { id: 'demo-vault-1' },
    update: {},
    create: {
      id: 'demo-vault-1',
      name: 'Research Papers',
      ownerId: owner.id,
    },
  });

  console.log('✓ Created demo vault:', vault1.name);

  const vault2 = await prisma.vault.upsert({
    where: { id: 'demo-vault-2' },
    update: {},
    create: {
      id: 'demo-vault-2',
      name: 'Project Documentation',
      ownerId: owner.id,
    },
  });

  console.log('✓ Created demo vault:', vault2.name);

  // Create VaultUser relationships
  await prisma.vaultUser.upsert({
    where: {
      userId_vaultId: {
        userId: owner.id,
        vaultId: vault1.id,
      },
    },
    update: {},
    create: {
      userId: owner.id,
      vaultId: vault1.id,
      role: 'owner',
    },
  });

  await prisma.vaultUser.upsert({
    where: {
      userId_vaultId: {
        userId: owner.id,
        vaultId: vault2.id,
      },
    },
    update: {},
    create: {
      userId: owner.id,
      vaultId: vault2.id,
      role: 'owner',
    },
  });

  console.log('✓ Created vault access for owner');

  console.log('\nDemo data seeded successfully!');
  console.log('Owner: owner@demo.com / owner123 (2 vaults)');
  console.log('Contributor: contributor@demo.com / contributor123');
  console.log('Viewer: viewer@demo.com / viewer123');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
