

class CourseObj {
    constructor(crs, cd, typ, gpa, wd) {
        this.date = CourseObj.date();
        this.course = crs;
        this.type = typ;
        this.gpa = gpa;
        this.code = cd;
        this.weekdays = wd;
    }
    static date() {
        return new Date().getDate()
    }
}

class readObj {
    constructor(wd, dy) {

        this.weekday = wd,
        this.day = dy;
        this.initialTime = `20:00`,
        this.finalTime = `23:00`,
        this.location = `NORWAY / LIBRAY / CLASS`,
        this.type = `READ`,
        this.hours = 3
    }
}

const reads = [
    //monday
    new CourseObj("plant physiology", "AGN321", "non-core", 0.0,
        [
            new readObj("Monday", 1)

        ]
    ),
    //tuesday
    new CourseObj("farm structures and facilities", "AGE323", "non-core", 0.0,
        [
            new readObj("Tuesday", 2)


        ]
    ),
    //wednesday
    new CourseObj("seed health", "SSY422", "core", 0.0,
        [
            new readObj("Wednesday", 3)

        ]
    ),

    //thursday

    new CourseObj("seed enterprise development, financing and planning", "SSY322", "core", 0.0,
        [
            new readObj("Thursday", 4)

        ]
    ),

    //friday
    new CourseObj("management of extension and rural development programmes", "EXT324", "non-core", 0.0,
        [
            new readObj("Friday", 5)

        ]
    )
]

module.exports = reads