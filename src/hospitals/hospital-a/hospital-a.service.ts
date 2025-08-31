import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, InternalServerErrorException, OnModuleInit, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { Encounter } from 'src/encounters/entities/encounter.entity';
import { Patient } from 'src/patients/entities/patient.entity';
import { Practitioner } from 'src/practitioners/entities/practitioner.entity';
import { HospitalAdapter } from 'src/Utils/classes/hospitalAdapter';
import { In, Repository } from 'typeorm';
import * as mapper from './mappers/mapper.json';
import * as jsonata from 'jsonata';
import { Organization } from 'src/organizations/entities/organization.entity';
import { Condition } from 'src/conditions/entities/condition.entity';
import { MedicationRequest } from 'src/medications/entities/medication-request.entity';
import { Medication, MedicationStatus } from 'src/medications/entities/medication.entity';
import { Appointment } from 'src/appointments/entities/appointment.entity';
import { Schedule } from 'src/schedules/entities/schedule.entity';
import { Slot } from 'src/schedules/entities/slot.entity';
import { Observation } from 'src/observations/entities/observation.entity';
import { DiagnosticReport } from 'src/diagnostic-reports/entities/diagnostic-report.entity';
import { Procedure } from 'src/procedures/entities/procedure.entity';
import { Redis } from 'ioredis';

@Injectable()
export class HospitalAService implements HospitalAdapter, OnModuleInit {
    private baseUrl: string;
    private organizationId: string;
    private organization: Organization;

    constructor(
        private readonly httpService: HttpService,
        @InjectRepository(Patient)
        private readonly patientRepository: Repository<Patient>,
        @InjectRepository(Encounter)
        private readonly encounterRepository: Repository<Encounter>,
        @InjectRepository(Practitioner)
        private readonly practitionerRepository: Repository<Practitioner>,
        @InjectRepository(Organization)
        private readonly organizationRepository: Repository<Organization>,
        @InjectRepository(Condition)
        private readonly conditionRepository: Repository<Condition>,
        @InjectRepository(MedicationRequest)
        private readonly medicationRequestRepository: Repository<MedicationRequest>,
        @InjectRepository(Medication)
        private readonly medicationRepository: Repository<Medication>,
        @InjectRepository(Appointment)
        private readonly appointmentRepository: Repository<Appointment>,
        @InjectRepository(Schedule)
        private readonly scheduleRepository: Repository<Schedule>,
        @InjectRepository(Slot)
        private readonly slotRepository: Repository<Slot>,
        @InjectRepository(Observation)
        private readonly observationRepository: Repository<Observation>,
        @InjectRepository(DiagnosticReport)
        private readonly diagnosticReportRepository: Repository<DiagnosticReport>,
        @InjectRepository(Procedure)
        private readonly procedureRepository: Repository<Procedure>,
        @Inject('REDIS_CLIENT')
        private readonly redisClient: Redis,
    ) { }

    async onModuleInit(): Promise<void> {
        // Initialize the mapper
        this.baseUrl = mapper.url;
        this.organizationId = mapper.organizationId;

        // Get the organization
        const organization = await this.organizationRepository.findOneBy({ fhirId: this.organizationId });
        if (!organization) {
            console.error(`Organization not found`);
            return;
        }
        this.organization = organization;

    }

    async syncAll(): Promise<any> {
        // Sync all entities
        const patientResult = await this.syncPatients();
        console.log('Patient Data Loaded');
        const encounterResult = await this.syncEncounters();
        console.log('Encounter Data Loaded');
        const conditionResult = await this.syncConditions();
        console.log('Condition Data Loaded');
        const medicationRequestResult = await this.syncMedicationRequests();
        console.log('Medication Request Data Loaded');
        const appointmentResult = await this.syncAppointments();
        console.log('Appointment Data Loaded');
        const scheduleResult = await this.syncSchedules();
        console.log('Schedule Data Loaded');
        const observationResult = await this.syncObservations();
        console.log('Observation Data Loaded');
        const diagnosticReportResult = await this.syncDiagnosticReports();
        console.log('Diagnostic Report Data Loaded');
        const procedureResult = await this.syncProcedures();
        console.log('Procedure Data Loaded');
        return {
            patients: patientResult,
            encounters: encounterResult,
            conditions: conditionResult,
            medicationRequests: medicationRequestResult,
            appointments: appointmentResult,
            schedules: scheduleResult,
            observations: observationResult,
            diagnosticReports: diagnosticReportResult,
            procedures: procedureResult,
        };
    }

