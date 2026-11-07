'use strict';

(() => {
  // Google Apps Script waitlist destination
  const SIGNUP_ENDPOINT = 'https://script.google.com/macros/s/AKfycbzN-gL5IUZfLPTnKhvhTfR8y5G2M-e2yZxqsLCXt9_M3lc9Y46PaEesDW7e_P4yi1h_gg/exec';

  const euro = new Intl.NumberFormat('en-IE', {
    style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
  });
  const money = (value) => euro.format(value);
  const isReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ═══════════════════════════════════════════
     UTILITY: NUMERIC COUNT-UP & TEXT SCRAMBLE
     ═══════════════════════════════════════════ */
  function countNumber(el, start, end, duration = 800) {
    if (!el) return;
    if (isReducedMotion()) {
      el.textContent = money(end);
      return;
    }
    const startTime = performance.now();
    function tick(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * ease);
      el.textContent = money(current);
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        el.textContent = money(end);
      }
    }
    requestAnimationFrame(tick);
  }

  const CIPHER_CHARS = 'ABCDEF0123456789#@$%&*!?';
  function scrambleText(element, targetText, duration = 650) {
    if (!element) return;
    if (isReducedMotion()) {
      element.textContent = targetText;
      return;
    }
    const startTime = performance.now();
    const length = targetText.length;
    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const fixedChars = Math.floor(progress * length);
      let output = targetText.slice(0, fixedChars);
      for (let i = fixedChars; i < length; i++) {
        if (targetText[i] === ' ' || targetText[i] === '€' || targetText[i] === '.') {
          output += targetText[i];
        } else {
          output += CIPHER_CHARS.charAt(Math.floor(Math.random() * CIPHER_CHARS.length));
        }
      }
      element.textContent = output;
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        element.textContent = targetText;
      }
    }
    requestAnimationFrame(update);
  }

  /* ═══════════════════════════════════════════
     1. HERO MONTH PICKER & HERO TOGGLE
     ═══════════════════════════════════════════ */
  const examples = [
    {
      month: 'June',
      income: 3200,
      spending: 2240,
      story: 'Baseline spending was €2,240 in June: rent and daily groceries formed 82% of outgoings with zero spikes.'
    },
    {
      month: 'July',
      income: 3200,
      spending: 2410,
      story: 'Spending increased by €170 in July: summer holiday travel (+€230) was offset by lower utilities (-€60).'
    },
    {
      month: 'August',
      income: 3200,
      spending: 2290,
      story: 'Spending dropped by €120 in August: dining out and leisure expenses dropped back to your regular baseline.'
    },
    {
      month: 'September',
      income: 3200,
      spending: 2530,
      story: 'Your spending increased by €240 in September, groceries and recurring payments amount for the most of this increase.'
    },
    {
      month: 'October',
      income: 3200,
      spending: 2350,
      story: 'Spending decreased by €180 in October: annual subscriptions ended and groceries returned to your €620 monthly average.'
    },
    {
      month: 'November',
      income: 3200,
      spending: 2860,
      story: 'Spending increased by €510 in November: apartment move setup (+€340) and furniture purchases (+€170) drove the rise.'
    },
  ];

  let currentMetrics = [3200, 2530, 670];
  const figure = document.querySelector('.heroFigure');
  if (figure) {
    const spendingChart = figure.querySelector('svg.chart');
    const monthGroups = spendingChart ? Array.from(spendingChart.querySelectorAll('g')).slice(-6) : [];
    const monthButtons = Array.from(figure.querySelectorAll('.monthPicker button'));

    // Scroll trigger for initial hero bar chart entrance and number count-up
    if ('IntersectionObserver' in window) {
      let heroAnimated = false;
      const heroObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !heroAnimated) {
            heroAnimated = true;
            figure.classList.add('chart-animated');
            const metricsEls = figure.querySelectorAll('.metrics strong');
            if (metricsEls.length >= 3) {
              countNumber(metricsEls[0], 0, currentMetrics[0], 900);
              countNumber(metricsEls[1], 0, currentMetrics[1], 900);
              countNumber(metricsEls[2], 0, currentMetrics[2], 900);
            }
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });
      heroObserver.observe(figure);
    }

    monthButtons.forEach((button, index) => {
      button.addEventListener('click', () => {
        const example = examples[index];
        monthButtons.forEach((other, i) => other.setAttribute('aria-pressed', String(i === index)));
        monthGroups.forEach((group, i) => {
          group.setAttribute('opacity', i === index ? '1' : '0.55');
          group.querySelector('.chartHighlight')?.remove();
          if (i === index) {
            const highlight = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
            Object.entries({ x: 57 + i * 76, y: 13, width: 65, height: 188, rx: 7, class: 'chartHighlight' })
              .forEach(([key, value]) => highlight.setAttribute(key, String(value)));
            group.prepend(highlight);
          }
        });
        const monthLabel = document.getElementById('hero-month-label') || figure.querySelector('.monthLabel');
        if (monthLabel) monthLabel.textContent = `${example.month.toUpperCase()} / €${example.spending.toLocaleString()} SPENT`;
        const titleEl = document.getElementById('hero-month-title') || figure.querySelector('.figureTitle h2');
        if (titleEl) titleEl.textContent = example.story;

        // Smoothly animate count-up from old values to new values
        const metricsEls = figure.querySelectorAll('.metrics strong');
        if (metricsEls.length >= 3) {
          const newValues = [example.income, example.spending, example.income - example.spending];
          countNumber(metricsEls[0], currentMetrics[0], newValues[0], 500);
          countNumber(metricsEls[1], currentMetrics[1], newValues[1], 500);
          countNumber(metricsEls[2], currentMetrics[2], newValues[2], 500);
          currentMetrics = newValues;
        }

        const desc = spendingChart?.querySelector('desc');
        if (desc) {
          desc.textContent = `Fictional income and spending from June to November. ${example.month} is highlighted: income ${money(example.income)}, spending ${money(example.spending)}, left over ${money(example.income - example.spending)}.`;
        }
      });
    });

    // ── Hero Mode Toggle: Insights vs Chat ──
    const heroTabInsights = document.getElementById('hero-tab-insights');
    const heroTabClarity = document.getElementById('hero-tab-clarity');
    const heroPanelInsights = document.getElementById('hero-panel-insights');
    const heroPanelClarity = document.getElementById('hero-panel-clarity');
    const heroTagBadge = document.getElementById('hero-tag-badge');

    function setHeroMode(mode) {
      const isInsights = mode === 'insights';
      if (heroTabInsights) {
        heroTabInsights.classList.toggle('active', isInsights);
        heroTabInsights.setAttribute('aria-selected', String(isInsights));
      }
      if (heroTabClarity) {
        heroTabClarity.classList.toggle('active', !isInsights);
        heroTabClarity.setAttribute('aria-selected', String(!isInsights));
      }
      if (heroPanelInsights) {
        heroPanelInsights.hidden = !isInsights;
      }
      if (heroPanelClarity) {
        heroPanelClarity.hidden = isInsights;
        if (!isInsights && !chatSimStarted) {
          startChatSimulation();
        }
      }
      if (heroTagBadge) {
        heroTagBadge.textContent = 'EXAMPLE DATA';
      }
    }

    if (heroTabInsights && heroTabClarity) {
      heroTabInsights.addEventListener('click', () => setHeroMode('insights'));
      heroTabClarity.addEventListener('click', () => setHeroMode('clarity'));
    }

    // ── Chat Panel: Autonomous Simulated Conversation ──
    const chatQuestionsData = [
      {
        question: 'What subscriptions am I still paying for?',
        metric: '5 active · €142/mo',
        text: 'Found 5 active monthly subscriptions totaling €142/month: Gym membership (€49.00), Software tools (€54.00), Streaming (€28.00), and Spotify (€10.99). You haven\'t used the gym in 6 weeks.',
        viz: [
          { label: 'Software tools', amount: '€54.00', width: '38%', color: 'var(--color-accent)' },
          { label: 'Gym membership', amount: '€49.00', width: '35%', color: 'var(--color-clay)' },
          { label: 'Media & Spotify', amount: '€39.00', width: '27%', color: '#6b8f71' }
        ]
      },
      {
        question: 'Why did I spend more this month?',
        metric: '+€240 vs August',
        text: 'Your spending increased by €240 in September. Recurring software renewals (+€130) and back-to-school groceries (+€110) drove the difference; core rent and utilities stayed flat.',
        viz: [
          { label: 'Software renewals', amount: '+€130', width: '54%', color: 'var(--color-clay)' },
          { label: 'Groceries & Food', amount: '+€110', width: '46%', color: 'var(--color-accent)' },
          { label: 'Rent & Utilities', amount: 'Flat (€0)', width: '6%', color: '#6b8f71' }
        ]
      },
      {
        question: 'What does my spending look if I do a monthly dance class for 30 euros?',
        metric: '€640 leftover cushion',
        text: 'Adding €30/month for a dance class leaves you with €640 in monthly cushion (down from €670). You can easily absorb this within your existing €3,200 monthly income.',
        viz: [
          { label: 'Current leftover', amount: '€670', width: '67%', color: 'var(--color-accent)' },
          { label: 'Dance class', amount: '-€30', width: '10%', color: 'var(--color-clay)' },
          { label: 'Projected cushion', amount: '€640', width: '64%', color: '#6b8f71' }
        ]
      }
    ];

    const heroChatThread = document.getElementById('hero-chat-thread');
    const heroChatInput = document.getElementById('hero-chat-input');
    const heroChatSendBtn = document.getElementById('hero-chat-send-btn');
    const heroChatPauseBtn = document.getElementById('hero-chat-pause-btn');
    const heroChatPauseText = document.getElementById('hero-chat-pause-text');

    let chatSimStarted = false;
    let chatSimIndex = 0;
    let isChatPaused = false;
    let chatTimer = null;

    if (heroChatPauseBtn) {
      heroChatPauseBtn.addEventListener('click', () => {
        isChatPaused = !isChatPaused;
        const svgEl = heroChatPauseBtn.querySelector('.pauseIconSvg');
        if (isChatPaused) {
          if (heroChatPauseText) heroChatPauseText.textContent = 'Resume';
          if (svgEl) svgEl.innerHTML = '<polygon points="5 3 19 12 5 21 5 3"/>';
        } else {
          if (heroChatPauseText) heroChatPauseText.textContent = 'Pause';
          if (svgEl) svgEl.innerHTML = '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>';
          playNextChatQuestion();
        }
      });
    }

    function typeMessageIntoInput(text, onComplete) {
      if (!heroChatInput) {
        onComplete();
        return;
      }
      heroChatInput.value = '';
      let charIdx = 0;
      const typeInterval = setInterval(() => {
        if (charIdx < text.length) {
          heroChatInput.value += text[charIdx];
          charIdx++;
        } else {
          clearInterval(typeInterval);
          if (heroChatSendBtn) heroChatSendBtn.classList.add('active');
          setTimeout(() => {
            if (heroChatSendBtn) heroChatSendBtn.classList.remove('active');
            heroChatInput.value = '';
            onComplete();
          }, 350);
        }
      }, 25);
    }

    function renderQuestionBubble(q) {
      if (!heroChatThread) return;
      const bubble = document.createElement('div');
      bubble.className = 'chatBubble chatUser';
      bubble.innerHTML = `<p>${q.question}</p>`;
      heroChatThread.appendChild(bubble);
      heroChatThread.scrollTop = heroChatThread.scrollHeight;
    }

    function renderTypingIndicator() {
      if (!heroChatThread) return null;
      const typing = document.createElement('div');
      typing.className = 'chatTypingBubble';
      typing.id = 'hero-active-typing';
      typing.innerHTML = '<span></span><span></span><span></span>';
      heroChatThread.appendChild(typing);
      heroChatThread.scrollTop = heroChatThread.scrollHeight;
      return typing;
    }

    function renderAiResponseBubble(q) {
      if (!heroChatThread) return;
      const bubble = document.createElement('div');
      bubble.className = 'chatBubble chatAI';
      bubble.innerHTML = `
        <div class="chatAIRow">
          <div class="chatAIAvatar" aria-hidden="true">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>
          </div>
          <div class="chatAICard">
            <div class="chatAILabel">
              <span class="chatAIName">Moments Behind Money</span>
              <span class="chatAIBadge">Clarity AI</span>
            </div>
            <p class="chatAIText">${q.text}</p>
            <div class="chatAIMetric">${q.metric}</div>
            <div class="chatAIMiniViz">
              ${q.viz.map(v => `
                <div class="miniBarRow">
                  <span>${v.label}</span>
                  <div class="miniBarTrack"><div class="miniBarFill" style="width: ${v.width}; background: ${v.color};"></div></div>
                  <strong>${v.amount}</strong>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      `;
      heroChatThread.appendChild(bubble);
      heroChatThread.scrollTop = heroChatThread.scrollHeight;
    }

    function playNextChatQuestion() {
      if (isChatPaused) return;
      if (!heroChatThread) return;

      if (chatSimIndex >= chatQuestionsData.length) {
        // Reset thread smoothly for looping demo
        heroChatThread.innerHTML = '';
        chatSimIndex = 0;
      }

      const currentQ = chatQuestionsData[chatSimIndex];
      typeMessageIntoInput(currentQ.question, () => {
        renderQuestionBubble(currentQ);
        const typingEl = renderTypingIndicator();
        setTimeout(() => {
          if (typingEl && typingEl.parentNode) typingEl.parentNode.removeChild(typingEl);
          renderAiResponseBubble(currentQ);
          chatSimIndex++;
          chatTimer = setTimeout(() => {
            if (!isChatPaused) playNextChatQuestion();
          }, 4500);
        }, 750);
      });
    }

    function startChatSimulation() {
      if (chatSimStarted) return;
      chatSimStarted = true;
      playNextChatQuestion();
    }

    // Pre-start first question so chat thread is primed immediately
    if (heroChatThread) {
      startChatSimulation();
    }
  }


  /* ═══════════════════════════════════════════
     3. SCROLL REVEALS
     ═══════════════════════════════════════════ */
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
     4. WALKTHROUGH CONTROLLER & AUTO-PLAY ON SCROLL
     ═══════════════════════════════════════════ */
  const walkthroughSection = document.getElementById('welcome-demo');
  const stepButtons = Array.from(document.querySelectorAll('.walkthroughStepBtn'));
  const panels = [
    document.getElementById('panel-upload'),
    document.getElementById('panel-chat'),
    document.getElementById('panel-privacy')
  ];
  const nextStepBtns = Array.from(document.querySelectorAll('[data-next-step]'));

  let activeWalkthroughStep = 0;
  let autoPlayActive = false;
  let autoPlayCancelled = false;
  let stepTimer = null;
  let progressRaf = null;

  const STEP_DURATIONS = [4000, 7000, 5000]; // Duration per step in ms

  function setWalkthroughStep(index, isAuto = false) {
    if (!isAuto) {
      autoPlayCancelled = true;
      cancelAnimationFrame(progressRaf);
      clearTimeout(stepTimer);
      // Reset all progress fills
      stepButtons.forEach((btn) => {
        const fill = btn.querySelector('.stepFill');
        if (fill) fill.style.width = '0%';
      });
    }

    activeWalkthroughStep = index;

    // Update buttons
    stepButtons.forEach((btn, i) => {
      const isActive = i === index;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', String(isActive));
    });

    // Update panels
    panels.forEach((panel, i) => {
      if (!panel) return;
      const isCurrent = i === index;
      panel.style.display = isCurrent ? 'block' : 'none';
      panel.classList.toggle('active', isCurrent);
      panel.setAttribute('aria-hidden', String(!isCurrent));
    });

    // Specific triggers per panel
    if (index === 1) {
      playChatScenario(0);
    } else if (index === 2) {
      // Trigger scramble on privacy preview
      const ibanEl = document.getElementById('walkthrough-mask-iban');
      const merchantEl = document.getElementById('walkthrough-mask-merchant');
      const amountEl = document.getElementById('walkthrough-mask-amount');
      if (ibanEl) scrambleText(ibanEl, 'IBAN..4300', 650);
      if (merchantEl) scrambleText(merchantEl, 'Merchant_1', 600);
      if (amountEl) scrambleText(amountEl, '€175.00', 500);
    }
  }

  function startStepProgress(stepIndex) {
    if (autoPlayCancelled || isReducedMotion()) return;
    const btn = stepButtons[stepIndex];
    if (!btn) return;
    const fill = btn.querySelector('.stepFill');
    if (!fill) return;

    // Reset fills of all buttons
    stepButtons.forEach((b, i) => {
      const f = b.querySelector('.stepFill');
      if (f) f.style.width = i < stepIndex ? '100%' : '0%';
    });

    const duration = STEP_DURATIONS[stepIndex] || 5000;
    const startTime = performance.now();

    function stepTick(now) {
      if (autoPlayCancelled) return;
      const elapsed = now - startTime;
      const pct = Math.min((elapsed / duration) * 100, 100);
      fill.style.width = `${pct}%`;

      if (elapsed < duration) {
        progressRaf = requestAnimationFrame(stepTick);
      } else {
        fill.style.width = '100%';
        const next = (stepIndex + 1) % 3;
        setWalkthroughStep(next, true);
        startStepProgress(next);
      }
    }
    progressRaf = requestAnimationFrame(stepTick);
  }

  stepButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const stepIdx = parseInt(btn.dataset.step, 10) || 0;
      setWalkthroughStep(stepIdx, false);
    });
  });

  nextStepBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const nextIdx = parseInt(btn.dataset.nextStep, 10) || 1;
      setWalkthroughStep(nextIdx, false);
    });
  });

  // Auto-play walkthrough when scrolled into view
  if (walkthroughSection && 'IntersectionObserver' in window) {
    let observedOnce = false;
    const walkthroughObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !observedOnce) {
          observedOnce = true;
          autoPlayActive = true;
          setWalkthroughStep(0, true);
          startStepProgress(0);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.25 });
    walkthroughObserver.observe(walkthroughSection);
  }

  /* ═══════════════════════════════════════════
     5. CHAT MOCKUP SCENARIOS & TYPING
     ═══════════════════════════════════════════ */
  const userMsgEl = document.getElementById('demo-user-msg');
  const loadingEl = document.getElementById('demo-loading');
  const aiResponseEl = document.getElementById('demo-ai-response');
  const aiTextEl = document.getElementById('demo-ai-text');
  const demoChartEl = document.getElementById('demo-chart');
  const demoSuggestionsEl = document.getElementById('demo-suggestions');
  const sessionItems = Array.from(document.querySelectorAll('.chatMockSession'));
  const newChatBtn = document.querySelector('.chatMockNewBtn');

  // Bar / Pie view toggles
  const barBtn = document.getElementById('btn-chart-bar');
  const pieBtn = document.getElementById('btn-chart-pie');
  const barView = document.getElementById('demo-bar-view');
  const pieView = document.getElementById('demo-pie-view');
  let activeChartView = 'bar';

  function setChartView(view) {
    activeChartView = view;
    const isBar = view === 'bar';
    if (barBtn) {
      barBtn.classList.toggle('active', isBar);
      barBtn.setAttribute('aria-pressed', String(isBar));
    }
    if (pieBtn) {
      pieBtn.classList.toggle('active', !isBar);
      pieBtn.setAttribute('aria-pressed', String(!isBar));
    }
    if (barView) barView.style.display = isBar ? 'block' : 'none';
    if (pieView) pieView.style.display = !isBar ? 'block' : 'none';
  }

  if (barBtn) {
    barBtn.addEventListener('click', () => {
      autoPlayCancelled = true;
      setChartView('bar');
    });
  }
  if (pieBtn) {
    pieBtn.addEventListener('click', () => {
      autoPlayCancelled = true;
      setChartView('pie');
    });
  }

  const scenarios = [
    {
      title: 'Where is money going?',
      meta: 'Dissecting transactions & visualizing answers',
      userQuestion: 'Where is most of my money actually going?',
      aiParagraphs: [
        'In October, your spending was concentrated in <strong>Food &amp; Groceries (€342)</strong> and <strong>Transport (€127)</strong>, representing <strong>73%</strong> of your tracked expenses.',
        'Food was your highest single category, with supermarket visits accounting for €245 of that total.'
      ],
      chartTitle: 'Spending by Category (October)',
      bars: [
        { label: 'Food & Groceries', width: 82, value: '€342', alt: false },
        { label: 'Transport & Travel', width: 31, value: '€127', alt: true }
      ],
      pie: {
        total: '€469',
        sub: 'COMPARED',
        slices: [
          { label: 'Food & Groceries', value: '€342', pct: '73%', dash: '220.16 301.59', offset: '0', class: 'food' },
          { label: 'Transport & Travel', value: '€127', pct: '27%', dash: '81.43 301.59', offset: '-220.16', class: 'transport' }
        ]
      },
      suggestions: ['What subscriptions am I paying for?', 'Why did I spend more this month?', 'Show pie chart breakdown']
    },
    {
      title: 'Subscriptions audit',
      meta: 'Uncovering overlooked recurring expenses',
      userQuestion: 'What subscriptions am I still paying for?',
      aiParagraphs: [
        'You have <strong>4 active recurring services</strong> totaling <strong>€74.49/month</strong> (€893.88/year).',
        'Detected: <strong>Fitness Club (€35.00)</strong>, <strong>Swapfiets Mobility (€19.50)</strong>, <strong>Cloud Storage (€9.99)</strong>, and <strong>Streaming (€10.00)</strong>.'
      ],
      chartTitle: 'Monthly Subscriptions (€74.49/mo)',
      bars: [
        { label: 'Fitness & Health', width: 70, value: '€35.00', alt: false },
        { label: 'Mobility & Cloud', width: 40, value: '€19.50', alt: true }
      ],
      pie: {
        total: '€74.49',
        sub: 'MONTHLY',
        slices: [
          { label: 'Fitness Club', value: '€35.00', pct: '47%', dash: '141.75 301.59', offset: '0', class: 'food' },
          { label: 'Mobility & Digital', value: '€39.49', pct: '53%', dash: '159.84 301.59', offset: '-141.75', class: 'transport' }
        ]
      },
      suggestions: ['Where is most of my money going?', 'Why did I spend more this month?']
    },
    {
      title: 'Why spend more?',
      meta: 'Month-over-month contextual comparison',
      userQuestion: 'Why did I spend more this month?',
      aiParagraphs: [
        'October spending was <strong>€2,860</strong>, which is <strong>€510 higher</strong> than September (€2,350).',
        'The increase was driven by <strong>€480 in one-off home &amp; moving purchases</strong>. Everyday living costs remained steady (+€30).'
      ],
      chartTitle: 'September vs October Comparison',
      bars: [
        { label: 'Moving & Setup (One-off)', width: 85, value: '+€480', alt: false },
        { label: 'Regular Living Costs', width: 15, value: '+€30', alt: true }
      ],
      pie: {
        total: '+€510',
        sub: 'DIFFERENCE',
        slices: [
          { label: 'One-off Moving Setup', value: '+€480', pct: '94%', dash: '283.49 301.59', offset: '0', class: 'food' },
          { label: 'Regular Living Costs', value: '+€30', pct: '6%', dash: '18.1 301.59', offset: '-283.49', class: 'transport' }
        ]
      },
      suggestions: ['Commit to something new?', 'Where is most of my money going?']
    },
    {
      title: 'Commit to something new?',
      meta: 'Forward-looking capacity & safety buffer',
      userQuestion: 'What does my spending look like before I commit to something new?',
      aiParagraphs: [
        'Across the past 6 months, you averaged <strong>€340/month leftover</strong> after all essentials and living costs.',
        'If you commit to a new <strong>€150/month</strong> expense, you still preserve a comfortable <strong>€190/month safety buffer</strong> for unexpected costs.'
      ],
      chartTitle: 'Monthly Capacity vs New Commitment',
      bars: [
        { label: 'Preserved Safety Buffer', width: 56, value: '€190', alt: false },
        { label: 'New Commitment', width: 44, value: '€150', alt: true }
      ],
      pie: {
        total: '€340',
        sub: 'LEFTOVER',
        slices: [
          { label: 'Preserved Safety Buffer', value: '€190', pct: '56%', dash: '168.89 301.59', offset: '0', class: 'food' },
          { label: 'New Expense Share', value: '€150', pct: '44%', dash: '132.7 301.59', offset: '-168.89', class: 'transport' }
        ]
      },
      suggestions: ['What subscriptions am I paying for?', 'Show pie chart breakdown']
    }
  ];

  let isChatPlaying = false;
  let chatToken = 0;

  function typeChatText(element, text, speed = 20, token) {
    return new Promise((resolve) => {
      if (isReducedMotion()) {
        element.textContent = text;
        return resolve();
      }
      let i = 0;
      element.textContent = '';
      const timer = setInterval(() => {
        if (token !== chatToken) {
          clearInterval(timer);
          return resolve();
        }
        element.textContent += text.charAt(i);
        i++;
        if (i >= text.length) {
          clearInterval(timer);
          resolve();
        }
      }, speed);
    });
  }

  function wait(ms, token) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });
  }

  async function playChatScenario(index, manual = false) {
    if (isChatPlaying && !manual) return;
    isChatPlaying = true;
    const token = ++chatToken;
    const data = scenarios[index] || scenarios[0];

    const currentSessions = Array.from(document.querySelectorAll('.chatMockSession'));
    currentSessions.forEach((session, i) => {
      session.classList.toggle('active', i === index);
    });

    const headerTitle = document.querySelector('.chatMockHeader h3');
    const headerSub = document.querySelector('.chatMockHeader p');
    if (headerTitle) headerTitle.textContent = data.title;
    if (headerSub) headerSub.textContent = data.meta;

    if (userMsgEl) userMsgEl.textContent = '';
    if (loadingEl) loadingEl.style.display = 'none';
    if (aiResponseEl) aiResponseEl.style.display = 'none';
    if (aiTextEl) aiTextEl.innerHTML = '';
    if (demoChartEl) demoChartEl.style.display = 'none';
    if (demoSuggestionsEl) {
      demoSuggestionsEl.style.display = 'none';
      demoSuggestionsEl.innerHTML = '';
    }

    // Step 1: Type user question
    if (userMsgEl) {
      await typeChatText(userMsgEl, data.userQuestion, 20, token);
      if (token !== chatToken) return;
    }

    // Step 2: Show loading dots
    await wait(280, token);
    if (token !== chatToken) return;
    if (loadingEl) loadingEl.style.display = 'flex';

    // Step 3: Reveal AI message
    await wait(700, token);
    if (token !== chatToken) return;
    if (loadingEl) loadingEl.style.display = 'none';
    if (aiResponseEl) aiResponseEl.style.display = 'block';

    if (aiTextEl) {
      if (isReducedMotion()) {
        aiTextEl.innerHTML = data.aiParagraphs.map((p) => `<p>${p}</p>`).join('');
      } else {
        for (const p of data.aiParagraphs) {
          const pEl = document.createElement('p');
          pEl.innerHTML = p;
          pEl.style.opacity = '0';
          pEl.style.transform = 'translateY(6px)';
          pEl.style.transition = 'opacity 0.35s ease, transform 0.35s ease';
          aiTextEl.appendChild(pEl);
          await wait(60, token);
          pEl.style.opacity = '1';
          pEl.style.transform = 'translateY(0)';
          await wait(280, token);
        }
      }
    }

    // Step 4: Show inline chart and animate bars and pie
    await wait(200, token);
    if (token !== chatToken) return;
    if (demoChartEl) {
      demoChartEl.style.display = 'block';
      const chartTitleEl = demoChartEl.querySelector('.chatMockChartTitle');
      if (chartTitleEl) chartTitleEl.textContent = data.chartTitle;

      // Update bars
      const barContainers = demoChartEl.querySelectorAll('.chatMockBar');
      data.bars.forEach((barData, i) => {
        const barDiv = barContainers[i];
        if (!barDiv) return;
        const labelEl = barDiv.querySelector('.chatMockBarLabel');
        const fillEl = barDiv.querySelector('.chatMockBarFill');
        if (labelEl) labelEl.textContent = barData.label;
        if (fillEl) {
          fillEl.className = 'chatMockBarFill' + (barData.alt ? ' alt' : '');
          fillEl.style.width = '0%';
          fillEl.setAttribute('data-value', barData.value);
          fillEl.setAttribute('data-width', String(barData.width));
          fillEl.classList.remove('animated');
          setTimeout(() => {
            if (token === chatToken) {
              fillEl.style.width = `${barData.width}%`;
              fillEl.classList.add('animated');
            }
          }, 120);
        }
      });

      // Update pie
      if (data.pie) {
        const totalEl = document.getElementById('pie-center-total');
        const subEl = demoChartEl.querySelector('.pieCenterSub');
        const slice1 = document.getElementById('pie-slice-1');
        const slice2 = document.getElementById('pie-slice-2');
        const pieLegendEl = document.getElementById('demo-pie-legend');

        if (totalEl) totalEl.textContent = data.pie.total;
        if (subEl) subEl.textContent = data.pie.sub;
        if (slice1 && data.pie.slices[0]) {
          slice1.setAttribute('stroke-dasharray', data.pie.slices[0].dash);
          slice1.setAttribute('stroke-dashoffset', data.pie.slices[0].offset);
        }
        if (slice2 && data.pie.slices[1]) {
          slice2.setAttribute('stroke-dasharray', data.pie.slices[1].dash);
          slice2.setAttribute('stroke-dashoffset', data.pie.slices[1].offset);
        }
        if (pieLegendEl && data.pie.slices.length >= 2) {
          pieLegendEl.innerHTML = data.pie.slices.map((s) => `
            <div class="pieLegendItem">
              <span class="pieDot ${s.class}"></span>
              <div class="pieLegendInfo">
                <span class="pieLegendName">${s.label}</span>
                <span class="pieLegendVal">${s.value} <small>(${s.pct})</small></span>
              </div>
            </div>
          `).join('');
        }
      }
    }

    // Step 5: Suggestions
    await wait(350, token);
    if (token !== chatToken) return;
    if (demoSuggestionsEl) {
      demoSuggestionsEl.innerHTML = '';
      data.suggestions.forEach((text) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.textContent = text;
        btn.addEventListener('click', () => {
          autoPlayCancelled = true;
          if (text.includes('pie') || text.includes('Pie')) {
            setChartView('pie');
          } else if (text.includes('subscription') || text.includes('Subscription')) {
            setChartView('bar');
            playChatScenario(1, true);
          } else if (text.includes('spend more') || text.includes('Spend more')) {
            setChartView('bar');
            playChatScenario(2, true);
          } else if (text.includes('commit') || text.includes('Commit')) {
            setChartView('bar');
            playChatScenario(3, true);
          } else {
            setChartView('bar');
            playChatScenario(0, true);
          }
        });
        demoSuggestionsEl.appendChild(btn);
      });
      demoSuggestionsEl.style.display = 'flex';
    }

    isChatPlaying = false;
  }

  // Bind session clicks
  function bindSessionClicks() {
    const sessions = Array.from(document.querySelectorAll('.chatMockSession'));
    sessions.forEach((session, index) => {
      session.addEventListener('click', () => {
        autoPlayCancelled = true;
        playChatScenario(index, true);
      });
    });
  }
  bindSessionClicks();

  // Wire Question Action Buttons to jump to chat demo
  const questionActionBtns = Array.from(document.querySelectorAll('.questionActionBtn'));
  questionActionBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      autoPlayCancelled = true;
      const targetScenario = parseInt(btn.dataset.targetScenario, 10) || 0;
      setWalkthroughStep(1, false);
      const demoSection = document.getElementById('welcome-demo');
      if (demoSection) {
        demoSection.scrollIntoView({ behavior: isReducedMotion() ? 'auto' : 'smooth' });
      }
      playChatScenario(targetScenario, true);
    });
  });

  if (newChatBtn) {
    newChatBtn.addEventListener('click', () => {
      autoPlayCancelled = true;
      playChatScenario(0, true);
    });
  }

  /* ═══════════════════════════════════════════
     6. PRIVACY DATA FLOW PULSE
     ═══════════════════════════════════════════ */
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
