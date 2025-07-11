---
title: "第6章：研究成果を可視化する次世代プレゼンテーション資料"
---

# 学術発表と実践研修を統合したスライド設計思想

2025年6月20日、金曜日の午後。

第5章で講演の構成と流れを設計した私は、次の重要な課題に直面していた。

**「この革新的な講演内容を、どのようなビジュアルで表現するか？」**

従来の学術発表では、論文調の詳細なスライドが一般的だった。一方、教育研修では、分かりやすいイラストや図解を多用したスライドが効果的とされていた。

しかし、私のJAEA講演は、その両方を融合させた全く新しいスタイルだった。そのため、スライド設計においても、前例のないアプローチが必要だった。

## 研究論文レベルの厳密性と教育資料の分かりやすさの融合

この課題を解決するため、私は「デュアル・レイヤー設計」という独自のアプローチを開発した。

### デュアル・レイヤー設計とは

**レイヤー1：「理解促進レイヤー」**
- 視覚的に分かりやすい図解
- 概念の流れを示すフローチャート  
- 聴衆の注意を引くビジュアル要素

**レイヤー2：「信頼性担保レイヤー」**
- 学術的根拠を示すデータ
- 参考文献・出典の明記
- 技術的詳細のスペック情報

これら2つのレイヤーを、1枚のスライドに巧妙に統合することで、研究者の「理解したい」「信頼したい」という2つのニーズを同時に満たすことを目指した。

### 具体的な統合手法

**手法1：メインビジュアル + 詳細情報の段階的提示**

```
スライド例：「AI活用の4つのパターン」

[メインビジュアル - 画面中央の大きな図]
- 4つのパターンを表現するインフォグラフィック
- 各パターンの特徴を色分けとアイコンで表現
- 矢印で相互関係を示す

[詳細情報 - 画面下部の小さなエリア]
- 各パターンの学術的定義
- 代表的な研究事例の引用
- 適用条件と限界の簡潔な記載
```

**手法2：ビフォー・アフターでの効果可視化**

```
スライド例：「AI協働研究の効果」

[左側：従来手法]
- 文献調査：2週間
- 専門知識習得：2ヶ月
- 仮説構築：1週間
合計：約3ヶ月

[右側：AI協働手法]
- 文献調査：2日
- 専門知識習得：1週間
- 仮説構築：3日
合計：約2週間

[下部：信頼性情報]
- 比較基準の明記
- 測定方法の説明
- 個人差の注意点
```

**手法3：ライブデモ用の動的スライド**

```
スライド例：「AIとの対話実演」

[中央：実際のAI対話画面]
- Chat画面のスクリーンショット
- リアルタイムで更新される内容

[右側：解説パネル]
- 「なぜこの質問をしたのか」
- 「この回答の注目ポイント」
- 「次にすべきアクション」

[左側：技術情報]
- 使用AIツール名
- プロンプトの種類
- 応答時間の記録
```

## 複雑な計算科学概念をビジュアル化するAI支援手法

原子力計算科学の概念は、一般的に非常に複雑で、視覚化が困難だった。しかし、AI支援を活用することで、この課題を解決できることを発見した。

### AI支援ビジュアル化の3段階アプローチ

**段階1：概念の分解と構造化**

まず、複雑な概念をAIとの対話で分解し、構造化する。

```
【Claude との対話例】

私：「中性子輸送方程式について、非専門家にも理解しやすい形で概念を分解して説明してください。視覚化を前提として、5つの要素に分けてください。」

Claude：「中性子輸送方程式は以下の5つの要素に分解できます：

1. 中性子の発生源（核分裂・外部源）
2. 中性子の移動（拡散・流束）  
3. 中性子の吸収（核種による捕獲）
4. 中性子の散乱（方向・エネルギー変化）
5. 時間・空間・エネルギー依存性

これらを原子炉内での『中性子の一生』として視覚化することで、方程式の物理的意味が理解しやすくなります。」
```

**段階2：ビジュアル表現の設計**

分解された概念を、視覚的に表現する方法をAIと協働で設計する。

```
【Microsoft Copilot との対話例】

私：「中性子輸送の概念を、原子炉断面図上でアニメーション風に表現したいです。PowerPointで作成可能な方法を教えてください。」

Microsoft Copilot：「以下の手順でアニメーション化できます：

1. 原子炉断面図をベース図として作成
2. 中性子を小さな青い点で表現
3. 核分裂を星型の爆発アニメーションで表現
4. 中性子の軌跡を点線の軌道で表現
5. 吸収を赤い×印で、散乱を矢印の分岐で表現

PowerPointのアニメーション機能：
- 「パス」アニメーションで中性子の移動
- 「拡大/縮小」で核分裂の爆発効果
- 「フェードイン/アウト」で吸収・散乱の表現」
```

