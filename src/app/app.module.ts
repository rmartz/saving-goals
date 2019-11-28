import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import {MatProgressBarModule} from '@angular/material/progress-bar';
import { AngularFireModule } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { AngularFireAuthModule } from '@angular/fire/auth';

import { AppComponent } from './app.component';
import { GoalListComponent } from './goal-list/goal-list.component';
import { EditGoalItemComponent } from './edit-goal-item/edit-goal-item.component';
import { PurchaseGoalItemComponent } from './purchase-goal-item/purchase-goal-item.component';
import { GoalListItemComponent } from './goal-list-item/goal-list-item.component';
import { ActionConfirmComponent } from './action-confirm/action-confirm.component';
import { BudgetDisplayComponent } from './budget-display/budget-display.component';
import { MultiBudgetListComponent } from './multi-budget-list/multi-budget-list.component';
import { Budgets } from './shared/services/budgets.service';
import { environment } from '../environments/environment';
import { UserLoginComponent } from './user-login/user-login.component';
import { CreateBudgetComponent } from './create-budget/create-budget.component';
import { GoalProgressBarComponent } from './goal-progress-bar/goal-progress-bar.component';

@NgModule({
  declarations: [
    ActionConfirmComponent,
    CreateBudgetComponent,
    BudgetDisplayComponent,
    GoalListComponent,
    GoalListItemComponent,
    GoalProgressBarComponent,
    EditGoalItemComponent,
    PurchaseGoalItemComponent,
    MultiBudgetListComponent,
    UserLoginComponent,
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    MatProgressBarModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireAuthModule,
    AngularFirestoreModule,
  ],
  providers: [
    Budgets
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
