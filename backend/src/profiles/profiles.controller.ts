import { Controller, Post, Get, Put, Body, UseGuards, Request, ForbiddenException, Param } from '@nestjs/common';
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
  async upsertJobSeekerProfile(@Request() req, @Body() data: Prisma.JobSeekerProfileUpdateInput & Prisma.JobSeekerProfileCreateWithoutUserInput) {
    if (req.user.role !== 'JOB_SEEKER') {
      throw new ForbiddenException('Only JOB_SEEKERs can create this profile type.');
    }
    // ensure skills is initialized if undefined
    if (data.skills === undefined) {
      data.skills = [];
    }
    return this.profilesService.upsertJobSeekerProfile(req.user.userId, data);
  }

  @Get('job-seeker')
  async getJobSeekerProfile(@Request() req) {
    if (req.user.role !== 'JOB_SEEKER') {
      throw new ForbiddenException('Only JOB_SEEKERs can view this profile type.');
    }
    return this.profilesService.getJobSeekerProfile(req.user.userId);
  }

  @Post('employer')
  async upsertEmployerProfile(@Request() req, @Body() data: Prisma.EmployerUpdateInput & Prisma.EmployerCreateWithoutUserInput) {
    if (req.user.role !== 'EMPLOYER') {
      throw new ForbiddenException('Only EMPLOYERs can create this profile type.');
    }
    return this.profilesService.upsertEmployerProfile(req.user.userId, data);
  }

  @Get('employer')
  async getEmployerProfile(@Request() req) {
    if (req.user.role !== 'EMPLOYER') {
      throw new ForbiddenException('Only EMPLOYERs can view this profile type.');
    }
    return this.profilesService.getEmployerProfile(req.user.userId);
  }

  @Get('job-seeker/completion')
  async getJobSeekerCompletion(@Request() req) {
    if (req.user.role !== 'JOB_SEEKER') {
      throw new ForbiddenException('Only JOB_SEEKERs can view this profile type.');
    }
    return this.profilesService.getJobSeekerCompletionPercentage(req.user.userId);
  }

  @Get('employer/:id/public')
  async getPublicEmployerProfile(@Request() req, @Param('id') id: string) {
    return this.profilesService.getPublicEmployerProfile(id);
  }
}
