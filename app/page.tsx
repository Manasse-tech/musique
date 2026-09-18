"use client"

import { useEffect, useMemo, useState } from "react"
import { createClient } from "@/lib/supabase/client"

type Track = { title: string; artist: string; album: string; duration: string; tone: string; genre: string }
type View = "Home" | "Discover" | "Radio" | "Library" | "Videos" | "Liked songs" | "Downloads" | "Settings"

const tracks: Track[] = [
  { title: "Midnight City", artist: "M83", album: "Hurry Up, We're Dreaming", duration: "4:03", tone: "sunset", genre: "Electronic" },
  { title: "A Moment Apart", artist: "Odesza", album: "A Moment Apart", duration: "3:54", tone: "ocean", genre: "Electronic" },
  { title: "Innerbloom", artist: "RÜFÜS DU SOL", album: "Bloom", duration: "9:37", tone: "violet", genre: "House" },
  { title: "The Less I Know The Better", artist: "Tame Impala", album: "Currents", duration: "3:36", tone: "pink", genre: "Indie" },
  { title: "Awake", artist: "Tycho", album: "Awake", duration: "4:44", tone: "mint", genre: "Ambient" },
  { title: "Sunset Lover", artist: "Petit Biscuit", album: "Presence", duration: "3:58", tone: "gold", genre: "Chill" },
]
const navItems: View[] = ["Home", "Discover", "Radio", "Library", "Videos"]

