import { Component, Input } from '@angular/core';
import { Budget } from '../shared/models/budget.model';
import { Budgets } from '../shared/services/budgets.service';
import { disperseBalance } from '../shared/utils/dispersement';
import { loanableBalance } from '../shared/utils/loaning';

@Component({
  selector: 'app-goal-list',
  templateUrl: './goal-list.component.html'
})
export class GoalListComponent {
  @Input()
  // @ts-ignore(2564)
  public budget: Budget;

  public showDispersement = false;

  constructor(private budgets: Budgets) { }

  public createMode = false;

  public disperse(amount: number) {
    const amountCents = Math.round(amount * 100);
    disperseBalance(this.budget, amountCents);
    this.budgets.save(this.budget);
  }

  public loanableBalance() {
    return loanableBalance(this.budget);
  }
}
