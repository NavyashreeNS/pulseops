import React from 'react';
import SlaTimer from './SlaTimer';
import { Server, User, ChevronRight, Tag } from 'lucide-react';

export default function IncidentCard({ incident, onSelect, onQuickStatusChange }) {
  const severityColors = {
    CRITICAL: { text: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.3)' },
    HIGH: { text: '#f97316', bg: 'rgba(249, 115, 22, 0.12)', border: 'rgba(249, 115, 22, 0.3)' },
    MEDIUM: { text: '#eab308', bg: 'rgba(234, 179, 8, 0.12)', border: 'rgba(234, 179, 8, 0.3)' },
    LOW: { text: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)', border: 'rgba(59, 130, 246, 0.3)' },
  }[incident.severity] || { text: '#94a3b8', bg: '#1e293b', border: '#334155' };

  const statusColors = {
    OPEN: { text: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' },
    INVESTIGATING: { text: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' },
    MITIGATED: { text: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' },
    RESOLVED: { text: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' },
  }[incident.status] || { text: '#94a3b8', bg: '#1e293b' };

  return (
    <div
      onClick={() => onSelect(incident)}
      style={{
        background: '#161c2d',
        border: '1px solid #232d45',
        borderRadius: '10px',
        padding: '1.2rem',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        gap: '0.9rem',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = '#3b82f6';
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = '#232d45';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{
            fontSize: '0.75rem',
            fontFamily: "'JetBrains Mono', monospace",
            fontWeight: 700,
            color: '#60a5fa',
            background: 'rgba(59, 130, 246, 0.1)',
            padding: '0.2rem 0.5rem',
            borderRadius: '4px',
            border: '1px solid rgba(59, 130, 246, 0.25)',
          }}>
            {incident.trackingNumber}
          </span>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            color: severityColors.text,
            background: severityColors.bg,
            border: `1px solid ${severityColors.border}`,
            padding: '0.2rem 0.55rem',
            borderRadius: '4px',
          }}>
            {incident.severity}
          </span>
        </div>

        {/* SLA Timer */}
        <SlaTimer
          deadline={incident.slaDeadline}
          status={incident.status}
          isBreached={incident.slaBreached}
        />
      </div>

      {/* Title & Service */}
      <div>
        <h4 style={{
          fontSize: '0.95rem',
          fontWeight: 700,
          color: '#f8fafc',
          lineHeight: '1.4',
          marginBottom: '0.4rem',
        }}>
          {incident.title}
        </h4>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#94a3b8', fontSize: '0.75rem' }}>
          <Server size={12} color="#60a5fa" />
          <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{incident.serviceName}</span>
        </div>
      </div>

      {/* Description Snippet */}
      {incident.description && (
        <p style={{
          fontSize: '0.8rem',
          color: '#64748b',
          lineHeight: '1.4',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
        }}>
          {incident.description}
        </p>
      )}

      {/* Footer Info */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '0.75rem',
        borderTop: '1px solid #1e263d',
        fontSize: '0.75rem',
        color: '#94a3b8',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <User size={13} color="#64748b" />
          <span>{incident.assigneeUsername || 'Unassigned'}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            fontSize: '0.7rem',
            fontWeight: 600,
            color: statusColors.text,
            background: statusColors.bg,
            padding: '0.2rem 0.5rem',
            borderRadius: '4px',
          }}>
            {incident.status}
          </span>
          <ChevronRight size={14} color="#64748b" />
        </div>
      </div>
    </div>
  );
}
