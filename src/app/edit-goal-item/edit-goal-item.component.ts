import { Component, Input } from '@angular/core';
import { Goals } from '../shared/services/goals.service';
import { Goal } from '../shared/models/goal.model';

@Component({
  selector: 'app-edit-goal-item',
  templateUrl: './edit-goal-item.component.html'
})
export class EditGoalItemComponent {

  @Input()
  public goal: Goal;

  public name: string;

  constructor(private goals: Goals) { }

  public save() {
    let goal = this.goal;
    if (goal === undefined) {
      goal = new Goal();
    }
    goal.label = this.name;

    this.goals.save(goal);
  }
}
