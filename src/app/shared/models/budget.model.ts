import { Goal } from './goal.model';

export class Budget {
  goals: Goal[] = [];

  public totalBalance(): number {
    return this.goals.map(goal => {
      // Return the current balance, minus the target if the goal is marked as purchased
      return goal.current - (goal.isPurchased() ? goal.target : 0);
    }).reduce((a, b) => a + b, 0);
  }
}
