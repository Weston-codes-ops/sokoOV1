export default function Loading({ visible = true }) {
  return (
    <div
      aria-hidden={!visible}
      className={`route-loader ${visible ? 'route-loader-visible' : 'route-loader-hidden'}`}
    >
      <div className="route-loader-panel">
        <div className="flex items-center gap-2" aria-label="Loading page">
          <div className="route-loader-dot" style={{ animationDelay: '0ms' }} />
          <div className="route-loader-dot" style={{ animationDelay: '120ms' }} />
          <div className="route-loader-dot" style={{ animationDelay: '240ms' }} />
        </div>
      </div>
    </div>
  )
}