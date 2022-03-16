import React from "react";
import "./GetTermsApp.css";

function isKanji(ch) {
  return (
    (ch >= "\u4e00" && ch <= "\u9faf") || (ch >= "\u3400" && ch <= "\u4dbf")
  );
}

// // determine whether a character is a katakana character
// function isKatakana(ch) {
//   return ch >= "\u30a0" && ch <= "\u30ff";
// }

function isHiragana(ch) {
  return ch >= "\u3040" && ch <= "\u309f";
}

function isKatakanaOrKanji(ch) {
  return (
    (ch !== "・") && !isCombiningKanji(ch) && (
      (ch >= "\u4e00" && ch <= "\u9faf") ||
      (ch >= "\u3400" && ch <= "\u4dbf") ||
      (ch >= "\u30a0" && ch <= "\u30ff"))
  );
}

function isCombiningKanji(ch) {
  return (
    //"全済毎各両等及又後上下内奥中時用以該頁個第間数無記側本約種製同実或".indexOf(ch) !== -1
    "".indexOf(ch) !== -1
  )
}

// adapted from https://github.com/darren-lester/nihongo
function accumulativeUniqParser(str) {
  //const badLeadingTerms = ["当該", "前記", "上記", "同一", "適宜", "最大", "一層", "極力", "一部", "一体", "一見", "既知"];
  //const badEndingTerms = ["可能", "同士", "参照", "未満", "対象", "乃至", "付近", "下部", "程度", "由来", "単位"];
  const badLeadingTerms = [];
  const badEndingTerms = [];
  let accumulations = [];
  let accumulator = "";

  for (let i = 0; i < str.length; ++i) {
    let ch = str[i];

    if (isKatakanaOrKanji(ch)) {
      //was condition(ch)
      accumulator += ch;
      if (badLeadingTerms.includes(accumulator)) {
        accumulator = "";
      }
    } else if (accumulator !== "") {
      // attempting to reduce number of 1-kanji terms
      // removing 前記 from terms
      if (accumulator.startsWith("前記") && accumulator.length >= 3) {
        accumulator = accumulator.slice(2);
      }
      for (let term of badEndingTerms) {
        console.log("term is ", term, badEndingTerms)
        if (accumulator.endsWith(term)) {
          console.log("ends with ", term)
          accumulator = accumulator.slice(0, accumulator.length - term.length)
        }
      }
      if (accumulator !== "") {
        if (accumulations[accumulator] === undefined) {
          accumulations[accumulator] = 1;
        } else {
          accumulations[accumulator] += 1;
        }
      }
      accumulator = "";
    }
  }

  return accumulations;
}

class GetTermsApp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fullText: "",
      sortedTerms: [],
      termCounts: [],
    };
    //console.log(this.state.highlighter)
  }
  // input change handlers should get us the details of files uploaded
  handleChange(event) {
    const bigString = event.target.value.normalize();
    //this.setState({value: event.target.value});
    //console.log(accumulativeUniqParser(event.target.value));
    const uniqTerms = accumulativeUniqParser(bigString);
    console.log("keys", Object.keys(uniqTerms));
    const sortedKeys = Object.keys(uniqTerms).sort(function (a, b) {
      // ASC  -> a.length - b.length
      // DESC -> b.length - a.length
      return uniqTerms[b] - uniqTerms[a];
    });
    console.log(sortedKeys);
    const sortedValues = [];
    sortedKeys.forEach((key, index) => {
      sortedValues[index] = uniqTerms[key];
    });
    this.setState({
      fullText: bigString,
      sortedTerms: sortedKeys,
      termCounts: sortedValues,
    });
    console.log(sortedKeys, sortedValues);
  }


  render() {
    const sortedTerms = this.state.sortedTerms;
    const termCounts = this.state.termCounts;
    const numTerms = sortedTerms.length;

    const fullText = this.state.fullText;
    // sortedTerms.map((term, index) => (string += <span>term</span>));
    // console.log(string);

    const twoOrMoreKanjiTerms = sortedTerms.filter((term) => term.length !== 1);
    const oneKanjiTerms = sortedTerms.filter((term) => term.length === 1);
    const oneKanjiContext = [];
    console.log("full text: ", fullText);
    oneKanjiTerms.forEach(function (oneKanji) {
      let pos = fullText.indexOf(oneKanji);
      // landed in infinite loop with text "安全に閉じ"
      // while (isKanji(fullText.charAt(pos + 1))) {
      //   pos = fullText.indexOf(oneKanji, pos + 1)
      //   console.log("while")
      // }

      if (isHiragana(fullText.charAt(pos + 1))) {
        oneKanjiContext.push(fullText.slice(pos, pos + 2));
        if (isKanji(fullText.charAt(pos + 2))) {
          oneKanjiContext.push(fullText.slice(pos, pos + 3));
        }
      }

    });

    console.log("one kanji context", oneKanjiContext.length, oneKanjiContext);
    console.log("filtered terms length", sortedTerms.length);
    console.log(sortedTerms);
    return (
      <div id="overall" className="position-trbl-0 overflow-hidden">
        <div>Small React app with a textbox for you to paste Japanese text into. What's returned is a list of Kanji blobs (could be terms), ordered by frequency of appearance.</div>
        Paste full text here:
        <textarea
          id="doc"
          name="doc"
          onChange={this.handleChange.bind(this)}
        ></textarea>
        <div className="row2">
          <div id="output" name="output" className="col">
            <div className="col-inner">
              Results sorted by appearance (total terms: {numTerms}):
              <br />
              {sortedTerms.map((term, index) => (
                <span key={index}>
                  {term}
                  <br />
                </span>
              ))}
            </div>
          </div>
          <div id="further" name="further" className="col">
            <div className="col-inner">
              Filtered out 1 kanji terms (count:{" "}
              {twoOrMoreKanjiTerms.length}): <br />
              {twoOrMoreKanjiTerms.map((term, index) => (
                <span key={index}>
                  <span className="noselect">{termCounts[sortedTerms.indexOf(term)]} </span>
                  {term}
                  <br />
                </span>
              ))}
            </div>
          </div>
          <div id="oneKanji" name="oneKanji" className="col">
            <div className="col-inner">
              1 kanji terms (count: {oneKanjiTerms.length}): <br />
              {oneKanjiTerms.map((term, index) => (
                <span key={index}>
                  <span className="noselect">{termCounts[sortedTerms.indexOf(term)]} </span>
                  {term}
                  <br />
                </span>
              ))}
            </div>
          </div>
          <div id="oneKanjiContext" name="oneKanjiContext" className="col">
            <div className="col-inner">
              1 kanji context (count: {oneKanjiContext.length}): <br />
              {oneKanjiContext.map((term, index) => (
                <span key={index}>
                  <span className="noselect">{termCounts[sortedTerms.indexOf(term)]} </span>
                  {term}
                  <br />
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default GetTermsApp;
