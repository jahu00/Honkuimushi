function Popup(game)
{
	this.game = game;
	this.app = this.game.app;
	this.popup = this.app.container.children('.popup');
	this.grayout = $(document.body).find('.gray-out');
	this.init();
}

Popup.prototype = {
	init: function()
	{
		var self = this;
		self.popup.find('.actions .button').click(function()
		{
			var action = $(this);
			self.hide();
			if (action.hasClass("menu"))
			{
				self.app.switchScreen("menu");
			}
		});
	},
	hide: function()
	{
		this.grayout.hide();
		this.popup.hide();
	},
	show: function(type)
	{
		this.popup.removeClass("game-over level-up");
		this.popup.addClass(type);
		this.popup.find('.best-word .word').text(this.game.bestWord.word);
		this.popup.find('.best-word .points').text(this.game.bestWord.points);
		this.popup.find('.longest-word .word').text(this.game.longestWord);
		this.popup.find('.longest-word .length').text(this.game.longestWord.length);
		this.grayout.show();
		this.popup.show();
	}
}