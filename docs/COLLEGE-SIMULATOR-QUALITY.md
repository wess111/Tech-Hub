# College-level PC assembly simulator: release standard

## Current status

The 3D implementation is an interaction prototype. It demonstrates camera orbit, drag placement, keyed orientation, socket and clip operations, thermal-compound deposition, connector-to-connector routing, and save/restore. The procedural hardware is not approved as the final teaching artwork.

The user explicitly requires realistic, college-level hardware. A successful interaction test does not satisfy that visual or instructional requirement.

## Reference build before expansion

Choose one documented case, motherboard, CPU, cooler, memory kit, GPU, PSU and drive combination. Match its manuals and physical dimensions. Do not mix connector positions from unrelated boards. If the college identifies its lab hardware, use that as the reference; otherwise select a common serviceable desktop platform.

## Visual acceptance

- Recognizable physical hardware from front, rear, both sides, top and close inspection.
- True dimensional relationships: board outline, standoffs, I/O opening, CPU socket, DIMM spacing, PCIe slots, component clearance and drive mounts.
- Beveled metal/plastic surfaces, realistic material response, appropriate labels, and readable inspection lighting.
- Detailed keyed connectors with correct pin counts and locking features, not interchangeable cubes.
- Separate movable parts for socket retention, memory latches, PCIe retention, removable brackets, panels and fasteners.
- Cable routes lie within the chassis/routing compartment and meet their actual mating sockets.
- Close-ups reveal enough detail to explain correct orientation and assembly, rather than merely enlarging a simplified shape.

## Asset acquisition and authoring

Use appropriately licensed high-detail models or commissioned artwork. Record author, source URL, license, permitted redistribution, modifications, dimensions and attribution for every asset. Public product photographs and freely viewable 3D previews are not automatically reusable model downloads.

Manufacturer mechanical references can help establish dimensions. Framework publishes desktop mechanical documentation under CC BY 4.0 at https://github.com/FrameworkComputer/Framework-Desktop, but its Mini-ITX platform is not a drop-in representation of an ATX board with a removable desktop CPU. Do not substitute it without explicitly changing the reference platform.

Each final component should be supplied as a browser-suitable glTF/GLB asset with correct scale and pivot points. Export movable mechanisms as separate named nodes. Keep the socket and mounting anchors independent of visual artwork, then verify each imported model against them. Establish geometry/texture budgets through measurements on representative student devices.

## Instructional acceptance

- Preserve safe assembly order and explain errors using physical evidence.
- Require CPU orientation and correct keyed socket placement.
- Demonstrate appropriate thermal compound placement, amount and cooler contact; label simplified coverage behavior honestly.
- Identify connector types and test correct mating; distinguish EPS and PCIe power leads.
- Separate physical fit, electrical operation, POST, boot-device detection and full assembly completion.
- Provide guided practice first and independent fault scenarios after the reference build is verified.
- Support keyboard alternatives and clear labels without making mouse dragging the sole route to completion.
- Match procedures to manufacturer guidance and have a subject-matter instructor validate the final learning flow before release.

## Next review gate

Review one accurate case/motherboard/CPU/cooler assembly at close range and from the rear. Approve the visual and mechanical quality of that slice before expanding the component catalog or presenting the simulator as college-ready.
