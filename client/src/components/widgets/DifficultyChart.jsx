import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import ErrorState from '../ErrorState';
import EmptyState from '../EmptyState';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-cp-card border border-cp-border rounded-lg px-3 py-2 shadow-lg">
        <p className="text-cp-text text-sm font-medium">
          {payload[0].name}: {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

function Donut({ title, titleColor, chartData }) {
  const total = chartData.reduce((sum, d) => sum + d.value, 0);
  if (total === 0) return null;

  return (
    <div className="flex flex-col items-center">
      <p className={`text-sm font-semibold mb-2 ${titleColor}`}>{title}</p>
      <div className="relative">
        <ResponsiveContainer width={200} height={200}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-2xl font-heading font-bold text-cp-text">{total}</p>
            <p className="text-[10px] text-cp-muted">Solved</p>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-2">
        {chartData.map((item) => (
          <div key={item.name} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-xs text-cp-muted">{item.name} ({item.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DifficultyChart({ data, loading, error, onRetry }) {
  if (loading) {
    return (
      <div className="bg-cp-card rounded-xl p-4 md:p-6">
        <div className="skeleton h-5 w-36 mb-4" />
        <div className="flex justify-center gap-8">
          <div className="skeleton h-[200px] w-[200px] rounded-full" />
          <div className="skeleton h-[200px] w-[200px] rounded-full hidden md:block" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-cp-card rounded-xl p-4 md:p-6">
        <h3 className="text-lg font-heading font-semibold text-cp-text mb-2">
          Problem Difficulty
        </h3>
        <ErrorState message={error} onRetry={onRetry} />
      </div>
    );
  }

  const hasCF = data?.cf && data.cf.some((d) => d.value > 0);
  const hasLC = data?.lc && data.lc.some((d) => d.value > 0);

  if (!hasCF && !hasLC) {
    return (
      <div className="bg-cp-card rounded-xl p-4 md:p-6">
        <h3 className="text-lg font-heading font-semibold text-cp-text mb-4">
          Problem Difficulty
        </h3>
        <EmptyState message="Add your platform handles to see difficulty breakdown" />
      </div>
    );
  }

  return (
    <div className="bg-cp-card rounded-xl p-4 md:p-6">
      <h3 className="text-lg font-heading font-semibold text-cp-text mb-4">
        Problem Difficulty
      </h3>
      <div className={`flex flex-col md:flex-row items-center justify-center ${hasCF && hasLC ? 'gap-8 md:gap-12' : ''}`}>
        {hasCF && <Donut title="Codeforces" titleColor="text-blue-400" chartData={data.cf} />}
        {hasLC && <Donut title="LeetCode" titleColor="text-yellow-400" chartData={data.lc} />}
      </div>
    </div>
  );
}
