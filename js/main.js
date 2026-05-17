document.addEventListener('DOMContentLoaded', () => {

  // ---- Parallax Stars ----
  function generateStarShadows(count) {
    const shadows = [];
    for (let i = 0; i < count; i++) {
      shadows.push(Math.floor(Math.random() * 2000) + 'px ' + Math.floor(Math.random() * 2000) + 'px #FFF');
    }
    return shadows.join(', ');
  }

  const starsEl = document.getElementById('stars');
  const stars2El = document.getElementById('stars2');
  const stars3El = document.getElementById('stars3');
  if (starsEl) starsEl.style.boxShadow = generateStarShadows(700);
  if (stars2El) stars2El.style.boxShadow = generateStarShadows(200);
  if (stars3El) stars3El.style.boxShadow = generateStarShadows(100);

  // ---- Navigation (Desktop + Mobile) ----
  const mainContent = document.getElementById('mainContent');
  const sections = document.querySelectorAll('[data-section]');
  const navBtns = document.querySelectorAll('[data-nav]');

  function setActive(id) {
    navBtns.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.nav === id);
    });
  }

  navBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.querySelector(`[data-section="${btn.dataset.nav}"]`);
      if (target && mainContent) {
        mainContent.scrollTo({ top: target.offsetTop, behavior: 'smooth' });
      }
    });
  });

  if (mainContent) {
    mainContent.addEventListener('scroll', () => {
      const scrollTop = mainContent.scrollTop + 100;
      let current = 'home';
      // If scrolled to bottom, activate the last section
      if (mainContent.scrollTop + mainContent.clientHeight >= mainContent.scrollHeight - 2) {
        current = sections[sections.length - 1].dataset.section;
      } else {
        sections.forEach(sec => {
          if (sec.offsetTop <= scrollTop) current = sec.dataset.section;
        });
      }
      setActive(current);
    }, { passive: true });
  }

  // ---- Mobile Sidebar ----
  const menuBtn = document.getElementById('menuBtn');
  const sidebarOverlay = document.getElementById('sidebarOverlay');
  const sidebarMobile = document.getElementById('sidebarMobile');
  const closeSidebar = document.getElementById('closeSidebar');

  function openSidebar() {
    sidebarOverlay.classList.add('open');
    sidebarMobile.classList.add('open');
  }
  function closeSidebarFn() {
    sidebarOverlay.classList.remove('open');
    sidebarMobile.classList.remove('open');
  }

  if (menuBtn) menuBtn.addEventListener('click', openSidebar);
  if (closeSidebar) closeSidebar.addEventListener('click', closeSidebarFn);
  if (sidebarOverlay) sidebarOverlay.addEventListener('click', closeSidebarFn);

  // ---- Skill Bar Animation (Intersection Observer) ----
  const skillBars = document.querySelectorAll('.skill__fill');
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.width = entry.target.dataset.level + '%';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });

  skillBars.forEach(bar => observer.observe(bar));


  // ---- CubePairs ----
  (function() {
    const E = [[0,0],[0,0]];
    const S = [
      [[1,1],[1,1]],[[0,1],[1,1]],[[1,0],[1,1]],[[1,1],[0,1]],[[1,1],[1,0]],
      [[0,0],[1,1]],[[1,1],[0,0]],[[0,1],[0,1]],[[1,0],[1,0]],[[0,1],[1,0]],
      [[1,0],[0,1]],[[0,1],[0,0]],[[0,0],[1,0]],[[1,0],[0,0]],[[0,0],[0,1]]
    ];
    const gEl = document.getElementById('playGrid');
    const mEl = document.getElementById('playMoves');
    if (!gEl) return;

    let g, mv, sr = -1, sc = -1;
    const eq = (a,b) => a[0][0]===b[0][0] && a[0][1]===b[0][1] && a[1][0]===b[1][0] && a[1][1]===b[1][1];
    const xor = (a,b) => a.map((r,i) => r.map((c,j) => c^b[i][j]));
    const adj = (r1,c1,r2,c2) => Math.abs(r1-r2)<=1 && Math.abs(c1-c2)<=1 && !(r1===r2&&c1===c2);

    function init() {
      const l = [...S, S[Math.floor(Math.random()*S.length)]];
      for (let i = l.length-1; i > 0; i--) { const j = Math.floor(Math.random()*(i+1)); [l[i],l[j]]=[l[j],l[i]]; }
      g = Array.from({length:4}, (_,i) => Array.from({length:4}, (_,j) => l[i*4+j]));
      mv = 0; sr = -1; sc = -1;
      mEl.textContent = 'Moves: 0';
      render();
    }

    function html(s) {
      if (!s || eq(s,E)) return '';
      return '<table>'+s.map(r => '<tr>'+r.map(c => `<td class="${c?'filled':'empty'}"></td>`).join('')+'</tr>').join('')+'</table>';
    }

    function render() {
      gEl.innerHTML = '';
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) {
        const c = document.createElement('div');
        const empty = eq(g[i][j], E);
        c.className = 'play__cell'+(empty?' play__cell--empty':'')+(i===sr&&j===sc?' play__cell--selected':'');
        c.innerHTML = html(g[i][j]);
        c.addEventListener('click', () => pick(i,j));
        gEl.appendChild(c);
      }
    }

    function pick(r, c) {
      if (eq(g[r][c], E)) return;
      if (sr===r && sc===c) { sr=-1; sc=-1; render(); return; }
      if (sr===-1) { sr=r; sc=c; render(); return; }
      if (!adj(sr,sc,r,c)) { sr=-1; sc=-1; render(); return; }

      if (eq(g[sr][sc], g[r][c])) { g[sr][sc]=E; g[r][c]=E; }
      else { g[r][c] = xor(g[sr][sc], g[r][c]); }

      sr=-1; sc=-1; mv++;
      mEl.textContent = g.every(row => row.every(cell => eq(cell,E))) ? 'You won!' : 'Moves: '+mv;
      render();
    }

    document.getElementById('playRestart').addEventListener('click', init);
    document.addEventListener('click', (e) => { if (sr!==-1 && !e.target.closest('.play__cell')) { sr=-1; sc=-1; render(); } });
    init();
  })();

});
