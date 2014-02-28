// Generated by CoffeeScript 1.6.3
(function() {
  "use strict";
  var APP;

  APP = angular.module('womentechmakers', ['ocupop', 'ui.directives']);

  APP.value('header_height', function() {
    return 0;
  });

  APP.controller('NavCtrl', function($scope) {
    $scope.nav = {
      show_mobile: false
    };
    return $scope.$on('current_section', function() {
      return $scope.nav.show_mobile = false;
    });
  });

  APP.factory('EventMap', function($http) {
    var end_date, start_date, to_unix_date, url;
    to_unix_date = function(date) {
      return Math.floor(date.valueOf() / 1000);
    };
    start_date = to_unix_date(new Date());
    end_date = to_unix_date(new Date('2014-12-31'));
    url = "https://google-developers.appspot.com/events/event-markers.public?tag=wtm&start=" + start_date + "&end=" + end_date;
    if (Modernizr.cors) {
      return $http.get(url);
    } else {
      url += "&callback=JSON_CALLBACK";
      return $http.jsonp(url);
    }
  });

  APP.controller('MapCtrl', function($scope, EventMap) {
    var event_registration_urls, _current_infobox;
    event_registration_urls = {
      '/events/6298372969332736/': 'https://plus.google.com/u/0/events/c39k2o851o1kr6ukan8uoj1qqcs',
      '/events/6254656321748992/': 'https://docs.google.com/a/google.com/spreadsheet/viewform?formkey=dEQtNW1Ld3IxV3BwZ2pRUzNtaXVkcEE6MA#gid=0',
      '/events/6542341821169664/': 'https://docs.google.com/a/google.com/spreadsheet/viewform?formkey=dEQtNW1Ld3IxV3BwZ2pRUzNtaXVkcEE6MA#gid=0',
      '/events/5860515494494208/': 'https://www.eventbrite.ca/e/women-techmakers-summit-campus-london-registration-10607016873',
      '/events/6015116466192384/': 'https://www.eventbrite.com/e/gdg-women-israel-launch-international-womens-day-tickets-10713752121',
      '/events/4701918941151232/': 'https://www.eventbrite.com/e/women-techmakers-google-kirkland-registration-10590752225',
      '/events/5871630051966976/': 'https://docs.google.com/a/google.com/forms/d/1ze4bydjtj7Uh5fgCPPRLzuikQRGjXBVO7YfJMSYOYks/viewform',
      '/events/5948086790651904/': 'https://www.eventbrite.ca/e/women-techmakers-google-zurich-registration-10590944801',
      '/events/5412049102307328/': 'https://services.google.com/fb/forms/womentechmakerstok/',
      '/events/5583022757773312/': 'https://www.eventbrite.ca/e/women-techmakers-google-munich-registration-10591073185',
      '/events/5760102782992384/': 'https://www.eventbrite.ca/e/women-techmakers-google-paris-registration-10591103275',
      '/events/5771173463851008/': 'https://www.eventbrite.com/e/women-techmakers-google-singapore-registration-10591161449',
      '/events/5936218856488960/': 'https://www.eventbrite.ca/e/women-techmakers-google-cambridge-registration-10591179503',
      '/events/5720199168786432/': 'https://www.eventbrite.ca/e/women-techmakers-google-chicago-registration-10591201569',
      '/events/5842399255330816/': 'https://www.eventbrite.ca/e/women-techmakers-google-boulder-registration-10591267767',
      '/events/5578179364257792/': 'https://www.eventbrite.com/e/women-techmakers-google-waterloo-registration-10591291839',
      '/events/6199844687314944/': 'http://www.meetup.com/GDG-SP/events/165977312'
    };
    _current_infobox = null;
    $scope.event_map = {
      show: 'map',
      map_options: {
        center: new google.maps.LatLng(10, 0),
        zoom: 2,
        minZoom: 2,
        scrollWheel: false
      },
      map: {},
      events: [],
      resize: function() {
        return google.maps.event.trigger(this.map, 'resize');
      },
      mark: function(event, index) {
        var info, info_content, marker,
          _this = this;
        marker = new google.maps.Marker({
          position: event.latlng,
          map: this.map,
          icon: {
            url: "../img/marker.png",
            scaledSize: new google.maps.Size(19, 33)
          }
        });
        if (event.defaultEventUrl in event_registration_urls) {
          event.desiredUrl = event_registration_urls[event.defaultEventUrl];
        } else {
          event.desiredUrl = "https://developers.google.com" + event.defaultEventUrl;
        }
        info_content = "<div class=\"event-infobox\">\n  <h3 class=\"event-title\">\n    <a href=\"" + event.desiredUrl + "\" target=\"_blank\">" + event.name + "</a>\n  </h3>\n  <p class=\"event-location\">" + event.location + "</p>\n</div>";
        info = new InfoBox({
          content: info_content
        });
        return google.maps.event.addListener(marker, 'click', function() {
          _this.selected = index;
          $scope.$apply();
          if (_current_infobox != null) {
            _current_infobox.close();
          }
          _current_infobox = info;
          return info.open(_this.map, marker);
        });
      },
      load: function() {
        var _this = this;
        EventMap.success(function(data) {
          var e, index, _i, _len, _ref, _results;
          _this.events = data;
          _ref = _this.events;
          _results = [];
          for (index = _i = 0, _len = _ref.length; _i < _len; index = ++_i) {
            e = _ref[index];
            _results.push(_this.mark(e, index));
          }
          return _results;
        });
        return this.resize();
      },
      clear_selected: function() {
        return this.selected = null;
      },
      selected: null
    };
    return $scope.event_map.load();
  });

  APP.filter('coerceDate', function() {
    return function(source) {
      return new Date(source * 1000);
    };
  });

  APP.run(function($rootScope, $timeout) {
    var $header, $nav, $nav_top, $window, pos;
    pos = 1;
    $window = $(window);
    $nav = $('.page-nav');
    $nav_top = $('.page-nav').offset().top;
    $header = $('.page-header');
    return $window.on("scroll", function() {
      pos = $window.scrollTop();
      if (pos >= $nav_top) {
        $nav.addClass('fixed');
        return $header.addClass('fixed-nav-compensation');
      } else {
        $nav.removeClass('fixed');
        return $header.removeClass('fixed-nav-compensation');
      }
    });
  });

  APP.run(function($rootScope, $timeout) {
    var $bg_photo, $header, $pattern_header, $pattern_left, $pattern_right, $window, draw_background, height, pos, transform;
    pos = 1;
    $rootScope.scroll_pos = pos;
    $window = $(window);
    $bg_photo = $('.bg-photo');
    $header = $('.page-header .container');
    $pattern_header = $('.pattern-header');
    $pattern_right = $('.pattern-right-layer');
    $pattern_left = $('.pattern-left-layer');
    transform = Modernizr.prefixed('transform');
    height = $window.height();
    $window.on("scroll", function() {
      $rootScope.scroll_pos = pos;
      return $rootScope.$apply();
    });
    draw_background = function() {
      var scale;
      pos = $window.scrollTop();
      scale = Math.max(0, ((height * 0.5) - pos) / (height * 0.5));
      $pattern_header.css(transform, "translate3d(0, " + (pos * 0.5) + "px, 0)");
      $pattern_right.css(transform, "translate3d(0, " + (pos * -0.5) + "px, 0)");
      $pattern_left.css(transform, "translate3d(0, " + (pos * -0.5) + "px, 0)");
      $bg_photo.css(transform, "translate3d(0, " + (pos * 0.3) + "px, 0)");
      $header.css(transform, "translate3d(0, " + (pos * -0.3) + "px, 0)");
      return requestAnimationFrame(draw_background);
    };
    if (Modernizr.csstransforms3d && !Modernizr.touch) {
      return requestAnimationFrame(draw_background);
    } else {
      return $window.on("scroll", function() {
        return pos = $window.scrollTop();
      });
    }
  });

}).call(this);
