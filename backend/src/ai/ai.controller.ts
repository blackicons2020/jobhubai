import { Controller, Post, Body, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
  constructor(
    private readonly aiService: AiService,
    private readonly prisma: PrismaService
  ) {}

  private async checkGenerationLimit(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new ForbiddenException('User not found');
    
    if (user.subscriptionTier === 'FREE') {
      if (user.freeGenerationsUsed >= 1) {
        throw new ForbiddenException('Free generation limit reached. Please upgrade to Premium.');
      }
      await this.prisma.user.update({
        where: { id: userId },
        data: { freeGenerationsUsed: { increment: 1 } }
      });
    }
  }

  @Post('resume/generate')
  async generateResume(@Request() req, @Body() profileData: any) {
    await this.checkGenerationLimit(req.user.userId);
    const resume = await this.aiService.generateResume(profileData);
    
    // Save to profile
    if (req.user.role === 'JOB_SEEKER') {
      await this.prisma.jobSeekerProfile.update({
        where: { userId: req.user.userId },
        data: { resumeContent: resume }
      });
    }
    return { resume };
  }

  @Post('cover-letter/generate')
  async generateCoverLetter(
    @Request() req,
    @Body('profile') profileData: any,
    @Body('job') jobData: any,
  ) {
    await this.checkGenerationLimit(req.user.userId);
    const cover_letter = await this.aiService.generateCoverLetter(
      profileData,
      jobData,
    );
    return { cover_letter };
  }

  @Post('match/score')
  async getMatchScore(
    @Body('profile_text') profileText: string,
    @Body('job_description_text') jobText: string,
  ) {
    const score = await this.aiService.calculateMatchScore(profileText, jobText);
    return { match_score: score };
  }
}
