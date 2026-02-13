import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice } from '../utils/helpers';
import type { VehicleCategory } from '../types/index';

const Home = () => {
  const { vehicles } = useApp();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<VehicleCategory | 'all'>('all');

  const categories: Array<VehicleCategory | 'all'> = ['all', 'car', 'bike', 'truck', 'suv', 'van', 'other'];

  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch = 
      (vehicle.title?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (vehicle.category?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || vehicle.category === selectedCategory;
    return matchesSearch && matchesCategory && vehicle.isActive;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Welcome to AutoBid </h1>
          <p className="text-xl sm:text-2xl opacity-90">Bid on your dream vehicle today!</p>
        </div>
      </div>

      {!user && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700">
                  You are browsing as a visitor.{' '}
                  <Link to="/login" className="font-medium underline hover:text-yellow-800">Sign in</Link>{' '}
                  or{' '}
                  <Link to="/signup" className="font-medium underline hover:text-yellow-800">create an account</Link>{' '}
                  to start bidding!
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Search vehicles by name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="md:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as VehicleCategory | 'all')}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-gray-600">
            Found <span className="font-semibold text-gray-900">{filteredVehicles.length}</span> vehicle(s)
          </p>
        </div>

        {filteredVehicles.length === 0 ? (
          <div className="text-center py-16">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No vehicles found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredVehicles.map((vehicle) => {
              const timeAgo = new Date(vehicle.createdAt);
              const now = new Date();
              const diffMs = now.getTime() - timeAgo.getTime();
              const diffMins = Math.floor(diffMs / 60000);
              const diffHours = Math.floor(diffMs / 3600000);
              const diffDays = Math.floor(diffMs / 86400000);
              
              let timeText = 'just now';
              if (diffMins < 60 && diffMins > 0) timeText = `${diffMins} minute${diffMins > 1 ? 's' : ''}`;
              else if (diffHours < 24 && diffHours > 0) timeText = `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
              else if (diffDays > 0) timeText = `${diffDays} day${diffDays > 1 ? 's' : ''}`;

              return (
                <Link 
                  key={vehicle.id} 
                  to={`/vehicle/${vehicle.id}`} 
                  className="bg-white border border-gray-200 rounded hover:shadow-md transition-shadow duration-200 overflow-hidden block"
                >
                  <div className="flex gap-4 p-4">
                    {/* Vehicle Image */}
                    <div className="flex-shrink-0">
                      <img 
                        src={vehicle.image} 
                        alt={vehicle.title} 
                        className="w-40 h-32 object-cover rounded"
                      />
                    </div>
                    
                    {/* Vehicle Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 font-poppins">
                          {vehicle.title}
                        </h3>
                        {vehicle.biddingType === 'upward' && vehicle.bids.length > 5 && (
                          <span className="bg-yellow-400 text-gray-900 px-2 py-0.5 rounded text-xs font-bold ml-2 flex-shrink-0">
                            FEATURED
                          </span>
                        )}
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-1 font-inter">
                        {vehicle.mileage || '0 km'}
                      </p>
                      
                      <p className="text-sm text-gray-500 mb-3 font-inter">
                        {vehicle.nearestCity}, {vehicle.category.charAt(0).toUpperCase() + vehicle.category.slice(1)}s
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-neon-green font-poppins">
                            Rs {vehicle.currentPrice.toLocaleString()}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {vehicle.biddingType === 'upward' ? (
                            <span className="text-green-600 text-xs">
                              <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                              </svg>
                            </span>
                          ) : (
                            <span className="text-red-600 text-xs">
                              <svg className="w-4 h-4 inline" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </span>
                          )}
                          <span className="text-xs text-gray-500 font-inter">{vehicle.bids.length} bids</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Timestamp */}
                    <div className="flex-shrink-0 text-right">
                      <p className="text-xs text-gray-500 font-inter">{timeText}</p>
                      {vehicle.bids.length > 3 && (
                        <div className="mt-2 flex gap-1 justify-end">
                          <span className="text-yellow-500">⚡</span>
                          <span className="text-blue-500">👑</span>
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