**段階3：教育効果の最適化**

作成したビジュアルの教育効果をAIとの対話で検証・改善する。

```
【ChatGPT との対話例】

私：「作成した中性子輸送のアニメーションスライドについて、教育心理学の観点から改善点を指摘してください。」

ChatGPT：「認知負荷理論の観点から以下の改善をお勧めします：

1. 同時に表示する要素を3つ以下に制限
2. 色の使い分けに一貫性を持たせる（青：中性子、赤：吸収、緑：散乱）
3. アニメーション速度を調整可能にする
4. 重要な概念に注目を集める「スポットライト効果」を追加
5. 段階的な情報開示（最初は全体概要、クリックで詳細表示）

これにより、認知負荷を軽減し、理解促進効果を高められます。」
```

### 具体的なビジュアル化事例

**事例1：MCNP計算プロセスの可視化**

従来の説明：
```
「MCNPは、モンテカルロ法を用いて中性子・光子の輸送を計算するコードです。
粒子の履歴を統計的に追跡し、各種物理量の期待値を求めます。」
```

AI支援ビジュアル化後：
```
[スライド構成]
中央：原子炉の3D断面図
左側：入力ファイルのイメージ（幾何形状・材料・線源）
右側：出力結果のグラフ（束分布・反応率）
下部：計算フローの矢印

[アニメーション]
1. 入力ファイルから3D形状が構築される様子
2. 多数の粒子が線源から放出される様子  
3. 粒子が材料中を移動・反応する様子
4. 統計的データが蓄積されグラフが形成される様子
```

**事例2：AI活用効果の定量的可視化**

従来の説明：
```
「AI活用により計算効率が向上します。」
```

AI支援ビジュアル化後：
```
[インフォグラフィック]
- 時計のアイコンで時間短縮効果を表現
- 棒グラフで従来法とAI活用法の比較
- 矢印と数値で改善率を明示
- 具体的な研究事例を小さなアイコンで併記

[データの表現]
従来法：MCNPパラメータ調整 8時間 → AI支援：2時間（75%短縮）
従来法：文献調査 2週間 → AI支援：3日（85%短縮）
従来法：計算結果解釈 4時間 → AI支援：1時間（75%短縮）
```

## インタラクティブ要素を組み込んだ参加型スライド構成

私の講演は、聴衆との双方向的なやり取りが重要な要素だった。そのため、スライドにもインタラクティブ要素を組み込む必要があった。

### 参加型スライドの設計原則

**原則1：即座の反応が可能な構成**

聴衆からの質問や意見に即座に対応できるよう、スライドを柔軟に構成する。

```
[スライド構成例：「皆さんの課題」]

メインスライド：
- 「皆さんが直面している計算効率の課題は？」
- 空白のテキストボックス（リアルタイム入力用）

準備済みサブスライド：
- 計算時間の課題への対応策
- メモリ不足の課題への対応策  
- 精度と速度のトレードオフ課題への対応策
- パラメータ最適化の課題への対応策

※聴衆の回答に応じて適切なサブスライドにジャンプ
```

**原則2：段階的な情報開示**

聴衆の理解度や反応に応じて、情報を段階的に開示する。

```
[クリック進行スライド例：「AI活用パターン」]

クリック1：「原子力計算科学でのAI活用には4つのパターンがあります」
クリック2：パターン1「サロゲートモデル型」が表示
クリック3：具体例「燃料性能コード代替」が表示
クリック4：効果「1万倍高速化」が表示
クリック5：「皆さんの研究ではどうでしょう？」質問表示

※各段階で聴衆の反応を確認しながら進行
```

**原則3：共創コンテンツの可視化**

聴衆との対話で生まれたアイデアや発見を、その場でスライドに反映する。

```
[ライブ編集スライド例：「AI活用アイデア創出」]

固定要素：
- 「本日のAI活用アイデア」というタイトル
- 4つの空白ボックス（カテゴリ別）

ライブ要素：
- 聴衆からのアイデアをリアルタイムで入力
- 類似アイデアをグルーピング
- 実現可能性と効果を◎○△で評価
- 次のステップを矢印で追記

※講演終了時には、聴衆との共創コンテンツが完成
```

### インタラクティブ技術の活用

**技術1：QRコードを使った即座のアクセス**

