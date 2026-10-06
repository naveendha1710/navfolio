import React, { useEffect, useRef, useState, useCallback, useMemo, lazy, Suspense } from 'react'
import { useScroll } from 'framer-motion'
import Lenis from 'lenis'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

import mcBookImg from './assets/lanyard_img/MC_book.png'

// Eagerly loaded (above-the-fold critical components)
import Navbar from './components/Navbar'
import HeroHeader from './components/HeroHeader'
import TargetCursor from './components/TargetCursor'

// FaultyTerminal: lazy + deferred so OGL/WebGL doesn't block the LCP render
const FaultyTerminal = lazy(() => import('./components/FaultyTerminal'))

// Lazily loaded (below-the-fold, heavy components)
const Lanyard = lazy(() => import('./components/Lanyard'))
const ScrollExpand = lazy(() => import('./components/ScrollExpand'))
const DecryptedText = lazy(() => import('./components/DecryptedText'))
const InteractiveBook = lazy(() => import('./components/ui/interactive-book'))
const ScrollFloat = lazy(() => import('./components/ScrollFloat'))
const MagnetLines = lazy(() => import('./components/MagnetLines'))
const UserCursor = lazy(() => import('./components/originkit/ui/usercursor'))
const LinePath = lazy(() => import('./components/skiper19').then(m => ({ default: m.LinePath })))
const StuckWithItSection = lazy(() => import('./components/StuckWithItSection'))
const ProjectsSection = lazy(() => import('./components/ProjectsSection'))
const FluidMorphBg = lazy(() => import('./components/FluidMorphBg'))
const FaqAccordion = lazy(() => import('./components/ui/faq-accordion'))
const LineHoverLink = lazy(() => import('./components/ui/line-hover-link'))
const SquigglyText = lazy(() => import('./components/ui/squiggly-text'))
const MobileDesktopNotice = lazy(() => import('./components/ui/mobile-desktop-notice'))
const ConnectSection = lazy(() => import('./components/ConnectSection'))
import { profile, sampleBookPages } from './data/profile'

gsap.registerPlugin(ScrollTrigger)

// ─── Stable prop constants ──────────────────────────────────────────────────
// Declared at module level so they are the same reference on every render,
// preventing React.memo children from unnecessary re-renders.
const FAULTY_GRID_MUL: [number, number] = [2, 1]
const LANYARD_POSITION: [number, number, number] = [0, 0, 20]
const LANYARD_GRAVITY: [number, number, number] = [0, -40, 0]

// Stable UserCursor style object to avoid re-renders from inline object creation
const userCursorStyle: React.CSSProperties = {
  width: '100%',
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center'
}

