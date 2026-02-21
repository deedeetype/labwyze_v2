// Blog Cards - Seamless Infinite Scroll with GSAP
gsap.registerPlugin(ScrollTrigger);

// Fade in cards gently on load
gsap.to(".card", { opacity: 1, delay: 0.1 });

let iteration = 0; // iteration counter for seamless looping
const spacing = 0.1; // spacing between card animations (stagger)
const snap = gsap.utils.snap(spacing); // snap playhead to card positions
const cards = gsap.utils.toArray('.cards li');
const seamlessLoop = buildSeamlessLoop(cards, spacing);
const scrub = gsap.to(seamlessLoop, {
  // smoothly scrub the playhead on the seamlessLoop timeline
  totalTime: 0,
  duration: 0.5,
  ease: "power3",
  paused: true
});

// ScrollTrigger to drive the animation
const trigger = ScrollTrigger.create({
  start: 0,
  onUpdate(self) {
    if (self.progress === 1 && self.direction > 0 && !self.wrapping) {
      wrapForward(self);
    } else if (self.progress < 1e-5 && self.direction < 0 && !self.wrapping) {
      wrapBackward(self);
    } else {
      scrub.vars.totalTime = snap((iteration + self.progress) * seamlessLoop.duration());
      scrub.invalidate().restart();
      self.wrapping = false;
    }
  },
  end: "+=3000",
  pin: ".gallery"
});

function wrapForward(trigger) {
  iteration++;
  trigger.wrapping = true;
  trigger.scroll(trigger.start + 1);
}

function wrapBackward(trigger) {
  iteration--;
  if (iteration < 0) {
    iteration = 9;
    seamlessLoop.totalTime(seamlessLoop.totalTime() + seamlessLoop.duration() * 10);
    scrub.pause();
  }
  trigger.wrapping = true;
  trigger.scroll(trigger.end - 1);
}

function scrubTo(totalTime) {
  let progress = (totalTime - seamlessLoop.duration() * iteration) / seamlessLoop.duration();
  if (progress > 1) {
    wrapForward(trigger);
  } else if (progress < 0) {
    wrapBackward(trigger);
  } else {
    trigger.scroll(trigger.start + progress * (trigger.end - trigger.start));
  }
}

// Button navigation
document.querySelector(".next").addEventListener("click", () => scrubTo(scrub.vars.totalTime + spacing));
document.querySelector(".prev").addEventListener("click", () => scrubTo(scrub.vars.totalTime - spacing));

function buildSeamlessLoop(items, spacing) {
  let overlap = Math.ceil(1 / spacing);
  let startTime = items.length * spacing + 0.5;
  let loopTime = (items.length + overlap) * spacing + 1;
  let rawSequence = gsap.timeline({ paused: true });
  let seamlessLoop = gsap.timeline({
    paused: true,
    repeat: -1,
    onRepeat() {
      this._time === this._dur && (this._tTime += this._dur - 0.01);
    }
  });
  
  let l = items.length + overlap * 2;
  let time = 0;
  let i, index, item;

  // Set initial state
  gsap.set(items, { xPercent: 400, opacity: 0, scale: 0 });

  // Create animations
  for (i = 0; i < l; i++) {
    index = i % items.length;
    item = items[index];
    time = i * spacing;
    
    rawSequence.fromTo(item, 
      { scale: 0, opacity: 0 }, 
      { scale: 1, opacity: 1, zIndex: 100, duration: 0.5, yoyo: true, repeat: 1, ease: "power1.in", immediateRender: false }, 
      time
    ).fromTo(item, 
      { xPercent: 400 }, 
      { xPercent: -400, duration: 1, ease: "none", immediateRender: false }, 
      time
    );
    
    i <= items.length && seamlessLoop.add("label" + i, time);
  }

  rawSequence.time(startTime);
  seamlessLoop.to(rawSequence, {
    time: loopTime,
    duration: loopTime - startTime,
    ease: "none"
  }).fromTo(rawSequence, 
    { time: overlap * spacing + 1 }, 
    { time: startTime, duration: startTime - (overlap * spacing + 1), immediateRender: false, ease: "none" }
  );

  return seamlessLoop;
}
