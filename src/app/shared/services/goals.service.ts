import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Goal } from '../models/goal.model';
import { GoalListComponent } from '../../goal-list/goal-list.component';

@Injectable()
export class Goals {
  private _goals: Goal[] = [];
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

  public save(goal: Goal) {
    if (!this._goals.includes(goal)) {
      this._goals.push(goal);
    }
    this.saveGoals();
  }

  public list() {
    return this._list.asObservable();
  }

  private saveGoals() {
    localStorage.setItem('goals', JSON.stringify(this._goals));
    this._list.next(this._goals);
  }

  public disperse(total: number) {
    // Multiply by 100 to deal with whole number cents
    total *= 100;
    const activeGoals = this._goals.filter(goal => goal.isActive());
    const goalWeights = this.weightGoals(activeGoals);

    let remainder = total;
    for (const [goal, weight] of goalWeights) {
      // Figure how much our weight says this goal should receive
      const target = Math.ceil(total * weight);
      // Do not give more to the goal than the goal actually wants, or what we have left
      const value = Math.min(target, remainder, 100 * (goal.target - goal.current));
      remainder -= value;
      // Convert from whole number cents to fractional dollars
      goal.current += value / 100;
    }

    if (remainder > 0) {
      // Some goals reached their cap and we have balance left over
      // Repeat the process again among the remaining goals
      return this.disperse(remainder / 100);
    } else {
      this.saveGoals();
    }
  }

  private weightGoals(goals: Goal[]): [Goal, number][] {
    const weightedGoals = goals.map<[Goal, number]>((goal, index) => [goal, 1.0 / (index + 1)]);
    const sum = weightedGoals.reduce((a, b) => a + b[1], 0);
    return weightedGoals.map<[Goal, number]>(value => [value[0], value[1] / sum]);
  }
}
