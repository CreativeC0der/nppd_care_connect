import { Injectable } from '@nestjs/common';
import * as admin from 'firebase-admin';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';

@Injectable()
export class FirebaseConfig {
    constructor(private configService: ConfigService) { }

    initializeFirebase() {
        if (!admin.apps.length) {
            // Load service account credentials from JSON file
            const parent = process.env.ENVIRONMENT === 'production' ? '/etc/secrets' : process.cwd();
            const serviceAccountPath = path.join(parent, 'nppdcareconnect-firebase-adminsdk-fbsvc-4a29e39be2.json');

            admin.initializeApp({
                credential: admin.credential.cert(serviceAccountPath),
            });
        }
        return admin;
    }

    getAuth() {
        return this.initializeFirebase().auth();
    }
} 