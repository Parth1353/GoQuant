import React from 'react';

const LoadingCandles = () => {
  return (
    <div className="flex items-center justify-center gap-1 h-full">
      <div className="w-2 bg-[var(--bid-text)] animate-candleUp"></div>
      <div className="w-2 bg-[var(--ask-text)] animate-candleDown"></div>
      <div className="w-2 bg-[var(--bid-text)] animate-candleUp delay-100"></div>
      <div className="w-2 bg-[var(--ask-text)] animate-candleDown delay-100"></div>
      <div className="w-2 bg-[var(--bid-text)] animate-candleUp delay-200"></div>
    </div>
  );
};

export default LoadingCandles;