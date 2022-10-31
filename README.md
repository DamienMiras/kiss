# ES6 module interface library

**This project is experimental.**

there is many virtual DOM framework actally 55 pages on npm. What is a virtual dom ? React vuejs and angular are virtual
dom library.

**Why write yet another lib ?**
I really love angular and I work with it every days, React and vuejs are awesome. I want something different

- I dont want to wait for a build any time I do a change
- I want an eventBus wich can send events to any parent/child/sibling/id with ne line of code
- I want any library dependencies
- I want a small size and fast loading

# TODO

- [x] use MutationObserver instead of double loading of css
- [ ] automate the browser compatibility https://seedmanc.github.io/jscc/
- [ ] implement angular like html parser *ngFor *ngIf or test and compare with react
- [ ] package with npm
- [ ] implement services components (post put delete etc)
- [x] better console log
- [ ] move all the fetch things to an httpClient
- [ ] make colorUtil static and export in module
- [-] refacto for a better lib user interface and less code
- [ ] snake case to camel case for imported file