import React, { useReducer, useState } from 'react';
import { budgetReducer, initialState } from './budgetReducer';
import { BudgetTrackerProps, IncomeEntry, ExpenseEntry, CurrencyRates } from './types';

const BudgetTracker: React.FC<BudgetTrackerProps> = ({ currencyRates, defaultCurrency }) => {
  const [state, dispatch] = useReducer(budgetReducer, { 
    ...initialState, 
    currencyRates 
  });
  
  const [selectedCurrency, setSelectedCurrency] = useState<string>(defaultCurrency);
  const [newIncome, setNewIncome] = useState<Omit<IncomeEntry, 'id'>>({ 
    amount: 0, 
    currency: 'INR', 
    description: '' 
  });
  const [newExpense, setNewExpense] = useState<Omit<ExpenseEntry, 'id'>>({ 
    amount: 0, 
    currency: 'INR', 
    description: '' 
  });

  const currencySymbols: Record<string, string> = {
    INR: '₹',
    USD: '$',
    EUR: '€',
    GBP: '£',
    JPY: '¥'
  };

  const convertCurrency = (amount: number, fromCurrency: string, toCurrency: string): number => {
    if (fromCurrency === toCurrency) return amount;
    if (!currencyRates[fromCurrency] || !currencyRates[toCurrency]) {
      console.error(`Missing exchange rates for ${fromCurrency} or ${toCurrency}`);
      return amount;
    }
    return (amount / currencyRates[fromCurrency]) * currencyRates[toCurrency];
  };

  const calculateNetBalance = (): number => {
    const totalIncome = state.incomes.reduce(
      (sum, income) => sum + convertCurrency(income.amount, income.currency, selectedCurrency),
      0
    );
    const totalExpense = state.expenses.reduce(
      (sum, expense) => sum + convertCurrency(expense.amount, expense.currency, selectedCurrency),
      0
    );
    return totalIncome - totalExpense;
  };

  const handleAddIncome = () => {
    if (newIncome.amount <= 0) {
      alert('Income amount must be positive');
      return;
    }
    dispatch({
      type: 'ADD_INCOME',
      payload: {
        ...newIncome,
        id: Date.now().toString(),
      },
    });
    setNewIncome({ amount: 0, currency: 'INR', description: '' });
  };

  const handleAddExpense = () => {
    if (newExpense.amount <= 0) {
      alert('Expense amount must be positive');
      return;
    }
    
    // Check for negative balance
    const totalIncome = state.incomes.reduce(
      (sum, income) => sum + convertCurrency(income.amount, income.currency, newExpense.currency),
      0
    );
    const totalExpense = state.expenses.reduce(
      (sum, expense) => sum + convertCurrency(expense.amount, expense.currency, newExpense.currency),
      0
    );
    
    if (totalIncome - totalExpense - newExpense.amount < 0) {
      alert('Cannot add expense: Negative balance would result');
      return;
    }

    dispatch({
      type: 'ADD_EXPENSE',
      payload: {
        ...newExpense,
        id: Date.now().toString(),
      },
    });
    setNewExpense({ amount: 0, currency: 'INR', description: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-800">
            <h1 className="text-2xl font-bold text-white">Budget Tracker</h1>
            <p className="mt-1 text-sm text-blue-100">Track your finances across currencies</p>
          </div>

          <div className="p-6">
            {/* Currency Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Display Currency
              </label>
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                value={selectedCurrency}
                onChange={(e) => setSelectedCurrency(e.target.value)}
              >
                {Object.keys(currencyRates).map(currency => (
                  <option key={currency} value={currency}>
                    {currency} ({currencySymbols[currency] || currency})
                  </option>
                ))}
              </select>
            </div>

            {/* Net Balance */}
            <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h2 className="text-lg font-medium text-gray-900 mb-1">Net Balance</h2>
              <p className="text-3xl font-bold text-blue-600">
                {currencySymbols[selectedCurrency] || selectedCurrency} {calculateNetBalance().toFixed(2)}
              </p>
            </div>

            {/* Transaction Forms */}
            <div className="grid gap-6 mb-8 md:grid-cols-2">
              {/* Income Form */}
              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <h3 className="text-lg font-medium text-green-800 mb-4">Add Income</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      value={newIncome.amount}
                      onChange={(e) => setNewIncome({...newIncome, amount: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                    <select
                      className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      value={newIncome.currency}
                      onChange={(e) => setNewIncome({...newIncome, currency: e.target.value})}
                    >
                      {Object.keys(currencyRates).map(currency => (
                        <option key={currency} value={currency}>{currency}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input
                      type="text"
                      className="shadow-sm focus:ring-green-500 focus:border-green-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      value={newIncome.description}
                      onChange={(e) => setNewIncome({...newIncome, description: e.target.value})}
                      placeholder="Salary, Bonus, etc."
                    />
                  </div>
                  <button
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    onClick={handleAddIncome}
                  >
                    Add Income
                  </button>
                </div>
              </div>

              {/* Expense Form */}
              <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                <h3 className="text-lg font-medium text-red-800 mb-4">Add Expense</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amount</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      value={newExpense.amount}
                      onChange={(e) => setNewExpense({...newExpense, amount: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                    <select
                      className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      value={newExpense.currency}
                      onChange={(e) => setNewExpense({...newExpense, currency: e.target.value})}
                    >
                      {Object.keys(currencyRates).map(currency => (
                        <option key={currency} value={currency}>{currency}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <input
                      type="text"
                      className="shadow-sm focus:ring-red-500 focus:border-red-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      value={newExpense.description}
                      onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                      placeholder="Rent, Food, etc."
                    />
                  </div>
                  <button
                    className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    onClick={handleAddExpense}
                  >
                    Add Expense
                  </button>
                </div>
              </div>
            </div>

            {/* Transactions List */}
            <div className="grid gap-6 md:grid-cols-2">
              {/* Income List */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <h3 className="text-lg font-medium text-blue-800 mb-4">Income History</h3>
                {state.incomes.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No income records yet</p>
                ) : (
                  <ul className="space-y-3">
                    {state.incomes.map(income => (
                      <li key={income.id} className="p-3 bg-white rounded-md shadow-sm flex justify-between items-start">
                        <div>
                          <p className="font-medium">{income.description}</p>
                          <p className="text-sm text-gray-600">
                            {currencySymbols[income.currency] || income.currency} {income.amount.toFixed(2)}
                            {income.currency !== selectedCurrency && (
                              <span className="ml-2 text-gray-500">
                                (≈ {currencySymbols[selectedCurrency] || selectedCurrency} {convertCurrency(income.amount, income.currency, selectedCurrency).toFixed(2)})
                              </span>
                            )}
                          </p>
                        </div>
                        <button
                          onClick={() => dispatch({ type: 'DELETE_INCOME', payload: income.id })}
                          className="text-red-500 hover:text-red-700"
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              {/* Expense List */}
              <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
                <h3 className="text-lg font-medium text-orange-800 mb-4">Expense History</h3>
                {state.expenses.length === 0 ? (
                  <p className="text-center text-gray-500 py-4">No expense records yet</p>
                ) : (
                  <ul className="space-y-3">
                    {state.expenses.map(expense => (
                      <li key={expense.id} className="p-3 bg-white rounded-md shadow-sm flex justify-between items-start">
                        <div>
                          <p className="font-medium">{expense.description}</p>
                          <p className="text-sm text-gray-600">
                            {currencySymbols[expense.currency] || expense.currency} {expense.amount.toFixed(2)}
                            {expense.currency !== selectedCurrency && (
                              <span className="ml-2 text-gray-500">
                                (≈ {currencySymbols[selectedCurrency] || selectedCurrency} {convertCurrency(expense.amount, expense.currency, selectedCurrency).toFixed(2)})
                              </span>
                            )}
                          </p>
                        </div>
                        <button
                          onClick={() => dispatch({ type: 'DELETE_EXPENSE', payload: expense.id })}
                          className="text-red-500 hover:text-red-700"
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BudgetTracker;