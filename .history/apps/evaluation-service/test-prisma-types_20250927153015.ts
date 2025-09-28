import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Verificar qué tipos están disponibles
type AvailableTypes = keyof typeof prisma;

console.log('Available types:', Object.keys(prisma));
