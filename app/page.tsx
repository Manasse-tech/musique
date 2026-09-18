"use client"

import { type ChangeEvent, type RefObject, useEffect, useMemo, useRef, useState } from "react"

type MediaItem = { id: string; name: string; url: string; kind: "audio" | "video"; size: number; addedAt: number }

const starter: MediaItem[] = [
  { id: "demo-1", name: "Your local library is ready", url: "", kind: "audio", size: 0, addedAt: Date.now() },
]

function formatBytes(bytes: number) {
  if (!bytes) return "Local media"
  const units = ["B", "KB", "MB", "GB"]
  let value = bytes
  let index = 0
  while (value >= 1024 && index < units.length - 1) { value /= 1024; index++ }
  return `${value.toFixed(index ? 1 : 0)} ${units[index]}`
}

export default function Melodix() {
  const [items, setItems] = useState<MediaItem[]>(starter)
  const [active, setActive] = useState<MediaItem | null>(null)
  const [playing, setPlaying] = useState(false)
  const [query, setQuery] = useState("")
  const [section, setSection] = useState<"home" | "library" | "videos" | "favorites" | "settings">("home")
  const [favorites, setFavorites] = useState<string[]>([])
  const [toast, setToast] = useState("")
  const audioRef = useRef<HTMLAudioElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const saved = localStorage.getItem("melodix-library")
    const savedFavs = localStorage.getItem("melodix-favorites")
    if (saved) setItems(JSON.parse(saved))
    if (savedFavs) setFavorites(JSON.parse(savedFavs))
  }, [])

  useEffect(() => {
    localStorage.setItem("melodix-library", JSON.stringify(items.filter((item) => item.url)))
  }, [items])

  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2200) }
  const importFiles = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).filter((file) => file.type.startsWith("audio/") || file.type.startsWith("video/"))
    const imported = files.map((file) => ({ id: `${file.name}-${file.lastModified}`, name: file.name.replace(/\.[^/.]+$/, ""), url: URL.createObjectURL(file), kind: file.type.startsWith("video/") ? "video" as const : "audio" as const, size: file.size, addedAt: Date.now() }))
    if (imported.length) { setItems((current) => [...imported, ...current.filter((item) => item.url)]); notify(`${imported.length} média${imported.length > 1 ? "s" : ""} importé${imported.length > 1 ? "s" : ""}`) }
    event.target.value = ""
  }
  const play = (item: MediaItem) => { setActive(item); setPlaying(true); notify(`Lecture : ${item.name}`) }
  const toggleFavorite = (item: MediaItem) => {
    const next = favorites.includes(item.id) ? favorites.filter((id) => id !== item.id) : [...favorites, item.id]
    setFavorites(next); localStorage.setItem("melodix-favorites", JSON.stringify(next)); notify(next.includes(item.id) ? "Ajouté aux favoris" : "Retiré des favoris")
  }
  const filtered = useMemo(() => items.filter((item) => item.name.toLowerCase().includes(query.toLowerCase())), [items, query])
  const audio = filtered.filter((item) => item.kind === "audio")
  const videos = filtered.filter((item) => item.kind === "video")
  const shown = section === "videos" ? videos : section === "favorites" ? filtered.filter((item) => favorites.includes(item.id)) : section === "library" ? filtered : audio

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="app-logo"><span className="logo-mark">M</span><span>melodix</span></div>
      <label className="import-button"><input type="file" accept="audio/*,video/*" multiple onChange={importFiles} />＋ Importer des fichiers</label>
      <label className="import-button folder"><input type="file" accept="audio/*,video/*" multiple {...({ webkitdirectory: "" } as object)} onChange={importFiles} />▣ Importer un dossier</label>
      <nav className="side-nav" aria-label="Navigation principale">
        {([["Accueil", "home"], ["Ma bibliothèque", "library"], ["Vidéos", "videos"], ["Favoris", "favorites"], ["Réglages", "settings"]] as [string, typeof section][]).map(([label, value]) => <button key={value} className={section === value ? "active" : ""} onClick={() => setSection(value)}>{label}</button>)}
      </nav>
      <div className="sidebar-foot">100% gratuit<br /><span>Vos fichiers restent sur cet appareil.</span></div>
    </aside>
    <main className="main-content">
      <header className="topbar"><div className="search-box"><span>⌕</span><input aria-label="Rechercher dans la bibliothèque" placeholder="Rechercher musique, vidéo..." value={query} onChange={(event) => setQuery(event.target.value)} /></div><a href="/auth/login" className="profile-chip">Compte</a></header>
      {section === "settings" ? <Settings /> : section === "home" ? <Home audio={audio} videos={videos} play={play} importFiles={importFiles} /> : <MediaSection section={section} items={shown} play={play} favorites={favorites} toggleFavorite={toggleFavorite} />}
    </main>
    {active && <Player item={active} playing={playing} setPlaying={setPlaying} audioRef={audioRef} videoRef={videoRef} onClose={() => { setPlaying(false); setActive(null) }} />}
    {toast && <div className="toast" role="status">{toast}</div>}
  </div>
}

