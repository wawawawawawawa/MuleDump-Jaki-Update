(function($, window) {

var VERSION = '0.9.0';

// version check

function cmpver(v1, v2) {
	v1 = v1.split('.'); v2 = v2.split('.');
	for (var i = 0; i < v1.length && i < v2.length; i++) {
		var r = v1[i] - v2[i];
		if (r) return r;
	}
	return v1.length - v2.length;
}

window.tooltip = function(parent, content, modifiers) {

    //  must be a string of length
    if ( !(parent instanceof jQuery) && parent !== false) parent = $(parent);
    if ( typeof content !== 'string' || content.length === 0 ) return;
    if ( typeof modifiers !== 'object' ) modifiers = {};
    if ( typeof modifiers.classes !== 'string' ) modifiers.classes = '';

    //  prepare the tooltip
    var tooltip = $('<div class="tooltip ' + modifiers.classes + '"></div>');
    tooltip.appendTo($('body'));

    //  set html
    tooltip.html(content);

    //  get positioning data
    var domHeight = ( modifiers.heightFrom === 'tooltip' ) ? tooltip.outerHeight(true) : parent.outerHeight(true);
    var position;
    if ( parent !== false ) {
        position = parent.offset();
    } else {
        position = modifiers.position;
    }

    //  this is never good
    if ( position.left === 0 && position.top === 0 ) return;

    //  build css adjustments
    var css = {
        left: position.left,
        top: position.top-domHeight
    };

    if ( typeof modifiers.css === 'object' ) css = $.extend(true, css, modifiers.css);

    //  adjust menu position if this is going to render right of the window
    var parentOuter = ( parent !== false ) ? parent.outerWidth() : 0;
    var width = tooltip.outerWidth(true);
    if ( position.left+width >= window.innerWidth-20 ) css.left = css.left-width+parentOuter;
    if ( css.left+width >= window.innerWidth ) return;

    //  set the css
    tooltip.css(css);

    return tooltip;

};

/**
 * @function
 * @param {jQuery} $i
 * @param {string | array} [classes]
 * @param {string} [content]
 * Binds the item tooltip to all item divs
 * Thanks to Jakcodex for that!
 */
window.autotooltip = function($i, classes, content, ttl) {

    if ( typeof ttl !== 'number' ) ttl = 100;
    if ( typeof content === 'number' ) {

        ttl = content;
        content = undefined;

    }

    var contentCallback = function(self) {
        window.tooltip(self, content, {heightFrom: 'tooltip', classes: classes});
    };

    //  the default tooltip is for items
    var defaultCallback = function(self) {

        var id = +$(self).attr('data-itemId');
        var ItemData = items[id];
		
        if ( typeof ItemData !== 'object' || ItemData[0] === 'Empty Slot' ) return;

        // build tooltip data
        // three columns: [ bagTypeImage ] [ item name/feed power ] [ tier/fame bonus ]
        var html = '<div class="flex-container noFlexAutoWidth noFlexAutoAlign" style="flex-direction: column">';

        // poorman's bagType constants
        var bagPosition = '0px 0px';
        if ( ItemData[7] === 1 ) bagPosition = '-26px -0px';
        if ( ItemData[7] === 2 ) bagPosition = '-52px -0px';
        if ( ItemData[7] === 3 ) bagPosition = '-78px -0px';
        if ( ItemData[7] === 4 ) bagPosition = '-26px -26px';
        if ( ItemData[7] === 5 ) bagPosition = '-52px -26px';
        if ( ItemData[7] === 6 ) bagPosition = '-26px -52px';
        if ( ItemData[7] === 7 ) bagPosition = '-0px -26px';
        if ( ItemData[7] === 8 ) bagPosition = '-78px -26px';
        if ( ItemData[7] === 9 ) bagPosition = '-0px -52px';

        //  column one
        html += '<div class="flex-container noFlexAutoAlign" style="font-size:1.5em; flex-flow:row; font-weight:700">' 
					+ '<div class="bagType mr5" style="background-position: ' + bagPosition + '; align-self:center; flex-shrink:0">&nbsp;</div>';

        //  column two
        html += '<div class="flex-container noFlexAutoAlign noFlexAutoWidth" style="flex-direction:column; flex-shrink:0; margin-right:10px">' 
					+ '<div class="flex-container noFlexAutoAlign" style="justify-content:flex-start; align-items:flex-start; flex-direction:row">'
						+ ItemData[0] 
						+ ((ItemData[8] === true) ? '<span class="tooltip generic text">\xa0(SB)</span>' : '' ) + '</div>'
					+ ((ItemData[6]) ? '<br><div><span class="tooltip feed">Feed Power :\xa0' + ItemData[6] + '</span></div>' : '' )
				+ '</div>';

        //  column three		
		var tier = '';
        if ( ItemData[2] > -1 && ItemData[1] !== 10 ) tier += '<span class="tooltip tiered">T' + ItemData[2] + '</span>';
        if ( ItemData[9] === 1 && ItemData[1] !== 10 ) tier += '<span class="tooltip ut">UT</span>';
        if ( ItemData[9] === 2 ) tier += '<span class="tooltip st">ST</span>';
		
        html += '<div class="flex-container" style="flex-direction:column; align-items:flex-end">' 
					+ '<div>' + tier + '</div>'
					+ ( ( ItemData[5] ) ? '<div class="flex-container noFlexAutoAlign" style="align-items:flex-start; flex-direction:row"><br><span class="tooltip generic text">Fame Bonus :\xa0</span> <span class="tooltip famebonus value">' + ItemData[5] + '%</span></div>' : '' ) 
				+ '</div>';
		html += '</div></div>';
        window.tooltip(self, html, {classes: classes}); 
    };

    //  select all items
    if ( !item ) $i = $('.item');

    //  item mouseenter events
    $i.off('mouseenter.window.autotooltip').on('mouseenter.window.autotooltip', function(e) {
        var self = this;

        //  tooltip popup
        window.tstateOpen = setTimeout(((typeof content === 'string') ? contentCallback : defaultCallback), ttl, self);
    });

    //  close the tooltip, cancel the load delay, or close context menu
    $i.off('mouseleave').on('mouseleave', function(e) {
        clearTimeout(window.tstateOpen);
        $('.tooltip').remove();

    });

};

/**
 * @function
 * @param {Number} x
 * @param {string} separator
 * @param {Number} grouping
 * Change a number into proper formatting
 */
window.NumberFormat = function(x, sep, grp) {
	var sx = (''+x).split('.'), s = '', i, j;
	sep || (sep = ' '); // default seperator
	grp || grp === 0 || (grp = 3); // default grouping
	i = sx[0].length;
	while (i > grp) {
		j = i - grp;
		s = sep + sx[0].slice(j, i) + s;
		i = j;
	}
	s = sx[0].slice(0, i) + s;
	sx[0] = s;
	return sx.join('.');
};
			
function checkversion() {
	function checkupd(data) {
		if (data.meta.status != 200) return;
		var d = data.data, topver = VERSION, url;
		for (var i = 0; i < d.length; i++) {
			if (cmpver(d[i].name, topver) > 0) {
				topver = d[i].name;
				url = d[i].zipball_url;
			}
		}
		var $u = $('#update');
		if (!url) {
			$u.text('latest version').delay(1000).hide(0);
			return;
		}
		var link = $('<a>').attr('href', url).text('download ' + topver);
		$u.replaceWith(link);
	}
	$.ajax({
		dataType: 'jsonp',
		url: 'https://api.github.com/repos/wawawawawawawa/muledump/tags',
		complete: function(xhr) {
			xhr.done(checkupd);
		}
	});
}


var mules = window.mules = {}

// document load

var accounts = window.accounts
var Mule = window.Mule

$(function() {
	$.ajaxSetup({
		cache: false,
		timeout: 5000
	});

	$('body').delegate('.item', 'click', window.toggle_filter);
	$('body').delegate('.guid', 'click', function(){ this.select(); });

	$('#reloader').click(function() {
		for (var i in mules) mules[i].reload();
	});

	$('#options').prev().click(function() {
		var $o = $('#options');
		if ($o.attr('style')) $o.attr('style', ''); else $o.css('display', 'block');
	});

	$('#update').one('click', function() {
		$(this).text('loading...').css('cursor', 'default');
		checkversion();
	});

	window.init_totals();

	for (var i in accounts) {
		mules[i] = new Mule(i);
	}
	for (i in mules) mules[i].query();

	if (!window.nomasonry) {
		$('#stage').masonry({
			itemSelector : '.mule',
			columnWidth : 198,
			transitionDuration: 0
		});
	}

	relayout();
});

var mtimer;

function relayout() {
	if (mtimer) return;
	mtimer = setTimeout(function() {
		window.update_totals();
		window.update_filter();
		if (!window.nomasonry) $('#stage').masonry('layout');
		mtimer = 0;
	}, 0);
}

window.relayout = relayout


})($, window)
