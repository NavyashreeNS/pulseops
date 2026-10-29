import React, { useState, useEffect } from 'react';
import { X, Server, Clock, User, History, Cpu, FileText, CheckCircle2, AlertTriangle } from 'lucide-react';
import SlaTimer from './SlaTimer';
import { auditApi } from '../api/auditApi';
import { incidentsApi } from '../api/incidentsApi';

export default function IncidentDetailsModal({ incident, isOpen, onClose, onUpdated, users }) {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'audit' | 'telemetry'
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingAudits, setLoadingAudits] = useState(false);
  const [status, setStatus] = useState(incident?.status || 'OPEN');
  const [severity, setSeverity] = useState(incident?.severity || 'HIGH');
  const [assigneeId, setAssigneeId] = useState(incident?.assigneeId || '');
  const [notes, setNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (incident) {
      setStatus(incident.status);
      setSeverity(incident.severity);
      setAssigneeId(incident.assigneeId || '');
      loadAudits();
    }
  }, [incident]);

  const loadAudits = async () => {
    if (!incident) return;
    setLoadingAudits(true);
    try {
      const logs = await auditApi.getByIncidentId(incident.id);
      setAuditLogs(logs);
    } catch (err) {
      console.error('Failed to load MongoDB audit logs:', err);
    } finally {
      setLoadingAudits(false);
    }
  };

  if (!isOpen || !incident) return null;

  const handleUpdate = async () => {
    setUpdating(true);
    try {
      const updateData = {
        status,
        severity,
        assigneeId: assigneeId ? Number(assigneeId) : null,
        notes: notes.trim() || undefined,
      };

      const updated = await incidentsApi.update(incident.id, updateData);
      onUpdated(updated);
      setNotes('');
      loadAudits();
    } catch (err) {
      console.error('Failed to update incident:', err);
      alert('Error updating incident: ' + (err.response?.data?.message || err.message));
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 100,
      padding: '1rem',
    }}>
      <div style={{
        background: '#111622',
        border: '1px solid #232d45',
        borderRadius: '14px',
        width: '100%',
        maxWidth: '820px',
        maxHeight: '92vh',
        overflowY: 'auto',
        boxShadow: '0 25px 60px rgba(0, 0, 0, 0.6)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.75rem',
          borderBottom: '1px solid #1e263d',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem' }}>
              <span style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 700,
                fontSize: '0.85rem',
                color: '#60a5fa',
                background: 'rgba(59, 130, 246, 0.1)',
                padding: '0.2rem 0.6rem',
                borderRadius: '4px',
                border: '1px solid rgba(59, 130, 246, 0.3)',
              }}>
                {incident.trackingNumber}
              </span>
              <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: "'JetBrains Mono', monospace" }}>
                SQL Version: {incident.version ?? 0} (Optimistic Locking)
              </span>
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.3 }}>
              {incident.title}
            </h2>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <SlaTimer
              deadline={incident.slaDeadline}
              status={incident.status}
              isBreached={incident.slaBreached}
            />
            <button
              onClick={onClose}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '0.3rem',
              }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid #1e263d',
          background: 'rgba(17, 22, 34, 0.5)',
          padding: '0 1.75rem',
        }}>
          {[
            { id: 'overview', label: 'Overview & Triage', icon: FileText },
            { id: 'telemetry', label: 'MongoDB Telemetry (NoSQL)', icon: Cpu },
            { id: 'audit', label: `Audit Trail (${auditLogs.length})`, icon: History },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.85rem 1.25rem',
                  background: 'transparent',
                  border: 'none',
                  borderBottom: active ? '2px solid #3b82f6' : '2px solid transparent',
                  color: active ? '#60a5fa' : '#94a3b8',
                  fontWeight: active ? 700 : 500,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div style={{ padding: '1.75rem', flex: 1, overflowY: 'auto' }}>
          {activeTab === 'overview' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {/* Description */}
              <div>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                  Description
                </h4>
                <div style={{
                  background: '#161c2d',
                  border: '1px solid #232d45',
                  padding: '1rem',
                  borderRadius: '8px',
                  color: '#e2e8f0',
                  fontSize: '0.9rem',
                  lineHeight: '1.6',
                }}>
                  {incident.description || 'No detailed description provided.'}
                </div>
              </div>

              {/* Core SQL Attributes Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
              }}>
                <div style={{ background: '#161c2d', border: '1px solid #232d45', padding: '0.85rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Service Component</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc', marginTop: '0.2rem', fontFamily: "'JetBrains Mono', monospace" }}>
                    {incident.serviceName}
                  </div>
                </div>

                <div style={{ background: '#161c2d', border: '1px solid #232d45', padding: '0.85rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Reported By</div>
                  <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc', marginTop: '0.2rem' }}>
                    {incident.reportedByUsername || 'SYSTEM'}
                  </div>
                </div>

                <div style={{ background: '#161c2d', border: '1px solid #232d45', padding: '0.85rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Created Timestamp</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '0.2rem', fontFamily: "'JetBrains Mono', monospace" }}>
                    {new Date(incident.createdAt).toLocaleString()}
                  </div>
                </div>

                <div style={{ background: '#161c2d', border: '1px solid #232d45', padding: '0.85rem', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Target SLA Deadline</div>
                  <div style={{ fontSize: '0.8rem', color: incident.slaBreached ? '#ef4444' : '#10b981', marginTop: '0.2rem', fontFamily: "'JetBrains Mono', monospace" }}>
                    {new Date(incident.slaDeadline).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Live Incident State Controls */}
              <div style={{
                background: 'rgba(30, 41, 59, 0.4)',
                border: '1px solid #232d45',
                padding: '1.25rem',
                borderRadius: '10px',
              }}>
                <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', marginBottom: '1rem' }}>
                  Incident Triage &amp; State Transition (SQL Transaction)
                </h4>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                      Lifecycle Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        background: '#161c2d',
                        border: '1px solid #2b3859',
                        borderRadius: '6px',
                        color: '#f8fafc',
                        fontSize: '0.85rem',
                      }}
                    >
                      <option value="OPEN">OPEN</option>
                      <option value="INVESTIGATING">INVESTIGATING</option>
                      <option value="MITIGATED">MITIGATED</option>
                      <option value="RESOLVED">RESOLVED</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                      Severity (Recalculates SLA)
                    </label>
                    <select
                      value={severity}
                      onChange={(e) => setSeverity(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        background: '#161c2d',
                        border: '1px solid #2b3859',
                        borderRadius: '6px',
                        color: '#f8fafc',
                        fontSize: '0.85rem',
                      }}
                    >
                      <option value="CRITICAL">CRITICAL (30m)</option>
                      <option value="HIGH">HIGH (2h)</option>
                      <option value="MEDIUM">MEDIUM (8h)</option>
                      <option value="LOW">LOW (24h)</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                      Reassign SRE / Engineer
                    </label>
                    <select
                      value={assigneeId}
                      onChange={(e) => setAssigneeId(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.55rem',
                        background: '#161c2d',
                        border: '1px solid #2b3859',
                        borderRadius: '6px',
                        color: '#f8fafc',
                        fontSize: '0.85rem',
                      }}
                    >
                      <option value="">Unassigned</option>
                      {users?.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.username}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                    Audit Transition Notes (Appended to MongoDB Audit Trail)
                  </label>
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Restarted consumer pod and increased replica count to 4"
                    style={{
                      width: '100%',
                      padding: '0.55rem 0.85rem',
                      background: '#161c2d',
                      border: '1px solid #2b3859',
                      borderRadius: '6px',
                      color: '#f8fafc',
                      fontSize: '0.85rem',
                      marginBottom: '1rem',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={handleUpdate}
                    disabled={updating}
                    style={{
                      background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '0.55rem 1.4rem',
                      borderRadius: '6px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      fontSize: '0.85rem',
                    }}
                  >
                    {updating ? 'Committing...' : 'Commit State Transition'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* MongoDB Telemetry Tab */}
          {activeTab === 'telemetry' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{
                background: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.25)',
                padding: '0.85rem 1.25rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                color: '#34d399',
              }}>
                <strong>MongoDB Document Store:</strong> Stored in <code>incident_telemetry</code> collection. Highly dynamic schema allowing arbitrary diagnostic attributes without database table alterations.
              </div>

              {incident.errorSignature && (
                <div>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                    Error Signature
                  </h4>
                  <div style={{
                    background: '#0a0d14',
                    border: '1px solid #232d45',
                    padding: '0.75rem 1rem',
                    borderRadius: '6px',
                    color: '#f87171',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.8rem',
                  }}>
                    {incident.errorSignature}
                  </div>
                </div>
              )}

              {/* JSON Diagnostic Payload */}
              <div>
                <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                  Dynamic Diagnostic Payload (JSON Document)
                </h4>
                <pre style={{
                  background: '#0a0d14',
                  border: '1px solid #232d45',
                  padding: '1rem',
                  borderRadius: '8px',
                  color: '#60a5fa',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.8rem',
                  overflowX: 'auto',
                }}>
                  {incident.diagnosticPayload && Object.keys(incident.diagnosticPayload).length > 0
                    ? JSON.stringify(incident.diagnosticPayload, null, 2)
                    : '// No custom diagnostic attributes recorded for this incident.'}
                </pre>
              </div>

              {incident.stackTrace && (
                <div>
                  <h4 style={{ fontSize: '0.8rem', fontWeight: 700, color: '#94a3b8', marginBottom: '0.4rem', textTransform: 'uppercase' }}>
                    Stack Trace
                  </h4>
                  <pre style={{
                    background: '#0a0d14',
                    border: '1px solid #232d45',
                    padding: '1rem',
                    borderRadius: '8px',
                    color: '#fca5a5',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.75rem',
                    overflowX: 'auto',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {incident.stackTrace}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* MongoDB Audit Trail Tab */}
          {activeTab === 'audit' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                background: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                padding: '0.85rem 1.25rem',
                borderRadius: '8px',
                fontSize: '0.8rem',
                color: '#60a5fa',
              }}>
                <strong>Immutable Audit Log:</strong> Sourced from MongoDB collection <code>incident_audit_logs</code>. Uses append-only event-sourcing with zero destructive writes for compliance &amp; forensic accountability.
              </div>

              {loadingAudits ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                  Loading audit logs from MongoDB...
                </div>
              ) : auditLogs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
                  No audit entries found.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      style={{
                        background: '#161c2d',
                        border: '1px solid #232d45',
                        borderRadius: '8px',
                        padding: '1rem',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            background: log.action.includes('CREATED') ? 'rgba(59, 130, 246, 0.15)' : log.action.includes('BREACH') ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                            color: log.action.includes('CREATED') ? '#60a5fa' : log.action.includes('BREACH') ? '#f87171' : '#34d399',
                            fontFamily: "'JetBrains Mono', monospace",
                          }}>
                            {log.action}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: '#f8fafc', fontWeight: 600 }}>
                            by {log.performedBy}
                          </span>
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#64748b', fontFamily: "'JetBrains Mono', monospace" }}>
                          {new Date(log.timestamp).toLocaleString()}
                        </span>
                      </div>

                      {log.notes && (
                        <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontStyle: 'italic' }}>
                          "{log.notes}"
                        </div>
                      )}

                      {log.changes && Object.keys(log.changes).length > 0 && (
                        <div style={{
                          background: '#0a0d14',
                          border: '1px solid #1e263d',
                          padding: '0.6rem 0.85rem',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontFamily: "'JetBrains Mono', monospace",
                          color: '#94a3b8',
                        }}>
                          {Object.entries(log.changes).map(([k, v]) => (
                            <div key={k} style={{ display: 'flex', gap: '0.5rem' }}>
                              <span style={{ color: '#60a5fa' }}>{k}:</span>
                              <span>{String(v)}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
