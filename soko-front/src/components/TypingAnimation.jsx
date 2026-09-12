import { useState, useEffect } from 'react'

export default function TypingAnimation({ text = '', speed = 50 }) {
  const [displayText, setDisplayText] = useState('')
  const [index, setIndex] = useState(0)

  useEffect(() => {
    setDisplayText('')
    setIndex(0)
  }, [text])

  useEffect(() => {
    const safeText = text || ''
    if (index < safeText.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + safeText[index])
        setIndex(prev => prev + 1)
      }, speed)
      return () => clearTimeout(timer)
    }
  }, [index, text, speed])

  return (
    <span>
      {displayText}
      <span className="animate-pulse ml-1">|</span>
    </span>
  )
}
