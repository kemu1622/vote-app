// ===== 手机投票页逻辑 =====

let selectedOption = null;
let config = null;
let voterToken = null;

// 初始化
async function init() {
  // 获取或生成投票token
  voterToken = localStorage.getItem('voteToken');
  if (!voterToken) {
    const res = await fetch('/api/token');
    const data = await res.json();
    voterToken = data.token;
    localStorage.setItem('voteToken', voterToken);
  }

  // 检查是否已投票
  const statusRes = await fetch(`/api/status?token=${voterToken}`);
  const statusData = await statusRes.json();

  if (statusData.voted) {
    showAlreadyVoted(statusData.optionId);
    return;
  }

  // 加载配置
  const configRes = await fetch('/api/config');
  config = await configRes.json();

  document.getElementById('voteTitle').textContent = config.title;
  document.getElementById('voteSubtitle').textContent = config.subtitle;

  // 渲染选项
  renderOptions();

  // 显示投票页
  document.getElementById('loadingScreen').style.display = 'none';
  document.getElementById('voteScreen').style.display = 'flex';
}

// 渲染选项
function renderOptions() {
  const list = document.getElementById('optionsList');
  list.innerHTML = config.options.map(opt => `
    <div class="option-card" data-id="${opt.id}" style="--card-color: ${opt.color};" onclick="selectOption(${opt.id})">
      <div class="option-avatar" style="background: ${opt.color};">${opt.name.charAt(0)}</div>
      <div class="option-info">
        <div class="option-name">${opt.name}</div>
        <div class="option-desc">${opt.desc}</div>
      </div>
      <div class="option-check"></div>
    </div>
  `).join('');
}

// 选择选项
function selectOption(id) {
  selectedOption = id;
  document.querySelectorAll('.option-card').forEach(card => {
    card.classList.toggle('selected', parseInt(card.dataset.id) === id);
  });

  const opt = config.options.find(o => o.id === id);
  const btn = document.getElementById('submitBtn');
  btn.disabled = false;
  btn.textContent = `投票给「${opt.name}」`;
}

// 提交投票
async function submitVote() {
  if (!selectedOption) return;

  const btn = document.getElementById('submitBtn');
  btn.classList.add('loading');
  btn.textContent = '提交中...';

  try {
    const res = await fetch('/api/vote', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: voterToken, optionId: selectedOption })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      showVotedSuccess(selectedOption);
    } else if (data.voted) {
      showAlreadyVoted(data.optionId);
    } else {
      btn.classList.remove('loading');
      btn.textContent = data.error || '投票失败，请重试';
      setTimeout(() => {
        const opt = config.options.find(o => o.id === selectedOption);
        btn.textContent = `投票给「${opt.name}」`;
      }, 2000);
    }
  } catch (e) {
    btn.classList.remove('loading');
    btn.textContent = '网络错误，请重试';
  }
}

// 显示投票成功
function showVotedSuccess(optionId) {
  const opt = config.options.find(o => o.id === optionId);
  document.getElementById('voteScreen').style.display = 'none';
  document.getElementById('votedScreen').style.display = 'flex';
  document.getElementById('votedOption').innerHTML = `
    <div class="opt-name">${opt.name}</div>
    <div class="opt-desc">${opt.desc}</div>
  `;
}

// 显示已投票
function showAlreadyVoted(optionId) {
  document.getElementById('loadingScreen').style.display = 'none';
  document.getElementById('voteScreen').style.display = 'none';
  document.getElementById('votedScreen').style.display = 'none';

  if (config && optionId) {
    const opt = config.options.find(o => o.id === optionId);
    if (opt) {
      document.getElementById('alreadyVotedOption').innerHTML = `
        <div class="opt-name">${opt.name}</div>
        <div class="opt-desc">${opt.desc}</div>
      `;
    } else {
      document.getElementById('alreadyVotedOption').innerHTML = '';
    }
  } else {
    document.getElementById('alreadyVotedOption').innerHTML = '';
  }

  document.getElementById('alreadyVotedScreen').style.display = 'flex';
}

// 绑定提交按钮
document.getElementById('submitBtn').addEventListener('click', submitVote);

// 启动
init();
