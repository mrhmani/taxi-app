import { useState, useEffect, useRef } from 'react';
import SignatureDialog from './SignatureDialog';
import ActionDialog from './ActionDialog';
import { v4 as uuidv4 } from 'uuid';
import { downloadPdf, downloadPakbonPdf } from '../utils/pdfGenerator';
import './RittenstaatForm.css';

const TrashIcon = () => (
  <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);

const PlusIcon = () => (
  <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const DEFAULT_HEADER_LEFT = {
  kmStandBegin: '',
  kmStandEind: '',
  litersGetankt: '',
  ruimteKantoor: ''
};

const DEFAULT_HEADER_RIGHT = {
  wagenNummer: '',
  kenteken: '',
  naam: '',
  datum: '',
  dag: '',
  werktijdVan: '',
  werktijdTot: ''
};

const createDefaultTrip = (index = 0) => ({
  id: `trip-${Date.now()}-${index}-${Math.random()}`,
  beginTijd: '',
  van: '',
  naar: '',
  eindTijd: '',
  ritprijsContant: '',
  ritprijsRekening: '',
  ritprijsPin: '',
  rekeninghouderOpmerkingen: ''
});

const createDefaultTrips = (count) => {
  return Array.from({ length: count }).map((_, i) => createDefaultTrip(i));
};

const REQUIRED_FIELDS = [
  { key: 'wagenNummer', label: 'Wagen nummer' },
  { key: 'kenteken', label: 'Kenteken' },
  { key: 'naam', label: 'Naam' },
  { key: 'datum', label: 'Datum' },
  { key: 'dag', label: 'Dag' },
  { key: 'werktijdVan', label: 'Werktijd van' },
  { key: 'werktijdTot', label: 'Tot' }
];

function RittenstaatForm({ initialData, onSave, onReset, onSend, onFormChange }) {
  const [headerLeft, setHeaderLeft] = useState(() => {
    if (initialData) {
      return {
        kmStandBegin: initialData.kmStandBegin || '',
        kmStandEind: initialData.kmStandEind || '',
        litersGetankt: initialData.litersGetankt || '',
        ruimteKantoor: initialData.ruimteKantoor || ''
      };
    }
    return DEFAULT_HEADER_LEFT;
  });

  const [headerRight, setHeaderRight] = useState(() => {
    if (initialData) {
      return {
        wagenNummer: initialData.wagenNummer || '',
        kenteken: initialData.kenteken || '',
        naam: initialData.naam || '',
        datum: initialData.datum || '',
        dag: initialData.dag || '',
        werktijdVan: initialData.werktijdVan || '',
        werktijdTot: initialData.werktijdTot || ''
      };
    }
    return DEFAULT_HEADER_RIGHT;
  });

  const [trips, setTrips] = useState(() => {
    if (initialData && initialData.trips && initialData.trips.length > 0) {
      const loadedTrips = initialData.trips.map((t, idx) => ({
        ...t,
        id: t.id || `loaded-${idx}-${Math.random()}`
      }));
      if (loadedTrips.length < 17) {
        const padCount = 17 - loadedTrips.length;
        const padded = createDefaultTrips(padCount);
        return [...loadedTrips, ...padded];
      }
      return loadedTrips;
    }
    return createDefaultTrips(17);
  });

  const [signature, setSignature] = useState(() => initialData?.signature || null);
  const [pakbonnen, setPakbonnen] = useState(() => initialData?.pakbonnen || []);

  const [formId, setFormId] = useState(() => initialData?.id || uuidv4());
  const [dateCreated, setDateCreated] = useState(() => initialData?.dateCreated || null);
  const [status, setStatus] = useState(() => initialData?.status || null);
  const [submittedAt, setSubmittedAt] = useState(() => initialData?.submittedAt || null);

  const [errors, setErrors] = useState({});
  const [signatureTarget, setSignatureTarget] = useState(null); // 'rittenstaat' or pakbon.id
  const [activeDialog, setActiveDialog] = useState(null);

  const shouldScrollToNewPakbonRef = useRef(false);

  // Scroll to newly added pakbon
  useEffect(() => {
    if (shouldScrollToNewPakbonRef.current) {
      shouldScrollToNewPakbonRef.current = false;
      const pakbonElements = document.querySelectorAll('.pakbon-document');
      if (pakbonElements.length > 0) {
        const lastPakbon = pakbonElements[pakbonElements.length - 1];
        lastPakbon.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [pakbonnen]);

  const createEmptyPakbon = () => ({
    id: uuidv4(),
    chauffeur: '',
    kenteken: '',
    scheepsnaam: '',
    bedrijf: '',
    naam: '',
    signature: null,
    van: '',
    naar: '',
    datum: '',
    tijd: '',
    ritprijs: ''
  });

  // Notify parent App on any state change for auto-saving to Supabase
  useEffect(() => {
    if (onFormChange) {
      onFormChange({
        ...headerLeft,
        ...headerRight,
        trips: trips.map((t, i) => ({ ...t, ritNr: i + 1 })),
        signature,
        pakbonnen,
        id: formId,
        dateCreated,
        status,
        submittedAt
      });
    }
  }, [headerLeft, headerRight, trips, signature, pakbonnen, formId, dateCreated, status, submittedAt, onFormChange]);

  // Initialize data when editing/opening an existing log
  useEffect(() => {
    if (initialData) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setHeaderLeft({
        kmStandBegin: initialData.kmStandBegin || '',
        kmStandEind: initialData.kmStandEind || '',
        litersGetankt: initialData.litersGetankt || '',
        ruimteKantoor: initialData.ruimteKantoor || ''
      });
      setHeaderRight({
        wagenNummer: initialData.wagenNummer || '',
        kenteken: initialData.kenteken || '',
        naam: initialData.naam || '',
        datum: initialData.datum || '',
        dag: initialData.dag || '',
        werktijdVan: initialData.werktijdVan || '',
        werktijdTot: initialData.werktijdTot || ''
      });
      if (initialData.trips && initialData.trips.length > 0) {
        const loadedTrips = initialData.trips.map((t, idx) => ({
          ...t,
          id: t.id || `loaded-${idx}-${Math.random()}`
        }));
        if (loadedTrips.length < 17) {
          const padCount = 17 - loadedTrips.length;
          const padded = createDefaultTrips(padCount);
          setTrips([...loadedTrips, ...padded]);
        } else {
          setTrips(loadedTrips);
        }
      } else {
        setTrips(createDefaultTrips(17));
      }
      setSignature(initialData.signature || null);
      setPakbonnen(initialData.pakbonnen || []);
      setFormId(initialData.id || null);
      setDateCreated(initialData.dateCreated || null);
      setStatus(initialData.status || null);
      setSubmittedAt(initialData.submittedAt || null);
      setErrors({});
    }
  }, [initialData]);

  const handleLeftChange = (e) => {
    const { name, value } = e.target;
    setHeaderLeft(prev => ({ ...prev, [name]: value }));
  };

  const handleRightChange = (e) => {
    const { name, value } = e.target;
    setHeaderRight(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handlePakbonChange = (id, field, value) => {
    setPakbonnen(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
    if (errors[`${id}-${field}`]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`${id}-${field}`];
        return newErrors;
      });
    }
  };

  const addPakbon = () => {
    shouldScrollToNewPakbonRef.current = true;
    setPakbonnen([...pakbonnen, createEmptyPakbon()]);
  };

  const confirmRemovePakbon = (id) => {
    setActiveDialog({
      type: 'confirm',
      message: 'Weet je zeker dat je deze pakbon wilt verwijderen?',
      confirmText: 'Verwijderen',
      cancelText: 'Annuleren',
      onConfirm: () => {
        setPakbonnen(prev => prev.filter(p => p.id !== id));
        setActiveDialog(null);
      },
      onCancel: () => {
        setActiveDialog(null);
      }
    });
  };

  const handleTripChange = (id, field, value) => {
    setTrips(trips.map(trip => trip.id === id ? { ...trip, [field]: value } : trip));
  };

  const addTripRow = () => {
    setTrips([...trips, createDefaultTrip(trips.length)]);
  };

  const removeTripRow = (id) => {
    if (trips.length > 1) {
      setTrips(trips.filter(trip => trip.id !== id));
    }
  };

  const validate = () => {
    const newErrors = {};
    REQUIRED_FIELDS.forEach(field => {
      if (!headerRight[field.key] || headerRight[field.key].trim() === '') {
        newErrors[field.key] = true;
      }
    });

    pakbonnen.forEach(pakbon => {
      if (!pakbon.chauffeur || pakbon.chauffeur.trim() === '') newErrors[`${pakbon.id}-chauffeur`] = true;
      if (!pakbon.kenteken || pakbon.kenteken.trim() === '') newErrors[`${pakbon.id}-kenteken`] = true;
      if (!pakbon.scheepsnaam || pakbon.scheepsnaam.trim() === '') newErrors[`${pakbon.id}-scheepsnaam`] = true;
      if (!pakbon.bedrijf || pakbon.bedrijf.trim() === '') newErrors[`${pakbon.id}-bedrijf`] = true;
      if (!pakbon.naam || pakbon.naam.trim() === '') newErrors[`${pakbon.id}-naam`] = true;
      if (!pakbon.signature) newErrors[`${pakbon.id}-signature`] = true;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const compileLogData = () => {
    return {
      ...headerLeft,
      ...headerRight,
      trips: trips.map((t, i) => ({ ...t, ritNr: i + 1 })), // Automatically set ritNr
      signature,
      pakbonnen,
      id: formId,
      dateCreated,
      status,
      submittedAt
    };
  };

  const handleSaveClick = () => {
    if (validate()) {
      onSave(compileLogData());
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSendClick = () => {
    if (validate()) {
      onSend(compileLogData());
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetClick = () => {
    onReset();
  };

  const handleSaveSignature = (sigData) => {
    if (signatureTarget === 'rittenstaat') {
      setSignature(sigData);
    } else {
      setPakbonnen(prev => prev.map(p => p.id === signatureTarget ? { ...p, signature: sigData } : p));
    }
    setSignatureTarget(null);
  };

  const handleRemoveSignature = () => {
    if (signatureTarget === 'rittenstaat') {
      setSignature(null);
    } else {
      setPakbonnen(prev => prev.map(p => p.id === signatureTarget ? { ...p, signature: null } : p));
    }
    setSignatureTarget(null);
  };

  const rittenstaatInvalidFields = REQUIRED_FIELDS.filter(f => errors[f.key]);

  const pakbonInvalidList = pakbonnen.map((pakbon, index) => {
    const missing = [];
    if (errors[`${pakbon.id}-chauffeur`]) missing.push('Chauffeur ontbreekt');
    if (errors[`${pakbon.id}-kenteken`]) missing.push('Kenteken ontbreekt');
    if (errors[`${pakbon.id}-scheepsnaam`]) missing.push('Scheepsnaam ontbreekt');
    if (errors[`${pakbon.id}-bedrijf`]) missing.push('Bedrijf ontbreekt');
    if (errors[`${pakbon.id}-naam`]) missing.push('Naam ontbreekt');
    if (errors[`${pakbon.id}-signature`]) missing.push('Handtekening ontbreekt');
    return { index: index + 1, missing };
  }).filter(p => p.missing.length > 0);

  const hasAnyErrors = rittenstaatInvalidFields.length > 0 || pakbonInvalidList.length > 0;

  const totalContant = trips.reduce((sum, trip) => sum + (parseFloat(trip.ritprijsContant) || 0), 0);
  const totalRekening = trips.reduce((sum, trip) => sum + (parseFloat(trip.ritprijsRekening) || 0), 0);
  const totalPin = trips.reduce((sum, trip) => sum + (parseFloat(trip.ritprijsPin) || 0), 0);
  
  const hasAnyPrice = trips.some(t => 
    (t.ritprijsContant !== undefined && t.ritprijsContant !== '') || 
    (t.ritprijsRekening !== undefined && t.ritprijsRekening !== '') || 
    (t.ritprijsPin !== undefined && t.ritprijsPin !== '')
  );

  const displayTotal = (total) => {
    if (!hasAnyPrice && total === 0) return '';
    return Number.isInteger(total) ? total : Number(total.toFixed(2));
  };

  return (
    <div className="rittenstaat-wrapper">
      
      {hasAnyErrors && (
        <div className="validation-banner">
          <p>Kan niet opslaan. Vul de volgende verplichte velden in:</p>
          
          {rittenstaatInvalidFields.length > 0 && (
            <div className="validation-group">
              <span className="validation-group-title">Rittenstaat:</span>
              <ul>
                {rittenstaatInvalidFields.map(f => (
                  <li key={f.key}>{f.label}</li>
                ))}
              </ul>
            </div>
          )}

          {pakbonInvalidList.map(p => (
            <div key={p.index} className="validation-group">
              <span className="validation-group-title">Pakbon {p.index}:</span>
              <ul>
                {p.missing.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      {/* PAPER DOCUMENT */}
      <div className="paper-document rittenstaat-document">
        
        {/* ACTION BADGE FOR PAKBON */}
        <button className="add-pakbon-badge" onClick={addPakbon} type="button">
          + Pakbon
        </button>
        
        {/* PAPER HEADER */}
        <div className="paper-header">
          
          {/* Header Left: KM & Liters */}
          <div className="paper-header-left">
            <div className="paper-line-input">
              <label>KM stand begin:</label>
              <input type="number" name="kmStandBegin" value={headerLeft.kmStandBegin} onChange={handleLeftChange} />
            </div>
            <div className="paper-line-input">
              <label>KM stand eind:</label>
              <input type="number" name="kmStandEind" value={headerLeft.kmStandEind} onChange={handleLeftChange} />
            </div>
            <div className="paper-line-input">
              <label>Liters getankt:</label>
              <input type="number" step="0.01" name="litersGetankt" value={headerLeft.litersGetankt} onChange={handleLeftChange} />
            </div>
          </div>
          
          {/* Header Middle: Ruimte Kantoor */}
          <div className="paper-header-middle">
            <div className="ruimte-kantoor-box">
              <div className="box-label">Ruimte kantoor:</div>
              <textarea name="ruimteKantoor" value={headerLeft.ruimteKantoor} onChange={handleLeftChange}></textarea>
            </div>
          </div>

          {/* Header Right: Driver & Vehicle Details */}
          <div className="paper-header-right">
            <div className="paper-box-input">
              <label>Wagen nummer:</label>
              <input type="text" name="wagenNummer" className={errors.wagenNummer ? 'invalid' : ''} value={headerRight.wagenNummer} onChange={handleRightChange} />
            </div>
            <div className="paper-line-input">
              <label>Kenteken:</label>
              <input type="text" name="kenteken" className={errors.kenteken ? 'invalid' : ''} value={headerRight.kenteken} onChange={handleRightChange} />
            </div>
            <div className="paper-line-input">
              <label>Naam:</label>
              <input type="text" name="naam" className={errors.naam ? 'invalid' : ''} value={headerRight.naam} onChange={handleRightChange} />
            </div>
            <div className="paper-line-input date-line">
              <label>Datum:</label>
              <input type="date" name="datum" className={errors.datum ? 'invalid' : ''} value={headerRight.datum} onChange={handleRightChange} />
              <label className="inline-label">Dag:</label>
              <input type="text" name="dag" className={errors.dag ? 'invalid' : ''} value={headerRight.dag} onChange={handleRightChange} />
            </div>
            <div className="paper-line-input time-line">
              <label>Werktijd van:</label>
              <input type="time" name="werktijdVan" className={errors.werktijdVan ? 'invalid' : ''} value={headerRight.werktijdVan} onChange={handleRightChange} />
              <label className="inline-label">Tot:</label>
              <input type="time" name="werktijdTot" className={errors.werktijdTot ? 'invalid' : ''} value={headerRight.werktijdTot} onChange={handleRightChange} />
            </div>
          </div>
        </div>

        {/* PAPER TABLE */}
        <div className="paper-table-container">
          <table className="paper-table">
            <thead>
              <tr>
                <th rowSpan="2" className="col-nr">Rit<br/>nr</th>
                <th rowSpan="2" className="col-time">Begin<br/>tijd</th>
                <th rowSpan="2" className="col-loc">Van:</th>
                <th rowSpan="2" className="col-loc">Naar:</th>
                <th rowSpan="2" className="col-time">Eind<br/>tijd</th>
                <th colSpan="3" className="col-group-title">Ritprijs</th>
                <th rowSpan="2" className="col-opm">Rekeninghouder en opmerkingen</th>
                <th rowSpan="2" className="col-action print-hide" aria-label="Rij-acties"></th>
              </tr>
              <tr>
                <th className="col-price">Contant</th>
                <th className="col-price">Rekening</th>
                <th className="col-price">Pin</th>
              </tr>
            </thead>
            <tbody>
              {trips.map((trip, index) => (
                <tr key={trip.id}>
                  <td className="col-nr cell-centered">{index + 1}</td>
                  <td className="col-time">
                    <input type="time" value={trip.beginTijd} onChange={e => handleTripChange(trip.id, 'beginTijd', e.target.value)} />
                  </td>
                  <td className="col-loc">
                    <input type="text" value={trip.van} onChange={e => handleTripChange(trip.id, 'van', e.target.value)} />
                  </td>
                  <td className="col-loc">
                    <input type="text" value={trip.naar} onChange={e => handleTripChange(trip.id, 'naar', e.target.value)} />
                  </td>
                  <td className="col-time">
                    <input type="time" value={trip.eindTijd} onChange={e => handleTripChange(trip.id, 'eindTijd', e.target.value)} />
                  </td>
                  <td className="col-price">
                    <input type="number" step="0.01" value={trip.ritprijsContant} onChange={e => handleTripChange(trip.id, 'ritprijsContant', e.target.value)} />
                  </td>
                  <td className="col-price">
                    <input type="number" step="0.01" value={trip.ritprijsRekening} onChange={e => handleTripChange(trip.id, 'ritprijsRekening', e.target.value)} />
                  </td>
                  <td className="col-price">
                    <input type="number" step="0.01" value={trip.ritprijsPin} onChange={e => handleTripChange(trip.id, 'ritprijsPin', e.target.value)} />
                  </td>
                  <td className="col-opm">
                    <input type="text" value={trip.rekeninghouderOpmerkingen} onChange={e => handleTripChange(trip.id, 'rekeninghouderOpmerkingen', e.target.value)} />
                  </td>
                  <td className="col-action print-hide">
                    <div className="row-actions">
                      <button 
                        type="button" 
                        className="row-action-btn delete-row-btn" 
                        onClick={() => removeTripRow(trip.id)} 
                        disabled={trips.length === 1} 
                        title="Rij verwijderen"
                        aria-label="Rij verwijderen"
                      >
                        <TrashIcon />
                      </button>
                      {index === trips.length - 1 && (
                        <button 
                          type="button" 
                          className="row-action-btn add-row-btn" 
                          onClick={addTripRow} 
                          title="Rij toevoegen"
                          aria-label="Rij toevoegen"
                        >
                          <PlusIcon />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="totalen-row">
                <td colSpan="4" className="footer-no-border"></td>
                <td className="totalen-label-cell">Totalen:</td>
                <td className="total-box">{displayTotal(totalContant)}</td>
                <td className="total-box">{displayTotal(totalRekening)}</td>
                <td className="total-box">{displayTotal(totalPin)}</td>
                <td colSpan="2" className="footer-no-border"></td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* PAPER FOOTER */}
        <div className="paper-footer">
          <div className="paper-footer-left">
            <div className="important-note">BELANGRIJK: Pauze óók in de BCT invoeren!</div>
            <div className="company-info">Taxi Livo B.V., Logistiekweg 1, 4387PK Vlissingen. Tel: 0118 - 635 800 E-mail: info@taxilivo.nl</div>
          </div>
          
          <div className="paper-footer-right">
            <div className="parafen-section">
              <span className="parafen-label">Parafen kantoor:</span>
              <div className="signature-boxes">
                {signature ? (
                  <div className="signature-container">
                    <img 
                      src={signature.dataUrl} 
                      alt="Signature" 
                      className="signature-image" 
                      onClick={() => setSignatureTarget('rittenstaat')} 
                    />
                  </div>
                ) : (
                  <div className="sig-box" onClick={() => setSignatureTarget('rittenstaat')}></div>
                )}
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* PAKBONNEN */}
      {pakbonnen.map((pakbon) => (
        <div key={pakbon.id} className="paper-document pakbon-document" style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', top: '10px', right: '10px', display: 'flex', gap: '8px', zIndex: 10 }}>
            <button 
              type="button"
              className="app-btn app-btn-secondary" 
              style={{ padding: '6px 12px', fontSize: '12px', height: '36px', display: 'flex', alignItems: 'center' }}
              onClick={() => downloadPakbonPdf(pakbon, `pakbon-${pakbon.datum || new Date().toISOString().split('T')[0]}.pdf`)}
              title="Download Pakbon als PDF"
            >
              PDF
            </button>
            <button 
              type="button"
              className="remove-pakbon-btn" 
              style={{ position: 'relative', top: '0', right: '0' }}
              onClick={() => confirmRemovePakbon(pakbon.id)} 
              title="Pakbon verwijderen" 
              aria-label="Pakbon verwijderen"
            >
              <TrashIcon />
            </button>
          </div>
          
          <div className="pakbon-header">
            <div className="pakbon-header-left">
              <div className="pakbon-brand">
                <img src="/taxi-livo-logo.png" alt="Taxi Livo Logo" className="pakbon-logo" />
              </div>
              <div className="pakbon-company-details">
                Logistiekweg 1, 4387 PK Vlissingen<br/>
                Tel. +31 118 - 635 800<br/>
                <a href="mailto:info@taxilivo.nl">info@taxilivo.nl</a><br/>
                <a href="http://www.taxilivo.nl" target="_blank" rel="noopener noreferrer">www.taxilivo.nl</a>
              </div>
            </div>
            
            <div className="pakbon-fields-right">
              <div className="paper-line-input">
                <label>Chauffeur:</label>
                <input type="text" className={errors[`${pakbon.id}-chauffeur`] ? 'invalid' : ''} value={pakbon.chauffeur} onChange={e => handlePakbonChange(pakbon.id, 'chauffeur', e.target.value)} />
              </div>
              <div className="paper-line-input">
                <label>Kenteken:</label>
                <input type="text" className={errors[`${pakbon.id}-kenteken`] ? 'invalid' : ''} value={pakbon.kenteken} onChange={e => handlePakbonChange(pakbon.id, 'kenteken', e.target.value)} />
              </div>
            </div>
          </div>

          <div className="pakbon-checkered-strip"></div>

          <div className="pakbon-fields-grid">
            <div className="pakbon-row-two-col">
              <div className="paper-line-input">
                <label>Bedrijf:</label>
                <input type="text" className={errors[`${pakbon.id}-bedrijf`] ? 'invalid' : ''} value={pakbon.bedrijf} onChange={e => handlePakbonChange(pakbon.id, 'bedrijf', e.target.value)} />
              </div>
              <div className="paper-line-input">
                <label>Scheepsnaam:</label>
                <input type="text" className={errors[`${pakbon.id}-scheepsnaam`] ? 'invalid' : ''} value={pakbon.scheepsnaam} onChange={e => handlePakbonChange(pakbon.id, 'scheepsnaam', e.target.value)} />
              </div>
            </div>

            <div className="pakbon-row-single-col">
              <div className="paper-line-input">
                <label>Naam:</label>
                <input type="text" className={errors[`${pakbon.id}-naam`] ? 'invalid' : ''} value={pakbon.naam} onChange={e => handlePakbonChange(pakbon.id, 'naam', e.target.value)} />
              </div>
            </div>
            
            <div className="pakbon-row-single-col">
              <div className="paper-line-input">
                <label>Van:</label>
                <input type="text" value={pakbon.van} onChange={e => handlePakbonChange(pakbon.id, 'van', e.target.value)} />
              </div>
            </div>
            
            <div className="pakbon-row-single-col">
              <div className="paper-line-input">
                <label>Naar:</label>
                <input type="text" value={pakbon.naar} onChange={e => handlePakbonChange(pakbon.id, 'naar', e.target.value)} />
              </div>
            </div>
            
            <div className="pakbon-row-two-col pakbon-date-time-row">
              <div className="paper-line-input">
                <label>Datum:</label>
                <input type="date" value={pakbon.datum} onChange={e => handlePakbonChange(pakbon.id, 'datum', e.target.value)} />
              </div>
              <div className="paper-line-input time-input">
                <label>Tijd:</label>
                <input type="time" value={pakbon.tijd} onChange={e => handlePakbonChange(pakbon.id, 'tijd', e.target.value)} />
              </div>
            </div>
            
            <div className="pakbon-bottom-row">
              <div className="paper-line-input pakbon-ritprijs-container">
                <label>Ritprijs:</label>
                <input type="number" step="0.01" value={pakbon.ritprijs} onChange={e => handlePakbonChange(pakbon.id, 'ritprijs', e.target.value)} />
              </div>
              
              <div className="paper-line-input pakbon-signature-input">
                <label className={errors[`${pakbon.id}-signature`] ? 'invalid-text' : ''}>Handtekening:</label>
                <div className="signature-boxes">
                  {pakbon.signature ? (
                    <div className="signature-container">
                      <img 
                        src={pakbon.signature.dataUrl} 
                        alt="Signature" 
                        className="signature-image" 
                        onClick={() => setSignatureTarget(pakbon.id)} 
                      />
                    </div>
                  ) : (
                    <div className={`sig-box ${errors[`${pakbon.id}-signature`] ? 'invalid' : ''}`} onClick={() => setSignatureTarget(pakbon.id)}></div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* ACTION BUTTONS (Outside Paper, directly below document) */}
      <div className="action-buttons-bar">
        <button className="app-btn app-btn-secondary" onClick={handleResetClick}>Rittenstaat Wissen</button>
        <button className="app-btn app-btn-secondary" onClick={() => {
          downloadPdf([compileLogData()], `document-${headerRight.datum || new Date().toISOString().split('T')[0]}.pdf`);
        }}>Download als PDF</button>
        <button className="app-btn app-btn-secondary" onClick={handleSaveClick}>Rittenstaat Opslaan</button>
        <button className="app-btn app-btn-secondary" onClick={handleSendClick}>Rittenstaat Verzenden</button>
      </div>

      {signatureTarget && (
        <SignatureDialog 
          onClose={() => setSignatureTarget(null)} 
          onSave={handleSaveSignature}
          onRemove={handleRemoveSignature}
          hasSavedSignature={signatureTarget === 'rittenstaat' ? !!signature : !!pakbonnen.find(p => p.id === signatureTarget)?.signature}
        />
      )}

      {activeDialog && (
        <ActionDialog
          type={activeDialog.type}
          message={activeDialog.message}
          confirmText={activeDialog.confirmText}
          cancelText={activeDialog.cancelText}
          onConfirm={activeDialog.onConfirm}
          onCancel={activeDialog.onCancel}
        />
      )}
    </div>
  );
}

export default RittenstaatForm;
