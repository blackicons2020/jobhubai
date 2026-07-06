import { Controller, Post, Body } from '@nestjs/common';
import { AiService } from './ai.service';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('resume/generate')
  async generateResume(@Body() profileData: any) {
    const resume = await this.aiService.generateResume(profileData);
    return { resume };
  }

  @Post('cover-letter/generate')
  async generateCoverLetter(
    @Body('profile') profileData: any,
    @Body('job') jobData: any,
  ) {
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
