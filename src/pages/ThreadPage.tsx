import React, { useState, useEffect } from 'react';
import { DigitalThreadExplorer } from '../components/thread/DigitalThreadExplorer';
import { eventBus } from '../core';

export const ThreadPage: React.FC = () => {
  const [badgeTrigger, setBadgeTrigger] = useState(0);

  const handleRefreshBadges = () => {
    setBadgeTrigger(prev => prev + 1);
  };

  useEffect(() => {
    // Listen to command palette thread-specific events
    const sub = eventBus.subscribe('CMD_THREAD', (data: any) => {
      const cmd = data?.command;
      if (cmd === 'open-digital-thread') {
        const clickEvent = new CustomEvent('jnas-trigger-open-thread');
        window.dispatchEvent(clickEvent);
      } else if (cmd === 'trace-object') {
        const clickEvent = new CustomEvent('jnas-trigger-trace-object');
        window.dispatchEvent(clickEvent);
      }
    });

    return () => {
      sub.unsubscribe();
    };
  }, []);

  return (
    <div className="w-full min-h-screen p-4 md:p-6 space-y-6">
      <DigitalThreadExplorer onRefreshGlobalBadges={handleRefreshBadges} />
    </div>
  );
};
