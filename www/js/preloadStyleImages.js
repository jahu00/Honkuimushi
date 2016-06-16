/// Preloads background images from stylesheet to get rid of load lag on first use
var preloadStyleImages = {
	preloadImage: function(url)
	{
		var img = document.createElement('img');
		img.onload = function()
		{
			// kill img after it was loaded
			img = null;
		}
		img.src = url;
	},
	preload: function()
	{
		var self = this;
		$('link[rel="stylesheet"]').each(function()
		{
			for(var i = 0; i < this.sheet.cssRules.length; i++)
			{
				var rule = this.sheet.cssRules[i];
				// Find images in the style sheet
				m = rule.cssText.match(/url\(('|")?([^)]*\/)?([^:)]*\.(gif|png|jpg|jpeg))('|")?\)/ig);
				if (m != null)
				{
					var path = fileHelpers.getParentPath(this.sheet.href);
					for (var n = 0; n < m.length; m++)
					{
						// Split url into path and file name
						var split = m[n].match(/\((?:'|")?([^)]*\/)?([^:)]*\.(?:gif|png|jpg|jpeg))(?:'|")?\)/i);
						var url = split[2];
						// If path has ":" in it or if starts with "/" leave it as is
						if (split[1].indexOf(':') == -1 || (typeof split[1] !=  "undefined" && split[1].indexOf("/") == 0))
						{
							url = split[1] + url;
						}
						else // Otherwise prepend stylesheet path
						{
							url = path + split[1] + url;
						}
						self.preloadImage(url);
					}
				}
			}
		});
	}
}