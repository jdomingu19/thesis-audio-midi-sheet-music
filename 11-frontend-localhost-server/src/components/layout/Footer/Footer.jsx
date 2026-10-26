// thesis-audio-midi-sheet-music
// @jdomingu19
// Footer.jsx

import { Music4 } from "lucide-react";
import clsx from "clsx";
import styles from "./Footer.module.css";
import { AUTHOR_NAME, AUTHOR_HANDLE, SOCIAL_LINKS } from "@/data/socialLinks";

const STACK = ["React", "Vite", "Tone.js", "VexFlow", "Basic Pitch"];

/**
 * Footer — pie informativo al final del scroll de la página: descripción del
 * proyecto, tecnologías, redes del autor y firma. AppShell lo envuelve en <footer>.
 */
function Footer({ className, ...rest }) {
  const year = new Date().getFullYear();

  return (
    <div className={clsx(styles.root, className)} {...rest}>
      <div className={styles.inner}>
        <section className={styles.about} aria-label="Acerca del proyecto">
          <div className={styles.brand}>
            <span className={styles.logo} aria-hidden="true">
              <Music4 size={16} />
            </span>
            <span className={styles.name}>Armonía</span>
          </div>
          <p className={styles.description}>
            Transcripción automática de audio a MIDI y partitura, con piano roll
            sincronizado. Proyecto de grado en Music Information Retrieval
            (MIR).
          </p>
        </section>

        <section className={styles.tech} aria-label="Tecnología">
          <h2 className={styles.heading}>Tecnología</h2>
          <ul className={styles.stack}>
            {STACK.map((item) => (
              <li key={item} className={styles.stackItem}>
                {item}
              </li>
            ))}
          </ul>
          <p className={styles.credits}>
            Salamander Grand Piano (Alexander Holm);
          </p>
          <p className={styles.credits}>
            tonejs-instruments (N. P. Brosowsky).
          </p>
        </section>

        <section className={styles.connect} aria-label="Redes del autor">
          <h2 className={styles.heading}>Conectemos</h2>
          <ul className={styles.social}>
            {SOCIAL_LINKS.map(({ id, label, href, icon: Icon }) => (
              <li key={id}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label={`${label} de ${AUTHOR_HANDLE}`}
                  title={label}
                >
                  <Icon size={18} />
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className={styles.legal}>
        <span>
          © {year} {AUTHOR_NAME} ·{" "}
          <a
            href="https://github.com/jdomingu19"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.handle}
          >
            {AUTHOR_HANDLE}
          </a>
        </span>
      </div>
    </div>
  );
}

export default Footer;
