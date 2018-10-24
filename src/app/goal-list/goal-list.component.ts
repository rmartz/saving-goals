import { Component, Input } from '@angular/core';
import { Goal } from '../shared/models/goal.model';

@Component({
  selector: 'app-goal-list',
  templateUrl: './goal-list.component.html'
})
export class GoalListComponent {
  @Input()
  public goals: Goal[];

  constructor() { }

  public createMode = false;
}