```
[スライド下部に常時表示]
QRコード1：「今日の資料ダウンロード」
QRコード2：「AI活用相談フォーム」  
QRコード3：「継続交流チャット参加」

※聴衆が講演中にスマートフォンでアクセス可能
```

**技術2：ライブ投票システムの活用**

```
[聴衆参加型スライド]
「皆さんの最優先課題は？」
A. 計算時間の短縮（投票ボタン）
B. 精度の向上（投票ボタン）
C. パラメータ最適化（投票ボタン）
D. データ解析効率化（投票ボタン）

※投票結果をリアルタイムでグラフ表示
※結果に応じて次のスライド内容を調整
```

**技術3：画面分割での同時表示**

```
[画面分割レイアウト]
左半分：ライブAI対話画面
右半分：解説スライド

※AIとの対話を見せながら、同時に要点を解説
※聴衆は両方の情報を同時に把握可能
```

## 一貫したビジュアルアイデンティティによる信頼性確保

研究者向けの講演では、視覚的な統一感が信頼性に直結する。私は、以下の要素で一貫したビジュアルアイデンティティを構築した。

### カラーパレットの設計

**メインカラー**：深いブルー（#1f4e79）
- 理由：信頼性・専門性を表現
- 用途：タイトル、重要な見出し

**サブカラー1**：明るいブルー（#4472c4）  
- 理由：親しみやすさを表現
- 用途：解説文、補助図表

**サブカラー2**：オレンジ（#ff8c00）
- 理由：注意喚起・アクション促進
- 用途：重要なポイント、CTA要素

**アクセントカラー**：グリーン（#00b050）
- 理由：成功・効果を表現  
- 用途：改善効果、成功事例

**背景色**：ライトグレー（#f8f9fa）
- 理由：読みやすさを確保
- 用途：スライド背景、区切り

### タイポグラフィの統一

**見出し用フォント**：「Yu Gothic UI Semibold」
- 特徴：視認性が高く、現代的
- サイズ：32pt（メインタイトル）、24pt（サブタイトル）

**本文用フォント**：「Yu Gothic UI Regular」
- 特徴：読みやすく、長時間の視聴に適している
- サイズ：18pt（通常本文）、14pt（詳細情報）

**コード用フォント**：「Consolas」
- 特徴：等幅フォントでコード表示に最適
- 用途：AIとの対話ログ、プログラムコード

### レイアウトグリッドシステム

**12列グリッドシステム**を採用し、全スライドで一貫したレイアウトを実現：

```
[標準レイアウト]
列1-2：アイコン・番号エリア
列3-10：メインコンテンツエリア  
列11-12：補助情報エリア

[対比レイアウト]
列1-6：左側コンテンツ
列7-12：右側コンテンツ

[フルスクリーンレイアウト]
列1-12：全画面コンテンツ（デモ・アニメーション用）
```

### アイコンシステムの統一

**Microsoft Fluent Design System**のアイコンを活用し、視覚的統一感を確保：

- AI関連：🤖（ロボット）、🧠（脳）、⚡（高速化）
- 計算関連：📊（グラフ）、🔢（数値）、⚙️（設定）
- 研究関連：🔬（実験）、📚（文献）、💡（アイデア）
- 効果関連：📈（向上）、⏰（時間短縮）、✅（成功）

# 協働研究プロセスを再現するスライド制作

私の講演の核心は、「AI協働研究プロセス」の実演だった。そのため、このプロセス自体をスライドで体験できるよう設計することが重要だった。

## 研究プロセス自体をスライドで体験できる構成

### プロセス体験型スライドの設計思想

**思想1：時系列の再現**

私が実際に体験した研究プロセスを、時系列で再現できるスライド構成とする。

```
[スライドシーケンス例：「AI協働研究の1週間」]

スライド1：「2025年5月30日 金曜日 午前」
- 私の最初の疑問：「原子力計算科学とは？」
- Claudeへの最初の質問の実画面

スライド2：「同日 午後」  
- Claude回答の分析結果
- 新たに生まれた疑問の可視化

スライド3：「5月24日 土曜日」
- Microsoft Copilotとの対話開始
- 具体的計算手法への深掘り

スライド4：「5月25日 日曜日」
- ChatGPT Deep Researchの実行
- 大量情報の整理プロセス

スライド5：「5月26日 月曜日」
- 3つのAIからの情報統合
- 新しい洞察の発見

※各スライドで実際の対話ログや思考プロセスを表示
```

**思想2：意思決定ポイントの共有**

研究プロセスの中で私が直面した選択や判断を、聴衆にも体験してもらう。

