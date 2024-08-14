"use strict";

class ParenMap {
  constructor(map, config) {
    this.map = typeof map === "object" ? map : document.querySelector(map);
    this.states = this.map.querySelectorAll("path");
    this.url = config.url;
    this.data = null;
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
        this.data = res.countries[0].states;
        this.ready();
      })
      .catch((err) => {
        console.log(err);
        this.error();
      });
  }

  checkAvailableStatesData() {
    this.states.forEach((state) => {
      this.data.forEach((data) => {
        if (state.id.toLowerCase() === data.stateCode.toLowerCase())
          state.classList.add("has-data");
      });
    });
  }

  showStatesDataOnClick() {
    this.map.addEventListener("click", (e) => {
        if (e.target.classList.contains("has-data")) {
          this.data.forEach((data) => {
            if (data.stateCode.toLowerCase() === e.target.id.toLowerCase()) {
                console.log(data);
                
              this.stateName.textContent = data.state;
              this.stations.textContent = data.stations.count;
              this.stationsUpcoming.textContent = data.stations.upcoming;
              this.ports.textContent = data.ports.count;
              this.portsNeviFunded.textContent = data.ports.funding.nevi;
              this.utilizationRate.textContent = data.utilization.current + "%";
              this.dataChargingTimeAvg.textContent = data.chargingTime.avg + " min";
            }
          });
        }
      }
    );
  }

  ready() {
    this.checkAvailableStatesData();
    this.showStatesDataOnClick();
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
    console.log("Ready ⚡");    
  },
});

mapUSA.init();