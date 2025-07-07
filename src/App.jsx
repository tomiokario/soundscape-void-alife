import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Slider } from '@/components/ui/slider.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Play, Pause, Square, Volume2, Users, Zap } from 'lucide-react'
import './App.css'

// Boidクラス
class Boid {
  constructor(x, y, canvas) {
    this.position = { x, y }
    this.velocity = { 
      x: (Math.random() - 0.5) * 2, 
      y: (Math.random() - 0.5) * 2 
    }
    this.acceleration = { x: 0, y: 0 }
    this.maxSpeed = 2
    this.maxForce = 0.03
    this.canvas = canvas
    this.id = Math.random()
    this.lastSoundTime = 0
  }

  // 分離：近くのボイドから離れる
  separate(boids) {
    const desiredSeparation = 25
    let steer = { x: 0, y: 0 }
    let count = 0

    for (let other of boids) {
      const d = this.distance(this.position, other.position)
      if (d > 0 && d < desiredSeparation) {
        let diff = {
          x: this.position.x - other.position.x,
          y: this.position.y - other.position.y
        }
        diff = this.normalize(diff)
        diff.x /= d
        diff.y /= d
        steer.x += diff.x
        steer.y += diff.y
        count++
      }
    }

    if (count > 0) {
      steer.x /= count
      steer.y /= count
      steer = this.normalize(steer)
      steer.x *= this.maxSpeed
      steer.y *= this.maxSpeed
      steer.x -= this.velocity.x
      steer.y -= this.velocity.y
      steer = this.limit(steer, this.maxForce)
    }
    return steer
  }

  // 整列：近くのボイドの平均速度に合わせる
  align(boids) {
    const neighborDist = 50
    let sum = { x: 0, y: 0 }
    let count = 0

    for (let other of boids) {
      const d = this.distance(this.position, other.position)
      if (d > 0 && d < neighborDist) {
        sum.x += other.velocity.x
        sum.y += other.velocity.y
        count++
      }
    }

    if (count > 0) {
      sum.x /= count
      sum.y /= count
      sum = this.normalize(sum)
      sum.x *= this.maxSpeed
      sum.y *= this.maxSpeed
      let steer = {
        x: sum.x - this.velocity.x,
        y: sum.y - this.velocity.y
      }
      steer = this.limit(steer, this.maxForce)
      return steer
    }
    return { x: 0, y: 0 }
  }

  // 結合：近くのボイドの中心に向かう
  cohesion(boids) {
    const neighborDist = 50
    let sum = { x: 0, y: 0 }
    let count = 0

    for (let other of boids) {
      const d = this.distance(this.position, other.position)
      if (d > 0 && d < neighborDist) {
        sum.x += other.position.x
        sum.y += other.position.y
        count++
      }
    }

    if (count > 0) {
      sum.x /= count
      sum.y /= count
      return this.seek(sum)
    }
    return { x: 0, y: 0 }
  }

  // 目標に向かう力
  seek(target) {
    let desired = {
      x: target.x - this.position.x,
      y: target.y - this.position.y
    }
    desired = this.normalize(desired)
    desired.x *= this.maxSpeed
    desired.y *= this.maxSpeed

    let steer = {
      x: desired.x - this.velocity.x,
      y: desired.y - this.velocity.y
    }
    steer = this.limit(steer, this.maxForce)
    return steer
  }

  // 更新
  update(boids, separationWeight, alignmentWeight, cohesionWeight) {
    const sep = this.separate(boids)
    const ali = this.align(boids)
    const coh = this.cohesion(boids)

    sep.x *= separationWeight
    sep.y *= separationWeight
    ali.x *= alignmentWeight
    ali.y *= alignmentWeight
    coh.x *= cohesionWeight
    coh.y *= cohesionWeight

    this.acceleration.x = sep.x + ali.x + coh.x
    this.acceleration.y = sep.y + ali.y + coh.y

    this.velocity.x += this.acceleration.x
    this.velocity.y += this.acceleration.y
    this.velocity = this.limit(this.velocity, this.maxSpeed)

    this.position.x += this.velocity.x
    this.position.y += this.velocity.y

    // 境界処理
    if (this.position.x < 0) this.position.x = this.canvas.width
    if (this.position.x > this.canvas.width) this.position.x = 0
    if (this.position.y < 0) this.position.y = this.canvas.height
    if (this.position.y > this.canvas.height) this.position.y = 0

    this.acceleration.x = 0
    this.acceleration.y = 0
  }

