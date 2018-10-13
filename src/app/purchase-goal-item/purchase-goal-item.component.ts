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

  constructor(public goals: Goals) { }

  public ngOnInit() {
    this.cost = parseFloat((this.goal.target / 100).toFixed(2));
  }

  public save() {
    const costCents = Math.round(this.cost * 100);
    this.goals.purchase(this.goal, costCents);
    this.close.emit(this.goal);
  }
}
