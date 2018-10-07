import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { Goals } from './shared/services/goals.service';
import { GoalListComponent } from './goal-list/goal-list.component';

@NgModule({
  declarations: [
    GoalListComponent,
    AppComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [
    Goals
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