export default function Home() {
  const [activeNav, setActiveNav] = useState<View>("Home")
  const [current, setCurrent] = useState(tracks[0])
  const [playing, setPlaying] = useState(false)
  const [liked, setLiked] = useState(false)
  const [query, setQuery] = useState("")
  const [showQueue, setShowQueue] = useState(false)
  const [toast, setToast] = useState("")
  const [highQuality, setHighQuality] = useState(true)
  const [autoplay, setAutoplay] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const supabase = useMemo(() => process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ? createClient() : null, [])

  useEffect(() => {
    let active = true
    if (!supabase) return () => { active = false }
    supabase.auth.getUser().then(({ data }) => { if (active) setUserId(data.user?.id ?? null) })
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => setUserId(session?.user?.id ?? null))
    return () => { active = false; listener.subscription.unsubscribe() }
  }, [supabase])

  useEffect(() => {
    if (!userId) return
    if (!supabase) return
    supabase.from("user_likes").select("track_key").eq("user_id", userId).then(({ data }) => setLiked(Boolean(data?.some((row) => row.track_key === current.title))))
  }, [current.title, supabase, userId])

  const filteredTracks = useMemo(() => tracks.filter((track) => `${track.title} ${track.artist} ${track.album} ${track.genre}`.toLowerCase().includes(query.toLowerCase())), [query])
  const selectTrack = async (track: Track) => {
    setCurrent(track)
    setPlaying(true)
    setToast(`Playing ${track.title}`)
    window.setTimeout(() => setToast(""), 1800)
    if (userId && supabase) await supabase.from("listening_history").insert({ user_id: userId, track_key: track.title })
  }
  const toggleLike = async () => {
    const nextLiked = !liked
    setLiked(nextLiked)
    setToast(nextLiked ? "Added to liked songs" : "Removed from liked songs")
    if (!userId || !supabase) return
    if (nextLiked) await supabase.from("user_likes").upsert({ user_id: userId, track_key: current.title })
    else await supabase.from("user_likes").delete().eq("user_id", userId).eq("track_key", current.title)
  }
  const navigate = (view: View) => { setActiveNav(view); setShowQueue(false) }

  return <main className="app-shell">
    <aside className="sidebar">
      <div className="app-logo"><span className="logo-glyph">M</span><span>melodix</span></div>
      <button className="profile-card" type="button" onClick={() => navigate("Settings")}><span className="avatar">E</span><span><strong>Ephraim</strong><small>Personal account</small></span><span className="chevron">⌄</span></button>
      <nav aria-label="Main navigation"><p className="nav-label">Menu</p>{navItems.map((item, index) => <button key={item} className={`nav-item ${activeNav === item ? "active" : ""}`} onClick={() => navigate(item)}><span className="nav-icon">{["⌂", "✦", "◉", "▤", "▣"][index]}</span>{item}{item === "Videos" && <span className="new-pill">NEW</span>}</button>)}</nav>
      <nav className="sidebar-bottom" aria-label="Your collection"><p className="nav-label">Your collection</p><button className={`nav-item ${activeNav === "Liked songs" ? "active" : ""}`} onClick={() => navigate("Liked songs")}><span className="nav-icon">♡</span>Liked songs</button><button className={`nav-item ${activeNav === "Downloads" ? "active" : ""}`} onClick={() => navigate("Downloads")}><span className="nav-icon">↓</span>Downloads</button><button className={`nav-item ${activeNav === "Settings" ? "active" : ""}`} onClick={() => navigate("Settings")}><span className="nav-icon">⚙</span>Settings</button></nav>
      <div className="storage-card"><div className="storage-head"><span>Offline storage</span><span>42%</span></div><div className="storage-bar"><span /></div><small>2.4 GB of 6 GB used</small><button type="button" onClick={() => navigate("Downloads")}>Manage storage</button></div>
    </aside>
    <section className="main-view">
      <header className="top-header"><div className="search-box"><span>⌕</span><input aria-label="Search" placeholder="Search songs, artists, albums..." value={query} onChange={(event) => setQuery(event.target.value)} /><kbd>⌘ K</kbd></div><div className="header-actions"><button className="icon-button" aria-label="Notifications" onClick={() => setToast("No new notifications")}>♢<i /></button><button className="upgrade-button" onClick={() => setToast("Upgrade checkout coming soon")}>Upgrade <span>↗</span></button><button className="mini-avatar" aria-label="Open settings" onClick={() => navigate("Settings")}>E</button></div></header>
      <div className="content-scroll">
        {activeNav === "Home" && <HomeView onNavigate={navigate} onSelect={selectTrack} tracks={filteredTracks} current={current} playing={playing} />}
        {activeNav === "Discover" && <DiscoverView onSelect={selectTrack} tracks={filteredTracks} />}
        {activeNav === "Radio" && <RadioView onSelect={selectTrack} />}
        {activeNav === "Library" && <LibraryView onNavigate={navigate} onSelect={selectTrack} />}
        {activeNav === "Videos" && <VideosView />}
        {activeNav === "Liked songs" && <CollectionView title="Liked songs" description="Your favorite tracks in one place." tracks={liked ? [current] : []} onSelect={selectTrack} empty="Like a song to see it here." />}
        {activeNav === "Downloads" && <CollectionView title="Downloads" description="Listen offline, wherever you are." tracks={[]} onSelect={selectTrack} empty="Downloaded music will appear here." />}
        {activeNav === "Settings" && <Settings highQuality={highQuality} autoplay={autoplay} setHighQuality={setHighQuality} setAutoplay={setAutoplay} />}
      </div>
    </section>
    <Player track={current} playing={playing} liked={liked} onPlay={() => setPlaying(!playing)} onLike={toggleLike} onQueue={() => setShowQueue(!showQueue)} />
    {showQueue && <aside className="queue-panel"><div className="queue-head"><div><p className="eyebrow">UP NEXT</p><h2>Queue</h2></div><button onClick={() => setShowQueue(false)} aria-label="Close queue">×</button></div>{tracks.slice(1, 5).map((track) => <button className="queue-row" key={track.title} onClick={() => selectTrack(track)}><span className={`cover small ${track.tone}`}>{track.title[0]}</span><span><strong>{track.title}</strong><small>{track.artist}</small></span></button>)}</aside>}
    <div className="mobile-nav">{navItems.slice(0, 4).map((item, index) => <button key={item} className={activeNav === item ? "active" : ""} onClick={() => navigate(item)}><span>{["⌂", "✦", "▤", "▣"][index]}</span>{item}</button>)}</div>
    {toast && <div className="toast" role="status">{toast}</div>}
  </main>
}

