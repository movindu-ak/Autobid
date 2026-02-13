import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

const Wallet = () => {
  const { user } = useAuth();
  const { topUpBalance } = useApp();
  const [customAmount, setCustomAmount] = useState<string>('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const quickAmounts = [1000, 5000, 10000, 25000, 50000];

  const handleTopUp = (amount: number) => {
    if (amount < 100) {
      setMessage({ type: 'error', text: 'Minimum top-up amount is Rs. 100' });
      return;
    }

    topUpBalance(amount);
    setMessage({ type: 'success', text: `Successfully added Rs. ${amount.toLocaleString()} to your wallet!` });
    setCustomAmount('');
    
    setTimeout(() => setMessage(null), 3000);
  };

  const handleCustomTopUp = () => {
    const amount = parseInt(customAmount);
    if (isNaN(amount) || amount < 100) {
      setMessage({ type: 'error', text: 'Please enter a valid amount (minimum Rs. 100)' });
      return;
    }
    handleTopUp(amount);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Wallet</h1>

      {/* Current Balance */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg p-8 mb-8 shadow-lg">
        <p className="text-lg opacity-90 mb-2">Current Balance</p>
        <p className="text-5xl font-bold">Rs. {user?.walletBalance.toLocaleString()}</p>
      </div>

      {/* Messages */}
      {message && (
        <div
          className={`p-4 rounded-lg mb-6 ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800 border border-green-300'
              : 'bg-red-100 text-red-800 border border-red-300'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Quick Top-Up Amounts */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Quick Top-Up</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {quickAmounts.map((amount) => (
            <button
              key={amount}
              onClick={() => handleTopUp(amount)}
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold py-4 px-6 rounded-lg border-2 border-blue-200 transition-colors"
            >
              Rs. {amount.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Amount */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Custom Amount</h2>
        <div className="flex flex-col sm:flex-row gap-4">
          <input
            type="number"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            placeholder="Enter amount (min Rs. 100)"
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            min="100"
          />
          <button
            onClick={handleCustomTopUp}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors whitespace-nowrap"
          >
            Add to Wallet
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          * This is a simulated payment. In a real application, this would integrate with a payment gateway.
        </p>
      </div>

      {/* Transaction Info */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6 border border-blue-200">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Wallet Information</h3>
        <ul className="text-sm text-blue-800 space-y-2">
          <li>• Each bid costs Rs. 50</li>
          <li>• Minimum top-up amount is Rs. 100</li>
          <li>• Your wallet balance is used for placing bids</li>
          <li>• Keep your wallet topped up to participate in bidding</li>
        </ul>
      </div>
    </div>
  );
};

export default Wallet;