    async syncPatients(fhir_id?: string): Promise<any> {
        try {
            // Fetch 10 patients
            const url = `${this.baseUrl}/Patient`;

            const response = await lastValueFrom(this.httpService.get(url))
            const patients = response.data.entry || [];
            console.log(`Fetched ${patients.length} patients`);

            const patientsToUpsert: Patient[] = [];

            for (const entry of patients.slice(0, 10)) {
                const data = entry.resource;
                console.log('Processing patient:', data.id);

                // Use JSONata mapping
                const patientData: Patient = this.patientRepository.create({});
                for (const [key, expr] of Object.entries(mapper.patientMapper) as [string, string][]) {
                    patientData[key] = await jsonata(expr).evaluate(data);
                }
                patientsToUpsert.push(patientData);
            }

            // Use upsert (requires PostgreSQL and unique constraint on fhirId)
            return await this.patientRepository.upsert(patientsToUpsert, ['fhirId']);
        }
        catch (err) {
            console.error(err);
            if (err instanceof BadRequestException)
                throw err;
            throw new InternalServerErrorException(`Error syncing patients`);
        }
    }

    async syncEncounters(): Promise<any> {
        try {
            // Fetch all patients from the database
            const patients = await this.patientRepository.find();
            const encounters: Encounter[] = [];

            for (const patient of patients) {
                const patientFhirId = patient.fhirId;
                const url = `${this.baseUrl}/Encounter?subject=${patientFhirId}&_count=200`;
                const response = await firstValueFrom(this.httpService.get(url));
                const entries = response.data?.entry || [];

                console.log(`Encounters fetched for patient ${patientFhirId}`);

                for (const entry of entries) {
                    const resource = entry?.resource;

                    // Use JSONata mapping
                    const encounterData: any = {};
                    for (const [key, expr] of Object.entries(mapper.encounterMapper) as [string, string][]) {
                        encounterData[key] = await jsonata(expr).evaluate(resource);
                    }

                    // console.log(encounterData.practitionerFhirIds);
                    // Practitioners
                    const practitioners: Practitioner[] = [];
                    for (const practitionerId of encounterData.practitionerFhirIds) {
                        const practitioner = await this.syncPractitioners(practitionerId);
                        practitioners.push(practitioner);
                    }

                    encounterData.patient = patient;
                    encounterData.practitioners = practitioners;
                    encounterData.serviceProvider = this.organization;
                    // Find existing encounter
                    const existing = await this.encounterRepository.findOne({
                        where: {
                            fhirId: encounterData.fhirId,
                            patient: { fhirId: patientFhirId },
                        },
                    });
                    const mergedEncounter = this.encounterRepository.merge(
                        existing || this.encounterRepository.create({}),
                        encounterData
                    );
                    encounters.push(mergedEncounter);
                }
            }
            return this.encounterRepository.save(encounters);
        }
        catch (err) {
            console.error(err);
            if (err instanceof BadRequestException)
                throw err;
            throw new InternalServerErrorException(`Error syncing encounters`);
        }
    }
    async syncAppointments(): Promise<any> {
        try {
            // Get all patients from the organization
            const distinctPatients = await this.encounterRepository
                .createQueryBuilder('encounter')
                .innerJoin('encounter.patient', 'patient')
                .innerJoin('encounter.serviceProvider', 'organization')
                .select('DISTINCT patient.id')
                .where('organization.id = :orgId', { orgId: this.organization.id })
                .getRawMany();

            const appointments: Appointment[] = [];
            const patients: Patient[] = await this.patientRepository.findBy({
                id: In(distinctPatients.map(p => p.id))
            });

            // Fetch appointments for each patient
            for (const patient of patients) {
                const url = `${this.baseUrl}/Appointment?patient=${patient.fhirId}&_count=200`;
                const response = await firstValueFrom(this.httpService.get(url));
                const entries = response.data?.entry || [];

                console.log(`Appointments fetched for patient ${patient.fhirId}`);

                for (const entry of entries) {
                    const resource = entry?.resource;
                    const existing = await this.appointmentRepository.findOne({
                        where: { fhirId: resource.id }
                    });

                    console.log('Processing appointment', resource.id);

                    // Use JSONata mapping
                    const appointmentData: any = {};
                    for (const [key, expr] of Object.entries(mapper.appointmentMapper) as [string, string][]) {
                        appointmentData[key] = await jsonata(expr).evaluate(resource);
                    }

                    // Set patient
                    appointmentData.patient = patient;

                    // Set service provider (organization)
                    appointmentData.serviceProvider = this.organization;

                    // Fetch and set practitioners if present
                    if (appointmentData.practitionerFhirIds && appointmentData.practitionerFhirIds.length > 0) {
                        const practitioners = await this.practitionerRepository.findBy({
                            fhirId: In(appointmentData.practitionerFhirIds)
                        });
                        appointmentData.participants = practitioners;
                    }

                    const mergedAppointment = this.appointmentRepository.merge(
                        existing || this.appointmentRepository.create({}),
                        appointmentData
                    );

                    const newAppointment = await this.appointmentRepository.save(mergedAppointment);
                    appointments.push(newAppointment);
                }
            }

            return appointments;
        }
        catch (err) {
            console.error(err);
            if (err instanceof BadRequestException)
                throw err;
            throw new InternalServerErrorException(`Error syncing appointments`);
        }
    }



