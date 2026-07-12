// client/src/components/ScoreRing.jsx
// Animated circular progress ring for the confidence score

import { motion } from "framer-motion";

export default function ScoreRing({ score = 50, decision = "NEUTRAL", size = 140 }) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const color =
    decision === "INVEST" ? "#10b981" :
    decision === "PASS"   ? "#ef4444" :
                            "#f59e0b";

  return (
    <div className="score-ring" style={{ width: size, height: size }}>
      <svg width={size} height={size}>
        {/* Background ring */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={8}
        />
        {/* Progress ring */}
        <motion.circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none"
          stroke={color}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut", type: "spring", bounce: 0.2 }}
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        />
      </svg>
      <div>
        <div className="score-value" style={{ color }}>{score}</div>
        <div className="score-label">confidence</div>
      </div>
    </div>
  );
}
