import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsNumber} from 'class-validator';

export class AddPendingParticipantDto {
    @ApiProperty({
        description: 'ID of the project to which the participant will be added',
        type: Number,
        example: 1,
    })
    @IsNotEmpty()
    @IsNumber()
    projectId: number;

    @ApiProperty({
        description: 'First name of the participant',
        type: String,
        example: 'John',
    })
    @IsString()
    @IsNotEmpty()
    firstName: string;

    @ApiProperty({
        description: 'Last name of the participant',
        type: String,
        example: 'Doe',
    })
    @IsString()
    @IsNotEmpty()
    lastName: string;

    @ApiProperty({
        description: 'Email of the participant',
        type: String,
        example: 'john.doe@example.com',
    })
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        description: 'Student code of the participant',
        type: String,
        example: '1234567890',
    })
    @IsString()
    @IsNotEmpty()
    studentCode: string;

    @ApiProperty({
        description: 'Semester of the participant',
        type: String,
        example: '8',
    })
    @IsString()
    semester?: string;

    @ApiProperty({
        description: 'Career of the participant',
        type: String,
        example: 'Ingeniería de Sistemas',
    })
    @IsString()
    career?: string;

    @ApiProperty({
        description: 'Status of the participant',
        type: String,
        example: 'PENDING',
    })
    @IsString()
    status?: string;
}