import React from 'react';
import BudgetTracker from './components/BudgetTracker';

const App: React.FC = () => {
  const currencyRates = {
    INR: 1,
    USD: 0.012,
    EUR: 0.011,
    GBP: 0.0095,
    JPY: 1.77
  };

  return (
    <div className="App">
      <BudgetTracker 
        currencyRates={currencyRates} 
        defaultCurrency="INR" 
      />
    </div>
  );
};

export default App;