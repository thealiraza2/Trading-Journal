import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Trade } from '../../types';
import { format } from 'date-fns';

interface PerformanceChartProps {
  trades: Trade[];
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ trades }) => {
  const chartData = trades
    .filter(trade => trade.status === 'closed' && trade.pnl !== undefined)
    .sort((a, b) => new Date(a.exitDate!).getTime() - new Date(b.exitDate!).getTime())
    .reduce((acc, trade, index) => {
      const previousPnL = index === 0 ? 0 : acc[acc.length - 1].cumulativePnL;
      const cumulativePnL = previousPnL + trade.pnl!;
      
      acc.push({
        date: format(new Date(trade.exitDate!), 'MMM dd'),
        pnl: trade.pnl!,
        cumulativePnL,
        symbol: trade.symbol
      });
      
      return acc;
    }, [] as any[]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  if (chartData.length === 0) {
    return (
      <div className="h-48 sm:h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
        <div className="text-center">
          <p className="text-sm sm:text-base">No closed trades to display</p>
          <p className="text-xs sm:text-sm mt-1">Complete some trades to see your performance chart</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-48 sm:h-64">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-200 dark:text-gray-700" />
          <XAxis 
            dataKey="date" 
            stroke="currentColor"
            className="text-gray-600 dark:text-gray-400"
            tick={{ fontSize: 10 }}
            interval="preserveStartEnd"
          />
          <YAxis 
            stroke="currentColor"
            className="text-gray-600 dark:text-gray-400"
            tick={{ fontSize: 10 }}
            tickFormatter={formatCurrency}
            width={60}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--tooltip-bg, #ffffff)',
              color: 'var(--tooltip-color, #374151)',
              border: '1px solid var(--tooltip-border, #e5e7eb)',
              borderRadius: '6px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              fontSize: '12px'
            }}
            className="dark:bg-gray-800 dark:text-white dark:border-gray-600"
            formatter={(value: number, name: string) => [
              formatCurrency(value),
              name === 'cumulativePnL' ? 'Cumulative P&L' : 'Trade P&L'
            ]}
            labelFormatter={(label) => `Date: ${label}`}
          />
          <Line
            type="monotone"
            dataKey="cumulativePnL"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ fill: '#2563eb', strokeWidth: 2, r: 3 }}
            activeDot={{ r: 5, stroke: '#2563eb', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PerformanceChart;