    async syncObservations(): Promise<any> {
        try {
            // Get all patients with encounters from the organization
            const distinctPatients = await this.encounterRepository
                .createQueryBuilder('encounter')
                .innerJoin('encounter.patient', 'patient')
                .innerJoin('encounter.serviceProvider', 'organization')
                .select('DISTINCT patient.id')
                .where('organization.id = :orgId', { orgId: this.organization.id })
                .getRawMany();

            const observations: any[] = [];
            const patients: Patient[] = await this.patientRepository.findBy({
                id: In(distinctPatients.map(p => p.id))
            });

            // Get all observations for each patient
            for (const patient of patients) {
                let entries: any[] = [];
                let url = `${this.baseUrl}/Observation?patient=${patient.fhirId}&_count=200`;
                let response = await firstValueFrom(this.httpService.get(url));
                entries = response.data?.entry || [];
                while (await jsonata(mapper.nextUrl).evaluate(response.data)) {
                    url = await jsonata(mapper.nextUrl).evaluate(response.data);
                    response = await firstValueFrom(this.httpService.get(url));
                    entries.push(...response.data?.entry);
                }

                console.log(`Observations fetched for patient ${patient.fhirId}: ${entries.length} observations`);

                for (const entry of entries) {
                    const resource = entry?.resource;

                    console.log('Processing observation', resource.id);

                    // Use JSONata mapping
                    const observationData: any = {};
                    for (const [key, expr] of Object.entries(mapper.observationMapper) as [string, string][]) {
                        observationData[key] = await jsonata(expr).evaluate(resource);
                    }

                    // Set subject (patient)
                    observationData.patient = patient;

                    // Link encounter if present
                    if (observationData.encounterId) {
                        const encounter = await this.encounterRepository.findOne({
                            where: { fhirId: observationData.encounterId }
                        });
                        if (encounter) {
                            observationData.encounter = encounter;
                        }
                    }

                    // Handle component-based observations (e.g., Blood Pressure)
                    if (Array.isArray(resource.component)) {
                        for (const comp of resource.component) {
                            const componentObservation = { ...observationData };
                            const existing = await this.observationRepository.findOne({
                                where: { fhirId: resource.id, code: comp?.code?.text }
                            });

                            // Override code, value, and unit for component
                            componentObservation.code = comp.code?.text ?? 'N/A';
                            componentObservation.value = comp.valueQuantity?.value ?? comp.valueCodeableConcept?.text ?? 'N/A';
                            componentObservation.unit = comp.valueQuantity?.unit ?? 'N/A';

                            const mergedObservation = this.observationRepository.merge(
                                existing || this.observationRepository.create({}),
                                componentObservation
                            );

                            observations.push(mergedObservation);
                        }
                    } else {
                        const existing = await this.observationRepository.findOne({
                            where: { fhirId: resource.id }
                        });
                        const mergedObservation = this.observationRepository.merge(
                            existing || this.observationRepository.create({}),
                            observationData
                        );

                        observations.push(mergedObservation);
                    }
                }
            }

            return this.observationRepository.save(observations, { chunk: 30 });
        }
        catch (err) {
            console.error(err);
            if (err instanceof BadRequestException)
                throw err;
            throw new InternalServerErrorException(`Error syncing observations`);
        }
    }
    async syncConditions(): Promise<any> {
        try {
            // Get all patients with encounters from the organization
            const distinctPatients = await this.encounterRepository
                .createQueryBuilder('encounter')
                .innerJoin('encounter.patient', 'patient')
                .innerJoin('encounter.serviceProvider', 'organization')
                .select('DISTINCT patient.id')
                .where('organization.id = :orgId', { orgId: this.organization.id })
                .getRawMany();

            const conditions: Condition[] = [];
            const patients: Patient[] = await this.patientRepository.findBy({
                id: In(distinctPatients.map(p => p.id))
            });

            // Get all conditions for each patient
            for (const patient of patients) {
                const url = `${this.baseUrl}/Condition?subject=${patient.fhirId}&_count=200`;
                const response = await firstValueFrom(this.httpService.get(url));
                const entries = response.data?.entry || [];

                for (const entry of entries) {
                    const cond = entry?.resource;
                    const existing = await this.conditionRepository.findOne({ where: { fhirId: cond.id } });

                    console.log('processing condition', cond.id);

                    // Use JSONata mapping
                    const conditionData: any = {};
                    for (const [key, expr] of Object.entries(mapper.conditionMapper) as [string, string][]) {
                        conditionData[key] = await jsonata(expr).evaluate(cond);
                    }

                    // Set subject (patient)
                    conditionData.subject = patient;

                    // Link encounter if present
                    if (conditionData.encounterId) {
                        const encounter = await this.encounterRepository.findOne({ where: { fhirId: conditionData.encounterId } });
                        if (encounter) {
                            conditionData.encounter = encounter;
                        }
                    }

                    const mergedCondition = this.conditionRepository.merge(
                        existing || this.conditionRepository.create({}),
                        conditionData
                    );

                    conditions.push(mergedCondition);
                }
            }
            return this.conditionRepository.save(conditions);
        }
        catch (err) {
            console.error(err);
            if (err instanceof BadRequestException)
                throw err;
            throw new InternalServerErrorException(`Error syncing conditions`);
        }
    }

