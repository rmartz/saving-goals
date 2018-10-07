import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Goal } from '../models/goal.model';

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
    localStorage.setItem('goals', JSON.stringify(this._goals));
    this._list.next(this._goals);
  }

  public list() {
    return this._list.asObservable();
  }
}
