Small React app with a textbox for you to paste Japanese text into.
What's returned is a list of Kanji blobs (could be terms), ordered by frequency of appearance. 

TODO: actually show how many times each blob appears in a non-selectable way.

Idea is for only the terms be selectable to facilitate input into a glossary or another tool. 

Because I do patent translation, one quirk is that 前記 is ignored at the start of a blob.

In GetTermsApp.js, check out the text in "isCombiningKanji(ch)", "badLeadingTerms", and "badEndingTerms" for how I use this to strip out what I see kanji combining text that can often be safely stripped away to get at the underlying term.