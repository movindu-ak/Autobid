import { useState } from 'react';
import { Link } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

export default function MyAds() {
  const { user } = useAuth();
  const { vehicles } = useApp();
  const [selectedVehicle, setSelectedVehicle] = useState<string | null>(null);

  // Filter vehicles posted by the current user
  const myVehicles = vehicles.filter(v => v.userId === user?.id);

  // Get selected vehicle details
  const selectedVehicleData = myVehicles.find(v => v.id === selectedVehicle);

  const formatTimeRemaining = (endTime: Date) => {
    const now = new Date();
    const diff = endTime.getTime() - now.getTime();
    if (diff <= 0) return 'Expired';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return `${days}d ${hours}h`;
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
          <p className="text-gray-600 mb-6">You need to be logged in to view your ads.</p>
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Ads</h1>
        <p className="text-gray-600">Manage your vehicle listings and view bidder information</p>
      </div>

      {myVehicles.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">No Ads Yet</h2>
          <p className="text-gray-600 mb-6">You haven't posted any vehicles for bidding.</p>
          <Link
            to="/add-vehicle"
            className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700"
          >
            Post Your First Vehicle
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - My Vehicle Listings */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Your Listings ({myVehicles.length})
            </h2>

            {myVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-all ${
                  selectedVehicle === vehicle.id
                    ? 'ring-2 ring-indigo-500 shadow-xl'
                    : 'hover:shadow-lg'
                }`}
                onClick={() => setSelectedVehicle(vehicle.id)}
              >
                <div className="flex">
                  {/* Vehicle Image */}
                  <div className="w-40 h-40 flex-shrink-0">
                    <img
                      src={vehicle.image}
                      alt={vehicle.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Vehicle Info */}
                  <div className="flex-1 p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{vehicle.title}</h3>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded ${
                          vehicle.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {vehicle.isActive ? 'Active' : 'Ended'}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mb-2 uppercase">{vehicle.category}</p>

                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                      <div>
                        <p className="text-gray-500 text-xs">Current Price</p>
                        <p className="font-semibold text-indigo-600">
                          Rs. {vehicle.currentPrice.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500 text-xs">Total Bids</p>
                        <p className="font-semibold text-green-600">{vehicle.bids.length}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>⏱️ {formatTimeRemaining(vehicle.biddingEndTime)}</span>
                      <span>•</span>
                      <span>📍 {vehicle.nearestCity}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column - Bidder Information */}
          <div className="lg:sticky lg:top-4 lg:self-start">
            {selectedVehicle && selectedVehicleData ? (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Bidders Information
                  </h2>
                  <p className="text-sm text-gray-600">
                    Contact details for "{selectedVehicleData.title}"
                  </p>
                </div>

                {selectedVehicleData.bids.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="text-4xl mb-3">📭</div>
                    <p className="text-gray-500">No bids yet on this vehicle</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Bid Statistics */}
                    <div className="grid grid-cols-3 gap-3 mb-6 p-4 bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg">
                      <div className="text-center">
                        <p className="text-xs text-gray-600 mb-1">Total Bids</p>
                        <p className="text-lg font-bold text-indigo-600">
                          {selectedVehicleData.bids.length}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-600 mb-1">Highest Bid</p>
                        <p className="text-lg font-bold text-green-600">
                          Rs.{' '}
                          {Math.max(
                            ...selectedVehicleData.bids.map((b) => b.amount)
                          ).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-center">
                        <p className="text-xs text-gray-600 mb-1">Unique Bidders</p>
                        <p className="text-lg font-bold text-blue-600">
                          {new Set(selectedVehicleData.bids.map((b) => b.userId)).size}
                        </p>
                      </div>
                    </div>

                    {/* Bidders List */}
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {selectedVehicleData.bids
                        .slice()
                        .sort((a, b) => b.amount - a.amount) // Sort by amount descending
                        .map((bid, index) => (
                          <div
                            key={bid.id}
                            className={`p-4 rounded-lg border-2 ${
                              index === 0
                                ? 'border-green-300 bg-green-50'
                                : 'border-gray-200 bg-gray-50'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-2">
                                <div className="w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold">
                                  {bid.userName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-semibold text-gray-900">
                                    {bid.userName}
                                    {index === 0 && (
                                      <span className="ml-2 text-xs bg-green-600 text-white px-2 py-1 rounded">
                                        Highest
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {new Date(bid.createdAt).toLocaleDateString()} at{' '}
                                    {new Date(bid.createdAt).toLocaleTimeString()}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold text-indigo-600">
                                  Rs. {bid.amount.toLocaleString()}
                                </p>
                                <p className="text-xs text-gray-500 capitalize">{bid.type}</p>
                              </div>
                            </div>

                            {/* Contact Information */}
                            <div className="mt-3 pt-3 border-t border-gray-300">
                              <p className="text-xs font-semibold text-gray-700 mb-2">
                                📞 Contact Details:
                              </p>
                              <div className="grid grid-cols-1 gap-2 text-sm">
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-600">📧 Email:</span>
                                  <a
                                    href={`mailto:${bid.userEmail}`}
                                    className="text-indigo-600 hover:text-indigo-800 font-medium"
                                  >
                                    {bid.userEmail}
                                  </a>
                                </div>
                                {/* You can add phone number if available in your user data */}
                                <div className="flex items-center gap-2">
                                  <span className="text-gray-600">👤 User ID:</span>
                                  <span className="font-mono text-xs text-gray-700">
                                    {bid.userId}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Quick Actions */}
                            <div className="mt-3 flex gap-2">
                              <a
                                href={`mailto:${bid.userEmail}?subject=Regarding your bid on ${selectedVehicleData.title}`}
                                className="flex-1 text-center bg-indigo-600 text-white text-sm px-3 py-2 rounded hover:bg-indigo-700 transition-colors"
                              >
                                Send Email
                              </a>
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(bid.userEmail);
                                  alert('Email copied to clipboard!');
                                }}
                                className="flex-1 text-center bg-gray-600 text-white text-sm px-3 py-2 rounded hover:bg-gray-700 transition-colors"
                              >
                                Copy Email
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-12 text-center">
                <div className="text-6xl mb-4">👈</div>
                <p className="text-gray-600">
                  Select a vehicle from the list to view bidder information
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
