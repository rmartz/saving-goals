import { Budget } from './budget.model';
import { setMembership } from '../utils/membership';
import { disperseBalance } from '../utils/dispersement';

export enum GoalStatus {
  Funded,
  Priority,
  Earmarked,
  Purchased,
  Normal
}

export enum GoalBehavior {
  Default = '',
  Priority = 'PRIORITY',
  Paused = 'PAUSED',
  Earmarked = 'EARMARKED',
}

type IGoalBase = IGoalV1 | IGoalV2 | IGoalV3;

interface IGoalV1 {
  version: 1;

  label: string;
  target: number;
  current: number;

  created: Date;
  purchased?: Date;
  closed?: Date;
}

function jsonToIGoalV1(start: IGoalBase): IGoalV1 {
  if (start.version !== 1) {
    throw new Error('Unexpected Goal version');
  }
  return start;
}

interface IGoalV2 {
  version: 2;

  label: string;
  target: number;
  current: number;
  earmarked: boolean;

  created: Date;
  purchased?: Date;
  closed?: Date;
}

function jsonToIGoalV2(start: IGoalBase): IGoalV2 {
  if (start.version > 2) {
    throw new Error('Unexpected Goal version');
  }
  if (start.version === 2) {
    return start;
  }

  return {
    ...jsonToIGoalV1(start),
    earmarked: false,
    version: 2,
  };
}

interface IGoalV3 {
  version: 3;

  label: string;
  target: number;
  current: number;
  behavior: GoalBehavior;

  created: Date;
  purchased?: Date;
  closed?: Date;
}

function jsonToIGoalV3(start: IGoalBase): IGoalV3 {
  if (start.version > 3) {
    throw new Error('Unexpected Goal version');
  }
  if (start.version === 3) {
    return start;
  }

  const v2 = jsonToIGoalV2(start);
  return {
    ...v2,
    behavior: v2.earmarked ? GoalBehavior.Earmarked : GoalBehavior.Default,
    version: 3,
  };
}

export type IGoal = IGoalV3;

function jsonToIGoal(start: IGoalBase): IGoal {
  return jsonToIGoalV3(start);
}

export class Goal implements IGoal {
  label: string;
  target: number;
  current: number;
  version: 3;
  behavior: GoalBehavior;
  paused: boolean;

  created: Date;
  purchased?: Date;
  closed?: Date;
  budget: Budget;

  public static fromJSON(budget: Budget, json: IGoalBase) {
    const latest: IGoal = jsonToIGoal(json);
    latest.created = this.genericToDate(latest.created);
    latest.purchased = this.genericToDate(latest.purchased);
    latest.closed = this.genericToDate(latest.closed);

    const goal = new Goal(
      budget,
      latest.label,
      latest.target
    );
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

  constructor(budget: Budget, label: string, target: number) {
    this.current = 0;
    this.version = 3;
    this.created = new Date();
    this.paused = false;
    this.behavior = GoalBehavior.Default;

    this.budget = budget;
    this.label = label;
    this.target = target;
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
      disperseBalance(this.budget, difference);
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

  public isPriority(): boolean {
    return this.behavior === GoalBehavior.Priority && !this.isPurchased();
  }

  public isPaused(): boolean {
    return this.behavior === GoalBehavior.Paused && !this.isPurchased();
  }

  public status(): GoalStatus {
    if (this.isFunded()) {
      return GoalStatus.Funded;
    } else if (this.isPurchased()) {
        return GoalStatus.Purchased;
    } else if (this.behavior === GoalBehavior.Earmarked) {
      return GoalStatus.Earmarked;
    } else if (this.behavior === GoalBehavior.Priority) {
      return GoalStatus.Priority;
    } else {
      return GoalStatus.Normal;
    }
  }
}
