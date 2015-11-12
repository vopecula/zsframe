/* 
 * ZegaSys-Toggle
 * Created: 2015-09-09
 * 
 */

var toggle = function (config) {
	config = config || {};

	//Alapértékek
	this.value = false;

	this.renderTo = function (el) {
		/*
		 * Komponensek ekészítése és hozzáadása az "el" célelemhez
		 */
		this.container = document.createElement('div');
		this.switcher = document.createElement('div');
		this.input = document.createElement('div');

		this.container.className = 'zs-toggle-container';
		this.switcher.className = (this.value) ? 'switcher on' : 'switcher off';
		this.input.className = 'input';

		this.container.appendChild(this.switcher);//
		this.container.appendChild(this.input);//Input handler
		el.appendChild(this.container);

		//Események hozzáadása
		this.setupEvents();
	};

	//Események hozzáadása
	this.setupEvents = function () {
		var me = this;//alias
		/*
		 * Mouse events
		 */
		//On-click
		$(this.input).on("click", function (e) {
			me.toggleValue();
			e.preventDefault();
		});

		/*
		 * Touch events
		 */
		//Touch-move
		$(this.input).on("touchstart", function (e) {
			me.toggleValue();
			e.preventDefault();
		});
	};

	this.toggleValue = function () {
		this.value = !this.value;
		this.switcher.className = (this.value) ? 'switcher on' : 'switcher off';
	};

};