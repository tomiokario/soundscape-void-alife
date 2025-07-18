# Alife Soundscape Generator

Boidsアルゴリズムによる生命的サウンドスケープ生成


## 概要

Boidsアルゴリズムを使用してAlife（人工生命）的なサウンドスケープを生成するWebアプリケーションです。群れの動きに基づいて動的に音を生成し、リアルタイムで視覚と聴覚の両方で楽しめる体験を提供します。

- https://exbjrxdq.manus.space/

## 主な機能

### 1. Boidsシミュレーション
- **分離（Separation）**: 近くのボイドから離れる行動
- **整列（Alignment）**: 近くのボイドの平均速度に合わせる行動  
- **結合（Cohesion）**: 近くのボイドの中心に向かう行動

### 2. 音響生成
- ボイドの位置と速度に基づいた音高の生成
- Tone.jsを使用したリアルタイム音響合成
- リバーブとローパスフィルターによる音響効果

### 3. インタラクティブコントロール
- ボイド数の調整（10-200個）
- 音量調整
- 各行動パラメータの重み調整
- 再生/一時停止/停止コントロール

## 技術仕様

### フロントエンド
- **React**: UIフレームワーク
- **Tailwind CSS**: スタイリング
- **shadcn/ui**: UIコンポーネント
- **Lucide React**: アイコン

### 音響処理
- **Tone.js**: Web Audio API ラッパー
- **PolySynth**: 複数音同時再生
- **Reverb & Filter**: 音響エフェクト

### アルゴリズム
- **Boids Algorithm**: Craig Reynoldsの群れアルゴリズム
- **Canvas 2D**: リアルタイム描画
- **RequestAnimationFrame**: 60FPS アニメーション

## 使用方法

1. **開始**: Playボタンをクリックしてシミュレーションを開始
2. **パラメータ調整**: 右側のスライダーで各種パラメータを調整
   - Boids Count: ボイドの数
   - Volume: 音量
   - Separation/Alignment/Cohesion: 各行動の重み
3. **音響体験**: ボイドの動きに応じて生成される音を楽しむ

## 特徴

- **リアルタイム生成**: ボイドの動きに基づいてリアルタイムで音が生成される
- **視覚的フィードバック**: カラフルなボイドが画面上を動き回る
- **パラメータ調整**: スライダーで即座に挙動を変更可能
- **レスポンシブデザイン**: デスクトップとモバイルの両方に対応

## 実装背景

### 音響最適化
- ポリフォニー制限（4音同時）でCPU負荷軽減
- 音の生成頻度を調整してオーディオバッファオーバーフローを防止
- 短いエンベロープで音の重複を最小化

### パフォーマンス
- Canvas 2Dでの効率的な描画
- RequestAnimationFrameによる滑らかなアニメーション
- メモリリークを防ぐための適切なクリーンアップ

### ユーザビリティ
- 直感的なスライダーコントロール
- リアルタイムパラメータ表示
- 明確な再生状態表示# soundscape-void-alife
