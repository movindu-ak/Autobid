import { Link } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export default function MyBids() {
  const { user } = useAuth();
  const { vehicles } = useApp();

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your bids.</p>
          <Link
            to="/login"
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  // Get all vehicles where the user has placed bids
  const vehiclesWithMyBids = vehicles
    .filter(vehicle => vehicle.bids.some(bid => bid.userId === user.id))
    .map(vehicle => {
      const startingBidPrice = vehicle.suggestedStartingBid || vehicle.basePrice;
      const myBids = vehicle.bids.filter(bid => bid.userId === user.id);
      const myHighestBid = Math.max(...myBids.map(b => b.amount));
      
      // Check if winning - only bids above starting price count
      const qualifyingBids = vehicle.bids.filter(b => b.amount > startingBidPrice);
      const isWinning = qualifyingBids.length > 0 && 
        qualifyingBids.sort((a, b) => b.amount - a.amount)[0]?.userId === user.id;
      
      return {
        ...vehicle,
        myBids,
        myHighestBid,
        myLatestBid: myBids.sort((a, b) => 
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        )[0],
        isWinning,
      };
    });

  const formatTimeRemaining = (endTime: Date) => {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();
    if (diff <= 0) return 'Ended';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bids</h1>
        <p className="text-gray-600">Track all vehicles you've placed bids on</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-700 font-medium">Active Bids</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">
                {vehiclesWithMyBids.filter(v => v.isActive).length}
              </p>
            </div>
            <div className="text-4xl">🎯</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-700 font-medium">Winning</p>
              <p className="text-3xl font-bold text-green-900 mt-2">
                {vehiclesWithMyBids.filter(v => v.isWinning && v.isActive).length}
              </p>
            </div>
            <div className="text-4xl">🏆</div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-700 font-medium">Total Vehicles</p>
              <p className="text-3xl font-bold text-purple-900 mt-2">
                {vehiclesWithMyBids.length}
              </p>
            </div>
            <div className="text-4xl">🚗</div>
          </div>
        </div>
      </div>

      {vehiclesWithMyBids.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Bids Yet</h2>
          <p className="text-gray-600 mb-6">You haven't placed any bids on vehicles.</p>
          <Link
            to="/"
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700"
          >
            Browse Vehicles
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {vehiclesWithMyBids.map((vehicle) => (
            <div
              key={vehicle.id}
              className={`bg-white rounded-lg shadow-md overflow-hidden border-2 ${
                vehicle.isWinning && vehicle.isActive
                  ? 'border-green-400 shadow-green-100'
                  : 'border-transparent'
              }`}
            >
              <div className="flex flex-col md:flex-row">
                {/* Vehicle Image */}
                <div className="md:w-64 h-48 md:h-auto flex-shrink-0">
                  <img
                    src={vehicle.image}
                    alt={vehicle.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Vehicle Info */}
                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <Link
                        to={`/vehicle/${vehicle.id}`}
                        className="text-xl font-bold text-gray-900 hover:text-indigo-600"
                      >
                        {vehicle.title}
                      </Link>
                      <p className="text-sm text-gray-600 uppercase mt-1">{vehicle.category}</p>
                    </div>
                    {vehicle.isWinning && vehicle.isActive && (
                      <span className="bg-green-100 text-green-800 text-sm font-bold px-3 py-1 rounded-full flex items-center gap-1">
                        🏆 Winning
                      </span>
                    )}
                    {!vehicle.isActive && (
                      <span className="bg-gray-100 text-gray-800 text-sm font-bold px-3 py-1 rounded-full">
                        Ended
                      </span>
                    )}
                  </div>

                  {/* Bid Statistics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600">Current Price</p>
                      <p className="text-lg font-bold text-indigo-600">
                        Rs. {vehicle.currentPrice.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600">My Highest Bid</p>
                      <p className="text-lg font-bold text-blue-700">
                        Rs. {vehicle.myHighestBid.toLocaleString()}
                      </p>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600">My Total Bids</p>
                      <p className="text-lg font-bold text-purple-700">
                        {vehicle.myBids.length}
                      </p>
                    </div>
                    <div className="bg-orange-50 rounded-lg p-3">
                      <p className="text-xs text-gray-600">Time Remaining</p>
                      <p className="text-lg font-bold text-orange-700">
                        {formatTimeRemaining(vehicle.biddingEndTime)}
                      </p>
                    </div>
                  </div>

                  {/* Latest Bid */}
                  <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-4 border border-indigo-200">
                    <div className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="text-sm text-indigo-700 font-medium">Your Latest Bid</p>
                        <p className="text-2xl font-bold text-indigo-900 mt-1">
                          Rs. {vehicle.myLatestBid.amount.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          {new Date(vehicle.myLatestBid.timestamp).toLocaleDateString()} at{' '}
                          {new Date(vehicle.myLatestBid.timestamp).toLocaleTimeString()}
                        </p>
                        
                        {/* Bid Status Indicator */}
                        <div className="mt-2 space-y-1">
                          {/* Bid Direction Lock */}
                          <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full font-medium ${
                            vehicle.myLatestBid.type === 'upward'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            🔒 Locked: {vehicle.myLatestBid.type === 'upward' ? '📈 Upward' : '📉 Downward'} bidding only
                          </span>
                          
                          {/* Qualifying Status */}
                          {vehicle.suggestedStartingBid && (
                            <>
                              {vehicle.myHighestBid > vehicle.suggestedStartingBid ? (
                                <span className="inline-flex items-center gap-1 text-xs bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full font-medium ml-2">
                                  ✓ Qualifying Bid
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded-full font-medium ml-2">
                                  ⚠ Below Starting Price
                                </span>
                              )}
                            </>
                          )}
                        </div>
                        
                        {/* Additional Info */}
                        {vehicle.suggestedStartingBid && (
                          <div className="mt-2">
                            {vehicle.myHighestBid > vehicle.suggestedStartingBid ? (
                              <p className="text-xs text-gray-600">
                                Your bid affects the current price
                              </p>
                            ) : (
                              <p className="text-xs text-gray-600">
                                Your bid doesn't affect current price (below Rs. {vehicle.suggestedStartingBid.toLocaleString()})
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      <Link
                        to={`/vehicle/${vehicle.id}`}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors text-sm ml-4"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
