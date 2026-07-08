import { Controller, Post, Get, Put, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Controller('profiles')
@UseGuards(JwtAuthGuard)
export class ProfilesController {
  constructor(
    private readonly profilesService: ProfilesService,
    private readonly prisma: PrismaService
  ) {}

  @Post('upgrade')
  async upgradeToPremium(@Request() req) {
    await this.prisma.user.update({
      where: { id: req.user.userId },
      data: { subscriptionTier: 'PREMIUM' }
    });
    return { success: true, message: 'Upgraded to Premium' };
  }

  @Post('job-seeker')
  async createJobSeekerProfile(@Request() req, @Body() data: Omit<Prisma.JobSeekerProfileCreateWithoutUserInput, 'applications'>) {
    if (req.user.role !== 'JOB_SEEKER') {
      throw new ForbiddenException('Only JOB_SEEKERs can create this profile type.');
    }
    return this.profilesService.createJobSeekerProfile(req.user.userId, data);
  }

  @Get('job-seeker')
  async getJobSeekerProfile(@Request() req) {
    if (req.user.role !== 'JOB_SEEKER') {
      throw new ForbiddenException('Only JOB_SEEKERs can view this profile type.');
    }
    return this.profilesService.getJobSeekerProfile(req.user.userId);
  }

  @Put('job-seeker')
  async updateJobSeekerProfile(@Request() req, @Body() data: Prisma.JobSeekerProfileUpdateInput) {
    if (req.user.role !== 'JOB_SEEKER') {
      throw new ForbiddenException('Only JOB_SEEKERs can update this profile type.');
    }
    return this.profilesService.updateJobSeekerProfile(req.user.userId, data);
  }

  @Post('employer')
  async createEmployerProfile(@Request() req, @Body() data: Omit<Prisma.EmployerCreateWithoutUserInput, 'jobs'>) {
    if (req.user.role !== 'EMPLOYER') {
      throw new ForbiddenException('Only EMPLOYERs can create this profile type.');
    }
    return this.profilesService.createEmployerProfile(req.user.userId, data);
  }

  @Get('employer')
  async getEmployerProfile(@Request() req) {
    if (req.user.role !== 'EMPLOYER') {
      throw new ForbiddenException('Only EMPLOYERs can view this profile type.');
    }
    return this.profilesService.getEmployerProfile(req.user.userId);
  }
}
