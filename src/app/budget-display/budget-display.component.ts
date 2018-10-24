import { Component, OnInit } from '@angular/core';
import { Goals } from '../shared/services/goals.service';
import { Budget } from '../shared/models/budget.model';

@Component({
  selector: 'app-budget-display',
  templateUrl: './budget-display.component.html'
})
export class BudgetDisplayComponent implements OnInit {

  public budget: Budget;

  constructor(private goals: Goals) { }

  ngOnInit() {
    this.budget = this.goals.budget;
  }
}
