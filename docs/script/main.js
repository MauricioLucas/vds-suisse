var scrollBar, player, map, comList;


$(function () {
	decompress(data, 'cells');
	decompress(data, 'activities');
	decompress(data, 'positions');
	decompress(data, 'events');
	decompress(data, 'contacts');

	if (window.self !== window.top) {
		$("html").addClass("in-frame");
	}

	function decompress(object, field) {
		var result = [];
		Object.keys(object[field]).forEach(function (key) {
			var list = object[field][key];
			list.forEach(function (entry, index) {
				if ((entry != null) && (entry !== undefined)) {
					if (result[index] === undefined) result[index] = {};
					result[index][key] = entry;
				}
			})
		})
		object[field] = result;
	}

	initModules();

	tabBar = new TabBar();
	scrollBar = new ScrollBar();
	player = new Player();
	map = new Map();
	calendar = new Calendar();
	comList = new CommunicationList();
	social = new Social();

	tabBar.on('activate', function (id) {
		var section = $('#contentSection');
		switch (id) {
			case 'tabList':
				section.removeClass('calendarView');
				section.removeClass('socialView'  );
				comList.show();
				calendar.hide();
				social.hide();
			break;
			case 'tabCalendar':
				section.addClass(   'calendarView');
				section.removeClass('socialView'  );
				comList.hide();
				calendar.show();
				social.hide();
			break;
			case 'tabSocial':
				section.removeClass('calendarView');
				section.addClass(   'socialView'  );
				comList.hide();
				calendar.hide();
				social.show();
				player.stop();
			break;
		}
	})

	scrollBar.on('drag',      function () { player.setTimeIndex(scrollBar.getTimeIndex()); })
	scrollBar.on('dragStart', function () { player.stop(); })
	scrollBar.on('dragEnd',   function () { player.stop(); })

	player.on('change', function () { scrollBar.setTimeIndex(player.getTimeIndex()); })
	player.on('change', function () { $('#infoText').html(formatDate(player.getTimeStamp())); })
	player.on('change', function () { map.redraw(); })
	player.on('change', function () { comList.redraw(); })
	player.on('change', function () { calendar.redraw(); })

	player.on('start', function () { $('#playPauseButtons').addClass(   'paused'); })
	player.on('stop',  function () { $('#playPauseButtons').removeClass('paused'); })

	$('#playButton' ).click(function () { player.start(); })
	$('#pauseButton').click(function () { player.stop();  })
	$('#showNewsletters').click(function () {
		comList.showNewsletters($('#showNewsletters').prop('checked'));
	});

	$('#speedButton1').click(function () { $('.speedButton').removeClass('active'); $('#speedButton1').addClass('active'); player.setSpeed( 200) });
	$('#speedButton2').click(function () { $('.speedButton').removeClass('active'); $('#speedButton2').addClass('active'); player.setSpeed(1000) });
	$('#speedButton3').click(function () { $('.speedButton').removeClass('active'); $('#speedButton3').addClass('active'); player.setSpeed(5000) });

	$('#topFullscreen').click(function () {
		var element = $('html').get(0);
		var me = this;
		
		var isFullScreen = false;

		if (element.requestFullScreen)       isFullScreen = function () { return document.fullScreen;         };
		if (element.mozRequestFullScreen)    isFullScreen = function () { return document.mozFullScreen;      };
		if (element.webkitRequestFullScreen) isFullScreen = function () { return document.webkitIsFullScreen; };
		
		if (isFullScreen) {
			// function found

			if (isFullScreen()) {
				if      (document.exitFullScreen)         document.exitFullScreen();
				else if (document.mozCancelFullScreen)    document.mozCancelFullScreen();
				else if (document.webkitCancelFullScreen) document.webkitCancelFullScreen();
			} else {
				if      (element.requestFullscreen)       element.requestFullscreen();
				else if (element.mozRequestFullScreen)    element.mozRequestFullScreen();
				else if (element.webkitRequestFullscreen) element.webkitRequestFullscreen();
			}

			setTimeout(function () {
				if (isFullScreen()) {
					$('#topFullscreen').addClass('active');
				} else {
					$('#topFullscreen').removeClass('active');
				}
			}, 100);
		} else {
			// fullscreen is not possible!

			if (window.location != window.parent.location) {
				window.open('frame_'+lang.lang_code+'.html', '_blank')
			}
		}
	})

	player.start();

	if (window.location.hash.length > 1) {
		var hash = window.location.hash.substr(1);
		hash = hash.split('&');
		hash.forEach(function (value) {
			switch (window.location.hash.substr(1)) {
				case 'tab=calendar': $('#tabCalendar').click(); break;
				case 'tab=social':   $('#tabSocial'  ).click(); break;
			}
		})	
	}
})

function formatDate(value) {
	var d = new Date(value);
	d = ''+
		leadingSpace(d.getDate().toFixed()) + '.' +
		leadingSpace((d.getMonth()+1)) + '.' +
		d.getFullYear() + ' ' +
		leadingSpace(d.getHours().toFixed()) + ':' +
		leadingSpace((100+d.getMinutes()).toFixed().substr(1));
	return d;
}


function formatTime(value) {
	var d = new Date(value);
	d = ''+
		d.getHours() + ':' +
		(100+d.getMinutes()).toFixed().substr(1) + ':' +
		(100+d.getSeconds()).toFixed().substr(1);
	return d;
}

function leadingSpace(v) {
	if (v.toString().length == 1) return '0'+v;
	return v;
}
