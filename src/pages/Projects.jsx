import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Grid } from 'lucide-react';
import SectionHeading from '../components/shared/SectionHeading';
import ProjectCard from '../components/projects/ProjectCard';
import CaseStudyModal from '../components/projects/CaseStudyModal';

const categories = ['All', 'Web', 'Robotics', 'Data', 'Research'];

const projects = [
  {
    title: 'NovaMart E-Commerce Platform',
    description: 'Full-stack e-commerce platform with real-time inventory, payment integration, and an AI-powered recommendation engine.',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&q=82',
    category: 'Web',
    tech: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
    caseStudy: {
      timeline: [
        { name: 'Discovery & Planning', duration: '2 weeks', status: 'done', desc: 'Stakeholder interviews, competitor analysis, and full technical requirements scoping.' },
        { name: 'UI/UX Design', duration: '3 weeks', status: 'done', desc: 'Wireframes, interactive prototypes, and design system established in Figma.' },
        { name: 'Core Development', duration: '8 weeks', status: 'done', desc: 'Frontend in React, REST API in Node.js, PostgreSQL schema, and Stripe checkout integration.' },
        { name: 'AI Recommendation Engine', duration: '3 weeks', status: 'done', desc: 'Collaborative filtering model trained on product co-purchase data, deployed via FastAPI.' },
        { name: 'QA & Launch', duration: '2 weeks', status: 'done', desc: 'Load testing at 5k concurrent users, accessibility audit, and staged rollout to production.' },
      ],
      challenges: [
        { title: 'Real-Time Inventory Sync', desc: 'Multiple warehouse feeds pushing conflicting stock counts caused race conditions at checkout.' },
        { title: 'Payment Failure Recovery', desc: 'Stripe webhook retries were creating duplicate orders during network instability.' },
        { title: 'Cold-Start Recommendation', desc: 'New users had no purchase history to feed the recommendation engine.' },
      ],
      solutions: [
        { title: 'Optimistic Locking via Redis', desc: 'Introduced distributed locks with TTL to serialize inventory writes per SKU.' },
        { title: 'Idempotency Keys', desc: 'Every Stripe charge request now carries a UUID idempotency key, eliminating duplicates.' },
        { title: 'Hybrid Filtering Model', desc: 'Combined content-based filtering (product metadata) with collaborative signals for cold-start users.' },
      ],
      impact: [
        { value: '340%', label: 'Revenue Uplift', desc: 'In first 6 months post-launch' },
        { value: '12ms', label: 'Avg. API Latency', desc: 'Down from 340ms on legacy system' },
        { value: '99.97%', label: 'Uptime', desc: 'Over 12 months in production' },
        { value: '28%', label: 'Cart Conversion', desc: 'Improved by AI recommendations' },
      ],
    },
  },
  {
    title: 'Autonomous Navigation Robot',
    description: 'A self-navigating robot equipped with LIDAR mapping, obstacle avoidance, and real-time path planning.',
    image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=1200&q=82',
    category: 'Robotics',
    tech: ['Python', 'ROS', 'TensorFlow', 'Arduino'],
    caseStudy: {
      timeline: [
        { name: 'Hardware Specification', duration: '1 week', status: 'done', desc: 'Selected actuators, LIDAR unit, compute board (Jetson Nano), and motor driver stack.' },
        { name: 'Chassis & Wiring', duration: '2 weeks', status: 'done', desc: 'Assembled carbon-fiber frame, wired power distribution, and validated sensor buses.' },
        { name: 'SLAM Implementation', duration: '4 weeks', status: 'done', desc: 'Implemented GMapping SLAM in ROS to build real-time occupancy maps from LIDAR data.' },
        { name: 'Path Planning & Obstacle Avoidance', duration: '4 weeks', status: 'done', desc: 'Integrated A* global planner with DWA local planner for dynamic obstacle avoidance.' },
        { name: 'Field Testing & Calibration', duration: '3 weeks', status: 'done', desc: '200+ hours of field trials across varied terrain; tuned PID controllers for stability.' },
      ],
      challenges: [
        { title: 'LIDAR Drift in Dynamic Environments', desc: 'Fast-moving obstacles caused SLAM map corruption and localization loss.' },
        { title: 'Power Budget Constraints', desc: 'Peak motor draw was starving the compute board, causing shutdowns mid-navigation.' },
        { title: 'Real-Time Planning at 10Hz', desc: 'Path replanning latency exceeded 200ms, causing hesitation in narrow corridors.' },
      ],
      solutions: [
        { title: 'Particle Filter Localization Fallback', desc: 'Added AMCL as a localization fallback when SLAM confidence dropped below threshold.' },
        { title: 'Dedicated Power Rails', desc: 'Separated motor and compute power rails with supercapacitor buffers for transient loads.' },
        { title: 'Optimized DWA Sampling', desc: 'Reduced velocity sample space and added CUDA acceleration, achieving 8ms replanning.' },
      ],
      impact: [
        { value: '98.4%', label: 'Navigation Accuracy', desc: 'Obstacle-free path completion rate' },
        { value: '8ms', label: 'Replan Latency', desc: 'Down from 200ms baseline' },
        { value: '14hr', label: 'Battery Life', desc: 'Continuous autonomous operation' },
        { value: '3×', label: 'Speed vs Manual', desc: 'Faster than operator-controlled mode' },
      ],
    },
  },
  {
    title: 'CityPulse Analytics Dashboard',
    description: 'Interactive dashboard aggregating urban data streams for city planners — traffic, energy, and population metrics.',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=82',
    category: 'Data',
    tech: ['Python', 'Tableau', 'Apache Spark', 'SQL'],
    caseStudy: {
      timeline: [
        { name: 'Data Audit & Ingestion Design', duration: '2 weeks', status: 'done', desc: 'Catalogued 18 municipal data sources; designed Kafka-based ingestion pipelines.' },
        { name: 'ETL Pipeline Development', duration: '5 weeks', status: 'done', desc: 'Built Spark jobs for cleaning, deduplication, and feature engineering across data streams.' },
        { name: 'Data Warehouse Setup', duration: '2 weeks', status: 'done', desc: 'Star-schema warehouse on Redshift; partitioned by borough and date for query performance.' },
        { name: 'Dashboard Development', duration: '4 weeks', status: 'done', desc: 'Built interactive Tableau dashboards with drill-down views for traffic, energy, and demographics.' },
        { name: 'Stakeholder Training & Handoff', duration: '1 week', status: 'done', desc: 'Delivered training sessions and full runbook documentation to city planning department.' },
      ],
      challenges: [
        { title: 'Schema Fragmentation', desc: 'Data from 18 sources used 12 different date formats and inconsistent geographic encoding.' },
        { title: 'Near-Real-Time Latency Requirements', desc: 'City planners needed traffic incident data within 90 seconds of occurrence.' },
        { title: 'Dashboard Performance at Scale', desc: 'Tableau queries against raw data exceeded 30-second load times for borough-wide views.' },
      ],
      solutions: [
        { title: 'Canonical Schema Transformer', desc: 'Built a configuration-driven transformer mapping all source schemas to a unified canonical model.' },
        { title: 'Kafka + Spark Streaming', desc: 'Replaced batch ETL for high-priority streams with micro-batch Spark Streaming at 30s windows.' },
        { title: 'Materialized Aggregation Layer', desc: 'Pre-computed and cached common aggregations in Redshift materialized views, reducing p95 to 1.2s.' },
      ],
      impact: [
        { value: '2.4M', label: 'Rows Processed Daily', desc: 'Across 18 live data sources' },
        { value: '67%', label: 'Faster Decisions', desc: 'Reported by city planning dept.' },
        { value: '1.2s', label: 'Dashboard Load', desc: 'Down from 30s on raw queries' },
        { value: '18', label: 'Data Sources', desc: 'Unified into one platform' },
      ],
    },
  },
  {
    title: 'HealthSync Mobile App',
    description: 'Cross-platform health tracking application with wearable integration, medication reminders, and doctor portals.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=82',
    category: 'Web',
    tech: ['React Native', 'Firebase', 'Node.js', 'HL7'],
    caseStudy: {
      timeline: [
        { name: 'UX Research & HIPAA Scoping', duration: '2 weeks', status: 'done', desc: 'Patient journey mapping, HIPAA compliance checklist, and PHI data flow diagrams.' },
        { name: 'Wearable SDK Integration', duration: '3 weeks', status: 'done', desc: 'Integrated Apple HealthKit, Google Fit, and Garmin Connect APIs into unified data layer.' },
        { name: 'Core App Development', duration: '7 weeks', status: 'done', desc: 'React Native app with medication scheduler, biometric dashboards, and push notifications.' },
        { name: 'Doctor Portal', duration: '3 weeks', status: 'done', desc: 'Web-based portal for physicians to review patient trends, annotate readings, and set alerts.' },
        { name: 'Security Audit & Launch', duration: '2 weeks', status: 'done', desc: 'Third-party HIPAA penetration test, end-to-end encryption audit, and App Store submission.' },
      ],
      challenges: [
        { title: 'HIPAA PHI Compliance', desc: 'Storing and transmitting patient biometrics required full HIPAA-compliant infrastructure.' },
        { title: 'Wearable Data Fragmentation', desc: 'Heart rate data formats differed significantly across Apple, Google, and Garmin ecosystems.' },
        { title: 'Offline-First Reliability', desc: 'Patients in low-connectivity areas needed full app functionality without internet access.' },
      ],
      solutions: [
        { title: 'HIPAA-Compliant Firebase Config', desc: 'Configured Firebase with BAA, field-level encryption for PHI, and audit logging via Cloud Functions.' },
        { title: 'Unified Biometric Schema', desc: 'Abstracted all wearable SDKs behind a single normalized BiometricEvent model.' },
        { title: 'Redux Persist + Sync Queue', desc: 'Implemented offline queue that syncs pending writes to Firebase when connectivity is restored.' },
      ],
      impact: [
        { value: '50k+', label: 'Active Users', desc: 'Within 3 months of launch' },
        { value: '4.8★', label: 'App Store Rating', desc: 'Across iOS & Android' },
        { value: '91%', label: 'Medication Adherence', desc: 'Among app users vs 58% baseline' },
        { value: '0', label: 'HIPAA Violations', desc: 'Clean compliance record' },
      ],
    },
  },
  {
    title: 'SmartNest IoT Hub',
    description: 'Unified smart home control system integrating 15+ device types with voice control and energy optimization.',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1200&q=82',
    category: 'Robotics',
    tech: ['Raspberry Pi', 'MQTT', 'Python', 'React'],
    caseStudy: {
      timeline: [
        { name: 'Device Protocol Survey', duration: '1 week', status: 'done', desc: 'Catalogued Zigbee, Z-Wave, Wi-Fi, and BLE device protocols across 15 target device types.' },
        { name: 'Hub Hardware Build', duration: '2 weeks', status: 'done', desc: 'Raspberry Pi 4 hub with USB Zigbee/Z-Wave dongles, configured as Home Assistant base.' },
        { name: 'MQTT Broker & Device Mesh', duration: '3 weeks', status: 'done', desc: 'Deployed Mosquitto broker; wrote custom adapters for each protocol into unified MQTT topics.' },
        { name: 'React Control Dashboard', duration: '4 weeks', status: 'done', desc: 'Real-time floor-plan-based device dashboard with scene automation and energy reporting.' },
        { name: 'Voice & Optimization Layer', duration: '3 weeks', status: 'done', desc: 'Alexa/Google Home integration via skill bridge; ML-based energy optimization routines.' },
      ],
      challenges: [
        { title: 'Cross-Protocol Device Discovery', desc: 'Each smart home protocol required separate pairing flows and state machine management.' },
        { title: 'Sub-100ms Response Latency', desc: 'Occupants expected instant light/thermostat response; cloud-routed commands took 400–800ms.' },
        { title: 'Energy Data Accuracy', desc: 'Consumer-grade smart plugs reported power draw with ±15% error, making optimization unreliable.' },
      ],
      solutions: [
        { title: 'Unified Device Abstraction Layer', desc: 'Built a protocol-agnostic device model mapping Zigbee, Z-Wave, and Wi-Fi into identical state objects.' },
        { title: 'Local-First MQTT Routing', desc: 'All automations execute locally on-hub via Node-RED; cloud is only used for remote access.' },
        { title: 'Calibrated Power Model', desc: 'Applied per-device calibration offsets derived from a reference clamp meter during commissioning.' },
      ],
      impact: [
        { value: '31%', label: 'Energy Savings', desc: 'Average monthly utility bill reduction' },
        { value: '18ms', label: 'Command Latency', desc: 'Local routing vs 600ms cloud' },
        { value: '15+', label: 'Device Types', desc: 'Unified in one dashboard' },
        { value: '100%', label: 'Local Uptime', desc: 'Works without internet connection' },
      ],
    },
  },
  {
    title: 'AI-Driven Drug Discovery Paper',
    description: 'Published research on using graph neural networks for molecular property prediction in pharmaceutical research.',
    image: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=1200&q=82',
    category: 'Research',
    tech: ['PyTorch', 'RDKit', 'LaTeX', 'Python'],
    caseStudy: {
      timeline: [
        { name: 'Literature Review', duration: '3 weeks', status: 'done', desc: 'Surveyed 200+ papers on GNNs, molecular fingerprinting, and ADMET property prediction.' },
        { name: 'Dataset Curation', duration: '2 weeks', status: 'done', desc: 'Processed 1.2M compounds from ChEMBL; generated molecular graphs via RDKit.' },
        { name: 'Model Architecture Design', duration: '3 weeks', status: 'done', desc: 'Designed a novel Attentive GNN with edge-feature propagation for bond-type encoding.' },
        { name: 'Training & Ablation Studies', duration: '5 weeks', status: 'done', desc: 'Trained on 4× A100 GPUs; 12 ablation variants compared against GCN, MPNN, and SchNet baselines.' },
        { name: 'Writing & Peer Review', duration: '4 weeks', status: 'done', desc: 'Drafted manuscript, incorporated reviewer feedback across two revision rounds, accepted at NeurIPS.' },
      ],
      challenges: [
        { title: 'Molecular Graph Scalability', desc: 'Standard GNN implementations couldn\'t handle graphs with 100+ nodes without memory overflow.' },
        { title: 'Class Imbalance in ADMET Data', desc: 'Toxic compound labels were only 3.2% of the dataset, causing severe model bias.' },
        { title: 'Reproducibility Standards', desc: 'Ensuring all experiments were fully reproducible across different compute environments.' },
      ],
      solutions: [
        { title: 'Mini-Batch Neighborhood Sampling', desc: 'Implemented GraphSAGE-style mini-batch sampling to handle large molecular graphs within memory.' },
        { title: 'Focal Loss + SMOTE Augmentation', desc: 'Combined focal loss weighting with SMOTE oversampling to achieve balanced class learning.' },
        { title: 'Containerized Experiment Tracking', desc: 'Used Docker + MLflow to snapshot every experiment config, data hash, and model checkpoint.' },
      ],
      impact: [
        { value: '94.2%', label: 'Model Accuracy', desc: 'On held-out ADMET test set' },
        { value: 'NeurIPS', label: 'Publication Venue', desc: 'Top-tier ML conference' },
        { value: '1.2M', label: 'Compounds Analyzed', desc: 'From ChEMBL database' },
        { value: '42', label: 'Citations', desc: 'Within 6 months of publication' },
      ],
    },
  },
];

