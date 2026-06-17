<template>
  <main class="app-shell">
    <header class="app-header">
      <div>
        <p class="eyebrow">Rhythm Trainer</p>
        <h1>节奏听辨生成器</h1>
      </div>
    </header>

    <section class="panel settings-panel">
      <div class="section-title">
        <h2>自定义项</h2>
        <span>{{ bars }} 小节 · {{ timeSignature }} · {{ bpm }} BPM</span>
      </div>

      <div class="control-grid">
        <label class="field">
          <span>拍号</span>
          <select v-model="timeSignature">
            <option v-for="item in timeSignatures" :key="item" :value="item">{{ item }}</option>
          </select>
        </label>

        <label class="field">
          <span>音高数</span>
          <select v-model.number="pitchCount">
            <option v-for="item in pitchOptions" :key="item.value" :value="item.value">{{ item.label }}</option>
          </select>
        </label>

        <label class="field">
          <span>速度</span>
          <input v-model.number="bpm" type="number" min="40" max="220" />
        </label>

        <label class="field">
          <span>小节数：{{ bars }}</span>
          <input v-model.number="bars" type="range" min="4" max="16" step="1" />
        </label>

        <label class="field">
          <span>8 分拍播放方式</span>
          <select v-model="eighthBeatMode" :disabled="!isEighthMeter">
            <option value="dottedQuarter">附点四分音符</option>
            <option value="eighth">八分音符</option>
          </select>
        </label>
      </div>

      <div class="pattern-box">
        <div class="section-title compact">
          <h2>节奏型</h2>
          <span>从已启用的节奏型中随机抽取</span>
        </div>
      <div class="pattern-grid">
        <button
          v-for="pattern in rhythmPatterns"
          :key="pattern.id"
          class="pattern-card"
          :class="{ active: enabledPatterns[pattern.id], locked: pattern.locked }"
          @click="togglePattern(pattern)"
        >
            <span class="pattern-svg" v-html="patternSvg(pattern)"></span>
            <strong>{{ patternTitle(pattern) }}</strong>
            <small>{{ patternSubtitle(pattern) }}</small>
          </button>
        </div>
      </div>

      <div class="switch-grid">
        <label><input v-model="useAnacrusis" type="checkbox" /> 加入弱起小节</label>
        <label><input v-model="allowRests" type="checkbox" /> 休止符</label>
        <label><input v-model="useMetronome" type="checkbox" /> 节拍器</label>
        <label><input v-model="showPitchPreview" type="checkbox" /> 音高预览</label>
        <label><input v-model="showScore" type="checkbox" /> 显示五线谱</label>
      </div>

      <div class="actions">
        <button class="primary-button" @click="generateQuestion">生成题目</button>
        <span class="actions-right">
        <button class="play-button" @click="togglePlayback" :disabled="!hasQuestion">
          {{ isPlaying ? '暂停' : '播放' }}
        </button>
        <button class="danger-button" @click="stopPlayback" :disabled="!isPlaying">停止</button>
        </span>
      </div>

      <div class="status-bar">
        <span>{{ statusMessage }}</span>
        <strong v-if="showPitchPreview && selectedPitches.length > 1">{{ pitchPreviewText }}</strong>
      </div>
    </section>

    <section class="panel score-panel">
            <div class="section-title score-title">
        <div class="score-title-left">
          <h2>五线谱</h2>
          <span v-if="!showScore">已隐藏</span>
        </div>
        <div class="score-actions">
          <button class="ghost-button" @click="exportScoreImage" :disabled="!hasQuestion">导出五线谱图片</button>
          <button class="ghost-button" @click="exportAudioFile" :disabled="!hasQuestion">导出音频</button>
        </div>
      </div>
      <div class="score-paper" ref="scorePaperEl" @touchstart="handleScoreTouchStart" @touchmove.prevent="handleScoreTouchMove" @touchend="handleScoreTouchEnd" @touchcancel="handleScoreTouchEnd">
        <div class="score-viewport" :style="scoreViewportStyle">
          <div class="score-scale-layer" :style="scoreLayerStyle">
            <div v-show="showScore" ref="scoreEl" class="score-host"></div>
            <div v-if="!showScore" class="score-mask">五线谱已隐藏，可继续听辨或手动开启查看。</div>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>
<script setup>
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { Beam, Dot, Formatter, Renderer, Stave, StaveNote, StaveTie, Tuplet, Voice } from 'vexflow'
import * as Tone from 'tone'
const noteHead = (x, y, filled = true) => `<ellipse cx="${x + 1.5}" cy="${y}" rx="5" ry="3.5" transform="rotate(-18 ${x + 1.5} ${y})" fill="${filled ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="1.4"/>`
const stem = (x1, y1, x2 = x1, y2 = 6) => `<line x1="${x1 + 1}" y1="${y1}" x2="${x2 + 1}" y2="${y2}" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/>`
const beam = (x1, y1, x2, y2 = y1, width = 3) => `<line x1="${x1 + 1}" y1="${y1 - 4}" x2="${x2 + 1}" y2="${y2 - 4}" stroke="currentColor" stroke-width="${width}" stroke-linecap="butt"/>`
const flag = (x, y) => `<path d="M ${x + 1} ${y - 4} q 11 4 6 14" stroke="currentColor" stroke-width="1.4" fill="none"/>`
const dot = (x, y) => `<circle cx="${x}" cy="${y}" r="2" fill="currentColor"/>`
const svg = (body, viewBox = '0 0 92 44') => `<svg width="92" height="44" viewBox="${viewBox}" aria-hidden="true">${body}</svg>`

