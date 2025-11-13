import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import type { VehicleCategory } from '../types/index';
import LocationPicker from '../components/LocationPicker';

export default function AddVehicle() {
  const { user } = useAuth();
  const { addVehicle } = useApp();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    category: 'car' as VehicleCategory,
    image: '',
    description: '',
    basePrice: '',
    negotiable: true,
    biddingDuration: 3,
    nearestCity: '',
    locationLat: undefined as number | undefined,
    locationLng: undefined as number | undefined,
    tyreCondition: 70,
    batteryCondition: 75,
    interiorCondition: 70,
    exteriorCondition: 75,
    yearOfManufacture: '',
    mileage: '',
    engineCapacity: '',
    previousOwners: '',
    fuelType: 'Petrol' as 'Petrol' | 'Diesel' | 'CNG' | 'Hybrid' | 'Electric',
    transmissionType: 'Manual' as 'Manual' | 'Automatic' | 'Triptronic' | 'Other',
    sellingReason: '',
  });

  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleImageChange = (files: FileList | null) => {
    if (!files) return;
    
    const newFiles = Array.from(files).slice(0, 5 - images.length);
    const validFiles = newFiles.filter(file => file.type.startsWith('image/'));
    
    if (validFiles.length !== newFiles.length) {
      setErrors({ ...errors, images: 'Only image files are allowed' });
      return;
    }
    
    if (images.length + validFiles.length > 5) {
      setErrors({ ...errors, images: 'Maximum 5 images allowed' });
      return;
    }
    
    const newImages = [...images, ...validFiles];
    setImages(newImages);
    
    // Create previews
    const newPreviews = [...imagePreviews];
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result as string);
        setImagePreviews([...newPreviews]);
      };
      reader.readAsDataURL(file);
    });
    
    // Use first image URL for the main image field (temporary solution)
    if (newImages.length > 0 && !formData.image) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(newImages[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleImageChange(e.dataTransfer.files);
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);
    setImages(newImages);
    setImagePreviews(newPreviews);
    
    // Update main image if first image was removed
    if (index === 0 && newImages.length > 0) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, image: reader.result as string });
      };
      reader.readAsDataURL(newImages[0]);
    } else if (newImages.length === 0) {
      setFormData({ ...formData, image: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: Record<string, string> = {};
    if (formData.title.length < 5) newErrors.title = 'Title must be at least 5 characters';
    if (formData.description.length < 20) newErrors.description = 'Description must be at least 20 characters';
    if (images.length === 0) newErrors.images = 'At least one image is required';
    if (parseInt(formData.basePrice) < 1000) newErrors.basePrice = 'Base price must be at least Rs. 1,000';
    if (!formData.nearestCity) newErrors.nearestCity = 'Location is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    try {
      addVehicle({
        title: formData.title,
        category: formData.category,
        image: formData.image,
        description: formData.description,
        basePrice: parseInt(formData.basePrice),
        biddingType: 'upward', // Default bidding type
        biddingDuration: formData.biddingDuration,
        nearestCity: formData.nearestCity,
        locationLat: formData.locationLat,
        locationLng: formData.locationLng,
      });
      navigate('/my-account');
    } catch (error) {
      console.error('Error adding vehicle:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-8">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2"> Post a Vehicle for Bidding</h1>
          <p className="text-gray-600">Fill in the details below to list your vehicle on AutoBid</p>
        </div>

        {/* Trust Message */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <div className="text-blue-600 text-xl mt-0.5">💡</div>
            <p className="text-sm text-gray-700 leading-relaxed">
              <span className="font-semibold text-gray-900">Be honest and detailed when posting your item.</span> Accurate information ensures trust and helps you reach genuine buyers faster.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as VehicleCategory })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            >
              <option value="car">Car</option>
              <option value="bike">Bike</option>
              <option value="truck">Truck</option>
              <option value="suv">SUV</option>
              <option value="van">Van</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Honda Civic 2021"
            />
            {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="Describe your vehicle..."
            />
            {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
          </div>

          {/* Vehicle Usage Purpose */}
          <div>
            <label htmlFor="sellingReason" className="block text-sm font-medium text-gray-700 mb-2">
              Primary Vehicle Usage <span className="text-gray-500 text-xs">(Optional)</span>
            </label>
            <textarea
              id="sellingReason"
              value={formData.sellingReason}
              onChange={(e) => setFormData({ ...formData, sellingReason: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Daily commute to work, Family transportation, Weekend trips, Business use, Home deliveries..."
            />
            <p className="text-xs text-gray-500 mt-1">
              Describe how you primarily used this vehicle to help buyers understand its usage history
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bidding Duration
            </label>
            <div className="grid grid-cols-7 gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((days) => (
                <button
                  key={days}
                  type="button"
                  onClick={() => setFormData({ ...formData, biddingDuration: days })}
                  className={`p-3 border-2 rounded-lg transition-all text-center ${
                    formData.biddingDuration === days
                      ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                      : 'border-gray-300 hover:border-indigo-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="text-lg font-bold text-gray-900">{days}</div>
                  <div className="text-xs text-gray-600">{days === 1 ? 'day' : 'days'}</div>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">Select how many days the bidding will remain active</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <LocationPicker
              onLocationSelect={(location) => {
                setFormData({
                  ...formData,
                  nearestCity: location.address,
                  locationLat: location.lat,
                  locationLng: location.lng,
                });
              }}
              initialLocation={
                formData.nearestCity
                  ? {
                      address: formData.nearestCity,
                      lat: formData.locationLat || 0,
                      lng: formData.locationLng || 0,
                    }
                  : undefined
              }
            />
            {errors.nearestCity && <p className="mt-1 text-sm text-red-600">{errors.nearestCity}</p>}
          </div>

          {/* Year, Mileage, Engine Capacity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="yearOfManufacture" className="block text-sm font-medium text-gray-700 mb-2">
                Year of Manufacture
              </label>
              <input
                type="text"
                id="yearOfManufacture"
                value={formData.yearOfManufacture}
                onChange={(e) => setFormData({ ...formData, yearOfManufacture: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 2020"
                required
              />
            </div>

            <div>
              <label htmlFor="mileage" className="block text-sm font-medium text-gray-700 mb-2">
                Mileage (km)
              </label>
              <input
                type="text"
                id="mileage"
                value={formData.mileage}
                onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 45000"
                required
              />
            </div>

            <div>
              <label htmlFor="engineCapacity" className="block text-sm font-medium text-gray-700 mb-2">
                Engine Capacity (cc)
              </label>
              <input
                type="text"
                id="engineCapacity"
                value={formData.engineCapacity}
                onChange={(e) => setFormData({ ...formData, engineCapacity: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., 1500"
                required
              />
            </div>
          </div>

          {/* Ownership History */}
          <div>
            <label htmlFor="previousOwners" className="block text-sm font-medium text-gray-700 mb-2">
              Number of Previous Owners
            </label>
            <input
              type="number"
              id="previousOwners"
              min="0"
              max="20"
              value={formData.previousOwners}
              onChange={(e) => setFormData({ ...formData, previousOwners: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 1 (Enter 0 if you are the first owner)"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              Please specify the total number of registered owners prior to yourself
            </p>
          </div>

          {/* Fuel Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fuel Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, fuelType: 'Petrol' })}
                className={`p-4 border-2 rounded-lg transition-all ${
                  formData.fuelType === 'Petrol'
                    ? 'border-orange-500 bg-orange-50 ring-2 ring-orange-200'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                <div className="text-2xl mb-1">⛽</div>
                <div className="text-sm font-semibold text-gray-900">Petrol</div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, fuelType: 'Diesel' })}
                className={`p-4 border-2 rounded-lg transition-all ${
                  formData.fuelType === 'Diesel'
                    ? 'border-amber-500 bg-amber-50 ring-2 ring-amber-200'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                <div className="text-2xl mb-1">�</div>
                <div className="text-sm font-semibold text-gray-900">Diesel</div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, fuelType: 'CNG' })}
                className={`p-4 border-2 rounded-lg transition-all ${
                  formData.fuelType === 'CNG'
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                <div className="text-2xl mb-1">💨</div>
                <div className="text-sm font-semibold text-gray-900">CNG</div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, fuelType: 'Hybrid' })}
                className={`p-4 border-2 rounded-lg transition-all ${
                  formData.fuelType === 'Hybrid'
                    ? 'border-green-500 bg-green-50 ring-2 ring-green-200'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                <div className="text-2xl mb-1">🔋</div>
                <div className="text-sm font-semibold text-gray-900">Hybrid</div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, fuelType: 'Electric' })}
                className={`p-4 border-2 rounded-lg transition-all ${
                  formData.fuelType === 'Electric'
                    ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                <div className="text-2xl mb-1">⚡</div>
                <div className="text-sm font-semibold text-gray-900">Electric</div>
              </button>
            </div>
          </div>

          {/* Transmission Type Selector */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transmission Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, transmissionType: 'Manual' })}
                className={`p-4 border-2 rounded-lg transition-all ${
                  formData.transmissionType === 'Manual'
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                <div className="text-2xl mb-1">🔧</div>
                <div className="text-sm font-semibold text-gray-900">Manual</div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, transmissionType: 'Automatic' })}
                className={`p-4 border-2 rounded-lg transition-all ${
                  formData.transmissionType === 'Automatic'
                    ? 'border-indigo-500 bg-indigo-50 ring-2 ring-indigo-200'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                <div className="text-2xl mb-1">⚙️</div>
                <div className="text-sm font-semibold text-gray-900">Automatic</div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, transmissionType: 'Triptronic' })}
                className={`p-4 border-2 rounded-lg transition-all ${
                  formData.transmissionType === 'Triptronic'
                    ? 'border-violet-500 bg-violet-50 ring-2 ring-violet-200'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                <div className="text-2xl mb-1">🔄</div>
                <div className="text-sm font-semibold text-gray-900">Triptronic</div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, transmissionType: 'Other' })}
                className={`p-4 border-2 rounded-lg transition-all ${
                  formData.transmissionType === 'Other'
                    ? 'border-gray-500 bg-gray-50 ring-2 ring-gray-200'
                    : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
                }`}
              >
                <div className="text-2xl mb-1">🛠️</div>
                <div className="text-sm font-semibold text-gray-900">Other</div>
              </button>
            </div>
          </div>

          {/* Tire Condition Slider */}
          {/* Vehicle Condition - Compact Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tire Condition */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">Tire Condition</label>
                <span className="text-lg font-bold text-gray-900">{formData.tyreCondition}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={formData.tyreCondition}
                onChange={(e) => setFormData({ ...formData, tyreCondition: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #4f46e5 0%, #4f46e5 ${formData.tyreCondition}%, #e5e7eb ${formData.tyreCondition}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Poor</span>
                <span>Fair</span>
                <span>Excellent</span>
              </div>
            </div>

            {/* Battery Condition */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">Battery Condition</label>
                <span className="text-lg font-bold text-gray-900">{formData.batteryCondition}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={formData.batteryCondition}
                onChange={(e) => setFormData({ ...formData, batteryCondition: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #10b981 0%, #10b981 ${formData.batteryCondition}%, #e5e7eb ${formData.batteryCondition}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Weak</span>
                <span>Moderate</span>
                <span>Strong</span>
              </div>
            </div>

            {/* Interior Condition */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">Interior Condition</label>
                <span className="text-lg font-bold text-gray-900">{formData.interiorCondition}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={formData.interiorCondition}
                onChange={(e) => setFormData({ ...formData, interiorCondition: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #f59e0b 0%, #f59e0b ${formData.interiorCondition}%, #e5e7eb ${formData.interiorCondition}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Worn</span>
                <span>Good</span>
                <span>Pristine</span>
              </div>
            </div>

            {/* Exterior Condition */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-gray-700">Exterior Condition</label>
                <span className="text-lg font-bold text-gray-900">{formData.exteriorCondition}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={formData.exteriorCondition}
                onChange={(e) => setFormData({ ...formData, exteriorCondition: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #06b6d4 0%, #06b6d4 ${formData.exteriorCondition}%, #e5e7eb ${formData.exteriorCondition}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>Damaged</span>
                <span>Average</span>
                <span>Flawless</span>
              </div>
            </div>
          </div>

          {/* Base Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Base Price (Rs.)
            </label>
            <input
              type="number"
              value={formData.basePrice}
              onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., 2500000"
            />
            {errors.basePrice && <p className="mt-1 text-sm text-red-600">{errors.basePrice}</p>}
            
            {/* System Suggested Starting Bid - shown after price is entered */}
            {formData.basePrice && parseFloat(formData.basePrice) > 0 && (
              <div className="mt-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-semibold text-green-900 mb-1">
                      🤖 System-Suggested Starting Bid Price
                    </h4>
                    <p className="text-2xl font-bold text-green-700 mb-2">
                      Rs. {(parseFloat(formData.basePrice) * 0.85).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </p>
                    <p className="text-xs text-green-800 leading-relaxed">
                      Our AI-powered pricing engine analyzed your vehicle details, market conditions, and comparable listings. 
                      This starting bid is <span className="font-semibold">15% lower than your base price</span>, giving buyers an attractive entry point 
                      while ensuring competitive bidding that can reach or exceed your base price.
                    </p>
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <div className="flex items-center justify-between text-xs text-green-700">
                        <span>📊 Market Analysis: Complete</span>
                        <span>✅ Price Optimized</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Price Negotiation */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="negotiable"
                checked={formData.negotiable}
                onChange={(e) => setFormData({ ...formData, negotiable: e.target.checked })}
                className="mt-1 h-5 w-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex-1">
                <label htmlFor="negotiable" className="block text-sm font-semibold text-gray-900 cursor-pointer">
                  Enable Price Negotiation
                </label>
                <p className="text-sm text-gray-700 mt-2 leading-relaxed">
                  💡 <span className="font-medium">Flexible pricing option:</span> Allow buyers to negotiate directly with you for potential deals outside the bidding system. This can attract more serious buyers.
                </p>
              </div>
            </div>
          </div>

          {/* Image Upload with Drag & Drop */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vehicle Images (Maximum 5)
            </label>
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="image-upload"
                multiple
                accept="image/*"
                onChange={(e) => handleImageChange(e.target.files)}
                className="hidden"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer"
              >
                <div className="text-gray-600">
                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-3" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <p className="text-sm font-medium">
                    <span className="text-indigo-600 hover:text-indigo-500">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF up to 10MB (Max 5 images)</p>
                </div>
              </label>
            </div>
            
            {/* Image Previews */}
            {imagePreviews.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    >
                      ×
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded">
                        Main
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {errors.images && <p className="mt-2 text-sm text-red-600">{errors.images}</p>}
            <p className="mt-2 text-xs text-gray-500">
              {images.length} / 5 images uploaded. First image will be used as main display.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50"
            >
              {submitting ? 'Posting...' : 'Post Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}