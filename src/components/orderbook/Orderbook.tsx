"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowUpDown, TrendingUp, BarChart3, ArrowUp, ArrowDown } from 'lucide-react';
import LoadingCandles from './LoadingCandles';

const TRADING_PAIRS = [
  { symbol: 'BTC/USDT', wsSymbol: 'btcusdt' },
  { symbol: 'ETH/USDT', wsSymbol: 'ethusdt' },
  { symbol: 'SOL/USDT', wsSymbol: 'solusdt' },
  { symbol: 'DOGE/USDT', wsSymbol: 'dogeusdt' }
];

interface SpreadData {
  time: string;
  spread: number;
}

interface OrderData {
  price: string;
  amount: string;
  total: number;
}

interface ImbalanceData {
  time: string;
  imbalance: number;
}

const OrderBook = () => {
  const [selectedPair, setSelectedPair] = useState(TRADING_PAIRS[0]);
  const [orderbook, setOrderbook] = useState<{ bids: OrderData[], asks: OrderData[] }>({ bids: [], asks: [] });
  const [spreadHistory, setSpreadHistory] = useState<SpreadData[]>([]);
  const [imbalanceHistory, setImbalanceHistory] = useState<ImbalanceData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [ws, setWs] = useState<WebSocket | null>(null);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [currentSymbol, setCurrentSymbol] = useState(TRADING_PAIRS[0].wsSymbol);

  const handlePairChange = async (pair: typeof TRADING_PAIRS[0]) => {
    setIsLoading(true);
    

    setOrderbook({ bids: [], asks: [] });
    setSpreadHistory([]);
    setImbalanceHistory([]);
    
 
    if (ws) {
      ws.onclose = null; 
      ws.close();
      setWs(null);
    }
    
   
    setSelectedPair(pair);
    setCurrentSymbol(pair.wsSymbol);
  };

  useEffect(() => {
    if (!selectedPair) return;
    let isCurrentConnection = true;

    const connectWebSocket = () => {
      if (!isCurrentConnection) return;

      try {
        const wsConnection = new WebSocket(`wss://stream.binance.com:9443/ws/${selectedPair.wsSymbol}@depth20@1000ms`);
        
        wsConnection.onopen = () => {
          if (!isCurrentConnection) {
            wsConnection.close();
            return;
          }
          console.log('WebSocket connected for', selectedPair.symbol);
          setIsLoading(false);
        };

        wsConnection.onmessage = (event) => {
          if (!isCurrentConnection) return;
          
          try {
            const data = JSON.parse(event.data);
            
         
            const formattedData = {
              bids: data.bids.map((bid: [string, string]) => ({
                price: parseFloat(bid[0]).toFixed(2),
                amount: parseFloat(bid[1]).toFixed(4),
                total: 0
              })),
              asks: data.asks.map((ask: [string, string]) => ({
                price: parseFloat(ask[0]).toFixed(2),
                amount: parseFloat(ask[1]).toFixed(4),
                total: 0
              }))
            };

           
            formattedData.bids.reduce((acc: number, bid: { amount: string; total: number }) => {
              bid.total = (acc + parseFloat(bid.amount));
              return bid.total;
            }, 0);
            
            formattedData.asks.reduce((acc: number, ask: { amount: string; total: number }) => {
              ask.total = (acc + parseFloat(ask.amount));
              return ask.total;
            }, 0);

            setOrderbook(formattedData);


            if (formattedData.asks[0] && formattedData.bids[0]) {
              const askPrice = parseFloat(formattedData.asks[0].price);
              const bidPrice = parseFloat(formattedData.bids[0].price);
              const spread = askPrice - bidPrice;
              const spreadPercentage = (spread / askPrice) * 100;

              setSpreadHistory(prev => {
                const newHistory = [...prev, {
                  time: new Date().toLocaleTimeString(),
                  spread: spreadPercentage
                }];
                if (newHistory.length > 30) {
                  return newHistory.slice(-30);
                }
                return newHistory;
              });
            }

     
            const bidTotal = formattedData.bids.reduce((acc: number, bid: { amount: string }) => acc + parseFloat(bid.amount), 0);
            const askTotal = formattedData.asks.reduce((acc: number, ask: { amount: string }) => acc + parseFloat(ask.amount), 0);
            const imbalance = (bidTotal - askTotal) / (bidTotal + askTotal);
            setImbalanceHistory(prev => {
              const newHistory = [...prev, {
                time: new Date().toISOString(),
                imbalance: parseFloat(imbalance.toFixed(4))
              }];
              return newHistory.slice(-100);
            });
          } catch (error) {
            console.warn('Error processing message:', error);
          }
        };

        wsConnection.onerror = () => {
          if (!isCurrentConnection) return;
          console.warn('WebSocket error');
        };

        wsConnection.onclose = () => {
          if (!isCurrentConnection) return;
          console.log('WebSocket closed');
        };

        setWs(wsConnection);
      } catch (error) {
        if (!isCurrentConnection) return;
        console.warn('Error creating WebSocket connection:', error);
        setIsLoading(false);
      }
    };

    connectWebSocket();

    return () => {
      isCurrentConnection = false;
      if (ws) {
        ws.onclose = null;
        ws.close();
        setWs(null);
      }
    };
  }, [selectedPair]);

  const scrollToBottom = () => {
    window.scrollTo({
      top: document.documentElement.scrollHeight,
      behavior: 'smooth'
    });
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  useEffect(() => {
    const handleScroll = () => {
      const bottom = Math.ceil(window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight;
      setIsAtBottom(bottom);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="w-full mx-auto space-y-4">
  
      <div className="flex flex-wrap justify-start items-center mb-4 px-2 gap-2">
        {TRADING_PAIRS.map((pair) => (
          <button
            key={pair.symbol}
            onClick={() => handlePairChange(pair)}
            disabled={isLoading}
            className={`px-2 sm:px-3 py-1.5 rounded-lg transition-colors text-sm sm:text-base ${
              selectedPair.symbol === pair.symbol
                ? 'bg-[var(--bid-text)] text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {pair.symbol}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
   
        <div className="lg:col-span-5 bg-[var(--background-dark)] rounded-lg p-2 sm:p-4">
          <div className="mb-2 sm:mb-4 flex justify-between items-center">
            <h2 className="text-lg sm:text-2xl font-semibold text-[#00c087]">Order Book</h2>
            <span className="text-xs sm:text-sm text-gray-400">
              Spread: {orderbook.asks[0] && orderbook.bids[0] 
                ? (parseFloat(orderbook.asks[0].price) - parseFloat(orderbook.bids[0].price)).toFixed(2)
                : '-'}
            </span>
          </div>
          
          {isLoading ? (
            <div className="h-[400px]">
              <LoadingCandles />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-2 sm:gap-4 text-[11px] sm:text-sm">
              <div>
                <div className="grid grid-cols-3 text-gray-400 mb-1 sm:mb-2">
                  <span>PRICE</span>
                  <span>SIZE</span>
                  <span>TOTAL</span>
                </div>
                <div className="space-y-0.5 sm:space-y-1">
                  {orderbook.bids.map((bid, i) => (
                    <div 
                      key={i} 
                      className="grid grid-cols-3 hover:bg-[var(--row-hover)] relative"
                      style={{
                        background: `linear-gradient(to left, var(--depth-bid) ${(bid.total / orderbook.bids[orderbook.bids.length-1].total) * 100}%, transparent 0%)`
                      }}
                    >
                      <span className="text-[var(--bid-text)] relative z-10 pr-1">{bid.price}</span>
                      <span className="text-gray-300 relative z-10 pr-1">{bid.amount}</span>
                      <span className="text-gray-300 relative z-10">{bid.total.toFixed(4)}</span>
                    </div>
                  ))}
                </div>
              </div>
              
   
              <div>
                <div className="grid grid-cols-3 text-gray-400 mb-1 sm:mb-2">
                  <span>PRICE</span>
                  <span>SIZE</span>
                  <span>TOTAL</span>
                </div>
                <div className="space-y-0.5 sm:space-y-1">
                  {orderbook.asks.map((ask, i) => (
                    <div 
                      key={i} 
                      className="grid grid-cols-3 hover:bg-[var(--row-hover)] relative"
                      style={{
                        background: `linear-gradient(to right, var(--depth-ask) ${(ask.total / orderbook.asks[orderbook.asks.length-1].total) * 100}%, transparent 0%)`
                      }}
                    >
                      <span className="text-[var(--ask-text)] relative z-10 pr-1">{ask.price}</span>
                      <span className="text-gray-300 relative z-10 pr-1">{ask.amount}</span>
                      <span className="text-gray-300 relative z-10">{ask.total.toFixed(4)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>


        <div className="lg:col-span-7 grid grid-cols-1 gap-4">
          <div className="bg-[#13171f] rounded-lg p-4">
            <h3 className="text-xl font-semibold text-[#00c087] mb-3">Spread History</h3>
            <div className="h-[250px] sm:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={spreadHistory}>
                  <XAxis 
                    dataKey="time" 
                    tick={{ fill: '#9ca3af' }}
                    interval="preserveEnd"
                    tickFormatter={(value) => value.split(':')[2]}
                  />
                  <YAxis 
                    stroke="#9ca3af"
                    tickFormatter={(value) => `${value.toFixed(4)}%`}
                    domain={['auto', 'auto']}
                    padding={{ top: 20, bottom: 20 }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#1f2937', 
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px'
                    }}
                    labelStyle={{ color: '#9ca3af' }}
                    itemStyle={{ color: '#9ca3af' }}
                    formatter={(value: number) => [`${value.toFixed(4)}%`, 'Spread']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="spread" 
                    stroke="#8884d8" 
                    dot={false}
                    strokeWidth={2}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#13171f] rounded-lg p-4">
            <h3 className="text-xl font-semibold text-[#00c087] mb-3">Orderbook Imbalance</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={imbalanceHistory}>
                  <XAxis dataKey="time" hide />
                  <YAxis 
                    domain={[-1, 1]} 
                    ticks={[-1, -0.5, 0, 0.5, 1]}
                    stroke="#9ca3af"
                    tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#1f2937', 
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px'
                    }}
                    labelStyle={{ color: '#9ca3af' }}
                    itemStyle={{ color: '#9ca3af' }}
                    formatter={(value: number) => [`${(value * 100).toFixed(2)}%`, 'Imbalance']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="imbalance" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#13171f] rounded-lg p-4">
            <h3 className="text-xl font-semibold text-[#00c087] mb-3">Market Depth</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart>
                  <XAxis stroke="#9ca3af" />
                  <YAxis stroke="#9ca3af" />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#1f2937', 
                      border: 'none',
                      borderRadius: '8px',
                      padding: '8px'
                    }}
                    labelStyle={{ color: '#9ca3af' }}
                    itemStyle={{ color: '#9ca3af' }}
                  />
                  <Line 
                    data={orderbook.bids} 
                    type="monotone" 
                    dataKey="total" 
                    stroke="var(--bid-text)" 
                    dot={false}
                    strokeWidth={2}
                  />
                  <Line 
                    data={orderbook.asks} 
                    type="monotone" 
                    dataKey="total" 
                    stroke="var(--ask-text)" 
                    dot={false}
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

     
      <button
        onClick={isAtBottom ? scrollToTop : scrollToBottom}
        className="fixed bottom-6 left-6 p-3 bg-[var(--background-dark)] rounded-full shadow-lg hover:bg-[var(--row-hover)] transition-colors duration-200"
        aria-label={isAtBottom ? "Scroll to top" : "Scroll to bottom"}
      >
        {isAtBottom ? (
          <ArrowUp className="w-5 h-5 text-gray-300" />
        ) : (
          <ArrowDown className="w-5 h-5 text-gray-300" />
        )}
      </button>
    </div>
  );
};

export default OrderBook;