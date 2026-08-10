// thesis-audio-midi-sheet-music
// @jdomingu19
// Tooltip.jsx

import { useId, useState, cloneElement } from "react";
import clsx from "clsx";
import styles from "./Tooltip.module.css";

/**
 * Tooltip — envoltura que muestra un mensaje flotante al hacer hover/focus.
 *
 * @param {string} content - texto del tooltip
 * @param {'top'|'bottom'|'left'|'right'} placement
 * @param {React.ReactElement} children - único elemento hijo que recibe los handlers
 */
function Tooltip({ content, placement = "top", children }) {
  const [isVisible, setIsVisible] = useState(false);
  const tooltipId = useId();

  const show = () => setIsVisible(true);
  const hide = () => setIsVisible(false);

  const trigger = cloneElement(children, {
    "aria-describedby": isVisible ? tooltipId : undefined,
    onMouseEnter: show,
    onMouseLeave: hide,
    onFocus: show,
    onBlur: hide,
  });

  return (
    <span className={styles.wrapper}>
      {trigger}
      {isVisible && content && (
        <span
          id={tooltipId}
          role="tooltip"
          className={clsx(styles.tooltip, styles[`placement-${placement}`])}
        >
          {content}
        </span>
      )}
    </span>
  );
}

export default Tooltip;
