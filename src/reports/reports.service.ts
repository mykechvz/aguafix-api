import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { envs } from '../config/envs';
import { StorageService } from '../storage/storage.service';
import { EmailService } from '../email/email.service';
import { ReportsRepository } from './repositories/reports.repository';
import { CreateReportDto } from './dto/create-report.dto';
import { generateReportTemplate } from './templates/report.template';
import { Report } from './entities/report.entity';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);

  constructor(
    private readonly reportsRepository: ReportsRepository,
    private readonly emailService: EmailService,
    private readonly storageService: StorageService,
  ) {}

  async create(
    dto: CreateReportDto,
    photo?: Express.Multer.File,
  ): Promise<Report> {
    if (!photo) {
      throw new BadRequestException(
        'La foto de la fuga es obligatoria (campo "photo")',
      );
    }

    const photoUrl = await this.storageService.uploadFile(photo, 'reports');
    const report = await this.reportsRepository.create({ ...dto, photoUrl });

    try {
      await this.emailService.sendEmail(
        envs.mailCrewAddress,
        `Nuevo reporte de fuga: ${dto.address}`,
        generateReportTemplate(dto, photoUrl),
      );
    } catch (error) {
      this.logger.error(
        `No se pudo enviar el correo de aviso para el reporte ${report.id}`,
        error instanceof Error ? error.stack : error,
      );
    }

    return report;
  }

  findAll(): Promise<Report[]> {
    return this.reportsRepository.findAll();
  }
}
