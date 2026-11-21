import React from 'react';
import { motion } from 'framer-motion';

/* ─── Shared animated path helper ─── */
function AnimPath({ d, delay = 0, duration = 1.2, stroke = '#00F5FF', strokeWidth = 1, opacity = 0.7 }) {
  return (
    <motion.path
      d={d}
      stroke={stroke}
      strokeWidth={strokeWidth}
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray="1 0"
      opacity={opacity}
      initial={{ pathLength: 0, opacity: 0 }}
      animate={{ pathLength: 1, opacity }}
      transition={{ duration, delay, ease: 'easeInOut' }}
    />
  );
}

function AnimCircle({ cx, cy, r, delay = 0, fill = 'none', stroke = '#00F5FF', strokeWidth = 1 }) {
  return (
    <motion.circle
      cx={cx} cy={cy} r={r}
      stroke={stroke} strokeWidth={strokeWidth} fill={fill}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 0.8 }}
      transition={{ duration: 0.4, delay, type: 'spring', stiffness: 200 }}
      style={{ transformOrigin: `${cx}px ${cy}px` }}
    />
  );
}

function Label({ x, y, text, delay = 0 }) {
  return (
    <motion.text
      x={x} y={y}
      fill="#00F5FF"
      fontSize="7"
      fontFamily="JetBrains Mono, monospace"
      opacity={0}
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.85 }}
      transition={{ duration: 0.3, delay }}
    >
      {text}
    </motion.text>
  );
}

/* ─── Web / App: Client-Server-DB layered architecture ─── */
function WebSchematic() {
  return (
    <svg viewBox="0 0 320 208" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {/* Grid lines */}
      {[40, 80, 120, 160].map(y => (
        <line key={y} x1="0" y1={y} x2="320" y2={y} stroke="#00F5FF" strokeWidth="0.3" opacity="0.15" />
      ))}
      {[64, 128, 192, 256].map(x => (
        <line key={x} x1={x} y1="0" x2={x} y2="208" stroke="#00F5FF" strokeWidth="0.3" opacity="0.15" />
      ))}

      {/* Client box */}
      <AnimPath d="M20,30 h70 v30 h-70 Z" delay={0} />
      <Label x={28} y={50} text="CLIENT" delay={0.3} />

      {/* API Gateway */}
      <AnimPath d="M125,30 h70 v30 h-70 Z" delay={0.2} />
      <Label x={130} y={50} text="API GATEWAY" delay={0.5} />

      {/* Server */}
      <AnimPath d="M230,30 h70 v30 h-70 Z" delay={0.4} />
      <Label x={243} y={50} text="SERVER" delay={0.7} />

      {/* Flow arrows */}
      <AnimPath d="M90,45 L125,45" delay={0.6} strokeWidth={1.5} />
      <AnimPath d="M195,45 L230,45" delay={0.8} strokeWidth={1.5} />

      {/* Arrowheads */}
      <motion.polygon points="125,42 120,45 125,48" fill="#00F5FF" initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} transition={{ delay: 0.9 }} />
      <motion.polygon points="230,42 225,45 230,48" fill="#00F5FF" initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} transition={{ delay: 1.1 }} />

      {/* Database */}
      <AnimPath d="M230,100 h70 v30 h-70 Z" delay={0.9} />
      <Label x={238} y={120} text="DATABASE" delay={1.1} />
      <AnimPath d="M265,60 L265,100" delay={1} strokeWidth={1.5} />
      <motion.polygon points="262,100 265,105 268,100" fill="#00F5FF" initial={{ opacity: 0 }} animate={{ opacity: 0.8 }} transition={{ delay: 1.2 }} />

      {/* Cache */}
      <AnimPath d="M125,100 h70 v30 h-70 Z" delay={1} stroke="#9D00FF" />
      <Label x={138} y={120} text="CACHE" delay={1.3} />
      <AnimPath d="M160,60 L160,100" delay={1.1} stroke="#9D00FF" />

      {/* Data flow back */}
      <AnimPath d="M125,115 L90,115 L55,115 L55,60" delay={1.2} strokeWidth={1} stroke="#9D00FF" opacity={0.6} />

      {/* Pulse circles */}
      <AnimCircle cx={55} cy={45} r={4} delay={0.3} fill="#00F5FF22" />
      <AnimCircle cx={160} cy={45} r={4} delay={0.6} fill="#00F5FF22" />
      <AnimCircle cx={265} cy={45} r={4} delay={0.9} fill="#00F5FF22" />

      {/* Metrics row */}
      <AnimPath d="M20,160 h280" delay={1.3} opacity={0.3} />
      {['REQ/s: 4.2k', 'LATENCY: 12ms', 'UPTIME: 99.9%'].map((m, i) => (
        <Label key={i} x={20 + i * 96} y={175} text={m} delay={1.4 + i * 0.1} />
      ))}

      {/* Corner brackets */}
      <AnimPath d="M5,5 h15 M5,5 v15" delay={1.5} opacity={0.4} />
      <AnimPath d="M315,5 h-15 M315,5 v15" delay={1.5} opacity={0.4} />
      <AnimPath d="M5,203 h15 M5,203 v-15" delay={1.5} opacity={0.4} />
      <AnimPath d="M315,203 h-15 M315,203 v-15" delay={1.5} opacity={0.4} />
    </svg>
  );
}

