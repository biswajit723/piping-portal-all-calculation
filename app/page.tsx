'use client';

import React, { useEffect, useMemo, useState } from 'react';

type Tab = 'dashboard' | 'piping' | 'projects' | 'utilities';

type CalcCardProps = {
  title: string;
  description: string;
  children: React.ReactNode;
  formula?: string;
  note?: string;
};

export default function AllCalculator() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [time, setTime] = useState('');
  const [date, setDate] = useState('');
  const [search, setSearch] = useState('');
  const [notice, setNotice] = useState(false);

  // -----------------------------
  // PIPE INPUTS
  // -----------------------------

  const [od, setOd] = useState('');
  const [thickness, setThickness] = useState('');
  const [pipeLength, setPipeLength] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [density, setDensity] = useState('7850');

  // -----------------------------
  // FLOW INPUTS
  // -----------------------------

  const [flowRate, setFlowRate] = useState('');
  const [flowUnit, setFlowUnit] = useState('m3h');

  // -----------------------------
  // PRESSURE DROP INPUTS
  // -----------------------------

  const [velocity, setVelocity] = useState('');
  const [roughness, setRoughness] = useState('0.000045');
  const [viscosity, setViscosity] = useState('0.001');
  const [pipeRun, setPipeRun] = useState('');

  // -----------------------------
  // PRESSURE / DESIGN INPUTS
  // -----------------------------

  const [designPressure, setDesignPressure] = useState('');
  const [allowableStress, setAllowableStress] = useState('');
  const [weldFactor, setWeldFactor] = useState('1');
  const [yFactor, setYFactor] = useState('0.4');
  const [corrosionAllowance, setCorrosionAllowance] = useState('0');

  // -----------------------------
  // THERMAL INPUTS
  // -----------------------------

  const [pipeExpansionLength, setPipeExpansionLength] = useState('');
  const [deltaTemperature, setDeltaTemperature] = useState('');
  const [expansionCoefficient, setExpansionCoefficient] = useState('0.000012');

  // -----------------------------
  // OFFSET INPUTS
  // -----------------------------

  const [offsetA, setOffsetA] = useState('');
  const [offsetB, setOffsetB] = useState('');

  // -----------------------------
  // CONVERSION INPUTS
  // -----------------------------

  const [convertValue, setConvertValue] = useState('');
  const [convertType, setConvertType] = useState('inch-mm');

  // -----------------------------
  // CLOCK
  // -----------------------------

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();

      setTime(
        now.toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      );

      setDate(
        now.toLocaleDateString('en-IN', {
          weekday: 'long',
          day: '2-digit',
          month: 'long',
          year: 'numeric',
        })
      );
    };

    updateClock();

    const timer = setInterval(updateClock, 1000);

    return () => clearInterval(timer);
  }, []);

  // -----------------------------
  // NUMBERS
  // -----------------------------

  const OD = Number(od);
  const T = Number(thickness);
  const L = Number(pipeLength);
  const QTY = Number(quantity) || 1;
  const RHO = Number(density);

  const Q = Number(flowRate);
  const V = Number(velocity);
  const EPS = Number(roughness);
  const MU = Number(viscosity);
  const RUN = Number(pipeRun);

  const P = Number(designPressure);
  const S = Number(allowableStress);
  const E = Number(weldFactor);
  const Y = Number(yFactor);
  const CA = Number(corrosionAllowance);

  const expansionL = Number(pipeExpansionLength);
  const deltaT = Number(deltaTemperature);
  const alpha = Number(expansionCoefficient);

  const A = Number(offsetA);
  const B = Number(offsetB);

  const C = Number(convertValue);

  // -----------------------------
  // PIPE GEOMETRY
  // -----------------------------

  const pipeID = OD > 0 && T > 0 && OD > 2 * T ? OD - 2 * T : 0;

  const outsideArea = OD > 0 ? (Math.PI * OD * OD) / 4 : 0;

  const insideArea = pipeID > 0 ? (Math.PI * pipeID * pipeID) / 4 : 0;

  const circumference = OD > 0 ? Math.PI * OD : 0;

  const steelArea =
    OD > 0 && pipeID > 0 ? (Math.PI / 4) * (OD * OD - pipeID * pipeID) : 0;

  const pipeVolume =
    pipeID > 0 && L > 0 ? (Math.PI / 4) * (pipeID / 1000) ** 2 * L : 0;

  // Approximate theoretical mass.
  // Density is kg/m3.
  const massPerMeter = steelArea > 0 ? (steelArea / 1_000_000) * RHO : 0;

  const totalMass = massPerMeter > 0 && L > 0 ? massPerMeter * L * QTY : 0;

  // -----------------------------
  // FLOW CONVERSION
  // -----------------------------

  const flowM3s =
    Q > 0
      ? flowUnit === 'm3h'
        ? Q / 3600
        : flowUnit === 'lh'
        ? Q / 3_600_000
        : Q
      : 0;

  const calculatedVelocity =
    insideArea > 0 ? flowM3s / (insideArea / 1_000_000) : 0;

  // -----------------------------
  // REYNOLDS NUMBER
  // -----------------------------

  const selectedVelocity = V > 0 ? V : calculatedVelocity;

  const reynolds =
    pipeID > 0 && selectedVelocity > 0 && MU > 0 && RHO > 0
      ? (RHO * selectedVelocity * (pipeID / 1000)) / MU
      : 0;

  // -----------------------------
  // FRICTION FACTOR
  // Swamee-Jain approximation
  // -----------------------------

  const relativeRoughness = pipeID > 0 && EPS >= 0 ? EPS / (pipeID / 1000) : 0;

  const frictionFactor =
    reynolds > 4000 && pipeID > 0
      ? 0.25 /
        Math.pow(
          Math.log10(relativeRoughness / 3.7 + 5.74 / Math.pow(reynolds, 0.9)),
          2
        )
      : reynolds > 0
      ? 64 / reynolds
      : 0;

  // -----------------------------
  // DARCY-WEISBACH
  // -----------------------------

  const pressureDropPa =
    frictionFactor > 0 && RUN > 0 && pipeID > 0 && selectedVelocity > 0
      ? (frictionFactor *
          (RUN / (pipeID / 1000)) *
          (RHO * selectedVelocity * selectedVelocity)) /
        2
      : 0;

  const pressureDropBar = pressureDropPa > 0 ? pressureDropPa / 100000 : 0;

  // -----------------------------
  // THERMAL EXPANSION
  // -----------------------------

  const thermalExpansion =
    expansionL > 0 && deltaT !== 0 && alpha > 0
      ? expansionL * alpha * deltaT
      : 0;

  // -----------------------------
  // HYDROTEST REFERENCE
  // -----------------------------

  const hydrotestPressure = P > 0 ? P * 1.5 : 0;

  // -----------------------------
  // STRAIGHT PIPE PRESSURE
  // PRELIMINARY REFERENCE ONLY
  // -----------------------------

  const pressureThickness =
    P > 0 && OD > 0 && S > 0 && E > 0 && Y >= 0 && S * E + P * Y > 0
      ? (P * OD) / (2 * (S * E + P * Y))
      : 0;

  const thicknessWithCA = pressureThickness > 0 ? pressureThickness + CA : 0;

  // -----------------------------
  // HOOP STRESS
  // Thin-wall approximation
  // -----------------------------

  const hoopStress = P > 0 && pipeID > 0 && T > 0 ? (P * pipeID) / (2 * T) : 0;

  // -----------------------------
  // OFFSET
  // -----------------------------

  const rollingOffset = A > 0 && B > 0 ? Math.sqrt(A * A + B * B) : 0;

  const offsetAngle = A > 0 && B > 0 ? (Math.atan(B / A) * 180) / Math.PI : 0;

  // -----------------------------
  // CONVERTER
  // -----------------------------

  let conversionResult = 0;
  let conversionUnit = '';

  if (C || C === 0) {
    switch (convertType) {
      case 'inch-mm':
        conversionResult = C * 25.4;
        conversionUnit = 'mm';
        break;

      case 'mm-inch':
        conversionResult = C / 25.4;
        conversionUnit = 'inch';
        break;

      case 'bar-psi':
        conversionResult = C * 14.5038;
        conversionUnit = 'psi';
        break;

      case 'psi-bar':
        conversionResult = C / 14.5038;
        conversionUnit = 'bar';
        break;

      case 'm3h-lpm':
        conversionResult = C * 16.6667;
        conversionUnit = 'L/min';
        break;

      case 'lpm-m3h':
        conversionResult = C * 0.06;
        conversionUnit = 'm3/h';
        break;

      case 'c-f':
        conversionResult = (C * 9) / 5 + 32;
        conversionUnit = '°F';
        break;

      case 'f-c':
        conversionResult = ((C - 32) * 5) / 9;
        conversionUnit = '°C';
        break;

      default:
        conversionResult = 0;
        conversionUnit = '';
    }
  }

  // -----------------------------
  // SEARCH
  // -----------------------------

  const searchItems = [
    { label: 'Dashboard', tab: 'dashboard' as Tab },
    { label: 'Piping Calculator', tab: 'piping' as Tab },
    { label: 'Pipe Weight', tab: 'piping' as Tab },
    { label: 'Flow Velocity', tab: 'piping' as Tab },
    { label: 'Pressure Drop', tab: 'piping' as Tab },
    { label: 'Hydrotest', tab: 'piping' as Tab },
    { label: 'Thermal Expansion', tab: 'piping' as Tab },
    { label: 'Offset Calculator', tab: 'piping' as Tab },
    { label: 'Projects', tab: 'projects' as Tab },
    { label: 'Unit Converter', tab: 'utilities' as Tab },
  ];

  const searchResults = useMemo(() => {
    if (!search.trim()) return [];

    return searchItems.filter((item) =>
      item.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [search]);

  const goTo = (tab: Tab) => {
    setActiveTab(tab);
    setSearch('');
  };

  // -----------------------------
  // STYLES
  // -----------------------------

  const pageStyle: React.CSSProperties = {
    minHeight: '100vh',
    background:
      'radial-gradient(circle at top right, #0c4a6e 0%, #020617 32%, #020617 100%)',
    color: '#f8fafc',
    fontFamily:
      'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
  };

  const glass: React.CSSProperties = {
    background: 'rgba(15, 23, 42, 0.82)',
    border: '1px solid #263449',
    borderRadius: '18px',
    backdropFilter: 'blur(12px)',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 13px',
    borderRadius: '10px',
    border: '1px solid #334155',
    backgroundColor: '#020617',
    color: '#fff',
    fontSize: '15px',
    boxSizing: 'border-box',
    outline: 'none',
  };

  const calcCard = ({
    title,
    description,
    children,
    formula,
    note,
  }: CalcCardProps) => (
    <div style={{ ...glass, padding: '20px' }}>
      <h3 style={{ marginTop: 0, marginBottom: '6px' }}>{title}</h3>

      <p
        style={{
          color: '#94a3b8',
          fontSize: '13px',
          lineHeight: 1.5,
        }}
      >
        {description}
      </p>

      {children}

      {formula && (
        <div
          style={{
            marginTop: '16px',
            padding: '12px',
            background: '#020617',
            borderRadius: '10px',
            border: '1px solid #1e293b',
          }}
        >
          <div
            style={{
              color: '#38bdf8',
              fontSize: '11px',
              fontWeight: 800,
              marginBottom: '5px',
            }}
          >
            FORMULA
          </div>

          <div
            style={{
              color: '#cbd5e1',
              fontFamily: 'monospace',
              fontSize: '12px',
            }}
          >
            {formula}
          </div>
        </div>
      )}

      {note && (
        <div
          style={{
            marginTop: '12px',
            color: '#64748b',
            fontSize: '11px',
            lineHeight: 1.5,
          }}
        >
          {note}
        </div>
      )}
    </div>
  );

  const sidebarButton = (active: boolean): React.CSSProperties => ({
    width: '100%',
    padding: '12px 14px',
    marginBottom: '6px',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    textAlign: 'left',
    background: active
      ? 'linear-gradient(135deg, #38bdf8, #22d3ee)'
      : 'transparent',
    color: active ? '#02111c' : '#94a3b8',
    fontWeight: 800,
    fontSize: '14px',
  });

  const resultStyle: React.CSSProperties = {
    marginTop: '15px',
    color: '#38bdf8',
    fontWeight: 900,
    fontSize: '21px',
  };

  return (
    <div style={pageStyle}>
      {/* ================= SIDEBAR ================= */}

      <aside
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          width: '250px',
          background: 'rgba(15, 23, 42, 0.96)',
          borderRight: '1px solid #1e293b',
          padding: '24px 16px',
          boxSizing: 'border-box',
          zIndex: 20,
        }}
      >
        <div
          style={{
            fontSize: '24px',
            fontWeight: 900,
            color: '#38bdf8',
            letterSpacing: '2px',
          }}
        >
          All Calculator
        </div>

        <div
          style={{
            color: '#64748b',
            fontSize: '10px',
            letterSpacing: '2px',
            marginTop: '4px',
            marginBottom: '30px',
          }}
        >
          Pipe Calculator
        </div>

        <div
          style={{
            color: '#475569',
            fontSize: '10px',
            marginBottom: '8px',
          }}
        >
          NAVIGATION
        </div>

        <button
          type="button"
          onClick={() => goTo('dashboard')}
          style={sidebarButton(activeTab === 'dashboard')}
        >
          ◉ &nbsp; Dashboard
        </button>

        <button
          type="button"
          onClick={() => goTo('piping')}
          style={sidebarButton(activeTab === 'piping')}
        >
          ⚙ &nbsp; Piping Calculators
        </button>

        <button
          type="button"
          onClick={() => goTo('utilities')}
          style={sidebarButton(activeTab === 'utilities')}
        >
          ⇄ &nbsp; Unit Converter
        </button>

        <button
          type="button"
          onClick={() => goTo('projects')}
          style={sidebarButton(activeTab === 'projects')}
        >
          ◈ &nbsp; Projects
        </button>

        <div
          style={{
            marginTop: '25px',
            padding: '13px',
            background: '#020617',
            border: '1px solid #1e293b',
            borderRadius: '12px',
          }}
        >
          <div
            style={{
              color: '#4ade80',
              fontSize: '12px',
              fontWeight: 800,
            }}
          >
            ● SYSTEM ONLINE
          </div>

          <div
            style={{
              color: '#64748b',
              fontSize: '10px',
              marginTop: '5px',
            }}
          >
            Engineering tools ready
          </div>
        </div>

        <div
          style={{
            position: 'absolute',
            bottom: '18px',
            left: '16px',
            right: '16px',
            padding: '12px',
            background: '#020617',
            borderRadius: '12px',
            border: '1px solid #1e293b',
          }}
        >
          <div style={{ fontWeight: 800 }}>All Calculator</div>

          <div
            style={{
              color: '#64748b',
              fontSize: '10px',
              marginTop: '4px',
            }}
          >
            Pipe Calculator
          </div>
        </div>
      </aside>

      {/* ================= MAIN ================= */}

      <main
        style={{
          marginLeft: '250px',
          minHeight: '100vh',
          padding: '25px',
          boxSizing: 'border-box',
        }}
      >
        {/* HEADER */}

        <header
          style={{
            ...glass,
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            marginBottom: '25px',
          }}
        >
          <div
            style={{
              flex: 1,
              position: 'relative',
            }}
          >
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search calculator, project, tool..."
              style={inputStyle}
            />

            {searchResults.length > 0 && (
              <div
                style={{
                  position: 'absolute',
                  top: '52px',
                  left: 0,
                  right: 0,
                  background: '#0f172a',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  padding: '7px',
                  zIndex: 50,
                }}
              >
                {searchResults.map((item) => (
                  <button
                    key={item.label}
                    type="button"
                    onClick={() => goTo(item.tab)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: 'none',
                      borderRadius: '7px',
                      background: 'transparent',
                      color: '#e2e8f0',
                      textAlign: 'left',
                      cursor: 'pointer',
                    }}
                  >
                    🔎 {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setNotice(!notice)}
            style={{
              width: '43px',
              height: '43px',
              borderRadius: '10px',
              border: '1px solid #334155',
              background: '#020617',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '17px',
            }}
          >
            🔔
          </button>

          <div style={{ textAlign: 'right' }}>
            <div
              style={{
                color: '#38bdf8',
                fontWeight: 900,
              }}
            >
              {time}
            </div>

            <div
              style={{
                color: '#64748b',
                fontSize: '10px',
              }}
            >
              {date}
            </div>
          </div>
        </header>

        {notice && (
          <div
            style={{
              ...glass,
              padding: '18px',
              marginBottom: '20px',
              borderLeft: '4px solid #38bdf8',
            }}
          >
            <h3 style={{ marginTop: 0 }}>🔔 System Notifications</h3>

            <p style={{ color: '#cbd5e1' }}>
              Piping Engineering Calculator Suite is ready.
            </p>

            <p style={{ color: '#94a3b8' }}>
              Always verify final engineering design against the applicable
              project code, specification and approved engineering documents.
            </p>
          </div>
        )}

        {/* ================= DASHBOARD ================= */}

        {activeTab === 'dashboard' && (
          <>
            <div style={{ marginBottom: '25px' }}>
              <div
                style={{
                  color: '#64748b',
                  fontSize: '11px',
                }}
              >
                ENGINEERING COMMAND CENTER
              </div>

              <h1
                style={{
                  fontSize: '30px',
                  margin: '5px 0',
                }}
              >
                Welcome, All Calculator 👋
              </h1>

              <p style={{ color: '#94a3b8' }}>
                Your piping engineering workspace is ready.
              </p>
            </div>

            {/* KPI */}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                gap: '15px',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  ...glass,
                  padding: '20px',
                  borderLeft: '4px solid #38bdf8',
                }}
              >
                <small style={{ color: '#64748b' }}>CALCULATORS</small>

                <div
                  style={{
                    fontSize: '28px',
                    fontWeight: 900,
                    marginTop: '8px',
                  }}
                >
                  15+
                </div>

                <span
                  style={{
                    color: '#4ade80',
                    fontSize: '11px',
                  }}
                >
                  Engineering tools
                </span>
              </div>

              <div
                style={{
                  ...glass,
                  padding: '20px',
                  borderLeft: '4px solid #a855f7',
                }}
              >
                <small style={{ color: '#64748b' }}>PROJECTS</small>

                <div
                  style={{
                    fontSize: '28px',
                    fontWeight: 900,
                    marginTop: '8px',
                  }}
                >
                  04
                </div>

                <span
                  style={{
                    color: '#94a3b8',
                    fontSize: '11px',
                  }}
                >
                  Active projects
                </span>
              </div>

              <div
                style={{
                  ...glass,
                  padding: '20px',
                  borderLeft: '4px solid #22c55e',
                }}
              >
                <small style={{ color: '#64748b' }}>SYSTEM</small>

                <div
                  style={{
                    fontSize: '21px',
                    fontWeight: 900,
                    color: '#4ade80',
                    marginTop: '13px',
                  }}
                >
                  ONLINE
                </div>

                <span
                  style={{
                    color: '#94a3b8',
                    fontSize: '11px',
                  }}
                >
                  All tools available
                </span>
              </div>

              <div
                style={{
                  ...glass,
                  padding: '20px',
                  borderLeft: '4px solid #f59e0b',
                }}
              >
                <small style={{ color: '#64748b' }}>SAFETY</small>

                <div
                  style={{
                    fontSize: '28px',
                    fontWeight: 900,
                    marginTop: '8px',
                  }}
                >
                  450
                </div>

                <span
                  style={{
                    color: '#4ade80',
                    fontSize: '11px',
                  }}
                >
                  Days LTI Free
                </span>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '2fr 1fr',
                gap: '20px',
              }}
            >
              <div
                style={{
                  ...glass,
                  padding: '22px',
                }}
              >
                <div
                  style={{
                    color: '#38bdf8',
                    fontSize: '11px',
                    fontWeight: 800,
                  }}
                >
                  FEATURED PROJECT
                </div>

                <h2>FPSO Refurbishment</h2>

                <p style={{ color: '#94a3b8' }}>Engineering work progress</p>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}
                >
                  <span>Overall Progress</span>
                  <strong>85%</strong>
                </div>

                <div
                  style={{
                    height: '12px',
                    background: '#1e293b',
                    borderRadius: '10px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: '85%',
                      height: '100%',
                      background: 'linear-gradient(90deg,#0284c7,#38bdf8)',
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  ...glass,
                  padding: '22px',
                }}
              >
                <h3 style={{ marginTop: 0 }}>⚡ Quick Tools</h3>

                <button
                  type="button"
                  onClick={() => goTo('piping')}
                  style={{
                    width: '100%',
                    padding: '13px',
                    marginBottom: '10px',
                    borderRadius: '10px',
                    border: '1px solid #334155',
                    background: '#020617',
                    color: '#e2e8f0',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  🧮 Piping Calculators
                </button>

                <button
                  type="button"
                  onClick={() => goTo('utilities')}
                  style={{
                    width: '100%',
                    padding: '13px',
                    borderRadius: '10px',
                    border: '1px solid #334155',
                    background: '#020617',
                    color: '#e2e8f0',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  ⇄ Unit Converter
                </button>
              </div>
            </div>

            <div
              style={{
                ...glass,
                padding: '20px',
                marginTop: '20px',
                borderLeft: '4px solid #38bdf8',
              }}
            >
              <h3
                style={{
                  color: '#38bdf8',
                  marginTop: 0,
                }}
              >
                📘 Engineering Note
              </h3>

              <p
                style={{
                  color: '#cbd5e1',
                  lineHeight: 1.7,
                  marginBottom: 0,
                }}
              >
                This portal provides preliminary engineering calculations and
                quick-reference tools. Final design, code compliance, material
                selection, pressure rating, stress analysis and fabrication
                decisions must be checked against the applicable project
                specification, approved drawings and governing code.
              </p>
            </div>
          </>
        )}

        {/* ================= PIPING ================= */}

        {activeTab === 'piping' && (
          <>
            <div style={{ marginBottom: '25px' }}>
              <div
                style={{
                  color: '#64748b',
                  fontSize: '11px',
                }}
              >
                PIPING ENGINEERING
              </div>

              <h1 style={{ margin: '5px 0' }}>Piping Calculator Suite 🧮</h1>

              <p style={{ color: '#94a3b8' }}>
                Geometry, weight, flow, pressure, thermal and fabrication
                reference calculations.
              </p>
            </div>

            {/* PIPE INPUT */}

            <div
              style={{
                ...glass,
                padding: '20px',
                marginBottom: '20px',
              }}
            >
              <h3>🔧 Common Pipe Inputs</h3>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
                  gap: '12px',
                }}
              >
                <input
                  type="number"
                  min="0"
                  step="any"
                  value={od}
                  onChange={(e) => setOd(e.target.value)}
                  style={inputStyle}
                  placeholder="OD (mm)"
                />

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={thickness}
                  onChange={(e) => setThickness(e.target.value)}
                  style={inputStyle}
                  placeholder="Thickness (mm)"
                />

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={pipeLength}
                  onChange={(e) => setPipeLength(e.target.value)}
                  style={inputStyle}
                  placeholder="Length (m)"
                />

                <input
                  type="number"
                  min="1"
                  step="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  style={inputStyle}
                  placeholder="Quantity"
                />

                <input
                  type="number"
                  min="0"
                  step="any"
                  value={density}
                  onChange={(e) => setDensity(e.target.value)}
                  style={inputStyle}
                  placeholder="Density kg/m³"
                />
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: '18px',
              }}
            >
              {/* GEOMETRY */}

              {calcCard({
                title: '📏 Pipe Geometry',
                description:
                  'Calculate ID, circumference and material cross-sectional area.',
                formula: 'ID = OD − 2t',
                note: 'Use consistent dimensions. This is a geometric calculation.',
                children: (
                  <>
                    <div style={resultStyle}>ID: {pipeID.toFixed(2)} mm</div>

                    <div
                      style={{
                        marginTop: '8px',
                        color: '#cbd5e1',
                      }}
                    >
                      Circumference: {circumference.toFixed(2)} mm
                    </div>

                    <div
                      style={{
                        marginTop: '5px',
                        color: '#cbd5e1',
                      }}
                    >
                      Flow Area: {insideArea.toFixed(2)} mm²
                    </div>

                    <div
                      style={{
                        marginTop: '5px',
                        color: '#cbd5e1',
                      }}
                    >
                      Steel Area: {steelArea.toFixed(2)} mm²
                    </div>
                  </>
                ),
              })}

              {/* WEIGHT */}

              {calcCard({
                title: '⚖️ Pipe Weight',
                description:
                  'Theoretical pipe mass using OD, thickness and material density.',
                formula: 'Mass/m = Steel Area × Density',
                note: 'Actual supplied weight may differ because of manufacturing tolerances and coating/lining.',
                children: (
                  <>
                    <div style={resultStyle}>
                      {massPerMeter.toFixed(2)} kg/m
                    </div>

                    <div
                      style={{
                        marginTop: '8px',
                        color: '#cbd5e1',
                      }}
                    >
                      Total: {totalMass.toFixed(2)} kg
                    </div>
                  </>
                ),
              })}

              {/* VOLUME */}

              {calcCard({
                title: '🛢️ Pipe Internal Volume',
                description: 'Approximate internal volume for a straight pipe.',
                formula: 'V = π/4 × ID² × L',
                note: 'Calculated using the internal diameter and straight pipe length.',
                children: (
                  <div style={resultStyle}>{pipeVolume.toFixed(4)} m³</div>
                ),
              })}

              {/* VELOCITY */}

              {calcCard({
                title: '💨 Flow Velocity',
                description:
                  'Calculate velocity from volumetric flow rate and pipe ID.',
                formula: 'v = Q / A',
                note: 'Flow must be volumetric flow rate. Confirm operating conditions and units.',
                children: (
                  <>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={flowRate}
                      onChange={(e) => setFlowRate(e.target.value)}
                      style={inputStyle}
                      placeholder="Flow rate"
                    />

                    <select
                      value={flowUnit}
                      onChange={(e) => setFlowUnit(e.target.value)}
                      style={{
                        ...inputStyle,
                        marginTop: '10px',
                      }}
                    >
                      <option value="m3h">m³/h</option>
                      <option value="lh">L/h</option>
                      <option value="m3s">m³/s</option>
                    </select>

                    <div style={resultStyle}>
                      {calculatedVelocity.toFixed(3)} m/s
                    </div>
                  </>
                ),
              })}

              {/* REYNOLDS */}

              {calcCard({
                title: '🌊 Reynolds Number',
                description:
                  'Determine the flow regime using density, velocity, diameter and dynamic viscosity.',
                formula: 'Re = ρvD / μ',
                note: 'For this calculator, density is kg/m³, velocity m/s, diameter m and viscosity Pa·s.',
                children: (
                  <>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={velocity}
                      onChange={(e) => setVelocity(e.target.value)}
                      style={inputStyle}
                      placeholder="Velocity m/s (optional)"
                    />

                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={viscosity}
                      onChange={(e) => setViscosity(e.target.value)}
                      style={{
                        ...inputStyle,
                        marginTop: '10px',
                      }}
                      placeholder="Dynamic viscosity Pa·s"
                    />

                    <div style={resultStyle}>Re = {reynolds.toFixed(0)}</div>

                    <div
                      style={{
                        marginTop: '8px',
                        color:
                          reynolds < 2300
                            ? '#38bdf8'
                            : reynolds < 4000
                            ? '#fbbf24'
                            : '#4ade80',
                      }}
                    >
                      {reynolds < 2300
                        ? 'Laminar region'
                        : reynolds < 4000
                        ? 'Transition region'
                        : 'Turbulent region'}
                    </div>
                  </>
                ),
              })}

              {/* PRESSURE DROP */}

              {calcCard({
                title: '📉 Darcy Pressure Drop',
                description: 'Estimate straight-pipe frictional pressure loss.',
                formula: 'ΔP = f × (L/D) × ρv²/2',
                note: 'This calculates straight-pipe friction only. Fittings, valves, elevation and other losses are not included.',
                children: (
                  <>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={pipeRun}
                      onChange={(e) => setPipeRun(e.target.value)}
                      style={inputStyle}
                      placeholder="Pipe run (m)"
                    />

                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={roughness}
                      onChange={(e) => setRoughness(e.target.value)}
                      style={{
                        ...inputStyle,
                        marginTop: '10px',
                      }}
                      placeholder="Absolute roughness (m)"
                    />

                    <div style={resultStyle}>
                      {pressureDropBar.toFixed(4)} bar
                    </div>
                  </>
                ),
              })}

              {/* HYDROTEST */}

              {calcCard({
                title: '💧 Hydrotest Reference',
                description:
                  'Reference calculation using 1.5 times the entered design pressure.',
                formula: 'Ptest = 1.5 × Pdesign',
                note: 'Preliminary reference only. Actual test pressure must be established from the governing code, project specification, component limits and applicable temperature requirements.',
                children: (
                  <>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={designPressure}
                      onChange={(e) => setDesignPressure(e.target.value)}
                      style={inputStyle}
                      placeholder="Design pressure"
                    />

                    <div style={resultStyle}>
                      {hydrotestPressure.toFixed(2)}
                    </div>

                    <div
                      style={{
                        color: '#94a3b8',
                        marginTop: '5px',
                        fontSize: '12px',
                      }}
                    >
                      Same pressure unit as input
                    </div>
                  </>
                ),
              })}

              {/* PRESSURE THICKNESS */}

              {calcCard({
                title: '🧱 Pressure Thickness',
                description:
                  'Preliminary straight-pipe pressure-thickness reference.',
                formula: 't = P × D / [2(SE + PY)]',
                note: 'This is not a complete piping code design check. Material, temperature, weld factor, corrosion, mechanical loads, tolerances and code requirements must be verified separately.',
                children: (
                  <>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={allowableStress}
                      onChange={(e) => setAllowableStress(e.target.value)}
                      style={inputStyle}
                      placeholder="Allowable stress"
                    />

                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={weldFactor}
                      onChange={(e) => setWeldFactor(e.target.value)}
                      style={{
                        ...inputStyle,
                        marginTop: '10px',
                      }}
                      placeholder="Weld / quality factor E"
                    />

                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={yFactor}
                      onChange={(e) => setYFactor(e.target.value)}
                      style={{
                        ...inputStyle,
                        marginTop: '10px',
                      }}
                      placeholder="Y factor"
                    />

                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={corrosionAllowance}
                      onChange={(e) => setCorrosionAllowance(e.target.value)}
                      style={{
                        ...inputStyle,
                        marginTop: '10px',
                      }}
                      placeholder="Corrosion allowance"
                    />

                    <div style={resultStyle}>
                      {thicknessWithCA.toFixed(3)} mm
                    </div>

                    <div
                      style={{
                        color: '#94a3b8',
                        fontSize: '11px',
                        marginTop: '5px',
                      }}
                    >
                      Including entered corrosion allowance
                    </div>
                  </>
                ),
              })}

              {/* HOOP STRESS */}

              {calcCard({
                title: '⭕ Hoop Stress',
                description: 'Thin-wall hoop-stress reference calculation.',
                formula: 'σh ≈ P × D / (2t)',
                note: 'Use consistent pressure and dimensional units. This is a simplified stress calculation, not a complete code stress analysis.',
                children: (
                  <>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={designPressure}
                      onChange={(e) => setDesignPressure(e.target.value)}
                      style={inputStyle}
                      placeholder="Pressure"
                    />

                    <div style={resultStyle}>{hoopStress.toFixed(3)}</div>

                    <div
                      style={{
                        color: '#94a3b8',
                        fontSize: '11px',
                        marginTop: '5px',
                      }}
                    >
                      Stress unit follows pressure unit
                    </div>
                  </>
                ),
              })}

              {/* THERMAL */}

              {calcCard({
                title: '🌡️ Thermal Expansion',
                description:
                  'Calculate linear expansion caused by temperature change.',
                formula: 'ΔL = α × L × ΔT',
                note: 'Coefficient must be in 1/°C or 1/K and length must use the desired output unit.',
                children: (
                  <>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={pipeExpansionLength}
                      onChange={(e) => setPipeExpansionLength(e.target.value)}
                      style={inputStyle}
                      placeholder="Pipe length"
                    />

                    <input
                      type="number"
                      step="any"
                      value={deltaTemperature}
                      onChange={(e) => setDeltaTemperature(e.target.value)}
                      style={{
                        ...inputStyle,
                        marginTop: '10px',
                      }}
                      placeholder="Temperature change °C"
                    />

                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={expansionCoefficient}
                      onChange={(e) => setExpansionCoefficient(e.target.value)}
                      style={{
                        ...inputStyle,
                        marginTop: '10px',
                      }}
                      placeholder="Expansion coefficient"
                    />

                    <div style={resultStyle}>
                      ΔL = {thermalExpansion.toFixed(3)}
                    </div>
                  </>
                ),
              })}

              {/* OFFSET */}

              {calcCard({
                title: '📐 Rolling Offset',
                description:
                  'Calculate the diagonal travel and angle from two perpendicular dimensions.',
                formula: 'Travel = √(A² + B²)',
                note: 'Use the same unit for A and B. This is basic right-triangle geometry.',
                children: (
                  <>
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={offsetA}
                      onChange={(e) => setOffsetA(e.target.value)}
                      style={inputStyle}
                      placeholder="Offset A"
                    />

                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={offsetB}
                      onChange={(e) => setOffsetB(e.target.value)}
                      style={{
                        ...inputStyle,
                        marginTop: '10px',
                      }}
                      placeholder="Offset B"
                    />

                    <div style={resultStyle}>
                      Travel = {rollingOffset.toFixed(2)}
                    </div>

                    <div
                      style={{
                        color: '#cbd5e1',
                        marginTop: '7px',
                      }}
                    >
                      Angle = {offsetAngle.toFixed(2)}°
                    </div>
                  </>
                ),
              })}
            </div>
          </>
        )}

        {/* ================= UTILITIES ================= */}

        {activeTab === 'utilities' && (
          <>
            <div style={{ marginBottom: '25px' }}>
              <div
                style={{
                  color: '#64748b',
                  fontSize: '11px',
                }}
              >
                ENGINEERING UTILITIES
              </div>

              <h1 style={{ margin: '5px 0' }}>Unit Converter ⇄</h1>

              <p style={{ color: '#94a3b8' }}>
                Common piping engineering unit conversions.
              </p>
            </div>

            <div
              style={{
                ...glass,
                padding: '25px',
                maxWidth: '750px',
              }}
            >
              <h3>Conversion</h3>

              <input
                type="number"
                step="any"
                value={convertValue}
                onChange={(e) => setConvertValue(e.target.value)}
                style={inputStyle}
                placeholder="Enter value"
              />

              <select
                value={convertType}
                onChange={(e) => setConvertType(e.target.value)}
                style={{
                  ...inputStyle,
                  marginTop: '12px',
                }}
              >
                <option value="inch-mm">Inch → mm</option>

                <option value="mm-inch">mm → Inch</option>

                <option value="bar-psi">bar → psi</option>

                <option value="psi-bar">psi → bar</option>

                <option value="m3h-lpm">m³/h → L/min</option>

                <option value="lpm-m3h">L/min → m³/h</option>

                <option value="c-f">°C → °F</option>

                <option value="f-c">°F → °C</option>
              </select>

              <div
                style={{
                  marginTop: '25px',
                  padding: '20px',
                  background: '#020617',
                  borderRadius: '12px',
                  border: '1px solid #1e293b',
                }}
              >
                <div
                  style={{
                    color: '#64748b',
                    fontSize: '11px',
                  }}
                >
                  RESULT
                </div>

                <div
                  style={{
                    color: '#38bdf8',
                    fontSize: '26px',
                    fontWeight: 900,
                    marginTop: '5px',
                  }}
                >
                  {Number.isFinite(conversionResult)
                    ? conversionResult.toFixed(4)
                    : '0.0000'}{' '}
                  {conversionUnit}
                </div>
              </div>
            </div>
          </>
        )}

        {/* ================= PROJECTS ================= */}

        {activeTab === 'projects' && (
          <>
            <div style={{ marginBottom: '25px' }}>
              <div
                style={{
                  color: '#64748b',
                  fontSize: '11px',
                }}
              >
                PROJECT MANAGEMENT
              </div>

              <h1 style={{ margin: '5px 0' }}>Engineering Projects 📊</h1>
            </div>

            {[
              ['FPSO Refurbishment', 85, '#38bdf8'],
              ['Stress Analysis', 70, '#a855f7'],
              ['Piping Documentation', 62, '#22c55e'],
              ['ISO Drawing Package', 45, '#f59e0b'],
            ].map(([name, progress, color]) => (
              <div
                key={String(name)}
                style={{
                  ...glass,
                  padding: '20px',
                  marginBottom: '15px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    marginBottom: '10px',
                  }}
                >
                  <strong>{name}</strong>

                  <span style={{ color: String(color) }}>{progress}%</span>
                </div>

                <div
                  style={{
                    height: '10px',
                    background: '#1e293b',
                    borderRadius: '10px',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${progress}%`,
                      height: '100%',
                      background: String(color),
                    }}
                  />
                </div>
              </div>
            ))}
          </>
        )}
      </main>

      {/* ================= RESPONSIVE ================= */}

      <style jsx>{`
        @media (max-width: 1100px) {
          aside {
            width: 210px !important;
          }

          main {
            margin-left: 210px !important;
          }
        }

        @media (max-width: 850px) {
          aside {
            position: relative !important;
            width: 100% !important;
            height: auto !important;
            bottom: auto !important;
          }

          main {
            margin-left: 0 !important;
            width: 100% !important;
            padding: 15px !important;
          }

          aside > div:last-child {
            position: static !important;
            margin-top: 20px;
          }

          main [style*="grid-template-columns"] {
            grid-template-columns: 1fr !important;
          }
        }

        @media (max-width: 600px) {
          main {
            padding: 10px !important;
          }

          input,
          select {
            font-size: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
// Calculator UI update