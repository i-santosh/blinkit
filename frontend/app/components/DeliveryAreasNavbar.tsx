import React, { useState, useEffect } from 'react';
import { MapPin } from 'lucide-react';
import { deliveryAreasAPI } from '~/lib/api';

interface DeliveryArea {
  id: number;
  city: string;
  state: string;
  pin_code: string;
}

export function DeliveryAreasNavbar() {
  const [activeAreas, setActiveAreas] = useState<DeliveryArea[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedArea, setSelectedArea] = useState<DeliveryArea | null>(null);

  useEffect(() => {
    const fetchActiveAreas = async () => {
      try {
        setIsLoading(true);
        const response = await deliveryAreasAPI.getActiveAreas();
        
        if (response.success) {
          setActiveAreas(response.data);
          // Optionally set a default area
          if (response.data.length > 0) {
            setSelectedArea(response.data[0]);
          }
        } else {
          setError(response.message || 'Failed to fetch delivery areas');
        }
      } catch (err) {
        console.error('Error fetching delivery areas:', err);
        setError('An unexpected error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    fetchActiveAreas();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-gray-600">
        <MapPin size={18} />
        <span>Loading delivery areas...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center space-x-2 text-red-600">
        <MapPin size={18} />
        <span>{error}</span>
      </div>
    );
  }

  if (activeAreas.length === 0) {
    return (
      <div className="flex items-center space-x-2 text-gray-600">
        <MapPin size={18} />
        <span>No delivery areas available</span>
      </div>
    );
  }

  return (
    <div className="relative group">
      <div className="flex items-center space-x-2 cursor-pointer">
        <MapPin size={18} className="text-primary" />
        <span className="text-sm font-medium">
          {selectedArea ? `${selectedArea.city}, ${selectedArea.state}` : 'Select Delivery Area'}
        </span>
      </div>
      
      {/* Dropdown for delivery areas */}
      <div className="absolute z-50 hidden group-hover:block bg-white shadow-lg rounded-md border border-gray-200 mt-2 w-64">
        <div className="py-2">
          <h3 className="px-4 py-2 text-xs font-bold text-gray-500 uppercase">
            Available Delivery Areas
          </h3>
          {activeAreas.map((area) => (
            <div 
              key={area.id}
              className={`px-4 py-2 hover:bg-gray-100 cursor-pointer ${
                selectedArea?.id === area.id ? 'bg-primary/10 text-primary' : ''
              }`}
              onClick={() => setSelectedArea(area)}
            >
              <div className="flex justify-between items-center">
                <span className="font-medium">{area.city}, {area.state}</span>
                <span className="text-xs text-gray-500">{area.pin_code}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 