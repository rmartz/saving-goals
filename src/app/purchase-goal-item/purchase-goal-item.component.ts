import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { Goals } from '../shared/services/goals.service';
import { Goal } from '../shared/models/goal.model';

@Component({
  selector: 'app-purchase-goal-item',
  templateUrl: './purchase-goal-item.component.html'
})
export class PurchaseGoalItemComponent implements OnInit {

  @Input()
  public goal: Goal;

  @Output()
  public close = new EventEmitter();

  public cost: number;

  constructor(private goals: Goals) { }

  public ngOnInit() {
    this.cost = this.goal.target;
  }

  public save() {
    this.goals.purchase(this.goal, this.cost);
    this.close.emit(this.goal);
  }
}
