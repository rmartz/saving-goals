import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Goal, GoalBehavior } from '../shared/models/goal.model';
import { Budgets } from '../shared/services/budgets.service';
import { Budget } from '../shared/models/budget.model';

@Component({
  selector: 'app-edit-goal-item',
  templateUrl: './edit-goal-item.component.html'
})
export class EditGoalItemComponent implements OnInit {

  @Input()
  // @ts-ignore(2564)
  public budget: Budget;

  @Input()
  public goal?: Goal;

  @Output()
  public close = new EventEmitter();

  public name = '';
  public target?: number;
  public behavior = GoalBehavior.Default;

  constructor(private budgets: Budgets) { }

  public ngOnInit() {
    if (this.goal !== undefined) {
      this.name = this.goal.label;
      this.target = parseFloat((this.goal.target / 100).toFixed(2));
      this.behavior = this.goal.behavior;
    }
  }

  public save() {
    if (!this.target) {
      throw Error('Cannot save goal without a set target');
    }
    const target = Math.round(this.target * 100);
    if (this.goal === undefined) {
      this.goal = new Goal(
        this.budget,
        this.name,
        target
      );
    } else {
      this.goal.label = this.name;
      this.goal.target = target;
    }
    this.goal.behavior = this.behavior;
    this.goal.save();

    this.budgets.save(this.goal.budget);
    this.close.emit(this.goal);
  }

  public cancel($event: any) {
    $event.preventDefault();
    this.close.emit(this.goal);
  }

  public delete() {
    if (!this.goal) {
      throw new Error('Goal to be deleted is undefined');
    }
    this.goal.budget.delete(this.goal);
    this.budgets.save(this.goal.budget);
  }

  public reversePurchase() {
    if (!this.goal) {
      throw new Error('Goal to be unpurchased is undefined');
    }
    this.goal.purchased = undefined;
    this.budgets.save(this.goal.budget);
  }
}
