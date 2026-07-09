import React, { useState, useEffect } from 'react';
import { Settings, Save, Volume2, Shield, Eye, HelpCircle, Camera, Mic, RefreshCw, Moon, Sun } from 'lucide-react';

interface SettingsViewProps {
  initialSettings: {
    theme: string;
    emailNotifications: boolean;
    pushNotifications: boolean;
    language: string;
    voiceName: string;
    aiSpeed: number;
    privacyProfile: string;
    speechTone?: string;
    cameraPreference?: string;
    microphonePreference?: string;
  };
  onSaveSettings: (settings: any) => Promise<void>;
}

export default function SettingsView({ initialSettings, onSaveSettings }: SettingsViewProps) {
  const [theme, setTheme] = useState(initialSettings.theme || 'dark');
  const [emailNotifications, setEmailNotifications] = useState(initialSettings.emailNotifications);
  const [pushNotifications, setPushNotifications] = useState(initialSettings.pushNotifications);
  const [language, setLanguage] = useState(initialSettings.language || 'English');
  const [voiceName, setVoiceName] = useState(initialSettings.voiceName || 'Zephyr');
  const [aiSpeed, setAiSpeed] = useState(initialSettings.aiSpeed || 1.0);
  const [privacyProfile, setPrivacyProfile] = useState(initialSettings.privacyProfile || 'public');
  const [speechTone, setSpeechTone] = useState(initialSettings.speechTone || 'professional');
  const [cameraPreference, setCameraPreference] = useState(initialSettings.cameraPreference || '');
  const [microphonePreference, setMicrophonePreference] = useState(initialSettings.microphonePreference || '');

  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [audioDevices, setAudioDevices] = useState<MediaDeviceInfo[]>([]);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Retrieve available multimedia devices
  useEffect(() => {
    async function getDevices() {
      try {
        // Enumerate hardware elements
        const devices = await navigator.mediaDevices.enumerateDevices();
        setVideoDevices(devices.filter(d => d.kind === 'videoinput'));
        setAudioDevices(devices.filter(d => d.kind === 'audioinput'));
      } catch (e) {
        console.error('Error listing camera/microphone devices:', e);
      }
    }
    getDevices();
  }, []);

  // Show status toasts
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 2500);
  };

  // Automated instant save helper
  const updateSettingAndSave = async (key: string, value: any) => {
    // 1. Update React Local States
    let updatedTheme = theme;
    let updatedEmail = emailNotifications;
    let updatedPush = pushNotifications;
    let updatedLanguage = language;
    let updatedVoice = voiceName;
    let updatedSpeed = aiSpeed;
    let updatedPrivacy = privacyProfile;
    let updatedTone = speechTone;
    let updatedCamera = cameraPreference;
    let updatedMic = microphonePreference;

    if (key === 'theme') { setTheme(value); updatedTheme = value; }
    else if (key === 'emailNotifications') { setEmailNotifications(value); updatedEmail = value; }
    else if (key === 'pushNotifications') { setPushNotifications(value); updatedPush = value; }
    else if (key === 'language') { setLanguage(value); updatedLanguage = value; }
    else if (key === 'voiceName') { setVoiceName(value); updatedVoice = value; }
    else if (key === 'aiSpeed') { setAiSpeed(value); updatedSpeed = value; }
    else if (key === 'privacyProfile') { setPrivacyProfile(value); updatedPrivacy = value; }
    else if (key === 'speechTone') { setSpeechTone(value); updatedTone = value; }
    else if (key === 'cameraPreference') { setCameraPreference(value); updatedCamera = value; }
    else if (key === 'microphonePreference') { setMicrophonePreference(value); updatedMic = value; }

    // 2. Dispatch save call
    try {
      setSaving(true);
      await onSaveSettings({
        theme: updatedTheme,
        emailNotifications: updatedEmail,
        pushNotifications: updatedPush,
        language: updatedLanguage,
        voiceName: updatedVoice,
        aiSpeed: updatedSpeed,
        privacyProfile: updatedPrivacy,
        speechTone: updatedTone,
        cameraPreference: updatedCamera,
        microphonePreference: updatedMic
      });
      triggerToast('Settings saved automatically');
    } catch (e) {
      console.error('Failed to auto-save settings:', e);
    } finally {
      setSaving(false);
    }
  };

  const handleRestoreDefaults = async () => {
    if (!confirm('Are you sure you want to restore default application settings?')) return;

    const defaults = {
      theme: 'dark',
      emailNotifications: true,
      pushNotifications: true,
      language: 'English',
      voiceName: 'Zephyr',
      aiSpeed: 1.0,
      privacyProfile: 'public',
      speechTone: 'professional',
      cameraPreference: '',
      microphonePreference: ''
    };

    setTheme(defaults.theme);
    setEmailNotifications(defaults.emailNotifications);
    setPushNotifications(defaults.pushNotifications);
    setLanguage(defaults.language);
    setVoiceName(defaults.voiceName);
    setAiSpeed(defaults.aiSpeed);
    setPrivacyProfile(defaults.privacyProfile);
    setSpeechTone(defaults.speechTone);
    setCameraPreference(defaults.cameraPreference);
    setMicrophonePreference(defaults.microphonePreference);

    try {
      setSaving(true);
      await onSaveSettings(defaults);
      triggerToast('Defaults restored successfully');
    } catch (e) {
      alert('Failed to reset settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div id="settings_view_container" className="max-w-3xl mx-auto space-y-6 text-left relative">
      {/* Dynamic Toast Indicator */}
      {toastMessage && (
        <div className="fixed bottom-6 left-6 z-50 bg-indigo-600 border border-indigo-500/30 text-white text-xs px-4 py-2.5 rounded-xl shadow-lg font-mono flex items-center gap-2 animate-bounce">
          <Save size={12} className="animate-spin" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Title header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 px-2.5 py-1 rounded-full text-xs font-medium font-sans">
            <Settings size={12} />
            <span>Platform Customization Console</span>
          </div>
          <h2 className="font-sans font-bold text-xl tracking-tight text-white">
            Account Settings
          </h2>
          <p className="font-sans text-xs text-slate-400">
            Configure AI proctor options, visual layouts, voice parameters, and proctored hardware preferences.
          </p>
        </div>

        <button
          onClick={handleRestoreDefaults}
          className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-750 text-slate-300 text-xs font-semibold px-3 py-2 rounded-lg transition-all font-sans cursor-pointer"
        >
          <RefreshCw size={12} />
          <span>Restore Defaults</span>
        </button>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
        
        {/* Theme Settings */}
        <div className="space-y-4">
          <div className="border-b border-slate-850 pb-2.5 flex items-center gap-2 text-slate-200">
            <Sun size={16} className="text-indigo-400" />
            <h3 className="font-sans font-bold text-xs">Visual Environment Theme</h3>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => updateSettingAndSave('theme', 'dark')}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all text-center cursor-pointer ${
                theme === 'dark'
                  ? 'bg-indigo-950/20 border-indigo-500/60 text-white'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-750'
              }`}
            >
              <Moon size={18} className={theme === 'dark' ? 'text-indigo-400' : 'text-slate-500'} />
              <div className="font-sans text-xs">
                <p className="font-bold">Dark Dimension</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Atmospheric indigo slate canvas</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => updateSettingAndSave('theme', 'light')}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all text-center cursor-pointer ${
                theme === 'light'
                  ? 'bg-indigo-950/20 border-indigo-500/60 text-white'
                  : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-750'
              }`}
            >
              <Sun size={18} className={theme === 'light' ? 'text-indigo-400' : 'text-slate-500'} />
              <div className="font-sans text-xs">
                <p className="font-bold">Light Slate</p>
                <p className="text-[10px] text-slate-500 mt-0.5">High-contrast readability canvas</p>
              </div>
            </button>
          </div>
        </div>

        {/* 1. Voice settings */}
        <div className="space-y-4">
          <div className="border-b border-slate-850 pb-2.5 flex items-center gap-2 text-slate-200">
            <Volume2 size={16} className="text-indigo-400" />
            <h3 className="font-sans font-bold text-xs">AI Speech Synthesis Preferences</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="font-sans font-semibold text-xs text-slate-300">Default Reading Voice</label>
              <select
                value={voiceName}
                onChange={(e) => updateSettingAndSave('voiceName', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 font-sans focus:border-indigo-500"
              >
                <option value="Zephyr">Zephyr (Warm & Professional)</option>
                <option value="Echo">Echo (Technical Mono)</option>
                <option value="Aura">Aura (Expressive Hybrid)</option>
                <option value="Nova">Nova (Direct & Assertive)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-sans font-semibold text-xs text-slate-300">Speech Rate / Speed</label>
              <select
                value={aiSpeed}
                onChange={(e) => updateSettingAndSave('aiSpeed', Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 font-sans focus:border-indigo-500"
              >
                <option value={0.85}>0.85x (Deliberate Practice)</option>
                <option value={1.0}>1.0x (Standard Speaking)</option>
                <option value={1.2}>1.2x (Fast-paced Panel)</option>
                <option value={1.5}>1.5x (Blitz Mode)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-sans font-semibold text-xs text-slate-300">Speech Tone Style</label>
              <select
                value={speechTone}
                onChange={(e) => updateSettingAndSave('speechTone', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 font-sans focus:border-indigo-500"
              >
                <option value="professional">Professional (Corporate Standard)</option>
                <option value="friendly">Friendly & Supportive</option>
                <option value="assertive">Assertive & Direct</option>
                <option value="encouraging">Encouraging & Enthusiastic</option>
              </select>
            </div>
          </div>
        </div>

        {/* Proctoring Hardware Preferences */}
        <div className="space-y-4">
          <div className="border-b border-slate-850 pb-2.5 flex items-center gap-2 text-slate-200">
            <Camera size={16} className="text-indigo-400" />
            <h3 className="font-sans font-bold text-xs">Proctor Hardware Connections</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-sans font-semibold text-xs text-slate-300 flex items-center gap-1.5">
                <Camera size={12} className="text-slate-450" />
                <span>Primary Camera Preference</span>
              </label>
              <select
                value={cameraPreference}
                onChange={(e) => updateSettingAndSave('cameraPreference', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 font-sans focus:border-indigo-500"
              >
                <option value="">System Default Camera</option>
                {videoDevices.map((d, index) => (
                  <option key={d.deviceId || index} value={d.deviceId}>
                    {d.label || `Camera Device #${index + 1}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-sans font-semibold text-xs text-slate-300 flex items-center gap-1.5">
                <Mic size={12} className="text-slate-450" />
                <span>Primary Microphone Preference</span>
              </label>
              <select
                value={microphonePreference}
                onChange={(e) => updateSettingAndSave('microphonePreference', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 font-sans focus:border-indigo-500"
              >
                <option value="">System Default Microphone</option>
                {audioDevices.map((d, index) => (
                  <option key={d.deviceId || index} value={d.deviceId}>
                    {d.label || `Microphone Device #${index + 1}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* 2. Notifications & Privacy */}
        <div className="space-y-4">
          <div className="border-b border-slate-850 pb-2.5 flex items-center gap-2 text-slate-200">
            <Eye size={16} className="text-indigo-400" />
            <h3 className="font-sans font-bold text-xs">Privacy & Security</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="font-sans font-semibold text-xs text-slate-300">Leaderboard Privacy Profile</label>
              <select
                value={privacyProfile}
                onChange={(e) => updateSettingAndSave('privacyProfile', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 font-sans focus:border-indigo-500"
              >
                <option value="public">Public (Show name and rank on Board)</option>
                <option value="anonymous">Anonymous (Hide profile details)</option>
                <option value="private">Private (Exempt from board standings)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="font-sans font-semibold text-xs text-slate-300">System Language</label>
              <select
                value={language}
                onChange={(e) => updateSettingAndSave('language', e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 font-sans focus:border-indigo-500"
              >
                <option value="English">English (US)</option>
                <option value="Hindi">Hindi</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
              </select>
            </div>
          </div>
        </div>

        {/* 3. Alerts Checkboxes */}
        <div className="space-y-4">
          <div className="border-b border-slate-850 pb-2.5 flex items-center gap-2 text-slate-200">
            <Shield size={16} className="text-indigo-400" />
            <h3 className="font-sans font-bold text-xs">Notification Dispatcher</h3>
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => updateSettingAndSave('emailNotifications', e.target.checked)}
                className="w-4 h-4 bg-slate-950 border border-slate-800 focus:ring-1 focus:ring-indigo-500 text-indigo-600 rounded cursor-pointer"
              />
              <div className="font-sans text-xs">
                <p className="font-semibold text-slate-300">Email Dispatch Alerts</p>
                <p className="text-slate-500">Dispatch complete assessment scorecard PDFs directly to your registered email</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={pushNotifications}
                onChange={(e) => updateSettingAndSave('pushNotifications', e.target.checked)}
                className="w-4 h-4 bg-slate-950 border border-slate-800 focus:ring-1 focus:ring-indigo-500 text-indigo-600 rounded cursor-pointer"
              />
              <div className="font-sans text-xs">
                <p className="font-semibold text-slate-300">Push & Audio cues</p>
                <p className="text-slate-500">Trigger sound alerts and local browser push updates on completed assessments</p>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
