import { useState, useEffect } from 'react'

const STATES = [
  { id: 'WA', name: 'Washington', paths: ['M 118 42 L 232 42 L 232 94 L 208 107 L 192 115 L 154 115 L 127 115 L 118 95 Z'], lx: 175, ly: 79 },
  { id: 'OR', name: 'Oregon', paths: ['M 118 115 L 192 115 L 208 107 L 214 130 L 214 198 L 128 198 L 118 178 Z'], lx: 166, ly: 158 },
  { id: 'CA', name: 'California', paths: ['M 118 198 L 158 198 L 168 216 L 172 268 L 168 344 L 156 388 L 128 376 L 100 318 L 104 248 Z'], lx: 139, ly: 295 },
  { id: 'NV', name: 'Nevada', paths: ['M 168 216 L 214 198 L 250 208 L 250 322 L 210 332 L 186 292 Z'], lx: 209, ly: 272 },
  { id: 'ID', name: 'Idaho', paths: ['M 192 115 L 232 94 L 270 100 L 272 154 L 270 238 L 214 238 L 214 115 Z'], lx: 234, ly: 168 },
  { id: 'MT', name: 'Montana', paths: ['M 232 42 L 464 42 L 464 100 L 398 100 L 372 128 L 315 128 L 272 154 L 268 100 L 232 94 Z'], lx: 347, ly: 90 },
  { id: 'WY', name: 'Wyoming', paths: ['M 270 154 L 396 154 L 396 238 L 270 238 Z'], lx: 333, ly: 196 },
  { id: 'CO', name: 'Colorado', paths: ['M 296 238 L 396 238 L 396 320 L 296 320 Z'], lx: 346, ly: 279 },
  { id: 'UT', name: 'Utah', paths: ['M 250 238 L 296 238 L 296 320 L 250 320 Z'], lx: 273, ly: 279 },
  { id: 'AZ', name: 'Arizona', paths: ['M 210 322 L 296 320 L 296 438 L 200 438 L 180 398 Z'], lx: 244, ly: 379 },
  { id: 'NM', name: 'New Mexico', paths: ['M 296 320 L 396 320 L 396 415 L 296 415 Z'], lx: 346, ly: 367 },
  { id: 'ND', name: 'North Dakota', paths: ['M 392 42 L 492 42 L 492 138 L 392 138 Z'], lx: 442, ly: 90 },
  { id: 'SD', name: 'South Dakota', paths: ['M 392 138 L 492 138 L 492 204 L 392 204 Z'], lx: 442, ly: 171 },
  { id: 'NE', name: 'Nebraska', paths: ['M 392 204 L 498 204 L 498 266 L 436 266 L 392 258 Z'], lx: 445, ly: 233 },
  { id: 'KS', name: 'Kansas', paths: ['M 394 266 L 502 266 L 502 336 L 394 336 Z'], lx: 448, ly: 301 },
  { id: 'OK', name: 'Oklahoma', paths: ['M 295 336 L 394 336 L 502 336 L 539 336 L 539 387 L 394 387 L 394 358 L 295 358 Z'], lx: 468, ly: 362 },
  { id: 'TX', name: 'Texas', paths: ['M 394 387 L 539 387 L 556 408 L 552 492 L 452 498 L 402 464 L 376 416 Z'], lx: 466, ly: 440 },
  { id: 'MN', name: 'Minnesota', paths: ['M 490 42 L 574 42 L 575 115 L 568 155 L 558 184 L 535 186 L 528 202 L 492 202 L 490 138 Z'], lx: 532, ly: 113 },
  { id: 'IA', name: 'Iowa', paths: ['M 492 202 L 528 202 L 576 202 L 576 252 L 492 252 Z'], lx: 534, ly: 227 },
  { id: 'MO', name: 'Missouri', paths: ['M 492 252 L 576 252 L 589 336 L 539 340 L 492 338 Z'], lx: 540, ly: 294 },
  { id: 'AR', name: 'Arkansas', paths: ['M 492 340 L 539 340 L 583 340 L 582 416 L 492 416 Z'], lx: 538, ly: 378 },
  { id: 'LA', name: 'Louisiana', paths: ['M 492 416 L 582 416 L 578 456 L 558 481 L 540 492 L 490 489 Z'], lx: 535, ly: 452 },
  { id: 'WI', name: 'Wisconsin', paths: ['M 548 58 L 624 84 L 626 130 L 610 170 L 570 186 L 535 186 L 535 156 L 548 116 Z'], lx: 580, ly: 137 },
  { id: 'IL', name: 'Illinois', paths: ['M 568 188 L 627 188 L 644 202 L 641 312 L 588 322 L 566 298 Z'], lx: 605, ly: 252 },
  {
    id: 'MI', name: 'Michigan',
    paths: [
      'M 626 78 L 706 76 L 730 100 L 740 122 L 716 142 L 693 150 L 665 132 L 649 150 L 649 190 L 627 190 L 629 158 L 638 140 L 627 120 Z',
      'M 613 86 L 660 82 L 706 76 L 706 98 L 668 108 L 638 118 L 613 108 Z',
    ],
    lx: 672, ly: 134,
  },
  { id: 'IN', name: 'Indiana', paths: ['M 627 190 L 659 190 L 659 298 L 641 312 L 627 312 Z'], lx: 643, ly: 251 },
  { id: 'OH', name: 'Ohio', paths: ['M 659 190 L 741 190 L 742 250 L 738 287 L 659 299 Z'], lx: 699, ly: 239 },
  { id: 'KY', name: 'Kentucky', paths: ['M 610 297 L 659 299 L 738 287 L 769 300 L 763 343 L 741 357 L 690 367 L 614 360 Z'], lx: 691, ly: 330 },
  { id: 'TN', name: 'Tennessee', paths: ['M 614 360 L 741 357 L 763 342 L 806 355 L 764 393 L 702 401 L 617 398 Z'], lx: 689, ly: 378 },
  { id: 'MS', name: 'Mississippi', paths: ['M 540 416 L 618 416 L 616 492 L 583 496 L 549 483 L 540 458 Z'], lx: 578, ly: 453 },
  { id: 'AL', name: 'Alabama', paths: ['M 617 398 L 665 398 L 665 440 L 663 478 L 617 480 Z'], lx: 641, ly: 440 },
  { id: 'GA', name: 'Georgia', paths: ['M 663 396 L 763 393 L 770 440 L 768 477 L 715 482 L 663 480 Z'], lx: 716, ly: 439 },
  { id: 'FL', name: 'Florida', paths: ['M 663 480 L 715 482 L 768 477 L 783 505 L 766 560 L 740 565 L 706 538 L 680 512 L 660 492 Z'], lx: 717, ly: 519 },
  { id: 'SC', name: 'South Carolina', paths: ['M 763 393 L 806 355 L 828 378 L 800 410 L 763 418 Z'], lx: 793, ly: 394, hideLabel: true },
  { id: 'NC', name: 'North Carolina', paths: ['M 763 342 L 805 320 L 845 320 L 863 340 L 837 360 L 806 370 L 763 368 Z'], lx: 813, ly: 353 },
  { id: 'VA', name: 'Virginia', paths: ['M 741 272 L 800 264 L 845 274 L 862 295 L 840 320 L 805 320 L 763 330 L 739 313 Z'], lx: 800, ly: 298 },
  { id: 'WV', name: 'West Virginia', paths: ['M 719 256 L 739 250 L 763 264 L 769 288 L 739 287 L 730 302 L 719 291 Z'], lx: 744, ly: 273, hideLabel: true },
  { id: 'MD', name: 'Maryland', paths: ['M 763 264 L 822 258 L 832 269 L 831 283 L 806 295 L 763 290 Z'], lx: 796, ly: 276, hideLabel: true },
  { id: 'DE', name: 'Delaware', paths: ['M 824 240 L 839 238 L 841 265 L 824 265 Z'], lx: 833, ly: 252, hideLabel: true },
  { id: 'NJ', name: 'New Jersey', paths: ['M 822 218 L 845 215 L 847 250 L 839 260 L 822 260 Z'], lx: 835, ly: 237, hideLabel: true },
  { id: 'PA', name: 'Pennsylvania', paths: ['M 738 220 L 822 218 L 822 242 L 820 264 L 763 264 L 738 250 Z'], lx: 779, ly: 242 },
  { id: 'NY', name: 'New York', paths: ['M 738 142 L 845 142 L 862 155 L 862 180 L 843 192 L 822 218 L 820 202 L 788 188 L 738 218 Z'], lx: 792, ly: 178 },
  { id: 'CT', name: 'Connecticut', paths: ['M 848 206 L 862 202 L 876 206 L 876 225 L 848 225 Z'], lx: 862, ly: 215, hideLabel: true },
  { id: 'RI', name: 'Rhode Island', paths: ['M 870 204 L 882 204 L 882 222 L 870 222 Z'], lx: 876, ly: 213, hideLabel: true },
  { id: 'MA', name: 'Massachusetts', paths: ['M 832 170 L 878 168 L 899 178 L 882 200 L 862 200 L 849 200 L 836 194 L 832 182 Z'], lx: 864, ly: 183, hideLabel: true },
  { id: 'VT', name: 'Vermont', paths: ['M 830 130 L 848 128 L 848 168 L 830 168 Z'], lx: 839, ly: 149, hideLabel: true },
  { id: 'NH', name: 'New Hampshire', paths: ['M 848 108 L 864 106 L 868 162 L 848 166 L 848 130 Z'], lx: 858, ly: 136, hideLabel: true },
  { id: 'ME', name: 'Maine', paths: ['M 862 70 L 912 70 L 912 155 L 868 160 L 865 108 L 862 90 Z'], lx: 887, ly: 113 },
  {
    id: 'AK', name: 'Alaska',
    paths: ['M 100 498 L 195 492 L 235 502 L 248 522 L 238 542 L 218 555 L 185 560 L 152 558 L 122 548 L 100 535 L 95 518 Z'],
    lx: 162, ly: 526,
  },
  {
    id: 'HI', name: 'Hawaii',
    paths: [
      'M 388 545 L 406 537 L 420 544 L 422 558 L 407 565 L 391 562 Z',
      'M 362 537 L 376 534 L 379 542 L 369 547 L 358 543 Z',
      'M 329 538 L 342 534 L 345 542 L 337 546 L 326 543 Z',
      'M 305 534 L 317 530 L 319 538 L 311 542 L 302 539 Z',
      'M 348 532 L 358 530 L 359 536 L 350 536 Z',
    ],
    lx: 362, ly: 551,
  },
]

