// Genie Effect - Originally by Hakan Bilgin (c) 2013, Refactored 2024
(function () {
  "use strict";

  // Calculate element's absolute position and dimensions
  function getElementBounds(el) {
    const bounds = { w: el.offsetWidth, h: el.offsetHeight, t: 0, l: 0 };

    while (el && el.nodeName !== "BODY") {
      if (el === document.firstChild) return null;
      bounds.t += el.offsetTop - el.scrollTop;
      bounds.l += el.offsetLeft - el.scrollLeft;
      el = el.offsetParent;
    }

    return bounds;
  }

  // Add transition end listener with vendor prefixes
  function onTransitionEnd(el, callback) {
    const prefixes = ["webkit", "moz", "MS", "o", ""];
    prefixes.forEach((prefix) => {
      const eventName = prefix ? prefix + "TransitionEnd" : "transitionend";
      el.addEventListener(eventName, callback, false);
    });
  }

  // Create a horizontal slice element
  function createSlice(top, height, width, left, bgPosition) {
    const div = document.createElement("div");
    div.className = "genie-step";
    div.style.top = top + "px";
    div.style.height = height + "px";
    div.style.width = width + "px";
    div.style.left = left + "px";
    div.style.backgroundPosition = bgPosition;
    return div;
  }

  // Calculate sine-wave distortion for genie curve
  // startCounter: 4.75 for expand, 4.7 for collapse
  function calculateSinPosition(index, stepCount, startCounter, multiplier, offset, subtract) {
    const increase = Math.PI / stepCount;
    const counter = startCounter + index * increase;
    const value = Math.sin(counter) * multiplier;
    return Math.ceil(subtract ? value - offset : value + offset);
  }

  // Remove all child nodes from an element
  function clearChildren(el) {
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }
  }

  const genie = {
    el: null,
    active: false,
    collapsing: false,
    processing: false,
    next: null,
    timer: null,
    stepHeight: 1,

    init() {
      const thumbs = document.querySelectorAll(".dock img");

      thumbs.forEach((thumb) => {
        const src = thumb.getAttribute("data-src") || thumb.src;
        const width = thumb.getAttribute("data-width") || thumb.naturalWidth;
        const height = thumb.getAttribute("data-height") || thumb.naturalHeight;

        thumb.setAttribute("data-src", src);
        thumb.setAttribute("data-width", width);
        thumb.setAttribute("data-height", height);
        thumb.style.backgroundImage = "url(" + src + ")";
        thumb.style.height = thumb.height + "px";
        thumb.src =
          "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
      });

      this.el = document.body.appendChild(document.createElement("div"));
      document.addEventListener("click", this.handleEvent.bind(this), false);

      // Initialize text animation if LS exists
      if (typeof LS !== "undefined") {
        LS({ id: "genie_text" });
      }
    },

    handleEvent(event) {
      if (event.type === "click") {
        this.handleClick(event);
      } else if (
        event.type === "transitionend" ||
        event.type === "webkitTransitionEnd"
      ) {
        this.handleTransitionEnd(event);
      }
    },

    handleClick(event) {
      const target = event.target;

      if (target === this.active) return;
      if (this.collapsing) return;

      if (this.processing) {
        clearTimeout(this.timer);
      }

      if (target.classList.contains("genie-thumb")) {
        this.processing = true;

        if (this.active) {
          this.next = target;
          this.collapse();
          return;
        }

        this.el.style.display = "block";
        this.expand(target);
      }

      if (target.classList.contains("genie")) {
        this.collapse();
      }
    },

    handleTransitionEnd(event) {
      const source = this.el;
      const thumb = source.thumbEl;
      const sourceBounds = getElementBounds(source);
      const thumbBounds = getElementBounds(thumb);
      const steps = Array.from(source.childNodes);

      switch (event.propertyName) {
        case "left":
          if (source.classList.contains("collapse")) {
            const diffT = thumbBounds.t + sourceBounds.t - 100;
            const stepH = steps[0] ? steps[0].offsetHeight : this.stepHeight;

            steps.forEach((step, i) => {
              step.style.backgroundPosition = "0px " + (diffT + i - i * stepH) + "px";
            });

            thumb.style.backgroundPosition = "0px 0px";
            source.classList.add("change-pace");
            source.style.height = "0px";
          }
          break;

        case "background-position":
        case "background-position-x":
        case "background-position-y":
          if (source.classList.contains("expand")) {
            steps.forEach((step) => {
              step.style.left = "0px";
              step.style.width = sourceBounds.w + "px";
            });
            source.classList.add("fan");
          } else {
            thumb.classList.remove("paced-thumb");
            thumb.classList.add("genie-thumb");
            source.classList.remove("change-pace");
            source.classList.remove("collapse");
            clearChildren(source);

            this.collapsing = false;
            this.active = false;

            if (this.next) {
              this.expand(this.next);
              this.next = null;
            }
          }
          break;

        case "width":
          if (source.classList.contains("fan")) {
            source.style.backgroundPosition = "0px 0px";
            setTimeout(function () {
              source.classList.remove("fan");
              source.classList.remove("expand");
              clearChildren(source);
            }, 0);
            this.active = thumb;
            this.processing = false;
          }
          break;
      }
    },

    setupTarget(thumb, thumbBounds) {
      const margin = 100;
      const viewportWidth =
        Math.max(
          document.documentElement.clientWidth,
          document.body.scrollWidth,
          document.documentElement.scrollWidth,
          document.body.offsetWidth,
          document.documentElement.offsetWidth
        ) - margin * 2;
      const viewportHeight = thumbBounds.t - margin * 2;

      const imgWidth = +thumb.getAttribute("data-width");
      const imgHeight = +thumb.getAttribute("data-height");
      const aspectRatio = imgWidth / imgHeight;

      var targetWidth = viewportWidth;
      var targetHeight = viewportWidth / aspectRatio;

      if (targetHeight > viewportHeight) {
        targetHeight = viewportHeight;
        targetWidth = viewportHeight * aspectRatio;
      }

      const target = this.el;
      target.style.display = "block";
      target.style.width = targetWidth + "px";
      target.style.height = targetHeight + "px";
      target.style.top = margin * 1.2 + "px";
      target.style.left = margin + Math.floor((viewportWidth - targetWidth) / 2) + "px";
      target.style.backgroundPosition = "0px -9999px";
      target.style.backgroundImage = "url(" + thumb.getAttribute("data-src") + ")";
      target.className = "genie";
      target.thumbEl = thumb;

      return getElementBounds(target);
    },

    expand(thumb) {
      const thumbBounds = getElementBounds(thumb);
      const targetBounds = this.setupTarget(thumb, thumbBounds);
      const stepCount = Math.ceil((thumbBounds.t - targetBounds.t) / this.stepHeight);
      const diffT = thumbBounds.t - targetBounds.t;
      const radiansLeft = Math.floor((thumbBounds.l - targetBounds.l) / 2);
      const radiansWidth = Math.floor((thumbBounds.w - targetBounds.w) / 2);
      const rwOffset = radiansWidth - thumbBounds.w;

      // Create slices with initial curved positions
      const fragment = document.createDocumentFragment();

      for (var i = 0; i < stepCount; i++) {
        const top = i * this.stepHeight;
        const left = calculateSinPosition(i, stepCount, 4.75, radiansLeft, radiansLeft, false);
        const width = calculateSinPosition(i, stepCount, 4.75, radiansWidth, rwOffset, true);
        const bgY = diffT - top;

        fragment.appendChild(
          createSlice(top, this.stepHeight + 1, width, left, "0px " + bgY + "px")
        );
      }

      clearChildren(this.el);
      this.el.appendChild(fragment);

      const lastSlice = this.el.lastChild;
      if (lastSlice) {
        onTransitionEnd(lastSlice, this.handleEvent.bind(this));
      }

      // Trigger animation after brief delay
      const self = this;
      setTimeout(function () {
        const steps = self.el.childNodes;

        for (var j = 0; j < steps.length; j++) {
          const bgY = ((j * self.stepHeight - 2) / (targetBounds.h - self.stepHeight)) * 100;
          steps[j].style.backgroundPosition = "0% " + bgY + "%";
        }

        thumb.style.backgroundPosition = "0 -" + (thumbBounds.h + 10) + "px";
        self.el.classList.add("expand");
      }, 100);
    },

    collapse() {
      this.collapsing = true;
      this.processing = true;

      const source = this.el;
      const sourceBounds = getElementBounds(source);
      const thumb = source.thumbEl;
      const thumbBounds = getElementBounds(thumb);
      const stepCount = Math.ceil((thumbBounds.t - sourceBounds.t) / this.stepHeight);

      source.className = "genie";
      source.style.backgroundPosition = "0 -9999px";

      thumb.classList.remove("genie-thumb");
      thumb.classList.add("paced-thumb");

      // Create slices at current (expanded) positions
      const fragment = document.createDocumentFragment();

      for (var i = 0; i < stepCount; i++) {
        const top = i * this.stepHeight;
        const bgY = ((top + this.stepHeight) / sourceBounds.h) * 100 + "%";

        fragment.appendChild(
          createSlice(top, this.stepHeight + 1, sourceBounds.w, 0, "0px " + bgY)
        );
      }

      clearChildren(source);
      source.appendChild(fragment);
      source.classList.add("collapse");

      // Animate to curved positions
      const self = this;
      this.timer = setTimeout(function () {
        const steps = Array.from(source.childNodes);
        const radiansLeft = Math.floor((thumbBounds.l - sourceBounds.l) / 2);
        const radiansWidth = Math.floor((thumbBounds.w - sourceBounds.w) / 2);
        const rwOffset = radiansWidth - thumbBounds.w;

        steps.forEach(function (step, i) {
          step.style.left = calculateSinPosition(i, stepCount, 4.7, radiansLeft, radiansLeft, false) + "px";
          step.style.width = calculateSinPosition(i, stepCount, 4.7, radiansWidth, rwOffset, true) + "px";
        });

        const lastSlice = steps[steps.length - 1];
        if (lastSlice) {
          onTransitionEnd(lastSlice, self.handleEvent.bind(self));
        }
      }, 100);
    },
  };

  window.onload = function () {
    genie.init();
  };
})();
