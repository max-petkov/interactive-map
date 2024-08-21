"use strict";

class ParenMap {
  constructor(config) {
    this.map = document.querySelector(".usa-map");
    this.states = this.map.querySelectorAll("path");
    this.pins = document.querySelector(".usa-map-pins");
    this.url = config.url;
    this.splide = null;
    this.data = null;
    this.search = null;
    this.searchableStates = [];
    this.utilizationChart = null;
    this.selectedUtilizationChartValues = {xAxis: null, data: null, name: null};
    this.comparisonUtilizationChartValues = {data: null, name: null};
    this.chargingChart = null;
    this.selectedChargingChartValues = {xAxis: null, data: null};
    this.sessionsChart = null;
    this.selectedSessionsChartValues = {xAxis: null, data: null};
    this.cbReady = config.onReady || function () {};
    this.cbError = config.onError || function () {};
    this.stateName = document.querySelector("[data-state-name]");
    this.stations = document.querySelector("[data-stations]");
    this.stationsNeviFunded = document.querySelector("[data-stations-nevi-funded]");
    this.stationsUpcoming = document.querySelector("[data-stations-upcoming]");
    this.ports = document.querySelector("[data-ports]");
    this.portsNeviFunded = document.querySelector("[data-ports-nevi-funded]");
    this.portsDown = document.querySelector("[data-ports-down]");
    this.utilizationRate = document.querySelector("[data-utilization-rate]");
    this.healthScoreAvg = document.querySelector("[data-health-score-avg]");
    this.dataChargingTimeAvg = document.querySelector("[data-charging-time-avg]");
  }

  fetchData() {
    fetch(this.url)
      .then((res) => res.json())
      .then((res) => {
        this.data = res;
        this.ready();
      })
      .catch((err) => {
        console.log(err);
        this.error();
      });
  }

  checkAvailableStatesData() {
    this.states.forEach((state) => {
      this.data.countries[0].states.forEach((data) => {
        if (state.id.toLowerCase() === data.stateCode.toLowerCase()) {
          state.classList.add("has-data");
          this.searchableStates.push({value: data.stateCode.toUpperCase(), text: data.state});      
        }
      });
    });
  }

  showUSADataOnClick() {
    // ⚡ TBD
    document
      .querySelector("[data-btn-usa-summary]")
      .addEventListener("click", () => {
        if(this.map.querySelector("path.active")) this.map.querySelector("path.active").classList.remove("active");
        if(this.pins.querySelector("path.active")) this.pins.querySelector("path.active").classList.remove("active");
        this.map.nextElementSibling.classList.add("active");

        this.renderData(this.data.countries[0], true);
        this.setChartValues(this.data.countries[0]);
        this.addCharts();

      });
  }

  addSearch() {
    const search = new TomSelect('#select-state', {
        options: this.searchableStates,
        maxItems: 1,
        onChange: function(state) {          
            search.clear();
            if(!state) return;
            if(this.map.getElementById(state.toUpperCase()).classList.contains("active")) return;
            
            this.map.getElementById(state.toUpperCase()).dispatchEvent(new Event("click"));            
        }.bind(this)
    });

    this.search = search;
  }

  showStatesDataOnClick() {
    this.states.forEach(state => {        
        if (!state.classList.contains("has-data")) return;

        state.addEventListener("click", () => {            
            if(state.classList.contains("active")) return;
        
            this.data.countries[0].states.forEach((selectedData) => {
            if (selectedData.stateCode.toLowerCase() === state.id.toLowerCase()) {
                this.map.nextElementSibling.classList.remove("active");
                if(this.map.querySelector("path.active")) this.map.querySelector("path.active").classList.remove("active");
                if(this.pins.querySelector("path.active")) this.pins.querySelector("path.active").classList.remove("active");
                state.classList.add("active");
                this.pins.getElementById(state.id.toUpperCase()).classList.add("active");

                this.renderData(selectedData, this.data);
                this.setChartValues(selectedData, this.data);
                this.addCharts();
            }
            });
            });
    });
  }

  setChartValues(selectedData, comparisonData) {    
    this.selectedUtilizationChartValues.name = selectedData.state;
    this.selectedUtilizationChartValues.xAxis = selectedData.utilization.xAxis.split(",");
    this.selectedUtilizationChartValues.data = selectedData.utilization.data.split(",");
        
    this.comparisonUtilizationChartValues.name = comparisonData.countries[0].country;
    this.comparisonUtilizationChartValues.data = comparisonData.countries[0].utilization.data.split(",");

    this.selectedChargingChartValues.xAxis = selectedData.chargingTime.xAxis.split(",");
    this.selectedChargingChartValues.data = selectedData.chargingTime.data.split(",");          
    this.selectedSessionsChartValues.xAxis = selectedData.sessions.xAxis.split(",");
    this.selectedSessionsChartValues.data = selectedData.sessions.data.split(","); 
  }

