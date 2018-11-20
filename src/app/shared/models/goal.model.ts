import { Budget } from './budget.model';
import { setMembership } from '../utils/membership';


export interface IGoalBase {
  label: string;
  version: number;
}

export class IGoalV1 implements IGoalBase {
  public static VERSION = 1;

  label: string;
  target: number;
  current: number;
  version: number;

  created: Date;
  purchased?: Date;
  closed?: Date;

  public static fromJSON(start: IGoalBase): IGoalV1 {
    const end = start as IGoalV1;
    end.version = this.VERSION;
    return end;
  }
}

export class IGoal extends IGoalV1 { }
export class IGoalFirebase extends IGoal {
  // Define these as type "any" so we can call .toDate()
  // Importing the actual firebase.firestore.Timestamp type fails on production
  created: any;
  purchased?: any;
  closed?: any;
}

export class Goal implements IGoal {
  label: string;
  target: number;
  current: number;
  version: number;

  created: Date;
  purchased: Date;
  closed: Date;
  budget: Budget;

  public static fromJSON(budget: Budget, json: IGoalBase) {
    const latest: IGoal = IGoal.fromJSON(json);
    latest.created = this.genericToDate(latest.created);
    latest.purchased = this.genericToDate(latest.purchased);
    latest.closed = this.genericToDate(latest.closed);

    const goal = new Goal();
    goal.budget = budget;
    Object.assign(goal, latest);
    return goal;
  }

  private static genericToDate(value: any) {
    if (value === undefined) {
      return undefined;
    } else if (value.toDate) {
      return value.toDate();
    } else {
      return new Date(value);
    }
  }

  constructor() {
    this.current = 0;
    this.version = IGoal.VERSION;
    this.created = new Date();
  }

  public toJSON(): IGoal {
    const data: IGoal = {
     label: this.label,
     version: this.version,
     target: this.target,
     current: this.current,
     created: this.created
    };
    if (this.purchased !== undefined) {
      data['purchased'] = this.purchased;
    }
    if (this.closed !== undefined) {
      data['closed'] = this.closed;
    }
    return data;
  }

  public save(): void {
    if (!this.isPurchased()) {
      setMembership(this.budget.goals, this, true);
    }
    if (this.current > this.target) {
      const difference = this.current - this.target;
      this.current -= difference;
      this.budget.disperse(difference);
    }
  }

  public purchase(cost: number) {
    this.target = cost;
    this.purchased = new Date();
  }

  public isFunded(): boolean {
    return this.current >= this.target;
  }

  public isActive(): boolean {
    // A goal is active if it hasn't met its target yet
    return !this.isFunded();
  }

  public isPurchased(): boolean {
    return (this.purchased !== undefined);
  }

  public isComplete(): boolean {
    // A goal is complete if it has been fully funded and purchased.
    return this.isPurchased() && this.isFunded();
  }

  public isOverdrawn(): boolean {
    // A goal is overdrawn if it was purchased but still has yet to reach its goal.
    return this.isPurchased() && !this.isFunded();
  }

  public loanableBalance(): number {
    // A goal can loan however much it has earmarked, so long as the loan will not prevent the goal
    //  from being purchased when fully funded.
    // We assume that the loaning goal will receive at least as much per contribution as the goals
    //  it is loaning from, so it is safe to loan out less than what the goal needs to be funded.
    // Goals that are already negative (And so have outstanding loans from other goals) will count
    //  against the loanable balance.
    if (this.isPurchased()) {
      // The goal has already been purchased, so count any outstanding balance against our total
      return this.current - this.target;
    } else {
      // The goal can loan whatever it has earmarked, up to the amount it needs to be funded.
      return Math.min(this.current, this.target - this.current);
    }
  }
}
