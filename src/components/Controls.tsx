/**
 * Playback controls component for replay functionality
 */

import React from 'react';
import { Play, Pause, SkipBack, SkipForward, RotateCcw } from 'lucide-react';

export interface ControlsProps {
  /** Whether playback is currently active */
  isPlaying: boolean;
  /** Current action index (-1 means before first action) */
  currentActionIndex: number;
  /** Total number of actions in the hand */
  totalActions: number;
  /** Callback for play/pause button */
  onPlayPause: () => void;
  /** Callback for previous action button */
  onPrevious: () => void;
  /** Callback for next action button */
  onNext: () => void;
  /** Callback for reset button */
  onReset: () => void;
  /** Custom CSS class */
  className?: string;
}

export const Controls: React.FC<ControlsProps> = ({
  isPlaying,
  currentActionIndex,
  totalActions,
  onPlayPause,
  onPrevious,
  onNext,
  onReset,
  className = ''
}) => {
  const isAtStart = currentActionIndex === -1;
  const isAtEnd = currentActionIndex >= totalActions - 1;

  return (
    <div className={`controls ${className}`}>
      <button 
        onClick={onReset} 
        disabled={isAtStart}
        title="Reset to beginning"
      >
        <RotateCcw size={20} />
      </button>
      
      <button 
        onClick={onPrevious} 
        disabled={isAtStart}
        title="Previous action"
      >
        <SkipBack size={20} />
      </button>
      
      <button 
        onClick={onPlayPause}
        title={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>
      
      <button 
        onClick={onNext} 
        disabled={isAtEnd}
        title="Next action"
      >
        <SkipForward size={20} />
      </button>
      
      <div className="action-counter">
        {currentActionIndex + 1} / {totalActions}
      </div>
    </div>
  );
};

export default Controls;