import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, ApplicationStatus } from '@prisma/client';

@Injectable()
export class ApplicationsService {
  constructor(private prisma: PrismaService) {}

  async applyToJob(userId: string, jobId: string, coverLetter?: string) {
    const jobSeekerProfile = await this.prisma.jobSeekerProfile.findUnique({
      where: { userId },
    });

    if (!jobSeekerProfile) {
      throw new ForbiddenException('You must create a Job Seeker profile before applying.');
    }

    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job) throw new NotFoundException('Job not found.');

    const existingApp = await this.prisma.application.findFirst({
      where: { jobId, jobSeekerId: jobSeekerProfile.id },
    });

    if (existingApp) {
      throw new ConflictException('You have already applied to this job.');
    }

    return this.prisma.application.create({
      data: {
        job: { connect: { id: jobId } },
        jobSeekerProfile: { connect: { id: jobSeekerProfile.id } },
        coverLetter,
        status: ApplicationStatus.APPLIED,
      },
    });
  }

  async getMyApplications(userId: string) {
    const jobSeekerProfile = await this.prisma.jobSeekerProfile.findUnique({
      where: { userId },
    });

    if (!jobSeekerProfile) return [];

    return this.prisma.application.findMany({
      where: { jobSeekerId: jobSeekerProfile.id },
      include: {
        job: {
          include: { employer: { select: { companyName: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getJobApplications(userId: string, jobId: string) {
    const employer = await this.prisma.employer.findUnique({ where: { userId } });
    if (!employer) throw new ForbiddenException('Employer profile not found.');

    const job = await this.prisma.job.findUnique({ where: { id: jobId } });
    if (!job || job.employerId !== employer.id) {
      throw new ForbiddenException('You do not own this job posting.');
    }

    return this.prisma.application.findMany({
      where: { jobId },
      include: {
        jobSeekerProfile: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(userId: string, applicationId: string, status: ApplicationStatus) {
    const employer = await this.prisma.employer.findUnique({ where: { userId } });
    if (!employer) throw new ForbiddenException('Employer profile not found.');

    const application = await this.prisma.application.findUnique({
      where: { id: applicationId },
      include: { job: true },
    });

    if (!application || application.job.employerId !== employer.id) {
      throw new ForbiddenException('You do not own the job for this application.');
    }

    return this.prisma.application.update({
      where: { id: applicationId },
      data: { status },
    });
  }
}