  addCharts() {
    if(this.utilizationChart) this.utilizationChart.destroy();
    if(this.chargingChart) this.chargingChart.destroy();
    if(this.sessionsChart) this.sessionsChart.destroy(); 
    
    this.utilizationChart = new Chart(document.getElementById('utilization-chart'), {
      type: 'line',
      data: {
        labels: this.distributeEvenly(this.setMonths(this.selectedUtilizationChartValues.xAxis)),
        datasets: [
          {
            label: this.comparisonUtilizationChartValues.name,
            data: this.comparisonUtilizationChartValues.data,
            borderWidth: 1,
            borderColor: "#22C55D",
            borderDash: [5, 5],
            fill: true,
            backgroundColor: (context) => {
              if(!context.chart.chartArea) return;
              const {ctx, chartArea: {top, bottom}} = context.chart;
              const gradient = ctx.createLinearGradient(0, top, 0, bottom)
              gradient.addColorStop(0, "rgba(23, 183, 134, 0.20)");
              gradient.addColorStop(0.25, "rgba(23, 183, 134, 0.20)");
              gradient.addColorStop(0.5, "rgba(23, 183, 134, 0.20)");
              gradient.addColorStop(0.75, "rgba(23, 183, 134, 0.20)");
              gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
              return gradient;
              
            },
            tension: 0.5,
            pointRadius: 3.5,
            pointBackgroundColor: "#22C55D",
            pointBorderColor: "#000000",
          },
          {
          label: this.selectedUtilizationChartValues.name,
          data: this.selectedUtilizationChartValues.data,
          borderWidth: 1,
          borderColor: "#6100FF",
          fill: true,
          backgroundColor: (context) => {
            if(!context.chart.chartArea) return;
            const {ctx, chartArea: {top, bottom}} = context.chart;
            const gradient = ctx.createLinearGradient(0, top, 0, bottom)
            gradient.addColorStop(0, "rgba(61, 75, 224, 0.25)");
            gradient.addColorStop(0.25, "rgba(61, 75, 224, 0.25)");
            gradient.addColorStop(0.5, "rgba(61, 75, 224, 0.25)");
            gradient.addColorStop(0.75, "rgba(61, 75, 224, 0.25)");
            gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
            return gradient;
            
          },
          tension: 0.5,
          pointRadius: 3.5,
          pointBackgroundColor: "#6100FF",
          pointBorderColor: "#000000",
        },
      ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            grid: {color: "#4B4D63"},
            border: { dash: [4, 5]},  
            beginAtZero:  true,
            suggestedMax: 100,
            ticks: { color: "#4B4D63"},
          },
          x: {
            grid: {color: "rgba(0, 0, 0, 0)"},
            ticks: { 
              autoSkip: false,
              align: "center",
              maxRotation: 0,
              minRotation: 0,
            }
           }
        },
        plugins: {
          legend: { display: false },
          tooltip: { 
            padding: 6,
            footerFont: { weight: "regular"},
            footerMarginTop: 10,
            callbacks: {
              title: (data) => {              
                return data[0].dataset.label;
              },
              label: (data) => {     
                return data.raw;
              }
            }
           }
        }
      }
    });
    
      this.chargingChart = new Chart(document.getElementById('charging-chart'), {
        type: 'line',
        data: this.setChartData({
          label: "Charging time",
          labels: this.selectedChargingChartValues.xAxis,
          data: this.selectedChargingChartValues.data,
          primaryColor: "#22C55D",
          bgColor: "rgba(23, 183, 134, 0.25)",
        }),
        options: this.setChartOptions({})
      });

