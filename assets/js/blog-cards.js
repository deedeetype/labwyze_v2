// Blog Cards - Button-driven carousel with GSAP
(function() {
  var cards = gsap.utils.toArray('.cards .card');
  if (!cards.length) return;

  var total = cards.length;
  var current = 0;
  var animating = false;

  // Positions: pixel offsets from center and scale/opacity
  // Shows 5 cards: far-left, left, center, right, far-right
  var slots = [
    { left: '5%',  scale: 0.6, opacity: 0.4, zIndex: 1 },  // -2 far left
    { left: '20%', scale: 0.8, opacity: 0.7, zIndex: 3 },  // -1 left
    { left: '50%', scale: 1,   opacity: 1,   zIndex: 5 },  //  0 center
    { left: '80%', scale: 0.8, opacity: 0.7, zIndex: 3 },  //  1 right
    { left: '95%', scale: 0.6, opacity: 0.4, zIndex: 1 },  //  2 far right
  ];

  function getOffset(index, center) {
    var diff = index - center;
    if (diff > Math.floor(total / 2)) diff -= total;
    if (diff < -Math.floor(total / 2)) diff += total;
    return diff;
  }

  function applyPosition(card, offset, animate) {
    var slotIndex = offset + 2; // map -2..2 to 0..4
    if (slotIndex < 0 || slotIndex > 4) {
      if (animate) {
        gsap.to(card, { scale: 0, opacity: 0, zIndex: 0, duration: 0.4, ease: 'power2.inOut' });
      } else {
        gsap.set(card, { scale: 0, opacity: 0, zIndex: 0 });
      }
      return;
    }
    var s = slots[slotIndex];
    var props = {
      left: s.left,
      xPercent: -50,
      y: '-50%',
      scale: s.scale,
      opacity: s.opacity,
      zIndex: s.zIndex
    };
    if (animate) {
      gsap.to(card, Object.assign(props, { duration: 0.5, ease: 'power2.inOut' }));
    } else {
      gsap.set(card, props);
    }
  }

  function layout(animate) {
    var onComplete = animate ? function() { animating = false; } : null;
    cards.forEach(function(card, i) {
      var offset = getOffset(i, current);
      applyPosition(card, offset, animate);
    });
    if (animate) {
      setTimeout(function() { animating = false; }, 550);
    }
  }

  // Init
  layout(false);

  function goTo(dir) {
    if (animating) return;
    animating = true;
    current = ((current + dir) % total + total) % total;
    layout(true);
  }

  document.querySelector('.gallery-nav .next').addEventListener('click', function() { goTo(1); });
  document.querySelector('.gallery-nav .prev').addEventListener('click', function() { goTo(-1); });
})();
