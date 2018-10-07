import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Goal } from '../models/goal.model';

@Injectable()
export class Goals {
  private _goals: Goal[] = [];
  private _list = new BehaviorSubject<Goal[]>([]);

  constructor() {
    const goal = new Goal();
    goal.label = 'Foobar';
    goal.target = 5;
    goal.current = 1;
    this.save(goal);
  }

  public save(goal: Goal) {
    if (!this._goals.includes(goal)) {
      this._goals.push(goal);
    }
    this._list.next(this._goals);
  }

  public list() {
    return this._list.asObservable();
  }
}
