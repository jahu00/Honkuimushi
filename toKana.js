ToKana = {
}
ToKana.longConsonants = "kgsztdbpr";
ToKana.romajiToKanaMapping = {
	a: 'あ',
	i: 'い',
	u: 'う',
	e: 'え',
	o: 'お',
	ka: 'か',
	ki: 'き',
	ku: 'く',
	ke: 'け',
	ko: 'こ',
	kya: 'きゃ',
	kyu: 'きゅ',
	kyo: 'きょ',
	ga: 'が',
	gi: 'ぎ',
	gu: 'ぐ',
	ge: 'げ',
	go: 'ご',
	gya: 'ぎゃ',
	gyu: 'ぎゅ',
	gyo: 'ぎょ',
	sa: 'さ',
	shi: 'し',
	su: 'す',
	se: 'せ',
	so: 'そ',
	za: 'ざ',
	zi: 'じ',
	zu: 'ず',
	ze: 'ぜ',
	zo: 'ぞ',
	ji: 'じ',
	sha: 'しゃ',
	shu: 'しゅ',
	sho: 'しょ',
	ja: 'じゃ',
	ju: 'じゅ',
	jo: 'じょ',
	ta: 'た',
	chi: 'ち', 
	tsu: 'つ',
	te: 'て',
	to: 'と',
	cha: 'ちゃ',
	chu: 'ちゅ',
	che: 'ちぇ',
	cho: 'ちょ',
	ti: 'てぃ',
	tu: 'とぅ',
	da: 'だ',
	di: 'ぢ',
	dzu: 'づ',
	de: 'で',
	"do": 'ど',
	dya: 'ぢゃ',
	dyu: 'ぢゅ',
	dyo: 'ぢょ',
	di: 'でぃ',
	du: 'どぅ',
	na: 'な',
	ni: 'に',
	nu: 'ぬ',
	ne: 'ね',
	no: 'の',
	nya: 'にゃ',
	nyu: 'にゅ',
	nyo: 'にょ',
	ha: 'は',
	hi: 'ひ',
	he: 'へ',
	ho: 'ほ',
	fu: 'ふ',
	hya: 'ひゃ',
	hyu: 'ひゅ',
	hyo: 'ひょ',
	fa: 'ふぁ',
	fi: 'ふぃ',
	fu: 'ふぅ',
	fe: 'ふぇ',
	fo: 'ふぉ',
	fa: 'ふぁ',
	ba: 'ば',
	bi: 'び',
	bu: 'ぶ',
	be: 'べ',
	bo: 'ぼ',
	bya: 'びゃ',
	byu: 'びゅ',
	byo: 'びょ',
	pa: 'ぱ',
	pi: 'ぴ',
	pu: 'ぷ',
	pe: 'ぺ',
	po: 'ぽ',
	pya: 'ぴゃ',
	pyu: 'ぴゅ',
	pyo: 'ぴょ',
	ma: 'ま',
	mi: 'み',
	mu: 'む',
	me: 'め',
	mo: 'も',
	mya: 'みゃ',
	myu: 'みゅ',
	myo: 'みょ',
	ya: 'や',
	yu: 'ゆ',
	yo: 'よ',
	ra: 'ら',
	ri: 'り',
	ru: 'る',
	re: 'れ',
	ro: 'ろ',
	rya: 'りゃ',
	ryu: 'りゅ',
	ryo: 'りょ',
	wa: 'わ',
	wo: 'を',
	nnya: 'んや',
	nnyu: 'んゆ',
	nnyo: 'んよ',
	n: 'ん',
};
ToKana.fromRomaji = function(text, watchdog)
{
	if (text == "")
	{
		return "";
	}
	if (typeof watchdog == "undefined")
	{
		watchdog == 100;
	}
	else
	{
		watchdog--;
	}
	if (watchdog < 0)
	{
		throw "Error: ToKana.fromRomaji watchdog trigerred!";
	}
	var result = text;
	var romaji = "";
	for (var key in this.romajiToKanaMapping)
	{
		if (this.romajiToKanaMapping.hasOwnProperty(key))
		{
			if(text.startsWith(key))
			{
				romaji = key;
				result = this.romajiToKanaMapping[key];
				break;
			}
			if (this.longConsonants.indexOf(key[0]) > -1 && text.startsWith(key[0] + key))
			{
				romaji = key[0] + key;
				result = "っ" + this.romajiToKanaMapping[key];
				break;
			} else if (key == "cha" && text.startsWith(key + key))
			{
				romaji = key + key;
				result = "っ" + this.romajiToKanaMapping[key];
			}
			
		}
	}
	if (romaji == "")
	{
		romaji = text[0];
		result = romaji;
	}
	if (text.length > result.length)
	{
		result += this.fromRomaji(text.substring(romaji.length), watchdog);
	}
	return result;
}

