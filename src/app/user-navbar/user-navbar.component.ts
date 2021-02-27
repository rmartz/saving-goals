import { Component } from '@angular/core';
import { Budgets } from '../shared/services/budgets.service';

@Component({
  selector: 'app-user-navbar',
  templateUrl: './user-navbar.component.html'
})
export class UserNavbarComponent {
  public totalSaved?: number;

  constructor(public budgetsService: Budgets) {
    budgetsService.list().subscribe(budgets => {
      this.totalSaved = budgets.length > 0 ? budgets
        .map(budget => budget.totalBalance())
        .reduce((balance, sum) => sum + balance, 0) : undefined;
    });

  }


}
