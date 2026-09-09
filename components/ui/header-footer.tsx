"use client;"
import { useEffect, useState } from "react";
import About from "./about";

export function Header() {
    const header = "fonts index";
    const a = 2;
    const p = 500;
    const [ count, setCount ] = useState(0);
    const [ bigCount, setBigCount ] = useState(0);
    const [ activated, setActivated ] = useState(false);

    const [ aboutHidden, setAboutHidden ] = useState(true);

    useEffect(() => {
        const intervalId = setInterval(() => {
            setCount(prev => {
                const next = prev + 1;
    
                if (prev % 2 === 0) {
                    setBigCount(big => (big + 1) % 31);
                }
    
                return next;
            });
        }, 50);
    
        return () => clearInterval(intervalId);
    }, []);

    return (
        <>
            <div className="header-row">
                <div className="header-row">
                    <button type="button" className={`text img-btn ${activated && 'button-rev'}`} onClick={() => setActivated(!activated)}>
                        {activated ? '⏸' : '▶'}
                    </button>
                    <div className="text">
                        {[...header].map((char, index) => (
                            <span 
                                className="char-span-title"
                                key={index}
                                style={{
                                    fontStyle: activated ? ((bigCount + index) % 4 == 0) ? "italic" : undefined : undefined,
                                    fontWeight: activated ? ((bigCount + index) % 5 == 0) ? "bold" : ((bigCount + index) % 3 == 0) ? "bolder" : undefined : undefined,
                                    paddingRight: 
                                        activated ? index != header.length - 1 ?
                                        `${ 4 * a / p * Math.abs(((((count + index + char.charCodeAt(0)) - p / 4) % p) + p) % p - p / 2)}px`
                                        : undefined : undefined
                                }}
                            >
                                {char}
                            </span>
                        ))}
                    </div>
                </div>
                <div className="text" style={{flexGrow: 1}}></div>
                <div className="header-row">
                    <button className="text" onClick={() => setAboutHidden(!aboutHidden)}>
                        About
                    </button>
                </div>
            </div>
            {!aboutHidden && <About setAboutHidden={setAboutHidden}/>}
        </>
    )
}

export function Footer() {
    const font_rows = 3202;
    const site_rows = 7896;
    const [fontCount, setFontCount] = useState(0);
    const [siteCount, setSiteCount] = useState(0);

    useEffect(() => {
        const duration = 2000; // ms
        const easeOutQuad = (t: number) => 1 - (1 - t) * (1 - t);

        let start: number | null = null;
        let frameId: number;

        const tick = (timestamp: number) => {
            if (start === null) start = timestamp;
            const elapsed = timestamp - start;
            const t = Math.min(elapsed / duration, 1);
            const eased = easeOutQuad(t);

            setFontCount(Math.round(font_rows * eased));
            setSiteCount(Math.round(site_rows * eased));

            if (t < 1) {
                frameId = requestAnimationFrame(tick);
            }
        };

        frameId = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frameId);
    }, [font_rows, site_rows]);

    return (
        <div className="footer-row">
            <div className="footer-row">
                <div className="text">
                    {String(fontCount).padStart(4, '0')} fonts cataloged
                </div>
                <div className="text">
                    {String(siteCount).padStart(4, '0')} sites cataloged
                </div>
            </div>
            <div className="text desktop-only" style={{flexGrow: 1}}></div>
            <div className="text">
                Archived August 2026
            </div>
        </div>
    );
}