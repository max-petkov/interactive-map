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
        console.log(res);
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
        if (state.id.toLowerCase() === data.stateCode.toLowerCase())
          state.classList.add("has-data");
      });
    });
  }

  showStatesDataOnClick() {

    this.states.forEach(state => {        
        if (!state.classList.contains("has-data")) return;

        state.addEventListener("click", () => {
            console.log("click");
            
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

      });
  }

  ready() {
    this.checkAvailableStatesData();
    this.showStatesDataOnClick();
    this.showUSADataOnClick(); // ⚡ TBD
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

    // Need Refactoring Search Input
    const states = [];
    mapUSA.data.countries[0].states.forEach(state => {
        states.push({value: state.stateCode.toUpperCase(), text: state.state});
    });    
    
    const search = new TomSelect('#select-state', {
        options: states,
        maxItems: 1,
        onChange: function(state) {
            search.clear();
            if(!state) return;
            if(mapUSA.map.querySelector("#" + state.toUpperCase()).classList.contains("active")) return;
            
            mapUSA.map.querySelector("#" + state.toUpperCase()).dispatchEvent(new Event("click"));
            
        }
    });
    // Need Refactoring Search Input
    
  },
});

mapUSA.init();