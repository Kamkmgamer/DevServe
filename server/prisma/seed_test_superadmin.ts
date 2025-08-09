import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'khalil@khalil.khalil';
  const password = 'khalil123!';
  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: email },
    });

    if (existingUser) {
      console.log(`User with email ${email} already exists. Updating role to SUPERADMIN.`);
      await prisma.user.update({
        where: { email: email },
        data: { role: 'SUPERADMIN', password: hashedPassword },
      });
    } else {
      await prisma.user.create({
        data: {
          email: email,
          password: hashedPassword,
          name: 'Khalil Superadmin',
          role: 'SUPERADMIN',
        },
      });
      console.log(`SUPERADMIN user ${email} created.`);
    }
  } catch (e) {
    console.error('Error creating/updating SUPERADMIN user:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
