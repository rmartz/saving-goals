import { Budget } from '../models/budget.model';
import { Goal, GoalBehavior } from '../models/goal.model';

interface Liability {
  goal: Goal;
  debt: number;
  accounted: number;
}
interface Loaner {
  goal: Goal;
  available: number;
  maxLoan: number;
}

enum LoanPrecedence {
  Normal,
  Priority,
  Earmarked,
  Purchased,
}

function goalPrecedence(goal: Goal): LoanPrecedence {
  if (goal.isPurchased()) {
    return LoanPrecedence.Purchased;
  } else if (goal.behavior === GoalBehavior.Earmarked) {
    return LoanPrecedence.Earmarked;
  } else if (goal.behavior === GoalBehavior.Priority) {
    return LoanPrecedence.Priority;
  } else {
    return LoanPrecedence.Normal;
  }
}

function canLoanTo(origin: Goal, recipient?: Goal): boolean {
  if (recipient === origin) {
    // A goal can always "loan" to itself
    return true;
  }

  const originStatus = goalPrecedence(origin);

  if (originStatus === LoanPrecedence.Normal) {
    // Normal status goals are safe to loan to any other goal
    return true;
  } else if (originStatus === LoanPrecedence.Purchased) {
    // Purchased goals have a negative balance and cannot make loans
    return false;
  }

  // Other status goals can loan to goals of a higher tier than them...
  // - Priority status goals can loan to earmarked or purchased goals,
  // - Earmarked goals can loan only to purchased goals.
  const recipientStatus = recipient ? goalPrecedence(recipient) : LoanPrecedence.Normal;
  return recipientStatus > originStatus;
}

function isLiabilityFor(liability: Goal, target?: Goal): boolean {
  if (liability === target) {
    // A goal cannot be a liability for itself
    return false;
  }

  const liabilityStatus = goalPrecedence(liability);
  if (liabilityStatus !== LoanPrecedence.Earmarked && liabilityStatus !== LoanPrecedence.Purchased) {
    // Only purchased or earmarked goals can be liabilities
    return false;
  }

  // Liabilities apply to goals of a lower tier
  // - Purchased goals are a liability for all non-purchased tiers
  // - Earmarked goals are a liability for normal and priority goals
  const targetStatus = target ? goalPrecedence(target) : LoanPrecedence.Normal;
  return liabilityStatus > targetStatus;
}

function getLiabilities(budget: Budget, recipient?: Goal): Liability[] {
  return budget.goals.filter(
    liability => isLiabilityFor(liability, recipient)
  ).map<Liability>(goal => ({
      accounted: 0,
      debt: goal.target - goal.current,
      goal: goal,
    })
  );
}

function getLoaners(budget: Budget, recipient?: Goal): Loaner[] {
  return budget.goals.filter(
    // Only use goals that haven't been purchased (That have savings to loan) and aren't funded (That don't need their savings directly)
    goal => canLoanTo(goal, recipient)
  ).map<Loaner>(
    goal => ({
      available: goal.current,
      goal: goal,
      maxLoan: goal.target - goal.current
    })
  );
}

function allocateLoan(loaner: Loaner, liability: Liability, safeLoan: boolean): void {
      // For a safe loan, loan up to the liability's limit or the maximum sized loan
      //  this loaner can contribute to.
      // For an unsafe loan (e.g. the liability has already been purchased and must be covered),
      //  loan up to whatever is needed
      const cap = safeLoan ? Math.min(
        liability.debt,
        loaner.maxLoan
      ) : liability.debt;

      // Contribute what's needed capped what we can safely (Or unsafely) loan
      const margin = Math.min(
        loaner.available,
        Math.max(cap - liability.accounted, 0),
      );

      // Update the values in place to record the proposed consumption of available balances.
      // Update the current value for the loanee, to reflect it received a contribution
      liability.accounted += margin;
      // Update the remainder value for the loaner, to reflect it has less available to lend
      loaner.available -= margin;
}


function calculateLoanableBalance(loaners: Loaner[], recipient?: Goal) {
  // If the recipient is itself a loaner, use that to determine how much of its own balance was
  //  necessary to be allocated to other goals.
  // If it isn't a loaner, then it can presumably contribute its entire current allocation.
  // If there isn't a current allocation, then it doesn't have anything to contribute.
  const recipientLoaner = loaners.find(loaner => loaner.goal === recipient);
  const baseContribution: number = (recipientLoaner?.available || recipient?.current || 0);

  // Remove the recipient from the remainder of the loaners, then sort by increasing target.
  // This will ensure that loans that can only contribute to small balances are handled first,
  //  so bigger loans can cover as much as their increased size allows.
  loaners = loaners.filter(
    loaner => loaner.goal !== recipient
  ).sort(
    (a, b) => a.goal.target - b.goal.target
  );

  return baseContribution + loaners.reduce(
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


export function loanableBalance(budget: Budget, recipient?: Goal): number {
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

  let liabilities: Liability[] = getLiabilities(budget, recipient);
  const loaners: Loaner[] = getLoaners(budget, recipient).sort((a, b) => a.maxLoan - b.maxLoan);

  // Calculate what portion of each loaning goal is already earmarked
  for (const loaner of loaners) {
    // Remove any liabilities that have been fully covered
    liabilities = liabilities.filter(liability => liability.accounted < liability.debt);
    if (liabilities.length === 0) {
      break;
    }
    for (const liability of liabilities) {
      allocateLoan(loaner, liability, true);
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
      allocateLoan(loaner, liability, false);
    }
  }

  // Calculate how much can be contributed from remaining balances, ensuring that no goal pushes the total above its per-loan cap.
  return calculateLoanableBalance(loaners, recipient);
}
