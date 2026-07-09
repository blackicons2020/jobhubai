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
      {/* Left: Logo and App Name */}
      <Link href="/" style={{ textDecoration: 'none' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src="/logo.jpg" alt="JobHub AI Logo" style={{ height: '40px', borderRadius: '8px' }} />
          <span style={{ fontSize: '1.5rem', fontWeight: 'bold' }} className="text-gradient">JobHub AI</span>
        </div>
      </Link>

      {/* Center: Empty Space for Layout */}
      <div style={{ flex: 1 }}></div>

      {/* Right: Auth Buttons (Only when NOT logged in) */}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        {!user ? (
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/login" style={{ color: 'white', textDecoration: 'none', padding: '0.5rem 1rem' }}>Log In</Link>
            <Link href="/register" className="btn-primary" style={{ padding: '0.5rem 1rem', textDecoration: 'none' }}>Sign Up</Link>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '1rem' }}>
            {/* When logged in, we provide a quick link back to dashboard depending on role */}
            <Link href="/jobs" style={{ color: 'var(--secondary-color)', textDecoration: 'none', padding: '0.5rem 1rem' }}>Dashboard</Link>
            <button 
              style={{ color: '#ff4d4d', textDecoration: 'none', background: 'transparent', border: 'none', cursor: 'pointer', padding: '0.5rem 1rem', fontSize: '1rem' }}
              onClick={() => {
                localStorage.removeItem('token');
                window.location.href = '/login';
              }}
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