export default function Projects() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [blueprintMode, setBlueprintMode] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);

  const filtered = activeCategory === 'All'
    ? projects
    : projects.filter(p => p.category === activeCategory);

  return (
    <div className="pt-28 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          label="Portfolio"
          title="The Repository"
          description="A selection of concept builds and illustrative case studies across web, robotics, data, and research. Metrics shown in sample case studies are illustrative, not audited client results."
        />

        {/* Controls row */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-12">
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-mono transition-all duration-300 ${
                  activeCategory === cat
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground border border-border/50 hover:border-primary/20'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <button
            onClick={() => setBlueprintMode(b => !b)}
            className={`relative flex items-center gap-2.5 px-4 py-2 rounded-lg border font-mono text-sm transition-all duration-300 shrink-0 ${
              blueprintMode
                ? 'bg-primary/10 border-primary/50 text-primary shadow-[0_8px_22px_hsl(145_15%_27%/0.10)]'
                : 'border-border/50 text-muted-foreground hover:border-primary/30 hover:text-foreground'
            }`}
          >
            <span className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${blueprintMode ? 'bg-primary animate-pulse' : 'bg-muted-foreground'}`} />
            <Cpu className="w-3.5 h-3.5" />
            Blueprint View
            <span className={`px-1.5 py-0.5 rounded text-[10px] ml-0.5 transition-all duration-300 ${blueprintMode ? 'bg-primary/20 text-primary' : 'bg-muted/60 text-muted-foreground'}`}>
              {blueprintMode ? 'ON' : 'OFF'}
            </span>
          </button>
        </div>

        <AnimatePresence>
          {blueprintMode && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <div className="rounded-xl border border-primary/20 bg-primary/5 px-5 py-3.5 flex items-start gap-3">
                <Grid className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                <p className="font-mono text-xs text-primary/90 leading-relaxed">
                  <span className="font-semibold">Blueprint View Active</span> — Technical architecture schematics and data-flow diagrams are overlaid on each project thumbnail.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((project, i) => (
            <ProjectCard
              key={project.title}
              project={project}
              index={i}
              blueprintMode={blueprintMode}
              onViewCaseStudy={() => setSelectedProject(project)}
            />
          ))}
        </div>
      </div>

      {/* Case Study Modal */}
      <AnimatePresence>
        {selectedProject && (
          <CaseStudyModal
            project={selectedProject}
            onClose={() => setSelectedProject(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}