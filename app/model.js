function loadData(){
    // Student :: ([ID], [Name, CityID]
    sourceData = {students: new Map(), cities: new Map(), connections: new Map()}
    d3.csv("data.csv").then(d => loadStudents(d)).then(
        d3.csv("cityLocations.csv").then(d => loadCities(d)).then(
            d3.json("stations.json").then(d => loadLines(d)).then(d =>
            loadLayout()).then(d =>
                loadMap()
            )))
}

function buildStudent(student) {
    return {first: student.First, 
        middle: student.Middle, 
        last: student.Last, 
        cityID: student.City + student.State}
}

function studentID(student) {
    return student.First + student.Middle + student.Last + student.City + student.State
}

function loadStudents(data) {
    var studs = new Map();
    data.forEach(s => studs.set(studentID(s), buildStudent(s)))
    sourceData.students = studs   
}

function buildCity(city) {
    var x, y
    if (city.X) {
        x = city.X
        y = city.Y
    } else {
        x = 0//Math.round(Math.random() * 3000)
        y = 0//Math.round(Math.random() * 3000)
    }

    return {name: city.City, state: city.State, x: x, y: y}
}

function cityID(city) {
    return city.City + city.State
}

function loadCities(data) {
    var cits = new Map();
    data.forEach(c => {
        const id = cityID(c)
        const obj = buildCity(c)
        if (!cits.get(id)) {
            cits.set(id, obj)
        } else {
            console.log(`WARNING There exists duplicate cities in data ${c.Name}, ${c.State}`)
            return
        }
    })
    console.log(cits)
    sourceData.cities = cits
}

function loadLines(data) {
    var lns = new Map();
    console.log(data)
    data.forEach(c => {
        const id = c.id
        const city = sourceData.cities.get(id)
        if (city == null) {
            console.log(`WARNING Station ${id} does not have a city associated with it`)
            return
        }
        const obj = {cityID: id, connections: c.connections}
        if (!lns.get(id)) {
            lns.set(id, obj)
        } else {
            console.log(`WARNING There exists duplicate connections in data`)
            return
        }
    }) 

    sourceData.connections = lns
}

function cityValues() {
    return Array.from(sourceData.cities.values())
}

function studentValues() {
    return Array.from(sourceData.students.values())
}

function connectionValues() {
    return Array.from(sourceData.connections.values())
}

// function lineMappingData() {
//     var start = sourceData.cities.get("AustinTexas") // this is lazy but w/e
//     var lines = [[{x: start.x, y: start.y}]]
//     var toExplore = start.connections
//     var prev = start
//     while (toExplore.length() > 0) {
//         var n = toExplore.pop()
        
//     }
// }