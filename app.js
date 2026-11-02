const $ = (s) => document.querySelector(s);
const chat=$('#chat'), form=$('#composer'), input=$('#message');
const panel=$('#settingsPanel'), apiInput=$('#apiKey'), modelInput=$('#model'), voiceOn=$('#voiceOn');
apiInput.value=localStorage.getItem('priya_key')||'';
modelInput.value=localStorage.getItem('priya_model')||'gemini-2.5-flash';
voiceOn.checked=localStorage.getItem('priya_voice')!=='false';
function openSettings(){panel.hidden=false;$('#settingsBtn').setAttribute('aria-expanded','true');}
function closeSettings(){panel.hidden=true;$('#settingsBtn').setAttribute('aria-expanded','false');}
$('#settingsBtn').addEventListener('click',openSettings);
$('#closeSettings').addEventListener('click',closeSettings);
$('#settingsForm').addEventListener('submit',(e)=>{e.preventDefault();const key=apiInput.value.trim();if(!key){$('#settingsStatus').textContent='Pehle Gemini API key paste karo.';return;}localStorage.setItem('priya_key',key);localStorage.setItem('priya_model',modelInput.value.trim()||'gemini-2.5-flash');localStorage.setItem('priya_voice',String(voiceOn.checked));$('#settingsStatus').textContent='Settings save ho gayi! Ab chat mein message bhejo. 💗';});
function bubble(text,who){const d=document.createElement('div');d.className='bubble '+who;d.textContent=text;chat.append(d);chat.scrollTop=chat.scrollHeight;return d;}
function speak(text){if(!voiceOn.checked||!('speechSynthesis'in window))return;speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='hi-IN';u.rate=.96;u.pitch=1.08;speechSynthesis.speak(u);}
const history=[];
const systemPrompt=`Tum Priya ho, ek fictional AI companion. User aur tum dono adults (18+) ho. Natural, warm Hindi/Hinglish mein baat karo. Tum caring, romantic, playful, confident aur lightly flirty ho; user ki boundaries ka respect karo. Explicit sexual content, graphic sexual roleplay, coercion ya pressure mat do. Apne aap ko real insaan mat batao; zarurat par saaf kaho ki tum AI ho. Chhote natural replies do, aur user ko judge na karo.`;
async function reply(message){
 const key=localStorage.getItem('priya_key');
 if(!key){bubble('Mujhse AI chat shuru karne ke liye upar ⚙️ Settings kholo aur Gemini API key save karo. 💗','priya');openSettings();return;}
 const loading=bubble('Priya typing…','priya typing');history.push({role:'user',parts:[{text:message}]});
 try{const model=localStorage.getItem('priya_model')||'gemini-2.5-flash';const r=await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(key)}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({systemInstruction:{parts:[{text:systemPrompt}]},contents:history.slice(-16),generationConfig:{temperature:.9,maxOutputTokens:500}})});const data=await r.json();if(!r.ok)throw new Error(data.error?.message||'API request failed');const answer=data.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join('').trim()||'Abhi reply nahi aa paaya. Dobara try karoge?';history.push({role:'model',parts:[{text:answer}]});loading.className='bubble priya';loading.textContent=answer;speak(answer);
 }catch(e){loading.className='bubble priya';loading.textContent='Oops! '+e.message+' — API key/model check karo.';history.pop();}
}
form.addEventListener('submit',e=>{e.preventDefault();const m=input.value.trim();if(!m)return;input.value='';bubble(m,'me');reply(m);});
document.querySelectorAll('[data-msg]').forEach(b=>b.addEventListener('click',()=>{input.value=b.dataset.msg;form.requestSubmit();}));
$('#micBtn').addEventListener('click',()=>{const SR=window.SpeechRecognition||window.webkitSpeechRecognition;if(!SR){bubble('Is browser mein speech-to-text support nahi hai. Keyboard se type kar sakte ho.','priya');return;}const rec=new SR();rec.lang='hi-IN';rec.onresult=e=>{input.value=e.results[0][0].transcript;};rec.start();});
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))navigator.serviceWorker.register('./sw.js').catch(()=>{});
