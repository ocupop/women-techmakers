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
    var event_registration_urls, marker_url, _current_infobox;
    // We want to use a registration form link for each of the event titles,
    // not the 'defaultEventURL' (which links to the Google Developers event
    // listing). This array establishes which registration URL should be used
    // for each event URL.
    event_registration_urls = {
      '/events/6542341821169664/' : 'http://goo.gl/x1jmQw'
    };
    marker_url = Modernizr.svg ? "img/marker.svg" : "img/marker.png";
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
        var info, info_content, event_registration_url, marker,
          _this = this;
        marker = new google.maps.Marker({
          position: event.latlng,
          map: this.map,
          icon: marker_url
        });
        info_content = "<div class=\"event-infobox\">\n  <h3 class=\"event-title\">\n    <a href=\"" + event_registration_urls[event.defaultEventUrl] + "\" target=\"_blank\">" + event.name + "</a>\n  </h3>\n  <p class=\"event-location\">" + event.location + "</p>\n</div>";
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

  // Sticky navigation.
  APP.run(function($rootScope, $timeout) {
    var $nav, $nav_top, $header, $window, pos;
    pos = 1;
    $window = $(window);
    $nav = $('.page-nav');
    $nav_top = $('.page-nav').offset().top;
    $header = $('.page-header');
    $window.on("scroll", function() {
      pos = $window.scrollTop();
      if (pos >= $nav_top) {
        $nav.addClass('fixed');
        $header.addClass('fixed-nav-compensation');
      } else {
        $nav.removeClass('fixed');
        $header.removeClass('fixed-nav-compensation');
      }
    });
  });

  // Parallax.
  APP.run(function($rootScope, $timeout) {
    var $bg_photo, $header, $pattern_header, $pattern_right, $pattern_left, $window, draw_background, height, pos, transform;
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
