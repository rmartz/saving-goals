import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Goals } from '../shared/services/goals.service';
import { Goal } from '../shared/models/goal.model';

@Component({
  selector: 'app-edit-goal-item',
  templateUrl: './edit-goal-item.component.html'
})
export class EditGoalItemComponent implements OnInit {

  @Input()
  public goal: Goal;

  @Output()
  public close = new EventEmitter();

  public name: string;
  public target: number;

  constructor(private goals: Goals) { }

  public ngOnInit() {
    if (this.goal !== undefined) {
      this.name = this.goal.label;
      this.target = parseFloat((this.goal.target / 100).toFixed(2));
    }
  }

  public save() {
    let goal = this.goal;
    if (goal === undefined) {
      goal = new Goal();
    }
    goal.label = this.name;
    goal.target = Math.round(this.target * 100);

    this.goals.save(goal);
    this.doClose();
  }

  public doClose() {
    this.close.emit(this.goal);
  }
}
