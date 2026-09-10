import { Injectable, Logger } from '@nestjs/common';
import { envs } from '../config/envs';
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
  ) {}

  async create(dto: CreateReportDto): Promise<Report> {
    const report = await this.reportsRepository.create(dto);

    try {
      await this.emailService.sendEmail(
        envs.mailCrewAddress,
        `Nuevo reporte de fuga: ${dto.address}`,
        generateReportTemplate(dto),
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
