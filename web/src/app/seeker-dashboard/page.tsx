'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SeekerDashboard() {
  const [activeTab, setActiveTab] = useState<'APPLIED' | 'INVITATIONS' | 'MESSAGES'>('APPLIED');
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Messaging state
  const [inbox, setInbox] = useState<any[]>([]);
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');

  const [profile, setProfile] = useState<any>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchProfileAndApps = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        window.location.href = '/login';
        return;
      }
      try {
        const authRes = await fetch('http://13.60.192.118:3001/auth/me', { headers: { 'Authorization': `Bearer ${token}` } });
        if (authRes.ok) setUser(await authRes.json());
        
        const profRes = await fetch('http://13.60.192.118:3001/profiles/job-seeker', { headers: { 'Authorization': `Bearer ${token}` } });
        if (profRes.ok) setProfile(await profRes.json());

        const appRes = await fetch('http://13.60.192.118:3001/applications/my-applications', { headers: { 'Authorization': `Bearer ${token}` } });
        if (appRes.ok) setApplications(await appRes.json());
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileAndApps();
  }, []);

  useEffect(() => {
    if (activeTab === 'MESSAGES') fetchInbox();
  }, [activeTab]);

  const fetchInbox = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://13.60.192.118:3001/messages/inbox', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setInbox(await res.json());
    } catch (err) { console.error(err); }
  };

  const fetchChat = async (userId: string) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://13.60.192.118:3001/messages/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setChatMessages(await res.json());
        setSelectedChat(userId);
      }
    } catch (err) { console.error(err); }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('http://13.60.192.118:3001/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ receiverId: selectedChat, content: newMessage })
      });
      if (res.ok) {
        setNewMessage('');
        fetchChat(selectedChat);
      }
    } catch (err) { console.error(err); }
  };

  const respondToInvitation = async (appId: string, accept: boolean) => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`http://13.60.192.118:3001/applications/${appId}/seeker-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: accept ? 'ACCEPTED_OFFER' : 'DECLINED_OFFER' })
      });
      if (res.ok) {
        alert(accept ? 'Invitation Accepted!' : 'Invitation Declined');
        setApplications(apps => apps.map(app => app.id === appId ? { ...app, status: accept ? 'ACCEPTED_OFFER' : 'DECLINED_OFFER' } : app));
      }
    } catch (err) { console.error(err); }
  };

  const regularApps = applications.filter(a => a.status !== 'INVITED' && a.status !== 'DECLINED_OFFER');
  const invitations = applications.filter(a => a.status === 'INVITED' || a.status === 'ACCEPTED_OFFER');

  return (
    <main style={{ padding: '2rem 4rem', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Centered Profile Section (Directly under the header) */}
      {profile && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '3rem', textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', overflow: 'hidden', background: 'rgba(255,255,255,0.1)', marginBottom: '1rem' }}>
            {profile.profilePicture ? (
              <img src={profile.profilePicture} alt="Profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}>👤</div>
            )}
          </div>
          <h2 style={{ margin: 0, fontSize: '1.8rem' }}>{profile.firstName} {profile.lastName}</h2>
          <p style={{ margin: '4px 0 1rem 0', color: 'var(--secondary-color)', fontSize: '1.1rem' }}>{profile.profession || 'Job Seeker'}</p>
          <div style={{ display: 'flex', gap: '1rem' }}>
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
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', margin: 0 }} className="text-gradient">Job Seeker Dashboard</h1>
        <Link href="/jobs">
          <button className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--secondary-color)', boxShadow: 'none' }}>Back to Job Board</button>
        </Link>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '1rem' }}>
        <button onClick={() => setActiveTab('APPLIED')} style={{ background: 'none', border: 'none', color: activeTab === 'APPLIED' ? '#00f0ff' : 'white', fontSize: '1.2rem', cursor: 'pointer', fontWeight: activeTab === 'APPLIED' ? 'bold' : 'normal' }}>Applied Jobs</button>
        <button onClick={() => setActiveTab('INVITATIONS')} style={{ background: 'none', border: 'none', color: activeTab === 'INVITATIONS' ? '#00f0ff' : 'white', fontSize: '1.2rem', cursor: 'pointer', fontWeight: activeTab === 'INVITATIONS' ? 'bold' : 'normal' }}>Invitations & Offers</button>
        <button onClick={() => setActiveTab('MESSAGES')} style={{ background: 'none', border: 'none', color: activeTab === 'MESSAGES' ? '#00f0ff' : 'white', fontSize: '1.2rem', cursor: 'pointer', fontWeight: activeTab === 'MESSAGES' ? 'bold' : 'normal' }}>Messages</button>
      </div>

      {loading ? <p>Loading...</p> : (
        <>
          {activeTab === 'APPLIED' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {regularApps.length === 0 ? <p>No job applications yet.</p> : regularApps.map(app => (
                <div key={app.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontSize: '1.2rem', margin: 0 }}>{app.job.title}</h2>
                    <p style={{ color: 'var(--text-secondary)', margin: '4px 0' }}>{app.job.employer.companyName}</p>
                  </div>
                  <span style={{ padding: '6px 16px', borderRadius: '20px', background: 'rgba(255,255,255,0.1)' }}>{app.status}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'INVITATIONS' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {invitations.length === 0 ? <p>No invitations yet.</p> : invitations.map(app => (
                <div key={app.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: app.status === 'INVITED' ? '4px solid #00f0ff' : '4px solid #00ff00' }}>
                  <div>
                    <h2 style={{ fontSize: '1.2rem', margin: 0 }}>{app.job.title}</h2>
                    <p style={{ color: 'var(--text-secondary)', margin: '4px 0' }}>You were invited by {app.job.employer.companyName}!</p>
                  </div>
                  {app.status === 'INVITED' ? (
                    <div style={{ display: 'flex', gap: '1rem' }}>
                      <button className="btn-primary" style={{ padding: '8px 16px' }} onClick={() => respondToInvitation(app.id, true)}>Accept</button>
                      <button className="btn-primary" style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #ff4d4d', color: '#ff4d4d' }} onClick={() => respondToInvitation(app.id, false)}>Decline</button>
                    </div>
                  ) : (
                    <span style={{ color: '#00ff00', fontWeight: 'bold' }}>Accepted! 🎉</span>
                  )}
                </div>
              ))}
            </div>
          )}

          {activeTab === 'MESSAGES' && (
            <div style={{ display: 'flex', gap: '2rem', height: '600px' }}>
              <div className="glass-panel" style={{ flex: 1, overflowY: 'auto' }}>
                <h3 style={{marginTop:0}}>Inbox</h3>
                {inbox.map(thread => (
                  <div key={thread.otherUserId} onClick={() => fetchChat(thread.otherUserId)} style={{ padding: '1rem', borderBottom: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', background: selectedChat === thread.otherUserId ? 'rgba(255,255,255,0.1)' : 'transparent' }}>
                    <strong>{thread.otherUser?.employer?.companyName || 'Employer'}</strong>
                    <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                      {thread.latestMessage.content.substring(0, 40)}...
                    </p>
                  </div>
                ))}
              </div>
              
              <div className="glass-panel" style={{ flex: 2, display: 'flex', flexDirection: 'column' }}>
                {selectedChat ? (
                  <>
                    <div style={{ flex: 1, overflowY: 'auto', marginBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {chatMessages.map(msg => (
                        <div key={msg.id} style={{ alignSelf: msg.senderId === selectedChat ? 'flex-start' : 'flex-end', background: msg.senderId === selectedChat ? 'rgba(255,255,255,0.1)' : 'var(--primary-color)', padding: '8px 16px', borderRadius: '16px' }}>
                          {msg.content}
                        </div>
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input type="text" value={newMessage} onChange={(e)=>setNewMessage(e.target.value)} style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: 'white' }} placeholder="Type a message..." />
                      <button onClick={sendMessage} className="btn-primary" style={{ padding: '0 24px' }}>Send</button>
                    </div>
                  </>
                ) : (
                  <p style={{ textAlign: 'center', marginTop: '4rem', color: 'var(--text-secondary)' }}>Select a conversation to start messaging</p>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </main>
  );
}
