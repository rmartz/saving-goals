import { Goal, IGoal, GoalStatus, GoalBehavior } from './goal.model';
import { roundRandom } from '../utils/round';
import { setMembership } from '../utils/membership';

export interface IBudget {
  id: string;
  label: string;
  owner: string;
  goals: IGoal[];
  archived: IGoal[];
}

export class Budget implements IBudget {
  id: string;
  label: string;
  owner: string;
  goals: Goal[] = [];
  archived: Goal[] = [];

  public static fromJSON(json: IBudget): Budget {
    const budget = new Budget();
    budget.label = json['label'];
    budget.owner = json['owner'];
    budget.id = json['id'];

    for (const goalJson of json['goals']) {
      const goal = Goal.fromJSON(budget, goalJson);
      budget.goals.push(goal);
    }
    for (const goalJson of json['archived'] || []) {
      const goal = Goal.fromJSON(budget, goalJson);
      budget.archived.push(goal);
    }
    return budget;
  }

  public toJSON(): IBudget {
    return {
      label: this.label,
      owner: this.owner,
      id: this.id,
      goals: this.goals.map(goal => goal.toJSON()),
      archived: this.archived.map(goal => goal.toJSON())
    };
  }

  public totalBalance(): number {
    return this.goals.map(goal => {
      // Return the current balance, minus the target if the goal is marked as purchased
      return goal.current - (goal.isPurchased() ? goal.target : 0);
    }).reduce((a, b) => a + b, 0);
  }

  private isLiabilityFor(liability: Goal, target: Goal): boolean {
    return (
      // A goal cannot be a liability for itself
      (liability !== target && (
        // Purchased and overdrawn goals are presumptive liabilties
        (liability.isOverdrawn()
        ) || (
          // Earmarked goals are liabilities for any non-purchased goal
          !target.purchased && liability.isEarmarked()
        )
        ))
    );
  }

  public loanableBalance(recipient: Goal): number {
    // Calculating how much can be safely loaned to a goal is relatively complicated
    // To help simplify the already complex relationships, we assume that all goals accrue savings at the same rate.
    // (So long as purchased goals are ranked above non-purchased goals, this is safely a conservative assumption)
    // A goal can loan out to other goals in total the amount that it has saved, but in order to ensure that the necessary balance is
    //  available it cannot lend to any single goal more than the amount it has remaining to be funded.
    // Limiting each loan to that amount ensures that the recipient will have accrued the amount loaned before the loaning goal is funded.
    // e.g., a goal that has $9 saved out of $10 can lend out $9 total, but only for goals that are short $1 at a time.
    // This will ensure that when example goal reaches $10 saved, all of the $1 loans will have been repaid and the $10 is available.
    // This means goals can contribute a partial amount for a loan, but not additively...
    // Each goal can only contribute to bring the loan up to its own limit, but doing so does help the burden on higher-limit goals.

    // To calculate what can be safely loaned:
    // - Calculate how much of each loaning goal is already allocated in order of closest to completion to furthest
    // - In case a goal is over-leveraged, repeat the process from furthest to completion back, choosing which goals to over-leverage
    // - Once each goal's available balance has been calculated, iterate across all goals to determine what the most can be loaned
    //   (Ensuring that no goal contributes more than it can, or to a total beyond its remaining goal)
    class LiabilityGoal {
      public goal: Goal;
      public debt: number;
      public accounted: number;
    }
    class LoanerGoal {
      public goal: Goal;
      public available: number;
      public maxLoan: number;
    }

    let liabilities: LiabilityGoal[] = this.goals.filter(
      liability => this.isLiabilityFor(liability, recipient)
    ).map<LiabilityGoal>(goal => ({
        goal: goal,
        debt: goal.target - goal.current,
        accounted: 0
      })
    );
    const loaners: LoanerGoal[] = this.goals.filter(
      // Only use goals that haven't been purchased (That have savings to loan) and aren't funded (That don't need their savings directly)
      goal => goal.canLoanTo(recipient)
    ).map<LoanerGoal>(
      goal => ({
        goal: goal,
        available: goal.current,
        maxLoan: goal.target - goal.current
      })
    ).sort((a, b) => a.maxLoan - b.maxLoan);

    // Calculate what portion of each loaning goal is already earmarked
    for (const loaner of loaners) {
      // Remove any liabilities that have been fully covered
      liabilities = liabilities.filter(liability => liability.accounted < liability.debt);
      if (liabilities.length === 0) {
        break;
      }
      for (const liability of liabilities) {
        // Loan either up to the liability's limit, or the maximum loan
        // this loaner can contribute to.
        const cap = Math.min(
          liability.debt,
          loaner.maxLoan
        );
        // Contribute what's needed, cap to what the loaner has available.
        const margin = Math.min(
          loaner.available,
          Math.max(cap - liability.accounted, 0),
        );
        // Update the values in place so it persists across iterations
        // Update the current value for the loanee, to reflect it received a contribution
        liability.accounted += margin;
        // Update the remainder value for the loaner, to reflect it has less available to lend
        loaner.available -= margin;
      }
    }
    // Repeat the same process backwards, in case any loanees still have an outstanding balance
    // (This would happen if a goal is purchased for more than could be safely loaned)
    // This time, we can't cap at the goal's remaining value - these goals may end up having been over-leveraged and may be delayed.
    // Operating in reverse means the goals that are over-leveraged have the longest amount of time to make up the gap.
    // For this step, only consider purchased liabilities
    liabilities = liabilities.filter(liability => liability.goal.isPurchased());
    for (const loaner of loaners.slice(0).reverse()) {
      liabilities = liabilities.filter(liability => liability.accounted < liability.debt);
      if (liabilities.length === 0) {
        break;
      }
      for (const liability of liabilities) {
        const margin = Math.min(
          loaner.available,
          Math.max(liability.debt - liability.accounted, 0)
        );
        // Update the values in place so it persists across iterations
        // Update the current value for the loanee, to reflect it received a contribution
        liability.accounted += margin;
        // Update the remainder value for the loaner, to reflect it has less available to lend
        loaner.available -= margin;
      }
    }

    // Calculate how much can be contributed from remaining balances, ensuring that no goal pushes the total above its per-loan cap.
    const recipientLoaner = loaners.find(loaner => loaner.goal === recipient);
    return (recipientLoaner ? recipientLoaner.available : recipient.current) + loaners.filter(
        loaner => loaner.goal !== recipient
      ).sort(
        (a, b) => a.goal.target - b.goal.target
      ).reduce(
      (sum, loaner) => Math.min(
          // Return the lesser of the max this goal can contribute up to,
          // and what this goal has savings left to add to the running sum.
          // If the goal doesn't have enough saved to max itself out, it will contribute whatever it can to help.
          loaner.goal.target,
          sum + Math.min(loaner.available, loaner.maxLoan)
      ),
      0
    );
  }

