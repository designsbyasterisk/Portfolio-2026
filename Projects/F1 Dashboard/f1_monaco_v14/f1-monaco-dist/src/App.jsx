import { useState, useEffect } from 'react';
import TrackViewer3D from './components/TrackViewer3D';
import useF1Store from './store/useF1Store';
import './App.css';

const TRACKS = [
  { id: 'monaco',      name: 'Monaco',      country: '🇲🇨', city: 'Monte Carlo' },
  { id: 'silverstone', name: 'Silverstone',  country: '🇬🇧', city: 'Great Britain' },
  { id: 'monza',       name: 'Monza',        country: '🇮🇹', city: 'Italy' },
];
const RACES = { monaco: [{ id: 'monaco_2024', label: 'Monaco GP 2024' }, { id: 'monaco_2023', label: 'Monaco GP 2023' }] };
const DRIVERS = ['Leclerc','Piastri','Sainz','Norris','Russell','Verstappen','Hamilton','Tsunoda','Albon','Gasly','Alonso','Ricciardo','Bottas','Stroll','Sargeant','Zhou','Ocon','Hulkenberg','Perez','Magnussen'];
const TEAM_COLORS = {
  Ferrari:'#E8002D', McLaren:'#FF8000', Mercedes:'#27F4D2',
  'Red Bull Racing':'#3671C6', 'Aston Martin':'#358C75',
  Alpine:'#FF87BC', RB:'#6692FF', Williams:'#64C4FF', Haas:'#B6BABD', Sauber:'#52E252',
};

function Dot({ team }) {
  return <div style={{ width:7, height:7, borderRadius:'50%', background: TEAM_COLORS[team]||'#555', flexShrink:0 }} />;
}
function SR({ label, value, red }) {
  return (
    <div className="sr">
      <span className="sr-l">{label}</span>
      <span className="sr-v" style={red?{color:'var(--red)'}:{}}>{value}</span>
    </div>
  );
}

