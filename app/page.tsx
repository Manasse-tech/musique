"use client"

import { useMemo, useState } from "react"

type Track = { title: string; artist: string; album: string; duration: string; tone: string }

const tracks: Track[] = [
  { title: "Midnight City", artist: "M83", album: "Hurry Up, We're Dreaming", duration: "4:03", tone: "sunset" },
  { title: "A Moment Apart", artist: "Odesza", album: "A Moment Apart", duration: "3:54", tone: "ocean" },
  { title: "Innerbloom", artist: "RÜFÜS DU SOL", album: "Bloom", duration: "9:37", tone: "violet" },
  { title: "The Less I Know The Better", artist: "Tame Impala", album: "Currents", duration: "3:36", tone: "pink" },
  { title: "Awake", artist: "Tycho", album: "Awake", duration: "4:44", tone: "mint" },
]

const navItems = ["Home", "Discover", "Radio", "Library", "Videos"]

export default function Home() {
  const [activeNav, setActiveNav] = useState("Home")
  const [current, setCurrent] = useState(tracks[0])
  const [playing, setPlaying] = useState(false)
  const [liked, setLiked] = useState(false)
  const [query, setQuery] = useState("")
  const [showSettings, setShowSettings] = useState(false)

  const filteredTracks = useMemo(() => tracks.filter((track) => `${track.title} ${track.artist} ${track.album}`.toLowerCase().includes(query.toLowerCase())), [query])
  const selectTrack = (track: Track) => { setCurrent(track); setPlaying(true) }

  if (showSettings) return <Settings onBack={() => setShowSettings(false)} />

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="app-logo"><span className="logo-glyph">M</span><span>melodix</span></div>
        <button className="profile-card" type="button"><span className="avatar">E</span><span><strong>Ephraim</strong><small>Personal account</small></span><span className="chevron">⌄</span></button>
        <nav aria-label="Main navigation">
          <p className="nav-label">Menu</p>
          {navItems.map((item, index) => <button key={item} className={`nav-item ${activeNav === item ? "active" : ""}`} onClick={() => setActiveNav(item)}><span className="nav-icon">{["⌂", "✦", "◉", "▤", "▣"][index]}</span>{item}{item === "Videos" && <span className="new-pill">NEW</span>}</button>)}
        </nav>
        <nav className="sidebar-bottom" aria-label="Your collection"><p className="nav-label">Your collection</p><button className="nav-item" onClick={() => setActiveNav("Liked songs")}><span className="nav-icon">♡</span>Liked songs</button><button className="nav-item" onClick={() => setActiveNav("Downloads")}><span className="nav-icon">↓</span>Downloads</button><button className="nav-item" onClick={() => setShowSettings(true)}><span className="nav-icon">⚙</span>Settings</button></nav>
        <div className="storage-card"><div className="storage-head"><span>Offline storage</span><span>42%</span></div><div className="storage-bar"><span /></div><small>2.4 GB of 6 GB used</small><button type="button">Manage storage</button></div>
      </aside>

      <section className="main-view">
        <header className="top-header"><div className="search-box"><span>⌕</span><input aria-label="Search" placeholder="Search songs, artists, albums..." value={query} onChange={(event) => setQuery(event.target.value)} /><kbd>⌘ K</kbd></div><div className="header-actions"><button className="icon-button" aria-label="Notifications">♢<i /></button><button className="upgrade-button">Upgrade <span>↗</span></button><button className="mini-avatar">E</button></div></header>
        <div className="content-scroll">
          <section className="welcome-row"><div><p className="eyebrow">FRIDAY, SEPTEMBER 18</p><h1>Good evening, Ephraim</h1><p className="muted">Your music is ready when you are.</p></div><button className="quick-play" onClick={() => { setCurrent(tracks[0]); setPlaying(true) }}><span>▶</span> Quick play</button></section>
          <section className="hero-card"><div className="hero-copy"><span className="hero-tag">EDITOR'S PICK</span><h2>New sounds,<br /><em>infinite moods.</em></h2><p>Discover your next favorite track from a world of carefully curated sounds.</p><button onClick={() => setActiveNav("Discover")}>Explore discovery <span>→</span></button></div><div className="hero-art"><div className="orb orb-one" /><div className="orb orb-two" /><div className="hero-note">♪</div></div></section>
          <section className="section-block"><div className="section-heading"><div><h2>Made for you</h2><p>Handpicked mixes based on your listening</p></div><button className="see-all" onClick={() => setActiveNav("Discover")}>See all <span>→</span></button></div><div className="mix-grid"><MixCard tone="sunset" title="Late Night Drive" detail="Chill electronic" /><MixCard tone="ocean" title="Focus Flow" detail="Ambient · 3h 24m" /><MixCard tone="violet" title="Your Daily Mix" detail="A fresh mix, daily" /><MixCard tone="mint" title="Discover Weekly" detail="New music for you" /></div></section>
          <section className="section-block tracks-section"><div className="section-heading"><div><h2>Recently played</h2><p>Pick up where you left off</p></div><button className="see-all">View history <span>→</span></button></div><div className="track-list">{filteredTracks.map((track, index) => <button className={`track-row ${current.title === track.title ? "selected" : ""}`} key={track.title} onClick={() => selectTrack(track)}><span className="track-number">{current.title === track.title && playing ? "▶" : String(index + 1).padStart(2, "0")}</span><span className={`cover ${track.tone}`}><span>{track.title.charAt(0)}</span></span><span className="track-info"><strong>{track.title}</strong><small>{track.artist}</small></span><span className="track-album">{track.album}</span><span className="track-time">{track.duration}</span><span className="track-more">···</span></button>)}</div></section>
        </div>
      </section>
      <Player track={current} playing={playing} liked={liked} onPlay={() => setPlaying(!playing)} onLike={() => setLiked(!liked)} />
      <div className="mobile-nav">{navItems.slice(0, 4).map((item, index) => <button key={item} className={activeNav === item ? "active" : ""} onClick={() => setActiveNav(item)}><span>{["⌂", "✦", "▤", "▣"][index]}</span>{item}</button>)}</div>
    </main>
  )
}

