import { IsInt, IsArray, Min } from 'class-validator';

export class AssignPlatformRolesDto {
  @IsInt()
  @Min(1)
  userId: number;

  @IsArray()
  @IsInt({ each: true })
  roleIds: number[];
}
