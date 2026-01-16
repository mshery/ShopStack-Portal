import React, { useMemo } from "react";

interface SalesBreakdownItem {
  label: string;
  value: number;
  color: string;
}

interface SalesDonutChartProps {
  data: SalesBreakdownItem[];
  title?: string;
  centerLabel?: string;
  centerValue?: string;
}

const SalesDonutChart: React.FC<SalesDonutChartProps> = ({
  data,
  title = "Sales Breakdown",
  centerLabel = "Total",
  centerValue,
}) => {
  const total = useMemo(
    () => data.reduce((sum, item) => sum + item.value, 0),
    [data],
  );

  const formattedTotal = centerValue || `$${total.toLocaleString()}`;

  // Generate path for each segment
  const segments = useMemo(() => {
    let accumulatedPercentage = 0;
    const radius = 80;
    const circumference = 2 * Math.PI * radius;

    return data.map((item, index) => {
      const percentage = total > 0 ? (item.value / total) * 100 : 0;
      const dashLength = (percentage / 100) * circumference;
      const rotation = (accumulatedPercentage / 100) * 360 - 90;

      // eslint-disable-next-line react-hooks/immutability
      accumulatedPercentage += percentage;

      return {
        ...item,
        percentage,
        dashArray: `${dashLength} ${circumference}`,
        rotation,
        key: `segment-${index}`,
      };
    });
  }, [data, total]);

  if (!data?.length) {
    return (
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03]">
        <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
          {title}
        </h3>
        <div className="py-12 text-center text-gray-500 dark:text-gray-400">
          No data available
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-white/[0.03] h-full">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {title}
        </h3>
        <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
          </svg>
        </button>
      </div>

      <div className="flex flex-col items-center">
        {/* Donut Chart SVG */}
        <div className="relative">
          <svg
            width="200"
            height="200"
            viewBox="0 0 200 200"
            className="transform -rotate-0"
          >
            {/* Background circle */}
            <circle
              cx="100"
              cy="100"
              r="80"
              fill="none"
              stroke="currentColor"
              strokeWidth="24"
              className="text-gray-100 dark:text-gray-800"
            />

            {/* Segments */}
            {segments.map((segment) => (
              <circle
                key={segment.key}
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke={segment.color}
                strokeWidth="24"
                strokeDasharray={segment.dashArray}
                strokeLinecap="round"
                className="transition-all duration-500 ease-out"
                style={{
                  transform: `rotate(${segment.rotation}deg)`,
                  transformOrigin: "center",
                }}
              />
            ))}
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {centerLabel}
            </span>
            <span className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {formattedTotal}
            </span>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 w-full space-y-3">
          {data.map((item, index) => {
            const percentage =
              total > 0 ? ((item.value / total) * 100).toFixed(1) : 0;
            return (
              <div
                key={`legend-${index}`}
                className="flex items-center justify-between group cursor-default"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full shrink-0 transition-transform group-hover:scale-125"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    {item.label}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">
                    ${item.value.toLocaleString()}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-500 w-12 text-right">
                    {percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default SalesDonutChart;
