// 完全版PowerPoint生成スクリプト - 全18スライド対応
// 教育機関の情報セキュリティ危機と対策

const PptxGenJS = require("pptxgenjs");

function createCompletePresentationPPTX() {
    let pptx = new PptxGenJS();
    
    // Microsoft カラーパレット
    const colors = {
        msBlue: '0078D4',
        msDarkBlue: '106EBE',
        msRed: 'D83B01',
        msGreen: '107C10',
        msYellow: 'FFB900',
        msPurple: '5C2D91',
        msGrayLight: 'F3F2F1',
        msGray: '605E5C',
        msGrayDark: '323130',
        msWhite: 'FFFFFF'
    };

    // スライドサイズ設定（16:9）
    pptx.defineLayout({ name: 'WIDESCREEN', width: 10, height: 5.625 });
    pptx.layout = 'WIDESCREEN';

    // 共通関数：カード作成
    function addCard(slide, x, y, w, h, borderColor, title, content, icon = '') {
        slide.addShape(pptx.ShapeType.rect, {
            x: x, y: y, w: w, h: h,
            fill: { type: 'solid', color: colors.msWhite },
            line: { width: 2, color: borderColor }
        });
        
        if (icon) {
            slide.addText(icon, {
                x: x + 0.2, y: y + 0.1, w: 0.8, h: 0.6,
                fontSize: 32, align: 'center'
            });
        }
        
        slide.addText(title, {
            x: x + (icon ? 1 : 0.2), y: y + 0.1, w: w - (icon ? 1.2 : 0.4), h: 0.4,
            fontSize: 18, bold: true, color: colors.msGrayDark, align: 'left',
            fontFace: 'Segoe UI'
        });
        
        slide.addText(content, {
            x: x + (icon ? 1 : 0.2), y: y + 0.6, w: w - (icon ? 1.2 : 0.4), h: h - 0.8,
            fontSize: 14, color: colors.msGray, align: 'left',
            fontFace: 'Segoe UI'
        });
    }

    // 共通関数：ハイライトボックス
    function addHighlight(slide, x, y, w, h, bgColor, title, subtitle = '') {
        slide.addShape(pptx.ShapeType.rect, {
            x: x, y: y, w: w, h: h,
            fill: { type: 'solid', color: bgColor },
            line: { width: 0 }
        });
        
        slide.addText(title, {
            x: x + 0.2, y: y + 0.1, w: w - 0.4, h: h/2,
            fontSize: 24, bold: true, color: colors.msWhite, align: 'center',
            fontFace: 'Segoe UI'
        });
        
        if (subtitle) {
            slide.addText(subtitle, {
                x: x + 0.2, y: y + h/2, w: w - 0.4, h: h/2,
                fontSize: 14, color: colors.msWhite, align: 'center',
                fontFace: 'Segoe UI'
            });
        }
    }

    // スライド1: タイトル
    let slide1 = pptx.addSlide();
    slide1.background = { color: colors.msWhite };
    
    slide1.addText('🛡️', {
        x: 4.5, y: 0.5, w: 1, h: 1,
        fontSize: 72, color: colors.msRed, align: 'center'
    });
    
    slide1.addText('教育機関の情報セキュリティ危機', {
        x: 1, y: 1.5, w: 8, h: 1,
        fontSize: 40, bold: true, color: colors.msBlue, align: 'center',
        fontFace: 'Segoe UI'
    });
    
    addHighlight(slide1, 2, 2.7, 6, 0.8, colors.msBlue, 'なぜ今、Microsoft 365 A5が必要なのか');
    
    slide1.addText('218件', {
        x: 3, y: 3.8, w: 4, h: 1,
        fontSize: 72, bold: true, color: colors.msRed, align: 'center',
        fontFace: 'Segoe UI'
    });
    
    slide1.addText('2023年度の個人情報漏洩事故件数', {
        x: 2, y: 4.8, w: 6, h: 0.5,
        fontSize: 16, color: colors.msGray, align: 'center',
        fontFace: 'Segoe UI'
    });

    slide1.addShape(pptx.ShapeType.rect, {
        x: 8.5, y: 0.2, w: 1.2, h: 0.4,
        fill: { type: 'solid', color: colors.msRed },
        line: { width: 0 }
    });
    
    slide1.addText('緊急', {
        x: 8.6, y: 0.3, w: 1, h: 0.2,
        fontSize: 12, bold: true, color: colors.msWhite, align: 'center',
        fontFace: 'Segoe UI'
    });

    // スライド2: 問題提起
    let slide2 = pptx.addSlide();
    slide2.addText('なぜ今、この話題なのか？', {
        x: 1, y: 0.5, w: 8, h: 0.8,
        fontSize: 32, bold: true, color: colors.msBlue, align: 'center',
        fontFace: 'Segoe UI'
    });

    addCard(slide2, 0.5, 1.5, 4, 2.5, colors.msRed, '深刻化する脅威', 
        '教育機関への攻撃が急増し、他業種を上回る増加率を記録', '⚠️');
    
    addCard(slide2, 5.5, 1.5, 4, 2.5, colors.msYellow, '影響の甚大さ', 
        '児童生徒の未来に関わるセンシティブ情報の大量保有', '👥');

    slide2.addText('↓', {
        x: 4.5, y: 4.2, w: 1, h: 0.4,
        fontSize: 32, color: colors.msBlue, align: 'center'
    });

    slide2.addText('組織の存続に関わる必須対策が求められている', {
        x: 1.5, y: 4.7, w: 7, h: 0.6,
        fontSize: 18, italic: true, color: colors.msBlue, align: 'center',
        fontFace: 'Segoe UI'
    });

    // スライド3: 現状認識
    let slide3 = pptx.addSlide();
    slide3.addText('看過できない現実', {
        x: 1, y: 0.3, w: 8, h: 0.6,
        fontSize: 32, bold: true, color: colors.msBlue, align: 'center',
        fontFace: 'Segoe UI'
    });

    addHighlight(slide3, 1, 1, 8, 0.8, colors.msRed, '🚨 教育機関の情報漏洩事故が急増', 
        '他業種と比較して突出した増加傾向を示している');

    const years = ['2020年', '2021年', '2022年', '2023年'];
    const incidents = ['170件', '184件', '207件', '218件'];
    
    for (let i = 0; i < 4; i++) {
        slide3.addShape(pptx.ShapeType.rect, {
            x: 0.5 + i * 2.25, y: 2.5, w: 2, h: 1.5,
            fill: { type: 'solid', color: colors.msWhite },
            line: { width: 2, color: colors.msBlue }
        });
        
        slide3.addText(incidents[i], {
            x: 0.5 + i * 2.25, y: 2.8, w: 2, h: 0.6,
            fontSize: 24, bold: true, color: colors.msRed, align: 'center',
            fontFace: 'Segoe UI'
        });
        
        slide3.addText(years[i], {
            x: 0.5 + i * 2.25, y: 3.5, w: 2, h: 0.4,
            fontSize: 12, color: colors.msGray, align: 'center',
            fontFace: 'Segoe UI'
        });
    }

    // スライド4: 事故増加傾向
    let slide4 = pptx.addSlide();
    slide4.addText('事故増加の深刻性', {
        x: 1, y: 0.3, w: 8, h: 0.6,
        fontSize: 32, bold: true, color: colors.msBlue, align: 'center',
        fontFace: 'Segoe UI'
    });

    slide4.addShape(pptx.ShapeType.rect, {
        x: 1, y: 1, w: 8, h: 3,
        fill: { type: 'solid', color: colors.msGrayLight },
        line: { width: 1, color: colors.msGray }
    });
    
    slide4.addText('年度別事故件数推移\n\n[ここに線グラフを配置]\n\n170 → 184 → 207 → 218', {
        x: 1.5, y: 1.5, w: 7, h: 2,
        fontSize: 16, color: colors.msGray, align: 'center',
        fontFace: 'Segoe UI'
    });

    addHighlight(slide4, 2.5, 4.2, 5, 1, colors.msRed, '28.2%', 
        '4年間の事故増加率（他業種は横ばい〜減少）');

    // スライド5: 事故原因分析
    let slide5 = pptx.addSlide();
    slide5.addText('事故の真因分析', {
        x: 1, y: 0.3, w: 8, h: 0.6,
        fontSize: 32, bold: true, color: colors.msBlue, align: 'center',
        fontFace: 'Segoe UI'
    });

    slide5.addShape(pptx.ShapeType.rect, {
        x: 0.5, y: 1, w: 4.5, h: 3.5,
        fill: { type: 'solid', color: colors.msGrayLight },
        line: { width: 1, color: colors.msGray }
    });
    
    slide5.addText('2023年度 事故原因内訳\n\n[円グラフを配置]\n\n1. 紛失・置き忘れ: 45.4%\n2. 誤送信・誤配布: 38.5%\n3. 不正アクセス: 8.7%\n4. その他: 7.4%', {
        x: 1, y: 2, w: 3.5, h: 2,
        fontSize: 12, color: colors.msGray, align: 'left',
        fontFace: 'Segoe UI'
    });

    addCard(slide5, 5.5, 1, 4, 1.5, colors.msRed, '第1位: 紛失・置き忘れ', 
        '45.4% (99件)\n• USBメモリ、書類の紛失\n• 公共交通機関での置き忘れ');
    
    addCard(slide5, 5.5, 3, 4, 1.5, colors.msYellow, '第2位: 誤送信・誤配布', 
        '38.5% (84件)\n• メールの宛先間違い\n• BCC設定ミス');

    // スライド6: 人為的ミス
    let slide6 = pptx.addSlide();
    slide6.addText('重要な発見', {
        x: 1, y: 0.3, w: 8, h: 0.6,
        fontSize: 32, bold: true, color: colors.msBlue, align: 'center',
        fontFace: 'Segoe UI'
    });

    slide6.addText('👤', {
        x: 4.5, y: 1, w: 1, h: 0.8,
        fontSize: 56, align: 'center'
    });

    slide6.addText('80%', {
        x: 3, y: 2, w: 4, h: 1,
        fontSize: 84, bold: true, color: colors.msRed, align: 'center',
        fontFace: 'Segoe UI'
    });

    slide6.addText('以上が「人為的ミス」に起因', {
        x: 2, y: 3.2, w: 6, h: 0.4,
        fontSize: 16, color: colors.msGray, align: 'center',
        fontFace: 'Segoe UI'
    });

    addHighlight(slide6, 1.5, 3.8, 7, 0.8, colors.msRed, '技術的対策だけでは解決できない', 
        'システムの問題ではなく、人間の行動が最大のリスク要因');

    addHighlight(slide6, 2.5, 4.8, 5, 0.6, colors.msBlue, '包括的なセキュリティ戦略が必要');

    // スライド7: 被害規模
    let slide7 = pptx.addSlide();
    slide7.addText('被害の深刻さ', {
        x: 1, y: 0.3, w: 8, h: 0.6,
        fontSize: 32, bold: true, color: colors.msBlue, align: 'center',
        fontFace: 'Segoe UI'
    });

    const damageStats = [
        { icon: '👥', number: '2,800人', label: '平均被害者数', desc: '学校規模を超える影響範囲', color: colors.msBlue },
        { icon: '💰', number: '6億円', label: '平均損害額', desc: '年間予算の5-15%相当', color: colors.msRed },
        { icon: '📅', number: '8ヶ月', label: '対応期間', desc: '長期的な業務影響', color: colors.msYellow },
        { icon: '💸', number: '23億円', label: '最大損害額', desc: '教育委員会予算を圧迫', color: colors.msPurple }
    ];

    for (let i = 0; i < 4; i++) {
        const x = 0.5 + (i % 2) * 4.75;
        const y = 1.3 + Math.floor(i / 2) * 2;
        
        addCard(slide7, x, y, 4, 1.5, damageStats[i].color, damageStats[i].label, 
            damageStats[i].number + '\n' + damageStats[i].desc, damageStats[i].icon);
    }

    // スライド8: 損害額詳細
    let slide8 = pptx.addSlide();
    slide8.addText('6億円の現実', {
        x: 1, y: 0.3, w: 8, h: 0.6,
        fontSize: 32, bold: true, color: colors.msBlue, align: 'center',
        fontFace: 'Segoe UI'
    });

    slide8.addText('💰', {
        x: 4.5, y: 1, w: 1, h: 0.8,
        fontSize: 56, align: 'center'
    });

    slide8.addText('6億円', {
        x: 3, y: 1.8, w: 4, h: 1,
        fontSize: 64, bold: true, color: colors.msRed, align: 'center',
        fontFace: 'Segoe UI'
    });

    slide8.addText('1件あたりの平均損害額', {
        x: 2, y: 2.9, w: 6, h: 0.4,
        fontSize: 16, color: colors.msGray, align: 'center',
        fontFace: 'Segoe UI'
    });

    addCard(slide8, 0.5, 3.5, 3, 1.5, colors.msRed, '直接費用', 
        '• 調査・対応費用\n• 法的対応費用\n• システム復旧費用');
    
    addCard(slide8, 3.75, 3.5, 3, 1.5, colors.msYellow, '間接費用', 
        '• 業務停止による損失\n• 信頼回復のための費用\n• 人件費増加');
    
    addCard(slide8, 7, 3.5, 2.5, 1.5, colors.msPurple, '長期的影響', 
        '• 保護者の信頼失墜\n• 職員モチベーション低下\n• 入学者数への影響');

    // スライド9: 時期的特性
    let slide9 = pptx.addSlide();
    slide9.addText('時期的特性', {
        x: 1, y: 0.3, w: 8, h: 0.6,
        fontSize: 32, bold: true, color: colors.msBlue, align: 'center',
        fontFace: 'Segoe UI'
    });

    addHighlight(slide9, 1, 1, 8, 0.8, colors.msYellow, '高リスク期間', 
        '特定の時期に事故が集中して発生');

    const riskPeriods = [
        { month: '7月', rate: '14.2%', period: '学期末・成績処理期', color: colors.msRed },
        { month: '12月', rate: '12.8%', period: '年度末準備期', color: colors.msYellow },
        { month: '4月', rate: '10.6%', period: '新年度混乱期', color: colors.msBlue }
    ];

    for (let i = 0; i < 3; i++) {
        const x = 1 + i * 2.67;
        addCard(slide9, x, 2.2, 2.5, 2, riskPeriods[i].color, riskPeriods[i].month, 
            riskPeriods[i].rate + '\n' + riskPeriods[i].period, '📅');
    }

    addHighlight(slide9, 2.5, 4.5, 5, 0.8, colors.msBlue, '繁忙期ほど注意が必要', 
        '業務量増加時に人為的ミスが発生しやすい');

    // スライド10: センシティブ情報
    let slide10 = pptx.addSlide();
    slide10.addText('なぜ教育機関が狙われるのか', {
        x: 1, y: 0.3, w: 8, h: 0.6,
        fontSize: 32, bold: true, color: colors.msBlue, align: 'center',
        fontFace: 'Segoe UI'
    });

    slide10.addShape(pptx.ShapeType.rect, {
        x: 1, y: 1, w: 8, h: 4,
        fill: { type: 'solid', color: colors.msGrayLight },
        line: { width: 1, color: colors.msGray }
    });
    
    slide10.addText('フローチャート: 教育機関の脆弱性\n\n[ここにMermaid図を配置]\n\n教育機関\n├─ センシティブ情報の宝庫\n│  ├─ 成績・評価記録\n│  ├─ 健康・医療情報\n│  ├─ 家庭環境情報\n│  └─ 特別支援情報\n└─ 構造的脆弱性\n   ├─ 予算制約（IT予算2-3%）\n   ├─ 専門人材不足（98%が兼任）\n   └─ 多様なアクセス環境', {
        x: 1.5, y: 1.5, w: 7, h: 3,
        fontSize: 14, color: colors.msGray, align: 'left',
        fontFace: 'Courier New'
    });

    // スライド11: 構造的脆弱性
    let slide11 = pptx.addSlide();
    slide11.addText('構造的脆弱性', {
        x: 1, y: 0.3, w: 8, h: 0.6,
        fontSize: 32, bold: true, color: colors.msBlue, align: 'center',
        fontFace: 'Segoe UI'
    });

    const vulnerabilities = [
        { icon: '💰', title: '予算制約', number: '2-3%', desc: 'IT予算は全体の2-3%\n（民間企業の1/3以下）', color: colors.msRed },
        { icon: '👨‍💼', title: '専門人材不足', number: '98%', desc: '情報担当教員の98%が\n他業務と兼任', color: colors.msYellow },
        { icon: '🆔', title: '規則的ID体系', number: '学籍番号', desc: '学籍番号等の\n推測可能なアカウント', color: colors.msBlue },
        { icon: '📶', title: '多様なアクセス環境', number: 'BYOD', desc: '在宅勤務、BYOD等の\n管理困難性', color: colors.msPurple }
    ];

    for (let i = 0; i < 4; i++) {
        const x = 0.25 + (i % 2) * 4.75;
        const y = 1.3 + Math.floor(i / 2) * 2;
        
        addCard(slide11, x, y, 4.5, 1.8, vulnerabilities[i].color, vulnerabilities[i].title, 
            vulnerabilities[i].number + '\n' + vulnerabilities[i].desc, vulnerabilities[i].icon);
    }

    // スライド12: 従来対策の限界
    let slide12 = pptx.addSlide();
    slide12.addText('従来対策の限界', {
        x: 1, y: 0.3, w: 8, h: 0.6,
        fontSize: 32, bold: true, color: colors.msBlue, align: 'center',
        fontFace: 'Segoe UI'
    });

    addCard(slide12, 1, 1, 8, 1.5, colors.msRed, '🛡️ 境界防御の崩壊', 
        'ファイアウォール → 内部侵入後は無力\nVPN → パスワード認証のみでは脆弱\nウイルス対策 → 未知の脅威に対応不可');

    addCard(slide12, 1, 3, 8, 1.5, colors.msYellow, '👥 人的対策の形骸化', 
        '年1回の形式的研修 → 定着率10%以下\n非現実的な運用ルール → 現場で無視・回避\nインシデント訓練不足 → 実際の事故で混乱');

    // スライド13: A5の必要性
    let slide13 = pptx.addSlide();
    slide13.addText('Microsoft 365 A5による解決', {
        x: 1, y: 0.3, w: 8, h: 0.6,
        fontSize: 32, bold: true, color: colors.msBlue, align: 'center',
        fontFace: 'Segoe UI'
    });

    addCard(slide13, 0.5, 1, 4, 2, colors.msRed, 'A3では不十分', 
        '❌ 基本的な脅威検知のみ\n❌ 手動対応が中心\n❌ 内部脅威への対策不足\n❌ データ保護機能が限定的');

    addCard(slide13, 5.5, 1, 4, 2, colors.msGreen, 'A5による完全保護', 
        '✅ AI/ML による24時間監視\n✅ 自動的な脅威の封じ込め\n✅ 内部脅威の事前検知\n✅ 高度なデータ保護機能');

    slide13.addShape(pptx.ShapeType.rect, {
        x: 1, y: 3.5, w: 8, h: 1.5,
        fill: { type: 'solid', color: colors.msGrayLight },
        line: { width: 1, color: colors.msGray }
    });
    
    slide13.addText('A3 vs A5 機能比較レーダーチャート\n\n[ここにChart.jsレーダーチャートを配置]', {
        x: 1.5, y: 4, w: 7, h: 0.8,
        fontSize: 16, color: colors.msGray, align: 'center',
        fontFace: 'Segoe UI'
    });

    // スライド14: A5機能詳細
    let slide14 = pptx.addSlide();
    slide14.addText('A5の完全保護機能', {
        x: 1, y: 0.3, w: 8, h: 0.6,
        fontSize: 32, bold: true, color: colors.msBlue, align: 'center',
        fontFace: 'Segoe UI'
    });

    slide14.addShape(pptx.ShapeType.rect, {
        x: 0.5, y: 1, w: 9, h: 4,
        fill: { type: 'solid', color: colors.msGrayLight },
        line: { width: 1, color: colors.msGray }
    });
    
    slide14.addText('Microsoft 365 A5 完全保護システム図\n\n[ここにMermaid機能フローチャートを配置]\n\nA5 → 4つの主要機能\n├─ 自動化インシデント対応（AI/ML監視、自動封じ込め）\n├─ 内部脅威対策（異常行動検知、リスクスコア）\n├─ 高度データ保護（自動分類、暗号化）\n└─ コンプライアンス自動化（規制準拠、監査記録）', {
        x: 1, y: 1.5, w: 8, h: 3,
        fontSize: 14, color: colors.msGray, align: 'left',
        fontFace: 'Courier New'
    });

    // スライド15: 投資対効果
    let slide15 = pptx.addSlide();
    slide15.addText('投資対効果分析', {
        x: 1, y: 0.3, w: 8, h: 0.6,
        fontSize: 32, bold: true, color: colors.msBlue, align: 'center',
        fontFace: 'Segoe UI'
    });

    // 比較表
    slide15.addShape(pptx.ShapeType.rect, {
        x: 1, y: 1, w: 8, h: 2.5,
        fill: { type: 'solid', color: colors.msWhite },
        line: { width: 1, color: colors.msGray }
    });

    slide15.addText('A3 vs A5 比較表', {
        x: 1.2, y: 1.1, w: 7.6, h: 0.3,
        fontSize: 18, bold: true, color: colors.msBlue, align: 'center',
        fontFace: 'Segoe UI'
    });

    const tableData = [
        ['項目', 'A3', 'A5', '差額の価値'],
        ['月額費用/ユーザー', '862円', '1,611円', '+749円'],
        ['事故防止率', '40-50%', '90-95%', '+50%'],
        ['対応時間削減', '30%', '80%', '+50%'],
        ['人員削減効果', '0.5人分', '2.0人分', '+1.5人分']
    ];

    for (let row = 0; row < tableData.length; row++) {
        for (let col = 0; col < tableData[row].length; col++) {
            const isHeader = row === 0;
            slide15.addText(tableData[row][col], {
                x: 1.2 + col * 1.9, y: 1.5 + row * 0.35, w: 1.8, h: 0.3,
                fontSize: isHeader ? 14 : 12,
                bold: isHeader,
                color: isHeader ? colors.msWhite : colors.msGrayDark,
                align: 'center',
                fontFace: 'Segoe UI'
            });
            
            if (isHeader) {
                slide15.addShape(pptx.ShapeType.rect, {
                    x: 1.2 + col * 1.9, y: 1.5, w: 1.8, h: 0.3,
                    fill: { type: 'solid', color: colors.msBlue },
                    line: { width: 0 }
                });
            }
        }
    }

    addHighlight(slide15, 2.5, 3.8, 5, 1, colors.msBlue, '3.6ヶ月', 
        'ROI試算（1,000人規模）投資回収期間');

    // スライド16: 実装戦略
    let slide16 = pptx.addSlide();
    slide16.addText('段階的移行戦略', {
        x: 1, y: 0.3, w: 8, h: 0.6,
        fontSize: 32, bold: true, color: colors.msBlue, align: 'center',
        fontFace: 'Segoe UI'
    });

    const phases = [
        { phase: 'フェーズ1', duration: '3ヶ月', title: '高リスク領域から開始', 
          items: '管理職・情報担当者へのA5展開\n重要データの特定と保護\n基本的な自動化設定', 
          color: colors.msRed, icon: '🚀' },
        { phase: 'フェーズ2', duration: '6ヶ月', title: '中核業務への拡大', 
          items: '全教職員へのA5展開\n高度な脅威対策の有効化\nインシデント対応体制確立', 
          color: colors.msYellow, icon: '📈' },
        { phase: 'フェーズ3', duration: '12ヶ月', title: '全面展開と最適化', 
          items: '生徒アカウントへの展開検討\n継続的な改善サイクル確立\n完全自動化の実現', 
          color: colors.msGreen, icon: '✅' }
    ];

    for (let i = 0; i < 3; i++) {
        const x = 0.5 + i * 3.17;
        addCard(slide16, x, 1.3, 3, 3, phases[i].color, 
            phases[i].icon + ' ' + phases[i].phase, 
            phases[i].duration + '\n' + phases[i].title + '\n\n' + phases[i].items);
    }

    // タイムライン線
    slide16.addShape(pptx.ShapeType.line, {
        x: 0.5, y: 2.8, w: 9, h: 0,
        line: { width: 4, color: colors.msBlue }
    });

    // スライド17: 緊急性
    let slide17 = pptx.addSlide();
    slide17.addText('今すぐ行動すべき理由', {
        x: 1, y: 0.3, w: 8, h: 0.6,
        fontSize: 32, bold: true, color: colors.msBlue, align: 'center',
        fontFace: 'Segoe UI'
    });

    slide17.addText('1.7日', {
        x: 3, y: 1, w: 4, h: 1,
        fontSize: 72, bold: true, color: colors.msRed, align: 'center',
        fontFace: 'Segoe UI'
    });

    slide17.addText('に1件の事故が発生', {
        x: 2, y: 2.1, w: 6, h: 0.4,
        fontSize: 18, color: colors.msGray, align: 'center',
        fontFace: 'Segoe UI'
    });

    addCard(slide17, 0.5, 2.8, 4, 1.5, colors.msRed, '⚠️ 事故は「いつ起きるか」の問題', 
        'あなたの組織が次の被害者になる可能性');

    addCard(slide17, 5.5, 2.8, 4, 1.5, colors.msBlue, '💹 事故対応コスト', 
        '100倍\n予防コストの100倍以上');

    addHighlight(slide17, 2, 4.5, 6, 0.8, colors.msYellow, '説明責任と信頼', 
        '保護者・地域への説明責任 / 一度失った信頼の回復は困難');

    // スライド18: Call to Action
    let slide18 = pptx.addSlide();
    slide18.addText('決断の時です', {
        x: 1, y: 0.5, w: 8, h: 0.8,
        fontSize: 40, bold: true, color: colors.msBlue, align: 'center',
        fontFace: 'Segoe UI'
    });

    addHighlight(slide18, 1.5, 1.5, 7, 1.2, colors.msBlue, '教育機関の情報セキュリティは', 
        '必須要件\n「できればやる」ものではなく「やらなければ組織が存続できない」');

    addCard(slide18, 1.5, 3, 7, 1, colors.msGreen, '🛡️ Microsoft 365 A5への投資は', 
        '児童生徒の未来と組織の信頼を守る戦略的投資');

    slide18.addText('↓', {
        x: 4.5, y: 4.2, w: 1, h: 0.4,
        fontSize: 32, color: colors.msBlue, align: 'center'
    });

    slide18.addText('今すぐ行動を開始してください', {
        x: 2, y: 4.7, w: 6, h: 0.4,
        fontSize: 20, bold: true, color: colors.msRed, align: 'center',
        fontFace: 'Segoe UI'
    });

    slide18.addText('次の被害者にならないために', {
        x: 2.5, y: 5.1, w: 5, h: 0.3,
        fontSize: 16, color: colors.msGray, align: 'center',
        fontFace: 'Segoe UI'
    });

    // PowerPoint保存
    return pptx.writeFile({ fileName: "教育機関情報セキュリティ危機対策_完全版.pptx" });
}

// 実行
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createCompletePresentationPPTX };
    
    if (require.main === module) {
        createCompletePresentationPPTX()
            .then(() => {
                console.log("✅ 完全版PowerPointプレゼンテーション（18スライド）が正常に作成されました！");
                console.log("📁 ファイル名: 教育機関情報セキュリティ危機対策_完全版.pptx");
                console.log("📊 スライド数: 18");
                console.log("🎨 デザイン: Microsoft Fluent Design System");
                console.log("🔧 機能: グラフィックレコード風レイアウト");
            })
            .catch(err => {
                console.error("❌ PowerPoint作成中にエラーが発生しました:", err);
            });
    }
}

if (typeof window !== 'undefined') {
    window.createCompletePresentationPPTX = createCompletePresentationPPTX;
}