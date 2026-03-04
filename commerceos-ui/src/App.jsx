import { useState, useEffect, useCallback } from "react";

/* ─── Google Fonts + Global CSS ─────────────────────────────────────────── */
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=IBM+Plex+Mono:wght@300;400;500;600&family=IBM+Plex+Sans:wght@300;400;500;600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    :root {
      --bg:         #03050a;
      --surface:    #080d14;
      --card:       #0c1220;
      --border:     #1a2540;
      --border-lit: #243050;
      --green:      #00ff9d;
      --blue:       #4d9fff;
      --red:        #ff4560;
      --amber:      #ffb020;
      --purple:     #a78bfa;
      --text:       #e2e8f4;
      --text-dim:   #8896b0;
      --text-muted: #3d5070;
      --font-head:  'Bebas Neue', sans-serif;
      --font-body:  'IBM Plex Sans', sans-serif;
      --font-mono:  'IBM Plex Mono', monospace;
    }

    html { scroll-behavior: smooth; }
    body {
      background: var(--bg);
      color: var(--text);
      font-family: var(--font-body);
      min-height: 100vh;
      overflow-x: hidden;
    }

    body::before {
      content: '';
      position: fixed; inset: 0; z-index: 0; pointer-events: none;
      background-image:
        linear-gradient(rgba(0,255,157,0.025) 1px, transparent 1px),
        linear-gradient(90deg, rgba(0,255,157,0.025) 1px, transparent 1px);
      background-size: 40px 40px;
    }

    #root { position: relative; z-index: 1; }

    ::-webkit-scrollbar { width: 3px; height: 3px; }
    ::-webkit-scrollbar-track { background: var(--bg); }
    ::-webkit-scrollbar-thumb { background: var(--border-lit); border-radius: 2px; }

    @keyframes fadeUp   { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
    @keyframes spin     { to   { transform: rotate(360deg); } }
    @keyframes blink    { 0%,100%{opacity:1} 50%{opacity:0.2} }
    @keyframes barIn    { from{width:0} }
    @keyframes glowPulse{ 0%,100%{box-shadow:0 0 8px rgba(0,255,157,.15)} 50%{box-shadow:0 0 24px rgba(0,255,157,.35)} }
    @keyframes ticker   { from{transform:translateX(0)} to{transform:translateX(-50%)} }
    @keyframes numberUp { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

    .f0 { animation: fadeUp .4s ease both; }
    .f1 { animation: fadeUp .4s .07s ease both; }
    .f2 { animation: fadeUp .4s .14s ease both; }
    .f3 { animation: fadeUp .4s .21s ease both; }
    .f4 { animation: fadeUp .4s .28s ease both; }
    .f5 { animation: fadeUp .4s .35s ease both; }

    input, select {
      background: var(--surface);
      border: 1px solid var(--border);
      border-radius: 6px;
      color: var(--text);
      font-family: var(--font-mono);
      font-size: 13px;
      padding: 10px 14px;
      width: 100%;
      outline: none;
      transition: border-color .2s, box-shadow .2s;
    }
    input:focus, select:focus {
      border-color: var(--green);
      box-shadow: 0 0 0 2px rgba(0,255,157,.1);
    }
    select { cursor: pointer; }
    button { cursor: pointer; font-family: var(--font-body); }
  `}</style>
);

/* ─── Helpers ────────────────────────────────────────────────────────────── */
const fmt  = n => typeof n==="number" ? Math.abs(n).toLocaleString("en-IN",{maximumFractionDigits:0}) : "—";
const fmtD = n => typeof n==="number" ? n.toLocaleString("en-IN",{maximumFractionDigits:1}) : "—";
const riskCol = r => r==="Low"?"var(--green)":r==="Medium"?"var(--amber)":"var(--red)";

/* ─── TICKER ─────────────────────────────────────────────────────────────── */
const TICKS = ["AI-POWERED MARKET INTELLIGENCE","REAL-TIME AMAZON SCRAPING","GOOGLE TRENDS ANALYSIS","3-TIER KEYWORD RESEARCH","ALIBABA SUPPLIER PRICING","BSR → SALES FORMULA","LLM STRATEGIC ASSESSMENT","PROFIT SIMULATION ENGINE"];
const Ticker = () => (
  <div style={{background:"var(--green)",overflow:"hidden",height:26,display:"flex",alignItems:"center"}}>
    <div style={{display:"flex",gap:80,whiteSpace:"nowrap",animation:"ticker 28s linear infinite",fontFamily:"var(--font-mono)",fontSize:11,fontWeight:600,color:"var(--bg)",letterSpacing:"0.12em"}}>
      {[...TICKS,...TICKS].map((t,i)=><span key={i}>◆ {t}</span>)}
    </div>
  </div>
);

/* ─── TOPBAR ─────────────────────────────────────────────────────────────── */
const PAGES = [{id:"analyze",label:"Analyze"},{id:"results",label:"Dashboard"},{id:"scenarios",label:"Scenarios"},{id:"signals",label:"Signals"},{id:"strategy",label:"Strategy"},{id:"history",label:"History"}];

const Topbar = ({page,setPage,hasData,apiOk}) => (
  <header style={{position:"sticky",top:0,zIndex:200,background:"rgba(3,5,10,.95)",backdropFilter:"blur(12px)",borderBottom:"1px solid var(--border)"}}>
    <Ticker/>
    <div style={{display:"flex",alignItems:"center",padding:"0 28px",height:52,gap:0}}>
      <div style={{fontFamily:"var(--font-head)",fontSize:26,letterSpacing:"0.04em",color:"var(--text)",marginRight:40,lineHeight:1,display:"flex",alignItems:"center",gap:6}}>
        <span style={{display:"inline-block",width:8,height:8,borderRadius:"50%",background:"var(--green)",animation:"glowPulse 2s infinite"}}/>
        MARKET<span style={{color:"var(--green)"}}>IQ</span>
      </div>
      <nav style={{display:"flex",flex:1}}>
        {PAGES.map(p=>{
          const locked=p.id!=="analyze"&&p.id!=="history"&&!hasData;
          const active=page===p.id;
          return (
            <button key={p.id} onClick={()=>!locked&&setPage(p.id)} style={{background:"none",border:"none",padding:"0 14px",height:52,fontFamily:"var(--font-mono)",fontSize:12,fontWeight:active?600:400,color:active?"var(--green)":locked?"var(--text-muted)":"var(--text-dim)",borderBottom:active?"2px solid var(--green)":"2px solid transparent",letterSpacing:"0.05em",transition:"color .15s"}}>
              {p.label.toUpperCase()}
            </button>
          );
        })}
      </nav>
      <div style={{display:"flex",alignItems:"center",gap:6,fontFamily:"var(--font-mono)",fontSize:11,color:apiOk?"var(--green)":"var(--red)"}}>
        <span style={{width:6,height:6,borderRadius:"50%",background:apiOk?"var(--green)":"var(--red)",animation:apiOk?"blink 2s infinite":"none"}}/>
        API {apiOk?"ONLINE":"OFFLINE"}
      </div>
    </div>
  </header>
);

/* ─── CARD ───────────────────────────────────────────────────────────────── */
const Card = ({children,style,glow,className}) => (
  <div className={className} style={{background:"var(--card)",border:`1px solid ${glow?"rgba(0,255,157,.25)":"var(--border)"}`,borderRadius:8,padding:20,position:"relative",overflow:"hidden",boxShadow:glow?"0 0 24px rgba(0,255,157,.07)":"none",...style}}>
    {glow&&<div style={{position:"absolute",top:0,left:0,right:0,height:1,background:"linear-gradient(90deg,transparent,var(--green),transparent)"}}/>}
    {children}
  </div>
);

const SectionLabel = ({children,color="var(--green)"}) => (
  <div style={{fontFamily:"var(--font-mono)",fontSize:10,letterSpacing:"0.15em",textTransform:"uppercase",color,marginBottom:6,display:"flex",alignItems:"center",gap:8}}>
    <span style={{display:"inline-block",width:16,height:1,background:color}}/>{children}
  </div>
);

/* ─── SCORE ARC ─────────────────────────────────────────────────────────── */
const ScoreArc = ({value,label,color="var(--green)"}) => {
  const pct = Math.max(0,Math.min(100,value||0));
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8}}>
      <svg width={96} height={67} viewBox="0 0 80 56" style={{overflow:"visible"}}>
        <path d="M 10 50 A 30 30 0 0 1 70 50" fill="none" stroke="var(--border)" strokeWidth="5" strokeLinecap="round"/>
        <path d="M 10 50 A 30 30 0 0 1 70 50" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round"
          strokeDasharray={`${(pct/100)*94.25} 94.25`} style={{transition:"stroke-dasharray 1.2s ease"}}/>
        <text x="40" y="46" textAnchor="middle" fill={color} style={{fontFamily:"var(--font-head)",fontSize:22}}>{Math.round(pct)}</text>
      </svg>
      <span style={{fontFamily:"var(--font-mono)",fontSize:10,color:"var(--text-muted)",letterSpacing:"0.12em",textTransform:"uppercase"}}>{label}</span>
    </div>
  );
};

const KpiTile = ({label,value,prefix="",suffix="",color="var(--text)",sub}) => (
  <Card style={{padding:"18px 20px"}}>
    <SectionLabel color="var(--text-muted)">{label}</SectionLabel>
    <div style={{fontFamily:"var(--font-head)",fontSize:28,letterSpacing:"0.03em",color,lineHeight:1.1,animation:"numberUp .5s ease"}}>{prefix}{value}{suffix}</div>
    {sub&&<div style={{fontFamily:"var(--font-mono)",fontSize:11,color:"var(--text-muted)",marginTop:4}}>{sub}</div>}
  </Card>
);

const HBar = ({label,value,max=100,color="var(--green)"}) => (
  <div style={{marginBottom:12}}>
    <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
      <span style={{fontFamily:"var(--font-mono)",fontSize:11,color:"var(--text-dim)"}}>{label}</span>
      <span style={{fontFamily:"var(--font-mono)",fontSize:11,color,fontWeight:600}}>{fmtD(value)}</span>
    </div>
    <div style={{height:4,background:"var(--border)",borderRadius:2,overflow:"hidden"}}>
      <div style={{height:"100%",background:color,borderRadius:2,width:`${Math.min(100,(value/max)*100)}%`,animation:"barIn .9s ease",transition:"width .9s ease"}}/>
    </div>
  </div>
);

/* ═══════════════════════════════════════════════════════════════════════════
   ANALYZE PAGE
═══════════════════════════════════════════════════════════════════════════ */
const LOAD_STEPS = ["Initializing data collectors...","Fetching Google Trends (12 months)...","Scraping Amazon search results...","Extracting BSR from product pages...","Measuring review velocity...","Running keyword research (3-tier)...","Fetching Alibaba supplier pricing...","Computing demand & competition scores...","Simulating profit scenarios...","Generating AI strategic assessment...","Persisting to database..."];

const AnalyzePage = ({onResult}) => {
  const [form,setForm] = useState({product:"",country:"India",platform:"Amazon",budget:"",cost_per_unit:""});
  const [loading,setLoading] = useState(false);
  const [stepIdx,setStepIdx] = useState(0);
  const [elapsed,setElapsed] = useState(0);
  const [error,setError] = useState("");

  useEffect(()=>{
    if(!loading)return;
    const si=setInterval(()=>setStepIdx(i=>Math.min(i+1,LOAD_STEPS.length-1)),2200);
    const ti=setInterval(()=>setElapsed(e=>e+1),1000);
    return()=>{clearInterval(si);clearInterval(ti);};
  },[loading]);

  const run = async()=>{
    if(!form.product||!form.budget){setError("Product and budget are required.");return;}
    setError("");setLoading(true);setStepIdx(0);setElapsed(0);
    try{
      const body={product:form.product,country:form.country,platform:form.platform,budget:parseFloat(form.budget)};
      if(form.cost_per_unit)body.cost_per_unit=parseFloat(form.cost_per_unit);
      const res=await fetch("http://localhost:8000/analyze-product",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
      if(!res.ok){const e=await res.json();throw new Error(e.detail||"Analysis failed");}
      onResult(await res.json());
    }catch(e){setError(e.message);}
    finally{setLoading(false);}
  };

  return (
    <div style={{maxWidth:1100,margin:"48px auto",padding:"0 28px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:24,alignItems:"start"}}>
      <div>
        <div className="f0" style={{marginBottom:32}}>
          <SectionLabel>Pre-launch Intelligence</SectionLabel>
          <h1 style={{fontFamily:"var(--font-head)",fontSize:52,letterSpacing:"0.04em",lineHeight:.95,color:"var(--text)"}}>
            PRODUCT<br/><span style={{color:"var(--green)"}}>ANALYSIS</span><br/>ENGINE
          </h1>
          <p style={{marginTop:16,fontFamily:"var(--font-mono)",fontSize:12,color:"var(--text-dim)",lineHeight:1.8}}>
            Real signals. Mathematical scoring.<br/>AI-powered launch strategy.
          </p>
        </div>
        <Card className="f1" glow>
          <SectionLabel>New Analysis</SectionLabel>
          <div style={{display:"flex",flexDirection:"column",gap:14,marginTop:16}}>
            <div>
              <label style={{fontFamily:"var(--font-mono)",fontSize:10,color:"var(--text-muted)",letterSpacing:"0.1em",display:"block",marginBottom:6}}>PRODUCT / KEYWORD</label>
              <input placeholder="e.g. portable blender, yoga mat..." value={form.product} onChange={e=>setForm({...form,product:e.target.value})} onKeyDown={e=>e.key==="Enter"&&run()}/>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div>
                <label style={{fontFamily:"var(--font-mono)",fontSize:10,color:"var(--text-muted)",letterSpacing:"0.1em",display:"block",marginBottom:6}}>COUNTRY</label>
                <select value={form.country} onChange={e=>setForm({...form,country:e.target.value})}>
                  {["India","US","UK","Canada","Australia"].map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={{fontFamily:"var(--font-mono)",fontSize:10,color:"var(--text-muted)",letterSpacing:"0.1em",display:"block",marginBottom:6}}>PLATFORM</label>
                <select value={form.platform} onChange={e=>setForm({...form,platform:e.target.value})}>
                  {["Amazon","Flipkart","Shopify","Other"].map(p=><option key={p}>{p}</option>)}
                </select>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
              <div>
                <label style={{fontFamily:"var(--font-mono)",fontSize:10,color:"var(--text-muted)",letterSpacing:"0.1em",display:"block",marginBottom:6}}>BUDGET (LOCAL CURRENCY)</label>
                <input type="number" placeholder="50000" value={form.budget} onChange={e=>setForm({...form,budget:e.target.value})}/>
              </div>
              <div>
                <label style={{fontFamily:"var(--font-mono)",fontSize:10,color:"var(--text-muted)",letterSpacing:"0.1em",display:"block",marginBottom:6}}>COST / UNIT (OPTIONAL)</label>
                <input type="number" placeholder="Auto from Alibaba" value={form.cost_per_unit} onChange={e=>setForm({...form,cost_per_unit:e.target.value})}/>
              </div>
            </div>
          </div>
          {error&&<div style={{marginTop:14,padding:"10px 14px",background:"rgba(255,69,96,.1)",border:"1px solid rgba(255,69,96,.3)",borderRadius:6,fontFamily:"var(--font-mono)",fontSize:12,color:"var(--red)"}}>⚠ {error}</div>}
          <button onClick={run} disabled={loading} style={{marginTop:20,width:"100%",padding:"13px 0",background:loading?"var(--border)":"var(--green)",color:loading?"var(--text-muted)":"var(--bg)",border:"none",borderRadius:6,fontFamily:"var(--font-head)",fontSize:18,letterSpacing:"0.08em",transition:"all .2s"}}>
            {loading?`ANALYZING... ${elapsed}s`:"RUN ANALYSIS →"}
          </button>
        </Card>
      </div>

      <div>
        {loading?(
          <Card className="f0" glow style={{minHeight:340}}>
            <SectionLabel>Live Status</SectionLabel>
            <div style={{marginTop:24}}>
              {LOAD_STEPS.map((s,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0",borderBottom:"1px solid var(--border)",opacity:i<=stepIdx?1:0.2,transition:"opacity .3s"}}>
                  <span style={{width:18,height:18,borderRadius:"50%",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",background:i<stepIdx?"var(--green)":i===stepIdx?"transparent":"var(--border)",border:i===stepIdx?"2px solid var(--green)":"none"}}>
                    {i<stepIdx&&<span style={{color:"var(--bg)",fontSize:10,fontWeight:700}}>✓</span>}
                    {i===stepIdx&&<span style={{width:8,height:8,borderRadius:"50%",background:"var(--green)",animation:"blink 1s infinite",display:"block"}}/>}
                  </span>
                  <span style={{fontFamily:"var(--font-mono)",fontSize:12,color:i<=stepIdx?"var(--text)":"var(--text-muted)"}}>{s}</span>
                </div>
              ))}
            </div>
          </Card>
        ):(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <Card className="f2">
              <SectionLabel>Data Sources</SectionLabel>
              <div style={{marginTop:16,display:"flex",flexDirection:"column",gap:10}}>
                {[["Google Trends","12-month interest + growth","var(--green)"],["Amazon Scraping","Price · Reviews · BSR · Velocity","var(--blue)"],["Keyword Research","CPC · Volume (3-tier cascade)","var(--amber)"],["Alibaba / AliExpress","Real supplier landed cost","var(--purple)"],["LLM Strategy","Llama3 / rule-based fallback","var(--red)"]].map(([t,d,c])=>(
                  <div key={t} style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                    <span style={{width:3,height:36,background:c,borderRadius:2,flexShrink:0,marginTop:2}}/>
                    <div>
                      <div style={{fontFamily:"var(--font-mono)",fontSize:12,fontWeight:600,color:"var(--text)"}}>{t}</div>
                      <div style={{fontFamily:"var(--font-mono)",fontSize:11,color:"var(--text-muted)"}}>{d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            <Card className="f3">
              <SectionLabel>Scoring Model</SectionLabel>
              <div style={{marginTop:12,fontFamily:"var(--font-mono)",fontSize:11,color:"var(--text-dim)",lineHeight:2}}>
                <div><span style={{color:"var(--green)"}}>DEMAND</span> = 0.35×trend + 0.20×growth + 0.25×velocity + 0.10×cpc + 0.10×volume</div>
                <div><span style={{color:"var(--red)"}}>COMPETITION</span> = 0.40×sellers + 0.35×reviews + 0.25×sponsored</div>
                <div><span style={{color:"var(--blue)"}}>VIABILITY</span> = 0.60×demand − 0.40×competition</div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   RESULTS PAGE
═══════════════════════════════════════════════════════════════════════════ */
const ResultsPage = ({data}) => {
  if(!data)return null;
  const rc=riskCol(data.risk_level);
  const isNeg=data.estimated_monthly_profit<0;
  return (
    <div style={{maxWidth:1100,margin:"40px auto",padding:"0 28px"}}>
      <Card className="f0" glow style={{marginBottom:20,padding:"20px 24px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:16}}>
          <div>
            <SectionLabel>Analysis Complete</SectionLabel>
            <h2 style={{fontFamily:"var(--font-head)",fontSize:36,letterSpacing:"0.04em",color:"var(--text)",marginTop:4}}>{data.product.toUpperCase()}</h2>
            <div style={{display:"flex",gap:10,marginTop:8,flexWrap:"wrap"}}>
              {[[data.platform,"var(--blue)"],[data.country,"var(--purple)"],[data.viability_label,rc],[`Risk: ${data.risk_level}`,rc]].map(([l,c])=>(
                <span key={l} style={{fontFamily:"var(--font-mono)",fontSize:10,letterSpacing:"0.1em",padding:"3px 10px",borderRadius:3,background:`${c}18`,color:c,border:`1px solid ${c}40`}}>{l.toUpperCase()}</span>
              ))}
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"var(--font-mono)",fontSize:10,color:"var(--text-muted)",letterSpacing:"0.1em"}}>DATA CONFIDENCE</div>
            <div style={{fontFamily:"var(--font-head)",fontSize:48,color:"var(--green)",lineHeight:1}}>{data.confidence_score.toFixed(0)}%</div>
          </div>
        </div>
      </Card>

      <Card className="f1" style={{marginBottom:20,display:"flex",justifyContent:"space-around",flexWrap:"wrap",gap:20,padding:"28px 20px"}}>
        <ScoreArc value={data.demand_score}     label="Demand"      color="var(--green)"/>
        <ScoreArc value={data.competition_score} label="Competition" color="var(--red)"/>
        <ScoreArc value={Math.max(0,data.viability_score)} label="Viability" color="var(--blue)"/>
        <ScoreArc value={data.confidence_score} label="Confidence"  color="var(--amber)"/>
      </Card>

      <div className="f2" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:20}}>
        <KpiTile label="Avg Market Price"   prefix="₹" value={fmt(data.avg_market_price)}         color="var(--text)"/>
        <KpiTile label="Suggested Price"    prefix="₹" value={fmt(data.suggested_price)}          color="var(--green)"/>
        <KpiTile label="Profit Margin"      suffix="%" value={fmtD(data.profit_margin)}           color="var(--green)"/>
        <KpiTile label="Monthly Sales Est." suffix=" u" value={fmt(data.estimated_monthly_sales)} color="var(--blue)" sub={`Basis: ${data.sales_basis}`}/>
        <KpiTile label="Monthly Profit"     prefix={isNeg?"−₹":"₹"} value={fmt(data.estimated_monthly_profit)} color={isNeg?"var(--red)":"var(--green)"}/>
        <KpiTile label="ROI"                suffix="%" value={fmtD(data.roi_percent)}             color={data.roi_percent>0?"var(--green)":"var(--red)"}/>
        <KpiTile label="Break-even"         suffix=" mo" value={data.break_even_months===Infinity?"∞":fmtD(data.break_even_months)} color="var(--amber)"/>
        <KpiTile label="Risk Level"         value={data.risk_level}                               color={rc}/>
      </div>

      <div className="f3" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
        <Card>
          <SectionLabel color="var(--green)">Demand Signals</SectionLabel>
          <div style={{marginTop:16}}>
            <HBar label="Trend Average"   value={data.raw_signals.trend_avg}    color="var(--green)"/>
            <HBar label="Trend Growth"    value={Math.max(0,(data.raw_signals.trend_growth+100)/2)} color="var(--green)"/>
            <HBar label="Review Velocity" value={Math.min(100,data.raw_signals.review_velocity/5)} color="var(--green)"/>
            <HBar label="Search Volume"   value={Math.min(100,data.raw_signals.monthly_search_volume/1000)} color="var(--green)"/>
            <HBar label="CPC Signal"      value={Math.min(100,data.raw_signals.cpc_score*50)} color="var(--blue)"/>
          </div>
        </Card>
        <Card>
          <SectionLabel color="var(--red)">Competition Signals</SectionLabel>
          <div style={{marginTop:16}}>
            <HBar label="Seller Count"      value={Math.min(100,data.raw_signals.seller_count/20*100)} color="var(--red)"/>
            <HBar label="Avg Reviews"       value={Math.min(100,data.raw_signals.avg_reviews/50)}      color="var(--red)"/>
            <HBar label="Keyword Comp."     value={data.raw_signals.keyword_competition==="HIGH"?90:data.raw_signals.keyword_competition==="MEDIUM"?55:25} color="var(--amber)"/>
            <HBar label="Sponsored Density" value={(data.raw_signals.sponsored_density||0)*100}        color="var(--amber)"/>
          </div>
        </Card>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   SCENARIOS PAGE
═══════════════════════════════════════════════════════════════════════════ */
const ScenariosPage = ({data}) => {
  if(!data?.profit_scenarios)return null;
  const COLS={conservative:"var(--amber)",expected:"var(--green)",aggressive:"var(--blue)"};
  const maxAbs=Math.max(...data.profit_scenarios.map(s=>Math.abs(s.net_profit)),1);
  return (
    <div style={{maxWidth:1100,margin:"40px auto",padding:"0 28px"}}>
      <div className="f0" style={{marginBottom:28}}>
        <SectionLabel>Profit Simulation</SectionLabel>
        <h2 style={{fontFamily:"var(--font-head)",fontSize:40,letterSpacing:"0.04em"}}>3-SCENARIO FORECAST</h2>
        <p style={{fontFamily:"var(--font-mono)",fontSize:12,color:"var(--text-dim)",marginTop:6}}>
          Sales basis: <span style={{color:"var(--green)"}}>{data.sales_basis==="bsr"?"Amazon BSR (real)":"Demand score (estimated)"}</span>
        </p>
      </div>

      <div className="f1" style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:24}}>
        {data.profit_scenarios.map(s=>{
          const col=COLS[s.scenario.toLowerCase()]||"var(--green)";
          const neg=s.net_profit<0;
          const isExp=s.scenario.toLowerCase()==="expected";
          return (
            <Card key={s.scenario} glow={isExp}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <span style={{fontFamily:"var(--font-mono)",fontSize:10,letterSpacing:"0.12em",padding:"3px 8px",borderRadius:3,background:`${col}20`,color:col,border:`1px solid ${col}40`}}>{s.scenario.toUpperCase()}</span>
                {isExp&&<span style={{fontFamily:"var(--font-mono)",fontSize:9,color:"var(--text-muted)"}}>BASE CASE</span>}
              </div>
              <div style={{fontFamily:"var(--font-head)",fontSize:34,letterSpacing:"0.02em",color:neg?"var(--red)":col,marginBottom:4}}>{neg?"−":""}₹{fmt(s.net_profit)}</div>
              <div style={{fontFamily:"var(--font-mono)",fontSize:10,color:"var(--text-muted)",marginBottom:20}}>NET PROFIT / MONTH</div>
              {[["Units sold",s.estimated_monthly_sales],["Revenue",`₹${fmt(s.revenue)}`],["COGS",`₹${fmt(s.cogs)}`],["Platform fee",`₹${fmt(s.platform_fee)}`],["Ad spend",`₹${fmt(s.ad_spend)}`],["ROI",`${s.roi_percent.toFixed(1)}%`],["Break-even",s.break_even_months===Infinity?"∞":`${s.break_even_months.toFixed(1)} mo`]].map(([l,v])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid var(--border)",fontFamily:"var(--font-mono)",fontSize:12}}>
                  <span style={{color:"var(--text-muted)"}}>{l}</span>
                  <span style={{color:"var(--text)"}}>{v}</span>
                </div>
              ))}
            </Card>
          );
        })}
      </div>

      <Card className="f2">
        <SectionLabel>Net Profit Comparison</SectionLabel>
        <div style={{marginTop:20}}>
          {data.profit_scenarios.map(s=>{
            const col=COLS[s.scenario.toLowerCase()]||"var(--green)";
            const neg=s.net_profit<0;
            const pct=Math.abs(s.net_profit)/maxAbs*100;
            return (
              <div key={s.scenario} style={{marginBottom:20}}>
                <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                  <span style={{fontFamily:"var(--font-head)",fontSize:16,letterSpacing:"0.05em"}}>{s.scenario.toUpperCase()}</span>
                  <span style={{fontFamily:"var(--font-mono)",fontSize:13,color:neg?"var(--red)":col,fontWeight:600}}>{neg?"−":""}₹{fmt(s.net_profit)}</span>
                </div>
                <div style={{height:32,background:"var(--surface)",borderRadius:4,overflow:"hidden",border:"1px solid var(--border)"}}>
                  <div style={{height:"100%",width:`${pct}%`,background:neg?"var(--red)":col,borderRadius:4,animation:"barIn 1s ease",display:"flex",alignItems:"center",paddingLeft:12,minWidth:80}}>
                    <span style={{fontFamily:"var(--font-mono)",fontSize:11,color:"var(--bg)",fontWeight:600}}>{fmt(s.estimated_monthly_sales)} units</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   SIGNALS PAGE
═══════════════════════════════════════════════════════════════════════════ */
const SignalsPage = ({data}) => {
  if(!data)return null;
  const s=data.raw_signals;
  const groups=[
    {title:"Google Trends",color:"var(--green)",rows:[["Trend Average (0–100)",fmtD(s.trend_avg)],["Trend Growth (%)",`${s.trend_growth>0?"+":""}${fmtD(s.trend_growth)}%`],["Seasonality Variance",fmtD(s.seasonality_variance)]]},
    {title:"Amazon Market",color:"var(--blue)",rows:[["Avg Market Price",`₹${fmt(s.avg_price)}`],["Avg Reviews",fmt(s.avg_reviews)],["Seller Count",s.seller_count],["Review Velocity",`${fmtD(s.review_velocity)} /mo`],["Best Seller Rank",s.bsr>0?`#${s.bsr.toLocaleString()}`:"N/A"]]},
    {title:"Keyword Intelligence",color:"var(--amber)",rows:[["Monthly Search Volume",s.monthly_search_volume.toLocaleString()],["CPC (USD)",`$${s.cpc_score.toFixed(3)}`],["Keyword Competition",s.keyword_competition]]},
    {title:"Supplier Pricing",color:"var(--purple)",rows:[["Landed Cost (local)",`₹${fmt(s.supplier_cost_local)}`],["Cost Source",s.supplier_cost_source],["Data Confidence",`${(s.data_confidence*100).toFixed(0)}%`]]},
  ];
  return (
    <div style={{maxWidth:1100,margin:"40px auto",padding:"0 28px"}}>
      <div className="f0" style={{marginBottom:28}}>
        <SectionLabel>Transparency Layer</SectionLabel>
        <h2 style={{fontFamily:"var(--font-head)",fontSize:40,letterSpacing:"0.04em"}}>RAW SIGNAL DATA</h2>
        <p style={{fontFamily:"var(--font-mono)",fontSize:12,color:"var(--text-dim)",marginTop:6}}>All values sourced from live APIs and scraping — no synthetic data.</p>
      </div>
      <div className="f1" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
        {groups.map(({title,color,rows})=>(
          <Card key={title}>
            <SectionLabel color={color}>{title}</SectionLabel>
            <div style={{marginTop:14}}>
              {rows.map(([l,v])=>(
                <div key={l} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid var(--border)",fontFamily:"var(--font-mono)",fontSize:12}}>
                  <span style={{color:"var(--text-muted)"}}>{l}</span>
                  <span style={{color:"var(--text)",fontWeight:600}}>{v}</span>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
      <Card className="f2" glow style={{display:"flex",alignItems:"center",gap:24}}>
        <div style={{position:"relative",width:72,height:72,flexShrink:0}}>
          <svg width={72} height={72} viewBox="0 0 72 72">
            <circle cx="36" cy="36" r="28" fill="none" stroke="var(--border)" strokeWidth="6"/>
            <circle cx="36" cy="36" r="28" fill="none" stroke="var(--green)" strokeWidth="6"
              strokeDasharray={`${s.data_confidence*175.9} 175.9`} strokeLinecap="round" transform="rotate(-90 36 36)" style={{transition:"stroke-dasharray 1s ease"}}/>
          </svg>
          <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"var(--font-head)",fontSize:18,color:"var(--green)"}}>{(s.data_confidence*100).toFixed(0)}%</div>
        </div>
        <div>
          <div style={{fontFamily:"var(--font-head)",fontSize:20,letterSpacing:"0.05em",marginBottom:6}}>DATA CONFIDENCE SCORE</div>
          <div style={{fontFamily:"var(--font-mono)",fontSize:12,color:"var(--text-dim)",lineHeight:1.8}}>Measures how many real data sources returned valid data.<br/>67–100% is ideal for launch decisions.</div>
        </div>
      </Card>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   STRATEGY PAGE
═══════════════════════════════════════════════════════════════════════════ */
const StrategyPage = ({data}) => {
  if(!data)return null;
  const rc=riskCol(data.risk_level);
  const recCol=data.final_recommendation?.includes("full")?"var(--green)":data.final_recommendation?.includes("controlled")?"var(--amber)":data.final_recommendation?.includes("Test")?"var(--blue)":"var(--red)";
  return (
    <div style={{maxWidth:900,margin:"40px auto",padding:"0 28px"}}>
      <div className="f0" style={{marginBottom:28}}>
        <SectionLabel>LLM Strategic Assessment</SectionLabel>
        <h2 style={{fontFamily:"var(--font-head)",fontSize:40,letterSpacing:"0.04em"}}>AI STRATEGY REPORT</h2>
        <p style={{fontFamily:"var(--font-mono)",fontSize:12,color:"var(--text-dim)",marginTop:6}}>Powered by Llama3:8B / rule-based fallback</p>
      </div>
      <Card className="f1" glow style={{marginBottom:20,padding:"24px 28px"}}>
        <SectionLabel color={recCol}>Final Recommendation</SectionLabel>
        <div style={{fontFamily:"var(--font-head)",fontSize:36,letterSpacing:"0.04em",color:recCol,marginTop:8,marginBottom:14}}>{data.final_recommendation?.toUpperCase()}</div>
        <div style={{display:"flex",gap:10,flexWrap:"wrap"}}>
          {[[`Risk: ${data.risk_level}`,rc],[data.viability_label,recCol],[`ROI: ${data.roi_percent.toFixed(1)}%`,data.roi_percent>0?"var(--green)":"var(--red)"],[`Confidence: ${data.confidence_score.toFixed(0)}%`,"var(--amber)"]].map(([l,c])=>(
            <span key={l} style={{fontFamily:"var(--font-mono)",fontSize:10,letterSpacing:"0.1em",padding:"3px 10px",borderRadius:3,background:`${c}18`,color:c,border:`1px solid ${c}40`}}>{l.toUpperCase()}</span>
          ))}
        </div>
      </Card>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
        {[{title:"Risk Analysis",content:data.risk_explanation,color:"var(--red)",icon:"⚠"},{title:"Positioning Strategy",content:data.positioning_strategy,color:"var(--blue)",icon:"◈"}].map(({title,content,color,icon},i)=>(
          <Card key={title} className={`f${i+2}`}>
            <SectionLabel color={color}>{icon} {title}</SectionLabel>
            <div style={{fontFamily:"var(--font-body)",fontSize:13,color:"var(--text-dim)",lineHeight:1.8,marginTop:12,whiteSpace:"pre-line"}}>{content||"No data available"}</div>
          </Card>
        ))}
      </div>
      <Card className="f4" style={{marginBottom:16}}>
        <SectionLabel color="var(--green)">→ Market Entry Advice</SectionLabel>
        <div style={{fontFamily:"var(--font-body)",fontSize:13,color:"var(--text-dim)",lineHeight:2,marginTop:12,whiteSpace:"pre-line"}}>{data.market_entry_advice||"No data available"}</div>
      </Card>
      <Card className="f5">
        <SectionLabel>Decision Matrix</SectionLabel>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12,marginTop:16}}>
          {[{label:"Demand",value:data.demand_score.toFixed(0),unit:"/100",color:"var(--green)"},{label:"Competition",value:data.competition_score.toFixed(0),unit:"/100",color:"var(--red)"},{label:"Margin",value:data.profit_margin.toFixed(1),unit:"%",color:"var(--green)"},{label:"Break-even",value:data.break_even_months===Infinity?"∞":data.break_even_months.toFixed(1),unit:" mo",color:"var(--amber)"}].map(({label,value,unit,color})=>(
            <div key={label} style={{textAlign:"center",padding:"16px 8px",background:"var(--surface)",borderRadius:6,border:"1px solid var(--border)"}}>
              <div style={{fontFamily:"var(--font-head)",fontSize:32,color,letterSpacing:"0.04em"}}>{value}<span style={{fontSize:14,color:"var(--text-muted)"}}>{unit}</span></div>
              <div style={{fontFamily:"var(--font-mono)",fontSize:10,color:"var(--text-muted)",marginTop:4,letterSpacing:"0.1em",textTransform:"uppercase"}}>{label}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   HISTORY PAGE
═══════════════════════════════════════════════════════════════════════════ */
const HistoryPage = () => {
  const [records,setRecords]=useState([]);
  const [loading,setLoading]=useState(true);
  useEffect(()=>{
    fetch("http://localhost:8000/history?limit=20").then(r=>r.json()).then(setRecords).catch(()=>setRecords([])).finally(()=>setLoading(false));
  },[]);
  return (
    <div style={{maxWidth:1100,margin:"40px auto",padding:"0 28px"}}>
      <div className="f0" style={{marginBottom:28}}>
        <SectionLabel>Analysis Log</SectionLabel>
        <h2 style={{fontFamily:"var(--font-head)",fontSize:40,letterSpacing:"0.04em"}}>HISTORY</h2>
      </div>
      {loading&&<div style={{fontFamily:"var(--font-mono)",fontSize:13,color:"var(--text-muted)"}}>Loading records...</div>}
      {!loading&&records.length===0&&<Card><div style={{fontFamily:"var(--font-mono)",fontSize:13,color:"var(--text-muted)"}}>No analyses yet.</div></Card>}
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {records.map((r,i)=>{
          const rc=riskCol(r.risk_level);
          return (
            <Card key={r.id} className="f1" style={{display:"flex",alignItems:"center",gap:24,flexWrap:"wrap"}}>
              <div style={{fontFamily:"var(--font-mono)",fontSize:11,color:"var(--text-muted)",minWidth:24}}>#{String(i+1).padStart(2,"0")}</div>
              <div style={{flex:1,minWidth:160}}>
                <div style={{fontFamily:"var(--font-head)",fontSize:20,letterSpacing:"0.04em"}}>{r.product_name.toUpperCase()}</div>
                <div style={{display:"flex",gap:8,marginTop:4,flexWrap:"wrap"}}>
                  {[[r.platform,"var(--blue)"],[r.country,"var(--purple)"]].map(([l,c])=>(
                    <span key={l} style={{fontFamily:"var(--font-mono)",fontSize:9,padding:"2px 7px",borderRadius:2,background:`${c}18`,color:c,border:`1px solid ${c}40`}}>{l}</span>
                  ))}
                </div>
              </div>
              <div style={{display:"flex",gap:28,flexWrap:"wrap"}}>
                {[{l:"DEMAND",v:r.demand_score?.toFixed(0),c:"var(--green)"},{l:"COMP.",v:r.competition_score?.toFixed(0),c:"var(--red)"},{l:"MARGIN",v:`${r.profit_margin?.toFixed(1)}%`,c:"var(--green)"},{l:"PROFIT",v:`₹${fmt(r.estimated_monthly_profit)}`,c:r.estimated_monthly_profit>0?"var(--green)":"var(--red)"},{l:"RISK",v:r.risk_level,c:rc}].map(({l,v,c})=>(
                  <div key={l} style={{textAlign:"center"}}>
                    <div style={{fontFamily:"var(--font-head)",fontSize:18,color:c,letterSpacing:"0.04em"}}>{v}</div>
                    <div style={{fontFamily:"var(--font-mono)",fontSize:9,color:"var(--text-muted)",letterSpacing:"0.1em"}}>{l}</div>
                  </div>
                ))}
              </div>
              <div style={{fontFamily:"var(--font-mono)",fontSize:10,color:"var(--text-muted)",minWidth:72,textAlign:"right"}}>
                {r.created_at?new Date(r.created_at).toLocaleDateString("en-IN"):""}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
   ROOT
═══════════════════════════════════════════════════════════════════════════ */
export default function App() {
  const [page,setPage]     = useState("analyze");
  const [result,setResult] = useState(null);
  const [apiOk,setApiOk]   = useState(false);

  useEffect(()=>{
    fetch("http://localhost:8000/health").then(r=>r.ok&&setApiOk(true)).catch(()=>setApiOk(false));
  },[]);

  const handleResult = useCallback(data=>{ setResult(data); setPage("results"); },[]);

  return (
    <>
      <GlobalStyles/>
      <Topbar page={page} setPage={setPage} hasData={!!result} apiOk={apiOk}/>
      <main>
        {page==="analyze"   && <AnalyzePage   onResult={handleResult}/>}
        {page==="results"   && <ResultsPage   data={result}/>}
        {page==="scenarios" && <ScenariosPage data={result}/>}
        {page==="signals"   && <SignalsPage   data={result}/>}
        {page==="strategy"  && <StrategyPage  data={result}/>}
        {page==="history"   && <HistoryPage/>}
      </main>
    </>
  );
}