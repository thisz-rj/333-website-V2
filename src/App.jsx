import { ArrowDown, ArrowUpRight, Menu, Play, Volume2, VolumeX, X } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

import { Button } from './components/Button';

const chapters = [
  {
    code: 'WR',
    label: 'Writing',
    heading: 'It began with three knocks.',
    body: 'The screenplay was built around repetition: the same time, the same corridor, the same impossible sound. Each draft removed an explanation and left the audience with something more personal.',
    meta: ['07 drafts', '14 pages', '1 recurring nightmare'],
  },
  {
    code: 'PR',
    label: 'Pre-production',
    heading: 'Designing what cannot be seen.',
    body: 'Every lens, practical light and camera position was tested to make the negative space feel occupied. The apartment became a character long before the cast arrived.',
    meta: ['21-day prep', '1 location', '42 storyboard frames'],
  },
  {
    code: 'SH',
    label: 'The shoot',
    heading: 'Three nights inside room 333.',
    body: 'A compact crew worked through the night with restrained camera movement and long, patient takes. The tension had to enter the room before the character noticed it.',
    meta: ['3 night shoots', '28 setups', '9 crew'],
  },
  {
    code: 'PT',
    label: 'Post',
    heading: 'Finding the sound of an empty room.',
    body: 'The final cut was shaped through absence: longer pauses, darker corners and ordinary sounds pushed half a step beyond familiar. Silence became the final effect.',
    meta: ['Picture lock', 'Original score', '5.1 mix'],
  },
];

const stills = [
  { number: '001', title: 'The first recce', position: '16% center' },
  { number: '017', title: 'Practical light test', position: '48% center' },
  { number: '033', title: 'Camera test / night', position: '78% center' },
  { number: '072', title: 'Door detail', position: '94% center' },
];

const people = [
  { name: 'Actor Name', role: 'Mira', group: 'Cast', initials: 'AN', position: '12% center' },
  { name: 'Actor Name', role: 'The Neighbour', group: 'Cast', initials: 'AN', position: '34% center' },
  { name: 'Your Name', role: 'Writer / Director', group: 'Crew', initials: 'YN', position: '52% center' },
  { name: 'Crew Name', role: 'Cinematography', group: 'Crew', initials: 'CN', position: '67% center' },
  { name: 'Crew Name', role: 'Production Design', group: 'Crew', initials: 'CN', position: '82% center' },
  { name: 'Crew Name', role: 'Edit / Sound', group: 'Crew', initials: 'CN', position: '96% center' },
];

function FilmCard({
  mode,
  label,
  title,
  runtime,
  featured = false,
  onOpen,
}) {
  const handleMove = (event) => {
    const card = event.currentTarget;
    const bounds = card.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;
    card.style.setProperty('--tilt-x', `${y * -3}deg`);
    card.style.setProperty('--tilt-y', `${x * 4}deg`);
  };

  const resetTilt = (event) => {
    event.currentTarget.style.setProperty('--tilt-x', '0deg');
    event.currentTarget.style.setProperty('--tilt-y', '0deg');
  };

  return (
    <button
      className={`screening-card ${featured ? 'screening-card-featured' : ''}`}
      onClick={() => onOpen(mode)}
      onPointerMove={handleMove}
      onPointerLeave={resetTilt}
      aria-label={`Play ${label}`}
    >
      <img src="/images/333-hallway.png" alt="The corridor leading to apartment 333" />
      <span className="screening-shade" />
      <span className="screening-top"><b>{label}</b><i>{runtime}</i></span>
      <span className="screening-title">{title}</span>
      <span className="screening-play"><Play aria-hidden="true" /></span>
      <span className="screening-corner" aria-hidden="true">{featured ? 'FULL FILM' : 'TRAILER'}</span>
    </button>
  );
}

function SectionDivider({
  next,
  tone = 'dark',
}) {
  return (
    <div className={`section-divider section-divider-${tone}`} aria-hidden="true">
      <span>333</span>
      <i><b /></i>
      <span>{next}</span>
    </div>
  );
}

