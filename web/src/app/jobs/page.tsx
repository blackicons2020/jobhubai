'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function JobsFeedPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [applyingJobId, setApplyingJobId] = useState<string | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generatingCoverLetter, setGeneratingCoverLetter] = useState(false);

  useEffect(() => {
    // Guard: check if user has a completed profile before allowing access to jobs
    const checkProfileAndFetch = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }

      // Try job-seeker profile first, then employer
      let hasProfile = false;
      try {
        const seekerRes = await fetch('http://13.60.192.118:3001/profiles/job-seeker', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (seekerRes.ok) {
          const profile = await seekerRes.json();
          if (profile && profile.firstName && profile.firstName.length > 0) {
            hasProfile = true;
          }
        }
        if (!hasProfile) {
          const employerRes = await fetch('http://13.60.192.118:3001/profiles/employer', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (employerRes.ok) {
            const profile = await employerRes.json();
            if (profile && profile.companyName && profile.companyName.length > 0) {
              hasProfile = true;
            }
          }
        }
      } catch (err) {
        // Profile check failed, redirect to profile to be safe
      }

      if (!hasProfile) {
        window.location.href = '/profile';
        return;
      }

      fetchJobs();
    };
    checkProfileAndFetch();
  }, []);

  const fetchJobs = async () => {
    try {
      const res = await fetch('http://13.60.192.118:3001/jobs');
      if (res.ok) {
        const data = await res.json();
        setJobs(data);
      }
    } catch (err) {
      console.error('Failed to fetch jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async (jobId: string) => {
    setError('');
    setSuccess('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('You must be logged in to apply for a job.');
      }

      const res = await fetch(`http://13.60.192.118:3001/applications/${jobId}/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          coverLetter: coverLetter || undefined
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Application failed');
      }

      setSuccess('Application submitted successfully!');
      setApplyingJobId(null);
      setCoverLetter('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleGenerateCoverLetter = async (job: any) => {
    setGeneratingCoverLetter(true);
    try {
      const token = localStorage.getItem('token');
      // Fetch user profile first (we need it for the AI)
      const profileRes = await fetch('http://13.60.192.118:3001/profiles/job-seeker', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const profileData = await profileRes.json();

      const res = await fetch('http://13.60.192.118:3001/ai/cover-letter/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profile: profileData,
          job: job
        })
      });
      const data = await res.json();
      setCoverLetter(data.cover_letter);
    } catch (err) {
      console.error(err);
      setError('Failed to generate cover letter.');
    } finally {
      setGeneratingCoverLetter(false);
    }
  };

  const filteredJobs = jobs.filter(j => 
    j.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (j.employer?.companyName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main style={{ padding: '4rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '3rem', margin: 0 }} className="text-gradient">Job Board</h1>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Link href="/profile">
            <button className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--secondary-color)', boxShadow: 'none' }}>Profile</button>
          </Link>
          <Link href="/jobs/create">
            <button className="btn-primary">Post a Job</button>
          </Link>
          <button 
            className="btn-primary" 
            style={{ background: 'transparent', border: '1px solid #ff4d4d', color: '#ff4d4d', boxShadow: 'none' }}
            onClick={() => {
              localStorage.removeItem('token');
              window.location.href = '/login';
            }}
          >
            Logout
          </button>
        </div>
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

      {error && (
        <div style={{ backgroundColor: 'rgba(255, 0, 0, 0.1)', border: '1px solid red', color: '#ff4d4d', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {success && (
        <div style={{ backgroundColor: 'rgba(0, 255, 0, 0.1)', border: '1px solid green', color: '#00ff00', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', textAlign: 'center' }}>
          {success}
        </div>
      )}

      {loading ? (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading jobs...</p>
      ) : filteredJobs.length === 0 ? (
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>No jobs found.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {filteredJobs.map(job => (
            <div key={job.id} className="glass-panel" style={{ padding: '1.5rem 2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h2 style={{ fontSize: '1.5rem', margin: '0 0 0.5rem 0' }}>{job.title}</h2>
                  <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <span>🏢 {job.employer?.companyName || 'Unknown Company'}</span>
                    <span>📍 {job.location || 'Anywhere'} {job.isRemote && '(Remote)'}</span>
                    <span>💰 {job.salary || 'Competitive'}</span>
                  </div>
                </div>
                <button 
                  className="btn-primary" 
                  style={{ padding: '8px 24px' }}
                  onClick={() => setApplyingJobId(applyingJobId === job.id ? null : job.id)}
                >
                  {applyingJobId === job.id ? 'Cancel' : 'Apply Now'}
                </button>
              </div>

              {/* Optional Cover Letter Section */}
              {applyingJobId === job.id && (
                <div style={{ marginTop: '1.5rem', padding: '1.5rem', background: 'rgba(0,0,0,0.2)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem' }}>Submit Application</h3>
                  <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                    Would you like to include an optional cover letter? (Pro tip: AI Cover Letter generation is coming soon for premium subscribers!)
                  </p>
                  <textarea 
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    rows={4}
                    placeholder="Write a brief cover letter (optional)..."
                    style={{ width: '100%', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'white', fontSize: '1rem', outline: 'none', resize: 'vertical', marginBottom: '1rem' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button 
                      className="btn-primary" 
                      onClick={() => handleGenerateCoverLetter(job)}
                      disabled={generatingCoverLetter}
                      style={{ background: 'linear-gradient(135deg, #00f0ff 0%, #0080ff 100%)', padding: '8px 16px', fontSize: '0.9rem' }}
                    >
                      {generatingCoverLetter ? 'Generating...' : '✨ Generate AI Cover Letter'}
                    </button>
                    <button 
                      className="btn-primary" 
                      onClick={() => handleApply(job.id)}
                    >
                      Confirm Application
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
