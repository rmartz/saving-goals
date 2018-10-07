export class Goal {
  constructor() {
    this.current = 0;
    this.purchased = false;
  }

  label: string;
  target: number;
  current: number;
  purchased: boolean;

  public isFunded(): boolean {
    return this.current >= this.target;
  }

  public isActive(): boolean {
    // A goal is active if it hasn't met its target yet
    return !this.isFunded();
  }

  public isComplete(): boolean {
    // A goal is complete if it has been fully funded but not yet purchased.
    return !this.purchased && this.isFunded();
  }

  public isHidden(): boolean {
    // Goals are hidden once they are purchased and fully funded
    return this.purchased && this.isFunded();
  }

  public isVisible(): boolean {
    return !this.isHidden();
  }

  public isOverdrawn(): boolean {
    // A goal is overdrawn if it was purchased but still has yet to reach its goal.
    return this.purchased && !this.isFunded();
  }
}
