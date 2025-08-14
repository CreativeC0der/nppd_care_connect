import {
    Controller,
    Post,
    Body,
    HttpCode,
    HttpStatus,
    InternalServerErrorException,
    Res,
    UnauthorizedException
} from '@nestjs/common';
import { Response } from 'express';
import { ApiResponse } from '@nestjs/swagger';

// Import services and DTOs
import { AuthService } from './auth.service';
import { OtpLoginDto } from './dto/otp-login.dto';
import { FirebaseOAuthDto } from './dto/firebase-oauth.dto';
import { ApiResponseDTO } from '../Utils/classes/apiResponse.dto';
import { Public } from '../Utils/decorators/public.decorator';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    /**
     * Unified login endpoint for both patients and practitioners (OTP-based)
     * @param loginData - Contains fhirId, otp (optional), and role
     * @param res - Express response object for setting cookies
     * @returns Authentication result
     */
    @Post('/login-otp')
    @HttpCode(HttpStatus.OK)
    @Public() // Allow access without authentication
    @ApiResponse({ type: ApiResponseDTO })
    async loginOtp(@Body() loginData: OtpLoginDto, @Res({ passthrough: true }) res: Response) {
        try {
            // Call unified auth service
            const { message, data, accessToken } = await this.authService.loginWithOtp(loginData);

            // Set HTTP-only cookie for security
            if (accessToken) {
                res.cookie('accessToken', accessToken, {
                    httpOnly: true,
                    secure: process.env.ENVIRONMENT === 'production' ? true : false, // Set to true in production (HTTPS)
                    sameSite: process.env.ENVIRONMENT === 'production' ? 'none' : 'lax',
                    maxAge: 60 * 60 * 1000, // 1 hour
                });
            }

            return new ApiResponseDTO({ message, statusCode: HttpStatus.OK, data });
        } catch (err) {
            console.error('Login error:', err);
            // Re-throw specific exceptions
            if (err instanceof UnauthorizedException) {
                throw err;
            }
            // Handle other errors
            throw new InternalServerErrorException('Login failed with error: ' + err.message);
        }
    }

    /**
     * Firebase OAuth login endpoint
     * @param oauthData - Contains firebaseToken and role
     * @param res - Express response object for setting cookies
     * @returns Authentication result
     */
    @Post('/login-oauth')
    @HttpCode(HttpStatus.OK)
    @Public() // Allow access without authentication
    @ApiResponse({ type: ApiResponseDTO })
    async loginOAuth(@Body() oauthData: FirebaseOAuthDto, @Res({ passthrough: true }) res: Response) {
        try {
            // Call Firebase OAuth auth service
            const { message, data, accessToken } = await this.authService.loginWithFirebase(oauthData);

            // Set HTTP-only cookie for security
            if (accessToken) {
                res.cookie('accessToken', accessToken, {
                    httpOnly: true,
                    secure: process.env.ENVIRONMENT === 'production' ? true : false, // Set to true in production (HTTPS)
                    sameSite: process.env.ENVIRONMENT === 'production' ? 'none' : 'lax',
                    maxAge: 60 * 60 * 1000, // 1 hour
                });
            }

            return new ApiResponseDTO({ message, statusCode: HttpStatus.OK, data });
        } catch (err) {
            console.error('Firebase OAuth login error:', err);
            // Re-throw specific exceptions
            if (err instanceof UnauthorizedException) {
                throw err;
            }
            // Handle other errors
            throw new InternalServerErrorException('Firebase OAuth login failed with error: ' + err.message);
        }
    }
} 