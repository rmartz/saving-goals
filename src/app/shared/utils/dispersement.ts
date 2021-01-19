import { NumberValueAccessor } from '@angular/forms/src/directives';
import { Budget } from '../models/budget.model';
import { Goal } from '../models/goal.model';
import { roundRandom } from './round';

interface WeightedGoal {
  goal: Goal;
  weight: number;
}


function weightGoals(goals: Goal[]): WeightedGoal[] {
  const weightedGoals = goals.map<WeightedGoal>((goal, index) => ({
    goal,
    weight: 1.0 / (index + 1),
  }));

  const totalWeight = weightedGoals.reduce((sum, w) => sum + w.weight, 0);

  // Scale all the weights by the sum so their values add to 1
  // This lets us multiply the amount to disperse by the weight to get this goal's proportion
  weightedGoals.forEach(w => {
    w.weight /= totalWeight;
  });

  return weightedGoals;
}

export function disperseBalance(budget: Budget, total: number): void {
  if (total <= 0) {
    // No value to contribute
    return;
  }

  const activeGoals = budget.goals.filter(goal => goal.isActive());
  if (activeGoals.length === 0) {
    // There are no unfunded goals to contribute to
    return;
  }

  const goalWeights = weightGoals(activeGoals);

  let remainder = total;
  for (const {weight, goal} of goalWeights) {
    // Figure how much our weight says this goal should receive

    // We want to use whole numbers to avoid floating point errors...
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
    return disperseBalance(budget, remainder);
  }
}
