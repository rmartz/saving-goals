import { Component, Input } from '@angular/core';
import { Budgets } from '../shared/services/budgets.service';

@Component({
  selector: 'app-goal-progress-bar',
  templateUrl: './goal-progress-bar.component.html'
})
export class GoalProgressBarComponent {
  @Input()
  public balance: number;

  @Input()
  public available: number;

  @Input()
  public target: number;

  @Input()
  public purchased: boolean;

  constructor(public budgets: Budgets) { }

  public safeBalance() {
    return Math.min(this.balance, this.available);
  }

  public safeWidthPercent() {
    return 100 * (this.safeBalance() / this.target);
  }

  public unsafeWidthPercent() {
    const unsafe = this.balance - this.safeBalance();
    return 100 * unsafe / this.target;
  }

  public loanableWidthPercent() {
    const loanable = Math.min(this.available, this.target) - this.safeBalance();
    return 100 * loanable / this.target;
  }
}
