# W&M Course Scraper

## Setup

Create a new directory somewhere on your system called `wm-course-scraper`. Open up your favorite IDE (if you don't have
one, try [VSCode](https://code.visualstudio.com/)), and open your new directory in it.

Now we're going to set up the file structure and add a couple configuration files so that everything runs right. If
you're interested in learning more about the contents of these files, check out the docs for package.json and
tsconfig.json.

In `wm-course-scraper`, create a directory `src`. In `src`, create two directories: `classes` and `enums`.

Back in `wm-course-scraper`, create files `package.json` and `tsconfig.json`. Copy the contents of the corresponding
files in this Github to those files. Essentially what we're doing here is defining for javascript and typescript where
to find important parts of our code and how to process them.

You can check that your file structure is correct by making sure it matches what's in this repository.

Now open a terminal window (you can use your system shell, or the one that comes with your IDE. To open a terminal
in VSCode, in the main menu go to Terminal -> Open new terminal). Check that npm (the package manager we'll be using) is
installed by running

```shell
npm -v
```

This should output some version number. If it doesn't, install Node (the parent of
npm) [here](https://nodejs.org/en/download/).

Once you have npm installed, run

```shell
npm install typescript
```

This will allow us to code in typescript.

```shell
npm install --save-dev @types/jsdom
```

This will allow us to access parts of the Open Course List webpage.

```shell
npm i
```

This will install any remaining dependencies.

If you reach here before the rest of the workshop, feel free to move on to the next section and start inspecting the
open
course list.

## Inspecting the Open Course List

Let's start by inspecting the existing open course list and seeing if we can reverse engineer it. Go to
[courselist.wm.edu](courselist.wm.edu). Open up the inspect dock by right-clicking anywhere on the webpage
and clicking "inspect". A new part of the window should appear with the html code for the page. This is the dock.

Take a moment to expand some of the body containers. When you hover over a container in the dock, it should highlight
the corresponding section of the page.

Notice that the body of the page (the body in html is everything you see on the screen) is divided into 3 parts: header,
footer, and content. Content is the whole middle section of the site, from "Select options for search" to the search
button.
Expanding content, we see that it is made up of a header ("Select options for search"), and a form that contains
everything else.

The "action" attribute for a form means that on submit, all the information contained in that form should be sent to the
location defined in the action. (It also defines the request method as GET, which means that on submit, the request is
simply going to read the data. This doesn't matter much for our purposes, but if you're interested in learning more,
check out our [FastAPI workshop series](https://github.com/gdscwm/fastapi-workshop-series/tree/main/workshop-one).)

In the form container, we have seven divs with the class type phoneHeader, and the submit button at the end. The seven
divs are what hold the values that get passed in the GET request so the site knows what courses to display on submit.

Try changing some of the form values and hitting search. What does the URL look like? How are the attributes you chose
identified? What does the HTML for the webpage look like now?

## Defining our enums

To send requests to the open course list, we need to construct URLs that look _exactly like_ the ones you see when you
click `Search`.
For example, if I select classes with the subject `Classical Civilization`, this is specified in the url like so:

```
term_subj=CLCV 
```

and similarly for all other fields in the search form.

So, to construct proper URLs, we need to get all of the codes that the open course list uses
for `Subject`, `Attribute`, `Level`, and so on.
This would take a lot of copy-paste! Thankfully, we've already compiled all the codes as `Enums` in the
directory `wm-course-scraper/src/enums`.
(Bonus question -- what is `Enum` short for??)

Go ahead and copy all the files in the enums directory into your local `src/enums` directory. These files hold the
values that we will use to construct our URLs.

How did we know what values to put in all of these files? In your inspect tab, in the `<form>` section, open one of
the `<div class="phoneHeader">` sections. Dig down until you reach a section like `<select name="...`. Expand this
section, and note all of the `<option>` sections within the select. Compare these HTML sections with what we have
compiled in `subjects.ts`, for example. Note that how `<option value="BIOL">Biology</Biology>`
becomes `BIOLOGY = 'BIOL'`, for example.

Now, we have all of the appropriate fields to construct our URLs!

## Getting testy

Before we go further, let's create a file `lib.ts` in `wm-course-scraper`. This is where we're going to gather and
export all our source code. Today, we'll also use it as a place to throw our tests.

In `lib.ts`, import all the enums we just created like this:

```typescript
import {Attributes} from "./src/enums/attributes";
import {Levels} from "./src/enums/levels";
import {Status} from "./src/enums/status";
import {Subjects} from "./src/enums/subjects";
import {TermParts} from "./src/enums/term_part";

console.log(Subjects)
```

The console log at the bottom there is similar to a Python print line. It'll print to your shell whatever arguments are
passed to it, in this case, the entire Subjects enum.

To run our code, it's a two-step process: first, we have to compile our typescript code into javascript, which is
runnable, and second, run the javascript. Run these commands in your shell to do that:

1. Compile to javascript (this will create .js copies of all the files in your directory)

```shell
tsc lib.ts
```

2. Run the resulting javascript file

```shell
node lib.js
```

You should see an output with the entire Subjects enum. If you don't, raise your hand.

## Course, filter, scraper, oh my!

Now we can finally get to the good stuff: actually coding our web scraper. Create three new files
in `wm-fetch-test/src/classes`:

1. `course.ts`. This is where we're going to process course data we get from the open course list into something we can
   use.
2. `filter.ts`. This is where we're going to build up a URL to perform a GET request, like we were looking at on the
   site.
3. `scraper.ts`. This is the heart and soul of our code. Everything else lives here.

#### course.ts

First, we need a class that can hold the data for a single course. Looking at the results page for a search, what
information do we need to hold?
We'll need to hold information like `crn`, `course_title`, `instructor_name`, basically everything you see in a row in
the results table.
The class will look something like this:

```
export class Course {
    public crn: number;
    public id: string;
    public attributes: Array<string> = [];
    ...
```

Add the appropriate fields to hold values for `instructor`, `credits`, etc.

Next, still within the Course class definition, we can add a helpful function that will tell us if the Course is open or
not.
The function will look something like:

```
    isOpen(): boolean {
        // check if the course's status is Status.OPEN
    }
```
Finally, we'll add a function to the Course class to parse the data that is read from the table. Data parsing can be messy business,
so it'd be best if you copy the function below exactly and paste it into your Course class:
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
            throw new ScraperError("Error parsing course data: "+e);
        }
    }
```
#### filter.ts
Next, we'll build a Filter class that contains the data on the specific criteria we can pass to our searchs (e.g. subject, attribute, level...)
This class will look similar to the Course class, in that the entire file (besides the imports) will be the class definition!

First, include your imports:

```
import { Attributes } from "../enums/attributes";
import {Status} from "../enums/status";
import {Levels} from "../enums/levels";
import {Subjects} from "../enums/subjects";
import {TermParts} from "../enums/term_part";
```

And we'll quickly define a `FilterError` class that describes any errors that we run into while constructing filters. Paste this just below the imports.
```
class FilterError extends Error {
    constructor(message: string) {
        super(`W&M Scrapper Error: ${message}`);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
```

Now, we can start the `Filter` class! Start your class definition like so: 
```
export class Filter {
    public term?: number;

    public attribute = Attributes.ALL;

    public secondaryAttribute = Attributes.ALL;
    ...
```
Make sure to add class attributes for all possible filters that users can select when searching for open courses.

Next, still within the class defintion, we need to provide a constructor for a specific filter. This constructor takes in 
as many filter attributes as possible and assigns them to the current filter object. 
```
    constructor(filters?: Partial<Filter>) {
        // check if filters actually got passed in
            // if so, use Object.assign to assign the filters to the present object
        return this;
    }
```

Next, we need to create a function that returns all the data a filter object holds. Define your function like so:
```
    public data() {
        // A user must specify either an attribute or a subject -- if neither are included, throw an error

        // If there are valid filters selected, return all data that the filter object holds, like so:
        return {
            term: { id: 'term_code', value: this.term.toString() },
            subject: { id: 'term_subj', value: this.subject },
            // Complete for all Course attributes
        }
    }
```

Finally, we actually need to build a URL from the specified filter. Define a function the same way as `data()`, but call it `url()`. 
```
    public url() {
        // Call our data() function to get access to all filters

        // The line below creates a new URL object with the base URL for the open course list
        const url = new URL('https://courselist.wm.edu/courselist/courseinfo/searchresults');

        // Loop through all the keys in the data {
            url.searchParams.append(data[key].id, data[key].value);
        }

        // This last key-value pair is always included at the end of the course list query
        url.searchParams.append('search', 'Search');

        // Finally, return the url you constructed

    }
```

Nice! We now have a class to hold all the possible filters that users can specify, and a way to construct URLs from them!

#### scraper.ts

A lot of functions are going to live in this file. Let's start at the beginning: the constructor. All we need our
constructor to do is return an instance of Scraper that we can use other class methods on. Similar to Python, we need to
access class methods with the "this" keyword. So we would simply write:

```typescript
export class Scraper {
    constructor() {
        return this;
    }
}
```

We should also define any class variables here. We'll need a URL instance to craft our GET requests later, so let's
define that at the start too.

```typescript
export class Scraper {
    private URL = new URL('https://courselist.wm.edu/courselist/');

    constructor() {
        return this;
    }
}
```

~~- constructor, privateURL~~

- all (show example)
- fetchAndParse/parseHTML
- courses (show example)
- extractCourses
- terms/latestTerm at end or before extractCourses

# Sources

https://www.npmjs.com/package/wm-fetch -- DSC's very own Jason wrote the original package we adapted for this workshop
