import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDTO {
  @ApiProperty({
    example: 'John',
    description: "User's first name",
  })
  @IsNotEmpty()
  @IsString()
  firstName?: string;

  @ApiProperty({
    example: 'Doe',
    description: "User's last name",
  })
  @IsNotEmpty()
  @IsString()
  lastName?: string;

  @ApiProperty({
    example: 'hello@gmail.com',
    description: 'Email address of the user',
  })
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase())
  email: string;

  @ApiProperty({ type: 'string', format: 'binary' })
  avatar: any;
}
