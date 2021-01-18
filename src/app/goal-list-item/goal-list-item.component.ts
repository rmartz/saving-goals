import { Component, Input } from '@angular/core';
import { Goal } from '../shared/models/goal.model';
import { Budgets } from '../shared/services/budgets.service';
import { loanableBalance } from '../shared/utils/loaning';

enum GoalListItemMode {
  Default,
  Purchase,
  Archive,
  Edit
}

@Component({
  selector: 'app-goal-list-item',
  templateUrl: './goal-list-item.component.html'
})
export class GoalListItemComponent {
  @Input()
  // @ts-ignore(2564)
  public goal: Goal;

  public safeBalance?: number;
  public unsafeBalance?: number;
  public loanableBalance?: number;

  public mode?: GoalListItemMode;

  constructor(public budgets: Budgets) { }

  public goalAffordable(): boolean {
    // Calculate the loanable balance that might be able to complete this goal
    this.loanableBalance = loanableBalance(this.goal.budget, this.goal);

    if (this.goal.isOverdrawn()) {
      return false;
    }
    if (this.goal.isFunded() && !this.goalImpeded()) {
      return true;
    }

    return this.goal.target <= this.loanableBalance;
  }

  public goalImpeded(): boolean {
    // Check if the goal is fully funded, but prevented from being purchased due to insufficient saved balance
    return this.goal.isFunded() && !this.goal.isPurchased() && this.goal.target > this.goal.budget.totalBalance();
  }

  public archive() {
    this.goal.budget.archive(this.goal);
    this.budgets.save(this.goal.budget);
  }

  public resetMode() {
    this.mode = GoalListItemMode.Default;
  }

  public checkMode(mode: GoalListItemMode): boolean {
    return this.mode === mode;
  }

  public toggleMode(mode: GoalListItemMode) {
    this.mode = this.checkMode(mode) ? GoalListItemMode.Default : mode;
  }

  public purchaseMode(): boolean {
    return this.checkMode(GoalListItemMode.Purchase);
  }

  public togglePurchaseMode() {
    this.toggleMode(GoalListItemMode.Purchase);
  }

  public editMode(): boolean {
    return this.checkMode(GoalListItemMode.Edit);
  }

  public toggleEditMode() {
    this.toggleMode(GoalListItemMode.Edit);
  }

  public archiveMode(): boolean {
    return this.checkMode(GoalListItemMode.Archive);
  }

  public toggleArchiveMode() {
    this.toggleMode(GoalListItemMode.Archive);
  }
}
