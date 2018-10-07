import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { Goals } from './shared/services/goals.service';
import { GoalListComponent } from './goal-list/goal-list.component';
import { EditGoalItemComponent } from './edit-goal-item/edit-goal-item.component';

@NgModule({
  declarations: [
    GoalListComponent,
    EditGoalItemComponent,
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule
  ],
  providers: [
    Goals
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
