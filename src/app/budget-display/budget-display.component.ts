import { Component, Input, OnInit } from '@angular/core';
import { Budget } from '../shared/models/budget.model';
import { Budgets } from '../shared/services/budgets.service';

@Component({
  selector: 'app-budget-display',
  templateUrl: './budget-display.component.html'
})
export class BudgetDisplayComponent implements OnInit {

  @Input()
  // @ts-ignore(2564)
  public budget: Budget;

  public editMode = false;

  // @ts-ignore(2564)
  public budgetLabel: string;

  constructor(private budgets: Budgets) { }

  public rename() {
    this.budget.label = this.budgetLabel;
    this.budgets.save(this.budget);
    this.editMode = false;
  }

  public ngOnInit() {
    this.budgetLabel = this.budget.label;
  }

  public delete() {
    this.budgets.delete(this.budget);
  }

  public moveLeft() {
    // Since budgets are displayed left to right, moving left corresponds to moving "up"
    this.budgets.moveUp(this.budget);
  }

  public moveRight() {
    // Since budgets are displayed left to right, moving left corresponds to moving "down"
    this.budgets.moveDown(this.budget);
  }
}
