# W&M Course Scraper: Workshop 2

## Running your code

We're coding in TypeScript, which is essentially JavaScript with types. It's built on top of JavaScript, which means our
system won't run .ts files on their own; they first need to be compiled to JavaScript. There are two ways to do this.
The first is a little cleaner, but if it's not working for you for some reason, use the second.

##### Option 1: ts-node

Make sure you have ts-node installed with `npm ts-node -v`. If not, install it with `npm install -g ts-node` (the -g
flag installs this globally on your system). If you don't have npm installed, go back to workshop 1 and follow the setup
steps.

To run a source file, run this in your shell, replacing [filename] with the name of the file to run.

```shell
npx ts-node [filename].ts
```

##### Option 2: node

This is a two step process: first, compiling your TypeScript into JavaScript, then running the JavaScript. Run these
commands in your shell, replacing [filename] with the file to run:

1. `tsc [filename].ts`
2. `node [filename].js`

## Filter review

Last week, we finished our `Filter` class. It includes some public variables and the following functions:

- `constructor(filters?: Partial<Filter>)`
- `data()`
- `url()`

Let's take a closer look at what `Filter` and each of these functions are actually doing for us. In `lib.ts`, create a
new `Filter` object, making sure to pass in a term and at least a subject or attribute. I'm going to search for CSCI
COLL 400s.

```typescript
const filter = new Filter({
    subject: Subjects.COMPUTER_SCIENCE,
    attribute: Attributes.COLLEGE_400,
    term: 202420
})                          // creates a Filter object with the selected fields
console.log(filter)

const data = filter.data()  // Returns a dictionary with our filter fields in an easily URL-ifiable form
console.log(data)

const url = filter.url()    // Returns a URL object we can use to make a GET request to the W&M database
console.log(url)            // Logs the URL object with all headers, protocols, etc
console.log(url.href)       // Logs only the URL https://courselist.wm.edu/courselist/courseinfo/searchresults?term_code=202420&term_subj=CSCI&attr=C400&attr2=0&levl=0&status=0&ptrm=0&search=Search
```

Click on the URL returned by the last line. It should take you to the Open Course List page showing all CSCI COLL 400s!

In a second, we're going to see how to extract the course data returned by this URL. But before we do that, we have to
tell our program what a course is.

## Course

This class is going to hold the data for a single course. Looking at the results page for a search, what
information do we need to hold?

We'll need to hold information like `crn`, `course_title`, `instructor_name`, basically everything you see in a row in
the results table. The class will look something like this:

```

export class Course {

    public crn: number;

    public id: string;

    public attributes: Array<string> = [];

    ...

```

Add the appropriate fields to hold values for `instructor`, `credits`, etc.

Now let's add a function to the Course class to parse the data that is read from the table. Data parsing can be
messy business, so it'd be best if you copy the function below exactly and paste it into your Course class:

```

fromTable(data: Array<string>): Course {
        try {
            this.crn = parseInt(data[0].replace(/(\r\n|\n|\r)/gm, "").trim());
            
            this.id = data[1].replace(/(\r\n|\n|\r)/gm, "").trim();
            
            this.attributes = data[2].replace(/(\r\n|\n|\r)/gm, "").trim().split(',');
            
            this.title = data[3].replace(/(\r\n|\n|\r)/gm, "").trim();
            
            this.instructor = data[4].replace(/(\r\n|\n|\r)/gm, "").trim();
            
            this.credits = parseFloat(data[5].replace(/(\r\n|\n|\r)/gm, "").trim());
            
            this.times = data[6].replace(/(\r\n|\n|\r)/gm, "").trim();

            this.enrollment = {
                projected: parseInt(data[7].replace(/(\r\n|\n|\r)/gm, "").trim()),
                current: parseInt(data[8].replace(/(\r\n|\n|\r)/gm, "").trim()),
                available: parseInt(data[9].replace(/(\r\n|\n|\r)/gm, "").trim()),
            };

            this.status = data[10].replace(/(\r\n|\n|\r)/gm, "").trim();

            return this;

        } catch (e) {
            throw new Error("Error parsing course data: "+e);
        }
    }
```

Okay cool. Data parsed. No idea what tf it means though. What are all these .replace(\|\gm) things?

