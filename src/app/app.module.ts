import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import {MatProgressBarModule} from '@angular/material/progress-bar';

import { AppComponent } from './app.component';
import { Goals } from './shared/services/goals.service';
import { GoalListComponent } from './goal-list/goal-list.component';
import { EditGoalItemComponent } from './edit-goal-item/edit-goal-item.component';
import { PurchaseGoalItemComponent } from './purchase-goal-item/purchase-goal-item.component';
import { GoalListItemComponent } from './goal-list-item/goal-list-item.component';
import { ActionConfirmComponent } from './action-confirm/action-confirm.component';
import { BudgetDisplayComponent } from './budget-display/budget-display.component';

@NgModule({
  declarations: [
    ActionConfirmComponent,
    BudgetDisplayComponent,
    GoalListComponent,
    GoalListItemComponent,
    EditGoalItemComponent,
    PurchaseGoalItemComponent,
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    MatProgressBarModule
  ],
  providers: [
    Goals
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
