
import React from 'react';
import TranscriptPanel from '@/components/dashboard/TranscriptPanel';
import RiskPanel from '@/components/dashboard/RiskPanel';
import KnowledgeBasePanel from '@/components/dashboard/KnowledgeBasePanel';
import CompleteCallButton from '@/components/dashboard/CompleteCallButton';

interface Message {
  id: number;
  sender: 'Agent' | 'Customer';
  text: string;
  timestamp: string;
}

interface Article {
  id: number;
  title: string;
  content: string;
  category: string;
}

interface RightColumnProps {
  messages: Message[];
  riskLevel: string;
  customerTone: string;
  issueComplexity: string;
  resolutionTime: string;
  progressValue: number;
  articles: Article[];
  onCopyLink: (id: number) => void;
  onCompleteCall: () => void;
}

const RightColumn: React.FC<RightColumnProps> = ({
  messages,
  riskLevel,
  customerTone,
  issueComplexity,
  resolutionTime,
  progressValue,
  articles,
  onCopyLink,
  onCompleteCall,
}) => {
  return (
    <div className="col-span-12 md:col-span-3 h-full flex flex-col">
      <TranscriptPanel messages={messages} />
      
      <RiskPanel 
        riskLevel={riskLevel}
        customerTone={customerTone}
        issueComplexity={issueComplexity}
        resolutionTime={resolutionTime}
        progressValue={progressValue}
      />
      
      <div className="flex-1 flex flex-col">
        <KnowledgeBasePanel 
          articles={articles}
          onCopyLink={onCopyLink}
        />
        
        <div className="mt-6 mb-2">
          <CompleteCallButton onClick={onCompleteCall} />
        </div>
      </div>
    </div>
  );
};

export default RightColumn;
