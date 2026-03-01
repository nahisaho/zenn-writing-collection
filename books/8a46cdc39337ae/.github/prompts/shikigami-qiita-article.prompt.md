---
mode: agent
description: Qiita記事を作成する（Qiita Writing Rules強制適用）
tools: ['shikigami-writing']
---

# Qiita記事作成プロンプト（v1.22.0）

> **⚠️ 重要**: このプロンプトが呼び出されたら、**必ず**Qiita Writing Rulesを適用すること。
> 
> **WHEN**: 「Qiita記事」「技術記事」「Qiitaに投稿」等のキーワードを検出
> **DO**: Qiita専用フォーマットで記事を生成

---

## 🎯 トリガーキーワード

以下のキーワードを検出したら、このプロンプトを適用：

| キーワード（日本語） | キーワード（英語） |
|---------------------|-------------------|
| Qiita記事 | Qiita article |
| 技術記事 | tech article |
| Qiitaに投稿 | post to Qiita |
| Qiita用 | for Qiita |
| Qiita向け | Qiita-style |
| 技術ブログ | tech blog |

---

## 📋 必須適用ルール

### 1. フロントマター（必須）

```yaml
---
title: "[タイトル]"           # 必須: 50文字以内
tags: Tag1, Tag2, Tag3        # 必須: 1〜5個（カンマ区切り）
private: false                # 必須: 公開=false, 限定公開=true
updated_at: ''                # 自動: 投稿時に設定
id: null                      # 自動: 投稿後に付与
organization_url_name: null   # 任意: Organization投稿時
slide: false                  # 任意: スライドモード
---
```

### 2. タイトルルール

| ルール | 基準 |
|--------|------|
| **文字数** | 30〜50文字（50文字超は検索で切れる） |
| **キーワード** | 主要キーワードを**前半に配置** |
| **数字** | 具体的数字で訴求（「5つの方法」「3ステップ」） |
| **ターゲット** | 対象読者を明示（「初心者向け」「実務で使える」） |

**✅ 良い例**:
- `【2026年版】GitHub Copilot完全ガイド｜実務で使える10のTips`
- `Python初心者が3日でWebアプリを作る方法【Flask入門】`

**❌ 悪い例**:
- `Pythonについて`（抽象的すぎる）
- `私がReactを学んで感じた様々なことについての考察`（長すぎる）

### 3. タグ選定ルール

| タイプ | 説明 | 例 |
|--------|------|-----|
| **メインタグ** | 記事の主題（1個） | `Python`, `React`, `AWS` |
| **技術タグ** | 使用技術（1-2個） | `TypeScript`, `Docker` |
| **カテゴリタグ** | 記事種別（1個） | `初心者向け`, `Tips` |
| **トレンドタグ** | 旬のタグ（0-1個） | `ChatGPT`, `Copilot` |

**禁止**: 5個超、同義タグ重複（`JavaScript`と`JS`）

### 4. 記事構成（必須セクション）

```markdown
# はじめに（200-400字）
- この記事で分かること（箇条書き）
- 想定読者
- 所要時間・難易度・環境（:::note info）

## 前提条件（100-200字）※任意

## 本文セクション（1500-4000字）
- H2/H3で構造化
- コードブロックにはファイル名付与
- 注意点は :::note warn/alert

## まとめ（200-300字）
- 要点を表形式で整理
- 次のステップ

## 参考資料
- URL付きリンク必須
```

**推奨総文字数**: 2,000〜5,000文字（読了時間5-15分）

### 5. Qiita専用記法

#### 注釈ボックス
```markdown
:::note info
💡 **ポイント**: 補足情報
:::

:::note warn
⚠️ **注意**: 落とし穴
:::

:::note alert
🚨 **重要**: 致命的な注意点
:::
```

#### ファイル名付きコードブロック
```markdown
```python:main.py
def hello():
    print("Hello, Qiita!")
```
```

#### 折りたたみ
```markdown
<details><summary>📝 詳細（クリックで展開）</summary>

長い内容

</details>
```

---

## ✅ 生成前チェックリスト

```
☐ フロントマター完備（title, tags, private）
☐ タイトル50文字以内、キーワード前半配置
☐ タグ1〜5個、適切な選定
☐ 「はじめに」に対象読者・得られる知識を明記
☐ コードブロックにファイル名付与（```python:main.py）
☐ 注釈ボックス（:::note）を活用
☐ 参考資料にURL付き
☐ 総文字数2,000〜5,000文字
```

---

## 📝 テンプレート

```markdown
---
title: "[タイトル]（50文字以内）"
tags: Tag1, Tag2, Tag3
private: false
updated_at: ''
id: null
organization_url_name: null
slide: false
---

# はじめに

**この記事で分かること**:
- ポイント1
- ポイント2
- ポイント3

**想定読者**: [読者層]

:::note info
📖 **所要時間**: 約X分
🎯 **難易度**: 初級/中級/上級
💻 **環境**: [環境情報]
:::

## 前提条件

- 前提知識1
- 前提知識2

## セクション1

[内容]

```typescript:example.ts
const greeting = "Hello, Qiita!";
console.log(greeting);
```

:::note warn
**注意**: [重要な注意点]
:::

## セクション2

[内容]

<details><summary>📝 詳細な説明（クリックで展開）</summary>

長い内容や補足情報

</details>

## まとめ

| ポイント | 内容 |
|---------|------|
| 1 | 要点1 |
| 2 | 要点2 |
| 3 | 要点3 |

**次のステップ**: [次に学ぶべきこと]

## 参考資料

- [参考資料1](https://example.com) - 説明
- [公式ドキュメント](https://example.com)
```

---

**詳細ルール参照**: [shikigami-writing SKILL.md](../skills/shikigami-writing/SKILL.md#qiita-writing-rules)
