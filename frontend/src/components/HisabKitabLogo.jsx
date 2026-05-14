import React from 'react';

/**
 * HisabKitabLogo
 * Brand mark for the HisabKitab personal ledger app.
 * Uses the MadeSaonara display font for "Hisab Kitab" and Inter for the tagline.
 *
 * Props:
 *  - size:    'sm' | 'md' | 'lg'  (default 'md')
 *  - showTag: boolean              (show tagline, default true)
 *  - theme:   'dark' | 'light'    (default 'dark')
 */
const HisabKitabLogo = ({ size = 'md', showTag = true, theme = 'dark' }) => {
    const sizeMap = {
        sm: { icon: 32, title: 18, tag: 10 },
        md: { icon: 44, title: 26, tag: 12 },
        lg: { icon: 60, title: 36, tag: 14 },
    };

    const s = sizeMap[size] || sizeMap.md;
    const textColor = theme === 'dark' ? '#F0ECF8' : '#1C1433';
    const subColor = theme === 'dark' ? '#A89BC2' : '#8B7AAC';

    return (
        <div className="flex flex-col items-center gap-1 select-none">
            {/* Icon mark */}
            <div
                className="flex items-center justify-center rounded-2xl"
                style={{
                    width: s.icon,
                    height: s.icon,
                    background: 'linear-gradient(135deg, #60A5FA 0%, #3B82F6 50%, #1D4ED8 100%)',
                    boxShadow: '0 4px 20px rgba(59, 130, 246, 0.35)',
                    flexShrink: 0,
                }}
            >
                {/* Ledger / Book SVG icon */}
                <svg
                    width={s.icon * 0.55}
                    height={s.icon * 0.55}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="white"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    {/* Book spine */}
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                    {/* Lines representing entries */}
                    <line x1="9" y1="8" x2="15" y2="8" />
                    <line x1="9" y1="11" x2="15" y2="11" />
                    <line x1="9" y1="14" x2="12" y2="14" />
                </svg>
            </div>

            {/* Brand name */}
            <div className="flex flex-col items-center leading-tight">
                <span
                    style={{
                        fontFamily: "'MadeSaonara', sans-serif",
                        fontSize: s.title,
                        color: textColor,
                        letterSpacing: '0.03em',
                        lineHeight: 1.1,
                        fontWeight: 700,
                    }}
                >
                    Hisab Kitab
                </span>

                {showTag && (
                    <span
                        style={{
                            fontFamily: "'Inter', sans-serif",
                            fontSize: s.tag,
                            color: subColor,
                            letterSpacing: '0.08em',
                            textTransform: 'uppercase',
                            marginTop: 2,
                        }}
                    >
                        Personal Ledger
                    </span>
                )}
            </div>
        </div>
    );
};

export default HisabKitabLogo;
