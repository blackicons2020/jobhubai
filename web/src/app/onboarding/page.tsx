'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function OnboardingPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Steps
  const [step, setStep] = useState(1);
  
  // Job Seeker Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [otherNames, setOtherNames] = useState('');
  const [gender, setGender] = useState('');
  const [profession, setProfession] = useState('');
  const [isSkilledProfessional, setIsSkilledProfessional] = useState(false);
  const [skilledProfession, setSkilledProfession] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [residenceCountry, setResidenceCountry] = useState('');
  const [residenceState, setResidenceState] = useState('');
  const [residenceCity, setResidenceCity] = useState('');
  const [citizenshipCountry, setCitizenshipCountry] = useState('');
  const [citizenshipState, setCitizenshipState] = useState('');
  
  // Lists for arrays
  const [education, setEducation] = useState<any[]>([]);
  const [experience, setExperience] = useState<any[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  
  // Employer Form State
  const [companyName, setCompanyName] = useState('');
  const [description, setDescription] = useState('');
  const [locationCountry, setLocationCountry] = useState('');
  const [locationState, setLocationState] = useState('');
  const [locationCity, setLocationCity] = useState('');
  
  // Shared
  const [profilePicUrl, setProfilePicUrl] = useState('');
  const [profilePicFile, setProfilePicFile] = useState<File | null>(null);
  
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }
      try {
        const res = await fetch('http://13.60.192.118:3001/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
          // Try to fetch existing profile to prepopulate (for Edit mode)
          const endpoint = userData.role === 'JOB_SEEKER' ? '/profiles/job-seeker' : '/profiles/employer';
          const profRes = await fetch(`http://13.60.192.118:3001${endpoint}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (profRes.ok) {
            const prof = await profRes.json();
            if (userData.role === 'JOB_SEEKER') {
              setFirstName(prof.firstName || '');
              setLastName(prof.lastName || '');
              setOtherNames(prof.otherNames || '');
              setGender(prof.gender || '');
              setProfession(prof.profession || '');
              setIsSkilledProfessional(prof.isSkilledProfessional || false);
              setSkilledProfession(prof.skilledProfession || '');
              setDateOfBirth(prof.dateOfBirth ? prof.dateOfBirth.split('T')[0] : '');
              setResidenceCountry(prof.residenceCountry || '');
              setResidenceState(prof.residenceState || '');
              setResidenceCity(prof.residenceCity || '');
              setCitizenshipCountry(prof.citizenshipCountry || '');
              setCitizenshipState(prof.citizenshipState || '');
              setEducation(prof.education || []);
              setExperience(prof.experience || []);
              setCertificates(prof.certificates || []);
              setAchievements(prof.achievements || []);
              setProfilePicUrl(prof.profilePicture || '');
            } else {
              setCompanyName(prof.companyName || '');
              setDescription(prof.description || '');
              setLocationCountry(prof.locationCountry || '');
              setLocationState(prof.locationState || '');
              setLocationCity(prof.locationCity || '');
              setProfilePicUrl(prof.profilePicture || '');
            }
          }
        } else {
          router.push('/login');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [router]);

  const handleFileUpload = async () => {
    if (!profilePicFile) return profilePicUrl;
    const formData = new FormData();
    formData.append('file', profilePicFile);
    try {
      const res = await fetch('http://13.60.192.118:3001/uploads', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: formData
      });
      if (res.ok) {
        const data = await res.json();
        return data.url;
      }
    } catch (e) {
      console.error('File upload failed', e);
    }
    return profilePicUrl;
  };

  const handleSave = async () => {
    setSaving(true);
    const uploadedUrl = await handleFileUpload();
    const token = localStorage.getItem('token');
    
    let payload = {};
    let endpoint = '';
    
    if (user?.role === 'JOB_SEEKER') {
      endpoint = '/profiles/job-seeker';
      payload = {
        firstName, lastName, otherNames, gender, profession, isSkilledProfessional, skilledProfession,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString() : null,
        residenceCountry, residenceState, residenceCity, citizenshipCountry, citizenshipState,
        education, experience, certificates, achievements, profilePicture: uploadedUrl, skills: []
      };
    } else {
      endpoint = '/profiles/employer';
      payload = {
        companyName, description, locationCountry, locationState, locationCity, profilePicture: uploadedUrl
      };
    }
    
    try {
      const res = await fetch(`http://13.60.192.118:3001${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        if (user.role === 'EMPLOYER') {
          window.location.href = '/applications';
        } else {
          window.location.href = '/seeker-dashboard';
        }
      } else {
        alert('Failed to save profile.');
      }
    } catch (err) {
      console.error(err);
      alert('Network error.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ display: 'flex', justifyContent: 'center', marginTop: '5rem' }}>Loading...</div>;

  const renderSeekerSteps = () => {
    switch (step) {
      case 1:
        return (
          <div className="fly-in">
            <h2>Personal Information</h2>
            <input placeholder="First Name" value={firstName} onChange={e => setFirstName(e.target.value)} className="input-field" />
            <input placeholder="Last Name" value={lastName} onChange={e => setLastName(e.target.value)} className="input-field" />
            <input placeholder="Other Names (Optional)" value={otherNames} onChange={e => setOtherNames(e.target.value)} className="input-field" />
            <select value={gender} onChange={e => setGender(e.target.value)} className="input-field">
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
            <input type="date" value={dateOfBirth} onChange={e => setDateOfBirth(e.target.value)} className="input-field" title="Date of Birth" />
          </div>
        );
      case 2:
        return (
          <div className="fly-in">
            <h2>Professional Identity</h2>
            <input placeholder="Primary Profession (e.g. Software Engineer)" value={profession} onChange={e => setProfession(e.target.value)} className="input-field" />
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1rem 0', color: 'white' }}>
              <input type="checkbox" checked={isSkilledProfessional} onChange={e => setIsSkilledProfessional(e.target.checked)} />
              I am a skilled/trade professional (e.g. Baker, Fashion Designer, Plumber)
            </label>
            {isSkilledProfessional && (
              <input placeholder="Specify Skill/Trade" value={skilledProfession} onChange={e => setSkilledProfession(e.target.value)} className="input-field" />
            )}
          </div>
        );
      case 3:
        return (
          <div className="fly-in">
            <h2>Location & Citizenship</h2>
            <h3>Residence</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input placeholder="Country" value={residenceCountry} onChange={e => setResidenceCountry(e.target.value)} className="input-field" />
              <input placeholder="State" value={residenceState} onChange={e => setResidenceState(e.target.value)} className="input-field" />
              <input placeholder="City" value={residenceCity} onChange={e => setResidenceCity(e.target.value)} className="input-field" />
            </div>
            <h3 style={{ marginTop: '1rem' }}>Citizenship</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <input placeholder="Country" value={citizenshipCountry} onChange={e => setCitizenshipCountry(e.target.value)} className="input-field" />
              <input placeholder="State (Optional)" value={citizenshipState} onChange={e => setCitizenshipState(e.target.value)} className="input-field" />
            </div>
          </div>
        );
      case 4:
        return (
          <div className="fly-in">
            <h2>Education (Optional)</h2>
            <p style={{ color: 'var(--text-secondary)' }}>You can add these now, or click Next to skip this step.</p>
            <button className="btn-primary" onClick={() => setEducation([...education, { school: '', course: '', dates: '', yearGraduated: '' }])}>Add Education</button>
            {education.map((ed, idx) => (
              <div key={idx} style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', marginTop: '0.5rem', borderRadius: '8px' }}>
                <input placeholder="Institution / School" value={ed.school} onChange={e => { const n = [...education]; n[idx].school = e.target.value; setEducation(n); }} className="input-field" />
                <input placeholder="Course of Study" value={ed.course} onChange={e => { const n = [...education]; n[idx].course = e.target.value; setEducation(n); }} className="input-field" />
                <input placeholder="Dates Attended (e.g. 2018 - 2022)" value={ed.dates} onChange={e => { const n = [...education]; n[idx].dates = e.target.value; setEducation(n); }} className="input-field" />
                <input placeholder="Year Graduated" type="number" value={ed.yearGraduated} onChange={e => { const n = [...education]; n[idx].yearGraduated = e.target.value; setEducation(n); }} className="input-field" />
              </div>
            ))}
          </div>
        );
      case 5:
        return (
          <div className="fly-in">
            <h2>Experience (Optional)</h2>
            <p style={{ color: 'var(--text-secondary)' }}>You can add these now, or click Next to skip this step.</p>
            <button className="btn-primary" onClick={() => setExperience([...experience, { company: '', role: '', dates: '' }])}>Add Experience</button>
            {experience.map((ex, idx) => (
              <div key={idx} style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', marginTop: '0.5rem', borderRadius: '8px' }}>
                <input placeholder="Company Worked" value={ex.company} onChange={e => { const n = [...experience]; n[idx].company = e.target.value; setExperience(n); }} className="input-field" />
                <input placeholder="Role" value={ex.role} onChange={e => { const n = [...experience]; n[idx].role = e.target.value; setExperience(n); }} className="input-field" />
                <input placeholder="Dates (e.g. Jan 2020 - Present)" value={ex.dates} onChange={e => { const n = [...experience]; n[idx].dates = e.target.value; setExperience(n); }} className="input-field" />
              </div>
            ))}
          </div>
        );
      case 6:
        return (
          <div className="fly-in">
            <h2>Certifications & Degrees (Optional)</h2>
            <p style={{ color: 'var(--text-secondary)' }}>You can add these now, or click Next to skip this step.</p>
            <button className="btn-primary" onClick={() => setCertificates([...certificates, { name: '', date: '' }])}>Add Certification/Degree</button>
            {certificates.map((cert, idx) => (
              <div key={idx} style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', marginTop: '0.5rem', borderRadius: '8px' }}>
                <input placeholder="Certification / Degree Name" value={cert.name} onChange={e => { const n = [...certificates]; n[idx].name = e.target.value; setCertificates(n); }} className="input-field" />
                <input placeholder="Date Obtained (e.g. 2023)" value={cert.date} onChange={e => { const n = [...certificates]; n[idx].date = e.target.value; setCertificates(n); }} className="input-field" />
              </div>
            ))}
          </div>
        );
      case 7:
        return (
          <div className="fly-in">
            <h2>Achievements & Awards (Optional)</h2>
            <p style={{ color: 'var(--text-secondary)' }}>You can add these now, or click Next to skip this step.</p>
            <button className="btn-primary" onClick={() => setAchievements([...achievements, { title: '', date: '' }])}>Add Achievement/Award</button>
            {achievements.map((ach, idx) => (
              <div key={idx} style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', marginTop: '0.5rem', borderRadius: '8px' }}>
                <input placeholder="Achievement / Award Title" value={ach.title} onChange={e => { const n = [...achievements]; n[idx].title = e.target.value; setAchievements(n); }} className="input-field" />
                <input placeholder="Date (e.g. 2022)" value={ach.date} onChange={e => { const n = [...achievements]; n[idx].date = e.target.value; setAchievements(n); }} className="input-field" />
              </div>
            ))}
          </div>
        );
      case 8:
        return (
          <div className="fly-in">
            <h2>Profile Picture</h2>
            {profilePicUrl && <img src={profilePicUrl} alt="Preview" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', marginBottom: '1rem' }} />}
            <input type="file" accept="image/*" onChange={e => {
              if (e.target.files && e.target.files[0]) {
                setProfilePicFile(e.target.files[0]);
                setProfilePicUrl(URL.createObjectURL(e.target.files[0]));
              }
            }} className="input-field" />
          </div>
        );
      default: return null;
    }
  };

  const renderEmployerSteps = () => {
    switch (step) {
      case 1:
        return (
          <div className="fly-in">
            <h2>Company Information</h2>
            <input placeholder="Company Name" value={companyName} onChange={e => setCompanyName(e.target.value)} className="input-field" />
            <textarea placeholder="Company Description" value={description} onChange={e => setDescription(e.target.value)} className="input-field" rows={4} />
          </div>
        );
      case 2:
        return (
          <div className="fly-in">
            <h2>Company Location</h2>
            <input placeholder="Country" value={locationCountry} onChange={e => setLocationCountry(e.target.value)} className="input-field" />
            <input placeholder="State" value={locationState} onChange={e => setLocationState(e.target.value)} className="input-field" />
            <input placeholder="City / Town" value={locationCity} onChange={e => setLocationCity(e.target.value)} className="input-field" />
          </div>
        );
      case 3:
        return (
          <div className="fly-in">
            <h2>Company Logo</h2>
            {profilePicUrl && <img src={profilePicUrl} alt="Preview" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover', marginBottom: '1rem' }} />}
            <input type="file" accept="image/*" onChange={e => {
              if (e.target.files && e.target.files[0]) {
                setProfilePicFile(e.target.files[0]);
                setProfilePicUrl(URL.createObjectURL(e.target.files[0]));
              }
            }} className="input-field" />
          </div>
        );
      default: return null;
    }
  };

  const totalSteps = user?.role === 'JOB_SEEKER' ? 8 : 3;

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}>
      <style>{`
        .fly-in { animation: flyIn 0.5s ease-out forwards; }
        @keyframes flyIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .input-field { width: 100%; padding: 1rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); background-color: rgba(255,255,255,0.05); color: white; font-size: 1rem; outline: none; margin-bottom: 1rem; }
      `}</style>
      <div className="glass-panel" style={{ width: '100%', maxWidth: '600px', padding: '3rem 2rem', overflow: 'hidden' }}>
        <h1 className="text-gradient" style={{ textAlign: 'center', margin: 0 }}>Complete Your Profile</h1>
        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '2rem' }}>Step {step} of {totalSteps}</p>
        <div style={{ margin: '2rem 0' }}>
          {user?.role === 'JOB_SEEKER' ? renderSeekerSteps() : renderEmployerSteps()}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
          {step > 1 ? (
            <button className="btn-primary" style={{ background: 'transparent', border: '1px solid #00f0ff' }} onClick={() => setStep(step - 1)}>Back</button>
          ) : <div />}
          
          {step < totalSteps ? (
            <button className="btn-primary" onClick={() => setStep(step + 1)}>Next</button>
          ) : (
            <button className="btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Profile'}</button>
          )}
        </div>
      </div>
    </main>
  );
}
