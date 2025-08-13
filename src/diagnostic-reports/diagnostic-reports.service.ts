import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DiagnosticReport } from './entities/diagnostic-report.entity';

@Injectable()
export class DiagnosticReportsService {
    constructor(
        @InjectRepository(DiagnosticReport) private readonly diagnosticReportRepo: Repository<DiagnosticReport>,
    ) { }
} 