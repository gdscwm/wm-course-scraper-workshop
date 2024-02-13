# W&M Course Scraper: Workshop 1

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

#### scraper.ts

Why not start with the heart and soul of our code?

Let's start at the beginning: the constructor. All we need our
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

The next function we're going to implement is one to return all the courses in the course list. But to make that work,
we have to implement our Filter class.

[//]: # (```typescript)

[//]: # (public async)

[//]: # (all&#40;term)

[//]: # (:)

[//]: # (int)

[//]: # (&#41;:)

[//]: # (Promise < Array > {)

[//]: # (    // create an array to store our courses)

[//]: # (    const courses = Array&#40;&#41;;)

[//]: # ()

[//]: # (    // get all our subjects except the ALL subject)

[//]: # (    const subjects = Object.values&#40;Subjects&#41;.slice&#40;1&#41;;)

[//]: # ()

[//]: # (    const filters = subjects.map&#40;subject => new Filter&#40;{subject, ...term}&#41;&#41;;)

[//]: # (    const res = await Promise.all&#40;filters.map&#40;filter => this.courses&#40;filter&#41;&#41;&#41;;)

[//]: # (    courses.push&#40;...res.flat&#40;&#41;&#41;)

[//]: # ()

[//]: # (    return courses;)

[//]: # (})

[//]: # (```)

#### filter.ts

Next, we'll build a Filter class that contains the data on the specific criteria we can pass to our searches (e.g.
subject, attribute, level...)

First, include your imports:

```
import { Attributes } from "../enums/attributes";
import {Status} from "../enums/status";
import {Levels} from "../enums/levels";
import {Subjects} from "../enums/subjects";
import {TermParts} from "../enums/term_part";
```

Now, we can start the `Filter` class! Start your class definition like so:

```
export class Filter {
    public term?: number;

    public attribute = Attributes.ALL;

    public secondaryAttribute = Attributes.ALL;
    ...
```

We want to add class attributes like this for all possible filters that users can select when searching for open
courses. Hint: it'll match up with all the files we imported up top.

Next, still within the class definition, we need to provide a constructor for a specific filter. This constructor takes
in as many filter attributes as possible and assigns them to the current filter object.

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

Finally, we actually need to build a URL from the specified filter. Define a function the same way as `data()`, but call
it `url()`.

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

Nice! We now have a class to hold all the possible filters that users can specify, and a way to construct URLs from
them!

Let's test this out to make sure everything's working as expected. In `lib.ts`, construct a new filter like so:

```typescript
const filter = new Filter({
    subject: Subjects.COMPUTER_SCIENCE,
    attribute: Attributes.COLLEGE_400,
    term: 202420
})
console.log(filter)
```

This should return a `Filter` object with attribute: C400, subject: CSCI, and term: 202420, with the rest of the values

0. (Remember to first compile `lib.ts` to javascript with `tsc lib.ts`, then run the resulting .js file
   with `node lib.js`.)

We can also test that we're constructing our URL correctly:

```typescript
const url = filter.url();
console.log(url.href)   // should log https://courselist.wm.edu/courselist/courseinfo/searchresults?term_code=202420&term_subj=CSCI&attr=C400&attr2=0&levl=0&status=0&ptrm=0&search=Search
```

[//]: # (#### Cooking with grease &#40;and filters&#41;)

[//]: # ()

[//]: # (Let's put it all together! In order to test async functions, we'll need to create a main function in our lib.ts so that)

[//]: # (we can await their responses. Add this to your lib.ts:)

[//]: # ()

[//]: # (```typescript)

[//]: # (async function main&#40;&#41; {)

[//]: # (    const scraper = new Scraper&#40;&#41;;)

[//]: # (    const courses = await scraper.all&#40;202420&#41;;)

[//]: # (    console.log&#40;courses&#41;)

[//]: # (})

[//]: # ()

[//]: # (main&#40;&#41;)

[//]: # (```)

[//]: # ()

[//]: # (Remember to call main at the end. When you run lib.ts again, it should return a list of all the courses for the term we)

[//]: # (passed in, Spring 2024!)

[//]: # (#### course.ts)

[//]: # ()

[//]: # (First, we need a class that can hold the data for a single course. Looking at the results page for a search, what)

[//]: # (information do we need to hold?)

[//]: # (We'll need to hold information like `crn`, `course_title`, `instructor_name`, basically everything you see in a row in)

[//]: # (the results table.)

[//]: # (The class will look something like this:)

[//]: # ()

[//]: # (```)

[//]: # (export class Course {)

[//]: # (    public crn: number;)

[//]: # (    public id: string;)

[//]: # (    public attributes: Array<string> = [];)

[//]: # (    ...)

[//]: # (```)

[//]: # ()

[//]: # (Add the appropriate fields to hold values for `instructor`, `credits`, etc.)

[//]: # ()

[//]: # (Next, still within the Course class definition, we can add a helpful function that will tell us if the Course is open or)

[//]: # (not.)

[//]: # (The function will look something like:)

[//]: # ()

[//]: # (```)

[//]: # (    isOpen&#40;&#41;: boolean {)

[//]: # (        // check if the course's status is Status.OPEN)

[//]: # (    })

[//]: # (```)

[//]: # ()

[//]: # (Finally, we'll add a function to the Course class to parse the data that is read from the table. Data parsing can be)

[//]: # (messy business,)

[//]: # (so it'd be best if you copy the function below exactly and paste it into your Course class:)

[//]: # ()

[//]: # (```)

[//]: # (fromTable&#40;data: Array<string>&#41;: Course {)

[//]: # (        try {)

[//]: # (            this.crn = parseInt&#40;data[0].replace&#40;/&#40;\r\n|\n|\r&#41;/gm, ""&#41;.trim&#40;&#41;&#41;;)

[//]: # (            this.id = data[1].replace&#40;/&#40;\r\n|\n|\r&#41;/gm, ""&#41;.trim&#40;&#41;;)

[//]: # (            this.attributes = data[2].replace&#40;/&#40;\r\n|\n|\r&#41;/gm, ""&#41;.trim&#40;&#41;.split&#40;','&#41;;)

[//]: # (            this.title = data[3].replace&#40;/&#40;\r\n|\n|\r&#41;/gm, ""&#41;.trim&#40;&#41;;)

[//]: # (            this.instructor = data[4].replace&#40;/&#40;\r\n|\n|\r&#41;/gm, ""&#41;.trim&#40;&#41;;)

[//]: # (            this.credits = parseFloat&#40;data[5].replace&#40;/&#40;\r\n|\n|\r&#41;/gm, ""&#41;.trim&#40;&#41;&#41;;)

[//]: # (            this.times = data[6].replace&#40;/&#40;\r\n|\n|\r&#41;/gm, ""&#41;.trim&#40;&#41;;)

[//]: # (            this.enrollment = {)

[//]: # (                projected: parseInt&#40;data[7].replace&#40;/&#40;\r\n|\n|\r&#41;/gm, ""&#41;.trim&#40;&#41;&#41;,)

[//]: # (                current: parseInt&#40;data[8].replace&#40;/&#40;\r\n|\n|\r&#41;/gm, ""&#41;.trim&#40;&#41;&#41;,)

[//]: # (                available: parseInt&#40;data[9].replace&#40;/&#40;\r\n|\n|\r&#41;/gm, ""&#41;.trim&#40;&#41;&#41;,)

[//]: # (            };)

[//]: # (            this.status = data[10].replace&#40;/&#40;\r\n|\n|\r&#41;/gm, ""&#41;.trim&#40;&#41;;)

[//]: # (            return this;)

[//]: # (        } catch &#40;e&#41; {)

[//]: # (            throw new Error&#40;"Error parsing course data: "+e&#41;;)

[//]: # (        })

[//]: # (    })

[//]: # (```)



We'll stop here this week and pick up next workshop. See you then!

# Sources

https://www.npmjs.com/package/wm-fetch -- DSC's very own Jason wrote the original package we adapted for this workshop
