import { useState, useRef, useCallback } from 'react';
import {
  processAudioFile,
  probeAudioDuration,
  generateWaveformBars,
  isFormatSupported,
} from '../utils/audioProcessing';

export function useAudioManager() {
  const [audioFiles, setAudioFiles]   = useState([]);
  const [playingId, setPlayingId]     = useState(null);
  const [modalState, setModalState]   = useState({ isOpen: false, audioId: null });

  const audioRefs = useRef({});

  // ── Helpers ───────────────────────────────────────────────────────
  const updateFile = useCallback((id, patch) => {
    setAudioFiles(prev =>
      prev.map(f => (f.id === id ? { ...f, ...patch } : f))
    );
  }, []);

  const stopCurrent = useCallback(() => {
    if (playingId && audioRefs.current[playingId]) {
      audioRefs.current[playingId].pause();
      audioRefs.current[playingId].currentTime = 0;
    }
    setPlayingId(null);
  }, [playingId]);

  // ── Upload ────────────────────────────────────────────────────────
  const handleUpload = useCallback(async (files) => {
    const validFiles = Array.from(files).filter(isFormatSupported);
    if (!validFiles.length) return;

    const newItems = await Promise.all(
      validFiles.map(async (file) => {
        const id  = crypto.randomUUID();
        const url = URL.createObjectURL(file);
        const duration = await probeAudioDuration(url);
        return {
          id,
          name:         file.name,
          size:         file.size,
          format:       file.name.split('.').pop().toUpperCase(),
          originalFile: file,
          originalUrl:  url,
          cleanedUrl:   null,
          cleanedBlob:  null,
          isCleaned:    false,
          isProcessing: false,
          processingStep: null,
          duration,
          waveformBars: generateWaveformBars(file.name),
        };
      })
    );

    setAudioFiles(prev => [...prev, ...newItems]);
  }, []);

  // ── Play / Pause ──────────────────────────────────────────────────
  const handlePlay = useCallback((id) => {
    if (playingId === id) {
      // Pause current
      audioRefs.current[id]?.pause();
      setPlayingId(null);
      return;
    }

    // Stop previously playing
    stopCurrent();

    const file = audioFiles.find(f => f.id === id);
    if (!file) return;

    const src = file.cleanedUrl || file.originalUrl;

    if (!audioRefs.current[id]) {
      const audio = new Audio(src);
      audio.onended = () => setPlayingId(null);
      audioRefs.current[id] = audio;
    } else {
      audioRefs.current[id].src = src;
    }

    audioRefs.current[id].play();
    setPlayingId(id);
  }, [audioFiles, playingId, stopCurrent]);

  // ── Download ──────────────────────────────────────────────────────
  const handleDownload = useCallback((id) => {
    const file = audioFiles.find(f => f.id === id);
    if (!file) return;

    const url  = file.cleanedUrl || file.originalUrl;
    const name = file.cleanedUrl
      ? file.name.replace(/(\.[^.]+)$/, '_cleaned$1').replace(/\.[^.]+$/, '.wav')
      : file.name;

    const a = document.createElement('a');
    a.href = url;
    a.download = name;
    a.click();
  }, [audioFiles]);

  // ── Open Clean Modal ──────────────────────────────────────────────
  const handleOpenClean = useCallback((id) => {
    setModalState({ isOpen: true, audioId: id });
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalState({ isOpen: false, audioId: null });
  }, []);

  // ── Process Audio ─────────────────────────────────────────────────
  const handleConfirmClean = useCallback(async (options) => {
    const { audioId } = modalState;
    if (!audioId) return;

    const file = audioFiles.find(f => f.id === audioId);
    if (!file) return;

    setModalState({ isOpen: false, audioId: null });
    updateFile(audioId, { isProcessing: true, processingStep: 'Starting…' });

    try {
      const blob = await processAudioFile(
        file.originalFile,
        options,
        (step) => updateFile(audioId, { processingStep: step })
      );

      // Revoke old cleaned URL if one existed
      if (file.cleanedUrl) URL.revokeObjectURL(file.cleanedUrl);

      const cleanedUrl = URL.createObjectURL(blob);
      const duration   = await probeAudioDuration(cleanedUrl);

      // Reset audio element so next play uses cleaned version
      if (audioRefs.current[audioId]) {
        audioRefs.current[audioId].src = cleanedUrl;
      }

      updateFile(audioId, {
        isProcessing:  false,
        processingStep: null,
        isCleaned:     true,
        cleanedBlob:   blob,
        cleanedUrl,
        duration,
      });
    } catch (err) {
      console.error('Audio processing failed:', err);
      updateFile(audioId, {
        isProcessing:  false,
        processingStep: null,
      });
    }
  }, [audioFiles, modalState, updateFile]);

  // ── Delete ────────────────────────────────────────────────────────
  const handleDelete = useCallback((id) => {
    if (playingId === id) stopCurrent();

    setAudioFiles(prev => {
      const file = prev.find(f => f.id === id);
      if (file) {
        URL.revokeObjectURL(file.originalUrl);
        if (file.cleanedUrl) URL.revokeObjectURL(file.cleanedUrl);
      }
      return prev.filter(f => f.id !== id);
    });

    delete audioRefs.current[id];
  }, [playingId, stopCurrent]);

  return {
    audioFiles,
    playingId,
    modalState,
    handleUpload,
    handlePlay,
    handleDownload,
    handleOpenClean,
    handleCloseModal,
    handleConfirmClean,
    handleDelete,
  };
}
