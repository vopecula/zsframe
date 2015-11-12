/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


var dualSlider = function (config) {
	config = config || {};

	//Alapértékek
	this.value = [0, 0];
	this.width = 700;//Slider szélessége pixelben
	this.arrowWidth = 50;//Nyíl szélessége pixelben
	this.arrowContainerHeight = 50;//Nyílt tartó konténer magassága, ez alapján dől el, hogy melyik nyilat fogom meg egérrel

	this.maxValue = (config.maxValue) ? config.maxValue : 10;//Maximálisan beállítható érték
	this.minValue = (config.minValue) ? config.minValue : 0;//Minimálisan beállítható érték
	this.stepSize = (config.stepSize) ? config.stepSize : 1;//Lépésköz
	this.displayStepSize = (config.displayStepSize) ? config.displayStepSize : 2;//A vonalzó kijelzése milyen lépésközönként legyen kirajzolva
	this.displayStepSizeBig = (config.displayStepSizeBig) ? config.displayStepSizeBig : this.maxValue;//Milyen lépésközönként legyen egy nagyobb kijelzés
	this.lockArrows = true;//A nyilak nem léphetik át egymás határát

	//Események
	this.onValueChange = (config.onValueChange) ? config.onValueChange : function () {
	};

	this.stepSizeHalf = this.stepSize / 2;//Optimalizálás
	this.stepUnit = this.width / (this.maxValue + Math.abs(this.minValue));
	this.draggedArrow = false;//épp melyik nyilat mozgatják

	//Kirajzolás
	this.renderTo = function (el) {
		/*
		 * Komponensek ekészítése és hozzáadása az "el" célelemhez
		 */
		this.container = document.createElement('div');
		this.arrowContainerTop = document.createElement('div');
		this.arrowContainerBottom = document.createElement('div');
		this.arrowDown = document.createElement('div');
		this.arrowUp = document.createElement('div');
		this.line = document.createElement('div');
		this.input = document.createElement('div');

		this.container.style.width = this.width + 'px';
		this.container.className = 'zs-slider-container';
		this.arrowContainerTop.className = 'arrowContainer';
		this.arrowContainerBottom.className = 'arrowContainer';
		this.arrowDown.className = 'arrowDown';
		this.arrowUp.className = 'arrowUp';
		this.line.className = 'line';
		this.input.className = 'input';

		this.drawMeasure();//Vonalzó mérőjeleinek kirajzolása
		this.arrowContainerTop.appendChild(this.arrowDown);//Felső nyíl
		this.container.appendChild(this.arrowContainerTop);//Felső nyíl
		this.container.appendChild(this.line);//Slider középső vonal
		this.arrowContainerBottom.appendChild(this.arrowUp);//Alsó nyíl
		this.container.appendChild(this.arrowContainerBottom);//Alsó nyíl
		this.container.appendChild(this.input);//Input handler
		el.appendChild(this.container);

		//Események hozzáadása
		this.setupEvents();

		//Alapérték beállítása ha van
		if (config.value && config.value[0] <= this.maxValue && config.value[1] <= this.maxValue && config.value[1] >= this.minValue && config.value[1] >= this.minValue)
			this.setValue(config.value);
	};

	//Események hozzáadása
	this.setupEvents = function () {
		var me = this;//alias
		/*
		 * Mouse events
		 */
		//On-click
		$(this.input).on("click", function (e) {
			me.setValue(me.convertPositionToValue(e.offsetX));
			e.preventDefault();
		});
		//Mouse-down
		$(this.input).on("mousedown", function (e) {
			e.preventDefault();

			var elOffset = $(me.input).offset();
			elOffset.left -= $(window).scrollLeft();
			me.draggedArrow = ((e.pageY - elOffset.top) > me.arrowContainerHeight) ? "bottomArrow" : "topArrow";

			//Csak akkor adjuk hozzá a mousemove-ot ha kell
			$(document).on("mousemove", function (e) {
				e.preventDefault();
				var localPosX = e.pageX - elOffset.left;//Lokális vízszintes pozíció kiszámítása
				localPosX = (localPosX >= me.width) ? me.width : localPosX;//Ha túllépte a maximumot
				localPosX = (localPosX < 0) ? 0 : localPosX;//Ha nem érte el a minimumot
				me.setValue(me.convertPositionToValue(localPosX));//Slider értékének beállítása
			}).click(function () {
				$(this).unbind("mousemove");
			});
		});

		/*
		 * Touch events
		 */
		//Touch-move
		$(this.input).on("touchstart", function (e) {
			var elOffset = $(me.input).offset();
			elOffset.left -= $(window).scrollLeft();
			var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
			me.draggedArrow = ((touch.pageY - elOffset.top) > 50) ? "bottomArrow" : "topArrow";
			//Csak akkor adjuk hozzá a mousemove-ot ha kell
			$(document).on("touchmove", function (e) {
				e.preventDefault();
				var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
				var localPosX = touch.pageX - elOffset.left;//Lokális vízszintes pozíció kiszámítása
				localPosX = (localPosX >= me.width) ? me.width : localPosX;//Ha túllépte a maximumot
				localPosX = (localPosX < 0) ? 0 : localPosX;//Ha nem érte el a minimumot
				me.setValue(me.convertPositionToValue(localPosX));//Slider értékének beállítása
			});
		});
		$(this.input).on("touchend", function (e) {
			e.preventDefault();
			var elOffset = $(me.input).offset();
			elOffset.left -= $(window).scrollLeft();
			var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
			var localPosX = touch.pageX - elOffset.left;//Lokális vízszintes pozíció kiszámítása
			localPosX = (localPosX >= me.width) ? me.width : localPosX;//Ha túllépte a maximumot
			localPosX = (localPosX < 0) ? 0 : localPosX;//Ha nem érte el a minimumot
			me.setValue(me.convertPositionToValue(localPosX));//Slider értékének beállítása
			$(document).unbind("touchmove");
		});
	};

	//Érték beállítása
	this.setValue = function (v) {
		//Felső nyíl értékének beállítása
		if (v[0] !== this.value[0]) {
			//Felső nyíl értékének kerekítése a legközelebbi értékhez
			var alap = Math.floor(v[0] / this.stepSize) * this.stepSize;
			alap += (v[0] % this.stepSize >= this.stepSizeHalf) ? this.stepSize : 0;
			v[0] = alap;
			//Felső nyíl mozgatása, ha megváltozott az értéke (optimalizálás)
			if (v[0] !== this.value[0]) {
				$(this.arrowDown).css({left: (v[0] * this.stepUnit) - (this.arrowWidth / 2)});
			}
		}
		//Alsó nyíl értékének beállítása
		if (v[1] !== this.value[1]) {
			//Alsó nyíl értékének kerekítése a legközelebbi értékhez
			var alap = Math.floor(v[1] / this.stepSize) * this.stepSize;
			alap += (v[1] % this.stepSize >= this.stepSizeHalf) ? this.stepSize : 0;
			v[1] = alap;
			//Alsó nyíl mozgatása, ha megváltozott az értéke (optimalizálás)
			if (v[1] !== this.value[1]) {
				$(this.arrowUp).css({left: (v[1] * this.stepUnit) - (this.arrowWidth / 2)});
			}
		}
		if (v[0] !== this.value[0] || v[1] !== this.value[1]) {
			this.value = v;
			this.onValueChange(this.value);
		}
	};

	//X,Y koordinátából kiszámolja a slider értékét
	this.convertPositionToValue = function (x) {
		if ((x % this.stepUnit) < this.stepUnit / 2)
			var value = Math.floor(x / this.stepUnit);//Balra húz a nyíl
		else
			var value = Math.ceil(x / this.stepUnit);//Jobbra húz a nyíl
		if (this.draggedArrow === "topArrow")
			return [value, this.value[1]];
		else
			return [this.value[0], value];
	};

	//Kirajzolja a vonalzót
	this.drawMeasure = function () {
		$(this.line).html("");
		var minValue = (this.minValue > 0) ? -this.minValue : this.minValue;//Ez gondoskodik arról, hogy a minimum érték negatív legyen ha kisebb mint nulla
		for (var i = minValue; i <= this.maxValue; i++) {
			if ((i % this.displayStepSize) === 0) {
				//Beosztás
				var unit = document.createElement('div');
				unit.className = ((i % this.displayStepSizeBig) === 0) ? "unitBig" : "unit";
				unit.style.left = Math.floor((i + (Math.abs(minValue))) * this.stepUnit) + "px";
				//Beosztás szövege
				var unitText = document.createElement('div');
				unitText.className = "unitText";
				unitText.innerHTML = (this.minValue < 0) ? i : Math.abs(i);//Ez lehető teszi, hogy ha minimumként 100-at adtunk meg és maximumként 90-et akkor a 100 ne legyen negatívként kiírva
				unit.appendChild(unitText);
				//Hozzáadás a csúszka vonalhoz
				this.line.appendChild(unit);
			}
		}
	};
};