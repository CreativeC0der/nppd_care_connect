import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PatientsModule } from './patients/patients.module';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { LoadEhrDataService } from './load_ehr_data/load_ehr_data.service';
import { LoadEhrDataController } from './load_ehr_data/load_ehr_data.controller';
import { LoadEhrDataModule } from './load_ehr_data/load_ehr_data.module';
import { PractitionersModule } from './practitioners/practitioners.module';
import { CareplansModule } from './careplans/careplans.module';
import { EncountersModule } from './encounters/encounters.module';
import { ConditionsModule } from './conditions/conditions.module';
import { MedicationsModule } from './medications/medications.module';
import { ScheduleModule } from '@nestjs/schedule';
import { CronModule } from './Utils/cron/cron.module';
import { ObservationsModule } from './observations/observations.module';
import { HealthboxModule } from './healthbox/healthbox.module';
import { NutritionProductModule } from './nutrition-product/nutrition-product.module';
import { DevicesModule } from './devices/devices.module';
import { AppointmentsModule } from './appointments/appointments.module';
import { SchedulesModule } from './schedules/schedules.module';
import { QuestionnaireModule } from './questionnaire/questionnaire.module';
import { ServiceRequestsModule } from './service-requests/service-requests.module';
import { PastMedicalRecordsModule } from './past-medical-records/past-medical-records.module';
import { AuthModule } from './auth/auth.module';
import { FirebaseConfig } from './Utils/config/firebase.config';
import { HospitalModule } from './hospitals/hospital.module';
import { OrganizationsModule } from './organizations/organizations.module';
import { HealthcareServicesModule } from './healthcare-services/healthcare-services.module';
import { LocationsModule } from './locations/locations.module';
import { DiagnosticReportsModule } from './diagnostic-reports/diagnostic-reports.module';
import { ProceduresModule } from './procedures/procedures.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: process.env.ENVIRONMENT === 'production',
      envFilePath: '.env.local',
      isGlobal: true
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: true, // Set to false in production,
      ssl: process.env.ENVIRONMENT === 'production' ? { rejectUnauthorized: false } : false
      // logging: true,
      // logger: 'advanced-console'
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'defaultSecretKey',
      signOptions: { expiresIn: '1h' }, // Token expiration time
      global: true, // Makes the JWT module available globally
      verifyOptions: { algorithms: ['HS256'] }, // Specify the algorithm used for signing
    }),
    ScheduleModule.forRoot(),
    PatientsModule,
    LoadEhrDataModule,
    PractitionersModule,
    CareplansModule,
    EncountersModule,
    ConditionsModule,
    MedicationsModule,
    CronModule,
    ObservationsModule,
    HealthboxModule,
    NutritionProductModule,
    DevicesModule,
    AppointmentsModule,
    SchedulesModule,
    QuestionnaireModule,
    ServiceRequestsModule,
    PastMedicalRecordsModule,
    AuthModule,
    HospitalModule,
    OrganizationsModule,
    HealthcareServicesModule,
    LocationsModule,
    DiagnosticReportsModule,
    ProceduresModule,
    AdminModule
  ],
  controllers: [AppController, LoadEhrDataController],
  providers: [AppService, LoadEhrDataService, FirebaseConfig],
})
export class AppModule { }
