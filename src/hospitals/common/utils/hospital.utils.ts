export function sanitizeHospitalId(hospitalId: string): string {
    return hospitalId.toLowerCase().replace(/[^a-z0-9-]/g, '');
}

export function generateHospitalReference(prefix: string, id: string): string {
    return `${prefix}-${id}-${Date.now()}`;
} 