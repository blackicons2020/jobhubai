'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function Header() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch('http://13.60.192.118:3001/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          
          const endpoint = userData.role === 'JOB_SEEKER' ? '/profiles/job-seeker' : '/profiles/employer';
          const profRes = await fetch(`http://13.60.192.118:3001${endpoint}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (profRes.ok) {
            setProfile(await profRes.json());
          }
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchUser();
  }, []);

  return (
    <>
      <header style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 1000,
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '1rem 2rem',
        background: 'rgba(18, 11, 28, 0.8)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src="/logo.jpg" alt="JobHub AI Logo" style={{ height: '40px', borderRadius: '8px' }} />
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }} className="text-gradient">JobHub AI</span>
        </div>
        <div>
          {!user ? (
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Link href="/login" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem' }}>Log In</Link>
              <Link href="/register" className="btn-primary" style={{ padding: '0.5rem 1rem', textDecoration: 'none' }}>Sign Up</Link>
            </div>
          ) : (
            <Link href="/" onClick={() => localStorage.removeItem('token')} style={{ color: '#ff4d4d', textDecoration: 'none' }}>Logout</Link>
          )}
        </div>
      </header>

      {user && profile && (
        <div style={{ 
          padding: '1rem 2rem', 
          background: 'rgba(255,255,255,0.02)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem'
        }}>
          <div style={{ width: 50, height: 50, borderRadius: '50%', overflow: 'hidden', background: 'rgba(255,255,255,0.1)' }}>
            {profile.profilePicture ? (
              <img src={profile.profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
            )}
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>
              {user.role === 'JOB_SEEKER' ? `${profile.firstName} ${profile.lastName}` : profile.companyName}
            </h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{user.email}</p>
          </div>
        </div>
      )}
    </>
  );
}
