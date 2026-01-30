// ========================================
// 設定エリア - ここを編集してカスタマイズ
// ========================================

// 特殊スケジュールの曜日設定
const targetWeekday = 5; // 0=日, 1=月, ..., 5=金, 6=土

// 特殊スケジュールの詳細設定(第1週〜第5週)
const weeklySchedule = {
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
const weeklyLabels = {
    1: "資源(第1金曜日)",
    2: {
        even: "埋立(第2金曜日)",
        odd: "埋+剪(奇数月第2金曜)"
    },
    3: "資源(第3金曜日)",
    4: "大、小、有(第4金曜日)",
    5: "資源(第5金曜日)"
};

// 表示する日数(今日から何日分)
const displayDays = 60;

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

// 指定期間内の特定曜日を取得する関数
function getTargetWeekdaysInPeriod(baseDate, weekday, days, schedule, labels) {
    const results = [];
    const startDate = new Date(baseDate);
    const endDate = new Date(baseDate);
    endDate.setDate(startDate.getDate() + days);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        if (d.getDay() === weekday) {
            const month = d.getMonth() + 1;
            const date = d.getDate();
            const weekNumber = getWeekOfMonth(d);
            
            let garbageItems = [];
            let displayLabel = '';
            
            if (schedule[weekNumber]) {
                const scheduleItem = schedule[weekNumber];
                
                // 偶数月/奇数月で分岐する場合
                if (scheduleItem.even && scheduleItem.odd) {
                    garbageItems = month % 2 === 0 ? scheduleItem.even : scheduleItem.odd;
                    displayLabel = month % 2 === 0 
                        ? labels[weekNumber].even 
                        : labels[weekNumber].odd;
                } else {
                    garbageItems = scheduleItem;
                    displayLabel = labels[weekNumber];
                }
            } else {
                displayLabel = "該当なし";
            }

            results.push({
                date: `${String(month).padStart(2, '0')}月${String(date).padStart(2, '0')}日`,
                weekOfMonth: displayLabel,
                items: garbageItems
            });
        }
    }
    return results;
}

// 特定曜日のリストを表示する関数
function displayTargetWeekdays() {
    const today = new Date();
    const weekdays = getTargetWeekdaysInPeriod(
        today, 
        targetWeekday, 
        displayDays, 
        weeklySchedule, 
        weeklyLabels
    );
    const tableBody = document.getElementById("friday-list");
    
    if (!tableBody) {
        console.error("Element with id 'friday-list' not found");
        return;
    }
    
    tableBody.innerHTML = "";
    
    weekdays.forEach(day => {
        const row = document.createElement("tr");
        const dateCell = document.createElement("td");
        const weekCell = document.createElement("td");
        
        dateCell.textContent = day.date;
        weekCell.textContent = day.weekOfMonth;
        
        row.appendChild(dateCell);
        row.appendChild(weekCell);
        tableBody.appendChild(row);
    });
}

// DOMの読み込み完了後に実行
document.addEventListener("DOMContentLoaded", displayTargetWeekdays);
