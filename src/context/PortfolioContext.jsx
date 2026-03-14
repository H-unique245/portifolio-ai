import { createContext, useContext, useEffect, useState } from 'react';
import { getSettings, getProjects, getTags, getActiveProfileImage, getActiveResume } from '../lib/supabase';
import { DEFAULT_SETTINGS, DEFAULT_PROJECTS } from '../data/portfolio';

const PortfolioContext = createContext(null);

export function PortfolioProvider({ children }) {
  const [settings, setSettings]         = useState(DEFAULT_SETTINGS);
  const [projects, setProjects]         = useState(DEFAULT_PROJECTS);
  const [tags, setTags]                 = useState([]);
  const [profileImage, setProfileImage] = useState(null);
  const [resumeUrl, setResumeUrl]       = useState(null);
  const [loading, setLoading]           = useState(true);

  async function loadData() {
    try {
      const [remoteSettings, remoteProjects, remoteTags, activeImg, activeResume] = await Promise.all([
        getSettings(),
        getProjects(),
        getTags(),
        getActiveProfileImage(),
        getActiveResume(),
      ]);
      if (remoteSettings) setSettings(remoteSettings);
      if (remoteProjects && remoteProjects.length > 0) setProjects(remoteProjects);
      if (remoteTags) setTags(remoteTags);
      if (activeImg) setProfileImage(activeImg.url);
      if (activeResume) setResumeUrl(activeResume.url);
    } catch {
      // fallback to defaults
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  return (
    <PortfolioContext.Provider value={{
      settings, setSettings,
      projects, setProjects,
      tags, setTags,
      profileImage, setProfileImage,
      resumeUrl, setResumeUrl,
      loading, reload: loadData,
    }}>
      {children}
    </PortfolioContext.Provider>
  );
}

export const usePortfolio = () => useContext(PortfolioContext);