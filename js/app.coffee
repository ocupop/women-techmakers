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

  if Modernizr.cors
    return $http.get(url)
  else
    url += "&callback=JSON_CALLBACK"
    return $http.jsonp(url)


APP.controller 'MapCtrl', ($scope, EventMap)->
  # example:
  #
  # description: "DevFest Akure is an 8 hour hackathon tagged "reviving the process".↵Developers from all over the are are welcome to develop apps using the best practices.↵The winners are people who used the most effective process in their apps."
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

  marker_url = if Modernizr.svg
    "img/marker.svg"
  else
    "img/marker.png"

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
        icon: marker_url
      }

      info_content = """
          <div class="event-infobox">
            <h3 class="event-title">
              <a href="https://developers.google.com#{event.defaultEventUrl}" target="_blank">#{event.name}</a>
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
