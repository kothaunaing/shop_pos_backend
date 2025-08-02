import { Prisma } from '@prisma/client';

export const userSelect: Prisma.UserSelect = {
  profilePic: true,
  name: true,
  email: true,
  role: true,
};