```
[選択体験スライド例]

スライド：「あなたならどちらを選びますか？」

状況説明：
「Claudeから専門的すぎる回答が返ってきました。
次にどのようなアプローチを取りますか？」

選択肢A：「より簡単な質問に変更する」
選択肢B：「同じ質問を他のAIにもしてみる」  
選択肢C：「専門用語を一つずつ調べ直す」

[聴衆の選択を挙手で確認]

次スライド：「私が選んだのは...」
→ 実際の選択とその理由を説明
→ 他の選択肢の場合の予想される結果も解説
```

**思想3：失敗と学習の可視化**

成功だけでなく、失敗や無駄になった作業も含めて、リアルな研究プロセスを表現する。

```
[失敗体験スライド例]

スライド：「最初の大きな失敗」

実際の画面：
ChatGPTへの質問：「原子力計算科学について教えて」
ChatGPTの回答：「原子力計算科学は...（一般的な説明が延々と続く）」

私の反応：「これでは全く使えない！」

学習：「質問の仕方が間違っていた」
改善：「具体的な背景と目的を明示した質問に変更」

改善後の質問：
「私は結晶学・強相関系物理学が専門の物理学者です。
原子力計算科学について体系的に学びたいのですが、
私のバックグラウンドを踏まえて、どのような順序で
学習を進めるのが効果的でしょうか？」

※失敗から学ぶプロセスを共有することで、聴衆も同じ失敗を避けられる
```

## AIとの対話ログを効果的に可視化する技術

AI協働研究の価値を伝えるには、実際の対話ログを効果的に表示することが不可欠だった。

### 対話ログ可視化の技術的アプローチ

**アプローチ1：メッセージバブル形式**

```
[スライドレイアウト]

左側：私の質問バブル（青色背景）
「結晶学・強相関系物理学のバックグラウンドをお持ちでしたら...」

右側：Claudeの回答バブル（グレー背景）  
「原子力計算科学への移行は非常に自然です。以下のような段階的な...」

下部：タイムスタンプ「2025年5月30日 10:32」

※チャットアプリのような親しみやすい表示
```

**アプローチ2：ハイライト付きコード表示**

```
[重要ポイントの強調表示]

Claudeの回答：
「特に強相関系での経験をお持ちでしたら、核燃料内の複雑な物理現象
（燃焼解析、核分裂生成物の拡散等）の理解が早いと思われます。」

※「強相関系」「核燃料」「燃焼解析」を黄色ハイライト
※右側に注釈：「私の専門知識が活かせるポイント！」
```

**アプローチ3：思考プロセスの可視化**

```
[3段階表示]

1段目：私の質問（最初の疑問）
2段目：AIの回答（情報提供）  
3段目：私の解釈（新たな疑問の発生）

矢印で繋いで、思考の連鎖を表現
※聴衆が同じ思考プロセスを追体験できる
```

### リアルタイムデモ用の表示設計

**設計1：分割画面レイアウト**

```
[画面分割構成]
左70%：実際のAI対話画面（ライブ）
右30%：解説パネル（固定）

解説パネル内容：
- 「今の質問のポイント」
- 「期待する回答の種類」  
- 「回答をどう活用するか」
- 「次のステップ」

※聴衆はライブデモを見ながら、解説も同時に理解
```

**設計2：段階的表示システム**

```
[表示制御]
段階1：質問のみ表示→聴衆に回答予想をしてもらう
段階2：AI回答を段落ごとに表示→重要ポイントを解説  
段階3：全体表示→私の解釈と次の質問を提示

※聴衆の集中力を維持しながら、理解を深める
```

## 技術図解の自動生成とカスタマイズ手法

原子力計算科学の概念を視覚化するため、AIを活用した図解生成システムを開発した。

### AI支援図解生成のワークフロー

**ステップ1：概念の言語化**

```
【Claude との対話】
私：「中性子輸送計算の概念を、図解で表現したいです。
主要な要素とその関係性を整理してください。」

Claude：「中性子輸送計算の図解には以下の要素が必要です：

主要要素：
1. 中性子源（Source）：核分裂、外部線源
2. 幾何体系（Geometry）：燃料、冷却材、構造材  
3. 中性子（Neutron）：エネルギー、方向、位置
4. 反応（Reaction）：吸収、散乱、核分裂
5. 計算格子（Mesh）：空間・エネルギー分割

関係性：
- 線源→中性子発生→輸送→反応→新たな中性子発生
- 確率論的プロセスの統計的評価
- 時間・空間・エネルギー依存性」
```

**ステップ2：ビジュアル設計**

