function Menu(app)
{
	var self = this;
	self.app = app;
	self.screen = app.container.find('.screen.menu');
	self.screen.find('.button.new-game').click(function()
	{
		window.newGame();
		self.app.switchScreen("game");
		self.screen.find('.button.resume-game').show();
	});
	
	self.screen.find('.button.resume-game').click(function()
	{
		self.app.switchScreen("game");
	});
}

Menu.prototype = {
	
};