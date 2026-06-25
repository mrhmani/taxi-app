import './MyTripLogs.css';

function MyTripLogs({ logs, onOpen, onDelete, onSubmit }) {
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

  return (
    <div className="container trip-logs-container">
      <header className="page-header">
        <h2>Mijn Rittenstaten</h2>
      </header>

      <div className="logs-grid">
        {sortedLogs.map((log) => (
          <div key={log.id} className="log-card">
            <div className="log-card-content">
              <div className="log-card-header">
                <div className="header-title-group">
                  <h3>
                    {log.datum ? new Date(log.datum).toLocaleDateString('nl-NL', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Onbekende datum'}
                  </h3>
                  <span className="driver-name">{log.naam || 'Geen naam'}</span>
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
        ))}
      </div>
    </div>
  );
}

export default MyTripLogs;