const CopyableContactLink = ({
  textToCopy,
  label,
  variant,
}: {
  textToCopy: string
  label: string
  variant: any
}) => {
  const [copied, setCopied] = useState(false)

  const handleCopy = (e: React.MouseEvent) => {
    e.preventDefault()
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(textToCopy)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  return (
    <LineHoverLink
      href="#"
      onClick={handleCopy}
      variant={variant}
      className="text-slate-950 font-medium cursor-pointer"
      title="Click to copy"
    >
      {copied ? `${label} — Copied! ✓` : label}
    </LineHoverLink>
  )
}

export default function App() {
  const [showCard, setShowCard] = useState(false)
  const [lanyardReady, setLanyardReady] = useState(false) // delayed mount to let OGL context release
  const [showScrollHint, setShowScrollHint] = useState(false)
  const [isBookOpen, setIsBookOpen] = useState(false)
  // Defer FaultyTerminal mount until after the first paint so OGL/WebGL
  // initialisation does not compete with the LCP text render.
  const [faultyReady, setFaultyReady] = useState(false)

  const section3Ref = useRef<HTMLDivElement | null>(null)
  const combinedSectionsRef = useRef<HTMLDivElement | null>(null)

  const { scrollYProgress: combinedScroll } = useScroll({
    target: combinedSectionsRef,
    offset: useMemo(() => ["start end", "end end"] as const, [])
  })

  // Initialize Lenis Smooth Inertia Scroll (runs once, properly cleaned up)
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.68,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.2,
      touchMultiplier: 1.8,
    })

    lenis.on('scroll', ScrollTrigger.update)

    const updateRaf = (time: number) => {
      lenis.raf(time * 1000)
    }

    gsap.ticker.add(updateRaf)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(updateRaf)
      lenis.destroy()
    }
  }, [])

  // Mount FaultyTerminal only after the browser has had a chance to paint the
  // initial hero content. requestIdleCallback is ideal; setTimeout(0) is the
  // fallback for Safari which lacks rIC.
  useEffect(() => {
    let id: number
    if (typeof requestIdleCallback !== 'undefined') {
      id = requestIdleCallback(() => setFaultyReady(true))
      return () => cancelIdleCallback(id)
    } else {
      const t = setTimeout(() => setFaultyReady(true), 0)
      return () => clearTimeout(t)
    }
  }, [])

  // Stable callback - won't change between renders
  const handleCardClick = useCallback(() => {
    setShowCard(prev => !prev)
  }, [])

  // Delay Lanyard mount by 250ms after showCard=true so FaultyTerminal's OGL
  // WebGL context has time to fully release before Three.js creates its own context
  useEffect(() => {
    if (!showCard) {
      setLanyardReady(false)
      return
    }
    const timer = setTimeout(() => {
      setLanyardReady(true)
    }, 250)
    return () => clearTimeout(timer)
  }, [showCard])

  // Stable callback - won't cause re-renders on InteractiveBook parent
  const handleBookOpenChange = useCallback((isOpen: boolean) => {
    setIsBookOpen(isOpen)
  }, [])

  // 5 seconds after ID Card drops, slowly blink "Scroll down!" text
  useEffect(() => {
    if (!showCard) {
      setShowScrollHint(false)
      return
    }
    const timer = setTimeout(() => setShowScrollHint(true), 5000)
    return () => clearTimeout(timer)
  }, [showCard])

  // Stable className strings - computed only when isBookOpen changes
  const scrollFloatContainerClass = useMemo(() =>
    `flex flex-col items-start font-mono text-white select-none whitespace-nowrap transition-transform duration-[1500ms] ease-[cubic-bezier(0.25,0,0,1)] ${isBookOpen ? 'translate-x-[160px] sm:translate-x-[220px]' : 'translate-x-0'}`,
    [isBookOpen]
  )

  const lanyardContainerClass = useMemo(() =>
    `absolute right-0 top-4 sm:top-10 z-20 w-full md:w-1/2 h-[70vh] sm:h-[80vh] pointer-events-auto transition-all duration-700 ease-out ${showCard ? 'translate-y-0 opacity-100' : '-translate-y-[120%] opacity-0 pointer-events-none'}`,
    [showCard]
  )

  return (
    <div className="min-h-screen bg-[#05070a] text-slate-100 relative font-sans selection:bg-purple-500/30 selection:text-purple-300">
      {/* Top Transparent Navbar */}
      <Navbar />

      {/* Mobile Desktop Recommendation Notice Overlay */}
      <Suspense fallback={null}>
        <MobileDesktopNotice />
      </Suspense>

      {/* Target Cursor — eagerly loaded, first-page only */}
      <TargetCursor
        targetSelector=".cursor-target"
        spinDuration={2}
        cursorColor="#edcee2"
        cursorColorOnTarget="#edcee2"
      />

      {/* Section 1: Hero */}
      <div className="relative min-h-screen w-full overflow-hidden">
        {/* FaultyTerminal — lazy + deferred so WebGL doesn't block first paint */}
        <div className="fixed inset-0 z-0 opacity-90 pointer-events-none">
          {faultyReady && (
            <Suspense fallback={null}>
              <FaultyTerminal
                scale={2.3}
                gridMul={FAULTY_GRID_MUL}
                digitSize={1.1}
                timeScale={1}
                pause={false}
                scanlineIntensity={1}
                glitchAmount={1}
                flickerAmount={1}
                noiseAmp={1}
                chromaticAberration={0}
                dither={0}
                curvature={0.17}
                tint="#b15382"
                mouseReact={true}
                mouseStrength={0.4}
                pageLoadAnimation={false}
                brightness={0.6}
              />
            </Suspense>
          )}
        </div>

        <div className="fixed inset-0 z-1 pointer-events-none bg-[radial-gradient(ellipse_at_center,transparent_65%,#05070a_98%)] opacity-40" />

        <main className="relative z-10 w-full px-6 sm:px-12 lg:px-16 min-h-screen flex flex-col justify-start items-start pt-[20vh]">
          <HeroHeader onCardClick={handleCardClick} isCardActive={showCard} />
        </main>

        {/* Lanyard ID Card (Right Mid-Top) - Drops into screen on Card click */}
        <div className={lanyardContainerClass}>
          {showCard && (
            <Suspense fallback={null}>
              <Lanyard position={LANYARD_POSITION} gravity={LANYARD_GRAVITY} />
            </Suspense>
          )}
        </div>

        {showScrollHint && (
          <div className="absolute bottom-6 inset-x-0 z-30 flex justify-center items-center pointer-events-none">
            <span className="font-mono text-sm sm:text-base tracking-widest text-[#edcee2]/80 uppercase animate-pulse transition-opacity duration-1000">
              Scroll down ↓
            </span>
          </div>
        )}
      </div>

      {/* Section 2: ScrollExpand + DecryptedText */}
      <div className="relative z-20 w-full">
        <Suspense fallback={null}>
          <ScrollExpand
            useWindowScroll={true}
            startWidth={50}
            startHeight={60}
            startRadius={24}
            endRadius={0}
            mediaZoom={1.2}
            scrollDistance={1.2}
            holdDistance={0.4}
          >
            <div className="flex flex-col items-center justify-center text-center">
              <Suspense fallback={null}>
                <DecryptedText
                  text="Hi!"
                  speed={60}
                  maxIterations={12}
                  sequential={true}
                  animateOn="view"
                  className="text-7xl sm:text-9xl font-black text-[#edcee2] tracking-widest font-mono"
                  encryptedClassName="text-7xl sm:text-9xl font-black text-purple-400/80 tracking-widest font-mono"
                />
              </Suspense>
            </div>
          </ScrollExpand>
        </Suspense>
      </div>

      {/* Sections 3 & 4: Combined scroll wrapper */}
      <div ref={combinedSectionsRef} className="relative z-30 w-full bg-[#05070a]">
        {/* Skiper19 LinePath thread */}
        <div className="absolute inset-0 z-10 opacity-60 pointer-events-none overflow-hidden flex items-center justify-end">
          <Suspense fallback={null}>
            <LinePath
              className="w-[750px] lg:w-[1050px] h-full object-cover -translate-x-[10%] translate-y-[6%]"
              scrollYProgress={combinedScroll}
              strokeColor="#b15382"
              strokeWidth={14}
            />
          </Suspense>
        </div>

        {/* Section 3: About Me */}
        <section ref={section3Ref} className="relative z-30 w-full min-h-screen bg-transparent overflow-hidden">
          <Suspense fallback={null}>
            <UserCursor
              name={profile.personalInfo.shortName}
              color="#b15382"
              textColor="#fafaf9"
              size={24}
              style={userCursorStyle}
            >
              {/* Background MagnetLines */}
              <div className="absolute inset-0 z-0 flex items-center justify-center opacity-35 [filter:brightness(1.3)] pointer-events-none">
                <Suspense fallback={null}>
                  <MagnetLines
                    rows={10}
                    columns={14}
                    containerSize="100%"
                    lineColor="#b15382"
                    lineWidth="0.3vmin"
                    lineHeight="3.5vmin"
                    baseAngle={-10}
                  />
                </Suspense>
              </div>

              <div className="relative z-10 w-full max-w-6xl mx-auto px-6 sm:px-12 lg:px-16 py-16 flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12">
                {/* Left: InteractiveBook */}
                <div className="flex-shrink-0 cursor-target [transform:rotateY(-12deg)_rotateZ(-2deg)] [transform-style:preserve-3d] transition-transform duration-700">
                  <Suspense fallback={null}>
                    <InteractiveBook
                      coverImage={mcBookImg}
                      bookAuthor={profile.personalInfo.name}
                      width={330}
                      height={473}
                      pages={sampleBookPages}
                      onOpenChange={handleBookOpenChange}
                    />
                  </Suspense>
                </div>

                {/* Right: ScrollFloat "About me" with SquigglyText effect */}
                <div className={scrollFloatContainerClass}>
                  <Suspense fallback={null}>
                    <SquigglyText scale={[4, 6]} baseFrequency={0.025} stepDuration={75}>
                      <ScrollFloat
                        animationDuration={1.2}
                        ease="back.inOut(2)"
                        scrollStart="center bottom+=50%"
                        scrollEnd="bottom bottom-=30%"
                        stagger={0.035}
                        containerClassName="my-0 leading-none"
                        textClassName="text-7xl sm:text-8xl lg:text-[9.5rem] font-black text-white tracking-tight whitespace-nowrap drop-shadow-2xl"
                      >
                        About me
                      </ScrollFloat>
                    </SquigglyText>
                  </Suspense>
                </div>
              </div>
            </UserCursor>
          </Suspense>
        </section>

        {/* Section 4: "and I stuck with it." */}
        <Suspense fallback={null}>
          <StuckWithItSection />
        </Suspense>

        {/* Section 5: Selected Work / Projects (emilianmisera.com style) */}
        <Suspense fallback={null}>
          <ProjectsSection />
        </Suspense>

        {/* Section 6: Fluid Morph Background Section with FAQ Accordion (Left) & Contact Links (Right) & CurvedInput (Bottom Center) */}
        <section className="relative z-30 w-full min-h-[650px] sm:min-h-[850px] flex flex-col items-center justify-center px-6 sm:px-12 lg:px-16 py-20 overflow-hidden">
          {/* Seamless top gradient fade from Projects section (#f6f6f8) into Fluid Morph shapes */}
          <div className="absolute top-0 inset-x-0 h-44 bg-gradient-to-b from-[#f6f6f8] via-[#f6f6f8]/75 to-transparent z-10 pointer-events-none" />
          <Suspense fallback={null}>
            <FluidMorphBg className="absolute inset-0" />
          </Suspense>

          {/* Main Grid Container: Left = FAQ Accordion, Right = Contact Links */}
          <div className="relative z-20 w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-start justify-between gap-12 lg:gap-16">
            {/* Left Aligned FAQ Accordion containing Background & Credentials details */}
            <div className="w-full lg:max-w-2xl min-h-[480px]">
              <Suspense fallback={<div className="w-full min-h-[480px]" />}>
                <FaqAccordion />
              </Suspense>
            </div>

            {/* Right Aligned Contact Links using LineHoverLink */}
            <div className="w-full lg:w-auto flex flex-col items-start lg:items-end text-left lg:text-right pt-2 lg:pt-8 font-sans">
              <h2 className="font-extrabold text-3xl md:text-4xl mb-8 text-slate-900 tracking-tight font-sans">
                Connect & Contact
              </h2>
              <div className="flex flex-col items-start lg:items-end gap-5 text-slate-900 font-mono text-base sm:text-lg">
                <Suspense fallback={<span>{profile.socialLinks.linkedin.label}</span>}>
                  <LineHoverLink
                    href={profile.socialLinks.linkedin.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="scribble"
                    className="text-slate-950 font-bold"
                  >
                    {profile.socialLinks.linkedin.label}
                  </LineHoverLink>
                </Suspense>

                <Suspense fallback={<span>{profile.socialLinks.github.label}</span>}>
                  <LineHoverLink
                    href={profile.socialLinks.github.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="strike"
                    className="text-slate-950 font-bold"
                  >
                    {profile.socialLinks.github.label}
                  </LineHoverLink>
                </Suspense>

                <Suspense fallback={<span>{profile.personalInfo.email}</span>}>
                  <LineHoverLink
                    href={`mailto:${profile.personalInfo.email}`}
                    variant="slide"
                    className="text-slate-950 font-medium"
                  >
                    {profile.personalInfo.email}
                  </LineHoverLink>
                </Suspense>

                <Suspense fallback={<span>{profile.socialLinks.instagram.label}</span>}>
                  <LineHoverLink
                    href={profile.socialLinks.instagram.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="grow"
                    className="text-slate-950 font-medium"
                  >
                    {profile.socialLinks.instagram.label}
                  </LineHoverLink>
                </Suspense>

                <Suspense fallback={<span>{profile.socialLinks.discord.label}</span>}>
                  <CopyableContactLink
                    textToCopy={profile.socialLinks.discord.username}
                    label={profile.socialLinks.discord.label}
                    variant="double"
                  />
                </Suspense>
              </div>
            </div>
          </div>

          {/* Functional Lead Collection & Resume Emailer */}
          <div className="relative z-20 w-full flex justify-center pt-14 sm:pt-20">
            <Suspense fallback={<div className="w-full max-w-lg min-h-[60px]" />}>
              <ConnectSection />
            </Suspense>
          </div>
        </section>
      </div>
    </div>
  )
}
