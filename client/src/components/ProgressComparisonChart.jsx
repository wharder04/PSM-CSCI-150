import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const projectProgress = payload.find(p => p.dataKey === 'projectProgress')?.value || 0;
    const personalProgress = payload.find(p => p.dataKey === 'personalProgress')?.value || 0;

    return (
      <div 
        className="p-3 rounded-lg shadow-lg border border-[#2a2a35] z-50"
        style={{ backgroundColor: '#1A202C' }}
      >
        <p className="text-[#E2E8F0] text-sm font-semibold mb-2">{label}</p>
        <p className="text-sm font-medium mb-1" style={{ color: '#B0BCCB' }}>
          Project: {projectProgress}%
        </p>
        <p className="text-sm font-medium" style={{ color: '#3182CE' }}>
          Personal: {personalProgress}%
        </p>
      </div>
    );
  }
  return null;
};

const ProgressComparisonChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-full w-full flex items-center justify-center text-text-secondary">
        <p>No project data available.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-[300px]" style={{ backgroundColor: 'transparent' }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
          barGap={8}
        >
          {/* Subtle horizontal grid lines only */}
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2D3748" />
          
          {/* X Axis: Project names perfectly centered under the group */}
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#E2E8F0', fontSize: 13 }} 
            axisLine={{ stroke: '#4A5568' }}
            tickLine={false}
          />
          
          {/* Y Axis: Range strictly 0% to 100% ensuring a grounded baseline */}
          <YAxis 
            tick={{ fill: '#E2E8F0', fontSize: 12 }} 
            domain={[0, 100]} 
            axisLine={{ stroke: '#4A5568' }}
            tickLine={false}
            tickFormatter={(value) => `${value}%`}
          />
          
          {/* Custom Dark Theme Tooltip */}
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }} 
          />
          
          {/* Legend aligned completely with colors/names mapping */}
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle"
            wrapperStyle={{ paddingTop: '20px' }}
          />

          {/* Bar 1: Project Overall Progress */}
          <Bar 
            name="Project Overall Progress" 
            dataKey="projectProgress" 
            fill="#B0BCCB" 
            radius={[4, 4, 0, 0]} 
            maxBarSize={50}
          />

          {/* Bar 2: My Personal Task Progress */}
          <Bar 
            name="My Personal Task Progress" 
            dataKey="personalProgress" 
            fill="#3182CE" 
            radius={[4, 4, 0, 0]} 
            maxBarSize={50}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ProgressComparisonChart;
