import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PatientsModule } from './patients/patients.module';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { Patient } from './patients/entities/patient.entity';

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
      entities: [Patient]
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'defaultSecretKey',
      signOptions: { expiresIn: '1h' }, // Token expiration time
      global: true, // Makes the JWT module available globally
      verifyOptions: { algorithms: ['HS256'] }, // Specify the algorithm used for signing
    }),
    PatientsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
