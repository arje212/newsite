import React from 'react';
import SectionHeading from '../components/shared/SectionHeading';
import ServiceCard from '../components/services/ServiceCard';
import { useEntityList } from '@/hooks/use-entity-list';
import { getServiceIcon } from '@/lib/icons';
import { Loading, Empty } from '../components/shared/ContentState';

export default function Services() {
  const { items, loading } = useEntityList('Service', 'sort_order', { published: true });
  const services = items.map((row) => ({
    id: row.id,
    icon: getServiceIcon(row.icon),
    title: row.title,
    description: row.description || row.short_description || '',
    image: row.image_url || '',
    stack: Array.isArray(row.stack) ? row.stack : [],
    deliverables: Array.isArray(row.deliverables) ? row.deliverables : [],
  }));

  return (
    <div className="pt-28 pb-24 px-6">
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          label="Our Services"
          title="The Sector Matrix"
          description="Specialized sectors, each equipped with deep expertise and the right tools to deliver exceptional results."
        />

        {loading ? <Loading /> : services.length === 0 ? <Empty>Our services will be listed here soon.</Empty> : (
          <div className="space-y-24">
            {services.map((service, i) => (
              <ServiceCard key={service.id} service={service} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}