const timeSignatures = ['2/4', '3/4', '4/4', '3/8', '6/8']
const pitchOptions = [
  { value: 1, label: '单音' },
  { value: 3, label: '三音' },
  { value: 4, label: '四音' },
  { value: 5, label: '五音' },
  { value: 8, label: '八音' },
]
const pitchPool = [
  { key: 'a/3', tone: 'A3' },
  { key: 'b/3', tone: 'B3' },
  { key: 'c/4', tone: 'C4' },
  { key: 'd/4', tone: 'D4' },
  { key: 'e/4', tone: 'E4' },
  { key: 'f/4', tone: 'F4' },
  { key: 'g/4', tone: 'G4' },
  { key: 'a/4', tone: 'A4' },
  { key: 'b/4', tone: 'B4' },
  { key: 'c/5', tone: 'C5' },
]
const a4Pitch = { key: 'a/4', tone: 'A4' }
const rhythmPatterns = [
  {
    id: 'quarterEighth',
    label: '四分/八分',
    hint: '基础节奏',
    locked: true,
    svg: '',
  },
  {
    id: 'base',
    label: '二分/四分',
    hint: '较长时值',
    locked: false,
    svg: '',
  },
  {
    id: 'twoEight',
    label: '二八',
    hint: '两个八分音符',
    svg: svg(`${noteHead(26, 31)}${stem(32, 31)}${noteHead(58, 31)}${stem(64, 31)}${beam(32, 10, 64)}`),
  },
  {
    id: 'fourSixteen',
    label: '四十六',
    hint: '四个十六分音符',
    svg: svg(`${[18, 36, 54, 72].map((x) => `${noteHead(x, 31)}${stem(x + 6, 31)}`).join('')}${beam(24, 10, 78)}${beam(24, 16, 78, 16, 3)}`),
  },
  {
    id: 'triplet',
    label: '三连音',
    hint: '三连音',
    svg: svg(`${noteHead(16, 31)}${stem(22, 31)}${noteHead(42, 31)}${stem(48, 31)}${noteHead(68, 31)}${stem(74, 31)}${beam(22, 10, 74)}<text x="40" y="7" fill="currentColor" font-size="11" font-weight="700">3</text>`, '0 0 86 44'),
  },
  {
    id: 'frontEightBackSixteen',
    label: '前八后十六',
    hint: '前十六后八',
    svg: svg(`${noteHead(20, 31)}${stem(26, 31)}${noteHead(50, 31)}${stem(56, 31)}${noteHead(72, 31)}${stem(78, 31)}${beam(26, 10, 78)}${beam(56, 16, 78, 16, 3)}`),
  },
  {
    id: 'smallDot',
    label: '小附点',
    hint: '附点八分+十六分音符',
    svg: svg(`${noteHead(30, 31)}${stem(36, 31)}${dot(44, 30)}${noteHead(66, 31)}${stem(72, 31)}${beam(36, 10, 72)}${beam(54, 16, 72, 16, 3)}`),
  },
  {
    id: 'smallSyncopation',
    label: '小切分',
    hint: '十六分加八分加十六分',
    svg: svg(`${noteHead(20, 31)}${stem(26, 31)}${noteHead(48, 31)}${stem(54, 31)}${noteHead(74, 31)}${stem(80, 31)}${beam(26, 10, 80)}${beam(26, 16, 36, 16, 3)}${beam(68, 16, 80, 16, 3)}`),
  },
  {
    id: 'bigDot',
    label: '大附点',
    hint: '附点四分音符加八分音符',
    svg: svg(`${noteHead(30, 31)}${stem(36, 31)}${dot(45, 30)}${noteHead(68, 31)}${stem(74, 31)}${flag(74, 10)}`),
  },
  {
    id: 'bigSyncopation',
    label: '大切分',
    hint: '八分加四分加八分音符',
    svg: svg(`${noteHead(18, 31)}${stem(24, 31)}${flag(24, 10)}${noteHead(48, 31)}${stem(54, 31)}${noteHead(76, 31)}${stem(82, 31)}${flag(82, 10)}`),
  },
  {
    id: 'tie',
    label: '连音线',
    hint: '同音连线',
    svg: svg(`${noteHead(28, 31)}${stem(34, 31)}${noteHead(64, 31)}${stem(70, 31)}<path d="M 28 38 q 18 10 36 0" stroke="currentColor" stroke-width="2" fill="none"/>`),
  },
]
const bpm = ref(60)
const timeSignature = ref('4/4')
const bars = ref(4)
const pitchCount = ref(1)
const eighthBeatMode = ref('dottedQuarter')
const useAnacrusis = ref(false)
const allowRests = ref(false)
const useMetronome = ref(true)
const showPitchPreview = ref(false)
const showScore = ref(true)
const isPlaying = ref(false)
const questionBars = ref([])
const pickupBar = ref(null)
const selectedPitches = ref([])
const statusMessage = ref('请先生成题目。')
const scoreEl = ref(null)
const scorePaperEl = ref(null)
const scoreContentWidth = ref(760)
const scoreContentHeight = ref(230)
const scoreScale = ref(1)
const scoreTranslateX = ref(0)
const scoreTranslateY = ref(0)
const scoreGesture = reactive({
  active: false,
  mode: 'none',
  startDistance: 0,
  startScale: 1,
  startX: 0,
  startY: 0,
  startTranslateX: 0,
  startTranslateY: 0,
})
const MIN_SCORE_SCALE = 0.4
const MAX_SCORE_SCALE = 3.0
const scorePinch = reactive({ active: false, startDistance: 0, startScale: 1 })

const scoreViewportStyle = computed(() => ({
  width: `${scoreContentWidth.value * scoreScale.value}px`,
  height: `${scoreContentHeight.value * scoreScale.value}px`,
}))
const scoreLayerStyle = computed(() => ({
  transform: `translate3d(${scoreTranslateX.value}px, ${scoreTranslateY.value}px, 0) scale(${scoreScale.value})`,
}))
const enabledPatterns = reactive({
  quarterEighth: true,
  twoEight: true,
  fourSixteen: true,
  triplet: true,
  frontEightBackSixteen: true,
  smallDot: true,
  smallSyncopation: true,
  bigDot: true,
  bigSyncopation: true,
  tie: true,
})

