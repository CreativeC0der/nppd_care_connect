import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as admin from 'firebase-admin';

// Import entities
import { Patient } from '../patients/entities/patient.entity';
import { Practitioner } from '../practitioners/entities/practitioner.entity';

// Import DTOs and enums
import { OtpLoginDto } from './dto/otp-login.dto';
import { FirebaseOAuthDto } from './dto/firebase-oauth.dto';
import { Role } from '../Utils/enums/role.enum';
import { OtpService } from '../Utils/otp/otp.service';
import { FirebaseConfig } from '../Utils/config/firebase.config';
import { Admin } from 'src/admin/entities/admin.entity';

@Injectable()
export class AuthService {
    constructor(
        // Inject repositories for both Patient and Practitioner
        @InjectRepository(Patient) private patientRepository: Repository<Patient>,
        @InjectRepository(Practitioner) private practitionerRepository: Repository<Practitioner>,
        @InjectRepository(Admin) private adminRepository: Repository<Admin>,
        // JWT service for token generation
        private jwtService: JwtService,
        // OTP service for authentication
        private otpService: OtpService,
        // Firebase configuration
        private firebaseConfig: FirebaseConfig,
    ) { }

    /**
     * Unified login method that handles both patient and practitioner authentication (OTP-based)
     * @param loginData - Contains fhirId, otp (optional), and role
     * @returns Authentication result with message, data, and access token
     */
    async loginWithOtp(loginData: OtpLoginDto): Promise<{
        message: string;
        data: any;
        accessToken?: string;
    }> {
        // Validate role and get appropriate repository
        const repository = this.getRepositoryByRole(loginData.role);

        // Find user by fhirId
        const existingUser = await repository.findOne({
            where: { fhirId: loginData.fhirId }
        });

        if (!existingUser)
            throw new UnauthorizedException(`${loginData.role} with FHIR ID ${loginData.fhirId} not found`);

        // If no OTP provided, generate and send OTP
        if (!loginData.otp)
            return await this.handleOtpGeneration(existingUser, loginData.role);

        // If OTP provided, validate it
        const otpValid = await this.handleOtpValidation(existingUser, loginData.otp, loginData.role);

        if (otpValid) {
            // Create JWT payload with user data and role
            const payload = { ...existingUser, role: loginData.role };

            // Generate access token
            const accessToken = await this.jwtService.signAsync(payload);

            return {
                message: 'OTP valid',
                accessToken,
                data: payload
            };
        } else {
            throw new UnauthorizedException('Invalid OTP');
        }
    }

    /**
     * Firebase OAuth login method
     * @param oauthData - Contains firebaseToken and role
     * @returns Authentication result with message, data, and access token
     */
    async loginWithFirebase(oauthData: FirebaseOAuthDto): Promise<{
        message: string;
        data: any;
        accessToken: string;
    }> {
        try {
            // Verify Firebase token
            const decodedToken = await this.firebaseConfig.getAuth().verifyIdToken(oauthData.firebaseToken);

            // Get user from database based on Firebase UID
            const repository = this.getRepositoryByRole(oauthData.role);

            // Try to find user by Firebase UID first, then by email
            let user = await repository.findOne({
                where: { firebaseUid: decodedToken.uid }
            });

            if (!user && decodedToken.email) {
                user = await repository.findOne({
                    where: { email: decodedToken.email }
                });

                // If user found by email, update with Firebase UID
                if (user) {
                    user.firebaseUid = decodedToken.uid;
                    await (repository as any).save(user);
                }
            }

            if (!user) {
                throw new UnauthorizedException(`${oauthData.role} not found for user`);
            }

            // Create JWT payload with user data and role
            const payload = { ...user, role: oauthData.role, firebaseUid: decodedToken.uid };

            // Generate access token
            const accessToken = await this.jwtService.signAsync(payload);

            return {
                message: 'Firebase OAuth authentication successful',
                accessToken,
                data: payload
            };
        } catch (error) {
            console.error('Firebase OAuth error:', error);
            throw new UnauthorizedException('Invalid Firebase token or authentication failed');
        }
    }

    /**
     * Get the appropriate repository and user type based on role
     * @param role - User role (PATIENT, DOCTOR, STAFF)
     * @returns Repository and user type string
     */
    private getRepositoryByRole(role: Role) {
        switch (role) {
            case Role.PATIENT:
                return this.patientRepository
            case Role.DOCTOR:
                return this.practitionerRepository

            case Role.ADMIN:
                return this.adminRepository

            default:
                throw new UnauthorizedException(`Invalid role: ${role}`);
        }
    }

    /**
     * Handle OTP generation and email sending
     * @param user - User entity (Patient or Practitioner)
     * @param userType - Type of user for error messages
     * @returns Success message
     */
    private async handleOtpGeneration(user: any, userType: string) {
        // Get user name based on entity type
        const name = `${user.firstName} ${user.lastName}`;
        const email = user.email;

        if (!email) {
            throw new UnauthorizedException(`${userType} email not found`);
        }

        // Generate and send OTP
        const mailSent = await this.otpService.generateOtp(email, name);

        if (mailSent) {
            return {
                message: 'OTP sent to email',
                data: null
            };
        } else {
            throw new InternalServerErrorException('Error sending OTP');
        }
    }

    /**
     * Handle OTP validation and token generation
     * @param user - User entity (Patient or Practitioner)
     * @param otp - OTP to validate
     * @param role - User role for token payload
     * @returns Authentication result with token and user data
     */
    private async handleOtpValidation(user: Patient | Practitioner | Admin, otp: number, role: Role) {
        const email = user.email;

        if (!email) {
            throw new UnauthorizedException('User email not found');
        }

        // Validate OTP
        return await this.otpService.validateOtp(email, otp);
    }

}