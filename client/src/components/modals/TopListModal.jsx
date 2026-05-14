import React, { useEffect } from 'react'
import './TopListModal.css'

const TopListModal = ({ title, items, onClose }) => {
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const list = items.slice(0, 10)

  return (
    <div className="tlmodal-overlay" onClick={onClose}>
      <div className="tlmodal" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="tlmodal-header">
          <h2 className="tlmodal-title">{title}</h2>
          <button className="tlmodal-close" onClick={onClose}>✕</button>
        </div>

        {/* List */}
        <div className="tlmodal-list">
          {list.length === 0 && (
            <p className="tlmodal-empty">No data available.</p>
          )}
          {list.map((item, i) => (
            <div key={i} className="tlmodal-item">
              <div className="tlmodal-rank-wrapper">
                <span className={`tlmodal-rank ${i < 3 ? 'top' : ''}`}>
                  {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
                </span>
              </div>
              <div className="tlmodal-item-info">
                <span className="tlmodal-item-name">{item.name}</span>
                {item.sub && (
                  <span className="tlmodal-item-sub">{item.sub}</span>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  )
}

export default TopListModal