let sampler = null
let fallbackSynth = null
let clickSynth = null
let pianoGain = null
let clickGain = null
let stopTimers = []

const hasQuestion = computed(() => questionBars.value.length > 0)
const isEighthMeter = computed(() => timeSignature.value.endsWith('/8'))
const flatNotes = computed(() => questionBars.value.flat())
const sortedPitches = computed(() => [...selectedPitches.value].sort((a, b) => pitchToMidi(a.tone) - pitchToMidi(b.tone)))
const pitchPreviewText = computed(() => `题目音高：${sortedPitches.value.map((p) => p.tone).join('、')}`)

function parseMeter() {
  const [top, bottom] = timeSignature.value.split('/').map(Number)
  return { top, bottom, barUnits: top * (16 / bottom) }
}

function patternTitle(pattern) {
  if (pattern.id === 'quarterEighth') return isEighthMeter.value ? '八分音符' : '四分音符'
  if (pattern.id === 'base') return isEighthMeter.value ? '四分音符' : '二分音符'
  return pattern.label
}

function patternSubtitle(pattern) {
  if (pattern.id === 'quarterEighth') return '四分/八分'
  if (pattern.id === 'base') return '二分/四分'
  return pattern.hint
}

function patternSvg(pattern) {
  if (pattern.id === 'quarterEighth') {
    return isEighthMeter.value
      ? svg(`${noteHead(46, 31)}${stem(52, 31)}${flag(52, 10)}`)
      : svg(`${noteHead(46, 31)}${stem(52, 31)}`)
  }
  if (pattern.id === 'base') {
    return isEighthMeter.value
      ? svg(`${noteHead(46, 31)}${stem(52, 31)}`)
      : svg(`${noteHead(46, 31, false)}${stem(52, 31)}`)
  }
  return pattern.svg
}

function pitchToMidi(note) {
  const names = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 }
  const match = note.match(/^([A-G])(\d)$/)
  return match ? Number(match[2]) * 12 + names[match[1]] : 0
}

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)]
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5)
}

function sumUnits(notes) {
  return notes.reduce((sum, note) => sum + (note.occupiesUnits ?? note.units), 0)
}

function togglePattern(pattern) {
  if (pattern.locked) return
  enabledPatterns[pattern.id] = !enabledPatterns[pattern.id]
  generateQuestion()
}

function getTouchDistance(t1, t2) {
  const dx = t2.clientX - t1.clientX
  const dy = t2.clientY - t1.clientY
  return Math.hypot(dx, dy)
}

function clampScoreScale(value) {
  return Math.min(MAX_SCORE_SCALE, Math.max(MIN_SCORE_SCALE, value))
}

function handleScoreTouchStart(event) {
  if (!event.touches.length) return
  scoreGesture.active = true
  if (event.touches.length === 2) {
    scoreGesture.mode = 'pinch'
    scoreGesture.startDistance = getTouchDistance(event.touches[0], event.touches[1])
    scoreGesture.startScale = scoreScale.value
    scoreGesture.startTranslateX = scoreTranslateX.value
    scoreGesture.startTranslateY = scoreTranslateY.value
    return
  }
  scoreGesture.mode = 'pan'
  scoreGesture.startX = event.touches[0].clientX
  scoreGesture.startY = event.touches[0].clientY
  scoreGesture.startTranslateX = scoreTranslateX.value
  scoreGesture.startTranslateY = scoreTranslateY.value
}

function handleScoreTouchMove(event) {
  if (!scoreGesture.active) return
  if (event.touches.length === 2 && scoreGesture.mode === 'pinch' && scoreGesture.startDistance) {
    const currentDistance = getTouchDistance(event.touches[0], event.touches[1])
    scoreScale.value = clampScoreScale(scoreGesture.startScale * (currentDistance / scoreGesture.startDistance))
    return
  }
  if (event.touches.length === 1 && scoreGesture.mode === 'pan') {
    const touch = event.touches[0]
    const paper = scorePaperEl.value
    if (!paper) return
    const margin = 150
    const totalW = scoreContentWidth.value * scoreScale.value
    const totalH = scoreContentHeight.value * scoreScale.value
    const gapW = Math.max(margin, (paper.clientWidth - totalW) / 2)
    const gapH = Math.max(margin, (paper.clientHeight - totalH) / 2)
    const minX = -(totalW + gapW - paper.clientWidth)
    const maxX = gapW
    const minY = -(totalH + gapH - paper.clientHeight)
    const maxY = gapH
    scoreTranslateX.value = Math.max(minX, Math.min(maxX, scoreGesture.startTranslateX + (touch.clientX - scoreGesture.startX)))
    scoreTranslateY.value = Math.max(minY, Math.min(maxY, scoreGesture.startTranslateY + (touch.clientY - scoreGesture.startY)))
  }
}

function handleScoreTouchEnd(event) {
  if (event.touches.length === 1) {
    scoreGesture.mode = 'pan'
    scoreGesture.startX = event.touches[0].clientX
    scoreGesture.startY = event.touches[0].clientY
    scoreGesture.startTranslateX = scoreTranslateX.value
    scoreGesture.startTranslateY = scoreTranslateY.value
    return
  }
  scoreGesture.active = false
  scoreGesture.mode = 'none'
}

function makeNote(units, pitch, patternId, extra = {}) {
  return {
    units,
    key: pitch.key,
    tone: pitch.tone,
    patternId,
    isRest: false,
    tiedToNext: false,
    ...extra,
  }
}

