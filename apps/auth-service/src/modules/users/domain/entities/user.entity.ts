export enum UserStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
}

export class User {
  constructor(
    public readonly id: number,
    public firstName: string,
    public lastName: string = '',
    public email: string,
    public password: string,
    public phone: string = '',
    public active: boolean = true,
    public status: UserStatus = UserStatus.PENDING,
  ) {}
}
  