function HomeView({ onNavigate, onSelect, tracks, current, playing }: { onNavigate: (view: View) => void; onSelect: (track: Track) => void; tracks: Track[]; current: Track; playing: boolean }) { return <><section className="welcome-row"><div><p className="eyebrow">FRIDAY, SEPTEMBER 18</p><h1>Good evening, Ephraim</h1><p className="muted">Your music is ready when you are.</p></div><button className="quick-play" onClick={() => onSelect(tracks[0] || current)}><span>▶</span> Quick play</button></section><section className="hero-card"><div className="hero-copy"><span className="hero-tag">EDITOR&apos;S PICK</span><h2>New sounds,<br /><em>infinite moods.</em></h2><p>Discover your next favorite track from a world of carefully curated sounds.</p><button onClick={() => onNavigate("Discover")}>Explore discovery <span>→</span></button></div><div className="hero-art"><div className="orb orb-one" /><div className="orb orb-two" /><div className="hero-note">♪</div></div></section><section className="section-block"><div className="section-heading"><div><h2>Made for you</h2><p>Handpicked mixes based on your listening</p></div><button className="see-all" onClick={() => onNavigate("Discover")}>See all <span>→</span></button></div><div className="mix-grid"><MixCard tone="sunset" title="Late Night Drive" detail="Chill electronic" /><MixCard tone="ocean" title="Focus Flow" detail="Ambient · 3h 24m" /><MixCard tone="violet" title="Your Daily Mix" detail="A fresh mix, daily" /><MixCard tone="mint" title="Discover Weekly" detail="New music for you" /></div></section><TrackSection tracks={tracks} current={current} playing={playing} onSelect={onSelect} /></> }
function DiscoverView({ onSelect, tracks }: { onSelect: (track: Track) => void; tracks: Track[] }) { return <><PageHeader eyebrow="DISCOVER" title="Find your next favorite" description="Fresh releases, editorial playlists, and sounds made for your moment." /><div className="genre-grid">{["Electronic", "Indie", "Ambient", "House", "Chill", "Focus"].map((genre, index) => <button key={genre} className={`genre-card genre-${index}`}><strong>{genre}</strong><span>Explore station →</span></button>)}</div><TrackSection tracks={tracks} current={tracks[0]} playing={false} onSelect={onSelect} /></> }
function RadioView({ onSelect }: { onSelect: (track: Track) => void }) { return <><PageHeader eyebrow="LIVE RADIO" title="Soundtrack your day" description="Always-on stations, hosted shows, and curated radio from Melodix." /><div className="radio-feature"><div className="radio-live">LIVE</div><h2>Melodix Selects</h2><p>Deep cuts and new discoveries, mixed continuously by our editors.</p><button className="quick-play" onClick={() => onSelect(tracks[2])}>Listen now <span>▶</span></button></div><div className="section-heading"><div><h2>Stations for you</h2><p>Based on your recent listening</p></div></div><div className="mix-grid"><MixCard tone="pink" title="Indie Sunset" detail="Radio station" /><MixCard tone="gold" title="Ambient Hours" detail="Radio station" /><MixCard tone="ocean" title="Electronic Pulse" detail="Radio station" /></div></> }
function LibraryView({ onNavigate, onSelect }: { onNavigate: (view: View) => void; onSelect: (track: Track) => void }) { return <><PageHeader eyebrow="YOUR LIBRARY" title="Everything you love" description="Your playlists, albums, artists, and listening history." /><div className="library-actions"><button className="primary-action" onClick={() => onNavigate("Liked songs")}>♡ Liked songs <span>1 track</span></button><button className="secondary-action" onClick={() => onSelect(tracks[0])}>▶ Recently played <span>6 tracks</span></button></div><TrackSection tracks={tracks.slice(0, 4)} current={tracks[0]} playing={false} onSelect={onSelect} /></> }
function VideosView() { return <><PageHeader eyebrow="MUSIC VIDEOS" title="Watch the sound" description="Official videos, live sessions, and visual albums." /><div className="video-grid">{tracks.slice(0, 6).map((track, index) => <button className="video-card" key={track.title}><div className={`video-art ${track.tone}`}><span>▶</span><small>{index % 2 ? "LIVE SESSION" : "OFFICIAL VIDEO"}</small></div><strong>{track.title}</strong><small>{track.artist} · 4K</small></button>)}</div></> }
function CollectionView({ title, description, tracks, onSelect, empty }: { title: string; description: string; tracks: Track[]; onSelect: (track: Track) => void; empty: string }) { return <><PageHeader eyebrow="YOUR COLLECTION" title={title} description={description} />{tracks.length ? <TrackSection tracks={tracks} current={tracks[0]} playing={false} onSelect={onSelect} /> : <div className="empty-state"><span>♡</span><h2>Nothing here yet</h2><p>{empty}</p></div>}</> }
function Settings({ highQuality, autoplay, setHighQuality, setAutoplay }: { highQuality: boolean; autoplay: boolean; setHighQuality: (value: boolean) => void; setAutoplay: (value: boolean) => void }) { return <><PageHeader eyebrow="PREFERENCES" title="Settings" description="Control your playback, privacy, and account experience." /><div className="settings-grid"><section className="settings-card"><h2>Playback</h2><Setting label="High quality audio" detail="Lossless quality when available" active={highQuality} onChange={() => setHighQuality(!highQuality)} /><Setting label="Autoplay" detail="Keep playing similar music" active={autoplay} onChange={() => setAutoplay(!autoplay)} /><Setting label="Crossfade" detail="Blend tracks together" active={false} /></section><section className="settings-card"><h2>Account & privacy</h2><Setting label="Private listening" detail="Hide activity from your profile" active={true} /><Setting label="Personalized recommendations" detail="Use listening history to improve mixes" active={true} /><button className="danger-action">Sign out of all devices</button></section></div></> }
function PageHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) { return <section className="page-header"><p className="eyebrow">{eyebrow}</p><h1>{title}</h1><p className="muted">{description}</p></section> }
function TrackSection({ tracks, current, playing, onSelect }: { tracks: Track[]; current: Track; playing: boolean; onSelect: (track: Track) => void }) { return <section className="section-block tracks-section"><div className="section-heading"><div><h2>Tracks</h2><p>Pick up where you left off</p></div><button className="see-all">View history <span>→</span></button></div><div className="track-list">{tracks.map((track, index) => <button className={`track-row ${current?.title === track.title ? "selected" : ""}`} key={track.title} onClick={() => onSelect(track)}><span className="track-number">{current?.title === track.title && playing ? "▶" : String(index + 1).padStart(2, "0")}</span><span className={`cover ${track.tone}`}><span>{track.title.charAt(0)}</span></span><span className="track-info"><strong>{track.title}</strong><small>{track.artist}</small></span><span className="track-album">{track.album}</span><span className="track-time">{track.duration}</span><span className="track-more">···</span></button>)}</div></section> }
function MixCard({ tone, title, detail }: { tone: string; title: string; detail: string }) { return <button className="mix-card"><div className={`mix-art ${tone}`}><span className="mix-shape">◒</span><span className="mix-play">▶</span></div><strong>{title}</strong><small>{detail}</small></button> }
function Player({ track, playing, liked, onPlay, onLike, onQueue }: { track: Track; playing: boolean; liked: boolean; onPlay: () => void; onLike: () => void; onQueue: () => void }) { return <footer className="player"><div className="now-playing"><span className={`cover small ${track.tone}`}>{track.title.charAt(0)}</span><span><strong>{track.title}</strong><small>{track.artist}</small></span><button aria-label="Like song" className={liked ? "liked" : ""} onClick={onLike}>♡</button></div><div className="player-controls"><div className="control-buttons"><button aria-label="Previous">|◀</button><button className="play-button" aria-label={playing ? "Pause" : "Play"} onClick={onPlay}>{playing ? "Ⅱ" : "▶"}</button><button aria-label="Next">▶|</button></div><div className="progress"><span>1:24</span><div><i /></div><span>{track.duration}</span></div></div><div className="player-tools"><button aria-label="Queue" onClick={onQueue}>▤</button><span>⌁</span><div className="volume"><i /></div><span>⛶</span></div></footer> }
function Setting({ label, detail, active, onChange }: { label: string; detail: string; active: boolean; onChange?: () => void }) { return <button className="setting" onClick={onChange}><span><strong>{label}</strong><small>{detail}</small></span><span className={`toggle ${active ? "on" : ""}`}><i /></span></button> }
