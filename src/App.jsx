import { useState, useEffect } from 'react';
import Login from './components/Login';
import RittenstaatForm from './components/RittenstaatForm';
import Navigation from './components/Navigation';
import MyTripLogs from './components/MyTripLogs';
import ActionDialog from './components/ActionDialog';
import { supabase } from './supabase';
import { v4 as uuidv4 } from 'uuid';
import './index.css';

// Helper to validate UUID format
const isValidUUID = (str) => {
  if (typeof str !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
};

// Data mapping helpers between React state and Supabase relational schema
const mapDbPakbonToState = (dbPakbon) => ({
  id: dbPakbon.id,
  chauffeur: dbPakbon.chauffeur || '',
  kenteken: dbPakbon.kenteken || '',
  scheepsnaam: dbPakbon.scheepsnaam || '',
  bedrijf: dbPakbon.bedrijf || '',
  naam: dbPakbon.naam || '',
  signature: dbPakbon.signature ? { type: 'draw', dataUrl: dbPakbon.signature } : null,
  van: dbPakbon.van || '',
  naar: dbPakbon.naar || '',
  datum: dbPakbon.datum || '',
  tijd: dbPakbon.tijd || '',
  ritprijs: dbPakbon.ritprijs !== null ? String(dbPakbon.ritprijs) : ''
});

const mapDbFormToState = (dbForm) => ({
  id: dbForm.id,
  status: dbForm.status || 'saved',
  dateCreated: dbForm.created_at,
  dateModified: dbForm.updated_at,
  submittedAt: dbForm.submitted_at,
  kmStandBegin: dbForm.km_stand_begin !== null ? String(dbForm.km_stand_begin) : '',
  kmStandEind: dbForm.km_stand_eind !== null ? String(dbForm.km_stand_eind) : '',
  litersGetankt: dbForm.liters_getankt !== null ? String(dbForm.liters_getankt) : '',
  ruimteKantoor: dbForm.ruimte_kantoor || '',
  wagenNummer: dbForm.wagen_nummer || '',
  kenteken: dbForm.kenteken || '',
  naam: dbForm.naam || '',
  datum: dbForm.datum || '',
  dag: dbForm.dag || '',
  werktijdVan: dbForm.werktijd_van || '',
  werktijdTot: dbForm.werktijd_tot || '',
  signature: dbForm.signature ? { type: 'draw', dataUrl: dbForm.signature } : null,
  trips: Array.isArray(dbForm.rides) ? dbForm.rides : [],
  pakbonnen: Array.isArray(dbForm.pakbonnen) 
    ? dbForm.pakbonnen.map(mapDbPakbonToState) 
    : []
});

const mapStateToDbForm = (stateForm, userId) => ({
  id: isValidUUID(stateForm.id) ? stateForm.id : uuidv4(),
  user_id: userId,
  status: stateForm.status || 'saved',
  submitted_at: stateForm.submittedAt || null,
  km_stand_begin: stateForm.kmStandBegin !== '' ? parseInt(stateForm.kmStandBegin, 10) : null,
  km_stand_eind: stateForm.kmStandEind !== '' ? parseInt(stateForm.kmStandEind, 10) : null,
  liters_getankt: stateForm.litersGetankt !== '' ? parseFloat(stateForm.litersGetankt) : null,
  ruimte_kantoor: stateForm.ruimteKantoor || null,
  wagen_nummer: stateForm.wagenNummer || null,
  kenteken: stateForm.kenteken || null,
  naam: stateForm.naam || null,
  datum: stateForm.datum || null,
  dag: stateForm.dag || null,
  werktijd_van: stateForm.werktijdVan || null,
  werktijd_tot: stateForm.werktijdTot || null,
  signature: stateForm.signature ? stateForm.signature.dataUrl : null,
  rides: stateForm.trips || []
});

const mapStateToDbPakbon = (statePakbon, formId, userId) => ({
  id: isValidUUID(statePakbon.id) ? statePakbon.id : uuidv4(),
  form_id: formId,
  user_id: userId,
  chauffeur: statePakbon.chauffeur || null,
  kenteken: statePakbon.kenteken || null,
  scheepsnaam: statePakbon.scheepsnaam || null,
  bedrijf: statePakbon.bedrijf || null,
  naam: statePakbon.naam || null,
  signature: statePakbon.signature ? statePakbon.signature.dataUrl : null,
  van: statePakbon.van || null,
  naar: statePakbon.naar || null,
  datum: statePakbon.datum || null,
  tijd: statePakbon.tijd || null,
  ritprijs: statePakbon.ritprijs !== '' ? parseFloat(statePakbon.ritprijs) : 0.00
});

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const savedAuth = localStorage.getItem('taxilivo_auth');
    return savedAuth === 'true';
  });
  const [isRecovering, setIsRecovering] = useState(false);
  const [currentView, setCurrentView] = useState(() => {
    return localStorage.getItem('taxilivo_current_view') || 'home';
  }); // 'home' or 'logs'
  const [currentLog, setCurrentLog] = useState(null);
  const [formResetIndex, setFormResetIndex] = useState(0);
  const [activeDialog, setActiveDialog] = useState(null);
  const [logs, setLogs] = useState(() => {
    const savedLogs = localStorage.getItem('taxilivo_trip_logs');
    if (savedLogs) {
      try {
        return JSON.parse(savedLogs);
      } catch (error) {
        console.error('Failed to parse logs from local storage', error);
        return [];
      }
    }
    return [];
  });

  // Save logs to local storage whenever they change (serves as the requested fallback cache)
  useEffect(() => {
    localStorage.setItem('taxilivo_trip_logs', JSON.stringify(logs));
  }, [logs]);

  // Persist current view
  useEffect(() => {
    localStorage.setItem('taxilivo_current_view', currentView);
  }, [currentView]);

  // Fetch logs from Supabase when user logs in or mounts
  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchLogs = async () => {
      try {
        console.log('Fetching logs from Supabase...');
        const { data, error } = await supabase
          .from('forms')
          .select('*, pakbonnen(*)')
          .order('datum', { ascending: false });

        if (error) throw error;

        if (data) {
          const mappedLogs = data.map(mapDbFormToState);
          console.log('Successfully synced logs from Supabase:', mappedLogs.length);
          setLogs(mappedLogs);
        }
      } catch (err) {
        console.warn('Supabase fetch failed, falling back to localStorage cache:', err.message);
        // We do not change `logs` state so it keeps whatever was loaded from localStorage.
      }
    };

    fetchLogs();
  }, [isLoggedIn]);

  // Handle Supabase auth state changes and session persistence
  useEffect(() => {
    // Check URL parameters for recovery flow fallback
    const checkIfRecovering = () => {
      const url = window.location.href;
      if (url.includes('type=recovery') || url.includes('recovery_token=') || url.includes('#access_token=')) {
        if (url.includes('type=recovery') || url.includes('recovery_token=')) {
          setIsRecovering(true);
        }
      }
    };
    checkIfRecovering();

    supabase.auth.getSession().then(({ data: { session } }) => {
      const loggedIn = !!session;
      setIsLoggedIn(loggedIn);
      localStorage.setItem('taxilivo_auth', loggedIn ? 'true' : 'false');
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const loggedIn = !!session;
      setIsLoggedIn(loggedIn);
      localStorage.setItem('taxilivo_auth', loggedIn ? 'true' : 'false');

      if (event === 'PASSWORD_RECOVERY') {
        setIsRecovering(true);
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const handleLogin = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      throw error;
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setLogs([]); // Clear logs state on sign out
    setCurrentView('home'); // Reset view so they land on home next time
    setCurrentLog(null); // Clear any active form data
  };

  const handlePasswordUpdatedComplete = async () => {
    await supabase.auth.signOut();
    setIsRecovering(false);
  };

  const handleViewChange = (view) => {
    setCurrentView(view);
    if (view === 'home' && currentLog) {
      setCurrentLog(null);
    }
  };

  const handleSaveLog = async (logData) => {
    const now = new Date().toISOString();
    
    // Determine the form ID
    const formId = logData.id && isValidUUID(logData.id) 
      ? logData.id 
      : uuidv4();

    const localLog = {
      ...logData,
      id: formId,
      status: 'saved',
      dateCreated: logData.dateCreated || now,
      dateModified: now,
      submittedAt: logData.submittedAt || null
    };

    // 1. Update React state & localStorage immediately (fallback logic)
    const updatedLogs = logs.some(log => log.id === logData.id)
      ? logs.map(log => log.id === logData.id ? localLog : log)
      : [...logs, localLog];
    
    setLogs(updatedLogs);

    // Show immediate local confirmation
    setActiveDialog({
      type: 'success',
      message: 'Rittenstaat lokaal opgeslagen. Cloud synchroniseren...',
      onConfirm: () => setActiveDialog(null)
    });

    // 2. Perform background sync with Supabase
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Geen actieve gebruiker gevonden.');

      // Map local log state to Supabase structure
      const dbForm = mapStateToDbForm(localLog, user.id);
      dbForm.updated_at = now;
      if (!logData.id || !isValidUUID(logData.id)) {
        dbForm.created_at = now;
      }

      // Upsert parent form
      const { data: savedFormArray, error: formError } = await supabase
        .from('forms')
        .upsert(dbForm)
        .select();

      if (formError) throw formError;
      const finalFormId = savedFormArray[0].id;

      // Map and upsert associated pakbonnen
      const currentPakbonIds = [];
      const pakbonnenToUpsert = [];

      if (localLog.pakbonnen && localLog.pakbonnen.length > 0) {
        localLog.pakbonnen.forEach(p => {
          const dbPakbon = mapStateToDbPakbon(p, finalFormId, user.id);
          pakbonnenToUpsert.push(dbPakbon);
        });

        const { data: savedPakbonnenArray, error: pakbonError } = await supabase
          .from('pakbonnen')
          .upsert(pakbonnenToUpsert)
          .select();

        if (pakbonError) throw pakbonError;
        if (savedPakbonnenArray) {
          savedPakbonnenArray.forEach(p => currentPakbonIds.push(p.id));
        }
      }

      // Clean up orphaned pakbonnen (deleted in frontend)
      if (currentPakbonIds.length > 0) {
        const { error: deleteError } = await supabase
          .from('pakbonnen')
          .delete()
          .eq('form_id', finalFormId)
          .not('id', 'in', `(${currentPakbonIds.join(',')})`);
        
        if (deleteError) throw deleteError;
      } else {
        const { error: deleteError } = await supabase
          .from('pakbonnen')
          .delete()
          .eq('form_id', finalFormId);
        
        if (deleteError) throw deleteError;
      }

      // Query database for fully resolved, joined parent-child data
      const { data: finalForm, error: fetchError } = await supabase
        .from('forms')
        .select('*, pakbonnen(*)')
        .eq('id', finalFormId)
        .single();

      if (fetchError) throw fetchError;

      if (finalForm) {
        const finalMappedLog = mapDbFormToState(finalForm);
        // Replace temp/draft with cloud-synchronized data in state (updating localStorage automatically)
        setLogs(prevLogs => prevLogs.map(log => 
          log.id === formId || log.id === logData.id ? finalMappedLog : log
        ));
      }

      // Show final cloud success dialog
      setActiveDialog({
        type: 'success',
        message: 'Rittenstaat succesvol opgeslagen en gesynchroniseerd.',
        onConfirm: () => setActiveDialog(null)
      });
    } catch (err) {
      console.error('Supabase sync failed (using localStorage fallback):', err.message);
      setActiveDialog({
        type: 'error',
        message: `Lokaal opgeslagen. Cloud synchronisatie mislukt: ${err.message}. Probeer het later opnieuw.`,
        onConfirm: () => setActiveDialog(null)
      });
    }

    setCurrentLog(null);
    setCurrentView('home');
  };

  const handleResetLog = () => {
    setActiveDialog({
      type: 'confirm',
      message: 'Are you sure you want to reset this rittenstaat?',
      onConfirm: () => {
        setCurrentLog(null);
        setFormResetIndex(prev => prev + 1);
        setActiveDialog({
          type: 'success',
          message: 'Rittenstaat successfully reset.',
          onConfirm: () => setActiveDialog(null)
        });
      },
      onCancel: () => setActiveDialog(null)
    });
  };

  // Dedicated submission service helper (for future email delivery integration)
  const submitTripLog = async (logData) => {
    console.log('Sending trip log email to info@taxilivo.nl:', logData);
    return true;
  };

  const handleSendLog = (logData) => {
    setActiveDialog({
      type: 'confirm',
      message: 'Are you sure you want to submit this rittenstaat?',
      onConfirm: async () => {
        const now = new Date().toISOString();
        const formId = logData.id && isValidUUID(logData.id) 
          ? logData.id 
          : uuidv4();

        const localLog = {
          ...logData,
          id: formId,
          status: 'submitted',
          dateCreated: logData.dateCreated || now,
          dateModified: now,
          submittedAt: now
        };

        // 1. Update locally first
        const updatedLogs = logs.some(log => log.id === logData.id)
          ? logs.map(log => log.id === logData.id ? localLog : log)
          : [...logs, localLog];
        
        setLogs(updatedLogs);

        setActiveDialog({
          type: 'success',
          message: 'Rittenstaat lokaal ingezonden. Cloud synchroniseren...',
          onConfirm: () => setActiveDialog(null)
        });

        // 2. Perform background sync with Supabase
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Geen actieve gebruiker gevonden.');

          const dbForm = mapStateToDbForm(localLog, user.id);
          dbForm.updated_at = now;
          dbForm.submitted_at = now;
          if (!logData.id || !isValidUUID(logData.id)) {
            dbForm.created_at = now;
          }

          const { data: savedFormArray, error: formError } = await supabase
            .from('forms')
            .upsert(dbForm)
            .select();

          if (formError) throw formError;
          const finalFormId = savedFormArray[0].id;

          const currentPakbonIds = [];
          const pakbonnenToUpsert = [];

          if (localLog.pakbonnen && localLog.pakbonnen.length > 0) {
            localLog.pakbonnen.forEach(p => {
              const dbPakbon = mapStateToDbPakbon(p, finalFormId, user.id);
              pakbonnenToUpsert.push(dbPakbon);
            });

            const { data: savedPakbonnenArray, error: pakbonError } = await supabase
              .from('pakbonnen')
              .upsert(pakbonnenToUpsert)
              .select();

            if (pakbonError) throw pakbonError;
            if (savedPakbonnenArray) {
              savedPakbonnenArray.forEach(p => currentPakbonIds.push(p.id));
            }
          }

          if (currentPakbonIds.length > 0) {
            await supabase.from('pakbonnen').delete().eq('form_id', finalFormId).not('id', 'in', `(${currentPakbonIds.join(',')})`);
          } else {
            await supabase.from('pakbonnen').delete().eq('form_id', finalFormId);
          }

          const { data: finalForm, error: fetchError } = await supabase
            .from('forms')
            .select('*, pakbonnen(*)')
            .eq('id', finalFormId)
            .single();

          if (fetchError) throw fetchError;

          if (finalForm) {
            const finalMappedLog = mapDbFormToState(finalForm);
            setLogs(prevLogs => prevLogs.map(log => 
              log.id === formId || log.id === logData.id ? finalMappedLog : log
            ));
          }

          await submitTripLog(localLog);

          setActiveDialog({
            type: 'success',
            message: 'Rittenstaat succesvol ingezonden en gesynchroniseerd.',
            onConfirm: () => setActiveDialog(null)
          });
        } catch (err) {
          console.error('Supabase sync failed (using localStorage fallback):', err.message);
          setActiveDialog({
            type: 'error',
            message: `Lokaal ingezonden. Cloud synchronisatie mislukt: ${err.message}. Probeer het later opnieuw.`,
            onConfirm: () => setActiveDialog(null)
          });
        }

        setCurrentLog(null);
        setCurrentView('home');
      },
      onCancel: () => setActiveDialog(null)
    });
  };

  const handleSubmitLog = (log) => {
    const formattedDate = new Date(log.datum || log.dateCreated).toLocaleDateString('nl-NL');
    setActiveDialog({
      type: 'confirm',
      message: `Are you sure you want to submit the trip log dated ${formattedDate}?`,
      onConfirm: async () => {
        const now = new Date().toISOString();
        
        const localLog = {
          ...log,
          status: 'submitted',
          submittedAt: now,
          dateModified: now
        };

        const updatedLogs = logs.map(l => l.id === log.id ? localLog : l);
        setLogs(updatedLogs);

        setActiveDialog({
          type: 'success',
          message: 'Status lokaal bijgewerkt. Cloud synchroniseren...',
          onConfirm: () => setActiveDialog(null)
        });

        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Geen actieve gebruiker gevonden.');

          let synced = false;
          if (isValidUUID(log.id)) {
            // Log might already be in Supabase. Try to update status and timestamp.
            const { data: updatedFormArray, error: updateError } = await supabase
              .from('forms')
              .update({ status: 'submitted', submitted_at: now, updated_at: now })
              .eq('id', log.id)
              .select();

            if (updateError) throw updateError;
            if (updatedFormArray && updatedFormArray.length > 0) {
              synced = true;
            }
          }

          if (!synced) {
            // Log only exists locally or update failed to find the row. Sync entire document.
            const dbForm = mapStateToDbForm(localLog, user.id);
            dbForm.updated_at = now;
            dbForm.submitted_at = now;

            const { data: savedFormArray, error: formError } = await supabase
              .from('forms')
              .upsert(dbForm)
              .select();

            if (formError) throw formError;
            const finalFormId = savedFormArray[0].id;

            const currentPakbonIds = [];
            const pakbonnenToUpsert = [];

            if (localLog.pakbonnen && localLog.pakbonnen.length > 0) {
              localLog.pakbonnen.forEach(p => {
                const dbPakbon = mapStateToDbPakbon(p, finalFormId, user.id);
                pakbonnenToUpsert.push(dbPakbon);
              });

              const { data: savedPakbonnenArray, error: pakbonError } = await supabase
                .from('pakbonnen')
                .upsert(pakbonnenToUpsert)
                .select();

              if (pakbonError) throw pakbonError;
              if (savedPakbonnenArray) {
                savedPakbonnenArray.forEach(p => currentPakbonIds.push(p.id));
              }
            }

            if (currentPakbonIds.length > 0) {
              await supabase.from('pakbonnen').delete().eq('form_id', finalFormId).not('id', 'in', `(${currentPakbonIds.join(',')})`);
            } else {
              await supabase.from('pakbonnen').delete().eq('form_id', finalFormId);
            }

            const { data: finalForm, error: fetchError } = await supabase
              .from('forms')
              .select('*, pakbonnen(*)')
              .eq('id', finalFormId)
              .single();

            if (fetchError) throw fetchError;

            if (finalForm) {
              const finalMappedLog = mapDbFormToState(finalForm);
              setLogs(prevLogs => prevLogs.map(l => l.id === log.id ? finalMappedLog : l));
            }
          }

          await submitTripLog(localLog);

          setActiveDialog({
            type: 'success',
            message: 'Trip log successfully submitted.',
            onConfirm: () => setActiveDialog(null)
          });
        } catch (err) {
          console.error('Supabase submission sync failed:', err.message);
          setActiveDialog({
            type: 'error',
            message: `Lokaal ingezonden. Cloud synchronisatie mislukt: ${err.message}. Probeer het later opnieuw.`,
            onConfirm: () => setActiveDialog(null)
          });
        }
      },
      onCancel: () => setActiveDialog(null)
    });
  };

  const handleOpenLog = (log) => {
    setCurrentLog(log);
    setCurrentView('home');
  };

  const handleDeleteLog = (id) => {
    setActiveDialog({
      type: 'confirm',
      message: 'Are you sure you want to permanently delete this trip log?',
      onConfirm: async () => {
        // 1. Delete locally first
        const updatedLogs = logs.filter(log => log.id !== id);
        setLogs(updatedLogs);

        setActiveDialog({
          type: 'success',
          message: 'Rittenstaat lokaal verwijderd. Cloud synchroniseren...',
          onConfirm: () => setActiveDialog(null)
        });

        // 2. Perform background deletion in Supabase if UUID exists
        try {
          if (isValidUUID(id)) {
            const { error } = await supabase
              .from('forms')
              .delete()
              .eq('id', id);

            if (error) throw error;
          }

          setActiveDialog({
            type: 'success',
            message: 'Trip log successfully deleted.',
            onConfirm: () => setActiveDialog(null)
          });
        } catch (err) {
          console.error('Supabase deletion sync failed:', err.message);
          setActiveDialog({
            type: 'error',
            message: `Lokaal verwijderd. Cloud-verwijdering mislukt: ${err.message}.`,
            onConfirm: () => setActiveDialog(null)
          });
        }
      },
      onCancel: () => setActiveDialog(null)
    });
  };

  return (
    <div className="app-container">
      {!isLoggedIn || isRecovering ? (
        <Login 
          key={isRecovering ? 'recovering' : 'normal'}
          onLogin={handleLogin} 
          isRecovering={isRecovering}
          onPasswordUpdated={handlePasswordUpdatedComplete}
        />
      ) : (
        <>
          <Navigation 
            currentView={currentView} 
            onViewChange={handleViewChange}
            onLogout={handleLogout}
          />
          <main className="main-content">
            {currentView === 'home' ? (
              <RittenstaatForm 
                key={currentLog ? currentLog.id : `new-${formResetIndex}`}
                initialData={currentLog} 
                onSave={handleSaveLog} 
                onReset={handleResetLog}
                onSend={handleSendLog}
              />
            ) : (
              <MyTripLogs 
                logs={logs} 
                onOpen={handleOpenLog} 
                onDelete={handleDeleteLog}
                onSubmit={handleSubmitLog}
                onNavigateHome={() => handleViewChange('home')}
              />
            )}
          </main>
        </>
      )}

      {/* Global ActionDialog */}
      {activeDialog && (
        <ActionDialog
          type={activeDialog.type}
          message={activeDialog.message}
          onConfirm={activeDialog.onConfirm}
          onCancel={activeDialog.onCancel}
        />
      )}
    </div>
  );
}

export default App;
