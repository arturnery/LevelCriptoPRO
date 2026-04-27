interface WaveDividerProps {
  fromColor?: string;
  toColor?: string;
  height?: string;
}

export function WaveDivider({ 
  fromColor = "#1e40af", 
  toColor = "#0f172a",
  height = "h-40"
}: WaveDividerProps) {
  return (
    <div className={`w-full ${height} relative overflow-visible`}>
      <svg
        viewBox="0 0 1200 200"
        preserveAspectRatio="none"
        className="w-full h-full absolute top-0 left-0"
        style={{ marginTop: "-1px" }}
      >
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={fromColor} stopOpacity="0.6" />
            <stop offset="100%" stopColor={toColor} stopOpacity="0.3" />
          </linearGradient>
        </defs>
        {/* Onda suave e grande estilo AUVP */}
        <path
          d="M0,80 Q150,20 300,60 T600,40 T900,70 T1200,50 L1200,200 L0,200 Z"
          fill="url(#waveGradient)"
        />
      </svg>
    </div>
  );
}
