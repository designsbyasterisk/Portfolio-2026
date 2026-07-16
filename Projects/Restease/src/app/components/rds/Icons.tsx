// RDS Custom Icons — 2px stroke weight for technical, precise feel

interface IconProps {
  size?: number;
  color?: string;
  className?: string;
}

export function StretcherIcon({ size = 24, color = "#FFFFFF", className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Main body rectangle */}
      <rect x="5" y="8" width="14" height="8" />
      {/* Handle extensions: top-left */}
      <line x1="5" y1="10" x2="2" y2="10" />
      {/* top-right */}
      <line x1="19" y1="10" x2="22" y2="10" />
      {/* bottom-left */}
      <line x1="5" y1="14" x2="2" y2="14" />
      {/* bottom-right */}
      <line x1="19" y1="14" x2="22" y2="14" />
    </svg>
  );
}

export function PersonnelIcon({ size = 24, color = "#FFFFFF", className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Bold upward-pointing triangle representing direction/vector */}
      <polygon points="12,3 21,20 3,20" fill={color} stroke={color} strokeWidth="2" strokeLinejoin="round" />
    </svg>
  );
}

export function SignalStrengthIcon({
  size = 24,
  color = "#FFFFFF",
  level = 4,
  className,
}: IconProps & { level?: 0 | 1 | 2 | 3 | 4 }) {
  const bars = [
    { x: 2, height: 4, y: 16 },
    { x: 7, height: 7, y: 13 },
    { x: 12, height: 11, y: 9 },
    { x: 17, height: 15, y: 5 },
  ];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      {/* Node dot at base */}
      <circle cx="2" cy="21" r="1.5" fill={color} />
      {/* Bars */}
      {bars.map((bar, i) => (
        <rect
          key={i}
          x={bar.x}
          y={bar.y}
          width="3"
          height={bar.height}
          rx="0.5"
          fill={i < level ? color : color}
          opacity={i < level ? 1 : 0.2}
        />
      ))}
    </svg>
  );
}

export function BatteryIcon({
  size = 24,
  color = "#FFFFFF",
  level = 75,
  fillColor,
  className,
}: IconProps & { level?: number; fillColor?: string }) {
  const fillHeight = Math.round((level / 100) * 14);
  const fillY = 3 + (14 - fillHeight);
  const battColor = fillColor
    ? fillColor
    : level > 50 ? "#00E676" : "#FF4F00";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      {/* Terminal nub */}
      <rect x="9" y="1" width="6" height="2" rx="1" fill={color} opacity="0.6" />
      {/* Outer tank */}
      <rect x="5" y="3" width="14" height="18" rx="2" stroke={color} strokeWidth="2" />
      {/* Fill level */}
      <rect
        x="7"
        y={fillY}
        width="10"
        height={fillHeight}
        rx="1"
        fill={battColor}
      />
    </svg>
  );
}

export function SOSIcon({ size = 24, color = "#FF4F00", className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="9" />
      <line x1="12" y1="7" x2="12" y2="13" />
      <circle cx="12" cy="16.5" r="0.5" fill={color} strokeWidth="1" />
    </svg>
  );
}

export function MapPinIcon({ size = 24, color = "#FFFFFF", className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 2C8.686 2 6 4.686 6 8c0 4.75 6 12 6 12s6-7.25 6-12c0-3.314-2.686-6-6-6z" />
      <circle cx="12" cy="8" r="2" />
    </svg>
  );
}

export function CommsIcon({ size = 24, color = "#FFFFFF", className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

export function AcknowledgeIcon({ size = 24, color = "#FFFFFF", className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function DisconnectedIcon({ size = 24, color = "#8E8E93", className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="2" y1="2" x2="22" y2="22" />
      <path d="M8.5 8.5A5 5 0 0 0 12 18a5 5 0 0 0 3.5-1.5" />
      <path d="M15 5a5 5 0 0 1 3 4.5" />
      <path d="M5 9A5 5 0 0 0 4 12" />
    </svg>
  );
}