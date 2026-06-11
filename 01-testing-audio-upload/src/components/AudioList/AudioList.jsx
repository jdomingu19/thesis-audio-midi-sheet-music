import AudioItem from '../AudioItem/AudioItem'
import styles from './AudioList.module.css'

export default function AudioList({ files, onDelete, onClearAll }) {
  if (files.length === 0) {
    return (
      <section className={styles.emptySection}>
        <div className={styles.emptyIcon}>
          <EmptyIcon />
        </div>
        <p className={styles.emptyTitle}>Sin archivos cargados</p>
        <p className={styles.emptyText}>
          Sube tus primeros archivos de audio usando la zona de arriba.
        </p>
      </section>
    )
  }

  return (
    <section className={styles.section}>
      <div className={styles.listHeader}>
        <div className={styles.listMeta}>
          <h2 className={styles.listTitle}>Archivos de audio</h2>
          <span className={styles.count}>{files.length}</span>
        </div>
        <button
          className={styles.clearBtn}
          onClick={onClearAll}
          aria-label="Eliminar todos los archivos"
        >
          <TrashIcon />
          Limpiar todo
        </button>
      </div>

      <ul className={styles.list} role="list">
        {files.map((file, index) => (
          <li key={file.id} className={styles.listItem} style={{ '--index': index }}>
            <AudioItem file={file} onDelete={onDelete} />
          </li>
        ))}
      </ul>
    </section>
  )
}

function EmptyIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14H6L5 6" />
      <path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  )
}