/* ─── Robotics: Hardware schematic with sensor nodes ─── */
function RoboticsSchematic() {
  return (
    <svg viewBox="0 0 320 208" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {/* Grid */}
      {[52, 104, 156].map(y => (
        <line key={y} x1="0" y1={y} x2="320" y2={y} stroke="#00F5FF" strokeWidth="0.3" opacity="0.12" />
      ))}

      {/* Central MCU */}
      <AnimPath d="M120,74 h80 v60 h-80 Z" delay={0} strokeWidth={1.2} />
      <Label x={139} y={105} text="MCU / CPU" delay={0.4} />

      {/* LIDAR sensor */}
      <AnimCircle cx={55} cy={55} r={18} delay={0.3} />
      <Label x={34} y={82} text="LIDAR" delay={0.6} />
      <AnimPath d="M73,60 L120,90" delay={0.5} />

      {/* Camera */}
      <AnimPath d="M36,120 h38 v24 h-38 Z" delay={0.4} />
      <Label x={40} y={136} text="CAM" delay={0.7} />
      <AnimPath d="M74,132 L120,132" delay={0.7} strokeWidth={1.5} />

      {/* Motor driver */}
      <AnimPath d="M246,74 h50 v30 h-50 Z" delay={0.5} />
      <Label x={249} y={94} text="MOTOR DRV" delay={0.8} />
      <AnimPath d="M200,89 L246,89" delay={0.8} strokeWidth={1.5} />

      {/* Power unit */}
      <AnimPath d="M246,130 h50 v26 h-50 Z" delay={0.6} />
      <Label x={254} y={147} text="PWR UNIT" delay={0.9} />
      <AnimPath d="M271,130 L271,104" delay={0.9} stroke="#9D00FF" />

      {/* IMU */}
      <AnimPath d="M130,160 h60 v24 h-60 Z" delay={0.7} />
      <Label x={140} y={176} text="IMU / GPS" delay={1} />
      <AnimPath d="M160,160 L160,134" delay={1} />

      {/* Wireless */}
      <AnimPath d="M130,20 h60 v26 h-60 Z" delay={0.8} />
      <Label x={142} y={37} text="WIRELESS" delay={1.1} />
      <AnimPath d="M160,46 L160,74" delay={1.1} stroke="#9D00FF" />

      {/* Wifi arcs */}
      {[6, 10, 14].map((r, i) => (
        <motion.path
          key={r}
          d={`M155,16 a${r},${r} 0 0,1 ${r * 2},0`}
          stroke="#9D00FF" strokeWidth="1" fill="none" opacity={0}
          initial={{ opacity: 0 }} animate={{ opacity: 0.7 }}
          transition={{ delay: 1.2 + i * 0.1 }}
        />
      ))}

      {/* Data bus line */}
      <AnimPath d="M20,104 L120,104" delay={1.2} opacity={0.4} strokeDasharray="4 2" />

      {/* Status labels */}
      <AnimPath d="M20,185 h280" delay={1.3} opacity={0.25} />
      {['FREQ: 240MHz', 'PING: 3ms', 'MOTORS: 4x'].map((m, i) => (
        <Label key={i} x={20 + i * 96} y={198} text={m} delay={1.4 + i * 0.1} />
      ))}

      {/* Corner brackets */}
      <AnimPath d="M5,5 h15 M5,5 v15" delay={1.5} opacity={0.4} />
      <AnimPath d="M315,5 h-15 M315,5 v15" delay={1.5} opacity={0.4} />
      <AnimPath d="M5,203 h15 M5,203 v-15" delay={1.5} opacity={0.4} />
      <AnimPath d="M315,203 h-15 M315,203 v-15" delay={1.5} opacity={0.4} />
    </svg>
  );
}

