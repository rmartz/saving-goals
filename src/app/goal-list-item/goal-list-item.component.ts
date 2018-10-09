import { Component, Input } from '@angular/core';
import { Goal } from '../shared/models/goal.model';
import { Goals } from '../shared/services/goals.service';

@Component({
  selector: 'app-goal-list-item',
  templateUrl: './goal-list-item.component.html'
})
export class GoalListItemComponent {
  @Input()
  public goal: Goal;

  public editMode: boolean;
  public purchaseMode: boolean;

  constructor(public goals: Goals) { }
}
