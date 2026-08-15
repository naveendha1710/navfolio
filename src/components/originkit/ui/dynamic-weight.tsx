import * as React from "react"
import { useEffect, useRef } from "react"
const useIsStaticRenderer = () => false
import { motion, useAnimationFrame, useTransform } from "framer-motion"
import type { MotionValue } from "framer-motion"

type CharacterSpanProps = {
    letter: string
    letterIndex: number
    totalLetters: number
    scrollYProgress?: MotionValue<number>
    fromSettings: string
    setRef: (el: HTMLSpanElement | null) => void
}

function CharacterSpan({
    letter,
    letterIndex,
    totalLetters,
    scrollYProgress,
    fromSettings,
    setRef,
}: CharacterSpanProps) {
    const centerIndex = (totalLetters - 1) / 2
    const distanceFromCenter = letterIndex - centerIndex

    // Skiper31 3D Perspective Character Transforms driven by scrollYProgress
    // Automatically works in both forward (down) and reverse (up) scroll directions
    const x = useTransform(
        scrollYProgress ?? ({ get: () => 0.5 } as any),
        [0.05, 0.42, 0.68, 0.95],
        [distanceFromCenter * 45, 0, 0, distanceFromCenter * -45]
    )
    const y = useTransform(
        scrollYProgress ?? ({ get: () => 0.5 } as any),
        [0.05, 0.42, 0.68, 0.95],
        [Math.abs(distanceFromCenter) * 15, 0, 0, -Math.abs(distanceFromCenter) * 15]
    )
    const rotateX = useTransform(
        scrollYProgress ?? ({ get: () => 0.5 } as any),
        [0.05, 0.42, 0.68, 0.95],
        [distanceFromCenter * 35, 0, 0, distanceFromCenter * -35]
    )
    const rotateY = useTransform(
        scrollYProgress ?? ({ get: () => 0.5 } as any),
        [0.05, 0.42, 0.68, 0.95],
        [distanceFromCenter * -25, 0, 0, distanceFromCenter * 25]
    )
    const scale = useTransform(
        scrollYProgress ?? ({ get: () => 0.5 } as any),
        [0.05, 0.42, 0.68, 0.95],
        [0.6, 1, 1, 0.6]
    )
    const opacity = useTransform(
        scrollYProgress ?? ({ get: () => 0.5 } as any),
        [0.05, 0.35, 0.72, 0.95],
        [0, 1, 1, 0]
    )

    return (
        <motion.span
            ref={setRef}
            style={
                scrollYProgress
                    ? {
                          display: "inline-block",
                          fontVariationSettings: fromSettings,
                          x,
                          y,
                          rotateX,
                          rotateY,
                          scale,
                          opacity,
                          transformStyle: "preserve-3d",
                          willChange: "transform, opacity",
                      }
                    : {
                          display: "inline-block",
                          fontVariationSettings: fromSettings,
                      }
            }
        >
            {letter}
        </motion.span>
    )
}

/**
 * VariableFontCursorProximity — text whose letters individually morph
 * their `wght` (font-variation-settings) based on proximity to the cursor.
 * Combined with Skiper31 character 3D scroll transforms.
 */
