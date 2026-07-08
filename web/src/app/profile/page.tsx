"use client";
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function ProfilePage() {
  const [role, setRole] = useState<'JOB_SEEKER' | 'EMPLOYER' | null>(null);
  const [subscriptionTier, setSubscriptionTier] = useState<'FREE' | 'PREMIUM'>('FREE');
  const [freeGenerationsUsed, setFreeGenerationsUsed] = useState(0);
  
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
  const [showAiForm, setShowAiForm] = useState(false);
  const [aiSkills, setAiSkills] = useState('');
  const [aiExperience, setAiExperience] = useState('');
  
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

    const fetchMe = async () => {
      try {
        const res = await fetch('http://13.60.192.118:3001/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const user = await res.json();
          setRole(user.role);
          setSubscriptionTier(user.subscriptionTier);
          setFreeGenerationsUsed(user.freeGenerationsUsed);
          fetchProfile(user.role, token);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchMe();
  }, []);

  const fetchProfile = async (currentRole: string, token: string) => {
    try {
      const endpoint = currentRole === 'JOB_SEEKER' ? '/profiles/job-seeker' : '/profiles/employer';
      const res = await fetch(`http://13.60.192.118:3001${endpoint}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (currentRole === 'JOB_SEEKER') {
          setFirstName(data.firstName || '');
          setLastName(data.lastName || '');
          setBio(data.bio || '');
          setProfilePicture(data.profilePicture || '');
          setAutoApplyEnabled(data.autoApplyEnabled || false);
          setAutoApplyKeywords((data.autoApplyKeywords || []).join(', '));
          setResumeContent(data.resumeContent || '');
        } else {
          setCompanyName(data.companyName || '');
          setBio(data.description || '');
          setWebsite(data.website || '');
          setProfilePicture(data.profilePicture || '');
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

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
        setProfilePicture(`http://13.60.192.118:3001${data.url}`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateResume = async () => {
    const token = localStorage.getItem('token');
    setGenerating(true);
    try {
      const res = await fetch('http://13.60.192.118:3001/ai/resume/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          first_name: firstName, 
          last_name: lastName, 
          bio, 
          skills: aiSkills.split(',').map(s => s.trim()),
          experience: aiExperience 
        })
      });
      
      const data = await res.json();
      if (res.ok) {
        setResumeContent(data.resume);
        setShowAiForm(false);
        if (subscriptionTier === 'FREE') {
          setFreeGenerationsUsed(prev => prev + 1);
        }
      } else {
        alert(data.message || 'Generation failed');
      }
    } catch (err) {
      console.error(err);
      alert('Error generating resume');
    } finally {
      setGenerating(false);
    }
  };

  const handleUpgrade = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://13.60.192.118:3001/profiles/upgrade', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setSubscriptionTier('PREMIUM');
        alert('Upgraded to Premium!');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) return;

    const endpoint = role === 'JOB_SEEKER' ? '/profiles/job-seeker' : '/profiles/employer';
    const payload = role === 'JOB_SEEKER' ? {
      firstName, lastName, bio, profilePicture, resumeContent, autoApplyEnabled, autoApplyKeywords: autoApplyKeywords.split(',').map(s => s.trim()).filter(Boolean)
    } : {
      companyName, description: bio, website, profilePicture
    };

    try {
      const res = await fetch(`http://13.60.192.118:3001${endpoint}`, {
        method: role === 'JOB_SEEKER' && firstName ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (res.ok) {
        window.location.href = '/jobs';
      } else {
        const retryRes = await fetch(`http://13.60.192.118:3001${endpoint}`, {
          method: role === 'JOB_SEEKER' && firstName ? 'POST' : 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(payload)
        });
        if (retryRes.ok) window.location.href = '/jobs';
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!role) return <div style={{ padding: '4rem', textAlign: 'center', color: 'white' }}>Loading...</div>;

  return (
    <main style={{ padding: '4rem', maxWidth: '800px', margin: '0 auto' }}>
      <div className="glass-panel">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.5rem', margin: 0 }} className="text-gradient">
            {role === 'JOB_SEEKER' ? 'Job Seeker Profile' : 'Employer Profile'}
          </h1>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {subscriptionTier === 'FREE' && (
              <button 
                className="btn-primary" 
                style={{ background: 'linear-gradient(135deg, #ffd700 0%, #ff8c00 100%)', border: 'none', color: '#000', fontWeight: 'bold' }}
                onClick={handleUpgrade}
              >
                🌟 Upgrade to Premium
              </button>
            )}
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

        {role === 'JOB_SEEKER' && (
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
        )}

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {role === 'JOB_SEEKER' ? (
            <>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} style={inputStyle} required />
                <input type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} style={inputStyle} required />
              </div>
              
              <textarea placeholder="Professional Bio" value={bio} onChange={(e) => setBio(e.target.value)} style={{ ...inputStyle, minHeight: '120px', resize: 'vertical' }} />
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label style={{ color: 'var(--text-secondary)' }}>Resume / CV (Paste here or use AI Generator)</label>
                <textarea 
                  placeholder="Paste your existing resume here..." 
                  value={resumeContent} 
                  onChange={(e) => setResumeContent(e.target.value)} 
                  style={{ ...inputStyle, minHeight: '200px', resize: 'vertical' }} 
                />
              </div>

              {!showAiForm ? (
                <button type="button" className="btn-primary" onClick={() => setShowAiForm(true)} style={{ background: 'rgba(255,255,255,0.1)' }}>
                  Need a Resume? Open AI Generator
                </button>
              ) : (
                <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1.5rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)' }}>
                  <h3 style={{ marginTop: 0 }}>✨ AI Resume Generator</h3>
                  {subscriptionTier === 'FREE' && freeGenerationsUsed >= 1 && (
                    <div style={{ color: '#ff8c00', marginBottom: '1rem' }}>⚠️ You have used your 1 free generation. Please upgrade to Premium to generate more!</div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <input type="text" placeholder="Key Skills (comma separated)" value={aiSkills} onChange={(e) => setAiSkills(e.target.value)} style={inputStyle} />
                    <textarea placeholder="Briefly describe your work experience..." value={aiExperience} onChange={(e) => setAiExperience(e.target.value)} style={{ ...inputStyle, minHeight: '100px' }} />
                    <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                      <button type="button" onClick={() => setShowAiForm(false)} style={{ background: 'transparent', color: 'white', border: 'none', cursor: 'pointer' }}>Cancel</button>
                      <button 
                        type="button" 
                        className="btn-primary" 
                        onClick={handleGenerateResume} 
                        disabled={generating || !firstName || !lastName || (subscriptionTier === 'FREE' && freeGenerationsUsed >= 1)} 
                        style={{ background: 'linear-gradient(135deg, #00f0ff 0%, #0080ff 100%)' }}
                      >
                        {generating ? 'Generating...' : 'Generate Resume'}
                      </button>
                    </div>
                  </div>
                </div>
              )}

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
