'use strict';

(() => {
  // Google Apps Script waitlist destination
  const SIGNUP_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzN-gL5IUZfLPTnKhvhTfR8y5G2M-e2yZxqsLCXt9_M3lc9Y46PaEesDW7e_P4yi1h_gg/exec';

  const euro = new Intl.NumberFormat('en-IE', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
  });
  const money = (value) => euro.format(value);
  const isReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function createReadingScroll(element, speed = 28) {
    let frame = 0;
    let lastTime = 0;
    let startTime = 0;
    let target = 0;
    let position = 0;
    let paused = false;
    let waiting = [];
    const cancel = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      lastTime = 0;
      waiting.splice(0).forEach((resolve) => resolve());
    };
    const tick = (time) => {
      frame = 0;
      if (paused || document.hidden) { cancel(); return; }
      if (time < startTime) { frame = requestAnimationFrame(tick); return; }
      const maximum = Math.max(0, element.scrollHeight - element.clientHeight);
      const destination = Math.min(target, maximum);
      const distance = destination - position;
      if (Math.abs(distance) <= 1 || isReducedMotion()) {
        element.scrollTop = destination;
        cancel();
        return;
      }
      const delta = lastTime ? Math.min(time - lastTime, 50) : 16;
      lastTime = time;
      position += Math.sign(distance) * Math.min(Math.abs(distance), speed * delta / 1000);
      element.scrollTop = position;
      frame = requestAnimationFrame(tick);
    };
    const pause = () => { paused = true; cancel(); };
    element.addEventListener('wheel', pause, { passive: true });
    element.addEventListener('touchstart', pause, { passive: true });
    element.addEventListener('pointerdown', pause, { passive: true });
    element.addEventListener('keydown', (event) => {
      if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' '].includes(event.key)) pause();
    });
    document.addEventListener('visibilitychange', () => { if (document.hidden) cancel(); });
    return {
      follow(delay = 0) {
        if (paused) return;
        target = Math.max(0, element.scrollHeight - element.clientHeight);
        if (!frame) {
          position = element.scrollTop;
          startTime = performance.now() + delay;
          lastTime = 0;
          frame = requestAnimationFrame(tick);
        }
      },
      reset() { cancel(); paused = false; },
      cancel,
      finished() { return frame ? new Promise((resolve) => waiting.push(resolve)) : Promise.resolve(); }
    };
  }

  // Introduce the hero once and give larger story text a slow reading scroll.
  const heroChat = document.querySelector('.heroChatFigure');
  const heroThread = document.querySelector('.heroConversation');
  const heroQuestionText = document.querySelector('.heroChatQuestionText');
  const heroAnswer = document.querySelector('.heroChatAnswer');
  const heroReadingScroll = heroThread ? createReadingScroll(heroThread, 24) : null;
  let finishHeroIntroduction = () => {};
  if (heroChat && heroThread && heroQuestionText && heroAnswer && heroQuestionText.animate && !isReducedMotion()) {
    let heroStarted = false;
    let heroObserver;
    let heroAnimation;
    heroChat.dataset.chatPhase = 'waiting';
    heroQuestionText.style.visibility = 'hidden';
    heroAnswer.style.visibility = 'hidden';
    const settleHeroChat = () => {
      heroStarted = true;
      heroObserver?.disconnect();
      heroAnimation?.cancel();
      heroQuestionText.style.visibility = '';
      heroAnswer.style.visibility = '';
      heroChat.dataset.chatPhase = 'ready';
    };
    finishHeroIntroduction = settleHeroChat;
    const introduceHeroChat = async () => {
      if (heroStarted) return;
      heroStarted = true;
      heroObserver?.disconnect();
      if (isReducedMotion()) { settleHeroChat(); return; }
      heroChat.dataset.chatPhase = 'typing';
      heroQuestionText.style.visibility = '';
      try {
        heroAnimation = heroQuestionText.animate([
          { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }
        ], { duration: 1500, easing: 'steps(32, end)' });
        await heroAnimation.finished;
        heroAnswer.style.visibility = '';
        heroChat.dataset.chatPhase = 'answering';
        heroAnimation = heroAnswer.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 900, easing: 'ease-out' });
        await heroAnimation.finished;
        settleHeroChat();
        heroReadingScroll?.follow(4000);
      } catch {
        settleHeroChat();
      }
    };
    heroThread.addEventListener('wheel', settleHeroChat, { once: true, passive: true });
    heroThread.addEventListener('touchstart', settleHeroChat, { once: true, passive: true });
    heroThread.addEventListener('focus', settleHeroChat, { once: true });
    window.matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (event) => {
      if (event.matches) settleHeroChat();
    });
    if ('IntersectionObserver' in window) {
      heroObserver = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) void introduceHeroChat();
      }, { threshold: .25 });
      heroObserver.observe(heroChat);
    } else {
      void introduceHeroChat();
    }
  }

  const heroFollowupAnswers = {
    changed: `<p>You spent <strong>€3,074.49 this month</strong>, compared with <strong>€1,684.49 last month</strong>.</p>
      <dl class="heroCostBreakdown">
        <div><dt>Fixed costs <strong>+€40</strong></dt></div>
        <div><dt>Variable costs <strong>+€100</strong></dt></div>
        <div><dt>New couch <strong>+€1,250</strong></dt></div>
      </dl><p>That adds up to the <strong>€1,390 increase</strong>. The couch is a one-off purchase.</p>`,
    bills: `<p><strong>Utilities rose by €40</strong>, from €160 to €200.</p>
      <p>Rent stayed at <strong>€900</strong> and subscriptions at <strong>€74.49</strong>. Together, your fixed costs came to <strong>€1,174.49</strong>.</p>`,
    everyday: `<p>Your variable costs rose by <strong>€100</strong>, from €550 to <strong>€650</strong>.</p>
      <dl class="heroCostBreakdown">
        <div><dt>Groceries <strong>€350</strong></dt></div>
        <div><dt>Transport <strong>€120</strong></dt></div>
        <div><dt>Eating out <strong>€180</strong></dt></div>
      </dl><p>The couch is counted separately as a one-off purchase.</p>`
  };
  const heroFollowupButtons = Array.from(document.querySelectorAll('[data-hero-followup]'));
  const heroFollowupExchange = document.getElementById('hero-followup-exchange');
  heroFollowupButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const answer = heroFollowupAnswers[button.dataset.heroFollowup];
      if (!answer || !heroFollowupExchange || !heroThread) return;
      finishHeroIntroduction();
      heroFollowupButtons.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
      heroFollowupExchange.innerHTML = `<div class="heroChatUser"><p>${button.textContent}</p></div>
        <div class="heroChatReply">${answer.replace('<p>', '<p><span class="heroChatAvatar" aria-hidden="true">✳</span>')}</div>`;
      heroFollowupExchange.hidden = false;
      heroReadingScroll?.reset();
      if (isReducedMotion()) heroThread.scrollTop = heroThread.scrollHeight;
      else heroReadingScroll?.follow(800);
    });
  });

  // Reveal the supporting sections when they enter the viewport.
  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('visible'));
  }

  /* ═══════════════════════════════════════════
     4. WALKTHROUGH CONTROLLER
     ═══════════════════════════════════════════ */
  const stepButtons = Array.from(document.querySelectorAll('.walkthroughStepBtn'));
  const panels = stepButtons.map((button) => document.getElementById(button.getAttribute('aria-controls')));
  const nextStepBtns = Array.from(document.querySelectorAll('[data-next-step]'));
  const previewSection = document.getElementById('welcome-walkthrough');
  const previewStatus = document.getElementById('preview-status');
  const PREVIEW_MOTION_SCALE = 2;
  const UNDERSTAND_READING_PAUSE = 6500;
  const EXPLORE_READING_PAUSE = 12000;
  let previewRunning = false;
  let previewInView = false;
  let previewManuallyPaused = false;
  let tourRun = null;
  let panelRun = null;
  let progressAnimation = null;
  const panelAnimations = new Set();

  let activeWalkthroughStep = 0;
  function setWalkthroughStep(index, { animate = true } = {}) {
    if (index < 0 || index >= panels.length || !panels[index]) return;
    cancelPanelPreview();
    activeWalkthroughStep = index;

    // Update buttons
    stepButtons.forEach((btn, i) => {
      const isActive = i === index;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
      btn.tabIndex = isActive ? 0 : -1;
      const fill = btn.querySelector('.stepFill');
      if (fill) fill.style.width = i < index || (i === index && !previewRunning) ? '100%' : '0%';
    });

    // Update panels
    panels.forEach((panel, i) => {
      if (!panel) return;
      const isCurrent = i === index;
      panel.classList.toggle('active', isCurrent);
      panel.setAttribute('aria-hidden', String(!isCurrent));
      panel.hidden = !isCurrent;
    });
    if (index === 1) requestAnimationFrame(scrollToSelectedChapter);
    if (animate) void playPanelPreview(index);
  }

  stepButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const stepIdx = parseInt(btn.dataset.step, 10) || 0;
      if (stepIdx === 0) {
        void startLivePreview({ restart: true });
        return;
      }
      takeOverPreview();
      setWalkthroughStep(stepIdx);
    });
    btn.addEventListener('keydown', (event) => {
      const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End'];
      if (!keys.includes(event.key)) return;
      event.preventDefault();
      takeOverPreview();
      const next = event.key === 'Home' ? 0 : event.key === 'End' ? 2
        : (activeWalkthroughStep + (event.key === 'ArrowRight' ? 1 : 2)) % 3;
      setWalkthroughStep(next);
      stepButtons[next].focus();
    });
  });

  nextStepBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      takeOverPreview();
      const nextIdx = parseInt(btn.dataset.nextStep, 10) || 1;
      setWalkthroughStep(nextIdx);
      stepButtons[nextIdx].focus({ preventScroll: true });
      document.querySelector('.walkthroughStepper')?.scrollIntoView({
        behavior: isReducedMotion() ? 'instant' : 'smooth', block: 'start'
      });
    });
  });

  /* ═══════════════════════════════════════════
     5. UNDERSTAND PANEL: INTERACTIVE CHART & STORY TIMELINE
     ═══════════════════════════════════════════ */
  const understandMonths = [
    {
      name: 'Jan 2026',
      shortName: 'January',
      index: 0,
      monthlyEarned: 3200,
      monthlySpent: 2410,
      monthlySaved: 0,
      cumulativeEarned: 3200,
      cumulativeSpent: 2410,
      cumulativeSaved: 0,
      moneyKept: 790,
      moneyKeptPct: '25%',
      memory: '',
      chapterIndex: 0,
      chapterTitle: 'CHAPTER JANUARY 2026 · your memory',
      insightBadge: '📌 BASELINE INSIGHT',
      insightText: '€3,200 earned, €2,410 spent, and €790 kept.'
    },
    {
      name: 'Feb 2026',
      shortName: 'February',
      index: 1,
      monthlyEarned: 3200,
      monthlySpent: 2290,
      monthlySaved: 0,
      cumulativeEarned: 6400,
      cumulativeSpent: 4700,
      cumulativeSaved: 0,
      moneyKept: 1700,
      moneyKeptPct: '27%',
      memory: '',
      chapterIndex: 1,
      chapterTitle: 'CHAPTER FEBRUARY 2026 · your memory',
      insightBadge: '💡 SAVINGS INSIGHT',
      insightText: 'Spending dropped by €120 in February as utility costs eased and dining out stayed modest.'
    },
    {
      name: 'Mar 2026',
      shortName: 'March',
      index: 2,
      monthlyEarned: 3400,
      monthlySpent: 2530,
      monthlySaved: 0,
      cumulativeEarned: 9800,
      cumulativeSpent: 7230,
      cumulativeSaved: 0,
      moneyKept: 2570,
      moneyKeptPct: '26%',
      memory: '',
      chapterIndex: 2,
      chapterTitle: 'CHAPTER MARCH 2026 · your memory',
      insightBadge: '🧗 ACTIVITY INSIGHT',
      insightText: '€3,400 earned and €2,530 spent in March.'
    },
    {
      name: 'Apr 2026',
      shortName: 'April',
      index: 3,
      monthlyEarned: 3494,
      monthlySpent: 2131,
      monthlySaved: 0,
      cumulativeEarned: 13294,
      cumulativeSpent: 9361,
      cumulativeSaved: 0,
      moneyKept: 3933,
      moneyKeptPct: '30%',
      memory: '“poetry workshop with Eline”',
      chapterIndex: 3,
      chapterTitle: 'CHAPTER APRIL 2026 · your memory',
      insightBadge: '🔥 DRIVER INSIGHT',
      insightText: "Albert Heijn is your biggest all-time driver. You've crossed €1,000 in lifetime spending with them."
    },
    {
      name: 'May 2026',
      shortName: 'May',
      index: 4,
      monthlyEarned: 3106,
      monthlySpent: 2749,
      monthlySaved: 0,
      cumulativeEarned: 16400,
      cumulativeSpent: 12110,
      cumulativeSaved: 0,
      moneyKept: 4290,
      moneyKeptPct: '26%',
      memory: '“Holiday in Greece with my family”',
      chapterIndex: 4,
      chapterTitle: 'CHAPTER MAY 2026 · your memory',
      insightBadge: '✈️ TRAVEL INSIGHT',
      insightText: 'Greece travel (€1,850) made up 67% of May’s spending.'
    },
    {
      name: 'Jun 2026',
      shortName: 'June',
      index: 5,
      monthlyEarned: 2630,
      monthlySpent: 2298,
      monthlySaved: 0,
      cumulativeEarned: 19030,
      cumulativeSpent: 14408,
      cumulativeSaved: 0,
      moneyKept: 4622,
      moneyKeptPct: '24%',
      memory: '“couch purchase”',
      chapterIndex: 5,
      chapterTitle: 'CHAPTER JUNE 2026 · your memory',
      insightBadge: '📈 TREND INSIGHT',
      insightText: 'Your spending on Transport & Travel has been trending 284% higher over the last 3 months compared to your historical average.'
    }
  ];

  understandMonths.forEach((month, index) => {
    month.cx = 100 + index * 88;
    month.highlightX = month.cx - 40;
  });

  let currentUnderstandMonth = 4; // Default to May
  let currentUnderstandMode = 'cumulative'; // 'cumulative' or 'monthly'

  const colHighlightEl = document.getElementById('understand-col-highlight');
  const monthDots = Array.from(document.querySelectorAll('.understandMonthDot'));
  const chapters = Array.from(document.querySelectorAll('.understandChapter'));
  const viewToggleBtns = Array.from(document.querySelectorAll('.understandToggleBtn'));
  const rangeLabelEl = document.getElementById('understand-range-label');
  const incomePolyline = document.getElementById('understand-income-polyline');
  const spendingPolyline = document.getElementById('understand-spending-polyline');
  const endIncomeEl = document.getElementById('understand-end-income');
  const endSpendingEl = document.getElementById('understand-end-spending');

  // Tooltip Elements
  const tooltipMonthEl = document.getElementById('tooltip-month');
  const tooltipEarnedEl = document.getElementById('tooltip-earned');
  const tooltipSpentEl = document.getElementById('tooltip-spent');
  const tooltipSavedEl = document.getElementById('tooltip-saved');
  const tooltipKeptEl = document.getElementById('tooltip-kept');
  const tooltipPctEl = document.getElementById('tooltip-pct');
  const tooltipMemoryEl = document.getElementById('tooltip-memory');
  const storyTimeline = document.getElementById('understand-timeline');
  const understandTooltip = document.getElementById('understand-tooltip');

  function scrollToSelectedChapter() {
    const chapter = chapters.find((item) => Number(item.dataset.chapter) === currentUnderstandMonth);
    if (!chapter || !storyTimeline || panels[1].hidden) return;
    positionUnderstandTooltip();
  }

  function positionUnderstandTooltip() {
    if (!understandTooltip || panels[1].hidden) return;
    const chart = document.getElementById('understand-svg-chart');
    const width = chart.clientWidth;
    const height = chart.clientHeight;
    if (!width || !height) return;
    const small = width < 450;
    const left = small ? 45 : 58;
    const right = width - (small ? 55 : 78);
    const top = 16;
    const bottom = height - 24;
    const ceiling = currentUnderstandMode === 'cumulative' ? 20000 : 4000;
    const y = (value) => bottom - value / ceiling * (bottom - top);
    const x = (index) => left + 12 + index / 5 * (right - left - 12);
    const earned = (month) => currentUnderstandMode === 'cumulative' ? month.cumulativeEarned : month.monthlyEarned;
    const spent = (month) => currentUnderstandMode === 'cumulative' ? month.cumulativeSpent : month.monthlySpent;
    chart.setAttribute('viewBox', `0 0 ${width} ${height}`);
    chart.querySelectorAll('.chartGrid').forEach((grid, index) => {
      const line = grid.querySelector('line');
      const label = grid.querySelector('text');
      const gridY = bottom - index / 4 * (bottom - top);
      line.setAttribute('x1', left); line.setAttribute('x2', right);
      line.setAttribute('y1', gridY); line.setAttribute('y2', gridY);
      label.setAttribute('x', left - 7); label.setAttribute('y', gridY + 3);
    });
    chart.querySelectorAll('.axisLabel, .understandEndVal').forEach((label) => { label.style.fontSize = `${small ? 9 : 11}px`; });
    incomePolyline.setAttribute('points', understandMonths.map((month, index) => `${x(index)},${y(earned(month))}`).join(' '));
    spendingPolyline.setAttribute('points', understandMonths.map((month, index) => `${x(index)},${y(spent(month))}`).join(' '));
    monthDots.forEach((dot, index) => {
      const month = understandMonths[index];
      const label = dot.querySelector('.monthText');
      label.textContent = small ? month.name.slice(0, 3) : month.name;
      label.setAttribute('x', x(index)); label.setAttribute('y', height - 4);
      const hit = dot.querySelector('.monthHitArea');
      const span = (right - left) / 6;
      hit.setAttribute('x', x(index) - span / 2); hit.setAttribute('width', span);
      hit.setAttribute('y', 5); hit.setAttribute('height', height - 5);
      [['.dotIncome', earned(month)], ['.dotSpending', spent(month)]].forEach(([selector, value]) => {
        const circle = dot.querySelector(selector);
        circle.setAttribute('cx', x(index)); circle.setAttribute('cy', y(value));
        circle.style.r = `${index === currentUnderstandMonth ? 5.5 : 3.5}px`;
      });
    });
    colHighlightEl.setAttribute('x', x(currentUnderstandMonth) - (right - left) / 14);
    colHighlightEl.setAttribute('width', (right - left) / 7);
    colHighlightEl.setAttribute('y', 5); colHighlightEl.setAttribute('height', height - 25);
    endIncomeEl.setAttribute('x', right + 7); endIncomeEl.setAttribute('y', y(earned(understandMonths[5])) + 3);
    endSpendingEl.setAttribute('x', right + 7); endSpendingEl.setAttribute('y', y(spent(understandMonths[5])) + 3);
  }
  window.addEventListener('resize', positionUnderstandTooltip);
  document.querySelector('.understandPlot')?.addEventListener('scroll', positionUnderstandTooltip);

  function updateTooltipData(monthData) {
    if (!monthData) return;
    const isCum = currentUnderstandMode === 'cumulative';
    const earnedVal = isCum ? monthData.cumulativeEarned : monthData.monthlyEarned;
    const spentVal = isCum ? monthData.cumulativeSpent : monthData.monthlySpent;
    const savedVal = isCum ? monthData.cumulativeSaved : monthData.monthlySaved;
    const keptVal = isCum ? monthData.moneyKept : (earnedVal - spentVal);
    const keptPct = isCum ? monthData.moneyKeptPct : `${Math.round((keptVal / earnedVal) * 100)}%`;

    if (tooltipMonthEl) tooltipMonthEl.textContent = monthData.name;
    if (tooltipEarnedEl) tooltipEarnedEl.textContent = money(earnedVal);
    if (tooltipSpentEl) tooltipSpentEl.textContent = money(spentVal);
    if (tooltipSavedEl) tooltipSavedEl.textContent = money(savedVal);
    if (tooltipKeptEl) tooltipKeptEl.textContent = money(keptVal);
    if (tooltipPctEl) tooltipPctEl.textContent = keptPct;
    if (tooltipMemoryEl) tooltipMemoryEl.textContent = monthData.memory;
    document.getElementById('tooltip-scope').textContent = isCum
      ? `January through ${monthData.shortName} · running totals`
      : `${monthData.shortName} only · monthly figures`;
  }

  function selectUnderstandMonth(index) {
    if (index < 0 || index >= understandMonths.length) return;
    currentUnderstandMonth = index;
    const monthData = understandMonths[index];
    document.getElementById('insight-waiting').hidden = true;
    document.getElementById('understand-story').classList.remove('is-awaiting-selection');

    // Move highlight column
    if (colHighlightEl) {
      colHighlightEl.setAttribute('x', String(monthData.highlightX));
    }

    // Update dots state
    monthDots.forEach((dot, i) => {
      const isActive = i === index;
      dot.classList.toggle('active', isActive);
      dot.setAttribute('aria-pressed', String(isActive));
      const text = dot.querySelector('.monthText');
      if (text) text.classList.toggle('monthActive', isActive);
    });

    // Update tooltip
    updateTooltipData(monthData);

    // Update timeline chapters
    chapters.forEach((chapter) => {
      const chapIdx = parseInt(chapter.dataset.chapter, 10);
      const isActive = chapIdx === index;
      chapter.classList.toggle('active', isActive);
      chapter.hidden = chapIdx < 3 && !isActive;
      chapter.querySelector('.chapterHead').setAttribute('aria-expanded', String(isActive));
      chapter.querySelector('.chapterDetails').hidden = !isActive;
      const dot = chapter.querySelector('.chapterDot');
      if (dot) dot.classList.toggle('filled', isActive);
    });
    const selectedChapter = chapters.find((chapter) => Number(chapter.dataset.chapter) === index);
    animatePreview(selectedChapter, [{ opacity: 0, transform: 'scale(.98)' }, { opacity: 1, transform: 'scale(1)' }], 250);
    scrollToSelectedChapter();
  }

  function setUnderstandView(mode) {
    currentUnderstandMode = mode;
    const isCum = mode === 'cumulative';

    viewToggleBtns.forEach((btn) => {
      const match = btn.dataset.view === mode;
      btn.classList.toggle('active', match);
      btn.setAttribute('aria-pressed', String(match));
    });

    if (rangeLabelEl) {
      rangeLabelEl.textContent = isCum
        ? 'RUNNING TOTAL · JAN 3 – JUN 29, 2026'
        : 'MONTHLY BREAKDOWN · JAN 3 – JUN 29, 2026';
    }

    // Grid labels
    const grid0 = document.querySelector('.gridLabel0');
    const grid1 = document.querySelector('.gridLabel1');
    const grid2 = document.querySelector('.gridLabel2');
    const grid3 = document.querySelector('.gridLabel3');
    const grid4 = document.querySelector('.gridLabel4');
    if (grid0) grid0.textContent = '€0';
    if (grid1) grid1.textContent = isCum ? '€5,000' : '€1,000';
    if (grid2) grid2.textContent = isCum ? '€10,000' : '€2,000';
    if (grid3) grid3.textContent = isCum ? '€15,000' : '€3,000';
    if (grid4) grid4.textContent = isCum ? '€20,000' : '€4,000';

    // Use the same values for the plotted lines, dots, and tooltip.
    const ceiling = isCum ? 20000 : 4000;
    const chartY = (value) => (220 - (value / ceiling) * 192).toFixed(2);
    const earned = (month) => isCum ? month.cumulativeEarned : month.monthlyEarned;
    const spent = (month) => isCum ? month.cumulativeSpent : month.monthlySpent;
    incomePolyline?.setAttribute('points', understandMonths.map((m) => `${m.cx},${chartY(earned(m))}`).join(' '));
    spendingPolyline?.setAttribute('points', understandMonths.map((m) => `${m.cx},${chartY(spent(m))}`).join(' '));
    monthDots.forEach((dot, i) => {
      const data = understandMonths[i];
      dot.querySelector('.dotIncome')?.setAttribute('cy', chartY(earned(data)));
      dot.querySelector('.dotSpending')?.setAttribute('cy', chartY(spent(data)));
      dot.setAttribute('aria-label', `${data.shortName} 2026: ${money(earned(data))} earned, ${money(spent(data))} spent. ${data.memory}`);
    });
    const lastMonth = understandMonths[understandMonths.length - 1];
    if (endIncomeEl) {
      endIncomeEl.textContent = money(earned(lastMonth));
      endIncomeEl.setAttribute('y', chartY(earned(lastMonth)));
    }
    if (endSpendingEl) {
      endSpendingEl.textContent = money(spent(lastMonth));
      endSpendingEl.setAttribute('y', chartY(spent(lastMonth)));
    }

    // Refresh tooltip with current month numbers in new mode
    updateTooltipData(understandMonths[currentUnderstandMonth]);
    positionUnderstandTooltip();
  }

  // Bind Month Dots Click & Keyboard
  monthDots.forEach((dot) => {
    dot.addEventListener('click', () => {
      takeOverPreview();
      const monthIdx = parseInt(dot.dataset.understandMonth, 10);
      selectUnderstandMonth(monthIdx);
    });
    dot.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        takeOverPreview();
        const monthIdx = parseInt(dot.dataset.understandMonth, 10);
        selectUnderstandMonth(monthIdx);
      }
    });
  });

  // Bind Chapter Clicks
  chapters.forEach((chapter) => {
    chapter.querySelector('.chapterHead').addEventListener('click', () => {
      takeOverPreview();
      const chapIdx = parseInt(chapter.dataset.chapter, 10);
      if (chapIdx === currentUnderstandMonth) {
        const details = chapter.querySelector('.chapterDetails');
        details.hidden = !details.hidden;
        chapter.querySelector('.chapterHead').setAttribute('aria-expanded', String(!details.hidden));
        return;
      }
      selectUnderstandMonth(chapIdx);
    });
  });

  // Bind View Toggles
  viewToggleBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      takeOverPreview();
      setUnderstandView(btn.dataset.view);
    });
  });

  // Recording is a reversible action in this fictional demo session.
  document.querySelectorAll('.chapterRecordBtn').forEach((btn) => {
    btn.addEventListener('click', () => {
      takeOverPreview();
      const recorded = btn.getAttribute('aria-pressed') !== 'true';
      btn.setAttribute('aria-pressed', String(recorded));
      btn.textContent = recorded ? 'SAVED IN YOUR STORY ✓' : 'RECORD MONTH';
    });
  });

  /* ═══════════════════════════════════════════
     6. EXPLORE PANEL: THREE CLICKABLE QUESTIONS & REAL DEMO ANSWERS
     ═══════════════════════════════════════════ */
  const exploreQuestionsData = [
    {
      question: 'What subscriptions am I currently paying for?',
      badges: ['4 active services', '€74.49 / month'],
      chartTitle: 'Monthly subscriptions · €74.49 / month',
      chartItems: [['Fitness Club', 35], ['Swapfiets', 19.5], ['Spotify', 10], ['iCloud+', 9.99]],
      render: () => `
        <p>Based on recurring transaction patterns across your 6 months of statements, we detected <strong>4 active recurring services</strong> totaling <strong>€74.49/month</strong>:</p>
        <div class="exploreDataCard">
          <div class="exploreDataRow">
            <span>🏋️ Fitness Club (Basic-Fit Gym)</span>
            <strong>€35.00/mo</strong>
          </div>
          <div class="exploreDataRow">
            <span>🚲 Swapfiets Deluxe 7 Mobility</span>
            <strong>€19.50/mo</strong>
          </div>
          <div class="exploreDataRow">
            <span>🎵 Spotify Premium Streaming</span>
            <strong>€10.00/mo</strong>
          </div>
          <div class="exploreDataRow">
            <span>☁️ iCloud+ 2TB Storage</span>
            <strong>€9.99/mo</strong>
          </div>
        </div>
      `
    },
    {
      question: 'Which expenses were outside my usual monthly spending?',
      badges: ['2 one-off purchases', '284% travel increase', '€1,000 merchant milestone'],
      render: () => `
        <p>Two one-off purchases and one travel trend stand out:</p>
        <div class="exploreDataCard">
          <div class="exploreDataRow">
            <div>
              <strong>May 2026 — Family Trip to Greece</strong>
              <div style="font-size:11px;color:#6B6860">Tagged to your memory: <em>"Holiday in Greece with my family"</em></div>
            </div>
            <strong style="color:#C1574A">+€1,850</strong>
          </div>
          <div class="exploreDataRow">
            <div>
              <strong>June 2026 — Couch Purchase (HAY Amsterdam)</strong>
              <div style="font-size:11px;color:#6B6860">Tagged to your memory: <em>"couch purchase"</em></div>
            </div>
            <strong style="color:#C1574A">+€1,250</strong>
          </div>
          <div class="exploreDataRow">
            <div>
              <strong>Transport &amp; Travel Category Surge</strong>
              <div style="font-size:11px;color:#6B6860">Trending 284% above your historical average over the last 3 months</div>
            </div>
            <strong style="color:#2D6A4F">284% ↑</strong>
          </div>
        </div>
        <div class="exploreHighlightBox">
          <strong>Merchant Driver Insight:</strong> Routine grocery spending with <strong>Albert Heijn</strong> crossed a cumulative <strong>€1,000 milestone</strong>, a recurring grocery driver rather than a one-off purchase.
        </div>
      `
    },
    {
      question: 'Why was May so much more expensive?',
      badges: ['May 2026', '€1,850 Greece trip', '67% of May spending'],
      chartTitle: 'May spending · €2,749 in total',
      chartOrientation: 'vertical',
      chartItems: [['Aegean flights', 540], ['Chania hotel', 890], ['Tavernas & car rental', 420], ['Everyday costs at home', 899]],
      render: () => `
        <p>In May 2026, your spending reached <strong>€2,749</strong> (bringing cumulative spending to €12,110), making it your peak spending month of the half-year. Here is the exact breakdown:</p>
        <div class="exploreDataCard">
          <div class="exploreDataRow">
            <span>✈️ Aegean Airlines Return Flights (Athens &amp; Chania)</span>
            <strong>€540</strong>
          </div>
          <div class="exploreDataRow">
            <span>🏨 Chania Boutique Hotel Stay (6 nights)</span>
            <strong>€890</strong>
          </div>
          <div class="exploreDataRow">
            <span>🍽️ Tavernas, Crete Car Rental &amp; Day Trips</span>
            <strong>€420</strong>
          </div>
          <div class="exploreDataRow">
            <span>🏠 Core Fixed Bills &amp; Groceries (At Home)</span>
            <strong>€899</strong>
          </div>
        </div>
        <div class="exploreHighlightBox">
          <strong>Key finding:</strong> The family vacation to Greece accounted for <strong>€1,850 (67%)</strong> of your total May outlay. However, everyday living expenses were <strong>€280 lower than average</strong> while traveling, and you still retained <strong>+€4,290</strong> in cumulative net money kept.
        </div>
      `
    }
  ];

  const exploreQuestionBtns = Array.from(document.querySelectorAll('.exploreQuestion'));
  const exploreAnswerEl = document.getElementById('explore-answer');
  const exploreAnswerQEl = document.getElementById('demo-user-msg');
  const exploreAnswerBodyEl = document.getElementById('explore-answer-body');
  const chatThread = document.getElementById('chat-demo-thread');
  const exploreReadingScroll = createReadingScroll(chatThread);
  const chatUserRow = document.getElementById('demo-user-row');
  const chatEmptyState = document.getElementById('chat-empty-state');
  const chatStatus = document.getElementById('demo-chat-status');
  const chatInput = document.getElementById('demo-chat-input');
  const barView = document.getElementById('demo-bar-view');
  const pieView = document.getElementById('demo-pie-view');
  const barButton = document.getElementById('btn-chart-bar');
  const pieButton = document.getElementById('btn-chart-pie');
  const chatLoading = document.getElementById('demo-loading');
  const chatChart = document.getElementById('demo-chart');
  let currentExploreQuestion = 0;
  let currentChatQuestion = exploreQuestionsData[0].question;
  const chartColors = ['#2D6A4F', '#A0785A', '#91A68B', '#C1574A'];
  const exactMoney = (value) => new Intl.NumberFormat('en-IE', {
    style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2
  }).format(value);

  function setAnswerChartView(view) {
    const isBar = view === 'bar';
    barView.hidden = !isBar;
    pieView.hidden = isBar;
    [barButton, pieButton].forEach((button, index) => {
      const active = index === (isBar ? 0 : 1);
      button.setAttribute('aria-pressed', String(active));
      button.classList.toggle('active', active);
    });
  }
  barButton?.addEventListener('click', () => { takeOverPreview(); setAnswerChartView('bar'); });
  pieButton?.addEventListener('click', () => { takeOverPreview(); setAnswerChartView('pie'); });

  function renderAnswerChart(item) {
    if (!item.chartItems) {
      barView.replaceChildren();
      pieView.replaceChildren();
      return false;
    }
    document.getElementById('demo-chart-title').textContent = item.chartTitle;
    const total = item.chartItems.reduce((sum, [,value]) => sum + value, 0);
    const max = Math.max(...item.chartItems.map(([,value]) => value));
    const currency = total < 100 ? exactMoney : money;
    const vertical = item.chartOrientation === 'vertical';
    barView.classList.toggle('is-vertical', vertical);
    barView.innerHTML = item.chartItems.map(([label,value], index) => vertical ? `
      <div class="chatColumn"><div class="chatColumnTrack"><div class="chatColumnFill" style="height:${(value / max * 100).toFixed(2)}%;background:${chartColors[index]}"><strong>${currency(value)}</strong></div></div><span>${label}</span></div>` : `
      <div class="chatMockBar"><div class="chatBarCaption"><span>${label}</span><strong>${currency(value)}</strong></div>
      <div class="chatMockBarTrack"><div class="chatMockBarFill" style="width:${(value / max * 100).toFixed(2)}%;background:${chartColors[index]}"></div></div></div>`).join('');
    let offset = 0;
    const circumference = 2 * Math.PI * 48;
    const circles = item.chartItems.map(([,value], index) => {
      const length = value / total * circumference;
      const circle = `<circle cx="70" cy="70" r="48" fill="none" stroke="${chartColors[index]}" stroke-width="18" stroke-dasharray="${length} ${circumference}" stroke-dashoffset="${-offset}"/>`;
      offset += length;
      return circle;
    }).join('');
    pieView.innerHTML = `<div class="pieChartLayout"><div class="pieSvgWrap">
      <svg class="pieSvg" viewBox="0 0 140 140" role="img" aria-label="${item.chartTitle}"><title>${item.chartItems.map(([label,value]) => `${label}: ${currency(value)}`).join('; ')}</title>${circles}</svg>
      <div class="pieCenterText"><span class="pieCenterTotal">${currency(total)}</span><span class="pieCenterSub">TOTAL</span></div></div>
      <div class="pieLegend">${item.chartItems.map(([label,value], index) => `<div class="pieLegendItem"><i class="pieDot" style="background:${chartColors[index]}"></i><div class="pieLegendInfo"><span class="pieLegendName">${label}</span><span class="pieLegendVal">${currency(value)} <small>(${Math.round(value / total * 100)}%)</small></span></div></div>`).join('')}</div></div>`;
    return true;
  }

  async function selectExploreQuestion(index, { animate = true, question, alreadyTyped = false } = {}) {
    if (index < 0 || index >= exploreQuestionsData.length) return;
    cancelPanelPreview();
    const run = new AbortController();
    panelRun = run;
    const signal = run.signal;
    currentExploreQuestion = index;
    const item = exploreQuestionsData[index];
    const text = question || item.question;
    currentChatQuestion = text;

    exploreQuestionBtns.forEach((btn, i) => {
      btn.classList.toggle('active', i === index);
      btn.setAttribute('aria-pressed', String(i === index));
    });

    chatEmptyState.hidden = true;
    exploreAnswerEl.hidden = true;
    chatUserRow.hidden = true;
    chatLoading.hidden = true;
    chatChart.hidden = true;
    chatThread.scrollTop = 0;
    exploreReadingScroll.reset();
    const live = animate && !isReducedMotion();
    chatThread.setAttribute('aria-busy', String(live));
    try {
      if (live && !alreadyTyped) {
        panels[2].dataset.phase = 'typing';
        chatStatus.textContent = 'Typing a sample question…';
        await typeDemoText(chatInput, text, signal, 2, 24);
        await waitForDemo(180, signal);
      }
      chatInput.value = '';
      chatUserRow.hidden = false;
      exploreAnswerQEl.textContent = text;
      if (live) {
        animatePreview(chatUserRow, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], 250);
        panels[2].dataset.phase = 'thinking';
        chatLoading.hidden = false;
        chatStatus.textContent = 'Finding a response…';
        await waitForDemo(650, signal);
      }
      chatLoading.hidden = true;
      exploreAnswerEl.hidden = false;
      exploreAnswerBodyEl.innerHTML = `<div class="exploreDataBadges">${item.badges.map((badge) => `<span>${badge}</span>`).join('')}</div>${item.render()}`;
      if (live) {
        panels[2].dataset.phase = 'answering';
        await streamDemoAnswer(signal);
      }
      const hasChart = renderAnswerChart(item);
      chatChart.hidden = !hasChart;
      if (live && hasChart) {
        animatePreview(chatChart, [{ opacity: 0, transform: 'translateY(5px)' }, { opacity: 1, transform: 'translateY(0)' }], 350);
        barView.querySelectorAll('.chatMockBarFill').forEach((bar) => {
          animatePreview(bar, [{ width: '0%' }, { width: bar.style.width }], 600);
        });
        barView.querySelectorAll('.chatColumnFill').forEach((bar) => {
          animatePreview(bar, [{ height: '0%' }, { height: bar.style.height }], 600);
        });
      }
      panels[2].dataset.phase = 'ready';
      chatStatus.textContent = 'Answer ready · January–June 2026.';
      if (live) {
        followDemoChat();
        await exploreReadingScroll.finished();
      }
      else chatThread.scrollTop = 0;
    } catch (error) {
      if (error.name !== 'AbortError') throw error;
    } finally {
      if (panelRun === run) {
        panelRun = null;
        chatThread.setAttribute('aria-busy', 'false');
      }
    }
  }

  exploreQuestionBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      takeOverPreview({ settle: false });
      const qIdx = parseInt(btn.dataset.exploreQ, 10);
      selectExploreQuestion(qIdx);
    });
  });

  document.getElementById('chat-new-btn')?.addEventListener('click', () => {
    takeOverPreview({ settle: false });
    cancelPanelPreview();
    chatLoading.hidden = true;
    exploreAnswerEl.hidden = true;
    chatUserRow.hidden = true;
    chatEmptyState.hidden = false;
    exploreQuestionBtns.forEach((button) => {
      button.classList.remove('active');
      button.setAttribute('aria-pressed', 'false');
    });
    chatInput.value = '';
    chatStatus.textContent = 'Choose a sample question, or type a similar one below.';
    chatInput.focus({ preventScroll: true });
  });
  document.getElementById('demo-chat-form')?.addEventListener('submit', (event) => {
    event.preventDefault();
    takeOverPreview({ settle: false });
    const text = chatInput.value.trim();
    const index = /subscription|recurring|spotify|icloud|fitness|swapfiets/i.test(text) ? 0
      : /outside|unusual|one.off|couch|spike|anomal/i.test(text) ? 1
      : /may|greece|expensive|holiday|travel/i.test(text) ? 2 : -1;
    if (index === -1) {
      chatStatus.textContent = 'This demo covers the three sample questions. Try asking about subscriptions, unusual expenses, or May.';
      return;
    }
    void selectExploreQuestion(index, { question: text, alreadyTyped: true });
  });
  chatInput.addEventListener('focus', () => { if (previewRunning) takeOverPreview(); });

  /* Live preview: one cancellable sequence per panel, with reader takeover. */
  const uploadCard = document.querySelector('.uploadDemoCard');
  const uploadRows = Array.from(document.querySelectorAll('.extractedItem'));
  const uploadBadge = document.querySelector('.uploadReadyBadge');
  const uploadProcessing = document.getElementById('upload-processing');
  const uploadProgress = document.getElementById('upload-processing-fill');
  const uploadStatus = document.getElementById('upload-processing-status');
  const categoryStatus = document.getElementById('upload-category-status');
  uploadRows.forEach((row) => { row.dataset.category = row.querySelector('small').textContent; });

  function waitForDemo(ms, signal, { motion = true } = {}) {
    return new Promise((resolve, reject) => {
      const abort = () => {
        clearTimeout(timer);
        signal.removeEventListener('abort', abort);
        reject(new DOMException('Preview interrupted', 'AbortError'));
      };
      const timer = setTimeout(() => {
        signal.removeEventListener('abort', abort);
        resolve();
      }, motion ? ms * PREVIEW_MOTION_SCALE : ms);
      if (signal.aborted) abort();
      else signal.addEventListener('abort', abort, { once: true });
    });
  }

  function animatePreview(element, frames, duration) {
    if (isReducedMotion() || !element?.animate) return;
    const animation = element.animate(frames, { duration: duration * PREVIEW_MOTION_SCALE, easing: 'ease-out' });
    panelAnimations.add(animation);
    animation.finished.then(() => panelAnimations.delete(animation), () => panelAnimations.delete(animation));
  }

  function cancelPanelPreview() {
    panelRun?.abort();
    panelRun = null;
    panelAnimations.forEach((animation) => animation.cancel());
    panelAnimations.clear();
    exploreReadingScroll?.cancel();
    document.getElementById('chat-demo-thread')?.setAttribute('aria-busy', 'false');
    const cursor = document.getElementById('preview-chart-cursor');
    if (cursor) { cursor.hidden = true; cursor.classList.remove('is-clicking'); }
    document.getElementById('understand-story')?.classList.remove('is-awaiting-selection');
    const waiting = document.getElementById('insight-waiting');
    if (waiting) waiting.hidden = true;
  }

  async function typeDemoText(element, text, signal, chunk = 5, interval = 12) {
    const field = element.tagName === 'INPUT' ? 'value' : 'textContent';
    element[field] = '';
    for (let offset = 0; offset < text.length; offset += chunk) {
      await waitForDemo(interval, signal);
      element[field] = text.slice(0, offset + chunk);
    }
  }

  async function streamRichText(element, signal) {
    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (node.textContent.trim()) nodes.push([node, node.textContent]);
    }
    nodes.forEach(([node]) => { node.textContent = ''; });
    for (const [node, text] of nodes) await typeDemoText(node, text, signal, 3, 60);
  }

  function followDemoChat() {
    exploreReadingScroll.follow(800);
  }

  async function streamDemoAnswer(signal) {
    const blocks = Array.from(exploreAnswerBodyEl.children);
    blocks.forEach((block) => { block.hidden = true; });
    for (const block of blocks) {
      block.hidden = false;
      animatePreview(block, [{ opacity: 0 }, { opacity: 1 }], 200);
      if (block.tagName === 'P' || block.classList.contains('exploreHighlightBox')) {
        await streamRichText(block, signal);
      } else if (block.classList.contains('exploreDataCard')) {
        const rows = Array.from(block.children);
        rows.forEach((row) => { row.hidden = true; });
        for (const row of rows) {
          await waitForDemo(500, signal);
          row.hidden = false;
          animatePreview(row, [{ opacity: 0, transform: 'translateY(4px)' }, { opacity: 1, transform: 'translateY(0)' }], 250);
          followDemoChat();
        }
      }
      followDemoChat();
      await waitForDemo(350, signal);
    }
  }

  function settleUploadPreview() {
    uploadCard.classList.remove('is-processing');
    uploadRows.forEach((row) => {
      row.classList.remove('is-pending', 'is-categorizing');
      row.querySelector('small').textContent = row.dataset.category;
    });
    uploadBadge.textContent = 'PARSED';
    categoryStatus.textContent = 'AUTO-CATEGORIZED';
    uploadProcessing.hidden = true;
    panels[0].dataset.phase = 'ready';
  }

  async function playUploadPreview() {
    cancelPanelPreview();
    const run = new AbortController();
    panelRun = run;
    const signal = run.signal;
    if (isReducedMotion()) { settleUploadPreview(); return; }
    uploadCard.classList.add('is-processing');
    animatePreview(document.querySelector('.uploadFileDrop'), [{ opacity: 0, transform: 'translateY(-14px)' }, { opacity: 1, transform: 'translateY(0)' }], 350);
    uploadRows.forEach((row) => row.classList.add('is-pending'));
    uploadBadge.textContent = 'READING';
    uploadProcessing.hidden = false;
    uploadProgress.style.width = '8%';
    uploadStatus.textContent = 'Reading your CSV on your computer…';
    categoryStatus.textContent = 'WAITING FOR TRANSACTIONS';
    panels[0].dataset.phase = 'reading';
    previewStatus.textContent = 'LIVE PREVIEW · Reading a statement on your computer';
    try {
      await waitForDemo(400, signal);
      uploadProgress.style.width = '35%';
      uploadBadge.textContent = 'CATEGORIZING';
      uploadStatus.textContent = '42 transactions found. Giving each one a category…';
      categoryStatus.textContent = 'CATEGORIZING';
      panels[0].dataset.phase = 'categorizing';
      previewStatus.textContent = 'LIVE PREVIEW · Everyday transactions, neatly categorized';
      for (const [index, row] of uploadRows.entries()) {
        row.querySelector('small').textContent = 'Recognizing the category…';
        row.classList.remove('is-pending');
        row.classList.add('is-categorizing');
        animatePreview(row, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }], 300);
        await waitForDemo(450, signal);
        row.querySelector('small').textContent = row.dataset.category;
        row.classList.remove('is-categorizing');
        uploadProgress.style.width = `${55 + index * 20}%`;
      }
      uploadProgress.style.width = '100%';
      uploadStatus.textContent = 'Your statement is ready. Let’s find the story.';
      await waitForDemo(200, signal);
      settleUploadPreview();
    } catch (error) {
      if (error.name !== 'AbortError') throw error;
    } finally {
      if (panelRun === run) panelRun = null;
    }
  }

  async function playUnderstandPreview() {
    cancelPanelPreview();
    const run = new AbortController();
    panelRun = run;
    const signal = run.signal;
    setUnderstandView('cumulative');
    if (isReducedMotion()) { selectUnderstandMonth(4); return; }
    selectUnderstandMonth(0);
    const story = document.getElementById('understand-story');
    story.classList.add('is-awaiting-selection');
    document.getElementById('insight-waiting').hidden = false;
    panels[1].dataset.phase = 'drawing';
    previewStatus.textContent = 'LIVE PREVIEW · Six months become one clear picture';
    [incomePolyline, spendingPolyline].forEach((line) => {
      const length = line.getTotalLength();
      animatePreview(line, [{ strokeDasharray: `${length} ${length}`, strokeDashoffset: length }, { strokeDasharray: `${length} ${length}`, strokeDashoffset: 0 }], 600);
    });
    try {
      await waitForDemo(650, signal);
      const cursor = document.getElementById('preview-chart-cursor');
      const plot = document.querySelector('.understandPlot').getBoundingClientRect();
      const point = monthDots[3].querySelector('.dotSpending').getBoundingClientRect();
      cursor.style.left = `${point.x + point.width / 2 - plot.x}px`;
      cursor.style.top = `${point.y + point.height / 2 - plot.y}px`;
      cursor.hidden = false;
      animatePreview(cursor, [{ opacity: 0, transform: 'translate(55px, 40px)' }, { opacity: 1, transform: 'translate(0, 0)' }], 200);
      await waitForDemo(200, signal);
      cursor.classList.add('is-clicking');
      selectUnderstandMonth(3);
      panels[1].dataset.phase = 'april';
      previewStatus.textContent = 'LIVE PREVIEW · A click reveals where everyday spending adds up';
      const chapter = chapters.find((item) => Number(item.dataset.chapter) === 3);
      animatePreview(chapter, [{ opacity: .3, transform: 'translateY(5px)' }, { opacity: 1, transform: 'translateY(0)' }], 400);
      await waitForDemo(UNDERSTAND_READING_PAUSE, signal, { motion: false });
      cursor.hidden = true;
      panels[1].dataset.phase = 'ready';
    } catch (error) {
      if (error.name !== 'AbortError') throw error;
    } finally {
      if (panelRun === run) panelRun = null;
    }
  }

  function playPanelPreview(index) {
    if (index === 0) return playUploadPreview();
    if (index === 1) return playUnderstandPreview();
    return selectExploreQuestion(currentExploreQuestion);
  }

  function updatePreviewState() {
    previewSection.classList.toggle('is-live', previewRunning);
  }

  function stopLivePreview({ manual = false, settle = true } = {}) {
    tourRun?.abort();
    tourRun = null;
    cancelPanelPreview();
    if (progressAnimation) {
      try { progressAnimation.commitStyles(); } catch { /* The panel may have left the viewport. */ }
      progressAnimation.cancel();
      progressAnimation = null;
    }
    previewRunning = false;
    if (manual) previewManuallyPaused = true;
    if (settle) {
      settleUploadPreview();
      if (activeWalkthroughStep === 2 && panels[2].dataset.phase !== 'ready') {
        const scrollTop = chatThread.scrollTop;
        void selectExploreQuestion(currentExploreQuestion, { animate: false, question: currentChatQuestion });
        chatThread.scrollTop = scrollTop;
      }
    }
    previewStatus.textContent = manual ? 'INTERACTIVE PREVIEW · Explore at your own pace' : 'LIVE PREVIEW · Ready when you are';
    updatePreviewState();
  }

  function takeOverPreview({ settle = true } = {}) {
    stopLivePreview({ manual: true, settle });
  }

  async function startLivePreview({ restart = false } = {}) {
    stopLivePreview({ settle: true });
    previewManuallyPaused = false;
    if (isReducedMotion()) {
      if (restart) setWalkthroughStep(0, { animate: false });
      previewStatus.textContent = 'INTERACTIVE PREVIEW · Choose a step to explore';
      return;
    }
    const run = new AbortController();
    tourRun = run;
    previewRunning = true;
    updatePreviewState();
    let index = restart ? 0 : activeWalkthroughStep;
    let nextQuestion = restart ? 0 : currentExploreQuestion;
    try {
      while (!run.signal.aborted) {
        setWalkthroughStep(index, { animate: false });
        const fill = stepButtons[index].querySelector('.stepFill');
        progressAnimation?.cancel();
        progressAnimation = fill.animate([{ width: '0%' }, { width: '100%' }], {
          duration: [1950 * PREVIEW_MOTION_SCALE + 120, 850 * PREVIEW_MOTION_SCALE + UNDERSTAND_READING_PAUSE + 120, 4500 * PREVIEW_MOTION_SCALE + EXPLORE_READING_PAUSE][index], fill: 'forwards', easing: 'linear'
        });
        if (index === 2) {
          previewStatus.textContent = 'LIVE PREVIEW · A question becomes a clear answer';
          await selectExploreQuestion(nextQuestion);
          await waitForDemo(EXPLORE_READING_PAUSE, run.signal, { motion: false });
          nextQuestion = (nextQuestion + 1) % exploreQuestionsData.length;
        } else {
          await playPanelPreview(index);
          await waitForDemo(120, run.signal, { motion: false });
        }
        index = (index + 1) % panels.length;
      }
    } catch (error) {
      if (error.name !== 'AbortError') throw error;
    }
  }

  /* ═══════════════════════════════════════════
     6. PRIVACY DATA FLOW PULSE
     ═══════════════════════════════════════════ */
  setUnderstandView('cumulative');
  selectUnderstandMonth(4);
  void selectExploreQuestion(0, { animate: false });
  setWalkthroughStep(0, { animate: false });
  updatePreviewState();

  if ('IntersectionObserver' in window) {
    const previewObserver = new IntersectionObserver(([entry]) => {
      previewInView = entry.isIntersecting && entry.intersectionRatio >= .15;
      if (previewInView && !previewManuallyPaused && !document.hidden && !isReducedMotion()) {
        if (!previewRunning) void startLivePreview();
      } else if (!previewInView && previewRunning) stopLivePreview();
    }, { threshold: [0, .15] });
    previewObserver.observe(document.querySelector('.walkthroughContainer'));
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && previewRunning) stopLivePreview();
    else if (!document.hidden && previewInView && !previewManuallyPaused && !previewRunning) void startLivePreview();
  });
  if (isReducedMotion()) previewStatus.textContent = 'INTERACTIVE PREVIEW · Choose a step to explore';

  const dataFlow = document.querySelector('.dataFlow');
  if (dataFlow && 'IntersectionObserver' in window) {
    const dataFlowObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const highlightStep = dataFlow.querySelector('.dataFlowStep.highlight .dataFlowIcon');
          if (highlightStep) {
            highlightStep.style.transform = 'scale(1.08)';
            highlightStep.style.transition = 'transform 0.4s ease';
            setTimeout(() => {
              highlightStep.style.transform = 'scale(1)';
            }, 400);
          }
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    dataFlowObserver.observe(dataFlow);
  }

  /* ═══════════════════════════════════════════
     7. WAITLIST SIGNUP FORM
     ═══════════════════════════════════════════ */
  const form = document.getElementById('waitlist-form');
  const nameInput = document.getElementById('name-input');
  const emailInput = document.getElementById('email-input');
  const nameMessage = document.getElementById('name-message');
  const emailMessage = document.getElementById('email-message');
  const status = document.getElementById('signup-status');

  if (form && nameInput && emailInput && status) {
    const submit = form.querySelector('button[type="submit"]');
    let sending = false;
    const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);

    function validation(input, message, invalid) {
      input.setAttribute('aria-invalid', String(invalid));
      if (message) message.hidden = !invalid;
    }

    nameInput.addEventListener('input', () => validation(nameInput, nameMessage, !nameInput.value.trim()));
    emailInput.addEventListener('input', () => validation(emailInput, emailMessage, !isValidEmail(emailInput.value.trim())));

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (sending) return;
      const name = nameInput.value.trim();
      const email = emailInput.value.trim();
      const invalidName = !name;
      const invalidEmail = !isValidEmail(email) || !emailInput.validity.valid;
      validation(nameInput, nameMessage, invalidName);
      validation(emailInput, emailMessage, invalidEmail);
      status.textContent = '';
      delete status.dataset.state;
      if (invalidName || invalidEmail) {
        (invalidName ? nameInput : emailInput).focus();
        return;
      }
      sending = true;
      if (submit) {
        submit.disabled = true;
        submit.textContent = 'Sending your request…';
      }
      form.setAttribute('aria-busy', 'true');
      try {
        const response = await fetch(SIGNUP_ENDPOINT, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify({ name, email }),
        });
        if (response.type !== 'opaque' && !response.ok) throw new Error('Signup request failed');
        status.textContent = 'Your signup request was sent. Thank you for your interest in this app.';
        form.reset();
      } catch {
        status.dataset.state = 'error';
        status.textContent = 'We couldn’t send your request. Please try again in a moment.';
      } finally {
        sending = false;
        if (submit) {
          submit.disabled = false;
          submit.innerHTML = 'Join the waitlist <span aria-hidden="true">→</span>';
        }
        form.removeAttribute('aria-busy');
      }
    });
  }
})();
