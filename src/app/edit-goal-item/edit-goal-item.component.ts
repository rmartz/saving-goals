import { Component, Input, OnInit } from '@angular/core';
import { Goals } from '../shared/services/goals.service';
import { Goal } from '../shared/models/goal.model';

@Component({
  selector: 'app-edit-goal-item',
  templateUrl: './edit-goal-item.component.html'
})
export class EditGoalItemComponent implements OnInit {

  @Input()
  public goal: Goal;

  public name: string;
  public target: number;

  constructor(private goals: Goals) { }

  public ngOnInit() {
    if (this.goal !== undefined) {
      this.name = this.goal.label;
      this.target = this.goal.target;
    }
  }

  public save() {
    let goal = this.goal;
    if (goal === undefined) {
      goal = new Goal();
    }
    goal.label = this.name;
    goal.target = this.target;

    this.goals.save(goal);
  }
}