    async syncPractitioners(practitionerId: string): Promise<any> {
        try {
            // Check Redis cache first
            const cacheKey = `practitioner:${practitionerId}`;
            const cachedPractitioner = await this.redisClient.get(cacheKey);

            if (cachedPractitioner) {
                console.log('Found practitioner in cache:', practitionerId);
                return JSON.parse(cachedPractitioner);
            }

            // If not in cache, fetch from API
            const url = `${this.baseUrl}/Practitioner/${practitionerId}`;
            const response = await firstValueFrom(this.httpService.get(url));
            const data = response.data;

            console.log('Processing practitioner:', data.id);

            // Use JSONata mapping
            const practitionerData: Practitioner = this.practitionerRepository.create({});
            for (const [key, expr] of Object.entries(mapper.practitionerMapper) as [string, string][]) {
                practitionerData[key] = await jsonata(expr).evaluate(data);
            }

            // Find existing practitioner
            const existing = await this.practitionerRepository.findOneBy({ fhirId: practitionerId });

            const mergedPractitioner = this.practitionerRepository.merge(
                existing || this.practitionerRepository.create({}),
                practitionerData);

            const savedPractitioner = await this.practitionerRepository.save(mergedPractitioner);

            // Cache the practitioner with 10 minutes expiry
            await this.redisClient.setex(cacheKey, 600, JSON.stringify(savedPractitioner));
            console.log('Cached practitioner:', practitionerId);

            return savedPractitioner;
        }
        catch (err) {
            console.error(err);
            if (err instanceof BadRequestException)
                throw err;
            throw new InternalServerErrorException(`Error syncing practitioner ${practitionerId}`);
        }
    }
    async syncSchedules(): Promise<any> {
        try {
            // Get all practitioners in the organization
            const distinctPractitioners = await this.encounterRepository
                .createQueryBuilder('encounter')
                .innerJoin('encounter.practitioners', 'practitioners')
                .innerJoin('encounter.serviceProvider', 'organization')
                .select('DISTINCT practitioners.id')
                .where('organization.id = :orgId', { orgId: this.organization.id })
                .getRawMany();

            const practitioners: Practitioner[] = await this.practitionerRepository.findBy({
                id: In(distinctPractitioners.map(p => p.id))
            });

            const schedules: Schedule[] = [];

            // Fetch schedules for each practitioner
            for (const practitioner of practitioners) {
                const url = `${this.baseUrl}/Schedule?actor=Practitioner/${practitioner.fhirId}`;
                const response = await firstValueFrom(this.httpService.get(url));
                const entries = response.data?.entry || [];

                console.log(`Schedules fetched for practitioner ${practitioner.fhirId}`);

                for (const entry of entries) {
                    const resource = entry?.resource;
                    const existing = await this.scheduleRepository.findOne({
                        where: { fhirId: resource.id }
                    });

                    console.log('Processing schedule', resource.id);

                    // Use JSONata mapping
                    const scheduleData: any = {};
                    for (const [key, expr] of Object.entries(mapper.scheduleMapper) as [string, string][]) {
                        scheduleData[key] = await jsonata(expr).evaluate(resource);
                    }

                    // Set actor (practitioner)
                    scheduleData.actor = practitioner;

                    const mergedSchedule = this.scheduleRepository.merge(
                        existing || this.scheduleRepository.create({}),
                        scheduleData
                    );

                    schedules.push(mergedSchedule);
                }
            }

            const savedSchedules = await this.scheduleRepository.save(schedules);

            // Sync slots for each schedule
            for (const schedule of savedSchedules) {
                await this.syncSlots(schedule.fhirId);
            }

            return savedSchedules;
        }
        catch (err) {
            console.error(err);
            if (err instanceof BadRequestException)
                throw err;
            throw new InternalServerErrorException(`Error syncing schedules`);
        }
    }

