import React, { useEffect, useState, useCallback, memo } from 'react'
import TextType from './TextType'
import { MagneticButton } from './ui/magnetic-button'
import { PixelDissolveButton } from './ui/pixel-dissolve-button'

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

      {/* Magnetic Click Here Button with Pixel Dissolve Effect */}
      {!isGlitchedOut && (
        <div
          className={`w-full flex justify-start items-center pt-6 transition-opacity duration-700 ${
            goodToSeeYouDone ? 'opacity-100' : 'opacity-0 pointer-events-none'
          } ${isCardActive ? 'animate-glitch-out' : ''}`}
        >
          <PixelDissolveButton onClick={onCardClick}>
            <MagneticButton accentColor="#b15382">
              <button
                className="cursor-pointer rounded-lg bg-gradient-to-b from-[#a14a6e] to-[#7b2c4e] px-6 py-2.5 font-medium text-[#edcee2] ring-1 ring-[#edcee2]/30 ring-offset-1 ring-offset-[#a14a6e] transition-transform duration-150 ring-inset active:scale-95 text-lg sm:text-xl font-mono font-bold shadow-xl hover:from-[#b15382] hover:to-[#8c355f]"
              >
                Click Here
              </button>
            </MagneticButton>
          </PixelDissolveButton>
        </div>
      )}
    </div>
  )
})

export default HeroHeader
