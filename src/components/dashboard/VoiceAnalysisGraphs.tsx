import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer,
  ReferenceDot,
  Tooltip
} from 'recharts';

interface VoiceAnalysisGraphsProps {
  pitchData: Array<{ time: string; value: number }>;
  energyData: Array<{ time: string; value: number }>;
  speakingRateData: Array<{ time: string; value: number }>;
  emotion: string;
}

const VoiceAnalysisGraphs: React.FC<VoiceAnalysisGraphsProps> = ({ 
  pitchData,
  energyData,
  speakingRateData,
  emotion
}) => {
  // Smooth the data to prevent "dancing snake" effect
  const smoothData = (data: Array<{ time: string; value: number }>) => {
    if (data.length < 3) return data;
    
    return data.map((point, index) => {
      if (index === 0 || index === data.length - 1) return point;
      
      const prev = data[index - 1].value;
      const curr = point.value;
      const next = data[index + 1].value;
      
      // Simple moving average smoothing
      const smoothedValue = (prev + curr + next) / 3;
      
      return {
        ...point,
        value: Math.round(smoothedValue)
      };
    });
  };

  // Remove pitch smoothing and use only the adjusted (but unsmoothed) pitch data for sharp edges and natural fluctuations
  const adjustedPitchData = pitchData.map(point => ({
    ...point,
    value: Math.min(100, Math.round(point.value * 2 + 20)) // scale up and offset, clamp to 100
  }));

  // Use unsmoothed pitch data for the graph
  // Keep energy and speaking rate smoothing if desired
  // const smoothedPitchData = smoothData(adjustedPitchData); // REMOVE THIS
  const smoothedEnergyData = smoothData(energyData);
  const smoothedSpeakingRateData = smoothData(speakingRateData);

  return (
    <div className="bg-white rounded-md border border-gray-200 p-4">
      <h3 className="font-medium mb-3">Real Time Voice Analysis | Detected Emotion: <span className="text-green-600">{emotion}</span></h3>
      
      <div className="space-y-4">
        {/* Pitch and Energy graphs in one row */}
        <div className="grid grid-cols-2 gap-4">
          {/* Pitch graph */}
          <div className="h-[150px] relative">
            <h4 className="text-sm font-medium mb-1">Pitch</h4>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={adjustedPitchData}
                margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 9 }}
                />
                <YAxis 
                  tick={{ fontSize: 9 }} 
                  domain={[0, 100]} 
                  ticks={[0, 25, 50, 75, 100]}
                />
                <Tooltip 
                  formatter={(value) => [`${value}`, 'Pitch']}
                  labelFormatter={(label) => `Time: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#33C3F0" 
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                  connectNulls={false}
                />
                {adjustedPitchData.length > 0 && (
                  <ReferenceDot 
                    x={adjustedPitchData[adjustedPitchData.length - 1].time} 
                    y={adjustedPitchData[adjustedPitchData.length - 1].value} 
                    r={4}
                    fill="#33C3F0"
                    stroke="#33C3F0"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
            <div className="absolute top-7 right-2 bg-white/70 px-1.5 py-0.5 rounded text-xs font-medium">
              Score: {adjustedPitchData.length > 0 ? (adjustedPitchData[adjustedPitchData.length - 1].value / 100).toFixed(1) : '0.0'}
            </div>
          </div>

          {/* Energy graph */}
          <div className="h-[150px] relative">
            <h4 className="text-sm font-medium mb-1">Energy</h4>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={smoothedEnergyData}
                margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 9 }}
                />
                <YAxis 
                  tick={{ fontSize: 9 }} 
                  domain={[0, 100]} 
                  ticks={[0, 25, 50, 75, 100]}
                />
                <Tooltip 
                  formatter={(value) => [`${value}`, 'Energy']}
                  labelFormatter={(label) => `Time: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#FFC107" 
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                  connectNulls={false}
                />
                {smoothedEnergyData.length > 0 && (
                  <ReferenceDot 
                    x={smoothedEnergyData[smoothedEnergyData.length - 1].time} 
                    y={smoothedEnergyData[smoothedEnergyData.length - 1].value} 
                    r={4}
                    fill="#FFC107"
                    stroke="#FFC107"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
            <div className="absolute top-7 right-2 bg-white/70 px-1.5 py-0.5 rounded text-xs font-medium">
              Score: {smoothedEnergyData.length > 0 ? (smoothedEnergyData[smoothedEnergyData.length - 1].value / 100).toFixed(1) : '0.0'}
            </div>
          </div>
        </div>
        
        {/* Speaking rate graph */}
        <div className="h-[150px] relative">
          <h4 className="text-sm font-medium mb-1">Speaking Rate (Words Per Minute)</h4>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={smoothedSpeakingRateData}
              margin={{ top: 5, right: 10, left: 10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="time" 
                tick={{ fontSize: 9 }}
              />
              <YAxis 
                tick={{ fontSize: 9 }} 
                domain={[0, 100]} 
                ticks={[0, 25, 50, 75, 100]}
              />
              <Tooltip 
                formatter={(value) => [`${value}`, 'Speaking Rate']}
                labelFormatter={(label) => `Time: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#4CAF50" 
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
                connectNulls={false}
              />
              {smoothedSpeakingRateData.length > 0 && (
                <ReferenceDot 
                  x={smoothedSpeakingRateData[smoothedSpeakingRateData.length - 1].time} 
                  y={smoothedSpeakingRateData[smoothedSpeakingRateData.length - 1].value} 
                  r={4}
                  fill="#4CAF50"
                  stroke="#4CAF50"
                />
              )}
            </LineChart>
          </ResponsiveContainer>
          <div className="absolute top-7 right-2 bg-white/70 px-1.5 py-0.5 rounded text-xs font-medium">
            Score: {smoothedSpeakingRateData.length > 0 ? (smoothedSpeakingRateData[smoothedSpeakingRateData.length - 1].value / 100).toFixed(1) : '0.0'}
          </div>
        </div>
        
        <div className="text-center p-2 bg-gray-50 rounded-md mt-2">
          <p className="font-medium">Context Emotion Detected: <span className="text-green-600">{emotion}</span></p>
        </div>
      </div>
    </div>
  );
};

export default VoiceAnalysisGraphs;