function makeRest(units, patternId) {
  return makeNote(units, { key: 'b/4', tone: 'REST' }, patternId, { isRest: true })
}
function makePatternCatalog() {
  const baseUnits = isEighthMeter.value ? 2 : 4
  const longUnits = isEighthMeter.value ? 4 : 8
  const tripletNoteUnits = isEighthMeter.value ? 1 : 2 // /8 uses three 16ths; /4 uses three 8ths
  const tripletOccupyUnits = isEighthMeter.value ? 2 : 4 // /8 occupies 1 eighth; /4 occupies 1 quarter

  return [
    { id: 'base', notes: [4], fallback: true },
    { id: 'base', notes: [8], fallback: true },
    { id: 'quarterEighth', notes: [baseUnits] },
    { id: 'base', notes: [longUnits] },
    { id: 'twoEight', notes: [2, 2] },
    { id: 'fourSixteen', notes: [1, 1, 1, 1] },
    { id: 'triplet', triplet: true, notes: [tripletNoteUnits, tripletNoteUnits, tripletNoteUnits], occupy: tripletOccupyUnits, tuplet: { numNotes: 3, notesOccupied: 2 } },
    { id: 'frontEightBackSixteen', notes: [2, 1, 1] },
    { id: 'frontEightBackSixteen', notes: [1, 1, 2] },
    { id: 'smallDot', notes: [3, 1] },
    { id: 'smallSyncopation', notes: [1, 2, 1] },
    { id: 'bigDot', notes: [6, 2] },
    { id: 'bigDot', notes: [2, 6] },
    { id: 'bigDot', notes: [6, 1, 1] },
    { id: 'bigDot', notes: [1, 1, 6] },
    { id: 'bigSyncopation', notes: [2, 4, 2] },
    { id: 'bigSyncopation', notes: [1, 1, 4, 2] },
    { id: 'bigSyncopation', notes: [2, 4, 1, 1] },
    { id: 'bigSyncopation', notes: [1, 1, 4, 1, 1] },
  ]
}

function activePatternsForRemaining(remaining) {
  const enabled = makePatternCatalog().filter((item) => {
    const patternIsEnabled = enabledPatterns[item.id] && !item.fallback
    if (!patternIsEnabled) return false
    const occupied = item.triplet ? item.occupy : sumUnits(item.notes.map((units) => ({ units })))
    return occupied <= remaining
  })
  if (enabled.length) return enabled

  const fallbackDurations = [8, 6, 4, 3, 2, 1].filter((units) => units <= remaining)
  return [{ id: 'base', notes: [fallbackDurations[0] || 1], fallback: true }]
}

function fillBar(targetUnits, forceNoRest = false) {
  const notes = []
  const maxRestUnits = isEighthMeter.value ? 2 : 4

  while (sumUnits(notes) < targetUnits) {
    const remaining = targetUnits - sumUnits(notes)
    const choice = randomItem(activePatternsForRemaining(remaining))
    const tiePitch = randomItem(selectedPitches.value)

    if (choice.triplet) {
      const tupletGroup = `triplet-${Math.random().toString(36).slice(2)}`
      choice.notes.forEach((units, index) => {
        const prevRestT = notes.length > 0 && notes[notes.length - 1].isRest
        const restProbT = prevRestT ? 0.05 : 0.12
        const shouldRest = allowRests.value && !forceNoRest && Math.random() < restProbT && units <= maxRestUnits
        const occupyHere = index === 0 ? choice.occupy : 0
        if (shouldRest) {
          notes.push(makeNote(units, a4Pitch, choice.id, { isRest: true, occupiesUnits: occupyHere, tupletGroup, tuplet: choice.tuplet }))
          return
        }
        const pitch = randomItem(selectedPitches.value)
        notes.push(makeNote(units, pitch, choice.id, { occupiesUnits: occupyHere, tupletGroup, tuplet: choice.tuplet }))
      })
    } else {
      choice.notes.forEach((units, index) => {
        const prevRest = notes.length > 0 && notes[notes.length - 1].isRest
        const restProb = prevRest ? 0.06 : 0.15
        const shouldRest = allowRests.value && !forceNoRest && !choice.tie && Math.random() < restProb && units <= maxRestUnits
        if (shouldRest) {
          notes.push(makeRest(units, choice.id))
          return
        }
        const pitch = choice.tie ? tiePitch : randomItem(selectedPitches.value)
        notes.push(makeNote(units, pitch, choice.id, {
          tiedToNext: Boolean(choice.tie && index === 0),
        }))
      })
    }
  }

  return notes
}
async function generateQuestion() {
  stopPlayback()
  const { barUnits } = parseMeter()
  selectedPitches.value = pitchCount.value === 1 ? [a4Pitch] : shuffle(pitchPool).slice(0, pitchCount.value)

  pickupBar.value = null
  const result = []
  if (useAnacrusis.value) {
    const pickupUnits = isEighthMeter.value ? 2 : 4
    pickupBar.value = fillBar(pickupUnits, true)
  }
  for (let i = 0; i < bars.value; i += 1) result.push(fillBar(barUnits))

  questionBars.value = result

  if (enabledPatterns.tie) {
    const maxTies = Math.floor(questionBars.value.length / 2) + 1
    let placed = 0
    const allBars = pickupBar.value ? [pickupBar.value, ...questionBars.value] : questionBars.value
    const candidates = []
    for (let m = 0; m < allBars.length; m += 1) {
      for (let i = 0; i < allBars[m].length - 1; i += 1) {
        if (allBars[m][i] && allBars[m][i + 1]) candidates.push({ a: allBars[m][i], b: allBars[m][i + 1], bar: m, type: 'within' })
      }
    }
    for (let m = 0; m < questionBars.value.length - 1; m += 1) {
      const last = questionBars.value[m][questionBars.value[m].length - 1]
      const first = questionBars.value[m + 1][0]
      if (last && first) candidates.push({ a: last, b: first, bar: -1, type: 'cross' })
    }
    const barTies = {}
    const tiedTargets = new Set()
    const shuffled = shuffle(candidates)
    for (let ci = 0; ci < shuffled.length && placed < maxTies; ci += 1) {
      const cand = shuffled[ci]
      if (cand.type === 'within') {
        const bc = barTies[cand.bar] || 0
        if (bc >= 2) continue
        const prob = bc >= 1 ? 0.2 : 0.35
        if (Math.random() >= prob && !(placed === 0 && ci === shuffled.length - 1)) continue
      } else {
        if (Math.random() >= 0.35 && !(placed === 0 && ci === shuffled.length - 1)) continue
      }
      if (tiedTargets.has(cand.a)) {
        if (Math.random() >= 0.08 && !(placed === 0 && ci === shuffled.length - 1)) continue
      }
      const p = randomItem(selectedPitches.value)
      cand.a.isRest = false; cand.b.isRest = false
      cand.a.key = p.key; cand.a.tone = p.tone
      cand.b.key = p.key; cand.b.tone = p.tone
      cand.a.tiedToNext = true; placed++
      if (cand.type === 'within') barTies[cand.bar] = (barTies[cand.bar] || 0) + 1
      tiedTargets.add(cand.b)
    }
    if (placed === 0 && candidates.length > 0) {
      const p = randomItem(selectedPitches.value)
      candidates[0].a.isRest = false; candidates[0].b.isRest = false
      candidates[0].a.key = p.key; candidates[0].a.tone = p.tone
      candidates[0].b.key = p.key; candidates[0].b.tone = p.tone
      candidates[0].a.tiedToNext = true
    }
  }
  {
    const allBars = pickupBar.value ? [pickupBar.value, ...questionBars.value] : questionBars.value
    const lastBar = allBars[allBars.length - 1]
    const lastNote = lastBar?.[lastBar.length - 1]
    if (lastNote) {
      let minUnits
      if (!isEighthMeter.value) {
        minUnits = 2
      } else if (eighthBeatMode.value === 'dottedQuarter') {
        minUnits = 3
      } else {
        minUnits = 1
      }
      if (lastNote.units < minUnits && lastBar.length >= 2) {
        const prev = lastBar[lastBar.length - 2]
        const give = minUnits - lastNote.units
        if (prev.units >= give) {
          prev.units -= give
          lastNote.units += give
        } else {
          lastNote.units = minUnits
        }
      } else if (lastNote.units < minUnits) {
        lastNote.units = minUnits
      }
    }
  }

  statusMessage.value = showPitchPreview.value && selectedPitches.value.length > 1
    ? pitchPreviewText.value
    : `题目已生成：从启用节奏型中随机抽取，共 ${questionBars.value.length} 小节。`
  await nextTick()
  renderStaff()
}

