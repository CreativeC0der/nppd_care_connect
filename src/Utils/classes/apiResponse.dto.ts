import { ApiProperty } from "@nestjs/swagger";

export class ApiResponseDTO {

    @ApiProperty({ example: 'API Success', description: 'Api response message' })
    message: string;

    @ApiProperty({ example: true, description: 'true if success else false' })
    status: 'success' | 'failure'

    @ApiProperty()
    data?: any

    constructor(response: ApiResponseDTO) {
        this.message = response.message ?? 'Success';
        this.data = response.data;
    }
}