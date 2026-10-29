import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useWebSocket } from '../context/WebSocketContext';
import { Activity, Radio, Shield, PlusCircle, LogOut, User } from 'lucide-react';

export default function Navbar({ onOpenCreateModal }) {
  const { user, logout } = useAuth();
  const { isConnected } = useWebSocket();

  return (
    <nav style={{
      background: 'rgba(17, 22, 34, 0.85)',
      backdropFilter: 'blur(16px)',
      borderBottom: '1px solid #232d45',
      position: 'sticky',
      top: 0,
      zIndex: 50,
      padding: '0.85rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      {/* Brand */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
          padding: '0.6rem',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 15px rgba(59, 130, 246, 0.4)',
        }}>
          <Activity size={22} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
              PulseOps
            </span>
            <span style={{
              fontSize: '0.65rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              background: 'rgba(59, 130, 246, 0.15)',
              color: '#60a5fa',
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              border: '1px solid rgba(59, 130, 246, 0.3)',
            }}>
              Polyglot Engine
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            PostgreSQL (ACID) + MongoDB (Audit & Telemetry)
          </p>
        </div>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        {/* WebSocket Real-time Status */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.75rem',
          background: isConnected ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          border: `1px solid ${isConnected ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
          color: isConnected ? '#34d399' : '#f87171',
          padding: '0.35rem 0.75rem',
          borderRadius: '9999px',
        }}>
          <Radio size={14} className={isConnected ? "animate-pulse-subtle" : ""} />
          <span style={{ fontWeight: 600 }}>{isConnected ? 'Real-Time Telemetry' : 'Polling Sync'}</span>
        </div>

        {/* Create Incident Button */}
        <button
          onClick={onOpenCreateModal}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            color: '#ffffff',
            border: 'none',
            padding: '0.55rem 1.1rem',
            borderRadius: '8px',
            fontWeight: 600,
            fontSize: '0.85rem',
            cursor: 'pointer',
            boxShadow: '0 4px 12px rgba(37, 99, 235, 0.35)',
            transition: 'all 0.2s ease',
          }}
          onMouseOver={(e) => e.currentTarget.style.opacity = '0.9'}
          onMouseOut={(e) => e.currentTarget.style.opacity = '1'}
        >
          <PlusCircle size={16} />
          Report Incident
        </button>

        {/* User Info */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          paddingLeft: '1rem',
          borderLeft: '1px solid #232d45',
        }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            background: '#1e263d',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#93c5fd',
            border: '1px solid #2b3859',
          }}>
            <User size={16} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9' }}>
              {user?.username || 'Guest'}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#60a5fa', fontWeight: 500 }}>
              {user?.role ? user.role.replace('ROLE_', '') : 'VIEWER'}
            </div>
          </div>

          <button
            onClick={logout}
            title="Sign out"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '0.4rem',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
            }}
            onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
            onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </nav>
  );
}