/* ─── Data: Pipeline DAG ─── */
function DataSchematic() {
  const nodes = [
    { id: 'src', x: 30, y: 90, label: 'SOURCE', w: 56 },
    { id: 'ingest', x: 110, y: 60, label: 'INGEST', w: 56 },
    { id: 'clean', x: 110, y: 120, label: 'CLEAN', w: 56 },
    { id: 'transform', x: 196, y: 90, label: 'TRANSFORM', w: 72 },
    { id: 'model', x: 288, y: 60, label: 'ML MODEL', w: 60 },
    { id: 'viz', x: 288, y: 120, label: 'DASHBOARD', w: 66 },
  ];
  const edges = [
    { x1: 86, y1: 90, x2: 110, y2: 75 },
    { x1: 86, y1: 90, x2: 110, y2: 125 },
    { x1: 166, y1: 75, x2: 196, y2: 98 },
    { x1: 166, y1: 125, x2: 196, y2: 102 },
    { x1: 268, y1: 98, x2: 288, y2: 72 },
    { x1: 268, y1: 102, x2: 288, y2: 128 },
  ];

  return (
    <svg viewBox="0 0 380 208" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {/* Grid */}
      {[52, 104, 156].map(y => (
        <line key={y} x1="0" y1={y} x2="380" y2={y} stroke="#00F5FF" strokeWidth="0.3" opacity="0.12" />
      ))}

      {/* Edges */}
      {edges.map((e, i) => (
        <AnimPath key={i} d={`M${e.x1},${e.y1} L${e.x2},${e.y2}`} delay={0.3 + i * 0.15} strokeWidth={1.5} />
      ))}

      {/* Nodes */}
      {nodes.map((n, i) => (
        <g key={n.id}>
          <AnimPath d={`M${n.x},${n.y - 14} h${n.w} v28 h-${n.w} Z`} delay={i * 0.12} />
          <Label x={n.x + 4} y={n.y + 4} text={n.label} delay={0.2 + i * 0.12} />
          <AnimCircle cx={n.x + n.w / 2} cy={n.y} r={3} delay={0.1 + i * 0.12} fill="#00F5FF44" />
        </g>
      ))}

      {/* Animated data packets */}
      {[0, 0.6, 1.2].map((d, i) => (
        <motion.circle key={i} cx={0} cy={0} r={3} fill="#00F5FF" opacity={0.9}
          initial={{ offsetDistance: '0%', opacity: 0 }}
          animate={{ offsetDistance: '100%', opacity: [0, 1, 1, 0] }}
          transition={{ duration: 2, delay: 1.8 + d, repeat: Infinity, repeatDelay: 1.5 }}
          style={{ offsetPath: 'path("M86,90 L138,75 L224,90 L318,72")' }}
        />
      ))}

      {/* Stats bar */}
      <AnimPath d="M20,168 h340" delay={1.3} opacity={0.25} />
      {['ROWS: 2.4M', 'ACCURACY: 94.2%', 'RUNTIME: 8.3s'].map((m, i) => (
        <Label key={i} x={20 + i * 112} y={182} text={m} delay={1.4 + i * 0.1} />
      ))}

      <AnimPath d="M5,5 h15 M5,5 v15" delay={1.5} opacity={0.4} />
      <AnimPath d="M375,5 h-15 M375,5 v15" delay={1.5} opacity={0.4} />
      <AnimPath d="M5,203 h15 M5,203 v-15" delay={1.5} opacity={0.4} />
      <AnimPath d="M375,203 h-15 M375,203 v-15" delay={1.5} opacity={0.4} />
    </svg>
  );
}

