import {
  siAcer, siAmd, siAsus, siCoolermaster, siCorsair, siDell, siElgato, siHp, siHyperx, siIntel, siKingstontechnology,
  siLenovo, siMsi, siNvidia, siNzxt, siRazer, siSamsung, siSeagate, siSteelseries, siTplink,
} from "simple-icons";

// Animated footer background, adapted from the "Footer Laser Setup" design:
// a wall socket in the left corner, a plug that slides in, data flowing along the cable
// to a 3D desk setup in the right corner (tower, dual monitors booting to the Newcom logo,
// keyboard light wave, mouse, headset), and real brand logos drifting behind everything.
// Pure CSS animation on a 12s loop; decorative only.

const rows = [
  [siAmd, siIntel, siNvidia, siCorsair, siSamsung, siKingstontechnology, siSeagate, siTplink],
  [siAsus, siMsi, siSteelseries, siHyperx, siCoolermaster, siNzxt, siElgato, siRazer],
  [siLenovo, siHp, siDell, siAcer, siAmd, siIntel, siNvidia, siAsus],
];
const words = ["GIGABYTE", "Logitech G", "GIGABYTE"];

const F = ["fr", "bk", "lf", "rt", "tp", "bt"];
function Box({ w, h, d, x = 0, y = 0, z = 0, cls = "", extra = "", faces = {} }) {
  return (
    <div className={`fx-box ${cls}`} style={{ "--w": `${w}px`, "--h": `${h}px`, "--d": `${d}px`, transform: `translate3d(${x}px,${y}px,${z}px) ${extra}` }}>
      {F.map((f) => <div key={f} className={`fx-f fx-${f}`}>{faces[f]}</div>)}
    </div>
  );
}

// keyboard: light wave spreading from the centre
const keys = [];
[[14], [14], [14], [14], [1, 1, 8, 1, 1, 1, 1]].forEach((row, r) => {
  const spans = row.length === 1 ? Array(14).fill(1) : row;
  let col = 0;
  spans.forEach((span) => {
    const cc = col + span / 2 - 0.5;
    keys.push({ span, delay: (Math.hypot(cc - 6.5, (r - 2) * 1.5) * 0.07).toFixed(2) });
    col += span;
  });
});

function Monitor({ x, z, ry, delay = 0 }) {
  return (
    <>
      <Box w={140} h={8} d={90} x={x} y={138} z={z} />
      <Box w={24} h={66} d={12} x={x} y={101} z={z - 8} />
      <Box w={330} h={196} d={14} x={x} y={-30} z={z} extra={`rotateY(${ry}deg)`} faces={{
        fr: (
          <div className="fx-mon" style={{ animationDelay: `${delay}s` }}>
            <div className="fx-scr" style={{ animationDelay: `${delay}s` }}>
              <div className="fx-boot" style={{ animationDelay: `${delay}s` }}>
                <div className="fx-ring" /><div className="fx-ring2" />
                <div className="fx-eq">{[.1, .5, .3, .8, .2, .65, .4].map((t) => <b key={t} style={{ animationDelay: `-${t}s` }} />)}</div>
                <div className="fx-stext">SYSTEM ONLINE</div>
                <div className="fx-prog"><i style={{ animationDelay: `${delay}s` }} /></div>
              </div>
              <div className="fx-logo" style={{ animationDelay: `${delay}s` }}>
                <img src="/brand/newcom-logo-dark.png" alt="" />
              </div>
              <div className="fx-scan" />
            </div>
          </div>
        ),
      }} />
    </>
  );
}

export default function FooterBg() {
  return (
    <div className="fxb" aria-hidden="true">
      <div className="fx-glow" />

      {/* brand logos drifting in the background */}
      <div className="fx-brands">
        {rows.map((r, i) => (
          <div key={i} className={`fx-brow${i === 1 ? " rev" : ""}`}>
            {[0, 1].map((dup) => (
              <div key={dup} className="fx-run">
                {r.map((b, k) => <span key={`${b.slug}${k}`} className="fx-bitem"><svg viewBox="0 0 24 24"><path d={b.path} /></svg>{b.title.replace(" Technology", "")}</span>)}
                <span className="fx-bitem word">{words[i]}</span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* left corner: wall socket, plug and the data cable running to the PC */}
      <div className="fx-wall">
        <div className="fx-socket"><i /><i /><b /></div>
        <div className="fx-plug"><span className="fx-pled" /></div>
        <div className="fx-spark" />
      </div>
      <svg className="fx-cable" viewBox="0 0 1000 200" preserveAspectRatio="none">
        <path id="fx-path" d="M60 120 C 220 120, 260 175, 420 175 S 760 175, 900 150" />
        <path className="fx-cable-base" d="M60 120 C 220 120, 260 175, 420 175 S 760 175, 900 150" />
        <path className="fx-cable-data" d="M60 120 C 220 120, 260 175, 420 175 S 760 175, 900 150" />
      </svg>

      {/* right corner: the 3D desk setup */}
      <div className="fx-persp">
        <div className="fx-stage">
          <div className="fx-floor" />
          <Box w={780} h={16} d={300} y={148} cls="fx-desk" />
          <div className="fx-spill"><div className="fx-monglow" /></div>

          <Monitor x={-150} z={-90} ry={10} />
          <Monitor x={190} z={-90} ry={-10} delay={0.35} />

          {/* tower on the right of the desk */}
          <Box w={120} h={240} d={220} x={420} y={20} z={-30} faces={{
            fr: <><div className="fx-vent" /><div className="fx-ledbar fx-on" /><div className="fx-pbtn fx-on" /></>,
            lf: [16, 90, 164].map((t) => <div key={t} className="fx-fan fx-on" style={{ top: t }}><div className="fx-blade" /></div>),
            rt: [16, 90, 164].map((t) => <div key={t} className="fx-fan fx-on" style={{ top: t }}><div className="fx-blade" /></div>),
          }} />

          {/* keyboard, mouse, headset */}
          <Box w={420} h={14} d={140} x={20} y={133} z={80} faces={{
            tp: <div className="fx-kgrid">{keys.map((k, i) => <div key={i} className="fx-key" style={{ gridColumn: `span ${k.span}`, animationDelay: `${k.delay}s` }} />)}</div>,
          }} />
          <Box w={54} h={16} d={88} x={290} y={132} z={92} faces={{ tp: <><div className="fx-mline" /><div className="fx-mwheel fx-on" /></> }} />
          <Box w={60} h={6} d={60} x={-390} y={137} z={-40} />
          <Box w={8} h={150} d={8} x={-390} y={59} z={-40} />
          <div className="fx-box" style={{ transform: "translate3d(-390px,2px,-40px) rotateY(25deg)" }}>
            <div className="fx-band" />
            <Box w={22} h={52} d={44} x={-50} y={22} faces={{ lf: <div className="fx-cup fx-on" /> }} />
            <Box w={22} h={52} d={44} x={50} y={22} faces={{ rt: <div className="fx-cup fx-on" /> }} />
          </div>
          {/* wires on the desk */}
          <Box w={300} h={5} d={5} x={260} y={137} z={-140} cls="fx-wire" />
          <Box w={60} h={5} d={5} x={250} y={137} z={92} cls="fx-wire" />
        </div>
      </div>

      <div className="fx-fade" />
    </div>
  );
}
