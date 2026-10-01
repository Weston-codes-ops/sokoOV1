import { LoaderCircle } from 'lucide-react'

export default function Loading({ visible = true }) {
const loadingText =[]

  return (
    <div
      aria-hidden={!visible}
      className={`route-loader ${visible ? 'route-loader-visible' : 'route-loader-hidden'}`}
    >
      <div className="">
        <div role="status" aria-label="Loading page">
          <p className='route-loader-text'>Loading...</p>
          <LoaderCircle size={50} aria-hidden="true" className="route-loader-spinner" />
        </div>
      </div>
    </div>
  )
}