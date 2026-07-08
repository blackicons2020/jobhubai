import { Controller, Post, Get, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Prisma } from '@prisma/client';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createJob(@Request() req, @Body() data: Prisma.JobCreateWithoutEmployerInput) {
    if (req.user.role !== 'EMPLOYER') {
      throw new ForbiddenException('Only EMPLOYERs can post jobs.');
    }
    return this.jobsService.createJob(req.user.userId, data);
  }

  @Get('employer/me')
  @UseGuards(JwtAuthGuard)
  async findMyJobs(@Request() req) {
    if (req.user.role !== 'EMPLOYER') {
      throw new ForbiddenException('Only EMPLOYERs can view their posted jobs.');
    }
    return this.jobsService.findEmployerJobs(req.user.userId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async findFeed(@Request() req) {
    return this.jobsService.findFeed(req.user.userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.jobsService.findOne(id);
  }
}
