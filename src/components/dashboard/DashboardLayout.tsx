import React from 'react';
import { useMsal } from '@azure/msal-react';
import { useNavigate } from 'react-router-dom';
import AgentHeader from '@/components/dashboard/AgentHeader';

interface DashboardLayoutProps {
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
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  agentName,
  ticketId,
  callDuration,
  riskLevel,
  isMuted,
  onToggleMute,
  onSettings,
  onFlag,
  onLogout,
  children,
}) => {
  const { instance } = useMsal();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await instance.logoutPopup({
        postLogoutRedirectUri: window.location.origin,
      });
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header - No extra wrapper needed */}
      <AgentHeader
        agentName={agentName}
        ticketId={ticketId}
        callDuration={callDuration}
        riskLevel={riskLevel}
        isMuted={isMuted}
        onToggleMute={onToggleMute}
        onEndCall={() => { }} // Empty function since end call button is removed
        onSettings={onSettings}
        onFlag={onFlag}
        onLogout={handleLogout}
      />

      {/* Main Content - Takes remaining space */}
      <div className="grid grid-cols-12 gap-4 p-4 flex-1 relative">
        {children}

        {/* Voice Analysis Status Indicator */}
        {!isMuted && (
          <div className="absolute bottom-4 right-4 bg-green-100 text-green-700 px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 animate-pulse">
            <span className="h-2 w-2 bg-green-500 rounded-full inline-block"></span>
            Voice Analysis Active
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardLayout;