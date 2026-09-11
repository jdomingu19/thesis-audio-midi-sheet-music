// thesis-audio-midi-sheet-music
// @jdomingu19
// App.jsx

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AudioWaveform, Music4 } from "lucide-react";
import * as Tone from "tone";

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
import VexFlowScore from "@/components/sheet-music/VexFlowScore/VexFlowScore";

import Badge from "@/components/ui/Badge/Badge";

import { useAudioRecorder } from "@/hooks/useAudioRecorder";
import { useTonePlayer } from "@/hooks/useTonePlayer";

import {
  convertAudioToMidi,
  checkBackendHealth,
  ConvertServiceError,
} from "@/services/convertService";

import {
  getAudioDuration,
  formatDuration,
  formatFileSize,
  getFileExtension,
} from "@/utils/audioUtils";
import {
  parseMidiBlob,
  flattenTrackNotes,
  getMidiRange,
  getDuration,
  toPianoRollNotes,
  buildPianoRollMeasures,
  formatKeyLabel,
  formatMidiFilename,
} from "@/utils/midiAdapters";
import { jsonToVexflowMeasures } from "@/utils/jsonToVexflow";
import { downloadSheetMusicPdf } from "@/utils/pdfExport";

import styles from "./App.module.css";

// Debe coincidir con ALLOWED_EXTENSIONS de 07-basic-pitch-server/app/config.py
const ACCEPTED_EXTENSIONS = ["wav", "mp3", "m4a", "flac", "ogg", "webm"];
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
const EMPTY_NOTES = [];

/**
 * App — composición raíz de Armonía conectada al backend local
 * (07-basic-pitch-server) y a las librerías reales de reproducción
 * (Tone.js) y notación (VexFlow).
 */
