import { MailOptions } from './email-options.interface';

export interface IOneEmail {
  to: string;
  subject: string;
  html: string;
  options?: MailOptions;
  attachments?: any | any[];
}
