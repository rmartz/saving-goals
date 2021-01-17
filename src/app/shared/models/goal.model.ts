import { Budget } from './budget.model';
import { setMembership } from '../utils/membership';

export enum GoalStatus {
  Funded,
  Earmarked,
  Purchased,
  Normal
}

export enum GoalBehavior {
  Default = '',
  Paused = 'PAUSED',
  Earmarked = 'EARMARKED',
}

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

export class IGoalV2 extends IGoalV1 {
  public static VERSION = 2;

  earmarked: boolean;

  public static fromJSON(start: IGoalBase): IGoalV2 {
    if (start.version > this.VERSION) {
      throw new Error('Unexpected Goal version');
    }
    if (start.version === this.VERSION) {
      return start as IGoalV2;
    }

    // IGoalV2 is a direct forwards version of IGoalV1, and can be converted in place
    const end = IGoalV1.fromJSON(start) as IGoalV2;
    end.version = this.VERSION;
    end.earmarked = false;
    return end;
  }
}

export class IGoalV3 extends IGoalV1 {
  public static VERSION = 3;

  behavior: GoalBehavior;

  public static fromJSON(start: IGoalBase): IGoalV3 {
    if (start.version > this.VERSION) {
      throw new Error('Unexpected Goal version');
    }
    if (start.version === this.VERSION) {
      return start as IGoalV3;
    }

    const v2 = IGoalV2.fromJSON(start);
    return {
      behavior: v2.earmarked ? GoalBehavior.Earmarked : GoalBehavior.Default,
      closed: v2.closed,
      created: v2.created,
      current: v2.current,
      label: v2.label,
      purchased: v2.purchased,
      target: v2.target,
      version: this.VERSION,
    };
  }
}

export class IGoal extends IGoalV3 { }
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
  behavior: GoalBehavior;
  paused: boolean;

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
      behavior: this.behavior,
      created: this.created,
      current: this.current,
      label: this.label,
      target: this.target,
      version: this.version,
    };
    if (this.purchased !== undefined) {
      data.purchased = this.purchased;
    }
    if (this.closed !== undefined) {
      data.closed = this.closed;
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
    if (this.behavior === GoalBehavior.Paused) {
      this.behavior = GoalBehavior.Default;
    }
    this.target = cost;
    this.purchased = new Date();
  }

  public isFunded(): boolean {
    return this.current >= this.target;
  }

  public isActive(): boolean {
    // A goal is active if it hasn't met its target yet and is not manually paused
    return !this.isFunded() && !this.isPaused();
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

  public isEarmarked(): boolean {
    return this.behavior === GoalBehavior.Earmarked && !this.isPurchased();
  }

  public isPaused(): boolean {
    return this.behavior === GoalBehavior.Paused && !this.isPurchased();
  }

  public status(): GoalStatus {
    if (this.isFunded()) {
      return GoalStatus.Funded;
    } else if (this.isEarmarked()) {
      return GoalStatus.Earmarked;
    } else if (this.isPurchased()) {
      return GoalStatus.Purchased;
    } else {
      return GoalStatus.Normal;
    }
  }
}