  public delete(goal: Goal) {
    this.goals = this.goals.filter(element => element !== goal);
    this.disperse(goal.current);
  }

  public archive(goal: Goal) {
    setMembership(this.goals, goal, false);
    setMembership(this.archived, goal, true);
  }

  public disperse(total: number) {
    if (total <= 0) {
      // No value to contribute
      return;
    }
    const activeGoals = this.goals.filter(goal => goal.isActive());
    if (activeGoals.length === 0) {
      // There are no unfunded goals to contribute to
      return;
    }

    const goalWeights = this.weightGoals(activeGoals);

    let remainder = total;
    for (const [goal, weight] of goalWeights) {
      // Figure how much our weight says this goal should receive
      // We want to use whole numbers to avoid floating point error.
      // Math.floor could cause an infinite loop with 1 cent never distributed.
      // Math.ceil causes a one-sided rounding error that means small contributions might always get used up before they reach lower goals.
      // roundRandom probabilistically rounds up or down, so it should minimize risk of always starving lower goals.
      const target = roundRandom(total * weight);
      // Do not give more to the goal than the goal actually wants, or what we have left
      const value = Math.min(target, remainder, goal.target - goal.current);
      remainder -= value;
      goal.current += value;
    }

    if (remainder > 0) {
      // Some goals reached their cap and we have balance left over
      // Repeat the process again among the remaining goals
      return this.disperse(remainder);
    }
  }

  private weightGoals(goals: Goal[]): [Goal, number][] {
    const weightedGoals = goals.map<[Goal, number]>((goal, index) => [goal, 1.0 / (index + 1)]);
    const sum = weightedGoals.reduce((a, b) => a + b[1], 0);
    return weightedGoals.map<[Goal, number]>(value => [value[0], value[1] / sum]);
  }

  public sortGoals() {
    this.goals.sort((a, b) => {
      const aStatus = a.status();
      const bStatus = b.status();
      if (aStatus !== bStatus) {
        return aStatus - bStatus;
      }
      // For goals within the same grouping, sort by greatest target goal first
      return b.target - a.target;
    });
  }
}
