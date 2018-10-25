import { Injectable } from '@angular/core';
import { Budget } from '../models/budget.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { Goal } from '../models/goal.model';
import { Goals } from './goals.service';

@Injectable()
export class Budgets {

  private _budgets: Budget[] = [];
  private _list = new BehaviorSubject<Budget[]>([]);

  constructor(private goals: Goals) {
    const savedState = localStorage.getItem('budgets');
    if (savedState !== null) {
      const savedBudgets = JSON.parse(savedState);
      for (const budgetJson of savedBudgets) {
        const budget = new Budget();
        budget.label = budgetJson['label'];

        for (const goalJson of budgetJson['goals']) {
          const goal = new Goal();
          goal.budget = budget;
          Object.assign(goal, goalJson);
          budget.goals.push(goal);
        }
        for (const goalJson of budgetJson['purchased']) {
          const goal = new Goal();
          goal.budget = budget;
          Object.assign(goal, goalJson);
          budget.purchased.push(goal);
        }

        this._budgets.push(budget);
      }

      this._list.next(this._budgets);
    }
  }

  public create(label: string) {
    const budget = new Budget();
    budget.label = label;
    this._budgets.push(budget);
    this.saveBudgets();
  }

  private saveBudgets() {
    localStorage.setItem('budgets', JSON.stringify(
      this._budgets.map(budget => budget.toJSON())
    ));
    this._list.next(this._budgets);
  }

  public save(budget: Budget) {
    this.saveBudgets();
  }

  public list(): Observable<Budget[]> {
    return this._list.asObservable();
  }
}
