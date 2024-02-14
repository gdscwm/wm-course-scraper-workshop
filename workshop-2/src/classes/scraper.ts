import {Filter} from "./filter"
import {Course} from "./course"
import {Subjects} from "../enums/subjects"
import {Attributes} from "../enums/attributes"

const jsdom = require("jsdom");
const {JSDOM} = jsdom;

export class Scraper {
    private URL = new URL('https://courselist.wm.edu/courselist/');

    constructor() {
        return this;
    }

    public async courses(filters: Filter): Promise<Array<Readonly<Course>>> {
        // Get the URL object for the filter
        const url = filters.url();

        // Wait until the data from that URL is returned and assign it to dom
        const dom = await this.fetchAndParse(fetch(url.href, {
            method: 'GET',
            headers: {
                //'User-Agent': this.userAgent,
                'Accept': 'application/json, text/plain, */*',
            }
        }));

        // Return the extracted data from dom
        return this.extractCourses(dom);
    }

    private async fetchAndParse(req: Promise<Response>) {
        try {
            // Wait until the Promise is fulfilled
            const response = await req;
            // If we don't get the response we expect, throw an error
            if (!response.ok) await Promise.reject(new Error(`Request failed with status code ${response.status}`));

            // Otherwise, return the text of the response as parsed HTML
            return this.parseHTML(await response.text());
        } catch (e) {
            throw new Error('Request failed ' + e);
        }
    }

    private parseHTML(html: string) {
        try {
            return new JSDOM(html);
        } catch (e) {
            throw new Error('Failed to parse HTML ' + e);
        }
    }

    private extractCourses(dom: typeof JSDOM): Readonly<Course>[] {
        // Declare an array to the information stored in the table part of the page
        const info = Array()

        // Select just the table from the HTML page to read data from
        const table = dom.window.document.querySelector('tbody').children;

        // Extract course info from the table using a for loop
        for (const row of table) {
            const data = row.getElementsByTagName('td')

            for (const cell of data) {
                info.push(cell.textContent)
            }
        }

        // Declare an array to store full courses
        const courses = Array();

        // Divide info into arrays of course data (each course contains 11 strings)
        for (let i = 0; i < info.length; i += 11) {
            courses.push(info.slice(i, i + 11))
        }

        // Convert course data into Course objects by mapping our plaintext entry in courses to a new Course object
        return courses.map((course: Array<string>) => {
            return Object.freeze(new Course().fromTable(course));
        })
    }

}

