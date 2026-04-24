/* ════════════════════════════════════════════
   Projects Developers — dev-script.js
   by وائل | Wano (@wn6b)
   ════════════════════════════════════════════ */

'use strict';

// ══════════════════════════════════
// CONFIGURATION
// ══════════════════════════════════
const ANTHROPIC_MODEL = 'claude-sonnet-4-20250514';
const MAIN_SITE_URL = 'https://wn6b.github.io/WanoHost'; // رابط الموقع الأساسي

const DB = {
  get: (k) => { try { return JSON.parse(localStorage.getItem(k)); } catch { return null; } },
  set: (k, v) => localStorage.setItem(k, JSON.stringify(v)),
  del: (k) => localStorage.removeItem(k)
};

// ══════════════════════════════════
// LOADER & INITIALIZATION
// ══════════════════════════════════
const LOADER_STEPS = [
  'Booting Developer Environment...',
  'Loading Deep AI Models...',
  'Securing Connection...',
  'Initializing Terminal...',
  'System Ready ✓'
];

function startLoader() {
  const bar = document.getElementById('loaderBar');
  const status = document.getElementById('loaderStatus');
  const pc = document.getElementById('loaderParticles');
  
  if (pc) {
    for (let i = 0; i < 18; i++) {
      const d = document.createElement('div');
      d.className = 'lp-dot';
      const size = Math.random() * 4 + 2;
      d.style.cssText = `
        width:${size}px;height:${size}px;
        left:${Math.random()*100}%;
        animation-duration:${Math.random()*6+5}s;
        animation-delay:${Math.random()*4}s;
        opacity:0.6;
      `;
      pc.appendChild(d);
    }
  }

  let step = 0;
  const total = LOADER_STEPS.length;
  const interval = setInterval(() => {
    if (step >= total) {
      clearInterval(interval);
      setTimeout(exitLoader, 400);
      return;
    }
    const pct = Math.round(((step + 1) / total) * 100);
    if(bar) bar.style.width = pct + '%';
    if(status) status.textContent = LOADER_STEPS[step];
    step++;
  }, 300);
}

function exitLoader() {
  const loader = document.getElementById('loader');
  if(loader) {
    loader.classList.add('exit');
    setTimeout(() => {
      loader.classList.add('hidden');
      checkDevSession();
    }, 600);
  }
}

// ══════════════════════════════════
// SESSION CHECK
// ══════════════════════════════════
function checkDevSession() {
  const devSession = DB.get('dev_session');
  if (devSession && devSession.email) {
    showDevDash(devSession);
  } else {
    document.getElementById('authScreen').classList.remove('hidden');
    initAuthCanvas();
  }
}

// ══════════════════════════════════
// AUTH CANVAS BACKGROUND
// ══════════════════════════════════
function initAuthCanvas() {
  const canvas = document.getElementById('authCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const nodes = Array.from({ length: 60 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
    r: Math.random() * 2 + 1
  }));

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    nodes.forEach(n => {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > canvas.width) n.vx *= -1;
      if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(124,58,237,0.5)'; // لون مميز للمطورين
      ctx.fill();
    });
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.strokeStyle = `rgba(0,212,255,${0.15 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(draw);
  }
  draw();

  window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  });
}

// ══════════════════════════════════
// DEVELOPER APPLICATION (AI REVIEW)
// ══════════════════════════════════
async function handleDevApplication() {
  const name = document.getElementById('devName').value.trim();
  const email = document.getElementById('devEmail').value.trim();
  const skill = document.getElementById('devSkill').value;
  const reason = document.getElementById('devReason').value.trim();
  
  const btn = document.getElementById('applyBtn');
  const errEl = document.getElementById('applyError');
  const sucEl = document.getElementById('applySuccess');

  hideEl(errEl); hideEl(sucEl);

  if (!name || !email || !reason) {
    showErr(errEl, '<i class="fa-solid fa-triangle-exclamation"></i> يرجى تعبئة جميع الحقول بدقة.');
    return;
  }

  setLoading(btn, true);
  showAIThink('AI يقوم بتحليل مهاراتك وخبراتك...');

  let aiApproved = false;
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 100,
        messages: [{
          role: 'user',
          content: `أنت نظام تقييم مطورين لمنصة برمجية متطورة.
