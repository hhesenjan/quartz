// @ts-nocheck -- The upstream renderer uses the D3 and Pixi browser globals supplied by its CDN assets.
/*!
 * Browser drawing and interaction code from @quartz-community/graph v1.0.0,
 * src/components/scripts/graph.inline.ts, commit e647019c05ab2a3279c9cddd7bc2f18acb9858b8.
 * Local changes bind renderer, simulation, and animation-frame lifetime to the mount's AbortSignal.
 * MIT License
 *
 * Copyright (c) 2026 Quartz Community
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
import { simplifySlug, resolveBasePath } from "@quartz-community/utils"

// Resolves CSS color values containing calc()/var() that PixiJS cannot parse.
// Uses a temp DOM element so the browser's CSS engine evaluates the expression.
function resolveColor(value, fallback) {
  if (!value) return fallback
  var el = document.createElement("div")
  el.style.color = value
  el.style.position = "absolute"
  el.style.visibility = "hidden"
  document.body.appendChild(el)
  var resolved = getComputedStyle(el).color
  el.remove()
  return resolved || fallback
}

export async function renderGraph(
  graph: HTMLElement,
  fullSlug: string,
  dataRaw: ContentIndex,
  visited: ReadonlySet<string>,
  signal: AbortSignal,
) {
  if (signal.aborted || !graph.isConnected) return
  const { d3, PIXI } = window
  const slug = simplifySlug(fullSlug) || "index"

  var config = JSON.parse(graph.dataset["cfg"] || "{}")
  var enableDrag = config.drag
  var enableZoom = config.zoom
  var depth = config.depth
  var scale = config.scale || 1
  var repelForce = config.repelForce || 0.5
  var centerForce = config.centerForce || 0.3
  var linkDistance = config.linkDistance || 30
  var fontSize = config.fontSize || 0.6
  var opacityScale = config.opacityScale || 1
  var removeTags = config.removeTags || []
  var showTags = config.showTags
  var focusOnHover = config.focusOnHover
  var enableRadial = config.enableRadial

  var data = new Map()
  for (const key in dataRaw) data.set(simplifySlug(key), dataRaw[key])

  var width = graph.offsetWidth
  var height = Math.max(graph.offsetHeight, 250)

  var links = []
  var allTags = []
  var validLinks = new Set(data.keys())

  data.forEach(function (details, source) {
    var outgoing = details.links || []
    for (var i = 0; i < outgoing.length; i++) {
      var dest = simplifySlug(outgoing[i])
      if (validLinks.has(dest)) {
        links.push({ source: source, target: dest })
      }
    }

    if (showTags) {
      var tags = details.tags || []
      for (var i = 0; i < tags.length; i++) {
        var tag = tags[i]
        if (removeTags.indexOf(tag) === -1) {
          var tagSlug = simplifySlug("tags/" + tag)
          if (allTags.indexOf(tagSlug) === -1) {
            allTags.push(tagSlug)
          }
          links.push({ source: source, target: tagSlug })
        }
      }
    }
  })

  var neighbourhood = new Set()
  if (depth >= 0) {
    var queue = [slug]
    var seen = new Set([slug])
    for (var d = 0; d <= depth && queue.length > 0; d++) {
      var nextQueue = []
      for (var qi = 0; qi < queue.length; qi++) {
        var cur = queue[qi]
        neighbourhood.add(cur)
        for (var li = 0; li < links.length; li++) {
          var link = links[li]
          if (link.source === cur && !seen.has(link.target)) {
            seen.add(link.target)
            nextQueue.push(link.target)
          }
          if (link.target === cur && !seen.has(link.source)) {
            seen.add(link.source)
            nextQueue.push(link.source)
          }
        }
      }
      queue = nextQueue
    }
  } else {
    validLinks.forEach(function (id) {
      neighbourhood.add(id)
    })
    for (var i = 0; i < allTags.length; i++) {
      neighbourhood.add(allTags[i])
    }
  }

  var nodes = []
  var nodeMap = new Map()
  neighbourhood.forEach(function (url) {
    var isTag = url.startsWith("tags/")
    var text = isTag ? "#" + url.substring(5) : data.get(url)?.title || url
    var nodeTags = isTag ? [] : data.get(url)?.tags || []
    var node = {
      id: url,
      text: text,
      tags: nodeTags,
      x: Math.random() * width - width / 2,
      y: Math.random() * height - height / 2,
      vx: 0,
      vy: 0,
    }
    nodes.push(node)
    nodeMap.set(url, node)
  })

  var graphLinks = []
  for (var i = 0; i < links.length; i++) {
    var link = links[i]
    if (neighbourhood.has(link.source) && neighbourhood.has(link.target)) {
      var sourceNode = nodeMap.get(link.source)
      var targetNode = nodeMap.get(link.target)
      if (sourceNode && targetNode) {
        graphLinks.push({ source: sourceNode, target: targetNode })
      }
    }
  }

  var styles = getComputedStyle(document.documentElement)
  var secondary = resolveColor(styles.getPropertyValue("--secondary").trim(), "#c792ea")
  var tertiary = resolveColor(styles.getPropertyValue("--tertiary").trim(), "#82aaff")
  var gray = resolveColor(styles.getPropertyValue("--gray").trim(), "#6c6c6c")
  var lightgray = resolveColor(styles.getPropertyValue("--lightgray").trim(), "#d4d4d4")
  var dark = resolveColor(styles.getPropertyValue("--dark").trim(), "#1a1a1a")
  var light = resolveColor(styles.getPropertyValue("--light").trim(), "#f5f5f5")
  var bodyFont = styles.getPropertyValue("--bodyFont").trim() || "inherit"

  const app = new PIXI.Application()
  let simulation
  let frame = 0
  function dispose() {
    cancelAnimationFrame(frame)
    simulation?.stop()
    try {
      // The boolean shortcut also clears Pixi's shared batches while another graph is drawing.
      app.destroy({ removeView: true }, { children: true })
    } catch {
      // Pixi may already have lost the WebGL context or failed to initialize.
    }
  }

  try {
    await app.init({
      width: width,
      height: height,
      antialias: true,
      autoStart: false,
      backgroundAlpha: 0,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
      eventMode: "static",
    })

    // The graph may have closed, changed theme, or navigated while Pixi initialized.
    if (signal.aborted || !graph.isConnected) {
      dispose()
      return
    }
    signal.addEventListener("abort", dispose, { once: true })
    graph.replaceChildren(app.canvas)
    var stage = new PIXI.Container()
    app.stage.addChild(stage)

    simulation = d3
      .forceSimulation(nodes)
      .force("charge", d3.forceManyBody().strength(-100 * repelForce))
      .force("center", d3.forceCenter().strength(centerForce))
      .force("link", d3.forceLink(graphLinks).distance(linkDistance))
      .force(
        "collide",
        d3
          .forceCollide()
          .radius(function (d) {
            var numLinks = 0
            for (var i = 0; i < graphLinks.length; i++) {
              if (graphLinks[i].source.id === d.id || graphLinks[i].target.id === d.id) {
                numLinks++
              }
            }
            return 2 + Math.sqrt(numLinks)
          })
          .iterations(3),
      )

    if (enableRadial) {
      var radius = (Math.min(width, height) / 2) * 0.8
      simulation.force("radial", d3.forceRadial(radius).strength(0.2))
    }

    var linkContainer = new PIXI.Container()
    var nodesContainer = new PIXI.Container()
    var labelsContainer = new PIXI.Container()
    stage.addChild(linkContainer)
    stage.addChild(nodesContainer)
    stage.addChild(labelsContainer)

    var nodeRenderData = []
    var linkRenderData = []
    var hoveredNodeId = null
    var hoveredNeighbours = new Set()
    var dragStartTime = 0
    var dragging = false
    var currentTransform = d3.zoomIdentity

    function nodeRadius(d) {
      var numLinks = 0
      for (var i = 0; i < graphLinks.length; i++) {
        if (graphLinks[i].source.id === d.id || graphLinks[i].target.id === d.id) {
          numLinks++
        }
      }
      return 2 + Math.sqrt(numLinks)
    }

    function nodeColor(d) {
      var isCurrent = d.id === slug
      if (isCurrent) {
        return secondary
      } else if (visited.has(d.id) || d.id.startsWith("tags/")) {
        return tertiary
      } else {
        return gray
      }
    }

    function updateHoverInfo(newHoveredId) {
      hoveredNodeId = newHoveredId

      if (newHoveredId === null) {
        hoveredNeighbours = new Set()
        for (var i = 0; i < nodeRenderData.length; i++) {
          nodeRenderData[i].active = false
        }
        for (var i = 0; i < linkRenderData.length; i++) {
          linkRenderData[i].active = false
        }
      } else {
        hoveredNeighbours = new Set()

        for (var i = 0; i < linkRenderData.length; i++) {
          var linkData = linkRenderData[i].simulationData
          if (linkData.source.id === newHoveredId || linkData.target.id === newHoveredId) {
            hoveredNeighbours.add(linkData.source.id)
            hoveredNeighbours.add(linkData.target.id)
            linkRenderData[i].active = true
          } else {
            linkRenderData[i].active = false
          }
        }

        hoveredNeighbours.add(newHoveredId)

        for (var i = 0; i < nodeRenderData.length; i++) {
          if (hoveredNeighbours.has(nodeRenderData[i].simulationData.id)) {
            nodeRenderData[i].active = true
          } else {
            nodeRenderData[i].active = false
          }
        }
      }
    }

    function renderLinks() {
      for (var i = 0; i < linkRenderData.length; i++) {
        var linkData = linkRenderData[i]
        var alpha = 1
        if (hoveredNodeId !== null) {
          alpha = linkData.active ? 1 : 0.2
        }
        linkData.alpha = alpha
        linkData.color = linkData.active ? gray : lightgray
      }
    }

    function renderLabels() {
      var defaultScale = 1 / scale
      var activeScale = defaultScale * 1.1

      for (var i = 0; i < nodeRenderData.length; i++) {
        var nodeData = nodeRenderData[i]
        if (hoveredNodeId === nodeData.simulationData.id) {
          nodeData.label.alpha = 1
          nodeData.label.scale.set(activeScale)
        } else {
          nodeData.label.scale.set(defaultScale)
        }
      }
    }

    function renderNodes() {
      for (var i = 0; i < nodeRenderData.length; i++) {
        var nodeData = nodeRenderData[i]
        var alpha = 1
        if (hoveredNodeId !== null && focusOnHover) {
          alpha = nodeData.active ? 1 : 0.2
        }
        nodeData.gfx.alpha = alpha
      }
    }

    function renderPixiFromD3() {
      renderNodes()
      renderLinks()
      renderLabels()
    }

    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i]
      var nodeId = node.id
      var isTagNode = nodeId.startsWith("tags/")
      var radius = nodeRadius(node)
      var color = nodeColor(node)

      var label = new PIXI.Text({
        text: node.text,
        style: {
          fontSize: fontSize * 15,
          fill: dark,
          fontFamily: bodyFont,
        },
        resolution: window.devicePixelRatio * 4,
      })
      label.anchor.set(0.5, 1.2)
      label.alpha = 0
      label.scale.set(1 / scale)
      labelsContainer.addChild(label)

      var gfx = new PIXI.Graphics()
      gfx.circle(0, 0, radius)
      gfx.fill({ color: isTagNode ? light : color })
      if (isTagNode) {
        gfx.stroke({ width: 2, color: tertiary })
      }

      gfx.eventMode = "static"
      gfx.cursor = "pointer"
      gfx.label = nodeId

      ;(function (n, g, labelRef) {
        var oldLabelOpacity = 0
        g.on("pointerover", function (e) {
          updateHoverInfo(n.id)
          oldLabelOpacity = labelRef.alpha
          if (!dragging) {
            renderPixiFromD3()
          }
        })

        g.on("pointerleave", function () {
          updateHoverInfo(null)
          labelRef.alpha = oldLabelOpacity
          if (!dragging) {
            renderPixiFromD3()
          }
        })
      })(node, gfx, label)

      nodesContainer.addChild(gfx)

      nodeRenderData.push({
        simulationData: node,
        gfx: gfx,
        label: label,
        color: color,
        alpha: 1,
        active: false,
      })
    }

    for (var i = 0; i < graphLinks.length; i++) {
      var link = graphLinks[i]
      var gfx = new PIXI.Graphics()
      gfx.eventMode = "none"
      linkContainer.addChild(gfx)

      linkRenderData.push({
        simulationData: link,
        gfx: gfx,
        color: lightgray,
        alpha: 1,
        active: false,
      })
    }

    if (enableDrag) {
      var dragSubject = function (event) {
        var mouseX = (event.x - currentTransform.x) / currentTransform.k
        var mouseY = (event.y - currentTransform.y) / currentTransform.k

        for (var i = 0; i < nodes.length; i++) {
          var n = nodes[i]
          var dx = mouseX - n.x - width / 2
          var dy = mouseY - n.y - height / 2
          var dist = Math.sqrt(dx * dx + dy * dy)
          var rad = nodeRadius(n)
          if (dist < rad + 5) {
            return n
          }
        }
        return null
      }

      var dragStarted = function (event) {
        if (!event.active) simulation.alphaTarget(1).restart()
        event.subject.fx = event.subject.x
        event.subject.fy = event.subject.y
        var mouseSimX = (event.x - currentTransform.x) / currentTransform.k - width / 2
        var mouseSimY = (event.y - currentTransform.y) / currentTransform.k - height / 2
        event.subject.__dragOffset = {
          x: mouseSimX - event.subject.x,
          y: mouseSimY - event.subject.y,
        }
        dragStartTime = Date.now()
        dragging = true
        hoveredNodeId = event.subject.id
      }

      var dragDragged = function (event) {
        var mouseSimX = (event.x - currentTransform.x) / currentTransform.k - width / 2
        var mouseSimY = (event.y - currentTransform.y) / currentTransform.k - height / 2
        event.subject.fx = mouseSimX - event.subject.__dragOffset.x
        event.subject.fy = mouseSimY - event.subject.__dragOffset.y
      }

      var dragEnded = function (event) {
        if (!event.active) simulation.alphaTarget(0)
        event.subject.fx = null
        event.subject.fy = null
        dragging = false
        updateHoverInfo(null)
        renderPixiFromD3()

        if (Date.now() - dragStartTime < 500) {
          var target = resolveBasePath(event.subject.id)
          window.location.href = target
        }
      }

      var drag = d3
        .drag()
        .container(app.canvas)
        .subject(dragSubject)
        .on("start", dragStarted)
        .on("drag", dragDragged)
        .on("end", dragEnded)

      d3.select(app.canvas).call(drag)
    } else {
      for (var i = 0; i < nodeRenderData.length; i++) {
        ;(function (nodeData) {
          nodeData.gfx.on("click", function () {
            var target = resolveBasePath(nodeData.simulationData.id)
            window.location.href = target
          })
        })(nodeRenderData[i])
      }
    }

    if (enableZoom) {
      var zoomed = function (event) {
        currentTransform = event.transform
        stage.scale.set(currentTransform.k, currentTransform.k)
        stage.position.set(currentTransform.x, currentTransform.y)

        var newScale = currentTransform.k * opacityScale
        var scaleOpacity = Math.max((newScale - 1) / 3.75, 0)

        var activeLabels = []
        for (var i = 0; i < nodeRenderData.length; i++) {
          if (nodeRenderData[i].active) {
            activeLabels.push(nodeRenderData[i].label)
          }
        }

        for (var i = 0; i < labelsContainer.children.length; i++) {
          var label = labelsContainer.children[i]
          if (activeLabels.indexOf(label) === -1) {
            label.alpha = scaleOpacity
          }
        }
      }

      var zoom = d3
        .zoom()
        .extent([
          [0, 0],
          [width, height],
        ])
        .scaleExtent([0.25, 4])
        .on("zoom", zoomed)

      d3.select(app.canvas).call(zoom)
    }

    function animate() {
      for (var i = 0; i < nodeRenderData.length; i++) {
        var n = nodeRenderData[i]
        var x = n.simulationData.x
        var y = n.simulationData.y
        if (x != null && y != null) {
          n.gfx.position.set(x + width / 2, y + height / 2)
          if (n.label) {
            n.label.position.set(x + width / 2, y + height / 2)
          }
        }
      }

      for (var i = 0; i < linkRenderData.length; i++) {
        var l = linkRenderData[i]
        var linkData = l.simulationData
        var sx = linkData.source.x
        var sy = linkData.source.y
        var tx = linkData.target.x
        var ty = linkData.target.y
        if (sx != null && sy != null && tx != null && ty != null) {
          l.gfx.clear()
          l.gfx.moveTo(sx + width / 2, sy + height / 2)
          l.gfx.lineTo(tx + width / 2, ty + height / 2)
          l.gfx.stroke({ alpha: l.alpha, width: 1, color: l.color })
        }
      }

      frame = requestAnimationFrame(animate)
    }

    simulation.restart()
    renderPixiFromD3()
    animate()

    app.start()
  } catch (error) {
    signal.removeEventListener("abort", dispose)
    dispose()
    throw error
  }
}