    async syncSlots(scheduleFhirId: string): Promise<any> {
        try {
            const url = `${this.baseUrl}/Slot?schedule=Schedule/${scheduleFhirId}`;
            const response = await firstValueFrom(this.httpService.get(url));
            const entries = response.data?.entry || [];

            console.log(`Slots fetched for schedule ${scheduleFhirId}: ${entries.length} slots`);

            const slots: Slot[] = [];

            for (const entry of entries) {
                const resource = entry?.resource;
                const existing = await this.slotRepository.findOne({
                    where: { fhirId: resource.id }
                });

                console.log('Processing slot', resource.id);

                // Use JSONata mapping
                const slotData: any = {};
                for (const [key, expr] of Object.entries(mapper.slotMapper) as [string, string][]) {
                    slotData[key] = await jsonata(expr).evaluate(resource);
                }

                // Find the schedule
                const schedule = await this.scheduleRepository.findOne({
                    where: { fhirId: scheduleFhirId }
                });

                if (schedule) {
                    slotData.schedule = schedule;
                }

                const mergedSlot = this.slotRepository.merge(
                    existing || this.slotRepository.create({}),
                    slotData
                );

                slots.push(mergedSlot);
            }

            return this.slotRepository.save(slots);
        }
        catch (err) {
            console.error(err);
            if (err instanceof BadRequestException)
                throw err;
            throw new InternalServerErrorException(`Error syncing slots for schedule ${scheduleFhirId}`);
        }
    }