function unitsToVexDuration(units, isRest = false) {
  const map = {
    8: { duration: 'h', dots: 0 },
    6: { duration: 'q', dots: 1 },
    4: { duration: 'q', dots: 0 },
    3: { duration: '8', dots: 1 },
    2: { duration: '8', dots: 0 },
    1: { duration: '16', dots: 0 },
  }
  const item = map[units] || map[1]
  return { duration: `${item.duration}${isRest ? 'r' : ''}`, dots: item.dots }
}

function buildVexNote(note) {
  const duration = unitsToVexDuration(note.units, note.isRest)
  const staveNote = new StaveNote({
    keys: [note.isRest ? 'b/4' : note.key],
    duration: duration.duration,
  })
  for (let i = 0; i < duration.dots; i += 1) Dot.buildAndAttach([staveNote])
  return staveNote
}
function groupedBeamNotes(bar, vexNotes) {
  const groups = []
  let current = []
  let currentUnits = 0
  const beatGroupUnits = isEighthMeter.value ? 6 : 4

  const skip = new Set()
  const tupletGroups = new Map()
  bar.forEach((note, noteIndex) => {
    if (!note.tupletGroup) return
    if (!tupletGroups.has(note.tupletGroup)) tupletGroups.set(note.tupletGroup, [])
    tupletGroups.get(note.tupletGroup).push(noteIndex)
  })
  tupletGroups.forEach((indices) => {
    if (indices.length >= 3) {
      let chunk = [];
      for (let idx of indices) {
        if (bar[idx].isRest) {
          if (chunk.length >= 2) groups.push(chunk.map((i) => vexNotes[i]));
          chunk = [];
        } else {
          chunk.push(idx);
        }
      }
      if (chunk.length >= 2) groups.push(chunk.map((i) => vexNotes[i]));
      indices.forEach((i) => skip.add(i));
    }
  })

  for (let index = 0; index < bar.length; index += 1) {
    if (skip.has(index)) { if (current.length > 1) groups.push(current); current = []; currentUnits = 0; continue }
    const note = bar[index]
    const next = bar[index + 1]

    if (
      note?.patternId === 'smallDot'
      && note.units === 3
      && next
      && next.units === 1
      && !note.isRest
      && !next.isRest
    ) {
      groups.push([vexNotes[index], vexNotes[index + 1]])
      current = []
      currentUnits += note.units + next.units
      currentUnits %= beatGroupUnits
      index += 1
      continue
    }

    const canBeam = !note.isRest && note.units <= 2
    if (canBeam) current.push(vexNotes[index])
    currentUnits += (note.beamUnits ?? note.units)

    if (!canBeam || currentUnits >= beatGroupUnits) {
      if (current.length > 1) groups.push(current)
      current = []
      currentUnits %= beatGroupUnits
    }
  }

  if (current.length > 1) groups.push(current)
  return groups.map((items) => new Beam(items))
}

function tempoDurationForScore() {
  if (!isEighthMeter.value) return { duration: 'q' }
  if (eighthBeatMode.value === 'dottedQuarter') return { duration: 'q', dots: 1 }
  return { duration: '8' }
}

