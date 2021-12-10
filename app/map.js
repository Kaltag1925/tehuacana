

var height = 5968;
var width = 7152;

var k = height / width;

// dataRaw = await d3.csv("data.csv")


// var randomLocation = () => ({x: Math.round(Math.random() * (4 - -4) + -4), y: Math.round(Math.random() * (4 - -4) + -4)})
// cities = dataRaw.map(a => a.City).reduce((cs, curCity) => cs.add(curCity), new Set())
// cityLocations = Array.from(cities).map(c => ({name: c, location: randomLocation()}))

// console.log(cities)
// data = cityLocations.map(c => ({city: c, amount: 0}))
// dataRaw.forEach(s => {
// 	const city = data.find(c => c.city.name == s.City)
// 	city.amount = city.amount + 1
// })

// var z = d3.scaleOrdinal()
// 	.domain(data.map(d => d[2]))
// 	.range(d3.schemeCategory10)

var x,y
function loadMap() {
	loadRanges()
	loadVisuals()
	// drawRailRoads()
	console.log("ran")
}

function loadRanges() {

	y = d3.scaleLinear()
		.domain([0, height])
		.range([0, height])
		
	x = d3.scaleLinear()
		.domain([0, width])
		.range([0, width])
}

function grid(g, x, y){
	g.attr("stroke", "currentColor")
	.attr("stroke-opacity", 0.1)
	.call(g => g
		.selectAll(".x")
		.data(x.ticks(12))
		.join(
		enter => enter.append("line").attr("class", "x").attr("y2", height),
		update => update,
		exit => exit.remove()
		)
		.attr("x1", d => 0.5 + x(d))
		.attr("x2", d => 0.5 + x(d)))
	.call(g => g
		.selectAll(".y")
		.data(y.ticks(12 * k))
		.join(
		enter => enter.append("line").attr("class", "y").attr("x2", width),
		update => update,
		exit => exit.remove()
		)
		.attr("y1", d => 0.5 + y(d))
		.attr("y2", d => 0.5 + y(d)));
}

function yAxis(g, y){
	g.call(d3.axisRight(y).ticks(12 * k))
	.call(g => g.select(".domain").attr("display", "none"))
}

function xAxis(g, x){
	g.attr("transform", `translate(0,${height})`)
	.call(d3.axisTop(x).ticks(12))
	.call(g => g.select(".domain").attr("display", "none"))
}

const zoom = d3.zoom()
	.scaleExtent([0.5, 32])
	.on("zoom", zoomed);

const svg = d3.select("#map").append("svg")
	.attr("viewBox", [0, 0, width, height]);

const image = svg.append("svg:image")

const gGrid = svg.append("g");

const gLines = svg.append("g");

const gDot = svg.append("g")
	.attr("fill", "red")
	.attr("stroke-linecap", "round");

const gLabel = gDot.append("g")

const gx = svg.append("g");

const gy = svg.append("g");

function zoomed({transform}) {
	const zx = transform.rescaleX(x).interpolate(d3.interpolateRound);
	const zy = transform.rescaleY(y).interpolate(d3.interpolateRound);
	gDot.attr("transform", transform).attr("stroke-width", 5 / transform.k);
	gx.call(xAxis, zx);
	gy.call(yAxis, zy);
	gGrid.call(grid, zx, zy);
	image.attr("transform", `translate(${transform.x} ${transform.y})scale(${transform.k})`)
	gLines.attr("transform", `translate(${transform.x} ${transform.y})scale(${transform.k})`)
}

function loadVisuals() {

	image.attr('x', x(0))
	.attr('y', y(0))
	.attr("xlink:href", "map.png")

	gDot.append("g").append("image")
	.attr("opacity", .2)
	.attr("width", width)
	.attr("height", height)

	gDot.selectAll("path")
	.data(Array.from(sourceData.cities.values()))
	.join("circle")
		.attr("opacity", .5)
		.attr("cx", d => x(d.x))
		.attr("cy", d => y(d.y))
		.attr("stroke", "grey")
		.attr("stroke-width", 1)
		.attr("data", d => (d))
		.attr("r", d => 50)//d.amount * 2)
		.attr("text", d => d.name)
		.attr("id", d => d.name)
		.on('click', function(d,i) {
			plotPath(i, sourceData.cities.get("TehuacanaTexas"))
			displayRouteInfo(i, sourceData.cities.get("TehuacanaTexas"))
		})
		.style('cursor', 'pointer')
		
	
	gLabel.selectAll("pointLabelText")
	.data(Array.from(sourceData.cities.values()))
	.join("text")
		.attr("opacity", 1)
		.attr("fill", "black")
		.attr("x", d => x(d.x))
		.attr("y", d => y(d.y) - 20)
		//.attr("transform", d => `rotate(-45,${x(d.location.x)},${y(d.location.y)})`)
		.attr("text-anchor", "middle")
		.text(d => d.name)// + ": " + d.amount)


	svg.call(zoom).call(zoom.transform, d3.zoomIdentity);

	console.log(svg)
	Object.assign(svg.node(), {
	reset() {
		svg.transition()
			.duration(750)
			.call(zoom.transform, d3.zoomIdentity);
	}
	});
}

