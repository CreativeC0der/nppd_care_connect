
import {
  Controller,
  Post,
  UploadedFiles,
  UseInterceptors,
  HttpException,
  HttpStatus,
  Param,
  Get,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { ApiConsumes, ApiBody, ApiTags, ApiOkResponse } from '@nestjs/swagger';
import { PastMedicalRecordsService } from './past-medical-records.service';
import { Express } from 'express';
import { ApiResponseDTO } from 'src/Utils/classes/apiResponse.dto';
import { Roles } from 'src/Utils/decorators/roles.decorator';
import { Role } from 'src/Utils/enums/role.enum';
import { MedicalRecord } from './entities/past-medical-record.entity';
@ApiTags('Past Medical Records')
@Controller('past-medical-records')
export class PastMedicalRecordsController {
  constructor(private readonly medicalRecordService: PastMedicalRecordsService) { }

  @Post('upload/:encounterFhirId')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'files', maxCount: 10 }], {
      storage: diskStorage({
        destination: './uploads', // optional - for inspection/debug
        filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
      }),
    }),
  )
  async uploadImages(
    @UploadedFiles() files: { files?: Express.Multer.File[] },
    @Param('encounterFhirId') encounterFhirId: string) {

    if (!files?.files || files.files.length === 0) {
      throw new HttpException('No files provided', HttpStatus.BAD_REQUEST);
    }

    return await this.medicalRecordService.processImageFiles(encounterFhirId, files.files);
  }

  @Get('get-by-encounter/:encounterFhirId')
  @ApiOkResponse({ type: [MedicalRecord] })
  async getRecordsByEncounter(
    @Param('encounterFhirId') encounterFhirId: string,
  ): Promise<ApiResponseDTO> {
    try {
      const records = await this.medicalRecordService.findByEncounterFhirId(encounterFhirId);
      return new ApiResponseDTO({ statusCode: HttpStatus.OK, data: records, message: 'Records retrieved successfully.' });
    } catch (error) {
      throw error
    }
  }

}

