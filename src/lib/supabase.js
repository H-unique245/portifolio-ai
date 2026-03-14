import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/* ─────────────────────────────────────────────────────────
   VISITOR TRACKING
───────────────────────────────────────────────────────── */
export async function recordVisit() {
  try {
    const alreadyTracked = sessionStorage.getItem('hv_tracked');
    if (alreadyTracked) return;

    let geoData = {};
    try {
      const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(3000) });
      if (res.ok) geoData = await res.json();
    } catch { /* geo is optional */ }

    const { error } = await supabase.from('visitors').insert({
      user_agent: navigator.userAgent,
      referrer: document.referrer || null,
      country: geoData.country_name || null,
      city: geoData.city || null,
      ip: geoData.ip || null,
    });

    if (!error) sessionStorage.setItem('hv_tracked', '1');
  } catch (err) {
    console.warn('Visit tracking failed silently:', err.message);
  }
}

export async function getVisitorStats() {
  const { data, error } = await supabase
    .from('visitors')
    .select('*')
    .order('visited_at', { ascending: false });
  if (error) throw error;
  return data;
}

/* ─────────────────────────────────────────────────────────
   CONTACT MESSAGES
───────────────────────────────────────────────────────── */
export async function saveContact({ name, email, message }) {
  const { error } = await supabase.from('contacts').insert({ name, email, message });
  if (error) throw error;
}

export async function getContacts() {
  const { data, error } = await supabase
    .from('contacts')
    .select('*')
    .order('sent_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function markContactRead(id) {
  const { error } = await supabase.from('contacts').update({ read: true }).eq('id', id);
  if (error) throw error;
}

/* ─────────────────────────────────────────────────────────
   PORTFOLIO SETTINGS
───────────────────────────────────────────────────────── */
export async function getSettings() {
  const { data, error } = await supabase
    .from('portfolio_settings')
    .select('*')
    .single();
  if (error) return null;
  return data;
}

export async function updateSettings(settings) {
  const { error } = await supabase
    .from('portfolio_settings')
    .upsert({ id: 1, ...settings });
  if (error) throw error;
}

/* ─────────────────────────────────────────────────────────
   PROJECTS
───────────────────────────────────────────────────────── */
export async function getProjects() {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('sort_order', { ascending: true });
  if (error) return null;
  return data;
}

export async function upsertProject(project) {
  if (project.id) {
    // UPDATE — strip id from payload
    const { id, created_at, ...fields } = project;
    const { error } = await supabase.from('projects').update(fields).eq('id', id);
    if (error) throw error;
  } else {
    // INSERT — never send id (auto-generated)
    const { id, created_at, ...fields } = project;
    const { error } = await supabase.from('projects').insert(fields);
    if (error) throw error;
  }
}

export async function deleteProject(id) {
  const { error } = await supabase.from('projects').delete().eq('id', id);
  if (error) throw error;
}

/* ─────────────────────────────────────────────────────────
   PROJECT TAGS
───────────────────────────────────────────────────────── */
export async function getTags() {
  const { data, error } = await supabase
    .from('project_tags')
    .select('*')
    .order('name', { ascending: true });
  if (error) throw error;
  return data;
}

export async function upsertTag(tag) {
  if (tag.id) {
    const { id, created_at, ...fields } = tag;
    const { error } = await supabase.from('project_tags').update(fields).eq('id', id);
    if (error) throw error;
  } else {
    const { id, created_at, ...fields } = tag;
    const { error } = await supabase.from('project_tags').insert(fields);
    if (error) throw error;
  }
}

export async function deleteTag(id) {
  const { error } = await supabase.from('project_tags').delete().eq('id', id);
  if (error) throw error;
}

/* ─────────────────────────────────────────────────────────
   IMAGE UPLOAD (Supabase Storage)
───────────────────────────────────────────────────────── */

const BUCKET = 'portfolio-images';

/**
 * Upload a file to Supabase Storage and return its public URL.
 * @param {File} file
 * @param {string} projectName — used as folder name
 * @returns {string} public URL
 */
export async function uploadProjectImage(file, projectName) {
  const ext      = file.name.split('.').pop();
  const slug     = projectName.toLowerCase().replace(/\s+/g, '-');
  const filename = `${slug}/${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(filename, file, { cacheControl: '3600', upsert: false });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}

/**
 * Delete an image from Supabase Storage by its public URL.
 */
export async function deleteProjectImage(publicUrl) {
  // Extract the path after the bucket name
  const path = publicUrl.split(`/${BUCKET}/`)[1];
  if (!path) return;
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw error;
}

/* ── PROFILE IMAGES ── */
export async function getProfileImages() {
  const { data, error } = await supabase
    .from('profile_images')
    .select('*')
    .order('uploaded_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getActiveProfileImage() {
  const { data, error } = await supabase
    .from('profile_images')
    .select('*')
    .eq('is_active', true)
    .single();
  if (error) return null;
  return data;
}

export async function uploadProfileImage(file) {
  const ext      = file.name.split('.').pop();
  const filename = `profile_${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('profile-images')
    .upload(filename, file, { cacheControl: '3600', upsert: false });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('profile-images').getPublicUrl(filename);
  return data.publicUrl;
}

export async function setActiveProfileImage(id) {
  // Deactivate all first
  await supabase.from('profile_images').update({ is_active: false }).neq('id', 0);
  // Set the selected one active
  const { error } = await supabase.from('profile_images').update({ is_active: true }).eq('id', id);
  if (error) throw error;
}

export async function deleteProfileImage(id, publicUrl) {
  // Delete from storage
  const path = publicUrl.split('/profile-images/')[1];
  if (path) await supabase.storage.from('profile-images').remove([path]);
  // Delete from DB
  const { error } = await supabase.from('profile_images').delete().eq('id', id);
  if (error) throw error;
}

export async function saveProfileImageToDB(url) {
  const { error } = await supabase.from('profile_images').insert({ url, is_active: false });
  if (error) throw error;
}

/* ── RESUME ── */
export async function getActiveResume() {
  const { data, error } = await supabase
    .from('resume')
    .select('*')
    .eq('is_active', true)
    .single();
  if (error) return null;
  return data;
}

export async function getAllResumes() {
  const { data, error } = await supabase
    .from('resume')
    .select('*')
    .order('uploaded_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function uploadResume(file) {
  const ext      = file.name.split('.').pop();
  const filename = `resumes/resume_${Date.now()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('profile-images')
    .upload(filename, file, { cacheControl: '3600', upsert: false });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('profile-images').getPublicUrl(filename);
  return { url: data.publicUrl, filename: file.name };
}

export async function saveResumeToDB({ url, filename }) {
  const { error } = await supabase
    .from('resume')
    .insert({ url, filename, is_active: false });
  if (error) throw error;
}

export async function setActiveResume(id) {
  await supabase.from('resume').update({ is_active: false }).neq('id', 0);
  const { error } = await supabase
    .from('resume')
    .update({ is_active: true })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteResume(id, url) {
  const path = url.split('/profile-images/')[1];
  if (path) await supabase.storage.from('profile-images').remove([path]);
  const { error } = await supabase.from('resume').delete().eq('id', id);
  if (error) throw error;
}