import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

const VIEWBOX_WIDTH = 1120
const VIEWBOX_HEIGHT = 560

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function buildCurvePath(start, end) {
  const dx = end.x - start.x
  const cp1x = start.x + dx * 0.35
  const cp2x = start.x + dx * 0.65
  return `M ${start.x} ${start.y} C ${cp1x} ${start.y}, ${cp2x} ${end.y}, ${end.x} ${end.y}`
}

function buildGuidePath(points) {
  if (points.length < 2) {
    return ''
  }

  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 1; i < points.length; i += 1) {
    const segment = buildCurvePath(points[i - 1], points[i]).replace(/^M\s[^C]+/, '')
    d += ` ${segment}`
  }

  return d
}

function App() {
  const [stations, setStations] = useState([])
  const [lineColors, setLineColors] = useState({})
  const [fromStation, setFromStation] = useState('')
  const [toStation, setToStation] = useState('')
  const [routeData, setRouteData] = useState(null)
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const dragRef = useRef(null)

  useEffect(() => {
    async function fetchStations() {
      try {
        const response = await fetch('/api/stations')
        if (!response.ok) {
          throw new Error('Unable to load stations')
        }

        const payload = await response.json()
        setStations(payload.stations)
        setLineColors(payload.lineColors)
      } catch (apiError) {
        setError(apiError.message)
      }
    }

    fetchStations()
  }, [])

  const routePoints = useMemo(() => {
    if (!routeData?.path?.length) {
      return []
    }

    const width = VIEWBOX_WIDTH
    const height = VIEWBOX_HEIGHT
    const paddingX = 110
    const paddingY = 90
    const usableWidth = width - paddingX * 2
    const usableHeight = height - paddingY * 2
    const stepX = routeData.path.length > 1 ? usableWidth / (routeData.path.length - 1) : 0

    const usedLines = [...new Set(routeData.edges.map((edge) => edge.line))]
    const laneByLine = {}
    usedLines.forEach((line, index) => {
      const y = usedLines.length === 1
        ? height / 2
        : paddingY + (index * usableHeight) / (usedLines.length - 1)
      laneByLine[line] = y
    })

    let currentY = laneByLine[routeData.edges[0]?.line] ?? height / 2

    return routeData.path.map((station, index) => {
      if (index > 0) {
        const edge = routeData.edges[index - 1]
        currentY = laneByLine[edge.line] ?? currentY
      }

      const wave = routeData.path.length > 8 && index > 0 && index < routeData.path.length - 1
        ? (index % 2 === 0 ? -12 : 12)
        : 0

      return {
        station,
        x: clamp(paddingX + index * stepX, paddingX, width - paddingX),
        y: clamp(currentY + wave, paddingY, height - paddingY),
      }
    })
  }, [routeData])

  const labelLayout = useMemo(() => {
    if (!routeData?.path?.length || routePoints.length === 0) {
      return []
    }

    const lanes = {
      above: { offsets: [-24, -46, -68, -90], lastRight: [-Infinity, -Infinity, -Infinity, -Infinity] },
      below: { offsets: [30, 52, 74, 96], lastRight: [-Infinity, -Infinity, -Infinity, -Infinity] },
    }

    const layout = []

    routePoints.forEach((point, index) => {
      const isFirst = index === 0
      const isLast = index === routePoints.length - 1
      const isTransfer = index > 0 && routeData.edges[index - 1]?.line !== routeData.edges[index]?.line
      if (isLast) {
        layout.push({
          x: point.x,
          y: clamp(point.y - 28, 20, 538),
          angle: 0,
          anchor: 'middle',
          fullLabel: point.station,
          transfer: isTransfer,
        })
        return
      }

      if (isFirst) {
        layout.push({
          x: point.x,
          y: clamp(point.y + 34, 20, 538),
          angle: 0,
          anchor: 'middle',
          fullLabel: point.station,
          transfer: isTransfer,
        })
        return
      }

      const above = isLast ? true : index % 2 === 0
      const fullLabel = point.station
      const estWidth = Math.min(300, Math.max(70, fullLabel.length * 6.6))
      const angle = above ? -22 : 22
      const anchor = 'middle'
      const x = point.x

      const side = above ? lanes.above : lanes.below
      let laneIndex = 0
      let chosenGap = -Infinity

      for (let i = 0; i < side.offsets.length; i += 1) {
        let left = x - estWidth / 2
        let right = x + estWidth / 2

        if (anchor === 'start') {
          left = x
          right = x + estWidth
        }

        if (anchor === 'end') {
          left = x - estWidth
          right = x
        }

        const gap = left - side.lastRight[i]
        if (gap > 12) {
          laneIndex = i
          chosenGap = gap
          break
        }

        if (gap > chosenGap) {
          chosenGap = gap
          laneIndex = i
        }
      }

      let left = x - estWidth / 2
      let right = x + estWidth / 2

      if (anchor === 'start') {
        left = x
        right = x + estWidth
      }

      if (anchor === 'end') {
        left = x - estWidth
        right = x
      }

      side.lastRight[laneIndex] = Math.max(side.lastRight[laneIndex], right)
      const y = clamp(point.y + side.offsets[laneIndex], 20, 538)

      layout.push({
        x,
        y,
        angle,
        anchor,
        fullLabel,
        transfer: isTransfer,
      })
    })

    return layout
  }, [routeData, routePoints])

  const guidePath = useMemo(() => buildGuidePath(routePoints), [routePoints])

  function clampPan(nextPan, targetZoom) {
    const maxX = (VIEWBOX_WIDTH * (targetZoom - 1)) / 2
    const maxY = (VIEWBOX_HEIGHT * (targetZoom - 1)) / 2

    return {
      x: clamp(nextPan.x, -maxX, maxX),
      y: clamp(nextPan.y, -maxY, maxY),
    }
  }

  function changeZoom(nextZoom) {
    const safeZoom = clamp(nextZoom, 0.8, 2.2)
    setZoom(safeZoom)
    setPan((previousPan) => {
      const ratio = safeZoom / zoom
      return clampPan({ x: previousPan.x * ratio, y: previousPan.y * ratio }, safeZoom)
    })
  }

  function handleWheel(event) {
    if (!routeData) {
      return
    }

    event.preventDefault()
    const delta = event.deltaY < 0 ? 0.12 : -0.12
    changeZoom(zoom + delta)
  }

  function handlePointerDown(event) {
    if (!routeData) {
      return
    }

    setIsDragging(true)
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      panX: pan.x,
      panY: pan.y,
    }
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  function handlePointerMove(event) {
    if (!isDragging || !dragRef.current || dragRef.current.pointerId !== event.pointerId) {
      return
    }

    const dx = event.clientX - dragRef.current.startX
    const dy = event.clientY - dragRef.current.startY
    const nextPan = {
      x: dragRef.current.panX + dx,
      y: dragRef.current.panY + dy,
    }

    setPan(clampPan(nextPan, zoom))
  }

  function handlePointerUp(event) {
    if (dragRef.current && dragRef.current.pointerId === event.pointerId) {
      dragRef.current = null
      setIsDragging(false)
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  const canSearch = useMemo(() => {
    return fromStation && toStation && fromStation !== toStation && !loading
  }, [fromStation, toStation, loading])

  async function handleSubmit(event) {
    event.preventDefault()
    setError('')
    setRouteData(null)

    if (!canSearch) {
      setError('Please choose two different stations.')
      return
    }

    try {
      setLoading(true)
      const response = await fetch(
        `/api/route?from=${encodeURIComponent(fromStation)}&to=${encodeURIComponent(toStation)}`
      )
      const payload = await response.json()

      if (!response.ok) {
        throw new Error(payload.message || 'Failed to find route')
      }

      setRouteData(payload)
      setZoom(1)
      setPan({ x: 0, y: 0 })
    } catch (apiError) {
      setError(apiError.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <p className="eyebrow">Delhi-NCR Transit Planner</p>
        <h1>Shortest Metro Route Finder</h1>
        <p className="subhead">
          Choose your source and destination to get the fastest route, line changes,
          and a highlighted route ribbon in the metro theme.
        </p>

        <form className="route-form" onSubmit={handleSubmit}>
          <label>
            From Station
            <input
              list="station-options"
              value={fromStation}
              onChange={(e) => setFromStation(e.target.value)}
              placeholder="Start station"
            />
          </label>

          <label>
            To Station
            <input
              list="station-options"
              value={toStation}
              onChange={(e) => setToStation(e.target.value)}
              placeholder="End station"
            />
          </label>

          <button type="submit" disabled={!canSearch}>
            {loading ? 'Finding Best Route...' : 'Find Shortest Route'}
          </button>
        </form>

        <datalist id="station-options">
          {stations.map((station) => (
            <option key={station} value={station} />
          ))}
        </datalist>

        {error ? <p className="error-banner">{error}</p> : null}
      </section>

      <section className="content-grid">
        <article className="result-card">
          <h2>Journey Details</h2>
          {!routeData ? (
            <p className="hint">Route summary will appear here after searching.</p>
          ) : (
            <>
              <div className="metrics">
                <p>
                  <span>Total Time</span>
                  <strong>{routeData.totalTime} mins</strong>
                </p>
                <p>
                  <span>Total Stops</span>
                  <strong>{routeData.totalStops}</strong>
                </p>
              </div>

              <p className="path-line">
                <strong>Path:</strong> {routeData.path.join(' -> ')}
              </p>

              <h3>Step-by-step Instructions</h3>
              <ol className="steps-list">
                {routeData.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </>
          )}
        </article>

        <article className="map-card">
          <h2>Metro Route Ribbon</h2>
          <div className="map-frame schematic-frame">
            {routeData ? (
              <div className="ribbon-controls">
                <button type="button" onClick={() => changeZoom(zoom - 0.2)}>-</button>
                <span>{Math.round(zoom * 100)}%</span>
                <button type="button" onClick={() => changeZoom(zoom + 0.2)}>+</button>
                <button
                  type="button"
                  onClick={() => {
                    setZoom(1)
                    setPan({ x: 0, y: 0 })
                  }}
                  className="reset-btn"
                >
                  Reset
                </button>
              </div>
            ) : null}
            {routeData ? (
              <svg
                viewBox="0 0 1120 560"
                className={`route-svg ${isDragging ? 'dragging' : ''}`}
                aria-hidden="true"
                onWheel={handleWheel}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
                onPointerCancel={handlePointerUp}
              >
                <defs>
                  <linearGradient id="routeBackdrop" x1="0" x2="1" y1="0" y2="1">
                    <stop offset="0%" stopColor="#fff9ef" />
                    <stop offset="100%" stopColor="#eef8ff" />
                  </linearGradient>
                  <filter id="routeGlow" x="-25%" y="-25%" width="150%" height="150%">
                    <feGaussianBlur stdDeviation="6" result="blur" />
                    <feColorMatrix
                      in="blur"
                      type="matrix"
                      values="1 0 0 0 0.1 0 1 0 0 0.5 0 0 1 0 0.7 0 0 0 0.65 0"
                    />
                  </filter>
                </defs>

                <rect x="0" y="0" width={1120} height="560" fill="url(#routeBackdrop)" />
                <g transform={`translate(${560 * (1 - zoom) + pan.x} ${280 * (1 - zoom) + pan.y}) scale(${zoom})`}>
                  {guidePath ? (
                    <path
                      d={guidePath}
                      fill="none"
                      stroke="#dfe9f5"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ) : null}

                  {routeData.edges.map((edge, index) => {
                    const current = routePoints[index]
                    const next = routePoints[index + 1]

                    if (!current || !next) {
                      return null
                    }

                    const color = lineColors[edge.line] || '#1f64d6'
                    const segmentPath = buildCurvePath(current, next)

                    return (
                      <g key={`${edge.from}-${edge.to}-${index}`}>
                        <path
                          d={segmentPath}
                          fill="none"
                          stroke={color}
                          strokeWidth="14"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          filter="url(#routeGlow)"
                          opacity="0.45"
                        />
                        <path
                          d={segmentPath}
                          fill="none"
                          stroke={color}
                          strokeWidth="8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="route-segment"
                        />
                      </g>
                    )
                  })}

                  {routePoints.map((point, index) => {
                    const info = labelLayout[index]
                    const isEndpoint = index === 0 || index === routePoints.length - 1

                    return (
                      <g key={point.station}>
                        <circle cx={point.x} cy={point.y} r="13" className="route-halo" />
                        <circle cx={point.x} cy={point.y} r="7" className="route-stop" />
                        {info && !isEndpoint ? (
                          <text
                            x={info.x}
                            y={info.y}
                            textAnchor={info.anchor}
                            transform={`rotate(${info.angle} ${info.x} ${info.y})`}
                            className={`route-label${info.transfer ? ' transfer' : ''}`}
                          >
                            <title>{info.fullLabel}</title>
                            {info.fullLabel}
                          </text>
                        ) : null}
                      </g>
                    )
                  })}

                  {routePoints.length > 0 ? (
                    <g className="endpoint-labels">
                      <text
                        x={routePoints[0].x}
                        y={clamp(routePoints[0].y + 36, 20, 538)}
                        textAnchor="middle"
                        className="route-label endpoint-label endpoint-source"
                      >
                        <title>{routePoints[0].station}</title>
                        {routePoints[0].station}
                      </text>
                      <text
                        x={routePoints[routePoints.length - 1].x}
                        y={clamp(routePoints[routePoints.length - 1].y - 30, 20, 538)}
                        textAnchor="middle"
                        className="route-label endpoint-label endpoint-destination"
                      >
                        <title>{routePoints[routePoints.length - 1].station}</title>
                        {routePoints[routePoints.length - 1].station}
                      </text>
                    </g>
                  ) : null}
                </g>
              </svg>
            ) : (
              <div className="empty-map-state">
                Search two stations to generate the highlighted route ribbon.
              </div>
            )}
          </div>
          <p className="hint">The route is rendered as a themed schematic with glowing line colors and station nodes.</p>
        </article>
      </section>
    </main>
  )
}

export default App
