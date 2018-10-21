(function($, window) {
var options = window.options
var accounts = window.accounts
var items = window.items
var classes = window.classes
var skins = window.skins
var textures = window.textures

// max width of an account box in columns
var ROW = window.rowlength || 10
var vaultwidth = 23

// colors
var lightgreen = "#90ff90";
var darkgreen = "#00ff00";
var lightred = "#ff9090";
var darkred = "#ff0000";
var gold = "#fcdf00";
// dom snippet generators

function stat(where, type, text) {
	return $('<strong class="stat">').addClass(type).text(text).appendTo(where);
}

function item(id) {
	id = +id
	var ids = '0x' + id.toString(16)
	var $r = $('<div class="item">').data('id', id).append($('<div>').text('0').hide())
	var it = items[id]
	
	if (!it) {
		it = items[id] = ['item ' + ids, 0, -1, 0, 0, 0, 0, 0, false, 0]
	}
	if (id != -1 && it[1] === 0) {
		$r.append($('<span>').text(ids))
	}
	$r.attr('data-itemId', id);
	window.autotooltip($r, 'autoHeight');
	return $r.css('background-position', '-' + it[3] + 'px -' + it[4] + 'px');
	
}
window.item = item


function item_listing(arr, classname) {
	var $r = $('<div class="itemsc">');
	for (var i = 0; i < arr.length; i++) {
		item(arr[i]).appendTo($r);
	}
	if (classname) $r.addClass(classname);
	return $r;
}

function maketable(classname, items, row) {
	row = row || ROW;
	var $t = $('<table>').addClass(classname);
	var $row;
	for (var i = 0; i < items.length; i++) {
		if (i % row === 0) {
			if ($row) $t.append($row);
			$row = $('<tr>');
		}
		$('<td class="cont">').append(items[i]).appendTo($row);
	}
	if ($row) $t.append($row);
	var cols = items.length >= row ? row : items.length;
	cols = cols || 1;
	$t.css('width', '' + (184 * cols + 14 * (cols - 1)) + 'px');
	return $t;
}

var NUMCLASSES = 0;
for (var i in classes) NUMCLASSES++;

var STARFAME = [20, 150, 400, 800, 2000];
var STARCOLOR = ['#8a98de', '#314ddb', '#c1272d', '#f7931e', '#ffff00', '#ffffff'];
function addstar($t, d) {
	var r = 0;
	if (!d.Account.Stats || !d.Account.Stats.ClassStats) return;
	var s = d.Account.Stats.ClassStats;
	if (!s.length) s = [s];
	for (var i = 0; i < s.length; i++) {
		var b = +s[i].BestFame || 0;
		for (var j = 0; b >= STARFAME[j] && j < 5; j++);
		r += j;
	}
	if (r < 1) return;
	var $s = $('<span>').addClass('scont');
	$('<span>').text(r).appendTo($s);
	var $st = $('<span>').text('\u2605').addClass('star');
	$st.css('color', STARCOLOR[Math.floor(r / NUMCLASSES)] || 'lime');
	$st.appendTo($s);
	$s.appendTo($t);
}

function addreloader(mule, target) {
	var rld = $('<div class="button">')
	rld.text('\u21bb')
	if (mule.data) {
		var updated = new Date(mule.data.query.created)
		window.autotooltip(rld, 'nomargin autoHeight', '<div style="font-size:1.2em">Last Updated: ' + updated.toLocaleString() + '</div>');
	}
	rld.click(function(){ mule.reload() })
	rld.appendTo(target)
}

function mulelink(guid) {
	function toHex(s) {
		var r = '', t = '';
		for (var i = 0; i < s.length; i++) {
			t = s.charCodeAt(i).toString(16);
			if (t.length == 1) t = '0' + t;
			r += t;
		}
		return r;
	}
	var l = $('<a>').addClass('button');
	l.text('\u21d7');
	l.attr('href', 'muledump:' + toHex(guid) + '-' + toHex(accounts[guid]));
	window.autotooltip(l, 'nomargin autoHeight', '<div style="font-size:1.2em">Open This Account</div>');
	return l;
}

var VAULTORDER = [  107,  95, 83, 69, 57, 45, 33, 19,  0, 26, 21, 17, 22, 27,  0, 23, 35, 48, 59, 73, 85,  97, 110,
					105,  93, 81, 67, 55, 43, 29, 16,  0, 14, 12, 11, 13, 15,  0, 18, 32, 44, 56, 68, 82,  94, 106,
					108,  96, 84, 70, 58, 46, 34, 20,  0,  9,  6,  4,  7, 10,  0, 24, 36, 47, 60, 74, 86,  98, 109,
					111,  99, 87, 75, 63, 49, 37, 25,  0,  5,  2,  1,  3,  8,  0, 28, 38, 50, 64, 76, 88, 100, 112,
					113, 101, 89, 77, 65, 53, 41, 30,  0,  0,  0,  0,  0,  0,  0, 31, 42, 54, 66, 78, 90, 102, 114,
					115, 103, 91, 79, 71, 61, 51, 39,  0, 117, 119, 118, 120, 0,  0, 40, 52, 62, 72, 80, 92, 104, 116,
				];
				
function arrangevaults(v) {
	var r = [], i, j;
	for (i = 0; i < VAULTORDER.length; i++) {
		if (i % vaultwidth === 0 && r.length) {
			for (j = 0; j < r.length; j++) if (r[j]) break;
			if (j >= r.length) r = [];
		}
		var c = v[VAULTORDER[i] - 1];
		if (typeof c != 'undefined') r.push(c); else r.push(0);
	}
	var w = vaultwidth;
	for (i = (vaultwidth-1); i >= 0; i--) {
		for (j = i; j < r.length; j+=w) if (r[j]) break;
		if (j < r.length) continue;
		w--;
		for (j = i; j < r.length; j+=w) r.splice(j, 1);
	}
	if (ROW < w) return [0, v];
	return [w, r];
	
	//  populate simple view vaultorder
	// for ( var i = 1; i <= 120; i++ ) vaultorders[3].vaultorder.push(i);
}


// Mule object

var Mule = function(guid) {
	if (!guid || !(guid in accounts)) return;
	this.guid = guid;
	this.fails = 0;
	this.dom = $('<div class="mule">');
	this.dom.appendTo($('#stage')).hide();
}

Mule.prototype.opt = function(name) {
	var o = options[this.guid];
	if (o && name in o) {
		return o[name];
	}
	return options[name];
}

Mule.prototype.cache_id = function() {
	return 'muledump:' + (!!window.testing ? 'testing:' : '') + this.guid
}

Mule.prototype.log = function(s, cl) {
	if (!this.overlay) {
		this.overlay = $('<div class="overlay">')
		var c = $('<div class="button">').text('X').appendTo(this.overlay)
		c.click(function() {
			$(this).parent().hide()
		})
		this.overlay.append($('<div class="log">'))
		this.overlay.appendTo(this.dom)
	}
	this.overlay.show()
	var log = this.overlay.find('.log')
	cl = cl || 'info'
	$('<div class="line">').text(s).addClass(cl).appendTo(log)
}

Mule.prototype.error = function(s) {
	this.log(s, 'error')
	var err = $('<div>')
	err.text(this.guid + ': ' + s)
	err.appendTo($('#errors'))
	addreloader(this, err)
	err.find('.button').click(function() { $(this).parent().remove() })
}

Mule.prototype.query = function(ignore_cache) {
	var self = this;
	if (this.busy) return; // somewhat protects against parallel reloads
	this.busy = true;
	this.loaded = false;
	$('#accopts').hide().data('guid', '');

	// read from cache if possible
	if (!ignore_cache) {
		var c = '';
		try {
			c = localStorage[this.cache_id()];
			c = JSON.parse(c);
		} catch(e) {}
		if (c) {
			this.parse(c);
			this.busy = false;
			return;
		}
	}

	var CR = { guid: this.guid }
	var pass = accounts[this.guid] || ''

	var platform = this.guid.split(':')[0]
	if (['kongregate', 'steamworks', 'kabam'].indexOf(platform) >= 0) {
		CR.secret = pass
	} else {
		CR.password = pass
	}

	this.log('loading data')
	window.realmAPI('char/list', CR, function(xhr) {
		xhr.done(onResponse).fail(onFail)
	})

	function onFail() {
		self.log('failed')
		self.busy = false;
		self.fails++;
		if (self.fails < 5) {
			self.query(true);
		} else {
			self.error('failed too many times, giving up');
		}
	}

	function onResponse(data) {
		self.busy = false;
		if (!data.query || !data.query.results) {
			self.error(data.query ? 'server error' : 'YQL service denied');
			if (data.query) {
				self.log('full response:' + JSON.stringify(data.query))
			}
			return;
		}
		var res = data.query.results

		function watchProgress(percent) {
			if (typeof percent != 'string') {
				self.error('migration failed')
				return
			}
			if (percent == '100') {
				self.reload()
				return
			}
			self.log('migration: ' + percent + '%')
			window.realmAPI('migrate/progress', CR, function(xhr) {
				xhr.fail(onFail).done(function(data) {
					var res = data && data.query && data.query.results
					var per = res.Progress && res.Progress.Percent
					watchProgress(per)
				})
			})
		}

		if (res.Migrate) {
			self.log('attempting migration')

			window.realmAPI('migrate/doMigration', CR, { iframe: true }, function() {
				watchProgress('0')
			})
			return
		}

		if (!res.Chars) {
			self.error(res.Error || 'bad reply: ' + JSON.stringify(res))
			return;
		}

		res = res.Chars

		if ('TOSPopup' in res) {
			window.realmAPI('account/acceptTOS', CR, { iframe: true })
		}

		if (res.Account && res.Account.IsAgeVerified != 1) {
			CR.isAgeVerified = 1
			window.realmAPI('account/verifyage', CR, { iframe: true })
		}

		self.parse(data)
	}
}

Mule.prototype.reload = function() {
	this.fails = 0
	if (this.overlay) this.overlay.find('.log').empty()
	this.query(true)
}


var PROPTAGS = 'ObjectType Level Exp CurrentFame'.split(' ')
var STATTAGS = 'MaxHitPoints MaxMagicPoints Attack Defense Speed Dexterity HpRegen MpRegen'.split(' ')
var STATABBR = 'HP MP ATT DEF SPD DEX VIT WIS'.split(' ')
Mule.prototype.parse = function(data) {
	if (this.overlay) this.overlay.hide()

	var d = data.query.results.Chars
	d = {
		Char: d.Char,
		Account: d.Account || {}
	}
	data.query.results.Chars = d
	// check if data changed?
	// if (this.data && compare(d, this.data.query.results.Chars)) {
		// return
	// }

	this.data = data
	this.dom.hide().empty()
	this.overlay = null

	// write cache
	try {
		localStorage[this.cache_id()] = JSON.stringify(data);
	} catch(e) {}


	if (this.opt('guid')) {
		$('<input type="text" readonly="readonly">')
		.addClass('guid').val(this.guid).appendTo(this.dom);
		$('<br>').appendTo(this.dom);
	}

	addreloader(this, this.dom)

	if (!('VerifiedEmail' in d.Account)) {
		var $warn = $('<span class="button warn">').text('!!')
		$warn.attr('title', 'email not verified').appendTo(this.dom)
	}

	if (window.mulelogin) this.dom.append(mulelink(this.guid, accounts[this.guid]));

	d.Account = d.Account || {}
	var $name = $('<div>').addClass('name').text(d.Account.Name + ' ' + d.Char.length + ' Chars' || '(No Name) ' + d.Char.length + ' Chars');
	addstar(this.dom, d);
	var self = this;
	$name.click(function(e) {
		if (e.target != this) return;
		if (e.ctrlKey) {
			self.disabled = !self.disabled;
			self.dom.toggleClass('disabled', self.disabled);
			window.update_totals();
			return;
		}
		var $ao = $('#accopts');
		$ao.css({
			left: e.pageX - 5 + 'px',
			top: e.pageY - 5 + 'px'
		});
		window.updaccopts(self.guid);
		$ao.css('display', 'block');
	});
	$name.appendTo(this.dom);

	this.items = { chars: [], vaults: [] };

	var carr = [];
	if (d.Char) { // stupid array/object detection
		if (!d.Char.length) carr = [d.Char]; else carr = d.Char;
	}
	var f = false;
	var arr = [];
	var ClassList = { Rogue: {Num: 0, X: '-249px', Y: '0px'}, Archer: {Num: 0, X: '-166px', Y: '0px'}, Wizard: {Num: 0, X: '0px', Y: '0px'}, Priest: {Num: 0, X: '-83px', Y: '0px'}, Warrior: {Num: 0, X: '-332px', Y: '0px'}, Knight: {Num: 0, X: '-249px', Y: '-83px'}, Paladin: {Num: 0, X: '-249px', Y: '-166px'}, Assassin: {Num: 0, X: '-83px', Y: '-83px'}, Necromancer: {Num: 0, X: '0px', Y: '-83px'}, Huntress: {Num: 0, X: '-166px', Y: '-83px'}, Mystic: {Num: 0, X: '-83px', Y: '-166px'}, Trickster: {Num: 0, X: '-166px', Y: '-166px'}, Sorcerer: {Num: 0, X: '0px', Y: '-166px'}, Ninja: {Num: 0, X: '-332px', Y: '-83px'}, Samurai: {Num: 0, X: '-332px', Y: '-166px'} };
	var CharNumData = [];
	carr.sort(function(a,b) {return a.id - b.id});
	for (var i = 0; i < carr.length; i++) {
		var c = carr[i], $c = $('<div class="char">');
		// if (!c) continue;
		var cl = classes[c.ObjectType];
		ClassList[cl[0]]['Num'] += 1;
		
		// if (!cl) continue;
		if (this.opt('chdesc')) {
			f = true;
			if ( $c instanceof jQuery ) {
				var XPBoost = window.items[3178];
				var LTBoost = window.items[3176];
				var LDBoost = window.items[3177];
				//  look for ld/lt/xp boost
				var boost = $('<img class="flex-container noFlexAutoWidth boost hidden">');
				var boosts = [c.XpBoosted, c.XpTimer, c.LDTimer, c.LTTimer];
				var boostHtml = '';
				for ( var x = 0; x < boosts.length; x++ ) {
					if ( boosts[x] !== "0" ) {
						boost.removeClass('hidden');
					window.autotooltip(boost, 'mb5 pr5 autoHeight', 
					' \ <div class="flex-container noFlexAutoWidth" style="color: #fff; flex-flow: column"> \ ' 
							+ (( c.XpBoosted !== "0" ) ?
							'<div class="flex-container" style="justify-content: flex-start">\
								<div class="item noselect mr5" style="background-position: -' + XPBoost[3] + 'px -' + XPBoost[4] + 'px; border: solid 1px #000">&nbsp;</div>\
								<div style="font-weight:700; font-size:2em; align-self:center">' + ("&nbsp;XP Boost : " + Math.floor(Number(c.XpTimer)/60) + " minutes" || 'Default') + '</div>\
							</div>' : '' ) 
							+ ' \ ' + (( c.LDTimer !== "0" ) ?
							'<div class="flex-container" style="justify-content: flex-start">\
								<div class="item noselect mr5" style="background-position: -' + LDBoost[3] + 'px -' + LDBoost[4] + 'px; border: solid 1px #000">&nbsp;</div>\
								<div style="font-weight:700; font-size:1.5em; align-self:center">' + ("&nbsp;Loot Drop : " + Math.floor(Number(c.LDTimer)/60) + " minutes" || 'Default') + '</div>\
							</div>' : '' ) 
							+ ' \ ' + (( c.LTTimer !== "0" ) ?
							'<div class="flex-container" style="justify-content: flex-start">\
								<div class="item noselect mr5" style="background-position: -' + LTBoost[3] + 'px -' + LTBoost[4] + 'px; border: solid 1px #000">&nbsp;</div>\
								<div style="font-weight:700; font-size:1.5em; align-self:center">' + ("&nbsp;Loot Tier : " + Math.floor(Number(c.LTTimer)/60) + " minutes" || 'Default') + '</div>\
							</div>' : '' ) 
					+ ' \ </div>\ ');
					}
				}
			}
			var FullID = d.Account.Name + ' ' + c.id; // for console purposes
			var portimg = $('<img class="portrait">');
			var CharText = $('<div>');
			CharText.append($('<div style="font-weight:700; font-size:1.1em; align-self:center"">').text(cl[0] + ' lvl ' + c.Level), $('<div style="font-weight:700; font-size:1.1em; align-self:center">').text(NumberFormat(c.CurrentFame, ',') + ' Fame '));
			
			window.portrait(portimg, c.ObjectType, c.Texture, c.Tex1, c.Tex2);
			var chtext = $('<div class="flex-container noFlexAutoJustify">');
			var petboost = $('<div class="flex-container noFlexAutoWidth" style="flex-flow:column">');
			if ( typeof boost !== 'undefined' ) petboost.append(boost);
			if (c.Pet) {
				var PetName = c.Pet.name.replace(/{pets./g,'').replace(/_Skin}/g,'').replace(/_/g,' ').replace(/APOS/g,"'");
				var petimg = $('<img class="flex-container noFlexAutoWidth pet" style="flex-flow:column" src="lib/pets/' + PetName + '.png"></img>');
				petboost.append(petimg);
				var PetRarity = (c.Pet.rarity == 0 ? 30 : (c.Pet.rarity == 1 ? 50 : (c.Pet.rarity == 2 ? 70 : (c.Pet.rarity == 3 ? 90 : (c.Pet.rarity == 4 ? 100 : '')))));
			}
			else {
				var petimg = $('<img class="flex-container noFlexAutoWidth pet hidden" style="flex-flow:column"></img>');
			}
			chtext.append(petboost);
			
			function PetAbility (PetVar, PetType) {
				if (c.Pet) {
					var Abtype = c.Pet.Abilities.Ability[PetVar][PetType];
					if (PetType == 'type') { 
						return PetValues[Abtype];
					}
					else {
						return Abtype;
					}
				}
			};
			var CurrXP = NumberFormat(c.Exp, ',', 3);
			var CurrF = NumberFormat(c.CurrentFame, ',', 3);
			
			window.autotooltip(CharText, 'mr5 autoHeight', 
			'<div class="flex-container noFlexAutoWidth noFlexAutoAlign" style="color:#fff; flex-flow:column">' 
				+ '<div class="flex-container noFlexAutoAlign" style="justify-content:flex-start">' 
					+ '<div class="petItem" style="background-position: -' + window.items[24102][3] + 'px -' + window.items[24102][4] + 'px; border:solid 1px #000; margin-right:8px; align-self:center"></div>' 
					+ '<div class="flex-container noFlexAutoWidth pr5" style="flex-flow:column; flex-shrink:0; margin-right:8px">' 
						+ '<div style="font-weight:700; font-size:1.15em; align-self:flex-start">' 
							+ cl[0] + ' :</div>' 
						+ '<div style="font-weight:700; font-size:1.15em; align-self:flex-start">Character ID : ' 
							+ '</div>' 
						+ '<div style="font-weight:700; font-size:1.15em; align-self:flex-start">Active Time : '
							+ '</div>' 
					+ '</div>' 
					+ '<div class="flex-container noFlexAutoAlign" style="flex-direction:column">' 
						+ '<div style="font-weight:700; font-size:1.15em; align-self:flex-end">Level ' + c.Level + '</div>' 
						+ '<div style="font-weight:700; font-size:1.15em; align-self:flex-end"># ' + NumberFormat(c.id, ',') + '</div>' 
						+ '<div style="font-weight:700; font-size:1.15em; align-self:flex-end">' + (ATime.length != 0 ? ATime.join(' ') : '< 1min') + '</div>' 
					+ '</div>'
				+ '</div>' 
				+ '<div class="flex-container noFlexAutoAlign" style="justify-content:flex-start; margin-top:5px">'
					+ '<div class="petItem" style="background-position: -' + window.items[3139][3] + 'px -' + window.items[3139][4] + 'px; border:solid 1px #000; margin-right:8px; align-self:center"></div>' 
					+ '<div class="flex-container noFlexAutoWidth pr5" style="flex-flow:column; flex-shrink:0; margin-right:8px">' 
						+ '<div style="font-weight:700; font-size:1.15em; align-self:flex-start">Total XP : </div>' 
						+ '<div style="font-weight:700; font-size:1.15em; align-self:flex-start">Base Fame : </div>' 
						+ '<div style="font-weight:700; font-size:1.15em; align-self:flex-start">Total Fame : </div>' 
					+ '</div>' 
					+ '<div class="flex-container noFlexAutoAlign" style="flex-direction:column">' 
						+ '<div style="font-weight:700; font-size:1.15em; align-self:flex-end">' 
							+ CurrXP + '</div>' 
						+ '<div style="font-weight:700; font-size:1.15em; align-self:flex-end">' 
							+ CurrF + '</div>' 
						+ '<div style="font-weight:700; font-size:1.15em; align-self:flex-end">' 
							+ CurrTF + '</div>' 
					+ '</div>'
				+ '</div>' 
			+ '</div>');
			chtext.append(CharText);
			
			window.autotooltip(petimg, 'mr5 autoHeight',
			'<div class="flex-container noFlexAutoWidth noFlexAutoAlign" style="color:#fff; flex-flow:column">' 
				+ '<div class="flex-container noFlexAutoAlign mr5">' 
					+ '<div class="flex-container noFlexAutoWidth" style="border:solid 1px #000; margin-right:8px; align-self:center; background-color: #545454">' 
					+ '<img src="lib/pets/' + PetName + '.png"></img></div>'
					+ '<div class="flex-container noFlexAutoWidth mr5" style="flex-flow:column; flex-shrink:0; margin-right:8px">'
						+ '<div style="font-weight:700; font-size:1.15em; align-self:flex-start; color:' + darkgreen + '"> Pet Name </div>'
						+ '<div style="font-weight:700; font-size:1.15em; align-self:flex-start; color:' + (PetRarity == PetAbility(0, 'power') ? gold : lightgreen) + '">' 
							+ PetAbility(0, 'type') + '</div>'
						+ ((PetAbility(1, 'points') > 0) ? 
						'<div style="font-weight:700; font-size:1.15em; align-self:flex-start; color:' + (PetRarity == PetAbility(1, 'power') ? gold : lightgreen) + '">'  
							+ PetAbility(1, 'type') + '</div>' : '')
						+ ((PetAbility(2, 'points') > 0) ? 
						'<div style="font-weight:700; font-size:1.15em; align-self:flex-start; color:' + (PetRarity == PetAbility(2, 'power') ? gold : lightgreen) + '">' 
							+ PetAbility(2, 'type') + '</div>' : '')
					+ '</div>'
					+ '<div class="flex-container noFlexAutoAlign" style="flex-direction:column">'
						+ '<div style="font-weight:700; font-size:1.15em; align-self:flex-end; color:' + darkgreen + '">' 
							+ (c.Pet ? PetName : '') + '</div>'
						+ '<div style="font-weight:700; font-size:1.15em; align-self:flex-end; color:' + (PetRarity == PetAbility(0, 'power') ? gold : lightgreen) + '">'  
							+ PetAbility(0, 'power') + ' / ' + PetRarity + '</div>'
						+ ((PetAbility(1, 'points') > 0) ?
						'<div style="font-weight:700; font-size:1.15em; align-self:flex-end; color:' + (PetRarity == PetAbility(1, 'power') ? gold : lightgreen) + '">'  
							+ PetAbility(1, 'power') + ' / ' +  PetRarity + '</div>' : '')
						+ ((PetAbility(2, 'points') > 0) ?
						'<div style="font-weight:700; font-size:1.15em; align-self:flex-end; color:' + (PetRarity == PetAbility(2, 'power') ? gold : lightgreen) + '">'  
							+ PetAbility(2, 'power') + ' / ' +  PetRarity + '</div>' : '')
					+ '</div>'
				+ '</div>'
			+ '</div>');
			var chdesc = $('<div class="flex-container noFlexAutoWidth noFlexAutoAlign noFlexAutoJustify chdesc">');
			chdesc.append(portimg);
			chdesc.append(chtext);
			
			if ( typeof $c === 'undefined' ) return chdesc;
			
			//  add it to the dom
			chdesc.appendTo($c);
		}
		
		if (this.opt('stats')) {
			f = true;
			var $stats = $('<table class="stats">');

			for (var t = 0; t < STATTAGS.length; t++) {
				var $row
				if (t % 2 === 0) $row = $('<tr>');
				$('<td class="sname">').text(STATABBR[t]).appendTo($row);
				var $s = $('<td>');
				var s = +c[STATTAGS[t]] || 0;
				var stt = this.opt('sttype');
				var avgd = s - Math.floor(cl[1][t] + (cl[2][t] - cl[1][t]) * (+c.Level - 1) / 19);
				if (stt == 'base') {
					stat($s, 'base', s).toggleClass('maxed', s == cl[3][t]);
				} else if (stt == 'avg') {
					stat($s, 'avg', (avgd > 0 ? '+' : '') + avgd)
						.addClass(avgd > 0 ? 'good' : (avgd < 0 ? 'bad' : ''))
						.toggleClass('very', Math.abs(avgd) > 14);
				} else if (stt == 'max') {
					var l2m = cl[3][t] - s;
					if (t < 2) l2m = l2m + ' (' + Math.ceil(l2m / 5) + ')';
					stat($s, 'max', l2m)
						.toggleClass('maxed', cl[3][t] <= s);
				} else if (stt == 'comb') {
					if (s < cl[3][t]) {
						var StatData = [];
						var l2m = cl[3][t] - s;
						if (t < 2) l2m = Math.ceil(l2m / 5);
						if (t < 2) 
							stat($s, 'small', s + '/' + cl[3][t])
							.addClass(avgd > 0 ? 'good' : (avgd < 0 ? 'bad' : ''))
							.toggleClass('very', Math.abs(avgd) > 14);
						else stat($s, 'small', s + '/' + cl[3][t] + ' (' + l2m + ')')
							.addClass(avgd > 0 ? 'good' : (avgd < 0 ? 'bad' : ''))
							.toggleClass('very', Math.abs(avgd) > 14);
						
						StatData.push('<div class="' + (avgd > 0 ? 'good' : (avgd < 0 ? 'bad' : 'avg')) + ((Math.abs(avgd) > 14) ? ' very' : '') + '" style="font-size:1.3em; font-weight:700">' + (avgd > 0 ? '+' : '') + avgd + ' From Average</div><div style="font-size:1.3em; font-weight:700">' + l2m + ' Left To Max</div>');
						window.autotooltip($s, 'nomargin autoHeight', StatData.join(' '));
					} else {
						stat($s, 'maxed', s)
					}
				}
				$s.appendTo($row);
				if (t % 2) $row.appendTo($stats);
			}
			$c.append($stats);
		}

		// items
		var eq = (c.Equipment || '').split(',');
		this.items.chars.push(eq);
		var dobp = this.opt('backpack') && + c.HasBackpack
		if (this.opt('equipment') || this.opt('inv') || dobp) {
			f = true;
			var itc = $('<div>').addClass('items');
			if (this.opt('equipment')) itc.append(item_listing(eq.slice(0, 4), 'equipment'));
			if (this.opt('inv')) itc.append(item_listing(eq.slice(4, 12), 'inv'));
			if (dobp) itc.append(item_listing(eq.slice(12,20), 'backpack'));
			itc.appendTo($c);
		}
		if (this.opt('hpmp')) {
			$c.append('<div class="flex-container noFlexAutoAlign noFlexAutoJustify mb5" style="margin-left:2px"><div class="hp">' + c.HealthStackCount + '</div><div class="mp" style="margin-left:6px">' + c.MagicStackCount + '</div></div>');
		}
		/////////////////////////
		// WAWAWA PART
		if (this.opt('summary')) {
			// Useful Functions
			function round(value, decimals) {
				return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
			}
			
			function apply_bonus(value) {
				for (var k in bonuses) { 
				var b = bonuses[k](st, c, d, value); 
				if (!b) continue; 
				var incr = 0; 
				if (typeof b == 'object') {
					incr += b.add; 
					b = b.mul; } 
				incr += Math.floor(value * b); 
				value += incr;
				}
				return value;
			}
			
			function statOut(stat, value, tooltip, color){
				var StatText = $('<div class="flex-container noFlexAutoJustify WawaType">');
				StatText.append($('<div style="color:' + color + '; font-weight:bold">').text(stat + ' = ' + value)); // '\xa0' = non breakable char with .text()
				if (tooltip) {
					window.autotooltip(StatText, 'statContainer autoHeight', tooltip);
				}
				StatText.appendTo($c);
            }
			
			// Fame Display
			var st = readstats(c.PCStats); 
			var iTotalFame = +c.CurrentFame;
			var fame = +c.CurrentFame;
			var Bestfame = +d.Account.Stats.BestCharFame;
			var fbonus = [];
			var fbonus2 = [];
			var fbonus3 = [];
			fbonus.push('<div style="display:flex; flex-direction: column">');
			fbonus2.push('<div style="display:flex; flex-direction: column">');
			fbonus3.push('<div class="flex-container noFlexAutoWidth" style="flex-direction: column"><div class="flex-container" style="align-items:flex-start">');
			fbonus.push('<div class="statItem" style="font-weight:700; font-size:1.5em; align-self:center">Base Fame : <span style="color:' + darkgreen + '">' + NumberFormat(iTotalFame, ',') + ' Fame</span></div>');
			for (var k in bonuses) {
				var b = bonuses[k](st, c, d, iTotalFame); 
				if (!b) continue; 
				var incr = 0; 
				if (typeof b == 'object') {
					incr += b.add; 
					b = b.mul; } 
				incr += Math.floor(iTotalFame * b); 
				iTotalFame += incr; 
				fbonus.push('<div class="statItem" style="font-weight:700; align-self:flex-end; font-size:1.2em">' + k + ' : <span style="color:' + lightgreen + '">+' + NumberFormat(incr, ',') + ' Fame</span></div>');
			}
			var FameBoost = round((iTotalFame / fame) * 100, 2);
			fbonus.push('<div class="statItem" style="font-weight:700; font-size:1.5em; align-self:center"><span style="text-decoration:underline">Total Fame :</span><span style="color:' + gold + '"> ' + NumberFormat(iTotalFame, ',') + ' Fame</span></div><div class="statItem" style="font-weight:700; font-size:1.3em; align-self:center">Fame Boost :<span style="color:' + gold + '"> ' + NumberFormat(FameBoost, ',') + ' %</span></div>' + ((iTotalFame >= d.Account.Stats.BestCharFame) ? '<div class="statItem" style="font-weight:700; font-size:1.3em; align-self:center">Highest Fame Achieved :<span style="color:' + gold + '"> ' + NumberFormat(Bestfame, ',') + ' Fame</span></div>' : ''));
			
			var lower = 0;
			var upper = d.Account.Stats.BestCharFame;
			if (upper - lower == 1) {
				upper = +c.CurrentFame + 1;
			}
			while (upper - lower > 1) {
				var middle = lower + Math.floor((upper - lower) / 2);
				var current = apply_bonus(middle);
				if (current >= d.Account.Stats.BestCharFame) {
					upper = middle;
				} else {
					lower = middle;
				}
			}
			if (iTotalFame < d.Account.Stats.BestCharFame) {
				var upperleft = upper - c.CurrentFame;
				fbonus2.push('<div class="statItem" style="font-weight:700; font-size:1.3em">Highest Fame Achieved :<span style="color:' + gold + '"> ' + NumberFormat(Bestfame, ',') + ' Fame</span></div><div class="statItem" style="font-weight:700; font-size:1.3em; align-self:center; text-decoration:underline">With current boosts :</div><div class="statItem" style="font-weight:700; align-self:center; font-size:1.3em">Gain First Born at ' + NumberFormat(lower, ',') + ' Base Fame</div><div class="statItem" style="font-weight:700; align-self:center; font-size:1.3em">(' + NumberFormat(upperleft, ',') + ' Base Fame Left)</div>');
			}
			fbonus.push('</div>');
			fbonus2.push('</div>');
			fbonus3.push(fbonus.join(' ') + fbonus2.join(' ') + '</div></div>');
			
			// Total Fame
			var fameColor = darkred;
			if(iTotalFame > 400){ fameColor = darkgreen; }
			if(iTotalFame > 2000){ fameColor = gold; }
			statOut('Total Fame', NumberFormat(iTotalFame, ',') + ' Fame ', fbonus3.join(''), fameColor);
			// Time Active
			var v = st[20];
			var ATime = [];
			var FPM = [];
			var BaseFPM = round(fame / v, 2);
			var TotalFPM = round(iTotalFame / v, 2);
			
			FPM.push('<div class="statItem" style="font-weight:700; font-size:1.3em; align-self:center"><span style="color:' + lightgreen + '">' + NumberFormat(BaseFPM, ',') + '</span> Base Fame/Minute</div><div class="statItem" style="font-weight:700; font-size:1.3em; align-self:center"><span style="color:' + darkgreen + '">' + NumberFormat(TotalFPM, ',') + '</span> Total Fame/Minute</div>');
			
			var divs = { 'y': 525600, 'm': 43200, 'd': 1440, 'h': 60, 'min': 1 };
			for (var s in divs) {
				if (ATime.length > 4) break;
				var t = Math.floor(v / divs[s]);
				if (t) ATime.push(t + s);
				v %= divs[s];
			}
			var timeColor = darkred;
			if(st[20] > 10){ timeColor = lightgreen; }
			if(st[20] > 30){ timeColor = darkgreen; }
			if(st[20] > 60){ timeColor = gold; }
			if (ATime.length == 0) {
				statOut('Active Time', ' < 1 min', '', timeColor)
			} else {
				statOut('Active Time', ATime.join(' '), FPM.join(''), timeColor)
			}
			// Tiles Uncovered
			var TilesDone = NumberFormat(st[3], ',');
			var TPM = round(st[3] / st[20], 0);
			var TilesData = [];
			var TilesLeft = 4e6 - st[3] + 1;
			
			TilesData.push('<div class="statItem" style="font-weight:700; font-size:1.3em; align-self:center"><span style="color:' + gold + '">' + NumberFormat(TPM, ',') + '</span> Tiles/Minute</div>');
			var TilesLeftExpl = TilesLeft - 3e6;
			var vCart = round((4e6 - st[3] + 1) / round(st[3] / st[20], 0), 0), TilesTime = [];
			var vExpl = round((1e6 - st[3] + 1) / round(st[3] / st[20], 0), 0), TilesTimeExpl = [];
			for (var sCart in divs) {
				if (TilesTime.length > 4) break;
				var tCart = Math.floor(vCart / divs[sCart]);
				var tExpl = Math.floor(vExpl / divs[sCart]);
				if (tCart) TilesTime.push(tCart + sCart);
					vCart %= divs[sCart];
				if (tExpl) TilesTimeExpl.push(tExpl + sCart);
					vExpl %= divs[sCart];
			}
			if (TilesLeft > 3e6) {
				TilesData.push('<div class="statItem" style="font-weight:700; font-size:1.3em; align-self:center">Explorer : <span style="color:' + lightgreen + '">' + NumberFormat(TilesLeftExpl, ',') + '</span> Tiles Left</div><div class="statItem" style="font-weight:700; font-size:1.3em; align-self:center">Average Time Left : <span style="color:' + lightgreen + '">' +  TilesTimeExpl.join(' ') + '</span> Left</div>');
			}
			if (TilesLeft > 0) {
				TilesData.push('<div class="statItem" style="font-weight:700; font-size:1.3em; align-self:center">Cartographer : <span style="color:' + darkgreen + '">' + NumberFormat(TilesLeft, ',') + '</span> Tiles Left</div><div class="statItem" style="font-weight:700; font-size:1.3em; align-self:center">Average Time Left : <span style="color:' + darkgreen + '">' + TilesTime.join(' ') + '</span> Left</div>');
			}
			var tilesColor = darkred;
			if(st[3] > 0){ tilesColor = lightgreen; }
			if(st[3] > 1e6){ tilesColor = darkgreen; }
			if(st[3] > 4e6){ tilesColor = gold; }
			statOut('Tiles', TilesDone, TilesData.join(' '), tilesColor)
			//Tunnel Rat
			var QuestList = [];
			var QuestListNumber = [];
			var QuestMiss = [];
			var QuestMissNumber = [];
			var TratQuest = [];
			var TratQuestNumber = [];
			var TratQuest2 = [];
			var TratQuest2Number = [];
			var TratQuest3 = [];
			TratQuest.push('<div class="flex-container noFlexAutoWidth" style="flex-flow:column;">')
			TratQuestNumber.push('<div class="flex-container noFlexAutoWidth" style="flex-flow:column;">')
			TratQuest2.push('<div class="flex-container noFlexAutoWidth" style="flex-flow:column;">')
			TratQuest2Number.push('<div class="flex-container noFlexAutoWidth" style="flex-flow:column;">')
			TratQuest3.push('<div style="display:flex; flex-direction: row"><div class="flex-container noFlexAutoWidth" style="flex-direction: column"><div class="flex-container" style="align-items:flex-start">')
			QuestList.push('<div class="flex-container noFlexAutoWidth" style="flex-flow:column;">')
			QuestListNumber.push('<div class="flex-container noFlexAutoWidth" style="flex-flow:column;">')
			QuestMiss.push('<div class="flex-container noFlexAutoWidth" style="flex-flow:column;">')
			QuestMissNumber.push('<div class="flex-container noFlexAutoWidth" style="flex-flow:column;">')
			for (m in shortdungeonnames) {
				if (m > 12) {
					if (st[m] != 0) {
						QuestList.push('<div class="statItem" style="font-size:1.15em; align-self:flex-start">' + shortdungeonnames[m] + ' : </div>');
						QuestListNumber.push('<div class="statItem" style="font-size:1.15em; align-self:flex-end">' + NumberFormat(st[m], ',') + '</div>');
					}
					else {
						QuestMiss.push('<div class="statItem" style="font-size:1.15em; align-self:flex-start">' + shortdungeonnames[m] + ' : </div>');
						QuestMissNumber.push('<div class="statItem" style="font-size:1.15em; align-self:flex-end">' + NumberFormat(st[m], ',') + '</div>');
					}
				}
				if (m < 25)
				{
					if (st[m] == 0) {
						TratQuest.push('<div class="statItem" style="font-size:1.3em; align-self:flex-start; font-weight:700; color:' + darkred + '">' + shortdungeonnames[m] + ' : </div>');
						TratQuestNumber.push('<div class="statItem" style="font-size:1.3em; align-self:flex-end; font-weight:700; color:' + darkred + '">' + NumberFormat(st[m], ',') + '</div>');
					}
				}
				else {
					if (st[m] == 0) {
						TratQuest2.push('<div class="statItem" style="font-size:1.15em; align-self:flex-start">' + shortdungeonnames[m] + ' : </div>');
						TratQuest2Number.push('<div class="statItem" style="font-size:1.15em; align-self:flex-end">' + NumberFormat(st[m], ',') + '</div>');
					}
				}
			}
			QuestList.push('</div>');
			QuestListNumber.push('</div>');
			QuestMiss.push('</div>');
			QuestMissNumber.push('</div>');
			TratQuest.push('</div>');
			TratQuestNumber.push('</div>');
			TratQuest2.push('</div>');
			TratQuest2Number.push('</div>');
			TratQuest3.push(TratQuest.join(' ') + TratQuestNumber.join(' ') + TratQuest2.join(' ') + TratQuest2Number.join(' ') + '</div></div></div>');
			
			if (TratQuest.length === 2) {
				if (QuestMiss.length === 2) {
					statOut('Tunnel Rat', "Complete", '', gold)
				}
				else {
					statOut('Tunnel Rat', "Done", '<div style="display:flex; flex-direction: row"><div class="flex-container noFlexAutoWidth noFlexAutoAlign" style="flex-direction: column"><div class="flex-container noFlexAutoAlign" style="justify-content:flex-start">' + QuestMiss.join(' ') + QuestMissNumber.join(' ') + '</div></div></div>', gold)
				}
			}
			else {
				var tunnelColor = darkred;
				var tunnelText = "Not Started";
				if(TratQuest.length < 12){ tunnelColor = lightgreen; tunnelText = "In Progress" }
				if(TratQuest.length < 7){ tunnelColor = darkgreen; tunnelText = "In Progress" }
				statOut('Tunnel Rat', tunnelText, TratQuest3.join(' '), tunnelColor)
			}
			//Oryx Kills
			var OKill = st[11];
			if (OKill < 1) {
				statOut('Oryx Kills', NumberFormat(OKill, ','), '', darkred)
			}
			else {
				statOut('Oryx Kills', NumberFormat(OKill, ','), '', gold)
			}
			//Accuracy
			var ShotData = [];
			var iAcc = round(100 * st[1] / st[0], 2);
			var l2Acc = (0.75 * st[0] - st[1]) / 0.25;
			if (Math.ceil(l2Acc) === l2Acc) l2Acc += 1;
			var l2Acc2 = (0.5 * st[0] - st[1]) / 0.5;
			if (Math.ceil(l2Acc2) === l2Acc2) l2Acc2 += 1;
			var l2Acc3 = (0.25 * st[0] - st[1]) / 0.75;
			if (Math.ceil(l2Acc3) === l2Acc3) l2Acc3 += 1;
			var accColor = darkred;
			var AccurateText = [darkred, 'Hits Left'];
			var SharpshooterText = [darkred, 'Hits Left'];
			var SniperText = [darkred, 'Hits Left'];
			if(iAcc > 25){ 
				accColor = lightgreen;
				AccurateText = [gold, 'Extra Shots Left'];
			}
			if(iAcc > 50){ 
				accColor = darkgreen;
				SharpshooterText = [gold, 'Extra Shots Left'];
			}
			if(iAcc > 75){ 
				accColor = gold;
				SniperText = [gold, 'Extra Shots Left'];
			}
			
			ShotData.push('<div class="statItem" style="font-weight:700; font-size:1.3em; align-self:center">Total Shots : <span style="color:' + gold + '">' + NumberFormat(st[0], ',') + '</span></div>' 
			+ '<div class="statItem" style="font-weight:700; font-size:1.3em; align-self:center">Total Hits : <span style="color:' + gold + '">' + NumberFormat(st[1], ',') + '</span></div>' 
			+ '<div class="statItem" style="font-weight:700; font-size:1.3em; align-self:center">Ability Used : <span style="color:' + gold + '">' + NumberFormat(st[2], ',') + '</span></div>'
			+ '<div class="statItem" style="font-weight:700; font-size:1.2em; align-self:flex-end">Accurate : <span style="color:' + AccurateText[0] + '">' + NumberFormat(Math.abs(Math.ceil(l2Acc3)), ',') + '</span> ' + AccurateText[1] + '</div>' 
			+  '<div class="statItem" style="font-weight:700; font-size:1.2em; align-self:flex-end">Sharpshooter : <span style="color:' + SharpshooterText[0] + '">' + NumberFormat(Math.abs(Math.ceil(l2Acc2)), ',') + '</span> ' + SharpshooterText[1] + '</div>'  
			+ '<div class="statItem" style="font-weight:700; font-size:1.2em; align-self:flex-end">Sniper : <span style="color:' + SniperText[0] + '">' + NumberFormat(Math.abs(Math.ceil(l2Acc)), ',') + '</span> ' + SniperText[1] + '</div>');
			
			statOut('Accuracy', iAcc + ' %', ShotData.join(' '), accColor)
			//Gods Killed
			var GodKillRatio = round(100 * st[8] / (st[6] + st[8]), 2);
			var GodData =[];
			var GodKillLeft = st[6] - st[8] + 1;
			var tenpercent = st[6] / 9 - st[8];
			var godsColor = darkred;
			var EGText = [darkred, 'God Kills Left'];
			var SGText = [darkred, 'God Kills Left'];
			if(GodKillRatio > 0){ godsColor = lightgreen; }
			if(GodKillRatio > 10){ 
				godsColor = darkgreen; 
				EGText = [gold, 'Extra Monster Kills Left']; 
			}
			if(GodKillRatio > 50){ 
				godsColor = gold; 
				SGText = [gold, 'Extra Monster Kills Left']; 
			}
			GodData.push('<div class="statItem" style="font-weight:700; font-size:1.3em; align-self:center">Monster Kills : <span style="color:' + gold + '">' + NumberFormat(st[6], ',') + '</span></div>' 
			+ '<div class="statItem" style="font-weight:700; font-size:1.3em; align-self:center">God Kills : <span style="color:' + gold + '">' + NumberFormat(st[8], ',') + '</span></div>' 
			+ '<div class="statItem" style="font-weight:700; font-size:1.2em; align-self:flex-end">Ennemy of the Gods : <span style="color:' + EGText[0] + '">' + NumberFormat(Math.abs(Math.ceil(tenpercent)), ',') + '</span> ' + EGText[1] + '</div>' 
			+ '<div class="statItem" style="font-weight:700; font-size:1.2em; align-self:flex-end">Slayer of the Gods : <span style="color:' + SGText[0] + '">' + NumberFormat(Math.abs(GodKillLeft), ',') + '</span> ' + SGText[1] + '</div>');
		   
			statOut('God Kill Ratio', GodKillRatio + ' %', GodData.join(' '), godsColor)
			// Party Level Ups
			var LvlUp = st[19];
			var LvlUpLeft = 1000 - st[19] + 1;
			var LvlUpData = [];
			if (LvlUpLeft > 0) {
				LvlUpData.push('<div class="statItem" style="font-weight:700; font-size:1.3em; align-self:flex-end">Leader of Men : <span style="color:' + gold + '">' + NumberFormat(LvlUpLeft, ',')  + '</span> Level Up Left</div>');
				if (LvlUpLeft > 900) {
					LvlUpData.push('<div class="statItem" style="font-weight:700; font-size:1.3em; align-self:flex-end">Team Player : <span style="color:' + gold + '">' + NumberFormat((LvlUpLeft - 900), ',')  + '</span> Level Up Left</div>');
				}
			}
			if (LvlUpLeft <= 0) LvlUpLeft = '';
			var lvlColor = darkred;
			if(LvlUp > 0){ lvlColor = lightgreen; }
			if(LvlUp > 100){ lvlColor = darkgreen; }
			if(LvlUp > 1000){ lvlColor = gold; }
			statOut('Level Up', NumberFormat(LvlUp, ','), LvlUpData.join(' '), lvlColor)
			// Quests Complete
			var QuestDone = st[12];
			if (QuestDone < 1001) {
				QuestDone = NumberFormat(QuestDone, ',') + ' / 1000';
			}
			else {
				QuestDone = NumberFormat(QuestDone, ',');
			}
			var questsColor = darkred;
			if(st[12] > 1){ questsColor = lightgreen; }
			if(st[12] > 500){ questsColor = darkgreen; }
			if(st[12] > 1000){ questsColor = gold; }
			if (QuestList.length > 2) {
				statOut('Quests Completed', QuestDone, '<div style="display:flex; flex-direction: row"><div class="flex-container noFlexAutoWidth noFlexAutoAlign" style="flex-direction: column"><div class="flex-container noFlexAutoAlign" style="justify-content:flex-start">' + QuestList.join(' ') + QuestListNumber.join(' ') + '</div></div></div>', questsColor)
			}
			else {
				statOut('Quests Completed', QuestDone, '', questsColor)
			}
        }
		// WAWAWA PART END
		/////////////////////////
		if (this.opt('pcstats') || this.opt('goals')) {
			f = true;
			$c.append(window.printstats(c, d, this.opt('goals'), this.opt('pcstats')));
		}
		arr.push($c);
	}
	// Number of each class tooltip
	CharNumData.push('<div class="flex-container noFlexAutoAlign noFlexAutoJustify noFlexAutoWidth" style="flex-flow:row">');
	for (var i in ClassList) {
		CharNumData.push(( ClassList[i]['Num'] > 0 ) ? '<div class="flex-container" style="flex-flow:column"><div class="ClassType" style="background-position: ' + ClassList[i]['X'] + ' ' + ClassList[i]['Y'] + '"></div><div class="mr5 mt5" style="font-size:1.3em; font-weight:700">' + ClassList[i]['Num'] + '</div></div>' : '' )
	}
	CharNumData.push('</div>');
	window.autotooltip($name, 'autoHeight', CharNumData.join(' '));
	
	if (f) {
		this.dom.append($('<hr class="chars">'));
		maketable('chars', arr).appendTo(this.dom);
	}
	arr = [];

	function makechest(items, classname) {
		var il = item_listing(items.slice(0, 8), classname)
		return $('<div class="items">').append(il)
	}

	if (this.opt('vaults')) {
		this.dom.append($('<hr class="vaults">'));
		// gift chest
		var gifts = d.Account.Gifts;
		if(gifts && this.opt('gifts')) {
			var items = gifts.split(',').reverse();
			this.items.vaults.push(items);  // for totals
			var garr = []
			while (items.length) {
				while (items.length < 8) items.push(-1)
				garr.push(makechest(items, 'gifts'))
				items = items.slice(8);
			}
			maketable('giftchest', garr).appendTo(this.dom)
		}

		// vault
		var chests = d.Account.Vault ? d.Account.Vault.Chest || ['-1'] : ['-1'];
		if (typeof chests == 'string') chests = [chests];
		var w = arrangevaults(chests);
		chests = w[1];
		for (i = 0; i < chests.length; i++) {
			if (chests[i] === 0) {
				arr.push(null);
				continue;
			}
			var chest = (chests[i] || '-1').split(',');
			while (chest.length < 8) chest.push(-1);
			this.items.vaults.push(chest);
			arr.push(makechest(chest, 'vaults'));
		}
		maketable('vaults', arr, w[0]).appendTo(this.dom);
	}
	this.loaded = true;
	this.dom.css('display', 'inline-block')
	window.relayout();
}

window.Mule = Mule


})($, window)
