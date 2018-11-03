import { Component } from '@angular/core';
import { Budgets } from '../shared/services/budgets.service';
import { AngularFireAuth } from '@angular/fire/auth';

@Component({
  selector: 'app-multi-budget-list',
  templateUrl: './multi-budget-list.component.html'
})
export class MultiBudgetListComponent {

  public createMode = false;

  constructor(public budgets: Budgets,
              public afAuth: AngularFireAuth) { }
}
