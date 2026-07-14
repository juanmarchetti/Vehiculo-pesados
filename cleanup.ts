import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.usuario.findMany();
  for (const user of users) {
    if (user.id.startsWith('c')) {
      console.log(`Deleting ghost user: ${user.correo}`);
      await prisma.usuario.delete({ where: { id: user.id } });
    }
  }
  console.log('Cleanup complete.');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
