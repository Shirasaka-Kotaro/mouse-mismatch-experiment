(() => {
  "use strict";

  const canvas = document.getElementById("arena");
  const ctx = canvas.getContext("2d");
  const arenaShell = document.querySelector(".arena-shell");

  const ui = {
    workspace: document.getElementById("workspace"),
    setupScreen: document.getElementById("setupScreen"),
    experimentColumn: document.getElementById("experimentColumn"),
    experimentView: document.getElementById("experimentView"),
    resultsView: document.getElementById("resultsView"),
    participantId: document.getElementById("participantId"),
    loadSettingsButton: document.getElementById("loadSettingsButton"),
    saveSettingsButton: document.getElementById("saveSettingsButton"),
    settingsStorageStatus: document.getElementById("settingsStorageStatus"),
    deviceType: document.getElementById("deviceType"),
    deviceChip: document.getElementById("deviceChip"),
    handedness: document.getElementById("handedness"),
    age: document.getElementById("age"),
    gender: document.getElementById("gender"),
    usedHand: document.getElementById("usedHand"),
    visualAcuity: document.getElementById("visualAcuity"),
    correctionWorn: document.getElementById("correctionWorn"),
    colorVisionNormal: document.getElementById("colorVisionNormal"),
    motorNeurologicalDisease: document.getElementById("motorNeurologicalDisease"),
    sleepiness: document.getElementById("sleepiness"),
    sleepinessTime: document.getElementById("sleepinessTime"),
    fingerFatigue: document.getElementById("fingerFatigue"),
    armFatigue: document.getElementById("armFatigue"),
    shoulderFatigue: document.getElementById("shoulderFatigue"),
    wristFatigue: document.getElementById("wristFatigue"),
    neckFatigue: document.getElementById("neckFatigue"),
    overallFatigue: document.getElementById("overallFatigue"),
    trialsPerBlock: document.getElementById("trialsPerBlock"),
    perturbationMode: document.getElementById("perturbationMode"),
    perturbationHelp: document.getElementById("perturbationHelp"),
    perturbationTiming: document.getElementById("perturbationTiming"),
    timingHelp: document.getElementById("timingHelp"),
    protocolCallout: document.getElementById("protocolCallout"),
    rotationAngleField: document.getElementById("rotationAngleField"),
    rotationAngle: document.getElementById("rotationAngle"),
    rotationAngleValue: document.getElementById("rotationAngleValue"),
    lagStrengthField: document.getElementById("lagStrengthField"),
    lagStrength: document.getElementById("lagStrength"),
    lagStrengthValue: document.getElementById("lagStrengthValue"),
    transitionPointField: document.getElementById("transitionPointField"),
    transitionPoint: document.getElementById("transitionPoint"),
    transitionPointValue: document.getElementById("transitionPointValue"),
    showBoundary: document.getElementById("showBoundary"),
    startButton: document.getElementById("startButton"),
    pauseButton: document.getElementById("pauseButton"),
    resetButton: document.getElementById("resetButton"),
    csvButton: document.getElementById("csvButton"),
    jsonButton: document.getElementById("jsonButton"),
    downloadGroup: document.getElementById("downloadGroup"),
    returnToSetupButton: document.getElementById("returnToSetupButton"),
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
    countdownDisplay: document.getElementById("countdownDisplay"),
    overlayButton: document.getElementById("overlayButton"),
    resultsPanel: document.getElementById("resultsPanel"),
    resultsBody: document.getElementById("resultsBody"),
    resultSummary: document.getElementById("resultSummary"),
    resultParticipantSummary: document.getElementById("resultParticipantSummary"),
    analysisPanel: document.getElementById("analysisPanel"),
    mouseCsvInput: document.getElementById("mouseCsvInput"),
    pencilCsvInput: document.getElementById("pencilCsvInput"),
    mouseFileName: document.getElementById("mouseFileName"),
    pencilFileName: document.getElementById("pencilFileName"),
    analysisPhase: document.getElementById("analysisPhase"),
    analysisMetric: document.getElementById("analysisMetric"),
    analysisWindow: document.getElementById("analysisWindow"),
    drawAnalysisButton: document.getElementById("drawAnalysisButton"),
    clearAnalysisButton: document.getElementById("clearAnalysisButton"),
    analysisStatus: document.getElementById("analysisStatus"),
    adaptationChart: document.getElementById("adaptationChart"),
    analysisSummaryBody: document.getElementById("analysisSummaryBody"),
    trajectorySource: document.getElementById("trajectorySource"),
    trajectoryPhase: document.getElementById("trajectoryPhase"),
    trajectoryTrial: document.getElementById("trajectoryTrial"),
    drawTrajectoryButton: document.getElementById("drawTrajectoryButton"),
    trajectoryStatus: document.getElementById("trajectoryStatus"),
    trajectoryChart: document.getElementById("trajectoryChart"),
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
  const DEVICE_LABELS = {
    mouse: "PCマウス",
    pencil: "iPadタッチペン",
  };
  const HANDEDNESS_LABELS = {
    right: "右利き",
    left: "左利き",
    ambidextrous: "両利き",
    prefer_not_to_say: "回答しない",
  };
  const GENDER_LABELS = {
    male: "男性",
    female: "女性",
    other: "その他",
    prefer_not_to_say: "回答しない",
  };
  const USED_HAND_LABELS = {
    right: "右手",
    left: "左手",
    both: "両手（試行により変更）",
  };
  const VISUAL_ACUITY_LABELS = {
    normal: "正常",
    corrected: "矯正（眼鏡・コンタクト）",
  };
  const YES_NO_LABELS = {
    yes: "はい",
    no: "いいえ",
  };
  const MOTOR_NEUROLOGICAL_LABELS = {
    none: "なし",
    present: "あり",
  };
  const FATIGUE_FIELD_IDS = [
    "fingerFatigue",
    "armFatigue",
    "shoulderFatigue",
    "wristFatigue",
    "neckFatigue",
    "overallFatigue",
  ];
  const SETTINGS_STORAGE_KEY = "mouse-mismatch-experiment-settings-v1";
  const PERTURBATION_TIMING_HELP = {
    "mid-trial": "動作途中から変化させ、1回の動作中のオンライン修正を測定します。",
    "trial-start": "各適応試行の開始時から変化させ、試行を重ねた適応曲線を測定します。",
  };
  const PERTURBATION_TIMING_CALLOUTS = {
    "mid-trial": "適応フェーズでは、動作の途中から設定した摂動が始まります。画面上の小さなカーソルだけを見て操作してください。",
    "trial-start": "適応フェーズでは、各試行の開始時から設定した摂動が始まります。画面上の小さなカーソルだけを見て操作してください。",
  };
  const ANALYSIS_METRICS = {
    endpointNormalized: { label: "正規化終点誤差", unit: "ターゲット幅単位" },
    directionError: { label: "方向誤差", unit: "°" },
    movementTime: { label: "移動時間", unit: "ms" },
    pathLengthRatio: { label: "実軌道長比", unit: "倍" },
    corrections: { label: "修正回数", unit: "回" },
    successRate: { label: "成功率", unit: "%" },
    cursorMouseGap: { label: "マウス–カーソル距離", unit: "px" },
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
    countdownTimer: null,
    overlayAction: null,
    analysisDatasets: {
      mouse: null,
      pencil: null,
    },
  };
  const runtimeSettingsProfiles = Object.create(null);

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

  function readChoiceValue(control) {
    if (!control) return "";
    if (control.dataset?.radioGroup !== undefined) {
      return control.querySelector('input[type="radio"]:checked')?.value || "";
    }
    return control.value ?? "";
  }

  function setChoiceValue(control, value) {
    if (!control) return;
    const stringValue = value === undefined || value === null ? "" : String(value);
    if (control.dataset?.radioGroup !== undefined) {
      control.querySelectorAll('input[type="radio"]').forEach((input) => {
        input.checked = input.value === stringValue;
      });
      return;
    }
    if ([...control.options].some((option) => option.value === stringValue)) control.value = stringValue;
  }

  function setControlDisabled(control, disabled) {
    if (!control) return;
    if (control.dataset?.radioGroup !== undefined) {
      control.querySelectorAll('input[type="radio"]').forEach((input) => {
        input.disabled = disabled;
      });
      return;
    }
    control.disabled = disabled;
  }

  function focusControl(control) {
    if (!control) return;
    if (control.dataset?.radioGroup !== undefined) {
      control.querySelector('input[type="radio"]')?.focus();
      return;
    }
    control.focus();
  }

  function readSettings() {
    return {
      participantId: ui.participantId.value.trim() || "P001",
      deviceType: ui.deviceType.value,
      handedness: readChoiceValue(ui.handedness),
      handednessLabel: HANDEDNESS_LABELS[readChoiceValue(ui.handedness)] || "",
      age: ui.age.value === "na" || ui.age.value === "" ? null : Number(ui.age.value),
      gender: readChoiceValue(ui.gender),
      genderLabel: GENDER_LABELS[readChoiceValue(ui.gender)] || "",
      usedHand: readChoiceValue(ui.usedHand),
      usedHandLabel: USED_HAND_LABELS[readChoiceValue(ui.usedHand)] || "",
      visualAcuity: readChoiceValue(ui.visualAcuity),
      visualAcuityLabel: VISUAL_ACUITY_LABELS[readChoiceValue(ui.visualAcuity)] || "",
      correctionWorn: readChoiceValue(ui.correctionWorn),
      correctionWornLabel: YES_NO_LABELS[readChoiceValue(ui.correctionWorn)] || "",
      colorVisionNormal: readChoiceValue(ui.colorVisionNormal),
      colorVisionNormalLabel: YES_NO_LABELS[readChoiceValue(ui.colorVisionNormal)] || "",
      motorNeurologicalDisease: readChoiceValue(ui.motorNeurologicalDisease),
      motorNeurologicalDiseaseLabel: MOTOR_NEUROLOGICAL_LABELS[readChoiceValue(ui.motorNeurologicalDisease)] || "",
      sleepiness: readChoiceValue(ui.sleepiness) === "" ? null : Number(readChoiceValue(ui.sleepiness)),
      sleepinessTime: ui.sleepinessTime.value,
      fingerFatigue: readChoiceValue(ui.fingerFatigue) === "" ? null : Number(readChoiceValue(ui.fingerFatigue)),
      armFatigue: readChoiceValue(ui.armFatigue) === "" ? null : Number(readChoiceValue(ui.armFatigue)),
      shoulderFatigue: readChoiceValue(ui.shoulderFatigue) === "" ? null : Number(readChoiceValue(ui.shoulderFatigue)),
      wristFatigue: readChoiceValue(ui.wristFatigue) === "" ? null : Number(readChoiceValue(ui.wristFatigue)),
      neckFatigue: readChoiceValue(ui.neckFatigue) === "" ? null : Number(readChoiceValue(ui.neckFatigue)),
      overallFatigue: readChoiceValue(ui.overallFatigue) === "" ? null : Number(readChoiceValue(ui.overallFatigue)),
      trialsPerBlock: Number(ui.trialsPerBlock.value),
      perturbationMode: ui.perturbationMode.value,
      perturbationTiming: ui.perturbationTiming.value,
      rotationAngle: Number(ui.rotationAngle.value),
      lagStrength: Number(ui.lagStrength.value) / 100,
      transitionPoint: Number(ui.transitionPoint.value) / 100,
      showBoundary: ui.showBoundary.checked,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
      phases: PHASES.map((phase) => ({ ...phase })),
    };
  }

  function populateAgeOptions() {
    const notAnsweredOption = ui.age.querySelector('option[value="na"]');
    if (!notAnsweredOption || ui.age.options.length > 2) return;
    for (let age = 10; age <= 100; age += 1) {
      const option = document.createElement("option");
      option.value = String(age);
      option.textContent = `${age}歳`;
      ui.age.insertBefore(option, notAnsweredOption);
    }
  }

  function populateRatingOptions(group, minimum, maximum, lowLabel, highLabel) {
    if (!group || group.dataset.ratingReady === "true") return;
    if (group.querySelector('input[type="radio"]')) {
      if (!group.querySelector(".rating-caption")) {
        const caption = document.createElement("div");
        caption.className = "rating-caption";
        caption.innerHTML = `<span>${lowLabel}</span><span>${highLabel}</span>`;
        group.appendChild(caption);
      }
      group.dataset.ratingReady = "true";
      return;
    }
    const options = document.createElement("div");
    options.className = "rating-options";
    const name = `${group.id}-rating`;
    for (let value = minimum; value <= maximum; value += 1) {
      const inputId = `${group.id}-${value}`;
      const input = document.createElement("input");
      input.type = "radio";
      input.name = name;
      input.value = String(value);
      input.id = inputId;
      const label = document.createElement("label");
      label.className = "rating-option";
      label.htmlFor = inputId;
      label.innerHTML = `<span>${value}</span>`;
      options.append(input, label);
    }
    group.appendChild(options);
    const caption = document.createElement("div");
    caption.className = "rating-caption";
    caption.innerHTML = `<span>${lowLabel}</span><span>${highLabel}</span>`;
    group.appendChild(caption);
    group.dataset.ratingReady = "true";
  }

  function populateStateScaleOptions() {
    populateRatingOptions(ui.sleepiness, 1, 9, "目覚めている", "とても眠い");
    FATIGUE_FIELD_IDS.forEach((fieldId) => populateRatingOptions(ui[fieldId], 1, 5, "なし", "非常に高い"));
  }

  function readPersistentSettingsProfiles() {
    try {
      const saved = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
      if (!saved) return {};
      const parsed = JSON.parse(saved);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
    } catch (error) {
      return null;
    }
  }

  function readStoredSettingsProfiles() {
    const persistent = readPersistentSettingsProfiles();
    return {
      ...(persistent || {}),
      ...runtimeSettingsProfiles,
    };
  }

  function updateSettingsStorageStatus(message = "", status = "") {
    if (!ui.settingsStorageStatus) return;
    if (message) {
      ui.settingsStorageStatus.textContent = message;
      ui.settingsStorageStatus.dataset.state = status;
      return;
    }

    const participantId = ui.participantId.value.trim();
    if (!participantId) {
      ui.settingsStorageStatus.textContent = "参加者IDを入力すると、設定を保存・呼び出しできます。";
      ui.settingsStorageStatus.dataset.state = "";
      return;
    }

    const persistentProfiles = readPersistentSettingsProfiles();
    const profiles = readStoredSettingsProfiles();
    if (persistentProfiles === null && !profiles[participantId]) {
      ui.settingsStorageStatus.textContent = "ブラウザの保存領域を利用できません。Live Server等のhttp://localhost環境で開いてください。";
      ui.settingsStorageStatus.dataset.state = "error";
      return;
    }
    if (profiles[participantId]) {
      const savedAt = profiles[participantId].savedAt ? `（${profiles[participantId].savedAt}）` : "";
      ui.settingsStorageStatus.textContent = `${participantId}の保存設定があります${savedAt}。呼び出しまたは上書き保存ができます。`;
      ui.settingsStorageStatus.dataset.state = "success";
    } else {
      ui.settingsStorageStatus.textContent = `${participantId}の保存設定はありません。現在の入力内容を保存できます。`;
      ui.settingsStorageStatus.dataset.state = "";
    }
  }

  function applySavedSettings(settings) {
    if (!settings || typeof settings !== "object") return;
    if (settings.participantId !== undefined) ui.participantId.value = settings.participantId;
    setChoiceValue(ui.deviceType, settings.deviceType);
    setChoiceValue(ui.handedness, settings.handedness);
    if (settings.age === null) setChoiceValue(ui.age, "na");
    else if (settings.age !== undefined) setChoiceValue(ui.age, settings.age);
    setChoiceValue(ui.gender, settings.gender);
    setChoiceValue(ui.usedHand, settings.usedHand);
    setChoiceValue(ui.visualAcuity, settings.visualAcuity);
    setChoiceValue(ui.correctionWorn, settings.correctionWorn);
    setChoiceValue(ui.colorVisionNormal, settings.colorVisionNormal);
    setChoiceValue(ui.motorNeurologicalDisease, settings.motorNeurologicalDisease);
    if (settings.sleepiness === null) setChoiceValue(ui.sleepiness, "");
    else if (settings.sleepiness !== undefined) setChoiceValue(ui.sleepiness, settings.sleepiness);
    if (settings.sleepinessTime !== undefined) ui.sleepinessTime.value = settings.sleepinessTime || "";
    FATIGUE_FIELD_IDS.forEach((fieldId) => {
      if (settings[fieldId] === null) setChoiceValue(ui[fieldId], "");
      else if (settings[fieldId] !== undefined) setChoiceValue(ui[fieldId], settings[fieldId]);
    });
    setChoiceValue(ui.trialsPerBlock, settings.trialsPerBlock);
    setChoiceValue(ui.perturbationMode, settings.perturbationMode);
    setChoiceValue(ui.perturbationTiming, settings.perturbationTiming);
    if (settings.rotationAngle !== undefined) ui.rotationAngle.value = settings.rotationAngle;
    if (settings.lagStrength !== undefined) ui.lagStrength.value = Math.round(Number(settings.lagStrength) * 100);
    if (settings.transitionPoint !== undefined) ui.transitionPoint.value = Math.round(Number(settings.transitionPoint) * 100);
    if (settings.showBoundary !== undefined) ui.showBoundary.checked = Boolean(settings.showBoundary);
    updateSettingReadouts();
    updateSettingsStorageStatus();
  }

  function saveSettingsProfile() {
    const participantId = ui.participantId.value.trim();
    if (!participantId) {
      updateSettingsStorageStatus("参加者IDを入力してから設定を保存してください。", "error");
      ui.participantId.focus();
      return false;
    }

    const profiles = readStoredSettingsProfiles();
    const overwriting = Boolean(profiles[participantId]);
    if (overwriting && !window.confirm(`${participantId}の保存設定を現在の入力内容で上書きしますか？`)) {
      updateSettingsStorageStatus("上書き保存をキャンセルしました。", "");
      return false;
    }

    const settings = readSettings();
    settings.savedAt = new Date().toLocaleString("ja-JP");
    profiles[participantId] = settings;
    runtimeSettingsProfiles[participantId] = settings;
    try {
      window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(profiles));
      const verifiedProfiles = readPersistentSettingsProfiles();
      if (!verifiedProfiles?.[participantId] || verifiedProfiles[participantId].savedAt !== settings.savedAt) {
        throw new Error("保存後の読み戻し確認に失敗しました。");
      }
      updateSettingsStorageStatus(`${participantId}の設定を${overwriting ? "上書き保存" : "保存"}しました（保存確認済み）。`, "success");
      return true;
    } catch (error) {
      updateSettingsStorageStatus("このページ内では保持しましたが、ブラウザに永続保存できませんでした。Live Server等のhttp://localhost環境で開いてください。", "error");
      return false;
    }
  }

  function loadSettingsProfile() {
    const participantId = ui.participantId.value.trim();
    if (!participantId) {
      updateSettingsStorageStatus("参加者IDを入力してから保存設定を呼び出してください。", "error");
      ui.participantId.focus();
      return false;
    }

    const profiles = readStoredSettingsProfiles();
    if (!profiles[participantId]) {
      updateSettingsStorageStatus(`${participantId}の保存設定が見つかりません。`, "error");
      return false;
    }

    applySavedSettings(profiles[participantId]);
    updateSettingsStorageStatus(`${participantId}の保存設定を呼び出しました。必要に応じて変更して上書き保存できます。`, "success");
    return true;
  }

  function showAppScreen(screen) {
    const normalized = ["setup", "experiment", "results"].includes(screen) ? screen : "setup";
    ui.workspace.dataset.screen = normalized;
    ui.setupScreen.hidden = normalized !== "setup";
    ui.experimentColumn.hidden = normalized === "setup";
    ui.experimentView.hidden = normalized !== "experiment";
    ui.resultsView.hidden = normalized !== "results";
  }

  function validateParticipantSettings() {
    const requiredFields = [
      [ui.participantId, "参加者ID"],
      [ui.handedness, "利き手"],
      [ui.usedHand, "実験で使用した手"],
      [ui.age, "年齢"],
      [ui.gender, "性別"],
      [ui.visualAcuity, "視力"],
      [ui.correctionWorn, "矯正具の課題中装用"],
      [ui.colorVisionNormal, "色覚"],
      [ui.motorNeurologicalDisease, "運動・神経疾患"],
      [ui.sleepiness, "眠気"],
      [ui.sleepinessTime, "眠気を記入した時刻"],
      ...FATIGUE_FIELD_IDS.map((fieldId) => [ui[fieldId], `${ui[fieldId].previousElementSibling?.textContent || fieldId}の疲労度`]),
    ];
    const missing = requiredFields.find(([element]) => !String(readChoiceValue(element) || "").trim());
    if (missing) {
      const [element, label] = missing;
      showAppScreen("setup");
      updateSettingsStorageStatus(`${label}を選択または入力してください。`, "error");
      focusControl(element);
      return false;
    }
    return true;
  }

  function setSessionState(nextState) {
    state.sessionState = nextState;
    const labels = {
      idle: "準備中",
      running: "実験中",
      paused: "一時停止",
      break: "休憩",
      countdown: "開始準備",
      complete: "完了",
    };
    ui.sessionBadge.textContent = labels[nextState] || nextState;
    ui.sessionBadge.dataset.state = nextState;
    arenaShell.dataset.running = String(nextState === "running");
    updateControls();
  }

  function updateControls() {
    const active = ["running", "paused", "break", "countdown"].includes(state.sessionState);
    const canStart = state.sessionState === "idle" || state.sessionState === "complete";
    const locked = active;

    [
      ui.participantId,
      ui.loadSettingsButton,
      ui.saveSettingsButton,
      ui.deviceType,
      ui.handedness,
      ui.age,
      ui.gender,
      ui.usedHand,
      ui.visualAcuity,
      ui.correctionWorn,
      ui.colorVisionNormal,
      ui.motorNeurologicalDisease,
      ui.sleepiness,
      ui.sleepinessTime,
      ui.fingerFatigue,
      ui.armFatigue,
      ui.shoulderFatigue,
      ui.wristFatigue,
      ui.neckFatigue,
      ui.overallFatigue,
      ui.trialsPerBlock,
      ui.perturbationMode,
      ui.perturbationTiming,
      ui.rotationAngle,
      ui.lagStrength,
      ui.transitionPoint,
      ui.showBoundary,
    ].forEach((element) => {
      setControlDisabled(element, locked);
    });

    ui.startButton.disabled = !canStart;
    ui.startButton.textContent = state.sessionState === "complete" ? "新しいセッション" : "実験を開始";
    ui.pauseButton.disabled = !["running", "paused"].includes(state.sessionState) || state.pointerDown;
    ui.pauseButton.textContent = state.sessionState === "paused" ? "再開" : "一時停止";
    ui.downloadGroup.hidden = state.trials.length === 0;
  }

  function updateSettingReadouts() {
    const device = ui.deviceType.value;
    ui.deviceChip.textContent = device === "pencil" ? "PENCIL" : "MOUSE";
    ui.lagStrengthValue.textContent = `${ui.lagStrength.value}%`;
    ui.transitionPointValue.textContent = `${ui.transitionPoint.value}%`;
    ui.rotationAngleValue.textContent = formatRotationAngle(Number(ui.rotationAngle.value));
    const mode = ui.perturbationMode.value;
    const timing = ui.perturbationTiming.value;
    ui.perturbationHelp.textContent = PERTURBATION_HELP[mode] || PERTURBATION_HELP.heavy;
    ui.timingHelp.textContent = PERTURBATION_TIMING_HELP[timing] || PERTURBATION_TIMING_HELP["mid-trial"];
    ui.protocolCallout.textContent = PERTURBATION_TIMING_CALLOUTS[timing] || PERTURBATION_TIMING_CALLOUTS["mid-trial"];
    ui.lagStrengthField.hidden = mode !== "heavy";
    ui.rotationAngleField.hidden = mode !== "rotate";
    ui.transitionPointField.hidden = timing !== "mid-trial";
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
      deviceType: state.settings.deviceType,
      deviceLabel: DEVICE_LABELS[state.settings.deviceType] || state.settings.deviceType,
      handedness: state.settings.handedness,
      handednessLabel: state.settings.handednessLabel,
      age: state.settings.age,
      gender: state.settings.gender,
      genderLabel: state.settings.genderLabel,
      usedHand: state.settings.usedHand,
      usedHandLabel: state.settings.usedHandLabel,
      visualAcuity: state.settings.visualAcuity,
      visualAcuityLabel: state.settings.visualAcuityLabel,
      correctionWorn: state.settings.correctionWorn,
      correctionWornLabel: state.settings.correctionWornLabel,
      colorVisionNormal: state.settings.colorVisionNormal,
      colorVisionNormalLabel: state.settings.colorVisionNormalLabel,
      motorNeurologicalDisease: state.settings.motorNeurologicalDisease,
      motorNeurologicalDiseaseLabel: state.settings.motorNeurologicalDiseaseLabel,
      sleepiness: state.settings.sleepiness,
      sleepinessTime: state.settings.sleepinessTime,
      fingerFatigue: state.settings.fingerFatigue,
      armFatigue: state.settings.armFatigue,
      shoulderFatigue: state.settings.shoulderFatigue,
      wristFatigue: state.settings.wristFatigue,
      neckFatigue: state.settings.neckFatigue,
      overallFatigue: state.settings.overallFatigue,
      perturbationMode: state.settings.perturbationMode,
      perturbationAngleDeg: effectivePerturbationAngle(state.settings.perturbationMode, state.settings.rotationAngle),
      perturbationTiming: state.settings.perturbationTiming,
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
    ui.overlayButton.hidden = false;
    ui.countdownDisplay.hidden = true;
    ui.countdownDisplay.textContent = "";
    state.overlayAction = action;
    ui.arenaOverlay.hidden = false;
  }

  function hideOverlay() {
    ui.arenaOverlay.hidden = true;
    ui.overlayButton.hidden = false;
    ui.countdownDisplay.hidden = true;
    ui.countdownDisplay.textContent = "";
    state.overlayAction = null;
  }

  function clearCountdownTimer() {
    if (state.countdownTimer) window.clearInterval(state.countdownTimer);
    state.countdownTimer = null;
  }

  function startCountdown(title, body, action) {
    clearCountdownTimer();
    setSessionState("countdown");
    showOverlay(title, body, "", action);
    ui.overlayButton.hidden = true;
    ui.countdownDisplay.hidden = false;

    let remaining = 3;
    ui.countdownDisplay.textContent = String(remaining);
    state.countdownTimer = window.setInterval(() => {
      remaining -= 1;
      if (remaining > 0) {
        ui.countdownDisplay.textContent = String(remaining);
        return;
      }
      clearCountdownTimer();
      hideOverlay();
      action();
    }, 1000);
  }

  function showIntro() {
    showAppScreen("setup");
    hideOverlay();
    updateSettingsStorageStatus();
    ui.arenaHint.textContent = "設定を入力してから、実験を開始してください。";
  }

  function startSession() {
    if (state.sessionState === "running") return;
    if (!validateParticipantSettings()) return;
    if (state.advanceTimer) window.clearTimeout(state.advanceTimer);
    clearCountdownTimer();

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
    ui.resultParticipantSummary.textContent = "実験終了後の結果とデータ保存";
    showAppScreen("experiment");
    startCountdown(
      "実験開始の準備",
      "3秒後に最初の試行を開始します。開始円にマウスまたはタッチペンを準備してください。",
      () => {
        setSessionState("running");
        prepareTrial();
      },
    );
  }

  function resetSession() {
    if (state.advanceTimer) window.clearTimeout(state.advanceTimer);
    clearCountdownTimer();
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
    ui.resultParticipantSummary.textContent = "実験終了後の結果とデータ保存";
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
    if (state.currentTrial.phaseKey === "adaptation" && state.settings.perturbationTiming === "trial-start") {
      activatePerturbationAt(point, state.currentTrial);
    }
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
    if (trial.phaseKey !== "adaptation" || trial.transitionOccurred || trial.perturbationTiming === "trial-start") return;
    if (movementProgress(point, trial) < state.settings.transitionPoint) return;

    activatePerturbationAt(point, trial);
  }

  function activatePerturbationAt(point, trial) {
    if (trial.transitionOccurred) return;
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
    trial.pathLengthRatioRaw = trial.amplitude > 0 ? trial.pathLengthRaw / trial.amplitude : NaN;
    trial.pathLengthRatioVirtual = trial.amplitude > 0 ? trial.pathLengthVirtual / trial.amplitude : NaN;
    trial.corrections = calculateCorrections(trial.virtualPath);
    trial.initialAngleError = calculateInitialAngleError(trial.rawPath, trial.targetAngle);
    trial.postTransitionAngleError = calculatePostTransitionAngleError(trial.rawPath, trial);
    trial.meanCursorMouseGap = calculateMeanCursorMouseGap(trial.rawPath, trial.virtualPath);
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
    startCountdown(
      "次のブロックの準備",
      "3秒後に次のブロックを開始します。開始円にマウスまたはタッチペンを準備してください。",
      () => {
        setSessionState("running");
        prepareTrial();
      },
    );
  }

  function finishSession() {
    state.sessionFinishedAt = new Date().toISOString();
    setSessionState("complete");
    ui.arenaHint.textContent = "セッションが終了しました。結果を確認し、CSVまたはJSONを保存できます。";
    ui.resultsPanel.hidden = false;
    renderResults();
    ui.resultParticipantSummary.textContent = `${state.settings?.participantId || "—"} / ${DEVICE_LABELS[state.settings?.deviceType] || "—"}：全${state.trials.length}試行。CSV・JSONを保存し、軌道と適応曲線を確認できます。`;
    hideOverlay();
    showAppScreen("results");
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
    return calculateAngleError(path, START, targetAngle, 0);
  }

  function calculateAngleError(path, origin, targetAngle, minimumTime = 0) {
    if (path.length < 2) return NaN;
    const first = path.find((point) => point.t >= minimumTime && distance(point, origin) >= 8);
    if (!first) return NaN;
    const angle = Math.atan2(first.y - origin.y, first.x - origin.x);
    let difference = angle - targetAngle;
    while (difference > Math.PI) difference -= Math.PI * 2;
    while (difference < -Math.PI) difference += Math.PI * 2;
    return (difference * 180) / Math.PI;
  }

  function calculatePostTransitionAngleError(path, trial) {
    if (!trial.transitionOccurred || !trial.transitionAt || !trial.startedAt
      || !Number.isFinite(trial.transitionRawX) || !Number.isFinite(trial.transitionRawY)) {
      return NaN;
    }
    const transitionTime = trial.transitionAt - trial.startedAt;
    return calculateAngleError(
      path,
      { x: trial.transitionRawX, y: trial.transitionRawY },
      trial.targetAngle,
      transitionTime,
    );
  }

  function interpolatePathPoint(path, time) {
    if (!path.length) return null;
    if (time <= path[0].t) return path[0];
    const last = path[path.length - 1];
    if (time >= last.t) return last;
    for (let index = 1; index < path.length; index += 1) {
      const next = path[index];
      if (next.t < time) continue;
      const previous = path[index - 1];
      const duration = next.t - previous.t;
      const amount = duration > 0 ? (time - previous.t) / duration : 0;
      return {
        x: lerp(previous.x, next.x, amount),
        y: lerp(previous.y, next.y, amount),
      };
    }
    return last;
  }

  function calculateMeanCursorMouseGap(rawPath, virtualPath) {
    if (!rawPath.length || !virtualPath.length) return NaN;
    const gaps = rawPath.map((point) => {
      const virtual = interpolatePathPoint(virtualPath, point.t);
      return virtual ? distance(point, virtual) : NaN;
    }).filter(Number.isFinite);
    return gaps.length ? gaps.reduce((sum, value) => sum + value, 0) / gaps.length : NaN;
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
    const participant = (state.settings?.participantId || "participant").replace(/[^a-zA-Z0-9_-]/g, "_");
    const device = state.settings?.deviceType === "pencil" ? "pencil" : "mouse";
    return `${participant}_${device}`;
  }

  function downloadCsv() {
    const columns = [
      "sessionTrial", "deviceType", "deviceLabel", "handedness", "handednessLabel", "age", "gender", "genderLabel", "usedHand", "usedHandLabel",
      "visualAcuity", "visualAcuityLabel", "correctionWorn", "correctionWornLabel", "colorVisionNormal", "colorVisionNormalLabel",
      "motorNeurologicalDisease", "motorNeurologicalDiseaseLabel", "sleepiness", "sleepinessTime",
      "fingerFatigue", "armFatigue", "shoulderFatigue", "wristFatigue", "neckFatigue", "overallFatigue",
      "phaseIndex", "phaseKey", "phaseLabel", "blockIndex", "trialIndex",
      "perturbationMode", "perturbationAngleDeg", "targetX", "targetY", "targetWidth", "amplitude", "fittsId", "targetAngle",
      "perturbationTiming",
      "movementTime", "transitionOccurred", "transitionTime", "rawEndX", "rawEndY",
      "virtualEndX", "virtualEndY", "rawEndpointError", "endpointError", "success",
      "transitionRawX", "transitionRawY", "transitionVirtualX", "transitionVirtualY",
      "pathLengthRaw", "pathLengthVirtual", "pathLengthRatioRaw", "pathLengthRatioVirtual", "corrections",
      "initialAngleError", "postTransitionAngleError", "meanCursorMouseGap", "rawPath", "virtualPath",
    ];
    const lines = [columns.join(",")];
    state.trials.forEach((trial) => {
      lines.push(columns.map((column) => {
        const value = column === "rawPath" || column === "virtualPath" ? JSON.stringify(trial[column]) : trial[column];
        return csvCell(value);
      }).join(","));
    });
    downloadBlob(`\uFEFF${lines.join("\n")}`, `${safeFilename()}_mismatch_trials.csv`, "text/csv;charset=utf-8");
  }

  function downloadJson() {
    const payload = {
      metadata: {
        app: "mouse-mismatch-experiment",
        version: "0.5.0",
        participantId: state.settings?.participantId || null,
        sessionStartedAt: state.sessionStartedAt,
        sessionFinishedAt: state.sessionFinishedAt,
        rngSeed: state.rngSeed,
        settings: state.settings,
      },
      blockResults: getBlockResults(),
      trials: state.trials,
    };
    downloadBlob(JSON.stringify(payload, null, 2), `${safeFilename()}_mismatch_session.json`, "application/json;charset=utf-8");
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

      if (state.settings?.showBoundary && phase.key === "adaptation" && state.settings.perturbationTiming === "mid-trial") {
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

  function parseNumber(value) {
    if (value === null || value === undefined || String(value).trim() === "") return NaN;
    const number = Number(value);
    return Number.isFinite(number) ? number : NaN;
  }

  function parseBoolean(value) {
    return ["true", "1", "yes", "成功"].includes(String(value).trim().toLowerCase());
  }

  function parsePath(value) {
    if (!value) return [];
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed)
        ? parsed.filter((point) => Number.isFinite(Number(point.x)) && Number.isFinite(Number(point.y)))
          .map((point) => ({
            t: parseNumber(point.t),
            x: parseNumber(point.x),
            y: parseNumber(point.y),
          }))
        : [];
    } catch (error) {
      return [];
    }
  }

  function parseCsvText(text) {
    const source = String(text || "").replace(/^\uFEFF/, "");
    const rows = [];
    let row = [];
    let cell = [];
    let inQuotes = false;

    for (let index = 0; index < source.length; index += 1) {
      const character = source[index];
      if (inQuotes) {
        if (character === '"') {
          if (source[index + 1] === '"') {
            cell.push('"');
            index += 1;
          } else {
            inQuotes = false;
          }
        } else {
          cell.push(character);
        }
      } else if (character === '"' && cell.length === 0) {
        inQuotes = true;
      } else if (character === ",") {
        row.push(cell.join(""));
        cell = [];
      } else if (character === "\n") {
        row.push(cell.join(""));
        if (row.some((value) => value !== "")) rows.push(row);
        row = [];
        cell = [];
      } else if (character !== "\r") {
        cell.push(character);
      }
    }

    row.push(cell.join(""));
    if (row.some((value) => value !== "")) rows.push(row);
    if (!rows.length) return [];

    const headers = rows.shift().map((header, index) => header.trim() || `column${index}`);
    return rows.map((values) => headers.reduce((record, header, index) => {
      record[header] = values[index] ?? "";
      return record;
    }, {}));
  }

  function inferPhaseKey(row) {
    if (row.phaseKey) return row.phaseKey;
    const label = String(row.phaseLabel || "");
    if (label.includes("ベース") || label.includes("baseline")) return "baseline";
    if (label.includes("後") || label.includes("washout") || label.includes("効果")) return "washout";
    if (label.includes("適応") || label.includes("摂動") || label.includes("adaptation")) return "adaptation";
    return "unknown";
  }

  function phaseLabelForKey(phaseKey) {
    const phase = PHASES.find((candidate) => candidate.key === phaseKey);
    return phase?.label || (phaseKey === "all" ? "全フェーズ" : "不明なフェーズ");
  }

  function lastPathPoint(path) {
    return path.length ? path[path.length - 1] : null;
  }

  function normalizeAnalysisRow(rawRow, datasetKey, rowIndex) {
    const rawPath = parsePath(rawRow.rawPath);
    const virtualPath = parsePath(rawRow.virtualPath);
    const rawEnd = {
      x: parseNumber(rawRow.rawEndX),
      y: parseNumber(rawRow.rawEndY),
    };
    const virtualEnd = {
      x: parseNumber(rawRow.virtualEndX),
      y: parseNumber(rawRow.virtualEndY),
    };
    const rawLast = lastPathPoint(rawPath);
    const virtualLast = lastPathPoint(virtualPath);
    if (!Number.isFinite(rawEnd.x) && rawLast) rawEnd.x = rawLast.x;
    if (!Number.isFinite(rawEnd.y) && rawLast) rawEnd.y = rawLast.y;
    if (!Number.isFinite(virtualEnd.x) && virtualLast) virtualEnd.x = virtualLast.x;
    if (!Number.isFinite(virtualEnd.y) && virtualLast) virtualEnd.y = virtualLast.y;

    const target = {
      x: parseNumber(rawRow.targetX),
      y: parseNumber(rawRow.targetY),
    };
    const targetWidth = parseNumber(rawRow.targetWidth);
    const amplitude = parseNumber(rawRow.amplitude);
    const endpointError = Number.isFinite(parseNumber(rawRow.endpointError))
      ? parseNumber(rawRow.endpointError)
      : Number.isFinite(virtualEnd.x) && Number.isFinite(virtualEnd.y) && Number.isFinite(target.x) && Number.isFinite(target.y)
        ? distance(virtualEnd, target)
        : NaN;
    const rawEndpointError = Number.isFinite(parseNumber(rawRow.rawEndpointError))
      ? parseNumber(rawRow.rawEndpointError)
      : Number.isFinite(rawEnd.x) && Number.isFinite(rawEnd.y) && Number.isFinite(target.x) && Number.isFinite(target.y)
        ? distance(rawEnd, target)
        : NaN;
    const pathLengthRaw = Number.isFinite(parseNumber(rawRow.pathLengthRaw))
      ? parseNumber(rawRow.pathLengthRaw)
      : calculatePathLength(rawPath);
    const pathLengthVirtual = Number.isFinite(parseNumber(rawRow.pathLengthVirtual))
      ? parseNumber(rawRow.pathLengthVirtual)
      : calculatePathLength(virtualPath);
    const meanCursorMouseGap = Number.isFinite(parseNumber(rawRow.meanCursorMouseGap))
      ? parseNumber(rawRow.meanCursorMouseGap)
      : calculateMeanCursorMouseGap(rawPath, virtualPath);
    const deviceType = rawRow.deviceType || datasetKey;

    return {
      ...rawRow,
      rowIndex,
      sessionTrial: Number.isFinite(parseNumber(rawRow.sessionTrial)) ? parseNumber(rawRow.sessionTrial) : rowIndex + 1,
      phaseKey: inferPhaseKey(rawRow),
      phaseLabel: rawRow.phaseLabel || phaseLabelForKey(inferPhaseKey(rawRow)),
      blockIndex: Number.isFinite(parseNumber(rawRow.blockIndex)) ? parseNumber(rawRow.blockIndex) : 0,
      trialIndex: Number.isFinite(parseNumber(rawRow.trialIndex)) ? parseNumber(rawRow.trialIndex) : rowIndex,
      perturbationMode: rawRow.perturbationMode || "unknown",
      deviceType,
      deviceLabel: rawRow.deviceLabel || DEVICE_LABELS[deviceType] || (datasetKey === "pencil" ? DEVICE_LABELS.pencil : DEVICE_LABELS.mouse),
      targetX: target.x,
      targetY: target.y,
      targetWidth,
      amplitude,
      movementTime: parseNumber(rawRow.movementTime),
      endpointError,
      rawEndpointError,
      success: typeof rawRow.success === "boolean" ? rawRow.success : parseBoolean(rawRow.success),
      pathLengthRaw,
      pathLengthVirtual,
      pathLengthRatioRaw: Number.isFinite(parseNumber(rawRow.pathLengthRatioRaw))
        ? parseNumber(rawRow.pathLengthRatioRaw)
        : amplitude > 0 ? pathLengthRaw / amplitude : NaN,
      pathLengthRatioVirtual: Number.isFinite(parseNumber(rawRow.pathLengthRatioVirtual))
        ? parseNumber(rawRow.pathLengthRatioVirtual)
        : amplitude > 0 ? pathLengthVirtual / amplitude : NaN,
      corrections: parseNumber(rawRow.corrections),
      initialAngleError: parseNumber(rawRow.initialAngleError),
      postTransitionAngleError: parseNumber(rawRow.postTransitionAngleError),
      meanCursorMouseGap,
      rawPath,
      virtualPath,
      rawEnd,
      virtualEnd,
    };
  }

  function parseAnalysisDataset(text, datasetKey, fileName) {
    const rows = parseCsvText(text)
      .map((row, index) => normalizeAnalysisRow(row, datasetKey, index))
      .sort((a, b) => a.sessionTrial - b.sessionTrial);
    return {
      key: datasetKey,
      label: datasetKey === "pencil" ? "タッチペン" : "マウス",
      fileName,
      rows,
    };
  }

  function analysisDatasets() {
    return [state.analysisDatasets.mouse, state.analysisDatasets.pencil].filter(Boolean);
  }

  function analysisRowsForPhase(dataset, phaseKey) {
    if (!dataset) return [];
    if (phaseKey === "all") return [...dataset.rows];
    return dataset.rows.filter((row) => row.phaseKey === phaseKey);
  }

  function analysisMetricValue(row, metric) {
    switch (metric) {
      case "endpointNormalized":
        return Number.isFinite(row.endpointError) && row.targetWidth > 0 ? row.endpointError / row.targetWidth : NaN;
      case "directionError":
        return Number.isFinite(row.postTransitionAngleError) ? row.postTransitionAngleError : row.initialAngleError;
      case "movementTime":
        return row.movementTime;
      case "pathLengthRatio":
        return row.pathLengthRatioRaw;
      case "corrections":
        return row.corrections;
      case "successRate":
        return typeof row.success === "boolean" ? (row.success ? 1 : 0) : NaN;
      case "cursorMouseGap":
        return row.meanCursorMouseGap;
      default:
        return NaN;
    }
  }

  function centeredMovingAverage(values, windowSize) {
    const half = Math.floor(windowSize / 2);
    return values.map((value, index) => {
      if (!Number.isFinite(value)) return NaN;
      const start = Math.max(0, index - half);
      const end = Math.min(values.length - 1, index + half);
      const valid = values.slice(start, end + 1).filter(Number.isFinite);
      return valid.length ? valid.reduce((sum, item) => sum + item, 0) / valid.length : NaN;
    });
  }

  function buildAnalysisSeries(dataset, phaseKey, metric, windowSize) {
    const rows = analysisRowsForPhase(dataset, phaseKey);
    const values = rows.map((row) => analysisMetricValue(row, metric));
    const smoothed = centeredMovingAverage(values, windowSize);
    return {
      key: dataset.key,
      label: dataset.label,
      points: values.map((value, index) => ({
        x: index + 1,
        rawValue: value,
        smoothValue: smoothed[index],
      })),
      rows,
    };
  }

  function formatMetricValue(value, metric, digits = 2) {
    if (!Number.isFinite(value)) return "—";
    if (metric === "successRate") return `${Math.round(value * 100)}%`;
    return value.toFixed(digits);
  }

  function setAnalysisStatus(message, status = "") {
    ui.analysisStatus.textContent = message;
    ui.analysisStatus.dataset.state = status;
  }

  function analysisPalette(key) {
    return key === "pencil" ? "#e8774d" : "#3154d8";
  }

  function chartTextFont() {
    return '12px "Yu Gothic UI", "Yu Gothic", Meiryo, sans-serif';
  }

  function drawEmptyChart(canvasElement, title, message, dark = false) {
    if (!canvasElement) return;
    const context = canvasElement.getContext("2d");
    const width = canvasElement.width;
    const height = canvasElement.height;
    context.clearRect(0, 0, width, height);
    context.fillStyle = dark ? "#172334" : "#fbfcfe";
    context.fillRect(0, 0, width, height);
    context.font = chartTextFont();
    context.textAlign = "center";
    context.fillStyle = dark ? "#f8fbff" : "#142030";
    context.fillText(title, width / 2, height / 2 - 16);
    context.fillStyle = dark ? "#aebdce" : "#657386";
    context.fillText(message, width / 2, height / 2 + 14);
    context.textAlign = "left";
  }

  function drawAdaptationChart(series, metric, phaseKey, windowSize) {
    const canvasElement = ui.adaptationChart;
    const context = canvasElement.getContext("2d");
    const width = canvasElement.width;
    const height = canvasElement.height;
    const margin = { top: 78, right: 35, bottom: 78, left: 105 };
    const plotWidth = width - margin.left - margin.right;
    const plotHeight = height - margin.top - margin.bottom;
    const metricInfo = ANALYSIS_METRICS[metric] || ANALYSIS_METRICS.endpointNormalized;
    const allValues = series.flatMap((item) => item.points.map((point) => point.rawValue)).filter(Number.isFinite);
    let minValue = allValues.length ? Math.min(...allValues) : 0;
    let maxValue = allValues.length ? Math.max(...allValues) : 1;
    if (metric === "successRate") {
      minValue = 0;
      maxValue = 1;
    } else {
      const spread = maxValue - minValue;
      const padding = spread > 0 ? spread * 0.12 : Math.max(Math.abs(maxValue) * 0.12, 1);
      minValue -= padding;
      maxValue += padding;
      if (metric === "directionError") {
        minValue = Math.min(minValue, 0);
        maxValue = Math.max(maxValue, 0);
      }
    }
    if (minValue === maxValue) maxValue = minValue + 1;

    const maxTrial = Math.max(1, ...series.map((item) => item.points.length));
    const xFor = (value) => maxTrial > 1
      ? margin.left + ((value - 1) / (maxTrial - 1)) * plotWidth
      : margin.left + plotWidth / 2;
    const yFor = (value) => margin.top + ((maxValue - value) / (maxValue - minValue)) * plotHeight;

    context.clearRect(0, 0, width, height);
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
    context.font = chartTextFont();
    context.textAlign = "left";
    context.fillStyle = "#142030";
    context.font = '700 18px "Yu Gothic UI", "Yu Gothic", Meiryo, sans-serif';
    context.fillText(`運動適応曲線：${metricInfo.label}`, margin.left, 30);
    context.font = chartTextFont();
    context.fillStyle = "#657386";
    context.fillText(`フェーズ：${phaseLabelForKey(phaseKey)} / 移動平均：${windowSize === 1 ? "なし" : `${windowSize}試行`}`, margin.left, 52);

    context.strokeStyle = "#e5eaf0";
    context.lineWidth = 1;
    context.fillStyle = "#657386";
    context.textAlign = "right";
    for (let index = 0; index <= 5; index += 1) {
      const value = maxValue - ((maxValue - minValue) * index) / 5;
      const y = margin.top + (plotHeight * index) / 5;
      context.beginPath();
      context.moveTo(margin.left, y);
      context.lineTo(width - margin.right, y);
      context.stroke();
      context.fillText(formatMetricValue(value, metric, metric === "successRate" ? 0 : 2), margin.left - 11, y + 4);
    }

    const tickCount = Math.min(6, maxTrial);
    context.textAlign = "center";
    for (let index = 0; index < tickCount; index += 1) {
      const value = tickCount === 1 ? 1 : 1 + Math.round((maxTrial - 1) * index / (tickCount - 1));
      const x = xFor(value);
      context.strokeStyle = "#eef1f4";
      context.beginPath();
      context.moveTo(x, margin.top);
      context.lineTo(x, height - margin.bottom);
      context.stroke();
      context.fillStyle = "#657386";
      context.fillText(String(value), x, height - margin.bottom + 22);
    }

    context.strokeStyle = "#9eacba";
    context.lineWidth = 1.2;
    context.beginPath();
    context.moveTo(margin.left, margin.top);
    context.lineTo(margin.left, height - margin.bottom);
    context.lineTo(width - margin.right, height - margin.bottom);
    context.stroke();

    context.save();
    context.translate(22, margin.top + plotHeight / 2);
    context.rotate(-Math.PI / 2);
    context.fillStyle = "#657386";
    context.textAlign = "center";
    context.fillText(`${metricInfo.label}（${metricInfo.unit}）`, 0, 0);
    context.restore();
    context.textAlign = "center";
    context.fillStyle = "#657386";
    context.fillText("試行回数（フェーズ内）", margin.left + plotWidth / 2, height - 20);

    series.forEach((item) => {
      const color = analysisPalette(item.key);
      context.fillStyle = color;
      context.globalAlpha = 0.22;
      item.points.forEach((point) => {
        if (!Number.isFinite(point.rawValue)) return;
        context.beginPath();
        context.arc(xFor(point.x), yFor(point.rawValue), 3.2, 0, Math.PI * 2);
        context.fill();
      });
      context.globalAlpha = 1;
      context.strokeStyle = color;
      context.lineWidth = 3;
      context.lineJoin = "round";
      context.lineCap = "round";
      context.beginPath();
      let started = false;
      item.points.forEach((point) => {
        if (!Number.isFinite(point.smoothValue)) {
          started = false;
          return;
        }
        const x = xFor(point.x);
        const y = yFor(point.smoothValue);
        if (!started) {
          context.moveTo(x, y);
          started = true;
        } else {
          context.lineTo(x, y);
        }
      });
      context.stroke();
    });

    let legendX = width - margin.right;
    context.font = chartTextFont();
    context.textAlign = "right";
    series.slice().reverse().forEach((item) => {
      const label = item.label;
      const color = analysisPalette(item.key);
      const textWidth = context.measureText(label).width;
      legendX -= textWidth;
      context.fillStyle = color;
      context.fillRect(legendX - 23, 22, 17, 4);
      context.fillStyle = "#142030";
      context.fillText(label, legendX, 28);
      legendX -= 24;
    });
  }

  function renderAnalysisSummary(series, metric) {
    if (!series.length) {
      ui.analysisSummaryBody.innerHTML = `<tr><td colspan="5">表示できるデータがありません。</td></tr>`;
      return;
    }
    ui.analysisSummaryBody.innerHTML = series.map((item) => {
      const values = item.points.map((point) => point.rawValue).filter(Number.isFinite);
      const split = Math.max(1, Math.ceil(values.length / 2));
      const early = values.slice(0, Math.min(5, split));
      const late = values.slice(Math.max(0, values.length - Math.min(5, split)));
      const average = (items) => items.length ? items.reduce((sum, value) => sum + value, 0) / items.length : NaN;
      const earlyMean = average(early);
      const lateMean = average(late);
      const change = Number.isFinite(earlyMean) && Number.isFinite(lateMean) ? lateMean - earlyMean : NaN;
      return `
        <tr>
          <td>${item.label}</td>
          <td>${values.length}</td>
          <td>${formatMetricValue(earlyMean, metric)}</td>
          <td>${formatMetricValue(lateMean, metric)}</td>
          <td>${formatMetricValue(change, metric)}</td>
        </tr>
      `;
    }).join("");
  }

  function drawAnalysis() {
    const datasets = analysisDatasets();
    if (!datasets.length) {
      setAnalysisStatus("先にマウスまたはタッチペンのCSVを選択してください。", "error");
      drawEmptyChart(ui.adaptationChart, "運動適応曲線", "CSVを読み込むとここに表示されます。");
      ui.analysisSummaryBody.innerHTML = "";
      return;
    }

    const phaseKey = ui.analysisPhase.value;
    const metric = ui.analysisMetric.value;
    const windowSize = Number(ui.analysisWindow.value);
    const series = datasets.map((dataset) => buildAnalysisSeries(dataset, phaseKey, metric, windowSize));
    const validSeries = series.filter((item) => item.points.some((point) => Number.isFinite(point.rawValue)));
    if (!validSeries.length) {
      setAnalysisStatus("選択したフェーズと指標では表示できる数値がありません。", "error");
      drawEmptyChart(ui.adaptationChart, "運動適応曲線", "この条件のデータがありません。");
      ui.analysisSummaryBody.innerHTML = "";
      return;
    }

    drawAdaptationChart(validSeries, metric, phaseKey, windowSize);
    renderAnalysisSummary(validSeries, metric);
    const counts = validSeries.map((item) => `${item.label} ${item.points.filter((point) => Number.isFinite(point.rawValue)).length}試行`).join(" / ");
    setAnalysisStatus(`${ANALYSIS_METRICS[metric].label}を表示しました。${counts}。薄い点は各試行、太い線は移動平均です。`, "success");
    updateTrajectoryOptions();
  }

  function updateTrajectoryOptions() {
    const datasets = analysisDatasets();
    const availableKeys = datasets.map((dataset) => dataset.key);
    if (!availableKeys.includes(ui.trajectorySource.value) && availableKeys.length) {
      ui.trajectorySource.value = availableKeys[0];
    }
    const dataset = state.analysisDatasets[ui.trajectorySource.value];
    const rows = analysisRowsForPhase(dataset, ui.trajectoryPhase.value);
    ui.trajectoryTrial.innerHTML = "";
    if (!dataset || !rows.length) {
      ui.trajectoryTrial.disabled = true;
      ui.trajectoryTrial.innerHTML = `<option value="">該当する試行がありません</option>`;
      return;
    }
    rows.forEach((row, index) => {
      const option = document.createElement("option");
      option.value = String(index);
      option.textContent = `フェーズ内 ${index + 1}（全体 ${row.sessionTrial}）`;
      ui.trajectoryTrial.appendChild(option);
    });
    ui.trajectoryTrial.disabled = false;
  }

  function mapTrajectoryPoint(point, transform) {
    return {
      x: transform.left + (point.x - transform.minX) * transform.scale + transform.offsetX,
      y: transform.top + (point.y - transform.minY) * transform.scale + transform.offsetY,
    };
  }

  function drawTrajectoryChart(row, dataset, phaseKey, trialNumber) {
    const canvasElement = ui.trajectoryChart;
    const context = canvasElement.getContext("2d");
    const width = canvasElement.width;
    const height = canvasElement.height;
    const rawPath = row.rawPath;
    const virtualPath = row.virtualPath;
    const start = rawPath[0] || virtualPath[0];
    const target = { x: row.targetX, y: row.targetY };
    if (!start || !Number.isFinite(target.x) || !Number.isFinite(target.y) || (!rawPath.length && !virtualPath.length)) {
      drawEmptyChart(canvasElement, "軌道の比較", "この試行には軌道データがありません。", true);
      return false;
    }

    const points = [...rawPath, ...virtualPath, start, target];
    const minX = Math.min(...points.map((point) => point.x));
    const maxX = Math.max(...points.map((point) => point.x));
    const minY = Math.min(...points.map((point) => point.y));
    const maxY = Math.max(...points.map((point) => point.y));
    const worldWidth = Math.max(1, maxX - minX);
    const worldHeight = Math.max(1, maxY - minY);
    const left = 70;
    const top = 72;
    const right = 45;
    const bottom = 55;
    const plotWidth = width - left - right;
    const plotHeight = height - top - bottom;
    const scale = Math.min(plotWidth / worldWidth, plotHeight / worldHeight) * 0.88;
    const transform = {
      left,
      top,
      minX,
      minY,
      scale,
      offsetX: (plotWidth - worldWidth * scale) / 2,
      offsetY: (plotHeight - worldHeight * scale) / 2,
    };
    const toCanvas = (point) => mapTrajectoryPoint(point, transform);

    context.clearRect(0, 0, width, height);
    context.fillStyle = "#172334";
    context.fillRect(0, 0, width, height);
    context.font = chartTextFont();
    context.fillStyle = "#f8fbff";
    context.font = '700 18px "Yu Gothic UI", "Yu Gothic", Meiryo, sans-serif';
    context.fillText(`軌道比較：${dataset.label} / ${phaseLabelForKey(phaseKey)} / 試行 ${trialNumber}`, 28, 30);
    context.font = chartTextFont();
    context.fillStyle = "#aebdce";
    context.fillText(`終点誤差 ${formatMetricValue(row.endpointError, "endpointNormalized")} px / 成功 ${row.success ? "○" : "×"}`, 28, 52);

    context.strokeStyle = "rgba(174, 189, 206, 0.12)";
    context.lineWidth = 1;
    for (let x = left; x <= width - right; x += 60) {
      context.beginPath();
      context.moveTo(x, top);
      context.lineTo(x, height - bottom);
      context.stroke();
    }
    for (let y = top; y <= height - bottom; y += 60) {
      context.beginPath();
      context.moveTo(left, y);
      context.lineTo(width - right, y);
      context.stroke();
    }

    const startPoint = toCanvas(start);
    const targetPoint = toCanvas(target);
    context.save();
    context.setLineDash([7, 7]);
    context.strokeStyle = "rgba(242, 191, 75, 0.65)";
    context.beginPath();
    context.moveTo(startPoint.x, startPoint.y);
    context.lineTo(targetPoint.x, targetPoint.y);
    context.stroke();
    context.restore();

    function drawPath(path, color, dashed) {
      if (path.length < 2) return;
      context.save();
      context.strokeStyle = color;
      context.lineWidth = 4;
      context.lineJoin = "round";
      context.lineCap = "round";
      if (dashed) context.setLineDash([10, 7]);
      context.beginPath();
      path.forEach((point, index) => {
        const mapped = toCanvas(point);
        if (index === 0) context.moveTo(mapped.x, mapped.y);
        else context.lineTo(mapped.x, mapped.y);
      });
      context.stroke();
      context.restore();
    }

    drawPath(rawPath, "#70a3ff", true);
    drawPath(virtualPath, "#f2bf4b", false);

    context.fillStyle = "#f8fbff";
    context.beginPath();
    context.arc(startPoint.x, startPoint.y, 7, 0, Math.PI * 2);
    context.fill();
    context.fillStyle = "#f2bf4b";
    context.strokeStyle = "#fff0b8";
    context.lineWidth = 2;
    context.beginPath();
    context.arc(targetPoint.x, targetPoint.y, Math.max(7, (row.targetWidth || 30) * scale / 2), 0, Math.PI * 2);
    context.fill();
    context.stroke();

    if (Number.isFinite(row.transitionRawX) && Number.isFinite(row.transitionRawY)) {
      const transitionPoint = toCanvas({ x: row.transitionRawX, y: row.transitionRawY });
      context.fillStyle = "#f37b59";
      context.beginPath();
      context.arc(transitionPoint.x, transitionPoint.y, 6, 0, Math.PI * 2);
      context.fill();
    }

    context.font = chartTextFont();
    context.fillStyle = "#70a3ff";
    context.fillText("破線：実際の入力軌道", width - 255, height - 27);
    context.fillStyle = "#f2bf4b";
    context.fillText("実線：画面上のカーソル軌道", width - 255, height - 10);
    return true;
  }

  function drawTrajectory() {
    const dataset = state.analysisDatasets[ui.trajectorySource.value];
    const phaseKey = ui.trajectoryPhase.value;
    const rows = analysisRowsForPhase(dataset, phaseKey);
    const index = Number(ui.trajectoryTrial.value);
    const row = rows[index];
    if (!dataset || !row) {
      ui.trajectoryStatus.textContent = "表示するCSVと試行を選択してください。";
      ui.trajectoryStatus.dataset.state = "error";
      drawEmptyChart(ui.trajectoryChart, "軌道の比較", "CSVを読み込むとここに表示されます。", true);
      return;
    }
    const drawn = drawTrajectoryChart(row, dataset, phaseKey, index + 1);
    if (drawn) {
      ui.trajectoryStatus.textContent = `${dataset.label}・${phaseLabelForKey(phaseKey)}・フェーズ内${index + 1}試行を表示しました。`;
      ui.trajectoryStatus.dataset.state = "success";
    } else {
      ui.trajectoryStatus.textContent = "この試行には軌道データがありません。";
      ui.trajectoryStatus.dataset.state = "error";
    }
  }

  async function loadAnalysisFile(event, datasetKey, fileNameElement) {
    const file = event.target.files?.[0];
    if (!file) return;
    fileNameElement.textContent = file.name;
    try {
      const text = await file.text();
      const dataset = parseAnalysisDataset(text, datasetKey, file.name);
      if (!dataset.rows.length) throw new Error("CSVに試行データがありません。");
      state.analysisDatasets[datasetKey] = dataset;
      setAnalysisStatus(`${dataset.label}のCSVを読み込みました（${dataset.rows.length}試行）。`, "success");
      updateTrajectoryOptions();
      drawAnalysis();
    } catch (error) {
      state.analysisDatasets[datasetKey] = null;
      fileNameElement.textContent = "読み込みに失敗しました";
      setAnalysisStatus(`${datasetKey === "pencil" ? "タッチペン" : "マウス"}CSVを読み込めませんでした。CSV形式を確認してください。`, "error");
      updateTrajectoryOptions();
    }
  }

  function clearAnalysis() {
    state.analysisDatasets.mouse = null;
    state.analysisDatasets.pencil = null;
    ui.mouseCsvInput.value = "";
    ui.pencilCsvInput.value = "";
    ui.mouseFileName.textContent = "未選択";
    ui.pencilFileName.textContent = "未選択";
    ui.analysisSummaryBody.innerHTML = "";
    setAnalysisStatus("マウスとタッチペンのCSVを選択してください。");
    ui.trajectoryStatus.textContent = "実線：画面上のカーソル／破線：実際の入力軌道";
    ui.trajectoryStatus.dataset.state = "";
    updateTrajectoryOptions();
    drawEmptyChart(ui.adaptationChart, "運動適応曲線", "CSVを読み込むとここに表示されます。");
    drawEmptyChart(ui.trajectoryChart, "軌道の比較", "CSVを読み込むとここに表示されます。", true);
  }

  ui.startButton.addEventListener("click", () => {
    if (state.sessionState === "complete") resetSession();
    startSession();
  });
  ui.pauseButton.addEventListener("click", togglePause);
  ui.resetButton.addEventListener("click", resetSession);
  ui.loadSettingsButton.addEventListener("click", loadSettingsProfile);
  ui.saveSettingsButton.addEventListener("click", saveSettingsProfile);
  ui.participantId.addEventListener("input", () => updateSettingsStorageStatus());
  ui.returnToSetupButton.addEventListener("click", () => {
    if (state.sessionState === "running" || state.sessionState === "paused" || state.sessionState === "break" || state.sessionState === "countdown") return;
    setSessionState("idle");
    showIntro();
    updateProgress();
  });
  ui.overlayButton.addEventListener("click", () => {
    if (typeof state.overlayAction === "function") state.overlayAction();
  });
  ui.csvButton.addEventListener("click", downloadCsv);
  ui.jsonButton.addEventListener("click", downloadJson);
  ui.deviceType.addEventListener("input", updateSettingReadouts);
  ui.deviceType.addEventListener("change", () => {
    updateSettingReadouts();
    if (state.sessionState === "idle") showIntro();
  });
  ui.handedness.addEventListener("change", () => {
    if (state.sessionState === "idle") showIntro();
  });
  ui.age.addEventListener("change", () => {
    if (state.sessionState === "idle") showIntro();
  });
  ui.perturbationMode.addEventListener("input", updateSettingReadouts);
  ui.perturbationMode.addEventListener("change", updateSettingReadouts);
  ui.perturbationTiming.addEventListener("input", updateSettingReadouts);
  ui.perturbationTiming.addEventListener("change", () => {
    updateSettingReadouts();
    if (state.sessionState === "idle") showIntro();
  });
  ui.rotationAngle.addEventListener("input", updateSettingReadouts);
  ui.lagStrength.addEventListener("input", updateSettingReadouts);
  ui.transitionPoint.addEventListener("input", updateSettingReadouts);

  ui.mouseCsvInput.addEventListener("change", (event) => loadAnalysisFile(event, "mouse", ui.mouseFileName));
  ui.pencilCsvInput.addEventListener("change", (event) => loadAnalysisFile(event, "pencil", ui.pencilFileName));
  ui.drawAnalysisButton.addEventListener("click", drawAnalysis);
  ui.clearAnalysisButton.addEventListener("click", clearAnalysis);
  ui.analysisPhase.addEventListener("change", drawAnalysis);
  ui.analysisMetric.addEventListener("change", drawAnalysis);
  ui.analysisWindow.addEventListener("change", drawAnalysis);
  ui.trajectorySource.addEventListener("change", updateTrajectoryOptions);
  ui.trajectoryPhase.addEventListener("change", updateTrajectoryOptions);
  ui.drawTrajectoryButton.addEventListener("click", drawTrajectory);

  canvas.addEventListener("pointerdown", handlePointerDown);
  canvas.addEventListener("pointermove", handlePointerMove);
  canvas.addEventListener("pointerup", handlePointerUp);
  canvas.addEventListener("pointercancel", handlePointerCancel);
  canvas.addEventListener("contextmenu", (event) => event.preventDefault());

  populateAgeOptions();
  populateStateScaleOptions();
  updateSettingReadouts();
  setSessionState("idle");
  updateProgress();
  showIntro();
  drawArena();
  updateTrajectoryOptions();
  drawEmptyChart(ui.adaptationChart, "運動適応曲線", "CSVを読み込むとここに表示されます。");
  drawEmptyChart(ui.trajectoryChart, "軌道の比較", "CSVを読み込むとここに表示されます。", true);
  window.requestAnimationFrame(animationFrame);
})();
