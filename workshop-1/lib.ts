import {Attributes} from "./src/enums/attributes";
import {Levels} from "./src/enums/levels";
import {Status} from "./src/enums/status";
import {Subjects} from "./src/enums/subjects";
import {TermParts} from "./src/enums/term_part";
import {Filter} from "./src/classes/filter";

const filter = new Filter({
    subject: Subjects.COMPUTER_SCIENCE,
    attribute: Attributes.COLLEGE_400,
    term: 202420
})
console.log(filter)

const url = filter.url();
console.log(url.href)   // should log https://courselist.wm.edu/courselist/courseinfo/searchresults?term_code=202420&term_subj=CSCI&attr=C400&attr2=0&levl=0&status=0&ptrm=0&search=Search