function plotPath(start, end) {
	var x1 = start.x;
	var y1 = start.y;
	var x2 = end.x;
	var y2 = end.y;

	gLines.append("line")
		.attr("stroke", "green")
		.attr("x1", x(x1))
		.attr("y1", y(y1))
		.attr("x2", x(x2))
		.attr("y2", y(y2))
		.attr("stroke-dasharray", "60, 20")
		.attr("stroke-width", 20)
}

function path(start, finish) {
    var toExplore = [start]
	var explored = new Set()
	var map = new Map()
	map.set(start.cityID, null)
    while (toExplore.length > 0) {
        var n = toExplore.pop()
		if (n != null && !explored.has(n.cityID)) {
			explored.add(n.cityID)
			n.connections.forEach(c => { 
				if (!explored.has(c)) {
					toExplore.push(sourceData.connections.get(c));
					map.set(c, n.cityID)
				}
			}) //crash on cityID not found
		}
	}
	
	var path = []
	var cur = finish.cityID
	while (map.get(cur) != null) {
		path.push(cur)
		cur = map.get(cur)
		console.log(cur)
	}
	path.push(cur)
	
	path.map(id => sourceData.cities.get(id))
}

function drawRailRoads() {
	var connections = connectionValues().map(station => station.connections.map(c => cityToCityLine(sourceData.cities.get(station.cityID), sourceData.cities.get(c)))).flat()
	console.log(connections)
	gLines.selectAll("railLines")
		.data(connections)
		.join("line")
		.attr("stroke", "blue")
		.attr("x1", d => x(d.x1))
		.attr("y1", d => y(d.y1))
		.attr("x2", d => x(d.x2))
		.attr("y2", d => y(d.y2))
		.attr("stroke-linecap", "round")
		.attr("stroke-width", 20)
	console.log("drawn")
}

function cityToCityLine(c1, c2) {
	var x2, y2
	if (c2 == null) {
		x2 = 0
		y2 = 0
	} else {
		x2 = c2.x
		y2 = c2.y
	}

	return {x1: c1.x,
		y1: c1.y,
		x2: x2,
		y2: y2}
}

function displayRouteInfo(start, end) {
	var box = gLines.append("g").attr("transform", `translate(${start.x},${start.y})`)

	box.append("rect")
		.attr("width", 100)
		.attr("height", 100)
		.attr("fill", "white")

		box
		.append("foreignObject")
		.attr('width', 150)
		.attr('height', 100)
		.attr("dy", ".35em")
		.append("xhtml:body")
    .html(`<div style="width: 100px;">
			Estimated time by buggy (6mph): ${calculateBuggyRoute(start, end)}
			Estimated time by railroad (24mph): ${calculateRailroadRoute(start, end)}
		</div>`)
}

function calculateBuggyRoute(start, end) {
	var x1 = start.x;
	var y1 = start.y;
	var x2 = end.x;
	var y2 = end.y;

	var max = x2-x1 + y2-y1
	var min = Math.pow(Math.pow(x2-x1) + Math.pow(y2-y1), 0.5)

	return `Maximum: ${max/6} | Minimum: ${min/6}`
}

function calculateRailroadRoute(start, end) {
	var x1 = start.x;
	var y1 = start.y;
	var x2 = end.x;
	var y2 = end.y;

	var max = x2-x1 + y2-y1
	var min = Math.pow(Math.pow(x2-x1) + Math.pow(y2-y1), 0.5)

	return `Maximum: ${max/24} | Minimum: ${min/24}`
}
// 19th century texas geography railroad