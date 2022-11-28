var $parallaxImage = $(".parallax-image");
var $hasAnimation = $('[data-animation]');

$(document).ready(function () {
  animation($hasAnimation, 40);
  getAllPercentages();
  changeTransparencyHistory();

  //adding images through data-image
  $parallaxImage.each(function (index) {
    var imgURL = $(this).data("image");
    if (imgURL) {
      $(this).css("background-image", "url('" + imgURL + "')");
    }
  });

  $(".panel").on("classChanged", function () {
    if ($(this).hasClass("active")) {
      $('.tab-video').each(function () {
        $(this).get(0).currentTime = 0;
        $(this).get(0).pause();
      });
      var tabID = $(this).attr("id");
      var item = $('a[href="#' + tabID + '"]');
      var line = $('a[href="#' + tabID + '"]').find(".line");

      const obj = $(this).find("video").get(0);
      const time = obj.duration * 1050;

      $(".line").stop();
      $(".line").css("width", "0");
      line.animate({
        width: "100%"
      }, {
        duration: time,
        complete: function () {
          if (percentageSeen($('#panels-container')) == 50) {
            if (item.next()[0]) {
              item.next()[0].click();
            }
            else {
              $('a.anchor.first-one')[0].click();
            }
          }
        }
      });

      $(this).find("video").get(0).play();
    }
  })

  $('#masthead .anchor-nav .anchor > *').on('click', function () {
    $(this).parents('.anchor')[0].click();
  })
});

$(window).on('scroll', function () {
  getAllPercentages();
  changeTransparencyHistory();
  $(".topTexts .text:not(.with-content)").each(function () {
    var thisHowMuch = percentageSeen($(this));
    $(this).attr("data-some", thisHowMuch);

    if (thisHowMuch > 0) {
      var next = $(this).parent().next().children('.text');
      if (next.length) {
        var nextHowMuch = percentageSeen(next);
        next.attr("data-some", nextHowMuch);
        var trans = (100 - nextHowMuch) / 100;
        if (nextHowMuch > 0) {
          $(this).css("opacity", trans / 36);
        }
        else {
          $(this).css("opacity", 1);
        }
      }
    }
  });

  $('#panels-container').each(function () {
    var thisHowMuch = percentageSeen($(this));
    $(this).attr("data-some", thisHowMuch);
    if (thisHowMuch > 49) {
      $('.site .overlay').css("z-index", "-1");
    }
    else {
      $('.site .overlay').css("z-index", "9999");
    }
  })
})


//function for changing opacity for history texts
function changeTransparencyHistory() {
  if ($(".history-texts").length > 0) {
    $(".timeline-item").each(function (index) {
      if (percentageSeen($(this)) > 22 && percentageSeen($(this)) < 65) {
        $(this).children().css("opacity", 1);
        $(this).children().attr("data-someee", percentageSeen($(this)));
      }
      else if (percentageSeen($(this)) < 23 || percentageSeen($(this)) > 66) {
        if (percentageSeen($(this)) < 10) {
          $(this).children().css("opacity", 0);
        }
        else {
          $(this).children().css("opacity", 0.3);
        }
      }
      else {
        $(this).children().css("opacity", 0.3);
      }
    });
    $(".MactFixed").each(function () {
      var marginTop = $(window).scrollTop() - $(this).parents("section").position().top;
      $(this).css({ 'margin-top': marginTop });
      var diff = $(".MactFixed").offset().top - $("section.has-timeline").offset().top - $(".timeline-ahead").height();
      if (diff < 0) {
        $(".MactFixed").addClass("makeithide");
      }
      else {
        if (($(".MactFixed").offset().top + $(".MactFixed").height()) > ($(".has-timeline .parallax-content .last-item").offset().top + $(".has-timeline .parallax-content .last-item").height())) {
          $(".MactFixed").addClass("makeithide");
        }
        else {
          $(".MactFixed").removeClass("makeithide");
        }
      }
      var nextItem = $(this).siblings(".text.aa");
      var toChange = $(this).siblings(".timeline-ahead");
      var checkNextVisible = percentageSeen(nextItem);
      nextItem.attr("some", checkNextVisible);
      if (checkNextVisible >= 25) {
        var blurCalc = percentageSeen($(this)) / 10;
        var blurVal = 'blur(' + blurCalc + 'px)';
        toChange.css("filter", blurVal);
        if (checkNextVisible >= 35) {
          toChange.css("opacity", 0);
        }
        else {
          toChange.css("opacity", 1);
        }
      }
      else {
        toChange.css('filter', "blur(0)");
      }
    });
  }
}

function getAllPercentages() {
  //for company header paras
  $(".topTexts .text:not(.with-content) p").each(function () {
    var per = percentageSeen($(this));
    var trans = per / 100;
    if (per > 20) {
      if (per > 30) {
        $(this).css("opacity", 1);
      }
      else {
        $(this).css("opacity", trans);
      }
    }
    else {
      $(this).css("opacity", 0);
    }
  });

  //for company header paras
  $(".topTexts").each(function () {
    var per = percentageSeen($(this));
    var trans = per / 10;
    var trans1 = per / 10;
    if (per < 20) {
      $(this).find(".content").css("filter", "blur(" + 0 + "px)");
      $(this).find(".video").css("filter", "blur(" + 0 + "px)");
	  $(this).find(".content").css("opacity", "" + 1 );
    }
    else {
      $(this).find(".content").css("filter", "blur(" + trans1 + "px)");
      $(this).find(".content").css("opacity", "." + trans1 );
      $(this).find(".video").css("filter", "blur(" + trans * 3 + "px)");
    }
  });
}

//calculate how much % the div is visible
function percentageSeen(element) {
  var viewportHeight = $(window).height(),
    scrollTop = $(window).scrollTop(),
    elementOffsetTop,
    elementHeight;
  if (element) {
    elementOffsetTop = element.offset().top,
      elementHeight = element.height();
  }
  else {
    elementOffsetTop = element.prev().offset().top,
      elementHeight = element.prev().height();
  }

  if (elementOffsetTop > (scrollTop + viewportHeight)) {
    return 0;
  } else if ((elementOffsetTop + elementHeight) < scrollTop) {
    return 100;
  } else {
    var distance = (scrollTop + viewportHeight) - elementOffsetTop;
    var percentage = distance / ((viewportHeight + elementHeight) / 100);
    percentage = Math.round(percentage);
    return percentage;
  }
}


//fadeInFromBottom animation
function animation(element, howmuch) {
  var whichAnimation = element.data("animation");
  var animationCalc = howmuch;
  element.each(function (index) {
    if ($(this).hasClass("justwhenitloads")) {
      $(this).attr("data-scroll", percentageSeen($(this)));
      if (percentageSeen($(this)) > 1) {
        $(this).addClass("loaded");
      }
    }
    else {
      $(this).attr("data-scroll", percentageSeen($(this)));
      if (percentageSeen($(this)) > howmuch) {
        $(this).addClass("loaded");
      }

      if (percentageSeen($(this)) == 0 || percentageSeen($(this)) == 100 || percentageSeen($(this)) < howmuch) {
        $(this).removeClass("loaded");
      }
    }
  });
}
$(window).scroll(function() {
	// For Sticky Navbar
    if ($(window).scrollTop() > 50) { 
        $('.text.with-content').addClass('fexed-text');
    } else {
        $('.text.with-content').removeClass('fexed-text');
    }    
});