    async syncMedicationRequests(): Promise<any> {
        try {
            // 1. Load the distinct patients associated with the organization
            const distinctPatients = await this.encounterRepository
                .createQueryBuilder('encounter')
                .innerJoin('encounter.patient', 'patient')
                .innerJoin('encounter.serviceProvider', 'organization')
                .select('DISTINCT patient.id')
                .where('organization.id = :orgId', { orgId: this.organization.id })
                .getRawMany();

            const medicationRequests: MedicationRequest[] = [];
            const patients: Patient[] = await this.patientRepository.findBy({
                id: In(distinctPatients.map(p => p.id))
            });

            // 2. Call the URL to get medication requests for each patient
            for (const patient of patients) {
                const url = `${this.baseUrl}/MedicationRequest?patient=${patient.fhirId}&_count=200`;
                const response = await firstValueFrom(this.httpService.get(url));
                const entries = response.data?.entry || [];

                console.log(`Medication requests fetched for patient ${patient.fhirId}`);

                for (const entry of entries) {
                    const resource = entry?.resource;
                    const existing = await this.medicationRequestRepository.findOne({
                        where: { fhirId: resource.id }
                    });

                    console.log('Processing medication request', resource.id);

                    // Use JSONata mapping (assuming you have medicationRequestMapper in mapper.json)
                    const medicationRequestData: any = {};
                    for (const [key, expr] of Object.entries(mapper.MedicationRequestsMapper) as [string, string][]) {
                        medicationRequestData[key] = await jsonata(expr).evaluate(resource);
                    }

                    // Set subject (patient)    
                    medicationRequestData.subject = patient;

                    // Fetch and set encounter if present
                    if (medicationRequestData.encounterId) {
                        const encounter = await this.encounterRepository.findOne({
                            where: { fhirId: medicationRequestData.encounterId }
                        });
                        if (encounter) {
                            medicationRequestData.encounter = encounter;
                        }
                    }

                    // Fetch and set practitioner if present
                    if (medicationRequestData.requesterId) {
                        const practitioner = await this.practitionerRepository.findOne({
                            where: { fhirId: medicationRequestData.requesterId }
                        });
                        if (practitioner) {
                            medicationRequestData.requester = practitioner;
                        }
                    }

                    // Fetch and set condition from reasonReference if present
                    if (medicationRequestData.conditionId) {
                        const condition = await this.conditionRepository.findOne({
                            where: { fhirId: medicationRequestData.conditionId }
                        });
                        if (condition) {
                            // Set the condition as the reason for the medication request
                            medicationRequestData.condition = condition;
                        }
                    }

                    // Create or find medication based on medicationName
                    if (medicationRequestData.medicationName) {
                        const medicationName = medicationRequestData.medicationName;
                        const medicationCode = medicationRequestData.medicationCode;

                        let medication = await this.medicationRepository.findOne({
                            where: { code: medicationCode }
                        });

                        if (!medication) {
                            // Create new medication
                            medication = this.medicationRepository.create({
                                fhirId: randomUUID(),
                                code: medicationCode,
                                definition: medicationName,
                                status: MedicationStatus.ACTIVE,
                            });
                            medication = await this.medicationRepository.save(medication);
                        }

                        medicationRequestData.medication = medication;
                    }

                    const mergedMedicationRequest = this.medicationRequestRepository.merge(
                        existing || this.medicationRequestRepository.create({}),
                        medicationRequestData
                    );

                    medicationRequests.push(mergedMedicationRequest);
                }
            }

            // 4. Save the medication requests
            return this.medicationRequestRepository.save(medicationRequests);
        }
        catch (err) {
            console.error(err);
            if (err instanceof BadRequestException)
                throw err;
            throw new InternalServerErrorException(`Error syncing medication requests`);
        }
    }

    async syncDiagnosticReports(): Promise<any> {
        try {
            // 1. Load the distinct patients associated with the organization
            const distinctPatients = await this.encounterRepository
                .createQueryBuilder('encounter')
                .innerJoin('encounter.patient', 'patient')
                .innerJoin('encounter.serviceProvider', 'organization')
                .select('DISTINCT patient.id')
                .where('organization.id = :orgId', { orgId: this.organization.id })
                .getRawMany();

            const diagnosticReports: DiagnosticReport[] = [];
            const patients: Patient[] = await this.patientRepository.findBy({
                id: In(distinctPatients.map(p => p.id))
            });

            // 2. Call the URL to get diagnostic reports for each patient
            for (const patient of patients) {
                const url = `${this.baseUrl}/DiagnosticReport?patient=${patient.fhirId}&_count=200`;
                const response = await firstValueFrom(this.httpService.get(url));
                const entries = response.data?.entry || [];

                console.log(`Diagnostic reports fetched for patient ${patient.fhirId}: ${entries.length} reports`);

                for (const entry of entries) {
                    const resource = entry?.resource;
                    const existing = await this.diagnosticReportRepository.findOne({
                        where: { fhirId: resource.id }
                    });

                    console.log('Processing diagnostic report', resource.id);

                    // Use JSONata mapping
                    const diagnosticReportData: any = {};
                    for (const [key, expr] of Object.entries(mapper.diagnosticReportMapper) as [string, string][]) {
                        diagnosticReportData[key] = await jsonata(expr).evaluate(resource);
                    }

                    // Set subject (patient)    
                    diagnosticReportData.subject = patient;

                    // Fetch and set encounter if present
                    if (diagnosticReportData.encounterId) {
                        const encounter = await this.encounterRepository.findOne({
                            where: { fhirId: diagnosticReportData.encounterId }
                        });
                        if (encounter) {
                            diagnosticReportData.encounter = encounter;
                        }
                    }

                    const mergedDiagnosticReport = this.diagnosticReportRepository.merge(
                        existing || this.diagnosticReportRepository.create({}),
                        diagnosticReportData
                    );

                    const savedDiagnosticReport = await this.diagnosticReportRepository.save(mergedDiagnosticReport);

                    diagnosticReports.push(savedDiagnosticReport);

                    // Link observations from the result array
                    console.log('Linking observations to diagnostic report', diagnosticReportData.resultFhirIds);
                    if (diagnosticReportData.resultFhirIds && diagnosticReportData.resultFhirIds.length > 0) {
                        const observations = await this.observationRepository.findBy({
                            fhirId: In(diagnosticReportData.resultFhirIds)
                        });
                        console.log('Observations not found', diagnosticReportData.resultFhirIds.length - observations.length);
                        for (const observation of observations) {
                            observation.diagnosticReport = savedDiagnosticReport;
                            await this.observationRepository.save(observation);
                        }
                    }
                }
            }

            // 4. Save the diagnostic reports
            return diagnosticReports;
        }
        catch (err) {
            console.error(err);
            if (err instanceof BadRequestException)
                throw err;
            throw new InternalServerErrorException(`Error syncing diagnostic reports`);
        }
    }

