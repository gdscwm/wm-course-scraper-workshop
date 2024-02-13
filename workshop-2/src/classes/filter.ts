import {Attributes} from "../enums/attributes";
import {Status} from "../enums/status";
import {Levels} from "../enums/levels";
import {Subjects} from "../enums/subjects";
import {TermParts} from "../enums/term_part";

export class Filter {
    public term?: number;

    public attribute = Attributes.ALL;

    public secondaryAttribute = Attributes.ALL;

    public status = Status.ALL;

    public levels = Levels.ALL;

    public subject = Subjects.ALL;

    public termPart = TermParts.ALL;

    constructor(filters?: Partial<Filter>) {
        // check if filters actually got passed in
        // if so, use Object.assign to assign the filters to the present object
        if (filters) Object.assign(this, filters);
        return this;
    }

    public data() {
        // If there are valid filters selected, return all data that the filter object holds, like so:
        return {
            term: {id: 'term_code', value: this.term.toString()},
            subject: {id: 'term_subj', value: this.subject},
            attribute: {id: 'attr', value: this.attribute},
            secondaryAttribute: {id: 'attr2', value: this.secondaryAttribute},
            levels: {id: 'levl', value: this.levels},
            status: {id: 'status', value: this.status},
            termPart: {id: 'ptrm', value: this.termPart},
        }
    }

    public url() {
        // Call our data() function to get access to all filters
        const data = this.data()

        // The line below creates a new URL object with the base URL for the open course list
        const url = new URL('https://courselist.wm.edu/courselist/courseinfo/searchresults');

        // Loop through all the keys in the data {
        for (const key in data) {
            url.searchParams.append(data[key].id, data[key].value);
        }

        // This last key-value pair is always included at the end of the course list query
        url.searchParams.append('search', 'Search');

        // Finally, return the url you constructed
        return url;
    }
}