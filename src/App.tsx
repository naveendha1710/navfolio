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

gsap.registerPlugin(ScrollTrigger)

// ─── Stable prop constants ──────────────────────────────────────────────────
// Declared at module level so they are the same reference on every render,
// preventing React.memo children from unnecessary re-renders.
const FAULTY_GRID_MUL: [number, number] = [2, 1]
const LANYARD_POSITION: [number, number, number] = [0, 0, 20]
const LANYARD_GRAVITY: [number, number, number] = [0, -40, 0]

// Stable book pages defined OUTSIDE the component to avoid recreation on every render
const sampleBookPages = [
  {
    pageNumber: 1,
    title: "The Spark",
    content: (
      <div className="space-y-3 pt-1 text-neutral-800 font-serif leading-relaxed text-xs sm:text-sm select-none">
        <p>
          It all started when he was a pretty lazy 13-year-old. He was handed an old, rundown laptop that he ignored for days.
        </p>
        <p>
          One afternoon, purely out of boredom, he finally booted it up and found a copy of <i>Far Cry 3</i>. He played through the whole game and was totally hooked. Excited, he tried to install a bunch of other games, but they kept crashing or simply wouldn't run.
        </p>
      </div>
    ),
    backContent: (
      <div className="space-y-3 pt-1 text-neutral-800 font-serif leading-relaxed text-xs sm:text-sm select-none">
        <h3 className="text-lg font-medium text-center mb-4 text-neutral-900 tracking-tight font-serif">
          The Bottleneck
        </h3>
        <p>
          He wanted to know why, which led him down a massive rabbit hole. He quickly realized his hardware was the bottleneck.
        </p>
        <p>
          Instead of giving up, he started tweaking everything he could. He figured out how to allocate virtual RAM just to keep heavier programs running. When the laptop started overheating from the strain, he grabbed a screwdriver, opened it up, and learned how to apply fresh thermal paste to the CPU.
        </p>
      </div>
    )
  },
  {
    pageNumber: 2,
    title: "Under the Hood",
    content: (
      <div className="space-y-3 pt-1 text-neutral-800 font-serif leading-relaxed text-xs sm:text-sm select-none">
        <p>
          That old laptop became his testing ground. He dug deeply into the OS registry to optimize performance, explored cloud computing to bypass his local limits, and picked up basic coding to script his own improvements.
        </p>
        <p>
          Before long, he wasn't just playing games; he was actively involved in tech communities, obsessed with PC building, hardware specs, and squeezing out every drop of performance.
        </p>
      </div>
    ),
    backContent: (
      <div className="space-y-3 pt-1 text-neutral-800 font-serif leading-relaxed text-xs sm:text-sm select-none">
        <h3 className="text-lg font-medium text-center mb-4 text-neutral-900 tracking-tight font-serif">
          The Next Level
        </h3>
        <p>
          Then, one day, he was reading about Artificial Intelligence. What caught his attention wasn't just the smart software—it was how incredibly hardware-hungry it was.
        </p>
        <p>
          Training neural networks requires massive compute power and optimized architecture. He had spent... figuring out how to push a weak laptop to its absolute limits, so naturally... Curious... he opened a new tab... ready to see exactly how it worked!.
        </p>
      </div>
    )
  }
]

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
              name="Naveen"
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
                      bookAuthor="Naveen Kumar S"
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
            <div className="w-full lg:max-w-2xl">
              <Suspense fallback={null}>
                <FaqAccordion />
              </Suspense>
            </div>

            {/* Right Aligned Contact Links using LineHoverLink */}
            <div className="w-full lg:w-auto flex flex-col items-start lg:items-end text-left lg:text-right pt-2 lg:pt-8 font-sans">
              <h2 className="font-extrabold text-3xl md:text-4xl mb-8 text-slate-900 tracking-tight font-sans">
                Connect & Contact
              </h2>
              <div className="flex flex-col items-start lg:items-end gap-5 text-slate-900 font-mono text-base sm:text-lg">
                <Suspense fallback={<span>LinkedIn / nav-cs</span>}>
                  <LineHoverLink
                    href="https://www.linkedin.com/in/nav-cs/"
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="scribble"
                    className="text-slate-950 font-bold"
                  >
                    LinkedIn / nav-cs
                  </LineHoverLink>
                </Suspense>

                <Suspense fallback={<span>GitHub / naveendha1710</span>}>
                  <LineHoverLink
                    href="https://github.com/naveendha1710"
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="strike"
                    className="text-slate-950 font-bold"
                  >
                    GitHub / naveendha1710
                  </LineHoverLink>
                </Suspense>

                <Suspense fallback={<span>nav.cs@outlook.com</span>}>
                  <LineHoverLink
                    href="mailto:nav.cs@outlook.com"
                    variant="slide"
                    className="text-slate-950 font-medium"
                  >
                    nav.cs@outlook.com
                  </LineHoverLink>
                </Suspense>

                <Suspense fallback={<span>Instagram / @_nav_en._</span>}>
                  <LineHoverLink
                    href="https://www.instagram.com/_nav_en._/?utm_source=ig_web_button_share_sheet"
                    target="_blank"
                    rel="noopener noreferrer"
                    variant="grow"
                    className="text-slate-950 font-medium"
                  >
                    Instagram / @_nav_en._
                  </LineHoverLink>
                </Suspense>

                <Suspense fallback={<span>Discord: ray7905</span>}>
                  <CopyableContactLink
                    textToCopy="ray7905"
                    label="Discord: ray7905"
                    variant="double"
                  />
                </Suspense>

                <Suspense fallback={<span>Mobile: +91 7092703991</span>}>
                  <CopyableContactLink
                    textToCopy="7092703991"
                    label="Mobile: +91 7092703991"
                    variant="pulse"
                  />
                </Suspense>
              </div>
            </div>
          </div>

          {/* Functional Lead Collection & Resume Emailer */}
          <div className="relative z-20 w-full flex justify-center pt-14 sm:pt-20">
            <Suspense fallback={null}>
              <ConnectSection />
            </Suspense>
          </div>
        </section>
      </div>
    </div>
  )
}
