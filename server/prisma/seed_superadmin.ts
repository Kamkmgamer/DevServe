import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const superadminEmail = 'khalil@khalil.excellence.sd';

  try {
    const user = await prisma.user.findUnique({
      where: { email: superadminEmail },
    });

    if (user) {
      await prisma.user.update({
        where: { email: superadminEmail },
        data: { role: 'SUPERADMIN' },
      });
      console.log(`User ${superadminEmail} updated to SUPERADMIN role.`);
    } else {
      console.log(`User ${superadminEmail} not found. Please ensure the user exists.`);
    }
  } catch (e) {
    console.error('Error updating user role:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
