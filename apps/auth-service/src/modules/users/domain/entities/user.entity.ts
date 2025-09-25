export class User {
    constructor(
      public readonly id: number,
      public firstName: string,
      public lastName: string = '',
      public email: string,
      public username: string,
      public password: string,
      public phone: string = '',
      public active: boolean,
    ) {}
  }
  