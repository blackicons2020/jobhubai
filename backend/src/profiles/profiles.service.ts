import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  async upsertJobSeekerProfile(userId: string, data: Prisma.JobSeekerProfileUpdateInput & Prisma.JobSeekerProfileCreateWithoutUserInput) {
    return this.prisma.jobSeekerProfile.upsert({
      where: { userId },
      update: data,
      create: {
        ...data,
        user: { connect: { id: userId } },
      },
    });
  }

  async getJobSeekerProfile(userId: string) {
    const profile = await this.prisma.jobSeekerProfile.findUnique({
      where: { userId },
    });
    
    if (!profile) {
      throw new NotFoundException('Job seeker profile not found.');
    }
    
    return profile;
  }

  async upsertEmployerProfile(userId: string, data: Prisma.EmployerUpdateInput & Prisma.EmployerCreateWithoutUserInput) {
    return this.prisma.employer.upsert({
      where: { userId },
      update: data,
      create: {
        ...data,
        user: { connect: { id: userId } },
      },
    });
  }

  async getEmployerProfile(userId: string) {
    const profile = await this.prisma.employer.findUnique({
      where: { userId },
    });
    
    if (!profile) {
      throw new NotFoundException('Employer profile not found.');
    }
    
    return profile;
  }
}