    async syncProcedures(): Promise<any> {
        try {
            // 1. Load the distinct patients associated with the organization
            const distinctPatients = await this.encounterRepository
                .createQueryBuilder('encounter')
                .innerJoin('encounter.patient', 'patient')
                .innerJoin('encounter.serviceProvider', 'organization')
                .select('DISTINCT patient.id')
                .where('organization.id = :orgId', { orgId: this.organization.id })
                .getRawMany();

            const procedures: Procedure[] = [];
            const patients: Patient[] = await this.patientRepository.findBy({
                id: In(distinctPatients.map(p => p.id))
            });

            // 2. Call the URL to get procedures for each patient
            for (const patient of patients) {
                const url = `${this.baseUrl}/Procedure?patient=${patient.fhirId}&_count=200`;
                const response = await firstValueFrom(this.httpService.get(url));
                const entries = response.data?.entry || [];

                console.log(`Procedures fetched for patient ${patient.fhirId}: ${entries.length} procedures`);

                for (const entry of entries) {
                    const resource = entry?.resource;
                    const existing = await this.procedureRepository.findOne({
                        where: { fhirId: resource.id }
                    });

                    console.log('Processing procedure', resource.id);

                    // Use JSONata mapping
                    const procedureData: any = {};
                    for (const [key, expr] of Object.entries(mapper.procedureMapper) as [string, string][]) {
                        procedureData[key] = await jsonata(expr).evaluate(resource);
                    }

                    // Set subject (patient)    
                    procedureData.subject = patient;

                    // Fetch and set encounter if present
                    if (procedureData.encounterId) {
                        const encounter = await this.encounterRepository.findOne({
                            where: { fhirId: procedureData.encounterId }
                        });
                        if (encounter) {
                            procedureData.encounter = encounter;
                        }
                    }

                    const mergedProcedure = this.procedureRepository.merge(
                        existing || this.procedureRepository.create({}),
                        procedureData
                    );

                    const savedProcedure = await this.procedureRepository.save(mergedProcedure);

                    procedures.push(savedProcedure);

                    // Link conditions from the reasonReference array
                    if (procedureData.reasonFhirIds && procedureData.reasonFhirIds.length > 0) {
                        const conditions = await this.conditionRepository.findBy({
                            fhirId: In(procedureData.reasonFhirIds)
                        });
                        console.log('Conditions not found', procedureData.reasonFhirIds.length - conditions.length);
                        for (const condition of conditions) {
                            condition.procedure = savedProcedure;
                            await this.conditionRepository.save(condition);
                        }
                    }
                }
            }

            // 3. Save the procedures
            return procedures;
        }
        catch (err) {
            console.error(err);
            if (err instanceof BadRequestException)
                throw err;
            throw new InternalServerErrorException(`Error syncing procedures`);
        }
    }

    syncMedications(): Promise<any> {
        throw new Error('Method not implemented.');
    }

    async syncServiceRequests(): Promise<any> {
        throw new Error('Method not implemented.');
    }
    async syncQuestionnaires(): Promise<any> {
        throw new Error('Method not implemented.');
    }
    async syncPastMedicalRecords(): Promise<any> {
        throw new Error('Method not implemented.');
    }
    async syncNutritionProducts(): Promise<any> {
        throw new Error('Method not implemented.');
    }

    syncCarePlans(): Promise<any> {
        throw new Error('Method not implemented.');
    }
    syncDevices(): Promise<any> {
        throw new Error('Method not implemented.');
    }

} 