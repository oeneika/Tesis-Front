export class Video {
  constructor(
    public _id: string,
    public moment_ini: string,
    public moment_final: string,
    public url: string,
    public size: string,
    public quality: string,
    public camera: string
  ) {}
}
