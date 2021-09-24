'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');


class Workout {
    date = new Date();
    id = (Date.now() + '').slice(-10);
    clicks = 0;
    constructor(coords, distance,duration) {
        this.coords = coords; // [23 ,45];
        this.distance = distance; // km
        this.duration = duration; // min

    }

    _setDescription(){
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 
        'August', 'September', 
        'October', 'November', 'December'];
        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${months[this.date.getMonth()]}
         ${this.date.getDate()}`;

    }

    click(){
       return this.clicks++;
    }
}

class Running extends Workout {
    type = 'running';
     constructor(cords, distance, duration,candens) {
        super(cords,distance,duration)
        this.candens = candens;
        this._setDescription();
        this.clacPace();
   
     }

     clacPace(){
         this.pace = this.duration / this.distance;
         return this.pace;
     }
    
}

class Cycling extends Workout{
    type = 'cycling';
    constructor(cords, distance, duration,elevation){
        super(cords,distance,duration)
        this.elevation = elevation;
        this._setDescription();
        this.clacSpeed();
    }

    clacSpeed(){
        this.speed = this.distance / (this.duration/60);
        return this.speed;
    }
}

// const run1 = new Running([12,34], 45,65,34);
// const cycling1 = new Cycling([12,34], 45,65,34);
// console.log(run1, cycling1);

class App {
    #map;
    #mapEvent;
    #workOut = [];
    #mapZoomLevel = 13;
    constructor(){
        this._getPosition();
        this._getLocalStorage();
        form.addEventListener('submit', this._newWorkout.bind(this));
        inputType.addEventListener('change',this._toggleElevationField);
         containerWorkouts.addEventListener('click', this._move.bind(this));   
    }

    _getPosition(){
if (navigator.geolocation)
navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function(){
    alert('could not get your position');
})
    }

    _loadMap(position){
        const {latitude} = position.coords;
        const {longitude} = position.coords;
        const cords = [latitude , longitude];
        this.#map = L.map('map').setView(cords, this.#mapZoomLevel);
    
    L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.#map);
    
    // handling clikc on map
   
    this.#map.on('click',this._showForm.bind(this));
    this.#workOut.forEach(work => {
        this._renderedWorkOutMarker(work);
    })
    }
    _showForm(mapE){
       // console.log(map);
        this.#mapEvent= mapE;
              form.classList.remove('hidden');
              inputDistance.focus(); 
    }


    _toggleElevationField(){
            inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
            inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
    }
    _newWorkout(e){
        const validInputs = (...inputs) => inputs.every(input => Number.isFinite(input));
        const allPositive = (...inputs) => inputs.every(inp => inp >= 0);
        let workOut;
        e.preventDefault();
        // get data from form
        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;
        const {lat , lng} = this.#mapEvent.latlng;
        //console.log(distance);

        // check if the data is valid
        if (type === 'running'){
            const condace = +inputCadence.value;
            // if (!Number.isFinite(distance) || !Number.isFinite(duration)|| !Number.isFinite(condace))
            if (!validInputs(distance,duration,condace) || !allPositive(distance,duration,condace)) {
                return  alert ('Input have to be positive number');
            }

            workOut = new  Running([lat,lng],distance,duration,condace);
            
            }
           
        if (type === 'cycling' ) {
           const elevation = +inputElevation.value;
           if(!validInputs(distance,duration,elevation) || !allPositive(distance,duration))
           return alert ('Input has to be positive number');
         workOut = new Cycling ([lat,lng],distance,duration,elevation);
           
        }
         this.#workOut.push(workOut);

         //console.log(this.#workOut);
         this._renderedWorkOut(workOut)
        
            
      //console.log(mapEvent);
      this._hideForm();
       this._renderedWorkOutMarker(workOut);
       this._setLocalStorage();
       
       
    }

    _hideForm(){
        inputDistance.value = inputCadence.value = inputDuration.value = inputElevation.vaue = '';
        form.style.display = 'none';
        form.classList.add('hidden');
        setTimeout(() => form.style.display = 'grid' , 1000);
    }


    _renderedWorkOutMarker (workout){
        L.marker(workout.coords).addTo(this.#map)
        .bindPopup(L.popup({
            maxwidth : 250,
            minwidth : 100,
            autoClose : false,
            closeOnClick : false,
            className: `${workout.type}-popup`
        })).setPopupContent(`${workout.type === 'running' ? '🏃‍♂️' : "🚴‍♀️"}${workout.description}`)
        .openPopup();
    }

   _renderedWorkOut(workOut){
       let html = `<li class="workout workout--${workOut.type}" data-id="${workOut.id}">
       <h2 class="workout__title">${workOut.description}</h2>
       <div class="workout__details">
         <span class="workout__icon">${workOut.type === Running ? "🏃‍♂️" : "🚴‍♀️"}</span>
         <span class="workout__value">${workOut.distance}</span>
         <span class="workout__unit">km</span>
       </div>
       <div class="workout__details">
         <span class="workout__icon">⏱</span>
         <span class="workout__value">${workOut.duration}</span>
         <span class="workout__unit">min</span>
       </div>`

       if (workOut.type === 'running')
            html += ` <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workOut.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workOut.candens}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>
            `;


        if (workOut.type === 'cycling')
            html +=`
            <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workOut.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workOut.elevation}</span>
            <span class="workout__unit">m</span>
          </div>  </li>
            `;

        form.insertAdjacentHTML('afterend', html);
    }

    _move(e){
        const workoutEl = e.target.closest('.workout');
        console.log(workoutEl);
        if(!workoutEl) return;

        const workout = this.#workOut.find(work => work.id === workoutEl.dataset.id);
        console.log(workout);
        this.#map.setView(workout.coords ,this.#mapZoomLevel, {
            animate : true,
            pan : {
                duration : 1
            }
        })

        
        //console.log(workout.click());
    }
_setLocalStorage(){
    localStorage.setItem('workouts' , JSON.stringify(this.#workOut));

}
_getLocalStorage(){
    const data = JSON.parse(localStorage.getItem('workouts'));
    console.log(data);
    if(!data) return;
    this.#workOut = data;
    this.#workOut.forEach(work => {
        this._renderedWorkOut(work);
      //this._renderedWorkOutMarker(work);
    });

}

reset(){
    localStorage.removeItem('workouts');
    location.reload();
}


}

const app = new App();

 