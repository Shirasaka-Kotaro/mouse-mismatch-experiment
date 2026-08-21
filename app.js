(() => {
  "use strict";

  const canvas = document.getElementById("arena");
  const ctx = canvas.getContext("2d");
  const arenaShell = document.querySelector(".arena-shell");

  const ui = {
    participantId: document.getElementById("participantId"),
    trialsPerBlock: document.getElementById("trialsPerBlock"),
    perturbationMode: document.getElementById("perturbationMode"),
    perturbationHelp: document.getElementById("perturbationHelp"),
    rotationAngleField: document.getElementById("rotationAngleField"),
    rotationAngle: document.getElementById("rotationAngle"),
    rotationAngleValue: document.getElementById("rotationAngleValue"),
    lagStrengthField: document.getElementById("lagStrengthField"),
    lagStrength: document.getElementById("lagStrength"),
    lagStrengthValue: document.getElementById("lagStrengthValue"),
    transitionPoint: document.getElementById("transitionPoint"),
    transitionPointValue: document.getElementById("transitionPointValue"),
    showBoundary: document.getElementById("showBoundary"),
    startButton: document.getElementById("startButton"),
    pauseButton: document.getElementById("pauseButton"),
    resetButton: document.getElementById("resetButton"),
    csvButton: document.getElementById("csvButton"),
    jsonButton: document.getElementById("jsonButton"),
    downloadGroup: document.getElementById("downloadGroup"),
    sessionBadge: document.getElementById("sessionBadge"),
    phaseLabel: document.getElementById("phaseLabel"),
    blockLabel: document.getElementById("blockLabel"),
    trialLabel: document.getElementById("trialLabel"),
    progressBar: document.getElementById("progressBar"),
    arenaHint: document.getElementById("arenaHint"),
    conditionReadout: document.getElementById("conditionReadout"),
    movementTimeReadout: document.getElementById("movementTimeReadout"),
    errorReadout: document.getElementById("errorReadout"),
    successReadout: document.getElementById("successReadout"),
    arenaOverlay: document.getElementById("arenaOverlay"),
    overlayTitle: document.getElementById("overlayTitle"),
    overlayBody: document.getElementById("overlayBody"),
    overlayButton: document.getElementById("overlayButton"),
    resultsPanel: document.getElementById("resultsPanel"),
    resultsBody: document.getElementById("resultsBody"),
    resultSummary: document.getElementById("resultSummary"),
  };

  const PHASES = [
    { key: "baseline", label: "ベースライン", blocks: 2 },
    { key: "adaptation", label: "摂動・適応", blocks: 4 },
    { key: "washout", label: "後効果", blocks: 2 },
  ];

  const START = { x: canvas.width / 2, y: canvas.height / 2 };
  const START_RADIUS = 22;
  const TARGET_WIDTHS = [24, 30, 38, 48];
  const TARGET_AMPLITUDES = [145, 175, 205, 225];
  const PERTURBATION_LABELS = {
    heavy: "重い（遅れて追従）",
    reverse: "逆方向（180°反転）",
    rotate: "回転（斜めにずれる）",
  };
  const PERTURBATION_HELP = {
    heavy: "動作途中から、入力に対するカーソルの追従を弱めます。",
    reverse: "動作途中から、マウスの移動方向と反対方向へカーソルが進みます。",
    rotate: "動作途中から、マウスの移動方向を指定角度だけ回転させます。",
  };

  const state = {
    sessionState: "idle",
    phaseIndex: 0,
    blockInPhase: 0,
    trialInBlock: 0,
    completedTrials: 0,
    currentTrial: null,
    trials: [],
    rawPointer: null,
    virtualPointer: { ...START },
    pointerDown: false,
    pointerId: null,
    rngSeed: null,
    rng: null,
    settings: null,
    sessionStartedAt: null,
    sessionFinishedAt: null,
    advanceTimer: null,
    overlayAction: null,
  };

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function distance(a, b) {
    return Math.hypot(a.x - b.x, a.y - b.y);
  }

  function lerp(a, b, amount) {
    return a + (b - a) * amount;
  }

  function formatMs(value) {
    return Number.isFinite(value) ? `${Math.round(value)} ms` : "—";
  }

  function formatPercent(value) {
    return Number.isFinite(value) ? `${Math.round(value * 100)}%` : "—";
  }

  function formatNumber(value, digits = 1) {
    return Number.isFinite(value) ? value.toFixed(digits) : "—";
  }

  function perturbationLabel(mode) {
    return PERTURBATION_LABELS[mode] || PERTURBATION_LABELS.heavy;
  }

  function effectivePerturbationAngle(mode, configuredAngle) {
    if (mode === "reverse") return 180;
    if (mode === "rotate") return Number(configuredAngle);
    return null;
  }

  function formatRotationAngle(value) {
    if (!Number.isFinite(value)) return "—";
    if (value === 0) return "0°";
    return `${value > 0 ? "+" : ""}${value}°（${value > 0 ? "時計回り" : "反時計回り"}）`;
  }

  function conditionLabel(mode, angle) {
    const label = perturbationLabel(mode);
    return mode === "rotate" ? `${label} ${formatRotationAngle(angle)}` : label;
  }

  function mulberry32(seed) {
    return () => {
      let t = (seed += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function createSeed() {
    return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
  }

  function currentPhase() {
    return PHASES[state.phaseIndex] || PHASES[PHASES.length - 1];
  }

  function totalTrials() {
    const perBlock = state.settings?.trialsPerBlock ?? Number(ui.trialsPerBlock.value);
    return PHASES.reduce((sum, phase) => sum + phase.blocks * perBlock, 0);
  }

  function readSettings() {
    return {
      participantId: ui.participantId.value.trim() || "P001",
      trialsPerBlock: Number(ui.trialsPerBlock.value),
      perturbationMode: ui.perturbationMode.value,
      rotationAngle: Number(ui.rotationAngle.value),
      lagStrength: Number(ui.lagStrength.value) / 100,
      transitionPoint: Number(ui.transitionPoint.value) / 100,
      showBoundary: ui.showBoundary.checked,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      phases: PHASES.map((phase) => ({ ...phase })),
    };
  }

  function setSessionState(nextState) {
    state.sessionState = nextState;
    const labels = {
      idle: "準備中",
      running: "実験中",
      paused: "一時停止",
      break: "休憩",
      complete: "完了",
    };
    ui.sessionBadge.textContent = labels[nextState] || nextState;
    ui.sessionBadge.dataset.state = nextState;
    arenaShell.dataset.running = String(nextState === "running");
    updateControls();
  }

  function updateControls() {
    const active = ["running", "paused", "break"].includes(state.sessionState);
    const canStart = state.sessionState === "idle" || state.sessionState === "complete";
    const locked = active;

    [
      ui.participantId,
      ui.trialsPerBlock,
      ui.perturbationMode,
      ui.rotationAngle,
      ui.lagStrength,
      ui.transitionPoint,
      ui.showBoundary,
    ].forEach((element) => {
      element.disabled = locked;
    });

    ui.startButton.disabled = !canStart;
    ui.startButton.textContent = state.sessionState === "complete" ? "新しいセッション" : "実験を開始";
    ui.pauseButton.disabled = !active || state.pointerDown;
    ui.pauseButton.textContent = state.sessionState === "paused" ? "再開" : "一時停止";
    ui.downloadGroup.hidden = state.trials.length === 0;
  }

  function updateSettingReadouts() {
    ui.lagStrengthValue.textContent = `${ui.lagStrength.value}%`;
    ui.transitionPointValue.textContent = `${ui.transitionPoint.value}%`;
    ui.rotationAngleValue.textContent = formatRotationAngle(Number(ui.rotationAngle.value));
    const mode = ui.perturbationMode.value;
    ui.perturbationHelp.textContent = PERTURBATION_HELP[mode] || PERTURBATION_HELP.heavy;
    ui.lagStrengthField.hidden = mode !== "heavy";
    ui.rotationAngleField.hidden = mode !== "rotate";
  }

  function updateProgress() {
    const phase = currentPhase();
    const total = totalTrials();
    const isActive = state.sessionState !== "idle" && state.sessionState !== "complete";
    const phaseText = state.sessionState === "idle" ? "開始前" : state.sessionState === "complete" ? "完了" : phase.label;
    ui.phaseLabel.textContent = phaseText;
    ui.blockLabel.textContent = isActive ? `ブロック ${state.blockInPhase + 1} / ${phase.blocks}` : "ブロック - / -";
    ui.trialLabel.textContent = isActive ? `試行 ${Math.min(state.trialInBlock + 1, state.settings.trialsPerBlock)} / ${state.settings.trialsPerBlock}` : "試行 - / -";
    ui.progressBar.style.width = `${total ? (state.completedTrials / total) * 100 : 0}%`;
  }

  function updateReadout(lastTrial = null) {
    if (lastTrial) {
      ui.movementTimeReadout.textContent = formatMs(lastTrial.movementTime);
      ui.errorReadout.textContent = `${formatNumber(lastTrial.endpointError, 1)} px`;
      ui.successReadout.textContent = formatPercent(successRate(state.trials));
    }

    const trial = state.currentTrial;
    if (!trial) {
      ui.conditionReadout.textContent = state.sessionState === "complete" ? "セッション完了" : "準備中";
      return;
    }

    if (trial.phaseKey === "adaptation") {
      const condition = conditionLabel(trial.perturbationMode, trial.perturbationAngleDeg);
      ui.conditionReadout.textContent = trial.transitionOccurred ? `摂動：${condition}` : `通常 → ${condition}`;
    } else if (trial.phaseKey === "washout") {
      ui.conditionReadout.textContent = "通常状態（後効果）";
    } else {
      ui.conditionReadout.textContent = "通常状態";
    }
  }

  function successRate(rows) {
    if (!rows.length) return NaN;
    return rows.filter((row) => row.success).length / rows.length;
  }

  function pointFromEvent(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: clamp((event.clientX - rect.left) * (canvas.width / rect.width), 0, canvas.width),
      y: clamp((event.clientY - rect.top) * (canvas.height / rect.height), 0, canvas.height),
    };
  }

  function createTrial() {
    const rng = state.rng;
    const angle = rng() * Math.PI * 2;
    const amplitude = TARGET_AMPLITUDES[Math.floor(rng() * TARGET_AMPLITUDES.length)];
    const width = TARGET_WIDTHS[Math.floor(rng() * TARGET_WIDTHS.length)];
    const target = {
      x: START.x + Math.cos(angle) * amplitude,
      y: START.y + Math.sin(angle) * amplitude,
    };
    const phase = currentPhase();
    const id = Math.log2(amplitude / width + 1);

    return {
      sessionTrial: state.completedTrials + 1,
      phaseIndex: state.phaseIndex,
      phaseKey: phase.key,
      phaseLabel: phase.label,
      blockIndex: state.blockInPhase,
      trialIndex: state.trialInBlock,
      targetX: target.x,
      targetY: target.y,
      targetWidth: width,
      amplitude,
      fittsId: id,
      targetAngle: angle,
      perturbationMode: state.settings.perturbationMode,
      perturbationAngleDeg: effectivePerturbationAngle(state.settings.perturbationMode, state.settings.rotationAngle),
      startedAt: null,
      endedAt: null,
      transitionOccurred: false,
      transitionAt: null,
      transitionRawX: null,
      transitionRawY: null,
      transitionVirtualX: null,
      transitionVirtualY: null,
      perturbationOriginRaw: null,
      perturbationOriginVirtual: null,
      pointerId: null,
      rawPath: [],
      virtualPath: [],
    };
  }

  function prepareTrial() {
    if (state.sessionState !== "running") return;
    state.currentTrial = createTrial();
    state.pointerDown = false;
    state.pointerId = null;
    state.rawPointer = null;
    state.virtualPointer = { ...START };
    ui.arenaHint.textContent = "開始円の中で左クリックを押したまま、黄色の目標へ移動してください。";
    updateProgress();
    updateReadout();
    drawArena();
  }

  function showOverlay(title, body, buttonLabel, action) {
    ui.overlayTitle.textContent = title;
    ui.overlayBody.textContent = body;
    ui.overlayButton.textContent = buttonLabel;
    state.overlayAction = action;
    ui.arenaOverlay.hidden = false;
  }

  function hideOverlay() {
    ui.arenaOverlay.hidden = true;
    state.overlayAction = null;
  }

  function showIntro() {
    showOverlay(
      "マウス実験を開始してください",
      "通常状態、動作途中の摂動、後効果の順に測定します。参加者IDと設定を確認してから開始してください。",
      "実験を開始",
      startSession,
    );
  }

  function startSession() {
    if (state.sessionState === "running") return;
    if (state.advanceTimer) window.clearTimeout(state.advanceTimer);

    state.settings = readSettings();
    ui.participantId.value = state.settings.participantId;
    state.rngSeed = createSeed();
    state.rng = mulberry32(state.rngSeed);
    state.phaseIndex = 0;
    state.blockInPhase = 0;
    state.trialInBlock = 0;
    state.completedTrials = 0;
    state.currentTrial = null;
    state.trials = [];
    state.rawPointer = null;
    state.virtualPointer = { ...START };
    state.pointerDown = false;
    state.pointerId = null;
    state.sessionStartedAt = new Date().toISOString();
    state.sessionFinishedAt = null;
    ui.resultsPanel.hidden = true;
    ui.resultsBody.innerHTML = "";
    ui.resultSummary.textContent = "";
    setSessionState("running");
    hideOverlay();
    prepareTrial();
  }

  function resetSession() {
    if (state.advanceTimer) window.clearTimeout(state.advanceTimer);
    state.advanceTimer = null;
    state.pointerDown = false;
    state.pointerId = null;
    state.currentTrial = null;
    state.trials = [];
    state.completedTrials = 0;
    state.phaseIndex = 0;
    state.blockInPhase = 0;
    state.trialInBlock = 0;
    state.rawPointer = null;
    state.virtualPointer = { ...START };
    state.sessionStartedAt = null;
    state.sessionFinishedAt = null;
    ui.resultsPanel.hidden = true;
    ui.resultsBody.innerHTML = "";
    ui.resultSummary.textContent = "";
    ui.movementTimeReadout.textContent = "—";
    ui.errorReadout.textContent = "—";
    ui.successReadout.textContent = "—";
    ui.arenaHint.textContent = "実験を開始すると、ここにターゲットが表示されます。";
    setSessionState("idle");
    showIntro();
    updateProgress();
    updateReadout();
    drawArena();
  }

  function togglePause() {
    if (state.sessionState === "running" && !state.pointerDown) {
      setSessionState("paused");
      showOverlay("一時停止中", "休憩が終わったら再開してください。現在のブロックとデータは保持されています。", "再開", resumeSession);
      ui.arenaHint.textContent = "一時停止中です。再開ボタンを押してください。";
    } else if (state.sessionState === "paused") {
      resumeSession();
    }
  }

  function resumeSession() {
    if (state.sessionState !== "paused") return;
    setSessionState("running");
    hideOverlay();
    ui.arenaHint.textContent = "開始円の中で左クリックを押したまま、黄色の目標へ移動してください。";
    drawArena();
  }

  function handlePointerDown(event) {
    if (event.button !== 0 || state.sessionState !== "running" || !state.currentTrial) return;
    const point = pointFromEvent(event);
    if (distance(point, START) > START_RADIUS * 1.7) {
      ui.arenaHint.textContent = "開始円の中でクリックしてください。";
      return;
    }

    event.preventDefault();
    state.pointerDown = true;
    state.pointerId = event.pointerId;
    state.rawPointer = point;
    state.virtualPointer = { ...point };
    state.currentTrial.pointerId = event.pointerId;
    state.currentTrial.startedAt = performance.now();
    state.currentTrial.rawPath = [{ t: 0, x: point.x, y: point.y }];
    state.currentTrial.virtualPath = [{ t: 0, x: point.x, y: point.y }];
    canvas.setPointerCapture(event.pointerId);
    updateControls();
    updateReadout();
    drawArena();
  }

  function handlePointerMove(event) {
    const point = pointFromEvent(event);
    state.rawPointer = point;

    if (!state.pointerDown || !state.currentTrial || state.currentTrial.pointerId !== event.pointerId) {
      drawArena();
      return;
    }

    event.preventDefault();
    const trial = state.currentTrial;
    activatePerturbationIfNeeded(point, trial);

    const elapsed = performance.now() - trial.startedAt;
    appendPathSample(trial.rawPath, point, elapsed);
    updateReadout();
    drawArena();
  }

  function handlePointerUp(event) {
    if (!state.pointerDown || !state.currentTrial || state.currentTrial.pointerId !== event.pointerId) return;
    event.preventDefault();
    state.rawPointer = pointFromEvent(event);
    activatePerturbationIfNeeded(state.rawPointer, state.currentTrial);
    updateVirtualPointer();
    appendPathSample(state.currentTrial.rawPath, state.rawPointer, performance.now() - state.currentTrial.startedAt);
    state.pointerDown = false;
    state.pointerId = null;
    updateControls();
    window.requestAnimationFrame(finishTrial);
  }

  function handlePointerCancel(event) {
    if (!state.currentTrial || state.currentTrial.pointerId !== event.pointerId) return;
    state.pointerDown = false;
    state.pointerId = null;
    state.currentTrial.rawPath = [];
    state.currentTrial.virtualPath = [];
    state.rawPointer = null;
    state.virtualPointer = { ...START };
    updateControls();
    drawArena();
  }

  function movementProgress(point, trial) {
    const dx = trial.targetX - START.x;
    const dy = trial.targetY - START.y;
    const px = point.x - START.x;
    const py = point.y - START.y;
    return clamp((px * dx + py * dy) / (trial.amplitude * trial.amplitude), 0, 1.5);
  }

  function activatePerturbationIfNeeded(point, trial) {
    if (trial.phaseKey !== "adaptation" || trial.transitionOccurred) return;
    if (movementProgress(point, trial) < state.settings.transitionPoint) return;

    trial.transitionOccurred = true;
    trial.transitionAt = performance.now();
    trial.transitionRawX = point.x;
    trial.transitionRawY = point.y;
    trial.transitionVirtualX = point.x;
    trial.transitionVirtualY = point.y;
    trial.perturbationOriginRaw = { ...point };
    trial.perturbationOriginVirtual = { ...point };
    state.virtualPointer = { ...point };
    ui.arenaHint.textContent = `摂動状態（${conditionLabel(trial.perturbationMode, trial.perturbationAngleDeg)}）です。画面上のカーソルを目標へ合わせてください。`;
  }

  function appendPathSample(path, point, elapsed) {
    const previous = path[path.length - 1];
    if (!previous || distance(previous, point) >= 0.8) {
      path.push({ t: Math.round(elapsed), x: Number(point.x.toFixed(2)), y: Number(point.y.toFixed(2)) });
    }
  }

  function finishTrial() {
    const trial = state.currentTrial;
    if (!trial || !trial.startedAt) return;

    const endedAt = performance.now();
    trial.endedAt = endedAt;
    trial.movementTime = endedAt - trial.startedAt;
    appendPathSample(trial.virtualPath, state.virtualPointer, trial.movementTime);

    const target = { x: trial.targetX, y: trial.targetY };
    trial.rawEndX = state.rawPointer?.x ?? NaN;
    trial.rawEndY = state.rawPointer?.y ?? NaN;
    trial.virtualEndX = state.virtualPointer.x;
    trial.virtualEndY = state.virtualPointer.y;
    trial.rawEndpointError = state.rawPointer ? distance(state.rawPointer, target) : NaN;
    trial.endpointError = distance(state.virtualPointer, target);
    trial.success = trial.endpointError <= trial.targetWidth / 2;
    trial.pathLengthRaw = calculatePathLength(trial.rawPath);
    trial.pathLengthVirtual = calculatePathLength(trial.virtualPath);
    trial.corrections = calculateCorrections(trial.virtualPath);
    trial.initialAngleError = calculateInitialAngleError(trial.rawPath, trial.targetAngle);
    trial.transitionTime = trial.transitionAt ? trial.transitionAt - trial.startedAt : null;

    state.trials.push({ ...trial });
    state.completedTrials += 1;
    state.currentTrial = null;
    state.rawPointer = null;
    state.virtualPointer = { ...START };
    updateReadout(trial);
    updateProgress();
    updateControls();
    drawArena();

    state.advanceTimer = window.setTimeout(advanceAfterTrial, 550);
  }

  function advanceAfterTrial() {
    state.advanceTimer = null;
    const phase = currentPhase();
    const lastTrialInBlock = state.trialInBlock + 1 >= state.settings.trialsPerBlock;

    if (!lastTrialInBlock) {
      state.trialInBlock += 1;
      prepareTrial();
      return;
    }

    const lastBlockInPhase = state.blockInPhase + 1 >= phase.blocks;
    if (!lastBlockInPhase) {
      state.blockInPhase += 1;
      state.trialInBlock = 0;
      showBlockBreak(`${phase.label} ${state.blockInPhase}ブロック目が終了しました。`, "短い休憩を取り、次のブロックへ進んでください。", prepareNextBlock);
      return;
    }

    const hasNextPhase = state.phaseIndex + 1 < PHASES.length;
    if (hasNextPhase) {
      const finishedPhase = phase.label;
      state.phaseIndex += 1;
      state.blockInPhase = 0;
      state.trialInBlock = 0;
      showBlockBreak(`${finishedPhase}が終了しました。`, `次は${currentPhase().label}です。準備ができたら続けてください。`, prepareNextBlock);
      return;
    }

    finishSession();
  }

  function showBlockBreak(title, body, action) {
    setSessionState("break");
    showOverlay(title, body, "次へ進む", action);
    ui.arenaHint.textContent = "休憩中です。次へ進むボタンを押してください。";
    updateProgress();
  }

  function prepareNextBlock() {
    if (state.sessionState !== "break") return;
    setSessionState("running");
    hideOverlay();
    prepareTrial();
  }

  function finishSession() {
    state.sessionFinishedAt = new Date().toISOString();
    setSessionState("complete");
    ui.arenaHint.textContent = "セッションが終了しました。結果を確認し、CSVまたはJSONを保存できます。";
    ui.resultsPanel.hidden = false;
    renderResults();
    showOverlay(
      "セッション完了",
      `全${state.trials.length}試行が終了しました。必要なデータを保存してからリセットしてください。`,
      "結果を確認",
      () => {
        hideOverlay();
        ui.resultsPanel.scrollIntoView({ behavior: "smooth", block: "start" });
      },
    );
    updateProgress();
    updateReadout();
    drawArena();
  }

  function calculatePathLength(path) {
    let total = 0;
    for (let index = 1; index < path.length; index += 1) {
      total += distance(path[index - 1], path[index]);
    }
    return total;
  }

  function calculateCorrections(path) {
    let corrections = 0;
    for (let index = 2; index < path.length; index += 1) {
      const a = path[index - 1];
      const b = path[index];
      const before = path[index - 2];
      const v1 = { x: a.x - before.x, y: a.y - before.y };
      const v2 = { x: b.x - a.x, y: b.y - a.y };
      const len1 = Math.hypot(v1.x, v1.y);
      const len2 = Math.hypot(v2.x, v2.y);
      if (len1 < 1 || len2 < 1) continue;
      const cosine = clamp((v1.x * v2.x + v1.y * v2.y) / (len1 * len2), -1, 1);
      if (Math.acos(cosine) > Math.PI / 3) corrections += 1;
    }
    return corrections;
  }

  function calculateInitialAngleError(path, targetAngle) {
    if (path.length < 2) return NaN;
    const first = path.find((point) => distance(point, START) >= 8);
    if (!first) return NaN;
    const angle = Math.atan2(first.y - START.y, first.x - START.x);
    let difference = angle - targetAngle;
    while (difference > Math.PI) difference -= Math.PI * 2;
    while (difference < -Math.PI) difference += Math.PI * 2;
    return (difference * 180) / Math.PI;
  }

  function rotateVector(vector, angleRadians) {
    const cosine = Math.cos(angleRadians);
    const sine = Math.sin(angleRadians);
    return {
      x: vector.x * cosine - vector.y * sine,
      y: vector.x * sine + vector.y * cosine,
    };
  }

  function updateVirtualPointer() {
    const trial = state.currentTrial;
    if (!state.rawPointer || !trial) return;
    if (trial.phaseKey !== "adaptation" || !trial.transitionOccurred) {
      state.virtualPointer = { ...state.rawPointer };
      return;
    }

    if (trial.perturbationMode === "reverse" || trial.perturbationMode === "rotate") {
      const originRaw = trial.perturbationOriginRaw || state.rawPointer;
      const originVirtual = trial.perturbationOriginVirtual || originRaw;
      const displacement = {
        x: state.rawPointer.x - originRaw.x,
        y: state.rawPointer.y - originRaw.y,
      };
      const angleDegrees = trial.perturbationAngleDeg ?? 0;
      const rotated = rotateVector(displacement, (angleDegrees * Math.PI) / 180);
      state.virtualPointer = {
        x: clamp(originVirtual.x + rotated.x, 0, canvas.width),
        y: clamp(originVirtual.y + rotated.y, 0, canvas.height),
      };
      return;
    }

    const response = 0.42 - state.settings.lagStrength * 0.32;
    state.virtualPointer.x = lerp(state.virtualPointer.x, state.rawPointer.x, response);
    state.virtualPointer.y = lerp(state.virtualPointer.y, state.rawPointer.y, response);
  }

  function mean(rows, key) {
    const values = rows.map((row) => row[key]).filter(Number.isFinite);
    return values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : NaN;
  }

  function calculateFittsSlope(rows) {
    const valid = rows.filter((row) => Number.isFinite(row.fittsId) && Number.isFinite(row.movementTime));
    if (valid.length < 3) return NaN;
    const meanX = mean(valid, "fittsId");
    const meanY = mean(valid, "movementTime");
    let numerator = 0;
    let denominator = 0;
    valid.forEach((row) => {
      numerator += (row.fittsId - meanX) * (row.movementTime - meanY);
      denominator += (row.fittsId - meanX) ** 2;
    });
    return denominator > 0 ? numerator / denominator : NaN;
  }

  function getBlockResults() {
    const grouped = new Map();
    state.trials.forEach((trial) => {
      const key = `${trial.phaseIndex}-${trial.blockIndex}`;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(trial);
    });
    return [...grouped.values()].map((rows) => ({
      phaseIndex: rows[0].phaseIndex,
      phaseLabel: rows[0].phaseLabel,
      blockIndex: rows[0].blockIndex,
      n: rows.length,
      successRate: successRate(rows),
      meanMovementTime: mean(rows, "movementTime"),
      meanEndpointError: mean(rows, "endpointError"),
      fittsSlope: calculateFittsSlope(rows),
    }));
  }

  function renderResults() {
    const results = getBlockResults();
    ui.resultsBody.innerHTML = results.map((result) => `
      <tr>
        <td>${result.phaseLabel}</td>
        <td>${result.blockIndex + 1}</td>
        <td>${formatPercent(result.successRate)}</td>
        <td>${formatMs(result.meanMovementTime)}</td>
        <td>${formatNumber(result.meanEndpointError, 1)} px</td>
        <td>${Number.isFinite(result.fittsSlope) ? `${result.fittsSlope.toFixed(1)} ms/bit` : "—"}</td>
      </tr>
    `).join("");
    const condition = state.settings
      ? conditionLabel(
        state.settings.perturbationMode,
        effectivePerturbationAngle(state.settings.perturbationMode, state.settings.rotationAngle),
      )
      : "—";
    ui.resultSummary.textContent = `条件：${condition} / 成功率 ${formatPercent(successRate(state.trials))} / ${state.trials.length}試行`;
  }

  function csvCell(value) {
    if (value === null || value === undefined) return "";
    const text = typeof value === "string" ? value : String(value);
    return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
  }

  function downloadBlob(content, filename, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function safeFilename() {
    return (state.settings?.participantId || "participant").replace(/[^a-zA-Z0-9_-]/g, "_");
  }

  function downloadCsv() {
    const columns = [
      "sessionTrial", "phaseIndex", "phaseKey", "phaseLabel", "blockIndex", "trialIndex",
      "perturbationMode", "perturbationAngleDeg", "targetX", "targetY", "targetWidth", "amplitude", "fittsId", "targetAngle",
      "movementTime", "transitionOccurred", "transitionTime", "rawEndX", "rawEndY",
      "virtualEndX", "virtualEndY", "rawEndpointError", "endpointError", "success",
      "transitionRawX", "transitionRawY", "transitionVirtualX", "transitionVirtualY",
      "pathLengthRaw", "pathLengthVirtual", "corrections", "initialAngleError", "rawPath", "virtualPath",
    ];
    const lines = [columns.join(",")];
    state.trials.forEach((trial) => {
      lines.push(columns.map((column) => {
        const value = column === "rawPath" || column === "virtualPath" ? JSON.stringify(trial[column]) : trial[column];
        return csvCell(value);
      }).join(","));
    });
    downloadBlob(`\uFEFF${lines.join("\n")}`, `${safeFilename()}_mouse_mismatch_trials.csv`, "text/csv;charset=utf-8");
  }

  function downloadJson() {
    const payload = {
      metadata: {
        app: "mouse-mismatch-experiment",
        version: "0.2.0",
        participantId: state.settings?.participantId || null,
        sessionStartedAt: state.sessionStartedAt,
        sessionFinishedAt: state.sessionFinishedAt,
        rngSeed: state.rngSeed,
        settings: state.settings,
      },
      blockResults: getBlockResults(),
      trials: state.trials,
    };
    downloadBlob(JSON.stringify(payload, null, 2), `${safeFilename()}_mouse_mismatch_session.json`, "application/json;charset=utf-8");
  }

  function drawArena() {
    const width = canvas.width;
    const height = canvas.height;
    const phase = currentPhase();
    const trial = state.currentTrial;

    const background = ctx.createLinearGradient(0, 0, width, height);
    background.addColorStop(0, "#1b2b41");
    background.addColorStop(1, "#111c2d");
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.globalAlpha = 0.12;
    ctx.strokeStyle = "#91a8c3";
    ctx.lineWidth = 1;
    for (let x = 30; x < width; x += 60) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 30; y < height; y += 60) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }
    ctx.restore();

    if (trial) {
      const target = { x: trial.targetX, y: trial.targetY };
      const targetRadius = trial.targetWidth / 2;
      const targetColor = phase.key === "adaptation" ? "#f1a94a" : "#f2bf4b";

      if (state.settings?.showBoundary && phase.key === "adaptation") {
        ctx.save();
        ctx.setLineDash([6, 8]);
        ctx.strokeStyle = "rgba(242, 191, 75, 0.62)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(START.x, START.y, trial.amplitude * state.settings.transitionPoint, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      ctx.save();
      ctx.fillStyle = "rgba(242, 191, 75, 0.08)";
      ctx.strokeStyle = "rgba(242, 191, 75, 0.45)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(target.x, target.y, targetRadius + 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      ctx.save();
      ctx.fillStyle = targetColor;
      ctx.strokeStyle = "#fff0b8";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(target.x, target.y, targetRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      drawStartPoint();

      if (state.pointerDown || trial.startedAt) {
        drawCursor(state.virtualPointer, trial.transitionOccurred);
      } else if (state.rawPointer) {
        drawCursor(state.rawPointer, false, true);
      }
    } else {
      drawStartPoint();
      if (state.rawPointer && state.sessionState === "idle") drawCursor(state.rawPointer, false, true);
    }
  }

  function drawStartPoint() {
    ctx.save();
    ctx.fillStyle = "rgba(255, 255, 255, 0.08)";
    ctx.strokeStyle = "rgba(225, 236, 249, 0.88)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(START.x, START.y, START_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "rgba(225, 236, 249, 0.82)";
    ctx.beginPath();
    ctx.arc(START.x, START.y, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function drawCursor(point, transitioned, preview = false) {
    if (!point) return;
    ctx.save();
    ctx.globalAlpha = preview ? 0.42 : 1;
    ctx.fillStyle = transitioned ? "#f37b59" : "#f5f8ff";
    ctx.strokeStyle = transitioned ? "#ffd7c9" : "#8da7ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(point.x, point.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    if (transitioned) {
      ctx.globalAlpha = preview ? 0.22 : 0.5;
      ctx.strokeStyle = "#f37b59";
      ctx.beginPath();
      ctx.arc(point.x, point.y, 15, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  function animationFrame() {
    const trial = state.currentTrial;
    if (state.pointerDown && trial && trial.transitionOccurred && trial.phaseKey === "adaptation") {
      updateVirtualPointer();
      appendPathSample(trial.virtualPath, state.virtualPointer, performance.now() - trial.startedAt);
    } else if (state.pointerDown && state.rawPointer) {
      state.virtualPointer = { ...state.rawPointer };
      if (trial?.startedAt) appendPathSample(trial.virtualPath, state.virtualPointer, performance.now() - trial.startedAt);
    }
    drawArena();
    window.requestAnimationFrame(animationFrame);
  }

  ui.startButton.addEventListener("click", () => {
    if (state.sessionState === "complete") resetSession();
    startSession();
  });
  ui.pauseButton.addEventListener("click", togglePause);
  ui.resetButton.addEventListener("click", resetSession);
  ui.overlayButton.addEventListener("click", () => {
    if (typeof state.overlayAction === "function") state.overlayAction();
  });
  ui.csvButton.addEventListener("click", downloadCsv);
  ui.jsonButton.addEventListener("click", downloadJson);
  ui.perturbationMode.addEventListener("input", updateSettingReadouts);
  ui.perturbationMode.addEventListener("change", updateSettingReadouts);
  ui.rotationAngle.addEventListener("input", updateSettingReadouts);
  ui.lagStrength.addEventListener("input", updateSettingReadouts);
  ui.transitionPoint.addEventListener("input", updateSettingReadouts);

  canvas.addEventListener("pointerdown", handlePointerDown);
  canvas.addEventListener("pointermove", handlePointerMove);
  canvas.addEventListener("pointerup", handlePointerUp);
  canvas.addEventListener("pointercancel", handlePointerCancel);
  canvas.addEventListener("contextmenu", (event) => event.preventDefault());

  updateSettingReadouts();
  setSessionState("idle");
  updateProgress();
  showIntro();
  drawArena();
  window.requestAnimationFrame(animationFrame);
})();