  // 描画
  draw(ctx) {
    const angle = Math.atan2(this.velocity.y, this.velocity.x)
    ctx.save()
    ctx.translate(this.position.x, this.position.y)
    ctx.rotate(angle)
    
    ctx.fillStyle = `hsl(${(this.id * 360) % 360}, 70%, 60%)`
    ctx.beginPath()
    ctx.moveTo(8, 0)
    ctx.lineTo(-8, -4)
    ctx.lineTo(-8, 4)
    ctx.closePath()
    ctx.fill()
    
    ctx.restore()
  }

  // ユーティリティ関数
  distance(a, b) {
    return Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
  }

  normalize(v) {
    const mag = Math.sqrt(v.x ** 2 + v.y ** 2)
    if (mag > 0) {
      return { x: v.x / mag, y: v.y / mag }
    }
    return { x: 0, y: 0 }
  }

  limit(v, max) {
    const mag = Math.sqrt(v.x ** 2 + v.y ** 2)
    if (mag > max) {
      return { x: (v.x / mag) * max, y: (v.y / mag) * max }
    }
    return v
  }
}

function App() {
  const canvasRef = useRef(null)
  const animationRef = useRef(null)
  const boidsRef = useRef([])
  const synthRef = useRef(null)
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [boidCount, setBoidCount] = useState(50)
  const [separationWeight, setSeparationWeight] = useState(1.5)
  const [alignmentWeight, setAlignmentWeight] = useState(1.0)
  const [cohesionWeight, setCohesionWeight] = useState(1.0)
  const [volume, setVolume] = useState(0.3)

  // Tone.jsの初期化
  useEffect(() => {
    const initAudio = async () => {
      const { Synth, PolySynth, Reverb, Filter, getContext } = await import('tone')
      
      // ポリシンセの作成
      const reverb = new Reverb(2).toDestination()
      const filter = new Filter(800, 'lowpass').connect(reverb)
      const synth = new PolySynth(Synth, {
        maxPolyphony: 4, // ポリフォニー制限をさらに下げる
        oscillator: { type: 'sine' },
        envelope: { attack: 0.05, decay: 0.1, sustain: 0.2, release: 0.5 } // エンベロープを短くする
      }).connect(filter)
      
      synthRef.current = { synth, reverb, filter, context: getContext() }
    }
    
    initAudio()
  }, [])

  // ボイドの初期化
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width
    canvas.height = rect.height

    boidsRef.current = []
    for (let i = 0; i < boidCount; i++) {
      boidsRef.current.push(new Boid(
        Math.random() * canvas.width,
        Math.random() * canvas.height,
        canvas
      ))
    }
  }, [boidCount])

  // アニメーションループ
  useEffect(() => {
    if (!isPlaying) return

    const animate = () => {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      
      // 背景をクリア
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // ボイドの更新と描画
      boidsRef.current.forEach(boid => {
        boid.update(boidsRef.current, separationWeight, alignmentWeight, cohesionWeight)
        boid.draw(ctx)
        
        // 音の生成（確率的に）
        if (synthRef.current && Math.random() < 0.002) { // さらに確率を下げる
          const now = Date.now()
          if (now - boid.lastSoundTime > 1000) { // 間隔をさらに長くする
            const speed = Math.sqrt(boid.velocity.x ** 2 + boid.velocity.y ** 2)
            const frequency = 200 + (boid.position.x / canvas.width) * 400 + speed * 100
            const note = frequencyToNote(frequency)
            
            synthRef.current.synth.triggerAttackRelease(note, '32n') // 音の長さをさらに短くする
            boid.lastSoundTime = now
          }
        }
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [isPlaying, separationWeight, alignmentWeight, cohesionWeight])

  // 音量調整
  useEffect(() => {
    if (synthRef.current) {
      synthRef.current.synth.volume.value = (volume - 1) * 40 // dB変換
    }
  }, [volume])

  // 周波数をノート名に変換
  const frequencyToNote = (freq) => {
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    const A4 = 440
    const C0 = A4 * Math.pow(2, -4.75)
    
    if (freq > C0) {
      const h = Math.round(12 * Math.log2(freq / C0))
      const octave = Math.floor(h / 12)
      const n = h % 12
      return notes[n] + octave
    }
    return 'C4'
  }

  const handlePlay = async () => {
    if (synthRef.current && synthRef.current.context.state === 'suspended') {
      await synthRef.current.context.resume()
    }
    setIsPlaying(true)
  }

  const handlePause = () => {
    setIsPlaying(false)
  }

  const handleStop = () => {
    setIsPlaying(false)
    if (synthRef.current) {
      synthRef.current.synth.releaseAll()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Alife Soundscape Generator
          </h1>
          <p className="text-slate-300">
            Boidsアルゴリズムによる生命的サウンドスケープ生成
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* メインキャンバス */}
          <div className="lg:col-span-3">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Boids Simulation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <canvas
                  ref={canvasRef}
                  className="w-full h-96 bg-black rounded-lg border border-slate-600"
                  style={{ aspectRatio: '16/9' }}
                />
                
                {/* 再生コントロール */}
                <div className="flex items-center justify-center gap-4 mt-4">
                  <Button
                    onClick={handlePlay}
                    disabled={isPlaying}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Play
                  </Button>
                  <Button
                    onClick={handlePause}
                    disabled={!isPlaying}
                    variant="outline"
                  >
                    <Pause className="w-4 h-4 mr-2" />
                    Pause
                  </Button>
                  <Button
                    onClick={handleStop}
                    variant="outline"
                    className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white"
                  >
                    <Square className="w-4 h-4 mr-2" />
                    Stop
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* コントロールパネル */}
          <div className="space-y-6">
            {/* ボイド数 */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Boids Count
                </CardTitle>
                <CardDescription className="text-slate-400">
                  {boidCount} boids
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Slider
                  value={[boidCount]}
                  onValueChange={(value) => setBoidCount(value[0])}
                  max={200}
                  min={10}
                  step={10}
                  className="w-full"
                />
              </CardContent>
            </Card>

            {/* 音量 */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Volume2 className="w-5 h-5" />
                  Volume
                </CardTitle>
                <CardDescription className="text-slate-400">
                  {Math.round(volume * 100)}%
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Slider
                  value={[volume]}
                  onValueChange={(value) => setVolume(value[0])}
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
              </CardContent>
            </Card>

            {/* Boids パラメータ */}
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Behavior Weights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm text-slate-300 block mb-2">
                    Separation: {separationWeight.toFixed(1)}
                  </label>
                  <Slider
                    value={[separationWeight]}
                    onValueChange={(value) => setSeparationWeight(value[0])}
                    max={3}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-slate-300 block mb-2">
                    Alignment: {alignmentWeight.toFixed(1)}
                  </label>
                  <Slider
                    value={[alignmentWeight]}
                    onValueChange={(value) => setAlignmentWeight(value[0])}
                    max={3}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-slate-300 block mb-2">
                    Cohesion: {cohesionWeight.toFixed(1)}
                  </label>
                  <Slider
                    value={[cohesionWeight]}
                    onValueChange={(value) => setCohesionWeight(value[0])}
                    max={3}
                    min={0}
                    step={0.1}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* 原理説明セクション */}
      <div className="mt-12 max-w-4xl mx-auto">
        <Card className="bg-slate-800 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white text-2xl text-center">
              原理とアルゴリズム
            </CardTitle>
            <CardDescription className="text-slate-300 text-center">
              Alife的サウンドスケープ生成の仕組み
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 text-slate-300">
            {/* Boidsアルゴリズム */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                <Users className="w-5 h-5" />
                Boidsアルゴリズム
              </h3>
              <p className="mb-3">
                1986年にCraig Reynoldsによって開発されたBoidsアルゴリズムは、鳥の群れの自然な動きを模倣する人工生命（Alife）の代表的な手法です。
                各ボイド（個体）は以下の3つの基本ルールに従って行動します：
              </p>
              <div className="grid md:grid-cols-3 gap-4 mb-4">
                <div className="bg-slate-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-purple-300 mb-2">分離（Separation）</h4>
                  <p className="text-sm">近くの仲間から離れて、衝突を避ける</p>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-cyan-300 mb-2">整列（Alignment）</h4>
                  <p className="text-sm">近くの仲間の平均的な方向に合わせる</p>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-pink-300 mb-2">結合（Cohesion）</h4>
                  <p className="text-sm">近くの仲間の中心に向かって移動する</p>
                </div>
              </div>
              <p>
                これらのシンプルなルールから、複雑で美しい群れの動きが創発的に生まれます。
                各ボイドは局所的な情報のみに基づいて行動しますが、全体として協調的な動きを示します。
              </p>
            </div>

            {/* 音響生成 */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                <Volume2 className="w-5 h-5" />
                音響生成メカニズム
              </h3>
              <p className="mb-3">
                各ボイドの動きは以下の方法でリアルタイムに音に変換されます：
              </p>
              <div className="bg-slate-700 p-4 rounded-lg mb-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-green-300 mb-2">位置 → 音高</h4>
                    <p className="text-sm">X座標が音の高さを決定。画面右側ほど高い音になります。</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-yellow-300 mb-2">速度 → 音量</h4>
                    <p className="text-sm">移動速度が音の強さに影響。速く動くほど大きな音になります。</p>
                  </div>
                </div>
              </div>
              <p>
                音響合成にはTone.jsライブラリを使用し、Web Audio APIによる高品質なリアルタイム音響処理を実現しています。
                リバーブとローパスフィルターにより、自然で心地よい音響空間を作り出しています。
              </p>
            </div>

            {/* Alife的特徴 */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                <Zap className="w-5 h-5" />
                人工生命（Alife）的特徴
              </h3>
              <p className="mb-3">
                このシステムは以下のAlife的特徴を持っています：
              </p>
              <ul className="space-y-2 mb-4">
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  <span><strong>創発性</strong>：シンプルなルールから複雑な群れの動きが生まれる</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  <span><strong>自己組織化</strong>：中央制御なしに秩序ある構造が形成される</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  <span><strong>適応性</strong>：パラメータ変更に応じて動きが動的に変化する</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-400 mt-1">•</span>
                  <span><strong>非決定性</strong>：同じ条件でも毎回異なるパターンが生成される</span>
                </li>
              </ul>
              <p>
                これらの特徴により、予測不可能でありながら自然な美しさを持つサウンドスケープが生成されます。
                生命的なシステムの持つ複雑性と調和を、音と視覚の両方で体験することができます。
              </p>
            </div>

            {/* 技術実装 */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">技術実装</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-slate-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-blue-300 mb-2">フロントエンド</h4>
                  <ul className="text-sm space-y-1">
                    <li>• React + TypeScript</li>
                    <li>• Canvas 2D API（描画）</li>
                    <li>• Tailwind CSS（スタイリング）</li>
                    <li>• shadcn/ui（UIコンポーネント）</li>
                  </ul>
                </div>
                <div className="bg-slate-700 p-4 rounded-lg">
                  <h4 className="font-semibold text-orange-300 mb-2">音響処理</h4>
                  <ul className="text-sm space-y-1">
                    <li>• Tone.js（音響合成）</li>
                    <li>• Web Audio API</li>
                    <li>• PolySynth（複数音同時再生）</li>
                    <li>• Reverb & Filter（音響効果）</li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default App

