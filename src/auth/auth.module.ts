import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule, ConfigService } from '@nestjs/config';

// Import entities
import { Patient } from '../patients/entities/patient.entity';
import { Practitioner } from '../practitioners/entities/practitioner.entity';
import { Admin } from 'src/admin/entities/admin.entity';

// Import services
import { AuthService } from './auth.service';
import { OtpService } from '../Utils/otp/otp.service';
import { AuthController } from './auth.controller';
import { RedisModule } from 'src/Utils/redis/redis.module';
import { MailerModule } from 'src/Utils/mailer/mailer.module';
import { FirebaseConfig } from '../Utils/config/firebase.config';

@Module({
    imports: [
        // Import both Patient and Practitioner repositories
        TypeOrmModule.forFeature([Patient, Practitioner, Admin]),
        // HTTP module for external API calls
        HttpModule,
        RedisModule,
        MailerModule,
        ConfigModule
    ],
    controllers: [AuthController],
    providers: [AuthService, OtpService, FirebaseConfig],
    exports: [AuthService, FirebaseConfig], // Export for use in other modules
})
export class AuthModule { } 