import React from 'react';
import { AlertTriangle, Flame, Clock, CheckCircle2, TrendingUp } from 'lucide-react';

export default function StatsCards({ stats }) {
  const cards = [
    {
      title: 'Active Incidents',
      value: stats?.totalActive ?? 0,
      icon: AlertTriangle,
      color: '#3b82f6',
      subtext: 'Operational incidents in flight',
      glow: 'rgba(59, 130, 246, 0.15)',
    },
    {
      title: 'P0 Critical Emergencies',
      value: stats?.totalCritical ?? 0,
      icon: Flame,
      color: '#ef4444',
      subtext: 'Immediate engineer response required',
      glow: 'rgba(239, 68, 68, 0.2)',
    },
    {
      title: 'SLA Breached',
      value: stats?.totalSlaBreached ?? 0,
      icon: Clock,
      color: '#f59e0b',
      subtext: 'Violated resolution window',
      glow: 'rgba(245, 158, 11, 0.15)',
    },
    {
      title: 'SLA Compliance Rate',
      value: `${stats?.slaCompliancePercentage ?? 100}%`,
      icon: CheckCircle2,
      color: '#10b981',
      subtext: 'Target >= 95.0% adherence',
      glow: 'rgba(16, 185, 129, 0.15)',
    },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '1.25rem',
      marginBottom: '2rem',
    }}>
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            style={{
              background: '#161c2d',
              border: '1px solid #232d45',
              borderRadius: '12px',
              padding: '1.25rem 1.5rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: `0 4px 20px ${card.glow}`,
              transition: 'transform 0.2s ease, border-color 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.borderColor = '#3b82f6';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = '#232d45';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>
                {card.title}
              </span>
              <div style={{
                background: `rgba(${card.color === '#3b82f6' ? '59, 130, 246' : card.color === '#ef4444' ? '239, 68, 68' : card.color === '#f59e0b' ? '245, 158, 11' : '16, 185, 129'}, 0.12)`,
                padding: '0.45rem',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Icon size={18} color={card.color} />
              </div>
            </div>

            <div style={{ margin: '0.75rem 0 0.25rem' }}>
              <span style={{ fontSize: '1.85rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
                {card.value}
              </span>
            </div>

            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {card.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
}
