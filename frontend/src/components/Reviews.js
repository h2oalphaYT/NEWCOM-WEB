import { siGoogle } from "simple-icons";

// Customer reviews. The rating panel links to Newcom's real Google listing. The cards below are
// SAMPLE layout content only and are labelled as such on the page; replace them with the Google
// Places reviews feed (needs a Place ID and API key) before launch. Never publish invented reviews.
const GOOGLE_URL = "https://www.google.com/maps/search/?api=1&query=NEWCOM%20COMPUTER%20SYSTEMS%20PVT%20LTD%20Colombo";

const sample = [
  { n: "Customer name", i: "A", t: "Sample review text. A real Google review about service, pricing or delivery appears here.", tag: "Custom PC build" },
  { n: "Customer name", i: "B", t: "Sample review text. Shown only to preview the layout until the Google feed is connected.", tag: "Laptop purchase" },
  { n: "Customer name", i: "C", t: "Sample review text. Star rating, reviewer name and date come straight from Google.", tag: "Warranty support" },
  { n: "Customer name", i: "D", t: "Sample review text. Each card links back to the original review on Google Maps.", tag: "GPU upgrade" },
  { n: "Customer name", i: "E", t: "Sample review text. Long reviews are trimmed to four lines with a link to read more.", tag: "Repairs" },
  { n: "Customer name", i: "F", t: "Sample review text. The slider pauses when you hover or touch it.", tag: "Accessories" },
];

const Stars = () => (
  <span className="stars" aria-label="Star rating">
    {[0, 1, 2, 3, 4].map((i) => <svg key={i} viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.8 2.8 5.9 6.4.8-4.7 4.4 1.2 6.4L12 17.2l-5.7 3.1 1.2-6.4L2.8 9.5l6.4-.8z" /></svg>)}
  </span>
);

export default function Reviews() {
  const card = (r, k) => (
    <figure key={k} className="rv-card">
      <div className="rv-top">
        <span className="rv-av" aria-hidden="true">{r.i}</span>
        <div><strong>{r.n}</strong><Stars /></div>
        <svg className="rv-g" viewBox="0 0 24 24" aria-label="Google"><path d={siGoogle.path} /></svg>
      </div>
      <blockquote>{r.t}</blockquote>
      <figcaption><span>{r.tag}</span><em>Sample</em></figcaption>
    </figure>
  );

  return (
    <section className="rvw" aria-labelledby="rvw-h">
      <div className="rvw-in">
        <div className="rvw-panel">
          <div className="bezel"><div className="bezel-core rvw-score">
            <span className="pill-eyebrow">Customer reviews</span>
            <h2 id="rvw-h" className="h2">Rated by the people <span className="grad">who build with us.</span></h2>
            <div className="rvw-google">
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d={siGoogle.path} /></svg>
              <div>
                <Stars />
                <span>Google rating shows here once the reviews feed is connected.</span>
              </div>
            </div>
            <a className="cta" href={GOOGLE_URL} target="_blank" rel="noopener noreferrer">
              Read and write reviews on Google<span className="cta-ico" aria-hidden="true">↗</span>
            </a>
          </div></div>
        </div>
        <div className="rvw-wall" aria-label="Sample review layout">
          <div className="rvw-col">{[...sample.slice(0, 3), ...sample.slice(0, 3)].map((r, i) => card(r, `a${i}`))}</div>
          <div className="rvw-col down">{[...sample.slice(3), ...sample.slice(3)].map((r, i) => card(r, `b${i}`))}</div>
        </div>
      </div>
      <p className="rvw-note">Review cards are sample layout content and will be replaced by real Google reviews.</p>
    </section>
  );
}
