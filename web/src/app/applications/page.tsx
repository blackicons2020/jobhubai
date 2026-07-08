'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ApplicationsPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchApplications = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      try {
        const res = await fetch('http://13.60.192.118:3001/jobs/employer/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setJobs(data);
        } else {
          const errData = await res.json();
          setError(errData.message || 'Failed to fetch applications');
        }
      } catch (err) {
        console.error(err);
        setError('Error fetching applications');
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplications();
  }, []);

  return (
    <main style={{ padding: '4rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', margin: 0 }} className="text-gradient">Applications Received</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/jobs">
            <button className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--secondary-color)', boxShadow: 'none' }}>Back to Job Board</button>
          </Link>
        </div>
      </div>

      {error && (
        <div style={{ backgroundColor: 'rgba(255, 0, 0, 0.1)', border: '1px solid red', color: '#ff4d4d', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</p>
      ) : jobs.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>You haven't posted any jobs yet.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {jobs.map(job => (
            <div key={job.id} className="glass-panel" style={{ padding: '1.5rem 2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{job.title}</h2>
                <span style={{ background: 'rgba(0, 240, 255, 0.2)', color: '#00f0ff', padding: '4px 12px', borderRadius: '16px', fontSize: '0.9rem', fontWeight: 'bold' }}>
                  {job._count?.applications || 0} Applications
                </span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button 
                  className="btn-primary" 
                  style={{ padding: '8px 24px', fontSize: '0.9rem' }}
                  onClick={() => window.alert('Detailed view of applications coming soon!')}
                >
                  View Candidates
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
