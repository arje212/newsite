import React, { useState, useEffect } from 'react';
import { api } from '@/api/client';
import SectionHeading from '../components/shared/SectionHeading';
import MemberCard from '../components/team/MemberCard';

// Fallback static data if no DB records exist yet
const staticMembers = [
  {
    id: 'static-1',
    role: 'Lead Developer',
    name: 'Rolando M. Melecio Jr.',
    location: 'Tanauan City, Batangas',
    about: 'Full-stack engineer and robotics specialist based in Tanauan City, Batangas. Leads the technical direction of CodeCraft with expertise across web development, embedded systems, and automation.',
    specialties: ['Full-Stack Development', 'Robotics & Automation', 'System Architecture'],
    skills: ['Python', 'JavaScript', 'C++', 'C Programming', 'React.js', 'Node.js', 'Django', 'Robotics', 'GitHub'],
    portfolio: '#',
    photo_url: null,
  },
  {
    id: 'static-2',
    role: 'Developer / Data Analyst',
    name: 'John Franklin P. Nieras',
    location: 'Tanauan City, Batangas',
    about: 'Versatile developer and data analyst who bridges the gap between software engineering and business intelligence. Expert in building automation tools and powerful data dashboards.',
    specialties: ['Data Analytics', 'Business Intelligence', 'Automation Tools'],
    skills: ['C#', 'Python', 'JavaScript', 'SQL', 'Blazor', 'WPF', 'Power BI', 'Google Apps Script'],
    portfolio: null,
    photo_url: null,
  },
  {
    id: 'static-3',
    role: 'Marketing Specialist',
    name: 'Ryan Joshua Navarro',
    location: 'Malvar, Batangas',
    about: 'A results-driven professional with strong expertise in client service, sales, and customer support. Skilled in managing client relationships, handling accounts, and delivering effective solutions.',
    specialties: ['Client Relations', 'Operational Support'],
    skills: ['Client Service Coordinator', 'Customer Support Agent', 'Account Executive', 'Inside Sales Representative'],
    portfolio: null,
    photo_url: null,
  },
  {
    id: 'static-4',
    role: 'Marketing Specialist',
    name: 'Claire Mueco',
    location: 'Tanauan City, Batangas',
    about: 'Drives CodeCraft\'s brand presence and client engagement through creative digital marketing strategies. Skilled in content creation, social media management, and customer relationship building.',
    specialties: ['Digital Marketing', 'Brand Strategy', 'Customer Relations'],
    skills: ['Social Media Marketing', 'Content Strategy', 'Customer Engagement', 'Excel'],
    portfolio: null,
    photo_url: null,
  },
  {
    id: 'static-5',
    role: 'Data & Research Specialist',
    name: 'Ivan Jethro Mercado',
    location: 'Tanauan City, Batangas',
    about: 'A detail-oriented research professional with strong expertise in thesis writing, data analysis, and statistical interpretation. Experienced in guiding students and clients through the full research process.',
    specialties: ['Research Writing', 'Data Interpretation', 'Statistical Analysis', 'Thesis Consultation'],
    skills: ['Thesis/Research Writing', 'Thesis Consultant', 'Data Interpretation', 'Statistics'],
    portfolio: null,
    photo_url: null,
  },
];

export default function Team() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.entities.TeamMember.list('sort_order').then(data => {
      setMembers(data.length > 0 ? data : staticMembers);
      setLoading(false);
    }).catch(() => {
      setMembers(staticMembers);
      setLoading(false);
    });
  }, []);

  // Normalize DB records to match MemberCard expected shape
  const normalizedMembers = members.map(m => ({
    ...m,
    portfolio: m.portfolio_url || m.portfolio || null,
  }));

  return (
    <div className="pt-28 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          label="The Team"
          title="Meet CodeCraft"
          description="Five specialists united by a shared mission — to craft digital solutions that move the needle."
        />

        {loading ? (
          <div className="flex justify-center py-16">
            <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {normalizedMembers.map((member, i) => (
              <MemberCard key={member.id || member.name} member={member} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}