/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image, pdf, Svg, Polygon } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  pageLandscape: {
    padding: 20,
    fontSize: 9,
    fontFamily: 'Helvetica',
  },
  pagePortrait: {
    padding: 30,
    fontSize: 10,
    fontFamily: 'Helvetica',
  },
  table: {
    borderTopWidth: 1,
    borderTopColor: '#000',
    borderLeftWidth: 1,
    borderLeftColor: '#000',
    marginTop: 10,
  },
  tableRow: {
    flexDirection: 'row',
  },
  tableCell: {
    borderRightWidth: 1,
    borderRightColor: '#000',
    borderBottomWidth: 1,
    borderBottomColor: '#000',
    justifyContent: 'center',
    paddingLeft: 3,
    paddingRight: 3,
  },
  headerText: {
    fontSize: 7.5,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },
  cellText: {
    fontSize: 8,
  },
  totalenRow: {
    flexDirection: 'row',
    height: 18,
    marginTop: 2,
  },
  totalBox: {
    borderWidth: 1,
    borderColor: '#000',
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  totalText: {
    fontSize: 8,
    fontFamily: 'Helvetica-Bold',
  }
});

const CheckeredStrip = ({ color = '#eab308', width = 500, height = 12 }) => {
  const step = 24;
  const count = Math.ceil(width / step);
  const polygons = [];
  for (let i = 0; i < count; i++) {
    const offset = i * step;
    polygons.push(
      <Polygon key={`p1-${i}`} points={`${offset + 6},0 ${offset + 12},0 ${offset + 9},6 ${offset + 3},6`} fill={color} />,
      <Polygon key={`p2-${i}`} points={`${offset + 18},0 ${offset + 24},0 ${offset + 21},6 ${offset + 15},6`} fill={color} />,
      <Polygon key={`p3-${i}`} points={`${offset + 9},6 ${offset + 15},6 ${offset + 12},12 ${offset + 6},12`} fill={color} />,
      <Polygon key={`p4-${i}`} points={`${offset + 21},6 ${offset + 24},6 ${offset + 24},12 ${offset + 18},12`} fill={color} />,
      <Polygon key={`p5-${i}`} points={`${offset + 0},6 ${offset + 3},6 ${offset + 0},12`} fill={color} />
    );
  }
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      {polygons}
    </Svg>
  );
};

const FieldLine = ({ label, value, width = '100%' }) => (
  <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: 4, width }}>
    <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#000' }}>{label}</Text>
    <View style={{ flex: 1, borderBottomWidth: 1, borderBottomColor: '#000', marginLeft: 4, paddingBottom: 1, minHeight: 11 }}>
      <Text style={{ fontSize: 9 }}>{value || ''}</Text>
    </View>
  </View>
);