export default function App() {
  const {
    selectedDriver, comparisonDriver, viewMode, telemetryOpacity,
    telemetryData, comparisonData, raceResults, incidentMarkers, isLeftOpen, isRightOpen,
    setSelectedDriver, setComparisonDriver, setViewMode, setTelemetryOpacity,
    setTelemetryData, setComparisonData, setRaceResults, setIncidentMarkers,
    setIsLeftOpen, setIsRightOpen,
  } = useF1Store();

  const [activeTrack, setActiveTrack] = useState('monaco');
  const [activeRace,  setActiveRace]  = useState('monaco_2024');
  const [incident,    setIncident]    = useState(null);
  const [gridOpen,    setGridOpen]    = useState(false);

  // Load race
  useEffect(() => {
    if (activeRace !== 'monaco_2024') { setRaceResults(null); return; }
    fetch('/data/monaco_race.json').then(r=>r.json()).then(d=>{
      setRaceResults(d); setIncidentMarkers(d.incidents||[]);
    }).catch(()=>setRaceResults(null));
  }, [activeRace]);

  // Load driver telemetry
  useEffect(() => {
    fetch(`/data/telemetry/${selectedDriver.toLowerCase()}_${activeRace}.json`)
      .then(r=>r.ok?r.json():Promise.reject()).then(setTelemetryData).catch(()=>setTelemetryData(null));
  }, [selectedDriver, activeRace]);

  // Load comparison
  useEffect(() => {
    if (!comparisonDriver) { setComparisonData(null); return; }
    fetch(`/data/telemetry/${comparisonDriver.toLowerCase()}_${activeRace}.json`)
      .then(r=>r.ok?r.json():Promise.reject()).then(setComparisonData).catch(()=>setComparisonData(null));
  }, [comparisonDriver, activeRace]);

  const circuit = raceResults?.circuit;
  const grid    = raceResults?.results || [];

  return (
    <div className="app">

      {/* HEADER */}
      <header className="hdr">
        <div className="logo"><span className="logoF">F<em>1</em></span><span className="logoS">TRACK STATS</span></div>
        <nav className="nav">
          {['Races','Drivers','Constructors'].map(n=>(
            <button key={n} className={`nb ${n==='Races'?'nba':''}`}>{n}</button>
          ))}
          <select className="sel"><option>2024</option><option>2023</option></select>
        </nav>
        <div style={{display:'flex',alignItems:'center',gap:10}}>
          <span className="badge">Completed</span>
          <span style={{fontFamily:'var(--font-data)',fontSize:11,color:'var(--w60)'}}>Monaco GP · Final</span>
        </div>
      </header>

      {/* BODY */}
      <div className="body" style={{gridTemplateColumns:`${isLeftOpen?'195px':'28px'} 1fr ${isRightOpen?'185px':'28px'}`}}>

        {/* LEFT */}
        <aside className={`sidebar ${isLeftOpen?'':'collapsed'}`}>
          {isLeftOpen ? <>
            <div className="sl">Circuit</div>
            {TRACKS.map(t=>(
              <div key={t.id} className={`ti ${activeTrack===t.id?'active':''}`} onClick={()=>setActiveTrack(t.id)}>
                <span style={{fontSize:15}}>{t.country}</span>
                <div style={{flex:1,minWidth:0}}>
                  <div className="tn">{t.name}</div>
                  <div className="tc">{t.city}</div>
                </div>
                {activeTrack===t.id&&<div className="ldot"/>}
              </div>
            ))}
            <div className="sl" style={{marginTop:8}}>Race History</div>
            {(RACES[activeTrack]||[]).map(r=>(
              <div key={r.id} className={`ri ${activeRace===r.id?'active':''}`} onClick={()=>setActiveRace(r.id)}>
                {r.label}
              </div>
            ))}
            <button className="cbtn" onClick={()=>setIsLeftOpen(false)}>‹ Collapse</button>
          </> : <button className="ribtn" onClick={()=>setIsLeftOpen(true)}>›</button>}
        </aside>

        {/* CENTER */}
        <main className="viewer">
          <div className="tl">
            <div className="tln">Monaco</div>
            <div className="tls">Circuit de Monaco · 3.337 km</div>
          </div>

          <div className="canvas-wrap">
            <TrackViewer3D
              trackGltfPath="/models/scene.gltf"
              telemetryData={viewMode!=='spatial'?telemetryData:null}
              comparisonData={viewMode==='comparison'?comparisonData:null}
              viewMode={viewMode}
              telemetryOpacity={telemetryOpacity/100}
              incidentMarkers={viewMode==='incidents'?incidentMarkers:[]}
              onIncidentClick={setIncident}
              driver1Name={selectedDriver}
              driver2Name={comparisonDriver || 'Driver 2'}
              selectedIncident={incident}
            />
          </div>

          {/* Mode bar */}
          <div className="mbar">
            {['spatial','telemetry','comparison','incidents'].map(m=>(
              <button key={m} className={`mb ${viewMode===m?'mba':''}`} onClick={()=>setViewMode(m)}>
                {m[0].toUpperCase()+m.slice(1)}
              </button>
            ))}
            <div className="msep"/>
            {viewMode!=='spatial'&&viewMode!=='incidents'&&(
              <select className="sel" value={selectedDriver} onChange={e=>setSelectedDriver(e.target.value)}>
                {DRIVERS.map(d=><option key={d}>{d}</option>)}
              </select>
            )}
            {viewMode==='comparison'&&(
              <select className="sel" value={comparisonDriver||''} onChange={e=>setComparisonDriver(e.target.value||null)}>
                <option value="">vs Driver…</option>
                {DRIVERS.filter(d=>d!==selectedDriver).map(d=><option key={d}>{d}</option>)}
              </select>
            )}
            <div style={{display:'flex',alignItems:'center',gap:8,marginLeft:'auto'}}>
              <span style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:10,letterSpacing:1,color:'var(--w60)',textTransform:'uppercase'}}>Overlay</span>
              <input type="range" className="slider" min={0} max={100} value={telemetryOpacity}
                onChange={e=>setTelemetryOpacity(+e.target.value)}/>
              <span style={{fontFamily:'var(--font-data)',fontSize:11,color:'#fff',minWidth:30}}>{telemetryOpacity}%</span>
            </div>
          </div>

          {/* Incident popup */}
          {incident&&(
            <div className="ipop">
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                <span className="pt" style={{margin:0}}>{incident.type?.replace(/_/g,' ').toUpperCase()}</span>
                <button onClick={()=>setIncident(null)} style={{background:'none',border:'none',color:'#fff',cursor:'pointer',fontSize:18}}>×</button>
              </div>
              <SR label="Driver"  value={Array.isArray(incident.drivers) ? incident.drivers.join(', ') : (incident.driver || '—')}/>
              <SR label="Turn"    value={incident.turn}/>
              <SR label="Speed"   value={`${incident.speed} km/h`}/>
              <SR label="Impact"  value={incident.raceImpact} red/>
              <div style={{marginTop:8,fontSize:10,color:'var(--w60)',lineHeight:1.5}}>{incident.description}</div>
            </div>
          )}
        </main>

        {/* RIGHT */}
        <aside className={`panel ${isRightOpen?'':'collapsed'}`}>
          {isRightOpen ? <>
            {circuit&&(
              <section className="ps">
                <div className="pt">Circuit</div>
                <SR label="Length"    value={`${circuit.length} km`}/>
                <SR label="Turns"     value={circuit.turns}/>
                <SR label="Type"      value={circuit.type}/>
                <SR label="DRS zones" value={circuit.drsZones}/>
                <SR label="Overtaking" value={circuit.overtakingIndex}/>
                <SR label="Lap record" value={circuit.lapRecord} red/>
                <SR label="Holder"    value={circuit.lapRecordHolder}/>
              </section>
            )}
            {raceResults&&(
              <section className="ps">
                <div className="pt">Monaco GP 2024</div>
                <SR label="Date"    value="26 May"/>
                <SR label="Weather" value={`${raceResults.weather} · ${raceResults.temp}°C`}/>
                <SR label="Pole"    value={raceResults.pole}/>
                <SR label="Fastest" value={raceResults.fastestLap?.driver}/>
                <div style={{marginTop:10}}>
                  {grid.slice(0,3).map(r=>(
                    <div key={r.pos} className="prow">
                      <span className={`pp ${r.pos===1?'pp1':''}`}>{r.pos}</span>
                      <Dot team={r.team}/>
                      <div style={{flex:1}}>
                        <div className="pd">{r.driver}</div>
                        <div className="pte">{r.team}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="gbtn" onClick={()=>setGridOpen(v=>!v)}>
                  {gridOpen?'↑ Hide grid':'↓ All 20 Drivers'}
                </button>
              </section>
            )}
            {viewMode==='comparison'&&telemetryData&&comparisonData&&(
              <section className="ps">
                <div className="pt">Head to Head</div>
                <SR label={selectedDriver}   value={telemetryData.lapTime} red/>
                <SR label={comparisonDriver} value={comparisonData.lapTime}/>
              </section>
            )}
            <button className="cbtn" onClick={()=>setIsRightOpen(false)}>Collapse ›</button>
          </> : <button className="ribtn" onClick={()=>setIsRightOpen(true)}>‹</button>}
        </aside>
      </div>

      {/* FULL GRID DRAWER */}
      {gridOpen&&grid.length>0&&(
        <div className="gdrawer">
          <div className="ghead">
            <span style={{fontFamily:'var(--font-display)',fontWeight:700,fontSize:11,letterSpacing:2,textTransform:'uppercase'}}>
              Full Grid — Monaco GP 2024
            </span>
            <button onClick={()=>setGridOpen(false)} style={{background:'none',border:'none',color:'#fff',cursor:'pointer',fontSize:18}}>×</button>
          </div>
          <div className="gtable-wrap">
            <table className="gtable">
              <thead><tr>{['POS','DRIVER','TEAM','GAP','BEST LAP','STATUS'].map(h=><th key={h}>{h}</th>)}</tr></thead>
              <tbody>
                {grid.map(r=>(
                  <tr key={r.pos} className={selectedDriver===r.driver?'grow-hi':''} onClick={()=>setSelectedDriver(r.driver)} style={{cursor:'pointer'}}>
                    <td style={{color:r.pos<=3?'var(--red)':'var(--white)'}}>{r.pos}</td>
                    <td><div style={{display:'flex',alignItems:'center',gap:6}}><Dot team={r.team}/>{r.driver}</div></td>
                    <td style={{color:'var(--w60)'}}>{r.team}</td>
                    <td style={{fontFamily:'var(--font-data)',color:r.gap==='DNF'?'var(--red)':'var(--w60)'}}>{r.gap||'—'}</td>
                    <td style={{fontFamily:'var(--font-data)'}}>{r.bestLap}</td>
                    <td style={{color:r.status!=='Finished'?'var(--red)':'var(--w60)'}}>{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
