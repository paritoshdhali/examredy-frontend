import React, { useEffect, useRef } from 'react';
import { useAds } from '../context/AdContext';

const AdSlot = ({ type, className = "" }) => {
    const { settings, dynamicAds, showAds, loading } = useAds();
    const adRef = useRef(null);

    useEffect(() => {
        if (showAds && adRef.current) {
            // If the ad code contains script tags that need to be re-executed
            const scripts = adRef.current.querySelectorAll('script');
            scripts.forEach(oldScript => {
                const newScript = document.createElement('script');
                Array.from(oldScript.attributes).forEach(attr => newScript.setAttribute(attr.name, attr.value));
                newScript.innerHTML = oldScript.innerHTML;
                oldScript.parentNode.replaceChild(newScript, oldScript);
            });

            // Google AdSense standard push
            try {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            } catch (e) {
                // Ignore "adsbygoogle push already called" errors
            }
        }
    }, [showAds, type, settings, dynamicAds]);

    if (loading || !showAds) return null;

    let adCode = '';

    // Map legacy 'type' to new 'ad_type'
    const typeMapping = {
        'top': 'banner_top',
        'mid': 'banner_middle',
        'bottom': 'banner_bottom'
    };

    const dynamicType = typeMapping[type];
    if (dynamicType && dynamicAds[dynamicType]) {
        adCode = dynamicAds[dynamicType];
    } else {
        // Fallback to legacy settings
        if (type === 'top') adCode = settings.ADS_TOP_BANNER;
        if (type === 'mid') adCode = settings.ADS_MID_CONTENT;
        if (type === 'bottom') adCode = settings.ADS_BOTTOM_BANNER;
        if (type === 'left') adCode = settings.ADS_LEFT_SIDEBAR;
        if (type === 'right') adCode = settings.ADS_RIGHT_SIDEBAR;
    }

    if (!adCode) return null;

    return (
        <div
            ref={adRef}
            className={`ad-slot-wrapper flex justify-center items-center my-8 overflow-hidden ${className}`}
            dangerouslySetInnerHTML={{ __html: adCode }}
        />
    );
};

export default AdSlot;
