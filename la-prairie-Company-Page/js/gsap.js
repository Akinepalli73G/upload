gsap.registerPlugin(ScrollToPlugin, ScrollTrigger, TweenMax);
//this is just an example plugin that allows us to animate a "blur" property like gsap.to(target, {blur:10}) and it'll feed that value to this plugin which will do all the necessary calculations to add/update a blur() value in the CSS "filter" property (in browsers that support it). We wrap it in an iife just so that we can declare some local variables in a private scope at the top.
(function () {
  const blurProperty = gsap.utils.checkPrefix("filter"),
    blurExp = /blur\((.+)?px\)/,
    getBlurMatch = target => (gsap.getProperty(target, blurProperty) || "").match(blurExp) || [];

  gsap.registerPlugin({
    name: "blur",
    get(target) {
      return +(getBlurMatch(target)[1]) || 0;
    },
    init(target, endValue) {
      let data = this,
        filter = gsap.getProperty(target, blurProperty),
        endBlur = "blur(" + endValue + "px)",
        match = getBlurMatch(target)[0],
        index;
      if (filter === "none") {
        filter = "";
      }
      if (match) {
        index = filter.indexOf(match);
        endValue = filter.substr(0, index) + endBlur + filter.substr(index + match.length);
      } else {
        endValue = filter + endBlur;
        filter += filter ? " blur(0px)" : "blur(0px)";
      }
      data.target = target;
      data.interp = gsap.utils.interpolate(filter, endValue);
    },
    render(progress, data) {
      data.target.style[blurProperty] = data.interp(progress);
    }
  });
})();

batch(".topTexts .text.with-content", {
  duration: 1,
  interval: 0.5, // time window (in seconds) for batching to occur. The first callback that occurs (of its type) will start the timer, and when it elapses, any other similar callbacks for other targets will be batched into an array and fed to the callback. Default is 0.1
  batchMax: 1,   // maximum batch size (targets)
  start: "center center", // when the top of the trigger hits the top of the viewport
  pin: true,
  onEnter: batch => gsap.set(batch, { autoAlpha: 1, overwrite: true }),
  onEnterBack: batch => gsap.set(batch, { autoAlpha: 1, overwrite: true }),
  onLeave: batch => gsap.set(batch, { autoAlpha: 0, overwrite: true }),
  onLeaveBack: batch => gsap.set(batch, { autoAlpha: 0, overwrite: true }),
  scrub: true
});


batch(".topTexts .text:not(.with-content)", {
  duration: 3,
  interval: 0.5, // time window (in seconds) for batching to occur. The first callback that occurs (of its type) will start the timer, and when it elapses, any other similar callbacks for other targets will be batched into an array and fed to the callback. Default is 0.1
  batchMax: 1,   // maximum batch size (targets)
  start: "center center", // when the top of the trigger hits the top of the viewport
  pin: true,
  onLeaveBack: batch => gsap.set(batch, { autoAlpha: 1, overwrite: true, stagger: 0.5 }),
  onLeave: batch => gsap.set(batch, { autoAlpha: 1, overwrite: true, stagger: 0.5 }),
  onEnterBack: batch => gsap.set(batch, { autoAlpha: 1, overwrite: true, stagger: 0.5 }),
  scrub: true
});


// the magical helper function (no longer necessary in GSAP 3.3.1 because it was added as ScrollTrigger.batch())...
function batch(targets, vars) {
  let varsCopy = {},
    interval = vars.interval || 0.1,
    proxyCallback = (type, callback) => {
      let batch = [],
        delay = gsap.delayedCall(interval, () => { callback(batch); batch.length = 0; }).pause();
      return self => {
        batch.length || delay.restart(true);
        batch.push(self.trigger);
        vars.batchMax && vars.batchMax <= batch.length && delay.progress(1);
      };
    },
    p;
  for (p in vars) {
    varsCopy[p] = (~p.indexOf("Enter") || ~p.indexOf("Leave")) ? proxyCallback(p, vars[p]) : vars[p];
  }
  gsap.utils.toArray(targets).forEach(target => {
    let config = {};
    for (p in varsCopy) {
      config[p] = varsCopy[p];
    }
    config.trigger = target;
    ScrollTrigger.create(config);
  });
}

// --- ORANGE PANEL ---

const t1 = gsap.timeline({
  scrollTrigger: {
    trigger: ".last-text",
    scrub: true,
    pin: false
  }
}).from(".topTexts video", {
  opacity: 1, ease: Power1.easeOut
}).to(".topTexts", {
  opacity: 0, ease: Power1.easeOut
})

const t2 = gsap.timeline({
  scrollTrigger: {
    trigger: ".stopMidway",
    scrub: true,
    pin: true,
    pinSpacing: false,
    start: "center center",
    end: 9999
  }
});

const t21 = gsap.timeline({
  scrollTrigger: {
    trigger: ".max-tablet",
    start: "center 20%",
    end: 9999,
    toggleClass: "filter"
  }
})

gsap.registerPlugin(ScrollToPlugin, ScrollTrigger);

/* Main navigation */
let panelsSection = document.querySelector("#panels"),
  panelsContainer = document.querySelector("#panels-container"),
  tween;
document.querySelectorAll(".anchor").forEach(anchor => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();
    let targetElem = document.querySelector(e.target.getAttribute("href")),
      y = targetElem;
    if (targetElem && panelsContainer.isSameNode(targetElem.parentElement)) {
      let totalScroll = tween.scrollTrigger.end - tween.scrollTrigger.start,
        totalMovement = (panels.length - 1) * targetElem.offsetWidth;
      y = Math.round(tween.scrollTrigger.start + (targetElem.offsetLeft / totalMovement) * totalScroll);
    }
    gsap.to(window, {
      scrollTo: {
        y: y,
        autoKill: false
      },
      duration: 1
    });
  });
});

const panelAnchors = gsap.utils.toArray(".anchor-nav a.anchor");
/* Panels */
const panels = gsap.utils.toArray("#panels-container .panel");
const snapIncrement = 1 / (panels.length - 1);
let panelIndex = 0;

tween = gsap.to(panels, {
  xPercent: -100 * (panels.length - 1),
  ease: "none",
  onUpdate() {
    let i = Math.round(this.progress() / snapIncrement);
    if (panelIndex !== i) {
      panelAnchors[panelIndex].classList.remove("active");
      panels[panelIndex].classList.remove("active");
      panelIndex = i;
      panelAnchors[i].classList.add("active");
      panels[i].classList.add("active");
      $(".panel").trigger('classChanged');
    }
  },
  scrollTrigger: {
    trigger: "#panels-container",
    pin: true,
    start: "top top",
    scrub: 1,
    snap: {
      snapTo: 1 / (panels.length - 1),
      inertia: false,
      duration: { min: 0.1, max: 0.1 }
    },
    end: () => "+=" + (panelsContainer.offsetWidth - innerWidth)
  }
});

const t3 = gsap.timeline({
  scrollTrigger: {
    trigger: ".s-img",
    scrub: true,
    start: "30% bottom",
    end: "center center"
  }
}).from(".s-img", {
  scale: 1,
  ease: "none"
}).to(".s-img", {
  scale: 3.5,
  ease: "none"
});

const t4 = gsap.timeline({
  scrollTrigger: {
    trigger: ".site",
    start: "top top",
    toggleClass: "active"
  }
})
