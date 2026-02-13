import { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { formatTimeRemaining, calculateSuggestedBidAmount } from '../utils/helpers';
import LocationDisplay from '../components/LocationDisplay';
import type { BiddingType } from '../types/index';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function VehicleDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { placeBid, getVehicleById } = useApp();
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedBidType, setSelectedBidType] = useState<BiddingType>('upward');
  const [customAmount, setCustomAmount] = useState('');
  const [bidding, setBidding] = useState(false);

  const vehicle = getVehicleById(id || '');

  const startingBidPrice = vehicle?.suggestedStartingBid || vehicle?.basePrice || 0;
  
  // Check user's previous bids on THIS vehicle to determine locked direction
  const userPreviousBids = user && vehicle ? vehicle.bids.filter(bid => bid.userId === user.id) : [];
  const userBidDirection = userPreviousBids.length > 0 
    ? userPreviousBids[userPreviousBids.length - 1].type 
    : null;

  // Prepare chart data: group bids by day and track price progression
  const chartData = useMemo(() => {
    if (!vehicle) return [];

    // Calculate auction start date
    const auctionStart = new Date(vehicle.createdAt);

    // Sort bids by timestamp
    const sortedBids = [...vehicle.bids].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Create a data point for each bid
    const bidDataPoints: { day: number; price: number }[] = [];

    sortedBids.forEach(bid => {
      const bidDate = new Date(bid.timestamp);
      const dayNumber = Math.floor((bidDate.getTime() - auctionStart.getTime()) / (1000 * 60 * 60 * 24));
      
      // Only include upgrade bids (above starting price)
      if (bid.amount > startingBidPrice) {
        bidDataPoints.push({
          day: dayNumber,
          price: bid.amount
        });
      }
    });

    // If no bids, add a starting point at day 0 with starting bid price
    // This ensures the chart always displays with proper axes
    if (bidDataPoints.length === 0) {
      bidDataPoints.push({
        day: 0,
        price: startingBidPrice
      });
    }

    return bidDataPoints;
  }, [vehicle, startingBidPrice]);

  // Calculate X-axis ticks for all days
  const xAxisTicks = useMemo(() => {
    if (!vehicle) return [];
    const auctionStart = new Date(vehicle.createdAt);
    const auctionEnd = new Date(vehicle.biddingEndTime);
    const totalDays = Math.ceil((auctionEnd.getTime() - auctionStart.getTime()) / (1000 * 60 * 60 * 24));
    return Array.from({ length: totalDays + 1 }, (_, i) => i);
  }, [vehicle]);

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Vehicle not found</h2>
          <Link to="/" className="text-indigo-600 hover:text-indigo-500 mt-4 inline-block">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const handleBidClick = (bidType: BiddingType) => {
    if (!user) {
      navigate('/login');
      return;
    }
    setSelectedBidType(bidType);
    setShowBidModal(true);
  };

  const handlePlaceBid = async () => {
    if (!user) return;
    
    // Calculate maximum allowed increment (1% of base price)
    const maxAllowedIncrement = Math.floor(vehicle.basePrice * 0.01);
    
    // Validate custom amount if provided
    if (customAmount) {
      const amount = parseInt(customAmount);
      if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount');
        return;
      }
      // Check if increment amount is reasonable (not too small)
      if (amount < 5000) {
        alert('Increment amount must be at least Rs. 5,000');
        return;
      }
      // Check if amount is a multiple of 5000
      if (amount % 5000 !== 0) {
        alert('Bid amount must be a multiple of Rs. 5,000 (e.g., 5000, 10000, 15000)');
        return;
      }
      // Check if increment exceeds 1% of base price
      if (amount > maxAllowedIncrement) {
        alert(
          `Bid increment cannot exceed 1% of base price!\n\n` +
          `Please enter an amount up to Rs. ${maxAllowedIncrement.toLocaleString()}`
        );
        return;
      }
    }
    
    setBidding(true);
    const amount = customAmount ? parseInt(customAmount) : undefined;
    const success = await placeBid(vehicle.id, selectedBidType, amount);
    setBidding(false);
    
    if (success) {
      setShowBidModal(false);
      setCustomAmount('');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link to="/" className="text-indigo-600 hover:text-indigo-500 mb-4 inline-flex items-center">
           Back to Vehicles
        </Link>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="p-6">
              <img
                src={vehicle.image}
                alt={vehicle.title}
                className="w-full h-64 sm:h-80 lg:h-auto object-cover rounded-lg"
              />
            </div>

            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-3xl font-bold text-gray-900">{vehicle.title}</h1>
                <span className="bg-indigo-100 text-indigo-800 text-sm font-semibold px-3 py-1 rounded uppercase">
                  {vehicle.category}
                </span>
              </div>

              <p className="text-gray-600 mb-6">{vehicle.description}</p>

              {/* Price Negotiation Badge */}
              {vehicle.negotiable && (
                <div className="mb-4 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-800 font-medium flex items-center gap-2">
                    <span>💬</span> Price is negotiable - Seller is open to reasonable offers
                  </p>
                </div>
              )}

              {/* Price Information */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-500">Base Price</p>
                  <p className="text-lg font-semibold">Rs. {vehicle.basePrice.toLocaleString()}</p>
                </div>
                {vehicle.suggestedStartingBid && (
                  <div>
                    <p className="text-sm text-gray-500">Starting Bid</p>
                    <p className="text-lg font-semibold text-green-600">
                      Rs. {vehicle.suggestedStartingBid.toLocaleString()}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-500">Current Price</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    Rs. {vehicle.currentPrice.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Bids</p>
                  <p className="text-lg font-semibold">{vehicle.bids.length}</p>
                </div>
                {vehicle.negotiable && (
                  <div>
                    <p className="text-sm text-gray-500">Time Remaining</p>
                    <p className="text-lg font-semibold">{formatTimeRemaining(vehicle.biddingEndTime)}</p>
                  </div>
                )}
              </div>

              {/* Price Progression Chart */}
              <div className="mb-6">
                <h3 className="font-semibold mb-4 text-gray-900">Price Progression</h3>
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart 
                      data={chartData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="0" stroke="#d1d5db" strokeWidth={1} />
                      <XAxis 
                        dataKey="day" 
                        label={{ value: 'Days in Auction', position: 'insideBottom', offset: -10, style: { fontSize: 12 } }}
                        tick={{ fontSize: 12 }}
                        type="number"
                        domain={[0, xAxisTicks.length > 0 ? Math.max(...xAxisTicks) : 1]}
                        ticks={xAxisTicks}
                        allowDecimals={false}
                        axisLine={{ stroke: '#374151', strokeWidth: 2 }}
                      />
                      <YAxis 
                        label={{ value: 'Price (Rs.)', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
                        domain={[
                          Math.floor((vehicle.suggestedStartingBid || vehicle.basePrice * 0.85)),
                          Math.ceil(vehicle.basePrice * 1.15)
                        ]}
                        allowDataOverflow={false}
                        tickCount={6}
                        axisLine={{ stroke: '#374151', strokeWidth: 2 }}
                      />
                        <Tooltip 
                          formatter={(value) => {
                            if (value === null || value === undefined) return ['No bids', ''];
                            return [`Rs. ${Number(value).toLocaleString()}`, 'Price'];
                          }}
                          labelFormatter={(label) => `Day ${label}`}
                          contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                        />
                        <Line 
                          type="linear" 
                          dataKey="price" 
                          stroke="#ef4444" 
                          strokeWidth={3}
                          dot={{ fill: '#ef4444', r: 7, strokeWidth: 0 }}
                          activeDot={{ r: 9, fill: '#ef4444' }}
                          connectNulls={true}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                    <p className="text-xs text-gray-500 mt-2 text-center">
                      Track how the price has changed throughout the auction period
                    </p>
                  </div>
                </div>
            </div>
          </div>

          {/* Vehicle Specifications Section */}
          <div className="p-6 border-t bg-gray-50">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Vehicle Specifications</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              {/* Basic Specs */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-xl">📋</span> Basic Information
                </h3>
                <div className="space-y-2 text-sm">
                  {vehicle.yearOfManufacture && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Year:</span>
                      <span className="font-medium">{vehicle.yearOfManufacture}</span>
                    </div>
                  )}
                  {vehicle.mileage && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mileage:</span>
                      <span className="font-medium">{vehicle.mileage} km</span>
                    </div>
                  )}
                  {vehicle.engineCapacity && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Engine:</span>
                      <span className="font-medium">{vehicle.engineCapacity} cc</span>
                    </div>
                  )}
                  {vehicle.previousOwners !== undefined && vehicle.previousOwners !== null && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Owners:</span>
                      <span className="font-medium">
                        {vehicle.previousOwners === 0 ? 'Brand New' : vehicle.previousOwners === 1 ? '1 Previous' : `${vehicle.previousOwners} Previous`}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Fuel & Transmission */}
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-xl">⚙️</span> Fuel & Transmission
                </h3>
                <div className="space-y-2 text-sm">
                  {vehicle.fuelType && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fuel Type:</span>
                      <span className="font-medium">
                        {vehicle.fuelType}
                        {vehicle.fuelType === 'Petrol' && ' ⛽'}
                        {vehicle.fuelType === 'Diesel' && ' ⛽'}
                        {vehicle.fuelType === 'CNG' && ' 🔋'}
                        {vehicle.fuelType === 'Hybrid' && ' 🔌'}
                        {vehicle.fuelType === 'Electric' && ' ⚡'}
                      </span>
                    </div>
                  )}
                  {vehicle.transmissionType && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Transmission:</span>
                      <span className="font-medium">{vehicle.transmissionType} 🔧</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Vehicle Usage */}
              {vehicle.sellingReason && (
                <div className="bg-white rounded-lg p-4 border border-gray-200">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="text-xl">🚗</span> Usage History
                  </h3>
                  <p className="text-sm text-gray-700">
                    {vehicle.sellingReason}
                  </p>
                </div>
              )}
            </div>

            {/* Vehicle Condition */}
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-xl">✨</span> Vehicle Condition Assessment
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Tire Condition */}
                {vehicle.tyreCondition !== undefined && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Tire</span>
                      <span className="text-sm font-bold text-indigo-700">{vehicle.tyreCondition}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-indigo-500 h-2 rounded-full" style={{width: `${vehicle.tyreCondition}%`}}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {vehicle.tyreCondition >= 80 ? 'Excellent' : vehicle.tyreCondition >= 60 ? 'Good' : vehicle.tyreCondition >= 40 ? 'Fair' : 'Poor'}
                    </p>
                  </div>
                )}

                {/* Battery Condition */}
                {vehicle.batteryCondition !== undefined && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Battery</span>
                      <span className="text-sm font-bold text-green-700">{vehicle.batteryCondition}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: `${vehicle.batteryCondition}%`}}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {vehicle.batteryCondition >= 80 ? 'Excellent' : vehicle.batteryCondition >= 60 ? 'Good' : vehicle.batteryCondition >= 40 ? 'Fair' : 'Poor'}
                    </p>
                  </div>
                )}

                {/* Interior Condition */}
                {vehicle.interiorCondition !== undefined && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Interior</span>
                      <span className="text-sm font-bold text-amber-700">{vehicle.interiorCondition}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-amber-500 h-2 rounded-full" style={{width: `${vehicle.interiorCondition}%`}}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {vehicle.interiorCondition >= 80 ? 'Excellent' : vehicle.interiorCondition >= 60 ? 'Good' : vehicle.interiorCondition >= 40 ? 'Fair' : 'Poor'}
                    </p>
                  </div>
                )}

                {/* Exterior Condition */}
                {vehicle.exteriorCondition !== undefined && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Exterior</span>
                      <span className="text-sm font-bold text-cyan-700">{vehicle.exteriorCondition}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-cyan-500 h-2 rounded-full" style={{width: `${vehicle.exteriorCondition}%`}}></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {vehicle.exteriorCondition >= 80 ? 'Excellent' : vehicle.exteriorCondition >= 60 ? 'Good' : vehicle.exteriorCondition >= 40 ? 'Fair' : 'Poor'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bidding Section */}
          <div className="p-6 border-t">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Place Your Bid</h2>
            
            {/* Per-Vehicle Bid Direction Lock Indicator */}
            {user && userBidDirection && (
              <div className={`mb-4 p-3 rounded-lg border-2 ${
                userBidDirection === 'upward' 
                  ? 'bg-green-50 border-green-300' 
                  : 'bg-red-50 border-red-300'
              }`}>
                <p className={`text-sm font-medium ${
                  userBidDirection === 'upward' ? 'text-green-800' : 'text-red-800'
                }`}>
                  🔒 Locked on this vehicle: You can only place <span className="font-bold uppercase">{userBidDirection}</span> bids
                  <br />
                  <span className="text-xs opacity-75">
                    You have placed {userPreviousBids.length} {userBidDirection} bid(s) on this vehicle. You can bid differently on other vehicles.
                  </span>
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-3">
              {/* <div className="grid grid-cols-2 gap-3"> */}
              <div>
                <button
                  onClick={() => handleBidClick('upward')}
                  disabled={userBidDirection === 'downward'}
                  className={`w-full px-4 py-3 rounded-lg font-medium transition-colors text-sm ${
                    userBidDirection === 'downward'
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                  title={userBidDirection === 'downward' ? 'Locked to downward bidding on this vehicle' : ''}
                >
                  Bid Up 📈
                    
                  {userBidDirection === 'downward' && ' 🔒'}
                </button>
                {/* Downward bidding temporarily disabled */}
                {/* <button
                  onClick={() => handleBidClick('downward')}
                  disabled={userBidDirection === 'upward'}
                  className={`px-4 py-3 rounded-lg font-medium transition-colors text-sm ${
                    userBidDirection === 'upward'
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                  title={userBidDirection === 'upward' ? 'Locked to upward bidding on this vehicle' : ''}
                >
                  Bid Down 📉 (-0.5%-1%)
                  {userBidDirection === 'upward' && ' 🔒'}
                </button> */}
              </div>
              <p className="text-xs text-gray-500 text-center">
                Quick bid increases price by 1%. Or use custom amount to enter your specific bid price.
              </p>
            </div>

            {!user && (
              <p className="mt-4 text-sm text-center text-gray-600">
                <Link to="/login" className="text-indigo-600 hover:text-indigo-500">
                  Login
                </Link>
                {' '}to place a bid
              </p>
            )}
          </div>

          {/* Location & Seller Info */}
          <div className="p-6 border-t">
            <div className="mb-4">
              <LocationDisplay 
                address={vehicle.nearestCity} 
                lat={vehicle.locationLat}
                lng={vehicle.locationLng}
              />
            </div>

            <div className="text-sm text-gray-500">
              <p>📝 Posted by: {vehicle.userName}</p>
            </div>
          </div>

          {/* My Bids Section - Only show current user's bids */}
          {user && vehicle.bids.filter(bid => bid.userId === user.id).length > 0 && (
            <div className="p-6 border-t bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-indigo-900">My Bids on This Vehicle</h3>
                {userBidDirection && (
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    userBidDirection === 'upward'
                      ? 'bg-green-200 text-green-900'
                      : 'bg-red-200 text-red-900'
                  }`}>
                    🔒 {userBidDirection.toUpperCase()} only on this vehicle
                  </span>
                )}
              </div>
              <div className="space-y-3">
                {vehicle.bids
                  .filter(bid => bid.userId === user.id)
                  .slice()
                  .reverse()
                  .map((bid, index) => (
                    <div key={bid.id} className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm border border-indigo-200">
                      <div>
                        <p className="font-semibold text-gray-900">
                          Bid #{vehicle.bids.filter(b => b.userId === user.id).length - index}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(bid.timestamp).toLocaleDateString()} at {new Date(bid.timestamp).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-xl text-indigo-700">Rs. {bid.amount.toLocaleString()}</p>
                        <span className={`text-xs px-2 py-1 rounded font-medium ${
                          bid.biddingType === 'upward' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {bid.biddingType === 'upward' ? '📈 Bid Up' : '📉 Bid Down'}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
              <div className="mt-4 p-3 bg-white rounded-lg border border-indigo-200">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total bids placed:</span>
                  <span className="font-semibold text-gray-900">
                    {vehicle.bids.filter(bid => bid.userId === user.id).length}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-600">Highest bid you placed:</span>
                  <span className="font-semibold text-indigo-700">
                    Rs. {Math.max(...vehicle.bids.filter(bid => bid.userId === user.id).map(b => b.amount)).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* All Bids Section - Only visible to the seller */}
          {user && vehicle.userId === user.id && vehicle.bids.length > 0 && (
            <div className="p-6 border-t bg-gradient-to-r from-green-50 to-emerald-50">
              <h3 className="text-xl font-bold mb-4 text-green-900">All Bids (Seller View)</h3>
              <p className="text-sm text-green-800 mb-4">
                ✅ You are the seller. You can see all {vehicle.bids.length} bid(s) placed on this vehicle.
              </p>
              <div className="space-y-3">
                {vehicle.bids.slice().reverse().map((bid) => (
                  <div key={bid.id} className="flex justify-between items-center p-4 bg-white rounded-lg shadow-sm border border-green-200">
                    <div>
                      <p className="font-semibold text-gray-900">{bid.userName}</p>
                      <p className="text-xs text-gray-500">{bid.userEmail}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {new Date(bid.timestamp).toLocaleDateString()} at {new Date(bid.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-xl text-green-700">Rs. {bid.amount.toLocaleString()}</p>
                      <span className={`text-xs px-2 py-1 rounded font-medium ${
                        bid.biddingType === 'upward' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {bid.biddingType === 'upward' ? '📈 Up' : '📉 Down'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {showBidModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              Place a {selectedBidType === 'upward' ? 'Upward' : 'Downward'} Bid
            </h3>
            
            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-2">Current Price:</p>
              <p className="text-2xl font-bold">Rs. {vehicle.currentPrice.toLocaleString()}</p>
              <p className="text-sm text-red-600 mt-2">Bidding Fee: Rs. 50</p>
            </div>

            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-blue-600 font-medium mb-1">💡 Suggested Increment Amount</p>
                  <p className="text-lg font-bold text-blue-700">Rs. {calculateSuggestedBidAmount(vehicle.currentPrice).toLocaleString()}</p>
                  <p className="text-xs text-blue-600 mt-1">Recommended increment (0.75% of current price)</p>
                </div>
                <button
                  onClick={() => setCustomAmount(calculateSuggestedBidAmount(vehicle.currentPrice).toString())}
                  className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                >
                  Use This
                </button>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Custom Bid Amount (Amount to add/subtract from current price)
              </label>
              <input
                type="number"
                step="5000"
                min="5000"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg"
                placeholder="Enter increment amount (e.g., 10000)"
              />
              <p className="text-xs text-gray-500 mt-1">
                Example: Enter 10,000 to {selectedBidType === 'upward' ? 'increase' : 'decrease'} price by Rs. 10,000. Recommended: multiples of Rs. 5,000
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowBidModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                disabled={bidding}
              >
                Cancel
              </button>
              <button
                onClick={handlePlaceBid}
                disabled={bidding}
                className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                {bidding ? 'Processing...' : 'Confirm Bid'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
