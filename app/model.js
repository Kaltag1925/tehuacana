function loadData(){
    // Student :: ([ID], [Name, CityID]
    sourceData = {students: new Map(), cities: new Map()}
    d3.csv("data.csv").then(d => loadStudents(d)).then(
        d3.csv("cityLocations.csv").then(d => loadCities(d)).then(d =>
            loadLayout()).then(d =>
                loadMap()
            ))
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
    console.log(data)
    data.forEach(c => cits.set(cityID(c), buildCity(c)))
    console.log(cits)
    sourceData.cities = cits
}

function cityValues() {
    return Array.from(sourceData.cities.values())
}

function studentValues() {
    return Array.from(sourceData.students.values())
}