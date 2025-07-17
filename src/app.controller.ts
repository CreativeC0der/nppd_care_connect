import { Controller, Get, HttpStatus, Req, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from './Utils/guards/auth.guard';
import { Request } from 'express';
import { ApiResponseDTO } from './Utils/classes/apiResponse.dto';
import { ApiOperation } from '@nestjs/swagger';

@Controller()
@UseGuards(AuthGuard)
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get('me')
  @ApiOperation({ summary: 'get user info' })
  async getHello(@Req() req: any) {
    const message = this.appService.getHello();
    return new ApiResponseDTO({ message, data: req.user, statusCode: HttpStatus.OK })
  }
}
