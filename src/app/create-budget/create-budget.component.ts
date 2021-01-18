import { Component, Output, EventEmitter } from '@angular/core';
import { Budgets } from '../shared/services/budgets.service';

@Component({
  selector: 'app-create-budget',
  templateUrl: './create-budget.component.html'
})
export class CreateBudgetComponent {

  @Output()
  public close = new EventEmitter();

  public newBudgetName = '';

  constructor(public budgets: Budgets) { }

  public create() {
    this.budgets.create(this.newBudgetName);
    this.newBudgetName = '';
    this.close.emit();
  }

  public cancel($event: any) {
    $event.preventDefault();
    this.newBudgetName = '';
    this.close.emit();
  }
}
