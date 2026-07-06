"use client";
import { useState } from 'react';

export default function CreateJobPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [salary, setSalary] = useState('');
  const [isRemote, setIsRemote] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Connect to NestJS API
    console.log("Posting job...");
  };

  return (
    <main style={{ padding: '4rem', maxWidth: '800px', margin: '0 auto' }}>
      <div className="glass-panel">
        <h1 style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'center' }} className="text-gradient">
          Post a New Job
        </h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <input 
            type="text" 
            placeholder="Job Title (e.g. Senior Backend Engineer)" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={inputStyle}
            required
          />
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input 
              type="text" 
              placeholder="Location (e.g. San Francisco, CA)" 
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              style={inputStyle}
            />
            <input 
              type="text" 
              placeholder="Salary Range (e.g. $120k - $150k)" 
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0' }}>
            <input 
              type="checkbox" 
              id="isRemote"
              checked={isRemote}
              onChange={(e) => setIsRemote(e.target.checked)}
              style={{ width: '20px', height: '20px', accentColor: 'var(--primary-color)' }}
            />
            <label htmlFor="isRemote" style={{ fontSize: '1.1rem' }}>This is a remote position</label>
          </div>

          <textarea 
            placeholder="Job Description and Requirements..." 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ ...inputStyle, minHeight: '200px', resize: 'vertical' }}
            required
          />

          <button type="submit" className="btn-primary" style={{ marginTop: '1rem', padding: '16px' }}>
            Publish Job Listing
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
