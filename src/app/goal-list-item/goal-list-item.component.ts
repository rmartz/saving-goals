import { Component, Input } from '@angular/core';
import { Goal } from '../shared/models/goal.model';
import { Budgets } from '../shared/services/budgets.service';

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
  public goal: Goal;

  public mode: GoalListItemMode;

  constructor(public budgets: Budgets) { }

  public moveUp() {
    this.goal.budget.moveUp(this.goal);
    this.budgets.save(this.goal.budget);
  }

  public moveDown() {
    this.goal.budget.moveDown(this.goal);
    this.budgets.save(this.goal.budget);
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
