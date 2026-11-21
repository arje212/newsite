import React from 'react';
import { useEntityList } from '@/hooks/use-entity-list';
import { Loading, Empty } from '../components/shared/ContentState';
import SectionHeading from '../components/shared/SectionHeading';
import MemberCard from '../components/team/MemberCard';

export default function Team() {
  const { items: members, loading } = useEntityList('TeamMember', 'sort_order');

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
          description="The specialists behind CodeCraft, united by a shared mission — to craft digital solutions that move the needle."
        />

        {loading ? <Loading /> : normalizedMembers.length === 0 ? <Empty>Our team will be introduced here soon.</Empty> : (
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