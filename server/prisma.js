// One PrismaClient for the whole server. Every file imports this same one -
// opening a new client per request would open a new pool of DB connections.
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
