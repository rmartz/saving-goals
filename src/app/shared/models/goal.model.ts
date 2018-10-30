import { Budget } from './budget.model';
import { setMembership } from '../utils/membership';
import {firestore} from 'firebase/app';
import Timestamp = firestore.Timestamp;

export interface IGoal {
  label: string;
  target: number;
  current: number;

  created: Timestamp;
  purchased?: Timestamp;
  closed?: Timestamp;
}

export class Goal implements IGoal {
  label: string;
  target: number;
  current: number;

  created: Timestamp;
  purchased?: Timestamp;
  closed?: Timestamp;
  budget: Budget;

  public static fromJSON(budget: Budget, json: IGoal) {
    const goal = new Goal();
    goal.budget = budget;
    Object.assign(goal, json);
    return goal;
  }

  constructor() {
    this.current = 0;
    this.created = Timestamp.now();
  }

  public toJSON(): IGoal {
    const data: IGoal = {
     label: this.label,
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
    this.purchased = Timestamp.now();
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
}
