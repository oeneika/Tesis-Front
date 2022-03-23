export class Camera {
  constructor(
    public _id: string,
    public name: string,
    public power: boolean,
    public turn_screen: boolean,
    public administratorId: string
  ) {}
}
