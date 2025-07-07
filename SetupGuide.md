# Alife Soundscape Generator - ローカル環境セットアップガイド

## 概要

Boidsアルゴリズムを使用してAlife（人工生命）的なサウンドスケープを生成するWebアプリケーションです。

## 必要な環境

- Node.js (v18以上推奨)
- npm または pnpm

## セットアップ手順

### 1. プロジェクトの展開

zipファイルを任意のディレクトリに展開してください。

```bash
unzip soundscape-alife-project.zip
cd soundscape-alife
```

### 2. 依存関係のインストール

```bash
# npmを使用する場合
npm install

# または pnpmを使用する場合（推奨）
pnpm install
```

### 3. 開発サーバーの起動

```bash
# npmを使用する場合
npm run dev

# または pnpmを使用する場合
pnpm run dev
```

ブラウザで `http://localhost:5173` にアクセスしてアプリを確認できます。

### 4. 本番用ビルド（オプション）

```bash
# npmを使用する場合
npm run build

# または pnpmを使用する場合
pnpm run build
```

ビルドされたファイルは `dist/` ディレクトリに生成されます。

## 使用方法

1. **開始**: Playボタンをクリックしてシミュレーションを開始
2. **パラメータ調整**: 右側のスライダーで各種パラメータを調整
   - Boids Count: ボイドの数（10-200個）
   - Volume: 音量
   - Separation/Alignment/Cohesion: 各行動の重み
3. **音響体験**: ボイドの動きに応じて生成される音を楽しむ

## 技術仕様

### 使用技術
- **React**: UIフレームワーク
- **Vite**: ビルドツール
- **Tailwind CSS**: スタイリング
- **shadcn/ui**: UIコンポーネント
- **Tone.js**: Web Audio API ラッパー
- **Lucide React**: アイコン

### アルゴリズム
- **Boids Algorithm**: Craig Reynoldsの群れアルゴリズム
- **Canvas 2D**: リアルタイム描画
- **Web Audio API**: 音響合成

## トラブルシューティング

### 音が出ない場合
- ブラウザの音量設定を確認してください
- ブラウザがWeb Audio APIをサポートしているか確認してください
- HTTPSまたはlocalhostでアクセスしているか確認してください

### パフォーマンスが悪い場合
- ボイド数を減らしてみてください
- ブラウザの他のタブを閉じてください
- ハードウェアアクセラレーションが有効になっているか確認してください

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 開発者向け情報

### プロジェクト構造
```
soundscape-alife/
├── src/
│   ├── App.jsx          # メインアプリケーション
│   ├── App.css          # スタイル
│   ├── components/ui/   # UIコンポーネント
│   └── ...
├── public/              # 静的ファイル
├── dist/               # ビルド済みファイル
├── package.json        # 依存関係
└── README.md          # このファイル
```

### カスタマイズ

- `src/App.jsx`: メインロジックとUI
- Boidsアルゴリズムのパラメータは各種スライダーで調整可能
- 音響パラメータは `initAudio` 関数内で変更可能

## 参考資料

- [Boids Algorithm](https://en.wikipedia.org/wiki/Boids) - Craig Reynolds
- [Tone.js Documentation](https://tonejs.github.io/)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

