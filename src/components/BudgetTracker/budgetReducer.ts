import { BudgetState, BudgetAction } from './types';

export const initialState: BudgetState = {
  incomes: [],
  expenses: [],
  currencyRates: {},
};

export const budgetReducer = (state: BudgetState, action: BudgetAction): BudgetState => {
  const convertCurrency = (amount: number, from: string, to: string): number => {
    if (from === to) return amount;
    if (!state.currencyRates[from] || !state.currencyRates[to]) {
      console.error(`Missing exchange rate for ${from} or ${to}`);
      return amount;
    }
    return (amount / state.currencyRates[from]) * state.currencyRates[to];
  };

  switch (action.type) {
    case 'ADD_INCOME':
      if (action.payload.amount <= 0) {
        console.error('Income amount must be positive');
        return state;
      }
      return {
        ...state,
        incomes: [...state.incomes, action.payload],
      };

    case 'ADD_EXPENSE':
      if (action.payload.amount <= 0) {
        console.error('Expense amount must be positive');
        return state;
      }

      const totalIncome = state.incomes.reduce(
        (sum, income) => sum + convertCurrency(income.amount, income.currency, action.payload.currency),
        0
      );

      const totalExpense = state.expenses.reduce(
        (sum, expense) => sum + convertCurrency(expense.amount, expense.currency, action.payload.currency),
        0
      );

      if (totalIncome - totalExpense - action.payload.amount < 0) {
        console.error('Cannot add expense: Negative balance would result');
        return state;
      }

      return {
        ...state,
        expenses: [...state.expenses, action.payload],
      };

    case 'DELETE_INCOME':
      return {
        ...state,
        incomes: state.incomes.filter(income => income.id !== action.payload),
      };

    case 'DELETE_EXPENSE':
      return {
        ...state,
        expenses: state.expenses.filter(expense => expense.id !== action.payload),
      };

    default:
      return state;
  }
};