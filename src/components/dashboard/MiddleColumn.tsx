
import React from 'react';
import VoiceAnalysisGraphs from '@/components/dashboard/VoiceAnalysisGraphs';
import TimeAnalysis from '@/components/dashboard/TimeAnalysis';
import QuickResponses from '@/components/dashboard/QuickResponses';
import CallSummary from '@/components/dashboard/CallSummary';

interface MiddleColumnProps {
  pitchData: Array<{ time: string; value: number }>;
  energyData: Array<{ time: string; value: number }>;
  speakingRateData: Array<{ time: string; value: number }>;
  emotion: string;
  transcriptEmotions: Array<{
    emotion: string;
    timestamp: string;
    speaker: 'agent' | 'customer';
  }>;
  suggestions: string[];
  callSummary: {
    purpose: string;
    solution: string;
    status: string;
  };
  onCopySuggestion: (suggestion: string) => void;
}

const MiddleColumn: React.FC<MiddleColumnProps> = ({
  pitchData,
  energyData,
  speakingRateData,
  emotion,
  transcriptEmotions,
  suggestions,
  callSummary,
  onCopySuggestion
}) => {
  // Ensure status is a valid value for CallSummary component
  const getValidStatus = (status: string): 'Resolved' | 'In Progress' | 'Requires Escalation' => {
    switch (status) {
      case 'Resolved':
      case 'In Progress':
      case 'Requires Escalation':
        return status as 'Resolved' | 'In Progress' | 'Requires Escalation';
      default:
        return 'In Progress'; // Default fallback
    }
  };

  return (
    <div className="col-span-6 space-y-4">
      {/* Voice Analysis Graphs */}
      <VoiceAnalysisGraphs 
        pitchData={pitchData}
        energyData={energyData}
        speakingRateData={speakingRateData}
        emotion={emotion}
      />
      
      {/* Live Sentiment Analysis Gantt Charts */}
      <div className="grid grid-cols-2 gap-4">
        <TimeAnalysis 
          title="Agent Sentiment Analysis" 
          emotionData={transcriptEmotions}
          isLive={true}
        />
        <TimeAnalysis 
          title="Employee Sentiment Analysis" 
          emotionData={transcriptEmotions}
          isLive={true}
        />
      </div>
      
      {/* Quick Responses */}
      <QuickResponses 
        suggestions={suggestions}
        onCopySuggestion={onCopySuggestion}
      />
      
      {/* Call Summary */}
      <CallSummary 
        purpose={callSummary.purpose}
        solution={callSummary.solution}
        status={getValidStatus(callSummary.status)}
      />
    </div>
  );
};

export default MiddleColumn;
