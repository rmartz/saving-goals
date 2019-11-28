import { Component, Input } from '@angular/core';
import { Budget } from '../shared/models/budget.model';
import { Budgets } from '../shared/services/budgets.service';

@Component({
  selector: 'app-goal-list',
  templateUrl: './goal-list.component.html'
})
export class GoalListComponent {
  @Input()
  public budget: Budget;

  public showDispersement = false;

  constructor(private budgets: Budgets) { }

  public createMode = false;

  public disperse(amount: number) {
    const amountCents = Math.round(amount * 100);
    this.budget.disperse(amountCents);
    this.budgets.save(this.budget);
  }
}
