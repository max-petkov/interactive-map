function ParenMap() {
    this.map = document.getElementById("usa-map");
    this.states = this.map.querySelectorAll("path");
    this.data = null;
}

ParenMap.prototype.getData = function() {
    fetch("./json/statechart.json")
        .then(res => {
            if (!res.ok) throw new Error('Something went wrong... 😢');

            return res.json();
        })
        .then(res => {
            this.data = res.countries[0].states;            

            this.states.forEach(state => {
                this.data.forEach(data => {
                    if(state.id.toLowerCase() === data.stateCode.toLowerCase()) state.classList.add("has-data");
                });
            });
        })
        .catch(err => console.log(err));
}

ParenMap.prototype.showData = function() {
    this.map.addEventListener("click", function(e) {
        if(e.target.classList.contains("has-data")) {
            this.data.forEach(data => {
                if(data.stateCode.toLowerCase() === e.target.id.toLowerCase()) {
                    console.log(data);
                }
            });
        }
    }.bind(this));
}

ParenMap.prototype.init = function() {
    this.getData();
    this.showData();
}

const map  = new ParenMap();
map.init();