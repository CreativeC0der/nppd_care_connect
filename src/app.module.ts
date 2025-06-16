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

@Module({
  imports: [
    ConfigModule.forRoot({
      ignoreEnvFile: process.env.ENVIRONMENT === 'production',
      envFilePath: '.env.development',
      isGlobal: true
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT!, 10) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'healthcare_db',
      autoLoadEntities: true,
      synchronize: true, // Set to false in production
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
    ObservationsModule
  ],
  controllers: [AppController, LoadEhrDataController],
  providers: [AppService, LoadEhrDataService],
})
export class AppModule { }
