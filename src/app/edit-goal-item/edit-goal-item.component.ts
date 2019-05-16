import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Goal } from '../shared/models/goal.model';
import { Budgets } from '../shared/services/budgets.service';
import { Budget } from '../shared/models/budget.model';

@Component({
  selector: 'app-edit-goal-item',
  templateUrl: './edit-goal-item.component.html'
})
export class EditGoalItemComponent implements OnInit {

  @Input()
  public budget: Budget;

  @Input()
  public goal: Goal;

  @Output()
  public close = new EventEmitter();

  public name: string;
  public target: number;
  public earmarked = false;

  constructor(private budgets: Budgets) { }

  public ngOnInit() {
    if (this.goal !== undefined) {
      this.name = this.goal.label;
      this.target = parseFloat((this.goal.target / 100).toFixed(2));
      this.earmarked = this.goal.earmarked;
    }
  }

  public save() {
    const goal = this.goal || new Goal();
    if (this.goal === undefined) {
      goal.budget = this.budget;
    }
    goal.label = this.name;
    goal.target = Math.round(this.target * 100);
    goal.earmarked = this.earmarked;
    goal.save();

    this.budgets.save(goal.budget);
    this.close.emit(goal);
  }

  public cancel($event) {
    $event.preventDefault();
    this.close.emit(this.goal);
  }

  public delete() {
    this.goal.budget.delete(this.goal);
    this.budgets.save(this.goal.budget);
  }

  public reversePurchase() {
    this.goal.purchased = undefined;
    this.budgets.save(this.goal.budget);
  }
}
