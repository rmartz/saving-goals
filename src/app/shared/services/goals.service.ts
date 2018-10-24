import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { Goal } from '../models/goal.model';
import { roundRandom } from '../utils/round';
import { swapItems } from '../utils/ordering';
import { Budget } from '../models/budget.model';

@Injectable()
export class Goals {
  public budget = new Budget();
  private _list = new BehaviorSubject<Goal[]>([]);

  constructor() {
    const savedState = localStorage.getItem('goals');
    if (savedState !== null) {
      const savedGoals = JSON.parse(savedState);
      for (const goalJson of savedGoals) {
        const goal = new Goal();
        Object.assign(goal, goalJson);
        this.save(goal);
      }
    }
  }

  public save(goal: Goal): void {
    if (!this.budget.goals.includes(goal)) {
      this.budget.goals.push(goal);
    }
    if (goal.current > goal.target) {
      const difference = goal.current - goal.target;
      goal.current -= difference;
      this.disperse(difference);
    }
    this.saveGoals();
  }

  public list(): Observable<Goal[]> {
    return this._list.asObservable();
  }

  public visible(): Observable<Goal[]> {
    return this.list().pipe(
      map(goals => goals.filter(goal => goal.isVisible()))
    );
  }

  public totalBalance(): Observable<number> {
    // Return the total balance of all goals, minus any amount remaining for goals that have been early purchased
    return this.list().pipe(
      map<Goal[], number>(goals => {
        return goals.map(goal => {
          // Return the current balance, minus the target if the goal is marked as purchased
          return goal.current - (goal.isPurchased() ? goal.target : 0);
        }).reduce((a, b) => a + b, 0);
      })
    );
  }

  public checkBalance(goal: Goal): Observable<boolean> {
    return this.totalBalance().pipe(
      map<number, boolean>(balance => balance >= goal.target)
    );
  }

  private saveGoals() {
    localStorage.setItem('goals', JSON.stringify(this.budget.goals));
    this._list.next(this.budget.goals);
  }

  public disperse(total: number) {
    if (total <= 0) {
      // No value to contribute
      return;
    }
    const activeGoals = this.budget.goals.filter(goal => goal.isActive());
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
    } else {
      this.saveGoals();
    }
  }

  private weightGoals(goals: Goal[]): [Goal, number][] {
    const weightedGoals = goals.map<[Goal, number]>((goal, index) => [goal, 1.0 / (index + 1)]);
    const sum = weightedGoals.reduce((a, b) => a + b[1], 0);
    return weightedGoals.map<[Goal, number]>(value => [value[0], value[1] / sum]);
  }

  public purchase(goal: Goal, cost: number) {
    goal.target = cost;
    goal.purchased = new Date();
    this.save(goal);
  }

  public delete(goal: Goal) {
    this.budget.goals = this.budget.goals.filter(element => element !== goal);
    this.disperse(goal.current);
  }

  public moveUp(goal: Goal) {
    const index = this.budget.goals.indexOf(goal);
    if (index <= 0) {
      return;
    }
    swapItems(this.budget.goals, index, index - 1);
    this.saveGoals();
  }

  public moveDown(goal: Goal) {
    const index = this.budget.goals.indexOf(goal);
    if (index < 0 || index + 1 >= this.budget.goals.length) {
      return;
    }
    swapItems(this.budget.goals, index, index + 1);
    this.saveGoals();
  }
}
