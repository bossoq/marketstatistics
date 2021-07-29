// deno-lint-ignore-file
const apiUrl = `${window.location.protocol}//${window.location.host}/api/v1`;

const getBondDate = (callback) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `${apiUrl}/allbonddate`);
    xhr.responseType = 'json';
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            callback(xhr.response);
        }
    };
    xhr.send();
};

const month = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec"
];

const dateElement = document.querySelector('input[name="datePicker"]');
getBondDate(bondDate => {
    const startDate = bondDate.slice(0, 1);
    const endDate = bondDate.slice(-1);
    let dateRange = [],
    start = new Date(startDate),
    end = new Date(endDate);
    for (let unix = start.getTime(); unix <= end.getTime(); unix += 86400000) {
        const thisDay = new Date(unix);
        const day = thisDay.getDate();
        const month = thisDay.getMonth();
        const year = thisDay.getFullYear();
        if (!bondDate.includes(`${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`)) {
            dateRange.push(thisDay);
        }
    }
    dateElement.value = new Date(endDate);
    const datepicker = new Datepicker(dateElement, {
        autohide: true,
        buttonClass: 'button',
        format: {
            toValue(date) {
                let dateObj = new Date(date);
                return dateObj;
            },
            toDisplay(date) {
                const dateString = date.getDate();
                const monthString = month[date.getMonth()];
                const yearString = date.getFullYear();
                return `${dateString}-${monthString}-${yearString}`;
            }
        },
        todayHighlight: true,
        minDate: new Date(startDate),
        maxDate: new Date(endDate),
        datesDisabled: dateRange,
    });
    dateElement.addEventListener("changeDate", onChangeSelection);
});

const getDefaultReturn = (indicator, year, month, callback) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${apiUrl}/mktreturndefault`);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.responseType = 'json';
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            callback(xhr.response);
        }
    };
    xhr.send(JSON.stringify({
        indicator,
        year,
        month
    }));
};

const getLastAvailable = (type, callback) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${apiUrl}/lastavailable`);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.responseType = 'json';
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            callback(xhr.response);
        }
    };
    xhr.send(JSON.stringify({
        type
    }));
};

const getBondAsof = (callback) => {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', `${apiUrl}/lastbondavailable`);
    xhr.responseType = 'json';
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            callback(xhr.response);
        }
    };
    xhr.send();
};

