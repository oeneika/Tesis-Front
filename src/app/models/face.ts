export class Face {
  constructor(
    public _id: string,
    public name: string,
    public surname: string,
    public age: string,
    public gender: string,
    public image: string,
    public confidenceLevels: string,
    public user: string,
    public unknown: boolean
  ) {}
}
