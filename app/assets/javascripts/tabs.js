function makeResizableIframe() {
  var iframe = $(".tabs iframe")[0];
  
  // When mouse enters iframe, parent document stops receiving `mousemoved` events and resizer stops working.
  // We'll overlay an invisible div that intercepts movement whenever the user drags the mouse to resolve this.
  var div = document.createElement("div");
  div.style.zIndex = 99;
  div.style.opacity = "0"; // comment this out to see the div. it's red.
  div.style.backgroundColor = "red";
  div.style.position = "absolute";
  div.style.left = $(iframe).offset().left+"px";
  div.style.top  = $(iframe).offset().top+"px";
  div.style.width = $(iframe).width()+"px";
  div.style.height = $(iframe).height()+"px";
  div.style.visibility = "hidden";
  $(document.body).prepend(div);
  $(document).mousedown(function() { div.style.visibility="visible"; });
  $(document).mouseup(function() { div.style.visibility="hidden"; });

  var startx, starty;
  // the resizable has to be a div, iframe won't work. So we'll add triggers that fire whenever the outer div
  // is resized, and resize the inner iframe by the same amount.
  $(".tabs").resizable({
    start: function(event, ui) {
      startx = $(event.target).width();
      starty = $(event.target).height();
    },
    
    resize: function(event, ui) {
      var offsetx = $(event.target).width() - startx;
      var offsety = $(event.target).height()- starty;

      iframe.style.width  = ($(iframe).width() + offsetx).toString()+"px";
      iframe.style.height = ($(iframe).height() + offsety).toString()+"px";
      div.style.width = iframe.style.width;
      div.style.height = iframe.style.height;

      startx = $(event.target).width();
      starty = $(event.target).height();
    }
  });
}

function makeLoadingDiv() {
  // loading div is displayed on top of iframe to (A) gray out the iframe as a visual cue and
  // (B) intercept events to prevent user from working with a stale iframe.
  var iframe = $(".tabs iframe")[0];
  var div = document.createElement("div");
  div.style.zIndex = 100;
  div.style.opacity = 0.5;
  div.style.backgroundColor = "white";
  div.style.position = "absolute";
  div.style.left = $(iframe).offset().left+"px";
  div.style.top  = $(iframe).offset().top+"px";
  div.style.width = $(iframe).width()+"px";
  div.style.height = $(iframe).height()+"px";
  div.style.visibility = "hidden";
  $(document.body).prepend(div);
  
  $(".tabs iframe")[0].loadingDiv = div;
}

function setTabContent() {
  var e = $(".tabs .selected")[0];
  if (!e) return;
  
  function getParameterByName(name)
  {
    name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
    var regexS = "[\\?&]" + name + "=([^&#]*)";
    var regex = new RegExp(regexS);
    var results = regex.exec(window.location.href);
    if(results == null)
      return "";
    else
      return decodeURIComponent(results[1].replace(/\+/g, " "));
  }

  var content_url = e.dataset['content'];
  var debug_assets = getParameterByName('debug_assets').toString();
  if (debug_assets == "true" || debug_assets == "1")
    if (content_url.indexOf("?") != -1)
      content_url += "&debug_assets="+debug_assets;
    else
      content_url += "?debug_assets="+debug_assets;
  if (content_url)
    $(".tabs iframe")[0].src = content_url;
}

$(document).ready(function() {
  makeResizableIframe();
  makeLoadingDiv();
  setTabContent();
    
  // when iframe loads a new doc, hide the loading div.
  $(".tabs iframe")[0].onload = (function() {
    $(".tabs iframe")[0].loadingDiv.style.visibility = "hidden";
  });

  $(".tabs li").click(function(e) {
    if ($(e.target).hasClass("selected")) return; // nothing to do
    
    var all = $(".tabs li");
    for (var i = 0; i < all.length; i++) {
      $(all[i]).removeClass("selected");
      $(all[i]).removeClass("preceding-selected");
      $(all[i]).removeClass("following-selected");
    }
    
    $(e.target).addClass("selected");
    var prev = $(e.target).prev();
    prev = prev[prev.length-1];
    if (prev) $(prev).addClass("preceding-selected");
    
    // show the loading div and fill the iframe
    $(".tabs iframe")[0].loadingDiv.style.visibility = "visible";
    
    setTabContent();
  });
});
