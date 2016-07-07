function Menu(app)
{
	var self = this;
	self.app = app;
	self.screen = app.container.find('.screen.menu');
	self.screen.find('.button.new-game').click(function()
	{
		self.app.game.newGame();
		self.app.switchScreen("game");
	});
	
	self.screen.find('.button.resume-game').click(function()
	{
		self.app.switchScreen("game");
	});
}

Menu.prototype = {
	hideResumeButton: function()
	{
		this.screen.find('.button.resume-game').hide();
	},
	showResumeButton: function()
	{
		this.screen.find('.button.resume-game').show();
	}
};