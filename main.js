"use strict";

class ParenMap {
  constructor(map, config) {
    this.map = typeof map === "object" ? map : document.querySelector(map);
    this.states = this.map.querySelectorAll("path");
    this.url = config.url;
    this.splide = null;
    this.data = null;
    this.search = null;
    this.searchableStates = [];
    this.utilizationChart = null;
    this.utilizationChartValues = {xAxis: null, data: null};
    this.chargingChart = null;
    this.chargingChartValues = {xAxis: null, data: null};
    this.sessionsChart = null;
    this.sessionsChartValues = {xAxis: null, data: null};
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

  showStatesDataOnClick() {

    this.states.forEach(state => {        
        if (!state.classList.contains("has-data")) return;

        state.addEventListener("click", () => {            
            if(state.classList.contains("active")) return;
        
            this.data.countries[0].states.forEach((data) => {
            if (data.stateCode.toLowerCase() === state.id.toLowerCase()) {
                this.map.nextElementSibling.classList.remove("active");
                if(this.map.querySelector("path.active")) this.map.querySelector("path.active").classList.remove("active");
                state.classList.add("active");

                this.renderData(data);
                this.setChartValues(data);
                this.addCharts();
            }
            });
            });
    });
  }

  showUSADataOnClick() {
    // ⚡ TBD
    document
      .querySelector("[data-btn-usa-summary]")
      .addEventListener("click", () => {
        if(this.map.querySelector("path.active")) this.map.querySelector("path.active").classList.remove("active");
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

  addCharts() {
    if(this.utilizationChart) this.utilizationChart.destroy();
    if(this.chargingChart) this.chargingChart.destroy();
    if(this.sessionsChart) this.sessionsChart.destroy();
    
    this.utilizationChart = new Chart(document.getElementById('utilization-chart'), {
      type: 'line',
      data: this.setChartData({
        label: "Utilization",
        labels: this.utilizationChartValues.xAxis,
        data: this.utilizationChartValues.data,
      }),
      options: this.setChartOptions({})
    });
    
      this.chargingChart = new Chart(document.getElementById('charging-chart'), {
        type: 'line',
        data: this.setChartData({
          label: "Charging time",
          labels: this.chargingChartValues.xAxis,
          data: this.chargingChartValues.data,
          primaryColor: "#22C55D",
          bgColor: "rgba(23, 183, 134, 0.07)",
        }),
        options: this.setChartOptions({})
      });

      this.sessionsChart = new Chart(document.getElementById('sessions-chart'), {
        type: 'line',
        data: this.setChartData({
          label: "Sessions",
          labels: this.sessionsChartValues.xAxis,
          data: this.sessionsChartValues.data,
        }),
        options: this.setChartOptions({})
      });
  }

  setChartData(config) {
    return {
      labels: config.labels,
      datasets: [{
        label: config.label ? config.label : "",
        data: config.data,
        borderWidth: config.borderWidth ? config.borderWidth : 1,
        borderColor: [config.primaryColor ? config.primaryColor : "#6100FF"],
        fill: config.fill ? config.fill : true,
        backgroundColor: config.bgColor ? config.bgColor : "rgba(61, 75, 224, 0.07)",
        tension: config.tension ? config.tension : 0.05,
        pointRadius: config.pointRadius ? config.pointRadius : 3.5,
        pointBackgroundColor: config.primaryColor ? config.primaryColor : "#6100FF",
        pointBorderColor: config.pointBorderColor ? config.pointBorderColor : "#000000",
      }]
    };
  }

  setChartOptions(config) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: { 
          grid: {color: config.color ? config.color : "#4B4D63"},
          border: { dash: config.dash ? config.dash : [4, 5]},  
          beginAtZero: config.beginAtZero ? config.beginAtZero : true,
          ticks: { color: config.color ? config.color : "#4B4D63"},
          suggestedMax: config.suggestedMax ? config.suggestedMax : 40,
         },
         x: {
          grid: {color: "rgba(0, 0, 0, 0)"},
          ticks: {display: false}
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
            },
            footer: (data) => {              
              return this.setMonth(data[0].label.slice(4, 6)) + " " + data[0].label.slice(-2) + ", " + data[0].label.slice(0, 4);
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

  setChartValues(data) {
    this.utilizationChartValues.xAxis = data.utilization.xAxis.split(",");
    this.utilizationChartValues.data = data.utilization.data.split(",");          
    this.chargingChartValues.xAxis = data.chargingTime.xAxis.split(",");
    this.chargingChartValues.data = data.chargingTime.data.split(",");          
    this.sessionsChartValues.xAxis = data.sessions.xAxis.split(",");
    this.sessionsChartValues.data = data.sessions.data.split(","); 
  }

  setMonth(n) {
    if(n == "01") return "Jan.";
    if(n == "02") return "Feb.";
    if(n == "03") return "Mar.";
    if(n == "04") return "Apr.";
    if(n == "05") return "May";
    if(n == "06") return "June";
    if(n == "07") return "July";
    if(n == "08") return "Aug.";
    if(n == "09") return "Sept.";
    if(n == "10") return "Oct.";
    if(n == "11") return "Nov.";
    if(n == "12") return "Dec.";
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

const mapUSA = new ParenMap("#usa-map", {
  url: "./json/statechart.json",
  onReady: function () {
    console.log("Ready 🚀");
  },
});

mapUSA.init();