function Home({ audio, videos, play, importFiles }: { audio: MediaItem[]; videos: MediaItem[]; play: (item: MediaItem) => void; importFiles: (event: ChangeEvent<HTMLInputElement>) => void }) {
  return <div className="content-wrap"><div className="page-header"><div><p className="eyebrow">VOTRE ESPACE LOCAL</p><h1>Bonjour, mélomane.</h1><p className="muted">Importez vos fichiers et écoutez-les sans compte, sans abonnement.</p></div><label className="primary-action"><input type="file" accept="audio/*,video/*" multiple onChange={importFiles} />＋ Ajouter des médias</label></div><section className="hero-card"><div><span className="hero-kicker">LECTEUR LOCAL</span><h2>Votre musique.<br />Votre appareil.</h2><p>Audio et vidéo, réunis dans une bibliothèque rapide et privée.</p></div><div className="hero-disc">M</div></section><section className="section-head"><h2>Ajouts récents</h2><span>{audio.length} titres audio</span></section>{audio.length > 0 && audio[0].url ? <div className="media-grid">{audio.slice(0, 4).map((item) => <MediaCard key={item.id} item={item} play={play} />)}</div> : <Empty title="Votre bibliothèque est vide" text="Importez des fichiers audio ou un dossier pour commencer." /> }<section className="section-head"><h2>Vidéos</h2><span>{videos.length} vidéos</span></section><div className="media-grid">{videos.slice(0, 3).map((item) => <MediaCard key={item.id} item={item} play={play} />)}{!videos.length && <Empty title="Aucune vidéo importée" text="Vos vidéos locales apparaîtront ici." />}</div></div>
}

function MediaSection({ section, items, play, favorites, toggleFavorite }: { section: string; items: MediaItem[]; play: (item: MediaItem) => void; favorites: string[]; toggleFavorite: (item: MediaItem) => void }) {
  const title = section === "videos" ? "Vidéos" : section === "favorites" ? "Favoris" : "Ma bibliothèque"
  return <div className="content-wrap"><div className="page-header"><div><p className="eyebrow">BIBLIOTHÈQUE</p><h1>{title}</h1><p className="muted">{items.length} élément{items.length > 1 ? "s" : ""} disponible{items.length > 1 ? "s" : ""} sur cet appareil.</p></div></div>{items.length ? <div className="media-grid">{items.map((item) => <MediaCard key={item.id} item={item} play={play} favorite={favorites.includes(item.id)} onFavorite={toggleFavorite} />)}</div> : <Empty title="Rien à afficher" text="Importez un fichier audio ou vidéo depuis le bouton à gauche." />}</div>
}

function MediaCard({ item, play, favorite, onFavorite }: { item: MediaItem; play: (item: MediaItem) => void; favorite?: boolean; onFavorite?: (item: MediaItem) => void }) { return <article className={`media-card ${item.kind}`}><button className="artwork" onClick={() => play(item)} aria-label={`Lire ${item.name}`}><span>{item.kind === "video" ? "▶" : "♫"}</span></button><div className="media-info"><button onClick={() => play(item)}><strong>{item.name}</strong><small>{item.kind === "video" ? "Vidéo locale" : "Audio local"} · {formatBytes(item.size)}</small></button>{onFavorite && <button className={`heart ${favorite ? "liked" : ""}`} onClick={() => onFavorite(item)} aria-label="Ajouter aux favoris">♥</button>}</div></article> }
function Empty({ title, text }: { title: string; text: string }) { return <div className="empty-state"><span>♫</span><h2>{title}</h2><p>{text}</p></div> }
function Player({ item, playing, setPlaying, audioRef, videoRef, onClose }: { item: MediaItem; playing: boolean; setPlaying: (value: boolean) => void; audioRef: RefObject<HTMLAudioElement | null>; videoRef: RefObject<HTMLVideoElement | null>; onClose: () => void }) { useEffect(() => { const media = item.kind === "audio" ? audioRef.current : videoRef.current; if (!media) return; if (playing) void media.play().catch(() => setPlaying(false)); else media.pause() }, [item, playing, audioRef, videoRef, setPlaying]); return <div className={`player-dock ${item.kind === "video" ? "video-player" : ""}`}>{item.kind === "video" ? <video ref={videoRef} src={item.url} controls playsInline /> : <audio ref={audioRef} src={item.url} controls /> }<div className="player-meta"><span className="mini-art">{item.kind === "video" ? "▶" : "♫"}</span><div><strong>{item.name}</strong><small>{item.kind === "video" ? "Vidéo locale" : "Audio local"}</small></div><button onClick={() => setPlaying(!playing)} aria-label={playing ? "Pause" : "Lecture"}>{playing ? "Ⅱ" : "▶"}</button><button onClick={onClose} aria-label="Fermer le lecteur">×</button></div></div> }
function Settings() { return <div className="content-wrap"><div className="page-header"><div><p className="eyebrow">PRÉFÉRENCES</p><h1>Réglages</h1><p className="muted">Melodix est gratuit et local-first.</p></div></div><div className="settings-grid"><div className="settings-card"><h2>Lecture</h2><p>Utilisez les contrôles natifs audio et vidéo pour le volume, la vitesse, la qualité et le plein écran.</p></div><div className="settings-card"><h2>Confidentialité</h2><p>Les fichiers importés restent dans la mémoire de votre navigateur et sur cet appareil.</p></div></div></div> }
