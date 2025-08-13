export interface HospitalAdapter {
    // Sync all entities
    syncAll(): Promise<any>;

    // Individual entity sync methods
    syncPatients(): Promise<any>;
    syncEncounters(): Promise<any>;
    syncAppointments(): Promise<any>;
    syncMedications(): Promise<any>;
    syncObservations(): Promise<any>;
    syncCarePlans(): Promise<any>;
    syncConditions(): Promise<any>;
    syncDevices(): Promise<any>;
    syncPractitioners(practitionerId?: string): Promise<any>;
    syncSchedules(): Promise<any>;
    syncServiceRequests(): Promise<any>;
    syncQuestionnaires(): Promise<any>;
    syncPastMedicalRecords(): Promise<any>;
    syncNutritionProducts(): Promise<any>;
    syncSlots(scheduleFhirId?: string): Promise<any>;
}