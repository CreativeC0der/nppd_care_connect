import { Controller } from '@nestjs/common';
import { DiagnosticReportsService } from './diagnostic-reports.service';

@Controller('diagnostic-reports')
export class DiagnosticReportsController {
    constructor(private readonly diagnosticReportsService: DiagnosticReportsService) { }
} 