function renderStaff() {
  if (!scoreEl.value || !showScore.value || !hasQuestion.value) return

  scoreEl.value.innerHTML = ''
  const measures = pickupBar.value ? [pickupBar.value, ...questionBars.value] : questionBars.value
  const measuresPerRow = 2
  const measureWidth = 430
  const rowHeight = 155
  const rows = Math.ceil(measures.length / measuresPerRow)
  const width = measuresPerRow * measureWidth + 55
  const height = Math.max(210, rows * rowHeight + 45)
  scoreContentWidth.value = width
  scoreContentHeight.value = height
  const renderer = new Renderer(scoreEl.value, Renderer.Backends.SVG)
  renderer.resize(width, height)
  const context = renderer.getContext()
  const { barUnits } = parseMeter()
  const pickupUnits = isEighthMeter.value ? 2 : 4

  const globalVex = []
  const globalNotes = []
  let globalCursor = 0

  measures.forEach((bar, index) => {
    const row = Math.floor(index / measuresPerRow)
    const col = index % measuresPerRow
    const x = 12 + col * measureWidth
    const y = 36 + row * rowHeight
    const stave = new Stave(x, y, measureWidth)
    if (col === 0) stave.addClef('treble')
    if (index === 0) {
      stave.addTimeSignature(timeSignature.value)
      stave.setTempo({ ...tempoDurationForScore(), bpm: bpm.value }, -12)
    }
    stave.setContext(context).draw()

    const vexNotes = bar.map(buildVexNote)
    const beams = groupedBeamNotes(bar, vexNotes)
    const expectedUnits = pickupBar.value && index === 0 ? pickupUnits : barUnits
    const voice = new Voice({ num_beats: expectedUnits, beat_value: 16 })
    voice.setStrict(false)
    voice.addTickables(vexNotes)
    new Formatter().joinVoices([voice]).format([voice], measureWidth - (col === 0 ? 88 : 36))
    voice.draw(context, stave)
    beams.forEach((beamItem) => beamItem.setContext(context).draw())

    // Render tuplets (e.g. triplets) - with bracketed support for rests
    const tupletGroups = new Map()
    bar.forEach((note, noteIndex) => {
      if (!note.tupletGroup) return
      if (!tupletGroups.has(note.tupletGroup)) tupletGroups.set(note.tupletGroup, { notes: [], tuplet: note.tuplet, hasRest: false })
      const g = tupletGroups.get(note.tupletGroup); g.notes.push(vexNotes[noteIndex]); if (note.isRest) g.hasRest = true
    })
    tupletGroups.forEach((group) => {
      if (group.notes.length >= 3) {
        const opts = { numNotes: group.tuplet?.numNotes || 3, notesOccupied: group.tuplet?.notesOccupied || 2 }; if (group.hasRest) opts.bracketed = true; new Tuplet(group.notes, opts)
          .setContext(context)
          .draw()
      }
    })

    vexNotes.forEach((vn, i) => globalVex[globalCursor + i] = vn)
    bar.forEach((n, i) => { n._renderRow = row; globalNotes[globalCursor + i] = n })
    globalCursor += vexNotes.length
  })

  for (let i = 0; i < globalNotes.length - 1; i += 1) {
    const cur = globalNotes[i]
    const next = globalNotes[i + 1]
    if (!cur?.tiedToNext || !next) continue
    if (cur.isRest || next.isRest) continue
   if (!globalVex[i] || !globalVex[i + 1]) continue
    if (cur._renderRow === next._renderRow) {
      const tie = new StaveTie({ firstNote: globalVex[i], lastNote: globalVex[i + 1], firstIndices: [0], lastIndices: [0] })
      tie.setContext(context).draw()
    } else {
      const tie1 = new StaveTie({ firstNote: globalVex[i], lastNote: globalVex[i], firstIndices: [0], lastIndices: [0] })
      tie1.renderOptions.lastXShift = 35; tie1.renderOptions.yShift = 10
      tie1.setContext(context).draw()
      const tie2 = new StaveTie({ firstNote: globalVex[i + 1], lastNote: globalVex[i + 1], firstIndices: [0], lastIndices: [0] })
      tie2.renderOptions.firstXShift = -35; tie2.renderOptions.yShift = 10
      tie2.setContext(context).draw()
    }
  }
}
function initAudio() {
  pianoGain = new Tone.Gain(1.25).toDestination()
  clickGain = new Tone.Gain(0.18).toDestination()

  fallbackSynth = new Tone.PolySynth(Tone.Synth, {
    oscillator: { type: 'sine' },
    envelope: { attack: 0.004, decay: 0.12, sustain: 0.22, release: 0.18 },
  }).connect(pianoGain)
  clickSynth = new Tone.Synth({
    oscillator: { type: 'sine' },
    envelope: { attack: 0.001, decay: 0.045, sustain: 0, release: 0.02 },
  }).connect(clickGain)
  sampler = new Tone.Sampler({
    urls: {
      A3: 'A3.mp3', B3: 'B3.mp3', C4: 'C4.mp3', D4: 'D4.mp3',
      E4: 'E4.mp3', F4: 'F4.mp3', G4: 'G4.mp3', A4: 'A4.mp3',
      B4: 'B4.mp3', C5: 'C5.mp3',
    },
    baseUrl: '/',
  }).connect(pianoGain)
}

function noteSeconds(units) {
  if (!isEighthMeter.value) return units * (60 / bpm.value / 4)
  if (eighthBeatMode.value === 'eighth') return units * (60 / bpm.value / 2)
  return units * (60 / bpm.value / 6)
}

function fullBarSeconds() {
  const { barUnits } = parseMeter()
  return noteSeconds(barUnits)
}

function clickStepSeconds() { return 60 / bpm.value }

function scheduleTimer(callback, delay) {
  const id = window.setTimeout(callback, delay * 1000)
  stopTimers.push(id)
}

function playTone(noteName, seconds = 0.7, options = {}) {
  const { legato = false } = options
  const duration = Math.max(seconds + (legato ? 0.03 : 0), 0.05)
  if (sampler) { sampler.triggerAttackRelease(noteName, duration) } else if (fallbackSynth) { fallbackSynth.triggerAttackRelease(noteName, duration) }
}

