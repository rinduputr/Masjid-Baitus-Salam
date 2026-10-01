(() => {
const IDLE_DELAY=2000, STEP=.65, RESET_MS=350;
let timer, active=false, frame, resetting=false;
const maxY=()=>Math.max(0,document.documentElement.scrollHeight-innerHeight);
const y=()=>scrollY||document.documentElement.scrollTop;
function stop(){active=false;resetting=false;if(frame)cancelAnimationFrame(frame);}
function schedule(){stop();clearTimeout(timer);timer=setTimeout(()=>{active=true;loop()},IDLE_DELAY);}
function top(){resetting=true;const start=y(),t0=performance.now();function a(t){if(!active)return;const p=Math.min(1,(t-t0)/RESET_MS),e=1-(1-p)**3;scrollTo(0,start*(1-e));if(p<1)frame=requestAnimationFrame(a);else{scrollTo(0,0);resetting=false;frame=requestAnimationFrame(loop)}}frame=requestAnimationFrame(a)}
function loop(){if(!active||resetting)return; if(maxY()<=2){schedule();return} if(y()>=maxY()-2){top();return} scrollBy(0,STEP);frame=requestAnimationFrame(loop)}
function activity(){schedule()}
["wheel","touchstart","touchmove","pointerdown","keydown","mousedown"].forEach(e=>addEventListener(e,activity,{passive:true}));
addEventListener("resize",()=>{if(active&&y()>=maxY()-2)top()},{passive:true});
schedule();
})();