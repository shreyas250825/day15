export interface IncomeEntry {
  id: string;
  amount: number;
  currency: string;
  description: string;
}

export interface ExpenseEntry {
  id: string;
  amount: number;
  currency: string;
  description: string;
}

export interface CurrencyRates {
  [currencyCode: string]: number;
}

export interface BudgetState {
  incomes: IncomeEntry[];
  expenses: ExpenseEntry[];
  currencyRates: CurrencyRates;
}

export type BudgetAction =
  | { type: 'ADD_INCOME'; payload: IncomeEntry }
  | { type: 'ADD_EXPENSE'; payload: ExpenseEntry }
  | { type: 'DELETE_INCOME'; payload: string }
  | { type: 'DELETE_EXPENSE'; payload: string };

export interface BudgetTrackerProps {
  currencyRates: CurrencyRates;
  defaultCurrency: string;
}