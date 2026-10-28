// thesis-audio-midi-sheet-music
// @jdomingu19
// SheetMusicPageControls.jsx

import { ChevronLeft, ChevronRight } from "lucide-react";
import clsx from "clsx";
import styles from "./SheetMusicPageControls.module.css";
import IconButton from "@/components/ui/IconButton/IconButton";

/**
 * SheetMusicPageControls — paginación cuando la partitura ocupa varias
 * páginas. Se oculta (retorna null) cuando totalPages <= 1.
 *
 * @param {number} currentPage - 1-indexed
 * @param {number} totalPages
 * @param {(page: number) => void} onPageChange
 */
function SheetMusicPageControls({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  className,
  ...rest
}) {
  if (totalPages <= 1) return null;

  const isFirstPage = currentPage <= 1;
  const isLastPage = currentPage >= totalPages;

  const handlePrevious = () => {
    if (!isFirstPage) onPageChange?.(currentPage - 1);
  };

  const handleNext = () => {
    if (!isLastPage) onPageChange?.(currentPage + 1);
  };

  return (
    <div
      className={clsx(styles.pageControls, className)}
      role="group"
      aria-label="Paginación de partitura"
      {...rest}
    >
      <IconButton
        icon={<ChevronLeft size={16} />}
        label="Página anterior"
        size="sm"
        variant="ghost"
        disabled={isFirstPage}
        onClick={handlePrevious}
      />

      <span className={styles.pageIndicator}>
        Página {currentPage} de {totalPages}
      </span>

      <IconButton
        icon={<ChevronRight size={16} />}
        label="Página siguiente"
        size="sm"
        variant="ghost"
        disabled={isLastPage}
        onClick={handleNext}
      />
    </div>
  );
}

export default SheetMusicPageControls;
