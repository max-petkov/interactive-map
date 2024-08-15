"use strict";

class ParenMap {
  constructor(map, config) {
    this.map = typeof map === "object" ? map : document.querySelector(map);
    this.states = this.map.querySelectorAll("path");
    this.url = config.url;
    this.data = null;
    this.search = null;
    this.searchableStates = [];
    this.utilizationChartValues = {xAxis: null, data: null};
    this.chargingChartValues = {xAxis: null, data: null};
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

                this.stateName.textContent = data.state;
                this.stations.textContent = data.stations.count;
                this.stationsUpcoming.textContent = data.stations.upcoming;
                this.ports.textContent = data.ports.count;
                this.portsNeviFunded.textContent = data.ports.funding.nevi;
                this.utilizationRate.textContent = data.utilization.current + "%";
                this.dataChargingTimeAvg.textContent = data.chargingTime.avg + " min";


              // Refactor
              this.utilizationChartValues.xAxis = data.utilization.xAxis.split(",");
              this.utilizationChartValues.data = data.utilization.data.split(",");          
              this.chargingChartValues.xAxis = data.chargingTime.xAxis.split(",");
              this.chargingChartValues.data = data.chargingTime.data.split(",");          
              this.sessionsChartValues.xAxis = data.sessions.xAxis.split(",");
              this.sessionsChartValues.data = data.sessions.data.split(","); 

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

        this.stateName.textContent = this.data.countries[0].country;
        this.stations.textContent = this.data.countries[0].stations.count;
        this.stationsUpcoming.textContent = this.data.countries[0].stations.upcoming;
        this.ports.textContent = this.data.countries[0].ports.count;
        this.portsNeviFunded.textContent = this.data.countries[0].ports.funding.nevi;
        this.utilizationRate.textContent = this.data.countries[0].utilization.current + "%";
        this.dataChargingTimeAvg.textContent = this.data.countries[0].chargingTime.avg + " min";

        // Refactor
        this.utilizationChartValues.xAxis = this.data.countries[0].utilization.xAxis.split(",");
        this.utilizationChartValues.data = this.data.countries[0].utilization.data.split(",");          
        this.chargingChartValues.xAxis = this.data.countries[0].chargingTime.xAxis.split(",");
        this.chargingChartValues.data = this.data.countries[0].chargingTime.data.split(",");          
        this.sessionsChartValues.xAxis = this.data.countries[0].sessions.xAxis.split(",");
        this.sessionsChartValues.data = this.data.countries[0].sessions.data.split(","); 

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
    // Refactoring

    const ctx1 = new Chart(document.getElementById('utilization-chart'), {
      type: 'line',
      data: {
        labels: this.utilizationChartValues.xAxis,
        datasets: [{
          data: this.utilizationChartValues.data,
          borderWidth: 1,
          borderColor: ["#6100FF"],
          fill: true,
          backgroundColor: 'rgba(61, 75, 224, 0.07)',
          tension: 0.05,
          pointRadius: 3.5,
          pointBackgroundColor: "#6100FF",
          pointBorderColor: "#000000",
        }]
      },
      options: {
        scales: {
          y: { 
            grid: {color: '#4B4D63'},
            border: { dash: [4, 5]},  
            beginAtZero: true,
            ticks: { color: "#4B4D63" },
            suggestedMax: 40
           },
           x: {
            grid: {color: "rgba(0, 0, 0, 0)"},
            ticks: {display: false}
           }
        },
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false }
        }
      }
    });


    const ctx2 = new Chart(document.getElementById('charging-chart'), {
      type: 'line',
      data: {
        labels: this.chargingChartValues.xAxis,
        datasets: [{
          data: this.chargingChartValues.data,
          borderWidth: 1,
          borderColor: ["#22C55D"],
          fill: true,
          backgroundColor: 'rgba(23, 183, 134, 0.07)',
          tension: 0.05,
          pointRadius: 3.5,
          pointBackgroundColor: "#22C55D",
          pointBorderColor: "#000000",
        }]
      },
      options: {
        scales: {
          y: { 
            grid: {color: '#4B4D63'},
            border: { dash: [4, 5]},  
            beginAtZero: true,
            ticks: { color: "#4B4D63" },
            suggestedMax: 40
           },
           x: {
            grid: {color: "rgba(0, 0, 0, 0)"},
            ticks: {display: false}
           }
        },
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false }
        }
      }
    });

    const ctx3 = new Chart(document.getElementById('sessions-chart'), {
      type: 'line',
      data: {
        labels: this.sessionsChartValues.xAxis,
        datasets: [{
          data: this.sessionsChartValues.data,
          borderWidth: 1,
          borderColor: ["#6100FF"],
          fill: true,
          backgroundColor: 'rgba(61, 75, 224, 0.07)',
          tension: 0.05,
          pointRadius: 3.5,
          pointBackgroundColor: "#6100FF",
          pointBorderColor: "#000000",
        }]
      },
      options: {
        scales: {
          y: { 
            grid: {color: '#4B4D63'},
            border: { dash: [4, 5]},  
            beginAtZero: true,
            ticks: { color: "#4B4D63" },
            suggestedMax: 40
           },
           x: {
            grid: {color: "rgba(0, 0, 0, 0)"},
            ticks: {display: false}
           }
        },
        plugins: {
          legend: { display: false },
          tooltip: { enabled: false }
        }
      }
    });
  }

  ready() {
    this.checkAvailableStatesData();
    this.showStatesDataOnClick();
    this.showUSADataOnClick(); // ⚡ TBD
    this.addSearch();
    // this.addCharts();
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