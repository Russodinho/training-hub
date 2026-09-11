# Front and back injury map

Implemented locally on /injuries. Keeps the original front image and adds body-silhouette-back.png. Both images are visible side by side; the summary stacks below at widths up to 800px. The left Achilles region appears only on the rear image, at native coordinates (377,1335), with ellipse radii (23,62). Right knee and left ankle remain on the front. Anatomical left is screen-right on the front and screen-left on the back. The previous dashed posterior projection is removed. Numbering, colors, latest pain selection and injury detail links are preserved.

Files: src/components/InjuryBodyMap.tsx; src/app/globals.css; public/training-hub-design/body-silhouette-back.png. Existing front: public/training-hub-design/body-silhouette.png.

Validated local localhost:3000 page at 1100x900, 390x844 and 320x800; screenshot evidence in screenshots/. No horizontal overflow detected. Desktop and narrow-phone screenshots visually inspected for anatomical side, image loading, labels and summary layout. npx tsc --noEmit passed. No production build, deployment or data changes.

Custom injuries still need explicit region mapping; adding a free-text back injury does not automatically position a highlight. Future structured view/region selection belongs in the injury data workflow. No hypothetical injury was added to user records for testing.

## Image generation provenance

Used the built-in image_gen tool in reference-edit mode. Original front image served as style/proportion reference. Initial output rendered a checkerboard rather than real alpha, so it was rejected. Final edit uses a navy background matching the diagram well; it is NOT represented as transparent. The original front asset is unchanged. Saved final image at public/training-hub-design/body-silhouette-back.png (1024x1536).

Initial prompt:

Use case: style-transfer. Asset type: transparent PNG rear-view body silhouette for Training Hub injury map. Input image is the exact front-view style and proportions reference. Create its matching BACK VIEW: same anonymous neutral adult anatomical mannequin, full body head to heels, upright straight-on orthographic posterior view, arms slightly out with fingers down, same scale, centered at x512 on a 1024x1536 canvas with head top about y55 and soles about y1460. Show back of head, shoulder blades, back muscles subtly, gluteal contours nonsexual neutral medical mannequin, back of knees, calves and clearly visible Achilles tendons and heels. Anatomical left is screen-left in this rear view. Preserve slate-blue body fill, subtle soft dimensional shading and fine pale blue rim outline of reference, with same understated styling. True transparent alpha background, not a black rectangle or checkerboard. No labels, letters, pins, highlights, pain regions, clothes, hair, props or text. Only change viewpoint from front to back; match original silhouette proportions and visual style closely.

Final corrective edit prompt:

Edit target: the attached rear-view mannequin. Keep the body anatomy, pose, dimensions, placement, slate-blue shading and thin pale-blue outline exactly unchanged. Replace ALL checkerboard and background texture with a perfectly uniform solid dark navy #14232d background. No grid, no pattern, no glow, no shadow in the background. This is a production injury-map asset. No labels, no text, no pain highlights. Preserve 1024x1536 canvas and entire body.
