import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useVoiceAnalysis } from '@/hooks/useVoiceAnalysis';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import LeftColumn from '@/components/dashboard/LeftColumn';
import MiddleColumn from '@/components/dashboard/MiddleColumn';
import RightColumn from '@/components/dashboard/RightColumn';
import { useMsal } from '@azure/msal-react';
import { useNavigate } from 'react-router-dom';
import { loginRequest } from '@/config/msal-config';

const Index = () => {
  const { toast } = useToast();
  const [isMuted, setIsMuted] = useState(true); // Start muted by default
  const [callDuration, setCallDuration] = useState('00:00:00');
  const [notes, setNotes] = useState('');
  const [isCallActive, setIsCallActive] = useState(true); // Track if call is active
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const timerRef = useRef<number | null>(null);

  // Use voice analysis hook
  const {
    isConnected,
    isRecording,
    pitchData,
    energyData,
    speakingRateData,
    emotion,
    transcriptEmotions,
    startRecording,
    stopRecording,
    clearData,
    addTranscriptEmotion
  } = useVoiceAnalysis();

  // Mock data - moved before it's used
  const messages = [
    {
      id: 1,
      sender: 'Agent' as const,
      text: 'Hello, thank you for calling support. How can I assist you today?',
      timestamp: '14:03:22'
    },
    {
      id: 2,
      sender: 'Customer' as const,
      text: 'Hi, I\'m having trouble with my laptop. It\'s running very slow and sometimes freezes.',
      timestamp: '14:03:35'
    },
    {
      id: 3,
      sender: 'Agent' as const,
      text: 'I understand that can be frustrating. Let me help you troubleshoot this issue. Can you tell me when did you first notice this problem?',
      timestamp: '14:03:50'
    },
    {
      id: 4,
      sender: 'Customer' as const,
      text: 'It started about a week ago. I installed some software updates and since then it\'s been slow.',
      timestamp: '14:04:10'
    }
  ];

  // Handle call duration
  useEffect(() => {
    if (!isCallActive) return; // Don't start timer if call is not active

    let seconds = 0;
    let minutes = 0;
    let hours = 0;

    const updateDuration = () => {
      seconds++;
      if (seconds >= 60) {
        seconds = 0;
        minutes++;
      }
      if (minutes >= 60) {
        minutes = 0;
        hours++;
      }

      const formattedHours = hours.toString().padStart(2, '0');
      const formattedMinutes = minutes.toString().padStart(2, '0');
      const formattedSeconds = seconds.toString().padStart(2, '0');

      setCallDuration(`${formattedHours}:${formattedMinutes}:${formattedSeconds}`);
    };

    // Start timer
    timerRef.current = window.setInterval(updateDuration, 1000);

    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
    };
  }, [isCallActive]);

  // Start/stop recording based on mute state
  const handleToggleMute = useCallback(() => {
    if (isConnected) {
      if (isMuted) {
        // Unmuting - start recording
        startRecording();
        toast({
          title: "Microphone Unmuted",
          description: "Voice analysis started",
          duration: 2000,
        });
      } else {
        // Muting - stop recording
        stopRecording();
        toast({
          title: "Microphone Muted",
          description: "Voice analysis paused",
          duration: 2000,
        });
      }
    } else {
      toast({
        title: "Connection Error",
        description: "Not connected to voice analysis server. Please make sure the backend is running.",
        variant: "destructive",
        duration: 3000,
      });
    }

    setIsMuted(!isMuted);
  }, [isMuted, isConnected, startRecording, stopRecording, toast]);

  // Handle initial connection notification
  useEffect(() => {
    if (isConnected) {
      toast({
        title: "Voice Analysis Connected",
        description: "Real-time voice analysis is now available. Click the mic button to start.",
        duration: 3000,
      });
    }
  }, [isConnected, toast]);

  // Mock function to simulate emotion detection from transcript
  const analyzeTranscriptEmotion = (text: string, speaker: 'Agent' | 'Customer'): string => {
    const lowerText = text.toLowerCase();

    // Simple keyword-based emotion detection for demo
    if (lowerText.includes('frustrat') || lowerText.includes('slow') || lowerText.includes('problem') || lowerText.includes('trouble')) {
      return 'frustrated';
    }
    if (lowerText.includes('thank') || lowerText.includes('help') || lowerText.includes('assist') || lowerText.includes('hello')) {
      return 'happy';
    }
    if (lowerText.includes('understand') || lowerText.includes('troubleshoot') || lowerText.includes('started')) {
      return 'neutral';
    }

    return 'neutral';
  };

  // Enhanced simulation for real-time emotion detection from transcript
  useEffect(() => {
    if (isRecording) {
      // More realistic emotion sequence based on conversation flow
      const sampleEmotions = [
        { emotion: 'happy', speaker: 'agent' as const, delay: 1000 },
        { emotion: 'frustrated', speaker: 'customer' as const, delay: 3000 },
        { emotion: 'neutral', speaker: 'agent' as const, delay: 5000 },
        { emotion: 'satisfied', speaker: 'customer' as const, delay: 7000 },
        { emotion: 'happy', speaker: 'agent' as const, delay: 9000 },
        { emotion: 'neutral', speaker: 'customer' as const, delay: 11000 },
        // Additional emotions for longer conversation
        { emotion: 'annoyed', speaker: 'customer' as const, delay: 13000 },
        { emotion: 'optimism', speaker: 'agent' as const, delay: 15000 },
        { emotion: 'pleased', speaker: 'customer' as const, delay: 17000 },
      ];

      const timeouts = sampleEmotions.map(({ emotion, speaker, delay }) =>
        setTimeout(() => {
          addTranscriptEmotion(emotion, speaker);
          console.log(`Added emotion: ${emotion} for ${speaker}`);
        }, delay)
      );

      return () => {
        timeouts.forEach(timeout => clearTimeout(timeout));
      };
    }
  }, [isRecording, addTranscriptEmotion]);

  // Enhanced messages with emotion analysis - now after messages is declared
  const messagesWithEmotions = messages.map(message => {
    const detectedEmotion = analyzeTranscriptEmotion(message.text, message.sender);
    return {
      ...message,
      emotion: detectedEmotion
    };
  });

  const knowledgeArticles = [
    {
      id: 1,
      title: 'Software Installation: Steps to Consider',
      content: 'When installing new software, ensure that your system meets minimum requirements. Before installation:\n\n1. Close all other applications\n2. Run a virus scan\n3. Create a system restore point\n4. Check for sufficient disk space\n\nIf the installation fails, try running as administrator or in compatibility mode.',
      category: 'Installation'
    },
    {
      id: 2,
      title: 'System Performance Troubleshooting',
      content: 'If the system is running slow:\n\n1. Check for background processes using Task Manager\n2. Scan for malware\n3. Clean temporary files using Disk Cleanup\n4. Defragment the hard drive if it\'s not an SSD\n5. Check startup programs and disable unnecessary ones',
      category: 'Performance'
    },
    {
      id: 3,
      title: 'Common Windows Update Issues',
      content: 'If Windows updates are causing performance issues:\n\n1. Check Windows Update history for recent installations\n2. Use Windows Update Troubleshooter\n3. Consider rolling back recent updates\n4. Ensure your drivers are compatible with the latest Windows version\n5. Check system resource usage after updates',
      category: 'Updates'
    }
  ];

  const progressSteps = [
    { id: 'step1', label: 'Identity Verified', checked: true },
    { id: 'step2', label: 'Issue Identified', checked: true },
    { id: 'step3', label: 'Cause Analysis', checked: false },
    { id: 'step4', label: 'Solution Suggested', checked: false },
    { id: 'step5', label: 'Issue Fixed', checked: false },
  ];

  const previousCalls = [
    { id: 1, team: 'L1 Team', duration: '8 minutes' },
    { id: 2, team: 'Technical Support', duration: '15 minutes' }
  ];

  const pendingTickets = [
    {
      id: 'INC4532',
      description: 'Email configuration issue',
      status: 'urgent' as const
    },
    {
      id: 'INC4498',
      description: 'Software installation',
      status: 'inprogress' as const
    }
  ];

  // Generate fixed time segments for sentiment analysis (only once)
  const generateFixedTimeSegments = () => {
    const emotions = ['positive', 'negative', 'neutral', 'silence'] as const;
    const timeSegments = [];

    // Create segments with proper timestamps (00:00, 00:30, 01:00, etc.)
    for (let i = 0; i < 5; i++) {
      const minutes = Math.floor(i / 2);
      const seconds = (i % 2) * 30;
      const time = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

      const segments = [];
      let remainingPercentage = 100;

      // Create 2-4 segments for each time block
      const segmentCount = 2 + Math.floor(Math.random() * 3);
      for (let j = 0; j < segmentCount; j++) {
        const isLast = j === segmentCount - 1;
        const duration = isLast ? remainingPercentage : Math.floor(remainingPercentage / (segmentCount - j));

        const emotion = emotions[Math.floor(j % emotions.length)];
        segments.push({ emotion, duration });
        remainingPercentage -= duration;
      }

      timeSegments.push({ time, segments });
    }

    return timeSegments;
  };

  // Use useMemo to ensure these are generated only once
  const agentTimeSegment = useMemo(() => generateFixedTimeSegments(), []);
  const customerTimeSegment = useMemo(() => generateFixedTimeSegments(), []);

  // Quick response suggestions - limited to 3
  const suggestions = [
    "Let me check the status of that for you.",
    "I understand your frustration. Let's find a solution together.",
    "Could you please provide more details about the issue?"
  ];

  // Event handlers
  const handleEndCall = () => {
    stopRecording();
    toast({
      title: "Call Ended",
      description: "The call has been terminated",
      variant: "destructive",
    });
  };

  const handleSettings = () => {
    toast({
      title: "Settings",
      description: "Settings panel would open here",
    });
  };

  const handleFlag = () => {
    toast({
      title: "Call Flagged",
      description: "This call has been flagged for review",
    });
  };

  const handleToggleStep = (id: string, checked: boolean) => {
    toast({
      title: checked ? "Step Completed" : "Step Unchecked",
      description: `${id} has been ${checked ? 'marked as complete' : 'unmarked'}`,
    });
  };

  const handleCopyLink = (id: number) => {
    toast({
      title: "Link Copied",
      description: `Article #${id} link copied to clipboard`,
    });
  };

  const handleCopySuggestion = (suggestion: string) => {
    toast({
      title: "Response Copied",
      description: "Quick response copied to clipboard",
    });
  };

  const handleSaveNotes = (newNotes: string) => {
    setNotes(newNotes);
    toast({
      title: "Notes Saved",
      description: "Your notes have been saved",
    });
  };

  const handleCompleteCall = () => {
    // Stop the timer
    setIsCallActive(false);
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
    }

    stopRecording();
    toast({
      title: "Call Completed",
      description: "The call has been marked as complete",
    });
  };

  const { instance, accounts } = useMsal();

  const formatDisplayName = (fullName: string) => {
    const nameParts = fullName.trim().split(' ');
    if (nameParts.length >= 3) {
      // For names with 3 or more parts, take middle and last name
      return `${nameParts[1]} ${nameParts[nameParts.length - 1]}`;
    }
    return fullName; // Return full name if it's 2 words or less
  };

  useEffect(() => {
    const getUserProfile = async () => {
      try {
        const response = await instance.acquireTokenSilent({
          ...loginRequest,
          account: accounts[0]
        });

        const graphResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
          headers: { Authorization: `Bearer ${response.accessToken}` }
        });

        const profile = await graphResponse.json();
        setUserEmail(profile.mail || profile.userPrincipalName);
        setUserName(formatDisplayName(profile.displayName || 'Unknown User'));
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    if (accounts[0]) {
      getUserProfile();
    }
  }, [instance, accounts]);

  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await instance.logoutPopup();
      navigate('/');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <DashboardLayout
      agentName={userName}
      ticketId="INC4567"
      callDuration={callDuration}
      riskLevel="Low Risk"
      isMuted={isMuted}
      onToggleMute={handleToggleMute}
      onEndCall={handleEndCall}
      onSettings={handleSettings}
      onFlag={handleFlag}
      onLogout={handleLogout}
    >
      <LeftColumn
        agentProfile={{
          name: userName,
          role: "Software Support",
          location: "CMDC, Coimbatore",
          email: userEmail, // Replace hardcoded email with SSO email
          employeeId: "EMP12345"
        }}
        progressSteps={progressSteps}
        sentimentScore={75}
        previousCalls={previousCalls}
        pendingTickets={pendingTickets}
        notes={notes}
        onToggleStep={handleToggleStep}
        onSaveNotes={handleSaveNotes}
      />

      <MiddleColumn
        pitchData={pitchData}
        energyData={energyData}
        speakingRateData={speakingRateData}
        emotion={emotion}
        transcriptEmotions={transcriptEmotions}
        suggestions={suggestions}
        callSummary={{
          purpose: "To resolve laptop performance issues",
          solution: "Identified recent software updates as cause. Recommended rolling back updates and cleaning temporary files.",
          status: "In Progress"
        }}
        onCopySuggestion={handleCopySuggestion}
      />

      <RightColumn
        messages={messages}
        riskLevel="Low Risk"
        customerTone="Neutral"
        issueComplexity="Medium"
        resolutionTime="Low"
        progressValue={25}
        articles={knowledgeArticles}
        onCopyLink={handleCopyLink}
        onCompleteCall={handleCompleteCall}
      />
    </DashboardLayout>
  );
};

export default Index;
