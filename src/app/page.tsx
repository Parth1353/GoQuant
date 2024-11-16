import OrderBook from '@/components/orderbook/Orderbook';

export default function Home() {
  return (
    <main className="min-h-screen p-2 bg-[#0a0b0d]">
      <div className="w-full max-w-[98%] mx-auto">
        <h1 className="text-4xl font-bold text-[#00c087] mb-8 text-center">
          Crypto Orderbook Analytics
        </h1>
        <OrderBook />
        <footer className="text-center text-gray-500 text-sm py-4 mt-8">
          © {new Date().getFullYear()} Crypto Orderbook Analytics. All rights reserved.
        </footer>
      </div>
    </main>
  );
}