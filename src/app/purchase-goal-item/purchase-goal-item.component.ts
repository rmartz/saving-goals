import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Goal } from '../shared/models/goal.model';
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

  public cancel($event) {
    $event.preventDefault();
    this.close.emit(this.goal);
  }

  public exceedTotalBalance(): boolean {
    // Return True if cost is greater than the total amount saved across all goals
    return this.cost * 100 > this.goal.budget.totalBalance();
  }

  public exceedAccrued(): boolean {
    // Return True if cost is greater than amount saved
    return this.cost * 100 > this.goal.current;
  }

  public impedeGoal(): boolean {
    // Return True if purchasing this goal for cost would cause total saved balance to be below the total allocated to another goal
    const estimatedBalance = this.goal.budget.totalBalance() - this.cost * 100;
    return this.goal.budget.goals.some(goal => goal !== this.goal && goal.current > estimatedBalance);
  }
}