function playClick() { clickSynth?.triggerAttackRelease('C6', '32n') }

async function togglePlayback() {
  if (isPlaying.value) { stopPlayback(); return }
  await startPlayback()
}

async function startPlayback() {
  if (!hasQuestion.value) return
  stopPlayback()
  await Tone.start()
  await Tone.loaded()
  isPlaying.value = true
  statusMessage.value = '正在播放。'

  let cursor = 0
  scheduleTimer(() => playTone('A4', 3), cursor)
  cursor += 3

  if (selectedPitches.value.length > 1) {
    sortedPitches.value.forEach((pitch) => {
      scheduleTimer(() => playTone(pitch.tone, 1.5), cursor)
      cursor += 1.5
    })
    cursor += 1
  }

  const countInSeconds = fullBarSeconds() * 2
  for (let t = 0; t < countInSeconds; t += clickStepSeconds()) {
    scheduleTimer(playClick, cursor + t)
  }
  cursor += countInSeconds

  let questionCursor = cursor
  const totalQuestionSeconds = flatNotes.value.reduce((sum, note) => sum + noteSeconds(note.units), 0)
  if (useMetronome.value) {
    for (let t = 0; t < totalQuestionSeconds; t += clickStepSeconds()) {
      scheduleTimer(playClick, questionCursor + t)
    }
  }

  let i = 0
  const notes = flatNotes.value
  while (i < notes.length) {
    const note = notes[i]
    let duration = noteSeconds(note.units)
    let j = i
    while (j < notes.length - 1 && notes[j].tiedToNext) { j++; duration += noteSeconds(notes[j].units) }
    if (!note.isRest) scheduleTimer(() => playTone(note.tone, duration, { legato: !allowRests.value }), questionCursor)
    questionCursor += duration
    i = j + 1
  }

  scheduleTimer(() => { isPlaying.value = false; statusMessage.value = '播放完成。' }, questionCursor + 0.2)
}

function stopPlayback() {
  stopTimers.forEach((id) => window.clearTimeout(id))
  stopTimers = []
  isPlaying.value = false
}

function exportScoreImage() {
  const svgNode = scoreEl.value?.querySelector('svg')
  if (!svgNode) return
  const source = new XMLSerializer().serializeToString(svgNode.cloneNode(true))
  const image = new Image()
  const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  image.onload = () => {
    const canvas = document.createElement('canvas')
    canvas.width = image.width || 1040
    canvas.height = image.height || 400
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(image, 0, 0)
    URL.revokeObjectURL(url)
    canvas.toBlob((png) => downloadBlob(png, 'rhythm-score.png'), 'image/png')
  }
  image.src = url
}

function writeWav(audioBuffer) {
  const data = audioBuffer.getChannelData(0)
  const buffer = new ArrayBuffer(44 + data.length * 2)
  const view = new DataView(buffer)
  const writeString = (offset, text) => [...text].forEach((char, i) => view.setUint8(offset + i, char.charCodeAt(0)))
  writeString(0, 'RIFF'); view.setUint32(4, 36 + data.length * 2, true)
  writeString(8, 'WAVE'); writeString(12, 'fmt ')
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true)
  view.setUint32(24, audioBuffer.sampleRate, true); view.setUint32(28, audioBuffer.sampleRate * 2, true)
  view.setUint16(32, 2, true); view.setUint16(34, 16, true)
  writeString(36, 'data'); view.setUint32(40, data.length * 2, true)
  let offset = 44
  data.forEach((sample) => {
    const clipped = Math.max(-1, Math.min(1, sample))
    view.setInt16(offset, clipped < 0 ? clipped * 0x8000 : clipped * 0x7fff, true)
    offset += 2
  })
  return new Blob([buffer], { type: 'audio/wav' })
}

async function exportAudioFile() {
  if (!hasQuestion.value) return
  const referenceSeconds = selectedPitches.value.length > 1 ? selectedPitches.value.length * 1.5 + 1 : 0
  const seconds = 3 + referenceSeconds + fullBarSeconds() * 2 + flatNotes.value.reduce((sum, note) => sum + noteSeconds(note.units), 0) + 1

  const rendered = await Tone.Offline(async () => {
    const exportSynth = new Tone.Sampler({
      urls: {
        A3: 'A3.mp3', B3: 'B3.mp3', C4: 'C4.mp3', D4: 'D4.mp3',
        E4: 'E4.mp3', F4: 'F4.mp3', G4: 'G4.mp3', A4: 'A4.mp3',
        B4: 'B4.mp3', C5: 'C5.mp3',
      },
      baseUrl: '/',
    }).toDestination()
    const click = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.001, decay: 0.04, sustain: 0, release: 0.02 },
    }).toDestination()
    await Tone.loaded()
    let cursor = 0
    exportSynth.triggerAttackRelease('A4', 3, cursor); cursor += 3
    if (selectedPitches.value.length > 1) {
      sortedPitches.value.forEach((pitch) => { exportSynth.triggerAttackRelease(pitch.tone, 1.35, cursor); cursor += 1.5 })
      cursor += 1
    }
    for (let t = 0; t < fullBarSeconds() * 2; t += clickStepSeconds()) click.triggerAttackRelease('C6', '32n', cursor + t)
    cursor += fullBarSeconds() * 2
    const questionLength = flatNotes.value.reduce((sum, note) => sum + noteSeconds(note.units), 0)
    if (useMetronome.value) {
      for (let t = 0; t < questionLength; t += clickStepSeconds()) click.triggerAttackRelease('C6', '32n', cursor + t)
    }
    let ei = 0
    const exportNotes = flatNotes.value
    while (ei < exportNotes.length) {
      const exportNote = exportNotes[ei]
      let exportLength = noteSeconds(exportNote.units)
      let ej = ei
      while (ej < exportNotes.length - 1 && exportNotes[ej].tiedToNext) { ej++; exportLength += noteSeconds(exportNotes[ej].units) }
      const exportRenderDuration = Math.max(exportLength + (!allowRests.value ? 0.03 : 0), 0.05)
      if (!exportNote.isRest) exportSynth.triggerAttackRelease(exportNote.tone, exportRenderDuration, cursor)
      cursor += exportLength; ei = ej + 1
    }
  }, seconds)

  downloadBlob(writeWav(rendered), 'rhythm-audio.wav')
  statusMessage.value = '音频已导出为 WAV'
}

