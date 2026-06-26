import { useState, useEffect } from 'react';
import './MyTripLogs.css';

function MyTripLogs({ logs, onOpen, onDelete, onDeleteMultiple, onSubmit }) {
  const [selectedIds, setSelectedIds] = useState([]);

  // Keep selectedIds synchronized with the current logs using useEffect
  useEffect(() => {
    setSelectedIds(prev => prev.filter(id => logs.some(log => log.id === id)));
  }, [logs]);

  if (!logs || logs.length === 0) {
    return (
      <div className="container empty-state-container">
        <div className="empty-state">
          <h2>Er zijn nog geen rittenstaten opgeslagen.</h2>
          <p>Ga naar de startpagina om uw eerste rittenstaat aan te maken.</p>
        </div>
      </div>
    );
  }

  // Sort logs by datum first, then submittedAt or dateModified
  const sortedLogs = [...logs].sort((a, b) => {
    // If we have datum, prefer that
    const dateA = new Date(a.datum || a.submittedAt || a.dateModified || a.dateCreated).getTime();
    const dateB = new Date(b.datum || b.submittedAt || b.dateModified || b.dateCreated).getTime();
    return dateB - dateA;
  });

  const handleToggleSelect = (id) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === sortedLogs.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(sortedLogs.map(log => log.id));
    }
  };

  return (
    <div className="container trip-logs-container">
      <header className="page-header">
        <h2>Mijn Rittenstaten</h2>
      </header>

      <div className="logs-grid">
        {sortedLogs.map((log) => {
          const isSelected = selectedIds.includes(log.id);
          return (
            <div key={log.id} className={`log-card ${isSelected ? 'selected' : ''}`}>
              <div className="log-card-content">
                <div className="log-card-header">
                  <div className="log-card-header-left">
                    {logs.length > 1 && (
                      <div className="log-card-select-wrapper">
                        <input
                          type="checkbox"
                          className="log-card-checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleSelect(log.id)}
                          aria-label="Selecteer rittenstaat"
                        />
                      </div>
                    )}
                    <div className="header-title-group">
                      <h3>
                        {log.datum ? new Date(log.datum).toLocaleDateString('nl-NL', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Onbekende datum'}
                      </h3>
                      <span className="driver-name">{log.naam || 'Geen naam'}</span>
                    </div>
                  </div>
                  <div className="card-badges">
                    <span className={`status-badge ${log.status || 'saved'}`}>
                      {log.status === 'submitted' ? 'Ingezonden' : 'Opgeslagen'}
                    </span>
                    {log.pakbonnen && log.pakbonnen.length > 0 && (
                      <span className="pakbon-indicator-badge">
                        {log.pakbonnen.length === 1 ? 'Pakbon (1)' : `Pakbonnen (${log.pakbonnen.length})`}
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="log-card-details details-grid">
                  <div className="detail-col">
                    <div className="detail-item">
                      <span className="detail-label">Naam:</span>
                      <span className="detail-value">{log.naam || '—'}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Kenteken:</span>
                      <span className="detail-value">{log.kenteken || '—'}</span>
                    </div>
                  </div>
                  <div className="detail-col">
                    <div className="detail-item">
                      <span className="detail-label">Dienst:</span>
                      <span className="detail-value">
                        {log.werktijdVan && log.werktijdTot ? `${log.werktijdVan} - ${log.werktijdTot}` : '—'}
                      </span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Wagennummer:</span>
                      <span className="detail-value">{log.wagenNummer || '—'}</span>
                    </div>
                  </div>
                </div>

                <div className="log-card-footer">
                  <span className="timestamp-label">
                    {log.status === 'submitted' && log.submittedAt
                      ? `Ingezonden op: ${new Date(log.submittedAt).toLocaleString('nl-NL')}`
                      : `Opgeslagen op: ${new Date(log.dateModified || log.dateCreated).toLocaleString('nl-NL')}`
                    }
                  </span>
                </div>
              </div>
              
              <div className="log-card-actions">
                <button 
                  className={`card-btn ${log.status === 'submitted' ? 'open-btn' : 'edit-btn'}`} 
                  onClick={() => onOpen(log)}
                >
                  {log.status === 'submitted' ? 'Openen' : 'Open/Bewerken'}
                </button>
                <button 
                  className="card-btn submit-btn" 
                  onClick={() => onSubmit(log)}
                  disabled={log.status === 'submitted'}
                >
                  {log.status === 'submitted' ? 'Ingezonden' : 'Inzenden'}
                </button>
                <button className="card-btn delete-btn" onClick={() => onDelete(log.id)}>
                  Verwijderen
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {selectedIds.length > 0 && (
        <div className="bulk-actions-toolbar">
          <div className="toolbar-info">
            <span className="selected-count">
              <strong>{selectedIds.length}</strong> geselecteerd
            </span>
          </div>
          <div className="toolbar-buttons">
            <button className="toolbar-btn select-all-btn" onClick={handleToggleSelectAll}>
              {selectedIds.length === sortedLogs.length ? 'Deselecteer alles' : 'Selecteer alles'}
            </button>
            <button className="toolbar-btn cancel-btn" onClick={() => setSelectedIds([])}>
              Annuleren
            </button>
            <button className="toolbar-btn delete-btn" onClick={() => onDeleteMultiple(selectedIds)}>
              Verwijderen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyTripLogs;
