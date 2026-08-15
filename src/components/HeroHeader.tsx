import React, { useEffect, useState, useCallback, memo } from 'react'
import TextType from './TextType'

export interface HeroHeaderProps {
  onCardClick?: () => void
  isCardActive?: boolean
}

// Stable callbacks defined OUTSIDE so they never cause TextType's useEffect re-runs
const setWelcomeDoneTrue = (setter: React.Dispatch<React.SetStateAction<boolean>>) => setter(true)
const setGoodToSeeYouDoneTrue = (setter: React.Dispatch<React.SetStateAction<boolean>>) => setter(true)

const HeroHeader = memo(function HeroHeader({ onCardClick, isCardActive = false }: HeroHeaderProps) {
  const [welcomeDone, setWelcomeDone] = useState(false)
  const [goodToSeeYouDone, setGoodToSeeYouDone] = useState(false)
  const [isGlitchedOut, setIsGlitchedOut] = useState(false)

  // Stable callbacks — won't trigger TextType's effect re-runs
  const handleWelcomeComplete = useCallback(() => setWelcomeDoneTrue(setWelcomeDone), [])
  const handleGoodToSeeYouComplete = useCallback(() => setGoodToSeeYouDoneTrue(setGoodToSeeYouDone), [])

  useEffect(() => {
    if (!isCardActive) {
      setIsGlitchedOut(false)
      return
    }
    const timer = setTimeout(() => setIsGlitchedOut(true), 5000)
    return () => clearTimeout(timer)
  }, [isCardActive])

  return (
    <div className="flex flex-col items-start justify-start text-left space-y-4 max-w-5xl w-full">
      {/* Line 1: Welcome! */}
      <TextType
        text="Welcome!"
        typingSpeed={75}
        showCursor={!welcomeDone}
        cursorCharacter="_"
        cursorClassName="text-[#edcee2] font-bold ml-1"
        loop={false}
        onSentenceComplete={handleWelcomeComplete}
        className="text-6xl sm:text-7xl lg:text-8xl font-extrabold text-[#a14a6e] leading-tight tracking-tight"
      />

      {/* Line 2: Good to see you! */}
      {welcomeDone && (
        <TextType
          text="Good to see you!"
          typingSpeed={75}
          showCursor={true}
          cursorCharacter="_"
          cursorClassName="text-[#edcee2] font-bold ml-1"
          loop={false}
          onSentenceComplete={handleGoodToSeeYouComplete}
          className="text-6xl sm:text-7xl lg:text-8xl font-extrabold text-[#edcee2] leading-tight tracking-tight"
        />
      )}

      {/* Click Here Button */}
      {!isGlitchedOut && (
        <div
          className={`w-full flex justify-start items-center pt-6 transition-opacity duration-700 ${
            goodToSeeYouDone ? 'opacity-100' : 'opacity-0 pointer-events-none'
          } ${isCardActive ? 'animate-glitch-out' : ''}`}
        >
          <button
            onClick={onCardClick}
            className="cursor-target px-5 py-2.5 rounded bg-white/5 border border-white/10 text-[#edcee2] font-mono text-xl sm:text-2xl font-bold hover:bg-white/10 transition-colors"
          >
            Click Here
          </button>
        </div>
      )}
    </div>
  )
})

export default HeroHeader
