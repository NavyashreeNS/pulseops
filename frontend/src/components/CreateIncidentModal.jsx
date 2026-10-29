import React, { useState } from 'react';
import { X, Plus, Trash2, Database, ShieldAlert, Cpu } from 'lucide-react';
import { incidentsApi } from '../api/incidentsApi';

export default function CreateIncidentModal({ isOpen, onClose, onCreated, users }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [serviceName, setServiceName] = useState('payment-orchestrator');
  const [severity, setSeverity] = useState('HIGH');
  const [assigneeId, setAssigneeId] = useState('');
  const [errorSignature, setErrorSignature] = useState('');
  const [stackTrace, setStackTrace] = useState('');

  // Dynamic MongoDB NoSQL Attributes (Key-Value pairs)
  const [customFields, setCustomFields] = useState([
    { key: 'impactedTransactions', value: '450' },
    { key: 'podName', value: 'core-svc-east-9b8' },
    { key: 'httpStatusCode', value: '504' },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAddField = () => {
    setCustomFields([...customFields, { key: '', value: '' }]);
  };

  const handleRemoveField = (index) => {
    setCustomFields(customFields.filter((_, i) => i !== index));
  };

  const handleFieldChange = (index, field, val) => {
    const updated = [...customFields];
    updated[index][field] = val;
    setCustomFields(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !serviceName.trim()) {
      setError('Title and Service Name are required');
      return;
    }

    setLoading(true);
    setError('');

    // Convert dynamic key-value pairs to MongoDB JSON diagnostic payload
    const diagnosticPayload = {};
    customFields.forEach(({ key, value }) => {
      if (key.trim()) {
        const num = Number(value);
        diagnosticPayload[key.trim()] = !isNaN(num) && value !== '' ? num : value;
      }
    });

    try {
      const payload = {
        title,
        description,
        serviceName,
        severity,
        assigneeId: assigneeId ? Number(assigneeId) : null,
        errorSignature: errorSignature.trim() || null,
        stackTrace: stackTrace.trim() || null,
        diagnosticPayload,
      };

      const created = await incidentsApi.create(payload);
      onCreated(created);
      onClose();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to create incident');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
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
        maxWidth: '680px',
        maxHeight: '90vh',
        overflowY: 'auto',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)',
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid #1e263d',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShieldAlert size={20} color="#3b82f6" />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
              Report New Incident
            </h3>
          </div>
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

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              padding: '0.75rem 1rem',
              borderRadius: '8px',
              fontSize: '0.85rem',
            }}>
              {error}
            </div>
          )}

          {/* Core Relational SQL Fields */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.4)',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #1e263d',
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#60a5fa', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Database size={13} /> Relational Schema (PostgreSQL ACID)
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                  Incident Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Stripe Webhook Timeout During Batch Settlement"
                  required
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    background: '#161c2d',
                    border: '1px solid #2b3859',
                    borderRadius: '6px',
                    color: '#f8fafc',
                    fontSize: '0.9rem',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                    Service Name *
                  </label>
                  <input
                    type="text"
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    placeholder="e.g. payment-orchestrator"
                    required
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      background: '#161c2d',
                      border: '1px solid #2b3859',
                      borderRadius: '6px',
                      color: '#f8fafc',
                      fontSize: '0.85rem',
                      fontFamily: "'JetBrains Mono', monospace",
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                    Severity Level *
                  </label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      background: '#161c2d',
                      border: '1px solid #2b3859',
                      borderRadius: '6px',
                      color: '#f8fafc',
                      fontSize: '0.85rem',
                    }}
                  >
                    <option value="CRITICAL">CRITICAL (P0 - 30m SLA)</option>
                    <option value="HIGH">HIGH (P1 - 2h SLA)</option>
                    <option value="MEDIUM">MEDIUM (P2 - 8h SLA)</option>
                    <option value="LOW">LOW (P3 - 24h SLA)</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                    Assign SRE / Engineer
                  </label>
                  <select
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.65rem 0.85rem',
                      background: '#161c2d',
                      border: '1px solid #2b3859',
                      borderRadius: '6px',
                      color: '#f8fafc',
                      fontSize: '0.85rem',
                    }}
                  >
                    <option value="">Unassigned (Queue)</option>
                    {users?.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.username} ({u.department || 'Engineering'})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                  Description & Symptoms
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Detail observable impact, customer friction, or symptoms..."
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem',
                    background: '#161c2d',
                    border: '1px solid #2b3859',
                    borderRadius: '6px',
                    color: '#f8fafc',
                    fontSize: '0.85rem',
                    resize: 'vertical',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Unstructured Dynamic NoSQL Payload (MongoDB) */}
          <div style={{
            background: 'rgba(30, 41, 59, 0.4)',
            padding: '1rem',
            borderRadius: '8px',
            border: '1px solid #1e263d',
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#10b981', textTransform: 'uppercase', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Cpu size={13} /> MongoDB Telemetry &amp; Dynamic Attributes (NoSQL Document)
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                  Error Signature / Exception Message
                </label>
                <input
                  type="text"
                  value={errorSignature}
                  onChange={(e) => setErrorSignature(e.target.value)}
                  placeholder="e.g. SocketTimeoutException: Read timed out after 5000ms"
                  style={{
                    width: '100%',
                    padding: '0.6rem 0.85rem',
                    background: '#161c2d',
                    border: '1px solid #2b3859',
                    borderRadius: '6px',
                    color: '#f8fafc',
                    fontSize: '0.8rem',
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                />
              </div>

              {/* Dynamic JSON Key-Values */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                  <label style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                    Custom Diagnostic Attributes (Dynamic NoSQL Schema)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddField}
                    style={{
                      background: 'rgba(59, 130, 246, 0.15)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      color: '#60a5fa',
                      fontSize: '0.75rem',
                      padding: '0.2rem 0.5rem',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                    }}
                  >
                    <Plus size={12} /> Add Key-Value
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {customFields.map((field, idx) => (
                    <div key={idx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <input
                        type="text"
                        placeholder="attributeKey (e.g. podName)"
                        value={field.key}
                        onChange={(e) => handleFieldChange(idx, 'key', e.target.value)}
                        style={{
                          flex: 1,
                          padding: '0.5rem 0.75rem',
                          background: '#161c2d',
                          border: '1px solid #2b3859',
                          borderRadius: '6px',
                          color: '#60a5fa',
                          fontSize: '0.8rem',
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      />
                      <input
                        type="text"
                        placeholder="value (e.g. pod-9a)"
                        value={field.value}
                        onChange={(e) => handleFieldChange(idx, 'value', e.target.value)}
                        style={{
                          flex: 1,
                          padding: '0.5rem 0.75rem',
                          background: '#161c2d',
                          border: '1px solid #2b3859',
                          borderRadius: '6px',
                          color: '#f8fafc',
                          fontSize: '0.8rem',
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveField(idx)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: '#ef4444',
                          cursor: 'pointer',
                          padding: '0.4rem',
                        }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Modal Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: '#1e263d',
                color: '#94a3b8',
                border: '1px solid #2b3859',
                padding: '0.65rem 1.25rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
                color: '#ffffff',
                border: 'none',
                padding: '0.65rem 1.5rem',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(37, 99, 235, 0.4)',
              }}
            >
              {loading ? 'Publishing...' : 'Dispatch Incident'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
