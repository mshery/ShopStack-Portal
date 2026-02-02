import React, { useMemo } from "react";

interface MonthlySalesData {
  month: string;
  revenue: number;
}

interface MonthlySalesChartProps {
  data: MonthlySalesData[];
}

const MonthlySalesChart: React.FC<MonthlySalesChartProps> = ({ data }) => {
  const monthlyData = useMemo(() => {
    // If no data, return empty default
    if (!data || data.length === 0) {
      return { months: [], maxTotal: 1 };
    }

    // Sort is not needed if backend returns in order, but verify.
    // Backend returns last 6 months in reverse order (loop 5 to 0), so it pushes Jan, then Feb...
    // Actually loop was: for (let i = 5; i >= 0; i--). i=5 is 5 months ago. i=0 is current month.
    // So it pushes oldest first. Order is correct.

    const maxTotal = Math.max(...data.map((d) => d.revenue), 1);

    return {
      months: data.map((d) => ({
        month: d.month,
        total: d.revenue,
        heightPercent: (d.revenue / maxTotal) * 100,
      })),
      maxTotal,
    };
  }, [data]);

  // Calculate nice round numbers for Y-axis
  const yAxisLabels = useMemo(() => {
    const max = monthlyData.maxTotal;
    const step = Math.ceil(max / 4 / 100) * 100; // Round to nearest 100
    return [step * 4, step * 3, step * 2, step, 0];
  }, [monthlyData.maxTotal]);

  if (monthlyData.months.length === 0) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] h-full">
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          Monthly Sales
        </h3>
        <div className="py-12 text-center text-gray-500 dark:text-gray-400">
          No sales data available
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] h-full">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Monthly Sales
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Revenue over the last 6 months
          </p>
        </div>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      {/* Chart Container */}
      <div className="relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 flex h-[240px] flex-col justify-between text-xs font-medium text-gray-400 dark:text-gray-500 pr-3">
          {yAxisLabels.map((label, i) => (
            <span key={i} className="tabular-nums">
              {label >= 1000 ? `${(label / 1000).toFixed(0)}k` : label}
            </span>
          ))}
        </div>

        {/* Chart area */}
        <div className="ml-10 pl-4">
          {/* Grid lines */}
          <div className="absolute left-14 right-0 top-0 h-[240px] flex flex-col justify-between pointer-events-none">
            {yAxisLabels.map((_, i) => (
              <div
                key={i}
                className="w-full h-px bg-gray-100 dark:bg-gray-800"
              />
            ))}
          </div>

          {/* Bars container */}
          <div className="relative flex h-[240px] items-end justify-between gap-4">
            {monthlyData.months.map((data, index) => (
              <div
                key={index}
                className="group relative flex flex-1 flex-col items-center h-full"
              >
                {/* Bar */}
                <div className="relative w-full h-full flex items-end justify-center">
                  <div
                    className="w-full max-w-14 rounded-xl bg-gradient-to-t from-brand-600 to-brand-400 
                                            transition-all duration-500 ease-out cursor-pointer 
                                            shadow-[0_4px_12px_rgba(70,95,255,0.25)]
                                            hover:shadow-[0_8px_20px_rgba(70,95,255,0.35)] hover:scale-[1.02]
                                            dark:from-brand-500 dark:to-brand-400"
                    style={{
                      height: `${Math.max(data.heightPercent, 8)}%`,
                      animationDelay: `${index * 100}ms`,
                    }}
                  >
                    {/* Shine effect */}
                    <div className="absolute inset-0 rounded-xl overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    </div>

                    {/* Tooltip on hover */}
                    <div className="absolute -top-14 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-10 scale-95 group-hover:scale-100">
                      <div className="bg-gray-900 dark:bg-gray-700 text-white text-xs font-semibold rounded-lg px-3 py-2 shadow-xl whitespace-nowrap">
                        ${data.total.toLocaleString()}
                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full">
                          <div className="border-[6px] border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Month label */}
                <div className="mt-4 text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {data.month}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlySalesChart;
