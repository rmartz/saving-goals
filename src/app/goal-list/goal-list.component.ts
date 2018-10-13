import { Component } from '@angular/core';
import { Goals } from '../shared/services/goals.service';

@Component({
  selector: 'app-goal-list',
  templateUrl: './goal-list.component.html'
})
export class GoalListComponent {
  constructor(public goals: Goals) { }

  public createMode = false;

  public disperse(amount: number) {
    const amountCents = Math.round(amount * 100);
    this.goals.disperse(amountCents);
  }
}
