import { useEffect, useMemo, useRef, useState } from "react";
import Select from "react-select";
import "./App.css";

const VIEWBOX_WIDTH = 1120;
const VIEWBOX_HEIGHT = 560;

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function buildCurvePath(start, end) {
  const dx = end.x - start.x;
  const cp1x = start.x + dx * 0.35;
  const cp2x = start.x + dx * 0.65;
  return `M ${start.x} ${start.y} C ${cp1x} ${start.y}, ${cp2x} ${end.y}, ${end.x} ${end.y}`;
}

function buildGuidePath(points) {
  if (points.length < 2) {
    return "";
  }

  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 1; i < points.length; i += 1) {
    const segment = buildCurvePath(points[i - 1], points[i]).replace(
      /^M\s[^C]+/,
      "",
    );
    d += ` ${segment}`;
  }

  return d;
}

function App() {
  const [stations, setStations] = useState([]);
  const [lineColors, setLineColors] = useState({});
  const [fromStation, setFromStation] = useState("");
  const [toStation, setToStation] = useState("");
  const [routeData, setRouteData] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const dragRef = useRef(null);

  useEffect(() => {
    async function fetchStations() {
      try {
        const response = await fetch("/api/stations");
        if (!response.ok) {
          throw new Error("Unable to load stations");
        }

        const payload = await response.json();
        setStations(payload.stations);
        setLineColors(payload.lineColors);
      } catch (apiError) {
        setError(apiError.message);
      }
    }

    fetchStations();
  }, []);

  const routePoints = useMemo(() => {
    if (!routeData?.path?.length) {
      return [];
    }

    const width = VIEWBOX_WIDTH;
    const height = VIEWBOX_HEIGHT;
    const paddingX = 110;
    const paddingY = 90;
    const usableWidth = width - paddingX * 2;
    const usableHeight = height - paddingY * 2;
    const stepX =
      routeData.path.length > 1 ? usableWidth / (routeData.path.length - 1) : 0;

    const usedLines = [...new Set(routeData.edges.map((edge) => edge.line))];
    const laneByLine = {};
    usedLines.forEach((line, index) => {
      const y =
        usedLines.length === 1
          ? height / 2
          : paddingY + (index * usableHeight) / (usedLines.length - 1);
      laneByLine[line] = y;
    });

    let currentY = laneByLine[routeData.edges[0]?.line] ?? height / 2;

    return routeData.path.map((station, index) => {
      if (index > 0) {
        const edge = routeData.edges[index - 1];
        currentY = laneByLine[edge.line] ?? currentY;
      }

      const wave =
        routeData.path.length > 8 &&
        index > 0 &&
        index < routeData.path.length - 1
          ? index % 2 === 0
            ? -12
            : 12
          : 0;

      return {
        station,
        x: clamp(paddingX + index * stepX, paddingX, width - paddingX),
        y: clamp(currentY + wave, paddingY, height - paddingY),
      };
    });
  }, [routeData]);

  const labelLayout = useMemo(() => {
    if (!routeData?.path?.length || routePoints.length === 0) {
      return [];
    }

    const lanes = {
      above: {
        offsets: [-24, -46, -68, -90],
        lastRight: [-Infinity, -Infinity, -Infinity, -Infinity],
      },
      below: {
        offsets: [30, 52, 74, 96],
        lastRight: [-Infinity, -Infinity, -Infinity, -Infinity],
      },
    };

    const layout = [];

    routePoints.forEach((point, index) => {
      const isFirst = index === 0;
      const isLast = index === routePoints.length - 1;
      const isTransfer =
        index > 0 &&
        routeData.edges[index - 1]?.line !== routeData.edges[index]?.line;
      if (isLast) {
        layout.push({
          x: point.x,
          y: clamp(point.y - 28, 20, 538),
          angle: 0,
          anchor: "middle",
          fullLabel: point.station,
          transfer: isTransfer,
        });
        return;
      }

      if (isFirst) {
        layout.push({
          x: point.x,
          y: clamp(point.y + 34, 20, 538),
          angle: 0,
          anchor: "middle",
          fullLabel: point.station,
          transfer: isTransfer,
        });
        return;
      }

      const above = isLast ? true : index % 2 === 0;
      const fullLabel = point.station;
      const estWidth = Math.min(300, Math.max(70, fullLabel.length * 6.6));
      const angle = above ? -22 : 22;
      const anchor = "middle";
      const x = point.x;

      const side = above ? lanes.above : lanes.below;
      let laneIndex = 0;
      let chosenGap = -Infinity;

      for (let i = 0; i < side.offsets.length; i += 1) {
        let left = x - estWidth / 2;
        let right = x + estWidth / 2;

        if (anchor === "start") {
          left = x;
          right = x + estWidth;
        }

        if (anchor === "end") {
          left = x - estWidth;
          right = x;
        }

        const gap = left - side.lastRight[i];
        if (gap > 12) {
          laneIndex = i;
          chosenGap = gap;
          break;
        }

        if (gap > chosenGap) {
          chosenGap = gap;
          laneIndex = i;
        }
      }

      let left = x - estWidth / 2;
      let right = x + estWidth / 2;

      if (anchor === "start") {
        left = x;
        right = x + estWidth;
      }

      if (anchor === "end") {
        left = x - estWidth;
        right = x;
      }

      side.lastRight[laneIndex] = Math.max(side.lastRight[laneIndex], right);
      const y = clamp(point.y + side.offsets[laneIndex], 20, 538);

      layout.push({
        x,
        y,
        angle,
        anchor,
        fullLabel,
        transfer: isTransfer,
      });
    });

    return layout;
  }, [routeData, routePoints]);

  const guidePath = useMemo(() => buildGuidePath(routePoints), [routePoints]);

  function clampPan(nextPan, targetZoom) {
    const maxX = (VIEWBOX_WIDTH * (targetZoom - 1)) / 2;
    const maxY = (VIEWBOX_HEIGHT * (targetZoom - 1)) / 2;

    return {
      x: clamp(nextPan.x, -maxX, maxX),
      y: clamp(nextPan.y, -maxY, maxY),
    };
  }

  function changeZoom(nextZoom) {
    const safeZoom = clamp(nextZoom, 0.8, 2.2);
    setZoom(safeZoom);
    setPan((previousPan) => {
      const ratio = safeZoom / zoom;
      return clampPan(
        { x: previousPan.x * ratio, y: previousPan.y * ratio },
        safeZoom,
      );
    });
  }

  function handleWheel(event) {
    if (!routeData) {
      return;
    }

    event.preventDefault();
    const delta = event.deltaY < 0 ? 0.12 : -0.12;
    changeZoom(zoom + delta);
  }

  function handlePointerDown(event) {
    if (!routeData) {
      return;
    }

    setIsDragging(true);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      panX: pan.x,
      panY: pan.y,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function handlePointerMove(event) {
    if (
      !isDragging ||
      !dragRef.current ||
      dragRef.current.pointerId !== event.pointerId
    ) {
      return;
    }

    const dx = event.clientX - dragRef.current.startX;
    const dy = event.clientY - dragRef.current.startY;
    const nextPan = {
      x: dragRef.current.panX + dx,
      y: dragRef.current.panY + dy,
    };

    setPan(clampPan(nextPan, zoom));
  }

  function handlePointerUp(event) {
    if (dragRef.current && dragRef.current.pointerId === event.pointerId) {
      dragRef.current = null;
      setIsDragging(false);
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
  }

  const canSearch = useMemo(() => {
    return fromStation && toStation && fromStation !== toStation && !loading;
  }, [fromStation, toStation, loading]);

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setRouteData(null);

    if (!canSearch) {
      setError("Please choose two different stations.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `/api/route?from=${encodeURIComponent(fromStation)}&to=${encodeURIComponent(toStation)}`,
      );
      const payload = await response.json();

      if (!response.ok) {
        throw new Error(payload.message || "Failed to find route");
      }

      setRouteData(payload);
      setZoom(1);
      setPan({ x: 0, y: 0 });
    } catch (apiError) {
      setError(apiError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app-shell">
      <section className="hero-panel">
        <p className="eyebrow">Delhi-NCR Transit Planner</p>
        <h1>Shortest Metro Route Finder</h1>
        <p className="subhead">
          Choose your source and destination to get the fastest route, line
          changes, and a highlighted route ribbon in the metro theme.
        </p>

        <form className="route-form" onSubmit={handleSubmit}>
          <label>
            From Station
            <Select
              className="station-select"
              classNamePrefix="select"
              options={stations.map((s) => ({ value: s, label: s }))}
              value={
                fromStation ? { value: fromStation, label: fromStation } : null
              }
              onChange={(opt) => setFromStation(opt ? opt.value : "")}
              placeholder="Start station"
              isClearable
            />
          </label>

          <label>
            To Station
            <Select
              className="station-select"
              classNamePrefix="select"
              options={stations.map((s) => ({ value: s, label: s }))}
              value={toStation ? { value: toStation, label: toStation } : null}
              onChange={(opt) => setToStation(opt ? opt.value : "")}
              placeholder="End station"
              isClearable
            />
          </label>

          <button type="submit" disabled={!canSearch}>
            {loading ? "Finding Best Route..." : "Find Shortest Route"}
          </button>
        </form>

        {error ? <p className="error-banner">{error}</p> : null}
      </section>

      <section className="content-grid">
        <article className="result-card">
          <h2>Journey Details</h2>
          {!routeData ? (
            <p className="hint">
              Route summary will appear here after searching.
            </p>
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
                <strong>Path:</strong> {routeData.path.join(" -> ")}
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

        <article className="map-card ribbon-card">
          <h2>Vertical Route Timeline</h2>
          <div className="vertical-ribbon schematic-frame">
            {!routeData ? (
              <div className="empty-map-state">
                Search two stations to generate the highlighted route ribbon.
              </div>
            ) : (
              <div className="timeline-list">
                {routeData.path.map((station, index) => {
                  const edgeOut = routeData.edges[index];
                  const edgeIn = index > 0 ? routeData.edges[index - 1] : null;
                  const isSegmentStart =
                    edgeOut && (!edgeIn || edgeOut.line !== edgeIn.line);

                  // Use outgoing edge color if departing, incoming if arriving at final destination
                  const dotColor = edgeOut
                    ? lineColors[edgeOut.line]
                    : edgeIn
                      ? lineColors[edgeIn.line]
                      : "#7a7f89";

                  // Find segment details for the left box
                  let segmentInfo = null;
                  if (isSegmentStart) {
                    segmentInfo = routeData.segments.find(
                      (seg) =>
                        seg.line === edgeOut.line && seg.from === station,
                    ) || { line: edgeOut.line, to: "Unknown" };
                  }

                  const isTransfer = isSegmentStart && index > 0;

                  return (
                    <div
                      className={`station-row ${isTransfer ? "transfer-gap" : ""}`}
                      key={`${station}-${index}`}
                    >
                      <div className="station-left">
                        {segmentInfo && (
                          <div className="segment-info-box">
                            <div className="line-name">
                              ↓ {segmentInfo.line} Line
                            </div>
                            <div
                              className="line-dir"
                              style={{ color: dotColor }}
                            >
                              Towards {segmentInfo.to}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="station-center">
                        <div
                          className="station-dot"
                          style={{ backgroundColor: dotColor }}
                        />
                        {edgeOut && (
                          <div
                            className="station-line"
                            style={{ backgroundColor: "#a0aec0" }}
                          />
                        )}
                      </div>
                      <div className="station-right">{station}</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </article>
      </section>
    </main>
  );
}

export default App;
