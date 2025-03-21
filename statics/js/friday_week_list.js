document.addEventListener("visibilitychange", function () {
    if (document.visibilityState === "visible") {
        location.reload();
    }
});

function getFridaysInNext60Days(baseDate) {
    let fridays = [];
    let startDate = new Date(baseDate);
    let endDate = new Date(baseDate);
    endDate.setDate(startDate.getDate() + 60);

    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
        if (d.getDay() === 5) { // 金曜日 (0:日曜日, 1:月曜日, ..., 5:金曜日, 6:土曜日)
            // let year = d.getFullYear();
            let month = d.getMonth() + 1;
            let date = d.getDate();
            let weekOfMonth = getWeekOfMonth(d);
            if (weekOfMonth == 1) {
                weekOfMonth = "資源(第１金曜日)";
            } else if (weekOfMonth == 3) {
                weekOfMonth = "資源(第３金曜日)";
            } else if (weekOfMonth == 4) {
                weekOfMonth = "大、小、有(第４金曜日)";
            } else if (weekOfMonth == 5) {
                weekOfMonth = "資源(第５金曜日)";
            } else if (weekOfMonth == 2) {
                if (month % 2 == 0) {
                    weekOfMonth  = ["埋立(第２金曜日)"];
                }
                else {
                    weekOfMonth = ["埋+剪（奇数月第２金曜）"];
                } 
            }
            // console.log(typeof month);

            fridays.push({
                // date: `${year}/${String(month).padStart(2, '0')}/${String(date).padStart(2, '0')}`,
                date: `${String(month).padStart(2, '0')}月${String(date).padStart(2, '0')}日`,
                weekOfMonth:weekOfMonth
            });
        }
    }
    return fridays;
}

function getWeekOfMonth(date) {
    let firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
    let firstFriday = firstDay.getDay() === 5 ? 1 : 1 + ((5 - firstDay.getDay() + 7) % 7);
    let week = Math.floor((date.getDate() - firstFriday) / 7) + 1;
    // return week + 1; // +1して1週目から始まるように調整
    return week; // +1して1週目から始まるように調整
}

function displayFridays() {
    let today = new Date();
    let fridays = getFridaysInNext60Days(today);
    let tableBody = document.getElementById("friday-list");
    tableBody.innerHTML = "";
    
    fridays.forEach(friday => {
        let row = document.createElement("tr");
        let dateCell = document.createElement("td");
        let weekCell = document.createElement("td");
        
        dateCell.textContent = friday.date;
        weekCell.textContent = `${friday.weekOfMonth}`;
        
        row.appendChild(dateCell);
        row.appendChild(weekCell);
        tableBody.appendChild(row);
    });
}

document.addEventListener("DOMContentLoaded", displayFridays);