const getBondYield = (asof, callback) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${apiUrl}/bondyield`);
    xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhr.responseType = 'json';
    xhr.onreadystatechange = () => {
        if (xhr.readyState === 4) {
            callback(xhr.response);
        }
    };
    xhr.send(JSON.stringify({
        asof
    }));
};

const changeTheadElement = (type) => {
    const theadElement = document.querySelector("thead[name=tableHead]");
    theadElement.children[0].children[1].innerHTML = `SET ${type} Return`;
    theadElement.children[0].children[3].innerHTML = `SET ${type} TRI`;
};

const typeElement = document.querySelector("select[name=type]");
getLastAvailable(typeElement.value.toLowerCase(), lastavailable => {
    getDefaultReturn(`${typeElement.value.toLowerCase()}_tri`, lastavailable.endYear, lastavailable.endMonth, setTri => {
        getDefaultReturn(`${typeElement.value.toLowerCase()}_return`, lastavailable.endYear, lastavailable.endMonth, setReturn => {
            getBondAsof(bondAsof => {
                getBondYield(bondAsof.endDate, bondYield => {
                    changeTheadElement(typeElement.value);
                    const tbodyElement = document.querySelector("tbody[name=tableBody]");
                    for (let key in setReturn) {
                        const row = tbodyElement.insertRow();
                        const cell1 = row.insertCell();
                        const text1 = document.createTextNode(key);
                        cell1.appendChild(text1);
                        const cell2 = row.insertCell();
                        const text2 = document.createTextNode(`${setReturn[key].toFixed(2)}%`);
                        cell2.appendChild(text2);
                        const cell3 = row.insertCell();
                        const text3 = document.createTextNode(`${(setTri[key] - setReturn[key]).toFixed(2)}%`);
                        cell3.appendChild(text3);
                        const cell4 = row.insertCell();
                        const text4 = document.createTextNode(`${setTri[key].toFixed(2)}%`);
                        cell4.appendChild(text4);
                        const cell5 = row.insertCell();
                        const text5 = document.createTextNode(`${bondYield[`${key}Y`].toFixed(2)}%`);
                        cell5.appendChild(text5);
                    }
                    const tfootElement = document.querySelector("tfoot[name=tableFoot]");
                    const row = tfootElement.insertRow();
                    const cell1 = row.insertCell();
                    cell1.colSpan = "3";
                    const text1 = document.createTextNode(`Market Return Data from SET asof: ${lastavailable.endMonth}-${lastavailable.endYear}`);
                    cell1.appendChild(text1);
                    const dateSplit = bondAsof.endDate.split("-");
                    const cell2 = row.insertCell();
                    cell2.colSpan = "2";
                    const text2 = document.createTextNode(`Bond Data from ThaiBMA asof: ${dateSplit[2]}-${month[parseInt(dateSplit[1]) - 1]}-${dateSplit[0]}`);
                    cell2.appendChild(text2);
                });
            });
        });
    });
});

const onChangeSelection = () => {
    const selectEndMonth = dateElement.value.split("-")[1];
    const selectEndYear = parseInt(dateElement.value.split("-")[2]);
    getLastAvailable(typeElement.value.toLowerCase(), lastavailable => {
        let endYear = selectEndYear;
        let endMonth = selectEndMonth;
        if (selectEndYear > lastavailable.endYear) {
            endYear = lastavailable.endYear;
            endMonth = lastavailable.endMonth;
        } else if (selectEndYear == lastavailable.endYear) {
            const selectIndex = month.indexOf(selectEndMonth);
            const lastAvailableIndex = month.indexOf(lastavailable.endMonth);
            if (selectIndex > lastAvailableIndex) {
                endMonth = lastavailable.endMonth;
            }
        }
        getDefaultReturn(`${typeElement.value.toLowerCase()}_tri`, endYear, endMonth, setTri => {
            getDefaultReturn(`${typeElement.value.toLowerCase()}_return`, endYear, endMonth, setReturn => {
                getBondAsof(bondAsof => {
                    const dateSplit = dateElement.value.split("-");
                    let asOf = `${dateSplit[2]}-${String(month.indexOf(dateSplit[1]) + 1).padStart(2, '0')}-${String(dateSplit[0]).padStart(2, '0')}`;
                    if (new Date(dateElement.value) > new Date(bondAsof.endDate)) {
                        asOf = bondAsof.endDate;
                    }
                    getBondYield(asOf, bondYield => {
                        changeTheadElement(typeElement.value);
                        const tbodyElement = document.querySelector("tbody[name=tableBody]");
                        let i = 0;
                        for (let key in setReturn) {
                            tbodyElement.children[i].children[1].innerHTML = `${setReturn[key].toFixed(2)}%`;
                            tbodyElement.children[i].children[2].innerHTML = `${(setTri[key] - setReturn[key]).toFixed(2)}%`;
                            tbodyElement.children[i].children[3].innerHTML = `${setTri[key].toFixed(2)}%`;
                            tbodyElement.children[i].children[4].innerHTML = `${bondYield[`${key}Y`].toFixed(2)}%`;
                            i++;
                        }
                        const tfootElement = document.querySelector("tfoot[name=tableFoot]");
                        tfootElement.children[0].children[0].innerHTML = `Market Return Data from SET asof: ${endMonth}-${endYear}`;
                        const dateSplit = asOf.split("-");
                        tfootElement.children[0].children[1].innerHTML = `Bond Data from ThaiBMA asof: ${dateSplit[2]}-${month[parseInt(dateSplit[1]) - 1]}-${dateSplit[0]}`;
                    });
                });
            });
        });
    });
};
