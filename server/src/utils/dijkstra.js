function findShortestRoute(graph, start, end) {
  const queue = [{ station: start, time: 0 }];
  const bestTime = {};
  const previous = {};

  for (const station of Object.keys(graph)) {
    bestTime[station] = Number.POSITIVE_INFINITY;
    previous[station] = null;
  }

  bestTime[start] = 0;

  while (queue.length > 0) {
    queue.sort((a, b) => a.time - b.time);
    const current = queue.shift();

    if (!current) {
      break;
    }

    if (current.station === end) {
      break;
    }

    if (current.time > bestTime[current.station]) {
      continue;
    }

    for (const neighbor of graph[current.station]) {
      const nextTime = current.time + neighbor.time;

      if (nextTime < bestTime[neighbor.station]) {
        bestTime[neighbor.station] = nextTime;
        previous[neighbor.station] = {
          station: current.station,
          line: neighbor.line,
          time: neighbor.time
        };
        queue.push({ station: neighbor.station, time: nextTime });
      }
    }
  }

  if (bestTime[end] === Number.POSITIVE_INFINITY) {
    return null;
  }

  const path = [];
  let pointer = end;

  while (pointer) {
    path.unshift(pointer);
    const prev = previous[pointer];
    pointer = prev ? prev.station : null;
  }

  return {
    path,
    totalTime: bestTime[end]
  };
}

function buildJourneySegments(edges) {
  if (edges.length === 0) {
    return [];
  }

  const grouped = [];
  let active = {
    line: edges[0].line,
    from: edges[0].from,
    to: edges[0].to,
    stops: 1,
    time: edges[0].time
  };

  for (let i = 1; i < edges.length; i += 1) {
    const edge = edges[i];
    if (edge.line === active.line) {
      active.to = edge.to;
      active.stops += 1;
      active.time += edge.time;
    } else {
      grouped.push(active);
      active = {
        line: edge.line,
        from: edge.from,
        to: edge.to,
        stops: 1,
        time: edge.time
      };
    }
  }

  grouped.push(active);
  return grouped;
}

module.exports = {
  findShortestRoute,
  buildJourneySegments
};
