import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface DeliveryTimerProps {
  estimatedMinutes: number;
}

const DeliveryTimer: React.FC<DeliveryTimerProps> = ({ estimatedMinutes }) => {
  const [minutes, setMinutes] = useState(estimatedMinutes);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      if (seconds > 0) {
        setSeconds(seconds - 1);
      }
      if (seconds === 0) {
        if (minutes === 0) {
          clearInterval(timer);
        } else {
          setMinutes(minutes - 1);
          setSeconds(59);
        }
      }
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [minutes, seconds]);

  const formatTime = (time: number) => {
    return time < 10 ? `0${time}` : time;
  };

  return (
    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
      <div className="flex items-center mb-2">
        <Clock className="text-green-600 mr-2" size={20} />
        <h3 className="font-semibold text-green-800">Delivery Timer</h3>
      </div>
      
      <div className="flex items-center justify-center">
        <div className="text-2xl font-bold text-green-600">
          {formatTime(minutes)}:{formatTime(seconds)}
        </div>
      </div>
      
      <p className="text-sm text-green-700 mt-2 text-center">
        Your order will arrive in approximately {minutes} minutes
      </p>
    </div>
  );
};

export default DeliveryTimer;