import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Goal } from '../shared/models/goal.model';
import { Goals } from '../shared/services/goals.service';
import { Budget } from '../shared/models/budget.model';
import { Budgets } from '../shared/services/budgets.service';

@Component({
  selector: 'app-purchase-goal-item',
  templateUrl: './purchase-goal-item.component.html'
})
export class PurchaseGoalItemComponent implements OnInit {

  @Input()
  public goal: Goal;

  @Output()
  public close = new EventEmitter();

  public cost: number;

  constructor(private budgets: Budgets) { }

  public ngOnInit() {
    this.cost = parseFloat((this.goal.target / 100).toFixed(2));
  }

  public save() {
    const costCents = Math.round(this.cost * 100);
    this.goal.purchase(costCents);
    this.goal.save();
    this.budgets.save(this.goal.budget);
    this.close.emit(this.goal);
  }
}
