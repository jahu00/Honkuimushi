var App = function()
{
	FastClick.attach(document.body);
	preloadStyleImages.preload();
	
	var self = this;
	self.container = $('#Container');
	self.templates = $('#Templates')
	self.menu = new Menu(self);
	self.game = new Game(self);
	
	$(window).resize(function()
	{
		self.screenResize(true);
	}).resize();
	
	self.appState = "Loading";
	self.switchScreen("loading");
	self.dictionary = new rcxDict(false, null, function() {self.loadingUpdate() });
	self.wordFrequency = new WordFrequency(function() {self.loadingUpdate() });
}
App.prototype = {
	screenResize: function()
	{
		var _constants = constants;
		var windowWidth = $(window).width();
		var windowHeight = $(window).height();
		var scale = windowWidth / _constants.baseWidth;
		var projectedHeight = _constants.baseHeight * scale;
		var projectedWidth = windowWidth;
		var verticalOffset = parseInt((windowHeight - projectedHeight) / 2);
		$(document.body).removeClass("vertical");
		if (projectedHeight > windowHeight)
		{
			//Adjust to window height
			var scale = windowHeight / _constants.baseHeight;
			projectedHeight = windowHeight;
			projectedWidth = scale * _constants.baseWidth;
			verticalOffset = 0;
		}
		else
		{
			$(document.body).addClass("vertical");
		}
		
		// Adjust to window width
		this.container.css("margin-top", verticalOffset + "px");
		this.container.css("width", parseInt(projectedWidth) + "px");
		this.container.css("height", parseInt(projectedHeight) + "px");
		this.container.css("font-size", scale.toFixed(2) + "em")
	},
	switchScreen: function(name)
	{
		this.container.children('.screen').hide();
		this.container.children('.screen.' + name).show();
	},
	loadingComplete: function()
	{
		/*window.rikaikun = this.dictionary;
		window.wordFrequency = this.wordFrequency;
		window.init();*/
		//this.switchScreen("game");
		this.switchScreen("menu");
	},
	loadingUpdate: function()
	{
		var screen = this.container.children('.screen.loading');
		var total = this.dictionary.totalRequests + 1;
		var position = this.dictionary.requestsCompleted + this.wordFrequency.ready;
		screen.find('.progress .bar').css("width", (100 * position / total) + "%");
		if (position == total)
		{
			this.loadingComplete();
		}
	}
};