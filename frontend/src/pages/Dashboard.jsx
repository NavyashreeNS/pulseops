import React, { useState, useEffect } from 'react';
import StatsCards from '../components/StatsCards';
import IncidentCard from '../components/IncidentCard';
import CreateIncidentModal from '../components/CreateIncidentModal';
import IncidentDetailsModal from '../components/IncidentDetailsModal';
import { incidentsApi } from '../api/incidentsApi';
import { authApi } from '../api/authApi';
import { useWebSocket } from '../context/WebSocketContext';
import { Search, Filter, RefreshCw, Zap, Server } from 'lucide-react';

export default function Dashboard({ isCreateModalOpen, setIsCreateModalOpen }) {
  const [incidents, setIncidents] = useState([]);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Selected Incident for Detail Modal
  const [selectedIncident, setSelectedIncident] = useState(null);

  const { incidentEvent } = useWebSocket();

  // Load initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [incidentsData, statsData, usersData] = await Promise.all([
        incidentsApi.getAll(selectedStatus, selectedSeverity),
        incidentsApi.getStats(),
        authApi.getUsers().catch(() => []),
      ]);
      setIncidents(incidentsData);
      setStats(statsData);
      setUsers(usersData);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedStatus, selectedSeverity]);

  // Handle incoming real-time WebSocket updates
  useEffect(() => {
    if (incidentEvent) {
      setIncidents((prev) => {
        const index = prev.findIndex((i) => i.id === incidentEvent.id);
        if (index >= 0) {
          const updated = [...prev];
          updated[index] = incidentEvent;
          return updated;
        } else {
          return [incidentEvent, ...prev];
        }
      });

      // If open modal is currently showing this incident, update it live!
      if (selectedIncident && selectedIncident.id === incidentEvent.id) {
        setSelectedIncident(incidentEvent);
      }

      // Refresh stats
      incidentsApi.getStats().then(setStats).catch(() => {});
    }
  }, [incidentEvent]);

  // Filtered incidents based on search query
  const filteredIncidents = incidents.filter((inc) => {
    const q = searchQuery.toLowerCase();
    return (
      inc.title?.toLowerCase().includes(q) ||
      inc.trackingNumber?.toLowerCase().includes(q) ||
      inc.serviceName?.toLowerCase().includes(q)
    );
  });

  const handleIncidentCreated = (newIncident) => {
    setIncidents([newIncident, ...incidents]);
    fetchData();
  };

  const handleIncidentUpdated = (updatedIncident) => {
    setIncidents(incidents.map((i) => (i.id === updatedIncident.id ? updatedIncident : i)));
    setSelectedIncident(updatedIncident);
    incidentsApi.getStats().then(setStats).catch(() => {});
  };

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {/* Top Banner */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.75rem',
      }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.02em' }}>
            Mission Control &amp; Incident Operations
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Polyglot Orchestration Engine &bull; Relational ACID Workflows &amp; NoSQL Real-Time Telemetry
          </p>
        </div>

        <button
          onClick={fetchData}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: '#161c2d',
            border: '1px solid #232d45',
            color: '#94a3b8',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            fontSize: '0.85rem',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = '#3b82f6';
            e.currentTarget.style.borderColor = '#3b82f6';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = '#94a3b8';
            e.currentTarget.style.borderColor = '#232d45';
          }}
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          Sync State
        </button>
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Filter and Search Bar */}
      <div style={{
        background: '#161c2d',
        border: '1px solid #232d45',
        borderRadius: '12px',
        padding: '1rem 1.25rem',
        marginBottom: '1.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        {/* Search */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          background: '#0a0d14',
          border: '1px solid #232d45',
          borderRadius: '8px',
          padding: '0.5rem 0.85rem',
          flex: '1 1 280px',
          maxWidth: '420px',
        }}>
          <Search size={16} color="#64748b" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tracking ID, title, microservice..."
            style={{
              background: 'transparent',
              border: 'none',
              color: '#f8fafc',
              fontSize: '0.85rem',
              width: '100%',
              outline: 'none',
            }}
          />
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Status Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              style={{
                background: '#0a0d14',
                border: '1px solid #232d45',
                color: '#f8fafc',
                padding: '0.45rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
              }}
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">OPEN</option>
              <option value="INVESTIGATING">INVESTIGATING</option>
              <option value="MITIGATED">MITIGATED</option>
              <option value="RESOLVED">RESOLVED</option>
            </select>
          </div>

          {/* Severity Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600 }}>Severity:</span>
            <select
              value={selectedSeverity}
              onChange={(e) => setSelectedSeverity(e.target.value)}
              style={{
                background: '#0a0d14',
                border: '1px solid #232d45',
                color: '#f8fafc',
                padding: '0.45rem 0.75rem',
                borderRadius: '6px',
                fontSize: '0.8rem',
              }}
            >
              <option value="ALL">All Severities</option>
              <option value="CRITICAL">CRITICAL (P0)</option>
              <option value="HIGH">HIGH (P1)</option>
              <option value="MEDIUM">MEDIUM (P2)</option>
              <option value="LOW">LOW (P3)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Incidents Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '4rem 1rem', color: '#94a3b8' }}>
          Loading incident operations matrix...
        </div>
      ) : filteredIncidents.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '4rem 1rem',
          background: '#161c2d',
          borderRadius: '12px',
          border: '1px dashed #232d45',
          color: '#94a3b8',
        }}>
          <Server size={32} color="#3b82f6" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '0.3rem' }}>
            No matching incidents found
          </h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b' }}>
            All systems nominal or filter criteria matched zero incidents.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '1.25rem',
        }}>
          {filteredIncidents.map((incident) => (
            <IncidentCard
              key={incident.id}
              incident={incident}
              onSelect={setSelectedIncident}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <CreateIncidentModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={handleIncidentCreated}
        users={users}
      />

      <IncidentDetailsModal
        incident={selectedIncident}
        isOpen={!!selectedIncident}
        onClose={() => setSelectedIncident(null)}
        onUpdated={handleIncidentUpdated}
        users={users}
      />
    </div>
  );
}
