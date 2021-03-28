export class User {
  constructor(
    public _id: string,
    public name: string,
    public surname: string,
    public email: string,
    public password: string,
    public birthday: string,
    public country: string,
    public image: string,
    public role: string
  ) {}
}
