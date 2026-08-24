'use client';

function SplitText({ text, className }) {
  return (
    <span className={className}>
      {text.split("").map((c, i) => (
        <span key={i} style={{ display: 'inline-block' }}>{c === " " ? "\u00A0" : c}</span>
      ))}
    </span>
  );
}

export default function Captions() {
  return (
    <>
      <div className="opening" id="opening">
        <SplitText text="MARSA" className="o-name" />
        <span className="o-tag">FROM THE SEA TO THE TABLE</span>
      </div>
      <div className="cap" id="capSea">
        <span className="cap-i">— 01 —</span>
        <SplitText text="THE SEA" className="cap-t" />
        <em className="cap-s">before dawn, one small boat</em>
      </div>
      <div className="cap" id="capCatch">
        <span className="cap-i">— 03 —</span>
        <SplitText text="THE CATCH" className="cap-t" />
        <em className="cap-s">patience, rewarded</em>
      </div>
      <div className="cap" id="capFire">
        <span className="cap-i">— 04 —</span>
        <SplitText text="THE FIRE" className="cap-t" />
        <em className="cap-s">oak, ember &amp; time</em>
      </div>
      <div className="cap" id="capRest">
        <span className="cap-i">— 05 —</span>
        <SplitText text="THE RESTAURANT" className="cap-t" />
        <em className="cap-s">a single room by the harbor</em>
      </div>
      <div className="cap" id="capTable">
        <span className="cap-i">— 05 —</span>
        <SplitText text="THE TABLE" className="cap-t" />
        <em className="cap-s">tonight's catch, served</em>
      </div>
    </>
  );
}