function MixCard({ tone, title, detail }: { tone: string; title: string; detail: string }) { return <button className="mix-card" onClick={() => undefined}><div className={`mix-art ${tone}`}><span className="mix-shape">◒</span><span className="mix-play">▶</span></div><strong>{title}</strong><small>{detail}</small></button> }
function Player({ track, playing, liked, onPlay, onLike }: { track: Track; playing: boolean; liked: boolean; onPlay: () => void; onLike: () => void }) { return <footer className="player"><div className="now-playing"><span className={`cover small ${track.tone}`}>{track.title.charAt(0)}</span><span><strong>{track.title}</strong><small>{track.artist}</small></span><button aria-label="Like song" className={liked ? "liked" : ""} onClick={onLike}>♡</button></div><div className="player-controls"><div className="control-buttons"><button aria-label="Previous">|◀</button><button className="play-button" aria-label={playing ? "Pause" : "Play"} onClick={onPlay}>{playing ? "Ⅱ" : "▶"}</button><button aria-label="Next">▶|</button></div><div className="progress"><span>1:24</span><div><i /></div><span>{track.duration}</span></div></div><div className="player-tools"><span>♧</span><span>▤</span><div className="volume"><span>⌁</span><i /></div><span>⛶</span></div></footer> }
function Settings({ onBack }: { onBack: () => void }) { return <main className="settings-page"><button className="back-button" onClick={onBack}>← Back to Melodix</button><div className="settings-wrap"><p className="eyebrow">PREFERENCES</p><h1>Settings</h1><p className="muted">Make Melodix feel like yours.</p><div className="settings-grid"><section className="settings-card"><h2>Playback</h2><Setting label="High quality audio" detail="Lossless quality when available" active /><Setting label="Crossfade" detail="Blend tracks together" active={false} /><Setting label="Autoplay" detail="Keep playing similar music" active /></section><section className="settings-card"><h2>Appearance</h2><Setting label="Dark mode" detail="Always use dark mode" active /><Setting label="Compact player" detail="Show a smaller bottom player" active={false} /></section></div></div></main> }
function Setting({ label, detail, active }: { label: string; detail: string; active: boolean }) { return <div className="setting"><span><strong>{label}</strong><small>{detail}</small></span><span className={`toggle ${active ? "on" : ""}`}><i /></span></div> }
