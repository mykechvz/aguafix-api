import { IsIn, IsNotEmpty, IsString } from 'class-validator';

export enum Severity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

export class CreateReportDto {
  @IsNotEmpty()
  @IsString()
  address: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsIn(Object.values(Severity))
  severity: Severity;

  @IsNotEmpty()
  @IsString()
  reporterPhone: string;
}
