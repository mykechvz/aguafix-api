import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { envs } from '../config/envs';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private readonly transporter = nodemailer.createTransport({
    host: envs.smtpHost,
    port: envs.smtpPort,
    secure: envs.smtpPort === 465,
    auth: {
      user: envs.smtpUser,
      pass: envs.smtpPass,
    },
  });

  async sendEmail(to: string, subject: string, template: string): Promise<void> {
    await this.transporter.sendMail({
      from: envs.smtpFrom,
      to,
      subject,
      html: template,
    });
    this.logger.log(`Correo enviado a ${to}: "${subject}"`);
  }
}
