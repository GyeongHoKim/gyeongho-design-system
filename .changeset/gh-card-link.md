---
'@ghds/web-components': minor
---

`gh-card` gains `href`, `target` and `rel`. With a non-empty `href` the whole card renders as a link (`<a class="content" part="content">`): it is keyboard-focusable, shows a `comp.card.focus.ring` focus ring, darkens its sketch stroke to `comp.card.stroke.hover` on mouse hover and lifts like an `interactive` card. A `label` goes on the anchor instead of a host group. The plain card's sketch outline now paints with `comp.card.stroke.default` as intended (it previously inherited the body text colour).
