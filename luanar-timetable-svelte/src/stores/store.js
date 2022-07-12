import { writable } from "svelte/store";
import ads from "./ads"
import message from "./message"
import reads from "./reads"
import UuidObj from "./uuid"

//parameters
let programmeName = "BAAE";
let yearNumber = 3;
let semesterNumber = 2;
let versionNumber = "2.0.0";
let siteName = "https://butaopeter.netlify.app";
let mailName = "peterethanbutao:gmail.com"



class CommonObj {
    constructor(prog, sy, sem, ver, aut, air, tnm, site, mail) {
        this.programme = prog;
        this.studyYear = sy;
        this.semester = sem;
        this.version = ver;
        this.authour = aut;
        this.phone = {
            airtel: air,
            tnm: tnm
        },
            this.website = site;
        this.gmail = mail;
    }
}

const common = [new CommonObj(programmeName, yearNumber, semesterNumber, versionNumber, "peter butao", "0991894703", "0880164455", siteName, mailName)];


class WeekdayObj {
    constructor(wd, dy, intm, fntm, loc, typ) {
        this.weekday = wd;
            this.day = dy;
        this.initialTime = `${intm}:00`;
            this.finalTime = `${fntm}:00`;
            this.location = loc;
            this.type = typ;
            this.hours = fntm - intm;
    }
}



class CourseObj {
    constructor(crs, cd, typ, gpa, wd) {
        this.id = UuidObj.uuid();
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
    static idOne() {

        const str = 'abcdefghijklm';
        const num = Math.floor(Math.random() * 13);
        const strNum = num - 1

        const subStr = str.substring(strNum, num);
        const idNum = Math.floor(Math.random() * 9);

        return `${subStr}${idNum}`

    };

}






const courses = [
    //monday
    new CourseObj("MACROECONOMIC THEORY","AAE321","CORE",2.0,
        [
            new WeekdayObj("Friday",5, "10", "12", "A36 HALL 1", "lecture"),
            //new WeekdayObj("Thursday",4, "09", "11", "MPH", "lecture")
            
        ] 
    ),
    new CourseObj("ECONOMETRICS II","AAE322","CORE",3.5,
        [
            new WeekdayObj("Monday",1, "13", "15", "A36 HALL 4", "lecture"),
            new WeekdayObj("Tuesday",2, "13", "16", "A36 HALL 3", "tutorial")
            
        ] 
    ),

    //wednesday
    new CourseObj("FARM BUSINESS MANAGEMENT II","AAE323","CORE",3.0,
        [
            new WeekdayObj("Wednesday",3, "10", "12", "A36 HALL 4", "lecture"),
            new WeekdayObj("Thursday",4, "07", "09", "A36 HALL 2", "tutorial")
            
        ] 
    ),


    //friday
    new CourseObj("MARKET AND PRICE ANALYSIS","AAE324","CORE",3.5,
        [
            new WeekdayObj("Thursday", 4, "14", "17", "MCH 3", "lecture"),
            new WeekdayObj("Friday", 5, "08", "09", "MCH 3", "tutorial")
            
        ] 
    ),

    
    new CourseObj("AGRICULTURAL TRADE THEORY AND POLICY","AAE325","CORE",2.5,
        [
            new WeekdayObj("Wednesday",3, "08", "09", "A36 HALL 2", "lecture"),
            new WeekdayObj("Wednesday",3, "09", "10", "A36 HALL 4", "lecture"),
            new WeekdayObj("Thursday",4, "09", "10", "A36 HALL 2", "tutorial"),
            
            
        ] 
    ),
    new CourseObj("INTRODUCTION TO STATISTICAL PACKAGES","AAE326","CORE",2.0,
        [
            new WeekdayObj("Monday",1, "08", "11", "A36 HALL 1", "lecture"),
            //new WeekdayObj("Tuesday",2, "17", "19", "HALL", "tutorial")
            
            
        ] 
    ),
    new CourseObj("THEORIES OF ECONOMIC GROWH AND DEVELOPMENT I","DEC321","NON-CORE",2.5,
        [
            new WeekdayObj("Friday",5, "13", "17", "A36 HALL 1", "lecture"),
            //new WeekdayObj("Tuesday",2, "17", "19", "HALL", "tutorial")
            
            
        ] 
    ),

]




export const data = writable({ courses, common, reads, message, ads })

