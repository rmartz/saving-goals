export class Goal {
  constructor() {
    this.current = 0;
  }

  label: string;
  target: number;
  current: number;

  public isActive(): boolean {
    return this.current < this.target;
  }
}
