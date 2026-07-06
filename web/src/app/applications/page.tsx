"use client";
import { useState } from 'react';

// Mock data until API integration
const MOCK_APPLICATIONS = [
  { id: '1', jobTitle: 'Senior AI Engineer', company: 'TechCorp AI', status: 'VIEWED', appliedDate: '2026-07-01' },
  { id: '2', jobTitle: 'Frontend Developer', company: 'NeonGlass UI', status: 'SHORTLISTED', appliedDate: '2026-06-28' },
  { id: '3', jobTitle: 'Product Manager', company: 'Global Innovate', status: 'APPLIED', appliedDate: '2026-07-05' },
];

export default function ApplicationsPage() {
  const [role] = useState<'JOB_SEEKER' | 'EMPLOYER'>('JOB_SEEKER'); // Mock role for now

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPLIED': return 'var(--text-secondary)';
      case 'VIEWED': return '#F59E0B'; // Amber
      case 'SHORTLISTED': return '#3B82F6'; // Blue
      case 'HIRED': return '#10B981'; // Green
      case 'REJECTED': return '#EF4444'; // Red
      default: return 'var(--text-secondary)';
    }
  };

  return (
    <main style={{ padding: '4rem', maxWidth: '1000px', margin: '0 auto' }}>
      <header style={{ marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', margin: 0 }} className="text-gradient">
          {role === 'JOB_SEEKER' ? 'My Applications' : 'Candidate Pipeline'}
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', marginTop: '0.5rem' }}>
          {role === 'JOB_SEEKER' ? 'Track the status of your recent job applications.' : 'Review and manage applicants for your active job postings.'}
        </p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {MOCK_APPLICATIONS.map(app => (
          <div key={app.id} className="glass-panel" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem 2rem' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0' }}>{app.jobTitle}</h2>
              <div style={{ display: 'flex', gap: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
                <span>🏢 {app.company}</span>
                <span>📅 Applied: {app.appliedDate}</span>
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{ 
                padding: '8px 16px', 
                borderRadius: '20px', 
                backgroundColor: `${getStatusColor(app.status)}20`, // 20% opacity background
                color: getStatusColor(app.status),
                fontWeight: 'bold',
                border: `1px solid ${getStatusColor(app.status)}40`
              }}>
                {app.status}
              </div>
              
              {role === 'EMPLOYER' && (
                <button className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                  Review
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
