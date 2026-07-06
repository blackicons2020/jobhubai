import { Controller, Post, Get, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { ProfilesService } from './profiles.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Prisma } from '@prisma/client';

@Controller('profiles')
@UseGuards(JwtAuthGuard)
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

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
