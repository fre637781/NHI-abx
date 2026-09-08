/* 自動產生，請勿手動編輯。
   來源：data/antimicrobials.json；重新產生：python3 tools/build.py */
window.NHI_DATA = {
  "meta": {
    "title": "健保藥品給付規定 — 抗微生物劑查詢",
    "sectionName": "第10節 抗微生物劑 Antimicrobial agents",
    "status": "seed",
    "statusLabel": "種子資料（未經官方檔案核對）",
    "version": "seed-0.1",
    "generatedAt": "2026-09-08",
    "effectiveDate": null,
    "source": {
      "name": "衛生福利部中央健康保險署／藥品給付規定（分章節）",
      "url": "https://www.nhi.gov.tw/ch/cp-7593-ad2a9-3397-1.html",
      "fullUrl": "https://www.nhi.gov.tw/ch/np-2508-1.html"
    },
    "notice": "本站為臨床查詢輔助之整理摘要，非官方文件。實際給付條件、條號與生效日期一律以健保署最新公告為準；用藥決策請依原文與專業判斷。執行 tools/import_nhi.py 匯入官方檔案後，本資料將被官方原文取代。"
  },
  "categories": [
    {
      "id": "general",
      "label": "通則",
      "color": "slate"
    },
    {
      "id": "antibiotic",
      "label": "抗細菌劑",
      "color": "blue"
    },
    {
      "id": "antifungal",
      "label": "抗黴菌劑",
      "color": "amber"
    },
    {
      "id": "antiviral",
      "label": "抗病毒劑",
      "color": "violet"
    },
    {
      "id": "hepatitis",
      "label": "肝炎抗病毒",
      "color": "teal"
    },
    {
      "id": "tb",
      "label": "抗結核／NTM",
      "color": "rose"
    },
    {
      "id": "hiv",
      "label": "抗 HIV",
      "color": "indigo"
    },
    {
      "id": "parasite",
      "label": "抗寄生蟲／瘧疾",
      "color": "green"
    }
  ],
  "fundingTypes": [
    {
      "id": "nhi",
      "label": "健保給付"
    },
    {
      "id": "public",
      "label": "公費（疾管署等）"
    },
    {
      "id": "mixed",
      "label": "健保／公費併行"
    }
  ],
  "items": [
    {
      "id": "gen-10-1-uri",
      "section": "10.1",
      "sectionConfidence": "high",
      "category": "general",
      "title": "上呼吸道感染不常規使用抗生素",
      "drugs": [],
      "funding": "nhi",
      "summary": "上呼吸道感染病患如屬一般感冒或病毒性感染者，不應使用抗生素；需使用時應有細菌性感染之臨床佐證。",
      "provisions": [
        "一般感冒、病毒性上呼吸道感染不應使用抗生素。",
        "如需使用，應具細菌性感染之臨床佐證（如細菌性中耳炎、細菌性鼻竇炎、細菌性咽炎等）。",
        "病歷應記載支持細菌性感染之依據。"
      ],
      "flags": {
        "priorAuth": false,
        "cultureRequired": false,
        "specialist": false,
        "inpatientOnly": false
      },
      "tags": [
        "通則",
        "上呼吸道感染",
        "抗生素管理",
        "感冒"
      ],
      "sourceConfirmed": true
    },
    {
      "id": "gen-10-1-firstline",
      "section": "10.1",
      "sectionConfidence": "high",
      "category": "general",
      "title": "優先使用第一線抗微生物製劑",
      "drugs": [],
      "funding": "nhi",
      "summary": "處方應優先使用「第一線抗微生物製劑品名表（附表一）」所列品項；經培養及藥敏證實或臨床需要時，方得依抗微生物製劑使用原則使用非第一線藥品。",
      "provisions": [
        "優先使用附表一所列之第一線抗微生物製劑。",
        "經微生物培養及藥物敏感試驗證實有效，或臨床情況確有需要者，得使用非第一線品項。",
        "使用非第一線品項時，應依健保抗微生物製劑使用原則辦理並於病歷載明理由。"
      ],
      "flags": {
        "priorAuth": false,
        "cultureRequired": false,
        "specialist": false,
        "inpatientOnly": false
      },
      "tags": [
        "通則",
        "第一線",
        "附表一",
        "抗生素管理"
      ],
      "sourceConfirmed": true
    },
    {
      "id": "gen-10-1-cost",
      "section": "10.1",
      "sectionConfidence": "high",
      "category": "general",
      "title": "同等療效選擇價格低廉者",
      "drugs": [],
      "funding": "nhi",
      "summary": "抗微生物製劑之使用，應本同等療效者選擇價格較低廉者之原則。",
      "provisions": [
        "療效相當之品項，應選用價格較低廉者。"
      ],
      "flags": {
        "priorAuth": false,
        "cultureRequired": false,
        "specialist": false,
        "inpatientOnly": false
      },
      "tags": [
        "通則",
        "成本效益"
      ],
      "sourceConfirmed": true
    },
    {
      "id": "gen-10-1-three-agents",
      "section": "10.1",
      "sectionConfidence": "high",
      "category": "general",
      "title": "併用三種（含）以上抗微生物製劑需附培養及藥敏報告",
      "drugs": [],
      "funding": "nhi",
      "summary": "同時使用三種（含）以上抗微生物製劑者，需檢附微生物培養及藥物敏感試驗報告。",
      "provisions": [
        "使用三種（含）以上抗微生物製劑，需檢附微生物培養及藥物敏感試驗報告備查。"
      ],
      "flags": {
        "priorAuth": false,
        "cultureRequired": true,
        "specialist": false,
        "inpatientOnly": false
      },
      "tags": [
        "通則",
        "併用",
        "藥敏報告",
        "培養"
      ],
      "sourceConfirmed": true
    },
    {
      "id": "gen-10-1-osteomyelitis",
      "section": "10.1",
      "sectionConfidence": "high",
      "category": "general",
      "title": "慢性骨髓炎得延長給藥日數",
      "drugs": [],
      "funding": "nhi",
      "summary": "慢性骨髓炎病患得視病情需要延長抗微生物製劑之給藥日數。",
      "provisions": [
        "慢性骨髓炎病患，得視病情需要延長給藥日數，惟應於病歷詳實記載。"
      ],
      "flags": {
        "priorAuth": false,
        "cultureRequired": false,
        "specialist": false,
        "inpatientOnly": false
      },
      "tags": [
        "通則",
        "骨髓炎",
        "療程"
      ],
      "sourceConfirmed": true
    },
    {
      "id": "abx-ceftaroline",
      "section": null,
      "sectionConfidence": "unknown",
      "category": "antibiotic",
      "title": "Ceftaroline fosamil",
      "drugs": [
        {
          "generic": "Ceftaroline fosamil",
          "zh": "希復信",
          "brands": [
            "Zinforo"
          ]
        }
      ],
      "funding": "nhi",
      "summary": "限用於：(1) 社區性肺炎經治療失敗者；(2) 證實或高度懷疑 MRSA 之複雜性皮膚及軟組織感染。",
      "provisions": [
        "社區性肺炎經第一線治療失敗者。",
        "經證實或高度懷疑為 MRSA 引起之複雜性皮膚及軟組織感染。"
      ],
      "flags": {
        "priorAuth": false,
        "cultureRequired": false,
        "specialist": false,
        "inpatientOnly": false
      },
      "tags": [
        "MRSA",
        "社區性肺炎",
        "皮膚軟組織感染",
        "cephalosporin",
        "第五代頭孢"
      ],
      "sourceConfirmed": true
    },
    {
      "id": "abx-imipenem-relebactam",
      "section": null,
      "sectionConfidence": "unknown",
      "category": "antibiotic",
      "title": "Imipenem + cilastatin + relebactam",
      "drugs": [
        {
          "generic": "Imipenem/cilastatin/relebactam",
          "zh": "",
          "brands": [
            "Recarbrio"
          ]
        }
      ],
      "funding": "nhi",
      "summary": "限用於抗藥性革蘭氏陰性菌感染且其他治療選擇有限者；給付規定於 114 年 1 月 1 日生效。",
      "provisions": [
        "限治療選擇有限之抗藥性革蘭氏陰性菌感染。",
        "應有微生物培養及藥物敏感試驗結果支持。",
        "本項給付規定自 114 年 1 月 1 日生效。"
      ],
      "flags": {
        "priorAuth": true,
        "cultureRequired": true,
        "specialist": true,
        "inpatientOnly": true
      },
      "tags": [
        "carbapenem",
        "抗藥性",
        "革蘭氏陰性菌",
        "CRE",
        "114年"
      ],
      "sourceConfirmed": true,
      "note": "生效日與品項名稱來自公告資訊；詳細適應症文字請以官方原文核對。"
    },
    {
      "id": "abx-ceftazidime-avibactam",
      "section": null,
      "sectionConfidence": "unknown",
      "category": "antibiotic",
      "title": "Ceftazidime + avibactam",
      "drugs": [
        {
          "generic": "Ceftazidime/avibactam",
          "zh": "",
          "brands": [
            "Zavicefta"
          ]
        }
      ],
      "funding": "nhi",
      "summary": "限用於多重抗藥性革蘭氏陰性菌（含碳青黴烯類抗藥腸內菌 CRE）感染，且經藥敏證實、其他藥品不適用者。",
      "provisions": [
        "限多重抗藥性革蘭氏陰性菌感染（如 CRE、抗藥性 Pseudomonas aeruginosa）。",
        "須有微生物培養及藥物敏感試驗報告支持。",
        "建議經感染科專科醫師照會或會診後使用。"
      ],
      "flags": {
        "priorAuth": true,
        "cultureRequired": true,
        "specialist": true,
        "inpatientOnly": true
      },
      "tags": [
        "CRE",
        "多重抗藥性",
        "革蘭氏陰性菌",
        "beta-lactamase inhibitor"
      ],
      "sourceConfirmed": false
    },
    {
      "id": "abx-ceftolozane-tazobactam",
      "section": null,
      "sectionConfidence": "unknown",
      "category": "antibiotic",
      "title": "Ceftolozane + tazobactam",
      "drugs": [
        {
          "generic": "Ceftolozane/tazobactam",
          "zh": "",
          "brands": [
            "Zerbaxa"
          ]
        }
      ],
      "funding": "nhi",
      "summary": "限用於複雜性腹腔內感染、複雜性泌尿道感染或抗藥性 Pseudomonas aeruginosa 感染，且其他藥品不適用者。",
      "provisions": [
        "限複雜性腹腔內感染、複雜性泌尿道感染（含腎盂腎炎）或院內感染性肺炎。",
        "以抗藥性 Pseudomonas aeruginosa 等多重抗藥革蘭氏陰性菌為主要對象。",
        "須有培養及藥敏報告支持。"
      ],
      "flags": {
        "priorAuth": true,
        "cultureRequired": true,
        "specialist": true,
        "inpatientOnly": true
      },
      "tags": [
        "Pseudomonas",
        "多重抗藥性",
        "腹腔內感染",
        "泌尿道感染"
      ],
      "sourceConfirmed": false
    },
    {
      "id": "abx-colistin",
      "section": null,
      "sectionConfidence": "unknown",
      "category": "antibiotic",
      "title": "Colistin (Colistimethate sodium)",
      "drugs": [
        {
          "generic": "Colistimethate sodium",
          "zh": "克痢黴素",
          "brands": [
            "Colimycin",
            "Colistin"
          ]
        }
      ],
      "funding": "nhi",
      "summary": "限用於多重抗藥性革蘭氏陰性菌（如 MDR Acinetobacter baumannii、Pseudomonas aeruginosa）感染，且經藥敏證實其他抗生素無效者。",
      "provisions": [
        "限多重抗藥性革蘭氏陰性菌感染。",
        "須經微生物培養及藥物敏感試驗證實對本品有感受性、且其他抗生素無效或不適用。",
        "使用期間應監測腎功能。"
      ],
      "flags": {
        "priorAuth": false,
        "cultureRequired": true,
        "specialist": true,
        "inpatientOnly": true
      },
      "tags": [
        "MDR",
        "Acinetobacter",
        "Pseudomonas",
        "polymyxin",
        "腎毒性"
      ],
      "sourceConfirmed": false
    },
    {
      "id": "abx-tigecycline",
      "section": null,
      "sectionConfidence": "unknown",
      "category": "antibiotic",
      "title": "Tigecycline",
      "drugs": [
        {
          "generic": "Tigecycline",
          "zh": "老虎黴素",
          "brands": [
            "Tygacil"
          ]
        }
      ],
      "funding": "nhi",
      "summary": "限用於複雜性腹腔內感染、複雜性皮膚及軟組織感染，且其他抗生素不適用者；不建議用於院內感染性肺炎及菌血症。",
      "provisions": [
        "限複雜性腹腔內感染或複雜性皮膚及軟組織感染。",
        "限其他抗生素無效、不適用或有禁忌者。",
        "不適用於院內感染性／呼吸器相關肺炎。"
      ],
      "flags": {
        "priorAuth": false,
        "cultureRequired": true,
        "specialist": true,
        "inpatientOnly": true
      },
      "tags": [
        "複雜性腹腔內感染",
        "皮膚軟組織感染",
        "glycylcycline",
        "MDR"
      ],
      "sourceConfirmed": false
    },
    {
      "id": "abx-daptomycin",
      "section": null,
      "sectionConfidence": "unknown",
      "category": "antibiotic",
      "title": "Daptomycin",
      "drugs": [
        {
          "generic": "Daptomycin",
          "zh": "",
          "brands": [
            "Cubicin"
          ]
        }
      ],
      "funding": "nhi",
      "summary": "限用於 MRSA 等革蘭氏陽性菌之複雜性皮膚及軟組織感染、菌血症或右側感染性心內膜炎；不得用於肺炎。",
      "provisions": [
        "限複雜性皮膚及軟組織感染、金黃色葡萄球菌菌血症或右側感染性心內膜炎。",
        "限 vancomycin 無效、不能耐受或藥敏不適用者。",
        "因會被肺部界面活性劑去活化，不得用於肺炎之治療。"
      ],
      "flags": {
        "priorAuth": false,
        "cultureRequired": true,
        "specialist": true,
        "inpatientOnly": true
      },
      "tags": [
        "MRSA",
        "菌血症",
        "心內膜炎",
        "不可用於肺炎",
        "革蘭氏陽性菌"
      ],
      "sourceConfirmed": false
    },
    {
      "id": "abx-linezolid",
      "section": null,
      "sectionConfidence": "unknown",
      "category": "antibiotic",
      "title": "Linezolid",
      "drugs": [
        {
          "generic": "Linezolid",
          "zh": "採佳寧",
          "brands": [
            "Zyvox"
          ]
        }
      ],
      "funding": "nhi",
      "summary": "限用於 MRSA 或 VRE 感染，且 vancomycin 無效、不能耐受或不適用者；有療程長度限制。",
      "provisions": [
        "限抗萬古黴素腸球菌（VRE）感染，或 MRSA 引起之院內感染性肺炎、複雜性皮膚及軟組織感染。",
        "限 vancomycin 治療失敗、無法耐受或有禁忌者。",
        "療程應依感染部位並依規定日數，長期使用須監測血液學不良反應。"
      ],
      "flags": {
        "priorAuth": false,
        "cultureRequired": true,
        "specialist": true,
        "inpatientOnly": false
      },
      "tags": [
        "MRSA",
        "VRE",
        "oxazolidinone",
        "院內肺炎",
        "血小板低下"
      ],
      "sourceConfirmed": false
    },
    {
      "id": "abx-vancomycin",
      "section": null,
      "sectionConfidence": "unknown",
      "category": "antibiotic",
      "title": "Vancomycin（注射／口服）",
      "drugs": [
        {
          "generic": "Vancomycin",
          "zh": "萬古黴素",
          "brands": [
            "Vancocin"
          ]
        }
      ],
      "funding": "nhi",
      "summary": "注射劑限 MRSA 等抗藥性革蘭氏陽性菌感染或 beta-lactam 過敏者；口服劑型限困難梭狀桿菌（C. difficile）相關腹瀉／偽膜性結腸炎。",
      "provisions": [
        "注射劑：限 MRSA、MRSE 等抗藥性革蘭氏陽性菌感染，或對 beta-lactam 類過敏無法使用者。",
        "口服膠囊／溶液：限 Clostridioides difficile 相關腹瀉或偽膜性結腸炎（口服不吸收，不可作為全身性治療）。",
        "建議監測血中濃度（trough level）與腎功能。"
      ],
      "flags": {
        "priorAuth": false,
        "cultureRequired": false,
        "specialist": false,
        "inpatientOnly": false
      },
      "tags": [
        "MRSA",
        "glycopeptide",
        "C. difficile",
        "偽膜性結腸炎",
        "TDM"
      ],
      "sourceConfirmed": false
    },
    {
      "id": "abx-teicoplanin",
      "section": null,
      "sectionConfidence": "unknown",
      "category": "antibiotic",
      "title": "Teicoplanin",
      "drugs": [
        {
          "generic": "Teicoplanin",
          "zh": "",
          "brands": [
            "Targocid"
          ]
        }
      ],
      "funding": "nhi",
      "summary": "限用於 MRSA 等抗藥性革蘭氏陽性菌感染，且 vancomycin 無法耐受（如腎功能不全、紅人症候群）或不適用者。",
      "provisions": [
        "限抗藥性革蘭氏陽性菌感染。",
        "限 vancomycin 無法耐受或不適用者（腎功能不全、輸注反應等）。"
      ],
      "flags": {
        "priorAuth": false,
        "cultureRequired": false,
        "specialist": false,
        "inpatientOnly": false
      },
      "tags": [
        "MRSA",
        "glycopeptide",
        "腎功能不全"
      ],
      "sourceConfirmed": false
    },
    {
      "id": "abx-carbapenem",
      "section": null,
      "sectionConfidence": "unknown",
      "category": "antibiotic",
      "title": "Carbapenems（Imipenem／Meropenem／Ertapenem／Doripenem）",
      "drugs": [
        {
          "generic": "Imipenem/cilastatin",
          "zh": "",
          "brands": [
            "Tienam"
          ]
        },
        {
          "generic": "Meropenem",
          "zh": "",
          "brands": [
            "Mepem"
          ]
        },
        {
          "generic": "Ertapenem",
          "zh": "",
          "brands": [
            "Invanz"
          ]
        },
        {
          "generic": "Doripenem",
          "zh": "",
          "brands": [
            "Finibax"
          ]
        }
      ],
      "funding": "nhi",
      "summary": "限用於嚴重或多重抗藥性菌感染、產 ESBL 菌株感染、混合性重症感染等，且第一線抗生素無效或不適用者。Meropenem 另可用於細菌性腦膜炎。",
      "provisions": [
        "限重症感染（敗血症、院內感染性肺炎、複雜性腹腔內感染等）且第一線抗生素治療無效或不適用者。",
        "產 ESBL 之腸內菌感染，經培養及藥敏證實者。",
        "Ertapenem 對 Pseudomonas aeruginosa 及 Acinetobacter 無效，不適用於此類感染。",
        "Meropenem 可用於細菌性腦膜炎。"
      ],
      "flags": {
        "priorAuth": false,
        "cultureRequired": true,
        "specialist": false,
        "inpatientOnly": true
      },
      "tags": [
        "ESBL",
        "重症感染",
        "carbapenem",
        "敗血症",
        "腦膜炎"
      ],
      "sourceConfirmed": false
    },
    {
      "id": "abx-piptazo",
      "section": null,
      "sectionConfidence": "unknown",
      "category": "antibiotic",
      "title": "Piperacillin + tazobactam",
      "drugs": [
        {
          "generic": "Piperacillin/tazobactam",
          "zh": "",
          "brands": [
            "Tazocin"
          ]
        }
      ],
      "funding": "nhi",
      "summary": "限用於中重度院內感染、混合厭氧菌感染、嗜中性白血球低下發燒等；為常用之廣效經驗性治療藥品。",
      "provisions": [
        "限中重度院內感染、複雜性腹腔內感染、嗜中性白血球低下之發燒。",
        "疑似或證實含厭氧菌、Pseudomonas 之混合感染。"
      ],
      "flags": {
        "priorAuth": false,
        "cultureRequired": false,
        "specialist": false,
        "inpatientOnly": true
      },
      "tags": [
        "院內感染",
        "厭氧菌",
        "Pseudomonas",
        "發燒性嗜中性白血球低下"
      ],
      "sourceConfirmed": false
    },
    {
      "id": "abx-fidaxomicin",
      "section": null,
      "sectionConfidence": "unknown",
      "category": "antibiotic",
      "title": "Fidaxomicin",
      "drugs": [
        {
          "generic": "Fidaxomicin",
          "zh": "",
          "brands": [
            "Dificid"
          ]
        }
      ],
      "funding": "nhi",
      "summary": "限用於復發性或高復發風險之困難梭狀桿菌（C. difficile）感染，且 metronidazole／vancomycin 治療失敗者。",
      "provisions": [
        "限 Clostridioides difficile 感染復發者，或第一線治療失敗者。",
        "須有毒素檢測或培養等實驗室佐證。"
      ],
      "flags": {
        "priorAuth": true,
        "cultureRequired": true,
        "specialist": true,
        "inpatientOnly": false
      },
      "tags": [
        "C. difficile",
        "復發",
        "偽膜性結腸炎"
      ],
      "sourceConfirmed": false
    },
    {
      "id": "abx-fluoroquinolone",
      "section": null,
      "sectionConfidence": "unknown",
      "category": "antibiotic",
      "title": "呼吸道 Fluoroquinolones（Levofloxacin／Moxifloxacin）",
      "drugs": [
        {
          "generic": "Levofloxacin",
          "zh": "",
          "brands": [
            "Cravit"
          ]
        },
        {
          "generic": "Moxifloxacin",
          "zh": "",
          "brands": [
            "Avelox"
          ]
        }
      ],
      "funding": "nhi",
      "summary": "限用於社區性肺炎、複雜性泌尿道感染等，且第一線藥品無效、不適用或病患對 beta-lactam 過敏者；不建議用於單純上呼吸道感染。",
      "provisions": [
        "限社區性肺炎、慢性阻塞性肺病急性惡化併細菌感染、複雜性泌尿道感染等。",
        "限第一線抗生素無效、不能耐受或有禁忌（如 beta-lactam 過敏）者。",
        "不應用於一般感冒或單純性上呼吸道感染。",
        "使用前應留意肌腱炎、主動脈剝離等安全性警語與結核病遮蔽風險。"
      ],
      "flags": {
        "priorAuth": false,
        "cultureRequired": false,
        "specialist": false,
        "inpatientOnly": false
      },
      "tags": [
        "社區性肺炎",
        "quinolone",
        "COPD",
        "泌尿道感染",
        "安全性警語"
      ],
      "sourceConfirmed": false
    },
    {
      "id": "af-voriconazole",
      "section": null,
      "sectionConfidence": "unknown",
      "category": "antifungal",
      "title": "Voriconazole",
      "drugs": [
        {
          "generic": "Voriconazole",
          "zh": "",
          "brands": [
            "Vfend"
          ]
        }
      ],
      "funding": "nhi",
      "summary": "限用於侵襲性麴菌症（invasive aspergillosis）、Scedosporium／Fusarium 感染，或對 fluconazole 具抗藥性之念珠菌感染；須專科醫師診斷並檢附相關佐證。",
      "provisions": [
        "限侵襲性麴菌症之治療。",
        "限 Scedosporium spp.、Fusarium spp. 等嚴重黴菌感染。",
        "對 fluconazole 具抗藥性之嚴重侵襲性念珠菌感染。",
        "須由感染科、血液腫瘤科或相關專科醫師評估，並檢附影像、培養或血清學（如 galactomannan）等佐證。"
      ],
      "flags": {
        "priorAuth": true,
        "cultureRequired": true,
        "specialist": true,
        "inpatientOnly": false
      },
      "tags": [
        "侵襲性麴菌症",
        "aspergillosis",
        "azole",
        "galactomannan",
        "免疫低下"
      ],
      "sourceConfirmed": false
    },
    {
      "id": "af-lamb",
      "section": null,
      "sectionConfidence": "unknown",
      "category": "antifungal",
      "title": "Liposomal amphotericin B",
      "drugs": [
        {
          "generic": "Amphotericin B liposome",
          "zh": "微脂粒兩性黴素B",
          "brands": [
            "AmBisome"
          ]
        }
      ],
      "funding": "nhi",
      "summary": "限用於傳統 amphotericin B deoxycholate 無法耐受、有腎功能不全或治療無效之侵襲性黴菌感染。",
      "provisions": [
        "限侵襲性黴菌感染（麴菌症、隱球菌腦膜炎、毛黴菌症等）。",
        "限使用傳統 amphotericin B 產生腎毒性、嚴重輸注反應或無法耐受者。",
        "或治療前已有腎功能不全（如血清肌酸酐超過規定值）者。"
      ],
      "flags": {
        "priorAuth": true,
        "cultureRequired": false,
        "specialist": true,
        "inpatientOnly": true
      },
      "tags": [
        "侵襲性黴菌感染",
        "腎毒性",
        "隱球菌",
        "毛黴菌",
        "免疫低下"
      ],
      "sourceConfirmed": false
    },
    {
      "id": "af-echinocandin",
      "section": null,
      "sectionConfidence": "unknown",
      "category": "antifungal",
      "title": "Echinocandins（Caspofungin／Micafungin／Anidulafungin）",
      "drugs": [
        {
          "generic": "Caspofungin",
          "zh": "",
          "brands": [
            "Cancidas"
          ]
        },
        {
          "generic": "Micafungin",
          "zh": "",
          "brands": [
            "Mycamine"
          ]
        },
        {
          "generic": "Anidulafungin",
          "zh": "",
          "brands": [
            "Eraxis"
          ]
        }
      ],
      "funding": "nhi",
      "summary": "限用於侵襲性念珠菌症（含念珠菌血症）、食道念珠菌症，或對其他治療無效／不能耐受之侵襲性麴菌症。",
      "provisions": [
        "限侵襲性念珠菌症（含念珠菌血症、腹腔內念珠菌感染）。",
        "食道念珠菌症且對 fluconazole 無效或不適用者。",
        "侵襲性麴菌症之救援治療（對其他抗黴菌劑無效或無法耐受）。",
        "Micafungin 另有造血幹細胞移植病患預防之使用情形。"
      ],
      "flags": {
        "priorAuth": true,
        "cultureRequired": true,
        "specialist": true,
        "inpatientOnly": true
      },
      "tags": [
        "念珠菌血症",
        "candidemia",
        "echinocandin",
        "食道念珠菌",
        "移植"
      ],
      "sourceConfirmed": false
    },
    {
      "id": "af-posaconazole",
      "section": null,
      "sectionConfidence": "unknown",
      "category": "antifungal",
      "title": "Posaconazole",
      "drugs": [
        {
          "generic": "Posaconazole",
          "zh": "",
          "brands": [
            "Noxafil"
          ]
        }
      ],
      "funding": "nhi",
      "summary": "限用於高風險病患之侵襲性黴菌感染預防（如 AML／MDS 接受化療產生長期嗜中性白血球低下、造血幹細胞移植後 GVHD），或救援治療。",
      "provisions": [
        "預防：急性骨髓性白血病／骨髓分化不良症候群接受化療併長期嗜中性白血球低下者。",
        "預防：造血幹細胞移植後接受高劑量免疫抑制劑治療移植物抗宿主疾病（GVHD）者。",
        "治療：對第一線抗黴菌劑無效或無法耐受之侵襲性麴菌症等。"
      ],
      "flags": {
        "priorAuth": true,
        "cultureRequired": false,
        "specialist": true,
        "inpatientOnly": false
      },
      "tags": [
        "預防性投藥",
        "AML",
        "GVHD",
        "移植",
        "嗜中性白血球低下"
      ],
      "sourceConfirmed": false
    },
    {
      "id": "af-fluconazole",
      "section": null,
      "sectionConfidence": "unknown",
      "category": "antifungal",
      "title": "Fluconazole",
      "drugs": [
        {
          "generic": "Fluconazole",
          "zh": "",
          "brands": [
            "Diflucan"
          ]
        }
      ],
      "funding": "nhi",
      "summary": "用於念珠菌症（口咽、食道、泌尿道、全身性）及隱球菌腦膜炎之後續治療；為第一線 azole 類抗黴菌劑。",
      "provisions": [
        "口咽及食道念珠菌症、念珠菌血症、腹腔內念珠菌感染。",
        "隱球菌腦膜炎之鞏固及維持治療。",
        "對 fluconazole 具抗藥性之菌種（如 C. krusei、部分 C. glabrata）不適用。"
      ],
      "flags": {
        "priorAuth": false,
        "cultureRequired": false,
        "specialist": false,
        "inpatientOnly": false
      },
      "tags": [
        "念珠菌",
        "隱球菌",
        "azole",
        "第一線"
      ],
      "sourceConfirmed": false
    },
    {
      "id": "af-itraconazole",
      "section": null,
      "sectionConfidence": "unknown",
      "category": "antifungal",
      "title": "Itraconazole",
      "drugs": [
        {
          "generic": "Itraconazole",
          "zh": "",
          "brands": [
            "Sporanox"
          ]
        }
      ],
      "funding": "nhi",
      "summary": "用於皮癬菌症、甲癬、念珠菌症及部分深部黴菌感染；甲癬等適應症常有療程與檢驗（如黴菌鏡檢／培養）之規定。",
      "provisions": [
        "甲癬（灰指甲）須有黴菌學檢查佐證，並依規定療程給付。",
        "深部黴菌感染（如組織漿菌症、芽生菌症）之治療。",
        "注意與多種藥品之交互作用及心衰竭禁忌。"
      ],
      "flags": {
        "priorAuth": false,
        "cultureRequired": true,
        "specialist": false,
        "inpatientOnly": false
      },
      "tags": [
        "甲癬",
        "灰指甲",
        "皮癬菌",
        "azole",
        "藥物交互作用"
      ],
      "sourceConfirmed": false
    },
    {
      "id": "av-oseltamivir",
      "section": null,
      "sectionConfidence": "unknown",
      "category": "antiviral",
      "title": "Oseltamivir",
      "drugs": [
        {
          "generic": "Oseltamivir",
          "zh": "克流感",
          "brands": [
            "Tamiflu"
          ]
        }
      ],
      "funding": "mixed",
      "summary": "流感抗病毒藥劑之使用依疾管署公費對象及健保給付規定辦理；公費對象包含符合條件之類流感重症、高危險群、群聚感染等。",
      "provisions": [
        "符合疾管署公費流感抗病毒藥劑使用對象者，優先適用公費。",
        "常見公費對象：符合流感併發重症通報條件、具重症高危險因子（如慢性病、孕婦、幼兒、長者、BMI≧30）、家庭或群聚感染、快篩陽性且具併發症風險者。",
        "非公費對象之健保給付須符合當年度公告之給付條件。"
      ],
      "flags": {
        "priorAuth": false,
        "cultureRequired": false,
        "specialist": false,
        "inpatientOnly": false
      },
      "tags": [
        "流感",
        "influenza",
        "公費",
        "神經胺酸酶抑制劑",
        "快篩"
      ],
      "sourceConfirmed": false,
      "note": "公費對象每年度由疾管署公告，會隨流感季調整，請以當年度公告為準。"
    },
    {
      "id": "av-baloxavir",
      "section": null,
      "sectionConfidence": "unknown",
      "category": "antiviral",
      "title": "Baloxavir marboxil",
      "drugs": [
        {
          "generic": "Baloxavir marboxil",
          "zh": "紓伏效",
          "brands": [
            "Xofluza"
          ]
        }
      ],
      "funding": "mixed",
      "summary": "單劑口服流感抗病毒藥品，使用對象依疾管署公費規定或健保給付條件辦理。",
      "provisions": [
        "限符合流感抗病毒藥劑使用對象且於發病後規定時間內投藥者。",
        "使用對象與 oseltamivir 之公費規定連動。"
      ],
      "flags": {
        "priorAuth": false,
        "cultureRequired": false,
        "specialist": false,
        "inpatientOnly": false
      },
      "tags": [
        "流感",
        "influenza",
        "單劑",
        "公費"
      ],
      "sourceConfirmed": false
    },
    {
      "id": "av-peramivir",
      "section": null,
      "sectionConfidence": "unknown",
      "category": "antiviral",
      "title": "Peramivir",
      "drugs": [
        {
          "generic": "Peramivir",
          "zh": "瑞貝塔",
          "brands": [
            "Rapiacta"
          ]
        }
      ],
      "funding": "mixed",
      "summary": "靜脈注射流感抗病毒藥品，限無法口服或吸入給藥之流感病患（如重症、插管病患）。",
      "provisions": [
        "限無法使用口服或吸入劑型之流感病患。",
        "多用於住院重症病患。"
      ],
      "flags": {
        "priorAuth": false,
        "cultureRequired": false,
        "specialist": false,
        "inpatientOnly": true
      },
      "tags": [
        "流感",
        "靜脈注射",
        "重症"
      ],
      "sourceConfirmed": false
    },
    {
      "id": "av-acyclovir",
      "section": null,
      "sectionConfidence": "unknown",
      "category": "antiviral",
      "title": "Acyclovir／Valacyclovir／Famciclovir",
      "drugs": [
        {
          "generic": "Acyclovir",
          "zh": "艾賽可威",
          "brands": [
            "Zovirax"
          ]
        },
        {
          "generic": "Valacyclovir",
          "zh": "",
          "brands": [
            "Valtrex"
          ]
        },
        {
          "generic": "Famciclovir",
          "zh": "",
          "brands": [
            "Famvir"
          ]
        }
      ],
      "funding": "nhi",
      "summary": "用於單純疱疹、帶狀疱疹之治療；靜脈注射劑限重症（如疱疹腦炎、免疫功能低下之播散性感染、新生兒疱疹）。",
      "provisions": [
        "帶狀疱疹應於發疹後規定時間內（一般 72 小時內）開始治療。",
        "靜脈注射劑限疱疹腦炎、免疫功能低下病患之播散性或內臟侵犯感染、新生兒疱疹等重症。",
        "免疫功能低下病患之預防性使用須符合規定。"
      ],
      "flags": {
        "priorAuth": false,
        "cultureRequired": false,
        "specialist": false,
        "inpatientOnly": false
      },
      "tags": [
        "帶狀疱疹",
        "單純疱疹",
        "疱疹腦炎",
        "免疫低下"
      ],
      "sourceConfirmed": false
    },
    {
      "id": "av-ganciclovir",
      "section": null,
      "sectionConfidence": "unknown",
      "category": "antiviral",
      "title": "Ganciclovir／Valganciclovir",
      "drugs": [
        {
          "generic": "Ganciclovir",
          "zh": "",
          "brands": [
            "Cymevene"
          ]
        },
        {
          "generic": "Valganciclovir",
          "zh": "",
          "brands": [
            "Valcyte"
          ]
        }
      ],
      "funding": "nhi",
      "summary": "限用於巨細胞病毒（CMV）感染之治療或預防，對象為器官／造血幹細胞移植病患、愛滋病毒感染者之 CMV 視網膜炎等免疫功能低下族群。",
      "provisions": [
        "CMV 視網膜炎、CMV 肺炎、CMV 腸炎等器官侵犯性感染之治療。",
        "實體器官或造血幹細胞移植後之 CMV 預防或先制治療（pre-emptive therapy），須有 CMV 抗原血症或病毒量檢測佐證。",
        "須監測血液學不良反應。"
      ],
      "flags": {
        "priorAuth": true,
        "cultureRequired": true,
        "specialist": true,
        "inpatientOnly": false
      },
      "tags": [
        "CMV",
        "巨細胞病毒",
        "移植",
        "視網膜炎",
        "免疫低下"
      ],
      "sourceConfirmed": false
    },
    {
      "id": "av-covid",
      "section": null,
      "sectionConfidence": "unknown",
      "category": "antiviral",
      "title": "COVID-19 抗病毒藥品（Nirmatrelvir/ritonavir、Remdesivir、Molnupiravir）",
      "drugs": [
        {
          "generic": "Nirmatrelvir/ritonavir",
          "zh": "",
          "brands": [
            "Paxlovid"
          ]
        },
        {
          "generic": "Remdesivir",
          "zh": "瑞德西韋",
          "brands": [
            "Veklury"
          ]
        },
        {
          "generic": "Molnupiravir",
          "zh": "",
          "brands": [
            "Lagevrio"
          ]
        }
      ],
      "funding": "public",
      "summary": "COVID-19 口服及注射抗病毒藥品之使用對象、發病時程與適用族群依疾管署公告辦理；供應方式（公費／健保）隨政策調整。",
      "provisions": [
        "限符合疾管署公告之高風險對象，並於發病後規定天數內開始投藥。",
        "Nirmatrelvir/ritonavir 須評估腎功能與大量藥物交互作用（ritonavir）。",
        "Remdesivir 多用於住院中重症病患。"
      ],
      "flags": {
        "priorAuth": false,
        "cultureRequired": true,
        "specialist": false,
        "inpatientOnly": false
      },
      "tags": [
        "COVID-19",
        "公費",
        "高風險",
        "藥物交互作用"
      ],
      "sourceConfirmed": false,
      "note": "COVID-19 用藥政策變動頻繁，務必以疾管署最新公告為準。"
    },
    {
      "id": "hep-hbv",
      "section": null,
      "sectionConfidence": "unknown",
      "category": "hepatitis",
      "title": "慢性 B 型肝炎抗病毒藥品（Entecavir／Tenofovir）",
      "drugs": [
        {
          "generic": "Entecavir",
          "zh": "貝樂克",
          "brands": [
            "Baraclude"
          ]
        },
        {
          "generic": "Tenofovir disoproxil fumarate",
          "zh": "惠立妥",
          "brands": [
            "Viread"
          ]
        },
        {
          "generic": "Tenofovir alafenamide",
          "zh": "韋立得",
          "brands": [
            "Vemlidy"
          ]
        }
      ],
      "funding": "nhi",
      "summary": "依 e 抗原狀態、ALT 值、HBV DNA 病毒量及肝硬化與否訂有不同給付條件與療程上限；肝硬化、接受免疫抑制／化學治療者另有規定。",
      "provisions": [
        "e 抗原陽性或陰性之慢性 B 型肝炎，須符合 ALT 升高倍數與 HBV DNA 病毒量門檻。",
        "肝硬化病患之給付條件較寬鬆，並可長期使用。",
        "接受免疫抑制劑或化學治療（含 rituximab）之 HBsAg 陽性者，得預防性投藥。",
        "療程上限、停藥條件與再治療規定須依公告辦理。"
      ],
      "flags": {
        "priorAuth": true,
        "cultureRequired": true,
        "specialist": true,
        "inpatientOnly": false
      },
      "tags": [
        "B型肝炎",
        "HBV",
        "肝硬化",
        "免疫抑制",
        "療程上限"
      ],
      "sourceConfirmed": false,
      "note": "B、C 型肝炎用藥之章節歸屬與條號需以官方檔案核對。"
    },
    {
      "id": "hep-hcv-daa",
      "section": null,
      "sectionConfidence": "unknown",
      "category": "hepatitis",
      "title": "慢性 C 型肝炎全口服抗病毒藥品（DAA）",
      "drugs": [
        {
          "generic": "Sofosbuvir/velpatasvir",
          "zh": "",
          "brands": [
            "Epclusa"
          ]
        },
        {
          "generic": "Glecaprevir/pibrentasvir",
          "zh": "",
          "brands": [
            "Maviret"
          ]
        },
        {
          "generic": "Ledipasvir/sofosbuvir",
          "zh": "",
          "brands": [
            "Harvoni"
          ]
        }
      ],
      "funding": "nhi",
      "summary": "泛基因型全口服 DAA 已擴大給付至所有慢性 C 型肝炎病患；須經事前審查／登錄，並依基因型、肝硬化與治療經驗決定療程。",
      "provisions": [
        "適用經確診之慢性 C 型肝炎病毒感染者（HCV RNA 陽性）。",
        "須依規定完成事前審查或登錄程序。",
        "療程長度依藥品、基因型、是否肝硬化及過去治療經驗而定。",
        "治療前應評估 HBV 共同感染（再活化風險）及藥物交互作用。"
      ],
      "flags": {
        "priorAuth": true,
        "cultureRequired": true,
        "specialist": true,
        "inpatientOnly": false
      },
      "tags": [
        "C型肝炎",
        "HCV",
        "DAA",
        "事前審查",
        "肝硬化"
      ],
      "sourceConfirmed": false
    },
    {
      "id": "tb-firstline",
      "section": null,
      "sectionConfidence": "unknown",
      "category": "tb",
      "title": "第一線抗結核藥品（INH／RIF／EMB／PZA）",
      "drugs": [
        {
          "generic": "Isoniazid",
          "zh": "異菸鹼醯胼",
          "brands": [
            "INH"
          ]
        },
        {
          "generic": "Rifampin",
          "zh": "立汎黴素",
          "brands": [
            "Rifadin"
          ]
        },
        {
          "generic": "Ethambutol",
          "zh": "",
          "brands": [
            "Myambutol"
          ]
        },
        {
          "generic": "Pyrazinamide",
          "zh": "",
          "brands": [
            "PZA"
          ]
        }
      ],
      "funding": "public",
      "summary": "結核病治療用藥主要由疾管署結核病防治計畫提供（公費），並配合都治（DOTS）計畫執行；健保另有相關診療給付。",
      "provisions": [
        "確診結核病者依疾管署治療指引以公費藥品治療。",
        "需通報並納入都治（DOTS）關懷收案。",
        "潛伏結核感染（LTBI）治療（如 3HP、9H）亦由公費提供。"
      ],
      "flags": {
        "priorAuth": false,
        "cultureRequired": true,
        "specialist": true,
        "inpatientOnly": false
      },
      "tags": [
        "結核病",
        "TB",
        "公費",
        "都治",
        "DOTS",
        "LTBI"
      ],
      "sourceConfirmed": false
    },
    {
      "id": "tb-mdr",
      "section": null,
      "sectionConfidence": "unknown",
      "category": "tb",
      "title": "多重抗藥性結核病用藥（Bedaquiline／Delamanid／Linezolid 等）",
      "drugs": [
        {
          "generic": "Bedaquiline",
          "zh": "",
          "brands": [
            "Sirturo"
          ]
        },
        {
          "generic": "Delamanid",
          "zh": "",
          "brands": [
            "Deltyba"
          ]
        }
      ],
      "funding": "public",
      "summary": "多重抗藥性結核病（MDR-TB）用藥由疾管署 MDR-TB 醫療照護體系（TMTC）核准後提供，需經專家會議審查。",
      "provisions": [
        "限經藥物敏感試驗證實之多重抗藥性結核病。",
        "須經 MDR-TB 醫療照護團隊（TMTC）收案及專家審查。",
        "使用期間須監測 QT 間期與肝功能等。"
      ],
      "flags": {
        "priorAuth": true,
        "cultureRequired": true,
        "specialist": true,
        "inpatientOnly": false
      },
      "tags": [
        "MDR-TB",
        "多重抗藥性",
        "公費",
        "TMTC",
        "QT延長"
      ],
      "sourceConfirmed": false
    },
    {
      "id": "tb-ntm",
      "section": null,
      "sectionConfidence": "unknown",
      "category": "tb",
      "title": "非結核分枝桿菌（NTM）治療用藥",
      "drugs": [
        {
          "generic": "Clarithromycin",
          "zh": "",
          "brands": [
            "Klaricid"
          ]
        },
        {
          "generic": "Azithromycin",
          "zh": "",
          "brands": [
            "Zithromax"
          ]
        },
        {
          "generic": "Amikacin",
          "zh": "",
          "brands": []
        }
      ],
      "funding": "nhi",
      "summary": "非結核分枝桿菌肺病等之長期合併治療，須有反覆培養陽性及影像佐證，療程常達 12 個月以上。",
      "provisions": [
        "須符合 NTM 肺病診斷標準（臨床、影像及至少兩套痰培養陽性）。",
        "採多重藥物合併治療，療程通常持續至痰培養轉陰後 12 個月。",
        "長期使用須監測聽力、視力及肝功能。"
      ],
      "flags": {
        "priorAuth": false,
        "cultureRequired": true,
        "specialist": true,
        "inpatientOnly": false
      },
      "tags": [
        "NTM",
        "非結核分枝桿菌",
        "長期療程",
        "培養"
      ],
      "sourceConfirmed": false
    },
    {
      "id": "hiv-art",
      "section": null,
      "sectionConfidence": "unknown",
      "category": "hiv",
      "title": "抗人類免疫缺乏病毒藥品（ART）",
      "drugs": [
        {
          "generic": "Bictegravir/emtricitabine/TAF",
          "zh": "",
          "brands": [
            "Biktarvy"
          ]
        },
        {
          "generic": "Dolutegravir",
          "zh": "",
          "brands": [
            "Tivicay"
          ]
        },
        {
          "generic": "Emtricitabine/TDF",
          "zh": "",
          "brands": [
            "Truvada"
          ]
        }
      ],
      "funding": "mixed",
      "summary": "HIV 感染者之抗病毒治療處方依疾管署「人類免疫缺乏病毒感染者處方使用規範」辦理；感染確診滿一定年限後改由健保支應，並有專業審查機制。",
      "provisions": [
        "處方須符合疾管署公告之 HIV 處方使用規範與建議組合。",
        "確診感染滿規定年限（現制為滿 2 年）後，藥費改由健保支應。",
        "更換處方、使用非建議組合須經專業審查。",
        "須定期追蹤病毒量與 CD4。"
      ],
      "flags": {
        "priorAuth": true,
        "cultureRequired": true,
        "specialist": true,
        "inpatientOnly": false
      },
      "tags": [
        "HIV",
        "愛滋",
        "ART",
        "疾管署",
        "專業審查"
      ],
      "sourceConfirmed": false,
      "note": "HIV 用藥橫跨公務預算與健保，實務上以疾管署處方使用規範為主要依據。"
    },
    {
      "id": "par-malaria",
      "section": null,
      "sectionConfidence": "unknown",
      "category": "parasite",
      "title": "抗瘧疾藥品（Artesunate／Atovaquone-proguanil／Chloroquine 等）",
      "drugs": [
        {
          "generic": "Artesunate",
          "zh": "",
          "brands": []
        },
        {
          "generic": "Atovaquone/proguanil",
          "zh": "",
          "brands": [
            "Malarone"
          ]
        },
        {
          "generic": "Chloroquine",
          "zh": "",
          "brands": []
        },
        {
          "generic": "Primaquine",
          "zh": "",
          "brands": []
        }
      ],
      "funding": "public",
      "summary": "瘧疾為法定傳染病，治療藥品多由疾管署儲備並依通報後提供；重症瘧疾以靜脈注射 artesunate 為首選。",
      "provisions": [
        "確診瘧疾應依規定通報，並由疾管署提供治療藥品。",
        "重症惡性瘧（P. falciparum）以靜脈 artesunate 治療。",
        "P. vivax／P. ovale 需以 primaquine 進行根除治療，使用前應檢驗 G6PD。"
      ],
      "flags": {
        "priorAuth": false,
        "cultureRequired": true,
        "specialist": true,
        "inpatientOnly": false
      },
      "tags": [
        "瘧疾",
        "malaria",
        "法定傳染病",
        "通報",
        "G6PD"
      ],
      "sourceConfirmed": false
    },
    {
      "id": "par-antiparasitic",
      "section": null,
      "sectionConfidence": "unknown",
      "category": "parasite",
      "title": "其他抗寄生蟲藥品（Albendazole／Mebendazole／Metronidazole／Ivermectin）",
      "drugs": [
        {
          "generic": "Albendazole",
          "zh": "",
          "brands": [
            "Zentel"
          ]
        },
        {
          "generic": "Mebendazole",
          "zh": "",
          "brands": []
        },
        {
          "generic": "Metronidazole",
          "zh": "",
          "brands": [
            "Flagyl"
          ]
        },
        {
          "generic": "Ivermectin",
          "zh": "",
          "brands": [
            "Stromectol"
          ]
        }
      ],
      "funding": "nhi",
      "summary": "用於腸道寄生蟲、阿米巴症、賈第鞭毛蟲、疥瘡及糞小桿線蟲等感染；部分品項屬罕用藥或需專案申請。",
      "provisions": [
        "Albendazole／Mebendazole：腸道線蟲感染、囊蟲症等。",
        "Metronidazole：阿米巴症、賈第鞭毛蟲症、厭氧菌感染及細菌性陰道炎。",
        "Ivermectin：糞小桿線蟲症、疥瘡（部分情形需專案取得）。"
      ],
      "flags": {
        "priorAuth": false,
        "cultureRequired": false,
        "specialist": false,
        "inpatientOnly": false
      },
      "tags": [
        "寄生蟲",
        "阿米巴",
        "疥瘡",
        "厭氧菌",
        "罕用藥"
      ],
      "sourceConfirmed": false
    },
    {
      "id": "prog-amsp",
      "section": null,
      "sectionConfidence": "na",
      "category": "general",
      "title": "全民健康保險抗微生物製劑管理及感染管制品質提升計畫",
      "drugs": [],
      "funding": "nhi",
      "summary": "健保署訂有抗微生物製劑管理（AMS）及感染管制品質提升計畫，鼓勵院所建立抗生素管理團隊、監測使用量與抗藥性指標。",
      "provisions": [
        "醫院應建立抗微生物製劑管理團隊（含感染科醫師、藥師、微生物檢驗、感管人員）。",
        "監測抗生素使用密度（DDD／DOT）、限制級抗生素使用及抗藥性菌株發生率。",
        "依計畫指標申報並取得品質獎勵。",
        "現行版本公告日期：113 年 5 月 31 日（健保醫字第 1130110860 號）。"
      ],
      "flags": {
        "priorAuth": false,
        "cultureRequired": false,
        "specialist": false,
        "inpatientOnly": false
      },
      "tags": [
        "AMS",
        "抗生素管理",
        "感染管制",
        "品質計畫",
        "DDD"
      ],
      "sourceConfirmed": true,
      "sectionLabel": "管理計畫"
    }
  ]
};
