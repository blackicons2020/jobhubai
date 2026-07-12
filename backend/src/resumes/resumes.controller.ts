import { Controller, Post, Get, Body, Param, UseInterceptors, UploadedFile, Req, UseGuards, Res } from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Response } from 'express';

@Controller('resumes')
@UseGuards(JwtAuthGuard)
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @Get()
  async getResumes(@Req() req: any) {
    return this.resumesService.getResumes(req.user.id);
  }

  @Post('parse')
  @UseInterceptors(FileInterceptor('file'))
  async parseResume(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    return this.resumesService.parseResume(file, req.user.id);
  }

  @Post()
  async saveResume(@Body() data: any, @Req() req: any) {
    return this.resumesService.saveResume(req.user.id, data);
  }

  @Post(':id/export/pdf')
  async exportPdf(@Param('id') id: string, @Req() req: any, @Res() res: Response) {
    const pdfBuffer = await this.resumesService.exportPdf(id, req.user.id);
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="resume.pdf"`,
      'Content-Length': pdfBuffer.length,
    });
    res.end(pdfBuffer);
  }

  @Post(':id/ats-optimize')
  async atsOptimize(@Param('id') id: string, @Body('jobDescription') jobDescription: string, @Req() req: any) {
    return this.resumesService.atsOptimize(id, req.user.id, jobDescription);
  }
}
