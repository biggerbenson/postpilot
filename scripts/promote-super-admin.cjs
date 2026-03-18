/* eslint-disable no-console */
const { PrismaClient } = require("@prisma/client");

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: node scripts/promote-super-admin.cjs <email>");
    process.exit(1);
  }

  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      console.error("User not found:", email);
      process.exit(1);
    }
    await prisma.user.update({
      where: { email },
      data: { role: "SUPER_ADMIN" },
    });
    console.log("Promoted to SUPER_ADMIN:", email);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