function downloadBlob(blob, filename) {
  if (!blob) return
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url; anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

watch([timeSignature, bars, pitchCount, useAnacrusis, allowRests, eighthBeatMode, bpm], () => { generateQuestion() })
watch(showScore, async () => { await nextTick(); renderStaff() })

onMounted(async () => { initAudio(); await generateQuestion() })
</script>

<style scoped>
:global(body),
:global(#app) {
  width: 100%;
  max-width: none;
  margin: 0;
  background: #181a1f;
}

:global(#app) {
  min-height: 100vh;
  border: 0;
  text-align: left;
}

.app-shell {
  min-height: 100vh;
  padding: 24px clamp(16px, 5vw, 72px);
  color: #edf0f5;
  background: #181a1f;
  font-family: "Microsoft YaHei", "PingFang SC", system-ui, sans-serif;
  box-sizing: border-box;
}

 .app-header,
.section-title,
.actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.app-header { max-width: 1180px; margin: 0 auto 18px; }

.eyebrow {
  margin: 0 0 4px;
  color: #8fb7ff;
  font-size: 13px;
  text-transform: uppercase;
}

h1, h2 { margin: 0; color: #fff; letter-spacing: 0; }
h1 { font-size: clamp(30px, 4vw, 46px); font-weight: 700; }
h2 { font-size: 20px; font-weight: 650; }

.panel {
  max-width: 1180px;
  margin: 18px auto;
  padding: 22px;
  background: #24272f;
  border: 1px solid #343946;
  border-radius: 8px;
  box-shadow: 0 14px 35px rgba(0, 0, 0, 0.22);
}

.section-title span { color: #aeb6c6; font-size: 14px; }
.compact { margin-bottom: 14px; }

.control-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px;
  margin-top: 18px;
}

.field, .switch-grid label { color: #c9d0dc; font-size: 14px; }
.field { display: flex; flex-direction: column; gap: 8px; }

input, select {
  min-height: 42px;
  padding: 8px 10px;
  color: #f8fafc;
  background: #171a20;
  border: 1px solid #3a4050;
  border-radius: 6px;
  box-sizing: border-box;
}

input[type="range"] { padding: 0; }

.pattern-box {
  margin-top: 22px;
  padding: 18px;
  background: #1d2027;
  border: 1px solid #333846;
  border-radius: 8px;
}

.pattern-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.pattern-card {
  min-height: 112px;
  padding: 14px 10px;
  color: #d8deea;
  background: #2a2e38;
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
}

.pattern-card.active { border-color: #63a4ff; background: #29384e; }
.pattern-card.locked { cursor: default; }

.pattern-svg { width: 92px; height: 44px; color: #ffffff; display: block; }
.pattern-svg :deep(svg) { width: 100%; height: 100%; display: block; }

.pattern-card small { color: #aeb6c6; font-size: 12px; text-align: center; }

.switch-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
  margin-top: 18px;
}

.switch-grid label { min-height: 40px; display: flex; align-items: center; gap: 9px; }
.switch-grid input { width: 18px; min-height: 18px; }

.actions { justify-content: space-between; align-items: center; margin-top: 20px; flex-wrap: wrap; }
.actions-right { display: flex; gap: 14px; }
button {
  min-height: 42px;
  padding: 0 18px;
  border: 0;
  border-radius: 6px;
  color: #fff;
  font-weight: 700;
  cursor: pointer;
}

button:disabled { cursor: not-allowed; opacity: 0.55; }
.primary-button { background: #2e7dd7; }
.play-button { background: #26985f; }
.danger-button { background: #b84545; }
.ghost-button { background: #303642; border: 1px solid #485161; }

.status-bar {
  min-height: 44px;
  margin-top: 18px;
  padding: 12px 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #9fc5ff;
  background: #15181e;
  border-left: 4px solid #63a4ff;
  border-radius: 6px;
}

.status-bar strong { color: #ffffff; font-size: 14px; }

.score-paper {
  min-height: 230px;
  margin-top: 16px;
  padding: 18px;
  overflow: auto;
  touch-action: none;
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  max-width: 100%;
  background: #ffffff;
  border-radius: 8px;
  box-sizing: border-box;
}

.score-viewport {
  display: inline-block;
}

@media (max-width: 720px) {
  html { zoom: 0.7; }
  body { width: 1400px; overflow-x: hidden; }

  .app-shell { padding: 10px; }
  .panel { padding: 12px; }
  .pattern-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 6px; }
  .pattern-card { min-height: 90px; padding: 8px 6px; }
  .pattern-svg { width: 68px; height: 30px; }
  .pattern-card strong { font-size: 12px; }
  .pattern-card small { font-size: 10px; }
  .actions, .actions-right { gap: 8px; }
  .actions-right { width: 100%; }
  .actions-right button { flex: 1 1 0; }
  .score-paper { padding: 8px; }
}

.score-scale-layer {
  width: fit-content;
  height: fit-content;
  transform-origin: top left;
}
.score-host { min-width: 760px; }
.score-host :deep(svg) { display: block; max-width: 100%; height: auto; }

.score-mask {
  min-height: 170px;
  display: grid;
  place-items: center;
  color: #656b75;
  font-weight: 700;
  text-align: center;
}


</style>
