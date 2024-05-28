# Anki2Notes

Anki2Notes can generate text notes in HTML, MD and LaTex from Anki decks in the .txt format.
It allows the user to import Anki decks, edit their content in MarkDown, and download either the MarkDown or the formatted HTML. It also generates a basic LaTex document. The conversion into LaTex is minimal and only supports a couple HTML elements.

Anki2Notes has no image integration. It is written in vanilla Javascript.
It uses [highlight.js](https://highlightjs.org/), [showdown.js](https://showdownjs.com/) and [code-input](https://github.com/WebCoder49/code-input). It works with basilar and cloze type of cards.

You can try it out here https://c-facade.github.io/Anki2Notes/main.html

## TO DO
- make conversion to latex better
- add options for conversion to html (summary vs paragraph, dark or light)
- general code cleaning
- adapt to new Anki options
- sanitize markdown input with DOM sanitize
- use md2tex?
