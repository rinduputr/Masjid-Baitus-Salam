const CONFIG_URL = "data/config.json";
let config = null;
let prayerData = null;
let geo = {lat:null, lon:null, city:null};

const $ = (s)=>document.querySelector(s);
const pad = n => String(n).padStart(2,"0");

async function loadConfig(){
  const res = await fetch(CONFIG_URL);
  config = await res.json();
  renderStatic();
}

function renderStatic(){
  $("#announcementList").innerHTML = config.announcements.map(x=>`<div class="item"><strong>${x.title}</strong><small>${x.text}</small></div>`).join("");
  $("#agendaList").innerHTML = config.agenda.map(x=>`<div class="item"><strong>${x.title}</strong><small>${x.date} • ${x.time}</small></div>`).join("");
  const q = config.dailyQuotes[Math.floor(Math.random()*config.dailyQuotes.length)];
  $("#dailyQuote").innerHTML = `<div>“${q.text}”</div><span class="ref">${q.ref}</span>`;
  $("#tickerText").textContent = config.ticker;
}

function updateClock(){
  const now = new Date();
  $("#clock").textContent = now.toLocaleTimeString("id-ID",{hour12:false});
  $("#dateLine").textContent = now.toLocaleDateString("id-ID",{weekday:"long",day:"numeric",month:"long",year:"numeric"});
}
setInterval(updateClock,1000); updateClock();

function getLocation(){
  return new Promise(resolve=>{
    if(!navigator.geolocation){ resolve(null); return; }
    navigator.geolocation.getCurrentPosition(
      p=>resolve({lat:p.coords.latitude,lon:p.coords.longitude}),
      ()=>resolve(null),
      {enableHighAccuracy:true,timeout:7000,maximumAge:3600000}
    );
  });
}

async function fetchPrayerTimes(lat,lon){
  const d = new Date();
  const date = `${d.getDate().toString().padStart(2,"0")}-${(d.getMonth()+1).toString().padStart(2,"0")}-${d.getFullYear()}`;
  // Method 20 = Kementerian Agama Republik Indonesia on AlAdhan.
  const url = `https://api.aladhan.com/v1/timings/${date}?latitude=${lat}&longitude=${lon}&method=20&school=0`;
  const res = await fetch(url);
  if(!res.ok) throw new Error("Prayer API error");
  const json = await res.json();
  return json.data;
}

async function reverseLocation(lat,lon){
  try{
    const url=`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&accept-language=id`;
    const res=await fetch(url); const j=await res.json();
    return j.address?.city || j.address?.town || j.address?.municipality || j.address?.county || "Lokasi Anda";
  }catch{return "Lokasi Anda";}
}

function timeToMinutes(t){const [h,m]=t.split(":").map(Number);return h*60+m}
const prayers = [
  ["Imsak","Imsak","🌙"],["Subuh","Fajr","🌅"],["Terbit","Sunrise","☀️"],
  ["Zuhur","Dhuhr","🕛"],["Asar","Asr","🌤️"],["Maghrib","Maghrib","🌇"],["Isya","Isha","🌙"]
];

function renderPrayer(data){
  const t=data.timings;
  $("#prayerGrid").innerHTML=prayers.map(([label,key,icon])=>`
    <div class="prayer" id="p-${key}">
      <div class="icon">${icon}</div><div class="name">${label}</div><div class="time">${t[key].slice(0,5)}</div>
    </div>`).join("");
  $("#methodLabel").textContent="Metode: Kementerian Agama RI";
}

function updateNext(){
  if(!prayerData) return;
  const now=new Date();
  const nowMin=now.getHours()*60+now.getMinutes()+now.getSeconds()/60;
  const candidates=prayers.slice(1).map(([label,key])=>({label,key,time:prayerData.timings[key].slice(0,5)}));
  let next=candidates.find(p=>timeToMinutes(p.time)>nowMin);
  let targetDate=new Date(now);
  if(!next){next=candidates[0];targetDate.setDate(targetDate.getDate()+1)}
  const [h,m]=next.time.split(":").map(Number);
  targetDate.setHours(h,m,0,0);
  const diff=Math.max(0,targetDate-now);
  const sec=Math.floor(diff/1000), hh=Math.floor(sec/3600), mm=Math.floor((sec%3600)/60), ss=sec%60;
  $("#nextPrayerName").textContent=next.label;
  $("#nextPrayerTime").textContent=`Pukul ${next.time} WIB`;
  $("#countdown").textContent=`${pad(hh)}:${pad(mm)}:${pad(ss)}`;
  document.querySelectorAll(".prayer").forEach(e=>e.classList.remove("active"));
  $(`#p-${next.key}`).classList.add("active");
}
setInterval(updateNext,1000);

async function init(){
  try{
    await loadConfig();
    const pos=await getLocation();
    if(pos){
      geo=pos; $("#locationLabel").textContent="Lokasi terdeteksi otomatis";
      const city=await reverseLocation(pos.lat,pos.lon);
      $("#locationLabel").textContent=city;
      prayerData=await fetchPrayerTimes(pos.lat,pos.lon);
    }else{
      // Fallback: Bekasi coordinates; users can allow location for local times.
      geo={lat:-6.2383,lon:106.9756};
      $("#locationLabel").textContent="Bekasi • lokasi default";
      prayerData=await fetchPrayerTimes(geo.lat,geo.lon);
    }
    renderPrayer(prayerData); updateNext();
    $("#statusPill").textContent="TERHUBUNG";
  }catch(err){
    console.error(err);
    $("#statusPill").textContent="OFFLINE";
    $("#locationLabel").textContent="Data lokal / koneksi tidak tersedia";
  }
}
$("#refreshBtn").addEventListener("click",()=>location.reload());
init();
