"use client";
import { useState } from 'react';

export default function ProfilePage() {
  const [role, setRole] = useState<'JOB_SEEKER' | 'EMPLOYER'>('JOB_SEEKER');
  
  // Job Seeker State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  
  // Employer State
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to backend API when Auth is fully wired in the frontend
    console.log("Saving profile...");
  };

  return (
    <main style={{ padding: '4rem', maxWidth: '800px', margin: '0 auto' }}>
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', margin: 0 }} className="text-gradient">
            Complete Your Profile
          </h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              className="btn-primary" 
              style={{ background: 'transparent', border: '1px solid var(--secondary-color)', boxShadow: 'none' }}
              onClick={() => window.location.href = '/jobs'}
            >
              Back to Jobs
            </button>
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
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', justifyContent: 'center' }}>
          <button 
            className="btn-primary" 
            style={{ opacity: role === 'JOB_SEEKER' ? 1 : 0.5 }}
            onClick={() => setRole('JOB_SEEKER')}
          >
            I am a Job Seeker
          </button>
          <button 
            className="btn-primary" 
            style={{ opacity: role === 'EMPLOYER' ? 1 : 0.5 }}
            onClick={() => setRole('EMPLOYER')}
          >
            I am an Employer
          </button>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {role === 'JOB_SEEKER' ? (
            <>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input 
                  type="text" 
                  placeholder="First Name" 
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  style={inputStyle}
                  required
                />
                <input 
                  type="text" 
                  placeholder="Last Name" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  style={inputStyle}
                  required
                />
              </div>
              <textarea 
                placeholder="Professional Bio" 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
              />
            </>
          ) : (
            <>
              <input 
                type="text" 
                placeholder="Company Name" 
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                style={inputStyle}
                required
              />
              <input 
                type="url" 
                placeholder="Company Website (Optional)" 
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                style={inputStyle}
              />
              <textarea 
                placeholder="Company Description" 
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }}
              />
            </>
          )}

          <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
            Save Profile
          </button>
        </form>
      </div>
    </main>
  );
}

const inputStyle = {
  width: '100%',
  padding: '16px',
  borderRadius: '12px',
  border: '1px solid var(--glass-border)',
  background: 'rgba(255, 255, 255, 0.05)',
  color: 'white',
  fontSize: '1rem',
  outline: 'none',
  transition: 'border-color 0.3s ease',
};
