"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function ProfilePage() {
  const [role, setRole] = useState<'JOB_SEEKER' | 'EMPLOYER'>('JOB_SEEKER');
  
  // Shared State
  const [profilePicture, setProfilePicture] = useState('');
  const [uploading, setUploading] = useState(false);

  // Job Seeker State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [bio, setBio] = useState('');
  const [autoApplyEnabled, setAutoApplyEnabled] = useState(false);
  const [autoApplyKeywords, setAutoApplyKeywords] = useState('');
  const [resumeContent, setResumeContent] = useState('');
  const [generating, setGenerating] = useState(false);
  
  // Employer State
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');

  // Fetch existing profile on load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    // Fetch logic would go here
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://13.60.192.118:3001/uploads/profile-picture', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setProfilePicture(data.url);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateResume = async () => {
    setGenerating(true);
    try {
      const res = await fetch('http://13.60.192.118:3001/ai/resume/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name: firstName, last_name: lastName, bio, skills: [] })
      });
      const data = await res.json();
      setResumeContent(data.resume);
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    const endpoint = role === 'JOB_SEEKER' ? '/profiles/job-seeker' : '/profiles/employer';
    const payload = role === 'JOB_SEEKER' ? {
      firstName, lastName, bio, profilePicture, autoApplyEnabled, autoApplyKeywords: autoApplyKeywords.split(',').map(s => s.trim())
    } : {
      companyName, description: bio, website, profilePicture
    };

    try {
      const res = await fetch(`http://13.60.192.118:3001${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        window.location.href = '/jobs';
      }
    } catch (err) {
      console.error(err);
    }
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

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 120, height: 120, borderRadius: '50%', overflow: 'hidden', backgroundColor: 'rgba(255,255,255,0.1)', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {profilePicture ? (
              <img src={profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>No Image</span>
            )}
          </div>
          <label className="btn-primary" style={{ cursor: 'pointer', padding: '0.5rem 1rem', fontSize: '0.9rem' }}>
            {uploading ? 'Uploading...' : 'Upload Picture'}
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} disabled={uploading} />
          </label>
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {role === 'JOB_SEEKER' ? (
            <>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} style={inputStyle} required />
                <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} style={inputStyle} required />
              </div>
              <textarea placeholder="Professional Bio" value={bio} onChange={(e) => setBio(e.target.value)} style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} />
              
              <div style={{ background: 'rgba(0,0,0,0.2)', padding: '1.5rem', borderRadius: '12px' }}>
                <h3 style={{ marginTop: 0 }}>AI Autonomous Applications</h3>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={autoApplyEnabled} onChange={(e) => setAutoApplyEnabled(e.target.checked)} style={{ width: 20, height: 20 }} />
                  Enable AI to automatically apply for jobs on my behalf
                </label>
                {autoApplyEnabled && (
                  <input type="text" placeholder="Keywords to target (e.g. Flutter, React, Manager)" value={autoApplyKeywords} onChange={(e) => setAutoApplyKeywords(e.target.value)} style={inputStyle} />
                )}
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="button" className="btn-primary" onClick={handleGenerateResume} disabled={generating || !firstName || !lastName || !bio} style={{ flex: 1, background: 'linear-gradient(135deg, #00f0ff 0%, #0080ff 100%)' }}>
                  {generating ? 'Generating...' : '✨ Generate AI Resume & Profile'}
                </button>
              </div>

              {resumeContent && (
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '8px', whiteSpace: 'pre-wrap', maxHeight: 300, overflowY: 'auto', fontSize: '0.9rem' }}>
                  {resumeContent}
                </div>
              )}
            </>
          ) : (
            <>
              <input type="text" placeholder="Company Name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} style={inputStyle} required />
              <input type="url" placeholder="Company Website (Optional)" value={website} onChange={(e) => setWebsite(e.target.value)} style={inputStyle} />
              <textarea placeholder="Company Description" value={bio} onChange={(e) => setBio(e.target.value)} style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} />
            </>
          )}

          <button type="submit" className="btn-primary" style={{ marginTop: '1rem' }}>
            Save Profile & Continue
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
