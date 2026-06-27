// ===== 大屏展示页逻辑 =====

let prevResults = {};
let pollInterval = null;

// 初始化
async function init() {
  await loadConfig();
  await loadResults();
  await loadQRCode();
  initParticles();
  startPolling(); // 改用轮询替代SSE
}

// 开始轮询（每3秒刷新一次结果）
function startPolling() {
  if (pollInterval) clearInterval(pollInterval);
  pollInterval = setInterval(async () => {
    await loadResults();
  }, 3000);
}

// 加载配置
async function loadConfig() {
  try {
    const res = await fetch('/api/config');
    const data = await res.json();
    document.getElementById('pageTitle').textContent = data.title;
    document.getElementById('pageSubtitle').textContent = data.subtitle;
  } catch (e) {
    console.error('加载配置失败:', e);
  }
}

// 加载结果
async function loadResults() {
  try {
    const res = await fetch('/api/results');
    const data = await res.json();
    renderResults(data);
  } catch (e) {
    console.error('加载结果失败:', e);
  }
}

// 加载二维码
async function loadQRCode() {
  try {
    const res = await fetch('/api/qrcode');
    const data = await res.json();
    document.getElementById('qrCode').src = data.qrCode;
  } catch (e) {
    console.error('加载二维码失败:', e);
  }
}

// 渲染结果
function renderResults(data) {
  const list = document.getElementById('voteList');
  const participantEl = document.getElementById('participantCount');
  const totalVotesEl = document.getElementById('totalVotes');

  // 计算总票数
  const totalVotes = Object.values(data.voteData).reduce((a, b) => a + b, 0);
  
  // 更新数字
  if (parseInt(participantEl.textContent) !== data.totalParticipants) {
    participantEl.textContent = data.totalParticipants;
    participantEl.classList.add('count-animate');
    setTimeout(() => participantEl.classList.remove('count-animate'), 400);
  }

  if (parseInt(totalVotesEl.textContent) !== totalVotes) {
    totalVotesEl.textContent = totalVotes;
    totalVotesEl.classList.add('count-animate');
    setTimeout(() => totalVotesEl.classList.remove('count-animate'), 400);
  }

  // 构建结果数组
  const results = Object.keys(data.voteData).map(id => {
    const votes = data.voteData[id];
    const percentage = totalVotes > 0 ? Math.round(votes / totalVotes * 100) : 0;
    return { id: parseInt(id), votes, percentage };
  }).sort((a, b) => b.votes - a.votes);

  // 渲染投票条
  list.innerHTML = results.map((item, index) => {
    const rank = index + 1;
    const prevVotes = prevResults[item.id] || 0;
    const isNewVote = item.votes > prevVotes;

    return `
      <div class="vote-bar rank-${rank} ${isNewVote ? 'vote-in' : ''}" data-id="${item.id}">
        <div class="vote-rank">${rank}</div>
        <div class="vote-info">
          <div class="vote-name-row">
            <div>
              <span class="vote-name">选手${item.id}</span>
              <span class="vote-desc">待定</span>
            </div>
            <div class="vote-stats">
              <span class="vote-count">${item.votes}</span>
              <span class="vote-percentage">${item.percentage}%</span>
            </div>
          </div>
          <div class="vote-progress-track">
            <div class="vote-progress-fill" style="width: ${item.percentage}%; background: linear-gradient(90deg, #FF6B6B, #FF6B6Bcc);"></div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  // 更新prevResults
  results.forEach(item => {
    prevResults[item.id] = item.votes;
  });
}

// ===== 背景粒子动画 =====
function initParticles() {
  const canvas = document.getElementById('particles');
  const ctx = canvas.getContext('2d');
  let particles = [];

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  // 生成粒子
  for (let i = 0; i < 60; i++) {
    particles.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.1
    });
  }

  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(150, 130, 255, ${p.opacity})`;
      ctx.fill();
    });

    // 连线
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(120, 100, 255, ${0.08 * (1 - dist / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }
  animate();
}

// 页面卸载时清理
window.addEventListener('beforeunload', () => {
  if (pollInterval) clearInterval(pollInterval);
});

// 启动
init();
