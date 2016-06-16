var App = function()
{
	var self = this;
	self.container = $('#Container');
	self.appState = "Loading";
	self.switchScreen("loading");
	self.dictionary = new rcxDict(false, null, function() {self.loadingUpdate() });
	self.wordFrequency = new WordFrequency(function() {self.loadingUpdate() });
}
App.prototype = {
	switchScreen: function(name)
	{
		this.container.children('.screen').hide();
		this.container.children('.screen.' + name).show();
	},
	loadingComplete: function()
	{
		window.rikaikun = this.dictionary;
		window.wordFrequency = this.wordFrequency;
		window.init();
		this.switchScreen("game");
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