import { useRef, useState } from 'react'
import s from './Uploader.module.css'

export default function Uploader({ onFile }) {
  const ref = useRef()
  const [drag, setDrag] = useState(false)

  function pick(e) {
    const file = e.target.files?.[0] || e.dataTransfer?.files?.[0]
    if (file) onFile(file)
  }

  return (
    <div
      className={`${s.zone} ${drag ? s.drag : ''}`}
      onClick={() => ref.current.click()}
      onDragOver={e => { e.preventDefault(); setDrag(true) }}
      onDragLeave={() => setDrag(false)}
      onDrop={e => { e.preventDefault(); setDrag(false); pick(e) }}
    >
      <input ref={ref} type="file" accept=".mid,.midi" style={{ display: 'none' }} onChange={pick} />
      <div className={s.icon}>♬</div>
      <p className={s.label}>Drop a <strong>.mid</strong> file here or click to browse</p>
      <p className={s.hint}>Parsed entirely in the browser — nothing leaves your machine</p>
    </div>
  )
}
