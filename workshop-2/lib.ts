import {Attributes} from "./src/enums/attributes";
import {Levels} from "./src/enums/levels";
import {Status} from "./src/enums/status";
import {Subjects} from "./src/enums/subjects";
import {TermParts} from "./src/enums/term_part";
import {Filter} from "./src/classes/filter";
import {Scraper} from "./src/classes/scraper";

const filter = new Filter({
    subject: Subjects.COMPUTER_SCIENCE,
    attribute: Attributes.COLLEGE_400,
    term: 202420
})

async function main() {
    const scraper = new Scraper();

    const courses = await scraper.courses(filter);

    console.log(courses);
}

main()