import {
  StretcherIcon,
  PersonnelIcon,
  SignalStrengthIcon,
  BatteryIcon,
  SOSIcon,
  MapPinIcon,
  CommsIcon,
  AcknowledgeIcon,
  DisconnectedIcon,
} from "./Icons";
import { useTheme } from "./ThemeContext";

const signalLevels: Array<0 | 1 | 2 | 3 | 4> = [0, 1, 2, 3, 4];
const battLevels = [10, 30, 60, 88, 100];

export function IconSection() {
  const { theme } = useTheme();

  const rdsIcons = [
    {
      name: "Stretcher",
      description: "Rectangle with four handle extensions (Top-down view)",
      component: <StretcherIcon size={32} color={theme.textPrimary} />,
      role: "Medical Unit",
      roleColor: theme.textSecondary,
    },
    {
      name: "Personnel",
      description: "Bold triangle representing direction/vector",
      component: <PersonnelIcon size={32} color={theme.green} />,
      role: "Field Agent",
      roleColor: theme.green,
    },
    {
      name: "Signal Strength",
      description: "Stepped bars with Node dot at base (chipset)",
      component: <SignalStrengthIcon size={32} level={4} color={theme.green} />,
      role: "Connectivity",
      roleColor: theme.green,
    },
    {
      name: "Battery",
      description: "Vertical tank style, easy to read at a glance",
      component: <BatteryIcon size={32} level={75} color={theme.textPrimary} fillColor={theme.green} />,
      role: "Power Status",
      roleColor: theme.green,
    },
    {
      name: "SOS Alert",
      description: "Critical alert indicator with exclamation",
      component: <SOSIcon size={32} color={theme.sos} />,
      role: "Critical Alert",
      roleColor: theme.sos,
    },
    {
      name: "Map Pin",
      description: "Location marker for unit positioning",
      component: <MapPinIcon size={32} color={theme.sos} />,
      role: "Navigation",
      roleColor: theme.sos,
    },
    {
      name: "Comms",
      description: "Communication channel indicator",
      component: <CommsIcon size={32} color={theme.textPrimary} />,
      role: "Communications",
      roleColor: theme.textSecondary,
    },
    {
      name: "Acknowledge",
      description: "Confirm/acknowledge action signal",
      component: <AcknowledgeIcon size={32} color={theme.green} />,
      role: "Confirmation",
      roleColor: theme.green,
    },
    {
      name: "Disconnected",
      description: "Signal lost / hardware offline state",
      component: <DisconnectedIcon size={32} color={theme.grey} />,
      role: "Offline",
      roleColor: theme.grey,
    },
  ];

  return (
    <section id="iconography" className="mb-16">
      <div className="mb-6">
        <span
          className="text-xs tracking-widest uppercase mb-2 block"
          style={{ color: theme.sos, fontFamily: "'JetBrains Mono', monospace" }}
        >
          02 — Iconography
        </span>
        <h2
          className="mb-2"
          style={{ color: theme.textPrimary, fontSize: "32px", fontFamily: "'Inter', sans-serif", fontWeight: 600 }}
        >
          Symbols & Icons
        </h2>
        <p style={{ color: theme.textSecondary, fontSize: "16px", fontFamily: "'Inter', sans-serif" }}>
          Universal Logic — All icons follow a{" "}
          <span style={{ color: theme.textPrimary }}>2px stroke weight</span> for a technical, precise feel.
        </p>
      </div>

      {/* Icon grid */}
      <div
        className="grid gap-4 mb-8"
        style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}
      >
        {rdsIcons.map((icon) => (
          <div
            key={icon.name}
            style={{
              backgroundColor: theme.surface1,
              borderRadius: "8px",
              border: `2px solid ${theme.border}`,
              padding: "20px 16px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
              boxShadow: theme.cardShadow,
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                backgroundColor: theme.surface2,
                borderRadius: "8px",
                border: `2px solid ${theme.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {icon.component}
            </div>
            <div className="text-center">
              <div
                style={{
                  color: theme.textPrimary,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "13px",
                  fontWeight: 600,
                  marginBottom: "4px",
                }}
              >
                {icon.name}
              </div>
              <div
                style={{
                  color: theme.textSecondary,
                  fontFamily: "'Inter', sans-serif",
                  fontSize: "11px",
                  marginBottom: "8px",
                  textAlign: "center",
                  lineHeight: 1.4,
                }}
              >
                {icon.description}
              </div>
              <span
                style={{
                  display: "inline-block",
                  padding: "2px 8px",
                  borderRadius: "4px",
                  backgroundColor: theme.surface3,
                  color: icon.roleColor,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "10px",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                {icon.role}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Signal strength levels */}
      <div
        style={{
          backgroundColor: theme.surface1,
          borderRadius: "8px",
          border: `2px solid ${theme.border}`,
          padding: "24px",
          marginBottom: "16px",
          boxShadow: theme.cardShadow,
        }}
      >
        <div
          style={{
            color: theme.textSecondary,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "11px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: "16px",
          }}
        >
          Signal Strength Levels
        </div>
        <div className="flex items-end gap-8 flex-wrap">
          {signalLevels.map((level) => (
            <div key={level} className="flex flex-col items-center gap-2">
              <SignalStrengthIcon
                size={28}
                level={level}
                color={level === 0 ? theme.grey : level < 2 ? theme.sos : theme.green}
              />
              <span
                style={{
                  color: theme.textSecondary,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "10px",
                }}
              >
                {level === 0 ? "NONE" : level === 1 ? "WEAK" : level === 2 ? "FAIR" : level === 3 ? "GOOD" : "FULL"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Battery levels */}
      <div
        style={{
          backgroundColor: theme.surface1,
          borderRadius: "8px",
          border: `2px solid ${theme.border}`,
          padding: "24px",
          boxShadow: theme.cardShadow,
        }}
      >
        <div
          style={{
            color: theme.textSecondary,
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "11px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            marginBottom: "16px",
          }}
        >
          Battery Levels
        </div>
        <div className="flex items-start gap-8 flex-wrap">
          {battLevels.map((level) => (
            <div key={level} className="flex flex-col items-center gap-2">
              <BatteryIcon
                size={28}
                level={level}
                color={theme.textPrimary}
                fillColor={level > 50 ? theme.green : theme.sos}
              />
              <span
                style={{
                  color: level <= 20 ? theme.sos : theme.textSecondary,
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: "10px",
                }}
              >
                {level}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