      this.sessionsChart = new Chart(document.getElementById('sessions-chart'), {
        type: 'line',
        data: this.setChartData({
          label: "Sessions",
          labels: this.selectedSessionsChartValues.xAxis,
          data: this.selectedSessionsChartValues.data,
        }),
        options: this.setChartOptions({})
      });
  }

  setChartData(config) {
    return {
      labels: this.distributeEvenly(this.setMonths(config.labels)),
      datasets: [{
        label: config.label ? config.label : "",
        data: config.data,
        borderWidth: config.borderWidth ? config.borderWidth : 1,
        borderColor: [config.primaryColor ? config.primaryColor : "#6100FF"],
        fill: config.fill ? config.fill : true,
        backgroundColor: (context) => {
          if(!context.chart.chartArea) return;
          const {ctx, data, chartArea: {top, bottom}} = context.chart;
          const gradient = ctx.createLinearGradient(0, top, 0, bottom)
          gradient.addColorStop(0, config.bgColor ? config.bgColor : "rgba(61, 75, 224, 0.25)");
          gradient.addColorStop(0.25, config.bgColor ? config.bgColor : "rgba(61, 75, 224, 0.25)");
          gradient.addColorStop(0.5, config.bgColor ? config.bgColor : "rgba(61, 75, 224, 0.25)");
          gradient.addColorStop(0.75, config.bgColor ? config.bgColor : "rgba(61, 75, 224, 0.25)");
          gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
          return gradient;
          
        },
        tension: config.tension ? config.tension : 0.5,
        pointRadius: config.pointRadius ? config.pointRadius : 3.5,
        pointBackgroundColor: config.primaryColor ? config.primaryColor : "#6100FF",
        pointBorderColor: config.pointBorderColor ? config.pointBorderColor : "#000000",
      }]
    };
  }

  setMonths(arr) {
    return arr.reduce((acc, label) => {
      if (acc.includes(this.monthText(label.slice(4, 6)))) {
        acc.push("");
      } else {
        acc.push(this.monthText(label.slice(4, 6)));
      }
      return acc;
    }, []);
  }

  distributeEvenly(arr) {
    const nonEmptyElements = arr.filter(item => item !== '');
    const emptySlots = arr.length - nonEmptyElements.length;
    const gaps = nonEmptyElements.length - 1;
    const baseGap = Math.floor(emptySlots / gaps);
    const extraSlots = emptySlots % gaps;

    let result = [];
    let extraSlotUsed = 0;

    nonEmptyElements.forEach((element, index) => {
        result.push(element);

        if (index < gaps) {
            let gapSize = baseGap + (extraSlotUsed < extraSlots ? 1 : 0);
            result.push(...Array(gapSize).fill(''));
            extraSlotUsed++;
        }
    });

    return result;
}

  setChartOptions(config) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          grid: {color: config.color ? config.color : "#4B4D63"},
          border: { dash: config.dash ? config.dash : [4, 5]},  
          // beginAtZero: config.beginAtZero ? config.beginAtZero : true,
          suggestedMax: 100,
          ticks: { color: config.color ? config.color : "#4B4D63"},
        },
        x: {
          grid: {color: "rgba(0, 0, 0, 0)"},
          ticks: { 
            autoSkip: false,
            align: "center",
            maxRotation: 0,
            minRotation: 0,
          }
         }
      },
      plugins: {
        legend: { display: false },
        tooltip: { 
          padding: 6,
          footerFont: { weight: "regular"},
          footerMarginTop: 10,
          callbacks: {
            title: (data) => {              
              return data[0].dataset.label;
            },
            label: (data) => {     
              return data.raw;
            }
          }
         }
      }
    };
  }

  renderData(data, country = false) {
    this.stateName.textContent = !country ? data.state : data.country;
    this.stations.textContent = data.stations.count;
    this.stationsUpcoming.textContent = data.stations.upcoming;
    this.ports.textContent = data.ports.count;
    this.portsNeviFunded.textContent = data.ports.funding.nevi;
    this.utilizationRate.textContent = data.utilization.current + "%";
    this.dataChargingTimeAvg.textContent = data.chargingTime.avg + " min";
  }

  monthText(n) {
    if(n == "01") return "Jan";
    if(n == "02") return "Feb";
    if(n == "03") return "Mar";
    if(n == "04") return "Apr";
    if(n == "05") return "May";
    if(n == "06") return "June";
    if(n == "07") return "July";
    if(n == "08") return "Aug";
    if(n == "09") return "Sept";
    if(n == "10") return "Oct";
    if(n == "11") return "Nov";
    if(n == "12") return "Dec";
  }

  addSlider() {
    this.splide = new Splide( ".splide", {
      arrows: false,
      gap: 16,
    } );
    this.splide.mount();
  }

  ready() {
    this.checkAvailableStatesData();
    this.showStatesDataOnClick();
    this.showUSADataOnClick(); // ⚡ TBD
    this.addSearch();
    this.addSlider();
    this.cbReady();
  }

  error() {
    this.cbError();
  }

  init() {
    this.fetchData();
  }
}

const mapUSA = new ParenMap({
  url: "./json/statechart.json",
  onReady: function () {
    console.log("Ready 🚀");
  },
});

mapUSA.init();