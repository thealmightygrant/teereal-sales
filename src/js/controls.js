$ = require('jquery')

exports.setupSlideControls = function(){
  $(document).ready(function(){
    var center_panel = $("slide-container-center-panel")
    , left_panel = $("slide-container-left-panel")
    , right_panel = $("slide-container-left-panel")

    $("slide-container-arrow-left").click(function(e){
      if(center_panel.hasClass("active")){
        center_panel.css("left", "100%")
        left_panel.css("left", "0")
        right_panel.css("left", "-100%")
      }
      else if(right_panel.hasClass("active")){
        center_panel.css("left", "0")
        left_panel.css("left", "-100%")
        right_panel.css("left", "100%")
      }
      else if(left_panel.hasClass("active")){
        center_panel.css("left", "-100%")
        left_panel.css("left", "100%")
        right_panel.css("left", "0")
      }
    });
    $("slide-container-arrow-right").click(function(e){
      if(center_panel.hasClass("active")){
        center_panel.css("left", "-100%")
        left_panel.css("left", "100%")
        right_panel.css("left", "0")
      }
      else if(right_panel.hasClass("active")){
        center_panel.css("left", "0")
        left_panel.css("left", "-100%")
        right_panel.css("left", "100%")
      }
      else if(left_panel.hasClass("active")){
        center_panel.css("left", "100%")
        left_panel.css("left", "0")
        right_panel.css("left", "-100%")
      }
    });
  });
}
