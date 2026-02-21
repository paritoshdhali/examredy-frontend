import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const AdContext = createContext();

export const AdProvider = ({ children }) => {
    const { user } = useAuth();
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get(`/settings`);
                setSettings(res.data);
            } catch (e) {
                console.error('Failed to fetch ad settings', e);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const showAds =
        settings.ADS_ENABLED === 'true' &&
        (settings.ADS_FOR_PREMIUM === 'true' || !user || !user.is_premium);

    useEffect(() => {
        if (showAds && settings.ADS_HEADER_SCRIPT) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(settings.ADS_HEADER_SCRIPT, 'text/html');
            const scripts = doc.querySelectorAll('script');

            scripts.forEach(s => {
                // Check if already injected
                if (s.src && document.querySelector(`script[src="${s.src}"]`)) return;

                const newScript = document.createElement('script');
                Array.from(s.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                newScript.innerHTML = s.innerHTML;
                document.head.appendChild(newScript);
            });
        }
    }, [showAds, settings.ADS_HEADER_SCRIPT]);

    return (
        <AdContext.Provider value={{ settings, showAds, loading }}>
            {children}
            {/* Body script if any */}
            {showAds && settings.ADS_BODY_SCRIPT && (
                <div
                    style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
                    dangerouslySetInnerHTML={{ __html: settings.ADS_BODY_SCRIPT }}
                />
            )}
        </AdContext.Provider>
    );
};

export const useAds = () => useContext(AdContext);
