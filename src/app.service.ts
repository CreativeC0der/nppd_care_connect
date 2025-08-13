import { Injectable, OnModuleInit } from '@nestjs/common';

@Injectable()
export class AppService implements OnModuleInit {

  async onModuleInit() {
    console.log('Modules Initialized');
  }

  getHello(): string {
    return 'Hello World!'
  }
}