This looks pretty complicated, but it's really not that bad. We get passed in a string array `data`, which is going to
end up being the table part of the Open Course List data response. This is exactly the webpage we saw earlier with all
the CS C400s. (We'll write the function to get this data in a second.) The `data` array is split into 11 parts,
corresponding to each column in the course list table. Each line in the function is taking one of those 11 parts (
one cell in the table), cleaning it up with the help of our good friend regex, and assigning the cleaned, readable
version of that cell to the current `Course` object's corresponding field. If you want to know more, checkout the
.replace() and .trim() documentation.

## Getting scrapy with it

We now have all the building blocks we need to start scraping. Onto the good stuff!

Let's build a function to fetch courses matching a filter we give it. It's going to return a read-only array of courses.
The Promise bit of the return type is a way TypeScript lets you manage your resources better. It might take a second to
connect to the page we want over the network, which is valuable time the CPU could use to do other things. Instead of
making the program wait until we have a return value, we make the function `async`, meaning it's allowed to finish
processing in the background, and return a Promise, which is a placeholder object before our real return value comes
through.

We call async functions with `await function()`, which tells the program we need to wait until the Promise is fulfilled
before using what's returned.

```
public async courses(filters: Filter): Promise <Array<Readonly<Course>>> {
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
```

### A quick note on JSDOM

___
JSDOM is a JavaScript implementation that allows us to interact with HTML websites!

For our workshops, we are concerned about JSDOM's ability to scrape information from HTML.
Once we get the HTML from the open course list, we can pass it to our JSDOM instance,
and then access data by referencing the HTML tags that we're familiar with.

For example:

```
const dom = new JSDOM(`<p>Hello world</p>`);
console.log(dom.window.document.querySelector("p").textContent); // "Hello world"
```

Above, we created a JSDOM object that has a single `<p>` HTML element,
which we can access through the JSDOM `querySelector` function.
This becomes very powerful when we can select data from an entire webpage, which we will do in this workshop!
___

The above function introduces two new ones we have to write: `fetchAndParse()`, to fetch the data from the URL and parse
the returned HTML into something readable, and `extractCourses()`, to take that parsed data and turn it into Course
objects we can use.

Let's do `fetchAndParse()` first. It's going to take a Response object as a parameter, which is what gets returned from
that fetch request we made in `courses()`. A fetch request is just your program saying, hey, can I get this data from
your database? This is who I am, and here's the specific parts of the data I want (the URL parameters).

```
private async fetchAndParse(req: Promise<Response>) {
    try {
        // Wait until the Promise is fulfilled
        const response = await req;
        // If we don't get the response we expect, throw an error
        if (!response.ok) await Promise.reject(new Error(`Request failed with status code ${response.status}`));

        // Otherwise, return the text of the response as parsed HTML
        return this.parseHTML(await res.text());
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
```

Remember, we're (basically) fetching the webpage returned by the URL we're making the fetch request with. So this is
going to return all the text on that webpage, including the table.

Next, `extractCourses()` is going to take that parsed text, and parse it even further into an array of Course objects.
It's going to look something like this:

```
private extractCourses(dom: typeof JSDOM): Readonly <Course>[]
{
    // Declare an array to the information stored in the table part of the page
    // TODO

    // Select just the table from the HTML page to read data from
    const table = dom.window.document.querySelector('tbody').children;

    // Extract course info from the table using a for loop
    // TODO

    // Declare an array to store full courses
    // TODO

    // Divide info into arrays of course data (each course contains 11 strings)
    // TODO

    // Convert course data into Course objects by mapping our plaintext entry in courses to a new Course object
    return courses.map((course: Array<string>) => {
        return Object.freeze(new Course().fromTable(course));
    })
}
```

Sick!! Now our `courses()` function should work! Let's test it out!

So that TypeScript doesn't yell at us, we have to throw our test code into an `async` function. In `lib.ts`, define such
a function like so (underneath your previous filter tests):

```typescript
async function main() {
    // Define a new Scraper
    // TODO

    // Get the courses associated with that filter
    // TODO

    // Log 'em
    // TODO
}

main()
```

You should get an array of all the courses that match your filter.

So... that's pretty much it! This is a web scraper. We just reverse engineered the Open Course List so that instead of
having direct access to the database it uses, we make the Open Course List our middle man to do the direct database
stuff for us.

If we wrote some HTML, we could literally recreate the Open Course List on top of the scraper we just wrote. Maybe then
someone would write a scraper for our scraper, and make an Open Course List twice removed ... courselistception.

DSC's Jason LaPierre wrote the original [scraper](https://www.npmjs.com/package/wm-fetch) we adapted to this workshop.
He has a bunch more cool functions and other additions in there that you can explore.

# Sources

https://www.npmjs.com/package/wm-fetch -- DSC's very own Jason wrote the original package we adapted for this workshop

https://courselist.wm.edu/courselist/