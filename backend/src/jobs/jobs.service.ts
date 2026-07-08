import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  async createJob(userId: string, data: Prisma.JobCreateWithoutEmployerInput) {
    const employer = await this.prisma.employer.findUnique({
      where: { userId },
    });

    if (!employer) {
      throw new ForbiddenException('You must create an employer profile before posting a job.');
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (user?.subscriptionTier === 'FREE') {
      const jobCount = await this.prisma.job.count({ where: { employerId: employer.id } });
      if (jobCount >= 6) {
        throw new ForbiddenException('Free tier is limited to 6 job postings. Please upgrade to Premium.');
      }
    }

    return this.prisma.job.create({
      data: {
        ...data,
        employer: { connect: { id: employer.id } },
      },
    });
  }

  async findFeed(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ForbiddenException('User not found');

    let jobs = await this.prisma.job.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        employer: {
          select: { companyName: true, website: true },
        },
      },
    });

    if (user.role === 'JOB_SEEKER') {
      const profile = await this.prisma.jobSeekerProfile.findUnique({ where: { userId } });
      if (profile) {
        // Keyword matching
        const keywords = [...profile.skills, ...(profile.bio ? profile.bio.split(' ') : [])]
          .map(k => k.toLowerCase().replace(/[^a-z0-9]/g, ''))
          .filter(k => k.length > 2); // basic noise filtering

        jobs = jobs.map(job => {
          const jobText = (job.title + ' ' + job.description).toLowerCase();
          let score = 0;
          for (const word of keywords) {
            if (jobText.includes(word)) score++;
          }
          return { ...job, matchScore: score };
        }).sort((a, b) => b.matchScore - a.matchScore);
      }

      if (user.subscriptionTier === 'FREE') {
        jobs = jobs.slice(0, 6);
      }
    }

    return jobs;
  }

  async findEmployerJobs(userId: string) {
    const employer = await this.prisma.employer.findUnique({
      where: { userId },
    });
    
    if (!employer) {
      throw new ForbiddenException('No employer profile found.');
    }

    return this.prisma.job.findMany({
      where: { employerId: employer.id },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { applications: true }
        }
      }
    });
  }

  async findOne(id: string) {
    const job = await this.prisma.job.findUnique({
      where: { id },
      include: {
        employer: {
          select: { companyName: true, website: true, description: true },
        },
      },
    });

    if (!job) {
      throw new NotFoundException('Job not found.');
    }

    return job;
  }
}
