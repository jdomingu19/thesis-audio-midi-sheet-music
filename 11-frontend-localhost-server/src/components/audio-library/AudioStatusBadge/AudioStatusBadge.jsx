// thesis-audio-midi-sheet-music
// @jdomingu19
// AudioStatusBadge.jsx

import { CheckCircle2, Loader2, Clock, AlertTriangle } from "lucide-react";
import clsx from "clsx";
import styles from "./AudioStatusBadge.module.css";
import Badge from "@/components/ui/Badge/Badge";

const STATUS_CONFIG = {
  ready: {
    label: "Listo",
    icon: <CheckCircle2 size={12} />,
  },
  processing: {
    label: "Procesando",
    icon: <Loader2 size={12} className="icon-spin" />,
  },
  queued: {
    label: "En cola",
    icon: <Clock size={12} />,
  },
  error: {
    label: "Error",
    icon: <AlertTriangle size={12} />,
  },
};

/**
 * AudioStatusBadge — badge de estado de procesamiento de un audio.
 * Envoltura semántica sobre <Badge> con label e ícono predefinidos por
 * estado, más la animación `scan` propia del estado "processing".
 *
 * @param {'ready'|'processing'|'queued'|'error'} status
 */
function AudioStatusBadge({ status = "queued", className, ...rest }) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.queued;
  const isProcessing = status === "processing";

  return (
    <span className={clsx(styles.wrapper, isProcessing && styles.scanning)}>
      <Badge status={status} icon={config.icon} className={className} {...rest}>
        {config.label}
      </Badge>
    </span>
  );
}

export default AudioStatusBadge;
