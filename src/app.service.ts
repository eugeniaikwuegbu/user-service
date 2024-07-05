import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  healthCheck() {
    return 'User Service is up and running';
  }
}
