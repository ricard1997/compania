(function($) {
  'use strcit';
  (function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
      window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
      window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || window[vendors[x] + 'CancelRequestAnimationFrame'];
    }
    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = function(callback, element) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16 - (currTime - lastTime));
        var id = window.setTimeout(function() {
          callback(currTime + timeToCall);
        }, timeToCall);
        lastTime = currTime + timeToCall;
        return id;
      };
    }
    if (!window.cancelAnimationFrame) {
      window.cancelAnimationFrame = function(id) {
        clearTimeout(id);
      };
    }
  })();
  var animationEnd = 'webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend';

  function getTransitionEndEvent() {
    var t;
    var el = document.createElement("dummy");
    var transitions = {
      "transition": "transitionend",
      "OTransition": "oTransitionEnd",
      "MozTransition": "transitionend",
      "WebkitTransition": "webkitTransitionEnd"
    }
    for (t in transitions) {
      if (el.style[t] !== undefined) {
        return transitions[t];
      }
    }
  }
  var transitionEnd = getTransitionEndEvent();
  /*!
  Cross browser compatible smooth scroll function as replacement of
  scrollIntoView.
  */
  function smoothScroll(destination, duration, easing, offset, callback) {
    var easing = easing || 'linear';
    var duration = duration || 200;
    var offset = offset || 0;
    var easings = {
      linear(t) {
        return t;
      },
      easeInQuad(t) {
        return t * t;
      },
      easeOutQuad(t) {
        return t * (2 - t);
      },
      easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      },
      easeInCubic(t) {
        return t * t * t;
      },
      easeOutCubic(t) {
        return (--t) * t * t + 1;
      },
      easeInOutCubic(t) {
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
      },
      easeInQuart(t) {
        return t * t * t * t;
      },
      easeOutQuart(t) {
        return 1 - (--t) * t * t * t;
      },
      easeInOutQuart(t) {
        return t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t;
      },
      easeInQuint(t) {
        return t * t * t * t * t;
      },
      easeOutQuint(t) {
        return 1 + (--t) * t * t * t * t;
      },
      easeInOutQuint(t) {
        return t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t;
      }
    };
    var start = window.pageYOffset;
    var startTime = 'now' in window.performance ? performance.now() : new Date().getTime();
    var documentHeight = Math.max(document.body.scrollHeight, document.body.offsetHeight, document.documentElement.clientHeight, document.documentElement.scrollHeight, document.documentElement.offsetHeight);
    var windowHeight = window.innerHeight || document.documentElement.clientHeight || document.getElementsByTagName('body')[0].clientHeight;
    var destinationOffset = Math.max((typeof destination === 'number' ? destination : destination.offsetTop) - offset, 0);
    var destinationOffsetToScroll = Math.round(documentHeight - destinationOffset < windowHeight ? documentHeight - windowHeight : destinationOffset);
    if ('requestAnimationFrame' in window === false) {
      window.scroll(0, destinationOffsetToScroll);
      if (callback) {
        callback();
      }
      return;
    }

    function scroll() {
      var now = 'now' in window.performance ? performance.now() : new Date().getTime();
      var time = Math.min(1, ((now - startTime) / duration));
      var timeFunction = easings[easing](time);
      window.scroll(0, Math.ceil((timeFunction * (destinationOffsetToScroll - start)) + start));
      if (window.pageYOffset === destinationOffsetToScroll) {
        if (callback) {
          callback();
        }
        return;
      }
      requestAnimationFrame(scroll);
    }
    scroll();
  };
  /*!
  Cardio controller for all page events
  */
  var CARDIO = window.CARDIO || {};
  /*!
  Cardio initializer
  */
  CARDIO.init = function() {
    $(document).foundation();
    CARDIO.sections.init();
    CARDIO.topBar.init();
    CARDIO.menu.init();
    CARDIO.preloader.init();
    CARDIO.typewriter.init();
    CARDIO.contactForm.init();
    CARDIO.cleanStreamFieldDOM.init();
  };
  /*!
  Cardio handler for preloader related events
  */
  CARDIO.preloader = {
    el: null,
    init: function() {
      var self = this;
      self.el = document.getElementById('page-preloader');
      self.el && window.addEventListener('load', function() {
        return self.fade()
      }, false);
    },
    fade: function() {
      var self = this;
      $(self.el).addClass('animated fadeOut').one(animationEnd, function() {
        $('.page-preloader').hide();
      });
    },
  }
  /*!
  Cardio handler for top-bar related events
  */
  CARDIO.topBar = {
    el: null,
    brandImg: null,
    active: false,
    init: function() {
      var self = this;
      self.el = document.getElementById('top-bar');
      self.el && (self.brandImg = self.el.querySelector('.brand img'));
      self.el && self.activate();
      self.el && self.deactivate();
      activeImg = document.createElement('img');
      activeImg.style.display = 'none';
      self.brandImg && (self.brandImg.dataset.srcActive && (activeImg.src = self.brandImg.dataset.srcActive || document.body.appendChild(activeImg)));
      self.el && document.addEventListener('scroll', function() {
        self.activate()
      }, false);
      self.el && document.addEventListener('scroll', function() {
        self.deactivate()
      }, false);
    },
    activate: function() {
      var self = this;
      var documentPosition = document.documentElement.scrollTop || document.body.scrollTop;
      if (self.el !== null) {
        if (documentPosition > 10) {
          self.el.classList.add('active', 'shrink');
          self.active = true;
          if (self.brandImg !== null && self.brandImg.dataset.srcActive) {
            self.brandImg.src = self.brandImg.dataset.srcActive;
          }
        }
      }
    },
    deactivate: function() {
      var self = this;
      var documentPosition = document.documentElement.scrollTop || document.body.scrollTop;
      if (self.el !== null) {
        if (documentPosition <= 10) {
          self.el.classList.remove('active', 'shrink');
          self.active = false;
          if (self.brandImg !== null && self.brandImg.dataset.src) {
            self.brandImg.src = self.brandImg.dataset.src;
          }
        }
      }
    }
  };
  /*!
  Cardio handler for desktop menu related events
  */
  CARDIO.menu = {
    el: null,
    links: null,
    toggler: null,
    sections: null,
    expanded: null,
    init: function() {
      var self = this;
      self.el = document.getElementById('menu');
      self.el.addEventListener(transitionEnd, function(event) {
        self.el.style.overflow = '';
      }, false);
      self.el && (self.links = self.el.querySelectorAll('a[href^="#"]'));
      self.links && Array.prototype.forEach.call(self.links, function(e) {
        self.sections === null && (self.sections = {});
        var sectionId = e.hash.replace('#', '');
        var section = document.getElementById(sectionId);
        self.sections[e.hash] = section.offsetTop;
      });
      self.links && self.scrollSpy();
      self.links && document.addEventListener('scroll', function() {
        var offset = Math.round(0.30 * window.innerHeight);
        return self.scrollSpy(offset);
      }, false);
      self.links && Array.prototype.forEach.call(self.links, function(link) {
        link.addEventListener('click', function(e) {
          e.preventDefault();
          return self.smoothScroll(link, 80);
        }, false)
      });
      self.el && window.addEventListener('resize', function() {
        self.updateMode();
      }, false);
      self.toggler = document.getElementById('toggle-menu');
      self.toggler && document.addEventListener('scroll', function() {
        if (self.expanded) {
          self.collapse();
        }
      }, false);
      self.toggler && self.toggler.addEventListener('click', function() {
        self.toggleStatus();
      }, false);
      self.el && self.collapse();
      self.el && self.updateMode();
    },
    scrollSpy: function(offset) {
      var offset = offset || 0;
      var self = this;
      var scrollPosition = document.documentElement.scrollTop || document.body.scrollTop;
      for (i in self.sections) {
        if (self.sections[i] - offset <= scrollPosition) {
          var acttiveLink = self.el.querySelector('a.active');
          acttiveLink && acttiveLink.classList.remove('active');
          self.el.querySelector('a[href*="' + i + '"]').classList.add('active');
        }
      }
    },
    smoothScroll: function(link, offset) {
      var offset = offset || 0;
      var target = document.getElementById(link.hash.replace('#', ''));
      var has_cut_top = target.classList.contains('with-cut-top');
      smoothScroll(document.getElementById(link.hash.replace('#', '')), 500, 'easeInOutQuad', has_cut_top ? offset : 0);
    },
    toggleStatus: function() {
      var self = this;
      self.toggler && self.toggler.classList.contains('collapsed') ? self.expand() : self.collapse();
    },
    expand: function() {
      var self = this;
      var topBar = CARDIO.topBar.el
      var topBarActive = CARDIO.topBar.active;
      var brandImg = CARDIO.topBar.brandImg;
      self.expanded = true;
      self.toggler && self.toggler.classList.remove('collapsed');

      function displayMenu() {
        self.el && (self.el.classList.add('active') || ((self.el.style.height = (self.el.querySelectorAll('li').length * 50).toString() + 'px') && (self.el.style.overflow = 'hidden')));
        if (!topBarActive) {
          topBar.removeEventListener(transitionEnd, displayMenu, false);
        }
      }
      if (!topBarActive) {
        topBar.classList.add('active');
        brandImg && (brandImg.dataset.srcActive && (brandImg.src = brandImg.dataset.srcActive));
        topBar.addEventListener(transitionEnd, displayMenu, false);
      } else {
        displayMenu();
      }
    },
    collapse: function() {
      var self = this;
      var topBar = CARDIO.topBar.el;
      var topBarActive = CARDIO.topBar.active;
      var brandImg = CARDIO.topBar.brandImg;
      self.expanded = false;

      function decolorizeTopBar() {
        if (!topBarActive) {
          topBar.classList.remove('active');
          brandImg && brandImg.dataset.src && (brandImg.src = brandImg.dataset.src);
          self.el.removeEventListener(transitionEnd, decolorizeTopBar, false);
        }
        CARDIO.topBar.activate();
        CARDIO.topBar.deactivate();
      }
      self.toggler && self.toggler.classList.add('collapsed');
      self.el && (self.el.classList.remove('active') || (self.el.style.height = ''));
      if (!topBarActive) {
        self.el.addEventListener(transitionEnd, decolorizeTopBar, false);
      }
    },
    updateMode: function() {
      var self = this;
      if (Foundation.MediaQuery.atLeast('large')) {
        self.el && self.el.classList.remove('mobile', 'vertical');
      } else {
        self.el && self.el.classList.add('mobile', 'vertical');
      }
    }
  }
  /*!
  Cardio handler for sections related events
  */
  CARDIO.sections = {
    el: null,
    styleSheet: null,
    styleRule: -1,
    init: function() {
      var self = this;
      self.el = document.querySelectorAll('main>section.section');
      self.styleSheet = document.querySelector("style#cardio-sections-style");
      if (!self.styleSheet) {
        self.styleSheet = document.createElement('style');
        self.styleSheet.id = "cardio-sections-style";
        document.head.appendChild(self.styleSheet);
        self.styleSheet = self.styleSheet.sheet
      }
      self.adjustCutsLayout();
      self.adjustCutsStyles();
      window.addEventListener('resize', function() {
        self.adjustCutsStyles()
      }, false);
      window.addEventListener('resize', function() {
        self.adjustCutsLayout()
      }, false);
    },
    adjustCutsLayout: function() {
      var self = this;
      for (var i = 0; i < self.el.length; i++) {
        self.el[i].style.height = '';
      }
      for (var i = 0; i < self.el.length; i++) {
        var el = self.el[i];
        if (el.nextElementSibling && el.nextElementSibling.classList.contains('with-cut-top')) {
          el.style.height = (el.clientHeight + 80).toString() + 'px';
        }
        if (el.classList.contains('with-cut-bottom')) {
          var nextEl = el.nextElementSibling;
          if (nextEl) {
            var oldHeight = nextEl.style.height.replace('px', '');
            oldHeight = (oldHeight == '') ? nextEl.clientHeight : parseFloat(oldHeight);
            el.style.height = '';
            nextEl.style.height = '';
            nextEl.style.height = (oldHeight + 50).toString() + 'px';
          }
        }
      }
    },
    adjustCutsStyles: function() {
      var self = this;
      for (var i = 0; i < self.el.length; i++) {
        var el = self.el[i];
        if (el.classList.contains('with-cut-top')) {
          self.styleRule = self.styleSheet.insertRule('#' + el.id + ':before {' +
            'border-right-width: ' + el.clientWidth.toString() + 'px;' +
            'border-right-color: ' + window.getComputedStyle(el, false).backgroundColor +
            '}', self.styleRule + 1);
        }
        if (el.classList.contains('with-cut-bottom')) {
          self.styleRule = self.styleSheet.insertRule('#' + el.id + ':after {' +
            'border-left-width: ' + el.clientWidth.toString() + 'px;' +
            'border-left-color: ' + window.getComputedStyle(el, false).backgroundColor +
            '}', self.styleRule + 1);
        }
      }
    },
    updateCutsStyles: function() {
      var self = this;
      for (var i = 0; i < self.el.length; i++) {
        var el = self.el[i];
        if (el.classList.contains('with-cut-top')) {
          self.styleSheet.addRule('#' + el.id + ':before', 'border-right-width: ' + el.clientWidth.toString() + 'px');
        }
        if (el.classList.contains('with-cut-bottom')) {
          self.styleSheet.addRule('#' + el.id + ':after', 'border-left-width: ' + el.clientWidth.toString() + 'px');
        }
      }
    }
  }
  /*!
  Cardio handler for typewriters events
  */
  CARDIO.typewriter = {
    el: null,
    init: function() {
      var self = this;
      self.el = document.querySelectorAll('.typewriter');
      for (var i = 0; i < self.el.length; i++) {
        var el = self.el[i];
        var text = el.innerText;
        el.innerText = '';
        var typewriter = new Typewriter(el, {
          loop: false,
          blinkSpeed: 25,
        });
        typewriter.typeString(text).start();
      }
    }
  }
  /*!
  Cardio handler for typewriters events
  */
  CARDIO.contactForm = {
    el: null,
    init: function() {
      var self = this;
      self.el = document.querySelectorAll(".cardio-form")
      for (var i = 0; i < self.el.length; i++) {
        form = self.el[i];
      }
    },
    is_valid(form) {},
    submit(form) {}
  }
  CARDIO.cleanStreamFieldDOM = {
    el: null,
    init: function() {
      var self = this;
      self.el = document.querySelectorAll("p:empty")
      for (var i = 0; i < self.el.length; i++) {
        self.el[i].remove()
      }
    }
  }
  CARDIO.init();
})(jQuery)
