import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = "khalil@khalil.excellence.sd";

  try {
    const adminUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    if (adminUser) {
      console.log(`User: ${adminUser.email}, Role: ${adminUser.role}`);
    } else {
      console.log(`Admin user with email ${adminEmail} not found.`);
    }
  } catch (e) {
    console.error("Error checking admin role:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