const RittenstaatPage = ({ log }) => {
  const trips = log.trips || [];
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

  // Pad trips to exactly 17 rows to match the paper form layout
  const paddedTrips = [...trips];
  while (paddedTrips.length < 17) {
    paddedTrips.push({});
  }

  return (
    <Page size="A4" orientation="landscape" style={styles.pageLandscape}>
      {/* Header section */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15, gap: 15 }}>
        {/* Left column */}
        <View style={{ width: 220, gap: 6 }}>
          <Image src="/taxi-livo-logo.png" style={{ width: 120, height: 30, objectFit: 'contain', alignSelf: 'flex-start' }} />
          <View style={{ marginTop: 5, gap: 4 }}>
            <FieldLine label="KM stand begin:" value={log.kmStandBegin} />
            <FieldLine label="KM stand eind:" value={log.kmStandEind} />
            <FieldLine label="Liters getankt:" value={log.litersGetankt} />
          </View>
          <View style={{ marginTop: 5 }}>
            <CheckeredStrip color="#8faabf" width={220} height={10} />
          </View>
        </View>

        {/* Middle column */}
        <View style={{ flex: 1, height: 95, borderWidth: 1, borderColor: '#000', padding: 5 }}>
          <Text style={{ fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#000', marginBottom: 3 }}>Ruimte kantoor:</Text>
          <Text style={{ fontSize: 9 }}>{log.ruimteKantoor || ''}</Text>
        </View>

        {/* Right column */}
        <View style={{ width: 240, gap: 4 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 }}>
            <View style={{ flex: 1, justifyContent: 'flex-end', height: 35 }}>
              <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>Wagen nummer:</Text>
            </View>
            <View style={{ width: 50, height: 35, borderWidth: 2, borderColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={{ fontSize: 14, fontFamily: 'Helvetica-Bold' }}>{log.wagenNummer || ''}</Text>
            </View>
          </View>
          <FieldLine label="Kenteken:" value={log.kenteken} />
          <FieldLine label="Naam:" value={log.naam} />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1.5 }}><FieldLine label="Datum:" value={log.datum} /></View>
            <View style={{ flex: 1 }}><FieldLine label="Dag:" value={log.dag} /></View>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <View style={{ flex: 1 }}><FieldLine label="Werktijd van:" value={log.werktijdVan} /></View>
            <View style={{ flex: 1 }}><FieldLine label="Tot:" value={log.werktijdTot} /></View>
          </View>
        </View>
      </View>

      {/* Table section */}
      <View style={styles.table}>
        {/* Table Header */}
        <View style={[styles.tableRow, { height: 26, backgroundColor: '#e6f0fa', fontFamily: 'Helvetica-Bold' }]}>
          <View style={[styles.tableCell, { width: 25, justifyContent: 'center', alignItems: 'center' }]}><Text style={styles.headerText}>Rit nr</Text></View>
          <View style={[styles.tableCell, { width: 40, justifyContent: 'center', alignItems: 'center' }]}><Text style={styles.headerText}>Begin tijd</Text></View>
          <View style={[styles.tableCell, { width: 185, justifyContent: 'center', alignItems: 'center' }]}><Text style={styles.headerText}>Van:</Text></View>
          <View style={[styles.tableCell, { width: 185, justifyContent: 'center', alignItems: 'center' }]}><Text style={styles.headerText}>Naar:</Text></View>
          <View style={[styles.tableCell, { width: 40, justifyContent: 'center', alignItems: 'center' }]}><Text style={styles.headerText}>Eind tijd</Text></View>
          
          <View style={{ width: 140, flexDirection: 'column' }}>
            <View style={{ height: 13, borderBottomWidth: 1, borderBottomColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
              <Text style={styles.headerText}>Ritprijs</Text>
            </View>
            <View style={{ height: 13, flexDirection: 'row' }}>
              <View style={[styles.tableCell, { width: 45, height: 13, borderBottomWidth: 0, borderTopWidth: 0, justifyContent: 'center', alignItems: 'center' }]}><Text style={styles.headerText}>Contant</Text></View>
              <View style={[styles.tableCell, { width: 50, height: 13, borderBottomWidth: 0, borderTopWidth: 0, justifyContent: 'center', alignItems: 'center' }]}><Text style={styles.headerText}>Rekening</Text></View>
              <View style={[styles.tableCell, { width: 45, height: 13, borderBottomWidth: 0, borderTopWidth: 0, borderRightWidth: 0, justifyContent: 'center', alignItems: 'center' }]}><Text style={styles.headerText}>Pin</Text></View>
            </View>
          </View>
          
          <View style={[styles.tableCell, { width: 180, justifyContent: 'center', alignItems: 'center', borderRightWidth: 0 }]}><Text style={styles.headerText}>Rekeninghouder en opmerkingen</Text></View>
        </View>

        {/* Table Rows */}
        {paddedTrips.map((trip, i) => (
          <View style={[styles.tableRow, { height: 18 }]} key={i}>
            <View style={[styles.tableCell, { width: 25, alignItems: 'center' }]}><Text style={styles.cellText}>{i + 1}</Text></View>
            <View style={[styles.tableCell, { width: 40 }]}><Text style={styles.cellText}>{trip.beginTijd || ''}</Text></View>
            <View style={[styles.tableCell, { width: 185 }]}><Text style={styles.cellText}>{trip.van || ''}</Text></View>
            <View style={[styles.tableCell, { width: 185 }]}><Text style={styles.cellText}>{trip.naar || ''}</Text></View>
            <View style={[styles.tableCell, { width: 40 }]}><Text style={styles.cellText}>{trip.eindTijd || ''}</Text></View>
            <View style={[styles.tableCell, { width: 45 }]}><Text style={styles.cellText}>{trip.ritprijsContant || ''}</Text></View>
            <View style={[styles.tableCell, { width: 50 }]}><Text style={styles.cellText}>{trip.ritprijsRekening || ''}</Text></View>
            <View style={[styles.tableCell, { width: 45 }]}><Text style={styles.cellText}>{trip.ritprijsPin || ''}</Text></View>
            <View style={[styles.tableCell, { width: 180, borderRightWidth: 0 }]}><Text style={styles.cellText}>{trip.rekeninghouderOpmerkingen || ''}</Text></View>
          </View>
        ))}
      </View>

      {/* Totalen Row */}
      <View style={styles.totalenRow}>
        <View style={{ width: 475, alignItems: 'flex-end', justifyContent: 'center', paddingRight: 10 }}>
          <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>Totalen:</Text>
        </View>
        <View style={[styles.totalBox, { width: 45 }]}><Text style={styles.totalText}>{displayTotal(totalContant)}</Text></View>
        <View style={[styles.totalBox, { width: 50 }]}><Text style={styles.totalText}>{displayTotal(totalRekening)}</Text></View>
        <View style={[styles.totalBox, { width: 45 }]}><Text style={styles.totalText}>{displayTotal(totalPin)}</Text></View>
        <View style={{ width: 180 }}></View>
      </View>

      {/* Footer section */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 15 }}>
        <View style={{ gap: 3 }}>
          <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>BELANGRIJK: Pauze óók in de BCT invoeren!</Text>
          <Text style={{ fontSize: 8, color: '#333' }}>Taxi Livo B.V., Logistiekweg 1, 4387PK Vlissingen. Tel: 0118 - 635 800 E-mail: info@taxilivo.nl</Text>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10 }}>
          <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>Parafen kantoor:</Text>
          <View style={{ width: 50, height: 35, borderWidth: 1, borderColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
            {log.signature && log.signature.dataUrl && (
              <Image src={log.signature.dataUrl} style={{ width: 48, height: 33, objectFit: 'contain' }} />
            )}
          </View>
          <View style={{ width: 50, height: 35, borderWidth: 1, borderColor: '#000' }} />
        </View>
      </View>
    </Page>
  );
};

const PakbonPage = ({ pakbon }) => (
  <Page size="A4" style={styles.pagePortrait}>
    {/* Header section */}
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 }}>
      {/* Left side details */}
      <View style={{ gap: 4 }}>
        <Image src="/taxi-livo-logo.png" style={{ width: 130, height: 35, objectFit: 'contain', alignSelf: 'flex-start' }} />
        <Text style={{ fontSize: 8.5, color: '#333', marginTop: 5, lineHeight: 1.4 }}>
          Logistiekweg 1, 4387 PK Vlissingen{"\n"}
          Tel. +31 118 - 635 800{"\n"}
          info@taxilivo.nl{"\n"}
          www.taxilivo.nl
        </Text>
      </View>

      {/* Right side fields */}
      <View style={{ width: 220, gap: 8, justifyContent: 'flex-end' }}>
        <FieldLine label="Chauffeur:" value={pakbon.chauffeur} />
        <FieldLine label="Kenteken:" value={pakbon.kenteken} />
      </View>
    </View>

    {/* Checkered Strip */}
    <View style={{ marginVertical: 15 }}>
      <CheckeredStrip color="#eab308" width={535} height={12} />
    </View>

    {/* Form Fields */}
    <View style={{ gap: 14, marginTop: 10 }}>
      <View style={{ flexDirection: 'row', gap: 20 }}>
        <View style={{ flex: 1.2 }}><FieldLine label="Bedrijf:" value={pakbon.bedrijf} /></View>
        <View style={{ flex: 0.8 }}><FieldLine label="Scheepsnaam:" value={pakbon.scheepsnaam} /></View>
      </View>
      
      <FieldLine label="Naam:" value={pakbon.naam} />
      <FieldLine label="Van:" value={pakbon.van} />
      <FieldLine label="Naar:" value={pakbon.naar} />
      
      <View style={{ flexDirection: 'row', gap: 20 }}>
        <View style={{ flex: 1.2 }}><FieldLine label="Datum:" value={pakbon.datum} /></View>
        <View style={{ flex: 0.8 }}><FieldLine label="Tijd:" value={pakbon.tijd} /></View>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 25 }}>
        <View style={{ width: 250 }}>
          <FieldLine label="Ritprijs:" value={pakbon.ritprijs} />
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Text style={{ fontSize: 9, fontFamily: 'Helvetica-Bold' }}>Handtekening:</Text>
          <View style={{ width: 130, height: 55, borderWidth: 1, borderColor: '#000', justifyContent: 'center', alignItems: 'center' }}>
            {pakbon.signature && pakbon.signature.dataUrl && (
              <Image src={pakbon.signature.dataUrl} style={{ width: 128, height: 53, objectFit: 'contain' }} />
            )}
          </View>
        </View>
      </View>
    </View>
  </Page>
);

