import { ApiProperty } from "@nestjs/swagger";
import { HttpStatus } from "@nestjs/common";


export class ApiResponseDTO {

    @ApiProperty({ example: 'API Success', description: 'Api response message' })
    message: string;

    @ApiProperty({ example: HttpStatus.OK, description: 'status of the api request', enum: HttpStatus })
    statusCode: HttpStatus

    @ApiProperty()
    data?: any

    constructor(response: ApiResponseDTO) {
        this.message = response.message ?? 'Operation successfull';
        this.statusCode = response.statusCode ?? HttpStatus.OK;
        this.data = response.data;
    }
}