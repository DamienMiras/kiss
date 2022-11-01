# ES6 module interface library

## **This project is experimental.**

there is many virtual DOM framework actually 55 pages on npm. What is a virtual dom ? React vuejs and angular are
virtual dom libraries.

## **Why write yet another lib ?**

I really love angular and I work with it every days, React and vuejs are awesome. I just want something different, and
push my skills forward. This project is done in my free time for fun, there is no unit-test no ascendant compatibility
and it is far from being finished or fully usable. I add features when I need them.

- I dont want to wait for a build any time I do a change
- I want an eventBus wich can send events to any parent/child/sibling/id with ne line of code
- I want any library dependencies
- I want a small size and fast loading
-

## **what it does for now?**

### Dynamic DOM components loading

Wwhen you create a custom tag like  `<myComponent class=".kiss">` inside the `<body>` <br />
kiss will try to load your component from the path :

- index.html
    - views
        - mycomponent
            - mycomponent.html
            - mycomponent.css
            - mycomponent.js

If you prefere to put your componenent elsewhere, you ca change the layout with a configuration class at the application
start with   `Configuration.setBasePath("../your/application/path");` and
`Configuration.setViewPath("/component");`instead of view your components will be under component

mycomponent.js is a plain javascript class, but you could etends kiss to get the `load()` event or geta visual debug

### Events bus

if you need to pot data to any kis component all you have to do is simply   <br/>
`Bus.postMessage(this, "dashboard", "rangeSelect", {range: 4});` That it.

the first argument correspond to the origin attribute , so ..`"this"` the second is the destination name (the name of
the component and the html tag)
here it is `"dashboard"`. then `"rangeSelect"` is the name of the message type , and finaly `"{range: 4}"`correspond to
the actual data

# TODO

- [x] use MutationObserver instead of double loading of css
- [ ] automate the browser compatibility https://seedmanc.github.io/jscc/
- [ ] implement angular like html parser *ngFor *ngIf or test and compare with react
- [ ] package with npm (break all components appart)
- [ ] implement services components (post put delete etc)
- [x] better console log
- [ ] move all the fetch things to an httpClient
- [ ] make colorUtil static and export in module
- [x] refacto for a better lib user interface and less code
- [ ] snake case to camel case for imported file
- [ ] cache the html loading ...make a generic cache component
- [ ] remove "extends"  "peace" and "kiss" should be composition or injections
- [ ] add doc inside the code