/* 
 * ZegaSys-Slider
 * Created: 2015-09-03
 * User manual------------------------------------------
 * Include files: 
 *		"slider.js" and "slider.css"
 * Use like this: 
 *		var s = new slider();
 *		s.initialize(target element like document.body);
 */

var singleSlider = function (config) {
	config = config || {};

	//Alapértékek
	this.value = 0;
	this.width = 700;//Slider szélessége pixelben
	this.arrowWidth = 50;//Nyíl szélessége pixelben

	this.maxValue = (config.maxValue) ? config.maxValue : 10;//Maximálisan beállítható érték
	this.minValue = (config.minValue) ? config.minValue : 0;//Minimálisan beállítható érték
	this.stepSize = (config.stepSize) ? config.stepSize : 1;//Lépésköz
	this.displayStepSize = (config.displayStepSize) ? config.displayStepSize : 2;//A vonalzó kijelzése milyen lépésközönként legyen kirajzolva
	this.displayStepSizeBig = (config.displayStepSizeBig) ? config.displayStepSizeBig : this.maxValue;//Milyen lépésközönként legyen egy nagyobb kijelzés

	//Események
	this.onValueChange = (config.onValueChange) ? config.onValueChange : function () {
	};

	this.stepSizeHalf = this.stepSize / 2;//Optimalizálás
	this.stepUnit = this.width / (this.maxValue + Math.abs(this.minValue));

	//Kirajzolás
	this.renderTo = function (el) {
		/*
		 * Komponensek ekészítése és hozzáadása az "el" célelemhez
		 */
		this.container = document.createElement('div');
		this.arrowContainer = document.createElement('div');
		this.arrow = document.createElement('div');
		this.line = document.createElement('div');
		this.input = document.createElement('div');

		this.container.style.width = this.width+'px';
		this.container.className = 'zs-slider-container';
		this.arrowContainer.className = 'arrowContainer';
		this.arrow.className = 'arrowDown';
		this.line.className = 'line';
		this.input.className = 'input';

		this.drawMeasure();//Vonalzó mérőjeleinek kirajzolása
		this.arrowContainer.appendChild(this.arrow);//Felső nyíl
		this.container.appendChild(this.arrowContainer);//Felső nyíl
		this.container.appendChild(this.line);//Slider középső vonal
		this.container.appendChild(this.input);//Input handler
		el.appendChild(this.container);
		
		//Resizehoz
		//this.width = $(this.container).width();
		this.stepUnit = this.width / (this.maxValue + Math.abs(this.minValue));
		
		//Események hozzáadása
		this.setupEvents();

		//Alapérték beállítása ha van
		if (config.value) {
			console.log("dsfs");
			this.setValue(config.value);
		}
	};

	//Események hozzáadása
	this.setupEvents = function () {
		var me = this;//alias

		/*$(window).resize(function () {
			console.log("Új szélesség: ",$(me.container).width());
			me.width = $(this).width()-60;
			me.stepUnit = me.width / (me.maxValue + Math.abs(me.minValue));
			me.drawMeasure();
		});*/

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
			//Csak akkor adjuk hozzá a mousemove-ot ha kell
			$(document).on("touchmove", function (e) {
				e.preventDefault();
				var touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
				var localPosX = touch.pageX - elOffset.left;
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
			var localPosX = touch.pageX - elOffset.left;
			localPosX = (localPosX >= me.width) ? me.width : localPosX;//Ha túllépte a maximumot
			localPosX = (localPosX < 0) ? 0 : localPosX;//Ha nem érte el a minimumot
			me.setValue(me.convertPositionToValue(localPosX));//Slider értékének beállítása
			$(document).unbind("touchmove");
		});
	};

	//Érték beállítása
	this.setValue = function (v) {
		if (v !== this.value) {
			//Nyíl értékének kerekítése a legközelebbi értékhez
			var alap = Math.floor(v / this.stepSize) * this.stepSize;
			alap += (v % this.stepSize >= this.stepSizeHalf) ? this.stepSize : 0;
			v = alap;
			//Nyíl mozgatása ha az érték megváltozott
			if (v !== this.value) {
				$(this.arrow).css({left: (v * this.stepUnit) - (this.arrowWidth / 2)});
				this.value = v;
				this.onValueChange(this.value);
			}
		}
	};

	//X,Y koordinátából kiszámolja a slider értékét
	this.convertPositionToValue = function (x) {
		if ((x % this.stepUnit) < this.stepUnit / 2)
			return Math.floor(x / this.stepUnit);//Balra húz a nyíl
		else
			return Math.ceil(x / this.stepUnit);//Jobbra húz a nyíl
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