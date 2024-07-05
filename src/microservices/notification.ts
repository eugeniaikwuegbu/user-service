import { Injectable } from '@nestjs/common';
import {
  ClientOptions,
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { lastValueFrom } from 'rxjs';
import { MAIL_EVENT } from '../enums/event.pattern.enum';
import { RoutingKeys } from '../enums/routing-keys.enum';
import { IOneEmail } from '../interfaces/email-interface';

@Injectable()
export default class NotificationMicroService {
  private notificationClient: ClientProxy;

  constructor() {
    const rmqOptions: ClientOptions = {
      transport: Transport.RMQ,
      options: {
        urls: [process.env.RABBITMQ_URL],
        queue: RoutingKeys.NOTIFICATION_SERVICE,
        queueOptions: {
          durable: true,
        },
      },
    };

    this.notificationClient = ClientProxyFactory.create(rmqOptions);
  }

  async sendOneEmail(data: IOneEmail): Promise<void> {
    try {
      console.log('message emitted with payload', data);

      await lastValueFrom(
        this.notificationClient.emit(MAIL_EVENT.SINGLE_EMAIL, data),
      );
    } catch (error) {
      console.log('SendOneEmail error', error);
    }
  }
}
