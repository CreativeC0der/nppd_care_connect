import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { QuestionnaireService } from './questionnaire.service';
import { CreateQuestionnaireDto } from './dto/create-questionnaire.dto';
import { Questionnaire } from './entities/questionnaire.entity';
import { ApiResponseDTO } from 'src/Utils/classes/apiResponse.dto';
import { AuthGuard } from 'src/Utils/guards/auth.guard';
import { RolesGuard } from 'src/Utils/guards/role.guard';
import { Roles } from 'src/Utils/decorators/roles.decorator';
import { Role } from 'src/Utils/enums/role.enum';
import { CreateQuestionnaireResponseDto } from './dto/create-questionnaire-response.dto';

@ApiTags('Questionnaires')
@Controller('questionnaires')
@UseGuards(AuthGuard, RolesGuard)
export class QuestionnaireController {
  constructor(
    private readonly questionnaireService: QuestionnaireService,
  ) { }

  @Post('create-questionnaire')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new questionnaire' })
  @ApiResponse({
    status: 201,
    description: 'Questionnaire created successfully',
    type: Questionnaire,
  })
  @Roles([Role.ADMIN, Role.DOCTOR])
  async create(@Body() dto: CreateQuestionnaireDto): Promise<ApiResponseDTO> {
    const payload = await this.questionnaireService.createQuestionnaire(dto);
    return new ApiResponseDTO({ message: 'Questionnaire Created Successfully', statusCode: HttpStatus.CREATED, data: payload });
  }

  @Post('create-response')
  @ApiOperation({ summary: 'Create a questionnaire response' })
  @ApiResponse({ status: 201, description: 'Questionnaire response created successfully.' })
  @Roles([Role.ADMIN, Role.DOCTOR])
  async createQuestionnaireResponse(
    @Body() dto: CreateQuestionnaireResponseDto,
  ) {
    return this.questionnaireService.createResponse(dto);
  }


  @Get('get-all')
  @Roles([Role.DOCTOR, Role.ADMIN])
  @ApiOperation({ summary: 'Get all questionnaires' })
  async getAll() {
    const payload = await this.questionnaireService.getAll();
    return new ApiResponseDTO({ message: 'Questionnaire Fetched Successfully', statusCode: HttpStatus.OK, data: payload });
  }
}
