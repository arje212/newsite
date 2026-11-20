import React from 'react';
import { Globe, Layout, Bot, BarChart3, FileText } from 'lucide-react';
import SectionHeading from '../components/shared/SectionHeading';
import ServiceCard from '../components/services/ServiceCard';

const services = [
  {
    icon: Globe,
    title: 'Website Development',
    description: 'We build pixel-perfect, responsive websites that combine stunning design with blazing performance. From corporate sites to creative portfolios, every project is engineered for impact.',
    image: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=1000&q=82',
    stack: ['React', 'Next.js', 'Tailwind CSS', 'TypeScript', 'Figma'],
    deliverables: ['Custom responsive design', 'SEO optimization', 'Performance tuning', 'CMS integration'],
  },
  {
    icon: Layout,
    title: 'Web Application Development',
    description: 'Scalable, full-stack web applications built for complex workflows and real-time data. We architect systems that grow with your business and handle millions of requests.',
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1000&q=82',
    stack: ['React', 'Node.js', 'Python', 'PostgreSQL', 'Docker', 'AWS'],
    deliverables: ['Full-stack architecture', 'API development', 'Real-time features', 'Cloud deployment'],
  },
  {
    icon: Bot,
    title: 'Robotics Projects',
    description: 'From autonomous navigation systems to industrial IoT solutions, our robotics team designs and builds physical computing systems that operate at the cutting edge.',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1000&q=82',
    stack: ['Python', 'ROS', 'Arduino', 'Raspberry Pi', 'TensorFlow', 'C++'],
    deliverables: ['Hardware prototyping', 'Embedded firmware', 'Computer vision', 'Autonomous systems'],
  },
  {
    icon: BarChart3,
    title: 'Data Analytics',
    description: 'Transform raw data into strategic intelligence. We build end-to-end data pipelines, interactive dashboards, and predictive models that drive smarter decisions.',
    image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1000&q=82',
    stack: ['Python', 'SQL', 'Tableau', 'Pandas', 'TensorFlow', 'Apache Spark'],
    deliverables: ['Data pipeline engineering', 'Interactive dashboards', 'Predictive modeling', 'Statistical analysis'],
  },
  {
    icon: FileText,
    title: 'Research Paper Development',
    description: 'Rigorous, publication-ready research across AI, machine learning, cybersecurity, and emerging tech domains. We partner with academics and industry professionals.',
    image: 'https://images.unsplash.com/photo-1535223289827-42f1e9919769?w=1000&q=82',
    stack: ['LaTeX', 'Python', 'MATLAB', 'R', 'Jupyter', 'Overleaf'],
    deliverables: ['Literature review', 'Methodology design', 'Data analysis', 'Publication support'],
  },
];

export default function Services() {
  return (
    <div className="pt-28 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          label="Our Services"
          title="The Sector Matrix"
          description="Five specialized sectors, each equipped with deep expertise and the latest tools to deliver exceptional results."
        />

        <div className="space-y-24">
          {services.map((service, i) => (
            <ServiceCard key={i} service={service} index={i} />
          ))}
        </div>
      </div>
    </div>
  );
}