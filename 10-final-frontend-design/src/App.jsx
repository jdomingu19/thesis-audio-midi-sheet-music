// thesis-audio-midi-sheet-music
// @jdomingu19
// App.jsx

import { useMemo, useRef, useState, useEffect } from "react";
import { AudioWaveform, Music4 } from "lucide-react";

import AppShell from "@/components/layout/AppShell/AppShell";
import Topbar from "@/components/layout/Topbar/Topbar";
import PanelSection from "@/components/layout/PanelSection/PanelSection";
import ViewerPanel from "@/components/layout/ViewerPanel/ViewerPanel";

import UploadDropzone from "@/components/audio-input/UploadDropzone/UploadDropzone";
import RecordControl from "@/components/audio-input/RecordControl/RecordControl";
import RecordingWaveform from "@/components/audio-input/RecordingWaveform/RecordingWaveform";
import RecordingTimer from "@/components/audio-input/RecordingTimer/RecordingTimer";

import AudioList from "@/components/audio-library/AudioList/AudioList";

import PlaybackTransport from "@/components/playback/PlaybackTransport/PlaybackTransport";
import VolumeControl from "@/components/playback/VolumeControl/VolumeControl";

import DownloadBar from "@/components/downloads/DownloadBar/DownloadBar";

import PianoRollView from "@/components/piano-roll/PianoRollView/PianoRollView";
import SheetMusicView from "@/components/sheet-music/SheetMusicView/SheetMusicView";

import audioLibraryMock from "@/mock/audioLibrary.mock";
import pianoRollMock from "@/mock/pianoRoll.mock";
import sheetMusicMock, { getMeasuresByPage } from "@/mock/sheetMusic.mock";

import styles from "./App.module.css";

/**
 * App — composición raíz del frontend final de Armonía.
 *
 * Esta fase conecta los componentes visuales entre sí usando estado local
 * de React y los datos mock ya definidos en src/mock/. No hay fetch,
 * backend, MediaRecorder ni Tone.js/VexFlow reales — el timer de
 * grabación y el playhead de reproducción son simulaciones puramente
 * visuales para poblar los estados de interfaz descritos en la guía.
 */
