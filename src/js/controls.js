var $ = require('jquery'),
    utils = require('./utils');

var slide_controls_fn = function(){
  $(document).ready(function(){
    var center_panel = $(".center-panel")
    , left_panel = $(".left-panel")
    , right_panel = $(".right-panel")
    , slide_panels = $(".slide-panel")

    //TODO: separate to return multiple functions based on which panel is clicked, use three different callbacks, use classes to differentiate?
    var transitionTime = 500;

    var leftTransition = function(e){
      if(center_panel.hasClass("active")){
        center_panel.toggleClass("active", false);
        left_panel.toggleClass("active", true);
        center_panel.css("left", "100%")
        left_panel.css("left", "0")
        right_panel.css("left", "-100%")
      }
      else if(right_panel.hasClass("active")){
        right_panel.toggleClass("active", false);
        center_panel.toggleClass("active", true);
        center_panel.css("left", "0")
        left_panel.css("left", "-100%")
        right_panel.css("left", "100%")
      }
      else if(left_panel.hasClass("active")){
        left_panel.toggleClass("active", false);
        right_panel.toggleClass("active", true);
        center_panel.css("left", "-100%")
        left_panel.css("left", "100%")
        right_panel.css("left", "0")
      }
    }
    
    var rightTransition = function(e){
      if(center_panel.hasClass("active")){
        center_panel.toggleClass("active", false);
        left_panel.toggleClass("active", true);
        center_panel.css("left", "100%")
        left_panel.css("left", "0")
        right_panel.css("left", "-100%")
      }
      else if(right_panel.hasClass("active")){
        right_panel.toggleClass("active", false)
        center_panel.toggleClass("active", true)
        right_panel.css("left", "100%")
        center_panel.css("left", "0")
        left_panel.css("left", "-100%")
      }
      else if(left_panel.hasClass("active")){
        left_panel.toggleClass("active", false)
        right_panel.toggleClass("active", true)
        left_panel.css("left", "100%")
        center_panel.css("left", "-100%")
        right_panel.css("left", "0")
      }
    }

    $(".slide-container-arrow-right").click(rightTransition);
    $(".slide-container-arrow-left").click(leftTransition);
  });
}



exports.setupSlideControls = slide_controls_fn;

