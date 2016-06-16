var fileHelpers = {
	getParentPath: function(path)
	{
		return path.replace(/^(file:\/\/)(.*\/)(.+)$/i, '$1$2');
	}
};