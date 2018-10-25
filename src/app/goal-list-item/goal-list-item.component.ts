import { Component, Input } from '@angular/core';
import { Goal } from '../shared/models/goal.model';
import { Budgets } from '../shared/services/budgets.service';

@Component({
  selector: 'app-goal-list-item',
  templateUrl: './goal-list-item.component.html'
})
export class GoalListItemComponent {
  @Input()
  public goal: Goal;

  public editMode: boolean;
  public purchaseMode: boolean;

  constructor(public budgets: Budgets) { }

  public moveUp() {
    this.goal.budget.moveUp(this.goal);
    this.budgets.save(this.goal.budget);
  }

  public moveDown() {
    this.goal.budget.moveDown(this.goal);
    this.budgets.save(this.goal.budget);
  }
}
