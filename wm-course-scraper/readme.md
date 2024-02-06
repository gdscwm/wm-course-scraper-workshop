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

To send requests to the open course list, we need to construct URLs that look _exactly like_ the ones you see when you click `Search`.
For example, if I select classes with the subject `Classical Civilization`, this is specified in the url like so:
```
term_subj=CLCV
```
and similarly for all other fields in the search form. 

So, to construct proper URLs, we need to get all of the codes that the open course list uses for `Subject`, `Attribute`, `Level`, and so on. 
This would take a lot of copy-paste! Thankfully, we've already compiled all the codes as `Enums` in the directory `wm-course-scraper/src/enums`. 
(Bonus question -- what is `Enum` short for??)

Go ahead and copy all the  files in the enums directory into your local `src/enums` directory. These files hold the values that we will use to construct our URLs.

How did we know what values to put in all of these files? In your inspect tab, in the `<form>` section, open one of the `<div class="phoneHeader">` sections. Dig down until you reach a section like `<select name="...`.  Expand this section, and note all of the `<option>` sections within the select. Compare these HTML sections with what we have compiled in `subjects.ts`, for example. Note that how `<option value="BIOL">Biology</Biology>` becomes `BIOLOGY = 'BIOL'`, for example.

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

TODO explain course.ts

TODO explain filter.ts

- start with Filter
- show example

- then Course

Scraper

- constructor, privateURL
- all (show example)
- fetchAndParse/parseHTML
- courses (show example)
- extractCourses
- terms/latestTerm at end or before extractCourses

# Sources

https://www.npmjs.com/package/wm-fetch -- DSC's very own Jason wrote the original package we adapted for this workshop
