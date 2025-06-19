
import React, { useState, useEffect, useRef } from 'react';
import { EmotionSegment, getRandomSample, getRandomEmotion } from './emotionUtils';
import EmotionLegend from './EmotionLegend';
import EmotionTimeline from './EmotionTimeline';
import CurrentEmotionDisplay from './CurrentEmotionDisplay';
import EmotionStatus from './EmotionStatus';

interface TimeAnalysisProps {
  title: string;
  emotionData?: Array<{
    emotion: string;
    timestamp: string;
    speaker: 'agent' | 'customer';
  }>;
  isLive?: boolean;
}

const TimeAnalysis: React.FC<TimeAnalysisProps> = ({ title, emotionData = [], isLive = true }) => {
  const [segments, setSegments] = useState<EmotionSegment[]>([]);
  const [currentTime, setCurrentTime] = useState(0);
  const [timelineOffset, setTimelineOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const emotionGenerationRef = useRef<NodeJS.Timeout | null>(null);

  // Determine speaker based on title
  const isAgent = title.toLowerCase().includes('agent');
  const speaker: 'agent' | 'customer' = isAgent ? 'agent' : 'customer';

  // Generate new emotion every 20 seconds
  useEffect(() => {
    if (!isLive) {
      // Static segments for non-live mode
      const defaultSegments: EmotionSegment[] = [
        { emotion: 'positive', duration: 15, timestamp: '00:00', startTime: 0, text: getRandomSample(speaker, 'positive') },
        { emotion: 'negative', duration: 20, timestamp: '00:15', startTime: 15, text: getRandomSample(speaker, 'negative') },
        { emotion: 'neutral', duration: 25, timestamp: '00:35', startTime: 35, text: getRandomSample(speaker, 'neutral') },
        { emotion: 'silence', duration: 10, timestamp: '01:00', startTime: 60, text: getRandomSample(speaker, 'silence') },
        { emotion: 'positive', duration: 15, timestamp: '01:10', startTime: 70, text: getRandomSample(speaker, 'positive') }
      ];
      setSegments(defaultSegments);
      return;
    }

    // Start with an initial segment
    const initialEmotion = getRandomEmotion();
    const initialSegment: EmotionSegment = {
      emotion: initialEmotion,
      duration: 20,
      timestamp: '00:00',
      startTime: 0,
      text: getRandomSample(speaker, initialEmotion)
    };
    setSegments([initialSegment]);

    // Generate new emotions every 20 seconds
    emotionGenerationRef.current = setInterval(() => {
      setSegments(prevSegments => {
        const lastSegment = prevSegments[prevSegments.length - 1];
        const nextStartTime = lastSegment.startTime + lastSegment.duration;
        const newEmotion = getRandomEmotion();
        
        const minutes = Math.floor(nextStartTime / 60);
        const seconds = nextStartTime % 60;
        const timestamp = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        const newSegment: EmotionSegment = {
          emotion: newEmotion,
          duration: 20,
          timestamp,
          startTime: nextStartTime,
          text: getRandomSample(speaker, newEmotion)
        };

        return [...prevSegments, newSegment];
      });
    }, 20000); // Every 20 seconds

    return () => {
      if (emotionGenerationRef.current) {
        clearInterval(emotionGenerationRef.current);
      }
    };
  }, [isLive, speaker]);

  // Update current time
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const newTime = prev + 1;
        
        // Auto-scroll timeline when current time exceeds visible area
        const totalVisibleTime = 100; // 100 seconds visible
        if (newTime > totalVisibleTime) {
          setTimelineOffset(prev => Math.max(0, newTime - totalVisibleTime));
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isLive]);

  // Find current active segment
  const currentSegment = segments.find(s => 
    currentTime >= s.startTime && currentTime < s.startTime + s.duration
  );

  // Calculate timeline width and positioning
  const totalDuration = segments.reduce((acc, segment) => acc + segment.duration, 0);
  const visibleDuration = Math.max(100, totalDuration); // At least 100 seconds visible

  return (
    <div className="bg-white rounded-md border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium">{title}</h3>
        {isLive && (
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 bg-red-500 rounded-full animate-pulse"></span>
            <span className="text-xs text-gray-500">LIVE</span>
          </div>
        )}
      </div>
      
      <div className="space-y-3">
        {/* Enhanced Legend */}
        <EmotionLegend />
        
        {/* Scrollable Live Timeline */}
        <EmotionTimeline 
          segments={segments}
          currentTime={currentTime}
          timelineOffset={timelineOffset}
          visibleDuration={visibleDuration}
          isLive={isLive}
        />
        
        {/* Timeline timestamps */}
        <div className="flex justify-between text-xs text-gray-500">
          <span>
            {Math.floor(timelineOffset / 60).toString().padStart(2, '0')}:
            {(timelineOffset % 60).toString().padStart(2, '0')}
          </span>
          <span>Current Time</span>
          <span>
            {Math.floor((timelineOffset + visibleDuration) / 60).toString().padStart(2, '0')}:
            {((timelineOffset + visibleDuration) % 60).toString().padStart(2, '0')}
          </span>
        </div>

        {/* Current transcript and emotion */}
        <CurrentEmotionDisplay 
          currentSegment={currentSegment}
          currentTime={currentTime}
          speaker={speaker}
          isLive={isLive}
        />

        {/* Emotion generation status */}
        <EmotionStatus 
          currentTime={currentTime}
          segmentsLength={segments.length}
          isLive={isLive}
        />
      </div>
    </div>
  );
};

export default TimeAnalysis;
