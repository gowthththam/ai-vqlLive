
import React from 'react';
import { Progress } from "@/components/ui/progress";

interface RiskPanelProps {
  riskLevel: string;
  customerTone: string;
  issueComplexity: string;
  resolutionTime: string;
  progressValue: number;
}

const RiskPanel: React.FC<RiskPanelProps> = ({
  riskLevel,
  customerTone,
  issueComplexity,
  resolutionTime,
  progressValue
}) => {
  const getRiskBadgeClass = (risk: string) => {
    switch (risk.toLowerCase()) {
      case 'low risk':
        return 'bg-green-100 text-green-800';
      case 'medium risk':
        return 'bg-yellow-100 text-yellow-800';
      case 'high risk':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <div className="bg-white rounded-md border border-gray-200 p-4">
      <h3 className="font-medium mb-3">Escalation Risk</h3>
      
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm">Risk Level:</span>
        <span className={`text-sm px-2 py-0.5 rounded-full ${getRiskBadgeClass(riskLevel)}`}>{riskLevel}</span>
      </div>
      
      <div className="space-y-4 mt-4">
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm">Customer Tone</span>
            <span className="text-sm">{customerTone}</span>
          </div>
          <div className="h-2 w-full bg-gradient-to-r from-green-300 via-yellow-300 to-red-300 rounded-full">
            <div 
              className="h-2 rounded-full bg-green-500" 
              style={{ width: customerTone === 'Neutral' ? '50%' : (customerTone === 'Positive' ? '25%' : '75%') }}
            ></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm">Issue Complexity</span>
            <span className="text-sm">{issueComplexity}</span>
          </div>
          <div className="h-2 w-full bg-gradient-to-r from-green-300 via-yellow-300 to-red-300 rounded-full">
            <div 
              className="h-2 rounded-full bg-yellow-500" 
              style={{ width: issueComplexity === 'Medium' ? '50%' : (issueComplexity === 'Low' ? '25%' : '75%') }}
            ></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm">Resolution Time</span>
            <span className="text-sm">{resolutionTime}</span>
          </div>
          <div className="h-2 w-full bg-gradient-to-r from-green-300 via-yellow-300 to-red-300 rounded-full">
            <div 
              className="h-2 rounded-full bg-green-500" 
              style={{ width: resolutionTime === 'Medium' ? '50%' : (resolutionTime === 'Low' ? '25%' : '75%') }}
            ></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm">Overall Progress</span>
            <span className="text-sm">{progressValue}%</span>
          </div>
          <Progress value={progressValue} className="h-2 bg-gray-200" />
        </div>
      </div>
    </div>
  );
};

export default RiskPanel;
