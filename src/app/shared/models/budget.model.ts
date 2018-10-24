import { Goal } from './goal.model';
import { swapItems } from '../utils/ordering';
import { roundRandom } from '../utils/round';

export class Budget {
  label: string;
  goals: Goal[] = [];
  purchased: Goal[] = [];

  public toJSON() {
    return {
      label: this.label,
      goals: this.goals.map(goal => goal.toJSON()),
      purchased: this.purchased.map(goal => goal.toJSON())
    };
  }

  public totalBalance(): number {
    return this.goals.map(goal => {
      // Return the current balance, minus the target if the goal is marked as purchased
      return goal.current - (goal.isPurchased() ? goal.target : 0);
    }).reduce((a, b) => a + b, 0);
  }

  public checkBalance(goal: Goal): boolean {
    return goal.target < this.totalBalance();
  }

  public delete(goal: Goal) {
    this.goals = this.goals.filter(element => element !== goal);
    this.disperse(goal.current);
  }

  public moveUp(goal: Goal) {
    const index = this.goals.indexOf(goal);
    if (index <= 0) {
      return;
    }
    swapItems(this.goals, index, index - 1);
  }

  public moveDown(goal: Goal) {
    const index = this.goals.indexOf(goal);
    if (index < 0 || index + 1 >= this.goals.length) {
      return;
    }
    swapItems(this.goals, index, index + 1);
  }

  public disperse(total: number) {
    if (total <= 0) {
      // No value to contribute
      return;
    }
    const activeGoals = this.goals.filter(goal => goal.isActive());
    if (activeGoals.length === 0) {
      // There are no unfunded goals to contribute to
      return;
    }

    const goalWeights = this.weightGoals(activeGoals);

    let remainder = total;
    for (const [goal, weight] of goalWeights) {
      // Figure how much our weight says this goal should receive
      // We want to use whole numbers to avoid floating point error.
      // Math.floor could cause an infinite loop with 1 cent never distributed.
      // Math.ceil causes a one-sided rounding error that means small contributions might always get used up before they reach lower goals.
      // roundRandom probabilistically rounds up or down, so it should minimize risk of always starving lower goals.
      const target = roundRandom(total * weight);
      // Do not give more to the goal than the goal actually wants, or what we have left
      const value = Math.min(target, remainder, goal.target - goal.current);
      remainder -= value;
      goal.current += value;
    }

    if (remainder > 0) {
      // Some goals reached their cap and we have balance left over
      // Repeat the process again among the remaining goals
      return this.disperse(remainder);
    }
  }

  private weightGoals(goals: Goal[]): [Goal, number][] {
    const weightedGoals = goals.map<[Goal, number]>((goal, index) => [goal, 1.0 / (index + 1)]);
    const sum = weightedGoals.reduce((a, b) => a + b[1], 0);
    return weightedGoals.map<[Goal, number]>(value => [value[0], value[1] / sum]);
  }
}
