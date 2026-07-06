"use client";
import { useState } from 'react';
import Link from 'next/link';

// Mock data until API integration is complete
const MOCK_JOBS = [
  { id: '1', title: 'Senior AI Engineer', company: 'TechCorp AI', location: 'San Francisco, CA', isRemote: true, salary: '$180k - $220k' },
  { id: '2', title: 'Frontend Developer', company: 'NeonGlass UI', location: 'New York, NY', isRemote: false, salary: '$120k - $150k' },
  { id: '3', title: 'Product Manager', company: 'Global Innovate', location: 'London, UK', isRemote: true, salary: '£90k - £120k' },
];

export default function JobsFeedPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <main style={{ padding: '4rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', margin: 0 }} className="text-gradient">Job Board</h1>
        <Link href="/jobs/create">
          <button className="btn-primary">Post a Job</button>
        </Link>
      </div>

      <div style={{ marginBottom: '3rem' }}>
        <input 
          type="text" 
          placeholder="Search jobs by title, company, or keyword..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '20px',
            borderRadius: '16px',
            border: '1px solid var(--glass-border)',
            background: 'var(--glass-bg)',
            color: 'white',
            fontSize: '1.2rem',
            outline: 'none',
            boxShadow: 'var(--glass-shadow)',
          }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {MOCK_JOBS.filter(j => j.title.toLowerCase().includes(searchQuery.toLowerCase())).map(job => (
          <div key={job.id} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0' }}>{job.title}</h2>
              <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <span>🏢 {job.company}</span>
                <span>📍 {job.location} {job.isRemote && '(Remote)'}</span>
                <span>💰 {job.salary}</span>
              </div>
            </div>
            <button className="btn-primary" style={{ padding: '8px 24px' }}>Apply</button>
          </div>
        ))}
      </div>
    </main>
  );
}