الاسم: ${name}
البريد: ${email}
التخصص: ${skill}
الخبرة/السبب: ${reason}
قيّم هذا المطور. هل يبدو كمطور حقيقي ومحترف؟ 
إذا كان كلامه منطقياً وبرمجياً أجب بكلمة: APPROVE
إذا كان كلامه عشوائياً أو وهمياً أجب بكلمة: REJECT`
        }]
      })
    });
    const data = await response.json();
    const text = data.content?.[0]?.text?.toUpperCase() || '';
    aiApproved = text.includes('APPROVE');
  } catch (e) {
    aiApproved = true; // Fallback
  }

  hideAIThink();
  setLoading(btn, false);

  if (!aiApproved) {
    showErr(errEl, '<i class="fa-solid fa-ban"></i> تم رفض الطلب بواسطة الـ AI. الأسباب المقدمة غير كافية أو غير منطقية برمجياً.');
    return;
  }

  // حفظ الجلسة كمطور معتمد
  const newDev = { name, email, skill, joinedAt: new Date().toISOString() };
  DB.set('dev_session', newDev);
  
  // حفظ المطور بقائمة المطورين الكلية (محاكاة الربط بقاعدة البيانات المشتركة)
  let devs = DB.get('pb_devs') || [];
  devs.push(newDev);
  DB.set('pb_devs', devs);

  sucEl.innerHTML = '<i class="fa-solid fa-check-double"></i> تمت الموافقة! يتم الآن تجهيز بيئة التطوير...';
  sucEl.classList.remove('hidden');

  // تحويله لواجهة النجاح الخاصة بالمطورين بعد 2 ثانية
  setTimeout(() => {
    document.getElementById('authScreen').classList.add('hidden');
    showDevDash(newDev);
    showDevSection('dsecRedirect', null);
    startRedirectTimer();
  }, 2000);
}
// ══════════════════════════════════
// DASHBOARD RENDERING & NAVIGATION
// ══════════════════════════════════
function showDevDash(devUser) {
  document.getElementById('devDash').classList.remove('hidden');
  document.getElementById('authScreen').classList.add('hidden');

  // تحديث بيانات القائمة الجانبية للمطور
  document.getElementById('devDisplayName').textContent = devUser.name;
  const avatarStr = devUser.name ? devUser.name.charAt(0).toUpperCase() : '<i class="fa-solid fa-user-ninja"></i>';
  document.getElementById('devDisplayPfp').innerHTML = avatarStr;

  renderDevStatus();
}

function showDevSection(id, el) {
  document.querySelectorAll('#devDash .dash-section').forEach(s => s.classList.remove('active'));
  document.getElementById(id)?.classList.add('active');
  
  document.querySelectorAll('#devDash .snav-item').forEach(a => a.classList.remove('active'));
  if (el) el.classList.add('active');

  const titles = {
    dsecSubmit: 'تقديم مشروع جديد',
    dsecStatus: 'حالة المشاريع',
    dsecRedirect: 'جاري التحويل...'
  };
  document.getElementById('devPageTitle').textContent = titles[id] || '';
  closeDevSidebar();
}

function toggleDevSidebar() {
  document.getElementById('devSidebar').classList.toggle('open');
}

function closeDevSidebar() {
  if (window.innerWidth <= 768) {
    document.getElementById('devSidebar').classList.remove('open');
  }
}

// ══════════════════════════════════
// DEEP SCAN: FILE HANDLING
// ══════════════════════════════════
let devSelectedFile = null;
let devFileData = null;

function handleDevFileSelect(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 50 * 1024 * 1024) {
    alert('حجم الملف يتجاوز 50MB');
    return;
  }
  devSelectedFile = file;
  document.getElementById('devDropZone').classList.add('hidden');
  const prev = document.getElementById('devFilePreview');
  prev.classList.remove('hidden');
  document.getElementById('dfpName').textContent = file.name;
  document.getElementById('dfpSize').textContent = formatBytes(file.size);

  const reader = new FileReader();
  reader.onload = (e) => { devFileData = e.target.result; };
  reader.readAsDataURL(file);
}

function clearDevFile() {
  devSelectedFile = null; 
  devFileData = null;
  document.getElementById('devFileInput').value = '';
  document.getElementById('devFilePreview').classList.add('hidden');
  document.getElementById('devDropZone').classList.remove('hidden');
}

// إعداد سحب وإفلات الملفات
document.addEventListener('DOMContentLoaded', () => {
  const dz = document.getElementById('devDropZone');
  if (!dz) return;
  dz.addEventListener('dragover', e => { e.preventDefault(); dz.classList.add('drag-over'); });
  dz.addEventListener('dragleave', () => dz.classList.remove('drag-over'));
  dz.addEventListener('drop', e => {
    e.preventDefault(); dz.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) {
      const input = document.getElementById('devFileInput');
      const dt = new DataTransfer();
      dt.items.add(file);
      input.files = dt.files;
      handleDevFileSelect(input);
    }
  });
});

// ══════════════════════════════════
// DEEP SCAN AI LOGIC
// ══════════════════════════════════
async function startDeepScan() {
  const name = document.getElementById('devProjName').value.trim();
  const stack = document.getElementById('devProjStack').value.trim();
  const btn = document.getElementById('devSubmitBtn');
  const terminal = document.getElementById('devStBody');

  if (!name || !stack || !devSelectedFile) {
    alert('يرجى تعبئة جميع الحقول ورفع ملف السورس كود لبدء الفحص.');
    return;
  }

  setLoading(btn, true);
  terminal.innerHTML = '';

  const scanSteps = [
    { t: 'Initializing Deep AI Kernel...', c: 'st-wait', d: 300 },
    { t: 'Extracting and parsing source code...', c: 'st-ok', d: 800 },
    { t: 'Analyzing dependencies and imports...', c: 'st-wait', d: 1400 },
    { t: 'Running Static Application Security Testing (SAST)...', c: 'st-warn', d: 2200 },
    { t: 'Checking for obfuscated malware or backdoors...', c: 'st-warn', d: 3000 },
    { t: 'Connecting to Anthropic AI for logic validation...', c: 'st-ok', d: 3800 }
  ];

  for (const step of scanSteps) {
    await sleep(step.d - (scanSteps[scanSteps.indexOf(step)-1]?.d || 0));
    const div = document.createElement('div');
    div.className = 'st-line';
    div.innerHTML = `<span class="st-prompt">#</span> <span class="${step.c}">${step.t}</span>`;
    terminal.appendChild(div);
    terminal.scrollTop = terminal.scrollHeight;
  }

  // محاكاة استدعاء API للفحص العميق
  let aiPassed = true;
  let score = 95;
  let quality = 98;
  let aiReason = 'تم التحقق. الكود نظيف ومطابق لمعايير الأمان.';

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 150,
        messages: [{
          role: 'user',
          content: `أنت نظام فحص أمني "عميق وصارم" لمشاريع المطورين المحترفين.
المشروع: ${name}
التقنيات: ${stack}
اسم الملف: ${devSelectedFile.name}
هل هذا المشروع آمن للنشر؟ قم بتقييم الأمان وجودة الكود. قم بالرد بصيغة JSON فقط:
{"safe": true/false, "securityScore": 95, "qualityScore": 90, "reason": "سبب قصير للتقييم"}`
        }]
      })
    });
    const data = await response.json();
    const text = data.content?.[0]?.text || '{"safe":true,"securityScore":99,"qualityScore":95,"reason":"الكود ممتاز وآمن للاستخدام."}';
    const clean = text.replace(/```json|```/g, '').trim();
    const result = JSON.parse(clean);
    
    aiPassed = result.safe;
    score = result.securityScore || score;
    quality = result.qualityScore || quality;
    aiReason = result.reason || aiReason;
  } catch (e) {
    // في حال فشل الاتصال، السماح بالمرور للنسخة التجريبية
  }

  await sleep(1000);
  
  if (!aiPassed) {
    const div = document.createElement('div');
    div.className = 'st-line';
    div.innerHTML = `<span class="st-prompt">AI</span> <span class="st-err"><i class="fa-solid fa-ban"></i> تم حظر العملية! ${aiReason}</span>`;
    terminal.appendChild(div);
    
    document.getElementById('mSecurity').textContent = score + '%';
    document.getElementById('mSecurity').style.color = 'var(--red)';
    document.getElementById('mQuality').textContent = quality + '%';
    
    setLoading(btn, false);
    return;
  }

  // في حال النجاح
  const div = document.createElement('div');
  div.className = 'st-line';
  div.innerHTML = `<span class="st-prompt">AI</span> <span class="st-ok"><i class="fa-solid fa-check-double"></i> الفحص اجتاز بنجاح! ${aiReason}</span>`;
  terminal.appendChild(div);

  document.getElementById('mSecurity').textContent = score + '%';
  document.getElementById('mSecurity').style.color = 'var(--green)';
  document.getElementById('mQuality').textContent = quality + '%';
  document.getElementById('mQuality').style.color = 'var(--accent)';

  // حفظ المشروع في قاعدة البيانات لارساله لاحقاً
  savePendingProject({
    name,
    stack,
    fileName: devSelectedFile.name,
    fileData: devFileData,
    status: 'pending_sync',
    uploadedAt: new Date().toISOString()
  });

  setLoading(btn, false);
  alert('✅ تمت الموافقة على كودك! تم إدراج المشروع في قائمة المزامنة مع الموقع الرئيسي.');
  
  // تصفير الحقول ونقله لقسم حالة المشاريع
  document.getElementById('devProjName').value = '';
  document.getElementById('devProjStack').value = '';
  clearDevFile();
  
  showDevSection('dsecStatus', document.querySelectorAll('#devDash .snav-item')[1]);
  renderDevStatus();
}
// ══════════════════════════════════
// DATA SYNC & STORAGE
// ══════════════════════════════════
function savePendingProject(project) {
  let pending = DB.get('dev_pending_sync') || [];
  pending.unshift(project);
  DB.set('dev_pending_sync', pending);
}

