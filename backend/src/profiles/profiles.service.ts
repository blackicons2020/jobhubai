import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProfilesService {
  constructor(private prisma: PrismaService) {}

  async createJobSeekerProfile(userId: string, data: Prisma.JobSeekerProfileCreateWithoutUserInput) {
    const existingProfile = await this.prisma.jobSeekerProfile.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      throw new ConflictException('User already has a job seeker profile.');
    }

    return this.prisma.jobSeekerProfile.create({
      data: {
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

  async createEmployerProfile(userId: string, data: Prisma.EmployerCreateWithoutUserInput) {
    const existingProfile = await this.prisma.employer.findUnique({
      where: { userId },
    });

    if (existingProfile) {
      throw new ConflictException('User already has an employer profile.');
    }

    return this.prisma.employer.create({
      data: {
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
