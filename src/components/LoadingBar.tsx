import { useEffect, useState } from 'react';
import { TEXTS } from '../constants/texts';

interface LoadingBarProps {
  message?: string;
}

export function LoadingBar({ message }: LoadingBarProps) {
  const [progress, setProgress] = useState(0);
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  // Progress bar animation (0-90%, smooth increment)
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) return 90; // Stop at 90%, will complete when loading finishes
        return Math.min(prev + Math.random() * 10, 90);
      });
    }, 200);

    return () => clearInterval(interval);
  }, []);

  // Message rotation (every 1.5s)
  useEffect(() => {
    if (message) return; // Don't rotate if custom message provided

    const interval = setInterval(() => {
      setCurrentMessageIndex((prev) => 
        (prev + 1) % TEXTS.loading.messages.length
      );
    }, 1500);

    return () => clearInterval(interval);
  }, [message]);

  const displayMessage = message || TEXTS.loading.messages[currentMessageIndex];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4">
        {/* Loading message with fade animation */}
        <div className="mb-6 text-center">
          <p 
            key={currentMessageIndex}
            className="text-gray-700 text-lg font-medium animate-fade-in"
          >
            {displayMessage}
          </p>
        </div>

        {/* Progress bar */}
        <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-200 ease-out"
            style={{ width: `${progress}%` }}
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine" />
          </div>
        </div>

        {/* Progress percentage */}
        <div className="mt-3 text-center">
          <span className="text-sm text-gray-500 font-mono">
            {Math.round(progress)}%
          </span>
        </div>
      </div>
    </div>
  );
}
