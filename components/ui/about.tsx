import FontClassificationChart from "@/components/ui/barchart"

export default function About({
    hidden, 
    setAboutHidden
}: {
    hidden: boolean,
    setAboutHidden: (hidden: boolean) => void
}) {
    return (
        <div className={`about ${hidden ? '' : 'about-unhidden'}`}>
            <div className="about-bg" onClick={() => setAboutHidden(true)}/>
            <button className="img-btn" onClick={() => setAboutHidden(true)}>
                ×
            </button>
            <div className="about-box">
                <div className="about-row">
                    <div className="search-col">
                        <div style={{ width: '100%', textAlign: 'left', fontSize: 14, marginBottom: '1em' }}>
                            About
                        </div>
                        <div>
                            <b>fonts index</b> represents an effort to catalogue and analyze the fonts used by the world's most visited websites. 
                            It was born out of my curiosity regarding the general form of text on the internet. What fonts are 
                            used the most, and by which sites? Which are used the least? Is the visual aesthetic of the web 
                            guided by some kind of intelligent design, or are fonts merely pragmatically chosen to suit the needs of a 
                            website? How much of web design is intentional and how much is arbitrary? How different would the 
                            internet look if Times New Roman wasn't the default CSS font? 
                            If the CSS rules hadn't been so strictly codified?
                        </div>
                    </div>
                    <div className="fonts-index-display">
                        fonts index
                    </div>
                </div>
                <div>
                    Websites are textual, so fonts are obviously found everywhere (even the lack of font is a font), but so much else goes into creating a website that 
                    the particular font chosen is seldom the principal consideration. We may postulate that the choice of font on a website is determined by a 
                    coalition of drives: the preconcious motivations of a single programmer or designer steer the rudder, while the unconscious 
                    historical consensus of millions of programmers and designers move the waves. 
                    However, this explanation says very little in relation to the actual living rhythm of digital design. 
                    In lieu of answering questions of a historical or ontological nature, I've instead focused on 
                    creating a plain statistical document that descibes the general form that text takes on the immediate, material web. 
                    Disassembled into numbers through analysis, the mass of information becomes easily digestible. 
                    Below are twenty website categories that have been broken down across the eight general font classifications. 
                </div>
                <FontClassificationChart/>
                <div style={{opacity: '0.5'}}>
                    (As in the animal kingdom, font taxonomy is really just a reified fabrication. Unlike biological taxons, however, 
                        the descriptive terms here are presented in the form of the things they describe.)
                </div>
                <div>
                    Each site has had up to three fonts assigned to it. These are determined by which three fonts are referenced most frequently across the site's stylesheets, JS-rendered styles, and inline style tags.
                    fonts index scraped <b>3202</b> fonts across <b>7896</b> sites. Default font fallbacks ("monospace", "serif", "sans serif") also count as fonts. Website data was pulled from <a href="https://majestic.com/reports/majestic-million" target="_blank">The Majestic Million</a>. 
                    The top ten most-used fonts are:
                </div>
                <div>
                    1. <a href="https://en.wikipedia.org/wiki/Arial" target="_blank">Arial</a>
                </div>
                <div>
                    2. <a href="https://en.wikipedia.org/wiki/Monospaced_font" target="_blank">Monospace</a> (fallback font)
                </div>
                <div>
                    3. <a href="https://en.wikipedia.org/wiki/Roboto" target="_blank">Roboto</a>
                </div>
                <div>
                    4. <a href="https://en.wikipedia.org/wiki/Sans-serif" target="_blank">Sans Serif</a> (fallback font)
                </div>
                <div>
                    5. <a href="https://en.wikipedia.org/wiki/Inter_(typeface)" target="_blank">Inter</a>
                </div>
                <div>
                    6. <a href="https://en.wikipedia.org/wiki/Open_Sans" target="_blank">Open Sans</a>
                </div>
                <div>
                    7. <a href="https://en.wikipedia.org/wiki/Typography_of_Apple_Inc." target="_blank">Apple System</a>
                </div>
                <div>
                    8. <a href="https://en.wikipedia.org/wiki/Helvetica" target="_blank">Helvetica Neue</a>
                </div>
                <div>
                    9. <a href="https://en.wikipedia.org/wiki/Web_typography" target="_blank">System UI</a> (fallback font)
                </div>
                <div>
                    10. <a href="https://en.wikipedia.org/wiki/San_Francisco_(sans-serif_typeface)" target="_blank">SF Mono</a>
                </div>

                <div style={{opacity: '0.5'}}>
                    Created by <a href="https://otherseas1.com/" target='_blank'>otherseas1</a>.
                    <br/>
                    fonts index is set in <a href="https://commitmono.com/" target='_blank'>Commit Mono</a>.
                </div>
            </div> 
        </div>
    )
}