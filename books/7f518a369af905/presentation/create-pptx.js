// PowerPoint生成スクリプト - 教育機関の情報セキュリティ危機と対策
// pptxgenjsを使用してHTMLプレゼンテーションをPPTXに変換

const PptxGenJS = require("pptxgenjs");

// PowerPoint作成
function createSecurityPresentationPPTX() {
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
    pptx.defineLayout({ name: 'A4', width: 10, height: 5.625 });
    pptx.layout = 'A4';

    // マスタースライドテンプレート設定
    pptx.defineSlideMaster({
        title: 'MASTER_SLIDE',
        background: { color: colors.msWhite },
        objects: [
            // スライド番号
            {
                placeholder: {
                    options: { name: 'slideNumber', type: 'body', x: 9.0, y: 5.0, w: 0.8, h: 0.4 },
                    text: '{{slide-number}}'
                }
            }
        ]
    });

    // スライド1: タイトル
    let slide1 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
    slide1.background = { color: colors.msWhite };
    
    // 危機アイコン
    slide1.addText('🛡️', {
        x: 4.5, y: 0.5, w: 1, h: 1,
        fontSize: 72, color: colors.msRed, align: 'center'
    });
    
    // メインタイトル
    slide1.addText('教育機関の情報セキュリティ危機', {
        x: 1, y: 1.5, w: 8, h: 1,
        fontSize: 48, bold: true, color: colors.msBlue, align: 'center',
        fontFace: 'Segoe UI'
    });
    
    // ハイライトボックス
    slide1.addShape(pptx.ShapeType.rect, {
        x: 2, y: 2.7, w: 6, h: 0.8,
        fill: { type: 'solid', color: colors.msBlue },
        line: { width: 0 }
    });
    
    slide1.addText('なぜ今、Microsoft 365 A5が必要なのか', {
        x: 2, y: 2.7, w: 6, h: 0.8,
        fontSize: 24, bold: true, color: colors.msWhite, align: 'center',
        fontFace: 'Segoe UI'
    });
    
    // 大きな数字
    slide1.addText('218件', {
        x: 3, y: 3.8, w: 4, h: 1,
        fontSize: 84, bold: true, color: colors.msRed, align: 'center',
        fontFace: 'Segoe UI'
    });
    
    slide1.addText('2023年度の個人情報漏洩事故件数', {
        x: 2, y: 4.8, w: 6, h: 0.5,
        fontSize: 18, color: colors.msGray, align: 'center',
        fontFace: 'Segoe UI'
    });

    // スライド2: 問題提起
    let slide2 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
    slide2.addText('なぜ今、この話題なのか？', {
        x: 1, y: 0.5, w: 8, h: 0.8,
        fontSize: 36, bold: true, color: colors.msBlue, align: 'center',
        fontFace: 'Segoe UI'
    });

    // 左カード - 深刻化する脅威
    slide2.addShape(pptx.ShapeType.rect, {
        x: 0.5, y: 1.5, w: 4, h: 2.5,
        fill: { type: 'solid', color: colors.msWhite },
        line: { width: 2, color: colors.msRed }
    });
    
    slide2.addText('⚠️', {
        x: 2, y: 1.8, w: 1, h: 0.6,
        fontSize: 48, align: 'center'
    });
    
    slide2.addText('深刻化する脅威', {
        x: 0.7, y: 2.4, w: 3.6, h: 0.4,
        fontSize: 20, bold: true, color: colors.msGrayDark, align: 'center',
        fontFace: 'Segoe UI'
    });
    
    slide2.addText('教育機関への攻撃が急増し、他業種を上回る増加率を記録', {
        x: 0.7, y: 2.9, w: 3.6, h: 0.8,
        fontSize: 14, color: colors.msGray, align: 'center',
        fontFace: 'Segoe UI'
    });

    // 右カード - 影響の甚大さ
    slide2.addShape(pptx.ShapeType.rect, {
        x: 5.5, y: 1.5, w: 4, h: 2.5,
        fill: { type: 'solid', color: colors.msWhite },
        line: { width: 2, color: colors.msYellow }
    });
    
    slide2.addText('👥', {
        x: 7, y: 1.8, w: 1, h: 0.6,
        fontSize: 48, align: 'center'
    });
    
    slide2.addText('影響の甚大さ', {
        x: 5.7, y: 2.4, w: 3.6, h: 0.4,
        fontSize: 20, bold: true, color: colors.msGrayDark, align: 'center',
        fontFace: 'Segoe UI'
    });
    
    slide2.addText('児童生徒の未来に関わるセンシティブ情報の大量保有', {
        x: 5.7, y: 2.9, w: 3.6, h: 0.8,
        fontSize: 14, color: colors.msGray, align: 'center',
        fontFace: 'Segoe UI'
    });

    // 結論
    slide2.addText('組織の存続に関わる必須対策が求められている', {
        x: 1.5, y: 4.5, w: 7, h: 0.6,
        fontSize: 20, italic: true, color: colors.msBlue, align: 'center',
        fontFace: 'Segoe UI'
    });

    // スライド3: 現状認識
    let slide3 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
    slide3.addText('看過できない現実', {
        x: 1, y: 0.3, w: 8, h: 0.6,
        fontSize: 36, bold: true, color: colors.msBlue, align: 'center',
        fontFace: 'Segoe UI'
    });

    // 警告カード
    slide3.addShape(pptx.ShapeType.rect, {
        x: 1, y: 1, w: 8, h: 1,
        fill: { type: 'solid', color: colors.msRed },
        line: { width: 0 }
    });
    
    slide3.addText('🚨 教育機関の情報漏洩事故が急増', {
        x: 1.2, y: 1.2, w: 7.6, h: 0.6,
        fontSize: 24, bold: true, color: colors.msWhite, align: 'left',
        fontFace: 'Segoe UI'
    });

    // 統計グリッド
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
            fontSize: 28, bold: true, color: colors.msRed, align: 'center',
            fontFace: 'Segoe UI'
        });
        
        slide3.addText(years[i], {
            x: 0.5 + i * 2.25, y: 3.5, w: 2, h: 0.4,
            fontSize: 14, color: colors.msGray, align: 'center',
            fontFace: 'Segoe UI'
        });
    }

    // スライド4: 事故増加傾向
    let slide4 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
    slide4.addText('事故増加の深刻性', {
        x: 1, y: 0.3, w: 8, h: 0.6,
        fontSize: 36, bold: true, color: colors.msBlue, align: 'center',
        fontFace: 'Segoe UI'
    });

    // チャートエリア（実際のグラフは手動で追加）
    slide4.addShape(pptx.ShapeType.rect, {
        x: 1, y: 1, w: 8, h: 3,
        fill: { type: 'solid', color: colors.msGrayLight },
        line: { width: 1, color: colors.msGray }
    });
    
    slide4.addText('年度別事故件数推移\n\n[ここにチャートを配置]', {
        x: 1.5, y: 1.5, w: 7, h: 2,
        fontSize: 18, color: colors.msGray, align: 'center',
        fontFace: 'Segoe UI'
    });

    // ハイライト
    slide4.addShape(pptx.ShapeType.rect, {
        x: 2.5, y: 4.2, w: 5, h: 1,
        fill: { type: 'solid', color: colors.msBlue },
        line: { width: 0 }
    });
    
    slide4.addText('28.2%', {
        x: 3.5, y: 4.3, w: 3, h: 0.5,
        fontSize: 48, bold: true, color: colors.msWhite, align: 'center',
        fontFace: 'Segoe UI'
    });
    
    slide4.addText('4年間の事故増加率（他業種は横ばい〜減少）', {
        x: 2.5, y: 4.8, w: 5, h: 0.3,
        fontSize: 14, color: colors.msWhite, align: 'center',
        fontFace: 'Segoe UI'
    });

    // スライド5: 事故原因分析
    let slide5 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
    slide5.addText('事故の真因分析', {
        x: 1, y: 0.3, w: 8, h: 0.6,
        fontSize: 36, bold: true, color: colors.msBlue, align: 'center',
        fontFace: 'Segoe UI'
    });

    // 円グラフエリア
    slide5.addShape(pptx.ShapeType.rect, {
        x: 0.5, y: 1, w: 4.5, h: 3.5,
        fill: { type: 'solid', color: colors.msGrayLight },
        line: { width: 1, color: colors.msGray }
    });
    
    slide5.addText('2023年度 事故原因内訳\n\n[円グラフを配置]', {
        x: 1, y: 2, w: 3.5, h: 1.5,
        fontSize: 16, color: colors.msGray, align: 'center',
        fontFace: 'Segoe UI'
    });

    // 第1位カード
    slide5.addShape(pptx.ShapeType.rect, {
        x: 5.5, y: 1, w: 4, h: 1.5,
        fill: { type: 'solid', color: colors.msWhite },
        line: { width: 2, color: colors.msRed }
    });
    
    slide5.addText('第1位', {
        x: 5.7, y: 1.1, w: 3.6, h: 0.3,
        fontSize: 14, bold: true, color: colors.msGrayDark, align: 'left',
        fontFace: 'Segoe UI'
    });
    
    slide5.addText('45.4%', {
        x: 6.5, y: 1.4, w: 2, h: 0.5,
        fontSize: 36, bold: true, color: colors.msRed, align: 'center',
        fontFace: 'Segoe UI'
    });
    
    slide5.addText('紛失・置き忘れ', {
        x: 5.7, y: 1.9, w: 3.6, h: 0.3,
        fontSize: 16, bold: true, color: colors.msGrayDark, align: 'left',
        fontFace: 'Segoe UI'
    });
    
    slide5.addText('• USBメモリ、書類の紛失\n• 公共交通機関での置き忘れ', {
        x: 5.7, y: 2.2, w: 3.6, h: 0.5,
        fontSize: 12, color: colors.msGray, align: 'left',
        fontFace: 'Segoe UI'
    });

    // 第2位カード
    slide5.addShape(pptx.ShapeType.rect, {
        x: 5.5, y: 3, w: 4, h: 1.5,
        fill: { type: 'solid', color: colors.msWhite },
        line: { width: 2, color: colors.msYellow }
    });
    
    slide5.addText('第2位', {
        x: 5.7, y: 3.1, w: 3.6, h: 0.3,
        fontSize: 14, bold: true, color: colors.msGrayDark, align: 'left',
        fontFace: 'Segoe UI'
    });
    
    slide5.addText('38.5%', {
        x: 6.5, y: 3.4, w: 2, h: 0.5,
        fontSize: 36, bold: true, color: colors.msYellow, align: 'center',
        fontFace: 'Segoe UI'
    });
    
    slide5.addText('誤送信・誤配布', {
        x: 5.7, y: 3.9, w: 3.6, h: 0.3,
        fontSize: 16, bold: true, color: colors.msGrayDark, align: 'left',
        fontFace: 'Segoe UI'
    });
    
    slide5.addText('• メールの宛先間違い\n• BCC設定ミス', {
        x: 5.7, y: 4.2, w: 3.6, h: 0.5,
        fontSize: 12, color: colors.msGray, align: 'left',
        fontFace: 'Segoe UI'
    });

    // スライド6: 人為的ミス
    let slide6 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
    slide6.addText('重要な発見', {
        x: 1, y: 0.3, w: 8, h: 0.6,
        fontSize: 36, bold: true, color: colors.msBlue, align: 'center',
        fontFace: 'Segoe UI'
    });

    slide6.addText('👤', {
        x: 4.5, y: 1, w: 1, h: 0.8,
        fontSize: 64, align: 'center'
    });

    slide6.addText('80%', {
        x: 3, y: 2, w: 4, h: 1,
        fontSize: 96, bold: true, color: colors.msRed, align: 'center',
        fontFace: 'Segoe UI'
    });

    slide6.addText('以上が「人為的ミス」に起因', {
        x: 2, y: 3.2, w: 6, h: 0.4,
        fontSize: 18, color: colors.msGray, align: 'center',
        fontFace: 'Segoe UI'
    });

    slide6.addShape(pptx.ShapeType.rect, {
        x: 1.5, y: 3.8, w: 7, h: 0.8,
        fill: { type: 'solid', color: colors.msRed },
        line: { width: 0 }
    });

    slide6.addText('技術的対策だけでは解決できない', {
        x: 1.7, y: 4, w: 6.6, h: 0.4,
        fontSize: 20, bold: true, color: colors.msWhite, align: 'center',
        fontFace: 'Segoe UI'
    });

    slide6.addText('包括的なセキュリティ戦略が必要', {
        x: 2, y: 4.8, w: 6, h: 0.4,
        fontSize: 18, bold: true, color: colors.msBlue, align: 'center',
        fontFace: 'Segoe UI'
    });

    // スライド7: 被害規模
    let slide7 = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
    slide7.addText('被害の深刻さ', {
        x: 1, y: 0.3, w: 8, h: 0.6,
        fontSize: 36, bold: true, color: colors.msBlue, align: 'center',
        fontFace: 'Segoe UI'
    });

    // 4つの統計カード
    const damageStats = [
        { icon: '👥', number: '2,800人', label: '平均被害者数', color: colors.msBlue },
        { icon: '💰', number: '6億円', label: '平均損害額', color: colors.msRed },
        { icon: '📅', number: '8ヶ月', label: '対応期間', color: colors.msYellow },
        { icon: '💸', number: '23億円', label: '最大損害額', color: colors.msPurple }
    ];

    for (let i = 0; i < 4; i++) {
        const x = 0.5 + (i % 2) * 4.75;
        const y = 1.3 + Math.floor(i / 2) * 2;
        
        slide7.addShape(pptx.ShapeType.rect, {
            x: x, y: y, w: 4, h: 1.5,
            fill: { type: 'solid', color: colors.msWhite },
            line: { width: 2, color: damageStats[i].color }
        });
        
        slide7.addText(damageStats[i].icon, {
            x: x + 0.2, y: y + 0.1, w: 0.8, h: 0.6,
            fontSize: 32, align: 'center'
        });
        
        slide7.addText(damageStats[i].label, {
            x: x + 1.2, y: y + 0.1, w: 2.6, h: 0.4,
            fontSize: 16, bold: true, color: colors.msGrayDark, align: 'left',
            fontFace: 'Segoe UI'
        });
        
        slide7.addText(damageStats[i].number, {
            x: x + 1.2, y: y + 0.6, w: 2.6, h: 0.6,
            fontSize: 32, bold: true, color: damageStats[i].color, align: 'left',
            fontFace: 'Segoe UI'
        });
    }

    // スライド8以降は同様のパターンで作成...
    // [省略 - 実際の実装では全18スライドを作成]

    // Call to Action スライド (最終スライド)
    let slideFinale = pptx.addSlide({ masterName: 'MASTER_SLIDE' });
    slideFinale.addText('決断の時です', {
        x: 1, y: 0.5, w: 8, h: 0.8,
        fontSize: 48, bold: true, color: colors.msBlue, align: 'center',
        fontFace: 'Segoe UI'
    });

    slideFinale.addShape(pptx.ShapeType.rect, {
        x: 1.5, y: 1.5, w: 7, h: 1.2,
        fill: { type: 'solid', color: colors.msBlue },
        line: { width: 0 }
    });

    slideFinale.addText('教育機関の情報セキュリティは', {
        x: 1.7, y: 1.6, w: 6.6, h: 0.4,
        fontSize: 20, bold: true, color: colors.msWhite, align: 'center',
        fontFace: 'Segoe UI'
    });

    slideFinale.addText('必須要件', {
        x: 3, y: 2, w: 4, h: 0.5,
        fontSize: 36, bold: true, color: colors.msWhite, align: 'center',
        fontFace: 'Segoe UI'
    });

    slideFinale.addText('「できればやる」ものではなく「やらなければ組織が存続できない」', {
        x: 1.7, y: 2.5, w: 6.6, h: 0.4,
        fontSize: 14, color: colors.msWhite, align: 'center',
        fontFace: 'Segoe UI'
    });

    slideFinale.addShape(pptx.ShapeType.rect, {
        x: 1.5, y: 3, w: 7, h: 1,
        fill: { type: 'solid', color: colors.msGreen },
        line: { width: 0 }
    });

    slideFinale.addText('Microsoft 365 A5への投資は\n児童生徒の未来と組織の信頼を守る戦略的投資', {
        x: 1.7, y: 3.2, w: 6.6, h: 0.6,
        fontSize: 16, bold: true, color: colors.msWhite, align: 'center',
        fontFace: 'Segoe UI'
    });

    slideFinale.addText('今すぐ行動を開始してください', {
        x: 2, y: 4.3, w: 6, h: 0.6,
        fontSize: 24, bold: true, color: colors.msRed, align: 'center',
        fontFace: 'Segoe UI'
    });

    slideFinale.addText('次の被害者にならないために', {
        x: 2.5, y: 4.9, w: 5, h: 0.4,
        fontSize: 18, color: colors.msGray, align: 'center',
        fontFace: 'Segoe UI'
    });

    // PowerPoint保存
    return pptx.writeFile({ fileName: "教育機関情報セキュリティ危機対策.pptx" });
}

// Node.js環境での実行
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { createSecurityPresentationPPTX };
    
    // 直接実行時
    if (require.main === module) {
        createSecurityPresentationPPTX()
            .then(() => {
                console.log("PowerPointプレゼンテーションが正常に作成されました！");
                console.log("ファイル名: 教育機関情報セキュリティ危機対策.pptx");
            })
            .catch(err => {
                console.error("PowerPoint作成中にエラーが発生しました:", err);
            });
    }
}

// ブラウザ環境での実行用
if (typeof window !== 'undefined') {
    window.createSecurityPresentationPPTX = createSecurityPresentationPPTX;
}