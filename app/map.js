
var height = 600;
var width = 600;

var k = height / width;

dataRaw = await d3.csv("data.csv")


var randomLocation = () => ({x: Math.round(Math.random() * (4 - -4) + -4), y: Math.round(Math.random() * (4 - -4) + -4)})
cities = dataRaw.map(a => a.City).reduce((cs, curCity) => cs.add(curCity), new Set())
cityLocations = Array.from(cities).map(c => ({name: c, location: randomLocation()}))

console.log(cities)
data = cityLocations.map(c => ({city: c, amount: 0}))
dataRaw.forEach(s => {
	const city = data.find(c => c.city.name == s.City)
	city.amount = city.amount + 1
})

loadLayout()
var z = d3.scaleOrdinal()
	.domain(data.map(d => d[2]))
	.range(d3.schemeCategory10)

var y = d3.scaleLinear()
	.domain([-4.5 * k, 4.5 * k])
	.range([height, 0])
	
var x = d3.scaleLinear()
	.domain([-4.5, 4.5])
	.range([0, width])

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

const gGrid = svg.append("g");

const gDot = svg.append("g")
	.attr("fill", "red")
	.attr("stroke-linecap", "round");

gDot.append("g").append("image")
.attr("opacity", .2)
.attr("width", width)
.attr("height", height)

gDot.selectAll("path")
.data(data)
.join("circle")
	.attr("opacity", .5)
	.attr("cx", d => x(d.city.location.x))
	.attr("cy", d => y(d.city.location.y))
	.attr("stroke", "grey")
	.attr("stroke-width", 1)
	.attr("data", d => (d))
	.attr("r", d => d.amount * 2)
	.attr("text", d => d.city.name)
	.attr("id", d => d.city.name)
	
const pointsLabels = gDot.append("g")
.selectAll("pointLabelText")
.data(data)
.join("text")
	.attr("opacity", 1)
	.attr("fill", "black")
	.attr("x", d => x(d.city.location.x))
	.attr("y", d => y(d.city.location.y))
	//.attr("transform", d => `rotate(-45,${x(d.location.x)},${y(d.location.y)})`)
	.attr("text-anchor", "middle")
	.text(d => d.city.name + ": " + d.amount)

const gx = svg.append("g");

const gy = svg.append("g");

svg.call(zoom).call(zoom.transform, d3.zoomIdentity);

function zoomed({transform}) {
	const zx = transform.rescaleX(x).interpolate(d3.interpolateRound);
	const zy = transform.rescaleY(y).interpolate(d3.interpolateRound);
	gDot.attr("transform", transform).attr("stroke-width", 5 / transform.k);
	gx.call(xAxis, zx);
	gy.call(yAxis, zy);
	gGrid.call(grid, zx, zy);
}

console.log(svg)
Object.assign(svg.node(), {
reset() {
	svg.transition()
		.duration(750)
		.call(zoom.transform, d3.zoomIdentity);
}
});