```
【Microsoft Copilot との対話】
私：「上記の概念を表現する図解を、PowerPointで作成する手順を教えてください。」

Microsoft Copilot：「以下の手順で図解を作成できます：

1. 背景レイアウト：
   - 原子炉断面図を簡略化した形で配置
   - 燃料棒（黄色円柱）、冷却材（青色領域）、制御棒（赤色棒）

2. 中性子の表現：
   - 小さな青い矢印で中性子を表現
   - 矢印の長さで速度（エネルギー）を表現

3. 反応の表現：
   - 核分裂：星型の爆発エフェクト
   - 吸収：赤い×印
   - 散乱：矢印の方向変化

4. アニメーション：
   - パスアニメーションで中性子の軌跡
   - フェードイン/アウトで反応の発生

PowerPoint機能：
- 図形の組み合わせ
- アニメーション効果  
- SmartArt活用」
```

**ステップ3：自動生成とカスタマイズ**

```
【ChatGPT との対話】
私：「作成した図解の教育効果を高めるため、認知科学の観点から改善点を教えてください。」

ChatGPT：「認知負荷理論に基づく改善案：

1. 情報の階層化：
   - Level 1：全体概要（原子炉断面のみ）
   - Level 2：中性子追加（矢印表示）
   - Level 3：反応追加（核分裂・吸収・散乱）

2. 色彩心理学の活用：
   - 青（安定・信頼）：中性子、冷却材
   - 赤（注意・危険）：吸収、制御棒
   - 黄（エネルギー・活性）：核分裂、燃料

3. 注意誘導技術：
   - スポットライト効果で重要部分を強調
   - アニメーションのタイミング調整
   - 余白の活用で視線誘導

これにより、理解度向上と記憶定着効果が期待できます。」
```

### 図解カスタマイズの実装

**実装1：動的難易度調整**

```
[同一概念の3レベル表現]

レベル1（概要）：
- 原子炉＋中性子→計算→結果
- 最もシンプルな表現

レベル2（標準）：  
- 詳細な原子炉断面＋中性子軌跡＋主要反応
- バランスの取れた表現

レベル3（詳細）：
- 数式追加＋パラメータ表示＋統計情報
- 専門家向けの詳細表現

※聴衆の反応に応じてレベルを選択
```

**実装2：対話型図解**

```
[クリック応答図解]

図解上の要素をクリック→詳細説明表示

例：燃料棒をクリック
→「U-235の核分裂確率」「燃焼度の影響」「温度依存性」

例：冷却材をクリック  
→「減速効果」「中性子吸収」「温度フィードバック」

例：制御棒をクリック
→「中性子吸収断面積」「反応度制御」「安全機能」

※聴衆の興味に応じた詳細情報提供
```

## リアルタイムデモ用のインタラクティブスライド

講演の核心部分であるライブデモを効果的に実施するため、特別なインタラクティブスライドを設計した。

### デモ専用スライドの特徴

**特徴1：フェイルセーフ機能**

```
[バックアップシステム]

メインプラン：ライブAI対話
バックアッププラン1：事前録画した対話動画
バックアッププラン2：スクリーンショット付きシナリオ
エマージェンシープラン：聴衆参加型ディスカッション

※技術的トラブルに対応可能な多重バックアップ
```

**特徴2：聴衆参加統合機能**

```
[参加統合システム]

リアルタイム質問収集：
- QRコードでアクセスできる質問フォーム
- 投稿された質問をスライドに即座表示
- AI対話の質問として即座に活用

投票・反応システム：
- 「この回答は有用だと思いますか？」
- 「次にどの質問をすべきでしょうか？」  
- 結果を即座にグラフ表示

共創コンテンツ：
- 聴衆とAIの協働で新しいアイデア創出
- その場で生まれたコンテンツをスライドに統合
```

**特徴3：学習効果測定機能**

```
[理解度チェック]

デモ前：「この課題をどう解決しますか？」
→聴衆の予想を収集・表示

デモ中：「AIの回答をどう思いますか？」  
→リアルタイム反応を収集

デモ後：「学んだことを一言で表現すると？」
→学習効果を即座に可視化

※講演の効果をリアルタイムで測定・調整
```

---

この第6章で設計した「次世代プレゼンテーション資料」は、単なる情報伝達ツールを超えた、「体験創造メディア」となった。

聴衆（JAEA研究者）は、スライドを通じて私のAI協働研究プロセスを追体験し、同時に自分自身のAI活用スキルも向上させることができる。

次の第7章では、この革新的な講演内容と資料の品質を、研究者レベルの厳密性で確保するプロセスに取り組む。

学術的妥当性の検証から、実践的な改善まで、「失敗しない講演」を作り上げるための最終段階が始まる。