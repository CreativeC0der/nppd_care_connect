# Locations Module

This module provides functionality to manage locations and calculate location utilization statistics.

## Features

- Get location utilization statistics based on type, form, and organization
- Retrieve all locations
- Get location by ID

## API Endpoints

### Get Location Utilization

**GET** `/locations/utilization`

Calculates the utilization percentage of locations based on active encounters.

**Query Parameters:**
- `type` (string, required): Location type (e.g., emergency-room, operating-room, ward)
- `form` (string, required): Location form (e.g., building, floor, room)
- `organization` (UUID, required): Organization ID

**Response:**
```json
{
  "encounterCount": 15,
  "locationCount": 20,
  "utilization": 75.0,
  "type": "emergency-room",
  "form": "building",
  "organization": "123e4567-e89b-12d3-a456-426614174000"
}
```

**Calculation:**
- `utilization = (encounterCount / locationCount) * 100`
- Encounters are filtered by status = 'in-progress'
- Locations are filtered by managingOrganization, type, and form

**Example Request:**
```
GET /locations/utilization?type=emergency-room&form=building&organization=123e4567-e89b-12d3-a456-426614174000
```

### Get All Locations

**GET** `/locations`

Retrieves all locations with their managing organization and healthcare service information.

**Response:** Array of location objects

### Get Location by ID

**GET** `/locations/:id`

Retrieves a specific location by ID with all related information.

**Path Parameters:**
- `id` (UUID): Location ID

**Response:** Location object with relations

## Authentication & Authorization

All endpoints require authentication via JWT token and are restricted to users with ADMIN or DOCTOR roles.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

## Error Handling

- **400 Bad Request**: Missing or invalid query parameters
- **401 Unauthorized**: Missing or invalid authentication token
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Location not found (for get by ID endpoint)

## Dependencies

- TypeORM for database operations
- Encounters module for encounter data
- Organizations module for organization data
- Validation pipes for input validation
- Role-based access control 