const RittenstaatDocument = ({ logs }) => (
  <Document>
    {logs.map((log, index) => (
      <React.Fragment key={index}>
        {log.isPakbonOnly ? null : <RittenstaatPage log={log} />}
        {log.pakbonnen && log.pakbonnen.map((pakbon, pIndex) => (
          <PakbonPage key={`pakbon-${index}-${pIndex}`} pakbon={pakbon} />
        ))}
      </React.Fragment>
    ))}
  </Document>
);

const PakbonDocument = ({ pakbon }) => (
  <Document>
    <PakbonPage pakbon={pakbon} />
  </Document>
);

export const generatePdfBlob = async (logs) => {
  const doc = <RittenstaatDocument logs={logs} />;
  const asPdf = pdf([]);
  asPdf.updateContainer(doc);
  const blob = await asPdf.toBlob();
  return blob;
};

export const generatePakbonPdfBlob = async (pakbon) => {
  const doc = <PakbonDocument pakbon={pakbon} />;
  const asPdf = pdf([]);
  asPdf.updateContainer(doc);
  const blob = await asPdf.toBlob();
  return blob;
};

export const downloadPdf = async (logs, filename = "document.pdf") => {
  try {
    const blob = await generatePdfBlob(logs);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error generating PDF", error);
    alert("Er is een fout opgetreden bij het genereren van de PDF.");
  }
};

export const downloadPakbonPdf = async (pakbon, filename = "pakbon.pdf") => {
  try {
    const blob = await generatePakbonPdfBlob(pakbon);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error generating Pakbon PDF", error);
    alert("Er is een fout opgetreden bij het genereren van de PDF.");
  }
};
