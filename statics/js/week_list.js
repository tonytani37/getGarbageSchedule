
// タブを開いたときにリロード
document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") {
        location.reload();
    }
});

// 指定された曜日（例：金曜日）の月内の日付リストを返す関数
function getWeekdayCount(baseDate, targetWeekday) {
    let year = baseDate.getFullYear();
    let month = baseDate.getMonth();
    let dates = [];

    let date = new Date(year, month, 1);
    while (date.getMonth() === month) {
        if (date.getDay() === targetWeekday) {
            dates.push(date.getDate());
        }
        date.setDate(date.getDate() + 1);
    }
    return dates;
}

// ごみ収集スケジュールを作成する関数
function getGarbageSchedule(master) {
    // 日付を指定（テスト用）
    // const today = new Date(2025, 4, 29); // ←テストする場合はこっち(5月=4)
    
    // 本番用：今日の日付
    const today = new Date();
    let schedule = {};

    for (let i = 0; i < 7; i++) {
        let checkDate = new Date(today);
        checkDate.setDate(today.getDate() + i);

        let yyyy = checkDate.getFullYear();
        let mm = String(checkDate.getMonth() + 1).padStart(2, '0');
        let dd = String(checkDate.getDate()).padStart(2, '0');
        let dayOfWeek = checkDate.getDay();
        let dayName = ['日', '月', '火', '水', '木', '金', '土'][dayOfWeek];

        let collected = master[dayOfWeek] || [];

        if (dayOfWeek === targetDay) {
            let allFridays = getWeekdayCount(checkDate, targetDay);
            let todayDate = checkDate.getDate();
            let monthNumber = checkDate.getMonth() + 1;

            if (allFridays[0] === todayDate) {
                collected = ["資源(第１金曜日)"];
            } else if (allFridays[1] === todayDate) {
                if (monthNumber % 2 === 0) {
                    collected = ["埋立(第２金曜日)"];
                } else {
                    collected = ["埋+剪（奇数月第２金曜）"];
                }
            } else if (allFridays[2] === todayDate) {
                collected = ["資源(第３金曜日)"];
            } else if (allFridays[3] === todayDate) {
                collected = ["大、小、有(第４金曜日)"];
            } else if (allFridays[4] === todayDate) {
                collected = ["資源(第５金曜日)"];
            } else {
                collected = [];
            }
        }

        // 年末年始の例外処理
        if ((mm === "12" && dd === "31") || (mm === "01" && ["01", "02", "03"].includes(dd))) {
            collected = [];
        }

        schedule[`${mm}月${dd}日 (${dayName})`] = collected.length ? collected.join(', ') : 'なし';
    }
    return schedule;
}

// ごみ収集日のマスター（曜日ごと）
const garbageMaster = {
    // 1: ["資源", "燃やせる"], // 月曜日
    // 2: ["資源", "燃やせる"], // 火曜日
    3: ["燃やせる"], // 水曜日
    // 4: ["資源", "燃やせる"], // 木曜日
    // 5: ["資源", "燃やせる"], // 金曜日
    6: ["燃やせる"]  // 土曜日
};

// 収集対象の変則曜日（金曜日）
const targetDay = 5; // 0=日, 1=月, ..., 5=金, 6=土

// スケジュールを取得してHTMLに反映
const schedule = getGarbageSchedule(garbageMaster);

// スケジュールをHTMLに出力
const tbody = document.getElementById("schedule-body");
Object.entries(schedule).forEach(([date, items]) => {
    let row = `<tr><td>${date}</td><td>${items}</td></tr>`;
    tbody.innerHTML += row;
});

// 今日の日付表示（オマケ機能）
document.getElementById('today').innerText = new Date().toLocaleDateString('ja-JP');