function App() {
  // ── Biblioteca de audios ────────────────────────────────────────────
  const [audioItems, setAudioItems] = useState([]);
  const [selectedAudioId, setSelectedAudioId] = useState(null);

  const selectedAudio = useMemo(
    () => audioItems.find((item) => item.id === selectedAudioId) ?? null,
    [audioItems, selectedAudioId],
  );
  const isSelectedReady = selectedAudio?.status === "ready";

  // ── Estado del servidor local (health check) ────────────────────────
  const [backendOnline, setBackendOnline] = useState(null); // null = verificando
  useEffect(() => {
    let cancelled = false;
    checkBackendHealth().then((online) => {
      if (!cancelled) setBackendOnline(online);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Conversión audio → MIDI vía localhost:8000 ──────────────────────
  const convertItem = useCallback(async (id, blob, filename) => {
    setAudioItems((previous) =>
      previous.map((item) =>
        item.id === id
          ? { ...item, status: "processing", errorMessage: null }
          : item,
      ),
    );

    try {
      const midiBlob = await convertAudioToMidi(blob, filename);
      const midiJson = await parseMidiBlob(midiBlob);

      const notes = flattenTrackNotes(midiJson);
      const { min: lowMidi, max: highMidi } = getMidiRange(notes);
      const totalDuration = getDuration(notes);
      const pianoRollNotes = toPianoRollNotes(notes);
      const measures = buildPianoRollMeasures(midiJson, totalDuration);
      const vexScore = jsonToVexflowMeasures(midiJson, 0);
      const midiUrl = URL.createObjectURL(midiBlob);
      const midiFilename = formatMidiFilename(filename);

      setAudioItems((previous) =>
        previous.map((item) =>
          item.id === id
            ? {
                ...item,
                status: "ready",
                duration: totalDuration
                  ? formatDuration(totalDuration)
                  : item.duration,
                midiBlob,
                midiUrl,
                midiFilename,
                notes,
                lowMidi,
                highMidi,
                totalDuration,
                pianoRollNotes,
                measures,
                vexScore,
              }
            : item,
        ),
      );
    } catch (err) {
      const message =
        err instanceof ConvertServiceError
          ? err.message
          : "Error inesperado al convertir el audio.";
      setAudioItems((previous) =>
        previous.map((item) =>
          item.id === id
            ? { ...item, status: "error", errorMessage: message }
            : item,
        ),
      );
    }
  }, []);

  // ── Upload real de audio ─────────────────────────────────────────────
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadError, setUploadError] = useState(null);

  const handleFilesSelected = async (fileList) => {
    const file = fileList[0];
    if (!file) return;

    const extension = getFileExtension(file.name);
    if (!ACCEPTED_EXTENSIONS.includes(extension)) {
      setUploadError(
        `Formato no soportado (.${extension}). Usa: ${ACCEPTED_EXTENSIONS.join(", ")}.`,
      );
      setSelectedFile(null);
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      setUploadError("El archivo excede el tamaño máximo de 25 MB.");
      setSelectedFile(null);
      return;
    }

    setUploadError(null);
    setSelectedFile({ name: file.name, size: formatFileSize(file.size) });

    let durationSeconds = null;
    try {
      durationSeconds = await getAudioDuration(file);
    } catch {
      durationSeconds = null;
    }

    const newItem = {
      id: `audio-${Date.now()}`,
      name: file.name,
      duration:
        durationSeconds != null ? formatDuration(durationSeconds) : "--:--",
      timestamp: "justo ahora",
      status: "queued",
      source: "uploaded",
      isNew: true,
      errorMessage: null,
    };

    setAudioItems((previous) => [newItem, ...previous]);
    setSelectedAudioId(newItem.id);
    convertItem(newItem.id, file, file.name);
  };

  // ── Grabación real (MediaRecorder) ───────────────────────────────────
  const recorder = useAudioRecorder();

  const handleToggleRecord = async () => {
    if (recorder.state === "idle") {
      await recorder.start();
      return;
    }
    if (recorder.state === "recording") {
      const result = await recorder.stop();
      if (!result) return;

      const { blob, mimeType, durationSeconds } = result;
      const extension = mimeType.includes("ogg") ? "ogg" : "webm";
      const name = `grabacion-${Date.now()}.${extension}`;

      const newItem = {
        id: `audio-${Date.now()}`,
        name,
        duration: formatDuration(durationSeconds),
        timestamp: "justo ahora",
        status: "queued",
        source: "recorded",
        isNew: true,
        errorMessage: null,
      };

      setAudioItems((previous) => [newItem, ...previous]);
      setSelectedAudioId(newItem.id);
      convertItem(newItem.id, blob, name);
      return;
    }
    recorder.reset();
  };

  // ── Reproducción real (Tone.js) ──────────────────────────────────────
  const { isPlaying, currentTime, duration, play, pause, seek } = useTonePlayer(
    selectedAudio?.notes ?? EMPTY_NOTES,
  );

  const [volume, setVolume] = useState(75);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    Tone.Destination.volume.value = isMuted
      ? -Infinity
      : Tone.gainToDb(Math.max(volume, 1) / 100);
  }, [volume, isMuted]);

  const handlePlayPause = () => {
    if (!isSelectedReady) return;
    if (isPlaying) pause();
    else play();
  };

  const activeMidiNotes = useMemo(() => {
    const notes = selectedAudio?.notes ?? EMPTY_NOTES;
    const active = new Set();
    notes.forEach((note) => {
      if (
        note.time <= currentTime &&
        currentTime <= note.time + note.duration
      ) {
        active.add(note.midi);
      }
    });
    return Array.from(active);
  }, [selectedAudio, currentTime]);

  const playheadPosition = duration > 0 ? currentTime / duration : 0;

  // ── Viewer (Piano Roll / Sheet Music) ────────────────────────────────
  const [activeTab, setActiveTab] = useState("piano-roll");
  const [zoomLevel, setZoomLevel] = useState(100);
  const scoreContainerRef = useRef(null);

  const detectedKeyLabel = selectedAudio?.vexScore?.keyInfo
    ? formatKeyLabel(selectedAudio.vexScore.keyInfo)
    : undefined;

  // ── Downloads reales (MIDI + PDF) ────────────────────────────────────
  const [isDownloadingMidi, setIsDownloadingMidi] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  const handleDownloadMidi = () => {
    if (!selectedAudio?.midiUrl) return;
    setIsDownloadingMidi(true);
    const link = document.createElement("a");
    link.href = selectedAudio.midiUrl;
    link.download = selectedAudio.midiFilename ?? "resultado.mid";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => setIsDownloadingMidi(false), 400);
  };

  const handleDownloadPdf = () => {
    if (!scoreContainerRef.current || !selectedAudio) return;
    setIsDownloadingPdf(true);
    downloadSheetMusicPdf(scoreContainerRef.current, selectedAudio.name);
    setTimeout(() => setIsDownloadingPdf(false), 400);
  };

  return (
    <AppShell
      topbar={
        <Topbar
          logo={<Music4 size={18} />}
          title="Armonía"
          subtitle="Audio a Partitura"
          actions={
            <Badge
              status={
                backendOnline
                  ? "ready"
                  : backendOnline === false
                    ? "error"
                    : "processing"
              }
              withDot
            >
              {backendOnline === null && "Verificando servidor…"}
              {backendOnline === true && "Servidor local conectado"}
              {backendOnline === false && "Servidor local no disponible"}
            </Badge>
          }
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
                  state={recorder.state}
                  onToggle={handleToggleRecord}
                />
                <RecordingWaveform isActive={recorder.state === "recording"} />
                <RecordingTimer
                  seconds={recorder.seconds}
                  isActive={recorder.state === "recording"}
                />
                {recorder.error && (
                  <p className={styles.recordError}>{recorder.error}</p>
                )}
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
              notes={selectedAudio?.pianoRollNotes ?? []}
              measures={selectedAudio?.measures ?? []}
              lowMidi={selectedAudio?.lowMidi}
              highMidi={selectedAudio?.highMidi}
              totalDuration={selectedAudio?.totalDuration ?? 16}
              currentPosition={playheadPosition}
              isPlaying={isPlaying}
              activeMidiNotes={activeMidiNotes}
              isEmpty={!isSelectedReady}
            />
          }
          sheetMusicContent={
            <SheetMusicView
              detectedKey={detectedKeyLabel}
              zoomLevel={zoomLevel}
              onZoomChange={setZoomLevel}
              isExportDisabled={!isSelectedReady}
              isExporting={isDownloadingPdf}
              onExport={handleDownloadPdf}
              currentPage={1}
              totalPages={1}
              onPageChange={() => {}}
              isEmpty={!isSelectedReady}
              scoreContent={
                isSelectedReady && selectedAudio?.vexScore ? (
                  <VexFlowScore
                    ref={scoreContainerRef}
                    measures={selectedAudio.vexScore.measures}
                    timeSignature={selectedAudio.vexScore.timeSignature}
                    keyInfo={selectedAudio.vexScore.keyInfo}
                  />
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
            duration={duration}
            disabled={!isSelectedReady}
            onPlayPause={handlePlayPause}
            onSeek={seek}
            onSkipBack={() => seek(Math.max(0, currentTime - 10))}
            onSkipForward={() => seek(Math.min(duration, currentTime + 10))}
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
            onDownloadMidi={handleDownloadMidi}
            onDownloadPdf={handleDownloadPdf}
          />
        </div>
      }
    />
  );
}

export default App;
