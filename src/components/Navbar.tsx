import React, { memo, useCallback } from 'react'
import { PopButton } from './ui/pop-button'


const Navbar = memo(function Navbar() {
  const handleProjectsClick = useCallback(() => {
    const projectsEl = document.getElementById('projects')
    if (projectsEl) {
      projectsEl.scrollIntoView({ behavior: 'smooth' })
    }
  }, [])

  const handleResumeClick = useCallback(() => {
    const link = document.createElement('a')
    link.href = '/resume.pdf'
    link.download = 'Resume - nav.cs@outlook.com.pdf'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-transparent px-6 sm:px-12 py-5 flex items-center justify-between pointer-events-auto">
      {/* Horizontal Dividing Line spanning across left */}
      <div className="flex-1 h-[1px] bg-slate-800/80 mr-6 sm:mr-10" />

      {/* Right Side: PopButtons (Projects & Resume) */}
      <div className="flex items-center gap-4 sm:gap-6">
        <PopButton
          onClick={handleProjectsClick}
          className="px-5 py-2 text-xs sm:text-sm tracking-wider"
        >
          Projects
        </PopButton>
        <PopButton
          onClick={handleResumeClick}
          className="px-5 py-2 text-xs sm:text-sm tracking-wider"
        >
          Resume
        </PopButton>
      </div>
    </header>
  )
})

export default Navbar
