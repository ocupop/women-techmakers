"use strict"

APP = angular.module('womentechmakers', ['ocupop', 'ui.directives']);


APP.value 'header_height', ()-> 0


APP.controller 'NavCtrl', ($scope)->

  $scope.nav = {
    show_mobile: false
  }

  $scope.$on 'current_section', ()-> $scope.nav.show_mobile = false


APP.factory 'EventMap', ($http)->
  to_unix_date = (date)-> Math.floor date.valueOf() / 1000

  start_date = to_unix_date new Date()
  end_date = to_unix_date new Date('2014-12-31')

  url = "https://google-developers.appspot.com/events/event-markers.public?tag=wtm&start=#{start_date}&end=#{end_date}"
  # e.g.: https://google-developers.appspot.com/events/event-markers.public?tag=wtm&start=1391715552&end=1419984000

  if Modernizr.cors
    return $http.get(url)
  else
    url += "&callback=JSON_CALLBACK"
    return $http.jsonp(url)


APP.controller 'MapCtrl', ($scope, EventMap)->
  # example:
  #
  # description: "DevFest Akure is an 8 hour hackathon tagged "reviving the process".â†µDevelopers from all over the are are welcome to develop apps using the best practices.â†µThe winners are people who used the most effective process in their apps."
  # end: "13 Sep 2013 17:00 +0100"
  # gPlusEventLink: "https://plus.google.com/events/cmq1oco145jkg2fcm78j69os7h4"
  # iconUrl: "/_static/images/gdg-icon.png"
  # id: "903757664"
  # link: "/events/903757664/"
  # location: "Royal Birds Hotel & Towers, Akure, Ondo, Nigeria"
  # participantsCount: 45
  # start: "13 Sep 2013 09:00 +0100"
  # temporalRelation: "past"
  # timezoneName: "Africa/Lagos"
  # title: "DevFest Akure"

  # We want to use a registration form link for each of the event titles,
  # not the 'defaultEventURL' (which links to the Google Developers event
  # listing). This array establishes which registration URL should be used
  # for each event URL.
  event_registration_urls = {
    # DevFestW Omsk
    '/events/6298372969332736/' : 'https://plus.google.com/u/0/events/c39k2o851o1kr6ukan8uoj1qqcs',

    # Mountain View
    '/events/6254656321748992/' : 'http://goo.gl/x1jmQw',

    # NYC
    '/events/6542341821169664/' : 'http://goo.gl/x1jmQw'
  };

  _current_infobox = null

  $scope.event_map = {
    show: 'map'
    map_options: {
      center: new google.maps.LatLng(10, 0)
      zoom: 2
      minZoom: 2
      scrollWheel: false
    }
    map: {}
    events: []
    resize: ()->
      google.maps.event.trigger @map, 'resize'
    mark: (event, index)->
      marker = new google.maps.Marker {
        position: event.latlng
        map: @map
        icon: {
          url: "../img/marker.png"
          scaledSize: new google.maps.Size(19, 33)
        }
      }

      # Use the registration URL if one has been supplied.
      if event.defaultEventUrl of event_registration_urls
        event.desiredUrl = event_registration_urls[event.defaultEventUrl]
      else
        event.desiredUrl = "https://developers.google.com" + event.defaultEventUrl

      info_content = """
          <div class="event-infobox">
            <h3 class="event-title">
              <a href="#{event.desiredUrl}" target="_blank">#{event.name}</a>
            </h3>
            <p class="event-location">#{event.location}</p>
          </div>
        """

      info = new InfoBox {
        content: info_content
      }
      google.maps.event.addListener marker, 'click', ()=>
        @selected = index
        $scope.$apply()

        _current_infobox?.close()
        _current_infobox = info

        info.open @map, marker


    load: ()->
      EventMap.success (data)=>

        @events = data
        @mark e, index for e, index in @events
      @resize()
    clear_selected: ()->
      @selected = null
    selected: null
  }

  $scope.event_map.load()


APP.filter 'coerceDate', ()->
  (source)->
    return new Date(source * 1000)


# Sticky Navigation
APP.run ($rootScope, $timeout)->
  pos = 1
  $window = $(window)

  $nav = $('.page-nav')
  $nav_top = $('.page-nav').offset().top
  $header = $('.page-header')

  $window.on "scroll", ()->
    pos = $window.scrollTop()

    if pos >= $nav_top
      $nav.addClass('fixed')
      $header.addClass('fixed-nav-compensation')
    else
      $nav.removeClass('fixed')
      $header.removeClass('fixed-nav-compensation')


# Parallax
APP.run ($rootScope, $timeout)->
  pos = 1
  $rootScope.scroll_pos = pos

  $window = $(window)

  $bg_photo = $('.bg-photo')
  $header = $('.page-header .container')
  $pattern_header = $('.pattern-header')
  $pattern_right = $('.pattern-right-layer')
  $pattern_left = $('.pattern-left-layer')

  transform = Modernizr.prefixed('transform')

  height = $window.height()

  $window.on "scroll", ()->
    $rootScope.scroll_pos = pos
    $rootScope.$apply()

  draw_background = ()->
    pos = $window.scrollTop()
    scale = Math.max 0, ((height * 0.5) - pos) / (height * 0.5)

    $pattern_header.css transform, "translate3d(0, #{(pos * 0.5)}px, 0)"
    $pattern_right.css transform, "translate3d(0, #{(pos * -0.5)}px, 0)"
    $pattern_left.css transform, "translate3d(0, #{(pos * -0.5)}px, 0)"
    $bg_photo.css transform, "translate3d(0, #{(pos * 0.3)}px, 0)"
    $header.css transform, "translate3d(0, #{(pos * -0.3)}px, 0)"

    requestAnimationFrame draw_background

  if Modernizr.csstransforms3d && !Modernizr.touch
    requestAnimationFrame draw_background
  else
    $window.on "scroll", ()->
      pos = $window.scrollTop()
