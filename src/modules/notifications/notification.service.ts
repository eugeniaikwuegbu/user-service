import { Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailOptions } from '../../interfaces/email-options.interface';
import NotificationMicroService from '../../microservices/notification';
import { welcomeEmailSubject } from './emailSubjects/email-subjects';
import { welcomeEmailHtml } from './templates/welcome-email';

export class NotificationService {
  private configService = new ConfigService();
  private options: MailOptions = {
    fromEmail: this.configService.get('SENDER_EMAIL'),
    fromName: this.configService.get('SENDER_NAME'),
  };

  constructor(
    @Inject(NotificationMicroService)
    private readonly notificationMicroService: NotificationMicroService,
  ) {}

  async sendWelcomeEmail(email: string, userName: string) {
    const html = welcomeEmailHtml(userName);
    const subject = welcomeEmailSubject;
    return this.notificationMicroService.sendOneEmail({
      to: email,
      subject,
      html,
      options: this.options,
    });
  }
}
