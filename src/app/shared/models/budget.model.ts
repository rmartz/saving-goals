import { Goal, IGoal } from './goal.model';
import { swapItems } from '../utils/ordering';
import { roundRandom } from '../utils/round';
import { setMembership } from '../utils/membership';

export interface IBudget {
  id: string;
  label: string;
  owner: string;
  goals: IGoal[];
  archived: IGoal[];
}

export class Budget implements IBudget {
  id: string;
  label: string;
  owner: string;
  goals: Goal[] = [];
  archived: Goal[] = [];

  public static fromJSON(json: IBudget): Budget {
    const budget = new Budget();
    budget.label = json['label'];
    budget.owner = json['owner'];
    budget.id = json['id'];

    for (const goalJson of json['goals']) {
      const goal = Goal.fromJSON(budget, goalJson);
      budget.goals.push(goal);
    }
    for (const goalJson of json['archived'] || []) {
      const goal = Goal.fromJSON(budget, goalJson);
      budget.archived.push(goal);
    }
    return budget;
  }

  public toJSON(): IBudget {
    return {
      label: this.label,
      owner: this.owner,
      id: this.id,
      goals: this.goals.map(goal => goal.toJSON()),
      archived: this.archived.map(goal => goal.toJSON())
    };
  }

  public totalBalance(): number {
    return this.goals.map(goal => {
      // Return the current balance, minus the target if the goal is marked as purchased
      return goal.current - (goal.isPurchased() ? goal.target : 0);
    }).reduce((a, b) => a + b, 0);
  }

  public loanableBalance(): number {
    // Calculate the total amount that can be loaned from goals
    return this.goals.reduce<number>((sum: number, goal: Goal) => {
      return sum + goal.loanableBalance();
    }, 0);
  }

  public delete(goal: Goal) {
    this.goals = this.goals.filter(element => element !== goal);
    this.disperse(goal.current);
  }

  public archive(goal: Goal) {
    setMembership(this.goals, goal, false);
    setMembership(this.archived, goal, true);
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