export default function VariableFontCursorProximity(props: Props) {
    props = { ...COMPONENT_DEFAULTS, ...props }
    const {
        label,
        fromWeight,
        toWeight,
        strength,
        fontSize,
        color,
        transition,
        style,
        scrollYProgress,
    } = props

    const reach = Math.max(
        1,
        (Math.max(1, Math.min(100, strength)) / 100) * MAX_REACH
    )

    const isStatic = useIsStaticRenderer()
    const containerRef = useRef<HTMLDivElement>(null)
    const letterRefs = useRef<Array<HTMLSpanElement | null>>([])
    const letterFactorsRef = useRef<number[]>([])
    const lastFrameRef = useRef(0)
    const mousePositionRef = useRef({ x: -99999, y: -99999 })

    useEffect(() => {
        if (isStatic) return

        const updatePosition = (clientX: number, clientY: number) => {
            const el = containerRef.current
            if (!el) return
            const rect = el.getBoundingClientRect()
            mousePositionRef.current = {
                x: clientX - rect.left,
                y: clientY - rect.top,
            }
        }

        const handleMouseMove = (ev: MouseEvent) =>
            updatePosition(ev.clientX, ev.clientY)
        const handleTouchMove = (ev: TouchEvent) => {
            if (ev.touches.length === 0) return
            updatePosition(ev.touches[0].clientX, ev.touches[0].clientY)
        }

        window.addEventListener("mousemove", handleMouseMove)
        window.addEventListener("touchmove", handleTouchMove)

        const handleDocumentClick = () => {
            letterFactorsRef.current = []
        }
        document.addEventListener("click", handleDocumentClick)

        return () => {
            window.removeEventListener("mousemove", handleMouseMove)
            window.removeEventListener("touchmove", handleTouchMove)
            document.removeEventListener("click", handleDocumentClick)
        }
    }, [isStatic])

    const fromSettings = `'wght' ${fromWeight}`

    useAnimationFrame((now: number) => {
        if (isStatic) return
        const container = containerRef.current
        if (!container) return
        const containerRect = container.getBoundingClientRect()
        const mx = mousePositionRef.current.x
        const my = mousePositionRef.current.y

        const prevT = lastFrameRef.current || now
        const dtSec = Math.min(0.1, Math.max(0, (now - prevT) / 1000))
        lastFrameRef.current = now

        const tau = Math.max(0.016, transition?.duration ?? 0.3)
        const a = 1 - Math.exp(-dtSec / tau)

        for (let i = 0; i < letterRefs.current.length; i++) {
            const letterEl = letterRefs.current[i]
            if (!letterEl) continue
            const rect = letterEl.getBoundingClientRect()
            const cx = rect.left + rect.width / 2 - containerRect.left
            const cy = rect.top + rect.height / 2 - containerRect.top
            const dx = mx - cx
            const dy = my - cy
            const dist = Math.sqrt(dx * dx + dy * dy)

            const target = Math.min(Math.max(1 - dist / reach, 0), 1)
            const prev = letterFactorsRef.current[i] ?? 0
            const f = prev + (target - prev) * a
            letterFactorsRef.current[i] = f

            if (f < 0.001) {
                if (letterEl.style.fontVariationSettings !== fromSettings) {
                    letterEl.style.fontVariationSettings = fromSettings
                }
                continue
            }

            const w = Math.round(fromWeight + (toWeight - fromWeight) * f)
            letterEl.style.fontVariationSettings = `'wght' ${w}`
        }
    })

    const srOnlyStyle: React.CSSProperties = {
        position: "absolute",
        width: 1,
        height: 1,
        padding: 0,
        margin: -1,
        overflow: "hidden",
        clip: "rect(0,0,0,0)",
        whiteSpace: "nowrap",
        borderWidth: 0,
    }

    const innerSpanStyle: React.CSSProperties = {
        fontFamily: VARIABLE_FONT_STACK,
        fontSize,
        color,
        textAlign: "center",
        display: "block",
        width: "100%",
        lineHeight: 1.1,
    }

    const words = label ? label.split(" ") : []
    const totalLetters = words.reduce((acc, word) => acc + word.length, 0)

    letterRefs.current = []
    let letterIndex = 0

    return (
        <div
            ref={containerRef}
            style={{
                width: "100%",
                height: "100%",
                position: "relative",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: isStatic ? undefined : "pointer",
                perspective: "1000px",
                ...style,
            }}
        >
            <style>{INTER_VARIABLE_FONT_FACE}</style>
            {words.length === 0 ? null : (
                <span style={innerSpanStyle}>
                    <span style={srOnlyStyle}>{label}</span>
                    {words.map((word, wi) => {
                        const wordLetters = word.split("")
                        return (
                            <React.Fragment key={wi}>
                                <span
                                    aria-hidden
                                    style={{
                                        display: "inline-block",
                                        whiteSpace: "nowrap",
                                    }}
                                >
                                    {wordLetters.map((letter, li) => {
                                        const idx = letterIndex++
                                        return (
                                            <CharacterSpan
                                                key={li}
                                                letter={letter}
                                                letterIndex={idx}
                                                totalLetters={totalLetters}
                                                scrollYProgress={scrollYProgress}
                                                fromSettings={fromSettings}
                                                setRef={(
                                                    el: HTMLSpanElement | null
                                                ) => {
                                                    letterRefs.current[idx] = el
                                                }}
                                            />
                                        )
                                    })}
                                </span>
                                {wi < words.length - 1 && (
                                    <span
                                        aria-hidden
                                        style={{
                                            display: "inline-block",
                                        }}
                                    >
                                        &nbsp;
                                    </span>
                                )}
                            </React.Fragment>
                        )
                    })}
                </span>
            )}
        </div>
    )
}

const INTER_VARIABLE_FONT_FACE = `
@font-face {
    font-family: "InterVariableFramer";
    src: url("https://rsms.me/inter/font-files/InterVariable.woff2?v=4.0") format("woff2-variations");
    font-weight: 100 900;
    font-style: normal;
    font-display: swap;
}
@font-face {
    font-family: "InterVariableFramer";
    src: url("https://rsms.me/inter/font-files/InterVariable-Italic.woff2?v=4.0") format("woff2-variations");
    font-weight: 100 900;
    font-style: italic;
    font-display: swap;
}
`

const VARIABLE_FONT_STACK =
    '"InterVariableFramer", "Inter Variable", "Inter", system-ui, sans-serif'

const MAX_REACH = 800

type Props = {
    label: string
    fromWeight: number
    toWeight: number
    strength: number
    fontSize: number
    color: string
    transition: any
    style?: React.CSSProperties
    scrollYProgress?: MotionValue<number>
}

const COMPONENT_DEFAULTS = {
    label: "Variable Font Proximity",
    fontSize: 48,
    color: "#FFFFFF",
    fromWeight: 400,
    toWeight: 900,
    strength: 25,
    transition: {
        type: "tween",
        duration: 0.3,
        ease: "easeOut",
    },
}
