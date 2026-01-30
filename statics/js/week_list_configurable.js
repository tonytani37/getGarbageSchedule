// ========================================
// 設定エリア - ここを編集してカスタマイズ
// ========================================

// 通常の曜日ごとのごみ収集マスター
const garbageMaster = {
    // 0: ["資源", "燃やせる"], // 日曜日
    // 1: ["資源", "燃やせる"], // 月曜日
    // 2: ["資源", "燃やせる"], // 火曜日
    3: ["燃やせる"], // 水曜日
    // 4: ["資源", "燃やせる"], // 木曜日
    // 5は金曜日で特殊処理のため定義しない
    6: ["燃やせる"]  // 土曜日
};

// 特殊スケジュールの曜日設定(金曜日など)
const specialDay = 5; // 0=日, 1=月, ..., 5=金, 6=土

// 特殊スケジュールの詳細設定(第1週〜第5週)
const specialSchedule = {
    1: ["資源"], // 第1週
    2: {
        even: ["埋立"],      // 偶数月
        odd: ["埋立", "剪定枝"]  // 奇数月
    },
    3: ["資源"], // 第3週
    4: ["大型", "小型家電", "有害"], // 第4週
    5: ["資源"]  // 第5週(存在する月のみ)
};

// 特殊スケジュールの表示名設定
const specialScheduleLabels = {
    1: "資源(第1金曜日)",
    2: {
        even: "埋立(第2金曜日)",
        odd: "埋+剪(奇数月第2金曜)"
    },
    3: "資源(第3金曜日)",
    4: "大、小、有(第4金曜日)",
    5: "資源(第5金曜日)"
};

// 年末年始の収集休止期間
const holidayPeriods = [
    { month: 12, dates: [31] },           // 12月31日
    { month: 1, dates: [1, 2, 3] }        // 1月1日〜3日
];

// ========================================
// プログラム本体 - 通常は編集不要
// ========================================

// タブを開いたときにリロード
document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") {
        location.reload();
    }
});

// その日が第何週目の指定曜日かを取得する関数(1-based)
function getWeekOfMonth(date) {
    const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    const targetDay = date.getDay();
    
    // 月の最初のその曜日の日付を計算
    const firstTargetDay = 1 + ((targetDay - firstDay.getDay() + 7) % 7);
    
    // 現在の日付から第何週目かを計算
    const weekNumber = Math.floor((date.getDate() - firstTargetDay) / 7) + 1;
    return weekNumber;
}

// 年末年始の休止期間かチェックする関数
function isHolidayPeriod(date) {
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    return holidayPeriods.some(period => 
        period.month === month && period.dates.includes(day)
    );
}

// ごみ収集スケジュールを作成する関数
function getGarbageSchedule(master, specialDay, specialSchedule, specialLabels) {
    // 日付を指定(テスト用)
    // const today = new Date(2025, 4, 29); // ←テストする場合はこっち(5月=4)
    
    // 本番用:今日の日付
    const today = new Date();
    const schedule = {};

    for (let i = 0; i < 7; i++) {
        const checkDate = new Date(today);
        checkDate.setDate(today.getDate() + i);

        const yyyy = checkDate.getFullYear();
        const mm = String(checkDate.getMonth() + 1).padStart(2, '0');
        const dd = String(checkDate.getDate()).padStart(2, '0');
        const dayOfWeek = checkDate.getDay();
        const dayName = ['日', '月', '火', '水', '木', '金', '土'][dayOfWeek];

        let collected = [];
        let displayLabel = '';

        // 年末年始の例外処理
        if (isHolidayPeriod(checkDate)) {
            collected = [];
        }
        // 特殊スケジュールの曜日の処理
        else if (dayOfWeek === specialDay) {
            const weekNumber = getWeekOfMonth(checkDate);
            const monthNumber = checkDate.getMonth() + 1;
            
            if (specialSchedule[weekNumber]) {
                const scheduleItem = specialSchedule[weekNumber];
                
                // 偶数月/奇数月で分岐する場合
                if (scheduleItem.even && scheduleItem.odd) {
                    collected = monthNumber % 2 === 0 ? scheduleItem.even : scheduleItem.odd;
                    displayLabel = monthNumber % 2 === 0 
                        ? specialLabels[weekNumber].even 
                        : specialLabels[weekNumber].odd;
                } else {
                    collected = scheduleItem;
                    displayLabel = specialLabels[weekNumber];
                }
            }
        }
        // 通常の曜日ごとの収集
        else {
            collected = master[dayOfWeek] || [];
        }

        const dateKey = `${mm}月${dd}日 (${dayName})`;
        
        // 表示用のテキスト作成
        if (displayLabel) {
            schedule[dateKey] = displayLabel;
        } else {
            schedule[dateKey] = collected.length ? collected.join(', ') : 'なし';
        }
    }
    return schedule;
}

// スケジュールを取得してHTMLに反映
const schedule = getGarbageSchedule(garbageMaster, specialDay, specialSchedule, specialScheduleLabels);

// スケジュールをHTMLに出力
const tbody = document.getElementById("schedule-body");
if (tbody) {
    Object.entries(schedule).forEach(([date, items]) => {
        const row = `<tr><td>${date}</td><td>${items}</td></tr>`;
        tbody.innerHTML += row;
    });
}

// 今日の日付表示(オマケ機能)
const todayElement = document.getElementById('today');
if (todayElement) {
    todayElement.innerText = new Date().toLocaleDateString('ja-JP');
}
