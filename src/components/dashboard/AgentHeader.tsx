import React from 'react';
import { Flag, Mic, MicOff, Settings } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface AgentHeaderProps {
  agentName: string;
  ticketId: string;
  callDuration: string;
  riskLevel: 'Low Risk' | 'Medium Risk' | 'High Risk';
  isMuted: boolean;
  onToggleMute: () => void;
  onEndCall: () => void;
  onSettings: () => void;
  onFlag: () => void;
  onLogout: () => void;
}

const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'Low Risk':
      return 'bg-green-200 text-black';
    case 'Medium Risk':
      return 'bg-risk-medium text-black';
    case 'High Risk':
      return 'bg-risk-high text-white';
    default:
      return 'bg-green-200 text-black';
  }
};

const AgentHeader: React.FC<AgentHeaderProps> = ({
  agentName,
  ticketId,
  callDuration,
  riskLevel,
  isMuted,
  onToggleMute,
  onSettings,
  onFlag,
  onLogout
}) => {
  return (
    <header className="bg-white shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-4">
          <h2 className="font-semibold text-lg">{agentName}</h2>
          <Badge variant="outline" className="px-3 py-1 border border-gray-300">
            {ticketId}
          </Badge>
          <div className="flex items-center space-x-1">
            <span className="text-sm font-medium">{callDuration}</span>
          </div>
          <Badge className={`px-3 py-1 ${getRiskColor(riskLevel)}`}>
            <span className="mr-1.5 inline-block w-2 h-2 rounded-full bg-current"></span>
            {riskLevel}
          </Badge>
        </div>

        <div className="flex items-center gap-4">
          <button
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md ${isMuted ? 'bg-red-100 text-red-600 hover:bg-red-200' : 'bg-green-100 text-green-600 hover:bg-green-200'}`}
            onClick={onToggleMute}
          >
            {isMuted ?
              <>
                <MicOff className="w-4 h-4" />
                <span className="text-sm font-medium">Muted</span>
              </> :
              <>
                <Mic className="w-4 h-4" />
                <span className="text-sm font-medium">Live</span>
              </>
            }
          </button>
          <button
            className="p-2 hover:bg-gray-100 rounded-full"
            onClick={onSettings}
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            className="p-2 hover:bg-gray-100 rounded-full"
            onClick={onFlag}
          >
            <Flag className="w-5 h-5" />
          </button>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 flex items-center gap-2"
          >
            <span>Logout</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="inline-block"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

export default AgentHeader;
