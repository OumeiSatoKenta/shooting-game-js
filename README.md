# 縦スクロールシューティングゲーム

HTML5 CanvasとJavaScriptで作成した縦スクロールシューティングゲームです。

## 🎮 ゲームをプレイ

[こちらからプレイできます](https://oumeisatokenta.github.io/shooting-game-js/)

## 🎯 ゲームの特徴

- **ボスバトル**: 2体のボスが登場し、倒すごとに強くなります
- **パワーアップシステム**: ボスを倒すとパワーアップアイテムがドロップ
  - 🔵 **S (Speed)**: 連射速度アップ
  - 🟣 **P (Power)**: 攻撃力アップ（+5ダメージ）
  - 🟢 **L (Life)**: ライフ回復（最大5まで）
- **無敵時間**: ダメージを受けると2秒間無敵状態になります
- **エフェクト**: アイテム取得時に効果が表示されます

## 🎮 操作方法

- **矢印キー**: 自機の移動
- **スペースキー**: 弾の発射（押し続けると連射）

## 🛠️ 技術スタック

- HTML5 Canvas
- JavaScript (Vanilla)
- CSS3

## 📂 ファイル構成

```
shooting-game-js/
├── index.html      # メインHTMLファイル
├── game.js         # ゲームロジック
├── images/         # 画像ファイル
│   ├── enemy1.jpg  # ボス1の画像
│   ├── enemy2.jpg  # ボス2の画像
│   └── mikata.jpg  # プレイヤーの画像
└── README.md       # このファイル
```

## 🚀 ローカルで実行

1. リポジトリをクローン
```bash
git clone https://github.com/OumeiSatoKenta/shooting-game-js.git
```

2. ディレクトリに移動
```bash
cd shooting-game-js
```

3. ローカルサーバーを起動（例：Python）
```bash
python -m http.server 8000
```

4. ブラウザで開く
```
http://localhost:8000
```

## 📝 ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 🤖 作成者

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>