import { PrismaClient } from "@prisma/client";
import { IUserRepository } from "../domain/interfaces/IUserRepository";
import { IUser } from "../domain/interfaces/IUser";
import { prismaGuard } from "../../../../shared/infrastructure/prisma-error.mapper";

const prisma = new PrismaClient();

export class PrismaUserRepository implements IUserRepository {
  async create(user: IUser): Promise<any> {
    return prismaGuard(prisma.user.create({ data: user }));
  }

  async findById(id: string): Promise<any | null> {
    return prismaGuard(prisma.user.findUnique({ where: { id } }));
  }

  async findByEmail(email: string): Promise<any | null> {
    return prismaGuard(prisma.user.findUnique({ where: { email } }));
  }

  async update(user: IUser): Promise<any> {
    return prismaGuard(prisma.user.update({ where: { id: user.id }, data: user }));
  }

  async findAll(
    page: number,
    pageSize: number
  ): Promise<{ users: any[]; total: number }> {
    const skip = (page - 1) * pageSize;
    const [users, total] = await Promise.all([
      prismaGuard(prisma.user.findMany({
        skip,
        take: pageSize,
        orderBy: { createdAt: "desc" },
      })),
      prismaGuard(prisma.user.count()),
    ]);
    return { users, total };
  }

  async delete(id: string): Promise<void> {
    await prismaGuard(prisma.user.delete({ where: { id } }));
  }

  async findByVerificationToken(token: string): Promise<any | null> {
    return prismaGuard(prisma.user.findFirst({ where: { verificationToken: token } }));
  }

  async setVerificationToken(
    userId: string,
    token: string,
    expires: Date
  ): Promise<void> {
    await prismaGuard(prisma.user.update({
      where: { id: userId },
      data: {
        verificationToken: token,
        verificationTokenExpires: expires,
      },
    }));
  }

  async verifyUser(userId: string): Promise<void> {
    await prismaGuard(prisma.user.update({
      where: { id: userId },
      data: {
        isVerified: true,
        verificationToken: null,
        verificationTokenExpires: null,
      },
    }));
  }

  async isUserVerified(userId: string): Promise<boolean> {
    const user = await prismaGuard(prisma.user.findUnique({
      where: { id: userId },
      select: { isVerified: true },
    }));
    return user?.isVerified || false;
  }
}
