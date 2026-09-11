// thesis-audio-midi-sheet-music
// @jdomingu19
// Modal.jsx

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import clsx from "clsx";
import styles from "./Modal.module.css";
import IconButton from "@/components/ui/IconButton/IconButton";

/**
 * Modal — diálogo modal genérico, renderizado en portal sobre <body>.
 *
 * @param {boolean} isOpen
 * @param {() => void} onClose
 * @param {string} title
 * @param {React.ReactNode} footer - contenido opcional (ej. botones de acción)
 * @param {'sm'|'md'|'lg'} size
 * @param {boolean} closeOnOverlayClick
 */
function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  closeOnOverlayClick = true,
  className,
}) {
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className={styles.overlay}
      onClick={closeOnOverlayClick ? onClose : undefined}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={clsx(styles.modal, styles[`size-${size}`], className)}
        onClick={(event) => event.stopPropagation()}
      >
        <div className={styles.header}>
          {title && <h2 className={styles.title}>{title}</h2>}
          <IconButton
            icon={<X size={18} />}
            label="Cerrar"
            variant="ghost"
            size="sm"
            onClick={onClose}
            className={styles.closeButton}
          />
        </div>

        <div className={styles.body}>{children}</div>

        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </div>,
    document.body,
  );
}

export default Modal;
