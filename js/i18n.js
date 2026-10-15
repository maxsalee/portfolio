/* ==========================================================================
   i18n.js — all translatable strings for the CV
   --------------------------------------------------------------------------
   Three languages: English (default), Traditional Chinese, Simplified Chinese.

   How to add or edit text:
     1. Find the element in index.html. It carries data-i18n="some.key".
     2. Add/edit "some.key" in EVERY language below. A missing key simply
        leaves the element's original HTML text in place.
   ========================================================================== */

window.I18N = {
  defaultLang: "en",

  langs: [
    { code: "en",      label: "EN", htmlLang: "en"      },
    { code: "zh-Hant", label: "繁", htmlLang: "zh-Hant" },
    { code: "zh-Hans", label: "简", htmlLang: "zh-Hans" }
  ],

  strings: {

    /* ===================== English ===================== */
    en: {
      "meta.title": "Max Lee — Personal CV",
      "meta.desc": "Personal CV of Lee Cheuk Ki (Max Lee), a Secondary 5 student at Logos Academy in Hong Kong.",

      "a11y.skip": "Skip to content",
      "a11y.nav": "CV sections",
      "a11y.lang": "Language",
      "a11y.menu": "Show or hide navigation",
      "a11y.contact": "Contact details",

      "hero.eyebrow": "Secondary 5 Student · Hong Kong",
      "hero.name": "Max Lee",
      "hero.nameAlt": "Lee Cheuk Ki · 李卓其",
      "hero.lead": "I am a critical thinker and enjoy solving problems.",
      "hero.intro": "A Secondary 5 student at The Hong Kong Chinese Christian Churches Union Logos Academy, with a particular interest in physics and mathematics.",

      "info.phone": "Phone",
      "info.email": "Email",
      "info.location": "Location",
      "info.locationVal": "Hong Kong",
      "info.status": "Status",
      "info.statusVal": "Secondary 5 student",

      "nav.intro": "Introduction",
      "nav.skills": "Skills",
      "nav.education": "Education",
      "nav.achievements": "Achievements",
      "nav.work": "Work Experience",
      "nav.projects": "Project Experience",
      "nav.hobbies": "Hobbies",

      "skills.lead": "What I can currently do, with an honest indication of my level.",
      "skills.g1": "Programming",
      "skills.python": "Python",
      "skills.pythonLvl": "Basic",
      "skills.html": "HTML",
      "skills.htmlLvl": "Basic",
      "skills.g2": "Tools",
      "skills.excel": "Microsoft Excel",
      "skills.excelLvl": "Experienced",
      "skills.g3": "Languages",
      "skills.en": "English",
      "skills.enLvl": "Proficient",
      "skills.zh": "Chinese",
      "skills.zhLvl": "Native",

      "education.lead": "Academic results, school responsibilities, and competitions I have represented the school in.",
      "education.school": "The Hong Kong Chinese Christian Churches Union Logos Academy",
      "education.schoolMeta": "2024 – Present · Secondary 3 to Secondary 5",
      "education.entry1School": "Evangel College",
      "education.entry1Meta": "2016 – 2024 · Primary 1 to Secondary 2",
      "education.b3": "Stood in the school student union election for Internal Vice Chair; outcome pending.",
      "education.b1": "Selected to represent the school at the 2026 International Mathematical Modelling Challenge (IMMC).",
      "education.b2": "Selected to represent the school at the 2027 International Mathematical Modelling Challenge (IMMC) and the 2027 PolyU Science Talents Competition.",
      "education.b2badge": "Upcoming",
      "education.academicTitle": "Academic Performance",
      "education.subj1": "Physics",
      "education.subj1meta": "S4 · 1st in form",
      "education.subj2": "Additional Mathematics",
      "education.subj2meta": "S4 · 1st in form",

      "achievements.lead": "Results from external competitions and long-term interests.",
      "achievements.a1year": "2026",
      "achievements.a1title": "Hong Kong Physics Olympiad",
      "achievements.a1detail": "Third Honour",
      "achievements.a2year": "Feb 2025",
      "achievements.a2title": "Go (Weiqi)",
      "achievements.a2detail": "Reached a ranking of 5 dan, competing regularly since childhood.",
      "achievements.a2note": "Competition names to be added.",

      "work.lead": "Internship experience.",
      "work.role": "Intern",
      "work.org": "Sanfield",
      "work.meta": "15–16 October 2026",
      "work.detail": "Learned to build software using AI-assisted development (vibecoding) during an internship at Sanfield.",
      "work.detail2": "Details of what I built will be added here.",

      "projects.lead": "Two International Baccalaureate projects, both still in progress.",
      "projects.p1title": "IB CAS Project",
      "projects.p1status": "In progress",
      "projects.p1detail": "Self-initiated a project to visit a local children's community centre to demonstrate and teach science experiments.",
      "projects.p2title": "IB Extended Essay (EE)",
      "projects.p2status": "Not started",
      "projects.p2detail": "Planned 4,000-word research paper in Physics.",
      "projects.p2note": "Research topic to be confirmed.",

      "hobbies.lead": "Activities I have committed to over the long term.",
      "hobbies.h1": "Go (Weiqi)",
      "hobbies.h1detail": "Played for 12 years and won numerous competitions, reaching a rank of 5 dan.",
      "hobbies.h1note": "Competition names and years to be added.",
      "hobbies.h2": "Table Tennis",
      "hobbies.h2detail": "Played for 2 years.",
      "hobbies.h2note": "School team or competition record to be added.",

      "todo.label": "To fill in",

      "ui.controls": "Display and export",
      "ui.theme": "Dark mode",
      "ui.themeHint": "Switch between light and dark colours",
      "ui.pdf": "Download PDF",
      "ui.pdfHint": "Opens the print dialog — choose “Save as PDF”.",

      "footer.updated": "Last updated October 2026",
      "footer.builtWith": "Built with HTML, CSS and JavaScript."
    },

    /* ================= Traditional Chinese ================= */
    "zh-Hant": {
      "meta.title": "李卓其 — 個人履歷",
      "meta.desc": "李卓其（Max Lee）的個人履歷。香港真道書院中五學生。",

      "a11y.skip": "跳至主要內容",
      "a11y.nav": "履歷章節",
      "a11y.lang": "語言",
      "a11y.menu": "顯示或隱藏導覽選單",
      "a11y.contact": "聯絡資料",

      "hero.eyebrow": "中五學生 · 香港",
      "hero.name": "李卓其",
      "hero.nameAlt": "Lee Cheuk Ki · Max Lee",
      "hero.lead": "我善於批判思考，並樂於解決問題。",
      "hero.intro": "現就讀香港華人基督教聯會真道書院中五，對物理與數學尤感興趣。",

      "info.phone": "電話",
      "info.email": "電郵",
      "info.location": "地區",
      "info.locationVal": "香港",
      "info.status": "現況",
      "info.statusVal": "中五學生",

      "nav.intro": "自我介紹",
      "nav.skills": "技能",
      "nav.education": "學歷",
      "nav.achievements": "成就",
      "nav.work": "工作經驗",
      "nav.projects": "專案經驗",
      "nav.hobbies": "興趣",

      "skills.lead": "以下是我目前掌握的技能，並如實標示程度。",
      "skills.g1": "程式設計",
      "skills.pythonLvl": "基礎",
      "skills.htmlLvl": "基礎",
      "skills.g2": "工具",
      "skills.excelLvl": "有使用經驗",
      "skills.g3": "語言",
      "skills.en": "英文",
      "skills.enLvl": "精通",
      "skills.zh": "中文",
      "skills.zhLvl": "母語",

      "education.lead": "學業成績、校內職務，以及代表學校參與的比賽。",
      "education.school": "香港華人基督教聯會真道書院",
      "education.schoolMeta": "2024 – 現在 · 中三至中五",
      "education.entry1School": "播道書院",
      "education.entry1Meta": "2016 – 2024 · 小一至中二",
      "education.b3": "參選校內學生會選舉，競逐內務副主席一職；結果待定。",
      "education.b1": "獲選代表學校參加 2026 年國際數學建模挑戰賽（IMMC）。",
      "education.b2": "獲選代表學校參加 2027 年國際數學建模挑戰賽（IMMC）及 2027 年香港理工大學科學人才比賽。",
      "education.b2badge": "即將舉行",
      "education.academicTitle": "學業成績",
      "education.subj1": "物理",
      "education.subj1meta": "中四 · 全級第一",
      "education.subj2": "附加數學",
      "education.subj2meta": "中四 · 全級第一",

      "achievements.lead": "校外比賽及長期興趣所得的成果。",
      "achievements.a1year": "2026 年",
      "achievements.a1title": "香港物理奧林匹克",
      "achievements.a1detail": "三等榮譽",
      "achievements.a2year": "2025 年 2 月",
      "achievements.a2title": "圍棋",
      "achievements.a2detail": "自幼持續參賽，達到五段水平。",
      "achievements.a2note": "比賽名稱待補充。",

      "work.lead": "實習經歷。",
      "work.role": "實習生",
      "work.org": "新輝（建築管理）有限公司",
      "work.meta": "2026 年 10 月 15–16 日",
      "work.detail": "在 Sanfield 實習期間，學習運用 AI 輔助開發（vibecoding）來編寫程式。",
      "work.detail2": "實習期間完成的具體內容將於此補充。",

      "projects.lead": "兩項國際文憑（IB）課程項目，目前仍在進行中。",
      "projects.p1title": "IB CAS 項目",
      "projects.p1status": "進行中",
      "projects.p1detail": "自發籌劃項目，前往本地兒童社區中心示範並教授科學實驗。",
      "projects.p2title": "IB 延伸論文（EE）",
      "projects.p2status": "尚未開始",
      "projects.p2detail": "計劃撰寫物理科 4,000 字研究論文。",
      "projects.p2note": "研究題目待定。",

      "hobbies.lead": "長期投入的課餘活動。",
      "hobbies.h1": "圍棋",
      "hobbies.h1detail": "下了 12 年圍棋，多次在比賽中獲獎，達到五段水平。",
      "hobbies.h1note": "比賽名稱及年份待補充。",
      "hobbies.h2": "乒乓球",
      "hobbies.h2detail": "打了 2 年乒乓球。",
      "hobbies.h2note": "校隊或比賽紀錄待補充。",

      "todo.label": "待補充",

      "ui.controls": "顯示與匯出",
      "ui.theme": "深色模式",
      "ui.themeHint": "切換淺色與深色配色",
      "ui.pdf": "下載 PDF",
      "ui.pdfHint": "開啟列印對話框，請選擇「另存為 PDF」。",

      "footer.updated": "最後更新：2026 年 10 月",
      "footer.builtWith": "以 HTML、CSS 及 JavaScript 製作。"
    },

    /* ================== Simplified Chinese ================== */
    "zh-Hans": {
      "meta.title": "李卓其 — 个人简历",
      "meta.desc": "李卓其（Max Lee）的个人简历。香港真道书院中五学生。",

      "a11y.skip": "跳至主要内容",
      "a11y.nav": "简历章节",
      "a11y.lang": "语言",
      "a11y.menu": "显示或隐藏导航菜单",
      "a11y.contact": "联系资料",

      "hero.eyebrow": "中五学生 · 香港",
      "hero.name": "李卓其",
      "hero.nameAlt": "Lee Cheuk Ki · Max Lee",
      "hero.lead": "我善于批判思考，并乐于解决问题。",
      "hero.intro": "现就读香港华人基督教联会真道书院中五，对物理与数学尤感兴趣。",

      "info.phone": "电话",
      "info.email": "邮箱",
      "info.location": "地区",
      "info.locationVal": "香港",
      "info.status": "现况",
      "info.statusVal": "中五学生",

      "nav.intro": "自我介绍",
      "nav.skills": "技能",
      "nav.education": "学历",
      "nav.achievements": "成就",
      "nav.work": "工作经验",
      "nav.projects": "项目经验",
      "nav.hobbies": "兴趣",

      "skills.lead": "以下是我目前掌握的技能，并如实标示程度。",
      "skills.g1": "编程",
      "skills.pythonLvl": "基础",
      "skills.htmlLvl": "基础",
      "skills.g2": "工具",
      "skills.excelLvl": "有使用经验",
      "skills.g3": "语言",
      "skills.en": "英文",
      "skills.enLvl": "精通",
      "skills.zh": "中文",
      "skills.zhLvl": "母语",

      "education.lead": "学业成绩、校内职务，以及代表学校参与的比赛。",
      "education.school": "香港华人基督教联会真道书院",
      "education.schoolMeta": "2024 – 现在 · 中三至中五",
      "education.entry1School": "播道书院",
      "education.entry1Meta": "2016 – 2024 · 小一至中二",
      "education.b3": "参选校内学生会选举，竞逐内务副主席一职；结果待定。",
      "education.b1": "获选代表学校参加 2026 年国际数学建模挑战赛（IMMC）。",
      "education.b2": "获选代表学校参加 2027 年国际数学建模挑战赛（IMMC）及 2027 年香港理工大学科学人才比赛。",
      "education.b2badge": "即将举行",
      "education.academicTitle": "学业成绩",
      "education.subj1": "物理",
      "education.subj1meta": "中四 · 全级第一",
      "education.subj2": "附加数学",
      "education.subj2meta": "中四 · 全级第一",

      "achievements.lead": "校外比赛及长期兴趣所得的成果。",
      "achievements.a1year": "2026 年",
      "achievements.a1title": "香港物理奥林匹克",
      "achievements.a1detail": "三等荣誉",
      "achievements.a2year": "2025 年 2 月",
      "achievements.a2title": "围棋",
      "achievements.a2detail": "自幼持续参赛，达到五段水平。",
      "achievements.a2note": "比赛名称待补充。",

      "work.lead": "实习经历。",
      "work.role": "实习生",
      "work.org": "新辉（建筑管理）有限公司",
      "work.meta": "2026 年 10 月 15–16 日",
      "work.detail": "在 Sanfield 实习期间，学习运用 AI 辅助开发（vibecoding）来编写程序。",
      "work.detail2": "实习期间完成的具体内容将在此补充。",

      "projects.lead": "两项国际文凭（IB）课程项目，目前仍在进行中。",
      "projects.p1title": "IB CAS 项目",
      "projects.p1status": "进行中",
      "projects.p1detail": "自发筹划项目，前往本地儿童社区中心示范并教授科学实验。",
      "projects.p2title": "IB 拓展论文（EE）",
      "projects.p2status": "尚未开始",
      "projects.p2detail": "计划撰写物理科 4,000 字研究论文。",
      "projects.p2note": "研究题目待定。",

      "hobbies.lead": "长期投入的课余活动。",
      "hobbies.h1": "围棋",
      "hobbies.h1detail": "下了 12 年围棋，多次在比赛中获奖，达到五段水平。",
      "hobbies.h1note": "比赛名称及年份待补充。",
      "hobbies.h2": "乒乓球",
      "hobbies.h2detail": "打了 2 年乒乓球。",
      "hobbies.h2note": "校队或比赛记录待补充。",

      "todo.label": "待补充",

      "ui.controls": "显示与导出",
      "ui.theme": "深色模式",
      "ui.themeHint": "切换浅色与深色配色",
      "ui.pdf": "下载 PDF",
      "ui.pdfHint": "打开打印对话框，请选择“另存为 PDF”。",

      "footer.updated": "最后更新：2026 年 10 月",
      "footer.builtWith": "以 HTML、CSS 及 JavaScript 制作。"
    }
  }
};
