
import React from 'react';
import AgentProfile from '@/components/dashboard/AgentProfile';
import CallProgress from '@/components/dashboard/CallProgress';
import SentimentSnapshot from '@/components/dashboard/SentimentSnapshot';
import PreviousCalls from '@/components/dashboard/PreviousCalls';
import PendingTickets from '@/components/dashboard/PendingTickets';
import NotesPanel from '@/components/dashboard/NotesPanel';

interface ProgressStep {
  id: string;
  label: string;
  checked: boolean;
}

interface PreviousCall {
  id: number;
  team: string;
  duration: string;
}

interface PendingTicket {
  id: string;
  description: string;
  status: 'urgent' | 'inprogress' | 'pending';
}

interface LeftColumnProps {
  agentProfile: {
    name: string;
    role: string;
    location: string;
    email: string;
    employeeId: string;
  };
  progressSteps: ProgressStep[];
  sentimentScore: number;
  previousCalls: PreviousCall[];
  pendingTickets: PendingTicket[];
  notes: string;
  onToggleStep: (id: string, checked: boolean) => void;
  onSaveNotes: (newNotes: string) => void;
}

const LeftColumn: React.FC<LeftColumnProps> = ({
  agentProfile,
  progressSteps,
  sentimentScore,
  previousCalls,
  pendingTickets,
  notes,
  onToggleStep,
  onSaveNotes,
}) => {
  return (
    <div className="col-span-12 md:col-span-2 h-full flex flex-col space-y-4 overflow-hidden">
      <AgentProfile 
        name={agentProfile.name}
        role={agentProfile.role}
        location={agentProfile.location}
        email={agentProfile.email}
        employeeId={agentProfile.employeeId}
      />
      
      <CallProgress 
        steps={progressSteps}
        onToggleStep={onToggleStep}
      />
      
      <SentimentSnapshot sentimentScore={sentimentScore} />
      
      <PreviousCalls calls={previousCalls} />
      
      <PendingTickets tickets={pendingTickets} />
      
      <div className="mt-auto">
        <NotesPanel 
          initialNotes={notes}
          onSaveNotes={onSaveNotes}
        />
      </div>
    </div>
  );
};

export default LeftColumn;
