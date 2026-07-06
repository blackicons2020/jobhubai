import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AiService {
  private readonly fastApiUrl = 'http://localhost:8000/ai';

  constructor(
    private readonly httpService: HttpService,
    private readonly prisma: PrismaService,
  ) {}

  async generateResume(profileData: any): Promise<string> {
    try {
      const response = await lastValueFrom(
        this.httpService.post(`${this.fastApiUrl}/resume/generate`, profileData),
      );
      return response.data.resume;
    } catch (error) {
      throw new HttpException(
        'Failed to generate resume via AI service',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async generateCoverLetter(profileData: any, jobData: any): Promise<string> {
    try {
      const response = await lastValueFrom(
        this.httpService.post(`${this.fastApiUrl}/cover-letter/generate`, {
          profile: profileData,
          job: jobData,
        }),
      );
      return response.data.cover_letter;
    } catch (error) {
      throw new HttpException(
        'Failed to generate cover letter via AI service',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async calculateMatchScore(profileText: string, jobText: string): Promise<number> {
    try {
      const response = await lastValueFrom(
        this.httpService.post(`${this.fastApiUrl}/match/score`, {
          profile_text: profileText,
          job_description_text: jobText,
        }),
      );
      return response.data.match_score;
    } catch (error) {
      throw new HttpException(
        'Failed to calculate match score via AI service',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
