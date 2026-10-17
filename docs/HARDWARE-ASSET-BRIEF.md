# Hardware production brief

## Scope and delivery status

Keep all four existing scenarios: business workstation, architectural workstation, gaming PC, and instructor demonstration. Their requirements and component choices remain in `data/simulations.json`. `assets/pc-build-profiles.mjs` derives platform variants from that source and supplies compatibility checks and build-specific save identities. It is the migration foundation, not yet connected to the prototype renderer. No scenario is considered migrated just because it shares the prototype URL.

## First physical reference

Use Corsair 4000D Airflow, MSI B550-A PRO, Ryzen 5 5600X, and Noctua NH-U12S redux for the first detailed model review. This additional AM4 reference teaches a different socket mechanism from the retained AM5/Intel scenarios; it does not replace their component lists. Remaining exact memory/GPU/PSU/drive SKUs and BIOS support revision must be verified before declaring a complete reference configuration.

Verified manufacturer references:

- [Corsair case guide](https://assets.corsair.com/image/upload/v1684779868/corsairmedia/sys_master/productcontent/WW_4000D_4000D_Airflow_QSG_AB.pdf): 230 mm wide, 466 mm tall, 453 mm deep; maximum cooler height 170 mm and GPU length 360 mm. Final clearance still depends on installed fans/radiators and cable bend space.
- [MSI specifications](https://www.msi.com/Motherboard/B550-A-PRO/Specification): 305 × 244 mm ATX, nine mounting holes, AM4, DDR4. [Manual](https://download.msi.com/archive/mnu_exe/mb/B550-APRO_EN.pdf) printed pages 26–38 cover layout, socket, DIMMs and headers. Trace header positions from that board only; overall dimensions alone cannot establish connector coordinates.
- [AMD processor reference](https://www.amd.com/en/support/downloads/drivers.html/processors/ryzen/ryzen-5000-series/amd-ryzen-5-5600x.html): discrete graphics required. Motherboard display ports must not produce video with this CPU.
- [Noctua datasheet](https://cdn.noctua.at/media/noctua_nh_u12s_redux_infosheet_en_web.pdf): 158 × 125 × 71 mm including fan, AM4 support, factory-applied NT-H1. First installation must respect factory paste; manual application belongs to a clean-and-reapply service exercise. Do not teach adding more paste over the factory layer.

These sources are dimensional/procedural references, not licenses to redistribute manufacturer images or CAD.

## Required 3D delivery

Original or appropriately licensed GLB models; metres, Y up, with documented local origin and front direction. Record author, license, source, redistribution permission, alterations and exact SKU. No asset has yet been acquired or approved for this reference. The existing generated atlas is illustrative and must not be relabelled as this motherboard.

Case: separate glass panel, steel panel, front grille, filters, expansion covers, feet, drive trays, cable grommets and screws. Capture rear I/O aperture, actual standoff pattern, PSU mount and panel fasteners. Model interior wall thickness and cable compartment; inspect front, rear, sides, top and close range.

Board: separate PCB, nine mounting holes, actual rear ports, AM4 socket and lever, DIMM latches, PCIe latch, M.2 standoff/screw, keyed headers and silkscreen. AM4 uses a ZIF lever and CPU pins: never reuse an Intel load plate animation. AM5 and LGA1700 each need their own reference geometry and retention sequence.

CPU/cooler: pins and orientation corner, heat spreader, cold plate, heatpipes, fin stack, removable fan/clips, AM4 mounting hardware and actual fastening sequence. Socket pivots and cooler fastening points must match their hardware; the prototype's four generic cooler fasteners are not an accepted reference.

Export named empty nodes for each mating point, mounting point and rotation pivot. Supply collision volumes independently of detailed rendering meshes. Each connector needs type, key, pin pattern, mating direction and allowed insertion tolerance. Do not infer compatibility from visual proximity.

## Review gates

1. Inspect case/board/CPU/cooler from six directions and at socket/header close-up; compare dimensions and mounting alignment with the cited documentation.
2. Validate mechanisms, orientation, thermal-compound service sequence and collision clearances with an instructor.
3. Add exact remaining parts, connector endpoints, cable routing/bend constraints and physical/electrical/POST/boot checks.
4. Migrate existing scenarios individually with their actual platform models and isolated saved progress. Reuse a model only when the physical SKU is genuinely the same.

Passing compatibility unit tests does not pass any visual-quality gate. The live procedural renderer remains an engineering prototype until the asset and teaching reviews pass.

## Restored scenario planning

The simulator now opens a scenario planner using all four original entries in `data/simulations.json`. It includes every existing catalogue option, four independent DIMM slots, per-module prices, workload and compatibility feedback, budget totals, per-scenario local plans and JSON export. `node scripts/check-pc-planner.mjs` verifies viable plans in every scenario and mismatch handling.

The 3D workbench has an expanded inspection mode and a closer default camera. Exact selected SKUs are not yet rendered there. The planner explicitly links to the retained 2D assembly workflow and states that its saves are separate. Planning checks never award scenario completion or certify POST/physical clearance. Case choice is not yet in the retained catalogue. All four scenarios are discoverable again in the lab explorer, alongside the separate 3D reference.
