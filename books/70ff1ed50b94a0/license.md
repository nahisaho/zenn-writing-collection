---
title: "ライセンス"
---

# ライセンス

## 本書のライセンスについて

本書「Microsoft Entra ID によるSSOシステム開発ガイド」は、技術書として執筆・公開されており、以下のライセンス条項に従って利用できます。

### 著作権情報

**タイトル**: Microsoft Entra ID によるSSOシステム開発ガイド  
**著作権者**: 中田 寿穂
**初版公開**: 2025年6月29日
**プラットフォーム**: Zenn.dev

### 利用許諾

本書の内容は、以下の条件の下で利用できます。

#### 1. 個人利用
- **学習目的**: 個人の学習・研究目的での閲覧・参照は自由です
- **開発参考**: 個人プロジェクトでのコード例の参考・改変は許可されています。
- **印刷**: 個人利用に限り、印刷して保存することができます。

#### 2. 企業・組織での利用
- **社内研修**: 社内での技術研修・勉強会での利用は許可されています。
- **開発参考**: 商用プロジェクトでのコード例の参考・改変は許可されています。
- **チーム共有**: 組織内でのチーム間での共有は許可されています。

#### 3. 教育機関での利用
- **授業利用**: 大学・専門学校等での授業教材としての利用は許可されています。
- **学生配布**: 学生への配布・参考資料としての提供は許可されています。

### 利用制限

以下の行為は禁止されています。

#### 1. 商用利用の制限
- **有料販売**: 本書の内容をそのまま、または一部を有料で販売すること。
- **有料コース**: 本書の内容を主体とした有料コースやセミナーの開催。
- **商品化**: 本書の内容を商品として販売すること。

#### 2. 再配布の制限
- **無断転載**: 著作権者の許可なく、Webサイト・ブログ等への転載。
- **複製配布**: 物理的または電子的な複製物の配布。
- **改変後配布**: 内容を改変した上での再配布。

#### 3. その他の制限
- **著作権表示削除**: 著作権表示やライセンス情報の削除・改変。
- **虚偽の著作権主張**: 本書の内容について虚偽の著作権を主張すること。

## コード例のライセンス

本書に含まれるサンプルコードについては、より柔軟な利用を許可します。

### MIT License 適用コード

本書に含まれる以下のコード例は、MIT Licenseの下で提供されます。

- 第3章：SAML 2.0実装のサンプルコード
- 第4章：OpenID Connect実装のサンプルコード  
- 第5章：OAuth 2.0およびGraph API実装のサンプルコード
- 第6章：SCIM実装のサンプルコード
- 第7章：セキュリティベストプラクティスのコード例

#### MIT License 条文

```
MIT License

Copyright (c) 2024 [著者名]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

### 利用時の注意事項

コード例を利用する際の推奨事項：

#### 1. 適切な表示
```javascript
// このコードは「Microsoft Entra ID によるSSOシステム開発ガイド」より引用・改変
// Original source: [書籍URL]
// License: MIT License
```

#### 2. セキュリティ考慮
- **本番環境**: サンプルコードを本番環境で使用する前に、十分なセキュリティレビューを実施してください
- **秘密情報**: ハードコードされた値（クライアントシークレット等）は、必ず環境変数や設定ファイルに分離してください
- **最新化**: 依存ライブラリを最新バージョンに更新し、セキュリティパッチを適用してください

#### 3. 免責事項
- サンプルコードは教育目的で提供されており、本番環境での動作を保証するものではありません
- コードの使用によって生じるいかなる損害についても、著作権者は責任を負いません

## 第三者の知的財産権

本書では、以下の第三者の商標・商号・サービス名を参照しています。

### Microsoft 関連
- **Microsoft**、**Azure**、**Microsoft Entra ID**、**Azure Active Directory**、**Microsoft 365**、**Microsoft Graph**は、Microsoft Corporation の商標または登録商標です
- **MSAL**（Microsoft Authentication Library）は、Microsoft Corporation の製品です

### 標準・プロトコル関連
- **OAuth**は、OAuth Working Group の仕様です
- **OpenID Connect**は、OpenID Foundation の仕様です
- **SAML**は、OASIS（Organization for the Advancement of Structured Information Standards）の仕様です
- **SCIM**は、IETF（Internet Engineering Task Force）の仕様です

### プログラミング言語・フレームワーク
- **Java**は、Oracle Corporation の商標または登録商標です
- **Spring Boot**、**Spring Security**は、VMware, Inc. の商標です
- **Node.js**は、Node.js Foundation の商標です
- **Python**は、Python Software Foundation の商標です
- **PHP**は、The PHP Group の商標です
- **.NET**は、Microsoft Corporation の商標です

これらの商標・商号は、各権利者の財産であり、本書での言及は技術的説明の目的のみに使用されています。

## 免責事項

### 技術的正確性
- 本書の内容は執筆時点での情報に基づいており、技術の進歩や仕様変更により情報が古くなる可能性があります。
- Microsoft Entra IDやその他のサービスの仕様変更により、記載内容が実際の動作と異なる場合があります。
- 読者は、最新の公式ドキュメントを参照することを強く推奨します。

### 実装における責任
- 本書の内容を参考にした実装における不具合や問題について、著作権者は責任を負いません。
- セキュリティに関わる実装については、専門家によるレビューを推奨します。
- 本番環境での利用前には、十分なテストと検証を実施してください。

### 法的責任
- 本書の使用によって生じるいかなる直接的・間接的損害についても、著作権者は責任を負いません。
- 各国の法律や規制に従った利用は、読者の責任において行ってください。

## ライセンス変更

### 通知方法
ライセンス条項の変更が必要な場合は、以下の方法で通知します。

1. **Zenn.dev プラットフォーム**: 本書のページ上での告知
2. **GitHub**: 関連リポジトリでの告知（該当する場合）
3. **SNS**: 著者のSNSアカウントでの告知

### 変更の適用
- ライセンス変更は、変更通知から30日後に効力を発します。
- 変更前にダウンロード・複製された内容については、変更前のライセンス条項が適用されます。

## お問い合わせ

### ライセンスに関する質問
本ライセンスに関するご質問は、以下の方法でお問い合わせください。

- **Zenn.dev**: 本書のコメント欄
- **GitHub Issues**: [関連リポジトリのIssue]（該当する場合）
- **メール**: nahisaho@microsoft.com
### 商用利用許可の申請
本書の商用利用をご希望の場合は、事前に著作権者にご相談ください。用途や規模に応じて、個別にライセンス条項を検討いたします。

## 謝辞

本書の執筆にあたり、以下のリソースを参考にさせていただきました。

### 公式ドキュメント
- Microsoft Learn ドキュメント
- Microsoft Identity Platform ドキュメント
- OAuth 2.0、OpenID Connect、SAML 2.0、SCIM の各種仕様書

### オープンソースコミュニティ
- Microsoft Authentication Library (MSAL) コミュニティ
- 各種プログラミング言語のSSOライブラリ開発者
- Stack Overflow、GitHub をはじめとする技術コミュニティ

これらのコミュニティと開発者の皆様の貢献により、本書の品質向上が実現できました。

---

**最終更新**: 2025年6月29日
**バージョン**: 1.0

本ライセンス文書は、本書の一部として著作権保護の対象となります。