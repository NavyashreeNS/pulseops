import React, { createContext, useContext, useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [stompClient, setStompClient] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [incidentEvent, setIncidentEvent] = useState(null);
  const [auditEvent, setAuditEvent] = useState(null);

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        setIsConnected(true);

        // Subscribe to real-time incident status changes
        client.subscribe('/topic/incidents', (message) => {
          try {
            const data = JSON.parse(message.body);
            setIncidentEvent(data);
          } catch (e) {
            console.error('Error parsing incident WS payload:', e);
          }
        });

        // Subscribe to real-time MongoDB audit events
        client.subscribe('/topic/audits', (message) => {
          try {
            const data = JSON.parse(message.body);
            setAuditEvent(data);
          } catch (e) {
            console.error('Error parsing audit WS payload:', e);
          }
        });
      },
      onDisconnect: () => {
        setIsConnected(false);
      },
      onStompError: (frame) => {
        console.warn('STOMP error:', frame);
        setIsConnected(false);
      },
    });

    try {
      client.activate();
      setStompClient(client);
    } catch (e) {
      console.warn('WebSocket connection attempt failed:', e);
    }

    return () => {
      if (client.active) {
        client.deactivate();
      }
    };
  }, []);

  return (
    <WebSocketContext.Provider value={{ isConnected, incidentEvent, auditEvent }}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => useContext(WebSocketContext);
