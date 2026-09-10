import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Report } from '../entities/report.entity';

@Injectable()
export class ReportsRepository {
  constructor(
    @InjectRepository(Report)
    private readonly repository: Repository<Report>,
  ) {}

  create(data: Partial<Report>): Promise<Report> {
    const report = this.repository.create(data);
    return this.repository.save(report);
  }

  findAll(): Promise<Report[]> {
    return this.repository.find({ order: { createdAt: 'DESC' } });
  }
}
