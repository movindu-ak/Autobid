import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';

const MyAccount = () => {
  const { user, logout } = useAuth();
  const { vehicles, getUserVehicles } = useApp();

  const userVehicles = getUserVehicles(user?.id || '');
  const userBids = vehicles.flatMap(v => v.bids).filter((bid) => bid.userId === user?.id);

  const stats = [
    {
      label: 'Wallet Balance',
      value: `Rs. ${user?.walletBalance.toLocaleString()}`,
      icon: '',
      color: 'bg-green-100 text-green-800',
    },
    {
      label: 'Posted Vehicles',
      value: userVehicles.length,
      icon: '',
      color: 'bg-blue-100 text-blue-800',
    },
    {
      label: 'Favorites',
      value: user?.favorites.length || 0,
      icon: '',
      color: 'bg-red-100 text-red-800',
    },
    {
      label: 'Total Bids',
      value: userBids.length,
      icon: '',
      color: 'bg-purple-100 text-purple-800',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Account</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-semibold mb-2">{user?.displayName}</h2>
            <p className="text-gray-600">{user?.email}</p>
            <p className="text-sm text-gray-500 mt-2">
              Member since {new Date(user?.createdAt || '').toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={logout}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className={`${stat.color} rounded-lg p-6 shadow-md`}>
            <div className="text-3xl mb-2">{stat.icon}</div>
            <p className="text-2xl font-bold mb-1">{stat.value}</p>
            <p className="text-sm font-medium opacity-80">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">My Posted Vehicles</h2>
          <Link
            to="/add-vehicle"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors text-sm"
          >
            + Add Vehicle
          </Link>
        </div>

        {userVehicles.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">You have not posted any vehicles yet.</p>
            <Link
              to="/add-vehicle"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Post Your First Vehicle
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {userVehicles.map((vehicle) => (
              <Link
                key={vehicle.id}
                to={`/vehicle/${vehicle.id}`}
                className="block border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:shadow-md transition-all"
              >
                <div className="flex flex-col sm:flex-row gap-4">
                  <img
                    src={vehicle.image}
                    alt={vehicle.title}
                    className="w-full sm:w-32 h-32 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-2">
                      <h3 className="text-lg font-semibold">{vehicle.title}</h3>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                          vehicle.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {vehicle.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{vehicle.category}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
                      <span className="text-gray-700">
                        Base: <span className="font-semibold">Rs. {vehicle.basePrice.toLocaleString()}</span>
                      </span>
                      <span className="text-blue-700">
                        Current: <span className="font-semibold">Rs. {vehicle.currentPrice.toLocaleString()}</span>
                      </span>
                      <span className="text-purple-700">
                        Bids: <span className="font-semibold">{vehicle.bids.length}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAccount;
