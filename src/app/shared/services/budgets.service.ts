import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, tap, switchMap, first } from 'rxjs/operators';

import { Budget, IBudget } from '../models/budget.model';
import { setMembership } from '../utils/membership';
import { swapItems } from '../utils/ordering';

@Injectable()
export class Budgets {

  private budgets: Budget[] = [];
  private budgetCollection?: AngularFirestoreCollection<IBudget>;
  private listBS = new BehaviorSubject<Budget[]>([]);
  private listObs: Observable<Budget[]>;

  constructor(private afAuth: AngularFireAuth,
              private readonly afs: AngularFirestore) {
    const savedState = localStorage.getItem('budgets');
    if (savedState !== null) {
      this.processLocalStorageState(savedState);
    }

    const newUserObs = afAuth.user.pipe(
      tap(user => {
        if (user !== null) {
          this.budgetCollection = afs.collection<Budget>('budgets', ref => ref.where('owner', '==', user.uid));

          this.budgetCollection.valueChanges().pipe(
            first(),
            tap(budgets => {
              if (budgets.length === 0) {
                // There are no budgets saved remotely... copy over any local budgets
                console.log('Creating remote copy of local budgets');
                this.budgets.forEach(budget => this.save(budget));
              }
            })
          ).subscribe();
        }
      })
    );

    newUserObs.subscribe(user => {
      if (user === null) {
        // Remove budgets that have an assigned ID - local storage only items won't have one
        // This avoids clearing local storage items on initial load
        this.budgets = this.budgets.filter(budget => budget.id === undefined);
        this.saveBudgetsLocalStorage();
      }
    });

    this.listObs = newUserObs.pipe(
      switchMap(user => {
        if (user === null) {
          // We are not logged in to Firebase, so use our BehaviorSubject for Budget management
          return this.listBS.asObservable();
        } else if (!this.budgetCollection) {
          throw new Error("User is logged in but has no budget collection");
        } else {
          // Subscribe to the remote budgets for local management
          return this.budgetCollection.valueChanges().pipe(
            map(budgets => {
              return budgets.map(budget =>  Budget.fromJSON(budget));
            })
          );
        }
      })
    );
  }

  public create(label: string) {
    const budget = new Budget(
      label
    );
    this.budgets.push(budget);
    this.save(budget);
  }

  public delete(budget: Budget) {
    setMembership(this.budgets, budget, false);

    this.afAuth.user.pipe(
      first()
    ).subscribe(user => {
      if (!this.budgetCollection) {
        this.saveBudgetsLocalStorage();
      } else {
        if (budget.id === undefined) {
          console.error('Attempted to delete budget without an ID');
        } else if (!this.budgetCollection) {
          throw Error("User is signed in but has no budget collection")
        } else {
          this.budgetCollection.doc(budget.id).delete();
        }
      }
    });
  }

  private saveBudgetsLocalStorage() {
    localStorage.setItem('budgets', JSON.stringify(
      this.budgets.map(budget => budget.toJSON())
    ));
    this.listBS.next(this.budgets);
  }

  public save(budget: Budget) {
    budget.sortGoals();
    this.afAuth.user.pipe(
      first()
    ).subscribe(user => {
      if (user === null) {
        // We are not logged in, save to local storage
        console.log('User is not signed in, saving to local storage', budget);
        this.saveBudgetsLocalStorage();
      } else {
        budget.owner = user.uid;
        if (budget.id === undefined) {
          budget.id = this.afs.createId();
          console.log('Created new ID for budget', budget);
        }

        if (!this.budgetCollection) {
          throw Error("User is signed in but has no budget collection")
        } else {
          this.budgetCollection.doc(budget.id).set(budget.toJSON());
        }
      }
    });
  }

  public list(): Observable<Budget[]> {
    return this.listObs;
  }

  public moveUp(budget: Budget) {
    const index = this.budgets.indexOf(budget);
    if (index <= 0) {
      return;
    }
    swapItems(this.budgets, index, index - 1);
    this.saveBudgetsLocalStorage();
  }

  public moveDown(budget: Budget) {
    const index = this.budgets.indexOf(budget);
    if (index < 0 || index + 1 >= this.budgets.length) {
      return;
    }
    swapItems(this.budgets, index, index + 1);
    this.saveBudgetsLocalStorage();
  }

  private processLocalStorageState(json: string) {
    const savedBudgets = JSON.parse(json);
    for (const budgetJson of savedBudgets) {
      const budget = Budget.fromJSON(budgetJson);
      this.budgets.push(budget);
    }

    this.listBS.next(this.budgets);
  }
}
