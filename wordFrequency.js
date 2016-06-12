var WordFrequency = function(onready)
{
	var self = this;
	self.ready = false;
	self.onready = onready;
	$.get('frequency.txt', function(data)
	{
		self.wordList = data;
		self.ready = true;
		if (typeof self.onready != "undefined")
		{
			self.onready();
		}
	}, 'html');
};

WordFrequency.prototype = {
	findFrequency: function(word)
	{
		if (!this.ready)
		{
			throw "WordFrequency.findFrequency(): wordList is not ready!";
		}
		var result = this.wordList.indexOf("\n" + word + "\n");
		if (result == -1)
		{
			return Number.MAX_VALUE;
		}
		return result;			
	}
};