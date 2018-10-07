import { Component, Input } from '@angular/core';
import { Goal } from '../shared/models/goal.model';

@Component({
  selector: 'app-goal-list-item',
  templateUrl: './goal-list-item.component.html'
})
export class GoalListItemComponent {
  @Input()
  public goal: Goal;

  constructor() { }
}
