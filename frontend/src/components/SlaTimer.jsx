import React, { useState, useEffect } from 'react';
import { Clock, AlertOctagon, CheckCircle } from 'lucide-react';

export default function SlaTimer({ deadline, status, isBreached }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [statusType, setStatusType] = useState('safe'); // safe, warning, breached, resolved

  useEffect(() => {
    if (status === 'RESOLVED') {
      setStatusType('resolved');
      setTimeLeft('Resolved');
      return;
    }

    const calculate = () => {
      const now = new Date().getTime();
      const target = new Date(deadline).getTime();
      const diff = target - now;

      if (diff <= 0 || isBreached) {
        setStatusType('breached');
        const overdueMinutes = Math.abs(Math.floor(diff / (1000 * 60)));
        setTimeLeft(`Breached (+${overdueMinutes}m)`);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        if (diff < 30 * 60 * 1000) {
          setStatusType('warning');
        } else {
          setStatusType('safe');
        }

        setTimeLeft(`${hours > 0 ? `${hours}h ` : ''}${minutes}m ${seconds}s`);
      }
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [deadline, status, isBreached]);

  const config = {
    resolved: {
      color: '#10b981',
      bg: 'rgba(16, 185, 129, 0.1)',
      border: 'rgba(16, 185, 129, 0.3)',
      icon: CheckCircle,
    },
    safe: {
      color: '#3b82f6',
      bg: 'rgba(59, 130, 246, 0.1)',
      border: 'rgba(59, 130, 246, 0.3)',
      icon: Clock,
    },
    warning: {
      color: '#f59e0b',
      bg: 'rgba(245, 158, 11, 0.15)',
      border: 'rgba(245, 158, 11, 0.4)',
      icon: Clock,
    },
    breached: {
      color: '#ef4444',
      bg: 'rgba(239, 68, 68, 0.15)',
      border: 'rgba(239, 68, 68, 0.4)',
      icon: AlertOctagon,
    },
  }[statusType];

  const Icon = config.icon;

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.4rem',
      fontSize: '0.75rem',
      fontWeight: 600,
      padding: '0.25rem 0.6rem',
      borderRadius: '6px',
      background: config.bg,
      color: config.color,
      border: `1px solid ${config.border}`,
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      <Icon size={12} />
      <span>{timeLeft}</span>
    </div>
  );
}