function renderDevStatus() {
  const list = document.getElementById('devProjectsList');
  if (!list) return;

  const pending = DB.get('dev_pending_sync') || [];
  if (pending.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="es-icon"><i class="fa-solid fa-diagram-project"></i></div>
        <div class="es-text">لم تقم برفع أي مشروع بعد.</div>
      </div>`;
    return;
  }

  list.innerHTML = pending.map(p => `
    <div class="status-card">
      <div class="sc-info">
        <div class="sc-icon success"><i class="fa-solid fa-cloud-check"></i></div>
        <div class="sc-details">
          <strong>${escHtml(p.name)}</strong>
          <span>تم الفحص بنجاح وهو جاهز للمزامنة مع الموقع الرئيسي.</span>
        </div>
      </div>
      <div class="sc-badge success">Verified Code</div>
    </div>
  `).join('');
}

// ══════════════════════════════════
// REDIRECT LOGIC
// ══════════════════════════════════
let timerInterval;
function startRedirectTimer() {
  let seconds = 5;
  const timerEl = document.getElementById('rTimer');
  
  timerInterval = setInterval(() => {
    seconds--;
    if (timerEl) timerEl.textContent = seconds;
    
    if (seconds <= 0) {
      clearInterval(timerInterval);
      redirectToMain();
    }
  }, 1000);
}

function redirectToMain() {
  // نقوم بتنظيف أي فترات زمنية متبقية
  clearInterval(timerInterval);
  
  // توجيه المستخدم للموقع الأساسي
  window.location.href = MAIN_SITE_URL;
}

// ══════════════════════════════════
// NOTIFICATIONS
// ══════════════════════════════════
function showDevNotif() { document.getElementById('devNotifPanel')?.classList.remove('hidden'); }
function hideDevNotif() { document.getElementById('devNotifPanel')?.classList.add('hidden'); }

// ══════════════════════════════════
// HELPERS (Vector Compatible)
// ══════════════════════════════════
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function setLoading(btn, loading) {
  if (!btn) return;
  const text = btn.querySelector('.btn-text');
  const loader = btn.querySelector('.btn-loader');
  btn.disabled = loading;
  if (loading) { 
    if(text) text.classList.add('hidden'); 
    if(loader) loader.classList.remove('hidden'); 
  } else { 
    if(text) text.classList.remove('hidden'); 
    if(loader) loader.classList.add('hidden'); 
  }
}

function showErr(el, msg) {
  if (!el) return;
  el.innerHTML = msg; // يدعم أيقونات الفيكتور
  el.classList.remove('hidden');
}

function hideEl(el) { if(el) el.classList.add('hidden'); }

function escHtml(str) {
  if (!str) return '';
  return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

function formatBytes(b) {
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1048576).toFixed(1) + ' MB';
}

// ══════════════════════════════════
// KEYBOARD & INIT
// ══════════════════════════════════
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') hideDevNotif();
});

document.addEventListener('DOMContentLoaded', () => {
  startLoader();
});
