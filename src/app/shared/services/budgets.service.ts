import { Injectable } from '@angular/core';
import { Budget } from '../models/budget.model';
import { BehaviorSubject, Observable } from 'rxjs';
import { Goal } from '../models/goal.model';
import { setMembership } from '../utils/membership';
import { swapItems } from '../utils/ordering';

@Injectable()
export class Budgets {

  private _budgets: Budget[] = [];
  private _list = new BehaviorSubject<Budget[]>([]);

  constructor() {
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
        for (const goalJson of budgetJson['archived'] || []) {
          const goal = new Goal();
          goal.budget = budget;
          Object.assign(goal, goalJson);
          budget.archived.push(goal);
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

  public delete(budget: Budget) {
    setMembership(this._budgets, budget, false);
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

  public moveUp(budget: Budget) {
    const index = this._budgets.indexOf(budget);
    if (index <= 0) {
      return;
    }
    swapItems(this._budgets, index, index - 1);
    this.saveBudgets();
  }

  public moveDown(budget: Budget) {
    const index = this._budgets.indexOf(budget);
    if (index < 0 || index + 1 >= this._budgets.length) {
      return;
    }
    swapItems(this._budgets, index, index + 1);
    this.saveBudgets();
  }
}