/* ─── Research: Citation graph + methodology flowchart ─── */
function ResearchSchematic() {
  return (
    <svg viewBox="0 0 320 208" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
      {/* Grid */}
      {[52, 104, 156].map(y => (
        <line key={y} x1="0" y1={y} x2="320" y2={y} stroke="#9D00FF" strokeWidth="0.3" opacity="0.15" />
      ))}

      {/* Methodology flow (left column) */}
      {[
        { y: 28, label: 'LIT REVIEW' },
        { y: 70, label: 'HYPOTHESIS' },
        { y: 112, label: 'EXPERIMENT' },
        { y: 154, label: 'ANALYSIS' },
        { y: 194, label: 'CONCLUSION' },
      ].map((step, i) => (
        <g key={i}>
          <AnimPath d={`M14,${step.y - 12} h76 v22 h-76 Z`} delay={i * 0.15} stroke="#9D00FF" />
          <Label x={18} y={step.y + 4} text={step.label} delay={0.2 + i * 0.15} />
          {i < 4 && (
            <AnimPath d={`M52,${step.y + 10} L52,${step.y + 30}`} delay={0.3 + i * 0.15} stroke="#9D00FF" />
          )}
        </g>
      ))}

      {/* Divider */}
      <AnimPath d="M104,10 L104,198" delay={0.8} opacity={0.2} strokeDasharray="4 3" />

      {/* Citation graph (right) */}
      <Label x={160} y={18} text="CITATION GRAPH" delay={0.9} />

      {[
        { cx: 200, cy: 50, r: 16, label: 'ROOT', labelX: 190, labelY: 52 },
        { cx: 155, cy: 95, r: 10, label: '[A1]', labelX: 147, labelY: 97 },
        { cx: 245, cy: 95, r: 10, label: '[A2]', labelX: 237, labelY: 97 },
        { cx: 135, cy: 145, r: 8, label: '[B1]', labelX: 127, labelY: 147 },
        { cx: 175, cy: 150, r: 8, label: '[B2]', labelX: 167, labelY: 152 },
        { cx: 225, cy: 150, r: 8, label: '[B3]', labelX: 217, labelY: 152 },
        { cx: 265, cy: 145, r: 8, label: '[B4]', labelX: 257, labelY: 147 },
      ].map((n, i) => (
        <AnimCircle key={i} cx={n.cx} cy={n.cy} r={n.r} delay={0.9 + i * 0.1} stroke="#9D00FF" fill="#9D00FF11" />
      ))}

      {/* Citation edges */}
      {[
        'M200,66 L155,85', 'M200,66 L245,85',
        'M155,105 L135,137', 'M155,105 L175,142',
        'M245,105 L225,142', 'M245,105 L265,137',
      ].map((d, i) => (
        <AnimPath key={i} d={d} delay={1.1 + i * 0.08} stroke="#9D00FF" strokeWidth={0.8} />
      ))}

      {/* Labels */}
      {[
        { x: 190, y: 52, t: 'ROOT' },
        { x: 147, y: 97, t: '[A1]' },
        { x: 237, y: 97, t: '[A2]' },
      ].map((l, i) => (
        <Label key={i} x={l.x} y={l.y} text={l.t} delay={1 + i * 0.1} />
      ))}

      {/* Stats */}
      <AnimPath d="M104,185 h210" delay={1.5} opacity={0.25} />
      {['REFS: 42', 'CONF: 97.3%'].map((m, i) => (
        <Label key={i} x={110 + i * 100} y={198} text={m} delay={1.6 + i * 0.1} />
      ))}

      <AnimPath d="M5,5 h15 M5,5 v15" delay={1.5} opacity={0.4} />
      <AnimPath d="M315,5 h-15 M315,5 v15" delay={1.5} opacity={0.4} />
      <AnimPath d="M5,203 h15 M5,203 v-15" delay={1.5} opacity={0.4} />
      <AnimPath d="M315,203 h-15 M315,203 v-15" delay={1.5} opacity={0.4} />
    </svg>
  );
}

/* ─── Public export: picks schematic by category ─── */
const schematicMap = {
  Web: WebSchematic,
  Robotics: RoboticsSchematic,
  Data: DataSchematic,
  Research: ResearchSchematic,
};

export default function BlueprintOverlay({ category, visible }) {
  const Schematic = schematicMap[category] || WebSchematic;

  return (
    <motion.div
      initial={false}
      animate={{ opacity: visible ? 1 : 0 }}
      transition={{ duration: 0.4 }}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 10 }}
    >
      {/* Blueprint tinted background */}
      <div className="absolute inset-0 bg-[#050A10]/85 backdrop-blur-[2px]" />

      {/* Scan-line texture */}
      <div
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, #00F5FF 0px, #00F5FF 1px, transparent 1px, transparent 4px)',
        }}
      />

      {/* SVG schematic */}
      <div className="absolute inset-0 flex items-center justify-center p-3">
        {visible && <Schematic />}
      </div>

      {/* Blueprint corner label */}
      <div className="absolute top-2 left-2">
        <span className="font-mono text-[8px] text-primary/60 tracking-widest uppercase">
          Blueprint / {category}
        </span>
      </div>
    </motion.div>
  );
}