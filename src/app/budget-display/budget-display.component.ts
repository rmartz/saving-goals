import { Component, Input, OnInit } from '@angular/core';
import { Budget } from '../shared/models/budget.model';
import { Budgets } from '../shared/services/budgets.service';

@Component({
  selector: 'app-budget-display',
  templateUrl: './budget-display.component.html'
})
export class BudgetDisplayComponent implements OnInit {

  @Input()
  public budget: Budget;

  public renameMode = false;
  public budgetLabel: string;

  constructor(private budgets: Budgets) { }

  public disperse(amount: number) {
    const amountCents = Math.round(amount * 100);
    this.budget.disperse(amountCents);
    this.budgets.save(this.budget);
  }

  public rename() {
    this.budget.label = this.budgetLabel;
    this.budgets.save(this.budget);
    this.renameMode = false;
  }

  public ngOnInit() {
    this.budgetLabel = this.budget.label;
  }
}
