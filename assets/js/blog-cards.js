// Blog Cards - Button-driven carousel with GSAP (no ScrollTrigger pin)
(function() {
  const cards = gsap.utils.toArray('.cards .card');
  if (!cards.length) return;

  const total = cards.length;
  let current = 0;
  let animating = false;

  // Position config: offsets from center
  // positions[0] = center (active), 1 = right, 2 = far right, -1 = left, -2 = far left
  function getPositions() {
    return {
      '-2': { xPercent: -220, scale: 0.55, opacity: 0.3, zIndex: 1 },
      '-1': { xPercent: -130, scale: 0.75, opacity: 0.6, zIndex: 2 },
       '0': { xPercent: -50,  scale: 1,    opacity: 1,   zIndex: 5 },
       '1': { xPercent: 30,   scale: 0.75, opacity: 0.6, zIndex: 2 },
       '2': { xPercent: 120,  scale: 0.55, opacity: 0.3, zIndex: 1 },
    };
  }

  // Set initial positions
  function layout() {
    const pos = getPositions();
    cards.forEach(function(card, i) {
      var offset = getOffset(i, current, total);
      if (offset < -2 || offset > 2) {
        gsap.set(card, { xPercent: 0, left: '50%', top: '50%', y: '-50%', scale: 0, opacity: 0, zIndex: 0, position: 'absolute' });
      } else {
        var p = pos[String(offset)];
        gsap.set(card, {
          left: p.xPercent + '%',
          top: '50%',
          y: '-50%',
          xPercent: 0,
          scale: p.scale,
          opacity: p.opacity,
          zIndex: p.zIndex,
          position: 'absolute'
        });
      }
    });
  }

  function getOffset(index, center, total) {
    var diff = index - center;
    // Wrap around for circular
    if (diff > Math.floor(total / 2)) diff -= total;
    if (diff < -Math.floor(total / 2)) diff += total;
    return diff;
  }

  function animateTo(newCurrent) {
    if (animating) return;
    animating = true;
    current = ((newCurrent % total) + total) % total;
    
    var pos = getPositions();
    var tl = gsap.timeline({
      onComplete: function() { animating = false; }
    });

    cards.forEach(function(card, i) {
      var offset = getOffset(i, current, total);
      if (offset < -2 || offset > 2) {
        tl.to(card, { scale: 0, opacity: 0, zIndex: 0, duration: 0.5, ease: 'power2.inOut' }, 0);
      } else {
        var p = pos[String(offset)];
        tl.to(card, {
          left: p.xPercent + '%',
          scale: p.scale,
          opacity: p.opacity,
          zIndex: p.zIndex,
          duration: 0.5,
          ease: 'power2.inOut'
        }, 0);
      }
    });
  }

  // Init
  layout();

  // Buttons
  document.querySelector('.gallery-nav .next').addEventListener('click', function() {
    animateTo(current + 1);
  });
  document.querySelector('.gallery-nav .prev').addEventListener('click', function() {
    animateTo(current - 1);
  });
})();