export default function Home() {
  const [playerMode, setPlayerMode] = useState(null);
  const [activeChapter, setActiveChapter] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [soundStarted, setSoundStarted] = useState(false);
  const heroRef = useRef(null);
  const audioRef = useRef(null);
  const soundEnabledRef = useRef(true);
  const volumeFrameRef = useRef(null);
  const scrollSoundTimeoutRef = useRef(null);

  const fadeAudio = useCallback((target, duration = 700, pauseAfter = false) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (volumeFrameRef.current) cancelAnimationFrame(volumeFrameRef.current);
    const startingVolume = audio.volume;
    const startedAt = performance.now();

    const step = (now) => {
      const progress = Math.min((now - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      audio.volume = startingVolume + (target - startingVolume) * eased;

      if (progress < 1) {
        volumeFrameRef.current = requestAnimationFrame(step);
      } else {
        volumeFrameRef.current = null;
        if (pauseAfter) audio.pause();
      }
    };

    volumeFrameRef.current = requestAnimationFrame(step);
  }, []);

  const startAmbience = useCallback(async () => {
    const audio = audioRef.current;
    if (!audio || !soundEnabledRef.current) return;

    if (!audio.paused) {
      setSoundStarted(true);
      return;
    }

    audio.volume = 0;
    try {
      await audio.play();
      setSoundStarted(true);
      fadeAudio(0.1, 1400);
    } catch {}
  }, [fadeAudio]);

  useEffect(() => {
    const updateProgress = () => {
      const distance = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(distance > 0 ? window.scrollY / distance : 0);

      const audio = audioRef.current;
      if (soundEnabledRef.current && audio && !audio.paused) {
        audio.volume = Math.max(audio.volume, 0.135);
        if (scrollSoundTimeoutRef.current) clearTimeout(scrollSoundTimeoutRef.current);
        scrollSoundTimeoutRef.current = setTimeout(() => fadeAudio(0.1, 850), 160);
      }
    };

    const reveals = document.querySelectorAll('[data-reveal]');
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add('is-visible')),
      { threshold: 0.12 },
    );

    reveals.forEach((element) => observer.observe(element));
    window.addEventListener('scroll', updateProgress, { passive: true });
    updateProgress();

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', updateProgress);
    };
  }, [fadeAudio]);

  useEffect(() => {
    const storedPreference = window.localStorage.getItem('333-ambience');
    if (storedPreference === 'off') {
      soundEnabledRef.current = false;
      setSoundEnabled(false);
    } else {
      void startAmbience();
    }

    const beginOnInteraction = () => void startAmbience();
    window.addEventListener('pointerdown', beginOnInteraction);
    window.addEventListener('keydown', beginOnInteraction);
    window.addEventListener('touchstart', beginOnInteraction, { passive: true });
    window.addEventListener('wheel', beginOnInteraction, { passive: true });

    return () => {
      window.removeEventListener('pointerdown', beginOnInteraction);
      window.removeEventListener('keydown', beginOnInteraction);
      window.removeEventListener('touchstart', beginOnInteraction);
      window.removeEventListener('wheel', beginOnInteraction);
      if (volumeFrameRef.current) cancelAnimationFrame(volumeFrameRef.current);
      if (scrollSoundTimeoutRef.current) clearTimeout(scrollSoundTimeoutRef.current);
    };
  }, [startAmbience]);

  useEffect(() => {
    if (!playerMode) return;

    const closeOnEscape = (event) => event.key === 'Escape' && setPlayerMode(null);
    document.addEventListener('keydown', closeOnEscape);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', closeOnEscape);
      document.body.style.overflow = '';
    };
  }, [playerMode]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!soundEnabled || !audio || audio.paused) return;
    fadeAudio(playerMode ? 0.025 : 0.1, playerMode ? 350 : 800);
  }, [fadeAudio, playerMode, soundEnabled]);

  const toggleAmbience = () => {
    const nextState = !soundEnabled;
    soundEnabledRef.current = nextState;
    setSoundEnabled(nextState);
    window.localStorage.setItem('333-ambience', nextState ? 'on' : 'off');

    if (nextState) {
      void startAmbience();
    } else {
      setSoundStarted(false);
      fadeAudio(0, 450, true);
    }
  };

  const moveSpotlight = (event) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    heroRef.current?.style.setProperty('--pointer-x', `${event.clientX - bounds.left}px`);
    heroRef.current?.style.setProperty('--pointer-y', `${event.clientY - bounds.top}px`);
  };

  const selectedChapter = chapters[activeChapter];
  const videoSource = playerMode === 'trailer' ? '/film/333-trailer.mp4' : '/film/333-short-film.mp4';

  return (
    <main className="site" style={{ '--scroll-progress': scrollProgress }}>
      <audio ref={audioRef} src="/audio/333-ambience.mp3" loop preload="auto" aria-hidden="true" />
      <div className="scroll-progress" aria-hidden="true" />

      <header className="site-header">
        <a className="brand" href="#top" aria-label="333 home">333<span>/</span></a>
        <nav className={menuOpen ? 'nav-open' : ''} aria-label="Primary navigation">
          <a href="#trailer" onClick={() => setMenuOpen(false)}>Trailer</a>
          <a href="#film" onClick={() => setMenuOpen(false)}>Film</a>
          <a href="#story" onClick={() => setMenuOpen(false)}>Story</a>
          <a href="#process" onClick={() => setMenuOpen(false)}>Process</a>
          <a href="#bts" onClick={() => setMenuOpen(false)}>BTS</a>
          <a href="#credits" onClick={() => setMenuOpen(false)}>Credits</a>
        </nav>
        <div className="header-tools">
          <Button
            className={`sound-toggle ${soundEnabled && soundStarted ? 'is-playing' : ''}`}
            variant="ghost"
            onClick={toggleAmbience}
            aria-label={soundEnabled ? 'Turn ambient sound off' : 'Turn ambient sound on'}
            aria-pressed={soundEnabled}
          >
            {soundEnabled ? <Volume2 aria-hidden="true" /> : <VolumeX aria-hidden="true" />}
            <span>Ambience</span>
            <i className="sound-bars" aria-hidden="true"><b /><b /><b /></i>
          </Button>
          <div className="header-meta"><span>A short film</span><b>MMXXVI</b></div>
        </div>
        <Button className="menu-button" variant="ghost" size="icon" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? <X /> : <Menu />}
        </Button>
      </header>

      <section className="hero" id="top" ref={heroRef} onPointerMove={moveSpotlight}>
        <img className="hero-image" src="/images/333-hallway.png" alt="A dark corridor ending at apartment 333" />
        <div className="hero-vignette" />
        <div className="hero-spotlight" aria-hidden="true" />
        <div className="layout-grid hero-layout">
          <p className="hero-edition">Psychological horror <span>01 / 01</span></p>
          <h1 aria-label="333"><span>3</span><span>3</span><span>3</span></h1>
          <div className="hero-intro">
            <p>Every night at 3:33,<br />the empty room knocks back.</p>
          </div>
          <Button className="hero-play" onClick={() => setPlayerMode('trailer')}>
            <Play aria-hidden="true" />
            <span>Watch trailer<small>01:26</small></span>
          </Button>
          <p className="hero-credit">A film by<br /><b>SA Studios</b></p>
          <a className="scroll-cue" href="#trailer">Enter <ArrowDown aria-hidden="true" /></a>
        </div>
      </section>

      <SectionDivider next="01 / Trailer" />

      <section className="section cinema-section trailer-section" id="trailer" data-reveal>
        <div className="section-heading layout-grid">
          <p className="section-index">01 — Trailer</p>
          <h2>The first<br />warning.</h2>
          <p className="section-copy">A brief descent into the sound, atmosphere and mystery behind apartment 333.</p>
        </div>
        <div className="single-screening">
          <FilmCard mode="trailer" label="Official trailer" title="The door is only the beginning." runtime="01:26" onOpen={setPlayerMode} />
        </div>
      </section>

      <SectionDivider next="02 / Full film" />

      <section className="section cinema-section film-section" id="film" data-reveal>
        <div className="section-heading layout-grid">
          <p className="section-index">02 — The film</p>
          <h2>The complete<br />descent.</h2>
          <p className="section-copy">The finished twelve-minute short, presented in a focused, uninterrupted screening experience.</p>
        </div>
        <div className="single-screening single-screening-film">
          <FilmCard mode="film" label="The short film" title="Watch 333" runtime="12:08" featured onOpen={setPlayerMode} />
        </div>
      </section>

      <SectionDivider next="03 / The story" tone="to-light" />

      <section className="story-section" id="story">
        <div className="story-image" data-reveal>
          <img src="/images/333-hallway.png" alt="Door 333 at the end of an empty corridor" />
          <span>03:33:00</span>
        </div>
        <div className="story-content" data-reveal>
          <p className="section-index">03 — The story</p>
          <blockquote>“The room across the hall has been empty for years. So who keeps knocking?”</blockquote>
          <div className="story-bottom">
            <p>A woman wakes at the same minute every night to three knocks from apartment 333. When a note appears beneath her door in her own handwriting, she must enter the room she has spent years pretending does not exist.</p>
            <dl>
              <div><dt>Format</dt><dd>Short film</dd></div>
              <div><dt>Genre</dt><dd>Psychological horror</dd></div>
              <div><dt>Status</dt><dd>In post-production</dd></div>
            </dl>
          </div>
        </div>
      </section>

      <SectionDivider next="04 / The process" tone="to-dark" />

      <section className="section process-section" id="process" data-reveal>
        <div className="section-heading layout-grid">
          <p className="section-index">04 — The process</p>
          <h2>From a mark<br />on paper.</h2>
          <p className="section-copy">Explore each production chapter. The archive will grow with scripts, tests, call sheets and material from the final shoot.</p>
        </div>

        <div className="process-console">
          <div className="chapter-tabs" role="tablist" aria-label="Production chapters">
            {chapters.map((chapter, index) => (
              <button
                key={chapter.code}
                role="tab"
                aria-selected={activeChapter === index}
                onClick={() => setActiveChapter(index)}
              >
                <span>{chapter.code}</span>
                <b>{chapter.label}</b>
                <i>0{index + 1}</i>
              </button>
            ))}
          </div>
          <div className="chapter-visual" key={selectedChapter.code}>
            <img src="/images/333-hallway.png" alt="The production location for 333" />
            <span className="chapter-code">{selectedChapter.code}</span>
            <span className="chapter-frame">ARCHIVE / {String(activeChapter + 1).padStart(2, '0')}</span>
          </div>
          <article className="chapter-copy" key={selectedChapter.heading}>
            <p className="section-index">Chapter {String(activeChapter + 1).padStart(2, '0')}</p>
            <h3>{selectedChapter.heading}</h3>
            <p>{selectedChapter.body}</p>
            <ul>{selectedChapter.meta.map((item) => <li key={item}>{item}</li>)}</ul>
          </article>
        </div>
      </section>

      <SectionDivider next="05 / Behind the scenes" />

      <section className="bts-section" id="bts" data-reveal>
        <div className="bts-header">
          <div><p className="section-index">05 — Behind the scenes</p><h2>The evidence.</h2></div>
          <p>Drag through the working archive <span>→</span></p>
        </div>
        <div className="stills-strip">
          {stills.map((still, index) => (
            <figure className={`still still-${index + 1}`} key={still.number}>
              <img src="/images/333-hallway.png" style={{ objectPosition: still.position }} alt={still.title} />
              <figcaption><span>{still.number}</span><b>{still.title}</b><i>333 / BTS</i></figcaption>
            </figure>
          ))}
        </div>
        <p className="content-note">The preview stills will be replaced with original on-set photography as production continues.</p>
      </section>

      <SectionDivider next="06 / Cast & crew" />

      <section className="section credits-section" id="credits" data-reveal>
        <div className="credits-title layout-grid">
          <p className="section-index">06 — Cast & crew</p>
          <h2>Made in<br />the dark.</h2>
          <p>Portrait-led credits for the people in front of the lens and everyone standing just outside its frame.</p>
        </div>
        <div className="people-grid">
          {people.map((person, index) => (
            <figure className="person-card" key={`${person.role}-${index}`}>
              <div className="person-photo">
                <img src="/images/333-hallway.png" style={{ objectPosition: person.position }} alt="" />
                <span>{person.initials}</span>
                <small>Portrait {String(index + 1).padStart(2, '0')}</small>
              </div>
              <figcaption><div><b>{person.name}</b><span>{person.role}</span></div><i>{person.group}</i></figcaption>
            </figure>
          ))}
        </div>
        <p className="content-note">The portrait frames are ready for the final cast and crew photographs.</p>
      </section>

      <SectionDivider next="End / 333" tone="to-red" />

      <footer className="site-footer">
        <div className="footer-top">
          <a className="footer-brand" href="#top">333</a>
          <p>Some doors<br />should stay numbered.</p>
          <a href="#top">Return to 3:33 <ArrowUpRight aria-hidden="true" /></a>
        </div>
        <div className="footer-bottom"><span>Psychological horror / Short film</span><span>© 2026 — All rights reserved</span></div>
      </footer>

      {playerMode && (
        <div className="player-backdrop" role="dialog" aria-modal="true" aria-label={playerMode === 'trailer' ? 'Trailer player' : 'Film player'} onMouseDown={(event) => event.currentTarget === event.target && setPlayerMode(null)}>
          <div className="player-shell">
            <div className="player-bar">
              <span>333 / {playerMode === 'trailer' ? 'Official trailer' : 'Full film'}</span>
              <button onClick={() => setPlayerMode(null)} aria-label="Close player"><X /></button>
            </div>
            <video controls autoPlay poster="/images/333-hallway.png" key={videoSource}>
              <source src={videoSource} type="video/mp4" />
              Your browser does not support HTML video.
            </video>
            <div className="player-status"><span><i /> Screening room</span><b>{playerMode === 'trailer' ? '01:26' : '12:08'}</b></div>
          </div>
        </div>
      )}
    </main>
  );
}
