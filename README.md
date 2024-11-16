```markdown
# Crypto Orderbook Analytics

Crypto Orderbook Analytics is a web application that provides real-time analytics for cryptocurrency trading pairs. It utilizes WebSocket connections to fetch order book data and displays various metrics including spreads and market depth.

## Features

- **Real-time Order Book**: View live bids and asks for various cryptocurrency pairs.
- **Spread History**: Analyze the historical spread between the highest bid and lowest ask prices.
- **Orderbook Imbalance**: Monitor the imbalance between buy and sell orders over time.
- **Responsive Design**: Works seamlessly on both desktop and mobile devices.

## Technologies Used

- **React**: Frontend library for building user interfaces.
- **Next.js**: Framework for server-rendered React applications.
- **Tailwind CSS**: Utility-first CSS framework for styling.
- **Recharts**: Charting library for rendering charts and graphs.
- **WebSocket**: For real-time data streaming.

## Installation

To get started with the project, follow these steps:

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Parth1353/crypto-orderbook-analytics.git
   cd crypto-orderbook-analytics
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser and navigate to**:
   ```
   http://localhost:3000
   ```

## Usage

1. Select a trading pair from the buttons at the top of the **Order Book** section.
2. Monitor the live updates of bids and asks.
3. Observe the spread and imbalance metrics displayed in the respective charts.

## Folder Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout for the application
│   └── page.tsx            # Main application page
├── components/
│   ├── orderbook/          # Orderbook related components
│   │   ├── LoadingCandles.tsx # Loading animation component
│   │   └── Orderbook.tsx   # Main Orderbook component
│   └── ui/                 # UI components like Card
├── lib/
│   └── utils.ts            # Utility functions
├── styles/                 # Global styles
└── tailwind.config.ts      # Tailwind CSS configuration
```

## Contributing

Contributions are welcome! If you have suggestions for improvements or features, feel free to open an issue or submit a pull request.

## License

This project is licensed under the MIT License. See the `LICENSE` file for more details.
```

You can copy and paste this into your README file. Let me know if you need any further modifications!