function App() {
  // ── Biblioteca de audios ────────────────────────────────────────────
  const [audioItems, setAudioItems] = useState(audioLibraryMock);
  const [selectedAudioId, setSelectedAudioId] = useState(
    audioLibraryMock[0]?.id ?? null,
  );

  const selectedAudio = useMemo(
    () => audioItems.find((item) => item.id === selectedAudioId) ?? null,
    [audioItems, selectedAudioId],
  );
  const isSelectedReady = selectedAudio?.status === "ready";

  // ── Upload (solo lectura de metadata del File, sin subida real) ────
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const handleFilesSelected = (fileList) => {
    const file = fileList[0];
    if (!file) return;

    const isAudio = file.type.startsWith("audio/");
    if (!isAudio) {
      setUploadError("Solo se aceptan archivos de audio (MP3, WAV, M4A).");
      setSelectedFile(null);
      return;
    }

    setUploadError(null);
    setSelectedFile({
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
    });

    // Mock: agrega el archivo como nueva entrada "queued" a la biblioteca.
    const newItem = {
      id: `audio-${Date.now()}`,
      name: file.name,
      duration: "--:--",
      timestamp: "justo ahora",
      status: "queued",
      source: "uploaded",
      isNew: true,
    };
    setAudioItems((previous) => [newItem, ...previous]);
    setSelectedAudioId(newItem.id);
  };

  // ── Grabación (timer simulado, sin MediaRecorder real) ─────────────
  const [recordState, setRecordState] = useState("idle"); // idle | recording | stopped
  const [recordSeconds, setRecordSeconds] = useState(0);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (recordState === "recording") {
      intervalRef.current = setInterval(() => {
        setRecordSeconds((previous) => previous + 1);
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }
    return () => clearInterval(intervalRef.current);
  }, [recordState]);

  const handleToggleRecord = () => {
    if (recordState === "idle") {
      setRecordSeconds(0);
      setRecordState("recording");
      return;
    }
    if (recordState === "recording") {
      setRecordState("stopped");

      const newItem = {
        id: `audio-${Date.now()}`,
        name: `grabacion-${new Date().toLocaleTimeString("es-CO", {
          hour: "2-digit",
          minute: "2-digit",
        })}.webm`,
        duration: formatSeconds(recordSeconds),
        timestamp: "justo ahora",
        status: "queued",
        source: "recorded",
        isNew: true,
      };
      setAudioItems((previous) => [newItem, ...previous]);
      setSelectedAudioId(newItem.id);
      return;
    }
    setRecordState("idle");
  };

  // ── Playback (mock, sin Tone.js real) ───────────────────────────────
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);
  const mockDuration = 180; // 3:00, duración mock del audio seleccionado

  useEffect(() => {
    if (!isPlaying) return undefined;
    const playbackInterval = setInterval(() => {
      setCurrentTime((previous) => {
        if (previous >= mockDuration) {
          setIsPlaying(false);
          return 0;
        }
        return previous + 1;
      });
    }, 1000);
    return () => clearInterval(playbackInterval);
  }, [isPlaying]);

  const handlePlayPause = () => {
    if (!isSelectedReady) return;
    setIsPlaying((previous) => !previous);
  };

  // ── Viewer (Piano Roll / Sheet Music) ───────────────────────────────
  const [activeTab, setActiveTab] = useState("piano-roll");
  const [zoomLevel, setZoomLevel] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  const playheadPosition = mockDuration > 0 ? currentTime / mockDuration : 0;

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => setIsExporting(false), 1200); // mock de exportación
  };

  // ── Downloads (mock) ────────────────────────────────────────────────
  const [isDownloadingMidi, setIsDownloadingMidi] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const handleDownload = (setLoading) => {
    setLoading(true);
    setTimeout(() => setLoading(false), 1000); // mock de descarga
  };

  return (
    <AppShell
      topbar={
        <Topbar
          logo={<Music4 size={18} />}
          title="Armonía"
          subtitle="Audio a Partitura"
        />
      }
      inputPanel={
        <>
          <PanelSection
            title="Entrada de audio"
            icon={<AudioWaveform size={16} />}
          >
            <div className={styles.inputStack}>
              <UploadDropzone
                selectedFile={selectedFile}
                errorMessage={uploadError}
                onFilesSelected={handleFilesSelected}
              />

              <div className={styles.recordStack}>
                <RecordControl
                  state={recordState}
                  onToggle={handleToggleRecord}
                />
                <RecordingWaveform isActive={recordState === "recording"} />
                <RecordingTimer
                  seconds={recordSeconds}
                  isActive={recordState === "recording"}
                />
              </div>
            </div>
          </PanelSection>

          <PanelSection
            title="Biblioteca"
            noPadding
            className={styles.libraryPanel}
          >
            <AudioList
              items={audioItems}
              selectedId={selectedAudioId}
              onSelect={setSelectedAudioId}
            />
          </PanelSection>
        </>
      }
      viewerPanel={
        <ViewerPanel
          hasSelection={Boolean(selectedAudio)}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          pianoRollContent={
            <PianoRollView
              notes={pianoRollMock.notes}
              measures={pianoRollMock.measures}
              lowMidi={pianoRollMock.range.lowMidi}
              highMidi={pianoRollMock.range.highMidi}
              totalDuration={pianoRollMock.totalDuration}
              currentPosition={playheadPosition}
              isPlaying={isPlaying}
              activeMidiNotes={pianoRollMock.activeNotes}
              isEmpty={!isSelectedReady}
            />
          }
          sheetMusicContent={
            <SheetMusicView
              detectedKey={sheetMusicMock.detectedKey}
              zoomLevel={zoomLevel}
              onZoomChange={setZoomLevel}
              isExportDisabled={!isSelectedReady}
              isExporting={isExporting}
              onExport={handleExport}
              currentPage={currentPage}
              totalPages={sheetMusicMock.totalPages}
              onPageChange={setCurrentPage}
              isEmpty={!isSelectedReady}
              scoreContent={
                isSelectedReady ? (
                  <ScorePlaceholder measures={getMeasuresByPage(currentPage)} />
                ) : null
              }
            />
          }
        />
      }
      bottomBar={
        <div className={styles.bottomBarContent}>
          <PlaybackTransport
            isPlaying={isPlaying}
            currentTime={currentTime}
            duration={mockDuration}
            disabled={!isSelectedReady}
            onPlayPause={handlePlayPause}
            onSeek={setCurrentTime}
            onSkipBack={() =>
              setCurrentTime((previous) => Math.max(0, previous - 10))
            }
            onSkipForward={() =>
              setCurrentTime((previous) =>
                Math.min(mockDuration, previous + 10),
              )
            }
            trackName={selectedAudio?.name}
            className={styles.transport}
          />

          <VolumeControl
            volume={volume}
            isMuted={isMuted}
            disabled={!isSelectedReady}
            onChange={setVolume}
            onToggleMute={() => setIsMuted((previous) => !previous)}
          />

          <DownloadBar
            isMidiReady={isSelectedReady}
            isPdfReady={isSelectedReady}
            isMidiDownloading={isDownloadingMidi}
            isPdfDownloading={isDownloadingPdf}
            onDownloadMidi={() => handleDownload(setIsDownloadingMidi)}
            onDownloadPdf={() => handleDownload(setIsDownloadingPdf)}
          />
        </div>
      }
    />
  );
}

/**
 * ScorePlaceholder — placeholder visual mínimo de partitura, mientras
 * VexFlow real no está conectado (sección 12: fuera de alcance en esta
 * fase). Representa cada compás como un bloque con su cantidad de notas.
 */
function ScorePlaceholder({ measures }) {
  return (
    <div className={styles.scorePlaceholder}>
      {measures.map((measure) => (
        <div key={measure.id} className={styles.measureBlock}>
          <span className={styles.measureClef}>
            {measure.clef === "treble" ? "𝄞" : "𝄢"}
          </span>
          {measure.notes.map((note, index) => (
            <span
              key={`${measure.id}-${index}`}
              className={styles.notePlaceholder}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

function formatSeconds(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export default App;
