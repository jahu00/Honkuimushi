function Game(app)
{
	this.app = app;
	this.screen = this.app.container.find('.screen.game');
	this.board = this.screen.find('.board');
	this.sidebar = this.screen.find('.sidebar');
	this.dictionary = this.sidebar.find('.dictionary');
	this.letters = letters;
	this.constants = constants;
	this.popup = new Popup(this);
	
	this.initValues();
	this.initTemplates();
	this.initBoard();
}

Game.prototype = {
	initValues: function()
	{
		this.word = [];
		this.dictionaryEntries = null;
		this.score = 0;
		this.points = 0;
		this.level = 1;
		this.nextLevel = 3000;
		this.lastLevel = 0;
		this.flameChance = 0;
		this.isValidWord = false;
		this.bestWord = { points: 0, word: ""};
		this.longestWord = "";
		this.wordCounter = {};
	},
	initBoard: function()
	{
		var self = this;
		self.createColumns();
		self.board.on('click', '.tile', function()
		{
			self.tileHandler(this);
		});
		$('.sidebar').on('click', '.submit', function()
		{
			self.confirm();
		});
		$('.sidebar').on('click', '.shuffle', function()
		{
			self.shuffle();
		});
		$('.sidebar').on('click', '.menu', function()
		{
			self.app.switchScreen("menu");
		});
	},
	initTemplates: function()
	{
		this.tileTemplate = this.app.templates.find('.tile');
		this.oddColumnTemplate = this.app.templates.find('.column.odd');
		this.evenColumnTemplate = this.app.templates.find('.column.even');
		this.arrowTemplate = this.app.templates.find('.arrow');
	},
	createColumns: function()
	{
		var spacerType = 1;
		for(var n = 1; n < (constants.width + 1); n++)
		{
			var newColumn = null;
			if(n % 2 == 1)
			{
				newColumn = this.oddColumnTemplate.clone();
			}
			else
			{
				newColumn = this.evenColumnTemplate.clone();
				spacerType = (n / 2) + 1;
			}
			newColumn.find('.spacer').addClass('type-' + spacerType);
			newColumn.attr('data-column', n - 1);
			this.board.append(newColumn);
		}
	},
	createTile: function(letter)
	{
		var newTile = this.tileTemplate.clone();
		newTile.attr('data-letter', letter.letter);
		newTile.attr('data-points', letter.points);
		newTile.attr('data-bonus', 0);
		newTile.attr('data-hp', 1);
		newTile.find('.letter').html(letter.letter);
		newTile.find('.point-indicator').addClass('type-' + parseInt(letter.points / 3));
		return newTile;
	},
	lastLetter: function()
	{
		return this.word[this.word.length - 1];
	},
	randomLetter: function()
	{
		var rand = Math.random();
		var base = 0;
		var letter = null;
		for (var i = 0; i < this.letters.length; i++)
		{
			letter = this.letters[i];
			base += letter.probability;
			if (rand < base)
			{
				break;
			}
		}
		return letter;
	},
	wordToKana: function(word)
	{
		var value = "";
		for(var i = 0; i < this.word.length; i++)
		{
			var letter = $(this.word[i]);
			value += letter.attr('data-letter');
		}
		return ToKana.fromRomaji(value);
	},
	checkGameOverCondition: function()
	{
		var result = false;
		var self = this;
		self.board.find('.tile.flame').each(function()
		{
			var tile = $(this);
			var row = parseInt(tile.attr('data-row'));
			var column = parseInt(tile.attr('data-column'));
			// Check if flame tile is touching the bottom of the board
			if (row == (self.constants.height - 1 + column % 2))
			{
				result = true;
			}
		});
		return result;
	},
	computeFlameChance: function(word)
	{
		var result = (19 + this.level) / Math.pow(10, this.word.length - 1);
		if (result > 1)
		{
			result = 1;
		}
		if (result < 0)
		{
			result = 0;
		}
		return result;
	},
	computeLevelProgress: function()
	{
		return (100 * (this.score - this.lastLevel) / (this.nextLevel - this.lastLevel));
	},
	computePoints: function(letters, level)
	{
		var points = 0;
		var bonus = 0;
		for(var i = 0; i < letters.length; i++)
		{
			var letter = $(letters[i]);
			points += parseInt(letter.attr('data-points'));
			bonus += parseInt(letter.attr('data-bonus'));
		}
		points += level;
		return points * 10 * (letters.length + bonus);
	},
	isLevelUp: function()
	{
		return this.score > this.nextLevel;
	},
	tileHandler: function(elem)
	{
		var self = this;
		var tile = $(elem);
		var lastLetter = $(self.lastLetter());
		// If user clicks ona selected tile
		if (tile.hasClass('selected'))
		{
			// Check if it's the last tile
			if (elem == lastLetter[0])
			{
				// If the word is valid, submit it it
				if (self.isValidWord)
				{
					self.confirm();
				}
				else
				{
					// Otherwise deselect last tile
					self.deselect(self.word.splice(self.word.length - 1, 1));
				}
			}
			else
			{
				// If it isn't the last tile, deselect all tiles up to the clicked one
				var index = $.inArray(elem, self.word) + 1;
				self.deselect(self.word.splice(index, self.word.length - index));
			}
			
			// If the the word has any length after all this (ie. wasn't submitted), remove arrow from the last tile
			if (self.word.length > 0)
			{
				self.removeArrow(self.lastLetter());
			}
		}
		else
		{
			// If there are tiles selected already, check if the clicked one is adjacent to the last selected one
			if(self.word.length > 0)
			{
				var lastColumn = parseInt(lastLetter.attr('data-column'));
				var lastRow = parseInt(lastLetter.attr('data-row'));
				var currentColumn = parseInt(tile.attr('data-column'));
				var currentRow = parseInt(tile.attr('data-row'));
				if
				(
					Math.abs(currentColumn - lastColumn) > 1
					||
					(
						Math.abs(currentColumn - lastColumn) == 1
						&&
						(
							currentColumn % 2 == 0
							&& 
							(
								currentRow > lastRow
								|| currentRow - lastRow < -1
							)
							||
							currentColumn % 2 == 1
							&& 
							(
								currentRow < lastRow
								|| currentRow - lastRow > 1
							)
						)
					)
					||
					(
						currentColumn == lastColumn
						&& Math.abs(currentRow - lastRow) != 1
					)
				)
				{
					// If it isn't adjacent deselect the whole word
					self.deselect(self.clearWord());
				}
				else
				{
					// If it is adjacent determine which arrow to use
					var arrowClass = ""
					//lastLetter = $(lastLetter());
					var lastLetterOffset = lastLetter.offset();
					var tileOffset = tile.offset();
					if (tileOffset.top > lastLetterOffset.top)
					{
						arrowClass = "down";
					}
					else
					{
						arrowClass = "up";
					}
					if (tileOffset.left > lastLetterOffset.left)
					{
						arrowClass += "-right"
					}
					else if (tileOffset.left < lastLetterOffset.left)
					{
						arrowClass += "-left"
					}
					var newArrow = self.arrowTemplate.clone();
					newArrow.addClass(arrowClass);
					// And the the arrow to the last selected letter
					lastLetter.append(newArrow);
				}
			}
			// Whatever happened select the clicked tile
			self.word.push(elem);
			tile.addClass('selected');
		}
		this.updateWord();
	},
	newGame: function()
	{
		this.initValues();
		this.clearBoard();
		this.updateColumns();
		this.updateWord();
		this.updateScore();
		this.clearDictionary();
		this.app.menu.showResumeButton();
	},
	confirm: function()
	{
		if (!this.isValidWord)
		{
			return;
		}
		var word = this.word;
		var wordLength = word.length;
		var kana = this.wordToKana(word);
		this.fillDictionary(this.dictionaryEntries, kana);
		this.score += this.points;
		if (this.longestWord.length < kana.length)
		{
			this.longestWord = kana;
		}
		if (this.bestWord.points < this.points)
		{
			this.bestWord.word = kana;
			this.bestWord.points = this.points;
		}
		if (this.isLevelUp())
		{
			this.levelUp();
		}
		this.wordCounter[wordLength] = this.wordCounter[wordLength] || 0;
		this.wordCounter[wordLength]++;
		
		this.updateScore();
		this.flameChance = this.computeFlameChance(word);
		this.removeWordFromBoard(word);
		this.clearWord(word);
		this.updateColumns();
		this.updateWord();
		
		if (wordLength >= 8 || wordLength > 3 && this.wordCounter[wordLength] % (8 - wordLength) == 0)
		{
			this.insertBonusTile("green");
		}
	},
	insertBonusTile: function(tileType)
	{
		var availableTiles = this.board.find('.tile:not(.flame):not(.green)');
		if (availableTiles.length > 0)
		{
			var tileId = Math.floor(Math.random() * availableTiles.length);
			var tile = $(availableTiles[tileId]);
			tile.addClass(tileType);
			if (tileType == "green")
			{
				tile.attr("data-hp", 2);
				tile.attr("data-bonus", 2);
			}
		}
	},
	shuffle: function()
	{
		var self = this;
		self.flameChance = 0;
		var shuffleFlameChance = (19 + self.level) / Math.pow(10, 2);
		self.deselect(self.clearWord());
		self.updateWord();
		self.board.find('.tile:not(.flame):not(.burning)').each(function()
		{
			var oldTile = $(this);
			var letter = self.randomLetter();
			var newTile = self.createTile(letter);
			newTile.attr("data-row", oldTile.attr("data-row"));
			newTile.attr("data-column", oldTile.attr("data-column"));
			if (newTile.attr("data-row") == 0 && Math.random() < shuffleFlameChance)
			{
				newTile.addClass("flame");
			}
			oldTile.replaceWith(newTile);
		});
		self.updateColumns();
	},
	updateColumns: function()
	{
		var self = this;
		// It's game over only when the flame tile is touching the border at the start of updating columns
		// If it moves to the bottom as part of the update, the player still has one more turn,
		// hence we check it here, but process it at the very end.
		var gameOver = this.checkGameOverCondition();
		
		self.board.find('.column').each(function()
		{
			var column = $(this);
			
			// Remove burning tiles or remove burning status if the flame was put out
			column.find('.tile.burning').each(function()
			{
				var tile = $(this);
				var previousTile = tile.prev();
				if (previousTile.length > 0 && previousTile.hasClass("flame"))
				{
					var tileHp = parseInt(tile.attr("data-hp"));
					tileHp--;
					tile.attr("data-hp", tileHp);
					if (tileHp <= 0)
					{
						tile.remove();
					}
				}
				else
				{
					tile.removeClass("burning");
				}
			});
			
			var columnId = column.attr('data-column');
			var tileCount = column.find('.tile').length;
			
			// Make sure the column has enough tiles, if not add some more
			var targetCount = constants.height;
			if (column.hasClass('even'))
			{
				targetCount++;
			}
			for(var i = 0; i < targetCount - tileCount; i++)
			{
				var letter = self.randomLetter();
				var newTile = self.createTile(letter);
				if (Math.random() < self.flameChance)
				{
					newTile.addClass("flame");
				}
				column.prepend(newTile);
			}
			
			// Reindex tiles in the column and also set tiles located below flames as burning
			tileCount = 0;
			column.find('.tile').each(function()
			{
				var tile = $(this);
				tile.attr('data-row', tileCount);
				tile.attr('data-column', columnId);
				if (tile.hasClass("flame"))
				{	var nextTile = tile.next();
					if (!nextTile.hasClass("flame"))
					{
						nextTile.addClass('burning');
					}
				}
				tileCount++;
			});
		});
		
		if (gameOver)
		{
			self.processGameOver();
		}
	},
	checkDictionary: function(letters, romaji, kana)
	{
		this.isValidWord = false;
		this.dictionaryEntries = null;
		this.updatePoints("");
		this.sidebar.find('.submit').removeClass("highlight");
		// Check if the letters are free from romaji
		if (letters.length >= constants.minLength && !(/[a-z]/i).test(kana))
		{
			// Do a word lookup
			var search = this.app.dictionary.wordSearch(kana, false, 15);
			if (search != null && search.data.length > 0)
			{
				// Process valid word
				this.isValidWord = true;
				this.dictionaryEntries = search.data;
				$(this.lastLetter()).addClass('valid');
				this.sidebar.find('.submit').addClass("highlight");
				this.points = this.computePoints(letters, this.level);
				this.updatePoints(this.points);
			}
		}
	},
	fillDictionary: function(entries, kana)
	{
		this.dictionary.scrollTop(0);
		this.dictionary.html("");
		this.dictionary.append('<div class="item heading">' + kana + '</div>');
		var groupedEntries = [];
		var groupedEntriesIndex = {};
		// Group dictionary entries by kana and description
		for (var i = 0; i < entries.length; i++)
		{
			var entry = entries[i];
			var split = entry[0].split("/");
			var kanjiKana = split.shift();
			var kanji = kanjiKana.replace(/^(.*?)[\s ].*$/, "$1").trim();
			var entryKana = kanjiKana.replace(/^.*\[(.*)\].*$/, "$1").trim();
			var frequency = this.app.wordFrequency.findFrequency(kanji);
			var definition = split.join("; ").trim();
			var groupedEntry = null;
			var key = entryKana + " " + definition;
			if (typeof groupedEntriesIndex[key] == "undefined")
			{
				groupedEntry = {
					kana: entryKana,
					definition: definition,
					frequency: frequency,
					inflection: entry[1],
					entries: []
				};
				
				groupedEntriesIndex[key] = groupedEntry;
				groupedEntries.push(groupedEntry);
			}
			else
			{
				groupedEntry = groupedEntriesIndex[key];
			}
			var detailedEntry = {
				kanji: kanji,
				frequency: frequency
			};
			groupedEntry.entries.push(detailedEntry);
			if (frequency < groupedEntry.frequency)
			{
				groupedEntry.frequency = frequency;
			}
		}
		// Sord entries by frequency
		groupedEntries.sort(function(a,b){ return a.frequency - b.frequency; });
		// TODO: Sorting should also take into account if entry is inflected; Inflected words should appear efter non-inflected
		
		// Prepare and insert entries into dictionary
		for (var n = 0; n < groupedEntries.length; n++)
		{
			var groupedEntry = groupedEntries[n];
			groupedEntry.entries.sort(function(a,b){ return a.frequency - b.frequency; });
			var kanji = "";
			var firstKanji = true;
			for(var j = 0; j < groupedEntry.entries.length; j++)
			{
				var detailedEntry = groupedEntry.entries[j];
				if (firstKanji)
				{
					firstKanji = false;
				}
				else
				{
					kanji += ", ";
				}
				
				kanji += detailedEntry.kanji;
			}
			this.dictionary.append
			(
				'<div class="item">'
				+ '<div class="kanji">'
				+ kanji
				+ (kanji.indexOf(groupedEntry.kana) == -1 ? " [" + groupedEntry.kana + "]" : "")
				+ '</div>'
				+ (groupedEntry.inflection != null ? '<div class="inflection">' + groupedEntry.inflection + '</div>' : "")
				+ '<div class="translation">' + groupedEntry.definition + '</div>'
				+ '</div>'
			);
		}
	},
	levelUp: function()
	{
		this.level++;
		this.lastLevel = this.nextLevel;
		this.nextLevel = this.nextLevel + 3000 + (this.level - 1) * 1000;
		this.sidebar.find('.progress .bar').css('right', '0');
		this.sidebar.find('.progress .bar').css('right', '100%');
	},
	updateScore: function()//points)
	{
		this.sidebar.find('.score').html(this.score.toLocaleString('en-US'));
		this.sidebar.find('.level-indicator .level').html(this.level);
		this.sidebar.find('.progress .bar').css('right', (100 - this.computeLevelProgress()) + '%');
	},
	updateWord: function()
	{
		var value = "";
		var kana = "";
		kana = this.wordToKana(this.word);
		if (kana.length == 0)
		{
			this.sidebar.find('.level-indicator').show();
		}
		else
		{
			this.sidebar.find('.level-indicator').hide();
		}
		this.sidebar.find('.word-container .word').html(kana);
		this.checkDictionary(this.word, value, kana);
	},
	updatePoints: function(points)
	{
		this.sidebar.find('.word-container .points').text(points);
	},
	burnAllTiles: function()
	{
		this.board.find('.tile').addClass("burnt");
	},
	removeArrow: function(letter)
	{
		$(letter).find('.arrow').remove();
	},
	deselect: function(word)
	{
		for(var i = 0; i < word.length; i++)
		{
			var letter = word[i];
			$(letter).removeClass('selected');
			$(letter).removeClass('valid');
			this.removeArrow(letter);
		}
	},
		clearWord: function(word)
	{
		return this.word.splice(0, this.word.length);
	},
	removeWordFromBoard: function(word)
	{
		for(var i = 0; i < word.length; i++)
		{
			$(word[i]).remove();
		}
	},
	clearBoard: function()
	{
		this.board.find('.tile').remove();
	},
	clearDictionary: function()
	{
		this.dictionary.html("");
	},
	processGameOver: function()
	{
		this.burnAllTiles();
		this.popup.show("game-over");
		this.app.menu.hideResumeButton();
	}
}