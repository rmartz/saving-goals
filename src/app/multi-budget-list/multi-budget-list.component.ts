import { Component } from '@angular/core';
import { Budgets } from '../shared/services/budgets.service';

@Component({
  selector: 'app-multi-budget-list',
  templateUrl: './multi-budget-list.component.html'
})
export class MultiBudgetListComponent {
  constructor(public budgets: Budgets) { }

  public create() {
    this.budgets.create('New Budget');
  }
}
