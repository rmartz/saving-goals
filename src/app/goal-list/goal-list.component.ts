import { Component, Input } from '@angular/core';
import { Budget } from '../shared/models/budget.model';

@Component({
  selector: 'app-goal-list',
  templateUrl: './goal-list.component.html'
})
export class GoalListComponent {
  @Input()
  public budget: Budget;

  constructor() { }

  public createMode = false;
}
