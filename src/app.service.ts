import { Injectable, OnModuleInit } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class AppService implements OnModuleInit {
  async onModuleInit() {
    const patientId = "e9bbdf84-9348-4078-afba-6bb6e0b89d4b"
    const url = `https://r4.smarthealthit.org/Patient/${patientId}`;

    const response = await axios.get(url);
    const data = response.data;
    console.log(data)
    // throw new Error('Method not implemented.');
  }


  getHello(): string {
    return 'Hello World!';
  }
}
