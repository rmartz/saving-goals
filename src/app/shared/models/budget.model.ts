import { Goal, IGoal, GoalStatus, GoalBehavior } from './goal.model';
import { setMembership } from '../utils/membership';
import { disperseBalance } from '../utils/dispersement';

export interface IBudget {
  id?: string;
  label: string;
  owner?: string;
  goals: IGoal[];
  archived: IGoal[];
}

export class Budget implements IBudget {
  id?: string;
  label: string;
  owner?: string;
  goals: Goal[] = [];
  archived: Goal[] = [];

  constructor(label: string) {
    this.label = label;
  }

  public static fromJSON(json: IBudget): Budget {
    const budget = new Budget(
      json.label
    );
    budget.id = json.id;
    budget.owner = json.owner;

    for (const goalJson of json.goals) {
      const goal = Goal.fromJSON(budget, goalJson);
      budget.goals.push(goal);
    }
    for (const goalJson of json.archived || []) {
      const goal = Goal.fromJSON(budget, goalJson);
      budget.archived.push(goal);
    }
    return budget;
  }

  public toJSON(): IBudget {
    return {
      archived: this.archived.map(goal => goal.toJSON()),
      goals: this.goals.map(goal => goal.toJSON()),
      id: this.id,
      label: this.label,
      owner: this.owner,
    };
  }

  public totalBalance(): number {
    return this.goals.map(goal => {
      // Return the current balance, minus the target if the goal is marked as purchased
      return goal.current - (goal.isPurchased() ? goal.target : 0);
    }).reduce((a, b) => a + b, 0);
  }

  public delete(goal: Goal) {
    this.goals = this.goals.filter(element => element !== goal);
    disperseBalance(this, goal.current);
  }

  public archive(goal: Goal) {
    setMembership(this.goals, goal, false);
    setMembership(this.archived, goal, true);
  }

  public sortGoals() {
    this.goals.sort((a, b) => {
      const aStatus = a.status();
      const bStatus = b.status();
      if (aStatus !== bStatus) {
        return aStatus - bStatus;
      }
      // For goals within the same grouping, sort by greatest target goal first
      return b.target - a.target;
    });
  }
}
