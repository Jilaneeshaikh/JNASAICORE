import React, { useState, useEffect } from 'react';
import { ExecutiveDashboardWorkspace } from '../components/decision/ExecutiveDashboardWorkspace';
import { decisionRegistry } from '../backend/decision/registry';
import { eventBus } from '../core';

export const DecisionPage: React.FC = () => {
  const [badgeTrigger, setBadgeTrigger] = useState(0);

  const handleRefreshBadges = () => {
    setBadgeTrigger(prev => prev + 1);
  };

  useEffect(() => {
    // Listen to command palette strategic events
    const sub = eventBus.subscribe('CMD_DECISION', (data: any) => {
      const cmd = data?.command;
      if (cmd === 'create-dashboard') {
        const clickEvent = new CustomEvent('jnas-trigger-create-dashboard');
        window.dispatchEvent(clickEvent);
      } else if (cmd === 'search-kpi') {
        const clickEvent = new CustomEvent('jnas-trigger-search-kpi');
        window.dispatchEvent(clickEvent);
      }
    });

    return () => {
      sub.unsubscribe();
    };
  }, []);

  return (
    <div className="w-full min-h-screen p-4 md:p-6 space-y-6">
      <ExecutiveDashboardWorkspace onRefreshGlobalBadges={handleRefreshBadges} />
    </div>
  );
};
