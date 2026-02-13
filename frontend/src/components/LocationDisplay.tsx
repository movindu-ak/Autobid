interface LocationDisplayProps {
  address: string;
  lat?: number;
  lng?: number;
}

const LocationDisplay = ({ address, lat, lng }: LocationDisplayProps) => {
  const hasCoordinates = lat !== undefined && lng !== undefined && lat !== 0 && lng !== 0;

  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      <div className="flex items-start gap-3 mb-3">
        <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Location</h3>
          <p className="text-gray-900 font-medium">{address}</p>
          {hasCoordinates && (
            <p className="text-xs text-gray-500 mt-1">
              Coordinates: {lat.toFixed(6)}, {lng.toFixed(6)}
            </p>
          )}
        </div>
      </div>

      {hasCoordinates && (
        <div className="mt-3">
          <div className="relative w-full h-64 bg-gray-200 rounded-lg overflow-hidden border border-gray-300">
            {/* Embedded OpenStreetMap */}
            <iframe
              width="100%"
              height="100%"
              frameBorder="0"
              scrolling="no"
              marginHeight={0}
              marginWidth={0}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01},${lat - 0.01},${lng + 0.01},${lat + 0.01}&layer=mapnik&marker=${lat},${lng}`}
              style={{ border: 0 }}
              title="Location Map"
            />
          </div>
          <div className="mt-2 text-center">
            <a
              href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=15/${lat}/${lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-700 hover:underline inline-flex items-center gap-1"
            >
              View larger map
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationDisplay;
