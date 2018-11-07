import { Component, Input } from '@angular/core';
import { Budget } from '../shared/models/budget.model';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Budgets } from '../shared/services/budgets.service';

@Component({
  selector: 'app-goal-list',
  templateUrl: './goal-list.component.html'
})
export class GoalListComponent {
  @Input()
  public budget: Budget;

  constructor(private budgets: Budgets) { }

  public createMode = false;

  public disperse(amount: number) {
    const amountCents = Math.round(amount * 100);
    this.budget.disperse(amountCents);
    this.budgets.save(this.budget);
  }

  public drop(event) {
    console.log(event);
    moveItemInArray(this.budget.goals, event.previousIndex, event.currentIndex);
    this.budgets.save(this.budget);
  }
}
