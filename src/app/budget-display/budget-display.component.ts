import { Component, Input } from '@angular/core';
import { Budget } from '../shared/models/budget.model';
import { Budgets } from '../shared/services/budgets.service';

@Component({
  selector: 'app-budget-display',
  templateUrl: './budget-display.component.html'
})
export class BudgetDisplayComponent {

  @Input()
  public budget: Budget;

  constructor(private budgets: Budgets) { }

  public disperse(amount: number) {
    const amountCents = Math.round(amount * 100);
    this.budget.disperse(amountCents);
    this.budgets.save(this.budget);
  }
}
