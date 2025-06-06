import { Injectable, OnModuleInit } from '@nestjs/common';
import axios from 'axios';
import { PatientsService } from './patients/patients.service';

@Injectable()
export class AppService implements OnModuleInit {

  async onModuleInit() {
    console.log('Modules Initialized')
  }
  getHello(): string {
    return 'Hello World!'
  }
}