const OCCUPATIONS = [
  'Software Engineer',
  'Registered Nurse',
  'Teacher / Educator',
  'Accountant / CPA',
  'Chef / Cook',
  'Graphic Designer',
  'Electrician',
  'Marketing Manager',
  'Attorney / Lawyer',
  'Physician / Doctor',
  'Construction Manager',
  'Data Analyst',
  'Retail Manager',
  'Financial Advisor',
  'Social Worker',
  'Real Estate Agent',
  'Physical Therapist',
  'Mechanical Engineer',
  'Journalist / Writer',
  'Police Officer',
  'Pharmacist',
  'Civil Engineer',
  'Entrepreneur / Business Owner',
]

const CLIMATES = [
  { id: 'sunny', label: 'Warm & Sunny' },
  { id: 'four-seasons', label: 'Four Seasons' },
  { id: 'snowy', label: 'Snowy Winters' },
  { id: 'rainy', label: 'Rainy & Cool' },
  { id: 'dry', label: 'Dry & Arid' },
  { id: 'tropical', label: 'Tropical' },
  { id: 'mild', label: 'Mild Year-Round' },
  { id: 'continental', label: 'Hot Summers, Cold Winters' },
]

export default function Main() {
  const [dark, setDark] = useState(false)
  const [selectedState, setSelectedState] = useState(null)
  const [hoveredState, setHoveredState] = useState(null)
  const [occupation, setOccupation] = useState('')
  const [climates, setClimates] = useState<Set<string>>(new Set())

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  const toggleClimate = (id) => {
    setClimates(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleStateClick = (id) => {
    setSelectedState(prev => (prev === id ? null : id))
  }

  const displayStateName =
    hoveredState
      ? STATES.find(s => s.id === hoveredState)?.name
      : selectedState
        ? STATES.find(s => s.id === selectedState)?.name
        : null

  const hasSelections = selectedState || occupation || climates.size > 0

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)', fontFamily: 'var(--font-sans)' }}>

      {/* Header */}
      <header
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg)' }}
        className="sticky top-0 z-10 px-6 py-3 flex items-center justify-between"
      >
        <span
          style={{ fontFamily: 'var(--font-display)', color: 'var(--text)', letterSpacing: '-0.02em' }}
          className="text-base font-bold"
        >
          Relocate
        </span>

        <button
          onClick={() => setDark(d => !d)}
          style={{
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            color: 'var(--muted)',
            fontFamily: 'var(--font-sans)',
          }}
          className="px-3 py-1.5 rounded text-xs font-medium tracking-wide transition-opacity hover:opacity-70"
        >
          {dark ? '☀ Light' : '☾ Dark'}
        </button>
      </header>

      {/* Main */}
      <main className="max-w-5xl mx-auto px-4 pb-16 pt-8">

        {/* Map section */}
        <div className="mb-10">
          <div className="mb-5 flex items-baseline gap-3">
            <h1
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text)', letterSpacing: '-0.03em' }}
              className="text-3xl font-bold"
            >
              {displayStateName ? (
                <>
                  <span style={{ color: 'var(--muted)', fontStyle: 'italic', fontWeight: 400 }}>you picked </span>
                  {displayStateName}
                </>
              ) : (
                'Pick a state.'
              )}
            </h1>
          </div>

          {/* Map container */}
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            <svg
              viewBox="0 0 960 590"
              style={{ display: 'block', width: '100%' }}
              aria-label="Map of the United States — click a state to select it"
            >
              {/* Render state paths */}
              {STATES.map(state =>
                state.paths.map((d, i) => (
                  <path
                    key={`${state.id}-${i}`}
                    d={d}
                    style={{
                      fill:
                        selectedState === state.id
                          ? 'var(--map-selected)'
                          : hoveredState === state.id
                            ? 'var(--map-hover)'
                            : 'var(--map-state)',
                      stroke: 'var(--map-stroke)',
                      strokeWidth: 0.8,
                      cursor: 'pointer',
                      transition: 'fill 0.12s ease',
                    }}
                    onClick={() => handleStateClick(state.id)}
                    onMouseEnter={() => setHoveredState(state.id)}
                    onMouseLeave={() => setHoveredState(null)}
                  />
                ))
              )}

              {/* State abbreviation labels */}
              {STATES.filter(s => !s.hideLabel).map(state => (
                <text
                  key={`lbl-${state.id}`}
                  x={state.lx}
                  y={state.ly}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  style={{
                    fontSize: 9,
                    fill: 'var(--map-text)',
                    fontFamily: 'var(--font-sans)',
                    fontWeight: 500,
                    pointerEvents: 'none',
                    userSelect: 'none',
                    opacity: selectedState === state.id ? 1 : 0.65,
                  }}
                >
                  {state.id}
                </text>
              ))}

              {/* Inset box labels */}
              <rect x="82" y="480" width="180" height="86" fill="none" stroke="var(--border)" strokeWidth="0.6" strokeDasharray="3 2" rx="2" />
              <text x="86" y="476" style={{ fontSize: 7, fill: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>AK</text>
              <rect x="285" y="513" width="154" height="60" fill="none" stroke="var(--border)" strokeWidth="0.6" strokeDasharray="3 2" rx="2" />
              <text x="289" y="509" style={{ fontSize: 7, fill: 'var(--muted)', fontFamily: 'var(--font-sans)' }}>HI</text>
            </svg>
          </div>

          {/* Selected state sub-label */}
          <div className="mt-2 h-5">
            {selectedState && !hoveredState && (
              <p style={{ color: 'var(--muted)' }} className="text-xs flex items-center gap-2">
                <span style={{ color: 'var(--accent)' }}>●</span>
                {STATES.find(s => s.id === selectedState)?.name} selected
                <button
                  onClick={() => setSelectedState(null)}
                  style={{ color: 'var(--muted)', textDecoration: 'underline', textDecorationStyle: 'dotted' }}
                  className="ml-1 hover:opacity-60 transition-opacity"
                >
                  clear
                </button>
              </p>
            )}
            {!selectedState && (
              <p style={{ color: 'var(--muted)' }} className="text-xs">
                Click any state to select it
              </p>
            )}
          </div>
        </div>

        {/* Selectors */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">

          {/* Occupation */}
          <div>
            <h2
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text)', letterSpacing: '-0.02em' }}
              className="text-lg font-bold mb-1"
            >
              Occupation
            </h2>
            <p style={{ color: 'var(--muted)' }} className="text-xs mb-3">What do you do for work?</p>
            <div className="relative">
              <select
                value={occupation}
                onChange={e => setOccupation(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--surface)',
                  border: '1px solid var(--border)',
                  color: occupation ? 'var(--text)' : 'var(--muted)',
                  fontFamily: 'var(--font-sans)',
                  appearance: 'none',
                  fontSize: '0.875rem',
                  padding: '0.6rem 2.2rem 0.6rem 0.75rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  outline: 'none',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)' }}
                onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)' }}
              >
                <option value="" style={{ color: 'var(--muted)' }}>Select an occupation…</option>
                {OCCUPATIONS.map(occ => (
                  <option key={occ} value={occ} style={{ background: 'var(--surface)', color: 'var(--text)' }}>
                    {occ}
                  </option>
                ))}
              </select>
              <span
                style={{ color: 'var(--muted)', pointerEvents: 'none', position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
                className="text-xs"
              >
                ▾
              </span>
            </div>
          </div>

          {/* Climate */}
          <div>
            <h2
              style={{ fontFamily: 'var(--font-display)', color: 'var(--text)', letterSpacing: '-0.02em' }}
              className="text-lg font-bold mb-1"
            >
              Preferred Climate
            </h2>
            <p style={{ color: 'var(--muted)' }} className="text-xs mb-3">Select all that appeal to you</p>
            <div className="flex flex-wrap gap-2">
              {CLIMATES.map(c => {
                const active = climates.has(c.id)
                return (
                  <button
                    key={c.id}
                    onClick={() => toggleClimate(c.id)}
                    style={{
                      border: `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
                      background: active ? 'var(--map-selected)' : 'var(--surface)',
                      color: active ? 'var(--bg)' : 'var(--text)',
                      fontFamily: 'var(--font-sans)',
                      fontSize: '0.8rem',
                      padding: '0.35rem 0.75rem',
                      borderRadius: '20px',
                      cursor: 'pointer',
                      transition: 'all 0.12s ease',
                      fontWeight: active ? 500 : 400,
                    }}
                  >
                    {c.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Summary card */}
        {hasSelections && (
          <div
            style={{
              marginTop: '2.5rem',
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              borderRadius: '8px',
              padding: '1.25rem 1.5rem',
            }}
          >
            <p
              style={{
                fontFamily: 'var(--font-sans)',
                color: 'var(--muted)',
                fontSize: '0.65rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: '0.75rem',
              }}
            >
              Your profile
            </p>
            <div className="flex flex-wrap gap-x-8 gap-y-2">
              {selectedState && (
                <div className="text-sm">
                  <span style={{ color: 'var(--muted)' }}>State </span>
                  <span
                    style={{ color: 'var(--text)', fontWeight: 500, fontFamily: 'var(--font-display)', fontSize: '0.9rem' }}
                  >
                    {STATES.find(s => s.id === selectedState)?.name}
                  </span>
                </div>
              )}
              {occupation && (
                <div className="text-sm">
                  <span style={{ color: 'var(--muted)' }}>Occupation </span>
                  <span style={{ color: 'var(--text)', fontWeight: 500 }}>{occupation}</span>
                </div>
              )}
              {climates.size > 0 && (
                <div className="text-sm">
                  <span style={{ color: 'var(--muted)' }}>Climate </span>
                  <span style={{ color: 'var(--text)', fontWeight: 500 }}>
                    {Array.from(climates)
                      .map(id => CLIMATES.find(c => c.id === id)?.label)
                      .join(', ')}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  )
}
