/**
 * HEADLINERS — A Festival-Building Board Game Prototype
 * =====================================================
 * Build the biggest and best festival over 4 years (rounds).
 * 2–5 players compete to sell the most tickets through artist bookings,
 * amenity placement, lineup curation, and fame growth.
 *
 * Core mechanics:
 *  - Hex-grid festival board (13×13) with stage placement
 *  - 1 action per turn: Pick Amenity (dice), Move Amenity, or Book/Reserve Artist
 *  - Artists have costs (fame + amenities), genres, and ticket-sales value
 *  - 3 artists per stage; the 3rd is the Headliner (effect triggers twice)
 *  - First full lineup bonus: +5 tickets
 *  - Campsites generate 2 tickets each per year
 *  - Fame level 3 unlocks new stage placement between rounds
 *  - After 4 years, highest tickets sold wins (tiebreak: highest fame)
 *  - Final tickets are shown ×100 for a festival-appropriate headline number
 */

import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { createPortal } from "react-dom";

// ═══════════════════════════════════════════════════════════
// ARTIST DATA (75 artists from spreadsheet)
// ═══════════════════════════════════════════════════════════
const ALL_ARTISTS = [{"name": "Kara Okay", "fame": 0, "vp": 0, "campCost": 0, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Pop", "tickets": 1, "effect": "All players draw 1 artist from the artist deck", "genreMatchEffect": ""}, {"name": "Sadchild", "fame": 0, "vp": 0, "campCost": 0, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Pop", "tickets": 1, "effect": "Play another artist from your hand if you can afford them", "genreMatchEffect": ""}, {"name": "Mikerophone", "fame": 0, "vp": 0, "campCost": 0, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Pop", "tickets": 1, "effect": "", "genreMatchEffect": ""}, {"name": "Rebecca Black", "fame": 1, "vp": 0, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Pop", "tickets": 2, "effect": "", "genreMatchEffect": ""}, {"name": "Jamiroquai", "fame": 1, "vp": 0, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Pop, Funk", "tickets": 1, "effect": "[HIGHEST_FAME] +1 Fame", "genreMatchEffect": ""}, {"name": "Jonas Brothers", "fame": 1, "vp": 0, "campCost": 0, "securityCost": 1, "cateringCost": 0, "portalooCost": 1, "genre": "Pop", "tickets": 2, "effect": "[HIGHEST_FAME] +1 ticket(s)", "genreMatchEffect": ""}, {"name": "Remi Wolf", "fame": 1, "vp": 0, "campCost": 0, "securityCost": 1, "cateringCost": 1, "portalooCost": 0, "genre": "Pop", "tickets": 2, "effect": "", "genreMatchEffect": ""}, {"name": "Maroon 5", "fame": 1, "vp": 0, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Pop", "tickets": 2, "effect": "Draw 2 artists from the deck or pool", "genreMatchEffect": ""}, {"name": "Dua Lipa", "fame": 2, "vp": 0, "campCost": 1, "securityCost": 1, "cateringCost": 1, "portalooCost": 0, "genre": "Pop", "tickets": 3, "effect": "", "genreMatchEffect": ""}, {"name": "Scissor Sisters", "fame": 2, "vp": 0, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 1, "genre": "Pop", "tickets": 3, "effect": "", "genreMatchEffect": ""}, {"name": "Chappell Roan", "fame": 2, "vp": 0, "campCost": 1, "securityCost": 2, "cateringCost": 0, "portalooCost": 1, "genre": "Pop", "tickets": 3, "effect": "", "genreMatchEffect": ""}, {"name": "Clairo", "fame": 2, "vp": 0, "campCost": 1, "securityCost": 1, "cateringCost": 1, "portalooCost": 1, "genre": "Pop, Indie", "tickets": 1, "effect": "[HIGHEST_FAME] Play another artist from your hand if you can afford them", "genreMatchEffect": ""}, {"name": "RAYE", "fame": 2, "vp": 0, "campCost": 1, "securityCost": 2, "cateringCost": 1, "portalooCost": 0, "genre": "Pop", "tickets": 3, "effect": "", "genreMatchEffect": ""}, {"name": "Nelly", "fame": 3, "vp": 0, "campCost": 1, "securityCost": 1, "cateringCost": 1, "portalooCost": 1, "genre": "Pop, Hip Hop", "tickets": 3, "effect": "[HIGHEST_FAME] +1 Fame", "genreMatchEffect": ""}, {"name": "Harry Styles", "fame": 3, "vp": 0, "campCost": 1, "securityCost": 2, "cateringCost": 0, "portalooCost": 1, "genre": "Pop", "tickets": 3, "effect": "", "genreMatchEffect": ""}, {"name": "Billie Eilish", "fame": 4, "vp": 0, "campCost": 1, "securityCost": 2, "cateringCost": 0, "portalooCost": 1, "genre": "Pop", "tickets": 3, "effect": "", "genreMatchEffect": ""}, {"name": "Beyonce", "fame": 4, "vp": 0, "campCost": 1, "securityCost": 2, "cateringCost": 1, "portalooCost": 1, "genre": "Pop", "tickets": 4, "effect": "[HIGHEST_FAME] Draw 2 artists from the deck or pool", "genreMatchEffect": ""}, {"name": "Olivia Dean", "fame": 4, "vp": 0, "campCost": 1, "securityCost": 3, "cateringCost": 1, "portalooCost": 0, "genre": "Pop", "tickets": 4, "effect": "", "genreMatchEffect": ""}, {"name": "Coldplay", "fame": 5, "vp": 0, "campCost": 1, "securityCost": 3, "cateringCost": 1, "portalooCost": 1, "genre": "Pop, Rock", "tickets": 6, "effect": "Year End: For every 12 tickets before Year End \u2014 '+1 ticket(s)", "genreMatchEffect": ""}, {"name": "Lady Gaga", "fame": 5, "vp": 0, "campCost": 2, "securityCost": 2, "cateringCost": 1, "portalooCost": 1, "genre": "Pop, Electronic", "tickets": 6, "effect": "[HIGHEST_FAME] +3 ticket(s) per lower fame artist on this stage", "genreMatchEffect": ""}, {"name": "Sitting Ducks", "fame": 0, "vp": 0, "campCost": 0, "securityCost": 0, "cateringCost": 0, "portalooCost": 1, "genre": "Rock", "tickets": 1, "effect": "All players draw 1 artist from the artist deck", "genreMatchEffect": ""}, {"name": "Beabadoobee", "fame": 0, "vp": 0, "campCost": 0, "securityCost": 0, "cateringCost": 0, "portalooCost": 1, "genre": "Rock", "tickets": 1, "effect": "Remove a fame from the amenity dice (if available). +1 Fame", "genreMatchEffect": ""}, {"name": "Limp Bizkit", "fame": 0, "vp": 0, "campCost": 0, "securityCost": 0, "cateringCost": 0, "portalooCost": 1, "genre": "Rock", "tickets": 1, "effect": "", "genreMatchEffect": ""}, {"name": "No Doubt", "fame": 1, "vp": 0, "campCost": 0, "securityCost": 1, "cateringCost": 0, "portalooCost": 1, "genre": "Rock", "tickets": 2, "effect": "Remove an amenity from the amenity dice. +2 ticket(s)", "genreMatchEffect": ""}, {"name": "Vampire Weekend", "fame": 1, "vp": 0, "campCost": 0, "securityCost": 0, "cateringCost": 1, "portalooCost": 1, "genre": "Rock", "tickets": 2, "effect": "", "genreMatchEffect": ""}, {"name": "The Darkness", "fame": 1, "vp": 0, "campCost": 1, "securityCost": 0, "cateringCost": 0, "portalooCost": 1, "genre": "Rock", "tickets": 2, "effect": "Draw 2 artists from the deck or pool", "genreMatchEffect": ""}, {"name": "Royal Blood", "fame": 1, "vp": 0, "campCost": 1, "securityCost": 0, "cateringCost": 0, "portalooCost": 1, "genre": "Rock", "tickets": 2, "effect": "", "genreMatchEffect": ""}, {"name": "Heart", "fame": 1, "vp": 0, "campCost": 1, "securityCost": 0, "cateringCost": 0, "portalooCost": 1, "genre": "Rock, Indie", "tickets": 2, "effect": "Remove a campsite from the amenity dice (if available). +2 ticket(s)", "genreMatchEffect": ""}, {"name": "Wolf Alice", "fame": 2, "vp": 0, "campCost": 1, "securityCost": 0, "cateringCost": 1, "portalooCost": 1, "genre": "Rock, Indie", "tickets": 0, "effect": "Play another artist from your hand if you can afford them", "genreMatchEffect": ""}, {"name": "Wet Leg", "fame": 2, "vp": 0, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 1, "genre": "Rock", "tickets": 3, "effect": "", "genreMatchEffect": ""}, {"name": "Blondie", "fame": 2, "vp": 0, "campCost": 1, "securityCost": 0, "cateringCost": 0, "portalooCost": 2, "genre": "Rock", "tickets": 3, "effect": "", "genreMatchEffect": ""}, {"name": "Rage Against the Machine", "fame": 2, "vp": 0, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 2, "genre": "Rock, Funk", "tickets": 0, "effect": "Remove a stage from the amenity dice (if available). Play another artist from your hand if you can afford them", "genreMatchEffect": ""}, {"name": "Beastie Boys", "fame": 3, "vp": 0, "campCost": 1, "securityCost": 0, "cateringCost": 1, "portalooCost": 2, "genre": "Rock, Hip Hop", "tickets": 1, "effect": "", "genreMatchEffect": ""}, {"name": "David Bowie", "fame": 3, "vp": 0, "campCost": 1, "securityCost": 1, "cateringCost": 1, "portalooCost": 1, "genre": "Rock", "tickets": 4, "effect": "", "genreMatchEffect": ""}, {"name": "Slipknot", "fame": 3, "vp": 0, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 2, "genre": "Rock", "tickets": 4, "effect": "", "genreMatchEffect": ""}, {"name": "Olivia Rodrigo", "fame": 3, "vp": 0, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 3, "genre": "Rock, Pop", "tickets": 4, "effect": "[TEMPT] +1 ticket(s)", "genreMatchEffect": ""}, {"name": "Radiohead", "fame": 4, "vp": 0, "campCost": 1, "securityCost": 0, "cateringCost": 2, "portalooCost": 2, "genre": "Rock, Electronic", "tickets": 4, "effect": "", "genreMatchEffect": ""}, {"name": "Arctic Monkeys", "fame": 4, "vp": 0, "campCost": 1, "securityCost": 1, "cateringCost": 1, "portalooCost": 2, "genre": "Rock", "tickets": 4, "effect": "Draw 2 artists from the deck or pool", "genreMatchEffect": ""}, {"name": "Foo Fighters", "fame": 5, "vp": 0, "campCost": 1, "securityCost": 1, "cateringCost": 1, "portalooCost": 3, "genre": "Rock", "tickets": 6, "effect": "Year End: For every 3 amenities you own \u2014 +2 ticket(s)", "genreMatchEffect": ""}, {"name": "Fleetwood Mac", "fame": 5, "vp": 0, "campCost": 2, "securityCost": 1, "cateringCost": 1, "portalooCost": 2, "genre": "Rock", "tickets": 7, "effect": "", "genreMatchEffect": ""}, {"name": "Lil Angry", "fame": 0, "vp": 0, "campCost": 0, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Hip Hop", "tickets": 0, "effect": "Play another artist from your hand if you can afford them", "genreMatchEffect": ""}, {"name": "Loosey Goosey", "fame": 0, "vp": 0, "campCost": 0, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Hip Hop, Pop", "tickets": 1, "effect": "", "genreMatchEffect": ""}, {"name": "Knucks", "fame": 0, "vp": 0, "campCost": 0, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Hip Hop", "tickets": 1, "effect": "", "genreMatchEffect": ""}, {"name": "Eve", "fame": 1, "vp": 0, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Hip Hop", "tickets": 0, "effect": "You may remove 1 Catering Van of your choice from your festival. +3 ticket(s) and draw up to 2 artists from the deck", "genreMatchEffect": ""}, {"name": "KAYTRANADA", "fame": 1, "vp": 0, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Hip Hop, Electronic", "tickets": 2, "effect": "", "genreMatchEffect": ""}, {"name": "Lil Dicky", "fame": 1, "vp": 0, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Hip Hop", "tickets": 2, "effect": "+1 amenity of your choice. Place it this turn", "genreMatchEffect": ""}, {"name": "Salt-N-Pepa", "fame": 1, "vp": 0, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Hip Hop", "tickets": 2, "effect": "", "genreMatchEffect": ""}, {"name": "Ja Rule", "fame": 1, "vp": 0, "campCost": 0, "securityCost": 1, "cateringCost": 1, "portalooCost": 0, "genre": "Hip Hop", "tickets": 2, "effect": "", "genreMatchEffect": ""}, {"name": "Ms Banks", "fame": 1, "vp": 0, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Hip Hop", "tickets": 1, "effect": "You may remove 2 amenities of your choice from your festival. Play another artist from your hand for free. Their effect does not activate", "genreMatchEffect": ""}, {"name": "Doja Cat", "fame": 2, "vp": 0, "campCost": 1, "securityCost": 1, "cateringCost": 1, "portalooCost": 0, "genre": "Hip Hop", "tickets": 3, "effect": "", "genreMatchEffect": ""}, {"name": "De La Soul", "fame": 2, "vp": 0, "campCost": 0, "securityCost": 1, "cateringCost": 1, "portalooCost": 1, "genre": "Hip Hop", "tickets": 3, "effect": "You may remove 1 amenity of your choice from your festival. +3 ticket(s)", "genreMatchEffect": ""}, {"name": "Snoop Dogg", "fame": 2, "vp": 0, "campCost": 1, "securityCost": 1, "cateringCost": 1, "portalooCost": 0, "genre": "Hip Hop, Funk", "tickets": 3, "effect": "+1 Fame", "genreMatchEffect": ""}, {"name": "Loyle Carner", "fame": 2, "vp": 0, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 1, "genre": "Hip Hop, Rock", "tickets": 3, "effect": "", "genreMatchEffect": ""}, {"name": "Little Simz", "fame": 3, "vp": 0, "campCost": 1, "securityCost": 1, "cateringCost": 1, "portalooCost": 1, "genre": "Hip Hop, Indie", "tickets": 4, "effect": "", "genreMatchEffect": ""}, {"name": "Dave", "fame": 3, "vp": 0, "campCost": 1, "securityCost": 2, "cateringCost": 1, "portalooCost": 0, "genre": "Hip Hop", "tickets": 4, "effect": "+2 ticket(s)", "genreMatchEffect": ""}, {"name": "Missy Elliott", "fame": 4, "vp": 0, "campCost": 1, "securityCost": 3, "cateringCost": 1, "portalooCost": 0, "genre": "Hip Hop", "tickets": 5, "effect": "You may remove 1 security of your choice from your festival. +5 ticket(s) and draw 1 artist from the pool", "genreMatchEffect": ""}, {"name": "Lauryn Hill", "fame": 4, "vp": 0, "campCost": 2, "securityCost": 2, "cateringCost": 1, "portalooCost": 0, "genre": "Hip Hop", "tickets": 5, "effect": "", "genreMatchEffect": ""}, {"name": "Nas", "fame": 4, "vp": 0, "campCost": 2, "securityCost": 2, "cateringCost": 1, "portalooCost": 0, "genre": "Hip Hop", "tickets": 5, "effect": "", "genreMatchEffect": ""}, {"name": "Kendrick Lamar", "fame": 5, "vp": 0, "campCost": 2, "securityCost": 2, "cateringCost": 1, "portalooCost": 1, "genre": "Hip Hop", "tickets": 6, "effect": "Year End: For each security you own \u2014 +2 ticket(s)", "genreMatchEffect": ""}, {"name": "Eminem", "fame": 5, "vp": 0, "campCost": 2, "securityCost": 3, "cateringCost": 1, "portalooCost": 0, "genre": "Hip Hop", "tickets": 6, "effect": "[SELECT_HEADLINER] +X ticket(s)", "genreMatchEffect": ""}, {"name": "CRUEL MISTRESS", "fame": 0, "vp": 0, "campCost": 1, "securityCost": 0, "cateringCost": 0, "portalooCost": 0, "genre": "Electronic", "tickets": 0, "effect": "Draw 2 artists from the deck or pool", "genreMatchEffect": ""}, {"name": "808 DYLAN", "fame": 0, "vp": 0, "campCost": 1, "securityCost": 0, "cateringCost": 0, "portalooCost": 0, "genre": "Electronic", "tickets": 2, "effect": "", "genreMatchEffect": ""}, {"name": "Horsegiirl", "fame": 0, "vp": 0, "campCost": 1, "securityCost": 0, "cateringCost": 0, "portalooCost": 0, "genre": "Electronic", "tickets": 2, "effect": "If Headliner: +2 ticket(s)", "genreMatchEffect": ""}, {"name": "Grimes", "fame": 1, "vp": 0, "campCost": 1, "securityCost": 0, "cateringCost": 0, "portalooCost": 1, "genre": "Electronic", "tickets": 3, "effect": "", "genreMatchEffect": ""}, {"name": "FISHER", "fame": 1, "vp": 0, "campCost": 1, "securityCost": 0, "cateringCost": 1, "portalooCost": 0, "genre": "Electronic", "tickets": 0, "effect": "If Middle Slot: Play another artist from your hand if you can afford them", "genreMatchEffect": ""}, {"name": "Romy", "fame": 1, "vp": 0, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Electronic", "tickets": 3, "effect": "", "genreMatchEffect": ""}, {"name": "The Chainsmokers", "fame": 1, "vp": 0, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Electronic", "tickets": 3, "effect": "If Opening Set: +1 ticket(s)", "genreMatchEffect": ""}, {"name": "CHVRCHES", "fame": 1, "vp": 0, "campCost": 1, "securityCost": 0, "cateringCost": 1, "portalooCost": 0, "genre": "Electronic", "tickets": 1, "effect": "", "genreMatchEffect": ""}, {"name": "Jamie xx", "fame": 2, "vp": 0, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 1, "genre": "Electronic, Indie", "tickets": 1, "effect": "", "genreMatchEffect": ""}, {"name": "Pink Pantheress", "fame": 2, "vp": 0, "campCost": 1, "securityCost": 1, "cateringCost": 1, "portalooCost": 0, "genre": "Electronic, Pop", "tickets": 3, "effect": "If Middle Slot: +1 Fame", "genreMatchEffect": ""}, {"name": "Flume", "fame": 2, "vp": 0, "campCost": 1, "securityCost": 1, "cateringCost": 1, "portalooCost": 1, "genre": "Electronic, Hip Hop", "tickets": 3, "effect": "If Opening Set: +1 Fame", "genreMatchEffect": ""}, {"name": "Opolopo", "fame": 2, "vp": 0, "campCost": 2, "securityCost": 1, "cateringCost": 0, "portalooCost": 1, "genre": "Electronic, Funk", "tickets": 4, "effect": "", "genreMatchEffect": ""}, {"name": "Peggy Gou", "fame": 2, "vp": 0, "campCost": 2, "securityCost": 0, "cateringCost": 2, "portalooCost": 0, "genre": "Electronic", "tickets": 4, "effect": "If Headliner: +2 ticket(s)", "genreMatchEffect": ""}, {"name": "Chase & Status", "fame": 2, "vp": 0, "campCost": 2, "securityCost": 1, "cateringCost": 1, "portalooCost": 0, "genre": "Electronic", "tickets": 4, "effect": "", "genreMatchEffect": ""}, {"name": "Charli XCX", "fame": 3, "vp": 0, "campCost": 2, "securityCost": 2, "cateringCost": 0, "portalooCost": 0, "genre": "Electronic, Pop", "tickets": 0, "effect": "[TEMPT] Play another artist from your hand if you can afford them", "genreMatchEffect": ""}, {"name": "The Chemical Brothers", "fame": 3, "vp": 0, "campCost": 2, "securityCost": 2, "cateringCost": 0, "portalooCost": 0, "genre": "Electronic", "tickets": 1, "effect": "", "genreMatchEffect": ""}, {"name": "Linkin Park", "fame": 3, "vp": 0, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 3, "genre": "Electronic, Rock", "tickets": 5, "effect": "If Headliner: +2 ticket(s)", "genreMatchEffect": ""}, {"name": "Skrillex", "fame": 3, "vp": 0, "campCost": 2, "securityCost": 1, "cateringCost": 1, "portalooCost": 1, "genre": "Electronic", "tickets": 4, "effect": "+1 Fame", "genreMatchEffect": ""}, {"name": "Daft Punk", "fame": 5, "vp": 0, "campCost": 3, "securityCost": 0, "cateringCost": 1, "portalooCost": 2, "genre": "Electronic", "tickets": 7, "effect": "", "genreMatchEffect": ""}, {"name": "Fatboy Slim", "fame": 5, "vp": 0, "campCost": 2, "securityCost": 1, "cateringCost": 2, "portalooCost": 1, "genre": "Electronic", "tickets": 6, "effect": "If Opening Set: +2 ticket sales. If Middle Slot: +4 ticket sales. If Headliner: +6 ticket sales", "genreMatchEffect": ""}, {"name": "Bruised Brothers", "fame": 0, "vp": 0, "campCost": 0, "securityCost": 0, "cateringCost": 0, "portalooCost": 0, "genre": "Indie, Funk", "tickets": 1, "effect": "[STAGES_321] Draw 1/2/3 artists from the pool or deck", "genreMatchEffect": ""}, {"name": "Ayle", "fame": 0, "vp": 0, "campCost": 0, "securityCost": 0, "cateringCost": 0, "portalooCost": 0, "genre": "Indie, Hip Hop", "tickets": 1, "effect": "", "genreMatchEffect": ""}, {"name": "Mickey Raven", "fame": 0, "vp": 0, "campCost": 0, "securityCost": 0, "cateringCost": 0, "portalooCost": 1, "genre": "Indie", "tickets": 1, "effect": "", "genreMatchEffect": ""}, {"name": "Djo", "fame": 1, "vp": 0, "campCost": 0, "securityCost": 0, "cateringCost": 0, "portalooCost": 1, "genre": "Indie", "tickets": 2, "effect": "", "genreMatchEffect": ""}, {"name": "Two Door Cinema Club", "fame": 1, "vp": 0, "campCost": 1, "securityCost": 0, "cateringCost": 0, "portalooCost": 1, "genre": "Indie", "tickets": 2, "effect": "[STAGES_321] +0/2/3 tickets", "genreMatchEffect": ""}, {"name": "Boygenius", "fame": 1, "vp": 0, "campCost": 1, "securityCost": 0, "cateringCost": 0, "portalooCost": 1, "genre": "Indie", "tickets": 2, "effect": "", "genreMatchEffect": ""}, {"name": "The Kooks", "fame": 1, "vp": 0, "campCost": 0, "securityCost": 1, "cateringCost": 0, "portalooCost": 1, "genre": "Indie", "tickets": 2, "effect": "Play another artist from your hand if you can afford them", "genreMatchEffect": ""}, {"name": "Christine & The Queens", "fame": 1, "vp": 0, "campCost": 1, "securityCost": 0, "cateringCost": 0, "portalooCost": 1, "genre": "Indie", "tickets": 2, "effect": "", "genreMatchEffect": ""}, {"name": "Angine de Poitrine", "fame": 2, "vp": 0, "campCost": 1, "securityCost": 0, "cateringCost": 1, "portalooCost": 1, "genre": "Indie", "tickets": 3, "effect": "[STAGES_321] Draw 1/2/3 artists from the pool or deck", "genreMatchEffect": ""}, {"name": "Suki Waterhouse", "fame": 2, "vp": 0, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 1, "genre": "Indie", "tickets": 3, "effect": "", "genreMatchEffect": ""}, {"name": "Mitski", "fame": 2, "vp": 0, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 1, "genre": "Indie", "tickets": 3, "effect": "", "genreMatchEffect": ""}, {"name": "CMAT", "fame": 2, "vp": 0, "campCost": 0, "securityCost": 1, "cateringCost": 0, "portalooCost": 2, "genre": "Indie, Pop", "tickets": 3, "effect": "", "genreMatchEffect": ""}, {"name": "Florence & The Machine", "fame": 2, "vp": 0, "campCost": 1, "securityCost": 0, "cateringCost": 1, "portalooCost": 1, "genre": "Indie", "tickets": 3, "effect": "[STAGES_321] +0/2/3 tickets", "genreMatchEffect": ""}, {"name": "Lana Del Rey", "fame": 3, "vp": 0, "campCost": 0, "securityCost": 1, "cateringCost": 0, "portalooCost": 2, "genre": "Indie", "tickets": 4, "effect": "+1 Fame", "genreMatchEffect": ""}, {"name": "Hozier", "fame": 3, "vp": 0, "campCost": 1, "securityCost": 0, "cateringCost": 0, "portalooCost": 2, "genre": "Indie", "tickets": 4, "effect": "", "genreMatchEffect": ""}, {"name": "Joy Division", "fame": 4, "vp": 0, "campCost": 1, "securityCost": 1, "cateringCost": 1, "portalooCost": 1, "genre": "Indie", "tickets": 5, "effect": "[STAGES_321] +1/2/3 tickets", "genreMatchEffect": ""}, {"name": "Tame Impala", "fame": 4, "vp": 0, "campCost": 2, "securityCost": 0, "cateringCost": 1, "portalooCost": 1, "genre": "Indie, Electronic", "tickets": 5, "effect": "", "genreMatchEffect": ""}, {"name": "The Strokes", "fame": 4, "vp": 0, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 2, "genre": "Indie", "tickets": 2, "effect": "Play another artist from your hand if you can afford them", "genreMatchEffect": ""}, {"name": "Gorillaz", "fame": 5, "vp": 0, "campCost": 1, "securityCost": 1, "cateringCost": 1, "portalooCost": 2, "genre": "Indie", "tickets": 6, "effect": "[STAGES_321] +3/5/8 tickets", "genreMatchEffect": ""}, {"name": "The Cure", "fame": 5, "vp": 0, "campCost": 1, "securityCost": 1, "cateringCost": 1, "portalooCost": 2, "genre": "Indie, Rock", "tickets": 6, "effect": "[STAGES_321] +2/4/7 tickets", "genreMatchEffect": ""}, {"name": "Bella Labelle", "fame": 0, "vp": 0, "campCost": 0, "securityCost": 0, "cateringCost": 1, "portalooCost": 0, "genre": "Funk, Pop", "tickets": 1, "effect": "[SAME_GENRE_ON_STAGE] +1 Fame", "genreMatchEffect": ""}, {"name": "Redcar", "fame": 0, "vp": 0, "campCost": 0, "securityCost": 0, "cateringCost": 1, "portalooCost": 0, "genre": "Funk", "tickets": 2, "effect": "", "genreMatchEffect": ""}, {"name": "Afrika Bambaataa", "fame": 0, "vp": 0, "campCost": 0, "securityCost": 0, "cateringCost": 1, "portalooCost": 0, "genre": "Funk, Electronic", "tickets": 1, "effect": "[SAME_GENRE_ON_STAGE] +1 ticket(s)", "genreMatchEffect": ""}, {"name": "Teena Marie", "fame": 1, "vp": 0, "campCost": 1, "securityCost": 0, "cateringCost": 1, "portalooCost": 0, "genre": "Funk, Indie", "tickets": 2, "effect": "", "genreMatchEffect": ""}, {"name": "The Roots", "fame": 1, "vp": 0, "campCost": 0, "securityCost": 1, "cateringCost": 1, "portalooCost": 0, "genre": "Funk, Hip Hop", "tickets": 2, "effect": "", "genreMatchEffect": ""}, {"name": "Grandmaster Flash", "fame": 1, "vp": 0, "campCost": 0, "securityCost": 0, "cateringCost": 1, "portalooCost": 1, "genre": "Funk, Electronic", "tickets": 1, "effect": "", "genreMatchEffect": ""}, {"name": "Vulfpeck", "fame": 1, "vp": 0, "campCost": 0, "securityCost": 1, "cateringCost": 1, "portalooCost": 0, "genre": "Funk, Indie", "tickets": 0, "effect": "[SAME_GENRE_ON_STAGE] Play another artist from your hand if you can afford them", "genreMatchEffect": ""}, {"name": "Jungle", "fame": 1, "vp": 0, "campCost": 1, "securityCost": 0, "cateringCost": 2, "portalooCost": 0, "genre": "Funk, Indie", "tickets": 3, "effect": "", "genreMatchEffect": ""}, {"name": "The Pharcyde", "fame": 1, "vp": 0, "campCost": 0, "securityCost": 1, "cateringCost": 2, "portalooCost": 0, "genre": "Funk, Hip Hop", "tickets": 3, "effect": "You may remove 1 amenity of your choice from your festival. Gain 1 amenity of your choice", "genreMatchEffect": ""}, {"name": "Evelyn \"Champagne\" King:", "fame": 2, "vp": 0, "campCost": 1, "securityCost": 1, "cateringCost": 1, "portalooCost": 0, "genre": "Funk", "tickets": 3, "effect": "", "genreMatchEffect": ""}, {"name": "Mark Ronson", "fame": 2, "vp": 0, "campCost": 1, "securityCost": 0, "cateringCost": 1, "portalooCost": 1, "genre": "Funk, Pop", "tickets": 3, "effect": "[SAME_GENRE_ON_STAGE] Draw 2 artists from the deck or pool", "genreMatchEffect": ""}, {"name": "Khruangbin", "fame": 2, "vp": 0, "campCost": 1, "securityCost": 0, "cateringCost": 2, "portalooCost": 0, "genre": "Funk, Electronic", "tickets": 3, "effect": "If Middle Slot: +1 ticket(s)", "genreMatchEffect": ""}, {"name": "Sly & The Family Stone", "fame": 2, "vp": 0, "campCost": 0, "securityCost": 1, "cateringCost": 1, "portalooCost": 1, "genre": "Funk, Rock", "tickets": 3, "effect": "", "genreMatchEffect": ""}, {"name": "Betty Davis", "fame": 3, "vp": 0, "campCost": 1, "securityCost": 1, "cateringCost": 1, "portalooCost": 1, "genre": "Funk, Rock", "tickets": 4, "effect": "", "genreMatchEffect": ""}, {"name": "Dr. Dre", "fame": 3, "vp": 0, "campCost": 1, "securityCost": 1, "cateringCost": 2, "portalooCost": 0, "genre": "Funk, Hip Hop", "tickets": 4, "effect": "[SAME_GENRE_ON_STAGE] +1 ticket(s)", "genreMatchEffect": ""}, {"name": "Earth, Wind & Fire", "fame": 4, "vp": 0, "campCost": 0, "securityCost": 2, "cateringCost": 2, "portalooCost": 1, "genre": "Funk", "tickets": 5, "effect": "", "genreMatchEffect": ""}, {"name": "Chaka Khan", "fame": 4, "vp": 0, "campCost": 2, "securityCost": 1, "cateringCost": 2, "portalooCost": 0, "genre": "Funk", "tickets": 5, "effect": "", "genreMatchEffect": ""}, {"name": "Nile Rogers & Chic", "fame": 4, "vp": 0, "campCost": 1, "securityCost": 1, "cateringCost": 3, "portalooCost": 0, "genre": "Funk", "tickets": 0, "effect": "Play another artist from your hand if you can afford them", "genreMatchEffect": ""}, {"name": "Silk Sonic", "fame": 5, "vp": 0, "campCost": 2, "securityCost": 2, "cateringCost": 1, "portalooCost": 1, "genre": "Funk, Pop", "tickets": 6, "effect": "[HIGHEST_FAME] +7 ticket(s)", "genreMatchEffect": ""}, {"name": "Prince", "fame": 5, "vp": 0, "campCost": 1, "securityCost": 1, "cateringCost": 3, "portalooCost": 1, "genre": "Funk, Rock", "tickets": 6, "effect": "[SAME_GENRE_PER] +3 ticket(s)", "genreMatchEffect": ""}];

// ═══════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════
const AMENITY_TYPES = ["campsite", "security", "catering", "portaloo"];
// Each player has 3 fields. Each field is an independent counter object.
// pd.fields[i] is the source of truth for amenity placement; pd.amenities is the
// derived sum across fields, kept in sync by computeTicketsForPlayer / setPlayerData.
// v189: single amenity area (was 3 fields). Councils are gone, and per-field placement
// was primarily driven by council fit. Now amenities pool into one running total per
// type. `fields` remains a 1-element array so all existing code that iterates fields
// or reads fields[i][type] continues to work without a broader refactor.
const FIELD_COUNT = 1;
function emptyField() { return { campsite: 0, security: 0, catering: 0, portaloo: 0 }; }
function emptyFields() { return Array.from({ length: FIELD_COUNT }, emptyField); }
function sumFields(fields) {
  const out = { campsite: 0, security: 0, catering: 0, portaloo: 0 };
  if (!fields) return out;
  for (const f of fields) {
    if (!f) continue;
    out.campsite += f.campsite || 0;
    out.security += f.security || 0;
    out.catering += f.catering || 0;
    out.portaloo += f.portaloo || 0;
  }
  return out;
}
// Returns a new pd with fields[fieldIdx][type] += delta and amenities re-synced.
// Use this for ALL amenity mutations to keep the two views consistent.
function mutateAmenity(pd, fieldIdx, type, delta) {
  const fields = (pd.fields || emptyFields()).map((f, i) => i === fieldIdx ? { ...f, [type]: Math.max(0, (f?.[type] || 0) + delta) } : f);
  return { ...pd, fields, amenities: sumFields(fields) };
}
const AMENITY_LABELS = { campsite: "Campsite", portaloo: "Portaloo", security: "Security", catering: "Catering Van" };
const AMENITY_EMOJI = { campsite: "⛺", portaloo: "🚽", security: "🛡️", catering: "🍔" };

// v197.12: Infrastructure Rewards catalog. Three variants per amenity type; one is
// drawn per amenity at game start when the mode is on. The reward goes to whichever
// player has a STRICT LEAD in that amenity type — ties mean no one holds the reward.
const INFRA_REWARDS = {
  camp_1: { amenity: "campsite", label: "Big Base",       desc: "Each of your campsites is worth +1 additional ticket." },
  camp_2: { amenity: "campsite", label: "Sold Out",       desc: "Year End: +12 tickets." },
  camp_3: { amenity: "campsite", label: "Loyal Following", desc: "When you play an artist, +1 ticket." },
  port_1: { amenity: "portaloo", label: "Quick Turnaround", desc: "Once per turn, refresh the artist pool for free." },
  port_2: { amenity: "portaloo", label: "Traffic Flow",   desc: "When you pick an amenity, also draw 1 artist from the pool or deck." },
  port_3: { amenity: "portaloo", label: "Word of Mouth",  desc: "When you complete a microtrend, draw 1 artist from the pool or deck." },
  cat_1:  { amenity: "catering", label: "Backstage Perks", desc: "If Fame or a Stage is in the amenity pool after you refresh it, gain 1 Fame or 1 stage progress." },
  cat_2:  { amenity: "catering", label: "Concessions",    desc: "Each of your catering vans is worth 2 tickets." },
  cat_3:  { amenity: "catering", label: "VIP Passes",     desc: "When you gain a Fame, +1 ticket." },
  sec_1:  { amenity: "security", label: "Bouncer Rights", desc: "When you take an amenity from the amenity pool, choose which amenity you receive." },
  sec_2:  { amenity: "security", label: "Scouted Talent", desc: "Draw 3 artists at the beginning of your turn. Keep 1; discard the rest." },
  sec_3:  { amenity: "security", label: "Reputation",     desc: "Artists cost 1 less Fame to play." },
};
const INFRA_REWARDS_BY_AMENITY = {
  campsite: ["camp_1", "camp_2", "camp_3"],
  portaloo: ["port_1", "port_2", "port_3"],
  catering: ["cat_1", "cat_2", "cat_3"],
  security: ["sec_1", "sec_2", "sec_3"],
};
const AMENITY_ICONS = { campsite: "⛺", portaloo: "🚽", security: "👮‍♀️", catering: "🍔" };
const AMENITY_COLORS = { campsite: "#4ade80", portaloo: "#60a5fa", security: "#f87171", catering: "#fbbf24" };
// v166: dice faces are now 6 pure options (one per side of a d6). Removed the compound
// "catering_or_portaloo" and "security_or_campsite" faces; added "stage" — picking a
// stage die grants +1 stage progress toward opening the next stage (2 progress = 1
// credit; progress also comes from microtrend claims).
const DICE_OPTIONS = ["campsite", "portaloo", "security", "catering", "fame", "stage"];
const TURNS_PER_YEAR = { 1: 6, 2: 7, 3: 8, 4: 9 };
// v157: alternate "flat" schedule — every year is 6 turns. Toggled via the
// flatTurnsMode state. Sim data (50 games × 3 players) showed the extra Y2/Y3
// turns were being spent on amenity spam without generating additional artist
// plays or tickets, so a flat schedule tightens the endgame without hurting scoring.
const TURNS_PER_YEAR_FLAT = { 1: 6, 2: 6, 3: 6, 4: 6 };
const FAME_MAX = 5;
const GENRE_COLORS = { Pop: "#ec4899", Rock: "#ef4444", Electronic: "#94a3b8", "Hip Hop": "#f97316", Indie: "#22c55e", Funk: "#a855f7" };
const ALL_GENRES = ["Pop", "Rock", "Electronic", "Hip Hop", "Indie", "Funk"];

// ─── Council Objectives ───
// 24 unique council cards. Each player gets 5 dealt at game start, keeps 3, assigns 1 per field.
// Conditions are evaluated per-field; rewards are year-scaled where indicated by perYear arrays.
// Year is 1-indexed (year 1 = perYear[0]).
const ALL_COUNCILS = [
  // v146: xlsx update — 9 threshold tightenings, Muscle Food & Neighbourhood Watch now
  // grant a permanent field amenity (placeAmenity) instead of extra agent actions,
  // Extended Dancefloor removed entirely. Rewards for other councils unchanged.
  { id: "glamping", name: "Glamping", condition: { type: "thresholdPaired", a: "campsite", b: "portaloo", perYear: [1,1,2,3] }, reward: { type: "fame", perYear: [1,1,2,2] } },
  // v168: foodCourts, luxuryLoos, wellEquipped removed — they granted star dice, which
  // are gone from the game now.
  { id: "muscleFood", name: "Muscle Food", condition: { type: "comparative", greater: "catering", lesser: "security" }, reward: { type: "placeAmenity", amenity: "portaloo" } },
  { id: "shepherds", name: "Shepherds", condition: { type: "comparative", greater: "campsite", lesser: "security" }, reward: { type: "refreshPool" } },
  // v134 xlsx rewrite: Good For Business grants freeSpecialGuests.
  { id: "goodForBusiness", name: "Good For Business", condition: { type: "comparative", greater: "campsite", lesser: "catering" }, reward: { type: "freeSpecialGuests" } },
  { id: "homeSecurity", name: "Home Security", condition: { type: "thresholdPaired", a: "campsite", b: "security", perYear: [1,2,3,4] }, reward: { type: "fame", perYear: [1,1,2,2] } },
  { id: "officialPartner", name: "Official Partner", condition: { type: "thresholdSingle", amenity: "catering", perYear: [1,2,3,4] }, reward: { type: "drawOnPlay" } },
  { id: "staffArea", name: "Staff Area", condition: { type: "thresholdSingle", amenity: "security", perYear: [1,2,3,4] }, reward: { type: "artistOnMicrotrend" } },
  { id: "snifferDogs", name: "Sniffer Dogs", condition: { type: "thresholdSingle", amenity: "security", perYear: [1,2,3,4] }, reward: { type: "refreshPool" } },
  { id: "competitiveSteak", name: "Competitive Steak", condition: { type: "thresholdSingle", amenity: "catering", perYear: [1,2,3,4] }, reward: { type: "artistOnMicrotrend" } },
  { id: "liquidLunches", name: "Liquid Lunches", condition: { type: "thresholdPaired", a: "portaloo", b: "catering", perYear: [1,1,2,3] }, reward: { type: "drawOnPlay" } },
  { id: "wellStaffed", name: "Well Staffed", condition: { type: "thresholdSingle", amenity: "security", perYear: [1,2,3,4] }, reward: { type: "fame", perYear: [1,1,2,2] } },
  // v146: Neighbourhood Watch now grants +1 Catering Van on its field once per year (placeAmenity).
  { id: "neighbourhoodWatch", name: "Neighbourhood Watch", condition: { type: "comparative", greater: "security", lesser: "campsite" }, reward: { type: "placeAmenity", amenity: "catering" } },
  { id: "vipee", name: "VIPee", condition: { type: "comparative", greater: "security", lesser: "portaloo" }, reward: { type: "freeSpecialGuests" } },
  { id: "secretSauce", name: "Secret Sauce", condition: { type: "comparative", greater: "security", lesser: "catering" }, reward: { type: "refreshDice" } },
  { id: "funkyFood", name: "Funky Food", condition: { type: "comparative", greater: "portaloo", lesser: "catering" }, reward: { type: "artistOnMicrotrend" } },
  { id: "numberOneFans", name: "Number One Fans", condition: { type: "comparative", greater: "portaloo", lesser: "campsite" }, reward: { type: "drawOnPlay" } },
  { id: "plentyForEveryone", name: "Plenty For Everyone", condition: { type: "thresholdPaired", a: "catering", b: "campsite", perYear: [1,1,2,3] }, reward: { type: "freeSpecialGuests" } },
  { id: "quietCamping", name: "Quiet Camping", condition: { type: "thresholdSingle", amenity: "campsite", perYear: [1,1,2,2] }, reward: { type: "refreshDice" } },
  { id: "spoiltForChoice", name: "Spoilt for Choice", condition: { type: "comparative", greater: "catering", lesser: "campsite" }, reward: { type: "refreshPool" } },
  { id: "urinalsAndCubicles", name: "Urinals and Cubicles", condition: { type: "thresholdSingle", amenity: "portaloo", perYear: [1,2,3,4] }, reward: { type: "refreshDice" } },
];

function getCouncilById(id) { return ALL_COUNCILS.find(c => c.id === id); }

// Format the condition for display
function formatCouncilCondition(c) {
  const cond = c.condition;
  if (cond.type === "thresholdSingle") return `${cond.perYear.join("/")} ${AMENITY_LABELS[cond.amenity]}${cond.perYear[0] > 1 ? "s" : ""}`;
  if (cond.type === "thresholdPaired") return `${cond.perYear.join("/")} ${AMENITY_LABELS[cond.a]} + ${AMENITY_LABELS[cond.b]}`;
  if (cond.type === "comparative") return `${AMENITY_LABELS[cond.greater]} > ${AMENITY_LABELS[cond.lesser]}`;
  if (cond.type === "thresholdFixed") return `Exactly ${cond.count} ${AMENITY_LABELS[cond.amenity]}${cond.count > 1 ? "s" : ""}`;
  if (cond.type === "emptyField") return "Keep field empty";
  return "?";
}

function formatCouncilReward(c) {
  const r = c.reward;
  if (r.type === "fame") return `+${r.perYear.join("/")} 🔥 Fame`;
  if (r.type === "tickets") return `+${r.perYear.join("/")} 🎟️ Tickets`;
  if (r.type === "starDice") return `+${r.perYear.join("/")} 🎲 Star Dice`;
  if (r.type === "refreshPool") return `🔄 Refresh artist pool / turn`;
  if (r.type === "refreshDice") return `🎲 Refresh amenity dice / turn`;
  if (r.type === "drawOnPlay") return `Draw an artist when you play an artist`;
  if (r.type === "drawArtists") return `Draw +${r.perYear.join("/")} artist(s) when drawing`; // legacy
  if (r.type === "freeSpecialGuests") return `Special guests are free (no effects, tickets counted)`;
  if (r.type === "drawSpecialGuests") return `Draw +${r.perYear.join("/")} special guest(s)`; // legacy
  if (r.type === "agents") return `+${r.perYear.join("/")} 🕵️ Agent use(s) / year`;
  if (r.type === "agentFame") return `+1 🔥 Fame per successful 🕵️ Agent action`;
  if (r.type === "artistOnMicrotrend") return `Draw an artist from the pool or deck when you complete a Microtrend`;
  if (r.type === "placeAmenity") return `+1 ${r.amenity === "portaloo" ? "🚽 Portaloo" : r.amenity === "catering" ? "🍔 Catering" : r.amenity === "campsite" ? "⛺ Campsite" : "🛡️ Security"} on this field / year`;
  if (r.type === "freeStageOpenOnce") return `Open a free stage at year end (once / game)`;
  return "?";
}

// Module-level flag updated from React via setStrictCouncilMode (mirrors the lobby toggle).
// Keeps councilQualifies pure-ish without needing to thread a 4th argument through every
// call site. Default false preserves the cheap-to-qualify comparative behaviour.
let _strictComparativeMode = false;
function setStrictCouncilMode(v) { _strictComparativeMode = !!v; }

// Evaluate whether a field qualifies for a council in the given year (1-indexed)
function councilQualifies(council, field, year) {
  if (!council || !field) return false;
  const cond = council.condition;
  const yIdx = Math.max(0, Math.min(3, (year || 1) - 1));
  const c = (t) => field[t] || 0;
  if (cond.type === "thresholdSingle") return c(cond.amenity) >= cond.perYear[yIdx];
  if (cond.type === "thresholdPaired") return c(cond.a) >= cond.perYear[yIdx] && c(cond.b) >= cond.perYear[yIdx];
  if (cond.type === "comparative") {
    // Strict mode: lesser amenity also needs ≥ 1, so total amenities ≥ 3 (X≥2, Y≥1, X>Y).
    if (_strictComparativeMode) return c(cond.greater) > c(cond.lesser) && c(cond.lesser) >= 1;
    return c(cond.greater) > c(cond.lesser);
  }
  if (cond.type === "thresholdFixed") return c(cond.amenity) === cond.count;
  if (cond.type === "emptyField") return c("campsite") + c("portaloo") + c("security") + c("catering") === 0;
  return false;
}

// Sum the year-scaled rewards of a given type across all qualifying councils (e.g. total +N artists to draw)
function totalCouncilRewardOfType(pd, year, rewardType) {
  if (!pd) return 0;
  const councils = pd.councils || [];
  const fields = pd.fields || [];
  const yIdx = Math.max(0, Math.min(3, (year || 1) - 1));
  let total = 0;
  for (let i = 0; i < councils.length; i++) {
    const c = councils[i];
    if (!c) continue;
    if (c.reward?.type !== rewardType) continue;
    if (!councilQualifies(c, fields[i], year || 1)) continue;
    total += c.reward.perYear?.[yIdx] || 0;
  }
  return total;
}

// Whether the player has at least one qualifying council with a non-counted reward (e.g. refreshPool)
function hasQualifyingCouncilOfType(pd, year, rewardType) {
  if (!pd) return false;
  const councils = pd.councils || [];
  const fields = pd.fields || [];
  return councils.some((c, i) => c?.reward?.type === rewardType && councilQualifies(c, fields[i], year || 1));
}

// A microtrend is either a "book this genre" trigger or a "place this amenity" trigger.
// Either way the claim reward is +1 Fame for the first player to satisfy it.
//   { kind: "genre",   genre:   "Pop",      claimedBy }
//   { kind: "amenity", amenity: "campsite", claimedBy }
// roughly 1/3 of generated microtrends are amenity-kind — common enough to vary play but
// rare enough that "book a matching artist" remains the typical trigger.
function makeMicrotrend(usedGenres, usedAmenities) {
  const rollAmenity = Math.random() < 0.33;
  if (rollAmenity) {
    const pool = ["campsite", "security", "catering", "portaloo"].filter(a => !usedAmenities.has(a));
    if (pool.length > 0) {
      const pick = pool[Math.floor(Math.random() * pool.length)];
      usedAmenities.add(pick);
      return { kind: "amenity", amenity: pick, claimedBy: null };
    }
  }
  const pool = ALL_GENRES.filter(g => !usedGenres.has(g));
  const pick = pool[Math.floor(Math.random() * pool.length)] || ALL_GENRES[0];
  usedGenres.add(pick);
  return { kind: "genre", genre: pick, claimedBy: null };
}
function generateMicrotrends() {
  // Just one active microtrend at a time. When claimed, it'll be replaced by a fresh one
  // at the end of the claimer's turn (kind also reshuffled — genre or amenity).
  const usedGenres = new Set();
  const usedAmenities = new Set();
  return [makeMicrotrend(usedGenres, usedAmenities)];
}
const STAGE_NAMES = [
  "The Pyramid","The Beacon","Sunset Strip","The Warehouse","Neon Tent",
  "Echo Chamber","Thunder Dome","The Lighthouse","Starlight Arena","Cloud Nine",
  "The Cavern","Solar Stage","Bass Cathedral","The Orchid","Iron Forge",
  "Moonlit Meadow","The Hive","Crystal Palace","Wildfire Ring","The Oasis"
];
const STAGE_COLORS = [
  "#e11d48","#7c3aed","#0891b2","#16a34a","#ea580c",
  "#c026d3","#2563eb","#ca8a04","#dc2626","#059669",
  "#8b5cf6","#d97706","#0d9488","#be185d","#4f46e5"
];
const RANDOM_NAMES = [
  "Glastonbury 2.0","Mudstock","Basswave","Sunblaze","Neon Fields",
  "Echo Valley","Thunderdome","Starlight Meadow","Cosmic Grove","Rhythmia",
  "Pulse Festival","Wildfire Fest","Dreamscape","Horizon Fest","Moonrise",
  "Voltage","Zenith Fest","Solstice Sound","Inferno Fest","Aurora Nights"
];
const AI_NAMES = ["RoboFest","AutoStage","ByteBeats","CyberGrove","NeuralNights"];

const ALL_OBJECTIVES = [
  { id: "local_talent", name: "Local Talent", req: "Play a 0-1 Fame artist as a headliner", reward: "+3 tickets" },
  { id: "popstars", name: "Popstars", req: "Feature a full Pop lineup", reward: "+3 tickets" },
  { id: "rock_on", name: "Rock On", req: "Feature a full Rock lineup", reward: "+3 tickets" },
  { id: "disc_jockeys", name: "Disc Jockeys", req: "Feature a full Electronic lineup", reward: "+3 tickets" },
  { id: "fire_verses", name: "Fire Verses", req: "Feature a full Hip Hop lineup", reward: "+3 tickets" },
  { id: "indiependent", name: "Indiependent", req: "Feature a full Indie lineup", reward: "+3 tickets" },
  { id: "funky_town", name: "Funky Town", req: "Feature a full Funk lineup", reward: "+3 tickets" },
  { id: "eclectic", name: "Eclectic", req: "Lineups with at least 3 different genres", reward: "+3 tickets" },
  { id: "friends_special", name: "Friends in Special Places", req: "Finish a lineup with a special guest", reward: "+3 tickets" },
  { id: "leading_example", name: "Leading by Example", req: "2nd and 3rd artists on a stage have lower Fame cost than the 1st", reward: "+3 tickets" },
  { id: "switching_up", name: "Switching it Up", req: "Feature a balanced lineup of 2 genres (e.g. 1 pop, 1 rock, 1 pop-rock)", reward: "+3 tickets" },
  { id: "music_speaks", name: "Music that Speaks for Itself", req: "Feature a lineup with no effects", reward: "+3 tickets" },
  { id: "high_profile", name: "High Profile", req: "Feature a lineup with at least 5 security in combined cost", reward: "+3 tickets" },
  { id: "foodies", name: "Foodies", req: "Feature a lineup with at least 5 catering in combined cost", reward: "+3 tickets" },
  { id: "pampered", name: "Pampered", req: "Feature a lineup with at least 5 portaloos in combined cost", reward: "+3 tickets" },
  { id: "price_fame", name: "The Price of Fame", req: "Feature a lineup with a total cost of 20 amenities", reward: "+3 tickets" },
  { id: "industry_friends", name: "Industry Friends", req: "Feature two lineups with a headliner in the same genre", reward: "+3 tickets" },
  { id: "same_song_sheet", name: "Singing From The Same Song Sheet", req: "Feature a lineup where each artist has the same exact amenity requirements", reward: "+3 tickets" },
  { id: "experimental", name: "Experimental", req: "Feature a lineup where each artist is a mix of two genres", reward: "+3 tickets" },
  { id: "fair_share", name: "Fair Share", req: "Feature a lineup where each artist requires the same number of amenities", reward: "+3 tickets" },
];

const FAME_VP = { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 };

const LINEUP_GENRE_DECK = ["Pop","Pop","Pop","Rock","Rock","Rock","Hip Hop","Hip Hop","Hip Hop","Electronic","Electronic","Electronic","Indie","Indie","Indie","Funk","Funk","Funk"];

// ═══════════════════════════════════════════════════════════════════
// v135: Alternative Artist Objectives (lobby toggle)
// ═══════════════════════════════════════════════════════════════════
// A replacement for the fame→stage progression. Each player is dealt 2 objectives at year
// start (game start for starter deck; year 2+ from progression deck) and picks 1. If they
// achieve it, they open a new stage at year end (or +10 tickets if already at 3 stages).
// If not, they get a failure objective (also pick 1 of 2) as an additional live objective
// for the next year. Achievements are permanent — objectives don't reset. Multiple live
// objectives can be achieved in the same year → multiple stage opens per year.
//
// Objective sources: `starter` (game start, easy), `progression` (year 2+, harder),
// `failure` (given after failing to complete an objective that year, medium difficulty
// with bonus reward: also draw 3 artists from deck).
//
// Each objective has:
//   - id: stable identifier
//   - name: display name
//   - req: player-visible requirement text
//   - source: "starter" | "progression" | "failure"
//   - copies: how many copies exist in the deck (2 for starter/failure, 1 for progression)
//   - check(pd, ctx): returns true iff the objective is satisfied. `ctx` provides
//     event-driven state: { yearEvents, allPlayerData, currentPid }.
const ALT_OBJECTIVES = [
  // ─── Starter deck (game start) — 2 copies each, easy to complete ───
  { id: "local_talent", name: "Local Talent", req: "Play a 0-1 Fame artist as a headliner", source: "starter", copies: 2,
    check: (pd) => (pd.stageArtists || []).some(sa => sa.length === 3 && (sa[2].fame || 0) <= 1) },
  { id: "fyre_festival", name: "Fyre Festival", req: "Play 0 artists this year", source: "starter", copies: 2,
    check: (pd, ctx) => (ctx.yearEvents?.[ctx.currentPid]?.artistsPlayedThisYear || 0) === 0 },
  { id: "punching", name: "Punching", req: "Play an artist who costs more than 1 Fame", source: "starter", copies: 2,
    check: (pd) => (pd.stageArtists || []).flat().filter(a => (a.fame || 0) > 1).length >= 1 },
  { id: "pandering", name: "Pandering", req: "Win a genre microtrend by playing an artist", source: "starter", copies: 2,
    check: (pd, ctx) => (ctx.yearEvents?.[ctx.currentPid]?.genreMicrotrendWinsThisYear || 0) >= 1 },
  { id: "mainstream", name: "Mainstream", req: "Play at least 2 Hip Hop, Pop, or Rock artists", source: "starter", copies: 2,
    check: (pd) => (pd.stageArtists || []).flat().filter(a => /Pop|Rock|Hip Hop/i.test(a.genre || "")).length >= 2 },
  { id: "alternative", name: "Alternative", req: "Play at least 2 Funk, Electronic, or Indie artists", source: "starter", copies: 2,
    check: (pd) => (pd.stageArtists || []).flat().filter(a => /Funk|Electronic|Indie/i.test(a.genre || "")).length >= 2 },

  // ─── Failure deck — 2 copies each, given after failing to complete an objective ───
  { id: "popularity_contest", name: "Popularity Contest", req: "Win an artist by contesting another player who is tempting them", source: "failure", copies: 2,
    check: (pd, ctx) => (ctx.yearEvents?.[ctx.currentPid]?.contestWinsThisYear || 0) >= 1 },
  { id: "burning_desire", name: "Burning Desire", req: "Play two artists by successfully tempting them", source: "failure", copies: 2,
    check: (pd, ctx) => (ctx.yearEvents?.[ctx.currentPid]?.temptBookingsThisYear || 0) >= 2 },
  { id: "blueprint_success", name: "Blueprint for Success", req: "Play the same artist genres on a stage as another player", source: "failure", copies: 2,
    check: (pd, ctx) => {
      // v142: Per user's clarification. Match logic is "deduped genre SET on some stage of
      // yours equals deduped genre SET on some stage of an opponent". Order, per-slot genre,
      // and artist count all irrelevant — only the SET of genres present on the stage matters.
      // Both stages need ≥1 artist. Exact set equality — {funk,rock} ≠ {funk}.
      const genreSet = (sa) => {
        const s = new Set();
        sa.forEach(a => (a.genre || "").split(",").map(g => g.trim()).forEach(g => g && s.add(g)));
        return s;
      };
      const setKey = (s) => [...s].sort().join("|");
      const setsEqual = (a, b) => a.size === b.size && [...a].every(g => b.has(g));
      const myStages = (pd.stageArtists || []).filter(sa => sa.length >= 1);
      if (myStages.length === 0) return false;
      const myKeys = new Set(myStages.map(sa => setKey(genreSet(sa))));
      for (const [opid, opd] of Object.entries(ctx.allPlayerData || {})) {
        if (parseInt(opid) === ctx.currentPid) continue;
        const oStages = (opd.stageArtists || []).filter(sa => sa.length >= 1);
        for (const os of oStages) {
          if (myKeys.has(setKey(genreSet(os)))) return true;
        }
      }
      return false;
    }
  },

  // ─── Progression deck (year 2+) — mostly 1 copy each, Purists is 3 copies ───
  // v146 xlsx update: culled the 6 single-genre objectives (Popstars/Rock On/Disc Jockeys/
  // Fire Verses/Indiependent/Funky Town), old Eclectic (3+ genres), Same Song Sheet, and
  // Experimental. Added Purists (full single-genre), Cohesive (share one common genre),
  // Big Finish (headliner Fame ≥4), Guilty Pleasures (headliner Fame = 3). Renamed
  // Experimental → Eclectic (each artist mixes 2+ genres).
  { id: "leading_example", name: "Leading by Example", req: "Play a stage where the 2nd and 3rd artists both have lower Fame cost than the 1st", source: "progression", copies: 1,
    check: (pd) => (pd.stageArtists || []).some(sa => sa.length === 3 && (sa[1].fame || 0) < (sa[0].fame || 0) && (sa[2].fame || 0) < (sa[0].fame || 0)) },
  { id: "switching_up", name: "Switching it Up", req: "Play a full 3-artist lineup covering exactly 2 distinct genres", source: "progression", copies: 1,
    check: (pd) => (pd.stageArtists || []).some(sa => {
      if (sa.length !== 3) return false;
      const genres = new Set();
      sa.forEach(a => (a.genre || "").split(",").map(g => g.trim()).forEach(g => g && genres.add(g)));
      return genres.size === 2;
    }) },
  { id: "no_effects", name: "Music that Speaks for Itself", req: "Play a full lineup where every artist has no effect", source: "progression", copies: 1,
    check: (pd) => (pd.stageArtists || []).some(sa => sa.length === 3 && sa.every(a => !(a.effect || "").trim())) },
  { id: "high_profile", name: "High Profile", req: "Play a full lineup whose combined Security cost is 5+", source: "progression", copies: 1,
    check: (pd) => (pd.stageArtists || []).some(sa => sa.length === 3 && sa.reduce((s, a) => s + (a.securityCost || 0), 0) >= 5) },
  { id: "foodies", name: "Foodies", req: "Play a full lineup whose combined Catering cost is 5+", source: "progression", copies: 1,
    check: (pd) => (pd.stageArtists || []).some(sa => sa.length === 3 && sa.reduce((s, a) => s + (a.cateringCost || 0), 0) >= 5) },
  { id: "pampered", name: "Pampered", req: "Play a full lineup whose combined Portaloo cost is 5+", source: "progression", copies: 1,
    check: (pd) => (pd.stageArtists || []).some(sa => sa.length === 3 && sa.reduce((s, a) => s + (a.portalooCost || 0), 0) >= 5) },
  { id: "price_of_fame", name: "The Price of Fame", req: "Play a full lineup with a combined amenity cost of 13+", source: "progression", copies: 1,
    check: (pd) => (pd.stageArtists || []).some(sa => sa.length === 3 && sa.reduce((s, a) => s + (a.campCost || 0) + (a.securityCost || 0) + (a.cateringCost || 0) + (a.portalooCost || 0), 0) >= 13) },
  { id: "industry_friends", name: "Industry Friends", req: "Feature two lineups whose headliners share a genre", source: "progression", copies: 1,
    check: (pd) => {
      const heads = (pd.stageArtists || []).filter(sa => sa.length === 3).map(sa => (sa[2].genre || "").split(",").map(g => g.trim()));
      for (let i = 0; i < heads.length; i++) for (let j = i + 1; j < heads.length; j++) if (heads[i].some(g => heads[j].includes(g))) return true;
      return false;
    } },
  // v146: Big Finish — headliner (3rd artist on a full stage) has Fame cost ≥4.
  { id: "big_finish", name: "Big Finish", req: "Feature a headliner who is 4+ Fame", source: "progression", copies: 1,
    check: (pd) => (pd.stageArtists || []).some(sa => sa.length === 3 && (sa[2].fame || 0) >= 4) },
  // v146: Eclectic — was "Experimental" pre-v146. Each artist on a stage has 2+ genres.
  { id: "eclectic", name: "Eclectic", req: "Play a full lineup where each artist has 2+ genres", source: "progression", copies: 1,
    check: (pd) => (pd.stageArtists || []).some(sa => sa.length === 3 && sa.every(a => (a.genre || "").split(",").filter(g => g.trim()).length >= 2)) },
  { id: "fair_share", name: "Fair Share", req: "Play a full lineup where every artist needs the same total number of amenities", source: "progression", copies: 1,
    check: (pd) => (pd.stageArtists || []).some(sa => {
      if (sa.length !== 3) return false;
      const totals = sa.map(a => (a.campCost || 0) + (a.securityCost || 0) + (a.cateringCost || 0) + (a.portalooCost || 0));
      return totals[0] === totals[1] && totals[1] === totals[2];
    }) },
  // v146: Purists — a "pure" single-genre lineup: every artist has exactly ONE genre and
  // all 3 match. Multi-genre artists (Nelly = Pop+Hip Hop) don't qualify — that's Cohesive.
  // Quantity 3 per user's spec — more likely to be dealt in a game.
  { id: "purists", name: "Purists", req: "Play a full single-genre lineup (all Pop, all Rock, etc.) — no multi-genre artists", source: "progression", copies: 3,
    check: (pd) => (pd.stageArtists || []).some(sa => {
      if (sa.length !== 3) return false;
      const singleGenres = sa.map(a => (a.genre || "").split(",").map(g => g.trim()).filter(Boolean));
      if (singleGenres.some(gs => gs.length !== 1)) return false;
      return singleGenres[0][0] === singleGenres[1][0] && singleGenres[1][0] === singleGenres[2][0];
    }) },
  // v146: Cohesive — every artist shares at least one common genre (multi-genre artists
  // count as long as they overlap). Broader than Purists.
  { id: "cohesive", name: "Cohesive", req: "Play a lineup where all 3 artists share at least one common genre", source: "progression", copies: 1,
    check: (pd) => (pd.stageArtists || []).some(sa => {
      if (sa.length !== 3) return false;
      const genreSets = sa.map(a => (a.genre || "").split(",").map(g => g.trim()).filter(Boolean));
      const common = genreSets[0].filter(g => genreSets[1].includes(g) && genreSets[2].includes(g));
      return common.length >= 1;
    }) },
  // v146: Guilty Pleasures — headliner is exactly Fame 3.
  { id: "guilty_pleasures", name: "Guilty Pleasures", req: "Feature a headliner who is exactly 3 Fame", source: "progression", copies: 1,
    check: (pd) => (pd.stageArtists || []).some(sa => sa.length === 3 && (sa[2].fame || 0) === 3) },
  { id: "special_places", name: "Friends in Special Places", req: "Finish a lineup with a special guest", source: "progression", copies: 1,
    check: (pd, ctx) => (ctx.yearEvents?.[ctx.currentPid]?.specialGuestPlacedThisYear || 0) >= 1 },
];

const getAltObjective = (id) => ALT_OBJECTIVES.find(o => o.id === id);
function buildAltObjectiveDeck() {
  const deck = [];
  ALT_OBJECTIVES.forEach(o => { for (let i = 0; i < o.copies; i++) deck.push(o.id); });
  return deck;
}

// v154: Festival Identities. Each player picks 1 of 3 dealt at game start (before
// they see their artists). The identity's benefit/penalty fires throughout the game
// via hooks in the play/tempt/special-guest/year-end paths. Every ticket/fame movement
// caused by an identity is logged into `identityLog` so the player can hover to see
// how their identity is scoring for them.
//
// Each identity has:
//   id      — stable string key
//   name    — display name
//   flavor  — one-line thematic description
//   goal    — what the player is trying to do
//   benefit — plain-English benefit description (shown in picker + panel)
//   penalty — plain-English penalty description
// Effect resolution is centralized in `applyIdentityOnPlay` / `applyIdentityOnTempt` /
// etc. below (see main component), not on the identity object, to avoid stale-closure
// pain with player data. The `type` field routes to the correct hook.
const ALL_IDENTITIES = [
  {
    id: "counter_culture", name: "Counter Culture", type: "counterCulture",
    goal: "Tempt artists with 3 Fame or less",
    benefit: "Gain 1 Fame every time you tempt these artists. +1 ticket every time you play an artist under 4 Fame.",
    penalty: "-2 tickets when you play artists who cost 4 or more Fame",
  },
  {
    id: "family_friendly", name: "Family Friendly", type: "genrePair",
    inGenres: ["Pop", "Rock"], benefitTickets: 2, penaltyTickets: -1,
    goal: "Play Pop or Rock artists",
    benefit: "+2 tickets every time you play a Pop or Rock artist.",
    penalty: "-1 ticket every time you play an artist who is not Pop or Rock.",
  },
  {
    id: "rave_culture", name: "Rave Culture", type: "genrePair",
    inGenres: ["Electronic", "Indie"], benefitTickets: 2, penaltyTickets: -1,
    goal: "Play Electronic or Indie artists",
    benefit: "+2 tickets every time you play an Electronic or Indie artist.",
    penalty: "-1 ticket every time you play an artist who is not Electronic or Indie.",
  },
  {
    id: "popularity_contest", name: "Popularity Contest", type: "genrePair",
    inGenres: ["Pop", "Hip Hop"], benefitTickets: 2, penaltyTickets: -1,
    goal: "Play Pop or Hip Hop artists",
    benefit: "+2 tickets every time you play a Pop or Hip Hop artist.",
    penalty: "-1 ticket every time you play an artist who is not Pop or Hip Hop.",
  },
  {
    id: "band_together", name: "Band Together", type: "genrePair",
    inGenres: ["Rock", "Indie"], benefitTickets: 2, penaltyTickets: -1,
    goal: "Play Rock or Indie artists",
    benefit: "+2 tickets every time you play a Rock or Indie artist.",
    penalty: "-1 ticket every time you play an artist who is not Rock or Indie.",
  },
  {
    id: "superbad", name: "Superbad", type: "genrePair",
    inGenres: ["Hip Hop", "Funk"], benefitTickets: 2, penaltyTickets: -1,
    goal: "Play Hip Hop or Funk artists",
    benefit: "+2 tickets every time you play a Hip Hop or Funk artist.",
    penalty: "-1 ticket every time you play an artist who is not Hip Hop or Funk.",
  },
  {
    id: "groove_armada", name: "Groove Armada", type: "genrePair",
    inGenres: ["Electronic", "Funk"], benefitTickets: 2, penaltyTickets: -1,
    goal: "Play Electronic or Funk artists",
    benefit: "+2 tickets every time you play an Electronic or Funk artist.",
    penalty: "-1 ticket every time you play an artist who is not Electronic or Funk.",
  },
  {
    id: "full_of_surprises", name: "Full of Surprises", type: "fullOfSurprises",
    goal: "Play a special guest",
    benefit: "Each stage that is 2/3 full receives a special guest opportunity. +4 tickets every time you successfully play a special guest.",
    penalty: "-3 tickets every time you fill the last slot of a stage by playing an artist normally.",
  },
  {
    id: "curated", name: "Curated", type: "curated",
    goal: "Play no more than 6 artists in a year",
    benefit: "At year end, if you played ≤6 artists: +1 ticket per artist played.",
    penalty: "At year end, -3 tickets per artist played above 6.",
  },
  {
    id: "local_talent", name: "Local Talent", type: "localTalent",
    goal: "Play only 0-2 Fame artists",
    benefit: "+2 tickets every time you play an artist who costs 2 Fame or less.",
    penalty: "-2 tickets for artists who cost 3 Fame or more.",
  },
  {
    id: "confetti_cannons", name: "Confetti Cannons", type: "effectMatch",
    hasEffect: true, benefitTickets: 2, penaltyTickets: -1,
    goal: "Play artists with effects",
    benefit: "+2 tickets every time you play an artist with an effect.",
    penalty: "-1 ticket every time you play an artist without an effect.",
  },
  {
    id: "keeping_it_simple", name: "Keeping it Simple", type: "keepingItSimple",
    goal: "Play artists without effects",
    benefit: "+4 tickets every time you play an artist without an effect.",
    penalty: "Artists with effects provide no ticket sales (base tickets zeroed).",
  },
];
const getIdentity = (id) => ALL_IDENTITIES.find(i => i.id === id);



function shuffle(arr) { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function rollDice() { return shuffle([...DICE_OPTIONS]).slice(0, 5); }
function diceNeedReroll(dice) { if (dice.length < 3) return true; const faces = new Set(dice); return faces.size === 1; }
function getGenres(genre) { return genre.split(",").map(g => g.trim()); }

// True iff `lineup` (array of artists) can cover all required genres, with each artist
// assigned to exactly one required genre and each requirement covered by exactly one artist.
// The previous greedy "first match wins" approach failed on cases like:
//   required = [Rock, Pop, Indie], lineup = [Sadchild(Pop), Wolf Alice(Rock,Indie), Limp Bizkit(Rock)]
// where it consumed Wolf Alice for Rock, leaving Indie uncovered. Backtracking is correct
// (and trivially fast for ≤3 artists × ≤3 genres).
function lineupCoversGenres(lineup, required) {
  if (!Array.isArray(lineup) || !Array.isArray(required) || lineup.length < required.length) return false;
  const artistGenreLists = lineup.map(a => getGenres(a.genre || ""));
  const used = new Array(artistGenreLists.length).fill(false);
  function tryAssign(reqIdx) {
    if (reqIdx === required.length) return true;
    const g = required[reqIdx];
    for (let ai = 0; ai < artistGenreLists.length; ai++) {
      if (used[ai]) continue;
      if (artistGenreLists[ai].includes(g)) {
        used[ai] = true;
        if (tryAssign(reqIdx + 1)) return true;
        used[ai] = false;
      }
    }
    return false;
  }
  return tryAssign(0);
}

// Returns the count of required genres still uncovered by the best assignment of `partial`
// to `required`. Used by AI scoring to estimate progress toward an objective.
function genresStillNeeded(partial, required) {
  if (!Array.isArray(partial) || partial.length === 0) return required.length;
  const artistGenreLists = partial.map(a => getGenres(a.genre || ""));
  // For each subset size k of artists used, find max requirements covered. We just want the
  // max coverage: try assigning each artist to one requirement (or skip), maximize count.
  let best = 0;
  const used = new Array(artistGenreLists.length).fill(false);
  const reqUsed = new Array(required.length).fill(false);
  function dfs(reqIdx, covered) {
    if (covered > best) best = covered;
    if (reqIdx === required.length) return;
    // Skip this requirement
    dfs(reqIdx + 1, covered);
    // Try to cover this requirement
    const g = required[reqIdx];
    for (let ai = 0; ai < artistGenreLists.length; ai++) {
      if (used[ai]) continue;
      if (artistGenreLists[ai].includes(g)) {
        used[ai] = true;
        dfs(reqIdx + 1, covered + 1);
        used[ai] = false;
      }
    }
  }
  dfs(0, 0);
  return required.length - best;
}

function genreGradient(genre) {
  const gs = getGenres(genre);
  if (gs.length === 1) return GENRE_COLORS[gs[0]] || "#6b7280";
  return `linear-gradient(135deg, ${GENRE_COLORS[gs[0]] || "#6b7280"} 50%, ${GENRE_COLORS[gs[1]] || "#6b7280"} 50%)`;
}
function canAffordArtist(artist, pd, fameReduction = 0) {
  if (pd.fame < Math.max(0, artist.fame - fameReduction)) return false;
  const a = pd.amenities || {};
  return (a.campsite||0) >= artist.campCost && (a.security||0) >= artist.securityCost && (a.catering||0) >= artist.cateringCost && (a.portaloo||0) >= artist.portalooCost;
}

// Genre-match headliner rule (v124): an artist can be booked into slot 3 (the headliner
// slot) of a specific stage WITHOUT paying amenity costs — if both artists already on
// that stage share at least one genre with the incoming headliner. The fame gate still
// applies. This creates a second booking economy alongside amenities: build infrastructure
// OR curate a coherent lineup. Multi-genre artists (Coldplay = Pop/Rock, The Cure = Indie/Rock,
// etc.) get a natural boost since they qualify multiple ways.
function canBookHeadlinerViaGenre(artist, pd, stageIdx) {
  if (!artist || !pd) return false;
  if ((pd.fame || 0) < (artist.fame || 0)) return false;
  const sa = (pd.stageArtists || [])[stageIdx];
  if (!sa || sa.length !== 2) return false;
  const headlinerGenres = new Set(getGenres(artist.genre));
  return sa.every(a => getGenres(a.genre).some(g => headlinerGenres.has(g)));
}

// v126+: is this artist eligible for the genre-match headliner BONUS effect on any stage?
// Returns true if (a) the artist has a non-empty genreMatchEffect defined AND (b) at least
// one stage would allow the genre-match booking path. Used to glow the card in the UI so
// players can spot the bonus opportunity at a glance.
function hasGenreMatchBonusAvailable(artist, pd) {
  if (!artist || !pd) return false;
  if (!artist.genreMatchEffect || !artist.genreMatchEffect.trim()) return false;
  const stages = pd.stageArtists || [];
  return stages.some((_, i) => canBookHeadlinerViaGenre(artist, pd, i));
}

// Is booking this artist onto this specific stage legal? Combines fame check + open-slot
// check + (amenities OR genre-match).
function canBookArtistOnStage(artist, pd, stageIdx) {
  if (!artist || !pd) return false;
  if ((pd.fame || 0) < (artist.fame || 0)) return false;
  const sa = (pd.stageArtists || [])[stageIdx];
  if (!sa || sa.length >= 3) return false;
  if (canAffordArtist(artist, pd)) return true;
  return canBookHeadlinerViaGenre(artist, pd, stageIdx);
}

// Is there ANY stage where this artist could be booked (amenities or genre-match)?
// Used to gate pre-select UI actions.
function canBookArtistAnywhere(artist, pd) {
  if (!artist || !pd) return false;
  if ((pd.fame || 0) < (artist.fame || 0)) return false;
  const openStages = (pd.stageArtists || []).map((sa, i) => sa.length < 3 ? i : -1).filter(i => i >= 0);
  if (openStages.length === 0) return false;
  if (canAffordArtist(artist, pd)) return true;
  return openStages.some(si => canBookHeadlinerViaGenre(artist, pd, si));
}

// v194: tempt-to-stage rule. A tempted artist can only land DIRECTLY on a stage if the
// stage already contains at least 1 artist AND every existing artist's genre set is a
// subset of the incoming artist's genres. Empty stages don't qualify. Amenity costs are
// ignored on this path — tempt-to-stage is now a pure genre-match mechanic, distinct
// from the amenity-driven hand-play path.
//
// Rule check: for each existing artist on the stage, ALL of that artist's genres must
// appear in the incoming artist's genres. Equivalently: the union of existing genres
// must be a subset of the incoming artist's genres. Fame gating still applies.
//
// Example — tempting Lady Gaga (Pop, Electronic):
//   Stage: CRUEL MISTRESS (Electronic) + Sadchild (Pop) → allowed
//   Stage: Rock-Pop artist + Electronic-Indie artist → blocked (Rock and Indie not in Gaga's set)
//   Stage: empty → blocked
//   Stage: full (3 artists) → blocked
function canTemptDirectToStage(artist, pd, stageIdx) {
  if (!artist || !pd) return false;
  if ((pd.fame || 0) < (artist.fame || 0)) return false;
  const sa = (pd.stageArtists || [])[stageIdx];
  if (!sa || sa.length === 0 || sa.length >= 3) return false;
  const incomingGenres = new Set(getGenres(artist.genre));
  for (const existing of sa) {
    const existingGenres = getGenres(existing.genre);
    // Every existing genre must be in the incoming set. If ANY existing genre falls
    // outside the incoming artist's genres, this stage is not a valid tempt target.
    if (!existingGenres.every(g => incomingGenres.has(g))) return false;
  }
  return true;
}

function canTemptToAnyStage(artist, pd) {
  if (!artist || !pd) return false;
  const stages = pd.stageArtists || [];
  return stages.some((_, i) => canTemptDirectToStage(artist, pd, i));
}
function getAvailableStages(pd) {
  return pd.stages.filter((_, i) => (pd.stageArtists?.[i] || []).length < 3);
}

// ═══════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════
// v132: Ticket-count hover tooltip. Shows a categorized breakdown of every ticket the
// player currently holds — campsite bonus, per-artist contributions on stages, active
// council rewards, and every logged effect/objective/roll/microtrend gain from the ledger.
// Rendered as a fixed-position tooltip anchored to the cursor so it works cleanly in
// both the desktop and mobile stat rows without overflow-clipping problems.
function TicketBreakdown({ pd, pid, ticketsLog, ALL_GENRES, year, councilQualifies, children, style }) {
  const [hover, setHover] = React.useState(false);
  const [pos, setPos] = React.useState({ x: 0, y: 0 });
  if (!pd) return <span style={style}>{children}</span>;

  const am = pd.amenities || {};
  const y = year || 1;
  const yIdx = Math.max(0, Math.min(3, y - 1));
  const rows = [];
  const campsites = (am.campsite || 0) * 2;
  if (campsites > 0) rows.push({ label: "⛺ Campsites", amount: campsites });
  (pd.stageArtists || []).forEach(sa => sa.forEach(a => {
    const contrib = (a.tickets || 0) + (a.vp || 0);
    if (contrib > 0) rows.push({ label: `🎤 ${a.name}`, amount: contrib });
  }));
  (pd.councils || []).forEach((c, i) => {
    if (!c || c.reward?.type !== "tickets") return;
    if (!councilQualifies(c, (pd.fields || [])[i], y)) return;
    const contrib = c.reward.perYear?.[yIdx] || 0;
    if (contrib !== 0) rows.push({ label: `📋 ${c.name}`, amount: contrib });
  });
  const log = (ticketsLog && ticketsLog[pid]) || [];
  // v147: filter to entries logged this year only. Previously aggregated across all
  // history, so entering a new year (tickets reset to 0) still showed "-5 tickets from
  // last year's Nelly effect" as if it were current. Bounds the hover to what the number
  // above it actually reflects.
  const currentYear = year || 1;
  const aggregated = {};
  log.filter(e => e.year === currentYear).forEach(e => { aggregated[e.source] = (aggregated[e.source] || 0) + e.amount; });
  const effectRows = Object.entries(aggregated)
    .filter(([_, amount]) => amount !== 0)
    .sort((a, b) => Math.abs(b[1]) - Math.abs(a[1]));
  const total = rows.reduce((s, r) => s + r.amount, 0) + effectRows.reduce((s, r) => s + r[1], 0);

  return (
    <span
      onMouseEnter={e => { setPos({ x: e.clientX, y: e.clientY }); setHover(true); }}
      onMouseLeave={() => setHover(false)}
      onMouseMove={e => setPos({ x: e.clientX, y: e.clientY })}
      style={{ ...style, cursor: "help", position: "relative" }}
    >
      {children}
      {hover && (rows.length > 0 || effectRows.length > 0) && (
        <div style={{
          position: "fixed", left: Math.min(pos.x + 14, (typeof window !== "undefined" ? window.innerWidth - 320 : 800)), top: Math.min(pos.y + 14, (typeof window !== "undefined" ? window.innerHeight - 400 : 500)),
          zIndex: 9999, minWidth: 260, maxWidth: 320, maxHeight: 400, overflowY: "auto",
          padding: 12, borderRadius: 10, background: "rgba(15,14,26,0.98)", border: "2px solid #fbbf24",
          boxShadow: "0 8px 24px rgba(0,0,0,0.6)", color: "#e2e8f0", fontSize: 11, fontWeight: 400,
          textAlign: "left", pointerEvents: "none",
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#fbbf24", marginBottom: 8, paddingBottom: 6, borderBottom: "1px solid rgba(251,191,36,0.3)" }}>
            🎟️ Ticket breakdown
          </div>
          {rows.length > 0 && rows.map((r, i) => (
            <div key={"r"+i} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "2px 0" }}>
              <span style={{ color: "#e2e8f0" }}>{r.label}</span>
              <span style={{ color: r.amount >= 0 ? "#86efac" : "#f87171", fontWeight: 600, whiteSpace: "nowrap" }}>{r.amount >= 0 ? "+" : ""}{r.amount}</span>
            </div>
          ))}
          {effectRows.length > 0 && <>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#8b5cf6", marginTop: 8, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Effects & bonuses</div>
            {effectRows.map(([source, amount], i) => (
              <div key={"e"+i} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "2px 0" }}>
                <span style={{ color: "#c4b5fd" }}>{source}</span>
                <span style={{ color: amount >= 0 ? "#86efac" : "#f87171", fontWeight: 600, whiteSpace: "nowrap" }}>{amount >= 0 ? "+" : ""}{amount}</span>
              </div>
            ))}
          </>}
          <div style={{ marginTop: 8, paddingTop: 6, borderTop: "1px solid rgba(251,191,36,0.3)", display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 12 }}>
            <span style={{ color: "#fbbf24" }}>Total tickets</span>
            <span style={{ color: "#fbbf24" }}>{pd.tickets || 0}</span>
          </div>
          {Math.abs(total - (pd.tickets || 0)) > 0 && <div style={{ marginTop: 4, fontSize: 9, color: "#64748b", fontStyle: "italic" }}>(Sum {total} may differ from total — ledger doesn't retro-track pre-v132 games.)</div>}
        </div>
      )}
    </span>
  );
}

// v148: parallel to TicketBreakdown — shows this year's fame gains and losses on hover.
// Aggregates entries in `fameLog` filtered to the current year, splitting into gains and
// losses. Losses include tempt spends (source is the artist tempted) and year carryover.
function FameBreakdown({ pid, fameLog, year, children, style, currentFame }) {
  const [hover, setHover] = React.useState(false);
  const [pos, setPos] = React.useState({ x: 0, y: 0 });
  const log = (fameLog && fameLog[pid]) || [];
  const currentYear = year || 1;
  const thisYear = log.filter(e => e.year === currentYear);
  const aggregated = {};
  thisYear.forEach(e => { aggregated[e.source] = (aggregated[e.source] || 0) + e.amount; });
  const gains = Object.entries(aggregated).filter(([_, a]) => a > 0).sort((a, b) => b[1] - a[1]);
  const losses = Object.entries(aggregated).filter(([_, a]) => a < 0).sort((a, b) => a[1] - b[1]);
  return (
    <span
      onMouseEnter={e => { setPos({ x: e.clientX, y: e.clientY }); setHover(true); }}
      onMouseLeave={() => setHover(false)}
      onMouseMove={e => setPos({ x: e.clientX, y: e.clientY })}
      style={{ ...style, cursor: "help", position: "relative" }}
    >
      {children}
      {hover && (gains.length > 0 || losses.length > 0) && (
        <div style={{
          position: "fixed", left: Math.min(pos.x + 14, (typeof window !== "undefined" ? window.innerWidth - 320 : 800)), top: Math.min(pos.y + 14, (typeof window !== "undefined" ? window.innerHeight - 400 : 500)),
          zIndex: 9999, minWidth: 240, maxWidth: 320, maxHeight: 400, overflowY: "auto",
          padding: 12, borderRadius: 10, background: "rgba(15,14,26,0.98)", border: "2px solid #f97316",
          boxShadow: "0 8px 24px rgba(0,0,0,0.6)", color: "#e2e8f0", fontSize: 11, fontWeight: 400,
          textAlign: "left", pointerEvents: "none",
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#f97316", marginBottom: 8, paddingBottom: 6, borderBottom: "1px solid rgba(249,115,22,0.3)" }}>
            🔥 Fame this year
          </div>
          {gains.length > 0 && <>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#86efac", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Gained</div>
            {gains.map(([source, amount], i) => (
              <div key={"g"+i} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "2px 0" }}>
                <span style={{ color: "#c4b5fd" }}>{source}</span>
                <span style={{ color: "#86efac", fontWeight: 600, whiteSpace: "nowrap" }}>+{amount}</span>
              </div>
            ))}
          </>}
          {losses.length > 0 && <>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#f87171", marginTop: gains.length > 0 ? 8 : 0, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>Spent / Lost</div>
            {losses.map(([source, amount], i) => (
              <div key={"l"+i} style={{ display: "flex", justifyContent: "space-between", gap: 12, padding: "2px 0" }}>
                <span style={{ color: "#c4b5fd" }}>{source}</span>
                <span style={{ color: "#f87171", fontWeight: 600, whiteSpace: "nowrap" }}>{amount}</span>
              </div>
            ))}
          </>}
          <div style={{ marginTop: 8, paddingTop: 6, borderTop: "1px solid rgba(249,115,22,0.3)", display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 12 }}>
            <span style={{ color: "#f97316" }}>Current Fame</span>
            <span style={{ color: "#f97316" }}>{currentFame || 0}</span>
          </div>
        </div>
      )}
    </span>
  );
}

function ArtistCard({ artist, onClick, small, disabled, selected, showCost, affordable, genreMatchGlow }) {
  const gs = getGenres(artist.genre);
  const bg = gs.length === 1 ? GENRE_COLORS[gs[0]] || "#6b7280" : null;
  const grad = gs.length > 1 ? `linear-gradient(135deg, ${GENRE_COLORS[gs[0]] || "#6b7280"} 50%, ${GENRE_COLORS[gs[1]] || "#6b7280"} 50%)` : undefined;
  const mob = typeof window !== 'undefined' && window.innerWidth < 768;
  const sz = small
    ? (mob ? { width: 140, minHeight: 100, padding: "8px 10px", fontSize: 12 } : { width: 110, minHeight: 90, padding: "6px 8px", fontSize: 10 })
    : (mob ? { width: 170, minHeight: 140, padding: "10px 12px", fontSize: 13 } : { width: 150, minHeight: 130, padding: "8px 10px", fontSize: 11 });
  const fs = mob ? { name: small?12:14, meta: small?10:11, cost: 11, effect: small?9:10 } : { name: small?10:12, meta: small?8:9, cost: 10, effect: small?7:8 };
  // v126+: genre-match glow. When a headliner-eligible artist has a genreMatchEffect AND
  // there's a stage in the player's festival with 2 matching-genre artists ready to accept
  // them as headliner, the card gains a gold aura. This signals "there's a bonus available
  // on this artist right now" — the amenity-free booking + the extra effect layered on top.
  const glowBorder = genreMatchGlow ? "2px solid #fbbf24" : (selected ? "2px solid #fbbf24" : affordable ? "2px solid rgba(251,191,36,0.5)" : "2px solid rgba(255,255,255,0.15)");
  const glowShadow = genreMatchGlow
    ? "0 0 16px rgba(251,191,36,0.85), 0 0 32px rgba(251,191,36,0.45)"
    : (selected ? "0 0 12px rgba(251,191,36,0.4)" : "0 2px 8px rgba(0,0,0,0.3)");
  return (
    <div onClick={disabled ? undefined : onClick} style={{
      ...sz, borderRadius: mob?12:10, border: glowBorder,
      background: grad || bg, color: "#fff", cursor: disabled ? "default" : "pointer",
      opacity: disabled ? 0.4 : 1, display: "flex", flexDirection: "column", gap: mob?3:2,
      position: "relative", overflow: "hidden", transition: "all 0.15s", flexShrink: 0,
      boxShadow: glowShadow,
      animation: genreMatchGlow ? "genreMatchGlow 1.6s ease-in-out infinite" : (affordable && !disabled && !selected ? "affordPulse 2s ease-in-out infinite" : "none"),
    }}>
      {genreMatchGlow && <div style={{ position: "absolute", top: 4, right: 4, background: "rgba(251,191,36,0.95)", color: "#1a1a2e", fontSize: 9, fontWeight: 900, padding: "2px 5px", borderRadius: 5, letterSpacing: 0.5, boxShadow: "0 0 6px rgba(251,191,36,0.8)" }}>🎸</div>}
      <div style={{ fontWeight: 800, fontSize: fs.name, lineHeight: 1.2, textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>{artist.name}</div>
      <div style={{ fontSize: fs.meta, opacity: 0.9 }}>🔥{artist.fame} • {artist.genre}</div>
      <div style={{ fontSize: fs.meta, display: "flex", gap: mob?6:4, flexWrap: "wrap" }}>
        <span>🎟️{(artist.tickets || 0) + (artist.vp || 0)}</span>
      </div>
      {showCost && <div style={{ fontSize: fs.cost, opacity: 0.85, marginTop: 2 }}>
        {artist.campCost > 0 && <span>⛺{artist.campCost} </span>}
        {artist.securityCost > 0 && <span>👮‍♀️{artist.securityCost} </span>}
        {artist.cateringCost > 0 && <span>🍔{artist.cateringCost} </span>}
        {artist.portalooCost > 0 && <span>🚽{artist.portalooCost}</span>}
      </div>}
      {artist.effect && <div style={{ fontSize: fs.effect, fontStyle: "italic", opacity: 0.9, marginTop: "auto", textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>✨ {artist.effect}</div>}
      {artist.genreMatchEffect && genreMatchGlow && <div style={{ fontSize: fs.effect, fontStyle: "italic", opacity: 0.98, marginTop: artist.effect ? 2 : "auto", color: "#fde68a", textShadow: "0 1px 2px rgba(0,0,0,0.7)", fontWeight: 700 }}>🎸 Genre bonus: {artist.genreMatchEffect}</div>}
      {artist.agentEffect && <div style={{ fontSize: fs.effect, fontStyle: "italic", opacity: 0.95, marginTop: (artist.effect || artist.genreMatchEffect) ? 2 : "auto", color: "#fbbf24", textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>🕵️ Via agent: {artist.agentEffect}</div>}
    </div>
  );
}

function DiceDisplay({ dice, onPick, disabled, onReroll, canReroll }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", alignItems: "center" }}>
      {dice.map((d, i) => {
        const isFame = d === "fame";
        const isStage = d === "stage";
        const label = isFame ? "🔥" : isStage ? "🎪" : AMENITY_ICONS[d];
        const sub = isFame ? "Fame" : isStage ? "Stage" : AMENITY_LABELS[d];
        const borderColor = isFame ? "#fbbf24" : isStage ? "#4ade80" : "#7c3aed";
        const bg = isFame ? "linear-gradient(135deg, #422006, #713f12)" : isStage ? "linear-gradient(135deg, #052e16, #14532d)" : "linear-gradient(135deg, #1e1b4b, #312e81)";
        const textColor = isFame ? "#fbbf24" : isStage ? "#4ade80" : "#e9d5ff";
        return <button key={i} onClick={() => !disabled && onPick(i, d)} disabled={disabled} style={{
          width: 72, height: 80, borderRadius: 12, border: `2px solid ${borderColor}`,
          background: bg, color: textColor,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          gap: 2, cursor: disabled ? "default" : "pointer", fontSize: 22,
          opacity: disabled ? 0.4 : 1, transition: "all 0.2s",
        }}><span>{label}</span><span style={{ fontSize: 9, opacity: 0.8 }}>{sub}</span></button>;
      })}
      {canReroll && <button onClick={onReroll} style={{
        width: 72, height: 80, borderRadius: 12, border: "2px dashed #fbbf24",
        background: "rgba(251,191,36,0.15)", color: "#fbbf24",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        cursor: "pointer", fontSize: 14, fontWeight: 700, gap: 2,
      }}>🔄<span style={{ fontSize: 9 }}>Reroll All</span></button>}
    </div>
  );
}

function DiceRollOverlay({ pendingRoll, onRoll, onComplete, sfx }) {
  const [rolling, setRolling] = useState(false);
  const [animFrames, setAnimFrames] = useState([]);
  const [finalResults, setFinalResults] = useState(null);

  const doRoll = () => {
    if (rolling) return;
    setRolling(true);
    sfx?.placeAmenity();
    // Animate 6 frames of random dice, then settle
    let frame = 0;
    const iv = setInterval(() => {
      setAnimFrames(shuffle([...DICE_OPTIONS, ...DICE_OPTIONS]).slice(0, pendingRoll.count));
      frame++;
      if (frame >= 8) {
        clearInterval(iv);
        const results = shuffle([...DICE_OPTIONS, ...DICE_OPTIONS]).slice(0, pendingRoll.count);
        setFinalResults(results);
        setAnimFrames([]);
        setRolling(false);
        onRoll(results);
      }
    }, 120);
  };

  const display = finalResults || (rolling ? animFrames : null);
  const diceLabel = (d) => {
    if (d === "fame") return "🔥";
    if (d === "stage") return "🎪";
    return AMENITY_ICONS[d] || d;
  };

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 960, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e)", borderRadius: 20, padding: 32, textAlign: "center", maxWidth: 500, width: "100%", border: "2px solid #7c3aed", boxShadow: "0 0 40px rgba(124,58,237,0.3)" }}>
        <div style={{ fontSize: 16, color: "#c4b5fd", marginBottom: 4 }}>{pendingRoll.artistName}</div>
        <h2 style={{ color: "#fbbf24", fontSize: 24, margin: "0 0 16px" }}>🎲 Roll {pendingRoll.count} Dice!</h2>
        {!display && <button onClick={doRoll} style={{
          padding: "16px 40px", borderRadius: 14, border: "2px solid #fbbf24",
          background: "linear-gradient(135deg, #422006, #713f12)", color: "#fbbf24",
          fontSize: 20, fontWeight: 800, cursor: "pointer",
          animation: "pulse 1.5s infinite",
        }}>🎲 ROLL!</button>}
        {display && <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
          {display.map((d, i) => <div key={i} style={{
            width: 64, height: 70, borderRadius: 12,
            border: d === "fame" ? "2px solid #fbbf24" : "2px solid #7c3aed",
            background: d === "fame" ? "linear-gradient(135deg, #422006, #713f12)" : "linear-gradient(135deg, #1e1b4b, #312e81)",
            color: d === "fame" ? "#fbbf24" : "#e9d5ff",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            fontSize: 24, transition: rolling ? "none" : "all 0.3s",
            transform: rolling ? `rotate(${Math.random() * 20 - 10}deg)` : "none",
          }}><span>{diceLabel(d)}</span></div>)}
        </div>}
        {finalResults && !rolling && <>
          <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 12 }}>{typeof pendingRoll.resultText === "function" ? pendingRoll.resultText(finalResults) : (pendingRoll.resultText || "")}</div>
          <button onClick={() => onComplete(finalResults)} style={{
            padding: "10px 24px", borderRadius: 10, border: "none",
            background: "linear-gradient(135deg, #7c3aed, #a855f7)", color: "#fff",
            fontSize: 14, fontWeight: 700, cursor: "pointer",
          }}>Continue →</button>
        </>}
      </div>
    </div>
  );
}

function GameLog({ log, onClose }) {
  const groups = []; let cur = null;
  for (const e of log) { if (e.type === "header") { cur = { header: e, entries: [] }; groups.push(cur); } else { if (!cur) { cur = { header: null, entries: [] }; groups.push(cur); } cur.entries.push(e); } }
  return (
    <div style={{ position: "fixed", top: 0, right: 0, width: 360, height: "100vh", background: "#0f0e1a", borderLeft: "2px solid #7c3aed", zIndex: 1000, display: "flex", flexDirection: "column", boxShadow: "-4px 0 20px rgba(124,58,237,0.3)" }}>
      <div style={{ padding: "16px 20px", borderBottom: "1px solid #2a2a4a", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontWeight: 700, fontSize: 16, color: "#c4b5fd" }}>📜 Game Log</span>
        <button onClick={onClose} style={{ background: "none", border: "none", color: "#c4b5fd", fontSize: 20, cursor: "pointer" }}>✕</button>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: 12 }}>
        {groups.length === 0 && <p style={{ color: "#6b7280", fontSize: 13, padding: 8 }}>No events yet.</p>}
        {groups.map((g, i) => <div key={i} style={{ marginBottom: 16 }}>
          {g.header && <div style={{ padding: "6px 10px", marginBottom: 6, borderRadius: 8, background: g.header.ht === "year" ? "rgba(251,191,36,0.15)" : g.header.ht === "round" ? "rgba(248,113,113,0.15)" : "rgba(124,58,237,0.15)", borderLeft: `3px solid ${g.header.ht === "year" ? "#fbbf24" : g.header.ht === "round" ? "#f87171" : "#7c3aed"}` }}>
            <span style={{ fontWeight: 700, fontSize: 12, textTransform: "uppercase", letterSpacing: 1, color: g.header.ht === "year" ? "#fbbf24" : g.header.ht === "round" ? "#f87171" : "#c4b5fd" }}>{g.header.text}</span>
          </div>}
          {g.entries.map((e, j) => <div key={j} style={{ marginBottom: 4, marginLeft: 8, padding: "5px 10px", background: "rgba(124,58,237,0.06)", borderRadius: 6, fontSize: 12, color: "#d1d5db", borderLeft: "2px solid #3b3564" }}>
            <span style={{ color: "#a78bfa", fontWeight: 600 }}>{e.label}</span>
            <span style={{ marginLeft: 6, color: "#94a3b8" }}>{e.text}</span>
          </div>)}
        </div>)}
      </div>
    </div>
  );
}

function DiscardViewer({ discard, onClose }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 950, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div style={{ background: "#0f0e1a", border: "1px solid #7c3aed", borderRadius: 16, padding: 20, maxWidth: 700, maxHeight: "80vh", overflowY: "auto", width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h3 style={{ color: "#c4b5fd", margin: 0 }}>🗑️ Discard Pile ({discard.length} artists)</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#c4b5fd", fontSize: 20, cursor: "pointer" }}>✕</button>
        </div>
        {discard.length === 0 ? <p style={{ color: "#6b7280" }}>No discarded artists yet.</p> :
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {discard.map((a, i) => <ArtistCard key={i} artist={a} small showCost />)}
          </div>}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// PLAYER BOARD
// ═══════════════════════════════════════════════════════════
/** Visual representation of a player's festival: stages with their artists + amenity token piles */
function PlayerBoard({ pd, compact, stageColors, onStageClick, highlightStageIdx, pickStageMode, pickFieldMode, onFieldClick, fieldsDisabled, year, genreMatchStages }) {
  const stages = pd?.stages || [];
  const stageArtists = pd?.stageArtists || [];
  const stageNames = pd?.stageNames || [];
  const sColors = stageColors || pd?.stageColors || [];
  const am = pd?.amenities || {};
  const fields = pd?.fields || emptyFields();

  const stageBox = {
    minWidth: compact ? 150 : 180,
    padding: compact ? "10px 12px" : "12px 14px",
    borderRadius: 12,
    background: "rgba(15,14,26,0.9)",
    border: "1px solid #2a2a4a",
    cursor: onStageClick ? "pointer" : "default",
    flexShrink: 0,
  };
  const tokenStyle = (color, size) => ({
    width: size, height: size, borderRadius: "50%",
    background: color,
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    fontSize: size * 0.55,
    boxShadow: "0 2px 6px rgba(0,0,0,0.4), inset 0 -2px 4px rgba(0,0,0,0.25)",
    border: "1.5px solid rgba(255,255,255,0.15)",
    flexShrink: 0,
  });

  // Render up to N tokens per amenity type within a single field, then a "+N" pill
  const renderFieldTokens = (fieldData, type) => {
    const count = fieldData?.[type] || 0;
    if (count === 0) return null;
    const cap = compact ? 4 : 6;
    const visible = Math.min(count, cap);
    const tokens = [];
    const tSize = compact ? 20 : 24;
    for (let i = 0; i < visible; i++) {
      tokens.push(<div key={i} style={{ ...tokenStyle(AMENITY_COLORS[type], tSize), marginLeft: i === 0 ? 0 : -tSize * 0.35 }}>{AMENITY_ICONS[type]}</div>);
    }
    if (count > cap) {
      tokens.push(<div key="more" style={{ marginLeft: 4, fontSize: 10, color: "#c4b5fd", fontWeight: 700 }}>+{count - cap}</div>);
    }
    return <div style={{ display: "flex", alignItems: "center" }}>{tokens}</div>;
  };

  const totalAmenities = (am.campsite || 0) + (am.security || 0) + (am.catering || 0) + (am.portaloo || 0);

  return (
    <div style={{ width: "100%" }}>
      {/* Stages row */}
      {stages.length > 0 && <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginBottom: 14 }}>
        {stages.map((_st, si) => {
          const sa = stageArtists[si] || [];
          const stageColor = sColors[si] || "#7c3aed";
          const isHL = highlightStageIdx === si;
          const isBookable = pickStageMode && sa.length < 3;
          // v124: genre-match highlight. When the caller passes a genreMatchStages set,
          // stages in it use a gold accent + "Genre Match" hint to distinguish from
          // regular (amenity-paid) bookable stages.
          const isGenreMatch = !!(isBookable && genreMatchStages && genreMatchStages.has(si));
          const displayColor = isGenreMatch ? "#fbbf24" : stageColor;
          return <div key={si} onClick={() => onStageClick && onStageClick(si)} style={{
            ...stageBox,
            borderColor: isBookable ? displayColor : (isHL ? stageColor : "#2a2a4a"),
            borderWidth: isBookable ? 2 : 1,
            background: isBookable ? `${displayColor}15` : stageBox.background,
            boxShadow: isBookable ? `0 0 12px ${displayColor}80` : (isHL ? `0 0 12px ${stageColor}80` : "none"),
            animation: isBookable ? "affordPulse 1.5s ease-in-out infinite" : "none",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: stageColor }} />
              <div style={{ fontSize: 10, fontWeight: 700, color: "#e9d5ff", textTransform: "uppercase", letterSpacing: 0.5 }}>🎤 {stageNames[si] || `Stage ${si + 1}`}</div>
              {sa.length === 3 && <span style={{ fontSize: 9, color: "#34d399", marginLeft: "auto" }}>✅</span>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {[0, 1, 2].map(slot => {
                const a = sa[slot];
                if (!a) return <div key={slot} style={{ padding: "3px 6px", borderRadius: 6, background: "rgba(255,255,255,0.03)", border: "1px dashed #4c1d9540", color: "#4c1d95", fontSize: 9, textAlign: "center" }}>Empty</div>;
                const isHeadliner = slot === 2;
                return <div key={slot} style={{ padding: "3px 6px", borderRadius: 6, background: genreGradient(a.genre), color: "#fff", fontSize: 10, fontWeight: 700, display: "flex", justifyContent: "space-between", gap: 4, border: isHeadliner ? "1px solid #fbbf24" : "1px solid transparent" }}>
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{isHeadliner ? "★ " : ""}{a.name}</span>
                  <span style={{ flexShrink: 0 }}>🎟️{a.tickets}</span>
                </div>;
              })}
            </div>
            {isBookable && !isGenreMatch && <div style={{ fontSize: 9, color: "#fbbf24", fontStyle: "italic", marginTop: 4, textAlign: "center" }}>↑ Click to book here</div>}
            {isBookable && isGenreMatch && <div style={{ fontSize: 9, color: "#fbbf24", fontWeight: 700, marginTop: 4, textAlign: "center", background: "rgba(251,191,36,0.15)", padding: "2px 4px", borderRadius: 4 }}>🎸 Genre Match — no amenities needed!</div>}
          </div>;
        })}
      </div>}
      {/* v189: single unified amenity area — no fields, no councils */}
      <div style={{ display: "flex", justifyContent: "center", maxWidth: 620, margin: "0 auto" }}>
        {(() => {
          const totals = am;
          const anyAmenity = totalAmenities > 0;
          return <div style={{
            padding: compact ? 10 : 14,
            borderRadius: 12,
            background: "rgba(15,14,26,0.6)",
            border: "1px solid rgba(124,58,237,0.2)",
            display: "flex",
            flexDirection: "column",
            width: "100%",
            transition: "all 0.2s",
          }}>
            <div style={{ fontSize: 10, color: "#a78bfa", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 10, textAlign: "center" }}>🎪 Festival Grounds</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
              {AMENITY_TYPES.map(t => {
                const c = totals[t] || 0;
                return <div key={t} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "6px 10px", borderRadius: 6, background: c > 0 ? `${AMENITY_COLORS[t]}18` : "rgba(0,0,0,0.18)", opacity: c > 0 ? 1 : 0.4, minHeight: compact ? 28 : 32 }}>
                  <span style={{ fontSize: 12, color: AMENITY_COLORS[t], fontWeight: 700 }}>{AMENITY_ICONS[t]} {c}</span>
                  {c > 0 && renderFieldTokens({ [t]: c }, t)}
                </div>;
              })}
            </div>
            {!anyAmenity && <div style={{ fontSize: 10, color: "#475569", textAlign: "center", marginTop: 8, fontStyle: "italic" }}>no amenities yet</div>}
          </div>;
        })()}
      </div>
      {totalAmenities === 0 && stages.length === 0 && <div style={{ textAlign: "center", color: "#6b7280", fontSize: 12, padding: 20 }}>No stages or amenities yet</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// AI ENGINE
// ═══════════════════════════════════════════════════════════

/** Find a valid hex to place an amenity (not on stage, not occupied) */
// v152: identify the AI's aspirational target — the biggest headliner in their hand
// that they can plausibly grow toward. Prefer Fame 4-5 artists (proper headliners);
// fall back to the highest-fame artist available. Returns null if hand is empty.
// Used by amenity picking (to bias toward the target's requirements) and tempt scoring
// (to keep target artists on the AI's radar even when unaffordable this turn).
function aiFindTargetHeadliner(pd) {
  const hand = pd?.hand || [];
  if (hand.length === 0) return null;
  const heavyweights = hand.filter(a => (a.fame || 0) >= 4);
  if (heavyweights.length > 0) return heavyweights.sort((x, y) => (y.fame || 0) - (x.fame || 0))[0];
  return [...hand].sort((x, y) => (y.fame || 0) - (x.fame || 0))[0];
}

// v152: extract the AI's target-headliner amenity gaps, or null if no target.
// Returns { target, gaps: { campsite, security, catering, portaloo } } where each gap
// is max(0, target.cost - current). Zero-gap types are already satisfied.
function aiTargetHeadlinerGaps(pd) {
  const target = aiFindTargetHeadliner(pd);
  if (!target) return null;
  const a = pd?.amenities || {};
  return {
    target,
    gaps: {
      campsite: Math.max(0, (target.campCost || 0) - (a.campsite || 0)),
      security: Math.max(0, (target.securityCost || 0) - (a.security || 0)),
      catering: Math.max(0, (target.cateringCost || 0) - (a.catering || 0)),
      portaloo: Math.max(0, (target.portalooCost || 0) - (a.portaloo || 0)),
    },
  };
}

function aiPickAmenityType(pd, infraContext) {
  const a = pd.amenities || {};
  const c = (t) => a[t] || 0;
  // v152: council + target-headliner-aware scoring. The AI now bakes three signals into
  // its amenity choice:
  //   (1) generic-need floor (early-game infrastructure baseline)
  //   (2) COUNCIL progression — heavy weight when the AI's own councils would activate/
  //       maintain with this amenity type (was previously only in setup helper)
  //   (3) TARGET HEADLINER gaps — weight amenities the biggest hand-heavyweight still
  //       needs to legally play. Previously the AI would pile campsites when a Fame-5
  //       headliner in their hand actually needed catering.
  const councils = pd.councils || [];
  const councilBonus = { campsite: 0, security: 0, catering: 0, portaloo: 0 };
  councils.forEach((cc, i) => {
    if (!cc) return;
    const cond = cc.condition;
    // Bump amenities that this council still needs to fire this year. Weighted by
    // the reward value roughly — fame/dice councils are worth more than refresh-type.
    const weight = 6;
    if (cond?.type === "thresholdSingle" || cond?.type === "thresholdFixed") councilBonus[cond.amenity] += weight;
    else if (cond?.type === "thresholdPaired") { councilBonus[cond.a] += weight; councilBonus[cond.b] += weight; }
    else if (cond?.type === "comparative") { councilBonus[cond.greater] += weight; councilBonus[cond.lesser] -= 4; }
  });
  const headlinerGaps = aiTargetHeadlinerGaps(pd);
  const gapWeight = 10; // higher than council since it's about being able to PLAY the headliner
  // v191: soft cap on amenity accumulation. When the AI already has ≥3 of a type,
  // any further pick of that type is heavily deprioritized (huge negative bonus).
  // Doesn't hard-block picks — if the wanted die simply isn't available, aiPickDie
  // still falls back correctly. But drops the AI's tendency to spam campsites past
  // the point of usefulness.
  const overCapPenalty = (t) => c(t) >= 3 ? -20 : 0;
  // v197.18: Infrastructure Reward bonus. If a reward is active for this amenity type
  // AND the AI doesn't currently hold it AND they could plausibly claim it (i.e., not
  // hopelessly behind), boost that amenity's weight. Scale: +12 to overtake by 1, +6 to
  // reach parity, +4 to just get to 2 (threshold). Doesn't fire if AI already leads —
  // that would just make them pile more without competitive pressure.
  const infraBonus = { campsite: 0, security: 0, catering: 0, portaloo: 0 };
  if (infraContext && infraContext.rewards) {
    ["campsite", "portaloo", "security", "catering"].forEach(t => {
      const rewardId = infraContext.rewards[t];
      if (!rewardId) return;
      const leader = infraContext.leaders?.[t];
      const myCount = c(t);
      if (leader === infraContext.playerId) return; // already holding it — no bonus
      // Find the highest opponent count for this amenity.
      let maxOther = 0;
      const counts = infraContext.counts || {};
      Object.entries(counts).forEach(([pid, am]) => {
        if (parseInt(pid) === infraContext.playerId) return;
        maxOther = Math.max(maxOther, am?.[t] || 0);
      });
      // Bonus scales with how achievable the lead is (fewer gap = higher bonus).
      const gap = maxOther - myCount;
      if (gap <= 0 && myCount < 2) infraBonus[t] += 8; // clear path once we hit 2
      else if (gap === 0) infraBonus[t] += 12; // one placement takes strict lead
      else if (gap === 1) infraBonus[t] += 10; // two placements takes lead
      else if (gap === 2) infraBonus[t] += 6;
      else if (gap <= 4) infraBonus[t] += 3;
      // gap > 4 → basically hopeless, no bonus.
    });
  }
  const needs = [
    { type: "security", need: Math.max(0, 3 - c("security")) * 4 + councilBonus.security + (headlinerGaps?.gaps.security || 0) * gapWeight + overCapPenalty("security") + infraBonus.security + Math.random() * 2 },
    { type: "campsite", need: Math.max(0, 4 - c("campsite")) * 3 + councilBonus.campsite + (headlinerGaps?.gaps.campsite || 0) * gapWeight + overCapPenalty("campsite") + infraBonus.campsite + Math.random() * 2 },
    { type: "catering", need: Math.max(0, 2 - c("catering")) * 3 + councilBonus.catering + (headlinerGaps?.gaps.catering || 0) * gapWeight + overCapPenalty("catering") + infraBonus.catering + Math.random() * 2 },
    { type: "portaloo", need: Math.max(0, 2 - c("portaloo")) * 3 + councilBonus.portaloo + (headlinerGaps?.gaps.portaloo || 0) * gapWeight + overCapPenalty("portaloo") + infraBonus.portaloo + Math.random() * 2 },
  ];
  needs.sort((a, b) => b.need - a.need);
  return needs[0].type;
}

/** AI decides which die to pick from available dice */
function aiPickDie(dice, pd, preferredType, wantsStageProgress, wantsFameThisTurn) {
  const wanted = preferredType || aiPickAmenityType(pd);
  // v187: on Year 1 Turn 1 when the AI is at Fame 1 and wants to reach Fame 2,
  // the fame die takes priority over everything else. Guarantees the AI hits Fame 2
  // by end of turn whenever a fame die is in the roll.
  if (wantsFameThisTurn) {
    for (let i = 0; i < dice.length; i++) {
      if (dice[i] === "fame") return { idx: i, type: "fame" };
    }
  }
  // v166: if the AI wants stage progress (1 stage, or 2 stages with a stage credit banked
  // that's close to another), prefer a stage die when one is available.
  if (wantsStageProgress) {
    for (let i = 0; i < dice.length; i++) {
      if (dice[i] === "stage") return { idx: i, type: "stage" };
    }
  }
  // Find a die that gives the wanted amenity type
  for (let i = 0; i < dice.length; i++) {
    if (dice[i] === wanted) return { idx: i, type: wanted };
  }
  // Fallback: fame die is next-best (free fame is always useful)
  for (let i = 0; i < dice.length; i++) {
    if (dice[i] === "fame") return { idx: i, type: "fame" };
  }
  // Fallback: stage die if we haven't opted for it
  for (let i = 0; i < dice.length; i++) {
    if (dice[i] === "stage") return { idx: i, type: "stage" };
  }
  // Fallback: first amenity face
  for (let i = 0; i < dice.length; i++) {
    if (dice[i] !== "fame" && dice[i] !== "stage") return { idx: i, type: dice[i] };
  }
  return { idx: 0, type: dice[0] || "campsite" };
}

/** AI selects which draft artists to keep (indices) */
function aiDraftSelect(options) {
  // Prefer one low-fame (playable soon) and one high-fame (for later)
  const scored = options.map((a, i) => ({
    idx: i, score: a.vp * 2 + a.tickets * 3 + (a.effect ? 5 : 0) + (a.fame <= 1 ? 10 : 0) + Math.random() * 3
  }));
  scored.sort((a, b) => b.score - a.score);
  return [scored[0].idx, scored[1].idx];
}

/** AI decides which amenity to pick in setup */
function aiPickSetupAmenity() {
  const r = Math.random();
  if (r < 0.35) return "security";
  if (r < 0.6) return "campsite";
  if (r < 0.8) return "portaloo";
  return "catering";
}

// ─── Smart AI Council/Field Helpers ───
// Score how attractive a council is for an AI player to KEEP (top 3 of 5 dealt).
// Combines reward value + condition difficulty.
function scoreCouncilForKeep(council) {
  const cond = council.condition;
  const reward = council.reward;
  const rewardScore = ({
    fame: 14,
    tickets: 18,
    starDice: 22,
    refreshPool: 10,
    drawArtists: 9,        // legacy — no councils use this in v134
    drawOnPlay: 13,        // v134: fires per artist played, decent tempo boost
    drawSpecialGuests: 13, // legacy — no councils use this in v134
    freeSpecialGuests: 15, // v134: guaranteed free guest placement is strong late-game
    agents: 11,
    agentFame: 10,
    artistOnMicrotrend: 12,
    refreshDice: 10,
  })[reward.type] || 0;
  let difficultyPenalty = 0;
  if (cond.type === "thresholdFixed") difficultyPenalty = cond.count === 1 ? 0 : 2;
  else if (cond.type === "thresholdSingle") difficultyPenalty = 6;
  else if (cond.type === "thresholdPaired") difficultyPenalty = 7;
  else if (cond.type === "comparative") difficultyPenalty = 4;
  else if (cond.type === "emptyField") difficultyPenalty = 3;
  return rewardScore - difficultyPenalty;
}

// AI picks the top 3 councils from its 5 dealt (by score)
function aiPickCouncilsToKeep(dealt) {
  const scored = dealt.map(c => ({ council: c, score: scoreCouncilForKeep(c) }));
  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, 3).map(s => s.council.id);
}

// AI assigns 3 kept councils to 3 fields. Spatial assignment matters less than tracking which
// field "belongs to" each council; current strategy is by-pickup-order (highest score on F0).
function aiAssignCouncilsToFields(keptIds) {
  const assignments = {};
  keptIds.forEach((cid, i) => { assignments[cid] = i; });
  return assignments;
}

// Score the strategic value of placing `amenityType` into field `field` with assigned `council`.
// Heavy negatives prevent breaking active councils or filling empty-field councils.
// Positive scores reward newly activating, maintaining, or progressing toward qualification.
function aiScorePlacement(amenityType, field, council, year) {
  if (!council) return 3; // no council on field → mild positive so empty fields still get some use
  const post = { ...field, [amenityType]: (field[amenityType] || 0) + 1 };
  const wasQualifying = councilQualifies(council, field, year);
  const willQualify = councilQualifies(council, post, year);
  if (wasQualifying && !willQualify) return -1000; // breaks active council — never
  if (!wasQualifying && willQualify) return 100; // newly activates
  // v152: reduced from +25 to +3. Previously maintaining an already-active council beat
  // progressing toward a NEW one (+10), so the AI dumped all amenities on one field and
  // never activated the other two councils. Maintaining is worth barely anything since
  // the council is already firing this year — spread to activate more.
  if (wasQualifying && willQualify) return 3;
  const cond = council.condition;
  if (cond.type === "emptyField") return -800; // never break empty-field
  let relevant = false;
  if (cond.type === "thresholdSingle" || cond.type === "thresholdFixed") relevant = (cond.amenity === amenityType);
  else if (cond.type === "thresholdPaired") relevant = (cond.a === amenityType || cond.b === amenityType);
  else if (cond.type === "comparative") {
    relevant = (cond.greater === amenityType || cond.lesser === amenityType);
    if (cond.lesser === amenityType) return -10; // worsens the ratio
  }
  return relevant ? 15 : 2;
}

// AI picks the best field to place a given amenity. Iterates fields, picks max score.
function aiPickFieldForAmenity(pd, amenityType, year) {
  // v189: with councils removed, all amenities go to field 0 (the single festival area).
  return 0;
}

// AI picks the best STARTING amenity considering its councils. Weight amenities that progress
// the most councils' conditions.
function aiPickSetupAmenityWithCouncils(pd) {
  const councils = pd?.councils || [];
  const scores = { campsite: 1, security: 2, catering: 1, portaloo: 1 };
  for (const c of councils) {
    if (!c) continue;
    const cond = c.condition;
    if (cond.type === "thresholdSingle" || cond.type === "thresholdFixed") scores[cond.amenity] = (scores[cond.amenity] || 0) + 5;
    else if (cond.type === "thresholdPaired") { scores[cond.a] = (scores[cond.a] || 0) + 3; scores[cond.b] = (scores[cond.b] || 0) + 3; }
    else if (cond.type === "comparative") scores[cond.greater] = (scores[cond.greater] || 0) + 4;
  }
  let best = "security", bestScore = -Infinity;
  for (const [t, s] of Object.entries(scores)) {
    if (s > bestScore) { bestScore = s; best = t; }
  }
  return best;
}

// Score how much a candidate artist contributes toward unclaimed lineup objectives. Considers
// the artist's genres and the partial lineup state on each open stage. Returns a score boost
// that the AI's main picker adds on top of base VP/ticket value.
function aiScoreArtistForLineupObjectives(artist, pd, lineupObjectives) {
  if (!artist || !lineupObjectives || lineupObjectives.length === 0) return 0;
  const sa = pd?.stageArtists || [];
  let bestBonus = 0;
  // For each open stage, check if booking this artist there helps progress an unclaimed objective
  for (let si = 0; si < sa.length; si++) {
    const stage = sa[si] || [];
    if (stage.length >= 3) continue;
    const hypothetical = [...stage, artist];
    for (const lo of lineupObjectives) {
      if (!lo || lo.claimed2nd !== null) continue;
      // Use bipartite matcher to count requirements covered (handles multi-genre artists correctly).
      const initialNeeded = lo.genres.length;
      const stillNeeded = genresStillNeeded(hypothetical, lo.genres);
      const progress = initialNeeded - stillNeeded;
      if (progress > 0) {
        const claimValue = (lo.claimed1st === null) ? 5 : 3;
        const proximity = (3 - stage.length); // 3 if empty, 1 if 2/3 full
        const bonus = (claimValue / proximity) * (progress / initialNeeded);
        if (bonus > bestBonus) bestBonus = bonus;
      }
    }
  }
  return bestBonus;
}

// Score how much a candidate artist contributes toward council qualification through its
// amenity costs. Booking artists costs amenities, but each amenity placed counts toward councils.
function aiScoreArtistForCouncilProgress(artist, pd, year) {
  // Booking removes amenities — that's a NEGATIVE for fixed-count councils that are currently qualifying
  // For threshold councils, amenities going UP toward target is good but we're going DOWN here.
  // Net effect: artist booking generally consumes amenities, which hurts threshold-type councils.
  // We just slightly bias against booking when it would break an active council.
  if (!pd) return 0;
  const councils = pd.councils || [];
  const fields = pd.fields || [];
  let penalty = 0;
  for (let i = 0; i < councils.length; i++) {
    const c = councils[i];
    if (!c) continue;
    const cond = c.condition;
    // Only thresholdFixed (exact) and emptyField are sensitive to consumption
    if (cond.type !== "thresholdFixed" && cond.type !== "emptyField") continue;
    const wasQualifying = councilQualifies(c, fields[i], year || 1);
    if (!wasQualifying) continue;
    // Booking will pull amenities from somewhere — we don't know which field will be hit,
    // so apply a small penalty as a heuristic. The placement function handles per-field details.
    penalty -= 2;
  }
  return penalty;
}

/** AI decides what to do on its turn: returns { action, ... } */
// v172: score how much an artist matches a player's identity bonus. Big positive
// if the artist's genre is in the identity's inGenres pair (or fame ≤ 3 for counter
// culture), and negative if the artist would trigger the identity penalty.
function aiScoreArtistForIdentity(artist, identity, ctx) {
  if (!identity) return 0;
  const genres = (artist.genre || "").split(",").map(g => g.trim());
  const playedThisYear = ctx?.playedThisYear || 0;
  const stagesTwoFull = ctx?.stagesTwoFull || 0;
  if (identity.type === "genrePair") {
    const inPair = genres.some(g => (identity.inGenres || []).includes(g));
    if (inPair) return 12; // big boost for identity-matching plays
    return -4; // penalty already fires; nudge AI away
  }
  if (identity.type === "counterCulture") {
    if ((artist.fame || 0) <= 3) return 8;
    return -3;
  }
  // localTalent — encourages low-fame plays
  if (identity.type === "localTalent") {
    if ((artist.fame || 0) <= 2) return 8;
    return -4; // penalty is -2 tickets per Fame 3+ play; nudge away
  }
  // v196.2: Curated — cap at 6 artists/year. Encourage high-ticket picks (since fewer
  // plays overall means each play must count more) and STRONGLY discourage the 7th+ play.
  //   - Already at 6 or above: massive -20 penalty (each play now costs -3 tickets).
  //   - At 5: mild -3 penalty (one more play is still net +1, but any further is -3).
  //   - Below 5: reward high-ticket artists proportional to their ticket value.
  //     A 6-ticket play is worth much more when you only get 6 slots than when you have 12.
  if (identity.type === "curated") {
    if (playedThisYear >= 6) return -20; // over cap — every play is -3 tickets
    if (playedThisYear === 5) return -3;  // last play — pick carefully; only high-value
    // Ticket-value multiplier: high-fame/high-ticket picks matter more under Curated
    const val = (artist.tickets || 0) + (artist.fame || 0);
    return Math.round(val * 0.5); // scales 0-8ish
  }
  // v196.2: Confetti Cannons — +2 per effect artist, -1 per non-effect.
  if (identity.type === "effectMatch") {
    return (artist.effect && artist.effect.trim().length > 0) ? 6 : -2;
  }
  // v196.2: Full of Surprises — encourage playing to make 2/3-full stages (so special-guest
  // opportunities fire), avoid filling the third slot normally (that triggers the penalty).
  //   - Stages with 2 already: reward for other artists (would fill last slot for -3 penalty)
  //     → mild penalty here
  //   - Stages with 1 or 0: reward for artists that would leave the stage at 2/3
  //     → reward for these
  if (identity.type === "fullOfSurprises") {
    // Simple heuristic: if there are stages at 2/3, playing another would fill = penalty.
    // Playing on an empty/1-artist stage does not trigger the fill penalty.
    return stagesTwoFull > 0 ? -3 : 2;
  }
  return 0;
}

function aiDecideTurn(pd, artistPool, dice, year, lineupObjectives, activeMicrotrends, forecastMicrotrend, trendsMode, identity, identityCtx, infraContext) {
  const sa = pd.stageArtists || [];
  const openStages = sa.filter(s => s.length < 3);
  const counts = { campsite: 0, portaloo: 0, security: 0, catering: 0, ...(pd.amenities || {}) };
  const totalAmenities = Object.values(counts).reduce((s, v) => s + v, 0);
  const fame = pd.fame || 0;
  // v152: microtrend-awareness. When an unclaimed active microtrend exists whose genre
  // matches an artist we could play, prefer that artist. Under alt-obj default this is
  // the only way to actually claim a trend, so it's a meaningful bonus.
  // v153: also considers the FORECAST microtrend if it's been passed in (caller signals
  // whether this player is a non-leader who can claim forecast under anti-lead mode).
  // v156: under trends mode, microtrend claims and lineup completions ALSO progress
  // stage-open credits (3 microtrends = 1 credit; 1 lineup 1st = 1 credit). Since opening
  // a stage is worth ~15+ tickets over the game, we boost these bonuses meaningfully.
  const activeGenreTrend = (activeMicrotrends || []).find(mt => mt?.claimedBy === null && mt?.kind === "genre");
  const activeGenre = activeGenreTrend?.genre || null;
  const forecastGenre = (forecastMicrotrend && forecastMicrotrend.kind === "genre") ? forecastMicrotrend.genre : null;
  // v172: also look for amenity-based active microtrends — those need specific amenities
  // to claim, and the AI should chase those amenities on the dice.
  const activeAmenityTrend = (activeMicrotrends || []).find(mt => mt?.claimedBy === null && mt?.kind === "amenity");
  const activeAmenity = activeAmenityTrend?.amenity || null;
  // Under trends mode, an unopened stage is a strong future-value multiplier. Ballpark:
  // opening a stage lets you play 3 more artists, worth ~5 tickets each = ~15 tickets.
  // A microtrend = 1/3 of a credit ≈ 5 ticket-equivalent. A lineup 1st = 1 credit ≈ 15.
  // v172: scale boost with stagesLeft so the AI values credit-progress more when it has
  // fewer stages open (getting to 2 stages is more valuable than 3rd).
  const stagesLeft = 3 - (pd.stages || []).length;
  const trendsBoost = (trendsMode && stagesLeft > 0) ? stagesLeft : 0;

  // Only book from HAND (no direct pool booking)
  const bookedNames = new Set(sa.flat().map(a => a.name));
  // v124: an artist counts as bookable if EITHER
  //   (a) amenities cover the cost on any open stage (standard path), OR
  //   (b) some stage has exactly 2 artists whose genres share ≥1 with the incoming artist
  //       (genre-match headliner path — bypasses amenity cost, fame still required).
  const artistGenreMatchStage = (a) => {
    const headlinerGenres = new Set(getGenres(a.genre));
    for (let si = 0; si < sa.length; si++) {
      const stage = sa[si] || [];
      if (stage.length !== 2) continue;
      if (stage.every(x => getGenres(x.genre).some(g => headlinerGenres.has(g)))) return si;
    }
    return -1;
  };
  const bookableHand = (pd.hand || []).filter(a => {
    if (bookedNames.has(a.name)) return false;
    if (fame < a.fame) return false;
    const amenitiesOk = counts.campsite >= a.campCost && counts.security >= a.securityCost && counts.catering >= a.cateringCost && counts.portaloo >= a.portalooCost;
    if (amenitiesOk) return true;
    return artistGenreMatchStage(a) >= 0;
  });
  const hasOpenStage = openStages.length > 0;

  // PRIORITY 1: Book from hand if possible — score now includes lineup objective fit + council impact + microtrend match + identity match
  if (bookableHand.length > 0 && hasOpenStage) {
    // v174: positional-trigger helpers. Electronic artists (Horsegiirl, Peggy Gou, Linkin Park,
    // The Chainsmokers, Pink Pantheress, Flume, FISHER, Fatboy Slim) fire different effects
    // based on which slot they occupy (opener=1, middle=2, headliner=3). The AI should
    // route positional artists to the slot that fires their trigger — but still play them
    // out-of-slot if that's the only option (they still bring base ticket value).
    const slotTrigger = (a) => {
      const el = (a.effect || "").toLowerCase();
      if (el.includes("if opening set") && el.includes("if middle slot") && el.includes("if headliner")) return "compound";
      if (el.includes("if headliner")) return "headliner";
      if (el.includes("if middle slot")) return "middle";
      if (el.includes("if opening set")) return "opener";
      return null;
    };
    // Given an artist, return list of slot numbers (1-3) they could LEGALLY occupy this turn.
    const legalSlotsForArtist = (a) => {
      const result = [];
      const aAmenOk = counts.campsite >= a.campCost && counts.security >= a.securityCost && counts.catering >= a.cateringCost && counts.portaloo >= a.portalooCost;
      const headlinerGenres = new Set(getGenres(a.genre));
      for (let si = 0; si < sa.length; si++) {
        const stage = sa[si] || [];
        if (stage.length >= 3) continue;
        const slot = stage.length + 1;
        let legal = aAmenOk;
        if (!legal && stage.length === 2 && stage.every(x => getGenres(x.genre).some(g => headlinerGenres.has(g)))) legal = true;
        if (legal) result.push(slot);
      }
      return result;
    };
    // Best positional-match bonus achievable for artist a with current stages.
    // - If they have no trigger: 0
    // - If Fatboy (compound): scales with best-achievable slot (opener=3, mid=4, headliner=7)
    // - If single-slot trigger: +8 if they can fire it, -4 if they can only play out-of-position
    //   (small penalty so they don't get picked over a non-positional artist that'd score fully)
    const bestSlotBonus = (a) => {
      const trigger = slotTrigger(a);
      if (!trigger) return 0;
      const legalSlots = legalSlotsForArtist(a);
      if (legalSlots.length === 0) return 0;
      if (trigger === "compound") {
        const bestSlot = Math.max(...legalSlots);
        return bestSlot === 1 ? 3 : bestSlot === 2 ? 4 : 7;
      }
      const target = trigger === "opener" ? 1 : trigger === "middle" ? 2 : 3;
      if (legalSlots.includes(target)) return 8;
      return -4;
    };
    const microBonus = (a) => {
      const genres = (a.genre || "").split(",").map(g => g.trim());
      // v172: bigger boost for microtrend matches — was 6/5, now 12/8 (plus per-stage trendsBoost).
      // A microtrend claim = fame + stage progress + credit-progress under trends mode.
      const trendBoost = trendsBoost * 5;
      if (activeGenre && genres.includes(activeGenre)) return 12 + trendBoost;
      if (forecastGenre && genres.includes(forecastGenre)) return 8 + trendBoost;
      return 0;
    };
    bookableHand.sort((x, y) => {
      // v156: under trends mode, lineup 1st claims grant a full stage credit (~15 tickets).
      // Boost lineup scoring multiplier from ×4 to ×8 when in trends mode with stages left.
      const lineupWeight = 4 + (trendsBoost * 4);
      const xLineup = aiScoreArtistForLineupObjectives(x, pd, lineupObjectives) * lineupWeight;
      const xCouncil = aiScoreArtistForCouncilProgress(x, pd, year);
      const xIdentity = aiScoreArtistForIdentity(x, identity, identityCtx);
      const xSlot = bestSlotBonus(x);
      const xScore = (x.vp * 3 + x.tickets * 2) + (x.effect ? 5 : 0) + xLineup + xCouncil + microBonus(x) + xIdentity + xSlot;
      const yLineup = aiScoreArtistForLineupObjectives(y, pd, lineupObjectives) * lineupWeight;
      const yCouncil = aiScoreArtistForCouncilProgress(y, pd, year);
      const yIdentity = aiScoreArtistForIdentity(y, identity, identityCtx);
      const ySlot = bestSlotBonus(y);
      const yScore = (y.vp * 3 + y.tickets * 2) + (y.effect ? 5 : 0) + yLineup + yCouncil + microBonus(y) + yIdentity + ySlot;
      return yScore - xScore;
    });
    const pick = bookableHand[0];
    const idx = (pd.hand || []).indexOf(pick);
    // Determine which stages are LEGAL for this artist. If the AI's amenities cover the
    // pick's cost, any open stage is legal (amenity path). Otherwise only stages where
    // the genre-match headliner rule fires are legal.
    const amenitiesOk = counts.campsite >= pick.campCost && counts.security >= pick.securityCost && counts.catering >= pick.cateringCost && counts.portaloo >= pick.portalooCost;
    const isStageLegal = (si) => {
      const stage = sa[si] || [];
      if (stage.length >= 3) return false;
      if (amenitiesOk) return true;
      // Genre-match: exactly 2 artists on stage, both sharing a genre with pick.
      if (stage.length !== 2) return false;
      const headlinerGenres = new Set(getGenres(pick.genre));
      return stage.every(x => getGenres(x.genre).some(g => headlinerGenres.has(g)));
    };
    // Precompute pick's positional trigger to route it to the right slot below.
    const pickTrigger = slotTrigger(pick);
    // Smart stage pick: choose the stage where this artist would BEST progress a lineup objective
    // (prefer 2/3-full stages that complete an objective, then 1/3-full, then empty)
    // v174: also route positional artists to their trigger slot when possible.
    let bestStage = -1, bestStageScore = -Infinity;
    for (let si = 0; si < sa.length; si++) {
      if (!isStageLegal(si)) continue;
      const stage = sa[si] || [];
      const hypothetical = [...stage, pick];
      // Score: completing a lineup at stage[2] is best, then proximity to lineup objective match
      let score = stage.length * 10; // prefer fuller stages (more proximate to completion)
      // v174: positional bonus — route the pick to the slot that fires its trigger.
      // Very strong (+40) so it dominates lineup fullness for positional artists,
      // but does NOT prevent play if trigger slot is unreachable.
      if (pickTrigger) {
        const proposedSlot = stage.length + 1;
        if (pickTrigger === "compound") {
          // Fatboy: opener=+3, middle=+4, headliner=+7 (matches actual payoff)
          score += proposedSlot === 3 ? 30 : proposedSlot === 2 ? 15 : 5;
        } else {
          const target = pickTrigger === "opener" ? 1 : pickTrigger === "middle" ? 2 : 3;
          if (proposedSlot === target) score += 40;
        }
      }
      // If hypothetical lineup is exactly 3 and matches an unclaimed objective, big bonus
      if (hypothetical.length === 3 && lineupObjectives) {
        for (const lo of lineupObjectives) {
          if (!lo || lo.claimed2nd !== null) continue;
          if (lineupCoversGenres(hypothetical, lo.genres)) {
            score += (lo.claimed1st === null) ? 80 : 40;
            break;
          }
        }
      }
      if (score > bestStageScore) { bestStageScore = score; bestStage = si; }
    }
    if (bestStage < 0) {
      // No legal stage — fall through (shouldn't happen if bookableHand is correctly built,
      // but defensive against corner cases). AI will try a different action next tick.
      // Skip this booking by returning amenity/reserve fallback below.
    } else {
      return { action: "book", source: "hand", artistIdx: idx, stageIdx: bestStage };
    }
  }

  // PRIORITY 2: Pick up from pool or draw from deck if hand is small.
  // v197.18: Threshold lowered from < 5 to < 3. Old threshold made the AI reserve
  // aggressively in Y1 — a hand of 4 with no bookable options would still trigger a
  // reserve, and the AI would spend most of Y1 collecting cards without ever playing
  // one (ending Y1 at 0 tickets). Lower threshold means the AI reserves only when
  // truly starved for cards and otherwise falls to Priority 3 (build amenities) so
  // it actually unlocks the artists it already has in hand.
  const handSize = (pd.hand || []).length;
  if (handSize < 3) {
    if (artistPool.length > 0) {
      // Pick best from pool
      const scored = artistPool.map((a, i) => {
        let s = a.vp * 2 + a.tickets;
        if (fame >= a.fame && counts.campsite >= a.campCost && counts.security >= a.securityCost && counts.catering >= a.cateringCost && counts.portaloo >= a.portalooCost) s += 15;
        s += Math.random() * 3;
        return { i, s };
      });
      scored.sort((a, b) => b.s - a.s);
      return { action: "reserve", poolIdx: scored[0].i };
    } else {
      return { action: "drawDeck" };
    }
  }

  // v187: Year 1 Turn 1 priority — everyone starts at Fame 1 now (v187 rule change).
  // On the AI's very first turn (Year 1, no booked artists yet), aggressively steer
  // toward reaching Fame 2 by end of turn:
  //   1. If a matching-genre artist is playable and would claim the active microtrend,
  //      the standard Priority 1 book path already handles this well (microtrend score
  //      bonus is baked in). No override needed for that case.
  //   2. If NO book path leads to Fame 2 but the shared dice have a fame die OR a
  //      microtrend-amenity die, we prefer amenity/fame-die actions over pool draws.
  //   3. Free tempt at end of turn (aiDeployAgent) covers the fallback case — with
  //      starting Fame 1, the AI can always tempt as its free action even if the main
  //      action doesn't reach Fame 2.
  // The steering below biases the amenity preferredType toward the fame die when
  // (a) it's the first turn AND (b) the AI is at Fame 1 with no direct route to +Fame
  // from a book action, so the amenity dice pick prioritizes fame-face over amenity-face.
  const isFirstTurn = (year === 1) && (sa.flat().length === 0);
  const wantsFameThisTurn = isFirstTurn && fame < 2;

  // PRIORITY 3: Get amenities — only consider artists we could actually book (fame-wise)
  // v172: boost amenity types needed by microtrend-matching or identity-matching artists
  // in hand — the AI actively works toward playing an artist that satisfies its goals.
  const neededForArtists = { campsite: 0, portaloo: 0, security: 0, catering: 0 };
  [...(pd.hand || [])].filter(a => fame >= a.fame).forEach(a => {
    const genres = (a.genre || "").split(",").map(g => g.trim());
    const isMicroMatch = (activeGenre && genres.includes(activeGenre)) || (forecastGenre && genres.includes(forecastGenre));
    const identityScore = aiScoreArtistForIdentity(a, identity, identityCtx);
    const isIdentityMatch = identityScore > 0;
    // A microtrend-matching or identity-matching artist counts more (weight = 3 vs 1)
    const weight = (isMicroMatch ? 3 : 0) + (isIdentityMatch ? 2 : 0) + 1;
    if (a.campCost > counts.campsite) neededForArtists.campsite += weight;
    if (a.securityCost > counts.security) neededForArtists.security += weight;
    if (a.cateringCost > counts.catering) neededForArtists.catering += weight;
    if (a.portalooCost > counts.portaloo) neededForArtists.portaloo += weight;
  });
  // v172: if an amenity microtrend is active, boost that amenity type too
  if (activeAmenity && neededForArtists[activeAmenity] !== undefined) {
    neededForArtists[activeAmenity] += 4;
  }
  // v197.18: Infrastructure Reward bonus. Same shape as aiPickAmenityType — bias the
  // AI toward amenity types where there's a reward on offer that the AI doesn't
  // currently hold. Uses the count gap to decide how achievable the lead is.
  if (infraContext && infraContext.rewards) {
    ["campsite", "portaloo", "security", "catering"].forEach(t => {
      const rewardId = infraContext.rewards[t];
      if (!rewardId) return;
      const leader = infraContext.leaders?.[t];
      if (leader === infraContext.playerId) return;
      const myCount = counts[t] || 0;
      let maxOther = 0;
      const cs = infraContext.counts || {};
      Object.entries(cs).forEach(([pid, am]) => {
        if (parseInt(pid) === infraContext.playerId) return;
        maxOther = Math.max(maxOther, am?.[t] || 0);
      });
      const gap = maxOther - myCount;
      let bonus = 0;
      if (gap <= 0 && myCount < 2) bonus = 8;
      else if (gap === 0) bonus = 12;
      else if (gap === 1) bonus = 10;
      else if (gap === 2) bonus = 6;
      else if (gap <= 4) bonus = 3;
      neededForArtists[t] = (neededForArtists[t] || 0) + bonus;
    });
  }
  // v191: apply the ≥3 soft-cap penalty here too so preferredType agrees with the
  // amenity-picker cap. If we already have 3+ of a type, we don't want more.
  ["campsite", "security", "catering", "portaloo"].forEach(t => {
    if ((counts[t] || 0) >= 3) neededForArtists[t] = (neededForArtists[t] || 0) - 20;
  });

  return { action: "amenity", preferredType: Object.entries(neededForArtists).sort((a, b) => b[1] - a[1])[0]?.[0], wantsFameThisTurn };
}

// ═══════════════════════════════════════════════════════════
// MAIN GAME
// ═══════════════════════════════════════════════════════════
export default function Headliners() {
  // Phase management
  const [phase, setPhase] = useState("lobby");
  const [players, setPlayers] = useState([{ id: 0, name: "Player 1", festivalName: "", isAI: false }, { id: 1, name: "Player 2", festivalName: "", isAI: false }]);
  const [playerCount, setPlayerCount] = useState(2);
  // Game mode options — set in lobby, immutable once a game starts.
  // stageOpenFameBonus: ON (default) gives +1 Fame for opening a new stage during pre-round.
  //   OFF disables that one-shot bonus.
  // stagesProvideNoFame: OFF (default) preserves current behavior. ON is a master switch
  //   that disables ALL stage→Fame paths.
  // preRoundArtistDraws: ON (default) gives a free artist draw per stage between years.
  //   OFF makes artists only obtainable through turn actions — tighter card economy.
  // agentEffectsEnabled: ON (default) activates the agentEffect on certain artists when
  //   they're booked via an agent. OFF — those artists still exist with their base effects
  //   only (the agent-conditional bonuses don't fire even when an agent books them).
  //   Either way the cost numbers on every artist are the same.
  // temptMode (v130): major mode toggle. When ON: agents are replaced by "Tempt" —
  //   players spend 1 Fame per artist to court them from the pool (up to 2 per turn).
  //   Contests trigger when a second player also tempts the same artist. Both players
  //   need ≥1 Fame to contest; on resolution BOTH get their Fame back and the dice roll
  //   decides who lands the artist. Microtrends grant +2 Fame instead of +1 Fame + 1 ticket.
  //   Hand capped at 8. This trades one entire subsystem (agents) for a lighter, more
  //   interactive one where Fame is a genuinely spendable resource. Off preserves the
  //   traditional agent economy for backward compat.
  // totalYears: how many rounds the game lasts. 4 is standard; 3 is a shorter format.
  // v189: MAJOR SIMPLIFICATION — councils gone, fields gone, dual microtrend tracks.
  // Permanent (no longer toggles): tempt mode, anti-lead, identities, flat turns.
  // Removed entirely: strictComparativeMode, contractsMode, agentMicrotrendClaim,
  // agent effects (were tied to councils), preRoundArtistDraws.
  // Two remaining toggles: 4-year mode (with 6/7/8/8 schedule) + stage-open fame bonus.
  const [stageOpenFameBonus, setStageOpenFameBonus] = useState(false); // v189: default OFF (was ON)
  const [temptMode, setTemptMode] = useState(true); // permanent — kept as state var so refs still work
  const [antiLeadMechanics, setAntiLeadMechanics] = useState(true); // permanent
  const [identitiesMode, setIdentitiesMode] = useState(true); // v189: default ON, permanent
  const identitiesModeRef = useRef(true);
  useEffect(() => { identitiesModeRef.current = identitiesMode; }, [identitiesMode]);
  // Stage-open mode — trends only now (councils gone means no alternative path).
  const [stageOpenMode, setStageOpenMode] = useState("trends");
  const stageOpenModeRef = useRef("trends");
  useEffect(() => { stageOpenModeRef.current = stageOpenMode; }, [stageOpenMode]);
  // v189: flat turn schedule is now default for 3-year games. 4-year mode uses 6/7/8/8.
  const [flatTurnsMode, setFlatTurnsMode] = useState(true);
  const flatTurnsModeRef = useRef(true);
  useEffect(() => { flatTurnsModeRef.current = flatTurnsMode; }, [flatTurnsMode]);
  // Per-player: which identity did they pick? { pid: identityId }
  const [playerIdentities, setPlayerIdentities] = useState({});
  const playerIdentitiesRef = useRef({});
  useEffect(() => { playerIdentitiesRef.current = playerIdentities; }, [playerIdentities]);
  // Per-player log of every ticket/fame movement caused by their identity.
  const [identityLog, setIdentityLog] = useState({});
  // Identity picker state — during phase "identityChoice", each player picks 1 of 3.
  const [identityDealt, setIdentityDealt] = useState({}); // { pid: [id, id, id] }
  const [identityPickerIdx, setIdentityPickerIdx] = useState(0);
  const [totalYears, setTotalYears] = useState(3); // v189: default 3 (was 4)
  const totalYearsRef = useRef(3);
  const stageOpenFameBonusRef = useRef(false);
  const preRoundArtistDrawsRef = useRef(false);
  // v197.12: Infrastructure Rewards mode — an anti-tie race for each amenity type
  // grants a game-specific benefit to whoever leads strictly (ties = no benefit).
  // At game start, one of 3 reward variants is drawn per amenity type (12 total variants,
  // 4 drawn per game). Toggles the whole system on/off.
  const [infraRewardsMode, setInfraRewardsMode] = useState(false);
  const infraRewardsModeRef = useRef(false);
  useEffect(() => { infraRewardsModeRef.current = infraRewardsMode; }, [infraRewardsMode]);
  // Which reward variant is in play this game, per amenity type. Set at game start.
  //   { campsite: "camp_2", portaloo: "port_1", catering: "cat_3", security: "sec_2" }
  const [infraRewards, setInfraRewards] = useState(null);
  const infraRewardsRef = useRef(null);
  useEffect(() => { infraRewardsRef.current = infraRewards; }, [infraRewards]);
  // Per-turn / per-year usage trackers for rewards that fire once per turn/year.
  // Keys: "port_1:pid" (once per turn), "sec_2:pid" (once per turn — turn-start draw)
  const infraRewardUsageRef = useRef({});
  // v197.14: Track the CURRENT leader per amenity so we can detect changes and log
  // reward gains/losses. Populated after every playerData change via a useEffect below.
  // The change-detection useEffect itself lives AFTER getInfraLeader/logTicketGain are
  // declared (see below near the reward-helper block) — placing it up here would trigger
  // a temporal-dead-zone error on `playerData` in the deps array, since playerData
  // isn't declared until ~line 1929.
  const infraLeaderRef = useRef({ campsite: null, portaloo: null, catering: null, security: null });
  // Draw-3-keep-1 modal for sec_2. { pid, cards: [3 artists] } | null
  const [sec2Draw, setSec2Draw] = useState(null);
  // Choose-amenity modal for sec_1. { pid, availableTypes: [...] } | null
  const [sec1Choice, setSec1Choice] = useState(null);
  // v189: retained as always-false constants (removed toggles) so downstream code that
  // reads these refs continues to work without touching every callsite.
  const preRoundArtistDraws = false;
  const stagesProvideNoFame = false;
  const agentEffectsEnabled = false;
  const agentMicrotrendClaim = false;
  const strictComparativeMode = false;
  const contractsMode = false;
  const contractsModeRef = useRef(false);
  const strictComparativeModeRef = useRef(false);
  const agentMicrotrendClaimRef = useRef(false);
  const agentEffectsEnabledRef = useRef(false);
  const stagesProvideNoFameRef = useRef(false);
  // No-op setters so existing UI code doesn't crash if it references them
  const setPreRoundArtistDraws = () => {};
  const setStagesProvideNoFame = () => {};
  const setAgentEffectsEnabled = () => {};
  const setAgentMicrotrendClaim = () => {};
  const setStrictComparativeMode = () => {};
  const setContractsMode = () => {};
  const [sharedContracts, setSharedContracts] = useState([]);
  const [pendingContractClaim, setPendingContractClaim] = useState(null);
  const temptModeRef = useRef(true);
  const antiLeadMechanicsRef = useRef(true);
  useEffect(() => { totalYearsRef.current = totalYears; }, [totalYears]);
  useEffect(() => { stageOpenFameBonusRef.current = stageOpenFameBonus; }, [stageOpenFameBonus]);
  useEffect(() => { temptModeRef.current = temptMode; }, [temptMode]);
  useEffect(() => { antiLeadMechanicsRef.current = antiLeadMechanics; }, [antiLeadMechanics]);
  const [playerData, setPlayerData] = useState({});
  // Refs that mirror state, kept in sync via useEffect. Use these in functions called from
  // setTimeout chains (year-end effects flow) where the closure-captured state can be stale.
  const playerDataRef = useRef(playerData);
  useEffect(() => { playerDataRef.current = playerData; }, [playerData]);
  const [setupIndex, setSetupIndex] = useState(0);
  const [setupStep, setSetupStep] = useState("pickAmenity");
  const [setupSelectedAmenity, setSetupSelectedAmenity] = useState(null);
  const [setupSelectedField, setSetupSelectedField] = useState(null);

  // Game state
  const [year, setYear] = useState(1);
  // yearRef so functions wrapped in useCallback([]) (recalcTickets, recalcAfterUpdate)
  // always read the current year, not the first render's year.
  const yearRef = useRef(1);
  useEffect(() => { yearRef.current = year; }, [year]);
  const [turnOrder, setTurnOrder] = useState([]);
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [turnsLeft, _setTurnsLeft] = useState({});
  const turnsLeftRef = useRef({});
  const setTurnsLeft = (val) => {
    if (typeof val === 'function') {
      _setTurnsLeft(prev => { const next = val(prev); turnsLeftRef.current = next; return next; });
    } else {
      turnsLeftRef.current = val;
      _setTurnsLeft(val);
    }
  };
  const [dice, setDice] = useState([]);
  const [turnAction, setTurnAction] = useState(null);
  const [actionTaken, setActionTaken] = useState(false);
  const [undoSnapshot, setUndoSnapshot] = useState(null);

  // Goals system
  const [activeGoals, setActiveGoals] = useState([]); // DEPRECATED — kept for compat
  const [goalProgress, setGoalProgress] = useState({});
  const [goalReq1Claimed, setGoalReq1Claimed] = useState({});
  // Lineup Objectives — public genre targets
  const [lineupObjectives, setLineupObjectives] = useState([]); // [{ genres: ["Pop","Rock","Funk"], claimed1st: null, claimed2nd: null }, ...]
  const [lineupObjDeck, setLineupObjDeck] = useState([]);
  const goalClaimsRef = useRef({}); // { "goalId_req2": pid, "goalId_req3": pid } — sync tracking
  const lastObjChoiceRef = useRef(null); // dedup AI objective auto-choice
  const [selectedDie, setSelectedDie] = useState(null);
  // v166: choiceAmenity state removed — compound die faces were deleted, so the
  // "choose between two amenities" modal state is no longer needed.
  const [pickingFieldFor, setPickingFieldFor] = useState(null); // amenityType when waiting for field click
  // (placingAmenity / placingStage / movingFrom / movedThisTurn / hoverHex removed —
  //  amenities are now counters, no spatial picking required)
  const [pendingDiceRoll, setPendingDiceRoll] = useState(null); // { count, results, rolled, pid, artistName, callback }
  const [pendingPortalooRefresh, setPendingPortalooRefresh] = useState(0);
  
  // Agent system: each player has 1 agent they can deploy for free
  // agentPlacements: { pid: { type: "dice"|"pool", amenityType?: string, poolIdx?: number, artistName?: string, placedTurn?: number } | null }
  const [agentPlacements, setAgentPlacements] = useState({});
  // v131: under tempt mode, players may hold up to 2 pending pool-artist tempts at once.
  // temptPlacements is a per-player ARRAY of pending placements. agentPlacements is unused
  // under tempt mode — this array is authoritative. Standard mode ignores this state.
  //   Shape: { pid: Array<{ type: "pool", poolIdx, artistName, placedTurn }> }
  const [temptPlacements, setTemptPlacements] = useState({});
  // v139: ref-mirror so async callbacks (checkNextTempt setTimeout) read latest state
  // instead of the closure snapshot at scheduling time — otherwise a just-resolved tempt
  // still appears "live" and re-fires the pendingAgentArtist modal for the same artist.
  const temptPlacementsRef = useRef({});
  useEffect(() => { temptPlacementsRef.current = temptPlacements; }, [temptPlacements]);

  // v142: hand-cap discard picker. When a human player enters their turn with >8 cards
  // (only under tempt mode, which enforces the 8-card cap), they get a modal to choose
  // which cards to discard rather than the auto-cull-lowest-value behavior. AI players
  // still auto-discard (via existing logic) since no picker is possible for them.
  //   Shape: { pid: number, needToDiscard: number } | null
  const [pendingHandDiscard, setPendingHandDiscard] = useState(null);

  // v147: contest winners can now choose their stage. When a contest resolves for the
  // CURRENT player, the pendingAgentArtist modal opens (same UX as uncontested tempts).
  // When the winner is a DIFFERENT player (they tempted on an earlier turn), the artist
  // is queued here and the modal opens on their next turn.
  //   Shape: Array<{ pid: number, artist: object }>
  const [pendingContestPlacements, setPendingContestPlacements] = useState([]);

  // v143: win condition. Chosen at game start by the first non-AI player (or randomly
  // picked when all-AI). Determines how the game's winner is decided at game over.
  //   "consistency"    — most years led in tickets sold. Ties → cumulative total.
  //   "following"      — highest cumulative tickets across all years. (The default win rule.)
  //   "talkOfTheTown"  — highest single-year ticket count wins.
  const [winCondition, setWinCondition] = useState(null);
  const winConditionRef = useRef(null);
  useEffect(() => { winConditionRef.current = winCondition; }, [winCondition]);
  // v132: ledger of ticket-gain sources per player. Every time bonusTickets increases,
  // an entry is appended here for the hover breakdown UI. Losses (negative deltas) are
  // logged too so the sum reconciles with the actual bonusTickets value.
  //   Shape: { pid: Array<{ source: string, amount: number, year: number }> }
  const [ticketsLog, setTicketsLog] = useState({});
  const logTicketGain = (pid, amount, source) => {
    if (!amount || pid == null) return;
    setTicketsLog(prev => ({
      ...prev,
      [pid]: [...(prev[pid] || []), { source, amount, year: yearRef.current || year || 1 }]
    }));
  };
  // v132: last-action tracking — small "what did player X do last?" strings shown under
  // each player's stat row for spectators. Updated on each of the three main action types
  // (book artist, build amenity, tempt). Cleared on new year.
  //   Shape: { pid: string }
  // v190: last-turn action tracker upgraded from single-string to per-turn-array.
  // `lastAction[pid]` — array of strings from that player's most-recently-completed turn.
  // Displayed on OTHER players' turns so everyone can catch up on what each opponent did.
  // `currentTurnActions[pid]` — working array of actions during the player's active turn.
  // On endTurn, currentTurnActions[pid] snapshots to lastAction[pid] and clears.
  const [lastAction, setLastAction] = useState({});
  const [currentTurnActions, setCurrentTurnActions] = useState({});
  // v190: per-year, per-player statistics for the game data table. Populated
  // incrementally through the year for counter-type stats (microtrends, tempts),
  // and snapshotted at year end for state-type stats (artists on stages, stage count,
  // bonus tickets from artist effects).
  //   yearlyStats[pid][year] = {
  //     microtrends, temptsPlaced, temptsWon,
  //     artistsOnStages, stageCount, ticketsFromArtists,
  //   }
  const [yearlyStats, setYearlyStats] = useState({});
  const bumpYearlyStat = (pid, key, delta = 1) => {
    const y = yearRef.current || year || 1;
    setYearlyStats(prev => {
      const perP = prev[pid] || {};
      const perY = perP[y] || {};
      return { ...prev, [pid]: { ...perP, [y]: { ...perY, [key]: (perY[key] || 0) + delta } } };
    });
  };
  // Append an action to the current player's turn log. Callers use this for ALL trackable
  // actions: tempts, plays, amenity picks, pool draws (with artist names), deck draws
  // (count only — hidden info), microtrend claims, etc.
  const setLastActionFor = (pid, text) => {
    setCurrentTurnActions(prev => {
      const cur = prev[pid] || [];
      // Guard against literal duplicates (e.g. React StrictMode double-fires)
      if (cur[cur.length - 1] === text) return prev;
      return { ...prev, [pid]: [...cur, text] };
    });
  };
  // v133: fame-gain popup queue. Every fame gain enqueues an entry the player must
  // click through — a deliberate friction so the impact of gaining Fame is felt viscerally
  // instead of scrolling past in the log. Only queues for human players (AI gains are
  // silent to avoid making the game a click-through slog).
  //   Shape: Array<{ pid: number, amount: number, source: string, ts: number }>
  const [fameGainQueue, setFameGainQueue] = useState([]);
  // v148: parallel to ticketsLog — a persistent per-year fame ledger. Every fame gain
  // AND loss flows through here so the hover tooltip can show sources both ways.
  //   Shape: { pid: Array<{ source, amount, year }> }
  const [fameLog, setFameLog] = useState({});
  const logFameGain = (pid, amount, source, yearOverride) => {
    if (!amount || pid == null) return;
    const y = yearOverride != null ? yearOverride : (yearRef.current || year || 1);
    // Ledger records everything (positive and negative). Used by the hover tooltip.
    setFameLog(prev => ({
      ...prev,
      [pid]: [...(prev[pid] || []), { source, amount, year: y }]
    }));
    // v197.12/19: "VIP Passes" (cat_3) — the catering leader gets +1 ticket every time
    // they GAIN Fame (positive amounts only, not losses). Bookkeeping-only, no popup
    // because this can fire many times per turn.
    // v197.19: DEFERRED to setTimeout(0) so it runs AFTER the current event handler's
    // setPlayerData has committed. Prior implementation fired synchronously — when Fame
    // was gained via a microtrend claim triggered by an amenity placement (e.g. placing
    // a catering matches "Catering Van" trend → +1 Fame), `hasInfraReward` read
    // playerDataRef.current which was still the pre-placement snapshot. The player had
    // JUST become the strict catering leader by placing that amenity, but the check
    // saw the old count and returned false. Result: they were "the leader" per the log
    // but the +1 ticket per Fame never fired at 3 catering. Deferring by one tick lets
    // React commit the amenity placement first, syncs the ref, and hasInfraReward reads
    // the fresh state.
    if (amount > 0 && !source?.startsWith("Reward:")) {
      setTimeout(() => {
        if (!hasInfraReward(pid, "cat_3")) return;
        // v197.20: recompute tickets inline after adding bonusTickets. Without this,
        // bonusTickets increased but pd.tickets stayed stale until the next unrelated
        // recalc fired — so the visual ticket total didn't reflect the reward gain.
        setPlayerData(p => {
          const updated = { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + amount };
          const next = { ...p, [pid]: updated };
          playerDataRef.current = next;
          next[pid] = computeTicketsForPlayer(next[pid], undefined, pid);
          return next;
        });
        const festName = players.find(pl => pl.id === pid)?.festivalName || "?";
        addLog("🏗️ Reward", `${festName}: +${amount} 🎟️ from VIP Passes (Most Catering) — ${source}`);
      }, 0);
    }
    // Popup queue only for POSITIVE human-facing gains. Losses and AI-side changes
    // are silent (no popup) but still recorded in the ledger above.
    if (amount <= 0) return;
    const player = players.find(pl => pl.id === pid);
    if (!player || player.isAI) return;
    setFameGainQueue(prev => [...prev, { pid, amount, source, ts: Date.now() }]);
  };
  // Convenience wrapper for negative fame — same ledger, no popup.
  const logFameLoss = (pid, amount, source, yearOverride) => logFameGain(pid, -Math.abs(amount), source, yearOverride);

  // v155/v166: stage-open credits. Progress toward the next stage comes from:
  //   (a) claiming a microtrend (any kind — active, forecast, amenity)
  //   (b) picking a "stage" die face from the shared amenity dice pool (v166)
  // Every 2 progress = 1 stage-open credit. Credits are banked in
  // playerData.stageOpenCredits and spent via the stage-open panel button. Max 3
  // stages per player; extra credits banked past max are inert (allowed so a player
  // can still pick microtrends/stage dice to block opponents even after maxing out).
  const grantStageCredit = (pid, reason) => {
    if (stageOpenModeRef.current !== "trends") return;
    // v166: no early-out at max stages — the credit still banks (dead weight) but the
    // pick/claim itself consumed the shared resource, which is the blocking value.
    setPlayerData(prev => ({
      ...prev,
      [pid]: { ...prev[pid], stageOpenCredits: ((prev[pid]?.stageOpenCredits) || 0) + 1 },
    }));
    const pName = players.find(p => p.id === pid)?.festivalName || "?";
    addLog("🎪 Stage Credit", `${pName} earned a stage-open credit (${reason})`);
    showFloatingBonus(`🎪 Stage Credit!`, "#4ade80");
  };
  // v166: unified progress helper — called from both microtrend claim path AND stage
  // die pick path. Increments stageProgress on playerData; every 2 progress → 1 credit
  // and progress resets by 2 (so a player at 1 progress who claims 2 more sources
  // gets a credit at their next-to-last progress and lands back at 1).
  const grantStageProgress = (pid, reason) => {
    if (stageOpenModeRef.current !== "trends") return;
    setPlayerData(prev => {
      const cur = prev[pid] || {};
      const newProgress = (cur.stageProgress || 0) + 1;
      // v191: threshold raised from 2 to 3 progress. Combined with the +1 Fame
      // microtrend reduction, this slows the pace of stage-2/stage-3 opening
      // (players need 3 microtrend/stage-die claims per new stage instead of 2).
      if (newProgress >= 3) {
        // Cross the threshold — bank a credit and roll progress back
        setTimeout(() => grantStageCredit(pid, reason), 40);
        return { ...prev, [pid]: { ...cur, stageProgress: newProgress - 3 } };
      }
      return { ...prev, [pid]: { ...cur, stageProgress: newProgress } };
    });
  };
  // Legacy shim: keeps existing microtrend-claim call sites working. All they need
  // to know is "this claim just fired, credit the progress." The threshold change
  // (v191: now 3, was 2, was 3 originally) is handled inside grantStageProgress.
  const checkMicrotrendCredit = (pid) => {
    if (stageOpenModeRef.current !== "trends") return;
    grantStageProgress(pid, "Microtrend claim");
  };

  // v155: spend a stage-open credit. Grows the player's `stages` array by one, adds a
  // fresh stage name from the STAGE_NAMES pool + color, decrements the credit counter.
  // Grants +1 Fame next-year bonus (matching the old pre-round stage-open behavior)
  // when the stageOpenFameBonus toggle is on.
  const spendStageCredit = (pid) => {
    const pd = playerDataRef.current?.[pid] || playerData[pid] || {};
    if ((pd.stageOpenCredits || 0) < 1) return;
    if ((pd.stages || []).length >= 3) return;
    const stageCount = (pd.stages || []).length;
    const usedNames = pd.stageNames || [];
    const availNames = STAGE_NAMES.filter(n => !usedNames.includes(n));
    const sName = availNames[Math.floor(Math.random() * availNames.length)] || `Stage ${stageCount + 1}`;
    // v165: stage-opening fame bonus removed as part of the fame-sources prune.
    setPlayerData(prev => {
      const cur = prev[pid] || {};
      return {
        ...prev,
        [pid]: {
          ...cur,
          stages: [...(cur.stages || []), { fameRequired: 0 }],
          stageArtists: [...(cur.stageArtists || []), []],
          stageNames: [...(cur.stageNames || []), sName],
          stageColors: [...(cur.stageColors || []), STAGE_COLORS[stageCount % STAGE_COLORS.length]],
          stageOpenCredits: Math.max(0, (cur.stageOpenCredits || 0) - 1),
        },
      };
    });
    const pName = players.find(p => p.id === pid)?.festivalName || "?";
    addLog("🎪 Stage Open", `${pName} spent a stage credit → opened "${sName}"!`);
    showFloatingBonus(`🎪 Opened ${sName}!`, "#4ade80");
  };

  // v158: contract helpers.
  // Deal N-1 (min 2) shared contracts, avoiding duplicates and any already-claimed ones.
  const dealSharedContracts = () => {
    const n = Math.max(2, players.length - 1);
    // Exclude any council currently claimed by any player (checking playerData for claimed contracts)
    const claimedIds = new Set();
    Object.values(playerDataRef.current || {}).forEach(pd => {
      (pd.claimedContracts || []).forEach(cc => claimedIds.add(cc.contractId));
    });
    const pool = ALL_COUNCILS.filter(c => !claimedIds.has(c.id));
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    const dealt = shuffled.slice(0, n).map(c => c.id);
    setSharedContracts(dealt);
    if (dealt.length > 0) {
      const names = dealt.map(id => ALL_COUNCILS.find(c => c.id === id)?.name || id).join(", ");
      addLog("📜 Council Contracts", `Shared contracts revealed: ${names}`);
    }
  };
  // Check whether any shared contract is newly satisfied on the given player+field.
  // If so, queue a pending claim modal (only 1 at a time; more resolve as this one clears).
  const checkContractsForPlayer = (pid, fieldIdx) => {
    if (!contractsModeRef.current) return;
    const pd = playerDataRef.current?.[pid] || playerData[pid] || {};
    // Skip if the player already has 3 claimed contracts (one per field)
    const claimed = pd.claimedContracts || [];
    if (claimed.length >= 3) return;
    // Skip fields that already have a claimed contract attached
    if (claimed.some(cc => cc.fieldIdx === fieldIdx)) return;
    const field = (pd.fields || [])[fieldIdx];
    if (!field) return;
    // Find first shared contract whose condition is satisfied on this field
    const currentShared = sharedContractsRef.current || [];
    for (const cid of currentShared) {
      const council = ALL_COUNCILS.find(c => c.id === cid);
      if (!council) continue;
      if (councilQualifies(council, field, yearRef.current || year || 1)) {
        setPendingContractClaim({ pid, contractId: cid, fieldIdx });
        return; // only one modal at a time
      }
    }
  };
  const sharedContractsRef = useRef([]);
  useEffect(() => { sharedContractsRef.current = sharedContracts; }, [sharedContracts]);

  // Claim resolution — fire the reward ONCE immediately and remove from shared pool.
  // v161: contracts are one-time effects on claim, not recurring yearly rewards. This
  // fires each reward type as an immediate action. Contracts no longer attach to fields
  // for future firing — the claim IS the effect.
  const fireContractRewardOnce = (pid, council, fieldIdx) => {
    const r = council.reward;
    if (!r) return;
    const y = yearRef.current || year || 1;
    const yIdx = Math.max(0, Math.min(3, y - 1));
    const pName = players.find(p => p.id === pid)?.festivalName || "?";
    switch (r.type) {
      case "fame": {
        const amount = (r.perYear && r.perYear[yIdx]) || 1;
        setPlayerData(prev => ({ ...prev, [pid]: { ...prev[pid], baseFame: Math.min(FAME_MAX, (prev[pid]?.baseFame || 0) + amount) } }));
        logFameGain(pid, amount, `Contract: ${council.name}`);
        addLog("📜 Contract", `${pName} claimed ${council.name}: +${amount} 🔥 Fame`);
        break;
      }
      case "starDice": {
        const amount = (r.perYear && r.perYear[yIdx]) || 1;
        setDicePool(prevPool => {
          const got = Math.min(amount, prevPool);
          if (got > 0) {
            setPlayerData(prev => ({ ...prev, [pid]: { ...prev[pid], heldDice: (prev[pid]?.heldDice || 0) + got } }));
            addLog("📜 Contract", `${pName} claimed ${council.name}: +${got} Star Die${got === 1 ? "" : "s"}`);
          } else {
            addLog("📜 Contract", `${pName} claimed ${council.name}: no dice left in pool`);
          }
          return Math.max(0, prevPool - amount);
        });
        break;
      }
      case "placeAmenity": {
        // Grant 1 amenity of the specified type on the same field they claimed on.
        recalcAfterUpdate(pid, pd => mutateAmenity(pd, fieldIdx, r.amenity, +1));
        addLog("📜 Contract", `${pName} claimed ${council.name}: placed ${AMENITY_ICONS[r.amenity] || ""} ${AMENITY_LABELS[r.amenity]} on Field ${fieldIdx + 1}`);
        showFloatingBonus(`+1 ${AMENITY_LABELS[r.amenity]}`, AMENITY_COLORS[r.amenity] || "#fbbf24");
        break;
      }
      case "drawOnPlay": {
        // Convert continuous → one-shot "draw 3 artists now"
        const drawn = drawFromDeck(3);
        if (drawn.length > 0) {
          setPlayerData(prev => ({ ...prev, [pid]: { ...prev[pid], hand: [...(prev[pid]?.hand || []), ...drawn] } }));
          addLog("📜 Contract", `${pName} claimed ${council.name}: drew ${drawn.length} artists`);
        }
        break;
      }
      case "refreshPool": {
        // Refresh the artist pool now
        const currentPool = artistPoolRef.current || artistPool;
        const newDiscards = [...currentPool];
        setDiscardPile(prev => [...prev, ...newDiscards]);
        const fresh = drawFromDeck(5);
        setArtistPool(fresh);
        addLog("📜 Contract", `${pName} claimed ${council.name}: refreshed the pool`);
        break;
      }
      case "freeSpecialGuests":
      case "drawSpecialGuests": {
        // Give one immediate special guest opportunity — draw 1 guest, add to hand
        const drawn = drawFromDeck(1);
        if (drawn.length > 0) {
          setPlayerData(prev => ({ ...prev, [pid]: { ...prev[pid], hand: [...(prev[pid]?.hand || []), ...drawn] } }));
          addLog("📜 Contract", `${pName} claimed ${council.name}: drew a special guest into hand`);
        }
        break;
      }
      case "drawArtists": {
        const amount = (r.perYear && r.perYear[yIdx]) || 2;
        const drawn = drawFromDeck(amount);
        if (drawn.length > 0) {
          setPlayerData(prev => ({ ...prev, [pid]: { ...prev[pid], hand: [...(prev[pid]?.hand || []), ...drawn] } }));
          addLog("📜 Contract", `${pName} claimed ${council.name}: drew ${drawn.length} artists`);
        }
        break;
      }
      case "artistOnMicrotrend": {
        // Convert to "draw 2 artists now"
        const drawn = drawFromDeck(2);
        if (drawn.length > 0) {
          setPlayerData(prev => ({ ...prev, [pid]: { ...prev[pid], hand: [...(prev[pid]?.hand || []), ...drawn] } }));
          addLog("📜 Contract", `${pName} claimed ${council.name}: drew ${drawn.length} artists`);
        }
        break;
      }
      case "tickets": {
        const amount = (r.perYear && r.perYear[yIdx]) || 3;
        setPlayerData(prev => ({ ...prev, [pid]: { ...prev[pid], bonusTickets: (prev[pid]?.bonusTickets || 0) + amount } }));
        logTicketGain(pid, amount, `Contract: ${council.name}`);
        addLog("📜 Contract", `${pName} claimed ${council.name}: +${amount} 🎟️`);
        break;
      }
      default: {
        addLog("📜 Contract", `${pName} claimed ${council.name} (no immediate effect)`);
      }
    }
  };

  const claimContract = (pid, contractId, fieldIdx) => {
    const council = ALL_COUNCILS.find(c => c.id === contractId);
    if (!council) { setPendingContractClaim(null); return; }
    // v163: attach to pd.councils[fieldIdx] as a DISPLAY marker so the field UI shows
    // the claimed contract. Mark it with `_claimed: true` so year-end reward loops skip
    // it — the reward fired ONCE via fireContractRewardOnce, we do not want it to fire
    // again in future years.
    setPlayerData(prev => {
      const cur = prev[pid] || {};
      const claimed = [...(cur.claimedContracts || []), { contractId, fieldIdx }];
      const councils = [...(cur.councils || [null, null, null])];
      councils[fieldIdx] = { ...council, _claimed: true, _fromContract: true };
      return { ...prev, [pid]: { ...cur, claimedContracts: claimed, councils } };
    });
    setSharedContracts(prev => prev.filter(id => id !== contractId));
    const pName = players.find(p => p.id === pid)?.festivalName || "?";
    addLog("📜 Contract Claimed", `${pName} claimed "${council.name}" on Field ${fieldIdx + 1}!`);
    showFloatingBonus(`📜 ${council.name}!`, "#a855f7");
    setPendingContractClaim(null);
    setTimeout(() => fireContractRewardOnce(pid, council, fieldIdx), 200);
    setTimeout(() => checkContractsForPlayer(pid, fieldIdx), 400);
  };
  const declineContract = () => {
    // Player chose not to claim. Contract stays on the shared table.
    setPendingContractClaim(null);
  };

  // v154: identity effect helpers. Every ticket/fame movement caused by a player's
  // identity flows through here so it gets logged to identityLog (for the panel + hover)
  // AND to ticketsLog/fameLog (so the existing hover-tooltip UI already shows it).
  const applyIdentityTickets = (pid, amount, source) => {
    if (!amount) return;
    const y = yearRef.current || year || 1;
    setIdentityLog(prev => ({
      ...prev,
      [pid]: [...(prev[pid] || []), { source, amount, year: y, kind: "ticket" }],
    }));
    // Route through logTicketGain so the ticket-hover tooltip aggregates it under the
    // identity name AND the actual bonusTickets state moves. Suppresses the +/-N popup
    // for identities that fire very frequently to avoid spamming the screen.
    logTicketGain(pid, amount, source);
    setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: Math.max(0, (p[pid]?.bonusTickets || 0) + amount) } }));
  };
  const applyIdentityFame = (pid, amount, source) => {
    if (!amount) return;
    const y = yearRef.current || year || 1;
    setIdentityLog(prev => ({
      ...prev,
      [pid]: [...(prev[pid] || []), { source, amount, year: y, kind: "fame" }],
    }));
    logFameGain(pid, amount, source);
    setPlayerData(p => ({ ...p, [pid]: { ...p[pid], baseFame: Math.min(FAME_MAX, Math.max(0, (p[pid]?.baseFame || 0) + amount)) } }));
  };

  // v154: fires when an artist is played (any path — hand, pool, contest, tempt) after
  // the artist is on-stage. `viaSpecialGuest` = true when the play was the year-end
  // special-guest phase (affects Full of Surprises normal-completion penalty).
  // `stageBecameFull` = true when this play made the stage go from 2/3 to 3/3 (affects
  // Full of Surprises penalty for normal completions).
  const applyIdentityOnPlay = (pid, artist, opts = {}) => {
    if (!identitiesModeRef.current) return;
    const idId = playerIdentitiesRef.current[pid];
    const identity = getIdentity(idId);
    if (!identity) return;
    const { viaSpecialGuest = false, stageBecameFull = false } = opts;
    const artistGenres = (artist.genre || "").split(",").map(g => g.trim());
    const hasEffect = !!(artist.effect || "").trim();
    const fame = artist.fame || 0;

    switch (identity.type) {
      case "genrePair": {
        const inPair = artistGenres.some(g => identity.inGenres.includes(g));
        if (inPair) applyIdentityTickets(pid, identity.benefitTickets, `Identity: ${identity.name} (in-genre)`);
        else applyIdentityTickets(pid, identity.penaltyTickets, `Identity: ${identity.name} (off-genre)`);
        break;
      }
      case "counterCulture": {
        if (fame <= 3) applyIdentityTickets(pid, 1, `Identity: Counter Culture (low-fame play)`);
        else applyIdentityTickets(pid, -2, `Identity: Counter Culture (headliner penalty)`);
        break;
      }
      case "localTalent": {
        if (fame <= 2) applyIdentityTickets(pid, 2, `Identity: Local Talent (local play)`);
        else applyIdentityTickets(pid, -2, `Identity: Local Talent (big-name penalty)`);
        break;
      }
      case "effectMatch": {
        // Confetti Cannons: +2 with effect, −1 without
        if (hasEffect === identity.hasEffect) applyIdentityTickets(pid, identity.benefitTickets, `Identity: ${identity.name} (effect match)`);
        else applyIdentityTickets(pid, identity.penaltyTickets, `Identity: ${identity.name} (no-effect penalty)`);
        break;
      }
      case "keepingItSimple": {
        // +4 for no-effect artists; artists WITH effects give 0 base tickets (deducted here).
        if (!hasEffect) applyIdentityTickets(pid, 4, `Identity: Keeping it Simple (clean lineup)`);
        else applyIdentityTickets(pid, -(artist.tickets || 0), `Identity: Keeping it Simple (effect artist voided)`);
        break;
      }
      case "fullOfSurprises": {
        if (viaSpecialGuest) applyIdentityTickets(pid, 4, `Identity: Full of Surprises (special guest)`);
        else if (stageBecameFull) applyIdentityTickets(pid, -3, `Identity: Full of Surprises (normal completion penalty)`);
        break;
      }
      case "curated": {
        // Handled at year end via applyIdentityAtYearEnd. No per-play effect.
        break;
      }
      default: break;
    }
  };

  // Counter Culture tempt refund: fires when a player tempts an artist ≤3 Fame.
  const applyIdentityOnTempt = (pid, artist) => {
    if (!identitiesModeRef.current) return;
    const idId = playerIdentitiesRef.current[pid];
    const identity = getIdentity(idId);
    if (!identity || identity.type !== "counterCulture") return;
    if ((artist.fame || 0) <= 3) applyIdentityFame(pid, 1, `Identity: Counter Culture (tempt refund)`);
  };

  // Curated year-end scoring. Called from beginRoundEnd for every player with Curated.
  const applyIdentityAtYearEnd = (pid) => {
    if (!identitiesModeRef.current) return;
    const idId = playerIdentitiesRef.current[pid];
    const identity = getIdentity(idId);
    if (!identity || identity.type !== "curated") return;
    const played = (yearEvents[pid]?.artistsPlayedThisYear) || 0;
    if (played <= 6) applyIdentityTickets(pid, played, `Identity: Curated (+1 per artist, ${played} played)`);
    else applyIdentityTickets(pid, -3 * (played - 6), `Identity: Curated (${played - 6} artists over cap)`);
  };

  // v135: Alternative Artist Objectives — lobby toggle. When ON, this system replaces the
  // fame-based stage-opening progression. Players draw objectives and complete them to earn
  // stage-open rewards.
  const [altObjectivesMode, setAltObjectivesMode] = useState(false);
  const altObjectivesModeRef = useRef(true);
  useEffect(() => { altObjectivesModeRef.current = altObjectivesMode; }, [altObjectivesMode]);

  // Per-player state for the alt-objectives system.
  //   activeObjectives:    { pid: Array<{ id, source, addedYear }> } — currently live objectives
  //   completedObjectives: { pid: Array<{ id, achievedYear }> } — done, don't re-evaluate
  //   yearEvents:          { pid: { artistsPlayedThisYear, contestWinsThisYear, ... } }
  //   altObjectiveDeck:    remaining objective IDs to draw from (shared across all players)
  //   pendingObjectivePicker: { pid, kind, options } — currently showing picker
  //   yearObjectiveAssignments: { year: { pid: objId | null } } — the "current year" objective
  //     tracked per year so we know what failure evaluation needs to check against
  const [activeObjectives, setActiveObjectives] = useState({});
  const [completedObjectives, setCompletedObjectives] = useState({});
  const [yearEvents, setYearEvents] = useState({});
  const [altObjectiveDeck, setAltObjectiveDeck] = useState([]);
  const [pendingObjectivePicker, setPendingObjectivePicker] = useState(null);
  const [pendingObjectivePickerQueue, setPendingObjectivePickerQueue] = useState([]);
  const [yearObjectiveAssignments, setYearObjectiveAssignments] = useState({});

  // Increment a per-year event counter for the current player.
  // v196.2: was gated on altObjectivesModeRef, which meant Curated identity (and any
  // other identity keying off per-year event counters) never fired outside alt-objectives
  // mode — because yearEvents.artistsPlayedThisYear was never incremented. Removed the
  // gate so identity year-end scoring works regardless of the alt-objectives toggle.
  // Counters are cheap and used by both identities and (when active) alt-objectives.
  const bumpYearEvent = (pid, field, by = 1) => {
    if (pid == null) return;
    setYearEvents(prev => ({
      ...prev,
      [pid]: { ...(prev[pid] || {}), [field]: ((prev[pid] || {})[field] || 0) + by }
    }));
  };
  // Tracks which players have successfully used their agent this year (exhausted until next year)
  const [agentExhausted, setAgentExhausted] = useState({});
  // Tracks how many bonus agent uses each player has consumed this year (granted by "+N Agents" councils).
  // Each qualifying "agents" council reward provides perYear[yIdx] extra deployments after the base agent
  // is exhausted. Resets to {} each year transition.
  const [agentBonusUsesUsed, setAgentBonusUsesUsed] = useState({});
  // Per-player Set of artist names booked via agent this year. Used to surface
  // year-end agent effects (e.g. Kendrick Lamar's "+8 VP at Year End" agentEffect)
  // in the year-end resolution. Reset at year transition along with the other agent state.
  const [agentBookedThisYear, setAgentBookedThisYear] = useState({});
  // Pending agent amenity placements (player needs to place amenity gained from agent)
  const [pendingAgentAmenity, setPendingAgentAmenity] = useState([]); // [{ pid, amenityType }]
  // Pending agent artist booking (uncontested pool claim)
  const [pendingAgentArtist, setPendingAgentArtist] = useState(null); // { pid, artist, poolIdx }
  // Agent contest state (multiple agents on same artist).
  // Shape: { artist, contestants, rolledFace, contestantData, winnerId, isAuto }
  //   contestants: array of { pid, placedTurn } (raw input)
  //   rolledFace: one of the DICE_OPTIONS values — the contest die face
  //   contestantData: array of { pid, festivalName, value, tickets, placedTurn, isWinner }
  //   winnerId: the winning player's id
  //   isAuto: true if no human is involved (auto-dismiss the modal after a brief reveal)
  const [agentContest, setAgentContest] = useState(null);
  // Auto-commit contest modal when it's an AI-only resolution. Use a ref to guard against
  // the effect firing twice in React 18 StrictMode dev (the second fire would commit twice).
  const agentContestAutoFiredRef = useRef(false);
  useEffect(() => {
    if (!agentContest) { agentContestAutoFiredRef.current = false; return; }
    if (!agentContest.isAuto) return;
    if (agentContestAutoFiredRef.current) return;
    agentContestAutoFiredRef.current = true;
    const t = setTimeout(() => {
      const currentPid = agentContest.contestantData?.find(c => c.pid === currentPlayerId)?.pid;
      commitAgentContest(agentContest);
      setAgentContest(null);
      setTimeout(() => recalcTickets(), 50);
      // v131: after auto-resolved contests under tempt mode, check whether the current
      // player still has another pending tempt to resolve.
      if (temptModeRef.current && currentPid != null) checkNextTempt(currentPid);
    }, 2400);
    return () => clearTimeout(t);
  }, [agentContest]);
  // (hoverHex / displacedAmenities / displacedPlaceIdx removed — no spatial UI)
  const [showTurnStart, setShowTurnStart] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [gameLog, setGameLog] = useState([]);
  const [allTickets, setAllTickets] = useState({});
  const [revealIndex, setRevealIndex] = useState(0);
  const [leaderboardRevealed, setLeaderboardRevealed] = useState(false);
  // v197.9: between-year draft phase. When a year ends, 5 fresh artists are drawn from
  // the deck and players pick one each in order of end-of-year Fame (highest first,
  // ties broken by tickets sold). This gives every player one guaranteed high-value
  // pickup entering the new year — improves Y2/Y3 pacing so a good Y1 doesn't leave
  // players' second/third years feeling like a downhill slide.
  const [draftCards, setDraftCards] = useState([]);
  const [draftOrder, setDraftOrder] = useState([]); // pids in pick order
  const [draftIndex, setDraftIndex] = useState(0);

  // Pre-round
  const [preRoundIndex, setPreRoundIndex] = useState(0);
  const [preRoundStep, setPreRoundStep] = useState("notify");
  // freeAmenity state declared early so the AI dispatcher useEffect deps array can reference
  // freeAmenityPlaced without hitting a temporal dead zone (it was previously declared
  // far below in the pre-round block, which TDZ'd on render).
  const [freeAmenityCount, setFreeAmenityCount] = useState(0);
  const [freeAmenityPlaced, setFreeAmenityPlaced] = useState(0);
  const [freeAmenityType, setFreeAmenityType] = useState(null);
  // (displacedAmenities / displacedPlaceIdx removed)

  // Artist system
  const [artistDeck, setArtistDeck] = useState([]);
  const [artistPool, setArtistPool] = useState([]);
  const [discardPile, setDiscardPile] = useState([]);
  // Keep refs in sync with state so functions called inside chained event handlers
  // can see the latest values without waiting for React to flush.
  useEffect(() => { artistDeckRef.current = artistDeck; }, [artistDeck]);
  useEffect(() => { artistPoolRef.current = artistPool; }, [artistPool]);
  useEffect(() => { discardPileRef.current = discardPile; }, [discardPile]);
  const [showDiscard, setShowDiscard] = useState(false);
  const [firstFullLineup, setFirstFullLineup] = useState(false);
  // v169: track the LAST artist played by each player, and who was the most recent player
  // to play an artist. Used by Eminem's "inherit tickets from previous player's last artist" effect.
  const [lastArtistByPid, setLastArtistByPid] = useState({}); // { pid: artistCard }
  const [lastArtistPid, setLastArtistPid] = useState(null); // pid of who just played
  // v170: hard cap of 2 artist plays per turn. Increments on every bookArtistToStage
  // call; gates chain-play effects (Sadchild, Lil Angry, Clairo tempt, Wolf Alice,
  // Rage Against, Ms Banks) so a "play another" effect from the SECOND play cannot
  // trigger a third.
  const [playsThisTurn, setPlaysThisTurn] = useState(0);
  const playsThisTurnRef = useRef(0);
  useEffect(() => { playsThisTurnRef.current = playsThisTurn; }, [playsThisTurn]);

  // Artist action sub-states
  const [artistAction, setArtistAction] = useState(null); // "bookFromPool","bookFromHand","reserveFromPool","reserveFromDeck","pickStage"
  const [selectedArtist, setSelectedArtist] = useState(null);
  const [selectedStageIdx, setSelectedStageIdx] = useState(null);
  const [showHeadliner, setShowHeadliner] = useState(null); // { artist, festival }
  const [showBookedArtist, setShowBookedArtist] = useState(null); // { artist, stageName, isHeadliner, festival }
  const [showCouncilDrawBonus, setShowCouncilDrawBonus] = useState(null); // { drawn: [Artist], festival, pid }
  const [floatingBonuses, setFloatingBonuses] = useState([]); // [{ id, text, color, x }]
  const [showHand, setShowHand] = useState(false);
  const [deckDrawnCard, setDeckDrawnCard] = useState(null); // card drawn from deck awaiting confirm
  const [deckCardRevealed, setDeckCardRevealed] = useState(false);
  // Draw 2 flow: player picks 2 artists from any combo of pool/deck
  const [draw2Picks, setDraw2Picks] = useState([]); // artists picked so far (0, 1, or 2)
  const [draw2DeckCard, setDraw2DeckCard] = useState(null); // deck card drawn but not yet decided
  useEffect(() => { deckDrawnCardRef.current = deckDrawnCard; }, [deckDrawnCard]);
  useEffect(() => { draw2PicksRef.current = draw2Picks; }, [draw2Picks]);

  // Setup artist draft
  const [setupDraftOptions, setSetupDraftOptions] = useState([]); // 4 cards offered to current setup player
  const [setupDraftSelected, setSetupDraftSelected] = useState(null);
  const [draftRemaining0, setDraftRemaining0] = useState([]); // pool of 0-fame artists for drafting
  const [draftRemaining5, setDraftRemaining5] = useState([]); // pool of 5-fame artists for drafting
  const [undraftedArtists, setUndraftedArtists] = useState([]); // unchosen draft cards to shuffle back

  // Objectives
  const [objectiveDeck, setObjectiveDeck] = useState([]);
  const [playerObjectives, setPlayerObjectives] = useState({}); // { playerId: [{ obj, completed, vpAwarded }] }
  const [pendingObjectiveChoice, setPendingObjectiveChoice] = useState(null); // { playerId, options: [obj, obj] }
  const [trendingObjective, setTrendingObjective] = useState(null);
  const [microtrends, setMicrotrends] = useState([]); // v189: always [amenity, genre] pair
  // v189: two separate forecasts — one for amenity, one for genre. nextMicrotrend kept as
  // an alias to nextAmenityMicrotrend for legacy code paths (most read it for genre logic
  // and now we're clarifying which type they mean).
  const [nextAmenityMicrotrend, setNextAmenityMicrotrend] = useState(null);
  const [nextGenreMicrotrend, setNextGenreMicrotrend] = useState(null);
  // Legacy alias — most callers use this for genre-based forecast logic
  const nextMicrotrend = nextGenreMicrotrend;
  const setNextMicrotrend = setNextGenreMicrotrend;
  // Microtrend bag — a shuffled deck of all 10 possible trends (6 genres + 4 amenities).
  // We pop from the top of this bag whenever we need a new trend. When the bag is empty,
  // we refill it with a fresh shuffle. This GUARANTEES every trend appears once before
  // any repeat, eliminating the RNG-clustering of the previous "avoid last N" approach.
  // The only edge case is the bag boundary — to prevent the last trend of one bag matching
  // the first trend of the next (which would look like an immediate repeat), we swap the
  // first two items of a freshly refilled bag if the first matches the most-recent trend.
  const microtrendBagRef = useRef([]);
  // Legacy history state kept for backward compatibility but no longer drives generation —
  // the bag handles all variety guarantees now. Left declared to avoid breaking anything
  // that might reference it (the leaderboard does for the microtrendsCompletedCount stat).
  const [microtrendHistory, setMicrotrendHistory] = useState([]);
  const microtrendHistoryRef = useRef([]);
  useEffect(() => { microtrendHistoryRef.current = microtrendHistory; }, [microtrendHistory]);
  const [showObjectives, setShowObjectives] = useState(false);
  const [showStageDetail, setShowStageDetail] = useState(null);
  const [sidebarTab, setSidebarTab] = useState("my");
  const [showYearAnnouncement, setShowYearAnnouncement] = useState(false);

  const [viewingPlayerId, setViewingPlayerId] = useState(null);

  // Pending effects queue (for effects that need player interaction)
  const [pendingEffect, setPendingEffect] = useState(null); // { type: "placeAmenity"|"placeSpecific"|"signArtist", amenityType?, artistName? }
  const [pendingEffectPid, setPendingEffectPid] = useState(null);
  const [deferPoolRefresh, setDeferPoolRefresh] = useState(false);
  const [poolRefreshedByEffect, setPoolRefreshedByEffect] = useState(false);
  // Counter for council "refreshPool" usage this turn. The number of qualifying
  // refreshPool councils a player has equals their cap (each council = +1 refresh).
  // Reset to 0 at the start of each turn via the turnAction reset block.
  const [councilRefreshesUsedThisTurn, setCouncilRefreshesUsedThisTurn] = useState(0);
  // Counter for council "refreshDice" usage this turn. Each qualifying refreshDice
  // council (Secret Sauce / Quiet Camping / Urinals and Cubicles) grants +1 dice-reroll
  // charge per turn. Stacks just like the pool refresh: 2 qualifying councils = 2 rerolls.
  const [councilDiceRefreshesUsedThisTurn, setCouncilDiceRefreshesUsedThisTurn] = useState(0);

  // Special Guest phase
  const [specialGuestPlayer, setSpecialGuestPlayer] = useState(0); // index in players array
  const [specialGuestCard, setSpecialGuestCard] = useState(null); // the drawn artist
  const [specialGuestDrawnPool, setSpecialGuestDrawnPool] = useState([]); // all options drawn (>1 when council bonus active); cleared after pick
  const [specialGuestEligible, setSpecialGuestEligible] = useState([]); // stage indices with 2/3 artists
  // Idempotency latch: setupSpecialGuestForPlayer can be called from multiple paths
  // (render fallback + placeSpecialGuest/declineSpecialGuest setTimeouts). The ref tracks
  // the last pIdx that setup ran for so duplicate calls in the same window no-op.
  const sgSetupPidRef = useRef(null);

  // ─── Star Dice system (replaces the old Event system) ───
  // Shared dice pool — sized by player count: 2P=12, 3P=16, 4P=23
  const STAR_DICE_POOL_BY_PLAYER_COUNT = { 2: 12, 3: 16, 4: 23 };
  const [dicePool, setDicePool] = useState(0); // initialized at game start
  const dicePoolRef = useRef(dicePool);
  useEffect(() => { dicePoolRef.current = dicePool; }, [dicePool]);
  // ─── Refs for synchronous-fresh reads of zone state inside chained event handlers ───
  // React batches setState. When applyDrawArtistsBonus or other handlers fire synchronously
  // right after a draw/pickup, the closure-captured zone state is stale. These refs are
  // updated alongside their setX() in drawFromDeck/refillPool/etc and read inside getInUseNames
  // and drawFromDeck so chained calls within one event see the latest deck/pool/discard.
  const artistPoolRef = useRef([]);
  const artistDeckRef = useRef([]);
  const discardPileRef = useRef([]);
  const deckDrawnCardRef = useRef(null);
  const draw2PicksRef = useRef([]);
  // Idempotency latch — only grant positional dice once per year, even if entry point fires multiple times
  const positionalGrantedYearRef = useRef(0);
  // Per-player held dice count is on pd.heldDice
  // Per-player fame high-water mark is pd.fameHighWater (for "new fame level → +1 die" trigger)
  // Per-player filled-stage-count high-water is pd.filledStagesHighWater (for "stage filled → +1 die" trigger)
  // Star dice rolling phase
  const [starRollPhase, setStarRollPhase] = useState(null); // null | "intro" | "rolling" | "resolving"
  const [starRollPlayer, setStarRollPlayer] = useState(0); // index in players[]
  const [starRollResult, setStarRollResult] = useState(null); // { stars, amenityFaces: ["campsite", "security"...], absorbed: [...], lost: [...] }
  // Per-year tracking for "+VP per negative star face avoided" effects
  const [negStarFacesAvoidedThisYear, setNegStarFacesAvoidedThisYear] = useState({}); // { pid: count }

  // Year-End Effects phase state
  const [yearEndEffectsPlayer, setYearEndEffectsPlayer] = useState(0);
  const [yearEndEffectsList, setYearEndEffectsList] = useState([]); // [{ artist, effectDesc, type, resolved, result }]
  const [yearEndEffectIdx, setYearEndEffectIdx] = useState(0);
  const [yearEndDiceRoll, setYearEndDiceRoll] = useState(null); // { count, callback } for interactive rolls

  // Logging
  const addLog = useCallback((label, text) => setGameLog(p => [...p, { label, text, type: "entry" }]), []);
  const addLogH = useCallback((text, ht) => setGameLog(p => [...p, { text, type: "header", ht: ht || "turn" }]), []);

  const floatCounter = useRef(0);

  // ─── Sound Effects (Web Audio API) ───
  const audioCtx = useRef(null);
  const getCtx = useCallback(() => {
    if (!audioCtx.current) audioCtx.current = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx.current;
  }, []);
  const playTone = useCallback((freq, dur, type = "sine", vol = 0.15) => {
    try {
      const ctx = getCtx(); const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, ctx.currentTime);
      g.gain.setValueAtTime(vol, ctx.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      o.connect(g); g.connect(ctx.destination); o.start(); o.stop(ctx.currentTime + dur);
    } catch (e) {}
  }, [getCtx]);
  // Noise burst — used for percussion-like sounds (hi-hat, kick attack, tambourine)
  // by generating white noise through a filter for tonal shaping.
  const playNoise = useCallback((dur, vol = 0.08, filterFreq = 4000, filterType = "highpass") => {
    try {
      const ctx = getCtx();
      const bufSize = Math.max(1, Math.floor(ctx.sampleRate * dur));
      const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
      const src = ctx.createBufferSource(); src.buffer = buf;
      const filter = ctx.createBiquadFilter();
      filter.type = filterType; filter.frequency.value = filterFreq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(vol, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
      src.connect(filter); filter.connect(g); g.connect(ctx.destination);
      src.start(); src.stop(ctx.currentTime + dur);
    } catch (e) {}
  }, [getCtx]);
  const sfx = useMemo(() => {
    // ── Genre beats ── Each headliner moment kicks off a ~1.5-2s sonic motif keyed
    // to the artist's primary genre. Built from layered oscillators + filtered noise
    // so they feel distinct without needing audio assets.
    const popBeat = () => {
      // Bright C major arpeggio over a soft pulse — upbeat, radio-friendly
      playTone(523, 0.12, "triangle", 0.13);
      setTimeout(() => playTone(659, 0.12, "triangle", 0.13), 130);
      setTimeout(() => playTone(784, 0.12, "triangle", 0.13), 260);
      setTimeout(() => playTone(1047, 0.22, "triangle", 0.14), 390);
      // Light hat accents
      setTimeout(() => playNoise(0.04, 0.05, 7000), 200);
      setTimeout(() => playNoise(0.04, 0.05, 7000), 460);
      setTimeout(() => { playTone(659, 0.4, "sine", 0.09); playTone(784, 0.4, "sine", 0.08); }, 620);
    };
    const rockBeat = () => {
      // Power chord stomp — low square waves for "distortion", crash on top
      playTone(82, 0.45, "square", 0.16); playTone(123, 0.45, "square", 0.12); // E2 + B2
      playNoise(0.06, 0.18, 100, "lowpass"); // kick
      playNoise(0.4, 0.07, 5000); // crash decay
      setTimeout(() => { playTone(110, 0.45, "square", 0.16); playTone(165, 0.45, "square", 0.12); }, 480); // A2 + E3
      setTimeout(() => playNoise(0.06, 0.18, 100, "lowpass"), 480);
      setTimeout(() => { playTone(98, 0.5, "square", 0.16); playTone(147, 0.5, "square", 0.12); }, 960); // G2 + D3
      setTimeout(() => playNoise(0.06, 0.18, 100, "lowpass"), 960);
    };
    const hipHopBeat = () => {
      // 808 sub-bass with boom-bap hat pattern
      const boom = () => { playTone(55, 0.45, "sine", 0.26); playTone(82, 0.15, "sine", 0.1); };
      const hat = () => playNoise(0.025, 0.06, 8500);
      boom();
      hat();
      [180, 360, 540, 720, 900, 1080, 1260].forEach(t => setTimeout(hat, t));
      setTimeout(boom, 540);
      setTimeout(() => { playTone(220, 0.2, "sawtooth", 0.06); playTone(330, 0.2, "sawtooth", 0.05); }, 360); // jazz chord stab
      setTimeout(() => { playTone(220, 0.2, "sawtooth", 0.06); playTone(330, 0.2, "sawtooth", 0.05); }, 900);
    };
    const electronicBeat = () => {
      // Pulsing sawtooth bassline with square-wave arp on top + 4-on-floor kick
      const bass = (f, t) => setTimeout(() => playTone(f, 0.18, "sawtooth", 0.14), t);
      const kick = (t) => setTimeout(() => playNoise(0.08, 0.16, 90, "lowpass"), t);
      const arp = (f, t) => setTimeout(() => playTone(f, 0.09, "square", 0.08), t);
      const hat = (t) => setTimeout(() => playNoise(0.02, 0.05, 9000), t);
      [0, 200, 400, 600, 800, 1000, 1200, 1400].forEach((t, i) => {
        bass(i % 2 === 0 ? 110 : 146, t);
        kick(t);
        hat(t + 100);
      });
      // Arp on top
      const notes = [440, 554, 659, 880, 659, 554, 440, 554];
      notes.forEach((f, i) => arp(f, 100 + i * 175));
    };
    const indieBeat = () => {
      // Clean jangly G chord arpeggio (G-D-G-B-D ascending), bell-like triangle
      [
        { f: 196, t: 0, dur: 0.35 },   // G3
        { f: 294, t: 130, dur: 0.35 }, // D4
        { f: 392, t: 260, dur: 0.35 }, // G4
        { f: 493, t: 390, dur: 0.35 }, // B4
        { f: 587, t: 520, dur: 0.6 },  // D5 sustain
      ].forEach(({ f, t, dur }) => setTimeout(() => playTone(f, dur, "triangle", 0.11), t));
      // Soft tambourine
      [400, 800, 1100].forEach(t => setTimeout(() => playNoise(0.05, 0.04, 7500), t));
      // Sustain harmonic
      setTimeout(() => playTone(392, 0.5, "sine", 0.07), 650);
    };
    const funkBeat = () => {
      // Slap bass groove + horn stab on the upbeat
      const slap = (f, t, vol = 0.18) => setTimeout(() => { playTone(f, 0.13, "sawtooth", vol); playNoise(0.04, 0.05, 200, "lowpass"); }, t);
      slap(73, 0);     // D2
      slap(73, 160, 0.12); // ghost
      slap(98, 300);   // G2
      slap(73, 460, 0.14);
      slap(110, 620);  // A2
      slap(98, 780, 0.12);
      // Horn stab — three-note chord
      setTimeout(() => {
        playTone(440, 0.18, "square", 0.09);
        playTone(554, 0.18, "square", 0.08);
        playTone(659, 0.18, "square", 0.07);
      }, 900);
      // Hi-hat ticks
      [100, 300, 500, 700, 900, 1100].forEach(t => setTimeout(() => playNoise(0.02, 0.04, 8500), t));
    };
    // Resolve a genre string ("Pop, Funk") to a beat function. Picks the primary (first) genre.
    const playGenreBeat = (genreStr) => {
      if (!genreStr) return;
      const primary = String(genreStr).split(",")[0].trim().toLowerCase();
      const map = { pop: popBeat, rock: rockBeat, "hip hop": hipHopBeat, electronic: electronicBeat, indie: indieBeat, funk: funkBeat };
      const beat = map[primary];
      if (beat) beat();
    };
    return {
      placeAmenity: () => { playTone(800, 0.08, "sine", 0.12); setTimeout(() => playTone(600, 0.06, "sine", 0.08), 60); },
      bookArtist: () => { playTone(523, 0.1, "triangle", 0.15); setTimeout(() => playTone(659, 0.1, "triangle", 0.15), 80); setTimeout(() => playTone(784, 0.15, "triangle", 0.12), 160); },
      headliner: () => { playTone(523, 0.1, "triangle", 0.18); setTimeout(() => playTone(659, 0.08, "triangle", 0.16), 100); setTimeout(() => playTone(784, 0.08, "triangle", 0.16), 180); setTimeout(() => playTone(1047, 0.25, "triangle", 0.2), 260); },
      gainVP: () => { playTone(880, 0.12, "sine", 0.1); setTimeout(() => playTone(1100, 0.1, "sine", 0.08), 80); },
      gainTickets: () => { playTone(660, 0.08, "square", 0.06); setTimeout(() => playTone(770, 0.1, "square", 0.05), 70); },
      gainFame: () => { playTone(440, 0.12, "sawtooth", 0.08); setTimeout(() => playTone(660, 0.15, "sawtooth", 0.1), 100); setTimeout(() => playTone(880, 0.2, "sawtooth", 0.08), 200); },
      placeStage: () => { playTone(330, 0.15, "triangle", 0.12); setTimeout(() => playTone(440, 0.12, "triangle", 0.1), 120); setTimeout(() => playTone(550, 0.2, "triangle", 0.12), 220); },
      genreBeat: playGenreBeat,
    };
  }, [playTone, playNoise]);
  const showFloatingBonus = useCallback((text, color) => {
    const id = Date.now() + Math.random();
    const offset = (floatCounter.current % 4) * 50; // stagger by 50px each
    floatCounter.current++;
    setFloatingBonuses(p => [...p, { id, text, color: color || "#fbbf24", offset }]);
    setTimeout(() => setFloatingBonuses(p => p.filter(b => b.id !== id)), 2200);
  }, []);

  // Derived
  const currentPlayerId = turnOrder[currentPlayerIdx];
  const currentPlayer = players.find(p => p.id === currentPlayerId);
  // v197.14: Infrastructure Reward helpers.
  // getInfraLeader(amenity): pid of the strict leader in that amenity type WHO HAS
  //   MORE THAN 1 of it — i.e. count >= 2. Returns null if tied for top, if the leader
  //   has fewer than 2, or nobody has any. Uses playerDataRef.current for freshness so
  //   the check reflects the state after the most recent amenity placement, even if
  //   React hasn't committed the render yet.
  // hasInfraReward(pid, rewardId): true iff the given player is the strict leader in
  //   that reward's amenity type (with count >= 2) AND that rewardId is the reward
  //   drawn for this game.
  const getInfraLeader = (amenity, dataOverride) => {
    if (!infraRewardsModeRef.current) return null;
    // Priority: explicit override (from useEffect closure playerData) → ref (freshest we
    // usually have during event handlers) → render-scoped state (fallback).
    const src = dataOverride || playerDataRef.current || playerData || {};
    // v197.20: read amenity counts directly from `fields` instead of the `amenities`
    // cache. The `amenities` object is derived from `fields` via sumFields(), and can
    // drift out of sync if any setPlayerData path updates the pd without re-running
    // computeTicketsForPlayer. Symptom: in Y2/Y3 the panel showed "unclaimed" even
    // though amenities visibly persisted. Reading straight from fields is the ground
    // truth: fields survive year transitions unchanged (see startNextYear reset —
    // stageArtists/bonusTickets/baseFame are cleared but `.fields` is left alone).
    const counts = players.map(p => {
      const fields = src[p.id]?.fields || [];
      const count = fields.reduce((sum, f) => sum + (f?.[amenity] || 0), 0);
      return { pid: p.id, count };
    });
    if (counts.length === 0) return null;
    counts.sort((a, b) => b.count - a.count);
    if (counts[0].count < 2) return null;
    if (counts.length >= 2 && counts[0].count === counts[1].count) return null;
    return counts[0].pid;
  };
  const hasInfraReward = (pid, rewardId) => {
    if (!infraRewardsModeRef.current) return false;
    const rewards = infraRewardsRef.current || {};
    const reward = INFRA_REWARDS[rewardId];
    if (!reward) return false;
    // Only the reward that was drawn for this game matters.
    if (rewards[reward.amenity] !== rewardId) return false;
    return getInfraLeader(reward.amenity) === pid;
  };
  // Convenience: what reward (if any) does this player currently hold for a given amenity?
  const getPlayerInfraReward = (pid, amenity) => {
    if (!infraRewardsModeRef.current) return null;
    if (getInfraLeader(amenity) !== pid) return null;
    return (infraRewardsRef.current || {})[amenity] || null;
  };
  // v197.12: "Reputation" (sec_3) — the security leader can play artists 1 Fame lower
  // than normal. Returns the effective Fame requirement for a specific player+artist.
  const effectiveArtistFame = (artist, pid) => {
    const reduction = hasInfraReward(pid, "sec_3") ? 1 : 0;
    return Math.max(0, (artist?.fame || 0) - reduction);
  };
  // Same idea as canAffordArtist but with sec_3 applied. Callers pass pid so we know
  // whether to reduce the Fame requirement. Non-Fame checks (amenity costs) unchanged.
  const canAffordArtistWithRewards = (artist, pd, pid) => {
    if (!artist || !pd) return false;
    if ((pd.fame || 0) < effectiveArtistFame(artist, pid)) return false;
    const a = pd.amenities || {};
    return (a.campsite||0) >= artist.campCost && (a.security||0) >= artist.securityCost && (a.catering||0) >= artist.cateringCost && (a.portaloo||0) >= artist.portalooCost;
  };
  // Short helper for passing to canAffordArtist as 3rd arg — 1 iff the player holds sec_3.
  const sec3Reduction = (pid) => (hasInfraReward(pid, "sec_3") ? 1 : 0);
  // v197.13: Backstage Perks (cat_1) — if a Fame or Stage face is in the amenity pool
  // after a refresh (fresh roll), the catering leader gains 1 Fame (if Fame face rolled)
  // or 1 stage progress (if Stage face rolled). If both present, prefer Fame.
  // For MVP: auto-grant based on what's rolled (no choice modal). If both, Fame wins.
  const grantCat1IfEligible = (pid, freshDice) => {
    if (!hasInfraReward(pid, "cat_1")) return;
    const hasFame = freshDice.includes("fame");
    const hasStage = freshDice.includes("stage");
    if (!hasFame && !hasStage) return;
    const pName = players.find(p => p.id === pid)?.festivalName || "?";
    if (hasFame) {
      logFameGain(pid, 1, "Backstage Perks (Most Catering)");
      setPlayerData(p => ({ ...p, [pid]: { ...p[pid], baseFame: Math.min(FAME_MAX, (p[pid].baseFame || 0) + 1) } }));
      addLog("🏗️ Reward", `${pName}: +1 🔥 Fame from Backstage Perks (Fame die in pool)`);
      showFloatingBonus("+1 🔥 Fame (Backstage Perks)", "#fb923c");
    } else {
      grantStageProgress(pid, "Backstage Perks (Most Catering)");
      addLog("🏗️ Reward", `${pName}: +1 🎪 stage progress from Backstage Perks (Stage die in pool)`);
      showFloatingBonus("+1 🎪 Stage (Backstage Perks)", "#fb923c");
    }
  };
  // v197.14/15: watch for leader changes across all four amenity types and log them so
  // players see when a reward is gained or lost mid-turn. Uses playerData as the trigger
  // so it fires after every amenity placement. Only runs when the mode is on and the
  // reward pool is populated. IMPORTANT: this useEffect lives HERE (not up near the other
  // infra state declarations) because its dependency array evaluates `playerData` at
  // render-time, and `playerData` is declared later in the file (~line 1929). Placing
  // this hook above `playerData`'s declaration causes a TDZ ReferenceError on mount.
  useEffect(() => {
    if (!infraRewardsMode || !infraRewards) return;
    let needRecalc = false;
    ["campsite", "portaloo", "catering", "security"].forEach(amenity => {
      const newLeader = getInfraLeader(amenity, playerData);
      const oldLeader = infraLeaderRef.current[amenity];
      if (newLeader !== oldLeader) {
        infraLeaderRef.current[amenity] = newLeader;
        needRecalc = true;
        const rewardId = infraRewards[amenity];
        const r = INFRA_REWARDS[rewardId];
        if (!r) return;
        if (newLeader != null) {
          const pName = players.find(p => p.id === newLeader)?.festivalName || "?";
          addLog("🏗️ Infra", `${pName} now holds "${r.label}" (Most ${AMENITY_LABELS[amenity]}s)`);
          if (!players.find(p => p.id === newLeader)?.isAI) {
            showFloatingBonus(`🏗️ ${r.label} — you're in the lead!`, "#fb923c");
          }
          // v197.15: symmetric ticket adjustment for the NEW leader gaining a passive
          // ticket reward (camp_1: +1/campsite, cat_2: +2/catering). Log + popup make
          // the reason for the ticket total change visible.
          const newLeaderPd = playerData[newLeader] || {};
          const newAms = newLeaderPd.amenities || {};
          if (rewardId === "camp_1") {
            const delta = (newAms.campsite || 0);
            if (delta > 0) {
              logTicketGain(newLeader, delta, `Gained ${r.label} (+1/campsite × ${delta})`);
              addLog("🏗️ Infra", `${pName}: +${delta} 🎟️ from gaining ${r.label}`);
              if (!players.find(p => p.id === newLeader)?.isAI) showFloatingBonus(`+${delta} 🎟️ from ${r.label}`, "#4ade80");
            }
          } else if (rewardId === "cat_2") {
            const delta = (newAms.catering || 0) * 2;
            if (delta > 0) {
              logTicketGain(newLeader, delta, `Gained ${r.label} (+2/catering × ${(newAms.catering || 0)})`);
              addLog("🏗️ Infra", `${pName}: +${delta} 🎟️ from gaining ${r.label}`);
              if (!players.find(p => p.id === newLeader)?.isAI) showFloatingBonus(`+${delta} 🎟️ from ${r.label}`, "#4ade80");
            }
          }
        }
        if (oldLeader != null) {
          const oldName = players.find(p => p.id === oldLeader)?.festivalName || "?";
          if (newLeader == null) {
            addLog("🏗️ Infra", `${oldName} lost "${r.label}" (Most ${AMENITY_LABELS[amenity]}s) — tied or dropped below 2`);
          } else {
            const newName = players.find(p => p.id === newLeader)?.festivalName || "?";
            addLog("🏗️ Infra", `${oldName} lost "${r.label}" — ${newName} took the lead`);
          }
          // v197.15: symmetric ticket adjustment for the OLD leader losing a passive
          // ticket reward. Show them the loss so the shrinking total isn't a mystery.
          const oldPd = playerData[oldLeader] || {};
          const oldAms = oldPd.amenities || {};
          if (rewardId === "camp_1") {
            const delta = (oldAms.campsite || 0);
            if (delta > 0) {
              logTicketGain(oldLeader, -delta, `Lost ${r.label} (was +1/campsite × ${delta})`);
              addLog("🏗️ Infra", `${oldName}: −${delta} 🎟️ from losing ${r.label}`);
              if (!players.find(p => p.id === oldLeader)?.isAI) showFloatingBonus(`−${delta} 🎟️ from losing ${r.label}`, "#ef4444");
            }
          } else if (rewardId === "cat_2") {
            const delta = (oldAms.catering || 0) * 2;
            if (delta > 0) {
              logTicketGain(oldLeader, -delta, `Lost ${r.label} (was +2/catering × ${(oldAms.catering || 0)})`);
              addLog("🏗️ Infra", `${oldName}: −${delta} 🎟️ from losing ${r.label}`);
              if (!players.find(p => p.id === oldLeader)?.isAI) showFloatingBonus(`−${delta} 🎟️ from losing ${r.label}`, "#ef4444");
            }
          }
        }
      }
    });
    // v197.20: force a ticket recompute for all players when ANY leader changes.
    // camp_1 (+1/campsite) and cat_2 (+2/catering) are applied inside
    // computeTicketsForPlayer via hasInfraReward. When leaders change, the previous
    // recalc used STALE leader info (because the amenity placement's recalc ran BEFORE
    // this useEffect updated infraLeaderRef). Without a follow-up recompute, camp_1 keeps
    // applying to the OLD leader and never applies to the NEW leader — so the visible
    // ticket totals don't reflect the reward change. Deferred to setTimeout(0) so React
    // finishes this render pass first.
    if (needRecalc) {
      setTimeout(() => recalcTickets(), 0);
    }
  }, [playerData, infraRewardsMode, infraRewards]);
  const currentPD = playerData[currentPlayerId] || {};
  const noTurnsLeft = currentPlayerId !== undefined && (turnsLeft[currentPlayerId] || 0) <= 0;

  // ─── Ticket calc ───
  /** Compute effective fame for a player: base fame from artist effects + tickets-derived fame, capped at 5 */
  const calcFame = useCallback((pd) => {
    return Math.min(FAME_MAX, pd.baseFame || 0);
  }, []);

  // Pure function: compute tickets/fame for a single player data object
  // Council fame + ticket rewards are folded in here so they apply continuously while qualifying.
  // yearOverride lets callers force a different year (e.g. at year transition where the closure's
  // `year` still reflects the previous year).
  function computeTicketsForPlayer(pd, yearOverride, pid) {
    if (!pd) return pd;
    // Read year from a ref so callers wrapped in useCallback([]) (which captured an old
    // closure) still get today's year. yearOverride wins if explicitly provided.
    const y = (yearOverride != null) ? yearOverride : (yearRef.current || year || 1);
    const fields = pd.fields || emptyFields();
    const am = sumFields(fields);
    // v197.12: Infrastructure Reward "Big Base" (camp_1) adds +1 to each campsite's value.
    // Applied only when the player has strict lead in campsites AND the drawn reward is camp_1.
    // pid is optional — hypothetical pds passed for previews don't get the bonus. That's fine
    // because previews shouldn't influence what the actual scoreboard shows.
    const campsiteValue = 2 + (pid != null && hasInfraReward(pid, "camp_1") ? 1 : 0);
    let t = (am.campsite || 0) * campsiteValue;
    // v197.12: "Concessions" (cat_2) — each catering van is worth 2 tickets on top of its
    // amenity utility. Additive to whatever base scoring catering has (none currently, so
    // this becomes the full contribution).
    if (pid != null && hasInfraReward(pid, "cat_2")) {
      t += (am.catering || 0) * 2;
    }
    // v126: artists contribute BOTH their base tickets AND their VP to the unified score.
    // Previously these were separate accounting; now both simply count as "tickets sold" from
    // that artist's presence in the lineup. Amenity effects, agent effects, and bonuses still
    // flow through bonusTickets.
    (pd.stageArtists || []).forEach(sa => sa.forEach(a => { t += (a.tickets || 0) + (a.vp || 0); }));
    t += pd.bonusTickets || 0;
    // Council ticket bonuses (year-scaled, applies if field qualifies in current year)
    const councils = pd.councils || [];
    const yIdx = Math.max(0, Math.min(3, y - 1));
    let councilTickets = 0;
    let councilFame = 0;
    for (let i = 0; i < councils.length; i++) {
      const c = councils[i];
      if (!c) continue;
      if (c._claimed) continue; // v163: contract rewards fired once on claim, not yearly
      const qualifies = councilQualifies(c, fields[i], y);
      if (!qualifies) continue;
      if (c.reward?.type === "tickets") councilTickets += c.reward.perYear[yIdx] || 0;
      if (c.reward?.type === "fame") councilFame += c.reward.perYear[yIdx] || 0;
    }
    t += councilTickets;
    let fame = pd.baseFame || 0;
    fame += councilFame;
    fame = Math.min(FAME_MAX, fame);
    return { ...pd, fields, amenities: am, tickets: t, rawTickets: t, fame, councilTicketsThisYear: councilTickets, councilFameThisYear: councilFame };
  }

  // v143: win-condition star computation. Derives per-player star state from `allTickets`
  // (which stores { raw, fame, ... } per pid per year). Updates only when `allTickets`
  // changes — i.e., at year end. Returns:
  //   { emoji, tooltip, color } per pid, or null if no star for that player yet.
  // v153: anti-lead helpers. `getCurrentLeader` returns the pid of the unique player
  // with the most cumulative tickets (summed across years in `allTickets`), or null if
  // there's a tie for first OR nobody has scored yet (year 1). `canClaimForecast` is
  // the gate for the forecast-microtrend perk: on for non-leaders from Year 2 onwards.
  const getCurrentLeader = () => {
    if (!antiLeadMechanicsRef.current) return null;
    if ((yearRef.current || year || 1) < 2) return null;
    const totals = players.map(p => ({
      pid: p.id,
      total: Object.values(allTickets[p.id] || {}).reduce((s, e) => s + (e?.raw || 0), 0),
    }));
    if (totals.every(t => t.total === 0)) return null;
    totals.sort((a, b) => b.total - a.total);
    if (totals.length >= 2 && totals[0].total === totals[1].total) return null; // tie → no leader
    return totals[0].pid;
  };
  const canClaimForecast = (pid) => {
    if (!antiLeadMechanicsRef.current) return false;
    if ((yearRef.current || year || 1) < 2) return false;
    const leader = getCurrentLeader();
    if (leader === null) return true; // no leader = everyone is a non-leader
    return pid !== leader;
  };

  const winStars = useMemo(() => {
    const cond = winCondition;
    if (!cond) return {};
    const result = {};
    if (cond === "consistency") {
      // Per year, whichever player had max tickets that year gets a star for that year.
      // A player accumulates stars across years — hover shows the list of years led.
      const yearsLed = {};
      players.forEach(p => { yearsLed[p.id] = []; });
      for (let y = 1; y <= 4; y++) {
        const yearHas = players.some(p => allTickets[p.id]?.[y]?.raw != null);
        if (!yearHas) continue;
        let maxT = -Infinity;
        players.forEach(p => { const t = allTickets[p.id]?.[y]?.raw ?? -Infinity; if (t > maxT) maxT = t; });
        if (maxT === -Infinity) continue;
        players.forEach(p => { if ((allTickets[p.id]?.[y]?.raw ?? -Infinity) === maxT) yearsLed[p.id].push(y); });
      }
      players.forEach(p => {
        const led = yearsLed[p.id];
        if (led.length === 0) { result[p.id] = null; return; }
        result[p.id] = {
          emoji: "⭐".repeat(Math.min(4, led.length)),
          count: led.length,
          tooltip: `${p.festivalName} had the highest ticket sales in Year${led.length === 1 ? "" : "s"} ${led.join(", ")}`,
          color: "#fbbf24",
        };
      });
    } else if (cond === "following") {
      // Every player gets a place-based medal. Updates on allTickets change (year end).
      // Gold = 1st, Silver = 2nd, Bronze = 3rd. Anyone below third gets no star.
      const totals = players.map(p => ({
        p,
        total: Object.values(allTickets[p.id] || {}).reduce((s, e) => s + (e?.raw || 0), 0)
      }));
      const hasAny = totals.some(t => Object.keys(allTickets[t.p.id] || {}).length > 0);
      if (!hasAny) return {};
      const sorted = [...totals].sort((a, b) => b.total - a.total);
      // Compute placement with ties (same total = same place).
      let lastTotal = null, lastPlace = 0;
      sorted.forEach((row, idx) => {
        const place = row.total === lastTotal ? lastPlace : idx + 1;
        lastTotal = row.total; lastPlace = place;
        const medal = place === 1 ? "🥇" : place === 2 ? "🥈" : place === 3 ? "🥉" : null;
        const color = place === 1 ? "#fbbf24" : place === 2 ? "#94a3b8" : place === 3 ? "#f59e0b" : "#64748b";
        const placeStr = place === 1 ? "1st" : place === 2 ? "2nd" : place === 3 ? "3rd" : `${place}th`;
        result[row.p.id] = medal ? {
          emoji: medal,
          tooltip: `${row.p.festivalName} is in ${placeStr} place with ${row.total.toLocaleString()} ticket sales`,
          color,
        } : {
          emoji: null,
          tooltip: `${row.p.festivalName} is in ${placeStr} place with ${row.total.toLocaleString()} ticket sales`,
          color,
        };
      });
    } else if (cond === "talkOfTheTown") {
      // ONE star, held by the player with the highest single-year ticket count so far.
      // Whoever has that peak gets the star; ties => most recent year among the tied.
      let peak = -Infinity, peakPid = null, peakYear = null;
      players.forEach(p => {
        const yrs = allTickets[p.id] || {};
        for (const [y, entry] of Object.entries(yrs)) {
          const t = entry?.raw ?? -Infinity;
          if (t > peak || (t === peak && parseInt(y) > (peakYear || 0))) {
            peak = t; peakPid = p.id; peakYear = parseInt(y);
          }
        }
      });
      if (peakPid == null || peak === -Infinity) return {};
      const peakPlayer = players.find(p => p.id === peakPid);
      players.forEach(p => {
        result[p.id] = p.id === peakPid ? {
          emoji: "⭐",
          tooltip: `${peakPlayer?.festivalName} is the talk of the town — they've sold ${peak.toLocaleString()} tickets in one year (Year ${peakYear})`,
          color: "#fbbf24",
        } : null;
      });
    }
    return result;
  }, [winCondition, allTickets, players]);

  const StarBadge = ({ pid, size = 12 }) => {
    const s = winStars[pid];
    if (!s || !s.emoji) return null;
    return <span title={s.tooltip} style={{ fontSize: size, marginLeft: 4, cursor: "help", verticalAlign: "middle" }}>{s.emoji}</span>;
  };

  // Recalculate ALL players' tickets using latest state
  const recalcTickets = useCallback(() => {
    setPlayerData(prev => {
      const next = { ...prev };
      // v197.21: same ref pre-sync as recalcAfterUpdate — see comment there. Without it,
      // hasInfraReward inside computeTicketsForPlayer reads stale leader state during the
      // recompute pass.
      playerDataRef.current = next;
      for (const pid of Object.keys(next)) {
        next[pid] = computeTicketsForPlayer(next[pid], undefined, pid);
      }
      return next;
    });
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // v135: Alt-Objectives helpers
  // ═══════════════════════════════════════════════════════════════
  // Check whether a given objective is currently satisfied for a player. Threads the
  // per-year event counters + cross-player data into the objective's `check` fn.
  const checkAltObjective = (obj, pid) => {
    if (!obj || pid == null) return false;
    try {
      const pd = playerDataRef.current?.[pid] || playerData[pid] || {};
      return !!obj.check(pd, { yearEvents, allPlayerData: playerDataRef.current || playerData, currentPid: pid });
    } catch (err) {
      console.error("Objective check error", obj.id, err);
      return false;
    }
  };

  // Draw N unique objective IDs from a deck, filtered by source and excluding IDs a player
  // has already been dealt (either live or completed). Returns { drawn, deckAfter }.
  const drawFromObjectiveDeck = (deck, count, source, pid) => {
    const active = (activeObjectives[pid] || []).map(o => o.id);
    const done = (completedObjectives[pid] || []).map(o => o.id);
    const excluded = new Set([...active, ...done]);
    const eligible = deck.filter(id => {
      const obj = getAltObjective(id);
      return obj && obj.source === source && !excluded.has(id);
    });
    if (eligible.length === 0) return { drawn: [], deckAfter: deck };
    // Shuffle to randomize which duplicate is grabbed when there are multiple copies of the same id.
    const shuffled = shuffle(eligible);
    const drawn = shuffled.slice(0, Math.min(count, shuffled.length));
    // Remove exactly one instance of each drawn ID from the deck (starter/failure have 2 copies).
    const deckAfter = [...deck];
    drawn.forEach(id => {
      const idx = deckAfter.indexOf(id);
      if (idx >= 0) deckAfter.splice(idx, 1);
    });
    return { drawn, deckAfter };
  };

  // Queue an objective picker for a player. If nothing is showing, opens immediately.
  // Otherwise appends to the queue for that player. Auto-picks for AI.
  const offerObjectivePicker = (pid, source, kind, deckRef = null) => {
    const currentDeck = deckRef !== null ? deckRef : altObjectiveDeck;
    const { drawn, deckAfter } = drawFromObjectiveDeck(currentDeck, 2, source, pid);
    if (deckRef === null) setAltObjectiveDeck(deckAfter);
    if (drawn.length === 0) return { deck: deckAfter, awarded: null };
    const player = players.find(p => p.id === pid);
    // AI: auto-pick immediately (prefer starter for simplicity, no strategic tuning yet).
    if (player?.isAI) {
      const chosen = drawn[0];
      // Put unpicked copy back so other players can draw it. AI keeps chosen.
      if (drawn.length > 1) deckAfter.push(drawn[1]);
      if (deckRef === null) setAltObjectiveDeck(deckAfter);
      grantObjective(pid, chosen, kind);
      return { deck: deckAfter, awarded: chosen };
    }
    // Human: enqueue picker
    const entry = { pid, kind, source, options: drawn };
    setPendingObjectivePickerQueue(prev => [...prev, entry]);
    return { deck: deckAfter, awarded: null };
  };

  const grantObjective = (pid, objId, kind) => {
    const y = yearRef.current || year || 1;
    setActiveObjectives(prev => ({
      ...prev,
      [pid]: [...(prev[pid] || []), { id: objId, source: getAltObjective(objId)?.source, addedYear: y, kind }]
    }));
    // If this is the year's normal objective, track it for failure evaluation.
    if (kind === "normal") {
      setYearObjectiveAssignments(prev => ({
        ...prev,
        [y]: { ...(prev[y] || {}), [pid]: objId }
      }));
    }
    const player = players.find(p => p.id === pid);
    const obj = getAltObjective(objId);
    addLog("🎯 Objective", `${player?.festivalName || "?"}: assigned "${obj?.name}" — ${obj?.req}`);
  };

  // Player picks one of the two offered objectives; the unpicked one goes back in the deck.
  const chooseAltObjective = (objId) => {
    if (!pendingObjectivePicker) return;
    const { pid, kind, options } = pendingObjectivePicker;
    const other = options.find(o => o !== objId);
    if (other) setAltObjectiveDeck(prev => [...prev, other]);
    grantObjective(pid, objId, kind);
    setPendingObjectivePicker(null);
  };

  // Called at end of every year — evaluates each player's live objectives, opens stages
  // for newly-achieved ones (or awards +10 tickets if capped at 3), and offers failure
  // objectives for anyone whose CURRENT YEAR's assigned normal objective wasn't completed.
  const evaluateAltObjectivesYearEnd = () => {
    if (!altObjectivesModeRef.current) return;
    const y = yearRef.current || year || 1;
    // Is a new-year deal even applicable? The last year of the game (year 4 by default)
    // doesn't need a new objective — the game's about to end.
    const nextYearNeedsDeal = y < (totalYearsRef.current || 4);
    let deckWorking = altObjectiveDeck;
    players.forEach(p => {
      const pid = p.id;
      const live = activeObjectives[pid] || [];
      const done = new Set((completedObjectives[pid] || []).map(o => o.id));
      const newlyCompleted = [];
      live.forEach(entry => {
        if (done.has(entry.id)) return;
        const obj = getAltObjective(entry.id);
        if (!obj) return;
        if (checkAltObjective(obj, pid)) newlyCompleted.push(entry);
      });
      // Award: each newly-completed objective opens a stage (up to 3), else +10 tickets.
      newlyCompleted.forEach(entry => {
        const obj = getAltObjective(entry.id);
        const pd = playerDataRef.current?.[pid] || playerData[pid] || {};
        const stageCount = (pd.stages || []).length;
        if (stageCount < 3) {
          // v143: opening a stage grants +1 fame at the start of the next year — this
          // fires here (during year-end evaluation, right before the new year's pre-round)
          // to match the "beginning of your next year" spec. Also gate on the same toggles
          // the pre-round opening path uses, so a game that turns off stage-fame bonuses
          // universally still respects that intent.
          // v147: use the fun STAGE_NAMES pool instead of generic "Stage N" labels, matching
          // setup and pre-round stage-opening paths.
          const grantOpeningFame = stageOpenFameBonusRef.current && !stagesProvideNoFameRef.current;
          const usedNames = pd.stageNames || [];
          const availNames = STAGE_NAMES.filter(n => !usedNames.includes(n));
          const sName = availNames[Math.floor(Math.random() * availNames.length)] || `Stage ${stageCount + 1}`;
          setPlayerData(prev => {
            const cur = prev[pid] || {};
            return {
              ...prev,
              [pid]: {
                ...cur,
                stages: [...(cur.stages || []), { fameRequired: 0 }],
                stageArtists: [...(cur.stageArtists || []), []],
                stageNames: [...(cur.stageNames || []), sName],
                stageColors: [...(cur.stageColors || []), STAGE_COLORS[stageCount % STAGE_COLORS.length]],
                baseFame: grantOpeningFame ? Math.min(FAME_MAX, (cur.baseFame || 0) + 1) : (cur.baseFame || 0),
              }
            };
          });
          if (grantOpeningFame) logFameGain(pid, 1, `Opened new stage via "${obj.name}"`);
          addLog("🎯 Objective", `${p.festivalName} completed "${obj.name}" → opened "${sName}"${grantOpeningFame ? " (+1 🔥 Fame for next year)" : ""}!`);
        } else {
          // v165: dormant ticket source removed. Legacy alt-objective +10 tickets
          // when 3 stages already open — the alt-objective system is retired.
          addLog("🎯 Objective", `${p.festivalName} completed "${obj.name}" (legacy — no reward)`);
        }
        // Failure objectives additionally draw 3 artists from the deck.
        if (obj.source === "failure") {
          const drawn = drawFromDeck(3);
          if (drawn.length > 0) {
            setPlayerData(prev => ({ ...prev, [pid]: { ...prev[pid], hand: [...(prev[pid].hand || []), ...drawn] } }));
            addLog("🎯 Objective", `${p.festivalName} +${drawn.length} artists from failure-objective bonus`);
          }
        }
      });
      // Mark completed + remove from active.
      if (newlyCompleted.length > 0) {
        setCompletedObjectives(prev => ({
          ...prev,
          [pid]: [...(prev[pid] || []), ...newlyCompleted.map(e => ({ id: e.id, achievedYear: y }))]
        }));
        setActiveObjectives(prev => ({
          ...prev,
          [pid]: (prev[pid] || []).filter(e => !newlyCompleted.some(nc => nc.id === e.id))
        }));
      }
      // v142: Rule per user's clarification — the deal is based on whether the player
      // completed AT LEAST ONE objective this year, not on whether the specific year's
      // normal was completed. So a player who completes a rolled-over starter (but not
      // this year's assigned normal) still gets a progression objective, and a player
      // who completes nothing gets a failure objective.
      if (nextYearNeedsDeal) {
        const anyCompleted = newlyCompleted.length > 0;
        const source = anyCompleted ? "progression" : "failure";
        const result = offerObjectivePicker(pid, source, "normal", deckWorking);
        deckWorking = result.deck;
      }
    });
    setAltObjectiveDeck(deckWorking);
    // Reset per-year event counters for the new year.
    setYearEvents({});
  };

  // Also evaluate mid-year (after each meaningful action) — so achievements register the
  // moment they happen, not at year-end. Prevents "I completed it in Turn 2 but no reward".
  // Called from action-completion sites (bookArtistToStage, contest resolutions, etc.).
  const checkMidYearAchievements = (pid) => {
    if (!altObjectivesModeRef.current || pid == null) return;
    const live = activeObjectives[pid] || [];
    const done = new Set((completedObjectives[pid] || []).map(o => o.id));
    const nowComplete = live.filter(entry => !done.has(entry.id) && checkAltObjective(getAltObjective(entry.id), pid));
    if (nowComplete.length === 0) return;
    // Log the flash-completions but defer the reward payout to year end (opens stage cleanly
    // during the pre-round, avoiding mid-turn stage additions that would confuse UI state).
    nowComplete.forEach(entry => {
      const obj = getAltObjective(entry.id);
      if (!obj) return;
      // Mid-year satisfaction — the flash celebrates progress but the final award happens
      // at year-end evaluation (state-based objectives like Punching can still un-satisfy).
      addLog("🎯 Objective", `${players.find(p => p.id === pid)?.festivalName}: "${obj.name}" currently satisfied — final check at year end`);
      showFloatingBonus(`🎯 ${obj.name} ✓`, "#4ade80");
    });
  };


  // Helper: update player data AND recalculate tickets in one atomic setPlayerData call
  const recalcAfterUpdate = useCallback((pid, updater) => {
    setPlayerData(prev => {
      const next = { ...prev };
      next[pid] = updater(next[pid]);
      // v197.21: sync playerDataRef BEFORE recomputing tickets. computeTicketsForPlayer
      // calls hasInfraReward → getInfraLeader, which reads playerDataRef.current for
      // leader detection. Without this pre-sync the ref still shows the pre-update state
      // (React's ref-sync useEffect hasn't run yet — it fires after commit, but we're
      // still inside the functional updater). Symptom: after placing a 2nd/3rd campsite
      // that made you the strict leader, camp_1 (+1/campsite) failed to include the
      // bonus in the same recalc pass — the ticket total didn't reflect Big Base until
      // the NEXT unrelated recalc. This mutation is safe because we're rewriting the
      // ref to the same value the useEffect would sync to anyway; we're just doing it
      // one microtask earlier so the reward check inside the loop sees fresh amenities.
      playerDataRef.current = next;
      // v197.14: pass pid to computeTicketsForPlayer so camp_1/cat_2 infrastructure rewards
      // are applied to each player's own ticket calc (their strict lead unlocks the bonus).
      for (const p of Object.keys(next)) {
        next[p] = computeTicketsForPlayer(next[p], undefined, p);
      }
      return next;
    });
  }, []);

  // ─── Deck management ───
  /** Get names of all artists currently in use (on stages, in hands, in pool) */
  /** Check if placing security triggers Kendrick-style VP bonus */
  // ═══════════════════════════════════════════════════════════
  // AGENT SYSTEM
  // ═══════════════════════════════════════════════════════════
  // v131: under tempt mode this becomes "can the player tempt another artist?" — available if
  // they have at least 1 Fame AND fewer than 2 pending tempts. Any pool artist may be tempted
  // regardless of the player's current fame vs. artist.fame — the fame cost only gates PLAYING
  // the artist on the next turn (unplayable tempts land in hand instead).
  const hasAgent = (pid) => {
    if (temptModeRef.current) {
      const pd = playerData[pid] || {};
      const tempts = (temptPlacements[pid] || []);
      // v196: tempt cost raised to 2 Fame (was 1). Uncontested still refunds +2 Fame (net 0),
      // contested still refunds 1 Fame (net -1). Discourages reflexive tempting every turn.
      return (pd.fame || 0) >= 2 && tempts.length < 2;
    }
    return !agentPlacements[pid] && !agentExhausted[pid];
  };
  const getAgentPlacement = (pid) => agentPlacements[pid] || null;

  // Total agent actions a player has remaining this year (or this turn, under tempt).
  // v131: under tempt, returns how many MORE tempts the player can do this turn — bounded by
  // both the 2-per-turn cap and their current fame. Displayed in stat rows as the "🕵️ N" counter.
  const getAgentActionsLeft = (pid) => {
    if (temptModeRef.current) {
      const pd = playerData[pid] || {};
      const tempts = (temptPlacements[pid] || []);
      // v188: tempt cap reduced from 2/turn to 1/turn.
      // v196: tempt cost raised to 2 Fame (was 1). Uncontested still refunds +2 Fame
      // (net 0), contested refunds 1 Fame (net -1). Discourages reflexive tempting.
      return (pd.fame || 0) >= 2 ? Math.max(0, 1 - tempts.length) : 0;
    }
    const pd = playerData[pid] || {};
    const y = year || 1;
    const yIdx = Math.max(0, Math.min(3, y - 1));
    let totalBonusCharges = 0;
    (pd.councils || []).forEach((c, i) => {
      if (c?.reward?.type === "agents" && councilQualifies(c, (pd.fields || [])[i], y)) {
        totalBonusCharges += c.reward.perYear?.[yIdx] || 0;
      }
    });
    const totalCharges = 1 + totalBonusCharges;
    const used = (agentBonusUsesUsed[pid] || 0) + (agentExhausted[pid] ? 1 : 0);
    return Math.max(0, totalCharges - used);
  };
  
  // Place agent on pool artist — start 2-step booking claim.
  // v130/v131: under tempt mode, deducts Fame and appends to temptPlacements[pid] (up to 2).
  // v196: tempt cost raised to 2 Fame (was 1). Uncontested tempts still refund +2 Fame
  // (net 0 after cost). Contested tempts still refund 1 Fame (net -1). This nerf targets
  // the "9 artists by mid-year-3" pattern where uncontested tempts were net-positive Fame.
  // A player may tempt ANY pool artist regardless of the artist's fame cost. The gate is at
  // resolution time: on the tempting player's next turn, artists they can play go to a stage;
  // artists they can't (fame or amenities short) go to their hand.
  const placeAgentOnArtist = (pid, poolIdx) => {
    const artist = artistPool[poolIdx];
    if (!artist) return false;
    if (temptModeRef.current) {
      const pd = playerData[pid] || {};
      const tempts = (temptPlacements[pid] || []);
      if ((pd.fame || 0) < 2) {
        addLog(players.find(p => p.id === pid)?.festivalName || "?", `Not enough Fame to tempt ${artist.name} (needs 2 🔥)`);
        return false;
      }
      if (tempts.length >= 2) {
        addLog(players.find(p => p.id === pid)?.festivalName || "?", `Already tempting 2 artists this turn`);
        return false;
      }
      // v196: Deduct 2 Fame (was 1) from baseFame.
      setPlayerData(p => ({ ...p, [pid]: { ...p[pid], baseFame: Math.max(0, (p[pid].baseFame || 0) - 2) } }));
      logFameLoss(pid, 2, `Tempting ${artist.name}`);
      // v154: Counter Culture identity refunds 1 Fame when tempting a Fame ≤ 3 artist.
      applyIdentityOnTempt(pid, artist);
      setTemptPlacements(prev => ({ ...prev, [pid]: [...(prev[pid] || []), { type: "pool", poolIdx, artistName: artist.name, placedTurn: turnNumber }] }));
      setTimeout(() => recalcTickets(), 30);
      const pName = players.find(p => p.id === pid)?.festivalName || "?";
      addLog("💫 Tempt", `${pName} spent 2 🔥 Fame to tempt ${artist.name} (${tempts.length + 1}/2 this turn)`);
      showFloatingBonus(`💫 Tempting ${artist.name}`, "#fbbf24");
      setLastActionFor(pid, `is tempting ${artist.name}`);
      bumpYearlyStat(pid, "temptsPlaced");
      return true;
    }
    setAgentPlacements(prev => ({ ...prev, [pid]: { type: "pool", poolIdx, artistName: artist.name, placedTurn: turnNumber } }));
    const pName = players.find(p => p.id === pid)?.festivalName || "?";
    addLog("🕵️ Agent", `${pName} deployed agent to claim ${artist.name}`);
    return true;
  };

  // v131: undo the most recent tempt for a player — refund 1 Fame, pop the last placement.
  // Callable before the player ends their turn. Safe to no-op if there's nothing to undo.
  const undoLastTempt = (pid) => {
    if (!temptModeRef.current) return false;
    const tempts = (temptPlacements[pid] || []);
    if (tempts.length === 0) return false;
    const removed = tempts[tempts.length - 1];
    setTemptPlacements(prev => ({ ...prev, [pid]: (prev[pid] || []).slice(0, -1) }));
    // No logFameGain here — undoing is a refund, not a celebration.
    // v196: refund 2 Fame (matches new tempt cost of 2).
    setPlayerData(p => ({ ...p, [pid]: { ...p[pid], baseFame: Math.min(FAME_MAX, (p[pid].baseFame || 0) + 2) } }));
    const pName = players.find(p => p.id === pid)?.festivalName || "?";
    addLog("💫 Tempt", `${pName} withdrew their tempt of ${removed.artistName} — 2 🔥 Fame refunded`);
    showFloatingBonus(`↩️ ${removed.artistName} withdrawn`, "#94a3b8");
    setTimeout(() => recalcTickets(), 30);
    return true;
  };

  // v131: after a tempt placement resolves (via pending-artist modal or contest), check
  // whether the current player still has another pending tempt to resolve. If so, kick off
  // the same resolution flow (contest UI or pending-artist modal). Called from every code
  // path that finalizes one tempt.
  const checkNextTempt = (pid) => {
    if (!temptModeRef.current) return;
    // Small delay so upstream state (temptPlacements pop, playerData updates) settles first.
    // v139: read from refs, not closure — closure captures at scheduling time and misses
    // the pop that just fired, causing the same artist to re-open the modal.
    setTimeout(() => {
      const remaining = (temptPlacementsRef.current[pid] || []);
      if (remaining.length === 0) return;
      const resolution = resolvePoolAgents(pid);
      if (!resolution) return;
      if (resolution.type === "uncontested") {
        // v179: winner gets +2 Fame for uncontested tempt (net +1 after -1 tempt cost).
        // Fires here (at resolution) so it applies regardless of what the winner does
        // next (book directly, book via modal, send to hand).
        grantUncontestedTemptBonus(resolution.pid);
        // v150: AI tempts must NOT open the pendingAgentArtist modal — otherwise the
        // modal renders during the AI's turn and the human user ends up picking a stage
        // for the AI (with no amenity check per-stage, which is how Kendrick landed on
        // a barebones field). Auto-book for AI, following the same rules as bookArtistToStage
        // + per-stage amenity/genre-match validation.
        const winner = players.find(p => p.id === resolution.pid);
        const winPd = playerDataRef.current?.[resolution.pid] || playerData[resolution.pid] || {};
        const artist = resolution.artist;
        if (winner?.isAI) {
          // v196.1 bugfix: this AI branch was using canBookArtistOnStage/canBookHeadlinerViaGenre
          // (the LOOSE rule that permits headliner placement when existing artists share ≥1
          // genre with the incoming). That let AI tempts land on stages where an existing
          // artist had genres NOT covered by the incoming — violating v194's strict subset
          // rule. Fixed by matching the AI turn-start path (line ~6662) which correctly uses
          // canTemptDirectToStage. Tempts that fail the strict rule now go to hand for AI too.
          const stages = (winPd.stageArtists || []).map((sa, i) => ({ i, len: sa.length }));
          const bookable = stages.filter(({ i }) => canTemptDirectToStage(artist, winPd, i)).map(x => x.i);
          // v197.1: shared helper so both branches (stage-book AND send-to-hand) update the
          // temptPlacementsRef SYNCHRONOUSLY alongside setTemptPlacements. Previous bug:
          // setTemptPlacements is async → temptPlacementsRef didn't update until useEffect
          // commit → the recursive checkNextTempt(120ms) below saw the same tempt still
          // present in the ref and re-fired the same resolution → infinite loop, artist
          // added to hand thousands of times before the ref finally sync'd.
          const popTemptRef = () => {
            setTemptPlacements(prev => ({ ...prev, [resolution.pid]: (prev[resolution.pid] || []).filter(p => !(p.type === "pool" && p.artistName === artist.name)) }));
            // Synchronously mirror the removal into the ref so checkNextTempt sees fresh state.
            const cur = temptPlacementsRef.current || {};
            temptPlacementsRef.current = { ...cur, [resolution.pid]: (cur[resolution.pid] || []).filter(p => !(p.type === "pool" && p.artistName === artist.name)) };
          };
          if (bookable.length > 0) {
            const genreStage = bookable.find(si => canBookHeadlinerViaGenre(artist, winPd, si));
            const chosen = genreStage != null ? genreStage : bookable[0];
            const viaGenre = genreStage != null && !canAffordArtist(artist, winPd);
            bookArtistToStage(artist, chosen, resolution.pid, true, viaGenre);
            popTemptRef();
            const newPool = [...(artistPool || [])]; const idx = newPool.findIndex(a => a.name === artist.name);
            if (idx >= 0) { newPool.splice(idx, 1); setArtistPool(newPool); }
            addLog("💫 Tempt", `${winner.festivalName} booked ${artist.name} (uncontested)`);
          } else {
            // No playable stage — send to hand.
            // v177: no longer marks with _tempted. TEMPT effects fire only on direct
            // pool→stage placements. If the artist lands in hand, the TEMPT trigger
            // is lost forever.
            setPlayerData(prev => ({ ...prev, [resolution.pid]: { ...prev[resolution.pid], hand: [...(prev[resolution.pid]?.hand || []), artist] } }));
            const newPool = [...(artistPool || [])]; const idx = newPool.findIndex(a => a.name === artist.name);
            if (idx >= 0) { newPool.splice(idx, 1); setArtistPool(newPool); }
            popTemptRef();
            addLog("💫 Tempt", `${winner.festivalName} sent ${artist.name} to hand (no genre-match stage)`);
          }
          // Continue chain in case AI has more tempts to resolve
          checkNextTempt(resolution.pid);
          return;
        }
        setPendingAgentArtist({ pid: resolution.pid, artist });
      } else if (resolution.type === "contested") {
        const contest = resolveAgentContestRoll(resolution.contestants, resolution.artist, resolution.poolIdx);
        const humanInvolved = contest.contestantData.some(c => !players.find(p => p.id === c.pid)?.isAI);
        setAgentContest({ ...contest, isAuto: !humanInvolved });
      }
    }, 120);
  };

  // ─── Microtrend bags (v189: split into amenity + genre) ───
  // Two separate shuffled bags so amenity-microtrends and genre-microtrends can be
  // drawn independently. The amenity bag holds all 4 amenity types; the genre bag
  // holds all 6 genres. Each bag guarantees no repeats within a cycle.
  const buildAmenityBag = () => shuffle(["campsite", "security", "catering", "portaloo"].map(a => ({ kind: "amenity", amenity: a })));
  const buildGenreBag = () => shuffle(ALL_GENRES.map(g => ({ kind: "genre", genre: g })));
  // Legacy: buildMicrotrendBag returns the union — kept for any code that references it.
  const buildMicrotrendBag = () => {
    const all = [
      ...ALL_GENRES.map(g => ({ kind: "genre", genre: g })),
      ...["campsite", "security", "catering", "portaloo"].map(a => ({ kind: "amenity", amenity: a })),
    ];
    return shuffle(all);
  };
  // Returns true if two trend entries refer to the same genre/amenity.
  const trendsMatch = (a, b) => {
    if (!a || !b) return false;
    if (a.kind !== b.kind) return false;
    if (a.kind === "genre") return a.genre === b.genre;
    return a.amenity === b.amenity;
  };
  // v189: separate pop functions per bag so genre and amenity trends refill independently.
  const amenityBagRef = useRef([]);
  const genreBagRef = useRef([]);
  const popAmenityFromBag = (avoidEntry) => {
    if (amenityBagRef.current.length === 0) {
      amenityBagRef.current = buildAmenityBag();
      if (avoidEntry && amenityBagRef.current.length >= 2 && trendsMatch(amenityBagRef.current[0], avoidEntry)) {
        const bag = [...amenityBagRef.current];
        [bag[0], bag[1]] = [bag[1], bag[0]];
        amenityBagRef.current = bag;
      }
    }
    const top = amenityBagRef.current[0];
    amenityBagRef.current = amenityBagRef.current.slice(1);
    return { ...top, claimedBy: null };
  };
  const popGenreFromBag = (avoidEntry) => {
    if (genreBagRef.current.length === 0) {
      genreBagRef.current = buildGenreBag();
      if (avoidEntry && genreBagRef.current.length >= 2 && trendsMatch(genreBagRef.current[0], avoidEntry)) {
        const bag = [...genreBagRef.current];
        [bag[0], bag[1]] = [bag[1], bag[0]];
        genreBagRef.current = bag;
      }
    }
    const top = genreBagRef.current[0];
    genreBagRef.current = genreBagRef.current.slice(1);
    return { ...top, claimedBy: null };
  };
  // Legacy popMicrotrendFromBag — kept in case any code path still calls it.
  // Uses the right sub-bag based on avoidEntry's kind if provided.
  const popMicrotrendFromBag = (avoidEntry) => {
    if (avoidEntry?.kind === "amenity") return popAmenityFromBag(avoidEntry);
    if (avoidEntry?.kind === "genre") return popGenreFromBag(avoidEntry);
    // No hint — flip a coin
    return Math.random() < 0.5 ? popAmenityFromBag() : popGenreFromBag();
  };

  // Place agent on the active microtrend — immediate resolution. Grants the placer
  // +1 Fame and +1 VP, marks the microtrend claimed (so the end-of-turn replacement
  // logic will promote the forecast in its place), increments the microtrend count
  // for end-of-game scoring, and exhausts the agent immediately. No "next turn"
  // resolution — the whole effect happens at placement time. Solves the year-1
  // stuck-at-zero-fame problem when no one can organically match the active trend.
  const placeAgentOnMicrotrend = (pid) => {
    if (!agentMicrotrendClaimRef.current) return false;
    if (temptModeRef.current) return false; // v130: microtrends only claimable via booking/amenity under tempt mode
    const active = microtrends.find(mt => mt.claimedBy === null);
    if (!active) return false; // nothing claimable
    const pName = players.find(p => p.id === pid)?.festivalName || "?";
    const trendLabel = active.kind === "amenity" ? AMENITY_LABELS[active.amenity] : active.genre;
    // Mark microtrend claimed; end-of-turn replacement will swap in the forecast.
    setMicrotrends(prev => prev.map(mt => mt === active ? { ...mt, claimedBy: pid } : mt));
    // v165: microtrend claims no longer grant tickets — fame-only. This applies to
    // all three claim paths (agent, active-play, forecast-play, amenity-place).
    logFameGain(pid, 1, "Matching a Microtrend");
    setPlayerData(p => ({ ...p, [pid]: {
      ...p[pid],
      baseFame: Math.min(FAME_MAX, (p[pid].baseFame || 0) + 1),
      microtrendsCompletedCount: (p[pid].microtrendsCompletedCount || 0) + 1,
    } }));
    addLog("🕵️ Agent", `${pName} placed agent on "${trendLabel}" microtrend → +1 🔥 Fame!`);
    showFloatingBonus(`🎵 ${trendLabel} (Agent)!`, active.kind === "amenity" ? "#fbbf24" : (GENRE_COLORS[active.genre] || "#fbbf24"));
    // Agent done — exhausts via the standard pipeline (which also handles agentFame council bonus).
    setAgentPlacements(prev => ({ ...prev, [pid]: { type: "microtrend", placedTurn: turnNumber } }));
    exhaustAgent(pid);
    setTimeout(() => recalcTickets(), 50);
    // Council bonus: artistOnMicrotrend fires on agent-claim too, since it's still a
    // microtrend completion. Slight delay to let the agent exhaust pipeline settle first.
    setTimeout(() => triggerArtistOnMicrotrendBonus(pid), 80);
    return true;
  };
  
  // Return agent to player (failed/cancelled — available to redeploy this year)
  const returnAgent = (pid) => {
    setAgentPlacements(prev => { const n = { ...prev }; delete n[pid]; return n; });
  };
  
  // Exhaust agent after successful use. Two new council rewards interact here:
  //   - "agentFame": each qualifying council grants +1 Fame when this agent succeeds
  //   - "agents":    each qualifying council grants perYear[yIdx] additional uses before exhaustion
  const exhaustAgent = (pid) => {
    // v130: under tempt mode there's no "agent" to exhaust and no agent-related council
    // bonuses (agentFame, agents bonus charges). Just clear the placement slot so the
    // player can tempt again next turn.
    if (temptModeRef.current) {
      setAgentPlacements(prev => { const n = { ...prev }; delete n[pid]; return n; });
      return;
    }
    const pd = playerDataRef.current?.[pid] || playerData[pid];
    const pName = players.find(p => p.id === pid)?.festivalName || "?";
    const y = yearRef.current || year || 1;
    const yIdx = Math.max(0, Math.min(3, y - 1));

    // (1) agentFame councils: +1 Fame per qualifying council
    let agentFameGain = 0;
    (pd?.councils || []).forEach((c, i) => {
      if (c?.reward?.type === "agentFame" && councilQualifies(c, (pd.fields || [])[i], y)) {
        agentFameGain += 1;
      }
    });
    if (agentFameGain > 0) {
      logFameGain(pid, agentFameGain, `Agent effect: ${artist.name}`);
      setPlayerData(p => ({ ...p, [pid]: { ...p[pid], baseFame: Math.min(FAME_MAX, (p[pid].baseFame || 0) + agentFameGain) } }));
      addLog("🕵️ Agent", `${pName}: +${agentFameGain} 🔥 Fame from successful agent action (Council reward)`);
      showFloatingBonus(`+${agentFameGain} 🔥 Fame!`, "#fbbf24");
      setTimeout(() => recalcTickets(), 50);
    }

    // (2) agents councils: bonus charges allow re-deployment without exhausting
    let totalBonusCharges = 0;
    (pd?.councils || []).forEach((c, i) => {
      if (c?.reward?.type === "agents" && councilQualifies(c, (pd.fields || [])[i], y)) {
        totalBonusCharges += c.reward.perYear?.[yIdx] || 0;
      }
    });
    const usedSoFar = agentBonusUsesUsed[pid] || 0;
    if (usedSoFar < totalBonusCharges) {
      // Use a bonus charge — agent is freed back to the player instead of being exhausted.
      // Wording in player-facing strings: "ready to redeploy" not "returns", since "returns"
      // is ambiguous (could read as "returns home, done for the year").
      setAgentBonusUsesUsed(prev => ({ ...prev, [pid]: usedSoFar + 1 }));
      setAgentPlacements(prev => { const n = { ...prev }; delete n[pid]; return n; });
      addLog("🕵️ Agent", `${pName}: agent is back, ready to redeploy this year (Council bonus charge ${usedSoFar + 1}/${totalBonusCharges})`);
      showFloatingBonus("🕵️ Agent ready again!", "#86efac");
      return;
    }

    // Standard exhaustion
    setAgentPlacements(prev => { const n = { ...prev }; delete n[pid]; return n; });
    setAgentExhausted(prev => ({ ...prev, [pid]: true }));
    addLog("🕵️ Agent", `${pName}'s agent exhausted until next year`);
  };
  
  // Track turn number for agent ordering
  const [turnNumber, setTurnNumber] = useState(0);
  
  // v131: under tempt mode reads across all players' temptPlacements arrays; under standard
  // mode reads agentPlacements. Returns [{ pid, placement }] for anyone with a placement on
  // the named artist. Used for pool-card badges and dupe/contest checks.
  const getPlacementsOnArtist = (artistName) => {
    if (temptModeRef.current) {
      const result = [];
      Object.entries(temptPlacements).forEach(([pid, list]) => {
        (list || []).forEach(p => {
          if (p.type === "pool" && p.artistName === artistName) {
            result.push({ pid: parseInt(pid), placement: p });
          }
        });
      });
      return result;
    }
    return Object.entries(agentPlacements)
      .filter(([_, p]) => p && p.type === "pool" && p.artistName === artistName)
      .map(([pid, p]) => ({ pid: parseInt(pid), placement: p }));
  };

  // Resolve pool artist agents at start of a player's turn.
  // v131: under tempt mode, players may have 0-2 pending placements. We resolve one at a
  // time (the first in the array). Once handled, the caller re-invokes this to pick up any
  // remaining placement. Each placement is independently checked for contests.
  const resolvePoolAgents = (pid) => {
    if (temptModeRef.current) {
      // v139: read via ref, not closure — checkNextTempt reaches here via a setTimeout
      // that snapshotted state at scheduling time. Reading from closure would see the
      // just-resolved tempt as still live and re-open the modal for the same artist.
      const currentTempts = temptPlacementsRef.current;
      const currentPool = artistPoolRef.current;
      const tempts = (currentTempts[pid] || []);
      if (tempts.length === 0) return null;
      const placement = tempts[0]; // Resolve the earliest tempt first.
      // Find the artist in the pool by name (index may have shifted)
      const poolIdx = currentPool.findIndex(a => a.name === placement.artistName);
      if (poolIdx < 0) {
        // Artist no longer in pool — refund the full tempt cost (v196: 2 Fame) and drop.
        setTemptPlacements(prev => ({ ...prev, [pid]: (prev[pid] || []).slice(1) }));
        // No logFameGain — refunds shouldn't feel like celebrations.
        setPlayerData(p => ({ ...p, [pid]: { ...p[pid], baseFame: Math.min(FAME_MAX, (p[pid].baseFame || 0) + 2) } }));
        addLog("💫 Tempt", `${placement.artistName} no longer available — 2 🔥 Fame refunded`);
        return null;
      }
      const artist = currentPool[poolIdx];
      // Contestants = every player who has a tempt on the same artist.
      const contestants = [];
      Object.entries(currentTempts).forEach(([oPid, list]) => {
        (list || []).forEach(p => {
          if (p.type === "pool" && p.artistName === placement.artistName) {
            contestants.push({ pid: parseInt(oPid), placedTurn: p.placedTurn });
          }
        });
      });
      if (contestants.length === 1) return { type: "uncontested", artist, poolIdx, pid };
      return { type: "contested", artist, poolIdx, contestants };
    }

    const placement = agentPlacements[pid];
    if (!placement || placement.type !== "pool") return null;
    
    // Find the artist in the pool by name (index may have shifted)
    const poolIdx = artistPool.findIndex(a => a.name === placement.artistName);
    if (poolIdx < 0) {
      // Artist no longer in pool — agent comes back unused. Available to redeploy this year.
      returnAgent(pid);
      addLog("🕵️ Agent", `Artist ${placement.artistName} no longer available — agent is back, ready to redeploy this year`);
      return null;
    }
    
    const artist = artistPool[poolIdx];
    
    // Check if other agents are also on this artist
    const contestants = Object.entries(agentPlacements)
      .filter(([oPid, p]) => p && p.type === "pool" && p.artistName === placement.artistName)
      .map(([oPid, p]) => ({ pid: parseInt(oPid), placedTurn: p.placedTurn }));
    
    if (contestants.length === 1) {
      // Uncontested — player books the artist directly
      return { type: "uncontested", artist, poolIdx, pid };
    } else {
      // Contested — need dice roll
      return { type: "contested", artist, poolIdx, contestants };
    }
  };

  // Resolve an agent contest with the rule:
  //   1. Roll one die from the standard 6-face DICE_OPTIONS pool (same as the game dice).
  //   2. Compare each contestant's value on that face:
  //      - pure amenity face (campsite/portaloo/security/catering) → that amenity's count
  //      - fame face → the player's current Fame
  //      - stage face → the player's number of open stages (novel — rewards festival scale)
  //   3. Highest value wins.
  //   4. Tiebreaker 1: most tickets this year
  //   5. Tiebreaker 2: agent placed first (lowest placedTurn)
  const getContestValue = (pd, face) => {
    const am = pd?.amenities || {};
    switch (face) {
      case "campsite": return am.campsite || 0;
      case "portaloo": return am.portaloo || 0;
      case "security": return am.security || 0;
      case "catering": return am.catering || 0;
      case "fame": return pd?.fame || 0;
      case "stage": return (pd?.stages || []).length;
      default: return 0;
    }
  };
  const getContestFaceLabel = (face) => {
    switch (face) {
      case "campsite": return { icon: AMENITY_ICONS.campsite, label: AMENITY_LABELS.campsite, color: AMENITY_COLORS.campsite, statHint: "Highest Campsite count wins" };
      case "portaloo": return { icon: AMENITY_ICONS.portaloo, label: AMENITY_LABELS.portaloo, color: AMENITY_COLORS.portaloo, statHint: "Highest Portaloo count wins" };
      case "security": return { icon: AMENITY_ICONS.security, label: AMENITY_LABELS.security, color: AMENITY_COLORS.security, statHint: "Highest Security count wins" };
      case "catering": return { icon: AMENITY_ICONS.catering, label: AMENITY_LABELS.catering, color: AMENITY_COLORS.catering, statHint: "Highest Catering count wins" };
      case "fame": return { icon: "🔥", label: "Fame", color: "#f97316", statHint: "Highest 🔥 Fame wins" };
      case "stage": return { icon: "🎪", label: "Stages", color: "#4ade80", statHint: "Most open stages wins" };
      default: return { icon: "?", label: "?", color: "#94a3b8", statHint: "" };
    }
  };
  const resolveAgentContestRoll = (contestants, artist, poolIdx) => {
    // Roll uniformly from the same 7-face dice pool the game uses everywhere else
    const rolledFace = DICE_OPTIONS[Math.floor(Math.random() * DICE_OPTIONS.length)];
    const pd = playerDataRef.current || playerData;
    const contestantData = contestants.map(c => {
      const opd = pd[c.pid] || {};
      const value = getContestValue(opd, rolledFace);
      const tickets = opd.tickets || 0;
      const festivalName = players.find(p => p.id === c.pid)?.festivalName || `Player ${c.pid}`;
      return { pid: c.pid, festivalName, value, tickets, placedTurn: c.placedTurn, isWinner: false };
    });
    // Sort: value desc, then tickets desc, then placedTurn asc
    const sorted = [...contestantData].sort((a, b) => {
      if (b.value !== a.value) return b.value - a.value;
      if (b.tickets !== a.tickets) return b.tickets - a.tickets;
      return a.placedTurn - b.placedTurn;
    });
    const winnerId = sorted[0].pid;
    contestantData.forEach(c => { c.isWinner = c.pid === winnerId; });
    return { artist, poolIdx, contestants, rolledFace, contestantData, winnerId };
  };

  // Commit the contest outcome: book/hand the artist to the winner, exhaust winner's agent,
  // return losers' agents. ALL contestants gain +1 Fame ("industry buzz" reward) — winning
  // gets you the artist + the fame, losing gets you just the fame. This makes contests
  // a positive-sum interaction and removes the risk-aversion that previously kept contests rare.
  // Used by both the human modal "Continue" handler and the AI dispatcher.
  // v130: under tempt mode this refunds 1 Fame to every contestant (both winner and losers),
  // since each contest entry cost 1 Fame to place. The dice-roll winner still lands the
  // artist. No "+1 industry buzz" fame is added under tempt (the refund IS the payoff for
  // contesting; the industry-buzz reward would double-dip). Under standard agent mode the
  // buzz reward still fires as before.
  // v179: helper — award the +2 Fame bonus for winning an uncontested tempt.
  // Under tempt mode, an uncontested tempt win nets the player +1 Fame overall
  // (they paid 1 to tempt, get 2 back on winning solo). This fires at the point
  // of resolution, before the artist is booked or sent to hand.
  const grantUncontestedTemptBonus = (pid) => {
    if (!temptModeRef.current) return;
    setPlayerData(p => {
      const opd = p[pid] || {};
      return { ...p, [pid]: { ...opd, baseFame: Math.min(FAME_MAX, (opd.baseFame || 0) + 2) } };
    });
    const name = players.find(p => p.id === pid)?.festivalName || "?";
    logFameGain(pid, 2, "Uncontested tempt win");
    addLog("💫 Tempt", `${name} gained +2 🔥 Fame for winning an uncontested tempt!`);
    showFloatingBonus("+2 🔥 uncontested!", "#f97316");
    sfx.gainFame();
    bumpYearlyStat(pid, "temptsWon");
    // v190: `pd.fame` is a derived value (computed from baseFame in computeTicketsForPlayer).
    // Without a recalc, `setPlayerData` above updates baseFame but the displayed fame stays
    // stale until the next recalc fires elsewhere — which caused the "I had 4 Fame but the
    // display showed 2 until my turn ended" bug. Recalcing here surfaces the gain immediately.
    setTimeout(() => recalcTickets(), 50);
  };

  const commitAgentContest = (contest) => {
    const { artist, contestantData, winnerId } = contest;
    const isTempt = temptModeRef.current;
    const newPool = [...artistPool];
    const idx = newPool.findIndex(a => a.name === artist.name);
    if (idx >= 0) newPool.splice(idx, 1);
    setArtistPool(newPool);
    const winPd = playerDataRef.current?.[winnerId] || playerData[winnerId] || {};
    const openStages = (winPd.stageArtists || []).map((sa, i) => sa.length < 3 ? i : -1).filter(i => i >= 0);
    // v177: fame-refund timing bug fix. Under tempt mode, every contestant paid 1 Fame
    // upfront to place their tempt. The refund happens at the END of this function
    // (after the play/hand decision). Without adjustment, canPlayNow would check
    // against fame that STILL has the tempt cost deducted — so a player who had
    // exactly enough Fame to play the artist BEFORE tempting would fail the check
    // and their artist would go to hand (losing the TEMPT effect entirely since we
    // no longer treat tempted-to-hand as tempt-play; see v177 change below).
    // Fix: for the play-eligibility check, mentally credit back the 1 Fame refund.
    const winPdForCheck = isTempt
      ? { ...winPd, fame: (winPd.fame || 0) + 1, baseFame: (winPd.baseFame || 0) + 1 }
      : winPd;
    // v177: apply the actual Fame refund BEFORE the play-or-hand decision, so that
    // by the time bookArtistToStage fires (and applyEffect reads player state), the
    // refund is already in the state stream. Previously the refund fired at the end
    // of this function — a Fame 5 headliner (Lady Gaga) played from a contested tempt
    // would see fame 4 during effect resolution.
    if (isTempt) {
      setTemptPlacements(prev => {
        const next = { ...prev };
        contestantData.forEach(c => {
          const list = next[c.pid] || [];
          next[c.pid] = list.filter(p => !(p.type === "pool" && p.artistName === artist.name));
        });
        return next;
      });
      setPlayerData(p => {
        const next = { ...p };
        contestantData.forEach(c => {
          const opd = next[c.pid] || {};
          next[c.pid] = { ...opd, baseFame: Math.min(FAME_MAX, (opd.baseFame || 0) + 1) };
        });
        return next;
      });
    }
    // v131: under tempt mode, also verify the winner can actually PLAY the artist right now.
    // If not (fame or amenities short, no genre-match slot), the artist goes to hand.
    const canPlayNow = isTempt
      ? (openStages.length > 0 && canBookArtistAnywhere(artist, winPdForCheck))
      : (openStages.length > 0);
    if (canPlayNow) {
      // v147: winner picks their stage. If it's their turn, open the modal now. If not,
      // queue for their next turn so they can choose then rather than auto-booking.
      const winnerIsAI = players.find(p => p.id === winnerId)?.isAI;
      if (winnerIsAI) {
        // v150: filter to stages the artist can actually be booked to.
        // v177: use winPdForCheck (fame-refund-adjusted) so the AI's bookability check
        // matches the human canPlayNow check.
        // v196.1: under tempt mode, this must use v194's STRICT subset rule
        // (canTemptDirectToStage), not the loose canBookArtistOnStage rule. Previously
        // AI contest winners could land on stages where an existing artist had genres
        // not covered by the incoming, violating v194. Non-tempt mode still uses the
        // amenity/loose rule for regular agent contests.
        const bookable = isTempt
          ? openStages.filter(si => canTemptDirectToStage(artist, winPdForCheck, si))
          : openStages.filter(si => canBookArtistOnStage(artist, winPdForCheck, si));
        if (bookable.length === 0) {
          // No legal placement — hand.
          // v177: no longer preserves _tempted flag. TEMPT effect is lost when the
          // artist lands in hand.
          setPlayerData(p => ({ ...p, [winnerId]: { ...p[winnerId], hand: [...(p[winnerId].hand || []), artist] } }));
          addLog("💫 Contest", `${players.find(p => p.id === winnerId)?.festivalName} won ${artist.name} but has no legal stage — sent to hand`);
        } else {
          const genreStage = bookable.find(si => canBookHeadlinerViaGenre(artist, winPd, si));
          const chosenStage = genreStage != null ? genreStage : bookable[0];
          const viaGenre = genreStage != null && !canAffordArtist(artist, winPd);
          bookArtistToStage(artist, chosenStage, winnerId, true, viaGenre);
        }
      } else if (winnerId === currentPlayerId) {
        // Winner is the current human player — open the stage-picker modal now.
        setPendingAgentArtist({ pid: winnerId, artist });
      } else {
        // Winner is a different human player — defer to their next turn via the queue.
        setPendingContestPlacements(prev => [...prev, { pid: winnerId, artist }]);
        const wName = players.find(p => p.id === winnerId)?.festivalName || "?";
        addLog("💫 Contest", `${wName} won ${artist.name} — will place on their next turn`);
      }
    } else {
      // v177: tempted-to-hand no longer preserves _tempted flag.
      setPlayerData(p => ({ ...p, [winnerId]: { ...p[winnerId], hand: [...p[winnerId].hand, artist] } }));
      if (isTempt) {
        addLog("💫 Tempt", `${players.find(p => p.id === winnerId)?.festivalName} can't play ${artist.name} yet — added to hand`);
      }
    }
    if (!isTempt) {
      // Standard agent mode: winner exhausts their agent, losers get theirs returned.
      exhaustAgent(winnerId);
      contestantData.filter(c => c.pid !== winnerId).forEach(c => returnAgent(c.pid));
      // v165: "industry buzz" fame bonus removed as part of the fame-sources prune.
      // Under agent mode, contest still resolves (winner's agent exhausts, losers'
      // returned) — just no fame side-effect anymore.
    }
    // v177: tempt-mode fame refund now happens BEFORE the play-or-hand decision (above).
    const winnerName = players.find(p => p.id === winnerId)?.festivalName;
    const faceLabel = getContestFaceLabel(contest.rolledFace);
    const winnerValue = contestantData.find(c => c.pid === winnerId).value;
    if (isTempt) {
      addLog("💫 Tempt Contest", `${winnerName} won ${artist.name} on the ${faceLabel.label} roll (${winnerValue}). Every contestant got their 1 🔥 Fame refunded.`);
    } else {
      addLog("🕵️ Agent Contest", `${winnerName} won ${artist.name} on the ${faceLabel.label} roll (${winnerValue}). All contestants gained +1 🔥 Fame (industry buzz).`);
    }
    // v190: last-turn tracker — record contest wins and losses per contestant
    setLastActionFor(winnerId, `won a contest for ${artist.name}`);
    contestantData.forEach(c => {
      if (c.pid !== winnerId) setLastActionFor(c.pid, `lost a contest for ${artist.name} (Fame refunded)`);
    });
    bumpYearlyStat(winnerId, "temptsWon");
    // v135: alt-objectives event — Popularity Contest tracks contest wins for the winner.
    bumpYearEvent(winnerId, "contestWinsThisYear");
    setTimeout(() => checkMidYearAchievements(winnerId), 80);
    setTimeout(() => recalcTickets(), 50);
  };

  function checkSecurityVPBonus(pid, amenityType) {
    if (amenityType !== "security") return;
    const pd = playerData[pid];
    if (pd && pd.vpPerSecurity > 0) {
      logTicketGain(pid, pd.vpPerSecurity, "Security placement bonus");
      setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + p[pid].vpPerSecurity } }));
      addLog("Effect", `+${pd.vpPerSecurity} 🎟️ tickets from security placement!`);
      showFloatingBonus(`+${pd.vpPerSecurity} ⭐ (security)`, "#c4b5fd");
    }
  }
  
  // AI agent deployment logic
  // v140: score how much an artist advances a player's live objectives (alt-objectives mode).
  // Returns a small integer bonus. Rough heuristic — the goal isn't perfect play, just to
  // stop the AI making obviously anti-objective picks (e.g. Fyre Festival + tempting artists).
  const scoreArtistForObjectives = (artist, pid) => {
    if (!altObjectivesModeRef.current) return 0;
    const live = activeObjectives[pid] || [];
    if (live.length === 0) return 0;
    const genres = getGenres(artist.genre);
    const fame = artist.fame || 0;
    const amenityTotal = (artist.campCost || 0) + (artist.securityCost || 0) + (artist.cateringCost || 0) + (artist.portalooCost || 0);
    let bonus = 0;
    live.forEach(entry => {
      switch (entry.id) {
        case "fyre_festival": bonus -= 20; break; // Playing ANY artist kills this objective
        case "local_talent": if (fame <= 1) bonus += 3; break;
        case "punching": if (fame > 1) bonus += 2; break; // Any >1 Fame artist advances this
        case "mainstream": if (genres.some(g => /Pop|Rock|Hip Hop/i.test(g))) bonus += 3; break;
        case "alternative": if (genres.some(g => /Funk|Electronic|Indie/i.test(g))) bonus += 3; break;
        // v146: renamed Experimental→Eclectic (multi-genre-per-artist), removed the six
        // single-genre objectives (Popstars et al). Purists rewards ANY single-genre artist
        // (the AI can't know which genre it'll end up on, so equal-weight all).
        case "eclectic": if (genres.length >= 2) bonus += 2; break;
        case "purists": if (genres.length === 1) bonus += 3; break;
        case "cohesive": if (genres.length >= 1) bonus += 1; break; // Very lax — most artists match
        case "big_finish": if (fame >= 4) bonus += 4; break;
        case "guilty_pleasures": if (fame === 3) bonus += 4; break;
        case "high_profile": if ((artist.securityCost || 0) >= 2) bonus += 2; break;
        case "foodies": if ((artist.cateringCost || 0) >= 2) bonus += 2; break;
        case "pampered": if ((artist.portalooCost || 0) >= 2) bonus += 2; break;
        case "price_of_fame": if (amenityTotal >= 4) bonus += 2; break;
      }
    });
    return bonus;
  };

  function aiDeployAgent(pid) {
    const pd = playerData[pid] || {};
    const openStages = (pd.stageArtists || []).filter(s => s.length < 3);
    const isTempt = temptModeRef.current;

    // Microtrend fallback: if AI has no stage capacity but can still claim a microtrend,
    // do that. Also use this as a "last resort" if no pool artist is worth claiming.
    const tryMicrotrend = () => {
      if (!agentMicrotrendClaimRef.current) return false;
      const active = microtrends.find(mt => mt.claimedBy === null);
      if (!active) return false;
      const baseFame = pd.baseFame || 0;
      if (baseFame >= FAME_MAX) return false;
      placeAgentOnMicrotrend(pid);
      return true;
    };

    // v140: Tempt-mode branch. Considers ALL pool artists (even ones it can't afford yet;
    // they'd land in hand as future ammo) and factors in live objectives + willingness to
    // challenge other players' tempts.
    // v196: tempt cost raised to 2 Fame (was 1). AI must have ≥2 Fame to tempt at all.
    if (isTempt) {
      if ((pd.fame || 0) < 2) { tryMicrotrend(); return; }
      if ((temptPlacements[pid] || []).length >= 1) return; // v188: 1 tempt/turn cap (was 2)
      // v152: rebalanced tempt scoring. The AI now weighs "can I actually play this artist
      // this turn?" much more heavily, chases active microtrends, and reserves headliner
      // tempts for cases where the AI has already built up amenities close to what they'd need.
      //   Signals:
      //     base:        vp*2 + tickets (baseline artist value)
      //     affordable:  +8 if playable NOW on any stage (up from +3 — this is the big win)
      //     reach:       -3 per amenity we're short of (unless target-tier headliner)
      //     target:      +5 if this is our best hand headliner or a Fame 4+ we don't have yet
      //     microtrend:  +5 if artist genre matches the active microtrend
      //     objective:   from scoreArtistForObjectives (unchanged)
      //     contest:     -1 if another player has already tempted them (unchanged)
      const target = aiFindTargetHeadliner(pd);
      const activeMicrotrend = (microtrends || []).find(mt => mt.claimedBy === null);
      const activeGenre = activeMicrotrend?.kind === "genre" ? activeMicrotrend.genre : null;
      // v153: non-leader AIs also chase the forecast microtrend under anti-lead default.
      const forecastGenre = (canClaimForecast(pid) && nextMicrotrend?.kind === "genre") ? nextMicrotrend.genre : null;

      // ═══════════════════════════════════════════════════════════
      // v179 — AI own-game vs disruption prioritization
      // ═══════════════════════════════════════════════════════════
      // Compute "spare Fame" — how much Fame the AI has beyond what's needed for
      // artists in hand. If they're Fame-tight (0 spare), disruption tempts are
      // heavily suppressed — the AI focuses on its own game. If they have spare
      // Fame (≥1), they're free to contest opponents.
      const handMaxFameNeed = ((pd.hand || []).length > 0)
        ? Math.max(0, ...(pd.hand || []).map(a => (a.fame || 0)))
        : 0;
      const currentFame = pd.fame || 0;
      const spareFame = Math.max(0, currentFame - Math.max(1, handMaxFameNeed));
      // Identity: read from ref (both for scoring the AI's own preferences and later
      // for identity-based contest boosts).
      const aiIdentity = getIdentity(playerIdentitiesRef.current?.[pid]);
      const aiIdentityGenres = aiIdentity?.inGenres || [];
      // Build a lookup of opponent play-history: how many of each genre they've booked
      // to stages over the game. A "dominant" genre (3+ plays) signals the opponent is
      // building around that genre — worth disrupting.
      const opponentDominance = {}; // { otherPid: { genre: count } }
      players.forEach(op => {
        if (op.id === pid) return;
        const oPd = playerData[op.id] || {};
        const counts = {};
        (oPd.stageArtists || []).flat().forEach(bkArtist => {
          (bkArtist.genre || "").split(",").map(g => g.trim()).forEach(g => {
            counts[g] = (counts[g] || 0) + 1;
          });
        });
        opponentDominance[op.id] = counts;
      });
      // For a given artist, does contesting them meaningfully disrupt an opponent?
      // Returns an integer boost score (0 = no disruption, higher = more valuable).
      const contestDisruptionScore = (artistCard) => {
        // Only meaningful if this artist is ALREADY tempted by an opponent
        const placements = getPlacementsOnArtist(artistCard.name);
        const opponentPlacements = placements.filter(pl => pl.pid !== pid);
        if (opponentPlacements.length === 0) return 0;
        let disruption = 0;
        const artistGenres = (artistCard.genre || "").split(",").map(g => g.trim());
        for (const opl of opponentPlacements) {
          const oPid = opl.pid;
          const oPd = playerData[oPid] || {};
          const oFame = oPd.fame || 0;
          // 1. Fame-swing signal: if the +1 net Fame from uncontested win would put them
          //    at fame ≥ artist.fame (i.e. they'd unlock playing this or another headliner
          //    they've been building toward), that's a threat worth disrupting.
          //    Check: current fame + 1 (net gain) >= artist.fame → they'd be able to play.
          const wouldReachThreshold = (oFame + 1) >= (artistCard.fame || 0) && (artistCard.fame || 0) >= 3;
          if (wouldReachThreshold) disruption += 6;
          // 2. Genre-dominance signal: if the artist's genre is one this opponent has
          //    consistently played (3+ prior plays), the opponent is building around it.
          //    Contesting suppresses that build.
          const dom = opponentDominance[oPid] || {};
          const dominantGenres = artistGenres.filter(g => (dom[g] || 0) >= 3);
          if (dominantGenres.length > 0) disruption += 5;
          // 3. Identity match: if the artist matches the AI's OWN identity (in-genre),
          //    we get double value — contest denies the opponent AND wins us an
          //    identity-boost play if we secure them.
          if (aiIdentityGenres.length > 0 && artistGenres.some(g => aiIdentityGenres.includes(g))) {
            disruption += 4;
          }
        }
        return disruption;
      };

      // v196.2: read identity context — Curated needs artistsPlayedThisYear to
      // strongly discourage tempts that would push past the 6-play cap.
      const playedThisYear = (yearEvents[pid]?.artistsPlayedThisYear) || 0;
      const identityCtxAI = {
        playedThisYear,
        stagesTwoFull: (pd.stageArtists || []).filter(s => s.length === 2).length,
      };
      // Under Curated, tempts that would land the AI over 6 plays are strongly punished.
      // A tempt that resolves as immediate play IS a play (counts toward the 6-cap).
      // A tempt that goes to hand doesn't count until played, so the penalty is milder.
      const curatedTemptPenalty = (a, immediatePlay) => {
        if (aiIdentity?.type !== "curated") return 0;
        if (playedThisYear >= 6) return immediatePlay ? -30 : -5; // over cap already — huge penalty
        if (playedThisYear === 5) return immediatePlay ? -8 : 0;  // next play brings us to cap — careful
        // Below 5: reward high-value tempts since each play slot is precious
        return immediatePlay ? Math.round(((a.tickets || 0) + (a.fame || 0)) * 0.3) : 0;
      };

      const scored = artistPool.map(a => {
        const iAlreadyTempted = (temptPlacements[pid] || []).some(pl => pl.artistName === a.name);
        if (iAlreadyTempted) return { a, score: -999 };
        const base = (a.vp || 0) * 2 + (a.tickets || 0);
        // v195: split the old flat "affordable" bonus into two tiers reflecting how a tempt
        // actually resolves post-v194 (genre-match rule):
        //   - canTemptToAnyStage: the artist would land DIRECTLY on a stage (immediate play)
        //   - canBookArtistAnywhere: the artist is at least amenity-affordable to play later
        //     from hand (delayed play; requires hand-then-amenity-play sequence)
        // The immediate-play bonus dominates because it's a play NOW, not a stockpile.
        const canImmediatePlay = canTemptToAnyStage(a, pd);
        const canPlayLater = canBookArtistAnywhere(a, pd);
        const immediateBonus = canImmediatePlay ? 12 : 0;
        const laterBonus = (!canImmediatePlay && canPlayLater) ? 3 : 0;
        // v196.2: general identity score — covers Curated (via curatedTemptPenalty below,
        // this hook covers Confetti Cannons, Local Talent, genrePair, etc.)
        const identityBonus = aiScoreArtistForIdentity(a, aiIdentity, identityCtxAI);
        // v196.2: Curated-specific penalty for pushing past the 6-play cap.
        const curatedPenalty = curatedTemptPenalty(a, canImmediatePlay);
        // How many amenities are we short by? (Sum of gaps.)
        const gap = Math.max(0, (a.campCost || 0) - (pd.amenities?.campsite || 0))
                  + Math.max(0, (a.securityCost || 0) - (pd.amenities?.security || 0))
                  + Math.max(0, (a.cateringCost || 0) - (pd.amenities?.catering || 0))
                  + Math.max(0, (a.portalooCost || 0) - (pd.amenities?.portaloo || 0));
        const isTargetHeadlinerTier = (a.fame || 0) >= 4 && (!target || (a.fame || 0) >= (target.fame || 0));
        // Penalize unreachable artists UNLESS they're a target-tier headliner (worth
        // stockpiling in hand for later). Non-headliners we can't play get -3 per gap.
        const reachPenalty = canPlayLater ? 0 : (isTargetHeadlinerTier ? -gap * 1 : -gap * 3);
        const targetBonus = isTargetHeadlinerTier ? 5 : 0;
        // Microtrend: matches if artist's genre list overlaps with active trend OR
        // (for non-leaders under anti-lead) the forecast trend.
        // v156: under trends mode, matching a trend also progresses stage credits — bump.
        const artistGenres = (a.genre || "").split(",").map(g => g.trim());
        const stagesLeftForBump = 3 - ((pd.stages || []).length);
        const trendBump = (stageOpenModeRef.current === "trends" && stagesLeftForBump > 0) ? 5 : 0;
        // v172: if the AI has enough Fame to still play this artist AFTER spending
        // Fame on the tempt itself, and the artist matches an active/forecast microtrend
        // genre, give a MUCH bigger bonus. This is the proactive-tempt case: the AI
        // preferentially chases pool artists that match a live microtrend when it can
        // immediately deploy them.
        // v196: tempt cost is now 2 Fame (was 1), so canPlay-after-tempt requires
        // current fame >= artist.fame + 2.
        const canPlayAfterTempt = (pd.fame || 0) >= (a.fame || 0) + 2;
        const microMatchActive = activeGenre && artistGenres.includes(activeGenre);
        const microMatchForecast = forecastGenre && artistGenres.includes(forecastGenre);
        const microBonus = (microMatchActive || microMatchForecast) && canPlayAfterTempt
          ? 20 + trendBump // proactive-tempt: dominates the score
          : microMatchActive ? (5 + trendBump)
          : microMatchForecast ? (4 + trendBump)
          : 0;
        const objBonus = scoreArtistForObjectives(a, pid);
        const alreadyTempted = getPlacementsOnArtist(a.name).length > 0;
        // v179/v195: contest scoring.
        // If the artist is already tempted by an opponent, contesting is a denial move.
        //   - Existing disruption signals: fame-swing, genre-dominance, identity-match
        //   - v195 addition: scale contest willingness with the RAW VALUE of the pool artist.
        //     Higher fame+tickets → bigger denial upside → AI more willing to contest.
        //   - Spare-fame scaling still applies (fame-tight AIs still avoid contests)
        //   - Small -1 penalty preserved so all-else-equal, uncontested tempts win
        let contestScore = 0;
        if (alreadyTempted) {
          const disruption = contestDisruptionScore(a);
          // v196.2: tightened spare-fame scaling because tempt cost is now 2 Fame (v196).
          // Was 1.0/0.6/0.2 — dropped to 1.0/0.4/0.1 so Fame-tight AIs are less likely
          // to burn 2 Fame on speculative contests.
          const spareScale = spareFame >= 2 ? 1.0 : spareFame === 1 ? 0.4 : 0.1;
          // v195: raw-value contest bonus — proportional to what we're denying
          const rawValueContest = ((a.fame || 0) * 2 + (a.tickets || 0)) * 0.5;
          // v196.2: leader-aware contest — if the artist is currently tempted by the
          // current leader, boost willingness to contest. Anti-lead mechanic already
          // pressures leaders, this makes contest denial specifically preferential
          // against them (as the user requested).
          const currentLeader = getCurrentLeader();
          const placements = getPlacementsOnArtist(a.name);
          const opponentPlacers = placements.filter(pl => pl.pid !== pid);
          const leaderIsTempting = currentLeader != null && opponentPlacers.some(pl => pl.pid === currentLeader);
          const leaderBonus = leaderIsTempting ? 4 : 0;
          contestScore = disruption * spareScale + rawValueContest * spareScale + leaderBonus * spareScale - 1;
        }
        // v179/v196: uncontested tempts yield +2 Fame refund. Under v196 (tempt cost 2)
        // that's net 0 Fame (was net +1 under v179 with cost 1). Small preference for
        // uncontested targets kept — solo tempts are still a cleaner path than fighting
        // over a shared claim even when Fame-neutral.
        const uncontestedPref = alreadyTempted ? 0 : 2;
        return { a, score: base + immediateBonus + laterBonus + reachPenalty + targetBonus + microBonus + objBonus + contestScore + uncontestedPref + identityBonus + curatedPenalty };
      }).sort((x, y) => y.score - x.score);
      let best = scored[0];
      // v195: post-scoring override. If the top pick is a CONTEST (an artist already
      // tempted by an opponent) AND there's a genre-match alternative for the AI's own
      // board whose ticket value is no more than 1 lower, prefer the genre-match play.
      // Rationale: contesting is a denial win; genre-match tempt is a direct-play win.
      // When the values are comparable, the direct play is worth more (guaranteed stage
      // placement + no die roll risk + no opponent Fame refund).
      if (best && getPlacementsOnArtist(best.a.name).some(pl => pl.pid !== pid)) {
        const bestTickets = best.a.tickets || 0;
        const genreMatchAlt = scored.find(s =>
          s.a !== best.a
          && s.score > -999
          && canTemptToAnyStage(s.a, pd)
          && getPlacementsOnArtist(s.a.name).length === 0
          && (s.a.tickets || 0) >= bestTickets - 1
        );
        if (genreMatchAlt) {
          addLog("🤖 AI", `Skipping contest for ${best.a.name} — own genre-match play on ${genreMatchAlt.a.name} is comparable value`);
          best = genreMatchAlt;
        }
      }
      if (!best || best.score < 5) { tryMicrotrend(); return; }
      const poolIdx = artistPool.indexOf(best.a);
      if (poolIdx >= 0) placeAgentOnArtist(pid, poolIdx);
      return;
    }

    // Standard-mode branch — original logic below.
    if (openStages.length === 0) { tryMicrotrend(); return; }
    const affordable = artistPool.filter(a => canAffordArtist(a, pd));
    const bestPool = affordable.sort((a, b) => (b.vp * 2 + b.tickets + scoreArtistForObjectives(b, pid)) - (a.vp * 2 + a.tickets + scoreArtistForObjectives(a, pid)))[0];
    if (!bestPool || (bestPool.vp * 2 + bestPool.tickets) <= 8) { tryMicrotrend(); return; }
    const alreadyClaimed = getPlacementsOnArtist(bestPool.name).length > 0;
    const worthContesting = (bestPool.vp * 2 + bestPool.tickets + scoreArtistForObjectives(bestPool, pid)) > 12;
    if (!alreadyClaimed || worthContesting) {
      const poolIdx = artistPool.indexOf(bestPool);
      if (poolIdx >= 0) placeAgentOnArtist(pid, poolIdx);
    } else {
      tryMicrotrend();
    }
  }

  /** Get names of all artists currently in use (on stages, in hands, in pool) */
  function getInUseNames() {
    // Read from refs (synchronous freshness) so chained event handlers — like
    // applyDrawArtistsBonus running right after a pool pickup or deck draw — see the
    // very latest zone state and don't accidentally re-include or re-draw a card
    // that's about to land in pool / hand / stages.
    const names = new Set();
    const pool = artistPoolRef.current || artistPool;
    const pd = playerDataRef.current || playerData;
    pool.forEach(a => names.add(a.name));
    for (const pid of Object.keys(pd)) {
      const p = pd[pid];
      (p.hand || []).forEach(a => names.add(a.name));
      (p.stageArtists || []).forEach(sa => sa.forEach(a => names.add(a.name)));
    }
    // Cards mid-draw (waiting on user pick) — not in pool/hand/deck/discard, but should
    // not be re-drawn or re-shuffled while the player is choosing.
    const drawn = deckDrawnCardRef.current;
    if (drawn) {
      if (Array.isArray(drawn)) drawn.forEach(a => a && names.add(a.name));
      else if (drawn.name) names.add(drawn.name);
    }
    (draw2PicksRef.current || []).forEach(a => a && names.add(a.name));
    return names;
  }

  function drawFromDeck(count = 1) {
    const inUse = getInUseNames();
    // Read deck/discard from refs to handle synchronous chained calls within one event
    let deck = [...(artistDeckRef.current || artistDeck)];
    let disc = [...(discardPileRef.current || discardPile)];
    const drawn = [];
    for (let i = 0; i < count; i++) {
      // If deck is empty but discard has eligible (not-in-use) cards, reshuffle them in.
      if (deck.length === 0 && disc.length > 0) {
        const reusable = disc.filter(a => !inUse.has(a.name));
        const stuck = disc.filter(a => inUse.has(a.name));
        deck = shuffle(reusable);
        disc = stuck;
      }
      // Skip any in-use artists at top of deck — push them aside to discard rather than drawing them
      while (deck.length > 0 && inUse.has(deck[deck.length - 1]?.name)) {
        disc.push(deck.pop());
      }
      if (deck.length > 0) {
        const card = deck.pop();
        drawn.push(card);
        // Prevent the same card from being drawn twice in a single batch (chained drawFromDeck calls)
        inUse.add(card.name);
      } else {
        break; // truly nothing left to draw
      }
    }
    // Update refs synchronously so any further calls in the same handler see the current deck/discard.
    artistDeckRef.current = deck;
    discardPileRef.current = disc;
    setArtistDeck(deck); setDiscardPile(disc);
    return drawn;
  }

  function refillPool(overridePool) {
    const inUse = getInUseNames();
    let deck = [...artistDeck]; let disc = [...discardPile]; let pool = overridePool ? [...overridePool] : [...artistPool];
    pool.forEach(a => inUse.add(a.name));
    while (pool.length < 5) {
      if (deck.length === 0 && disc.length > 0) {
        deck = shuffle(disc.filter(a => !inUse.has(a.name)));
        disc = disc.filter(a => inUse.has(a.name));
      }
      while (deck.length > 0 && inUse.has(deck[deck.length - 1]?.name)) { disc.push(deck.pop()); }
      if (deck.length === 0) break;
      const card = deck.pop();
      pool.push(card);
      inUse.add(card.name);
    }
    setArtistDeck(deck); setDiscardPile(disc); setArtistPool(pool);
  }

  // Get names of artists that have agents on them (protected from refresh)
  function getAgentProtectedNames() {
    const names = new Set();
    Object.values(agentPlacements).forEach(p => { if (p && p.type === "pool" && p.artistName) names.add(p.artistName); });
    // v131: under tempt mode, also protect artists that any player has a tempt on.
    if (temptModeRef.current) {
      Object.values(temptPlacements).forEach(list => {
        (list || []).forEach(p => {
          if (p.type === "pool" && p.artistName) names.add(p.artistName);
        });
      });
    }
    return names;
  }

  // True iff artist `name` has at least one agent on it placed by a player OTHER than `byPid`.
  // Used to gate human pool-pickup paths so you can't snatch an artist another player's agent has reserved.
  // Note: doesn't block your OWN agent — you may still book your own claim through the normal agent flow.
  // v131: also checks temptPlacements under tempt mode.
  function isAgentClaimedByOther(name, byPid) {
    if (temptModeRef.current) {
      for (const [pid, list] of Object.entries(temptPlacements)) {
        if (parseInt(pid) === byPid) continue;
        if ((list || []).some(p => p.type === "pool" && p.artistName === name)) return true;
      }
      // Also check agentPlacements defensively (shouldn't have entries under tempt but safe)
    }
    return Object.entries(agentPlacements).some(([pid, p]) => p && p.type === "pool" && p.artistName === name && parseInt(pid) !== byPid);
  }

  function refreshPool(cycles = 1) {
    const inUse = getInUseNames();
    const protectedNames = getAgentProtectedNames();
    // Separate protected (agent-claimed) artists from the rest
    const protectedArtists = artistPool.filter(a => protectedNames.has(a.name));
    const unprotected = artistPool.filter(a => !protectedNames.has(a.name));
    // Only discard the unprotected artists
    unprotected.forEach(a => inUse.delete(a.name));
    let disc = [...discardPile, ...unprotected];
    let deck = [...artistDeck];
    // Start with protected artists already in pool
    let pool = [...protectedArtists];
    pool.forEach(a => inUse.add(a.name));
    const targetSize = 5;
    for (let cycle = 0; cycle < cycles; cycle++) {
      if (cycle > 0) {
        // On subsequent cycles, discard non-protected pool artists and redraw
        const newUnprotected = pool.filter(a => !protectedNames.has(a.name));
        disc = [...disc, ...newUnprotected];
        newUnprotected.forEach(a => inUse.delete(a.name));
        pool = pool.filter(a => protectedNames.has(a.name));
      }
      while (pool.length < targetSize) {
        if (deck.length === 0 && disc.length > 0) {
          deck = shuffle(disc.filter(a => !inUse.has(a.name)));
          disc = disc.filter(a => inUse.has(a.name));
        }
        while (deck.length > 0 && inUse.has(deck[deck.length - 1]?.name)) { disc.push(deck.pop()); }
        if (deck.length === 0) break;
        const card = deck.pop();
        pool.push(card);
        inUse.add(card.name);
      }
    }
    setArtistPool(pool); setArtistDeck(deck); setDiscardPile(disc);
  }

  // Defensive de-duplication pass — scans every card zone in priority order
  // (stage > hand > pool > deck > discard) and removes any subsequent occurrence
  // of an already-seen artist name. The stage-versus-hand case is the one we've
  // actually seen in playtest: an artist on a stage AND in another player's hand,
  // typically the result of a stale-ref draw earlier in the game. This runs as
  // a safety net at turn transitions and year boundaries — the underlying draw
  // logic *should* prevent duplicates, but this catches anything that slips through.
  const dedupeAllCards = () => {
    const seen = new Set();
    let changed = false;
    const removalLog = [];

    // Pass 1: stages — always kept; record names
    Object.values(playerData).forEach(pd => {
      (pd.stageArtists || []).forEach(sa => sa.forEach(a => { if (a?.name) seen.add(a.name); }));
    });

    // Pass 2: hands — remove anything already seen on a stage; record the rest
    let newPlayerData = playerData;
    Object.entries(playerData).forEach(([pid, pd]) => {
      const oldHand = pd.hand || [];
      const newHand = [];
      let modified = false;
      for (const a of oldHand) {
        if (!a?.name) continue;
        if (seen.has(a.name)) {
          changed = true; modified = true;
          const owner = players.find(p => String(p.id) === String(pid))?.festivalName || pid;
          removalLog.push(`${a.name} (from ${owner}'s hand)`);
        } else {
          newHand.push(a);
          seen.add(a.name);
        }
      }
      if (modified) newPlayerData = { ...newPlayerData, [pid]: { ...newPlayerData[pid], hand: newHand } };
    });

    // Pass 3: pool
    const newPool = [];
    for (const a of artistPool) {
      if (!a?.name) continue;
      if (seen.has(a.name)) { changed = true; removalLog.push(`${a.name} (from pool)`); }
      else { newPool.push(a); seen.add(a.name); }
    }

    // Pass 4: deck
    const newDeck = [];
    for (const a of artistDeck) {
      if (!a?.name) continue;
      if (seen.has(a.name)) { changed = true; removalLog.push(`${a.name} (from deck)`); }
      else { newDeck.push(a); seen.add(a.name); }
    }

    // Pass 5: discard
    const newDiscard = [];
    for (const a of discardPile) {
      if (!a?.name) continue;
      if (seen.has(a.name)) { changed = true; removalLog.push(`${a.name} (from discard)`); }
      else { newDiscard.push(a); seen.add(a.name); }
    }

    if (!changed) return false;
    setPlayerData(newPlayerData);
    setArtistPool(newPool);
    setArtistDeck(newDeck);
    setDiscardPile(newDiscard);
    // Update refs synchronously so any chained reads in the same handler see the cleaned state.
    artistPoolRef.current = newPool;
    artistDeckRef.current = newDeck;
    discardPileRef.current = newDiscard;
    playerDataRef.current = newPlayerData;
    addLog("⚙️ Cleanup", `Removed duplicate(s): ${removalLog.slice(0, 5).join(", ")}${removalLog.length > 5 ? ` +${removalLog.length - 5} more` : ""}`);
    return true;
  };

  /** Trigger an effect dice roll — shows the overlay and calls callback with results */
  /** Track goal progress and check milestones */
  // trackGoalProgress — now a no-op (goals removed)
  function trackGoalProgress(pid, trackKey) {}

  /** Draw 3 lineup objectives from the genre deck */
  function drawInitialLineupObjectives() {
    const deck = shuffle([...LINEUP_GENRE_DECK]);
    const objs = [];
    for (let i = 0; i < 3; i++) {
      if (deck.length < 3) deck.push(...shuffle([...LINEUP_GENRE_DECK]));
      const genres = [deck.pop(), deck.pop(), deck.pop()];
      objs.push({ genres, claimed1st: null, claimed2nd: null });
    }
    setLineupObjectives(objs);
    setLineupObjDeck(deck);
    objs.forEach((o, i) => addLog("🎯 Lineup Objective", `#${i+1}: ${o.genres.join(" + ")} (any order)`));
  }

  /** Replace a completed lineup objective with a new one */
  function replaceLineupObjective(idx) {
    setLineupObjDeck(prev => {
      let deck = [...prev];
      if (deck.length < 3) deck = shuffle([...LINEUP_GENRE_DECK, ...deck]);
      const genres = [deck.pop(), deck.pop(), deck.pop()];
      setLineupObjectives(prevObjs => {
        const next = [...prevObjs];
        next[idx] = { genres, claimed1st: null, claimed2nd: null };
        addLog("🎯 Lineup Objective", `New #${idx+1}: ${genres.join(" + ")} (any order)`);
        return next;
      });
      return deck;
    });
  }

  /** Check if a completed lineup matches any of the 3 lineup objectives (unordered) */
  function checkLineupObjective(lineup, pid) {
    if (lineup.length !== 3) return;
    for (let oi = 0; oi < lineupObjectives.length; oi++) {
      const lo = lineupObjectives[oi];
      if (!lo || lo.claimed2nd !== null) continue;
      // Proper bipartite match (greedy was buggy when a multi-genre artist could cover
      // either of two remaining requirements but only one assignment was valid overall).
      if (!lineupCoversGenres(lineup, lo.genres)) continue;

      const pName = players.find(p => p.id === pid)?.festivalName || "?";
      if (lo.claimed1st === null) {
        setLineupObjectives(prev => {
          const next = [...prev];
          next[oi] = { ...next[oi], claimed1st: pid };
          return next;
        });
        // v165: trending lineup ticket payouts removed. 1st still earns a stage-open
        // credit under trends mode (the meaningful strategic reward). Second place is
        // still tracked so the objective is fully claimed, but no ticket bonus.
        addLog("🎯 LINEUP OBJECTIVE", `${pName} FIRST to match ${lo.genres.join("+")}!`);
        showFloatingBonus("🎯 First!", "#fbbf24"); sfx.headliner();
        grantStageCredit(pid, `1st place on ${lo.genres.join("+")} lineup`);
      } else if (lo.claimed2nd === null && lo.claimed1st !== pid) {
        setLineupObjectives(prev => {
          const next = [...prev];
          next[oi] = { ...next[oi], claimed2nd: pid };
          return next;
        });
        addLog("🎯 LINEUP OBJECTIVE", `${pName} SECOND to match ${lo.genres.join("+")}`);
        showFloatingBonus("🎯 Second", "#c4b5fd"); sfx.headliner();
      }
      return; // only match one objective per lineup
    }
  }

  /** Check if an artist is free to play (won from goal) */
  function canAffordArtistOrFree(artist, pd, fameReduction = 0) {
    if (artist.freePlay) return true;
    return canAffordArtist(artist, pd, fameReduction);
  }

  function triggerDiceRoll(count, pid, artistName, resultText, callback) {
    setPendingDiceRoll({ count, pid, artistName, resultText, callback, rolled: false });
  }

  // ─── Apply artist effects ───

  // v126+: Genre-match headliner bonus effect. Fires when a headliner is booked via
  // the genre-match path (both stage artists share a genre with the incoming). Two paths:
  //  (A) Replacement effects — for artists whose bonus reads "+X instead of +Y", the base
  //      effect has already fired for its +Y contribution, so we add (X - Y) * multiplier
  //      here so the total lands exactly on the replacement value the card promises.
  //  (B) Additive effects — for simpler "+1 Fame" or "+3 ticket sales" style bonuses,
  //      just add the amount on top of whatever the base effect did.
  function applyGenreMatchEffect(artist, pid) {
    const gm = (artist.genreMatchEffect || "").trim();
    if (!gm) return;
    const gl = gm.toLowerCase();
    const festival = players.find(p => p.id === pid)?.festivalName || "?";
    // Toast + log the raw effect text so players see the narrative
    addLog("🎸 Genre-Match Bonus", `${artist.name}: ${gm}`);
    showFloatingBonus(`🎸 ${gm}`, "#fbbf24");

    // ── (A) Replacement handlers (per-artist, deterministic delta) ────────────────
    // These artists have a base effect whose numeric coefficient is REPLACED (not added
    // to) by the genre-match version. We compute (replacement - base) × multiplier and
    // add that delta so the base's contribution plus this delta equals the replacement.
    // Base value assumed to have already fired from applyEffect before we run.
    const pd = playerDataRef.current?.[pid] || playerData[pid] || {};
    const totalOtherArtists = Math.max(0, (pd.stageArtists || []).flat().length - 1);
    const totalAmenities = Object.values(pd.amenities || {}).reduce((s, v) => s + v, 0);
    const activeCouncils = (pd.councils || []).filter((c, i) => c && councilQualifies(c, (pd.fields || [])[i], yearRef.current || year || 1)).length;
    const hipHopCount = (pd.stageArtists || []).flat().filter(a => getGenres(a.genre).includes("Hip Hop")).length;
    const campCount = (pd.amenities?.campsite) || 0;

    const insteadCases = {
      // multiplier-replacement artists (base fires with the SMALL coefficient; we add the delta)
      "Gorillaz":       { delta: 5, times: campCount },         // 4 → 9 per campsite
      "Prince":         { delta: 3, times: totalOtherArtists }, // 1 → 4 per other artist
      "Eminem":         { delta: 3, times: hipHopCount },       // 3 → 6 per hip hop artist (fires at year end)
      "Daft Punk":      { delta: 3, times: Math.floor(totalAmenities / 3) }, // 6 → 9 per 3 amenities (year end)
      "Fatboy Slim":    { delta: 3, times: activeCouncils },    // 4 → 7 per qualifying council (year end)
      // Fleetwood Mac (Year End): "+3 per die showing most common" → "+5 per die instead".
      // Delta 2/die × expected 2 dice (with 5 dice rolled, expected most-common count ≈ 1.5-2).
      // We add a flat +4 as the expected bonus — actual roll may vary slightly but this is close.
      "Fleetwood Mac":  { delta: 4, times: 1, note: "expected value from 5-dice roll" },
      // Heart: base rolls 3 dice → 2 tickets per Fame shown. Genre-match rolls 5 instead.
      // Expected extra fame from 2 more dice = 2 × (1/6) fame prob × 2 tickets = ~+0.67. Round +1.
      "Heart":          { delta: 1, times: 1, note: "expected value from extra 2 dice" },
      // Betty Davis: base "Discard 1 amenity, gain 5 tickets" — with genre-match, no discard needed.
      // Base effect isn't currently auto-resolving the "gain 5" either, so genre-match fires the +5 directly.
      "Betty Davis":    { delta: 5, times: 1 },
    };
    if (insteadCases[artist.name]) {
      const { delta, times } = insteadCases[artist.name];
      const bonus = delta * times;
      if (bonus > 0) {
        logTicketGain(pid, bonus, `Genre-match: ${artist.name}`);
        setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + bonus } }));
        addLog("🎸 Genre-Match Bonus", `${festival}: net +${bonus} 🎟️ from ${artist.name}'s replacement effect`);
      }
      setTimeout(() => recalcTickets(), 50);
      return;
    }
    // Silk Sonic — replacement modifies the base effect's mechanic (Draw-2-pick-1 instead
    // of Discard-2-draw-top). The base effect is complex and Silk Sonic's mechanic isn't
    // auto-resolved anyway, so we leave this one as a narrative log line only.
    if (artist.name === "Silk Sonic") {
      setTimeout(() => recalcTickets(), 50);
      return;
    }

    // ── (B) Additive handlers (bonus adds on top of base) ────────────────────────

    // +N Fame
    const fameMatch = gl.match(/\+(\d+)\s*fame/);
    if (fameMatch) {
      const amount = parseInt(fameMatch[1]);
      logFameGain(pid, amount, `Genre-match: ${artist.name}`);
      setPlayerData(p => ({ ...p, [pid]: { ...p[pid], baseFame: Math.min(FAME_MAX, (p[pid].baseFame || 0) + amount) } }));
    }
    // +N ticket sales (plain flat; only match if not "per ..." — those get their own handler)
    const flatTix = gl.match(/\+(\d+)\s*ticket(?:\s*sales?)?(?!\s*\/|\s*per)/);
    // Per-fame-level ticket bonuses (Clairo: "+1 ticket sale / fame level", Coldplay: "+2 ticket sales / Fame gained")
    const perFameTix = gl.match(/\+(\d+)\s*ticket(?:\s*sales?)?\s*\/\s*fame/);
    if (perFameTix) {
      const per = parseInt(perFameTix[1]);
      // "Fame gained this year" — approximate with current baseFame (v1 approximation).
      const fameFactor = gl.includes("gained") ? (pd.baseFame || 0) : (pd.fame || 0);
      const bonus = per * fameFactor;
      logTicketGain(pid, bonus, `Genre-match: ${artist.name} (per Fame)`);
      if (bonus > 0) setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + bonus } }));
    } else if (flatTix) {
      const amount = parseInt(flatTix[1]);
      logTicketGain(pid, bonus, `Genre-match: ${artist.name} (per Fame)`);
      setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + amount } }));
    }
    // Place an amenity of your choice — auto-pick best amenity via AI heuristic
    if (gl.includes("place 1 amenity") || gl.includes("place an amenity")) {
      const amt = aiPickAmenityType(pd);
      const fIdx = aiPickFieldForAmenity(pd, amt, yearRef.current || year || 1);
      setPlayerData(p => ({ ...p, [pid]: mutateAmenity(p[pid], fIdx, amt, +1) }));
      addLog("🎸 Genre-Match", `${festival}: placed bonus ${AMENITY_LABELS[amt]} in F${fIdx + 1}`);
    }
    // "Choose an indie artist from the artist pool" — auto-take first Indie from pool
    // v186: exclude tempt/agent-protected artists from the auto-take.
    if (gl.includes("indie artist from the artist pool") || gl.includes("indie artist from the pool")) {
      const protectedNames = getAgentProtectedNames();
      const idx = artistPool.findIndex(a => getGenres(a.genre).includes("Indie") && !protectedNames.has(a.name));
      if (idx >= 0) {
        const chosen = artistPool[idx];
        setArtistPool(prev => { const np = [...prev]; np.splice(idx, 1); return np; });
        setPlayerData(p => ({ ...p, [pid]: { ...p[pid], hand: [...(p[pid].hand || []), chosen] } }));
        addLog("🎸 Genre-Match", `${festival}: took ${chosen.name} into hand`);
      }
    }
    setTimeout(() => recalcTickets(), 50);
  }

  function applyEffect(artist, pid, times = 1, stageIdx = -1, viaAgent = false, viaTempt = false, prevArtist = null, prevArtistPid = null, slotCount = 0) {
    let eff = (artist.effect || "").trim();
    // v169: [TEMPT] prefix marks effects that ONLY fire on tempt-play. If the
    // artist wasn't played via tempt, strip the effect entirely (no fire). If it
    // was, strip the prefix and process the rest normally.
    if (eff.startsWith("[TEMPT]")) {
      if (!viaTempt) {
        // Not tempted → effect doesn't fire. Log-only.
        return;
      }
      eff = eff.substring(7).trim(); // remove "[TEMPT]" marker
    }
    // v197: [HIGHEST_FAME] prefix — fires only if this artist is the highest-fame on its stage.
    // Handles Lady Gaga's "+2 per lower fame artist" multiplier as a special case; other
    // artists (Silk Sonic, Beyonce, Nelly, Jamiroquai, Jonas Brothers, Clairo) get a
    // flat fire-through so their existing +N ticket / +1 Fame / Play-another handlers apply.
    if (eff.startsWith("[HIGHEST_FAME]")) {
      const pdNow = playerData[pid] || {};
      const stage = (pdNow.stageArtists || [])[stageIdx] || [];
      const artistFame = artist.fame || 0;
      // Highest-fame check: artist just landed on stage so `stage` may or may not include them.
      // Filter out the artist itself (compare by name), then check no other artist is >= artist.fame.
      const others = stage.filter(a => a.name !== artist.name);
      const isHighest = others.every(a => (a.fame || 0) < artistFame) && others.length > 0;
      if (!isHighest) {
        addLog("Effect", `${artist.name}: not the highest fame on stage — effect skipped`);
        return;
      }
      eff = eff.substring("[HIGHEST_FAME]".length).trim();
      // Lady Gaga special: "+N ticket(s) per lower fame artist on this stage"
      const perLower = eff.match(/\+(\d+)\s*ticket\(s\)?\s*per\s+lower\s+fame\s+artist/i);
      if (perLower) {
        const perTix = parseInt(perLower[1]);
        const lowerCount = others.filter(a => (a.fame || 0) < artistFame).length;
        const bonus = perTix * lowerCount;
        if (bonus > 0) {
          logTicketGain(pid, bonus, `${artist.name} effect (highest fame ×${lowerCount})`);
          setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + bonus } }));
          addLog("Effect", `${artist.name}: +${bonus} 🎟️ (highest fame — ${lowerCount} lower-fame artist${lowerCount === 1 ? "" : "s"} on stage)`);
          showFloatingBonus(`+${bonus} 🎟️`, "#fbbf24"); sfx.gainTickets();
        }
        return;
      }
      // Fall through: standard handlers below will fire on the stripped effect string.
    }
    // v197: [SAME_GENRE_ON_STAGE] prefix — fires only if any other artist on the same stage shares a genre.
    if (eff.startsWith("[SAME_GENRE_ON_STAGE]")) {
      const pdNow = playerData[pid] || {};
      const stage = (pdNow.stageArtists || [])[stageIdx] || [];
      const myGenres = new Set(getGenres(artist.genre));
      const others = stage.filter(a => a.name !== artist.name);
      const shares = others.some(a => getGenres(a.genre).some(g => myGenres.has(g)));
      if (!shares) {
        addLog("Effect", `${artist.name}: no shared-genre artist on stage — effect skipped`);
        return;
      }
      eff = eff.substring("[SAME_GENRE_ON_STAGE]".length).trim();
      // Fall through: standard handlers fire on the stripped effect.
    }
    // v197.2: [SAME_GENRE_PER] prefix — per-scaler variant. Fires ONCE per other artist on
    // the stage that shares a genre. Prince: "+2 ticket(s)" per matching artist → max +4
    // on a full 3-artist stage (2 lower + Prince).
    if (eff.startsWith("[SAME_GENRE_PER]")) {
      const pdNow = playerData[pid] || {};
      const stage = (pdNow.stageArtists || [])[stageIdx] || [];
      const myGenres = new Set(getGenres(artist.genre));
      const others = stage.filter(a => a.name !== artist.name);
      const matchCount = others.filter(a => getGenres(a.genre).some(g => myGenres.has(g))).length;
      if (matchCount === 0) {
        addLog("Effect", `${artist.name}: no shared-genre artist on stage — effect skipped`);
        return;
      }
      eff = eff.substring("[SAME_GENRE_PER]".length).trim();
      // Parse "+N ticket(s)" pattern and multiply by matchCount.
      const tixMatch = eff.match(/\+(\d+)\s*ticket/i);
      if (tixMatch) {
        const per = parseInt(tixMatch[1]);
        const bonus = per * matchCount;
        logTicketGain(pid, bonus, `${artist.name} effect (×${matchCount} same-genre)`);
        setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + bonus } }));
        addLog("Effect", `${artist.name}: +${bonus} 🎟️ (+${per} × ${matchCount} same-genre artist${matchCount === 1 ? "" : "s"})`);
        showFloatingBonus(`+${bonus} 🎟️`, "#fbbf24"); sfx.gainTickets();
        return;
      }
      // If no ticket pattern matched, fall through to standard handlers (won't scale).
    }
    // v197.3: [SELECT_HEADLINER] prefix — Eminem's mechanic.
    // Copies the base ticket value of another headliner (slot-3 artist) on a DIFFERENT
    // stage. Candidates include headliners on the current player's OTHER stages AND on
    // opponents' stages. AI auto-picks the highest-ticket candidate; human sees a modal
    // and picks. If no headliner exists on any other stage, effect fizzles.
    if (eff.startsWith("[SELECT_HEADLINER]")) {
      const candidates = [];
      (players || []).forEach(p => {
        const opd = playerData[p.id] || {};
        (opd.stageArtists || []).forEach((sa, si) => {
          // Skip Eminem's own stage (same player + same stageIdx)
          if (p.id === pid && si === stageIdx) return;
          if ((sa || []).length >= 3) {
            const headliner = sa[2];
            if (headliner) candidates.push({ artist: headliner, playerId: p.id, playerName: p.festivalName, stageIdx: si });
          }
        });
      });

      const applyPayout = (targetArtist, targetPlayerName) => {
        const X = targetArtist?.tickets || 0;
        if (X > 0) {
          logTicketGain(pid, X, `${artist.name} copied ${targetArtist.name} (+${X} from ${targetPlayerName})`);
          setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + X } }));
          addLog("Effect", `${artist.name} copied ${targetArtist.name}'s ${X} tickets from ${targetPlayerName}: +${X} 🎟️`);
          showFloatingBonus(`+${X} 🎟️ copy!`, "#fbbf24"); sfx.gainTickets();
        } else {
          addLog("Effect", `${artist.name}: ${targetArtist?.name || "target"} had 0 tickets — nothing to copy`);
        }
      };

      if (candidates.length === 0) {
        addLog("Effect", `${artist.name}: no other headliner on any stage — effect fizzles`);
        return;
      }

      const isCurrentAI = players.find(p => p.id === pid)?.isAI;
      if (isCurrentAI) {
        // AI: pick highest-ticket candidate
        candidates.sort((a, b) => (b.artist.tickets || 0) - (a.artist.tickets || 0));
        const chosen = candidates[0];
        applyPayout(chosen.artist, chosen.playerName);
      } else {
        // Human: setPendingEffect with the candidate list; modal renders below.
        setPendingEffect({ type: "selectHeadliner", artistName: artist.name, candidates });
        setPendingEffectPid(pid);
      }
      return;
    }
    // v197: [STAGES_321] prefix — reads N/M/K triplet keyed by number of open stages.
    //   3 stages → first value, 2 stages → second, 1 stage → third.
    // Handles ticket triplets ("+3/5/7 tickets") and draw triplets ("Draw 1/2/3 artists").
    if (eff.startsWith("[STAGES_321]")) {
      // v197.7: read stage count via ref-fresh playerData to avoid stale-state race.
      // Bruised Brothers played on turn 1 wasn't firing the draw — root cause was that
      // playerData[pid].stages was seen as empty (stale) when applyEffect ran synchronously
      // during the setPlayerData that ADDED the artist to the stage. The ref is updated
      // synchronously by an earlier useEffect, but during rapid book+effect flows the ref
      // itself may not have caught the stage-open commit either. So read from BOTH sources
      // and take the max — defensive fallback.
      const pdRef = (playerDataRef.current || {})[pid] || {};
      const pdState = playerData[pid] || {};
      const stageCount = Math.max((pdRef.stages || []).length, (pdState.stages || []).length, 1);
      eff = eff.substring("[STAGES_321]".length).trim();
      const idx = stageCount >= 3 ? 0 : stageCount === 2 ? 1 : 2;
      addLog("Effect", `${artist.name}: [STAGES_321] triggered (${stageCount} stages open, idx=${idx})`);
      // "Draw N/N/N artists"
      const drawTriple = eff.match(/draw\s+(\d+)\s*\/\s*(\d+)\s*\/\s*(\d+)\s+artists?/i);
      if (drawTriple) {
        const val = parseInt([drawTriple[1], drawTriple[2], drawTriple[3]][idx]);
        if (val > 0) {
          // v197.7: converted from silent auto-draw-from-deck to interactive pool-or-deck
          // picker — matches Maroon 5's "Draw 2 from the deck or pool" pattern so the
          // player actually sees the picker and can choose. AI dispatcher already handles
          // the drawFromPoolOrDeck pendingEffect type.
          setPendingEffect({
            type: "drawFromPoolOrDeck",
            artistName: artist.name,
            drawsRemaining: val,
          });
          setPendingEffectPid(pid);
          addLog("Effect", `${artist.name}: draw ${val} artist${val === 1 ? "" : "s"} from deck or pool (${stageCount} stages)`);
        } else {
          addLog("Effect", `${artist.name}: 0 draws at ${stageCount} stages`);
        }
        return;
      }
      // "+N/N/N ticket(s)"
      const tixTriple = eff.match(/\+?(\d+)\s*\/\s*(\d+)\s*\/\s*(\d+)\s*ticket/i);
      if (tixTriple) {
        const val = parseInt([tixTriple[1], tixTriple[2], tixTriple[3]][idx]);
        if (val > 0) {
          logTicketGain(pid, val, `${artist.name} effect (${stageCount} stages)`);
          setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + val } }));
          addLog("Effect", `${artist.name}: +${val} 🎟️ (${stageCount} stage${stageCount === 1 ? "" : "s"})`);
          showFloatingBonus(`+${val} 🎟️`, "#fbbf24"); sfx.gainTickets();
        } else {
          addLog("Effect", `${artist.name}: 0 tickets at ${stageCount} stages`);
        }
        return;
      }
      addLog("Effect", `${artist.name}: [STAGES_321] pattern didn't match effect body — unhandled shape`);
      // Fall through if no triplet matched — allow standard handlers to run.
    }
    // Agent-conditional effects: trigger ONLY when booked via an agent AND the lobby toggle
    // is on. Built as a separate, simple parser since the agent effect strings are scoped
    // (we authored them) — no need for the full pattern-matching surface of the base effect.
    if (viaAgent && agentEffectsEnabledRef.current && artist.agentEffect) {
      const ae = artist.agentEffect.trim();
      const ael = ae.toLowerCase();
      const festival = players.find(p => p.id === pid)?.festivalName || "?";
      // Some agent effects say "+N VP at Year End" (Kendrick Lamar). The naive +VP regex
      // below would match those and fire immediately — wrong timing. Detect the "year end"
      // marker first, and if present, route to the year-end pending bucket instead so the
      // VP appears in the year-end summary alongside other year-end effects.
      const isYearEnd = /year\s*end/i.test(ae);
      // +N VP (year-end or immediate VP grant)
      const vpMatch = ae.match(/\+(\d+)\s*(?:VP|tickets?)/i);
      if (vpMatch) {
        const amount = parseInt(vpMatch[1]);
        if (isYearEnd) {
          // Defer: stash the artist name. The year-end builder reads agentBookedThisYear
          // and emits an autoVP entry for each on-stage artist found there.
          setAgentBookedThisYear(prev => {
            const list = prev[pid] || [];
            return { ...prev, [pid]: [...list, artist.name] };
          });
          addLog("🕵️ Agent Effect", `${artist.name}: +${amount} 🎟️ tickets queued for Year End (agent booking)`);
          showFloatingBonus(`+${amount} ⭐ at Year End!`, "#c4b5fd");
        } else {
          logTicketGain(pid, amount, `Agent: ${artist.name}`);
          setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + amount } }));
          addLog("🕵️ Agent Effect", `${artist.name}: +${amount} 🎟️ tickets (agent booking)`);
          showFloatingBonus(`+${amount} ⭐ Agent!`, "#c4b5fd");
        }
      }
      // +N Fame
      const fameMatch = ae.match(/\+(\d+)\s*Fame/i);
      if (fameMatch) {
        const amount = parseInt(fameMatch[1]);
        logFameGain(pid, amount, `Genre-match: ${artist.name}`);
        setPlayerData(p => ({ ...p, [pid]: { ...p[pid], baseFame: Math.min(FAME_MAX, (p[pid].baseFame || 0) + amount) } }));
        addLog("🕵️ Agent Effect", `${artist.name}: +${amount} 🔥 Fame (agent booking)`);
        showFloatingBonus(`+${amount} 🔥 Agent!`, "#f97316");
      }
      // +N Star Die
      const starMatch = ae.match(/\+(\d+)\s*star\s*di(e|ce)/i);
      if (starMatch) {
        const amount = parseInt(starMatch[1]);
        setPlayerData(p => ({ ...p, [pid]: { ...p[pid], heldDice: (p[pid].heldDice || 0) + amount } }));
        addLog("🕵️ Agent Effect", `${artist.name}: +${amount} Star Die${amount > 1 ? "s" : ""} (agent booking)`);
        showFloatingBonus(`+${amount} 🎲 Agent!`, "#fbbf24");
      }
      // +1 [amenity]. Place this turn — human picks which field; AI auto-picks via heuristic.
      const amenityMatch = ae.match(/\+1\s+(campsite|portaloo|security|catering)/i);
      if (amenityMatch) {
        const amenityType = amenityMatch[1].toLowerCase();
        const isAI = players.find(p => p.id === pid)?.isAI;
        if (isAI) {
          // AI: drop into a heuristic-picked field immediately
          const aiPd = playerDataRef.current?.[pid] || playerData[pid] || {};
          const fIdx = aiPickFieldForAmenity(aiPd, amenityType, year || 1);
          setPlayerData(p => ({ ...p, [pid]: mutateAmenity(p[pid], fIdx, amenityType, +1) }));
          addLog("🕵️ Agent Effect", `${artist.name}: +1 ${AMENITY_LABELS[amenityType]} → F${fIdx + 1} (AI agent booking)`);
        } else {
          // Human: queue a pending placement so they choose the field
          setPendingAgentAmenity(prev => [...prev, { pid, amenityType, artistName: artist.name }]);
          addLog("🕵️ Agent Effect", `${artist.name}: +1 ${AMENITY_LABELS[amenityType]} — choose a field`);
        }
        showFloatingBonus(`+1 ${AMENITY_ICONS[amenityType]} Agent!`, AMENITY_COLORS[amenityType]);
      }
      // Draw N artists from the deck
      const drawMatch = ae.match(/draw\s+(\d+)\s+artists?\s+from\s+the\s+deck/i);
      if (drawMatch) {
        const amount = parseInt(drawMatch[1]);
        // drawFromDeck(count) already returns an array of card objects. The previous
        // implementation called drawFromDeck() in a loop and pushed each return value
        // into `drawn`, which meant `drawn` was an array OF arrays — those then got
        // spread into the hand as nested arrays instead of artist objects, so cards
        // never appeared. One call with the count fixes it.
        const drawn = drawFromDeck(amount);
        if (drawn.length > 0) {
          setPlayerData(p => ({ ...p, [pid]: { ...p[pid], hand: [...(p[pid].hand || []), ...drawn] } }));
          addLog("🕵️ Agent Effect", `${artist.name}: drew ${drawn.length} artist${drawn.length > 1 ? "s" : ""} from deck (agent booking)`);
          showFloatingBonus(`+${drawn.length} 🎴 Agent!`, "#c4b5fd");
        }
      }
      setTimeout(() => recalcTickets(), 60);
    }

    if (!eff) return;
    const el = eff.toLowerCase();
    // For effects that are cumulative (VP, fame, tickets, events), apply `times` iterations
    // For interactive effects (sign, draw, place), scale the amount instead of looping
    for (let t = 0; t < times; t++) {
      // ═══════════════════════════════════════════════════════════
      // v184 — GUARD PHASE (moved from below for correct ordering)
      // All positional, die-removal, sacrifice, and Ms Banks guards must run
      // BEFORE any specific effect handlers (fame, ticket, VP, etc.) — otherwise
      // those handlers fire once here and again when the interactive picker's
      // accept flow fires the benefit, resulting in duplicate popups/logs.
      // Positional guards also need to fire early to prevent Horsegiirl/Peggy Gou/
      // Linkin Park/Chainsmokers/Fatboy Slim's ticket bonuses from firing on the
      // wrong slot via the specific +N handlers.
      // Guards use `continue` to skip the rest of the loop iteration when they
      // intercept. AI-only paths (auto-sacrifice inline) still work via their
      // branches inside the guard blocks.
      // ═══════════════════════════════════════════════════════════
      // ═══════════════════════════════════════════════════════════
      // v173 — POSITIONAL TRIGGERS (Electronic)
      // Electronic artists have effects that fire only when they occupy a specific
      // slot on the stage: opener (1st), middle (2nd), or headliner (3rd). slotCount
      // is 1/2/3 for those positions.
      //
      // Fatboy Slim is a compound positional effect — his card has THREE "If X" segments
      // with different ticket amounts per slot. Handle him separately, before the generic
      // single-slot guard runs.
      // ═══════════════════════════════════════════════════════════
      {
        const isFatboyCompound = el.includes("if opening set") && el.includes("if middle slot") && el.includes("if headliner");
        if (isFatboyCompound) {
          // Parse the three amounts. Expected format: "If Opening Set: +3 ... If Middle Slot: +4 ... If Headliner: +7 ..."
          const openerMatch = eff.match(/if opening set:\s*\+(\d+)/i);
          const middleMatch = eff.match(/if middle slot:\s*\+(\d+)/i);
          const headlinerMatch = eff.match(/if headliner:\s*\+(\d+)/i);
          let amt = 0;
          if (slotCount === 1 && openerMatch) amt = parseInt(openerMatch[1]);
          else if (slotCount === 2 && middleMatch) amt = parseInt(middleMatch[1]);
          else if (slotCount === 3 && headlinerMatch) amt = parseInt(headlinerMatch[1]);
          if (amt > 0) {
            logTicketGain(pid, amt, `${artist.name} (${slotCount === 1 ? "opener" : slotCount === 2 ? "middle" : "headliner"})`);
            setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + amt } }));
            addLog("Effect", `${artist.name} (${slotCount === 1 ? "opener" : slotCount === 2 ? "middle slot" : "headliner"}): +${amt} tickets`);
            showFloatingBonus(`+${amt} 🎟️`, "#fbbf24");
          }
          // Fatboy is fully resolved — skip the rest of the effect loop for this iteration
          continue;
        }
        // Single-slot guard: if the effect requires a specific slot and we're not in it,
        // abort the entire effect for this iteration (no linked benefit fires either).
        let requiredSlot = null;
        if (el.includes("if headliner")) requiredSlot = 3;
        else if (el.includes("if middle slot")) requiredSlot = 2;
        else if (el.includes("if opening set")) requiredSlot = 1;
        if (requiredSlot !== null && slotCount !== requiredSlot) {
          const slotName = requiredSlot === 1 ? "opener" : requiredSlot === 2 ? "middle slot" : "headliner";
          addLog("Effect", `${artist.name}: not the ${slotName} — effect does not fire`);
          continue;
        }
      }

      // ═══════════════════════════════════════════════════════════
      // v172 — CONDITIONAL DIE-REMOVAL GUARD
      // If the effect requires a specific die to be present in the amenity pool
      // ("Remove a X from the amenity dice") and that die is NOT present, abort the
      // entire effect for this iteration — no linked benefit fires either.
      //
      // v175: for HUMAN players, when a matching die IS present, intercept and show
      // a picker modal so the player can (a) choose WHICH matching die to remove and
      // (b) decline the removal entirely if the trade isn't worth it. AI keeps the
      // existing auto-remove-first-match behavior.
      // ═══════════════════════════════════════════════════════════
      {
        const currentDice = dice || [];
        let requiredFace = null;
        if (el.includes("remove a stage from the amenity dice")) requiredFace = "stage";
        else if (el.includes("remove a fame from the amenity dice")) requiredFace = "fame";
        else if (el.includes("remove a campsite from the amenity dice")) requiredFace = "campsite";
        else if (el.includes("remove an amenity from the amenity dice")
                 && !el.includes("campsite") && !el.includes("stage") && !el.includes("fame")) {
          // Non-specific — any amenity die (not fame, not stage) qualifies.
          requiredFace = "__anyAmenity__";
        }
        if (requiredFace) {
          // Parse the paired benefit ONCE — used in both branches (no match → offered
          // as the reward if reroll succeeds; has match → passed into the picker modal).
          let benefit = null;
          const fameMatch = eff.match(/\+(\d+)\s+Fame\b/i);
          const ticketMatch = eff.match(/\+(\d+)\s+ticket(?:\s+sales?|s?)?/i);
          if (el.includes("play another artist from your hand")) {
            benefit = { type: "chainPlay" };
          } else if (fameMatch) {
            benefit = { type: "fame", amount: parseInt(fameMatch[1]) };
          } else if (ticketMatch) {
            benefit = { type: "ticket", amount: parseInt(ticketMatch[1]) };
          }

          const has = requiredFace === "__anyAmenity__"
            ? currentDice.some(d => d !== "fame" && d !== "stage")
            : currentDice.some(d => d === requiredFace);
          if (!has) {
            const faceLabel = requiredFace === "__anyAmenity__" ? "amenity" : requiredFace;
            addLog("Effect", `${artist.name}: no ${faceLabel} die on the pool — effect does not fire`);
            // v177: for humans, surface this via an acknowledgment modal that shows
            // the current dice pool so the player can see what was (and wasn't) there.
            // v181: also include filterType and benefit so a reroll from the modal can
            // transition to the picker if the new roll has a matching die.
            const isAIcheck = players.find(p => p.id === pid)?.isAI;
            if (!isAIcheck) {
              setPendingEffect({
                type: "effectAborted",
                artistName: artist.name,
                reason: requiredFace === "__anyAmenity__"
                  ? "No amenity die (Campsite / Portaloo / Security / Catering) was in the shared pool."
                  : `No ${faceLabel === "fame" ? "🔥 Fame" : faceLabel === "stage" ? "🎪 Stage" : `${AMENITY_ICONS[faceLabel] || ""} ${AMENITY_LABELS[faceLabel] || faceLabel}`} die was in the shared pool.`,
                diceSnapshot: [...currentDice],
                filterType: requiredFace,
                benefit: benefit,
                hasRerolled: false,
              });
              setPendingEffectPid(pid);
            }
            continue;
          }
          // v175: die IS present. For humans, intercept and set a pending effect so
          // they can choose which matching die to remove (or decline the trade).
          // For AI, fall through — the specific die-removal handlers below will
          // auto-remove the first match and the paired benefit handlers will fire.
          const isAI = players.find(p => p.id === pid)?.isAI;
          if (!isAI) {
            setPendingEffect({
              type: "removeDieFromPool",
              artistName: artist.name,
              filterType: requiredFace,
              benefit: benefit,
              hasRerolled: false,
            });
            setPendingEffectPid(pid);
            addLog("Effect", `${artist.name}: choose a die to remove from the pool (or decline)`);
            continue; // Rest of the effect loop is skipped — pending flow handles benefit
          }
        }
      }

      // ═══════════════════════════════════════════════════════════
      // v177 — HUMAN INTERCEPT: "You may remove X" sacrifice effects
      // For Eve (catering), Missy Elliott (security), and De La Soul (any amenity),
      // route human players through an interactive picker so they choose which
      // amenity slot to sacrifice. On decline, no sacrifice and NO benefit fires.
      // AI keeps the inline auto-accept behavior in the sacrifice-patterns block
      // later in the loop.
      // Ms Banks is already handled separately (its 2-amenity variant lives below).
      // ═══════════════════════════════════════════════════════════
      {
        const isAIsac = players.find(p => p.id === pid)?.isAI;
        if (!isAIsac) {
          const pdSnap = playerDataRef.current?.[pid] || playerData[pid] || {};
          const am = pdSnap.amenities || {};
          // Eve: "may remove 1 catering" → +2 Fame + draw up to 2 from deck
          if (el.includes("may remove 1 catering")) {
            const total = am.catering || 0;
            if (total > 0) {
              setPendingEffect({
                type: "removeAmenities",
                artistName: artist.name,
                filterType: "catering",
                removalsRemaining: 1,
                benefit: { type: "fame", amount: 2, thenDrawDeck: 2 },
              });
              setPendingEffectPid(pid);
              addLog("Effect", `${artist.name}: choose a Catering Van to sacrifice (or decline)`);
            } else {
              setPendingEffect({
                type: "effectAborted",
                artistName: artist.name,
                reason: "You have no Catering Vans to sacrifice.",
              });
              setPendingEffectPid(pid);
            }
            continue;
          }
          // Missy Elliott: "may remove 1 security" → +5 tickets + draw 1 from pool
          if (el.includes("may remove 1 security")) {
            const total = am.security || 0;
            if (total > 0) {
              setPendingEffect({
                type: "removeAmenities",
                artistName: artist.name,
                filterType: "security",
                removalsRemaining: 1,
                benefit: { type: "ticket", amount: 5, thenDrawPool: 1 },
              });
              setPendingEffectPid(pid);
              addLog("Effect", `${artist.name}: choose a Security to sacrifice (or decline)`);
            } else {
              setPendingEffect({
                type: "effectAborted",
                artistName: artist.name,
                reason: "You have no Security to sacrifice.",
              });
              setPendingEffectPid(pid);
            }
            continue;
          }
          // De La Soul: "may remove 1 amenity of your choice" → +3 Fame
          // v197.22: also handles The Pharcyde: "may remove 1 amenity of your choice
          // from your festival. Gain 1 amenity of your choice." — a two-step compound
          // where the benefit isn't fame/tickets but a follow-up amenity-choice modal.
          // Detected by the presence of "gain 1 amenity" or "+1 amenity of your choice"
          // in the effect text. When detected, we chain the removeAmenities → placeAmenity
          // via the `followUp` field. Bug this fixes: the "+1 amenity"/"gain 1 amenity"
          // handler at line ~5947 sits OUTSIDE the times loop, so the `continue` here
          // only exits the loop — the outer handler still fires and OVERWRITES this
          // pendingEffect with a bare placeAmenity, dropping the remove step entirely.
          // Symptom: player got the "add amenity" modal but was never asked to remove one.
          if (el.includes("may remove 1 amenity of your choice")) {
            const total = (am.campsite || 0) + (am.security || 0) + (am.catering || 0) + (am.portaloo || 0);
            const isPharcyde = el.includes("gain 1 amenity of your choice") || el.includes("+1 amenity of your choice");
            if (isPharcyde) {
              if (total > 0) {
                setPendingEffect({
                  type: "removeAmenities",
                  artistName: artist.name,
                  filterType: null,
                  removalsRemaining: 1,
                  benefit: null, // no direct fame/ticket benefit — gain is the followUp
                  followUp: { type: "placeAmenity", artistName: artist.name, placeCount: 1 },
                });
                setPendingEffectPid(pid);
                addLog("Effect", `${artist.name}: choose 1 amenity to sacrifice, then choose 1 to gain (or decline the whole trade)`);
              } else {
                // No amenities to remove — skip the whole trade (the "may" makes it optional).
                setPendingEffect({
                  type: "effectAborted",
                  artistName: artist.name,
                  reason: "You have no amenities to sacrifice — the trade is skipped.",
                });
                setPendingEffectPid(pid);
              }
              continue;
            }
            if (total > 0) {
              setPendingEffect({
                type: "removeAmenities",
                artistName: artist.name,
                filterType: null, // any amenity
                removalsRemaining: 1,
                benefit: { type: "fame", amount: 3 },
              });
              setPendingEffectPid(pid);
              addLog("Effect", `${artist.name}: choose an amenity to sacrifice (or decline)`);
            } else {
              setPendingEffect({
                type: "effectAborted",
                artistName: artist.name,
                reason: "You have no amenities to sacrifice.",
              });
              setPendingEffectPid(pid);
            }
            continue;
          }
        }
      }
      // Ms Banks: "may remove 2 amenities of your choice"
      // v172: converted from auto-pick to interactive picker. Player selects which 2
      // amenity slots to sacrifice via a modal showing amenities per field. When both
      // are chosen, the chain-play (playFromHand) effect proceeds. If the player has
      // 0 amenities, the sacrifice is skipped and chain-play still fires (per spec).
      // AI: auto-picks the two most-abundant amenities (least painful loss).
      // v172: also respect the 2-play cap — if the player has already played 2 this
      // turn, the sacrifice+chain-play effect is skipped entirely (no cost, no benefit).
      if (el.includes("may remove 2 amenities of your choice")) {
        if ((playsThisTurnRef.current || 0) >= 2) {
          addLog("Effect", `${artist.name}: chain-play blocked (2-plays-per-turn cap) — sacrifice skipped`);
          continue;
        }
        const pdSnap = playerDataRef.current?.[pid] || playerData[pid] || {};
        const am = pdSnap.amenities || {};
        const totalAm = (am.campsite || 0) + (am.security || 0) + (am.catering || 0) + (am.portaloo || 0);
        const isAI = players.find(p => p.id === pid)?.isAI;
        if (totalAm === 0) {
          addLog("Effect", `${artist.name}: no amenities to sacrifice — proceeding to free chain-play`);
        } else if (isAI) {
          // AI: auto-pick (existing behavior)
          for (let i = 0; i < 2; i++) {
            const cur = playerDataRef.current?.[pid] || playerData[pid] || {};
            const camList = cur.amenities || {};
            const types = ["catering","security","portaloo","campsite"].filter(t => (camList[t] || 0) > 0);
            if (types.length === 0) break;
            types.sort((a, b) => (camList[b] || 0) - (camList[a] || 0));
            const chosen = types[0];
            const fields = cur.fields || [];
            const fIdx = fields.findIndex(f => (f?.[chosen] || 0) > 0);
            if (fIdx >= 0) {
              setPlayerData(p => ({ ...p, [pid]: mutateAmenity(p[pid], fIdx, chosen, -1) }));
              addLog("Effect", `${artist.name}: sacrificed 1 ${AMENITY_LABELS[chosen]} (${i+1}/2)`);
            }
          }
        } else {
          // Human: show a picker that consumes 2 removals, then chain-plays for free.
          // The playFromHand handler below will still fire because 'el.includes' still
          // matches — but we need to gate it so it doesn't fire immediately. We stash the
          // "free chain-play after removals" intent in the pendingEffect so the picker's
          // completion transitions to the play-from-hand step.
          setPendingEffect({
            type: "removeAmenities",
            artistName: artist.name,
            removalsRemaining: Math.min(2, totalAm),
            followUp: { type: "playFromHand", artistName: artist.name, free: true, suppressEffect: true },
          });
          setPendingEffectPid(pid);
          addLog("Effect", `${artist.name}: choose ${Math.min(2, totalAm)} amenit${Math.min(2, totalAm)===1?"y":"ies"} to sacrifice`);
          // Return early so the play-another handler below doesn't ALSO set a pending
          // effect — the picker's completion will set that follow-up itself.
          continue;
        }
      }

      // === Fame effects ===
      if (el.includes("+fame") || (el.includes("+1 fame") && !el.includes("fame if"))) {
        logFameGain(pid, 1, "Effect");
        setPlayerData(p => ({ ...p, [pid]: { ...p[pid], baseFame: Math.min(FAME_MAX, (p[pid].baseFame || 0) + 1) } }));
        addLog("Effect", `${artist.name}: +1 Fame`);
        showFloatingBonus("+1 🔥", "#f97316"); sfx.gainFame();
      }
      // "+1 Fame if you have played 2 [Genre] artists this year"
      if (el.includes("fame if you have played 2")) {
        const genreMatch = eff.match(/played 2 (\w+) artists/i);
        if (genreMatch) {
          const targetGenre = genreMatch[1];
          const pd = playerData[pid];
          const count = (pd.stageArtists || []).flat().filter(a => getGenres(a.genre).includes(targetGenre)).length;
          if (count >= 2) {
            logFameGain(pid, 1, `${artist.name} effect`);
            setPlayerData(p => ({ ...p, [pid]: { ...p[pid], baseFame: Math.min(FAME_MAX, (p[pid].baseFame || 0) + 1) } }));
            addLog("Effect", `${artist.name}: +1 Fame (2+ ${targetGenre} artists!)`);
            showFloatingBonus("+1 🔥", "#f97316"); sfx.gainFame();
          } else {
            addLog("Effect", `${artist.name}: Need 2 ${targetGenre} artists (have ${count})`);
          }
        }
      }
      // === VP effects ===
      if ((el.includes("+1 vp") || el.includes("+1vp")) && !el.includes("vp /") && !el.includes("vp per") && !el.includes("vp if")) {
        logTicketGain(pid, 0  /* TODO: fill in amount */, "Effect (uncategorized)");
        setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + 1 } }));
        addLog("Effect", `${artist.name}: +1 🎟️ ticket`); showFloatingBonus("+1 ⭐", "#c4b5fd");
      }
      if (el.includes("gain 1vp per existing campsite")) {
        const camps = (playerData[pid]?.amenities?.campsite) || 0;
        logTicketGain(pid, camps, `${artist.name} effect (per campsite)`);
        setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + camps } }));
        addLog("Effect", `${artist.name}: +${camps} 🎟️ tickets (1 per campsite)`);
      }
      // "+1 VP per other [Genre] act on this stage" (genre synergy)
      {
        const genreSynergyMatch = eff.match(/\+1 VP per other (\w+) (?:act|artist) on this stage/i);
        if (genreSynergyMatch && stageIdx >= 0) {
          const targetGenre = genreSynergyMatch[1];
          const stageArtists = (playerData[pid]?.stageArtists || [])[stageIdx] || [];
          const otherCount = stageArtists.filter(a => a.name !== artist.name && getGenres(a.genre).includes(targetGenre)).length;
          if (otherCount > 0) {
            logTicketGain(pid, otherCount, `${artist.name} effect (genre synergy)`);
            setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + otherCount } }));
            addLog("Effect", `${artist.name}: +${otherCount} 🎟️ tickets (${otherCount} other ${targetGenre} on stage)`);
            showFloatingBonus(`+${otherCount} ⭐`, "#c4b5fd");
          }
        }
      }
      // "+1 VP per other artist on all of your stages" (Prince)
      if (el.includes("vp per other artist on all")) {
        const totalOthers = (playerData[pid]?.stageArtists || []).flat().filter(a => a.name !== artist.name).length;
        if (totalOthers > 0) {
          logTicketGain(pid, totalOthers, `${artist.name} effect (per other artist)`);
          setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + totalOthers } }));
          addLog("Effect", `${artist.name}: +${totalOthers} 🎟️ tickets (${totalOthers} other artists on stages)`);
          showFloatingBonus(`+${totalOthers} ⭐`, "#c4b5fd");
        }
      }
      // "+1 VP per other [Genre] artist on this stage" variant (covers Pop/Rock/etc)
      {
        const popSynergyMatch = eff.match(/\+1 VP per other (\w+) act on this stage/i);
        // Already handled above — skip duplicate
      }
      // "Discard one artist from your hand to gain 3 tickets" (Teena Marie)
      if (el.includes("discard one artist from your hand to gain 3 tickets")) {
        setPendingEffect({ type: "discardHandForTickets", artistName: artist.name, discardCount: 1, ticketReward: 3 });
        setPendingEffectPid(pid);
        addLog("Effect", `${artist.name}: Discard 1 artist from hand for +3 tickets`);
      }
      // "Discard two artists from your hand to gain the ticket cost of one of them" (Rick James)
      if (el.includes("discard two artists from your hand to gain the ticket cost")) {
        setPendingEffect({ type: "discardHandForTicketValue", artistName: artist.name, discardCount: 2 });
        setPendingEffectPid(pid);
        addLog("Effect", `${artist.name}: Discard 2 artists, gain ticket value of one`);
      }
      // "Discard one amenity, gain 5 tickets" (Betty Davis)
      if (el.includes("discard one amenity") && el.includes("gain 5 tickets")) {
        setPendingEffect({ type: "discardAmenityForTickets", artistName: artist.name, ticketReward: 5 });
        setPendingEffectPid(pid);
        addLog("Effect", `${artist.name}: Discard 1 amenity for +5 tickets`);
      }
      // "Discard two artists from your hand, then draw the top artist from the deck and play it for free" (Silk Sonic)
      if (el.includes("discard two artists from your hand") && el.includes("play it for free")) {
        setPendingEffect({ type: "discardHandDrawFree", artistName: artist.name, discardCount: 2 });
        setPendingEffectPid(pid);
        addLog("Effect", `${artist.name}: Discard 2 artists, draw and play 1 for free!`);
      }
      // "Roll all amenity dice and gain 1 Fame if a Fame shows" (David Bowie)
      if (el.includes("roll all amenity dice") && el.includes("gain 1 fame if a fame shows")) {
        triggerDiceRoll(5, pid, artist.name,
          (results) => { const hasFame = results.some(d => d === "fame"); return hasFame ? "🔥 Fame shown! +1 Fame" : "No fame shown"; },
          (results) => { if (results.some(d => d === "fame")) { logFameGain(pid, 1, `${artist.name} dice roll (Fame)`); setPlayerData(p => ({ ...p, [pid]: { ...p[pid], baseFame: Math.min(FAME_MAX, (p[pid].baseFame || 0) + 1) } })); showFloatingBonus("+1 🔥", "#f97316"); } setTimeout(() => recalcTickets(), 50); }
        );
      }
      // v163: "draw an artist objective" (Missy Elliott) — the objective system was
      // removed; the effect is a no-op now. Kept the -2 VP so the artist still has cost.
      if (el.includes("draw an artist objective")) {
        addLog("Effect", `${artist.name}: (no-op — objective system removed)`);
      }
      // === -VP effects (Hip Hop risk/reward) ===
      // "-X VP" — generic VP loss patterns
      {
        const vpLossMatch = eff.match(/-(\d+)\s*(?:VP|tickets?)/i);
        if (vpLossMatch) {
          const vpLoss = parseInt(vpLossMatch[1]);
          logTicketGain(pid, -vpLoss, `${artist.name} effect (cost)`);
          setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: Math.max(0, (p[pid].bonusTickets || 0) - vpLoss) } }));
          addLog("Effect", `${artist.name}: -${vpLoss} 🎟️ tickets`);
          showFloatingBonus(`-${vpLoss} ⭐`, "#ef4444");
        }
      }
      // "Sell X tickets" — bonus tickets from -VP effects
      {
        const sellMatch = eff.match(/[Ss]ell\s+(\d+)\s+tickets?/i);
        if (sellMatch) {
          const tix = parseInt(sellMatch[1]);
          logTicketGain(pid, -vpLoss, `${artist.name} effect (cost)`);
          setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + tix } }));
          addLog("Effect", `${artist.name}: +${tix} ticket sales`);
          showFloatingBonus(`+${tix} 🎟️`, "#fbbf24");
        }
      }
      // "+1 ticket / 2 amenities" (Flume)
      if (el.includes("ticket / 2 amenities") || el.includes("ticket/ 2 amenities")) {
        const am = playerData[pid]?.amenities || {};
        const amCount = (am.campsite || 0) + (am.security || 0) + (am.catering || 0) + (am.portaloo || 0);
        const tix = Math.floor(amCount / 2);
        if (tix > 0) {
          logTicketGain(pid, tix, `${artist.name} effect (per 2 amenities)`);
          setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + tix } }));
          addLog("Effect", `${artist.name}: +${tix} tickets (1 per 2 amenities)`);
          showFloatingBonus(`+${tix} 🎟️`, "#fbbf24");
        }
      }
      // "+1 Fame if you have played 2 artists of either X or Y" (Charli XCX)
      if (el.includes("fame if you have played 2 artists of either")) {
        const genreMatch = eff.match(/either (\w+) or (\w+)/i);
        if (genreMatch) {
          const pd = playerData[pid];
          const booked = (pd.stageArtists || []).flat();
          const count = booked.filter(a => getGenres(a.genre).includes(genreMatch[1]) || getGenres(a.genre).includes(genreMatch[2])).length;
          if (count >= 2) {
            logFameGain(pid, 1, `${artist.name} effect`);
            setPlayerData(p => ({ ...p, [pid]: { ...p[pid], baseFame: Math.min(FAME_MAX, (p[pid].baseFame || 0) + 1) } }));
            addLog("Effect", `${artist.name}: +1 Fame (2+ ${genreMatch[1]}/${genreMatch[2]} artists!)`);
            showFloatingBonus("+1 🔥", "#f97316"); sfx.gainFame();
          } else {
            addLog("Effect", `${artist.name}: Need 2 ${genreMatch[1]}/${genreMatch[2]} artists (have ${count})`);
          }
        }
      }
      // "for X Fame" — gain fame as part of VP trade (Loyle Carner "-2 VP for 1 Fame")
      {
        const forFameMatch = eff.match(/for (\d+) Fame/i);
        if (forFameMatch && el.includes("-") && el.includes("vp")) {
          const fameGain = parseInt(forFameMatch[1]);
          logFameGain(pid, 1, "Effect");
          setPlayerData(p => ({ ...p, [pid]: { ...p[pid], baseFame: Math.min(FAME_MAX, (p[pid].baseFame || 0) + fameGain) } }));
          addLog("Effect", `${artist.name}: +${fameGain} Fame`);
          showFloatingBonus(`+${fameGain} 🔥`, "#f97316"); sfx.gainFame();
        }
      }
      // "Roll 1 amenity dice and gain 1 Fame for each Fame shown" (Loyle Carner)
      if (el.includes("roll 1 amenity dice") || el.includes("roll 1 amenity die")) {
        triggerDiceRoll(1, pid, artist.name, "+1 Fame per Fame shown",
          (results) => { const fameCount = results.filter(d => d === "fame").length; if (fameCount > 0) { logFameGain(pid, fameCount, `${artist.name} dice roll (Fame)`); setPlayerData(p => ({ ...p, [pid]: { ...p[pid], baseFame: Math.min(FAME_MAX, (p[pid].baseFame || 0) + fameCount) } })); showFloatingBonus(`+${fameCount} 🔥`, "#f97316"); } setTimeout(() => recalcTickets(), 50); }
        );
      }
      // === Ticket effects ===
      if (el.includes("+4 ticket sales")) {
        logTicketGain(pid, 4, `${artist.name} effect (+4)`);
        setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + 4 } }));
        addLog("Effect", `${artist.name}: +4 ticket sales`); showFloatingBonus("+4 🎟️", "#fbbf24");
        // v197: previous v193 Lady Gaga viaTempt +3 hack removed. Her new effect uses
        // [HIGHEST_FAME] prefix + "+2 per lower fame artist" mechanic, handled at the top
        // of applyEffect. The base "+4 ticket sales" match no longer applies to Gaga since
        // her effect string no longer contains that substring.
      }
      if (el.includes("+5 ticket sales")) {
        logTicketGain(pid, 4, `${artist.name} effect (+4)`);
        setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + 5 } }));
        addLog("Effect", `${artist.name}: +5 ticket sales`); showFloatingBonus("+5 🎟️", "#fbbf24");
      }
      // "+1 ticket sale for all players"
      if (el.includes("ticket sale for all players") || el.includes("ticket sales for all players")) {
        players.forEach(p => {
          logTicketGain(p.id, 1, `${artist.name} effect (all players)`);
          setPlayerData(prev => ({ ...prev, [p.id]: { ...prev[p.id], bonusTickets: (prev[p.id].bonusTickets || 0) + 1 } }));
        });
        addLog("Effect", `${artist.name}: +1 ticket for ALL players!`);
        showFloatingBonus("+1 🎟️ all!", "#fbbf24");
      }
      // "Gain an artist from the pool who's Fame cost is lower than this artist"
      // (Sly & The Family Stone, Teena Marie). Auto-picks the highest-value eligible artist
      // — pool card gets moved to the player's hand. No effect if pool has no eligible artists.
      // v186: exclude tempt/agent-protected artists — an artist another player (or the
      // player themselves) has tempted is locked in until the contest resolves, and
      // cannot be snatched via a pool-grab effect.
      if (el.includes("artist from the pool who") || el.includes("pool who's fame cost is lower") || el.includes("pool whose fame cost is lower")) {
        const protectedNames = getAgentProtectedNames();
        const eligible = artistPool
          .filter(a => (a.fame || 0) < (artist.fame || 0))
          .filter(a => !protectedNames.has(a.name))
          .map(a => ({ a, score: (a.tickets || 0) + (a.vp || 0) }))
          .sort((x, y) => y.score - x.score);
        if (eligible.length > 0) {
          const chosen = eligible[0].a;
          setArtistPool(prev => { const np = [...prev]; const idx = np.findIndex(a => a.name === chosen.name); if (idx >= 0) np.splice(idx, 1); return np; });
          setPlayerData(p => ({ ...p, [pid]: { ...p[pid], hand: [...(p[pid].hand || []), chosen] } }));
          addLog("Effect", `${artist.name}: gained ${chosen.name} from the pool (lower Fame)`);
          setLastActionFor(pid, `pulled ${chosen.name} from the pool (${artist.name} effect)`);
          showFloatingBonus(`🎁 ${chosen.name} to hand`, "#c4b5fd");
        } else {
          addLog("Effect", `${artist.name}: no eligible lower-Fame artist in pool (tempted artists excluded)`);
        }
      }
      // "+1 ticket sale / Current Fame Level"
      if (el.includes("ticket sale / current fame") || el.includes("ticket / current fame")) {
        const fame = playerData[pid]?.fame || 0;
        if (fame > 0) {
          logTicketGain(pid, fame, `${artist.name} effect (per Fame Level)`);
          setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + fame } }));
          addLog("Effect", `${artist.name}: +${fame} tickets (1 per Fame level)`);
          showFloatingBonus(`+${fame} 🎟️`, "#fbbf24");
        }
      }
      // "+1 ticket / Negative Star Face avoided this year" (rethemed from event)
      if (el.includes("ticket / negative event this year") || el.includes("ticket / negative event") || el.includes("ticket / negative star")) {
        const avoidedCount = negStarFacesAvoidedThisYear[pid] || 0;
        if (avoidedCount > 0) {
          logTicketGain(pid, avoidedCount, `${artist.name} effect (avoided stars)`);
          setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + avoidedCount } }));
          addLog("Effect", `${artist.name}: +${avoidedCount} tickets (1 per neg. star avoided)`);
          showFloatingBonus(`+${avoidedCount} 🎟️`, "#fbbf24");
        }
      }
      // "+1 ticket / amenity adjacent to this artist's stage" (CHVRCHES, Peggy Gou)
      if (el.includes("ticket / amenity adjacent") || el.includes("ticket/ amenity adjacent")) {
        const pd = playerData[pid];
        const am = pd.amenities || {};
        // Total amenities the player has built (no longer spatial — flat sum)
        const adjCount = (am.campsite || 0) + (am.security || 0) + (am.catering || 0) + (am.portaloo || 0);
        if (adjCount > 0) {
          logTicketGain(pid, adjCount, `${artist.name} effect (per amenity)`);
          setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + adjCount } }));
          addLog("Effect", `${artist.name}: +${adjCount} tickets (per amenity)`);
          showFloatingBonus(`+${adjCount} 🎟️`, "#fbbf24");
        }
      }
      // v137: Chainsmokers — "+1 ticket for each amenity on the field that has the highest
      // number of amenities". Finds the fullest field, awards tickets equal to that field's
      // total amenity count. Distinct from CHVRCHES/Peggy Gou which use total amenities.
      if (el.includes("field that has the highest number of amenities") || el.includes("highest number of amenities")) {
        const pd = playerData[pid];
        const fields = pd.fields || [];
        let maxCount = 0;
        fields.forEach(f => {
          const total = (f.campsite || 0) + (f.security || 0) + (f.catering || 0) + (f.portaloo || 0);
          if (total > maxCount) maxCount = total;
        });
        if (maxCount > 0) {
          logTicketGain(pid, maxCount, `${artist.name} effect (highest field)`);
          setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + maxCount } }));
          addLog("Effect", `${artist.name}: +${maxCount} tickets (from your fullest field)`);
          showFloatingBonus(`+${maxCount} 🎟️`, "#fbbf24");
        }
      }
      // === +1 Star Die — claim 1 die from the pool to this player ===
      if (el.includes("+1 star die") || el.includes("+1 star dice")) {
        const currentPool = dicePoolRef.current;
        if (currentPool > 0) {
          setDicePool(currentPool - 1);
          setPlayerData(p => ({ ...p, [pid]: { ...p[pid], heldDice: (p[pid].heldDice || 0) + 1 } }));
          addLog("Effect", `${artist.name}: +1 🎲 Star Die (${currentPool - 1} left in pool)`);
          showFloatingBonus("+1 🎲 Star Die!", "#fbbf24");
        } else {
          addLog("Effect", `${artist.name}: would grant +1 Star Die, but pool is empty`);
        }
      }
      // v140: "Choose an indie artist from the artist pool, if there is one."
      // Fires as a BASE effect for Djo, Two Door Cinema Club, The Kooks. The same string
      // also lives on Suki Waterhouse's genreMatchEffect, handled by applyGenreMatchEffect
      // separately (both parsers are needed). For AI: auto-take highest-fame Indie in the
      // pool. For humans: open a picker modal.
      // v186: exclude tempt/agent-protected artists from both AI auto-pick and the
      // human picker options.
      if ((el.includes("indie artist from the artist pool") || el.includes("indie artist from the pool")) && !el.includes("if you have")) {
        const protectedNames = getAgentProtectedNames();
        const indieIdxes = artistPool.map((a, i) => (getGenres(a.genre).includes("Indie") && !protectedNames.has(a.name)) ? i : -1).filter(i => i >= 0);
        if (indieIdxes.length === 0) {
          addLog("Effect", `${artist.name}: no eligible Indie artist in the pool (tempted artists excluded)`);
        } else {
          const player = players.find(pl => pl.id === pid);
          if (player?.isAI) {
            // AI: pick highest-fame indie (proxy for most valuable)
            const bestIdx = indieIdxes.reduce((best, i) => (artistPool[i].fame > artistPool[best].fame ? i : best), indieIdxes[0]);
            const chosen = artistPool[bestIdx];
            setArtistPool(prev => { const np = [...prev]; np.splice(bestIdx, 1); return np; });
            setPlayerData(p => ({ ...p, [pid]: { ...p[pid], hand: [...(p[pid].hand || []), chosen] } }));
            addLog("Effect", `${artist.name}: took ${chosen.name} into hand`);
            setLastActionFor(pid, `pulled ${chosen.name} from the pool (${artist.name} effect)`);
          } else {
            // Human: queue a picker modal. Uses the same pendingEffect scaffold so the UI
            // that resolves it lives alongside other effect modals.
            setPendingEffect({ type: "pickIndieFromPool", artistName: artist.name, indieOptions: indieIdxes.map(i => artistPool[i].name) });
            setPendingEffectPid(pid);
          }
        }
      }
      // === Event-draw effects (retired with the event system) — no-ops kept for log clarity ===
      if (el.includes("+1 negative personal event") || el.includes("+1 negative global event") ||
          (el.includes("+1 global event") && !el.includes("negative")) ||
          (el.includes("+1 event") && !el.includes("personal") && !el.includes("negative") && !el.includes("global"))) {
        addLog("Effect", `${artist.name}: (event-draw effect retired)`);
      }

      // === All players draw ===
      if (el.includes("all players draw 1 artist")) {
        const allDrawn = drawFromDeck(players.length);
        players.forEach((p, i) => {
          if (i < allDrawn.length) {
            setPlayerData(prev => ({ ...prev, [p.id]: { ...prev[p.id], hand: [...(prev[p.id].hand || []), allDrawn[i]] } }));
            addLog("Effect", `${artist.name}: ${p.festivalName} drew ${allDrawn[i].name}`);
          }
        });
        showFloatingBonus("🃏 All draw!", "#c4b5fd");
      }

      // ═══════════════════════════════════════════════════════════
      // v169 — NEW EFFECT PATTERNS (Pop / Rock / Hip Hop deck refresh)
      // ═══════════════════════════════════════════════════════════

      // --- General +N Fame handler (catches "+2 Fame", "+3 Fame", etc.) ---
      // Skips if the effect already matched the "+1 fame" specific handler above
      // (which fires only for +1). Also skips "fame if" gated conditions.
      if (!el.includes("+1 fame") && !el.includes("fame if")) {
        const fm = eff.match(/\+(\d+)\s+Fame\b/i);
        if (fm) {
          const amt = parseInt(fm[1]);
          logFameGain(pid, amt, `${artist.name} effect`);
          setPlayerData(p => ({ ...p, [pid]: { ...p[pid], baseFame: Math.min(FAME_MAX, (p[pid].baseFame || 0) + amt) } }));
          addLog("Effect", `${artist.name}: +${amt} Fame`);
          showFloatingBonus(`+${amt} 🔥`, "#f97316"); sfx.gainFame();
        }
      }

      // --- General +N ticket sales handler for values not already handled (+4/+5 specific above) ---
      // Excludes: "for all players" (handled separately above), year-end scalers, per-X scalers
      // v197.4: unified ticket handler — was previously gated with "+4 ticket sales" /
      // "+5 ticket sales" exclusions to avoid double-firing with legacy specific handlers.
      // Under the v197 deck, artists use "+N ticket(s)" (not "sales"), so the specific
      // handlers at ~5179/5188 no longer match, and the exclusions block legitimate +4
      // (e.g., "+4 ticket(s) per lower...") and +5 (Missy Elliott's "+5 ticket(s)") fires.
      // Removed the specific-handler exclusions here; those handlers are inert dead code
      // for the current deck. The [HIGHEST_FAME] handler already consumes Lady Gaga's
      // per-lower-fame multiplier before this generic block runs, so no double-fire risk.
      if (!el.includes("for all players")
          && !el.includes("year end")
          && !el.includes("for every")
          && !el.includes("for each")
          && !el.includes(" per ")) {
        const tm = eff.match(/\+(\d+)\s+ticket(?:\s+sales?|s?)?/i);
        if (tm) {
          const amt = parseInt(tm[1]);
          logTicketGain(pid, amt, `${artist.name} effect (+${amt})`);
          setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + amt } }));
          addLog("Effect", `${artist.name}: +${amt} ticket sales`);
          showFloatingBonus(`+${amt} 🎟️`, "#fbbf24");
        }
      }

      // --- "Draw 2 artists from the deck or pool" (Maroon 5 tempt, The Darkness, Arctic Monkeys) ---
      // v172: converted from auto-draw to interactive picker. Player picks each of the 2
      // cards individually from either the pool (visible artists) or the deck (blind draw).
      // AI: picks best pool artist twice, or draws from deck when pool is thin.
      if (el.includes("draw 2 artists from the deck or pool")) {
        setPendingEffect({
          type: "drawFromPoolOrDeck",
          artistName: artist.name,
          drawsRemaining: 2,
        });
        setPendingEffectPid(pid);
        addLog("Effect", `${artist.name}: draw 2 artists from the deck or pool`);
      }

      // --- "Play another artist from your hand" (Sadchild, Lil Angry, Wolf Alice, Rage, Ms Banks, Clairo tempt) ---
      // v170: capped at 2 plays per turn total. If the player has already played 2 artists
      // this turn (e.g., they normal-played, then chain-played, and the SECOND artist also
      // has a chain-play effect), the third chain is blocked — no cascade.
      // Ms Banks variant: "for free. Their effect does not activate" — mark to skip effect + bypass costs.
      if (el.includes("play another artist from your hand")) {
        const playsSoFar = playsThisTurnRef.current || 0;
        if (playsSoFar >= 2) {
          addLog("Effect", `${artist.name}: chain-play blocked (2-plays-per-turn cap reached)`);
        } else {
          const isFree = el.includes("for free") && el.includes("effect does not activate");
          setPendingEffect({
            type: "playFromHand",
            artistName: artist.name,
            free: isFree,
            suppressEffect: isFree,
          });
          setPendingEffectPid(pid);
          addLog("Effect", `${artist.name}: play another artist from your hand${isFree ? " for free (effect suppressed)" : ""}`);
        }
      }

      // --- "Draw up to N artists from the deck" (Eve compound) ---
      if (el.includes("draw up to 2 artists from the deck")) {
        // Non-interactive: just draw 2. "Up to" is a hint to the human but functionally we draw all we can.
        const drawn = drawFromDeck(2);
        if (drawn.length > 0) {
          setPlayerData(p => ({ ...p, [pid]: { ...p[pid], hand: [...(p[pid].hand || []), ...drawn] } }));
          addLog("Effect", `${artist.name}: drew ${drawn.length} artist${drawn.length === 1 ? "" : "s"}`);
          setLastActionFor(pid, `drew ${drawn.length} artist${drawn.length === 1 ? "" : "s"} from deck (${artist.name} effect)`);
          showFloatingBonus(`+${drawn.length} 🎴`, "#c4b5fd");
        }
      }

      // --- "Draw 1 artist from the pool" (Missy Elliott compound) ---
      if (el.includes("draw 1 artist from the pool") || el.includes("draw 1 from the pool")) {
        const currentPool = artistPoolRef.current || artistPool;
        if (currentPool.length > 0) {
          const idx = Math.floor(Math.random() * currentPool.length);
          const drawn = currentPool[idx];
          const newPool = [...currentPool]; newPool.splice(idx, 1); setArtistPool(newPool);
          setPlayerData(p => ({ ...p, [pid]: { ...p[pid], hand: [...(p[pid].hand || []), drawn] } }));
          addLog("Effect", `${artist.name}: drew ${drawn.name} from pool`);
          setLastActionFor(pid, `pulled ${drawn.name} from the pool (${artist.name} effect)`);
          showFloatingBonus(`+1 🎴 from pool!`, "#c4b5fd");
        }
      }

      // --- Dice manipulation (Rock): "Remove X from the amenity dice (if available)" ---
      // Beababdoobee: remove fame die → the +1 Fame is already handled by the general +N Fame above.
      // No Doubt: remove any 1 amenity die → +1 ticket already handled.
      // Heart: remove a campsite die → +2 tickets already handled.
      // Rage Against: remove a stage die → play-another already handled.
      if (el.includes("remove a fame from the amenity dice")) {
        setDice(prev => {
          const idx = prev.findIndex(d => d === "fame");
          if (idx >= 0) {
            const nd = [...prev]; nd.splice(idx, 1);
            addLog("Effect", `${artist.name}: removed a 🔥 Fame die from the pool`);
            showFloatingBonus("🔥 die removed", "#f97316");
            return nd;
          }
          addLog("Effect", `${artist.name}: no Fame die on the pool to remove`);
          return prev;
        });
      }
      if (el.includes("remove a campsite from the amenity dice")) {
        setDice(prev => {
          const idx = prev.findIndex(d => d === "campsite");
          if (idx >= 0) {
            const nd = [...prev]; nd.splice(idx, 1);
            addLog("Effect", `${artist.name}: removed a ⛺ Campsite die from the pool`);
            showFloatingBonus("⛺ die removed", "#4ade80");
            return nd;
          }
          addLog("Effect", `${artist.name}: no Campsite die on the pool to remove`);
          return prev;
        });
      }
      if (el.includes("remove a stage from the amenity dice")) {
        setDice(prev => {
          const idx = prev.findIndex(d => d === "stage");
          if (idx >= 0) {
            const nd = [...prev]; nd.splice(idx, 1);
            addLog("Effect", `${artist.name}: removed a 🎪 Stage die from the pool`);
            showFloatingBonus("🎪 die removed", "#4ade80");
            return nd;
          }
          addLog("Effect", `${artist.name}: no Stage die on the pool to remove`);
          return prev;
        });
      }
      // "Remove an amenity from the amenity dice" — non-specific, remove any amenity die.
      // Match this AFTER the specific variants to avoid double-firing.
      if (el.includes("remove an amenity from the amenity dice")
          && !el.includes("campsite") && !el.includes("stage") && !el.includes("fame")) {
        setDice(prev => {
          const idx = prev.findIndex(d => d !== "fame" && d !== "stage");
          if (idx >= 0) {
            const nd = [...prev]; nd.splice(idx, 1);
            addLog("Effect", `${artist.name}: removed a ${prev[idx]} die from the pool`);
            showFloatingBonus("die removed", "#c4b5fd");
            return nd;
          }
          return prev;
        });
      }

      // --- Amenity self-sacrifice (Hip Hop): "You may remove X of your choice from your festival" ---
      // For now: auto-accept the trade if the player has ≥1 of the specified amenity type.
      // The benefit (fame/tickets/draw) fires via the general handlers above regardless.
      // Ms Banks (2 amenities) matched separately below.
      const sacrificePatterns = [
        { pat: "may remove 1 catering", type: "catering" },
        { pat: "may remove 1 security", type: "security" },
        { pat: "may remove 1 campsite", type: "campsite" },
        { pat: "may remove 1 portaloo", type: "portaloo" },
      ];
      for (const sp of sacrificePatterns) {
        if (el.includes(sp.pat)) {
          const pdSnap = playerDataRef.current?.[pid] || playerData[pid] || {};
          const total = (pdSnap.amenities?.[sp.type]) || 0;
          if (total > 0) {
            // Find the first field with this amenity and decrement
            const fields = pdSnap.fields || [];
            const fIdx = fields.findIndex(f => (f?.[sp.type] || 0) > 0);
            if (fIdx >= 0) {
              setPlayerData(p => ({ ...p, [pid]: mutateAmenity(p[pid], fIdx, sp.type, -1) }));
              addLog("Effect", `${artist.name}: sacrificed 1 ${AMENITY_LABELS[sp.type]}`);
              showFloatingBonus(`-1 ${AMENITY_ICONS[sp.type]}`, "#dc2626");
            }
          } else {
            addLog("Effect", `${artist.name}: no ${AMENITY_LABELS[sp.type]} to sacrifice`);
          }
          break; // only one sacrifice type per artist
        }
      }
      // Generic "may remove 1 amenity of your choice" (De La Soul, Missy Elliott general) — pick highest
      // v197.22: also handles The Pharcyde ("...remove 1 amenity...gain 1 amenity").
      // Auto-remove the least-painful amenity (most abundant), then fire the placeAmenity
      // pending effect so the AI proceeds to place a new amenity. The outer generic
      // "+1 amenity"/"gain 1 amenity" handler explicitly skips when "may remove" is
      // present (see comment there), so we need to fire it manually here for Pharcyde.
      if (el.includes("may remove 1 amenity of your choice")) {
        const pdSnap = playerDataRef.current?.[pid] || playerData[pid] || {};
        const am = pdSnap.amenities || {};
        const types = ["catering","security","portaloo","campsite"].filter(t => (am[t] || 0) > 0);
        const isPharcyde = el.includes("gain 1 amenity of your choice") || el.includes("+1 amenity of your choice");
        if (types.length > 0) {
          // Pick the type with the most (most abundant → least painful to lose)
          types.sort((a, b) => (am[b] || 0) - (am[a] || 0));
          const chosen = types[0];
          const fields = pdSnap.fields || [];
          const fIdx = fields.findIndex(f => (f?.[chosen] || 0) > 0);
          if (fIdx >= 0) {
            setPlayerData(p => ({ ...p, [pid]: mutateAmenity(p[pid], fIdx, chosen, -1) }));
            addLog("Effect", `${artist.name}: sacrificed 1 ${AMENITY_LABELS[chosen]}`);
            showFloatingBonus(`-1 ${AMENITY_ICONS[chosen]}`, "#dc2626");
          }
          if (isPharcyde) {
            setPendingEffect({ type: "placeAmenity", artistName: artist.name, placeCount: 1 });
            setPendingEffectPid(pid);
            addLog("Effect", `${artist.name}: gain 1 amenity of your choice (Pharcyde chain)`);
          }
        } else if (isPharcyde) {
          // No amenities to sacrifice — trade skipped (the "may" makes it optional and
          // the gain step is conditional on the sacrifice happening).
          addLog("Effect", `${artist.name}: no amenity to sacrifice — trade skipped`);
        }
      }

      // --- Eminem: fame-inherited tickets from previous player's last artist ---
      if (el.includes("previous player played an artist") || el.includes("previous player played artist")) {
        if (prevArtist && prevArtistPid !== null && prevArtistPid !== pid) {
          const prevFame = prevArtist.fame || 0;
          const payoutTable = [0, 1, 2, 4, 7, 10];
          const payout = payoutTable[Math.min(5, Math.max(0, prevFame))];
          if (payout > 0) {
            logTicketGain(pid, payout, `${artist.name} (inherited from ${prevArtist.name} F${prevFame})`);
            setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + payout } }));
            addLog("Effect", `${artist.name}: inherited +${payout} tickets from ${prevArtist.name} (Fame ${prevFame})`);
            showFloatingBonus(`+${payout} 🎟️ inherit!`, "#a855f7");
          } else {
            addLog("Effect", `${artist.name}: previous artist was Fame 0 — no ticket inheritance`);
          }
        } else {
          addLog("Effect", `${artist.name}: no previous player artist — effect fires blank`);
        }
      }
    }
    // Interactive effects — scale by times instead of looping (setPendingEffect can only hold one)
    if (el.includes("+1 security") && el.includes("place")) {
      setPendingEffect({ type: "placeSpecific", amenityType: "security", artistName: artist.name, placeCount: times });
      setPendingEffectPid(pid);
      addLog("Effect", `${artist.name}: +${times} Security — place on your board!`);
    } else if (el.includes("+1 security")) {
      setPendingEffect({ type: "placeSpecific", amenityType: "security", artistName: artist.name, placeCount: times });
      setPendingEffectPid(pid);
      addLog("Effect", `${artist.name}: +${times} Security — place on your board!`);
    }
    // v197.22: SKIP when effect also has "may remove" — that's Pharcyde ("...remove 1
    // amenity...Gain 1 amenity..."), which is fully handled elsewhere:
    //   - Human: intercept at ~line 5295 sets removeAmenities with followUp: placeAmenity
    //   - AI: handler at ~line 5900 auto-removes, then fires placeAmenity via the same
    //     pharcyde-detect branch (added below).
    // Without this skip, the outer setPendingEffect(placeAmenity) here OVERWRITES the
    // intercept's removeAmenities modal for humans, so the player never sees the remove
    // prompt — they just get the "add amenity" modal directly. Bug this fixes.
    if ((el.includes("+1 amenity") || el.includes("gain 1 amenity")) && !el.includes("may remove")) {
      setPendingEffect({ type: "placeAmenity", artistName: artist.name, placeCount: times });
      setPendingEffectPid(pid);
      addLog("Effect", `${artist.name}: +${times} Amenity — choose and place!`);
    }
    if (el.includes("sign 1 artist") || el.includes("sign one artist")) {
      // Headliner: sign `times` artists (draw times cards from pool/deck)
      setPendingEffect({ type: "signArtist", artistName: artist.name, canRefresh: el.includes("refresh"), signCount: times });
      setPendingEffectPid(pid);
      addLog("Effect", `${artist.name}: Sign ${times} artist${times > 1 ? "s" : ""} from pool or deck!`);
    }
    if (el.includes("draw two artists")) {
      // Headliner: draw 2*times, pick times to keep
      const drawCount = 2 * times;
      const drawn = drawFromDeck(drawCount);
      if (drawn.length > 0) {
        setPendingEffect({ type: "pickFromDrawn", drawn, artistName: artist.name, keepCount: times });
        setPendingEffectPid(pid);
        addLog("Effect", `${artist.name}: Drew ${drawn.length} artists — pick ${times} to keep!`);
      }
    }
    if (el.includes("immediately book another")) {
      // "Immediately book another Indie or Rock artist" (The Cure). This is a bonus
      // BOOKING (play to a stage), not a sign-to-hand. Parse the genre restriction and
      // route to the bonusBookGenre pending effect, which lets the player pick an eligible
      // artist (from hand or pool, matching genre + affordable) and then choose a stage.
      const genres = [];
      ALL_GENRES.forEach(g => { if (el.includes(g.toLowerCase())) genres.push(g); });
      setPendingEffect({ type: "bonusBookGenre", artistName: artist.name, genres, bookCount: times, selectedBonus: null });
      setPendingEffectPid(pid);
      addLog("Effect", `${artist.name}: Immediately book another ${genres.length ? genres.join(" or ") + " " : ""}artist!`);
    }
    if (el.includes("year end")) {
      addLog("Effect", `${artist.name}: ${eff} (triggers at year end)`);
    }
    // Dice roll effects — "Roll X dice" or "Roll all" patterns
    // Skip year-end effects (handled in beginRoundEnd) and Loyle Carner (handled above)
    if (!el.includes("year end") && !el.includes("roll 1 amenity dic") && !el.includes("gain 1 fame if a fame shows")) {
      let rollMatch = el.match(/roll (\d+)\s+(?:amenity\s+)?dice/);
      if (!rollMatch && el.includes("roll all")) rollMatch = [null, "5"]; // "Roll all" = Roll 5
      if (rollMatch) {
        const rollCount = parseInt(rollMatch[1]);
        if (el.includes("each fame") && el.includes("ticket")) {
          triggerDiceRoll(rollCount, pid, artist.name,
            (results) => { const fameCount = results.filter(d => d === "fame").length; return `🔥 ${fameCount} Fame dice = +${fameCount * 2} tickets`; },
            (results) => { const fameCount = results.filter(d => d === "fame").length; if (fameCount > 0) { logTicketGain(pid, fameCount * 2, `${artist.name} dice roll (Fame)`); setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + fameCount * 2 } })); showFloatingBonus(`+${fameCount * 2} 🎟️`, "#fbbf24"); } setTimeout(() => recalcTickets(), 50); }
          );
        } else if (el.includes("most common") || el.includes("best streak")) {
          triggerDiceRoll(rollCount, pid, artist.name,
            (results) => { const counts = {}; results.forEach(d => { counts[d] = (counts[d] || 0) + 1; }); const best = Math.max(...Object.values(counts)); return `Best streak: ${best} = +${best} VP`; },
            (results) => { const counts = {}; results.forEach(d => { counts[d] = (counts[d] || 0) + 1; }); const best = Math.max(...Object.values(counts)); if (best > 0) { logTicketGain(pid, best, `${artist.name} dice roll (streak)`); setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + best } })); showFloatingBonus(`+${best} ⭐`, "#c4b5fd"); sfx.gainVP(); } setTimeout(() => recalcTickets(), 50); }
          );
        } else if (el.includes("unique") && el.includes("ticket")) {
          triggerDiceRoll(rollCount, pid, artist.name,
            (results) => { const unique = new Set(results).size; return `${unique} unique results = +${unique} tickets`; },
            (results) => { const unique = new Set(results).size; if (unique > 0) { logTicketGain(pid, unique, `${artist.name} dice roll (unique)`); setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + unique } })); showFloatingBonus(`+${unique} 🎟️`, "#fbbf24"); } setTimeout(() => recalcTickets(), 50); }
          );
        } else if (el.includes("unique") && el.includes("vp")) {
          triggerDiceRoll(rollCount, pid, artist.name,
            (results) => { const unique = new Set(results).size; return `${unique} unique results = +${unique} VP`; },
            (results) => { const unique = new Set(results).size; if (unique > 0) { logTicketGain(pid, unique, `${artist.name} dice roll (unique)`); setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + unique } })); showFloatingBonus(`+${unique} ⭐`, "#c4b5fd"); sfx.gainVP(); } setTimeout(() => recalcTickets(), 50); }
          );
        } else {
          // Generic roll — just show results
          triggerDiceRoll(rollCount, pid, artist.name,
            (results) => `Rolled: ${results.map(d => d === "fame" ? "🔥" : AMENITY_ICONS[d] || d).join(" ")}`,
            () => { setTimeout(() => recalcTickets(), 50); }
          );
        }
      }
    }
    setTimeout(() => recalcTickets(), 50);
  }

  // ─── Book artist to stage ───
  function bookArtistToStage(artist, stageIdx, pid, viaAgent = false, viaGenreMatch = false) {
    // v169: derive viaTempt from context. Under tempt mode, viaAgent=true means the
    // artist was tempted onto the stage directly.
    // v177: TEMPT effects fire ONLY when the artist is placed directly from the pool
    // to a stage via a winning tempt. If a tempt loses (or wins but can't play now)
    // and the artist goes to hand, subsequent play FROM hand no longer counts as a
    // tempt-play — the TEMPT trigger is lost. The `_tempted` flag we previously set
    // when routing to hand is no longer honored by viaTempt (kept in code as a
    // historical marker but ignored).
    const viaTempt = temptModeRef.current && viaAgent;
    // SYNCHRONOUS dupe check (using ref-fresh state) before we call setPlayerData.
    // Previously this lived inside the setPlayerData updater with a `bookingSucceeded`
    // flag — but React 18 state updaters aren't guaranteed to run synchronously inside
    // the dispatching event handler, so the flag was unreliably false at the `if (!flag)`
    // check, which caused effects, microtrend checks, and the booking modal to silently
    // be skipped for every booking. This pre-check is synchronous and authoritative.
    const latestPD = playerDataRef.current || playerData;
    const myStages = (latestPD[pid]?.stageArtists || []);
    if ((myStages[stageIdx] || []).length >= 3) {
      addLog(players.find(p => p.id === pid)?.festivalName || "?", `Stage is full — cannot book ${artist.name}`);
      return;
    }
    for (const [otherId, otherPd] of Object.entries(latestPD)) {
      const otherBooked = (otherPd.stageArtists || []).flat().map(a => a.name);
      if (otherBooked.includes(artist.name)) {
        const isSelf = parseInt(otherId) === pid;
        const ownerName = isSelf ? "you" : (players.find(p => p.id === parseInt(otherId))?.festivalName || "another player");
        addLog(players.find(p => p.id === pid)?.festivalName || "?", `Can't book ${artist.name} — already on ${ownerName === "you" ? "your" : `${ownerName}'s`} stage`);
        return;
      }
    }
    setPlayerData(prev => {
      const pd = { ...prev[pid] };
      const sa = [...(pd.stageArtists || pd.stages.map(() => []))];
      // Defensive guard in case of race with another concurrent state update.
      if ((sa[stageIdx] || []).length >= 3) return prev;
      const allBookedThisPlayer = sa.flat().map(a => a.name);
      if (allBookedThisPlayer.includes(artist.name)) { console.warn("Duplicate artist blocked (same player race):", artist.name); return prev; }
      for (const [otherId, otherPd] of Object.entries(prev)) {
        if (parseInt(otherId) === pid) continue;
        const otherBooked = (otherPd.stageArtists || []).flat().map(a => a.name);
        if (otherBooked.includes(artist.name)) { console.warn("Duplicate artist blocked (other player race):", artist.name); return prev; }
      }
      sa[stageIdx] = [...(sa[stageIdx] || []), artist];
      const isFullLineup = sa[stageIdx].length === 3;
      pd.stageArtists = sa;
      if (isFullLineup && !firstFullLineup) {
        pd.bonusTickets = (pd.bonusTickets || 0) + 5;
        setFirstFullLineup(true);
        addLog("🎪 FIRST!", `${players.find(p => p.id === pid)?.festivalName} released the first full lineup! +5 tickets!`);
        showFloatingBonus("+5 🎟️ First Lineup!", "#4ade80");
      }
      // v165: full-lineup Fame bonus removed as part of the fame-sources prune. The +5
      // ticket first-lineup bonus above still fires — this only removes the fame.
      return { ...prev, [pid]: pd };
    });

    const pd = playerData[pid];
    const sa = pd.stageArtists || pd.stages.map(() => []);
    const slotCount = (sa[stageIdx] || []).length + 1;
    const isHeadliner = slotCount === 3;
    const sName = (pd.stageNames || [])[stageIdx] || `Stage ${stageIdx + 1}`;
    const festival = players.find(p => p.id === pid)?.festivalName;

    // v154: identity hook. Fires for every normal play (special-guest path calls the
    // hook separately with viaSpecialGuest=true). `stageBecameFull` = this play made
    // the stage go from 2 → 3 artists, which triggers Full of Surprises's -3 penalty.
    const stageBecameFull = isHeadliner; // slotCount === 3 means we're placing the 3rd artist
    applyIdentityOnPlay(pid, artist, { viaSpecialGuest: false, stageBecameFull });

    // v169: capture "who played what most recently" BEFORE this play's effect fires,
    // so Eminem's inheritance effect can read the value from the PRIOR play (not the
    // one currently happening). We snapshot into a ref inside applyEffect via closure.
    const _prevArtistPid = lastArtistPid;
    const _prevArtist = _prevArtistPid !== null ? lastArtistByPid[_prevArtistPid] : null;

    // v170: increment plays counter BEFORE applyEffect runs, so a chain-artist's
    // own "play another" effect sees the correct count and can be gated at 2.
    setPlaysThisTurn(n => n + 1);
    playsThisTurnRef.current = (playsThisTurnRef.current || 0) + 1;

    // Show the booking popup (headliner popup takes priority if headliner)
    if (isHeadliner) {
      setShowHeadliner({ artist, festival });
      addLog("🌟 HEADLINER", `${artist.name} headlines at ${festival}!`);
      sfx.headliner();
      // Genre beat — kicks in after the headliner sting so they don't clash.
      // Picks the artist's primary (first) genre for multi-genre artists.
      setTimeout(() => sfx.genreBeat(artist.genre), 520);
      applyEffect(artist, pid, 1, stageIdx, viaAgent, viaTempt, _prevArtist, _prevArtistPid, slotCount);
    } else {
      setShowBookedArtist({ artist, stageName: sName, isHeadliner: false, festival });
      sfx.bookArtist();
      applyEffect(artist, pid, 1, stageIdx, viaAgent, viaTempt, _prevArtist, _prevArtistPid, slotCount);
    }
    // Update the tracker for the next play
    setLastArtistByPid(prev => ({ ...prev, [pid]: artist }));
    setLastArtistPid(pid);

    // v126+: Genre-match headliner bonus. When an artist is booked into the headliner slot
    // (3rd artist) via the genre-match rule (rather than paying amenities), any bonus effect
    // in `artist.genreMatchEffect` fires in ADDITION to the normal effect. This creates an
    // extra reward for the "curated lineup" strategy. Delay slightly so the base-effect
    // popups land first, then the bonus.
    if (isHeadliner && viaGenreMatch && artist.genreMatchEffect) {
      setTimeout(() => applyGenreMatchEffect(artist, pid), 300);
    }

    // v197.12: Infrastructure Reward "Loyal Following" (camp_3) — the campsite leader
    // gains +1 ticket each time they play an artist. Fires here at the end of booking
    // so it stacks on top of the artist's own base + effect tickets.
    // v197.20: atomically update bonusTickets AND recompute tickets so the visual total
    // reflects the reward gain immediately (was previously waiting for the next unrelated
    // recalc to catch up).
    if (hasInfraReward(pid, "camp_3")) {
      setPlayerData(p => {
        const updated = { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + 1 };
        const next = { ...p, [pid]: updated };
        // v197.21: sync ref before computeTicketsForPlayer sees fresh state (see recalcAfterUpdate).
        playerDataRef.current = next;
        next[pid] = computeTicketsForPlayer(next[pid], undefined, pid);
        return next;
      });
      addLog("🏗️ Reward", `${festival}: +1 🎟️ from Loyal Following (Most Campsites)`);
    }

    // v134: drawOnPlay council trigger — "When you play an artist, draw an artist."
    // Fires once per qualifying council (up to 3 possible: Official Partner, Liquid Lunches,
    // Number One Fans). Draws from the deck; artists go straight to the player's hand.
    (() => {
      const currentPd = playerDataRef.current?.[pid] || playerData[pid] || {};
      const y = yearRef.current || year || 1;
      const fields = currentPd.fields || [];
      const qualifying = (currentPd.councils || []).filter((c, i) => c?.reward?.type === "drawOnPlay" && councilQualifies(c, fields[i], y));
      if (qualifying.length === 0) return;
      const drawn = drawFromDeck(qualifying.length);
      if (drawn.length === 0) return;
      setPlayerData(p => ({ ...p, [pid]: { ...p[pid], hand: [...(p[pid].hand || []), ...drawn] } }));
      drawn.forEach(a => addLog("📋 Council Bonus", `${festival}: drew ${a.name} (Draw-on-Play)`));
      showFloatingBonus(`📋 +${drawn.length} artist${drawn.length > 1 ? "s" : ""} drawn`, "#4ade80");
    })();

    // Floating bonuses for VP and tickets
    // VP tallied at year end — show ticket bonus only
    if (artist.tickets > 0) { showFloatingBonus(`+${artist.tickets} 🎟️`, "#fbbf24"); sfx.gainTickets(); }

    addLog(festival, `booked ${artist.name} to ${sName}${isHeadliner ? " as HEADLINER!" : ""}`);
    setLastActionFor(pid, `played ${artist.name}${isHeadliner ? " ★" : ""} in ${sName}`);
    // v135: alt-objectives event tracking. Increment counters that per-objective checkers
    // consume (Burning Desire, Popularity Contest, etc.).
    bumpYearEvent(pid, "artistsPlayedThisYear");
    if (viaAgent && temptModeRef.current) bumpYearEvent(pid, "temptBookingsThisYear");
    // Trigger a mid-year completion check so the UI can flash the achievement immediately.
    setTimeout(() => checkMidYearAchievements(pid), 80);

    // Check artist objectives and lineup objective on lineup completion
    if (isHeadliner) {
      // Build the completed lineup for checking (artist was just added as 3rd)
      const completedLineup = [...(sa[stageIdx] || []), artist].slice(-3);
      setTimeout(() => {
        // Check lineup objective (public genre target)
        checkLineupObjective(completedLineup, pid);
        // Check personal artist objectives
        setPlayerData(latestPd => {
          const pd2 = latestPd[pid];
          if (!pd2) return latestPd;
          // Defensive guard: if a previous bug corrupted playerObjectives[pid] to a non-array
          // (e.g. from the Missy Elliott "draw objective" bug), normalize it before .map.
          const rawObjs = playerObjectives[pid];
          const objs = Array.isArray(rawObjs) ? rawObjs : (rawObjs ? [{ obj: rawObjs, completed: false, vpAwarded: false }] : []);
          const updatedObjs = objs.map(entry => {
            if (entry.completed) return entry;
            const result = evalArtistObjective(entry.obj, pd2);
            if (result.completed) return { ...entry, completed: true, vpAwarded: true };
            return entry;
          });
          // v165: legacy objective completion path — no ticket reward, no picker trigger.
          // Objectives are retired; this only marks any dormant tracked objective as
          // completed for state tidiness. No side effects.
          const anyNewlyCompleted = updatedObjs.some((e, i) => e.completed && !(objs[i]?.completed));
          if (anyNewlyCompleted) {
            setPlayerObjectives(prev => ({ ...prev, [pid]: updatedObjs }));
          }
          return latestPd;
        });
      }, 200);
    }
    // Check microtrends — first player to book matching genre claims a genre-kind microtrend.
    // Amenity-kind microtrends are claimed via amenity placement (handled separately).
    // v130: under tempt mode the claim payout is +2 Fame and 0 tickets; standard mode is +1 Fame + 1 ticket.
    // v153: anti-lead mechanic — non-leaders can ALSO claim the forecast microtrend (nextMicrotrend)
    // if the artist's genre matches it, giving trailing players an information/timing edge.
    let claimedActive = false;
    setMicrotrends(prev => prev.map(mt => {
      if (mt.claimedBy !== null) return mt;
      if (mt.kind !== "genre") return mt;
      if (getGenres(artist.genre).includes(mt.genre)) {
        claimedActive = true;
        const isTempt = temptModeRef.current;
        // v165: microtrend claims are fame-only. v191: reduced to flat +1 (was +2 under tempt).
        const fameGain = 1; // v191: reduced from 2 to 1 — Fame was becoming too easy from Year 2 onward
        logFameGain(pid, fameGain, "Matching a Microtrend");
        setPlayerData(p => ({ ...p, [pid]: {
          ...p[pid],
          baseFame: Math.min(FAME_MAX, (p[pid].baseFame || 0) + fameGain),
          microtrendsCompletedCount: (p[pid].microtrendsCompletedCount || 0) + 1,
        } }));
        addLog("🎵 Microtrend", `${festival} claimed "${mt.genre}" microtrend → +${fameGain} 🔥 Fame!`);
        setLastActionFor(pid, `claimed the ${mt.genre} Trending Genre (+${fameGain} Fame)`);
        bumpYearlyStat(pid, "microtrends");
        showFloatingBonus(`🎵 ${mt.genre} Microtrend!`, GENRE_COLORS[mt.genre] || "#fbbf24");
        // v135: alt-objectives event — Pandering tracks genre microtrend wins via play.
        bumpYearEvent(pid, "genreMicrotrendWinsThisYear");
        // v197.12/22: "Word of Mouth" (port_3) — portaloo leader draws 1 artist on
        // microtrend claim. v197.22: converted from silent auto-draw-from-deck to the
        // interactive pool-or-deck picker so the player can see the pool and choose the
        // best artist for their situation. AI dispatcher already handles this pendingEffect
        // type (auto-picks best from pool if any playable, else deck).
        if (hasInfraReward(pid, "port_3")) {
          setPendingEffect({
            type: "drawFromPoolOrDeck",
            artistName: "Word of Mouth (Most Portaloos)",
            drawsRemaining: 1,
          });
          setPendingEffectPid(pid);
          addLog("🏗️ Reward", `${festival}: draw 1 artist from pool or deck (Word of Mouth)`);
        }
        setTimeout(() => checkMidYearAchievements(pid), 80);
        // Trigger council bonus for "artistOnMicrotrend" — slight delay so the fame/VP
        // updates land first; the bonus draw appears as a follow-up log line.
        setTimeout(() => triggerArtistOnMicrotrendBonus(pid), 60);
        // v155: check for stage-open credit (every 3 microtrends = 1 credit)
        checkMicrotrendCredit(pid);
        return { ...mt, claimedBy: pid };
      }
      return mt;
    }));

    // v153: anti-lead forecast claim. Only fires if the active trend was NOT already
    // claimed by this play (a single artist play can't claim both — pick current first).
    // Non-leaders (from Year 2 onwards) can claim the forecast trend when their play
    // matches its genre. On claim, the forecast is retired: rotate a fresh trend into
    // the forecast slot from the bag.
    if (!claimedActive && canClaimForecast(pid) && nextMicrotrend && nextMicrotrend.kind === "genre") {
      if (getGenres(artist.genre).includes(nextMicrotrend.genre)) {
        const isTempt = temptModeRef.current;
        const fameGain = 1; // v191: reduced from 2 to 1 — Fame was becoming too easy from Year 2 onward
        const claimedTrend = nextMicrotrend;
        // v165: microtrend claims are fame-only, forecast included.
        logFameGain(pid, fameGain, "Matching a Forecast Microtrend");
        setPlayerData(p => ({ ...p, [pid]: {
          ...p[pid],
          baseFame: Math.min(FAME_MAX, (p[pid].baseFame || 0) + fameGain),
          microtrendsCompletedCount: (p[pid].microtrendsCompletedCount || 0) + 1,
        } }));
        addLog("🎵 Microtrend", `${festival} claimed the forecast "${claimedTrend.genre}" microtrend (anti-lead) → +${fameGain} 🔥 Fame!`);
        setLastActionFor(pid, `claimed the ${claimedTrend.genre} forecast Trending Genre (+${fameGain} Fame)`);
        bumpYearlyStat(pid, "microtrends");
        showFloatingBonus(`🎵 ${claimedTrend.genre} (Forecast)!`, GENRE_COLORS[claimedTrend.genre] || "#fbbf24");
        // v197.12/22: "Word of Mouth" (port_3) also fires on forecast claims.
        // Interactive pool-or-deck picker (see comment at first site).
        if (hasInfraReward(pid, "port_3")) {
          setPendingEffect({
            type: "drawFromPoolOrDeck",
            artistName: "Word of Mouth (Most Portaloos)",
            drawsRemaining: 1,
          });
          setPendingEffectPid(pid);
          addLog("🏗️ Reward", `${festival}: draw 1 artist from pool or deck (Word of Mouth)`);
        }
        bumpYearEvent(pid, "genreMicrotrendWinsThisYear");
        setTimeout(() => checkMidYearAchievements(pid), 80);
        setTimeout(() => triggerArtistOnMicrotrendBonus(pid), 60);
        // v155: check for stage-open credit (every 3 microtrends = 1 credit)
        checkMicrotrendCredit(pid);
        // Rotate a fresh forecast in from the bag. Pass claimedTrend as avoidEntry so the
        // boundary guard prevents the same trend from popping back immediately.
        const fresh = popMicrotrendFromBag(claimedTrend);
        setNextMicrotrend(fresh);
      }
    }

    setTimeout(() => recalcTickets(), 50);
  }

  // ─── Evaluate objectives for a player ───
  /** Count how many full lineups match a genre objective */
  /** Evaluate an artist objective against a player's current stages. Returns { completed: bool, count: number } */
  function evalArtistObjective(obj, pd) {
    if (!obj) return { completed: false, count: 0 };
    const sa = pd.stageArtists || [];
    const fullLineups = sa.filter(s => s.length === 3);
    
    switch (obj.id) {
      case "local_talent": {
        // Headliner (3rd artist) has fame 0 or 1
        const c = fullLineups.filter(s => s[2] && s[2].fame <= 1).length;
        return { completed: c > 0, count: c };
      }
      case "popstars": { const c = fullLineups.filter(s => s.every(a => getGenres(a.genre).includes("Pop"))).length; return { completed: c > 0, count: c }; }
      case "rock_on": { const c = fullLineups.filter(s => s.every(a => getGenres(a.genre).includes("Rock"))).length; return { completed: c > 0, count: c }; }
      case "disc_jockeys": { const c = fullLineups.filter(s => s.every(a => getGenres(a.genre).includes("Electronic"))).length; return { completed: c > 0, count: c }; }
      case "fire_verses": { const c = fullLineups.filter(s => s.every(a => getGenres(a.genre).includes("Hip Hop"))).length; return { completed: c > 0, count: c }; }
      case "indiependent": { const c = fullLineups.filter(s => s.every(a => getGenres(a.genre).includes("Indie"))).length; return { completed: c > 0, count: c }; }
      case "funky_town": { const c = fullLineups.filter(s => s.every(a => getGenres(a.genre).includes("Funk"))).length; return { completed: c > 0, count: c }; }
      case "eclectic": {
        // Lineup with at least 3 different genres
        const c = fullLineups.filter(s => {
          const allG = new Set(); s.forEach(a => getGenres(a.genre).forEach(g => allG.add(g)));
          return allG.size >= 3;
        }).length;
        return { completed: c > 0, count: c };
      }
      case "friends_special": {
        // Finish a lineup with a special guest (fame 5)
        const c = fullLineups.filter(s => s.some(a => a.fame >= 5)).length;
        return { completed: c > 0, count: c };
      }
      case "leading_example": {
        // 2nd and 3rd artists have lower fame than the 1st
        const c = fullLineups.filter(s => s[0].fame > s[1].fame && s[0].fame > s[2].fame).length;
        return { completed: c > 0, count: c };
      }
      case "switching_up": {
        // Balanced lineup of exactly 2 genres (e.g. 1 pop, 1 rock, 1 pop-rock)
        const c = fullLineups.filter(s => {
          const allG = new Set(); s.forEach(a => getGenres(a.genre).forEach(g => allG.add(g)));
          if (allG.size !== 2) return false;
          const gs = [...allG];
          return s.every(a => { const ag = getGenres(a.genre); return ag.some(g => gs.includes(g)); });
        }).length;
        return { completed: c > 0, count: c };
      }
      case "music_speaks": {
        // Lineup where no artist has an effect
        const c = fullLineups.filter(s => s.every(a => !a.effect || a.effect.trim() === "")).length;
        return { completed: c > 0, count: c };
      }
      case "high_profile": {
        // Lineup with combined security cost >= 5
        const c = fullLineups.filter(s => s.reduce((t, a) => t + (a.securityCost || 0), 0) >= 5).length;
        return { completed: c > 0, count: c };
      }
      case "foodies": {
        // Lineup with combined catering cost >= 5
        const c = fullLineups.filter(s => s.reduce((t, a) => t + (a.cateringCost || 0), 0) >= 5).length;
        return { completed: c > 0, count: c };
      }
      case "pampered": {
        // Lineup with combined portaloo cost >= 5
        const c = fullLineups.filter(s => s.reduce((t, a) => t + (a.portalooCost || 0), 0) >= 5).length;
        return { completed: c > 0, count: c };
      }
      case "price_fame": {
        // Lineup with total amenity cost >= 20
        const c = fullLineups.filter(s => s.reduce((t, a) => t + (a.campCost||0) + (a.securityCost||0) + (a.cateringCost||0) + (a.portalooCost||0), 0) >= 20).length;
        return { completed: c > 0, count: c };
      }
      case "industry_friends": {
        // Two lineups whose headliners share a genre
        if (fullLineups.length < 2) return { completed: false, count: 0 };
        for (let i = 0; i < fullLineups.length; i++) {
          for (let j = i + 1; j < fullLineups.length; j++) {
            const g1 = getGenres(fullLineups[i][2].genre);
            const g2 = getGenres(fullLineups[j][2].genre);
            if (g1.some(g => g2.includes(g))) return { completed: true, count: 1 };
          }
        }
        return { completed: false, count: 0 };
      }
      case "same_song_sheet": {
        // All 3 artists have identical amenity requirements
        const c = fullLineups.filter(s => {
          const k = a => `${a.campCost}-${a.securityCost}-${a.cateringCost}-${a.portalooCost}`;
          return k(s[0]) === k(s[1]) && k(s[1]) === k(s[2]);
        }).length;
        return { completed: c > 0, count: c };
      }
      case "experimental": {
        // Every artist in lineup is multi-genre
        const c = fullLineups.filter(s => s.every(a => getGenres(a.genre).length >= 2)).length;
        return { completed: c > 0, count: c };
      }
      case "fair_share": {
        // Every artist requires the same total number of amenities
        const c = fullLineups.filter(s => {
          const tot = a => (a.campCost||0) + (a.securityCost||0) + (a.cateringCost||0) + (a.portalooCost||0);
          return tot(s[0]) === tot(s[1]) && tot(s[1]) === tot(s[2]);
        }).length;
        return { completed: c > 0, count: c };
      }
      default: return { completed: false, count: 0 };
    }
  }
  
  // Backward compat wrapper
  function countGenreLineups(obj, pd) {
    const r = evalArtistObjective(obj, pd);
    return { count: r.count, genre: obj?.genre || null };
  }

  /** Check and award objective completions for all players (called at year end before clearing stages) */
  function applyObjectiveRewards() {
    players.forEach(p => {
      const objs = playerObjectives[p.id] || [];
      const pd = playerData[p.id];
      if (!pd) return;
      objs.forEach((entry, idx) => {
        if (entry.completed || entry.vpAwarded) return;
        const result = evalArtistObjective(entry.obj, pd);
        if (result.completed && !entry.vpAwarded) {
          setPlayerObjectives(prev => {
            const arr = [...(prev[p.id] || [])];
            arr[idx] = { ...arr[idx], completed: true, vpAwarded: true };
            return { ...prev, [p.id]: arr };
          });
          // v165: dormant ticket source removed. The legacy personal-objective system
          // is fully retired; even in a dead code path, no tickets flow.
          addLog(p.festivalName, `🎯 Completed "${entry.obj.name}" (legacy — no reward)`);
        }
      });
    });
  }

  // ═══════════════════════════════════════════════════════════
  // LOBBY
  // ═══════════════════════════════════════════════════════════
  const handlePlayerCountChange = (count) => {
    setPlayerCount(count);
    const np = []; for (let i = 0; i < count; i++) np.push(players[i] || { id: i, name: `Player ${i + 1}`, festivalName: "", isAI: false });
    setPlayers(np.map((p, i) => ({ ...p, id: i })));
  };
  const randomizeName = (idx) => { const n = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)]; setPlayers(p => p.map((pp, i) => i === idx ? { ...pp, festivalName: n } : pp)); };
  const canStartSetup = players.every(p => p.festivalName.trim().length > 0);

  const startSetup = () => {
    // Deal 5 unique council cards to each player from a shared shuffled deck.
    // The 2 they decline (during setup) go out of the game permanently.
    const councilDeck = shuffle([...ALL_COUNCILS]);
    const data = {}; players.forEach((p, idx) => {
      const fields = emptyFields();
      const dealt = councilDeck.slice(idx * 5, idx * 5 + 5);
      // v189: councils gone. `councils` and `councilsDealt` remain in the shape (all null / empty)
      // so downstream code that reads them keeps working without touching every callsite.
      data[p.id] = { stages: [], fields, amenities: sumFields(fields), fame: 1, baseFame: 1, vpPerSecurity: 0, vp: 0, tickets: 0, rawTickets: 0, setupAmenity: null, setupField: null, hand: [], stageArtists: [], bonusTickets: 0, stageNames: [], stageColors: [], heldDice: 0, fameHighWater: 0, filledStagesHighWater: 0, councilsDealt: [], councils: [null], councilDiceGrantedThisYear: [false], councilAmenityGrantedThisYear: [false], microtrendsCompletedCount: 0, freeStageOpensUsed: [] };
    });
    setPlayerData(data); setSetupIndex(0); setSetupSelectedAmenity(null); setSetupSelectedField(null);
    // Separate 0-fame and 5-fame artists for drafting
    const all = shuffle([...ALL_ARTISTS]);
    const fame0 = shuffle(all.filter(a => a.fame === 0));
    const fame5 = shuffle(all.filter(a => a.fame === 5));
    setDraftRemaining0(fame0); setDraftRemaining5(fame5); setUndraftedArtists([]);
    setArtistDeck([]); setArtistPool([]); setDiscardPile([]); setFirstFullLineup(false);
    // Prepare objective deck — players will choose from pairs after draft
    const objDeck = shuffle([...ALL_OBJECTIVES]);
    setPlayerObjectives({}); // empty — will be filled after draft choices
    setObjectiveDeck(objDeck);

    // v166: trending lineups fully removed from the game. Left the state and helpers
    // dormant in code but the array stays empty — no draws, no UI, no claim path.
    setActiveGoals([]);
    setGoalProgress({});
    // v158: deal the initial shared contracts (N-1, min 2). Refreshed at each year end.
    if (contractsModeRef.current) {
      const n = Math.max(2, players.length - 1);
      const shuffled = [...ALL_COUNCILS].sort(() => Math.random() - 0.5);
      const dealt = shuffled.slice(0, n).map(c => c.id);
      setSharedContracts(dealt);
      if (dealt.length > 0) {
        const names = dealt.map(id => ALL_COUNCILS.find(c => c.id === id)?.name || id).join(", ");
        addLog("📜 Council Contracts", `Shared contracts for Year 1: ${names}`);
      }
    } else {
      setSharedContracts([]);
    }

    // Skip straight to objective view (no council step)
    // v158: under altObjectivesMode=false (default), no artist objectives are picked —
    // skip the misleading "you'll pick an objective" screen and jump to draft.
    // v160: when skipping viewObjective, we ALSO need to populate the draft options
    // (previously done inside confirmViewObjective) — otherwise the draft screen has
    // nothing to pick from.
    const skipObjective = !altObjectivesModeRef.current;
    setSetupStep(skipObjective ? "draftArtist" : "viewObjective");
    setSetupDraftOptions(skipObjective ? fame0.slice(0, 6) : []);
    setSetupDraftSelected([]);
    // v143: before setup begins, the first non-AI player picks the win condition. If
    // all players are AI, pick randomly and jump straight to setup.
    const firstHuman = players.find(p => !p.isAI);
    if (firstHuman) {
      setPhase("winConditionChoice");
    } else {
      const conditions = ["consistency", "following", "talkOfTheTown"];
      setWinCondition(conditions[Math.floor(Math.random() * 3)]);
      setPhase("setup"); addLogH("Setup Phase", "year");
    }
  };

  // ═══════════════════════════════════════════════════════════
  // SETUP
  // ═══════════════════════════════════════════════════════════
  const currentSetupPlayer = players[setupIndex];

  const confirmViewObjective = () => {
    // Objectives are now chosen after draft — skip to draft
    setSetupDraftOptions([...draftRemaining0.slice(0, 6)]);
    setSetupDraftSelected([]);
    setSetupStep("draftArtist");
  };

  const confirmSetupAmenity = (overrideChoice, overrideField) => {
    const choice = overrideChoice || setupSelectedAmenity;
    const fieldIdx = (overrideField != null) ? overrideField : (setupSelectedField != null ? setupSelectedField : 0);
    if (!choice) return;
    const pid = currentSetupPlayer.id;
    // v197.19: defense-in-depth against the double-call bug that pushed 37 stages onto
    // one AI player. If this player has already placed their setup amenity (setupAmenity
    // is non-null in their pd), a second invocation is a race we shouldn't honor. The
    // AI dispatch lock in aiStep is the primary fix; this is a backup so any code path
    // that reaches confirmSetupAmenity twice still can't double-place.
    if (playerData[pid]?.setupAmenity != null) return;
    const usedNames = playerData[pid]?.stageNames || [];
    const availNames = STAGE_NAMES.filter(n => !usedNames.includes(n));
    const sName = availNames[Math.floor(Math.random() * availNames.length)] || `Stage 1`;
    const sColor = STAGE_COLORS[Math.floor(Math.random() * STAGE_COLORS.length)];
    setPlayerData(p => {
      const cur = p[pid];
      const updated = mutateAmenity(cur, fieldIdx, choice, +1);
      return {
        ...p,
        [pid]: {
          ...updated,
          setupAmenity: choice,
          setupField: fieldIdx,
          stages: [...(cur.stages || []), { fameRequired: 0 }],
          stageArtists: [...(cur.stageArtists || []), []],
          stageNames: [...(cur.stageNames || []), sName],
          stageColors: [...(cur.stageColors || []), sColor],
        }
      };
    });
    addLog(currentSetupPlayer.festivalName, `placed ${AMENITY_LABELS[choice]} in Field ${fieldIdx + 1}`);
    setSetupStep("confirm");
  };

  const toggleDraftSelection = (idx) => {
    setSetupDraftSelected(prev => {
      const arr = prev || [];
      if (arr.includes(idx)) return arr.filter(i => i !== idx);
      if (arr.length >= 2) return arr;
      return [...arr, idx];
    });
  };

  const confirmSetupDraft = () => {
    const selected = setupDraftSelected || [];
    if (selected.length !== 2) return;
    const chosen = selected.map(i => setupDraftOptions[i]);
    setPlayerData(p => ({ ...p, [currentSetupPlayer.id]: { ...p[currentSetupPlayer.id], hand: [...p[currentSetupPlayer.id].hand, ...chosen] } }));
    chosen.forEach(c => addLog(currentSetupPlayer.festivalName, `drafted ${c.name} (${c.genre})`));
    const unchosen = setupDraftOptions.filter((_, i) => !selected.includes(i));
    setUndraftedArtists(prev => [...prev, ...unchosen]);
    const newR0 = draftRemaining0.slice(6);
    const newR5 = draftRemaining5;
    setDraftRemaining0(newR0); setDraftRemaining5(newR5);
    setSetupDraftOptions([]); setSetupDraftSelected([]);
    // v189: councils removed entirely — always go straight from artist draft to amenity placement.
    setSetupStep("pickAmenity");
  };

  // ─── Council Draft + Assign ───
  // After draftArtist, the player is shown their 5 dealt councils and picks 3 to keep.
  // Then assigns each kept council to one of 3 fields. Both steps must complete before pickAmenity.
  const [setupCouncilSelected, setSetupCouncilSelected] = useState([]); // array of council IDs (max 3)
  const [setupCouncilAssignments, setSetupCouncilAssignments] = useState({}); // { councilId: fieldIdx }

  const toggleCouncilKeep = (cid) => {
    setSetupCouncilSelected(prev => {
      if (prev.includes(cid)) return prev.filter(x => x !== cid);
      if (prev.length >= 3) return prev; // max 3
      return [...prev, cid];
    });
  };

  const confirmCouncilDraft = () => {
    if (setupCouncilSelected.length !== 3) return;
    setSetupStep("councilAssign");
  };

  const assignCouncilToField = (cid, fIdx) => {
    setSetupCouncilAssignments(prev => {
      const next = { ...prev };
      // Remove any existing assignment to this field (only one council per field)
      Object.keys(next).forEach(k => { if (next[k] === fIdx) delete next[k]; });
      next[cid] = fIdx;
      return next;
    });
  };

  const confirmCouncilAssign = () => {
    const assignments = setupCouncilAssignments;
    const ids = setupCouncilSelected;
    if (ids.length !== 3) return;
    if (Object.keys(assignments).length !== 3) return;
    // Build pd.councils[] indexed by field
    const councilsByField = [null, null, null];
    ids.forEach(cid => {
      const fIdx = assignments[cid];
      if (fIdx != null) councilsByField[fIdx] = getCouncilById(cid);
    });
    if (councilsByField.some(c => !c)) return;
    const pid = currentSetupPlayer.id;
    setPlayerData(p => ({ ...p, [pid]: { ...p[pid], councils: councilsByField, councilsDealt: [] } }));
    addLog(currentSetupPlayer.festivalName, `assigned councils: ${councilsByField.map((c, i) => `F${i + 1}=${c.name}`).join(", ")}`);
    setSetupCouncilSelected([]); setSetupCouncilAssignments({});
    setSetupStep("pickAmenity");
  };

  const confirmSetupPlacement = () => {
    addLog(currentSetupPlayer.festivalName, `setup complete`);
    sfx.placeStage();
    if (setupIndex < players.length - 1) {
      const nextIdx = setupIndex + 1;
      setSetupIndex(nextIdx); setSetupSelectedAmenity(null); setSetupSelectedField(null);
      setSetupCouncilSelected([]); setSetupCouncilAssignments({});
      // v158: skip the viewObjective intro when artist objectives are disabled.
      // v160: also populate draft options for the next player (this used to happen
      // inside confirmViewObjective; skipping that step means we must set it here).
      const skipObjective = !altObjectivesModeRef.current;
      setSetupStep(skipObjective ? "draftArtist" : "viewObjective");
      setSetupDraftOptions(skipObjective ? draftRemaining0.slice(0, 6) : []);
      setSetupDraftSelected([]);
    } else startGame();
  };
  const undoSetupPlacement = () => {
    const pid = currentSetupPlayer.id;
    if (setupStep === "confirm") {
      setPlayerData(p => {
        const cur = p[pid];
        const t = cur.setupAmenity;
        const fieldIdx = cur.setupField ?? 0;
        const reverted = (t != null) ? mutateAmenity(cur, fieldIdx, t, -1) : cur;
        return {
          ...p,
          [pid]: {
            ...reverted,
            stages: (cur.stages || []).slice(0, -1),
            stageArtists: (cur.stageArtists || []).slice(0, -1),
            stageNames: (cur.stageNames || []).slice(0, -1),
            stageColors: (cur.stageColors || []).slice(0, -1),
            setupAmenity: null,
            setupField: null,
          }
        };
      });
      setSetupSelectedAmenity(null); setSetupSelectedField(null);
      setSetupStep("pickAmenity");
    }
  };

  // ═══════════════════════════════════════════════════════════
  // GAME START
  // ═══════════════════════════════════════════════════════════
  /** Offer a player a choice of 2 objectives from the deck */
  const offerObjectiveChoice = (pid) => {
    setObjectiveDeck(prev => {
      const deck = [...prev];
      if (deck.length < 2) return prev;
      const opt1 = deck.pop(); const opt2 = deck.pop();
      setPendingObjectiveChoice({ playerId: pid, options: [opt1, opt2] });
      return deck;
    });
  };

  /** Player picks an objective from their offered pair */
  const chooseObjective = (obj) => {
    if (!pendingObjectiveChoice) return;
    const pid = pendingObjectiveChoice.playerId;
    const rejected = pendingObjectiveChoice.options.find(o => o.id !== obj.id);
    // Add chosen to player's objectives
    setPlayerObjectives(prev => ({
      ...prev,
      [pid]: [...(prev[pid] || []), { obj, completed: false, vpAwarded: false }]
    }));
    // Put rejected back in deck
    if (rejected) setObjectiveDeck(prev => shuffle([...prev, rejected]));
    addLog(players.find(p => p.id === pid)?.festivalName || "", `chose objective: ${obj.name}`);
    // Don't null out pendingObjectiveChoice here — caller handles the transition
  };

  /** Check if a player just completed an objective this turn, and flag for new choice */
  const checkObjectiveCompletion = (pid) => {
    const objs = playerObjectives[pid] || [];
    const pd = playerData[pid];
    let justCompleted = false;
    const updated = objs.map(entry => {
      if (entry.completed) return entry;
      const result = evalArtistObjective(entry.obj, pd);
      if (result.completed) {
        justCompleted = true;
        return { ...entry, completed: true, vpAwarded: true };
      }
      return entry;
    });
    if (justCompleted) {
      setPlayerObjectives(prev => ({ ...prev, [pid]: updated }));
      // Award VP
      const vpGain = updated.filter(e => e.completed && !objs.find(o => o.obj.id === e.obj.id && o.completed)).length * 3;
      if (vpGain > 0) {
        logTicketGain(pid, 0  /* TODO: fill in amount */, "Effect (uncategorized)");
        setPlayerData(prev => ({ ...prev, [pid]: { ...prev[pid], bonusTickets: (prev[pid].bonusTickets || 0) + vpGain } }));
        addLog(players.find(p => p.id === pid)?.festivalName || "", `🎯 Completed objective! +${vpGain} 🎟️ tickets`);
        showFloatingBonus(`+${vpGain} 🎟️ 🎯`, "#c4b5fd");
      }
      return true; // signal: needs new objective choice
    }
    return false;
  };

  const startGame = () => {
    // Build the full deck: all artists minus those drafted by players
    const draftedNames = new Set();
    players.forEach(p => { (playerData[p.id]?.hand || []).forEach(a => draftedNames.add(a.name)); });
    const remainingArtists = ALL_ARTISTS.filter(a => !draftedNames.has(a.name));
    // Shuffle undrafted offers back in with the rest
    const fullDeck = shuffle([...remainingArtists]);
    const pool = fullDeck.splice(0, 5);
    setArtistDeck(fullDeck); setArtistPool(pool); setDiscardPile([]);

    // v197.12: Roll infrastructure rewards if the mode is enabled. One reward variant
    // per amenity type is chosen randomly from that type's 3 options — this determines
    // what benefits are on offer for the rest of the game. Broadcast to log so players
    // know what they're chasing.
    if (infraRewardsModeRef.current) {
      const drawn = {};
      Object.entries(INFRA_REWARDS_BY_AMENITY).forEach(([amenity, ids]) => {
        drawn[amenity] = ids[Math.floor(Math.random() * ids.length)];
      });
      setInfraRewards(drawn);
      infraRewardsRef.current = drawn;
      infraRewardUsageRef.current = {};
      addLogH("Infrastructure Rewards — this game's benefits", "round");
      Object.entries(drawn).forEach(([amenity, id]) => {
        const r = INFRA_REWARDS[id];
        addLog("🏗️ Reward", `Most ${AMENITY_LABELS[amenity]}s → ${r.label}: ${r.desc}`);
      });
    } else {
      setInfraRewards(null);
      infraRewardsRef.current = null;
    }

    const order = players.map(p => p.id); setTurnOrder(order); setCurrentPlayerIdx(0);
    const schedule = flatTurnsModeRef.current ? TURNS_PER_YEAR_FLAT : TURNS_PER_YEAR;
    const tl = {}; order.forEach(id => { tl[id] = schedule[1]; }); setTurnsLeft(tl);
    setYear(1); setDice(rollDice()); setShowTurnStart(false); setTurnAction(null); setActionTaken(false);
    setAgentBookedThisYear({});
    // Reset year-scoped latches
    positionalGrantedYearRef.current = 0;
    // Init Star Dice shared pool (replaces old event deck)
    const poolSize = STAR_DICE_POOL_BY_PLAYER_COUNT[players.length] || 12;
    setDicePool(poolSize);
    setNegStarFacesAvoidedThisYear({});
    // v189: two microtrend tracks — one amenity trend (Council Incentives) and one genre
    // trend (Trending Genres). Each has its own active + upcoming (forecast).
    amenityBagRef.current = buildAmenityBag();
    genreBagRef.current = buildGenreBag();
    microtrendBagRef.current = []; // legacy unused
    const activeAmenity = popAmenityFromBag();
    const forecastAmenity = popAmenityFromBag(activeAmenity);
    const activeGenre = popGenreFromBag();
    const forecastGenre = popGenreFromBag(activeGenre);
    const mt = [activeAmenity, activeGenre];
    setMicrotrends(mt);
    setNextAmenityMicrotrend(forecastAmenity);
    setNextGenreMicrotrend(forecastGenre);
    setMicrotrendHistory([]);
    microtrendHistoryRef.current = [];
    const describeMt = (m) => m.kind === "amenity" ? `Place a ${AMENITY_LABELS[m.amenity]}` : `Book a ${m.genre} artist`;
    addLog("🎵 Microtrend", `Council Incentives: ${describeMt(activeAmenity)} (next: ${describeMt(forecastAmenity)}) • Trending Genres: ${describeMt(activeGenre)} (next: ${describeMt(forecastGenre)})`);
    // v135: When Alternative Artist Objectives is on, the old +3-tickets objectives are
    // replaced entirely — skip the old picker flow and only hand out alt-objective starters.
    if (altObjectivesModeRef.current) {
      let deckWorking = buildAltObjectiveDeck();
      players.forEach(p => {
        const { drawn, deckAfter } = drawFromObjectiveDeck(deckWorking, 2, "starter", p.id);
        deckWorking = deckAfter;
        if (drawn.length === 0) return;
        if (p.isAI) {
          const chosen = drawn[Math.floor(Math.random() * drawn.length)];
          if (drawn.length > 1) {
            const other = drawn.find(d => d !== chosen);
            if (other) deckWorking.push(other);
          }
          grantObjective(p.id, chosen, "normal");
        } else {
          setPendingObjectivePickerQueue(prev => [...prev, { pid: p.id, kind: "normal", source: "starter", options: drawn }]);
        }
      });
      setAltObjectiveDeck(deckWorking);
      // Go directly to game — the alt-objective picker modal will pop over top for humans.
      setPhase("game");
    } else {
      // v163: the OLD (pre-v135) objective picker used to fire here under standard mode
      // — but there's no objective system in play anymore under the current defaults
      // (stageOpenMode="trends", altObjectivesMode=false). Skip straight to game.
      setPhase("game");
    }
    setTimeout(() => recalcTickets(), 50); addLogH("Year 1 Begins", "year"); addLogH(`${players[0]?.festivalName}'s Turn`, "turn");
    setShowYearAnnouncement(true);
  };

  // v135: promote the next queued objective picker into the active slot when the current
  // one clears. Ensures pickers fire sequentially per player.
  useEffect(() => {
    if (pendingObjectivePicker) return;
    if (pendingObjectivePickerQueue.length === 0) return;
    const [next, ...rest] = pendingObjectivePickerQueue;
    setPendingObjectivePicker(next);
    setPendingObjectivePickerQueue(rest);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingObjectivePicker, pendingObjectivePickerQueue]);

  // Auto-recalculate tickets whenever playerData changes
  const recalcTicketsRef = useRef(recalcTickets);
  recalcTicketsRef.current = recalcTickets;
  const [recalcTrigger, setRecalcTrigger] = useState(0);
  useEffect(() => {
    const timer = setTimeout(() => recalcTicketsRef.current(), 100);
    return () => clearTimeout(timer);
  }, [recalcTrigger]);

  // ═══════════════════════════════════════════════════════════
  // AI AUTO-PLAY (ref-based to prevent re-trigger loops)
  // ═══════════════════════════════════════════════════════════
  const aiProcessing = useRef(false);
  const aiTimer = useRef(null);
  // v197.8: per-turn-start resolution lock. Set to a "playerId:turnNumber" key when the
  // AI turn-start uncontested tempt-resolution block fires. Cleared when a NEW turn-start
  // occurs. Prevents the "infinite duplicate glitch" that could recur if aiStep re-fires
  // with a stale closure showing showTurnStart=true after setShowTurnStart(false) was
  // queued but not yet committed. Without this lock, the block could re-enter, re-book
  // the tempted artist, and duplicate them across every re-fire until React finally
  // commits and useEffect reschedules aiStep with a fresh closure.
  const aiTurnStartResolvedRef = useRef(null);
  // v197.19: per-setup-step lock. Same pattern as aiTurnStartResolvedRef — prevents aiStep
  // from firing the same setup step twice with a stale closure. Root cause of the bug it
  // guards: at line ~7130 the AI's pickAmenity handler sets aiProcessing.current = false
  // BEFORE calling confirmSetupAmenity inside a setTimeout. If aiStep fires again before
  // that setTimeout runs (via any useEffect dep change), it sees setupStep still
  // "pickAmenity" and re-enters the block — leading to N calls to confirmSetupAmenity,
  // and confirmSetupAmenity appends a NEW stage each time it fires. This produced a game
  // where one AI ended setup with 37 stages and 37 security. The key includes setupIndex
  // + setupStep so it naturally invalidates when either advances.
  const aiSetupResolvedRef = useRef(null);

  const isCurrentPlayerAI = () => {
    if (phase === "setup") return players[setupIndex]?.isAI;
    if (phase === "game") return currentPlayer?.isAI;
    // Pre-round: each player walks the stage-open + free-draw flow in turn.
    // The "current" player is the one preRoundIndex points at, not the regular turn order.
    if (phase === "preRound") return currentPreRoundPlayer?.isAI || false;
    // Year-end effects auto-resolve for AI within their flow.
    if (phase === "yearEndEffects") return true;
    // v197.9: draft phase — current picker is driven by draftIndex.
    if (phase === "draft") {
      const pickerPid = draftOrder[draftIndex];
      return players.find(p => p.id === pickerPid)?.isAI || false;
    }
    return false;
  };

  // Single AI step function — does ONE thing then returns. Called repeatedly via setTimeout.
  const aiStep = () => {
    if (aiProcessing.current) return;
    if (!isCurrentPlayerAI()) return;
    aiProcessing.current = true;

    const scheduleNext = (ms = 500) => {
      aiProcessing.current = false;
      aiTimer.current = setTimeout(() => aiStep(), ms);
    };

    // ─── Handle pending effects for AI ───
    if (pendingEffect && pendingEffectPid !== null) {
      const pid = pendingEffectPid;
      const pd = playerData[pid] || {};
      const pe = pendingEffect;
      if (pe.type === "placeSpecific" || (pe.type === "placeAmenity" && pe.chosenType)) {
        const aType = pe.amenityType || pe.chosenType;
        const fieldIdx = aiPickFieldForAmenity(pd, aType, year || 1);
        setPlayerData(p => {
          const cur = p[pid];
          let updated = mutateAmenity(cur, fieldIdx, aType, +1);
          if (aType === "security" && cur.vpPerSecurity > 0) {
            logTicketGain(pid, cur.vpPerSecurity, "Security placement bonus");
            updated = { ...updated, bonusTickets: (updated.bonusTickets || 0) + cur.vpPerSecurity };
          }
          return { ...p, [pid]: updated };
        });
        addLog("🤖 AI", `Placed bonus ${AMENITY_LABELS[aType]} in F${fieldIdx + 1}`);
        const remaining = (pe.placeCount || 1) - 1;
        if (remaining > 0) {
          if (pe.type === "placeAmenity") setPendingEffect({ ...pe, placeCount: remaining, chosenType: null });
          else setPendingEffect({ ...pe, placeCount: remaining });
        } else {
          setPendingEffect(null); setPendingEffectPid(null);
        }
        setTimeout(() => recalcTickets(), 50);
        scheduleNext(400); return;
      }
      if (pe.type === "placeAmenity" && !pe.chosenType) {
        const choice = aiPickAmenityType(pd);
        setPendingEffect({ ...pe, chosenType: choice });
        scheduleNext(300); return;
      }
      if (pe.type === "effectAborted") {
        // v177: AI never sees this modal — the applyEffect guard only sets it for
        // humans. Defensive fallback: clear and move on.
        setPendingEffect(null); setPendingEffectPid(null);
        scheduleNext(200); return;
      }
      if (pe.type === "drawFromPool") {
        // v177: pool-only draw picker (Missy Elliott follow-up). AI picks the highest-
        // value pool artist for each draw.
        // v186: exclude tempt/agent-protected artists.
        const remaining = pe.drawsRemaining || 1;
        const rawPool = artistPoolRef.current || artistPool || [];
        const protectedNames = getAgentProtectedNames();
        const currentPool = rawPool.filter(a => !protectedNames.has(a.name));
        if (currentPool.length === 0) {
          setPendingEffect(null); setPendingEffectPid(null);
          scheduleNext(200); return;
        }
        const scored = currentPool.map((a, i) => ({ a, i, s: (a.vp || 0) + (a.tickets || 0) + Math.random() }));
        scored.sort((x, y) => y.s - x.s);
        const picked = scored[0];
        // Remove by name from the RAW pool (our currentPool was filtered).
        setArtistPool(prev => { const idx = prev.findIndex(x => x.name === picked.a.name); if (idx < 0) return prev; const np = [...prev]; np.splice(idx, 1); return np; });
        setPlayerData(p => ({ ...p, [pid]: { ...p[pid], hand: [...(p[pid].hand || []), picked.a] } }));
        addLog("🤖 AI", `${pe.artistName}: picked ${picked.a.name} from pool`);
        setLastActionFor(pid, `pulled ${picked.a.name} from the pool (${pe.artistName} effect)`);
        if (remaining > 1) {
          setPendingEffect({ ...pe, drawsRemaining: remaining - 1 });
        } else {
          setPendingEffect(null); setPendingEffectPid(null);
        }
        scheduleNext(400); return;
      }
      if (pe.type === "removeDieFromPool") {
        // v175: defensive fallback — AI shouldn't normally land here (the applyEffect
        // guard branches out for AI and runs the die-removal handlers inline). If we
        // do arrive here, auto-remove the first matching die and fire the benefit.
        const currentDice = dice || [];
        const filterType = pe.filterType;
        const isMatch = (face) => filterType === "__anyAmenity__" ? (face !== "fame" && face !== "stage") : face === filterType;
        const dIdx = currentDice.findIndex(isMatch);
        if (dIdx >= 0) {
          setDice(prev => { const nd = [...prev]; nd.splice(dIdx, 1); return nd; });
          addLog("🤖 AI", `${pe.artistName}: removed a ${currentDice[dIdx]} die from the pool`);
          if (pe.benefit) {
            if (pe.benefit.type === "fame") {
              logFameGain(pid, pe.benefit.amount, `${pe.artistName} effect`);
              setPlayerData(p => ({ ...p, [pid]: { ...p[pid], baseFame: Math.min(FAME_MAX, (p[pid].baseFame || 0) + pe.benefit.amount) } }));
            } else if (pe.benefit.type === "ticket") {
              logTicketGain(pid, pe.benefit.amount, `${pe.artistName} effect`);
              setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + pe.benefit.amount } }));
            } else if (pe.benefit.type === "chainPlay") {
              if ((playsThisTurnRef.current || 0) < 2) {
                setPendingEffect({ type: "playFromHand", artistName: pe.artistName, free: false, suppressEffect: false });
                scheduleNext(400); return;
              }
            }
          }
        }
        setPendingEffect(null); setPendingEffectPid(null);
        scheduleNext(400); return;
      }
      if (pe.type === "drawFromPoolOrDeck") {
        // v172: AI auto-resolves the pool/deck picker. For each remaining draw:
        //   - If the pool has good artists (best score > threshold), pick pool
        //   - Else draw blind from deck
        // v186: exclude tempt/agent-protected artists from the pool picks.
        const remaining = pe.drawsRemaining || 1;
        const rawPool = artistPoolRef.current || artistPool || [];
        const protectedNames = getAgentProtectedNames();
        const currentPool = rawPool.filter(a => !protectedNames.has(a.name));
        if (currentPool.length > 0) {
          const scored = currentPool.map((a, i) => ({ a, i, s: (a.vp || 0) + (a.tickets || 0) + Math.random() }));
          scored.sort((x, y) => y.s - x.s);
          if (scored[0].s > 5) {
            const picked = scored[0];
            // Remove by name from the RAW pool.
            setArtistPool(prev => { const idx = prev.findIndex(x => x.name === picked.a.name); if (idx < 0) return prev; const np = [...prev]; np.splice(idx, 1); return np; });
            setPlayerData(p => ({ ...p, [pid]: { ...p[pid], hand: [...(p[pid].hand || []), picked.a] } }));
            addLog("🤖 AI", `${pe.artistName}: picked ${picked.a.name} from pool`);
            setLastActionFor(pid, `pulled ${picked.a.name} from the pool (${pe.artistName} effect)`);
          } else {
            const drawn = drawFromDeck(1);
            if (drawn.length > 0) {
              setPlayerData(p => ({ ...p, [pid]: { ...p[pid], hand: [...(p[pid].hand || []), drawn[0]] } }));
              addLog("🤖 AI", `${pe.artistName}: drew ${drawn[0].name} from deck`);
              setLastActionFor(pid, `drew 1 artist from deck (${pe.artistName} effect)`);
            }
          }
        } else {
          const drawn = drawFromDeck(1);
          if (drawn.length > 0) {
            setPlayerData(p => ({ ...p, [pid]: { ...p[pid], hand: [...(p[pid].hand || []), drawn[0]] } }));
            addLog("🤖 AI", `${pe.artistName}: drew ${drawn[0].name} from deck`);
            setLastActionFor(pid, `drew 1 artist from deck (${pe.artistName} effect)`);
          }
        }
        if (remaining > 1) {
          setPendingEffect({ ...pe, drawsRemaining: remaining - 1 });
        } else {
          setPendingEffect(null); setPendingEffectPid(null);
        }
        scheduleNext(400); return;
      }
      if (pe.type === "removeAmenities") {
        // v172: AI fallback — shouldn't normally fire since applyEffect uses inline
        // auto-sacrifice for AI, but here as defensive route.
        const cur = playerDataRef.current?.[pid] || playerData[pid] || {};
        const camList = cur.amenities || {};
        const types = ["catering","security","portaloo","campsite"].filter(t => (camList[t] || 0) > 0);
        if (types.length > 0) {
          types.sort((a, b) => (camList[b] || 0) - (camList[a] || 0));
          const chosen = types[0];
          const fields = cur.fields || [];
          const fIdx = fields.findIndex(f => (f?.[chosen] || 0) > 0);
          if (fIdx >= 0) {
            setPlayerData(p => ({ ...p, [pid]: mutateAmenity(p[pid], fIdx, chosen, -1) }));
            addLog("🤖 AI", `${pe.artistName}: sacrificed 1 ${AMENITY_LABELS[chosen]}`);
          }
        }
        const remaining = pe.removalsRemaining || 0;
        if (remaining <= 1) {
          if (pe.followUp) setPendingEffect(pe.followUp);
          else { setPendingEffect(null); setPendingEffectPid(null); }
        } else {
          setPendingEffect({ ...pe, removalsRemaining: remaining - 1 });
        }
        scheduleNext(300); return;
      }
      if (pe.type === "playFromHand") {
        // v170: safety guard — if we've already played 2 this turn, cancel the pending
        // chain-play rather than executing it. (The primary gate is in applyEffect, but
        // this covers race cases where a pending effect landed and then a state update
        // pushed us over.)
        if ((playsThisTurnRef.current || 0) >= 2) {
          addLog("🤖 AI", `chain-play cancelled (2-plays-per-turn cap)`);
          setPendingEffect(null); setPendingEffectPid(null);
          scheduleNext(300); return;
        }
        // v169: chain-play effect. AI picks the highest-value playable artist from hand.
        const hand = pd.hand || [];
        const stages = pd.stages || [];
        const openStages = stages.map((_, i) => i).filter(si => (pd.stageArtists?.[si] || []).length < 3);
        // If "free" (Ms Banks), ignore fame/amenity affordability
        const isFree = !!pe.free;
        const playable = hand
          .map((a, hi) => ({ a, hi }))
          .filter(({ a }) => {
            if (isFree) return true;
            if ((a.fame || 0) > (pd.fame || 0)) return false;
            return openStages.some(si => canBookArtistOnStage(a, pd, si));
          });
        if (playable.length === 0) {
          addLog("🤖 AI", `no eligible artist to chain-play`);
          setPendingEffect(null); setPendingEffectPid(null);
          scheduleNext(400); return;
        }
        // Pick highest-value artist
        playable.sort(({ a: A }, { a: B }) => ((B.vp || 0) + (B.tickets || 0)) - ((A.vp || 0) + (A.tickets || 0)));
        const chainArtist = playable[0].a;
        const chainStageIdx = openStages.find(si => isFree || canBookArtistOnStage(chainArtist, pd, si));
        // Remove artist from hand
        setPlayerData(p => ({ ...p, [pid]: { ...p[pid], hand: p[pid].hand.filter((_, i) => i !== playable[0].hi) } }));
        // If suppressEffect, temporarily blank the effect so it doesn't fire
        const toPlay = pe.suppressEffect ? { ...chainArtist, effect: "" } : chainArtist;
        setTimeout(() => bookArtistToStage(toPlay, chainStageIdx, pid, false, false), 200);
        addLog("🤖 AI", `chain-played ${chainArtist.name}${pe.suppressEffect ? " (effect suppressed)" : ""}`);
        setPendingEffect(null); setPendingEffectPid(null);
        scheduleNext(600); return;
      }
      if (pe.type === "signArtist") {
        // v180: proper AI handler for the sign-artist effect (Ayle, etc.).
        // Previously referenced an undefined `eligible` — code threw at runtime, the
        // pending effect stayed open, and the human UI wound up making the pick
        // on the AI's behalf. Now the AI:
        //   1. Filters out pool artists agent-claimed by other players
        //   2. Scores each candidate by AI's own strategy (identity match, microtrend
        //      match, immediate playability, base value)
        //   3. If canRefresh AND the current pool's best score is weak, spends the
        //      refresh option first, then signs on the NEXT tick from the fresh pool
        //   4. Otherwise signs the highest-scoring eligible card; falls back to deck
        //      draw if the pool is fully agent-blocked
        const remaining = pe.signCount || 1;
        const aiIdentity = getIdentity(playerIdentitiesRef.current?.[pid]);
        const aiIdentityGenres = aiIdentity?.inGenres || [];
        const activeMicrotrend = (microtrends || []).find(mt => mt.claimedBy === null);
        const activeGenre = activeMicrotrend?.kind === "genre" ? activeMicrotrend.genre : null;
        const forecastGenre = (canClaimForecast(pid) && nextMicrotrend?.kind === "genre") ? nextMicrotrend.genre : null;

        const scoreArtist = (a) => {
          const genres = (a.genre || "").split(",").map(g => g.trim());
          let score = (a.vp || 0) * 2 + (a.tickets || 0);
          if (a.effect) score += 3;
          if (aiIdentityGenres.length > 0 && genres.some(g => aiIdentityGenres.includes(g))) score += 8;
          if (activeGenre && genres.includes(activeGenre)) score += 6;
          else if (forecastGenre && genres.includes(forecastGenre)) score += 4;
          if ((pd.fame || 0) >= effectiveArtistFame(a, pid) && canAffordArtist(a, pd, sec3Reduction(pid))) score += 8;
          return score;
        };

        const eligible = (artistPool || []).filter(a => !isAgentClaimedByOther(a.name, pid));
        const bestScore = eligible.length > 0 ? Math.max(...eligible.map(scoreArtist)) : 0;
        const REFRESH_THRESHOLD = 12;

        // Refresh path: spend the refresh option if it's available and the current
        // best is uninspiring. Defer signing to the next AI tick so the freshly-refilled
        // pool becomes visible via state, and canRefresh is now false so we won't loop.
        if (pe.canRefresh && bestScore < REFRESH_THRESHOLD) {
          refreshPool();
          addLog("🤖 AI", `${pe.artistName}: refreshing the pool for a better sign target`);
          setPendingEffect({ ...pe, canRefresh: false });
          scheduleNext(400); return;
        }

        if (eligible.length > 0) {
          const best = [...eligible].sort((a, b) => scoreArtist(b) - scoreArtist(a))[0];
          const idx = artistPool.indexOf(best);
          const np = [...artistPool]; np.splice(idx, 1);
          setPlayerData(p => ({ ...p, [pid]: { ...p[pid], hand: [...p[pid].hand, best] } }));
          addLog("🤖 AI", `Signed ${best.name} from pool`);
          refillPool(np);
        } else if (artistDeck.length > 0) {
          const drawn = drawFromDeck(1);
          if (drawn.length > 0) {
            setPlayerData(p => ({ ...p, [pid]: { ...p[pid], hand: [...p[pid].hand, drawn[0]] } }));
            addLog("🤖 AI", `Signed ${drawn[0].name} from deck (pool was agent-blocked)`);
          }
        }
        if (remaining > 1) {
          setPendingEffect({ ...pe, signCount: remaining - 1 });
        } else {
          setPendingEffect(null); setPendingEffectPid(null);
        }
        scheduleNext(400); return;
      }
      if (pe.type === "bonusBookGenre") {
        // AI: pick the best eligible (genre + affordable) artist from hand or pool and
        // book it to the first open stage. If none eligible or no open stage, skip.
        const genreOk = (a) => pe.genres.length === 0 || getGenres(a.genre).some(g => pe.genres.includes(g));
        const bookedNames = new Set((pd.stageArtists || []).flat().map(a => a.name));
        const openStages = (pd.stageArtists || []).map((sa, i) => sa.length < 3 ? i : -1).filter(i => i >= 0);
        const handCands = (pd.hand || []).filter(a => genreOk(a) && canAffordArtist(a, pd, sec3Reduction(pid)) && !bookedNames.has(a.name)).map(a => ({ a, source: "hand" }));
        const poolCands = artistPool.filter(a => genreOk(a) && canAffordArtist(a, pd, sec3Reduction(pid)) && !bookedNames.has(a.name) && !isAgentClaimedByOther(a.name, pid)).map(a => ({ a, source: "pool" }));
        const cands = [...handCands, ...poolCands].sort((x, y) => (y.a.vp + y.a.tickets) - (x.a.vp + x.a.tickets));
        if (cands.length > 0 && openStages.length > 0) {
          const { a, source } = cands[0];
          if (source === "hand") {
            setPlayerData(p => { const nh = [...(p[pid].hand || [])]; const hi = nh.findIndex(x => x.name === a.name); if (hi >= 0) nh.splice(hi, 1); return { ...p, [pid]: { ...p[pid], hand: nh } }; });
          } else {
            const np = [...artistPool]; const pi = np.findIndex(x => x.name === a.name); if (pi >= 0) np.splice(pi, 1); setArtistPool(np);
          }
          bookArtistToStage(a, openStages[0], pid);
          addLog("🤖 AI", `Bonus-booked ${a.name} (${pe.artistName} effect)`);
        }
        setPendingEffect(null); setPendingEffectPid(null);
        scheduleNext(400); return;
      }
      if (pe.type === "pickFromDrawn" && pe.drawn?.length > 0) {
        const best = pe.drawn.sort((a, b) => (b.vp + b.tickets) - (a.vp + a.tickets))[0];
        const other = pe.drawn.filter(a => a !== best);
        setPlayerData(p => ({ ...p, [pid]: { ...p[pid], hand: [...p[pid].hand, best] } }));
        setDiscardPile(prev => [...prev, ...other]);
        addLog("🤖 AI", `Kept ${best.name}`);
        setPendingEffect(null); setPendingEffectPid(null);
        scheduleNext(400); return;
      }
      // Fallback: clear unknown pending effect
      setPendingEffect(null); setPendingEffectPid(null);
      scheduleNext(200); return;
    }

    // ─── SETUP PHASE ───
    if (phase === "setup") {
      // v197.19: per-step lock. When the AI kicks off an async setTimeout to call the
      // step-completion function (confirmSetupDraft, confirmSetupAmenity), we set
      // aiProcessing = false BEFORE the state has committed. If aiStep re-fires (e.g.
      // because setSetupSelectedAmenity triggered a re-render that ripped through the
      // useEffect deps), it would find setupStep still on the current step and enter
      // again, scheduling ANOTHER confirmSetupAmenity call — each of which appends a
      // new stage. This lock keys on (setupIndex:setupStep) so it invalidates naturally
      // when either advances. See aiTurnStartResolvedRef for the same pattern.
      const setupLockKey = `${setupIndex}:${setupStep}`;
      if (aiSetupResolvedRef.current === setupLockKey) {
        aiProcessing.current = false; return;
      }
      const pid = players[setupIndex]?.id;
      if (setupStep === "viewObjective") {
        aiSetupResolvedRef.current = setupLockKey;
        confirmViewObjective(); scheduleNext(400); return;
      }
      if (setupStep === "draftArtist" && setupDraftOptions.length >= 2) {
        aiSetupResolvedRef.current = setupLockKey;
        const picks = aiDraftSelect(setupDraftOptions);
        setSetupDraftSelected(picks);
        aiProcessing.current = false;
        setTimeout(() => { confirmSetupDraft(); aiTimer.current = setTimeout(() => aiStep(), 500); }, 300);
        return;
      }
      if (setupStep === "pickAmenity") {
        aiSetupResolvedRef.current = setupLockKey;
        // v189: council-informed pick removed; use fame-scarcity heuristic. Only one field now.
        const pid = currentSetupPlayer.id;
        const pd = playerData[pid];
        const amenityChoice = aiPickSetupAmenityWithCouncils(pd);
        setSetupSelectedAmenity(amenityChoice);
        setSetupSelectedField(0);
        aiProcessing.current = false;
        setTimeout(() => { confirmSetupAmenity(amenityChoice, 0); aiTimer.current = setTimeout(() => aiStep(), 500); }, 300);
        return;
      }
      if (setupStep === "confirm") {
        aiSetupResolvedRef.current = setupLockKey;
        confirmSetupPlacement(); scheduleNext(600); return;
      }
      aiProcessing.current = false; return;
    }

    // ─── PRE-ROUND PHASE (between years) ───
    if (phase === "preRound") {
      if (preRoundStep === "notify") {
        if (canOpenStage) { acceptNewStage(); scheduleNext(400); }
        else { startPreRoundDraws(); scheduleNext(400); }
        return;
      }
      if (preRoundStep === "preRoundDrawChoose") {
        const pid = currentPreRoundPlayer?.id;
        if (artistPool.length > 0) {
          const best = artistPool.reduce((a, b) => (a.vp + a.tickets > b.vp + b.tickets ? a : b));
          const idx = artistPool.indexOf(best);
          const newPool = [...artistPool]; newPool.splice(idx, 1); setArtistPool(newPool);
          setPlayerData(p => ({ ...p, [pid]: { ...p[pid], hand: [...(p[pid].hand || []), best] } }));
          addLog("🤖 AI", `${currentPreRoundPlayer.festivalName} drew ${best.name} from pool (free draw)`);
        } else {
          const drawn = drawFromDeck(1);
          if (drawn.length > 0) {
            setPlayerData(p => ({ ...p, [pid]: { ...p[pid], hand: [...(p[pid].hand || []), drawn[0]] } }));
            addLog("🤖 AI", `${currentPreRoundPlayer.festivalName} drew ${drawn[0].name} from deck (free draw)`);
          }
        }
        const newPlaced = freeAmenityPlaced + 1; setFreeAmenityPlaced(newPlaced);
        if (newPlaced < freeAmenityCount) { setPreRoundStep("preRoundDrawChoose"); scheduleNext(300); }
        else { nextPreRound(); scheduleNext(400); }
        return;
      }
      aiProcessing.current = false; return;
    }

    // ─── YEAR-END EFFECTS PHASE ───
    if (phase === "yearEndEffects") {
      // Auto-resolve current effect for AI (or advance for human after they click)
      const yep = players[yearEndEffectsPlayer];
      if (yep?.isAI) {
        const effects = yearEndEffectsList[yep.id] || [];
        const eff = effects[yearEndEffectIdx];
        if (eff) {
          if (eff.type === "rollUnique") {
            const results = shuffle([...DICE_OPTIONS, ...DICE_OPTIONS]).slice(0, 5);
            const vp = new Set(results).size;
            resolveYearEndEffect({ vp });
          } else if (eff.type === "rollCommon") {
            const results = shuffle([...DICE_OPTIONS, ...DICE_OPTIONS]).slice(0, 5);
            const c = {}; results.forEach(d => { c[d]=(c[d]||0)+1; });
            resolveYearEndEffect({ vp: Math.max(...Object.values(c)) });
          } else {
            resolveYearEndEffect();
          }
          scheduleNext(300); return;
        } else {
          advanceYearEndEffect();
          scheduleNext(300); return;
        }
      }
      aiProcessing.current = false; return;
    }
    // v197.9: draft phase — if the current picker is an AI, auto-pick after a short beat
    // so humans can see what the AI took. Human picks go through the modal (see JSX).
    if (phase === "draft") {
      const pickerPid = draftOrder[draftIndex];
      const picker = players.find(p => p.id === pickerPid);
      if (picker?.isAI) {
        aiDraftPick(pickerPid);
        scheduleNext(500); return;
      }
      aiProcessing.current = false; return;
    }

    // ─── GAME PHASE ───
    if (phase === "game") {
      if (showYearAnnouncement) { setShowYearAnnouncement(false); setShowTurnStart(true); scheduleNext(500); return; }
      // Auto-choose objective for AI (or dismiss pending for current AI player)
      if (pendingObjectiveChoice && pendingObjectiveChoice.options.length >= 2 && pendingObjectiveChoice.playerId === currentPlayerId) {
        const pick = pendingObjectiveChoice.options[Math.floor(Math.random() * pendingObjectiveChoice.options.length)];
        chooseObjective(pick);
        setPendingObjectiveChoice(null);
        scheduleNext(300); return;
      }
      if (pendingDiceRoll) {
        const results = shuffle([...DICE_OPTIONS, ...DICE_OPTIONS]).slice(0, pendingDiceRoll.count);
        if (pendingDiceRoll.callback) pendingDiceRoll.callback(results);
        setPendingDiceRoll(null);
        scheduleNext(500); return;
      }
      if (showTurnStart) {
        // v197.8: per-turn resolution lock. If we've ALREADY fired the resolution block
        // for this specific (player, turn) pair, skip. This defends against aiStep
        // re-entering with a stale closure showing showTurnStart=true after the earlier
        // setShowTurnStart(false) was queued but not yet committed — the exact race
        // condition that caused the "AI tempted Jamiroquai at end of year 2 and received
        // him infinite duplicates on year 3 turn start" bug.
        const turnStartKey = `${currentPlayerId}:${turnNumber}`;
        if (aiTurnStartResolvedRef.current === turnStartKey) {
          // Already resolved this turn-start; just schedule the next AI action and exit.
          scheduleNext(500); return;
        }
        aiTurnStartResolvedRef.current = turnStartKey;
        setShowTurnStart(false);
        setTurnNumber(prev => prev + 1);
        // v197.13: Scouted Talent (sec_2) for AI — draw 3, auto-keep best.
        if (hasInfraReward(currentPlayerId, "sec_2")) {
          const usageKey = `sec_2:${currentPlayerId}:${turnNumber + 1}`;
          if (!infraRewardUsageRef.current[usageKey]) {
            infraRewardUsageRef.current[usageKey] = true;
            const drawn = drawFromDeck(3);
            if (drawn.length > 0) {
              // Auto-keep highest (fame*2 + tickets)
              let bestIdx = 0; let bestScore = -1;
              drawn.forEach((a, i) => { const s = (a.fame||0)*2 + (a.tickets||0); if (s > bestScore) { bestScore = s; bestIdx = i; } });
              const kept = drawn[bestIdx];
              const discarded = drawn.filter((_, i) => i !== bestIdx);
              setPlayerData(p => ({ ...p, [currentPlayerId]: { ...p[currentPlayerId], hand: [...(p[currentPlayerId].hand || []), kept] } }));
              setDiscardPile(prev => [...prev, ...discarded]);
              addLog("🏗️ Reward", `${currentPlayer.festivalName}: Scouted Talent kept ${kept.name}, discarded ${discarded.map(a => a.name).join(", ")}`);
            }
          }
        }
        // v167: AI stage-open policy. The AI wants to expand to a 2nd stage
        // eagerly (opening a stage is worth 3 more artist slots ≈ ~15 tickets of
        // scoring capacity). It only goes for the 3rd stage when its amenities are
        // v172: aggressive stage-opening. AI should never sit on 1 stage by Year 3.
        // - Always spend a credit to go 1→2 (unchanged).
        // - Spend a credit to go 2→3 whenever amenity total ≥ 4 (was ≥ 6), and always
        //   fire (removed the 70% dice roll). Bank only if <4 amenities.
        // The AI EARNS credits from microtrend claims and stage die picks, so this is
        // demand-side — supply-side is boosted separately via microtrend prioritization.
        if (stageOpenModeRef.current === "trends") {
          const pdSnap = playerDataRef.current?.[currentPlayerId] || playerData[currentPlayerId] || {};
          const startStages = (pdSnap.stages || []).length;
          const startCredits = pdSnap.stageOpenCredits || 0;
          const am = pdSnap.amenities || {};
          const totalAm = (am.campsite || 0) + (am.portaloo || 0) + (am.security || 0) + (am.catering || 0);
          let credits = startCredits;
          let stages = startStages;
          if (credits > 0 && stages === 1) {
            spendStageCredit(currentPlayerId);
            credits--; stages++;
          }
          if (credits > 0 && stages === 2 && totalAm >= 4) {
            spendStageCredit(currentPlayerId);
            credits--; stages++;
          }
        }
        // AI: resolve pool agent claims at turn start
        // v185: if a queued contest placement already opened a pendingAgentArtist,
        // skip resolvePoolAgents — the AI dispatcher at line ~6541 will handle it
        // on the next tick. Otherwise a fresh tempt result would clobber the queued
        // one and the AI's contest win would be lost.
        if (pendingAgentArtist) {
          scheduleNext(400); return;
        }
        const resolution = resolvePoolAgents(currentPlayerId);
        if (resolution && resolution.type === "uncontested") {
          // v179: +2 Fame for uncontested tempt win (fires at resolution, before book/hand branch)
          grantUncontestedTemptBonus(currentPlayerId);
          // v194: tempt-to-stage now requires genre-match (see canTemptDirectToStage).
          // Amenity costs no longer create a direct-to-stage path via tempt — if the tempter
          // can't satisfy the genre-subset rule, the artist goes to hand and must be played
          // later via the standard amenity-cost path. This makes tempting either a play move
          // (you've been building a matching stage) OR a denial move (you sent them to hand
          // and locked them out of the opposing player) — not both at once.
          const artist = resolution.artist;
          const pd2 = playerData[currentPlayerId] || {};
          const openStages = (pd2.stageArtists || []).map((sa, i) => sa.length < 3 ? i : -1).filter(i => i >= 0);
          const bookable = openStages.filter(i => canTemptDirectToStage(artist, pd2, i));
          const isTempt = temptModeRef.current;
          // v197.1: same defensive ref-sync as checkNextTempt — mutate the ref alongside
          // the setState so any subsequent reader (checkNextTempt, other aiStep tick) sees
          // the tempt as already removed rather than reprocessing it.
          const popTemptRefTurnStart = () => {
            setTemptPlacements(prev => ({ ...prev, [currentPlayerId]: (prev[currentPlayerId] || []).filter(p => !(p.type === "pool" && p.artistName === artist.name)) }));
            const cur = temptPlacementsRef.current || {};
            temptPlacementsRef.current = { ...cur, [currentPlayerId]: (cur[currentPlayerId] || []).filter(p => !(p.type === "pool" && p.artistName === artist.name)) };
          };
          if (bookable.length > 0) {
            // Prefer a genre-match headliner stage when available (fires genreMatchEffect).
            const genreStage = bookable.find(si => canBookHeadlinerViaGenre(artist, pd2, si));
            const si = genreStage != null ? genreStage : bookable[0];
            const viaGenre = genreStage != null;
            const newPool = [...artistPool]; const idx = newPool.findIndex(a => a.name === artist.name);
            if (idx >= 0) newPool.splice(idx, 1); setArtistPool(newPool);
            bookArtistToStage(artist, si, currentPlayerId, true, viaGenre);
            if (isTempt) {
              popTemptRefTurnStart();
            } else {
              exhaustAgent(currentPlayerId);
            }
            addLog(isTempt ? "💫 Tempt" : "🕵️ AI Agent", `${currentPlayer?.festivalName} booked ${artist.name} (uncontested claim, genre match)`);
          } else {
            // No stage has a valid genre-match — send to hand.
            setPlayerData(p => ({ ...p, [currentPlayerId]: { ...p[currentPlayerId], hand: [...(p[currentPlayerId].hand || []), artist] } }));
            const newPool = [...artistPool]; const idx = newPool.findIndex(a => a.name === artist.name);
            if (idx >= 0) newPool.splice(idx, 1); setArtistPool(newPool);
            if (isTempt) {
              popTemptRefTurnStart();
            } else {
              exhaustAgent(currentPlayerId);
            }
            addLog(isTempt ? "💫 Tempt" : "🕵️ AI Agent", `${currentPlayer?.festivalName} sent ${artist.name} to hand (no genre-match stage)`);
          }
        } else if (resolution && resolution.type === "contested") {
          // Roll the contest die and surface the result in the modal.
          // The modal auto-commits after a short reveal when no human is involved.
          const contest = resolveAgentContestRoll(resolution.contestants, resolution.artist, resolution.poolIdx);
          const humanInvolved = contest.contestantData.some(c => !players.find(p => p.id === c.pid)?.isAI);
          setAgentContest({ ...contest, isAuto: !humanInvolved });
        }
        scheduleNext(500); return;
      }
      // Wait for an active contest to resolve before continuing AI dispatch
      if (agentContest) { aiProcessing.current = false; return; }
      if (showHeadliner) { setShowHeadliner(null); scheduleNext(300); return; }
      if (showBookedArtist) { setShowBookedArtist(null); scheduleNext(300); return; }
      if (showCouncilDrawBonus) { setShowCouncilDrawBonus(null); scheduleNext(300); return; }
      // (council-fame popup removed)
      
      // AI: handle pending agent artist booking
      // v185: was auto-booking to openStages[0] with no per-stage validation, and if
      // no open stages existed the artist was silently dropped (source of the "won a
      // contest but the artist disappears" symptom for AI winners). Now:
      //   - Filter to stages the artist can legally be booked on (amenities or genre-match)
      //   - Prefer genre-match headliner stages when available
      //   - If no bookable stage, send to hand as a fallback (never silently drop)
      if (pendingAgentArtist) {
        const pa = pendingAgentArtist;
        const pd2 = playerData[pa.pid] || {};
        const allOpen = (pd2.stageArtists || []).map((sa, i) => sa.length < 3 ? i : -1).filter(i => i >= 0);
        // v194: tempt-to-stage requires genre match. If the AI winner has no matching
        // stage they take the artist to hand — even for contest wins. This is intended:
        // contesting is now denial-focused (block opponent's play), not a double-win.
        const bookable = allOpen.filter(si => canTemptDirectToStage(pa.artist, pd2, si));
        const newPool = [...artistPool];
        const idx = newPool.findIndex(a => a.name === pa.artist.name);
        if (idx >= 0) { newPool.splice(idx, 1); setArtistPool(newPool); }
        if (bookable.length > 0) {
          const genreStage = bookable.find(si => canBookHeadlinerViaGenre(pa.artist, pd2, si));
          const chosen = genreStage != null ? genreStage : bookable[0];
          const viaGenre = genreStage != null;
          bookArtistToStage(pa.artist, chosen, pa.pid, true, viaGenre);
          exhaustAgent(pa.pid);
          addLog("🤖 AI", `Booked ${pa.artist.name} (contest/agent claim, genre match)`);
        } else {
          // No genre-match stage — hand fallback.
          setPlayerData(p => ({ ...p, [pa.pid]: { ...p[pa.pid], hand: [...(p[pa.pid].hand || []), pa.artist] } }));
          exhaustAgent(pa.pid);
          addLog("🤖 AI", `${pa.artist.name} won but no genre-match stage — added to hand`);
        }
        setPendingAgentArtist(null);
        setTimeout(() => recalcTickets(), 50);
        scheduleNext(300); return;
      }

      if (noTurnsLeft || actionTaken) {
        // AI: deploy agent before ending turn (free action)
        if (hasAgent(currentPlayerId) && !actionTaken) {
          // Don't deploy if turn is ending due to no turns left and no action taken — weird state
        } else if (hasAgent(currentPlayerId)) {
          aiDeployAgent(currentPlayerId);
        }
        endTurn(); aiProcessing.current = false; return;
      }

      // Decide and execute ONE action
      const pd = playerData[currentPlayerId] || {};
      const forecastForAI = canClaimForecast(currentPlayerId) ? nextMicrotrend : null;
      const trendsMode = stageOpenModeRef.current === "trends";
      // v196.2: pass identity context — used for Curated (avoid >6 plays) and Full of
      // Surprises (avoid filling the last slot of a 2/3-full stage normally).
      const identityCtx = {
        playedThisYear: (yearEvents[currentPlayerId]?.artistsPlayedThisYear) || 0,
        stagesTwoFull: (pd.stageArtists || []).filter(s => s.length === 2).length,
      };
      // v197.18: build infrastructure-reward context for the AI decision. Includes
      // (a) which rewards are active this game per amenity, (b) current strict leader
      // per amenity (or null if tied/below-2), (c) every player's amenity counts so the
      // AI can see how far it is from taking a reward. Empty when the mode is off.
      const infraContext = infraRewardsModeRef.current && infraRewardsRef.current ? {
        playerId: currentPlayerId,
        rewards: infraRewardsRef.current,
        leaders: {
          campsite: getInfraLeader("campsite"),
          portaloo: getInfraLeader("portaloo"),
          security: getInfraLeader("security"),
          catering: getInfraLeader("catering"),
        },
        counts: Object.fromEntries(
          players.map(pl => [pl.id, (playerData[pl.id]?.amenities || {})])
        ),
      } : null;
      const decision = aiDecideTurn(pd, artistPool, dice, year, lineupObjectives, microtrends, forecastForAI, trendsMode, getIdentity(playerIdentitiesRef.current?.[currentPlayerId]), identityCtx, infraContext);
      addLog("🤖 AI", `${currentPlayer?.festivalName} decides: ${decision.action}`);

      if (decision.action === "book") {
        const { source, artistIdx, stageIdx } = decision;
        let artist = null;
        if (source === "hand" && artistIdx < (pd.hand || []).length) {
          artist = pd.hand[artistIdx];
        }
        // Dupe-check before consuming hand — same pattern as handleStageSelect.
        // If another player has this artist booked, skip this booking, leave the card in hand.
        if (artist) {
          const allBookedNames = new Set();
          Object.values(playerData).forEach(opd => (opd.stageArtists || []).flat().forEach(a => allBookedNames.add(a.name)));
          if (allBookedNames.has(artist.name)) {
            addLog("🤖 AI", `${currentPlayer?.festivalName} would book ${artist.name}, but it's already on a stage — passing`);
            artist = null;
          }
        }
        if (artist) {
          // Now safe to consume hand and book.
          if (source === "hand") {
            setPlayerData(p => { const nh = [...p[currentPlayerId].hand]; nh.splice(artistIdx, 1); return { ...p, [currentPlayerId]: { ...p[currentPlayerId], hand: nh } }; });
          }
          bookArtistToStage(artist, stageIdx, currentPlayerId);
          setTurnsLeft(p => ({ ...p, [currentPlayerId]: p[currentPlayerId] - 1 }));
          setActionTaken(true);
          addLog("🤖 AI", `Booked ${artist.name}`);
        } else {
          addLog("🤖 AI", "Booking failed — fallback to amenity");
          const cd2 = dice.length > 0 ? dice : rollDice();
          if (cd2.length > 0) {
            // v187: preserve Turn 1 fame-die priority even in the book-fallback path
            const isFirstTurnFB = (year === 1) && ((pd.stageArtists || []).flat().length === 0);
            const wantsFameFB = isFirstTurnFB && (pd.fame || 0) < 2;
            const pk = aiPickDie(cd2, pd, null, false, wantsFameFB);
            const nd2 = [...cd2]; nd2.splice(pk.idx, 1); setDice(nd2);
            if (pk.type === "fame") {
              logFameGain(currentPlayerId, 1, "Effect");
              setPlayerData(p => ({ ...p, [currentPlayerId]: { ...p[currentPlayerId], baseFame: Math.min(FAME_MAX, (p[currentPlayerId].baseFame || 0) + 1) } }));
            } else {
              const fIdx = aiPickFieldForAmenity(pd, pk.type, year || 1);
              setPlayerData(p => ({ ...p, [currentPlayerId]: mutateAmenity(p[currentPlayerId], fIdx, pk.type, +1) }));
              claimAmenityMicrotrend(currentPlayerId, pk.type);
            }
            setTurnsLeft(p => ({ ...p, [currentPlayerId]: p[currentPlayerId] - 1 })); setActionTaken(true); setTimeout(() => recalcTickets(), 50);
          }
        }
        scheduleNext(800); return;
      }
      if (decision.action === "reserve" || decision.action === "drawDeck") {
        // v196 draw action: pool = 1 card OR deck = N cards (Fame 1-3 → 2, Fame 4-5 → 3).
        // Mixing pool + deck is no longer allowed. AI picks the higher-EV path.
        const protectedNames = getAgentProtectedNames();
        const pickable = artistPool.filter(a => !protectedNames.has(a.name));
        const deckDrawCount = getDeckDrawCount(pd);
        const drawn = [];

        // Estimated value from a deck draw: draws are blind, so use average pool artist
        // value as a proxy for expected per-card value from the deck. Multiplied by N cards.
        // Slight discount (0.85x) because the AI doesn't get to pick from a deck draw.
        const avgArtistVal = artistPool.length > 0
          ? artistPool.reduce((s, a) => s + (a.vp || 0) + (a.tickets || 0), 0) / artistPool.length
          : 6; // fallback baseline
        const deckEV = avgArtistVal * deckDrawCount * 0.85;

        // Best pool card value (guaranteed pick)
        const bestPool = pickable.length > 0
          ? [...pickable].sort((a, b) => (b.vp + b.tickets) - (a.vp + a.tickets))[0]
          : null;
        const bestPoolVal = bestPool ? (bestPool.vp || 0) + (bestPool.tickets || 0) : 0;

        // AI chooses deck if EV higher AND deck has cards; otherwise pool
        if (bestPool && bestPoolVal >= deckEV) {
          drawn.push(bestPool);
          setArtistPool(artistPool.filter(a => a !== bestPool));
        } else if (artistDeck.length > 0) {
          const deckDrawn = drawFromDeck(deckDrawCount);
          drawn.push(...deckDrawn);
        } else if (bestPool) {
          // Deck empty — fall back to pool pick even if worse EV
          drawn.push(bestPool);
          setArtistPool(artistPool.filter(a => a !== bestPool));
        }
        
        if (drawn.length > 0) {
          setPlayerData(p => ({ ...p, [currentPlayerId]: { ...p[currentPlayerId], hand: [...p[currentPlayerId].hand, ...drawn] } }));
          drawn.forEach(() => trackGoalProgress(currentPlayerId, "artistsSigned"));
          addLog("🤖 AI", `Drew ${drawn.map(a => a.name).join(" + ")} (${drawn.length} artists)`);
          // Council reward: drawArtists councils give +N additional artists from deck
          applyDrawArtistsBonus(currentPlayerId);
        }
        setTurnsLeft(p => ({ ...p, [currentPlayerId]: p[currentPlayerId] - 1 }));
        setActionTaken(true); setTimeout(() => recalcTickets(), 50);
        refillPool();
        scheduleNext(500); return;
      }
      // Default: pick amenity directly (skip the multi-step UI)
      let currentDice = dice.length > 0 ? dice : rollDice();
      if (dice.length === 0 && currentDice.length > 0) {
        setDice(currentDice);
      }
      if (currentDice.length === 0) { endTurn(); aiProcessing.current = false; return; }
      // v172: broader stage-progress hunger. AI wants stage progress whenever it has
      // < 3 stages AND doesn't already have a credit banked (banked credits waste
      // stage dice). If it has < 2 stages, wants it aggressively regardless.
      // v191: after the +2→+1 microtrend cut AND the 2→3 credit threshold change,
      // stage progress is scarcer. AI needs to be MORE aggressive on stage dice
      // to keep opening stages at a healthy rate — pursue them any time credits are 0
      // and stages < 3, regardless of amenity total.
      const aiPdSnap = playerData[currentPlayerId] || {};
      const aiStages = (aiPdSnap.stages || []).length;
      const aiCredits = aiPdSnap.stageOpenCredits || 0;
      const wantsStageProgress = aiStages < 3 && aiCredits === 0;
      const pick = aiPickDie(currentDice, pd, decision.preferredType, wantsStageProgress, decision.wantsFameThisTurn);
      const dieVal = currentDice[pick.idx];

      if (dieVal === "fame" || pick.type === "fame") {
        // Fame die
        const nd = [...currentDice]; nd.splice(pick.idx, 1); setDice(nd);
        logFameGain(currentPlayerId, 1, "Fame die");
        setPlayerData(p => ({ ...p, [currentPlayerId]: { ...p[currentPlayerId], baseFame: Math.min(FAME_MAX, (p[currentPlayerId].baseFame || 0) + 1) } }));
        addLog("🤖 AI", `Rolled 🔥 Fame!`);
        trackGoalProgress(currentPlayerId, "fameDieRolls");
        setTurnsLeft(p => ({ ...p, [currentPlayerId]: p[currentPlayerId] - 1 }));
        setActionTaken(true); setTimeout(() => recalcTickets(), 50);
        scheduleNext(500); return;
      }

      if (dieVal === "stage" || pick.type === "stage") {
        // v166: AI picks the stage die → +1 stage progress. Blocking value even if maxed.
        const nd = [...currentDice]; nd.splice(pick.idx, 1); setDice(nd);
        grantStageProgress(currentPlayerId, "Stage die");
        addLog("🤖 AI", `Picked the 🎪 Stage die`);
        setTurnsLeft(p => ({ ...p, [currentPlayerId]: p[currentPlayerId] - 1 }));
        setActionTaken(true); setTimeout(() => recalcTickets(), 50);
        scheduleNext(500); return;
      }

      // v166: compound faces gone — die value IS the amenity type
      const amenityType = pick.type || dieVal;
      const nd = [...currentDice]; nd.splice(pick.idx, 1); setDice(nd);
      const aiPd = playerData[currentPlayerId] || {};
      const fIdx = aiPickFieldForAmenity(aiPd, amenityType, year || 1);
      setPlayerData(p => ({ ...p, [currentPlayerId]: mutateAmenity(p[currentPlayerId], fIdx, amenityType, +1) }));
      addLog("🤖 AI", `Built ${AMENITY_LABELS[amenityType]} in F${fIdx + 1}`);
      checkSecurityVPBonus(currentPlayerId, amenityType);
      claimAmenityMicrotrend(currentPlayerId, amenityType);
      setTurnsLeft(p => ({ ...p, [currentPlayerId]: p[currentPlayerId] - 1 }));
      setActionTaken(true); setTimeout(() => recalcTickets(), 50);
      scheduleNext(500); return;
    }

    aiProcessing.current = false;
  };

  // Trigger AI when it's an AI player's turn
  useEffect(() => {
    if (!isCurrentPlayerAI()) { aiProcessing.current = false; return; }
    // Safety: reset processing flag if somehow stuck
    const safetyTimer = setTimeout(() => { aiProcessing.current = false; }, 5000);
    if (aiProcessing.current) return;
    aiTimer.current = setTimeout(() => aiStep(), 700);
    return () => { if (aiTimer.current) clearTimeout(aiTimer.current); clearTimeout(safetyTimer); };
  }, [phase, setupStep, setupIndex, currentPlayerIdx, showTurnStart, actionTaken, noTurnsLeft, pendingEffect, pendingDiceRoll, showHeadliner, showBookedArtist, showCouncilDrawBonus, showYearAnnouncement, preRoundStep, preRoundIndex, freeAmenityPlaced, agentContest, draftIndex]);

  // AI objective choices are handled in startGame — no useEffect needed

  // ═══════════════════════════════════════════════════════════
  // TURN ACTIONS
  // ═══════════════════════════════════════════════════════════
  const handlePickAmenity = () => { setTurnAction("pickAmenity"); if (dice.length === 0) { const fresh = rollDice(); setDice(fresh); grantCat1IfEligible(currentPlayerId, fresh); } };
  // Direct amenity placement when player picks a die. Build 1: defaults to field 0.
  // Build 2 will accept a fieldIdx parameter and the UI will prompt for selection.
  // Check microtrends — amenity-kind microtrends are claimed by the first player to place
  // a matching amenity. Reward is +1 Fame, same as genre microtrends. The trigger fires
  // from any deliberate amenity placement (turn action, dice placement, effect-driven gain).
  // When a player completes a microtrend (any path: genre book, amenity place, agent claim),
  // for each qualifying "artistOnMicrotrend" council they have, give them a free artist draw
  // from the deck. Auto-deck-draw for simplicity — the player chooses what to play later
  // from their hand. A future iteration could let them pick pool vs deck per the card text.
  const triggerArtistOnMicrotrendBonus = (pid) => {
    const pd = playerDataRef.current?.[pid] || playerData[pid] || {};
    const y = yearRef.current || year || 1;
    const fields = pd.fields || [];
    const qualifying = (pd.councils || []).filter((c, i) => c?.reward?.type === "artistOnMicrotrend" && councilQualifies(c, fields[i], y));
    if (qualifying.length === 0) return;
    const drawn = drawFromDeck(qualifying.length);
    if (drawn.length === 0) return;
    setPlayerData(p => ({ ...p, [pid]: { ...p[pid], hand: [...(p[pid].hand || []), ...drawn] } }));
    const festival = players.find(p => p.id === pid)?.festivalName || "?";
    drawn.forEach(a => addLog("📋 Council Bonus", `${festival}: drew ${a.name} (microtrend bonus)`));
  };

  const claimAmenityMicrotrend = (pid, amenityType) => {
    const festival = players.find(p => p.id === pid)?.festivalName || "?";
    let claimedActive = false;
    setMicrotrends(prev => prev.map(mt => {
      if (mt.claimedBy !== null) return mt;
      if (mt.kind !== "amenity") return mt;
      if (mt.amenity !== amenityType) return mt;
      // v165: microtrend claims are fame-only. v191: reduced to flat +1 (was +2 under tempt).
      const isTempt = temptModeRef.current;
      const fameGain = 1; // v191: reduced from 2 to 1
      logFameGain(pid, fameGain, "Matching a Council Incentive");
      setPlayerData(p => ({ ...p, [pid]: {
        ...p[pid],
        baseFame: Math.min(FAME_MAX, (p[pid].baseFame || 0) + fameGain),
        microtrendsCompletedCount: (p[pid].microtrendsCompletedCount || 0) + 1,
      } }));
      addLog("🏛️ Council Incentive", `${festival} matched "${AMENITY_LABELS[amenityType]}" → +${fameGain} 🔥 Fame!`);
      setLastActionFor(pid, `claimed the ${AMENITY_LABELS[amenityType]} Council Incentive (+${fameGain} Fame)`);
      bumpYearlyStat(pid, "microtrends");
      showFloatingBonus(`🏛️ ${AMENITY_LABELS[amenityType]}!`, "#fbbf24");
      setTimeout(() => recalcTickets(), 50);
      setTimeout(() => triggerArtistOnMicrotrendBonus(pid), 60);
      checkMicrotrendCredit(pid);
      claimedActive = true;
      return { ...mt, claimedBy: pid };
    }));
    // v189: anti-lead amenity-forecast claim. Non-leaders can claim the upcoming amenity
    // microtrend if their placement matches it, giving trailing players an early advantage.
    if (!claimedActive && canClaimForecast(pid) && nextAmenityMicrotrend && nextAmenityMicrotrend.amenity === amenityType) {
      const isTempt = temptModeRef.current;
      const fameGain = 1; // v191: reduced from 2 to 1
      const claimedTrend = nextAmenityMicrotrend;
      logFameGain(pid, fameGain, "Matching a Forecast Council Incentive");
      setPlayerData(p => ({ ...p, [pid]: {
        ...p[pid],
        baseFame: Math.min(FAME_MAX, (p[pid].baseFame || 0) + fameGain),
        microtrendsCompletedCount: (p[pid].microtrendsCompletedCount || 0) + 1,
      } }));
      addLog("🏛️ Council Incentive", `${festival} matched the forecast "${AMENITY_LABELS[amenityType]}" (anti-lead) → +${fameGain} 🔥 Fame!`);
      setLastActionFor(pid, `claimed the ${AMENITY_LABELS[amenityType]} forecast Council Incentive (+${fameGain} Fame)`);
      bumpYearlyStat(pid, "microtrends");
      showFloatingBonus(`🏛️ ${AMENITY_LABELS[amenityType]} (Forecast)!`, "#fbbf24");
      setTimeout(() => triggerArtistOnMicrotrendBonus(pid), 60);
      checkMicrotrendCredit(pid);
      const fresh = popAmenityFromBag(claimedTrend);
      setNextAmenityMicrotrend(fresh);
    }
  };

  const placeAmenityCounter = (amenityType, fieldIdx = 0) => {
    recalcAfterUpdate(currentPlayerId, pd => mutateAmenity(pd, fieldIdx, amenityType, +1));
    addLog(currentPlayer.festivalName, `built ${AMENITY_LABELS[amenityType]}`);
    setLastActionFor(currentPlayerId, `built ${AMENITY_LABELS[amenityType]} ${AMENITY_ICONS[amenityType] || ""}`);
    checkSecurityVPBonus(currentPlayerId, amenityType);
    claimAmenityMicrotrend(currentPlayerId, amenityType);
    // v158: check whether this placement satisfies any shared contract on this field.
    // Defer to next tick so the setPlayerData update has flushed to playerDataRef.
    setTimeout(() => checkContractsForPlayer(currentPlayerId, fieldIdx), 100);
    sfx.placeAmenity();
    setTurnsLeft(p => ({ ...p, [currentPlayerId]: p[currentPlayerId] - 1 }));
    setTurnAction(null);
    setActionTaken(true);
  };

  const handleDiePick = (idx, dv) => {
    takeUndoSnapshot();
    if (dv === "fame") {
      // Fame die: gain +1 Fame this round, use turn, no placement
      const nd = [...dice]; nd.splice(idx, 1); setDice(nd);
      logFameGain(currentPlayerId, 1, "Fame die");
      setPlayerData(p => ({ ...p, [currentPlayerId]: { ...p[currentPlayerId], baseFame: Math.min(FAME_MAX, (p[currentPlayerId].baseFame || 0) + 1) } }));
      addLog(currentPlayer.festivalName, `rolled 🔥 Fame! +1 Fame this year`);
      trackGoalProgress(currentPlayerId, "fameDieRolls");
      showFloatingBonus("+1 🔥 Fame!", "#f97316");
      sfx.gainFame();
      setTurnsLeft(p => ({ ...p, [currentPlayerId]: p[currentPlayerId] - 1 })); setTurnAction(null); setActionTaken(true); setTimeout(() => recalcTickets(), 50);
      return;
    }
    if (dv === "stage") {
      // v166: stage die: grant +1 stage progress. 2 progress = 1 stage-open credit.
      // Picking one uses a turn (same as picking any other die face). Even at max
      // stages (3), the pick still consumes the die from the shared pool (blocking
      // effect). Credits banked past max stages are dead weight — that's fine.
      const nd = [...dice]; nd.splice(idx, 1); setDice(nd);
      grantStageProgress(currentPlayerId, "Stage die");
      addLog(currentPlayer.festivalName, `picked the 🎪 Stage die`);
      showFloatingBonus("+1 🎪 Stage Progress!", "#4ade80");
      setTurnsLeft(p => ({ ...p, [currentPlayerId]: p[currentPlayerId] - 1 })); setTurnAction(null); setActionTaken(true); setTimeout(() => recalcTickets(), 50);
      return;
    }
    // v197.13: Bouncer Rights (sec_1) — the security leader can substitute which amenity
    // they receive when picking an amenity die. We show a modal listing all 4 amenity
    // types; whichever the player picks becomes the placement. AI auto-picks the type
    // they currently have LEAST of (basic economic heuristic). Skip modal if player is AI.
    if (hasInfraReward(currentPlayerId, "sec_1")) {
      const isAI = currentPlayer?.isAI;
      if (isAI) {
        // Auto-pick amenity type with lowest current count
        const am = playerData[currentPlayerId]?.amenities || {};
        const types = ["campsite", "portaloo", "security", "catering"];
        types.sort((a, b) => (am[a] || 0) - (am[b] || 0));
        const chosenType = types[0];
        const nd = [...dice]; nd.splice(idx, 1); setDice(nd);
        addLog(currentPlayer.festivalName, `Bouncer Rights: chose ${AMENITY_LABELS[chosenType]} (substituting from ${AMENITY_LABELS[dv]})`);
        // v197.12: Traffic Flow (port_2) — draw 1 artist on amenity pick.
        if (hasInfraReward(currentPlayerId, "port_2")) {
          const drawn = drawFromDeck(1);
          if (drawn.length > 0) {
            setPlayerData(p => ({ ...p, [currentPlayerId]: { ...p[currentPlayerId], hand: [...(p[currentPlayerId].hand || []), ...drawn] } }));
            addLog("🏗️ Reward", `${currentPlayer.festivalName}: drew ${drawn[0].name} from Traffic Flow`);
          }
        }
        placeAmenityCounter(chosenType, 0);
        setSelectedDie(null);
        setPickingFieldFor(null);
        return;
      }
      // Human: open modal to pick amenity type
      setSec1Choice({ pid: currentPlayerId, dieIdx: idx, origType: dv });
      return;
    }
    // v197.12: Traffic Flow (port_2) — the portaloo leader draws 1 artist when picking
    // an amenity die (campsite/portaloo/security/catering — not fame/stage).
    if (hasInfraReward(currentPlayerId, "port_2")) {
      const drawn = drawFromDeck(1);
      if (drawn.length > 0) {
        setPlayerData(p => ({ ...p, [currentPlayerId]: { ...p[currentPlayerId], hand: [...(p[currentPlayerId].hand || []), ...drawn] } }));
        addLog("🏗️ Reward", `${currentPlayer.festivalName}: drew ${drawn[0].name} from Traffic Flow (Most Portaloos)`);
      }
    }
    // v189: single field per player — auto-place, no field picker step
    const nd = [...dice]; nd.splice(idx, 1); setDice(nd);
    placeAmenityCounter(dv, 0);
    setSelectedDie(null);
    setPickingFieldFor(null);
  };
  // v166: handleChoiceSelect removed — compound faces no longer exist.
  // Called when user clicks a field on PlayerBoard while pickingFieldFor is set
  const handleFieldClickForPlacement = (fieldIdx) => {
    if (pickingFieldFor == null || selectedDie == null) return;
    const amenityType = pickingFieldFor;
    const dieIdx = selectedDie;
    // Remove the die, then place into chosen field
    const nd = [...dice]; nd.splice(dieIdx, 1); setDice(nd);
    placeAmenityCounter(amenityType, fieldIdx);
    setSelectedDie(null);
    setPickingFieldFor(null);
  };
  const cancelFieldPlacement = () => {
    setSelectedDie(null);
    setPickingFieldFor(null);
  };
  const handleRerollDice = () => {
    const fresh = rollDice();
    setDice(fresh);
    addLog("Dice", "Rerolled all amenity dice");
    grantCat1IfEligible(currentPlayerId, fresh);
  };
  const handleMoveAmenity = () => { /* moveAmenity removed — amenities are now counters */ };
  const handleArtistAction = () => { takeUndoSnapshot(); setTurnAction("artist"); setArtistAction(null); setSelectedArtist(null); setSelectedStageIdx(null); };

  /** Take a full undo snapshot of all mutable game state */
  const takeUndoSnapshot = () => {
    setUndoSnapshot({
      playerData: JSON.parse(JSON.stringify(playerData)),
      dice: [...dice],
      turnsLeft: { ...turnsLeft },
      artistPool: JSON.parse(JSON.stringify(artistPool)),
      artistDeck: JSON.parse(JSON.stringify(artistDeck)),
      discardPile: JSON.parse(JSON.stringify(discardPile)),
      microtrends: JSON.parse(JSON.stringify(microtrends)),
      nextMicrotrend: nextMicrotrend ? JSON.parse(JSON.stringify(nextMicrotrend)) : null,
      goalProgress: JSON.parse(JSON.stringify(goalProgress)),
      goalReq1Claimed: JSON.parse(JSON.stringify(goalReq1Claimed)),
      activeGoals: JSON.parse(JSON.stringify(activeGoals)),
      goalClaimsRef: { ...goalClaimsRef.current },
    });
  };

  const handleUndo = () => {
    if (!undoSnapshot) return;
    setPlayerData(undoSnapshot.playerData);
    setDice(undoSnapshot.dice);
    setTurnsLeft(undoSnapshot.turnsLeft);
    setArtistPool(undoSnapshot.artistPool);
    setArtistDeck(undoSnapshot.artistDeck);
    setDiscardPile(undoSnapshot.discardPile);
    setMicrotrends(undoSnapshot.microtrends);
    if (undoSnapshot.goalProgress) setGoalProgress(undoSnapshot.goalProgress);
    if (undoSnapshot.goalReq1Claimed) setGoalReq1Claimed(undoSnapshot.goalReq1Claimed);
    if (undoSnapshot.activeGoals) setActiveGoals(undoSnapshot.activeGoals);
    if (undoSnapshot.goalClaimsRef) goalClaimsRef.current = undoSnapshot.goalClaimsRef;
    setActionTaken(false);
    setTurnAction(null);
    setSelectedArtist(null);
    setArtistAction(null);
    setPendingEffect(null);
    setPendingEffectPid(null);
    setPendingPortalooRefresh(0);
    setUndoSnapshot(null);
    addLog(currentPlayer?.festivalName, "↩️ Undid last action");
    setTimeout(() => recalcTickets(), 50);
  };

  // ─── Artist booking/reserving ───
  const handleBookFromPool = (idx) => {
    const artist = artistPool[idx];
    // Widened gate (v124): allow if amenities cover OR if any open stage supports the
    // genre-match headliner path. Per-stage validation happens in handleStageSelect.
    if (!canBookArtistAnywhere(artist, currentPD)) return;
    const avail = currentPD.stages.map((_, i) => (currentPD.stageArtists?.[i] || []).length < 3 ? i : -1).filter(i => i >= 0);
    if (avail.length === 0) return;
    setSelectedArtist({ artist, source: "pool", poolIdx: idx }); setArtistAction("pickStage");
  };
  const handleBookFromHand = (idx) => {
    const artist = currentPD.hand[idx];
    // canAffordArtistOrFree handles pending-effect free bookings; widen for genre-match too.
    if (!(canAffordArtistOrFree(artist, currentPD) || canBookArtistAnywhere(artist, currentPD))) return;
    const avail = currentPD.stages.map((_, i) => (currentPD.stageArtists?.[i] || []).length < 3 ? i : -1).filter(i => i >= 0);
    if (avail.length === 0) return;
    setSelectedArtist({ artist, source: "hand", handIdx: idx }); setArtistAction("pickStage");
  };
  const handleBookFromDiscard = () => {
    if (discardPile.length === 0) return;
    const artist = discardPile[discardPile.length - 1]; // top of discard
    if (!canBookArtistAnywhere(artist, currentPD)) return;
    const avail = currentPD.stages.map((_, i) => (currentPD.stageArtists?.[i] || []).length < 3 ? i : -1).filter(i => i >= 0);
    if (avail.length === 0) return;
    setSelectedArtist({ artist, source: "discard", discardIdx: discardPile.length - 1 }); setArtistAction("pickStage");
  };
  // ── Council drawArtists bonus ──────────────────────────────────────────────
  // Fires every time a player completes a "draw" action (pool pickup, deck draw, or sign-two).
  // Pulls +N additional artists from the deck and adds them to the player's hand,
  // where N is the year-scaled total across all qualifying drawArtists councils.
  const applyDrawArtistsBonus = (pid) => {
    const cur = playerDataRef.current?.[pid] || playerData[pid];
    if (!cur) return [];
    const bonus = totalCouncilRewardOfType(cur, year, "drawArtists");
    if (bonus <= 0) return [];
    const drawn = drawFromDeck(bonus);
    if (drawn.length === 0) return [];
    const festival = players.find(p => p.id === pid)?.festivalName || "?";
    const names = drawn.map(a => a.name).join(", ");
    setPlayerData(p => ({ ...p, [pid]: { ...p[pid], hand: [...(p[pid].hand || []), ...drawn] } }));
    drawn.forEach(() => trackGoalProgress(pid, "artistsSigned"));
    addLog(festival, `📋 Council bonus: +${drawn.length} artist${drawn.length === 1 ? "" : "s"} from deck (${names})`);
    showFloatingBonus(`📋 +${drawn.length} 🎤 Council bonus!`, "#86efac");
    // For human player: show a celebratory popup with the actual drawn cards.
    // AI players skip the modal — the addLog entry is enough since AI auto-advances.
    const isHuman = !players.find(p => p.id === pid)?.isAI;
    if (isHuman) {
      setShowCouncilDrawBonus({ drawn, festival, pid });
      sfx.gainTickets();
    }
    return drawn;
  };

  const handleReserveFromPool = (idx) => {
    const artist = artistPool[idx];
    const newPool = [...artistPool]; newPool.splice(idx, 1);
    setPlayerData(p => ({ ...p, [currentPlayerId]: { ...p[currentPlayerId], hand: [...p[currentPlayerId].hand, artist] } }));
    setArtistPool(newPool);
    addLog(currentPlayer.festivalName, `picked up ${artist.name} from pool`);
    setLastActionFor(currentPlayerId, `pulled ${artist.name} from the pool`);
    trackGoalProgress(currentPlayerId, "artistsSigned");
    // Council reward: drawArtists councils give +N additional artists from the deck
    applyDrawArtistsBonus(currentPlayerId);
    setTurnsLeft(p => ({ ...p, [currentPlayerId]: p[currentPlayerId] - 1 })); setTurnAction(null); setActionTaken(true); setArtistAction(null);
    setTimeout(() => recalcTickets(), 50);
  };

  // ── DRAW FLOW ──
  // v196: Fame-tiered draw. Player picks ONE path:
  //   Pool click  = take 1 pool artist (any Fame tier, always 1)
  //   Deck click  = draw N from deck where N depends on current Fame:
  //                   Fame 1-3 → 2 cards
  //                   Fame 4-5 → 3 cards
  // Mixing pool + deck within a single draw action is no longer allowed. This gives
  // Fame a real ongoing economic purpose (more deck throughput at high Fame) and closes
  // the "cherry-pick 2 pool artists per turn" loop that was fuelling 9-artist boards.
  // The draw2Picks state array is reused (for the reveal strip) but always fully populated
  // in a single call — no intermediate multi-click accumulation.
  const getDeckDrawCount = (pd) => ((pd?.fame || 0) >= 4 ? 3 : 2);
  const startDraw2 = () => {
    setDraw2Picks([]);
    setDraw2DeckCard(null);
    setArtistAction("draw2");
  };
  const draw2PickFromPool = (idx) => {
    const artist = artistPool[idx];
    if (!artist) return;
    if (isAgentClaimedByOther(artist.name, currentPlayerId)) {
      addLog(currentPlayer.festivalName, `🕵️ ${artist.name} is claimed by another agent — can't pick`);
      return;
    }
    const newPool = [...artistPool]; newPool.splice(idx, 1);
    setArtistPool(newPool);
    const picks = [artist];
    setDraw2Picks(picks);
    addLog(currentPlayer.festivalName, `picked ${artist.name} from pool`);
    setLastActionFor(currentPlayerId, `pulled ${artist.name} from the pool`);
    finishDraw2(picks);
  };
  const draw2PickFromDeck = () => {
    const pd = playerData[currentPlayerId] || {};
    const drawCount = getDeckDrawCount(pd);
    const drawn = drawFromDeck(drawCount);
    if (drawn.length === 0) { addLog("Deck", "No artists left!"); return; }
    // Drawing from deck = no undo (hidden information revealed) and no put back
    setUndoSnapshot(null);
    setDraw2Picks(drawn);
    const names = drawn.map(a => a.name).join(", ");
    addLog(currentPlayer.festivalName, `drew ${drawn.length} from deck (${names})`);
    setLastActionFor(currentPlayerId, `drew ${drawn.length} from the deck`);
    finishDraw2(drawn);
  };
  const finishDraw2 = (picks) => {
    setPlayerData(p => ({ ...p, [currentPlayerId]: { ...p[currentPlayerId], hand: [...p[currentPlayerId].hand, ...picks] } }));
    picks.forEach(() => trackGoalProgress(currentPlayerId, "artistsSigned"));
    // Council reward: drawArtists councils give +N additional artists from deck
    applyDrawArtistsBonus(currentPlayerId);
    setDraw2Picks([]); setDraw2DeckCard(null);
    setTurnsLeft(p => ({ ...p, [currentPlayerId]: p[currentPlayerId] - 1 })); setTurnAction(null); setActionTaken(true); setArtistAction(null);
    setTimeout(() => recalcTickets(), 50);
  };
  const handleReserveFromDeck = () => {
    // Draw 2 cards from deck
    const drawn = drawFromDeck(2);
    if (drawn.length === 0) { addLog("Deck", "No artists left to draw!"); return; }
    setDeckDrawnCard(drawn); // store array of 2 (or 1 if deck low)
    setDeckCardRevealed(false);
    setArtistAction("deckReveal");
  };
  const handleRevealDeckCard = () => { setDeckCardRevealed(true); };
  const handlePickDeckCard = (keepIdx) => {
    // Player picks which of the 2 drawn cards to keep
    const drawn = Array.isArray(deckDrawnCard) ? deckDrawnCard : [deckDrawnCard];
    const kept = drawn[keepIdx];
    const other = drawn.length > 1 ? drawn[1 - keepIdx] : null;
    setPlayerData(p => ({ ...p, [currentPlayerId]: { ...p[currentPlayerId], hand: [...p[currentPlayerId].hand, kept] } }));
    addLog(currentPlayer.festivalName, `drew ${kept.name} from deck`);
    trackGoalProgress(currentPlayerId, "artistsSigned");
    if (other && artistPool.length >= 1) {
      // Player must swap the unchosen card into a pool slot — bonus fires after swap concludes
      setDeckDrawnCard(other); // store the unchosen card
      setArtistAction("deckSwapPool"); // new step: pick which pool artist to replace
    } else if (other) {
      // Pool is empty — just add the other card to pool, then conclude
      setArtistPool(prev => [...prev, other]);
      setDeckDrawnCard(null); setDeckCardRevealed(false);
      applyDrawArtistsBonus(currentPlayerId);
      setTurnsLeft(p => ({ ...p, [currentPlayerId]: p[currentPlayerId] - 1 })); setTurnAction(null); setActionTaken(true); setArtistAction(null);
    } else {
      // Only drew 1 card (deck was low) — conclude
      setDeckDrawnCard(null); setDeckCardRevealed(false);
      applyDrawArtistsBonus(currentPlayerId);
      setTurnsLeft(p => ({ ...p, [currentPlayerId]: p[currentPlayerId] - 1 })); setTurnAction(null); setActionTaken(true); setArtistAction(null);
    }
    setTimeout(() => recalcTickets(), 50);
  };
  const handleDeckSwapPool = (poolIdx) => {
    // Swap the unchosen deck card into the pool, discarding the pool artist it replaces
    const unchosen = Array.isArray(deckDrawnCard) ? deckDrawnCard[0] : deckDrawnCard;
    const replaced = artistPool[poolIdx];
    const newPool = [...artistPool];
    newPool[poolIdx] = unchosen;
    setArtistPool(newPool);
    setDiscardPile(prev => [...prev, replaced]);
    addLog(currentPlayer.festivalName, `swapped ${unchosen.name} into pool, discarded ${replaced.name}`);
    setDeckDrawnCard(null); setDeckCardRevealed(false);
    applyDrawArtistsBonus(currentPlayerId);
    setTurnsLeft(p => ({ ...p, [currentPlayerId]: p[currentPlayerId] - 1 })); setTurnAction(null); setActionTaken(true); setArtistAction(null);
  };
  const handleConfirmDeckReserve = () => {
    // Legacy fallback — single card confirm (used by effects)
    const card = Array.isArray(deckDrawnCard) ? deckDrawnCard[0] : deckDrawnCard;
    if (!card) return;
    setPlayerData(p => ({ ...p, [currentPlayerId]: { ...p[currentPlayerId], hand: [...p[currentPlayerId].hand, card] } }));
    addLog(currentPlayer.festivalName, `reserved ${card.name} from deck`);
    trackGoalProgress(currentPlayerId, "artistsSigned");
    setDeckDrawnCard(null); setDeckCardRevealed(false);
    applyDrawArtistsBonus(currentPlayerId);
    setTurnsLeft(p => ({ ...p, [currentPlayerId]: p[currentPlayerId] - 1 })); setTurnAction(null); setActionTaken(true); setArtistAction(null);
  };
  const handleStageSelect = (stageIdx) => {
    if (!selectedArtist) return;
    const { artist, source, poolIdx, handIdx, discardIdx } = selectedArtist;
    // v124: per-stage legality check. The selected stage must satisfy EITHER the amenity
    // path or the genre-match headliner path. If neither, refuse with a targeted log line.
    const stageEligible = canBookArtistOnStage(artist, currentPD, stageIdx);
    const pendingFreeAllowed = pendingEffect && pendingEffect.type === "signArtist" && pendingEffectPid === currentPlayerId;
    if (!stageEligible && !pendingFreeAllowed) {
      // Diagnose why for a helpful message
      if (currentPD.fame < artist.fame) {
        addLog(currentPlayer?.festivalName || "?", `Can't book ${artist.name} — need Fame ${artist.fame} (you have ${currentPD.fame})`);
      } else {
        addLog(currentPlayer?.festivalName || "?", `Can't book ${artist.name} here — amenities short and stage doesn't have a genre-matching pair for headliner rule`);
      }
      showFloatingBonus(`Can't book on that stage`, "#ef4444");
      return;
    }
    // Detect which path is being used (for logging only; booking treats them identically)
    const usedGenrePath = !canAffordArtist(artist, currentPD, sec3Reduction(currentPlayerId)) && canBookHeadlinerViaGenre(artist, currentPD, stageIdx);
    // Dupe-guard: before consuming the source (hand/pool/discard), check that no player —
    // including the current one — already has this artist on a stage. If we discover the dupe
    // only inside bookArtistToStage's setPlayerData updater, the splice has already happened
    // and the card is lost. (This was the "Chaka Khan disappeared" bug.)
    const latestPD = playerDataRef.current || playerData;
    let dupeOwner = null;
    for (const [oid, opd] of Object.entries(latestPD)) {
      const bookedNames = (opd.stageArtists || []).flat().map(a => a.name);
      if (bookedNames.includes(artist.name)) { dupeOwner = oid; break; }
    }
    if (dupeOwner !== null) {
      const ownerName = players.find(p => p.id === parseInt(dupeOwner))?.festivalName || "another player";
      addLog(currentPlayer?.festivalName || "?", `Can't book ${artist.name} — ${parseInt(dupeOwner) === currentPlayerId ? "already on your stage" : `already booked by ${ownerName}`}`);
      showFloatingBonus(`Can't book ${artist.name}`, "#ef4444");
      setArtistAction(null); setSelectedArtist(null); setSelectedStageIdx(null);
      return;
    }
    // Remove from source
    if (source === "pool") {
      const newPool = [...artistPool]; newPool.splice(poolIdx, 1); setArtistPool(newPool);
      // Pool does NOT auto-refresh anymore
    } else if (source === "hand") {
      setPlayerData(p => { const nh = [...p[currentPlayerId].hand]; nh.splice(handIdx, 1); return { ...p, [currentPlayerId]: { ...p[currentPlayerId], hand: nh } }; });
    }
    if (usedGenrePath) {
      // Player-visible confirmation of the alternative booking path.
      addLog(currentPlayer?.festivalName || "?", `🎸 Genre Match — ${artist.name} booked as headliner (no amenities required)`);
      showFloatingBonus("🎸 Genre Match!", "#fbbf24");
    }
    bookArtistToStage(artist, stageIdx, currentPlayerId, false, usedGenrePath);
    setTurnsLeft(p => ({ ...p, [currentPlayerId]: p[currentPlayerId] - 1 })); setTurnAction(null); setActionTaken(true); setArtistAction(null); setSelectedArtist(null); setSelectedStageIdx(null);
  };

  // ═══════════════════════════════════════════════════════════
  // END TURN / ROUND END
  // ═══════════════════════════════════════════════════════════
  const endTurn = () => {
    setUndoSnapshot(null);
    addLog(currentPlayer?.festivalName || "?", "ended their turn");
    // v190: freeze current turn actions as the "last turn" record for this player, then
    // clear the working buffer so their next turn starts fresh.
    setLastAction(prev => ({ ...prev, [currentPlayerId]: currentTurnActions[currentPlayerId] || [] }));
    setCurrentTurnActions(prev => ({ ...prev, [currentPlayerId]: [] }));
    setTurnAction(null); setSelectedDie(null); setPickingFieldFor(null); setActionTaken(false); setArtistAction(null); setSelectedArtist(null); setShowHand(false); setDeckDrawnCard(null); setDeckCardRevealed(false); setViewingPlayerId(null); setCouncilRefreshesUsedThisTurn(0); setCouncilDiceRefreshesUsedThisTurn(0);
    setPendingEffect(null); setPendingEffectPid(null); setPendingDiceRoll(null);
    setPlaysThisTurn(0); // v170: reset the per-turn play counter

    // Evaluate council objectives for current player before moving on
    evaluateCouncils(currentPlayerId);

    // v189: two-track microtrend replacement. Each claimed trend gets replaced by the
    // matching-type forecast (amenity → amenity forecast, genre → genre forecast), and a
    // fresh forecast is drawn from that type's bag.
    const claimedAmenity = microtrends.find(mt => mt.claimedBy !== null && mt.kind === "amenity");
    const claimedGenre = microtrends.find(mt => mt.claimedBy !== null && mt.kind === "genre");
    if (claimedAmenity || claimedGenre) {
      setMicrotrends(prev => prev.map(mt => {
        if (mt.claimedBy === null) return mt;
        if (mt.kind === "amenity" && nextAmenityMicrotrend) return nextAmenityMicrotrend;
        if (mt.kind === "genre" && nextGenreMicrotrend) return nextGenreMicrotrend;
        return mt.kind === "amenity" ? popAmenityFromBag() : popGenreFromBag();
      }));
      if (claimedAmenity && nextAmenityMicrotrend) {
        const promoted = nextAmenityMicrotrend;
        const fresh = popAmenityFromBag(promoted);
        setNextAmenityMicrotrend(fresh);
        addLog("🎵 Council Incentive", `Next: place a ${AMENITY_LABELS[fresh.amenity]}`);
      }
      if (claimedGenre && nextGenreMicrotrend) {
        const promoted = nextGenreMicrotrend;
        const fresh = popGenreFromBag(promoted);
        setNextGenreMicrotrend(fresh);
        addLog("🎵 Trending Genre", `Next: book a ${fresh.genre} artist`);
      }
    }

    const findNext = () => {
      const tl = turnsLeftRef.current;
      for (let i = currentPlayerIdx + 1; i < turnOrder.length; i++) if (tl[turnOrder[i]] > 0) return i;
      for (let i = 0; i < turnOrder.length; i++) if (tl[turnOrder[i]] > 0) return i;
      return -1;
    };
    const ni = findNext();
    if (ni < 0) { beginSpecialGuestPhase(); return; }

    // Safety net: catch any cross-hand duplicates from earlier in the game before
    // the next player picks up their turn. See dedupeAllCards comment for rationale.
    dedupeAllCards();

    // Refill pool to 5 before next player's turn
    refillPool();

    setCurrentPlayerIdx(ni);
    const np = players.find(p => p.id === turnOrder[ni]);
    addLogH(`${np?.festivalName || "?"}'s Turn`, "turn");

    // v130/v142: under tempt mode enforce hand cap of 8. HUMAN players get a picker
    // modal (they choose which cards to discard). AI keeps the auto-cull behavior (rank
    // by tickets + vp ascending, discard the cheapest ones). The reshuffle-on-empty deck
    // logic already handles putting the discard back into rotation when the deck runs out.
    if (temptModeRef.current) {
      const nextPid = turnOrder[ni];
      const npd = playerDataRef.current?.[nextPid] || playerData[nextPid] || {};
      const hand = npd.hand || [];
      if (hand.length > 8) {
        const overBy = hand.length - 8;
        const nextPlayer = players.find(p => p.id === nextPid);
        if (nextPlayer?.isAI) {
          const sorted = [...hand].map((a, i) => ({ a, i })).sort((x, y) => ((x.a.tickets || 0) + (x.a.vp || 0)) - ((y.a.tickets || 0) + (y.a.vp || 0)));
          const toDiscard = sorted.slice(0, overBy).map(x => x.a);
          const keepIdx = new Set(sorted.slice(overBy).map(x => x.i));
          const kept = hand.filter((_, i) => keepIdx.has(i));
          setPlayerData(p => ({ ...p, [nextPid]: { ...p[nextPid], hand: kept } }));
          setDiscardPile(prev => [...(prev || []), ...toDiscard]);
          addLog(np?.festivalName || "?", `Hand over 8 — auto-discarded ${toDiscard.length} artist${toDiscard.length === 1 ? "" : "s"}: ${toDiscard.map(a => a.name).join(", ")}`);
        } else {
          // Human: open the picker. The modal shows their whole hand and requires them
          // to click `overBy` cards to discard before the turn proceeds.
          setPendingHandDiscard({ pid: nextPid, needToDiscard: overBy });
        }
      }
    }

    // v147: if this player is holding a contest win from an earlier round, dequeue it
    // and open the stage-picker modal so they can place it now. Fires before showTurnStart
    // so the placement modal takes priority over the turn intro.
    if (pendingContestPlacements.length > 0) {
      const nextPid = turnOrder[ni];
      const idx = pendingContestPlacements.findIndex(e => e.pid === nextPid);
      if (idx >= 0) {
        const entry = pendingContestPlacements[idx];
        setPendingContestPlacements(prev => prev.filter((_, i) => i !== idx));
        setPendingAgentArtist({ pid: entry.pid, artist: entry.artist });
      }
    }

    setShowTurnStart(true);
  };

  /** Evaluate all council objectives for a player, update active states, grant first-time fame */
  function evaluateCouncils(pid) {
    setTimeout(() => recalcTickets(), 50); // councils are always active, just recalc benefits
  }

  /** Start the events phase — resolve events for each player */
  /** Start the Special Guest phase — check each player for eligible stages */
  const beginSpecialGuestPhase = () => {
    addLogH(`Year ${year} — Special Guests`, "round");
    sgSetupPidRef.current = null; // reset idempotency latch for new SG round
    setSpecialGuestPlayer(0);
    setSpecialGuestCard(null);
    setSpecialGuestDrawnPool([]);
    setSpecialGuestEligible([]);
    setPhase("specialGuest");
  };

  /** Check if a player qualifies for a special guest and set up their turn */
  function setupSpecialGuestForPlayer(pIdx) {
    // Idempotency: if we already ran setup for this pIdx, no-op. Prevents duplicate deck draws
    // when both the render fallback and the placeSpecialGuest/declineSpecialGuest setTimeout fire.
    if (sgSetupPidRef.current === pIdx) return;
    sgSetupPidRef.current = pIdx;
    const p = players[pIdx];
    if (!p) { beginYearEndEffectsPhase(); return; }
    const pd = playerData[p.id] || {};
    const sa = pd.stageArtists || [];
    // Find stages with exactly 2 artists (2/3 full)
    const eligible = [];
    sa.forEach((s, i) => { if (s.length === 2) eligible.push(i); });
    if (eligible.length === 0) {
      addLog("🌟 Special Guest", `${p.festivalName} has no qualifying stages.`);
      // Move to next player
      if (pIdx < players.length - 1) {
        setSpecialGuestPlayer(pIdx + 1);
        setTimeout(() => setupSpecialGuestForPlayer(pIdx + 1), 100);
      } else {
        beginYearEndEffectsPhase();
      }
      return;
    }
    // Draw from deck — 1 + council bonus
    const bonus = totalCouncilRewardOfType(pd, year, "drawSpecialGuests");
    const drawCount = 1 + bonus;
    const drawn = drawFromDeck(drawCount);
    if (drawn.length === 0) {
      addLog("🌟 Special Guest", `Deck empty — no special guest available.`);
      if (pIdx < players.length - 1) { setSpecialGuestPlayer(pIdx + 1); setTimeout(() => setupSpecialGuestForPlayer(pIdx + 1), 100); }
      else beginYearEndEffectsPhase();
      return;
    }
    if (drawn.length > 1) {
      // Council bonus active — show picker first
      addLog("🌟 Special Guest", `${p.festivalName} drew ${drawn.length} options (📋 Council bonus). Pick one.`);
      setSpecialGuestDrawnPool(drawn);
      setSpecialGuestCard(null);
    } else {
      setSpecialGuestDrawnPool([]);
      setSpecialGuestCard(drawn[0]);
    }
    setSpecialGuestEligible(eligible);
    setSpecialGuestPlayer(pIdx);
  }

  /** Player picks one of multiple drawn special guests; rest go to discard */
  function pickSpecialGuestFromPool(idx) {
    const drawn = specialGuestDrawnPool;
    if (!drawn || drawn.length === 0) return;
    const kept = drawn[idx];
    const discarded = drawn.filter((_, i) => i !== idx);
    if (discarded.length > 0) {
      setDiscardPile(prev => [...prev, ...discarded]);
      addLog("🌟 Special Guest", `Returned ${discarded.length} unused option${discarded.length === 1 ? "" : "s"} to discard`);
    }
    setSpecialGuestDrawnPool([]);
    setSpecialGuestCard(kept);
  }

  /** Check if player can afford the special guest (ignoring fame requirement) */
  function canAffordSpecialGuest(artist, pd) {
    // v134: Good For Business / VIPee / Plenty For Everyone grant persistent "free special
    // guests" — waive the amenity requirement entirely while any of those councils qualifies.
    // Effect application is also skipped at placement time to match the card text.
    const y = yearRef.current || year || 1;
    const councils = pd.councils || [];
    const fields = pd.fields || [];
    const hasFreeSG = councils.some((c, i) => c?.reward?.type === "freeSpecialGuests" && councilQualifies(c, fields[i], y));
    if (hasFreeSG) return true;
    const counts = { campsite: 0, portaloo: 0, security: 0, catering: 0, ...(pd.amenities || {}) };
    return counts.campsite >= (artist.campCost || 0) &&
      counts.security >= (artist.securityCost || 0) &&
      counts.catering >= (artist.cateringCost || 0) &&
      counts.portaloo >= (artist.portalooCost || 0);
  }

  // AI auto-handler for Special Guest phase. Covers:
  //  (a) the multi-draw council picker (pick best affordable, fallback most VP+tickets)
  //  (b) the regular place-or-decline decision (place on first eligible stage if affordable, else decline)
  useEffect(() => {
    if (phase !== "specialGuest") return;
    const p = players[specialGuestPlayer];
    if (!p?.isAI) return;
    const sgPd = playerData[p.id];
    if (!sgPd) return;

    // (a) Picker: choose from multi-draw pool
    if (specialGuestDrawnPool.length > 0 && !specialGuestCard) {
      let bestIdx = 0, bestScore = -Infinity;
      specialGuestDrawnPool.forEach((a, i) => {
        const aff = canAffordSpecialGuest(a, sgPd);
        // Affordability is huge (need to actually play it); break ties by VP + tickets
        const score = (aff ? 1000 : 0) + (a.vp || 0) * 5 + (a.tickets || 0);
        if (score > bestScore) { bestScore = score; bestIdx = i; }
      });
      const t = setTimeout(() => {
        addLog(p.festivalName, `🤖 picked ${specialGuestDrawnPool[bestIdx].name} from ${specialGuestDrawnPool.length} options`);
        pickSpecialGuestFromPool(bestIdx);
      }, 800);
      return () => clearTimeout(t);
    }

    // (b) Place or decline once a card is set
    if (specialGuestCard) {
      const affordable = canAffordSpecialGuest(specialGuestCard, sgPd);
      if (affordable && specialGuestEligible.length > 0) {
        // Pick the stage with the most existing tickets/VP from current artists
        let bestStage = specialGuestEligible[0], bestStageScore = -Infinity;
        for (const si of specialGuestEligible) {
          const sa = (sgPd.stageArtists || [])[si] || [];
          const score = sa.reduce((s, a) => s + (a.tickets || 0) + (a.vp || 0), 0);
          if (score > bestStageScore) { bestStageScore = score; bestStage = si; }
        }
        const t = setTimeout(() => placeSpecialGuest(bestStage), 800);
        return () => clearTimeout(t);
      } else {
        const t = setTimeout(() => declineSpecialGuest(), 800);
        return () => clearTimeout(t);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, specialGuestPlayer, specialGuestCard, specialGuestDrawnPool, specialGuestEligible]);

  /** Place special guest on a stage — no headliner effect, just tickets */
  function placeSpecialGuest(stageIdx) {
    const p = players[specialGuestPlayer];
    const artist = specialGuestCard;
    if (!p || !artist) return;
    // Defensive dupe-guard: although drawFromDeck filters in-use names, edge cases
    // (stale closures, race conditions, ref-sync timing) could still produce an artist
    // already booked elsewhere. If so, drop the guest instead of double-booking.
    const latestPD = playerDataRef.current || playerData;
    let dupeOwner = null;
    for (const [oid, opd] of Object.entries(latestPD)) {
      const booked = (opd.stageArtists || []).flat().map(a => a.name);
      if (booked.includes(artist.name)) { dupeOwner = oid; break; }
    }
    if (dupeOwner !== null) {
      const ownerName = players.find(pl => pl.id === parseInt(dupeOwner))?.festivalName || "another player";
      addLog("🌟 Special Guest", `${artist.name} is already booked by ${ownerName} — special guest skipped`);
      // Send the special guest card to discard so the deck doesn't keep yielding it
      setDiscardPile(prev => [...prev, artist]);
      setSpecialGuestCard(null);
      setSpecialGuestEligible([]);
      // Move to next player
      const nextIdx = specialGuestPlayer + 1;
      if (nextIdx < players.length) {
        setSpecialGuestPlayer(nextIdx);
        setTimeout(() => setupSpecialGuestForPlayer(nextIdx), 300);
      } else {
        setTimeout(() => beginYearEndEffectsPhase(), 300);
      }
      return;
    }
    // Add artist to stage as 3rd slot (headliner position) but without double effect
    setPlayerData(prev => {
      const pd = { ...prev[p.id] };
      const sa = [...(pd.stageArtists || [])];
      sa[stageIdx] = [...(sa[stageIdx] || []), artist];
      pd.stageArtists = sa;
      return { ...prev, [p.id]: pd };
    });
    const sName = (playerData[p.id]?.stageNames || [])[stageIdx] || `Stage ${stageIdx + 1}`;
    addLog("🌟 Special Guest", `${artist.name} appears as special guest at ${p.festivalName}'s ${sName}! +${artist.tickets} 🎟️`);
    showFloatingBonus(`🌟 ${artist.name}!`, "#fbbf24");
    showFloatingBonus(`+${artist.tickets} 🎟️`, "#4ade80");
    setSpecialGuestCard(null);
    setTimeout(() => recalcTickets(), 50);
    // v135: alt-objectives event — Friends in Special Places tracks special guest placements.
    // v196.2: also count as a normal artist play so Curated identity's -3-per-artist-over-6
    // penalty (and any other identity keying on artistsPlayedThisYear) sees the special guest.
    bumpYearEvent(p.id, "specialGuestPlacedThisYear");
    bumpYearEvent(p.id, "artistsPlayedThisYear");
    setTimeout(() => checkMidYearAchievements(p.id), 80);
    // v154: identity hook. Full of Surprises grants +4 tickets per successful special
    // guest play. Any identity keying off "played artist" fires here too, since a
    // special guest IS an artist play (though we mark it viaSpecialGuest so the
    // Full-of-Surprises normal-completion penalty doesn't misfire).
    applyIdentityOnPlay(p.id, artist, { viaSpecialGuest: true, stageBecameFull: true });
    // v154: Full of Surprises — if the player still has 2/3-full stages and there are
    // eligible draws left, loop back into another special guest opportunity for them
    // rather than advancing to the next player.
    const identityId = playerIdentitiesRef.current[p.id];
    if (identitiesModeRef.current && identityId === "full_of_surprises") {
      const latestPd = playerDataRef.current?.[p.id] || playerData[p.id] || {};
      const stillEligible = (latestPd.stageArtists || []).some(s => s.length === 2);
      if (stillEligible) {
        // Reset the idempotency guard so the next draw fires for the SAME player.
        sgSetupPidRef.current = null;
        setTimeout(() => setupSpecialGuestForPlayer(specialGuestPlayer), 500);
        return;
      }
    }
    // Advance to next player
    if (specialGuestPlayer < players.length - 1) {
      const next = specialGuestPlayer + 1;
      setSpecialGuestPlayer(next);
      setTimeout(() => setupSpecialGuestForPlayer(next), 600);
    } else {
      setTimeout(() => beginYearEndEffectsPhase(), 600);
    }
  }

  function declineSpecialGuest() {
    const p = players[specialGuestPlayer];
    const artist = specialGuestCard;
    if (artist) {
      setDiscardPile(prev => [...prev, artist]);
      addLog("🌟 Special Guest", `${p?.festivalName} declined ${artist.name}.`);
    }
    setSpecialGuestCard(null);
    // v154: Full of Surprises — declining doesn't consume the extra opportunities; loop
    // if they still have eligible stages and there are more cards to try.
    const identityId = playerIdentitiesRef.current[p?.id];
    if (identitiesModeRef.current && identityId === "full_of_surprises" && p) {
      const latestPd = playerDataRef.current?.[p.id] || playerData[p.id] || {};
      const stillEligible = (latestPd.stageArtists || []).some(s => s.length === 2);
      if (stillEligible) {
        sgSetupPidRef.current = null;
        setTimeout(() => setupSpecialGuestForPlayer(specialGuestPlayer), 300);
        return;
      }
    }
    if (specialGuestPlayer < players.length - 1) {
      const next = specialGuestPlayer + 1;
      setSpecialGuestPlayer(next);
      setTimeout(() => setupSpecialGuestForPlayer(next), 300);
    } else {
      setTimeout(() => beginYearEndEffectsPhase(), 300);
    }
  }

  // ═══════════════════════════════════════════════════════════
  // YEAR-END EFFECTS PHASE (interactive, before events)
  // ═══════════════════════════════════════════════════════════
  const beginYearEndEffectsPhase = () => {
    // Clear all agents — they don't carry over between years
    setAgentPlacements({});
    setAgentExhausted({});
    setAgentBonusUsesUsed({}); // reset bonus charges granted by "+N Agents" councils
    setPendingAgentAmenity([]);
    setPendingAgentArtist(null);
    setAgentContest(null);
    addLog("🕵️ Agents", "All agents recalled — year end");
    
    // Evaluate councils first so ticket counts are final
    players.forEach(p => evaluateCouncils(p.id));
    // Gather all year-end effects for all players
    const allEffects = {};
    let anyEffects = false;
    players.forEach(p => {
      const pd = playerData[p.id];
      if (!pd) return;
      const effects = [];
      // First — surface year-end agent effects. If the player booked an artist via
      // agent this year AND that artist's agentEffect contains "+N VP at Year End",
      // emit an autoVP entry. The artist must still be on a stage (i.e. not unbooked
      // somehow); we cross-reference against current stage artists.
      const agentBooked = agentBookedThisYear[p.id] || [];
      const onStageNames = new Set((pd.stageArtists || []).flat().map(a => a.name));
      agentBooked.forEach(name => {
        if (!onStageNames.has(name)) return; // artist no longer on stage, skip
        const a = (pd.stageArtists || []).flat().find(x => x.name === name);
        if (!a || !a.agentEffect) return;
        const ae = a.agentEffect;
        if (!/year\s*end/i.test(ae)) return;
        const vpMatch = ae.match(/\+(\d+)\s*(?:VP|tickets?)/i);
        if (vpMatch) {
          const vp = parseInt(vpMatch[1]);
          effects.push({ artist: a, type: "autoVP", desc: `🕵️ Agent claim: +${vp} VP`, autoVP: vp });
        }
      });
      (pd.stageArtists || []).forEach(sa => sa.forEach(a => {
        const eff = (a.effect || "").toLowerCase();
        if (!eff.includes("year end")) return;
        const rawEff = a.effect || "";
        if (eff.includes("roll all") && eff.includes("unique amenity")) {
          effects.push({ artist: a, type: "rollUnique", desc: "Roll all 5 dice — +1 VP per unique amenity" });
        } else if (eff.includes("roll all") && eff.includes("most common")) {
          effects.push({ artist: a, type: "rollCommon", desc: "Roll all 5 dice — +1 VP per most common result" });
        } else if (eff.includes("vp / fame gained")) {
          effects.push({ artist: a, type: "fameVP", desc: `+1 VP per Fame gained (${pd.baseFame || 0} Fame)`, autoVP: pd.baseFame || 0 });
        } else if (eff.includes("vp if you have the highest fame")) {
          const myFame = pd.fame || 0; const myTickets = pd.tickets || 0;
          const isHighestFame = players.every(op => op.id === p.id || (playerData[op.id]?.fame || 0) <= myFame);
          if (isHighestFame) {
            const isHighestTickets = players.every(op => op.id === p.id || (playerData[op.id]?.tickets || 0) <= myTickets);
            const bonus = isHighestTickets ? 4 : 1;
            effects.push({ artist: a, type: "autoVP", desc: `Highest Fame${isHighestTickets ? " + most tickets" : ""} → +${bonus} VP`, autoVP: bonus });
          }
        } else if (eff.includes("vp / 3 amenities")) {
          const am = pd.amenities || {};
          const total = (am.campsite || 0) + (am.security || 0) + (am.catering || 0) + (am.portaloo || 0);
          const amVP = Math.floor(total / 3);
          if (amVP > 0) effects.push({ artist: a, type: "autoVP", desc: `${total} amenities / 3 = +${amVP} VP`, autoVP: amVP });
        } else if (eff.includes("vp / council objective")) {
          // Council objectives removed — this effect now does nothing
        } else if (eff.includes("1vp per existing campsite") || eff.includes("1 vp per existing campsite")) {
          const camps = (pd.amenities?.campsite) || 0;
          if (camps > 0) effects.push({ artist: a, type: "autoVP", desc: `${camps} campsite${camps>1?"s":""} = +${camps} VP`, autoVP: camps });
        } else if (eff.includes("vp / hip hop artist")) {
          const hhCount = (pd.stageArtists || []).flat().filter(ba => ba.genre && ba.genre.includes("Hip Hop")).length;
          if (hhCount > 0) effects.push({ artist: a, type: "autoVP", desc: `${hhCount} Hip Hop artist${hhCount>1?"s":""} = +${hhCount} VP`, autoVP: hhCount });
        }
        // v169: NEW year-end scaling patterns from the deck refresh
        // v197: Coldplay divisor changed 5→10; Foo Fighters changed from "per 2 amenities +2"
        // to "per 3 amenities +1". Kendrick unchanged (per security × 3).
        // Coldplay: v197.5 — "For every 12 tickets before Year End: +1 ticket" (was /10)
        else if (eff.includes("for every 12 tickets before year end")) {
          const currentTix = pd.tickets || 0;
          const bonus = Math.floor(currentTix / 12);
          if (bonus > 0) effects.push({ artist: a, type: "autoVPTix", desc: `${currentTix} tickets / 12 = +${bonus} tickets`, autoVP: 0, autoTix: bonus });
        }
        // Foo Fighters: v197.5 — "For every 3 amenities you own: +2 ticket(s)" (was ×3)
        else if (eff.includes("for every 3 amenities you own")) {
          const am = pd.amenities || {};
          const total = (am.campsite || 0) + (am.security || 0) + (am.catering || 0) + (am.portaloo || 0);
          const bonus = Math.floor(total / 3) * 2;
          if (bonus > 0) effects.push({ artist: a, type: "autoVPTix", desc: `${total} amenities / 3 × 2 = +${bonus} tickets`, autoVP: 0, autoTix: bonus });
        }
        // Kendrick Lamar: v197.2 — "For each security you own: +2 ticket(s)" (was ×3)
        else if (eff.includes("for each security you own")) {
          const sec = (pd.amenities?.security) || 0;
          const bonus = sec * 2;
          if (bonus > 0) effects.push({ artist: a, type: "autoVPTix", desc: `${sec} security × 2 = +${bonus} tickets`, autoVP: 0, autoTix: bonus });
        }
        else {
          // Generic year-end: -VP / sell tickets
          const vpLoss = rawEff.match(/Year End:.*-(\d+)\s*(?:VP|tickets?)/i);
          const sellTix = rawEff.match(/Year End:.*[Ss]ell\s+(\d+)\s+tickets?/i);
          if (vpLoss || sellTix) {
            const vp = vpLoss ? -parseInt(vpLoss[1]) : 0;
            const tix = sellTix ? parseInt(sellTix[1]) : 0;
            effects.push({ artist: a, type: "autoVPTix", desc: `${vpLoss ? `-${vpLoss[1]} VP` : ""}${vpLoss && sellTix ? " / " : ""}${sellTix ? `+${sellTix[1]} tickets` : ""}`, autoVP: vp, autoTix: tix });
          }
        }
      }));
      allEffects[p.id] = effects;
      // v197.12: "Sold Out" (camp_2) — the campsite leader gets a flat +12 tickets at
      // year-end, regardless of any artist effects. Injected as a synthetic effect on
      // a stand-in "Reward" pseudo-artist so it flows through the normal display machinery.
      // v197.15: include all fields ArtistCard reads — missing `genre` was crashing
      // getGenres(undefined) at the year-end effects display.
      if (hasInfraReward(p.id, "camp_2")) {
        effects.push({
          artist: {
            name: "🏗️ Sold Out (Most Campsites)",
            fame: 0, tickets: 12, vp: 0,
            genre: "Reward",
            campCost: 0, securityCost: 0, cateringCost: 0, portalooCost: 0,
            effect: "Infrastructure Reward — see game log for details",
          },
          type: "autoVPTix",
          desc: "Year End: +12 tickets from Sold Out reward",
          autoVP: 0, autoTix: 12,
        });
      }
      if (effects.length > 0) anyEffects = true;
    });

    if (!anyEffects) {
      // No year-end artist effects — but still need fresh tickets/fame snapshot for positional grants
      const prev = playerDataRef.current || {};
      const fresh = {};
      Object.keys(prev).forEach(pid => { fresh[pid] = computeTicketsForPlayer(prev[pid], undefined, pid); });
      setPlayerData(fresh);
      playerDataRef.current = fresh;
      beginStarDicePhase();
      return;
    }

    // Store effects and start phase
    setYearEndEffectsList(allEffects);
    setYearEndEffectsPlayer(0);
    setYearEndEffectIdx(0);
    setYearEndDiceRoll(null);
    setPhase("yearEndEffects");
  };

  const resolveYearEndEffect = (result) => {
    try {
      const pid = players[yearEndEffectsPlayer]?.id;
      const effects = yearEndEffectsList[pid] || [];
      const effect = effects[yearEndEffectIdx];
      if (!effect || !pid) { advanceYearEndEffect(); return; }

      // Apply the result
      if (effect.type === "autoVP" || effect.type === "fameVP") {
        logTicketGain(pid, (effect.autoVP || 0), `Year End: ${effect.artist?.name || "?"}`);
        setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: Math.max(0, (p[pid].bonusTickets || 0) + (effect.autoVP || 0)) } }));
        addLog("🎸 Year End", `${players[yearEndEffectsPlayer]?.festivalName}: ${effect.artist?.name} → +${effect.autoVP} 🎟️ tickets`);
      } else if (effect.type === "autoVPTix") {
        // v126: autoVPTix used to add separate VP + tickets amounts. With the unified score
        // both go into bonusTickets in one merged addition.
        logTicketGain(pid, ((effect.autoVP || 0) + (effect.autoTix || 0)), `Year End: ${effect.artist?.name || "?"}`);
        setPlayerData(p => ({
          ...p, [pid]: {
            ...p[pid],
            bonusTickets: Math.max(0, (p[pid].bonusTickets || 0) + (effect.autoVP || 0) + (effect.autoTix || 0)),
          }
        }));
        addLog("🎸 Year End", `${players[yearEndEffectsPlayer]?.festivalName}: ${effect.artist?.name} → ${effect.desc}`);
      } else if (effect.type === "rollUnique" || effect.type === "rollCommon") {
        if (result?.vp) {
          logTicketGain(pid, result.vp, `Year End: ${effect.artist?.name || "?"}`);
          setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + result.vp } }));
          addLog("🎸 Year End", `${players[yearEndEffectsPlayer]?.festivalName}: ${effect.artist?.name} → +${result.vp} 🎟️ tickets`);
        }
      }

      // Advance to next effect or next player
      advanceYearEndEffect();
    } catch (err) {
      console.error("resolveYearEndEffect error:", err);
      advanceYearEndEffect();
    }
  };

  const advanceYearEndEffect = () => {
    try {
      const pid = players[yearEndEffectsPlayer]?.id;
      const effects = yearEndEffectsList[pid] || [];
      if (yearEndEffectIdx < effects.length - 1) {
        setYearEndEffectIdx(yearEndEffectIdx + 1);
        setYearEndDiceRoll(null);
      } else {
        // Next player with effects
        let nextPlayer = yearEndEffectsPlayer + 1;
        while (nextPlayer < players.length && (yearEndEffectsList[players[nextPlayer]?.id] || []).length === 0) nextPlayer++;
        if (nextPlayer < players.length) {
          setYearEndEffectsPlayer(nextPlayer);
          setYearEndEffectIdx(0);
          setYearEndDiceRoll(null);
        } else {
          // All done — go to events
          // All year-end artist effects done — recompute tickets/fame and transition to star dice phase.
          //
          // v195 fix: year-end ticket bonuses (Kendrick, Coldplay, Foo Fighters year-end
          // scalers) were being LOST between the effect popup and the leaderboard reveal.
          // Root cause: previous version read `playerDataRef.current` and called
          // `setPlayerData(fresh)` with a plain-object replacement. If the last click's
          // `setPlayerData(p => bonusTickets += N)` update hadn't yet propagated to the
          // ref (via the useEffect that syncs it), then `fresh` was built from stale
          // state without the +N. React would then apply the two queued updates in order:
          // the functional +N first, then the plain-object replacement — which REPLACED
          // the state with `fresh`, wiping the +N.
          //
          // Fix: use functional setPlayerData so the updater sees the ACTUAL latest
          // committed state (with all queued year-end additions), not the potentially
          // stale ref. Recompute inside the updater, sync the ref inside the updater
          // so beginStarDicePhase (called synchronously after) reads the fresh ref.
          setTimeout(() => {
            try {
              setPlayerData(prev => {
                const fresh = {};
                Object.keys(prev).forEach(pid => { fresh[pid] = computeTicketsForPlayer(prev[pid], undefined, pid); });
                playerDataRef.current = fresh;
                return fresh;
              });
              beginStarDicePhase();
            } catch(e) {
              console.error("beginStarDicePhase error:", e);
              setPhase("game");
            }
          }, 100);
        }
      }
    } catch (err) {
      console.error("advanceYearEndEffect error:", err);
      // Force progression to events phase
      setTimeout(() => { try { beginStarDicePhase(); } catch(e) { console.error("forced beginStarDicePhase error:", e); } }, 100);
    }
  };

  // ─── STAR DICE PHASE ───
  // Atomic check + grant for stage-fill triggers (the only "immediate" dice trigger).
  // Fame triggers are removed — fame now only earns dice via the year-end positional reward.
  function checkAndClaimDice(pid) {
    const cur = playerData[pid];
    if (!cur) return;
    const filled = (cur.stageArtists || []).filter(sa => sa.length === 3).length;
    const filledHW = cur.filledStagesHighWater || 0;
    const owed = Math.max(0, filled - filledHW);
    if (owed === 0) return;

    setDicePool(prevPool => {
      const granted = Math.min(owed, prevPool);
      if (granted > 0) {
        const pName = players.find(pl => pl.id === pid)?.festivalName || "?";
        addLog("🎲", `${pName} gained ${granted} Star Die${granted === 1 ? "" : "s"} (Stage filled) — ${prevPool - granted} left in pool`);
      }
      setPlayerData(prevPD => {
        const c = prevPD[pid];
        if (!c) return prevPD;
        return {
          ...prevPD,
          [pid]: {
            ...c,
            heldDice: (c.heldDice || 0) + granted,
            filledStagesHighWater: filled,
          }
        };
      });
      return prevPool - granted;
    });
  }

  // Council star dice grants: at year-start AND on amenity placement, check each council.
  // Per-(field, year) latch: pd.councilDiceGrantedThisYear[fIdx] = true once granted, reset each year.
  function checkAndClaimCouncilDice(pid) {
    const cur = playerData[pid];
    if (!cur) return;
    const councils = cur.councils || [];
    const fields = cur.fields || emptyFields();
    const granted = cur.councilDiceGrantedThisYear || [false, false, false];
    const yIdx = Math.max(0, Math.min(3, (year || 1) - 1));
    for (let fIdx = 0; fIdx < councils.length; fIdx++) {
      const c = councils[fIdx];
      if (!c) continue;
      if (c._claimed) continue; // v163: contracts already fired once on claim — do not re-fire
      if (c.reward?.type !== "starDice") continue;
      if (granted[fIdx]) continue;
      if (!councilQualifies(c, fields[fIdx], year || 1)) continue;
      const amount = c.reward.perYear[yIdx] || 0;
      if (amount <= 0) continue;
      // Capture for closure
      const fIdxClosure = fIdx;
      const owed = amount;
      setDicePool(prevPool => {
        const got = Math.min(owed, prevPool);
        if (got > 0) {
          const pName = players.find(pl => pl.id === pid)?.festivalName || "?";
          addLog("🎲", `${pName} gained ${got} Star Die${got === 1 ? "" : "s"} (Council: ${c.name}, F${fIdxClosure + 1}) — ${prevPool - got} left in pool`);
        }
        setPlayerData(prevPD => {
          const cc = prevPD[pid];
          if (!cc) return prevPD;
          const flags = [...(cc.councilDiceGrantedThisYear || [false, false, false])];
          flags[fIdxClosure] = true;
          return {
            ...prevPD,
            [pid]: {
              ...cc,
              heldDice: (cc.heldDice || 0) + got,
              councilDiceGrantedThisYear: flags,
            }
          };
        });
        return prevPool - got;
      });
    }
  }

  // v146: parallel to checkAndClaimCouncilDice, for the placeAmenity reward type
  // (Muscle Food = +1 Portaloo, Neighbourhood Watch = +1 Catering). Once per (field, year)
  // when the council qualifies, adds the specified amenity to the field. Latched via
  // pd.councilAmenityGrantedThisYear[fIdx].
  function checkAndClaimCouncilAmenity(pid) {
    const cur = playerData[pid];
    if (!cur) return;
    const councils = cur.councils || [];
    const fields = cur.fields || emptyFields();
    const granted = cur.councilAmenityGrantedThisYear || [false, false, false];
    for (let fIdx = 0; fIdx < councils.length; fIdx++) {
      const c = councils[fIdx];
      if (!c) continue;
      if (c._claimed) continue; // v163: contracts already fired on claim
      if (c.reward?.type !== "placeAmenity") continue;
      if (granted[fIdx]) continue;
      if (!councilQualifies(c, fields[fIdx], year || 1)) continue;
      const amenity = c.reward.amenity;
      if (!amenity) continue;
      const fIdxClosure = fIdx;
      const pName = players.find(pl => pl.id === pid)?.festivalName || "?";
      setPlayerData(prevPD => {
        const cc = prevPD[pid];
        if (!cc) return prevPD;
        const flags = [...(cc.councilAmenityGrantedThisYear || [false, false, false])];
        flags[fIdxClosure] = true;
        const updated = mutateAmenity(cc, fIdxClosure, amenity, +1);
        return {
          ...prevPD,
          [pid]: { ...updated, councilAmenityGrantedThisYear: flags }
        };
      });
      addLog("📋 Council", `${pName} gained +1 ${AMENITY_LABELS[amenity]} (${c.name}, F${fIdxClosure + 1})`);
      showFloatingBonus(`+1 ${AMENITY_ICONS[amenity]} (${c.name})`, AMENITY_COLORS[amenity]);
    }
  }

  // Auto-trigger: stage-fill dice + council dice on relevant state changes.
  const diceTriggerLatchRef = useRef({});
  useEffect(() => {
    if (phase !== "game" && phase !== "preRound" && phase !== "objectiveChoice") return;
    for (const p of players) {
      const pd = playerData[p.id];
      if (!pd) continue;
      const filled = (pd.stageArtists || []).filter(sa => sa.length === 3).length;
      const fields = pd.fields || emptyFields();
      // Latch key includes per-field amenity counts (for council triggers)
      const fieldKey = fields.map(f => `${f.campsite}-${f.security}-${f.catering}-${f.portaloo}`).join("|");
      const key = `${filled}::${fieldKey}::${year}`;
      if (diceTriggerLatchRef.current[p.id] !== key) {
        diceTriggerLatchRef.current[p.id] = key;
        if (filled > (pd.filledStagesHighWater || 0)) {
          checkAndClaimDice(p.id);
        }
        // Council star dice — checked on every state change since amenity counts may have crossed thresholds
        checkAndClaimCouncilDice(p.id);
        // v146: parallel check for placeAmenity councils (Muscle Food, Neighbourhood Watch)
        checkAndClaimCouncilAmenity(p.id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerData, phase, year]);

  // AI resolve auto-trigger: useEffect deps ensure it only fires when phase/result actually change
  useEffect(() => {
    if (phase !== "starDice" || starRollPhase !== "resolving") return;
    const r = starRollResult;
    if (!r) return;
    const player = players.find(p => p.id === r.pid);
    if (!player?.isAI) return;

    if (r.decisions.length === 0) {
      const t = setTimeout(() => applyStarRoll(), 800);
      return () => clearTimeout(t);
    } else if (r.decisions.every(d => d.decision === 'absorb' || (d.decision === 'lose' && d.lostFromField != null))) {
      // Decisions all made (post-aiResolveStarRoll) — apply
      const t = setTimeout(() => applyStarRoll(), 600);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => aiResolveStarRoll(), 800);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, starRollPhase, starRollResult]);

  // AI intro auto-trigger: useEffect deps gate this to only run on (player, intro) entry
  useEffect(() => {
    if (phase !== "starDice" || starRollPhase !== "intro") return;
    const player = players[starRollPlayer];
    if (!player || !player.isAI) return;

    const pd = playerData[player.id] || {};
    if ((pd.heldDice || 0) === 0) {
      const t = setTimeout(() => {
        const empty = { pid: player.id, faces: [], stars: 0, amenityFaces: [], resolvable: [], ignored: 0, decisions: [] };
        applyStarRoll(empty);
      }, 600);
      return () => clearTimeout(t);
    } else {
      const t = setTimeout(() => performStarRoll(player.id), 800);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, starRollPhase, starRollPlayer]);

  // Grant positional star dice based on year-end stats. Called once per year-end before rolling.
  // - Most fame: +2 (sole) or +1 each (tied)
  // - Most tickets: +1 each (sole or tied)
  // - Least tickets (3+ players only): +1 each (sole or tied)
  //
  // Implementation notes (these guard against the bugs we hit before):
  // - Reads playerData & dicePool from refs (not closure) so values are fresh even when called
  //   from chained setTimeout callbacks during the year-end transition.
  // - Idempotent via positionalGrantedYearRef — re-entry on the same year is a no-op.
  // - All side effects (addLog, setPlayerData) happen OUTSIDE setDicePool's updater so React
  //   Strict Mode's double-invocation can't fire them twice.
  function grantPositionalDice() {
    if (positionalGrantedYearRef.current === year) return;
    positionalGrantedYearRef.current = year;

    const pdSnap = playerDataRef.current || {};
    const pids = players.map(p => p.id);
    const fame = {}, tickets = {};
    pids.forEach(pid => {
      fame[pid] = pdSnap[pid]?.fame || 0;
      tickets[pid] = pdSnap[pid]?.tickets || 0;
    });

    // Build the desired grant list based on snapshot
    const desired = [];
    const maxFame = Math.max(...pids.map(pid => fame[pid]));
    const fameLeaders = pids.filter(pid => fame[pid] === maxFame);
    const fameAward = fameLeaders.length === 1 ? 2 : 1;
    fameLeaders.forEach(pid => desired.push({ pid, count: fameAward, reason: `Most Fame (${maxFame})` }));
    const maxTickets = Math.max(...pids.map(pid => tickets[pid]));
    if (maxTickets > 0) {
      const ticketLeaders = pids.filter(pid => tickets[pid] === maxTickets);
      ticketLeaders.forEach(pid => desired.push({ pid, count: 1, reason: `Most Tickets (${maxTickets})` }));
    }
    if (pids.length >= 3) {
      const minTickets = Math.min(...pids.map(pid => tickets[pid]));
      if (minTickets < maxTickets) {
        const ticketLosers = pids.filter(pid => tickets[pid] === minTickets);
        ticketLosers.forEach(pid => desired.push({ pid, count: 1, reason: `Least Tickets (${minTickets})` }));
      }
    }

    if (desired.length === 0) return;

    // Drain the pool synchronously using the ref's current value
    let pool = dicePoolRef.current;
    const actualGrants = [];
    for (const g of desired) {
      const got = Math.min(g.count, pool);
      if (got > 0) {
        pool -= got;
        actualGrants.push({ ...g, granted: got, poolAfter: pool });
      }
    }
    if (actualGrants.length === 0) return;

    // Apply state changes — direct setDicePool with the computed value (no updater callback,
    // so Strict Mode can't double-invoke), single setPlayerData, then logs.
    setDicePool(pool);
    setPlayerData(prev => {
      const next = { ...prev };
      for (const g of actualGrants) {
        next[g.pid] = { ...next[g.pid], heldDice: (next[g.pid].heldDice || 0) + g.granted };
      }
      return next;
    });
    for (const g of actualGrants) {
      const pName = players.find(pl => pl.id === g.pid)?.festivalName || "?";
      addLog("🎲", `${pName} gained ${g.granted} Star Die${g.granted === 1 ? "" : "s"} (${g.reason}) — ${g.poolAfter} left in pool`);
    }
  }

  const beginStarDicePhase = () => {
    // v168: star dice removed from the game. This function is preserved because
    // multiple year-end code paths still call it, but it now bypasses the roll UI
    // and goes directly to the leaderboard reveal + year-end scoring.
    // v171: previously jumped straight to startNextYear, which bypassed the
    // game-over check (year >= totalYears). Now goes through beginRoundEnd, which
    // shows the leaderboard AND enforces the year cap via proceedFromRoundEnd.
    players.forEach(p => evaluateCouncils(p.id));
    setTimeout(() => beginRoundEnd(), 100);
  };

  // Roll N dice — returns array of face strings: "star" | "blank" | amenityType
  function rollStarDice(n) {
    const faces = [];
    for (let i = 0; i < n; i++) {
      const r = Math.floor(Math.random() * 6); // 0-5
      if (r < 3) faces.push("star");          // 3/6 = star
      else if (r < 5) faces.push("blank");    // 2/6 = blank
      else faces.push(AMENITY_TYPES[Math.floor(Math.random() * AMENITY_TYPES.length)]);
    }
    return faces;
  }

  // Star count → VP table (caps at 5+)
  // Star Dice VP — linear 0/2/4/6/8/10 (was [0,1,3,5,8,12]).
  const STAR_REWARD = [0, 2, 4, 6, 8, 10];
  function starVP(count) { return STAR_REWARD[Math.min(5, count)]; }

  const performStarRoll = (pid) => {
    const pd = playerData[pid];
    if (!pd) return;
    const n = pd.heldDice || 0;
    const faces = rollStarDice(n);
    const stars = faces.filter(f => f === "star").length;
    const amenityFaces = faces.filter(f => f !== "star" && f !== "blank");
    // For each amenity face, check if player owns any of that type — those without get auto-ignored
    const resolvable = amenityFaces.filter(t => (pd.amenities?.[t] || 0) > 0);
    const ignored = amenityFaces.length - resolvable.length;
    setStarRollResult({
      pid, faces, stars, amenityFaces, resolvable,
      ignored,
      decisions: resolvable.map(t => ({ amenity: t, decision: null, lostFromField: null })),
    });
    setStarRollPhase("rolling");
    setTimeout(() => setStarRollPhase("resolving"), 1200); // animation delay
  };

  // Apply final results: VP, lost amenities, return dice to pool
  // Accepts optional resultOverride to bypass closure-captured starRollResult — needed for paths
  // where setStarRollResult and applyStarRoll are scheduled together (the result update is queued
  // and won't reflect in the closure-captured value when applyStarRoll fires).
  const applyStarRoll = (resultOverride) => {
    const r = resultOverride || starRollResult;
    if (!r) return;
    const { pid, stars, decisions, faces } = r;
    const vpFromStars = starVP(stars);
    // Tally absorbed (security shields used)
    const absorbed = decisions.filter(d => d.decision === "absorb").length;
    // Build per-(field, amenity) loss counts using each decision's chosen field
    const lossesByField = decisions.filter(d => d.decision === "lose"); // [{amenity, lostFromField}, ...]
    // Mutate player data: VP, dice returned, amenity counters reduced
    setPlayerData(p => {
      const cur = p[pid];
      let updated = cur;
      lossesByField.forEach(d => {
        const fIdx = d.lostFromField != null ? d.lostFromField : 0;
        // Only decrement if the field actually has the amenity (defensive)
        if ((updated.fields?.[fIdx]?.[d.amenity] || 0) > 0) {
          updated = mutateAmenity(updated, fIdx, d.amenity, -1);
        }
      });
      logTicketGain(pid, vpFromStars, "Star dice roll");
      return { ...p, [pid]: {
        ...updated,
        bonusTickets: (updated.bonusTickets || 0) + vpFromStars,
        starDiceVPThisYear: (updated.starDiceVPThisYear || 0) + vpFromStars,
        heldDice: 0,
      } };
    });
    // Return dice to pool
    setDicePool(pool => pool + faces.length);
    // Track avoided count for "+tickets per neg star avoided" effects
    setNegStarFacesAvoidedThisYear(prev => ({ ...prev, [pid]: (prev[pid] || 0) + absorbed }));
    const pName = players.find(p => p.id === pid)?.festivalName || "?";
    const lostStr = lossesByField.map(d => `${AMENITY_LABELS[d.amenity]} (F${(d.lostFromField ?? 0) + 1})`).join(", ");
    addLog(pName, `🎲 Rolled ${stars} stars (+${vpFromStars} 🎟️ tickets)${absorbed ? `, absorbed ${absorbed}` : ""}${lostStr ? `, lost ${lostStr}` : ""}`);
    sfx.gainFame();
    // Advance to next player
    setStarRollResult(null);
    if (starRollPlayer < players.length - 1) {
      setStarRollPlayer(starRollPlayer + 1);
      setStarRollPhase("intro");
    } else {
      setStarRollPhase(null);
      setTimeout(() => beginRoundEnd(), 200);
    }
  };

  // AI auto-resolves star roll: absorb non-security amenity faces with security shields, lose what can't be absorbed.
  // For losses, AI picks field with most of that amenity (greedy — Build 7 will add smarter logic).
  // After updating decisions, the useEffect notices all decisions are set and schedules applyStarRoll.
  const aiResolveStarRoll = () => {
    const r = starRollResult;
    if (!r) return;
    const pid = r.pid;
    const pd = playerData[pid];
    let secShields = (pd.amenities?.security) || 0;
    // Track running field counts per amenity so we don't double-count after a loss
    const runningFields = (pd.fields || emptyFields()).map(f => ({ ...f }));
    const pickFieldForLoss = (amenityType) => {
      let bestIdx = 0, bestCount = runningFields[0]?.[amenityType] || 0;
      for (let f = 1; f < runningFields.length; f++) {
        const c = runningFields[f]?.[amenityType] || 0;
        if (c > bestCount) { bestCount = c; bestIdx = f; }
      }
      if (bestCount > 0) runningFields[bestIdx][amenityType] -= 1;
      return bestIdx;
    };
    const decisions = r.decisions.map(d => {
      if (d.amenity === "security") {
        // Security can't shield itself — must lose
        const fIdx = pickFieldForLoss(d.amenity);
        return { ...d, decision: "lose", lostFromField: fIdx };
      }
      if (secShields > 0) {
        secShields--;
        return { ...d, decision: "absorb", lostFromField: null };
      }
      const fIdx = pickFieldForLoss(d.amenity);
      return { ...d, decision: "lose", lostFromField: fIdx };
    });
    setStarRollResult({ ...r, decisions });
  };


  const beginRoundEnd = () => {
    try {
    // v154/v159: Curated identity fires BEFORE the ticket calc so this year's tickets
    // include the +N/−3N adjustment. Previously routed through applyIdentityAtYearEnd
    // which used setPlayerData (async) — the update didn't land before beginRoundEnd's
    // snapshot below, so Curated tickets were off by a year. Now we compute the delta,
    // record it in the identityLog + ticketsLog, AND apply it inline to the snap used
    // for this year's total.
    const curatedDeltas = {};
    if (identitiesModeRef.current) {
      const y = yearRef.current || year || 1;
      players.forEach(p => {
        const idId = playerIdentitiesRef.current[p.id];
        const identity = getIdentity(idId);
        if (!identity || identity.type !== "curated") return;
        const played = (yearEvents[p.id]?.artistsPlayedThisYear) || 0;
        const delta = played <= 6 ? played : -3 * (played - 6);
        if (delta === 0) return;
        const source = played <= 6
          ? `Identity: Curated (+1 per artist, ${played} played)`
          : `Identity: Curated (${played - 6} artists over cap)`;
        curatedDeltas[p.id] = { delta, source };
        // Log for hover + panel
        setIdentityLog(prev => ({ ...prev, [p.id]: [...(prev[p.id] || []), { source, amount: delta, year: y, kind: "ticket" }] }));
        logTicketGain(p.id, delta, source);
        // Update state so future years read the correct bonusTickets baseline
        setPlayerData(prev => ({ ...prev, [p.id]: { ...prev[p.id], bonusTickets: Math.max(0, (prev[p.id]?.bonusTickets || 0) + delta) } }));
        const pName = players.find(pl => pl.id === p.id)?.festivalName || "?";
        addLog("🎭 Curated", `${pName} played ${played} artist${played === 1 ? "" : "s"} → ${delta > 0 ? "+" : ""}${delta} 🎟️ (${delta > 0 ? "under cap" : "over cap"})`);
      });
    }
    // Collect all data BEFORE any setState
    const logs = [];
    const nat = { ...allTickets };
    // Use ref-fresh playerData rather than closure-captured. beginRoundEnd is invoked via
    // setTimeout from applyStarRoll, so the closure-captured `playerData` predates the
    // last star-roll's setPlayerData update. Reading from the ref ensures the most recent
    // star-VP additions (and any other in-flight player state) are visible in the leaderboard.
    const latestPD = playerDataRef.current || playerData;
    const snap = JSON.parse(JSON.stringify(latestPD));
    // v159: fold Curated deltas into the snap so the ticket calc below picks them up
    // in the CURRENT year's total. Without this, the setPlayerData above hasn't flushed
    // by the time we snapshot, so Curated tickets would land a year late.
    Object.entries(curatedDeltas).forEach(([pid, { delta }]) => {
      if (snap[pid]) {
        snap[pid].bonusTickets = Math.max(0, (snap[pid].bonusTickets || 0) + delta);
      }
    });
    
    // PASS 1: Calculate tickets for all players.
    // v197.22: previously duplicated the ticket formula inline here (campsites × 2 + stage
    // artists + bonusTickets), which meant infrastructure rewards camp_1 (+1/campsite) and
    // cat_2 (+2/catering) were computed everywhere ELSE but silently dropped by year-end
    // scoring. Symptom: player's mid-year total showed 6 (with Big Base included), but the
    // year-end leaderboard's raw number showed 4 (Big Base stripped). Now the pass calls
    // computeTicketsForPlayer, which is the single source of truth for ticket math and
    // knows about all infra rewards.
    // Sync playerDataRef to snap FIRST so hasInfraReward's leader check sees the year-end
    // snapshot state, not the pre-scoring state that lives in playerDataRef.current.
    playerDataRef.current = snap;
    const playerTickets = {};
    for (const p of players) {
      const pd = snap[p.id];
      if (!pd) continue;
      const computed = computeTicketsForPlayer(pd, undefined, p.id);
      snap[p.id] = computed;
      playerTickets[p.id] = computed.tickets;
    }
    
    // Find player(s) with most tickets (used for positional star-dice bonuses, which still fire)
    const maxTickets = Math.max(...Object.values(playerTickets));
    const ticketLeaders = players.filter(p => playerTickets[p.id] === maxTickets);
    
    // v126: year-end scoring pass — under unified tickets, score IS pd.tickets. Refresh
    // the derived fame + tickets fields (via a fresh computeTicketsForPlayer call) and
    // populate a slim year-end record for the announcement UI (just tickets + fame).
    for (const p of players) {
      const pd = snap[p.id];
      if (!pd) continue;
      const rawT = playerTickets[p.id];
      // Fame under v126 = baseFame + councilFame (councilFame is calculated inside
      // computeTicketsForPlayer but stashed on the player as councilFameThisYear).
      const finalFame = Math.min(FAME_MAX, (pd.baseFame || 0) + (pd.councilFameThisYear || 0));
      if (!nat[p.id]) nat[p.id] = {};
      // Preserve the shape of the nat entry so other code paths that read raw/fame still work.
      // The rich VP breakdown fields (fameVP, artistVP, ticketVP, effectVP, starDiceVP) are
      // no longer meaningful under unified scoring — set them to 0.
      nat[p.id][year] = { raw: rawT, fame: finalFame, fameVP: 0, ticketVP: 0, artistVP: 0, councilVP: 0, effectVP: 0, starDiceVP: 0, preYearVP: 0, totalYearVP: 0, yearEndDelta: 0 };
      logs.push({ type: "entry", who: p.festivalName, text: `🎟️ ${rawT} tickets | 🔥 Fame ${finalFame}` });
      // Update snap with fresh tickets + fame so any subsequent same-year reads see current numbers.
      snap[p.id] = { ...pd, tickets: rawT, rawTickets: rawT, fame: finalFame };
    }
    
    if (ticketLeaders.length === 1) {
      logs.push({ type: "entry", who: "🎟️ Tickets", text: `${ticketLeaders[0].festivalName} sold the most tickets this year (${maxTickets})` });
    }

    // Merge year-end calc fields into current playerData via callback form.
    // v126: under unified tickets scoring, yearEndDelta is 0 (no separate VP bonus to add).
    // We just refresh the derived tickets + fame fields from the year-end snapshot. Star-dice
    // tickets were already applied to bonusTickets during the star roll phase.
    setPlayerData(prev => {
      const next = { ...prev };
      for (const p of players) {
        const cur = prev[p.id];
        const sn = snap[p.id];
        if (!cur || !sn) continue;
        next[p.id] = {
          ...cur,
          tickets: sn.tickets,
          rawTickets: sn.rawTickets,
          fame: sn.fame,
        };
      }
      return next;
    });
    setAllTickets(nat);
    logs.forEach(l => addLog(l.who, l.text));
    addLogH(`Year ${year} — Year End`, "round");
    setRevealIndex(0);
    setLeaderboardRevealed(false);
    setPhase("roundEnd");
    } catch(err) {
      console.error("beginRoundEnd error:", err);
      // Force phase transition even on error
      setRevealIndex(0); setLeaderboardRevealed(false); setPhase("roundEnd");
    }
  };

  const sortedPlayersForReveal = useMemo(() => [...players].sort((a, b) => (playerData[a.id]?.tickets || 0) - (playerData[b.id]?.tickets || 0)), [players, playerData]);
  const revealNext = () => { if (revealIndex < players.length - 1) setRevealIndex(revealIndex + 1); else setLeaderboardRevealed(true); };
  const proceedFromRoundEnd = () => {
    if (year >= totalYearsRef.current) { setPhase("gameOver"); addLogH("Game Over!", "round"); return; }
    const newYear = year + 1;
    // ── New fame carryover mechanic ──
    // At the start of a new year, each player's Fame = max(0, end-of-year Fame - 2).
    // Pre-round bonuses (opening stages, etc.) still add on top of this floor.
    //
    // Fame is computed as: baseFame + floor(tickets/10) + councilFame, clamped to FAME_MAX.
    // To hit a target total, we calculate the "natural floor" the player would land at next
    // year from council/amenity contributions alone (baseFame=0, no artists, no bonus tickets),
    // then set baseFame to fill the gap between that floor and the target.
    // v172: fame decay REMOVED. Players' total fame at end of year N carries directly
    // into start of year N+1. Previously fame lost 3 points on carryover (target = fameEnd - 3).
    // Now: target = fameEnd (no decay). baseFame is still recalculated to fill the gap
    // between the year's natural fame floor (councils, campsite-scaling) and this target,
    // so if the natural floor already meets/exceeds fameEnd, baseFame just goes to 0.
    const fameDiffs = []; // { id, festivalName, fameEnd, target } for the log line
    setPlayerData(prev => {
      const next = { ...prev };
      for (const p of players) {
        const pd = next[p.id];
        const fameEnd = pd.fame || 0;
        const target = fameEnd; // v172: no decay
        // Natural floor: council fame + campsite/council-derived tickets at the NEW year's thresholds
        const hypothetical = { ...pd, baseFame: 0, stageArtists: (pd.stages || []).map(() => []), bonusTickets: 0 };
        const computed = computeTicketsForPlayer(hypothetical, newYear);
        const naturalFloor = computed.fame || 0;
        const newBaseFame = Math.max(0, target - naturalFloor);
        next[p.id] = { ...pd, baseFame: newBaseFame };
        fameDiffs.push({ id: p.id, festivalName: p.festivalName, fameEnd, target });
      }
      return next;
    });
    // Log fame transitions OUTSIDE the updater (so they don't fire twice in StrictMode dev).
    fameDiffs.forEach(({ id, festivalName, fameEnd, target }) => {
      const delta = target - fameEnd; // negative
      addLog(festivalName, `Year transition: 🔥 Fame ${fameEnd} → ${target} (${delta} carryover)`);
      // v148: record the carryover in the fame ledger against the NEW year so it shows
      // up when the player hovers their fame at the start of the new year (rather than
      // being attributed to the year that just ended, which they can no longer see).
      if (delta < 0) logFameGain(id, delta, "Carryover from previous year", newYear);
    });
    setPreRoundIndex(0); setPreRoundStep("notify");
    setFreeAmenityCount(0); setFreeAmenityPlaced(0); setFreeAmenityType(null);
    // v197.9: instead of jumping straight to preRound, first run the between-year draft.
    // Snapshot end-of-year fame + tickets NOW (before the pre-round bonuses land) so the
    // draft order reflects "who did best in the year just finished". Highest fame picks
    // first; ties broken by tickets sold. Then discard the current pool + microtrends,
    // draw 5 fresh artists for the draft, and switch to the draft phase. Pool refill and
    // microtrend refresh happen when the draft finalizes (see finalizeDraft).
    // v197.10: read fame from allTickets[pid][year] (the same snapshot the roundEnd
    // leaderboard displays) — reading playerData[pid].fame directly can diverge from
    // the displayed value if any recalcTickets fired between beginRoundEnd and here
    // (fame is derived from baseFame + councilFame at read-time, whereas allTickets
    // stores the fixed year-end snapshot). Users read the leaderboard to predict the
    // draft order, so the two must be the same source of truth.
    const orderedPids = [...players].sort((a, b) => {
      const snapA = (allTickets[a.id] && allTickets[a.id][year]) || {};
      const snapB = (allTickets[b.id] && allTickets[b.id][year]) || {};
      const fa = snapA.fame ?? (playerData[a.id]?.fame || 0);
      const fb = snapB.fame ?? (playerData[b.id]?.fame || 0);
      if (fb !== fa) return fb - fa;
      const ta = playerData[a.id]?.tickets || snapA.raw || 0;
      const tb = playerData[b.id]?.tickets || snapB.raw || 0;
      return tb - ta;
    }).map(p => p.id);
    // Diagnostic log so if the order ever looks wrong again we can see the exact
    // (fame, tickets) pairs the sort compared, matching what the leaderboard displays.
    const orderReport = orderedPids.map(pid => {
      const p = players.find(pl => pl.id === pid);
      const snap = (allTickets[pid] && allTickets[pid][year]) || {};
      const fame = snap.fame ?? (playerData[pid]?.fame || 0);
      const tix = playerData[pid]?.tickets || snap.raw || 0;
      return `${p?.festivalName || "?"} (🔥${fame}/🎟️${tix})`;
    }).join(" → ");
    addLog("🎴 Draft", `Pick order: ${orderReport}`);
    // Discard current pool contents into the discard pile — they're replaced fresh below.
    const oldPool = [...(artistPoolRef.current || artistPool)];
    let deck = [...(artistDeckRef.current || artistDeck)];
    let disc = [...(discardPileRef.current || discardPile), ...oldPool];
    // Draw 5 fresh cards for the draft. Reshuffle discard into deck if we run out.
    const inUse = getInUseNames();
    // The pool we just emptied shouldn't block itself — the cards we discarded are eligible
    // for reshuffling next time the deck depletes.
    oldPool.forEach(a => inUse.delete(a.name));
    const drafted = [];
    while (drafted.length < 5) {
      if (deck.length === 0 && disc.length > 0) {
        deck = shuffle(disc.filter(a => !inUse.has(a.name)));
        disc = disc.filter(a => inUse.has(a.name));
      }
      while (deck.length > 0 && inUse.has(deck[deck.length - 1]?.name)) { disc.push(deck.pop()); }
      if (deck.length === 0) break;
      const card = deck.pop();
      drafted.push(card);
      inUse.add(card.name);
    }
    setArtistDeck(deck); setDiscardPile(disc);
    artistDeckRef.current = deck; discardPileRef.current = disc;
    setArtistPool([]); // pool empty during draft — will refill in finalizeDraft
    setDraftCards(drafted);
    setDraftOrder(orderedPids);
    setDraftIndex(0);
    addLogH(`Year ${newYear} — Between-Year Draft`, "round");
    addLog("🎴 Draft", `${drafted.length} fresh artists — picking in end-of-year Fame order`);
    setPhase("draft");
    // v140: alt-objectives year-end evaluation now handles BOTH the achievement rewards
    // AND the deal of the next year's objective (progression if succeeded, failure if not).
    // Previously we ran evaluate + a separate progression deal, which double-dealt.
    if (altObjectivesModeRef.current) {
      evaluateAltObjectivesYearEnd();
    }
  };

  // v197.9: draft phase resolution. `pickDraftCard` handles a single pick (human click OR
  // AI auto-pick), advances to the next picker, and finalizes when everyone has picked.
  const pickDraftCard = (pid, cardIdx) => {
    // Guard: only the current picker can pick, and only if there are cards remaining.
    if (draftOrder[draftIndex] !== pid) return;
    if (cardIdx < 0 || cardIdx >= draftCards.length) return;
    const chosen = draftCards[cardIdx];
    const picker = players.find(p => p.id === pid);
    // Add to picker's hand; remove from draftCards; advance the pick order.
    setPlayerData(prev => ({ ...prev, [pid]: { ...prev[pid], hand: [...(prev[pid].hand || []), chosen] } }));
    const newCards = draftCards.filter((_, i) => i !== cardIdx);
    setDraftCards(newCards);
    addLog("🎴 Draft", `${picker?.festivalName || "?"} drafted ${chosen.name}`);
    const nextIdx = draftIndex + 1;
    if (nextIdx >= draftOrder.length) {
      // Everyone has picked — finalize the between-year cleanup and enter preRound.
      finalizeDraft(newCards);
    } else {
      setDraftIndex(nextIdx);
    }
  };

  // v197.9: finalize the draft — discard leftover draft cards, refill the pool to 5,
  // replace both microtrend tracks with fresh entries from their bags, then transition
  // into the pre-round (stage-open + free-amenity walk). The stage-clear + fame-decay
  // logic still runs later inside startNextYear as before.
  const finalizeDraft = (leftoverCards) => {
    // Leftover draft cards → discard pile (they're not free to sit in the pool because
    // the fresh pool refill logic below draws its own set from the deck).
    let deck = [...(artistDeckRef.current || artistDeck)];
    let disc = [...(discardPileRef.current || discardPile), ...(leftoverCards || [])];
    // Refill pool to 5 from the deck.
    const inUse = getInUseNames();
    const newPool = [];
    while (newPool.length < 5) {
      if (deck.length === 0 && disc.length > 0) {
        deck = shuffle(disc.filter(a => !inUse.has(a.name)));
        disc = disc.filter(a => inUse.has(a.name));
      }
      while (deck.length > 0 && inUse.has(deck[deck.length - 1]?.name)) { disc.push(deck.pop()); }
      if (deck.length === 0) break;
      const card = deck.pop();
      newPool.push(card);
      inUse.add(card.name);
    }
    setArtistDeck(deck); setDiscardPile(disc); setArtistPool(newPool);
    artistDeckRef.current = deck; discardPileRef.current = disc; artistPoolRef.current = newPool;
    addLog("🎴 Draft", `Draft complete — pool refilled to ${newPool.length} artists`);
    // Refresh BOTH microtrends. Unclaimed ones stay live (they weren't earned); we replace
    // them with fresh entries so every year opens with a new pair of prompts.
    const freshAmenity = nextAmenityMicrotrend || popAmenityFromBag();
    const freshGenre = nextGenreMicrotrend || popGenreFromBag();
    setMicrotrends([freshAmenity, freshGenre]);
    // Draw the NEXT forecast for each track so the "next up" preview stays populated.
    const nextAm = popAmenityFromBag(freshAmenity);
    const nextGe = popGenreFromBag(freshGenre);
    setNextAmenityMicrotrend(nextAm);
    setNextGenreMicrotrend(nextGe);
    const describeMt = (m) => m.kind === "amenity" ? `Place a ${AMENITY_LABELS[m.amenity]}` : `Book a ${m.genre} artist`;
    addLog("🎵 Microtrend", `Refreshed — ${describeMt(freshAmenity)} · ${describeMt(freshGenre)}`);
    // Clear draft state and enter pre-round.
    setDraftCards([]); setDraftOrder([]); setDraftIndex(0);
    setPhase("preRound");
  };

  // v197.9: AI auto-pick heuristic — favors highest (fame*2 + tickets), i.e. the
  // Fame-5 headliners come out first, then high-ticket mid-tier cards. Ties broken
  // arbitrarily by first appearance in draftCards.
  const aiDraftPick = (pid) => {
    if (draftCards.length === 0) return;
    let bestIdx = 0; let bestScore = -1;
    draftCards.forEach((a, i) => {
      const score = (a.fame || 0) * 2 + (a.tickets || 0);
      if (score > bestScore) { bestScore = score; bestIdx = i; }
    });
    pickDraftCard(pid, bestIdx);
  };

  // Pre-round — ALL players participate
  const preRoundPlayers = players; // everyone now
  const currentPreRoundPlayer = preRoundPlayers[preRoundIndex];
  // v135: when Alternative Artist Objectives is on, stages open ONLY via objective
  // completion — the fame-3 gate is disabled here.
  const canOpenStage = currentPreRoundPlayer && !altObjectivesModeRef.current && stageOpenModeRef.current !== "trends" && (playerData[currentPreRoundPlayer.id]?.fame || 0) >= 3 && (playerData[currentPreRoundPlayer.id]?.stages || []).length < 3;

  const getPreRoundDrawCount = (pd) => {
    // Respect the lobby toggle. If pre-round draws are off, no free draws — even though
    // the player has stages. Previously this returned stages.length unconditionally, so
    // the pre-round screen kept showing a "Draw N free artists!" message in games that
    // had the toggle off.
    if (!preRoundArtistDrawsRef.current) return 0;
    return (pd?.stages || []).length; // 1 draw per stage
  };

  const startPreRoundDraws = (drawCountOverride) => {
    // Skip free between-year artist draws if that option is off — players only get artists
    // through turn actions. Pre-round phase still runs (stage opening, etc.) but draws are skipped.
    if (!preRoundArtistDrawsRef.current) {
      nextPreRound();
      return;
    }
    // Ensure pool has 5 artists before draws
    refillPoolTo5();
    const pd = playerData[currentPreRoundPlayer.id];
    // drawCountOverride lets callers (acceptNewStage) bypass the closure-stale stages.length
    const drawCount = (drawCountOverride != null) ? drawCountOverride : getPreRoundDrawCount(pd);
    if (drawCount > 0) {
      setFreeAmenityCount(drawCount); setFreeAmenityPlaced(0); setFreeAmenityType(null);
      setPreRoundStep("preRoundDrawChoose");
    } else {
      nextPreRound();
    }
  };

  const acceptNewStage = () => {
    if (!currentPreRoundPlayer) return;
    const pid = currentPreRoundPlayer.id;
    const pd = playerData[pid];
    if (!pd) return;
    const usedN = pd.stageNames || [];
    const availN = STAGE_NAMES.filter(n => !usedN.includes(n));
    const sName = availN[Math.floor(Math.random() * availN.length)] || `Stage ${(pd.stages || []).length + 1}`;
    const sColor = STAGE_COLORS[Math.floor(Math.random() * STAGE_COLORS.length)];
    setPlayerData(p => {
      const updPd = { ...p[pid] };
      updPd.stages = [...(updPd.stages || []), { fameRequired: 0 }];
      updPd.stageArtists = [...(updPd.stageArtists || []), []];
      updPd.stageNames = [...(updPd.stageNames || []), sName];
      updPd.stageColors = [...(updPd.stageColors || []), sColor];
      // +1 Fame fires only if BOTH the stage-open bonus toggle is on AND the "stages
      // provide no Fame" master switch is OFF. Two toggles overlap intentionally so the
      // user can express their intent either way (ban just the open bonus, or ban all
      // stage-fame globally).
      const stageFameAllowed = stageOpenFameBonusRef.current && !stagesProvideNoFameRef.current;
      if (stageFameAllowed) {
        updPd.baseFame = Math.min(FAME_MAX, (updPd.baseFame || 0) + 1);
      }
      return { ...p, [pid]: updPd };
    });
    const stageFameAllowed = stageOpenFameBonusRef.current && !stagesProvideNoFameRef.current;
    if (stageFameAllowed) {
      addLog(currentPreRoundPlayer.festivalName, `built new stage → +1 🔥 Fame!`);
      showFloatingBonus("+1 🔥 New Stage!", "#f97316");
    } else {
      addLog(currentPreRoundPlayer.festivalName, `built new stage (no Fame bonus)`);
    }
    setTimeout(() => recalcTickets(), 50);
    // The setPlayerData above is queued. startPreRoundDraws would otherwise read stale
    // stages.length and miss the new stage. Pass explicit count = old length + 1.
    const newDrawCount = (pd.stages || []).length + 1;
    startPreRoundDraws(newDrawCount);
  };
  const declineNewStage = () => {
    addLog(currentPreRoundPlayer?.festivalName || "", "declined new stage");
    startPreRoundDraws();
  };
  const confirmPreRoundStage = () => { startPreRoundDraws(); };
  const confirmPreRound = () => nextPreRound();
  const refillPoolTo5 = () => {
    setArtistDeck(prevDeck => {
      const needed = 5 - artistPool.length;
      if (needed <= 0 || prevDeck.length === 0) return prevDeck;
      const inUse = getInUseNames();
      const toAdd = []; const remaining = [];
      for (const a of prevDeck) {
        if (toAdd.length < needed && !inUse.has(a.name)) toAdd.push(a);
        else remaining.push(a);
      }
      if (toAdd.length > 0) setArtistPool(prev => [...prev, ...toAdd]);
      return remaining;
    });
  };

  const nextPreRound = () => {
    // Refill pool to 5 before next player's turn
    refillPoolTo5();
    if (preRoundIndex < preRoundPlayers.length - 1) {
      setPreRoundIndex(preRoundIndex + 1); setPreRoundStep("notify");
      setFreeAmenityCount(0); setFreeAmenityPlaced(0); setFreeAmenityType(null);
    } else startNextYear();
  };

  const startNextYear = () => {
    const ny = year + 1; setYear(ny);
    // Reset per-year agent-booking tracker (year-end agent effects have already been
    // resolved in beginYearEndEffectsPhase). Other agent state was cleared there too;
    // this lives here because it's needed during year-end resolution itself.
    setAgentBookedThisYear({});
    // Apply artist objective rewards from last year's lineups (BEFORE clearing stages)
    applyObjectiveRewards();
    // v190: snapshot per-year state stats BEFORE clearing stages. Captures:
    //   - artists booked on stages that year (names, tickets, vp, genre)
    //   - stage count that year
    //   - bonus tickets from artist effects (before it resets to 0)
    // This data feeds the game data table export.
    const snapshotYear = yearRef.current || year || 1;
    setYearlyStats(prev => {
      const next = { ...prev };
      for (const p of players) {
        const pd = playerDataRef.current?.[p.id] || playerData[p.id] || {};
        const perP = { ...(next[p.id] || {}) };
        const perY = { ...(perP[snapshotYear] || {}) };
        perY.artistsOnStages = (pd.stageArtists || []).flat().map(a => ({
          name: a.name, genre: a.genre, tickets: a.tickets, vp: a.vp, fame: a.fame,
        }));
        perY.stageCount = (pd.stages || []).length;
        perY.ticketsFromArtists = pd.bonusTickets || 0;
        perP[snapshotYear] = perY;
        next[p.id] = perP;
      }
      return next;
    });
    // Capture pre-round baseFame (from opening stages) BEFORE resetting
    // v192: apply -2 Fame decay at year transition. Trailing baseFame gets clamped at 0.
    // v197.11: decay now scales inversely with stage count — investing in expansion
    // reduces the year-transition punishment. Rationale: playtest data showed Y2/Y3
    // tickets climb on aggregate but individual trajectories often peak at Y2, and
    // stage count was one of the slowest-growing metrics. Tying decay to stages makes
    // opening a new stage a Y2/Y3 pacing lever, not just a Fame-3 milestone reward.
    //   1 stage  → −3 decay (feels harshest — 1-stage strategies like Indie must
    //              rebuild fame each year, which is consistent with their small-festival
    //              identity)
    //   2 stages → −2 decay (unchanged from v192)
    //   3 stages → −1 decay (soft landing — players who expanded feel their Y1 build
    //              carry into Y2/Y3)
    // Applied AFTER year-end scoring/effects and BEFORE the +1 fame stage-open bonus
    // (which fires during pre-round if enabled).
    const preRoundFame = {};
    const fameDecayLog = [];
    const decayForStages = (n) => (n >= 3 ? 1 : n === 2 ? 2 : 3);
    players.forEach(p => {
      const pd = playerData[p.id] || {};
      const before = pd.baseFame || 0;
      const stageCount = (pd.stages || []).length;
      const decay = decayForStages(stageCount);
      const after = Math.max(0, before - decay);
      preRoundFame[p.id] = after;
      if (before !== after) {
        fameDecayLog.push({ pid: p.id, before, after, lost: before - after, stages: stageCount, decay });
      }
    });
    if (fameDecayLog.length > 0) {
      addLogH(`Year ${ny} — Fame Decay (stage-scaled)`, "round");
      fameDecayLog.forEach(e => {
        const pName = players.find(pl => pl.id === e.pid)?.festivalName || "?";
        addLog("🔥 Fame Decay", `${pName}: ${e.before} → ${e.after} (−${e.lost} Fame · ${e.stages} stage${e.stages === 1 ? "" : "s"} → −${e.decay} scale)`);
        logFameLoss(e.pid, e.lost, `Year transition decay (${e.stages}-stage)`, ny - 1);
      });
    }
    // Clear all stages: move booked artists to discard pile, reset bonus tickets
    let newDiscard = [...discardPile];
    setPlayerData(prev => {
      const next = { ...prev };
      for (const p of players) {
        const pd = next[p.id];
        const allBooked = (pd.stageArtists || []).flat();
        newDiscard = [...newDiscard, ...allBooked];
        const emptyStages = (pd.stages || []).map(() => []);
        // Reset baseFame but preserve any fame gained during pre-round (stage opening)
        // Reset high-water marks so dice can be re-claimed for current fame/stages this year
        const reset = { ...pd, stageArtists: emptyStages, bonusTickets: 0, baseFame: preRoundFame[p.id] || 0, vpPerSecurity: 0, fameHighWater: 0, filledStagesHighWater: 0, starDiceVPThisYear: 0, councilDiceGrantedThisYear: [false, false, false], councilAmenityGrantedThisYear: [false, false, false] };
        // Recompute tickets/fame for the NEW year so council ticket/fame bonuses fire immediately
        // (closure's `year` is still the old year here — pass `ny` explicitly)
        next[p.id] = computeTicketsForPlayer(reset, ny, p.id);
      }
      return next;
    });
    // Clear the dice trigger latch so the useEffect re-fires for the new year
    diceTriggerLatchRef.current = {};
    setDiscardPile(newDiscard);
    addLog("🔄 New Year", "All stages cleared — artists moved to discard pile");
    // v158: refresh shared contracts for the new year — discard unclaimed, deal fresh N-1
    // (min 2). Claimed contracts remain on their fields and keep firing rewards yearly.
    if (contractsModeRef.current) {
      const claimedIds = new Set();
      players.forEach(p => {
        (playerDataRef.current?.[p.id]?.claimedContracts || []).forEach(cc => claimedIds.add(cc.contractId));
      });
      const n = Math.max(2, players.length - 1);
      const pool = ALL_COUNCILS.filter(c => !claimedIds.has(c.id));
      const shuffled = [...pool].sort(() => Math.random() - 0.5);
      const dealt = shuffled.slice(0, n).map(c => c.id);
      setSharedContracts(dealt);
      if (dealt.length > 0) {
        const names = dealt.map(id => ALL_COUNCILS.find(c => c.id === id)?.name || id).join(", ");
        addLog("📜 Council Contracts", `Year ${ny} contracts: ${names}`);
      }
    }

    // Replace any fully claimed lineup objectives (both 1st and 2nd taken)
    lineupObjectives.forEach((lo, idx) => {
      if (lo && lo.claimed1st !== null) {
        replaceLineupObjective(idx);
      }
    });

    // v183: bug fix — turn-order anti-lead sort was broken since the allTickets refactor
    // that stored per-year entries as {raw, fame, ...} objects instead of numbers.
    // The comparator `(allTickets[a.id]?.[year] || 0) - (allTickets[b.id]?.[year] || 0)`
    // subtracted objects → NaN → sort returned 0 → turn order stayed the same every
    // year, cementing player 0's first-mover advantage for the entire game. Under
    // 1H+2AI setups this meant the last-in-order AI was disadvantaged on shared
    // resources (microtrends, uncontested tempts, pool artists, dice) every single
    // round, compounding over 3-4 years into large ticket gaps.
    // Fix: read `.raw` so we actually sort by numeric tickets.
    const sorted = [...players].sort((a, b) => ((allTickets[a.id]?.[year]?.raw) || 0) - ((allTickets[b.id]?.[year]?.raw) || 0));
    const no = sorted.map(p => p.id); setTurnOrder(no); setCurrentPlayerIdx(0);
    const tl = {}; const sch = flatTurnsModeRef.current ? TURNS_PER_YEAR_FLAT : TURNS_PER_YEAR; no.forEach(id => { tl[id] = sch[ny]; }); setTurnsLeft(tl);
    setDice(rollDice()); setPhase("game"); setShowTurnStart(false); setTurnAction(null); setActionTaken(false);
    // (Star Dice phase replaces old per-year event drawing)
    // Microtrends now persist across years — they get replaced as players claim them.
    // Don't reinitialize at year transition.
    // Delay recalcTickets so React flushes all state updates first
    setTimeout(() => recalcTickets(), 50);
    addLogH(`Year ${ny} Begins`, "year");
    const fp = players.find(p => p.id === no[0]); if (fp) addLogH(`${fp.festivalName}'s Turn`, "turn");
    setShowYearAnnouncement(true);
  };

  const winner = useMemo(() => {
    if (phase !== "gameOver") return null;
    // v126: winner is highest tickets (the unified score). Fame tiebreaks, then acts played.
    return [...players].sort((a, b) => {
      const pdA = playerData[a.id] || {}, pdB = playerData[b.id] || {};
      const td = (pdB.tickets || 0) - (pdA.tickets || 0);
      if (td !== 0) return td;
      const fd = (pdB.fame || 0) - (pdA.fame || 0);
      if (fd !== 0) return fd;
      const acts = (pd) => (pd.stageArtists || []).flat().length;
      return acts(pdB) - acts(pdA);
    })[0];
  }, [phase, players, playerData]);

  // ═══════════════════════════════════════════════════════════
  // RESPONSIVE
  // ═══════════════════════════════════════════════════════════
  const [winWidth, setWinWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  useEffect(() => {
    const onResize = () => setWinWidth(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  const isMobile = winWidth < 768;

  // ═══════════════════════════════════════════════════════════
  // STYLES
  // ═══════════════════════════════════════════════════════════
  const CS = { minHeight: "100vh", background: "linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a1a2e 100%)", color: "#e2e8f0", fontFamily: "'Segoe UI', system-ui, sans-serif", position: "relative", overflowX: "hidden" };
  const card = { background: "rgba(15,14,26,0.9)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 16, padding: isMobile ? 16 : 24, backdropFilter: "blur(10px)" };
  const bp = { padding: isMobile ? "12px 24px" : "10px 24px", borderRadius: isMobile ? 12 : 10, border: "none", fontWeight: 700, background: "linear-gradient(135deg, #7c3aed, #6d28d9)", color: "#fff", cursor: "pointer", fontSize: isMobile ? 15 : 14, transition: "all 0.2s" };
  const bs = { ...bp, background: "rgba(124,58,237,0.2)", border: "1px solid #7c3aed" };
  const bd = { ...bp, background: "linear-gradient(135deg, #dc2626, #b91c1c)" };
  const [showUpdateNotes, setShowUpdateNotes] = useState(false);
  const [showPopupObjectives, setShowPopupObjectives] = useState(false);
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const logBtn = <button onClick={() => setShowLog(!showLog)} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #7c3aed", background: "rgba(124,58,237,0.2)", color: "#c4b5fd", cursor: "pointer", fontWeight: 600, fontSize: 12 }}>📜</button>;
  const discardBtn = phase !== "lobby" && phase !== "setup" ? <button onClick={() => setShowDiscard(true)} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #6b7280", background: "rgba(107,114,128,0.2)", color: "#94a3b8", cursor: "pointer", fontWeight: 600, fontSize: 12 }}>🗑️</button> : null;
  const updateNotesBtn = <button onClick={() => setShowUpdateNotes(true)} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #22c55e", background: "rgba(34,197,94,0.2)", color: "#4ade80", cursor: "pointer", fontWeight: 600, fontSize: 12 }}>📋</button>;
  const howToPlayBtn = <button onClick={() => setShowHowToPlay(true)} title="How to Play" style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #60a5fa", background: "rgba(96,165,250,0.18)", color: "#93c5fd", cursor: "pointer", fontWeight: 600, fontSize: 12 }}>📖</button>;
  // ── How to Play content — single source of truth, rendered into both the in-game
  // modal overlay and the lobby's tab section. Sections are individual cards with a
  // bold heading + italic flavour hook + plain-prose mechanics. No bullet lists.
  const howToPlayContent = (() => {
    const sectionCard = { padding: 12, borderRadius: 10, background: "rgba(15,14,26,0.45)", border: "1px solid rgba(124,58,237,0.18)", marginBottom: 10 };
    const heading = { color: "#fbbf24", fontSize: 14, fontWeight: 800, marginBottom: 4 };
    const flavour = { color: "#c4b5fd", fontSize: 12, fontStyle: "italic", marginBottom: 6, lineHeight: 1.45 };
    const body = { color: "#cbd5e1", fontSize: 12, lineHeight: 1.55 };
    return <div>
      <div style={{ ...sectionCard, background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.25)" }}>
        <h3 style={{ ...heading, fontSize: 18, color: "#fde68a", marginBottom: 6 }}>HEADLINERS</h3>
        <p style={body}>Turn a humble field into a music lover's paradise. Build your festival infrastructure, attract artists to the main stage, and become famous. Will your festival be the most successful in the country?</p>
      </div>
      <div style={sectionCard}>
        <h4 style={heading}>A turn at a glance</h4>
        <p style={body}>Players have three options on their turn. <strong>Build infrastructure</strong> by taking one die from the Amenity Dice pool — this is crucial for covering the cost of an artist. <strong>Draw an artist</strong> from the deck or the pool of face-up artists. Or <strong>play an artist</strong> from your hand, provided you have the right infrastructure and Fame.</p>
      </div>
      <div style={sectionCard}>
        <h4 style={heading}>🎯 Trending Lineups</h4>
        <p style={flavour}>Three Festival Lineups dominate the press this season. Be the first to deliver them and the headlines write themselves.</p>
        <p style={body}>Each Trending Lineup shows three genres. Play all three genres (in any order) to edge closer to victory.</p>
      </div>
      <div style={sectionCard}>
        <h4 style={heading}>🏛️ Council Objectives</h4>
        <p style={flavour}>The local council can make or break your festival. Keep them happy and they'll reward you handsomely with effects that give you an edge over the others.</p>
        <p style={body}>All players pick three council objectives at the beginning of the game, and must fulfil each one year on year by having the right combination of amenities.</p>
      </div>
      <div style={sectionCard}>
        <h4 style={heading}>🎲 Amenity Dice</h4>
        <p style={flavour}>Five shared dice. Crucial infrastructure needed to cover for artists.</p>
        <p style={body}>Players take one amenity and place it in their festival, and sometimes get a choice between two amenities. The Fame face grants +1 Fame — a fleeting resource needed to attract the artists you want.</p>
      </div>
      <div style={sectionCard}>
        <h4 style={heading}>🎵 Microtrends</h4>
        <p style={flavour}>One genre or amenity is having a moment right now. Catch the wave and ride it.</p>
        <p style={body}>A single microtrend is active at a time. First player to book a matching artist or place a matching amenity wins +1 Fame. Players are also made aware of the microtrend on the horizon.</p>
      </div>
      <div style={sectionCard}>
        <h4 style={heading}>🕵️ Agents</h4>
        <p style={flavour}>The industry's dark art, and your festival's edge. Send yours out into the talent pool and lock down a booking before your rivals can move.</p>
        <p style={body}>Players all have one agent every year by default. Players can deploy agents on the available artist pool if they can afford them. If two agents converge on the same artist, a contest die rolls one of the seven faces — highest matching stat wins. Whichever way it goes, every contestant gains +1 Fame: the industry buzz reward. Agents can also be deployed on microtrends to gain a crucial Fame and keep the microtrends moving.</p>
      </div>
      <div style={sectionCard}>
        <h4 style={heading}>🌟 The Star Die</h4>
        <p style={flavour}>We can control every moment leading up to the festival, but not the festival itself. The Star Die represents the highlights and the lowlights of your festival.</p>
        <p style={body}>Every Star Die earned through the year (from artists, councils, special guests) goes onto the table at year-end. Roll them all. Each ⭐ face converts to VP on an escalating ladder (more stars = exponentially more). Players lose any amenity that is shown — unless they have a security. A player may use a security to absorb the loss of any other amenity. A security is not lost this way.</p>
      </div>
      <div style={sectionCard}>
        <h4 style={heading}>🎪 Special Guests</h4>
        <p style={flavour}>At year-end, the headline names show up unannounced — for whoever's built the festival worth showing up at.</p>
        <p style={body}>Players who are yet to fill the final slot for their lineups are offered a special guest, chosen by drawing the top card of the artist deck.</p>
      </div>
      <div style={{ ...sectionCard, background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.25)" }}>
        <h4 style={{ ...heading, color: "#86efac" }}>Scoring</h4>
        <p style={body}>Most VP wins. VP comes from artists booked, council rewards earned, lineup objectives claimed, star rolls cashed in, end-of-game artist effects (Coldplay, Lady Gaga, etc.), and your final Fame ladder. Ties broken by tickets sold.</p>
      </div>
    </div>;
  })();
  const howToPlayModal = showHowToPlay ? <div onClick={() => setShowHowToPlay(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 970, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
    <div onClick={e => e.stopPropagation()} style={{ ...card, maxWidth: 640, width: "100%", maxHeight: "88vh", overflowY: "auto" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, position: "sticky", top: -24, background: "rgba(15,14,26,0.95)", padding: "8px 0", borderBottom: "1px solid rgba(124,58,237,0.2)", marginTop: -24 }}>
        <h2 style={{ color: "#fbbf24", fontSize: 22, margin: 0 }}>📖 How to Play</h2>
        <button onClick={() => setShowHowToPlay(false)} style={{ ...bs, fontSize: 11, padding: "4px 10px" }}>Close ✕</button>
      </div>
      {howToPlayContent}
    </div>
  </div> : null;
  const leaderboardBtn = phase !== "lobby" && phase !== "setup" ? <button onClick={() => setShowLeaderboard(true)} title="Leaderboard" style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #fbbf24", background: "rgba(251,191,36,0.2)", color: "#fbbf24", cursor: "pointer", fontWeight: 600, fontSize: 12 }}>🏆</button> : null;
  const leaderboardModal = showLeaderboard ? (() => {
    // v171: fixed to match the rest of the game.
    // - Tickets shown as raw count (not × 100) so they match the HUD everywhere else.
    // - Star dice column removed (they're deleted from the game as of v168).
    // - Councils/contracts count now shows claimed contracts under contracts mode,
    //   or qualifying legacy councils otherwise.
    const ranked = [...players].map(p => {
      const pd = playerData[p.id] || {};
      const councilCount = contractsModeRef.current
        ? (pd.claimedContracts || []).length
        : (pd.councils || []).filter((c, i) => c && councilQualifies(c, (pd.fields || [])[i], year || 1)).length;
      return { p, pd, tickets: pd.tickets || 0, fame: pd.fame || 0, councilCount, microtrends: pd.microtrendsCompletedCount || 0 };
    }).sort((a, b) => (b.tickets - a.tickets) || (b.fame - a.fame));
    return <div onClick={() => setShowLeaderboard(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 970, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ ...card, maxWidth: 560, width: "100%", maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ color: "#fbbf24", fontSize: 22, margin: 0 }}>🏆 Leaderboard</h2>
          <button onClick={() => setShowLeaderboard(false)} style={{ ...bs, fontSize: 11, padding: "4px 10px" }}>Close ✕</button>
        </div>
        <p style={{ color: "#8b5cf6", fontSize: 11, marginBottom: 12 }}>Year {year} of {totalYears} — sorted by tickets sold, ties broken by fame</p>
        {ranked.map((r, idx) => {
          const fame = r.fame; const onFire = fame >= 5; const yellowed = fame >= 3 && fame < 5;
          const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : `#${idx + 1}`;
          return <div key={r.p.id} style={{
            padding: 12, borderRadius: 10, marginBottom: 8,
            background: onFire ? "linear-gradient(135deg, rgba(249,115,22,0.25) 0%, rgba(239,68,68,0.25) 100%)" : yellowed ? "rgba(251,191,36,0.12)" : "rgba(15,14,26,0.6)",
            border: onFire ? "2px solid #f97316" : yellowed ? "1px solid #fbbf24" : "1px solid #2a2a4a",
            animation: onFire ? "fameOnFire 1.4s ease-in-out infinite" : "none",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 18, fontWeight: 800 }}>{medal}</span>
                <span style={{ fontSize: 16, fontWeight: 700, color: onFire ? "#fde68a" : (yellowed ? "#fbbf24" : "#e9d5ff") }}>{onFire ? "🔥 " : ""}{r.p.festivalName}{r.p.isAI ? " 🤖" : ""}{onFire ? " 🔥" : ""}</span>
              </div>
              <span style={{ fontSize: 22, fontWeight: 900, color: "#60a5fa" }}>🎟️ {r.tickets}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 4, fontSize: 11, color: "#94a3b8" }}>
              <div style={{ color: onFire ? "#fb923c" : "#94a3b8", animation: onFire ? "fameFlicker 0.8s ease-in-out infinite" : "none" }}>🔥 Fame: {r.fame}</div>
              <div><span style={{ color: "#86efac" }}>📋</span> {contractsModeRef.current ? "Contracts claimed" : "Active councils"}: {r.councilCount}</div>
            </div>
            <div style={{ marginTop: 6, padding: "4px 8px", borderRadius: 6, background: "rgba(124,58,237,0.08)", fontSize: 10, color: "#e9d5ff" }}>
              📢 {r.microtrends} microtrend{r.microtrends === 1 ? "" : "s"} completed
            </div>
          </div>;
        })}
      </div>
    </div>;
  })() : null;
  const utilButtons = <><div style={{ display: "flex", gap: 6, justifyContent: "flex-end", padding: "4px 12px" }}>{howToPlayBtn}{updateNotesBtn}{leaderboardBtn}{discardBtn}{logBtn}</div>{leaderboardModal}{howToPlayModal}</>;
  const popupObjectivesPanel = showPopupObjectives ? <div style={{ marginTop: 12, padding: 12, borderRadius: 10, background: "rgba(124,58,237,0.1)", border: "1px solid #7c3aed40", textAlign: "left" }}>
    {(playerObjectives[currentPlayerId] || []).length > 0 && <div style={{ marginBottom: 8 }}>
      {(playerObjectives[currentPlayerId] || []).map((entry, oi) => <div key={oi} style={{ marginBottom: 4 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: entry.completed ? "#4ade80" : "#c4b5fd", textTransform: "uppercase" }}>🎯 {entry.completed ? "✅" : ""} {entry.obj.name}</div>
        <div style={{ fontSize: 10, color: "#94a3b8" }}>{entry.obj.req}</div>
        <div style={{ fontSize: 9, color: "#4ade80" }}>{entry.obj.reward}</div>
      </div>)}
    </div>}
    {activeGoals.map((ag, gi) => <div key={gi} style={{ marginBottom: 4 }}>
      <div style={{ fontSize: 10, fontWeight: 700, color: "#fbbf24" }}>🏆 {ag.goal.name}</div>
      <div style={{ fontSize: 9, color: "#94a3b8" }}>{ag.goal.req2} | {ag.goal.req3}</div>
    </div>)}
  </div> : null;
  const objectivesToggle = <button onClick={() => setShowPopupObjectives(p => !p)} style={{ marginTop: 8, padding: "4px 12px", borderRadius: 6, border: "1px solid #7c3aed40", background: showPopupObjectives ? "rgba(124,58,237,0.3)" : "rgba(124,58,237,0.08)", color: "#c4b5fd", cursor: "pointer", fontSize: 10, fontWeight: 600 }}>{showPopupObjectives ? "Hide Objectives ▲" : "Show Objectives ▼"}</button>;
  const anim = <style>{`@keyframes fadeSlideIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } } @keyframes headlinerPulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.05); } } @keyframes affordPulse { 0%,100% { box-shadow: 0 0 4px rgba(251,191,36,0.3); } 50% { box-shadow: 0 0 16px rgba(251,191,36,0.7); } } .obj-hover-parent:hover .obj-hover-tip { display: block !important; max-height: 300px !important; padding: 10px !important; margin-top: 8px !important; opacity: 1 !important; } @keyframes floatUp { 0% { opacity:1; transform:translateY(0) scale(1); } 50% { opacity:1; transform:translateY(-30px) scale(1.2); } 100% { opacity:0; transform:translateY(-60px) scale(0.8); } } @keyframes bookReveal { 0% { opacity:0; transform:scale(0.5) rotate(-5deg); } 50% { transform:scale(1.1) rotate(2deg); } 100% { opacity:1; transform:scale(1) rotate(0deg); } } @keyframes pulse { 0%,100% { transform:scale(1); box-shadow: 0 0 8px rgba(251,191,36,0.3); } 50% { transform:scale(1.05); box-shadow: 0 0 20px rgba(251,191,36,0.6); } } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes fameOnFire { 0%,100% { box-shadow: 0 0 12px rgba(249,115,22,0.6), 0 0 24px rgba(239,68,68,0.4); border-color: #f97316; } 50% { box-shadow: 0 0 18px rgba(249,115,22,0.9), 0 0 36px rgba(239,68,68,0.7); border-color: #fbbf24; } } @keyframes fameFlicker { 0%,100% { opacity: 1; } 25% { opacity: 0.85; } 50% { opacity: 1; } 75% { opacity: 0.92; } } @keyframes genreMatchGlow { 0%,100% { box-shadow: 0 0 12px rgba(251,191,36,0.7), 0 0 24px rgba(251,191,36,0.35); transform: translateY(0) scale(1); } 50% { box-shadow: 0 0 22px rgba(251,191,36,1), 0 0 44px rgba(251,191,36,0.6); transform: translateY(-1px) scale(1.015); } }`}</style>;

  const updateNotesModal = showUpdateNotes ? <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setShowUpdateNotes(false)}>
    <div style={{ background: "#0f0e1a", border: "1px solid #22c55e", borderRadius: 16, padding: 24, maxWidth: 600, maxHeight: "80vh", overflowY: "auto", width: "100%" }} onClick={e => e.stopPropagation()}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h2 style={{ color: "#4ade80", fontSize: 20, margin: 0 }}>📋 Update Notes</h2>
        <button onClick={() => setShowUpdateNotes(false)} style={{ background: "none", border: "none", color: "#c4b5fd", fontSize: 20, cursor: "pointer" }}>✕</button>
      </div>
      <div style={{ color: "#e9d5ff", fontSize: 12, lineHeight: 1.8 }}>
        <h3 style={{ color: "#fbbf24", marginTop: 0, fontSize: 16 }}>Patch Notes — March 2026</h3>

        <h4 style={{ color: "#c4b5fd", marginTop: 16, marginBottom: 4, fontSize: 13, textTransform: "uppercase", letterSpacing: 1 }}>🆕 New Systems</h4>
        <p>• <strong style={{ color: "#4ade80" }}>Funk Genre</strong> — 15 new Funk artists join the roster. Catering-heavy costs, community-focused effects. 90 artists total across 6 genres.</p>
        <p>• <strong style={{ color: "#4ade80" }}>Goals</strong> — 2 random goals drawn each game. All players race to complete 3 tiers of requirements. Tier 1 rewards everyone, Tiers 2-3 reward the first player to get there with a free artist or VP.</p>
        <p>• <strong style={{ color: "#4ade80" }}>Free Artist Draws</strong> — Between years, draw 1 free artist per stage you own (from pool or deck). Replaces free amenities.</p>
        <p>• <strong style={{ color: "#4ade80" }}>Council Choice</strong> — Spending a catering van now draws 2 council objectives. Pick 1, the other goes back.</p>

        <h4 style={{ color: "#c4b5fd", marginTop: 16, marginBottom: 4, fontSize: 13, textTransform: "uppercase", letterSpacing: 1 }}>🔥 Fame Rework</h4>
        <p>• <strong style={{ color: "#4ade80" }}>Ticket Fame</strong> — +1 Fame for every 20 tickets earned in a year.</p>
        <p>• <strong style={{ color: "#4ade80" }}>Lineup Fame</strong> — +1 Fame when you complete a 3-artist lineup on a stage.</p>
        <p>• <strong style={{ color: "#4ade80" }}>Stage Fame</strong> — +1 Fame when you open a new stage.</p>
        <p>• <strong style={{ color: "#4ade80" }}>Stages at Fame 3</strong> — Open new stages at Fame 3 instead of 5. All players go through the between-years phase.</p>
        <p>• Fame cap remains at 5. Trending council fame capped at +1 max.</p>

        <h4 style={{ color: "#c4b5fd", marginTop: 16, marginBottom: 4, fontSize: 13, textTransform: "uppercase", letterSpacing: 1 }}>🎯 Artist Objectives Rework</h4>
        <p>• Objectives are now genre-based (1 per genre). Feature full lineups of your genre to earn rewards at the start of each year.</p>
        <p>• 1st lineup: genre-specific reward (Pop draws from pool, Rock rolls dice, Electronic places amenity, Hip Hop discards event, Indie helps everyone, Funk draws from deck).</p>
        <p>• 2nd lineup: same reward + 1 Fame.</p>

        <h4 style={{ color: "#c4b5fd", marginTop: 16, marginBottom: 4, fontSize: 13, textTransform: "uppercase", letterSpacing: 1 }}>📋 Council Objectives</h4>
        <p>• All council objectives now reward tickets instead of VP.</p>
        <p>• <strong>Glamping</strong> now requires campsite + security + portaloo cluster.</p>
        <p>• <strong>Luxury Loos</strong> now requires portaloo-security-portaloo sandwich.</p>
        <p>• <strong>Thieves in the Night / Meat the Law</strong> now use "within 2 tiles" coverage instead of surrounding.</p>
        <p>• <strong>Ticket Evaders, Toxic Waste, Noise Complaints</strong> grant bonus VP when you move amenities strategically.</p>
        <p>• 3 new objectives: Chef Beef, Show of Power, Keep the Peace.</p>

        <h4 style={{ color: "#c4b5fd", marginTop: 16, marginBottom: 4, fontSize: 13, textTransform: "uppercase", letterSpacing: 1 }}>⚔️ Events & Security</h4>
        <p>• Each security sacrificed now blocks <strong>2</strong> negative events instead of 1.</p>
        <p>• All events are now blockable (TED Talk and Passed Out were previously unavoidable).</p>
        <p>• Rowdy Crowd nerfed from -2 to -1 ticket per act.</p>
        <p>• Agent Fallout nerfed to lose 1 card (was 1/3 of hand).</p>
        <p>• Dehydration is now flat -1 Fame (was -2 at high fame).</p>

        <h4 style={{ color: "#c4b5fd", marginTop: 16, marginBottom: 4, fontSize: 13, textTransform: "uppercase", letterSpacing: 1 }}>🎤 Artist & Action Changes</h4>
        <p>• Portaloo refresh now refreshes the artist pool <strong>twice</strong>.</p>
        <p>• Book from Discard removed.</p>
        <p>• Players must take an action before ending their turn.</p>
        <p>• "All players draw" effects no longer give duplicates.</p>
        <p>• Vampire Weekend's "Roll all dice" effect now works correctly.</p>
        <p>• Heart/Slipknot/Rage Against the Machine now give 2 tickets per Fame die (was 1).</p>

        <h4 style={{ color: "#94a3b8", marginTop: 16, marginBottom: 4, fontSize: 13, textTransform: "uppercase", letterSpacing: 1 }}>Minor Changes</h4>
        <p style={{ color: "#94a3b8" }}>• Fame max raised to 5 (was 4). • Form a Line gives count-1 tickets (2 vans = 1 ticket). • Chef Beef requires minimum 2 catering. • Microtrends now include Funk. • Goals tab shows progress bars for all players. • Council objectives evaluated before events phase.</p>
      </div>
    </div>
  </div> : null;

  // ═══════════════════════════════════════════════════════════
  // RENDER: LOBBY
  // ═══════════════════════════════════════════════════════════
  if (phase === "lobby") return (
    <div style={CS}><div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24 }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 style={{ fontSize: 56, fontWeight: 900, margin: 0, background: "linear-gradient(135deg, #c4b5fd, #fbbf24, #f472b6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: -2 }}>🎪 HEADLINERS</h1>
        <p style={{ color: "#8b5cf6", fontSize: 16, marginTop: 8, letterSpacing: 4, textTransform: "uppercase" }}>Build the biggest festival</p>
      </div>
      <div style={{ ...card, maxWidth: 520, width: "100%" }}>
        <div style={{ marginBottom: 24 }}><label style={{ color: "#c4b5fd", fontWeight: 600, fontSize: 13, display: "block", marginBottom: 8 }}>Number of Players</label>
          <div style={{ display: "flex", gap: 8 }}>{[2, 3, 4, 5].map(n => <button key={n} onClick={() => handlePlayerCountChange(n)} style={{ ...bs, background: playerCount === n ? "linear-gradient(135deg, #7c3aed, #6d28d9)" : "rgba(124,58,237,0.15)", flex: 1 }}>{n}</button>)}</div>
        </div>
        {players.map((p, i) => <div key={i} style={{ marginBottom: 16 }}><label style={{ color: "#a78bfa", fontWeight: 600, fontSize: 12, display: "block", marginBottom: 4 }}>Player {i + 1} {p.isAI ? <span style={{ color: "#fbbf24", fontSize: 10 }}>🤖 AI</span> : ""} — Festival Name</label>
          <div style={{ display: "flex", gap: 8 }}>
            <input value={p.festivalName} onChange={e => setPlayers(pr => pr.map((pp, ii) => ii === i ? { ...pp, festivalName: e.target.value } : pp))} placeholder={p.isAI ? "AI festival name..." : "Enter festival name..."} style={{ flex: 1, padding: "10px 14px", borderRadius: 10, border: p.isAI ? "1px solid #fbbf24" : "1px solid #4c1d95", background: p.isAI ? "#1a1a10" : "#1a1a2e", color: "#e2e8f0", fontSize: 14, outline: "none" }} />
            <button onClick={() => randomizeName(i)} style={{ ...bs, padding: "10px 12px", fontSize: 16 }} title="Randomize">🎲</button>
            <button onClick={() => {
              setPlayers(pr => pr.map((pp, ii) => {
                if (ii !== i) return pp;
                const nowAI = !pp.isAI;
                return { ...pp, isAI: nowAI, festivalName: nowAI && !pp.festivalName ? AI_NAMES[i % AI_NAMES.length] : pp.festivalName };
              }));
            }} style={{ ...bs, padding: "10px 12px", fontSize: 14, background: p.isAI ? "rgba(251,191,36,0.3)" : "rgba(124,58,237,0.15)", border: p.isAI ? "1px solid #fbbf24" : "1px solid #7c3aed", color: p.isAI ? "#fbbf24" : "#c4b5fd" }} title="Toggle AI">🤖</button>
          </div></div>)}
        <button onClick={startSetup} disabled={!canStartSetup} style={{ ...bp, width: "100%", marginTop: 16, padding: "14px 24px", fontSize: 16, opacity: canStartSetup ? 1 : 0.4 }}>Start Setup →</button>
      </div>
      {/* ── Game Options — v189: dramatically simplified ── */}
      <div style={{ ...card, maxWidth: 520, width: "100%", marginTop: 12 }}>
        <div style={{ color: "#c4b5fd", fontWeight: 700, fontSize: 13, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>⚙️ Game Options</div>
        <div style={{ padding: 10, borderRadius: 8, background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.2)", marginBottom: 12, fontSize: 11, color: "#86efac", lineHeight: 1.5 }}>
          <div style={{ fontWeight: 700, color: "#4ade80", marginBottom: 4 }}>Standard rules</div>
          3 years · 6 turns per year · Tempt function · Festival Identities · Anti-Lead Mechanics · Council Incentives (amenity trends) & Trending Genres (genre trends)
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label onClick={() => setTotalYears(totalYears === 3 ? 4 : 3)} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10, padding: 10, borderRadius: 10, border: totalYears === 4 ? "2px solid #a78bfa" : "1px solid #4c1d95", background: totalYears === 4 ? "rgba(167,139,250,0.10)" : "rgba(124,58,237,0.05)" }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${totalYears === 4 ? "#a78bfa" : "#4c1d95"}`, background: totalYears === 4 ? "#a78bfa" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#1a1a2e", fontWeight: 800 }}>{totalYears === 4 ? "✓" : ""}</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: totalYears === 4 ? "#c4b5fd" : "#c4b5fd", fontWeight: 700, fontSize: 13 }}>🎪 4-Year Mode (6/7/8/8 turn schedule)</div>
              <div style={{ color: "#64748b", fontSize: 11, marginTop: 2 }}>{totalYears === 4 ? "On — a longer game with escalating turn counts. 29 turns per player total." : "Off — standard 3-year game, 6 turns per year (18 turns total)."}</div>
            </div>
          </label>
          <label onClick={() => setStageOpenFameBonus(!stageOpenFameBonus)} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10, padding: 10, borderRadius: 10, border: stageOpenFameBonus ? "2px solid #22c55e" : "1px solid #4c1d95", background: stageOpenFameBonus ? "rgba(34,197,94,0.08)" : "rgba(124,58,237,0.05)" }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${stageOpenFameBonus ? "#22c55e" : "#4c1d95"}`, background: stageOpenFameBonus ? "#22c55e" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#1a1a2e", fontWeight: 800 }}>{stageOpenFameBonus ? "✓" : ""}</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: stageOpenFameBonus ? "#86efac" : "#c4b5fd", fontWeight: 700, fontSize: 13 }}>🔥 +1 Fame when opening a new stage</div>
              <div style={{ color: "#64748b", fontSize: 11, marginTop: 2 }}>{stageOpenFameBonus ? "On — opening a stage grants +1 Fame at the start of the next year." : "Off — opening a stage is free of Fame reward. Fame is scarcer overall."}</div>
            </div>
          </label>
          <label onClick={() => setInfraRewardsMode(!infraRewardsMode)} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10, padding: 10, borderRadius: 10, border: infraRewardsMode ? "2px solid #22c55e" : "1px solid #4c1d95", background: infraRewardsMode ? "rgba(34,197,94,0.08)" : "rgba(124,58,237,0.05)" }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${infraRewardsMode ? "#22c55e" : "#4c1d95"}`, background: infraRewardsMode ? "#22c55e" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#1a1a2e", fontWeight: 800 }}>{infraRewardsMode ? "✓" : ""}</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: infraRewardsMode ? "#86efac" : "#c4b5fd", fontWeight: 700, fontSize: 13 }}>🏗️ Infrastructure Rewards (Most Campsites / Portaloos / Catering / Security)</div>
              <div style={{ color: "#64748b", fontSize: 11, marginTop: 2 }}>{infraRewardsMode ? "On — each amenity type has a game-specific benefit for whoever leads strictly. 4 rewards drawn from a pool of 12 at game start; ties = no benefit." : "Off — amenities don't grant special leader bonuses."}</div>
            </div>
          </label>
        </div>
      </div>
      <div style={{ ...card, marginTop: 16, padding: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <div>
            <div style={{ color: "#93c5fd", fontWeight: 700, fontSize: 14, marginBottom: 2 }}>📖 New to Headliners?</div>
            <div style={{ color: "#94a3b8", fontSize: 12 }}>Read the quick guide — turn flow, the dice, microtrends, agents, the lot.</div>
          </div>
          <button onClick={() => setShowHowToPlay(true)} style={{ ...bs, fontSize: 13, padding: "10px 18px", whiteSpace: "nowrap" }}>How to Play →</button>
        </div>
      </div>
    </div>{anim}</div>
  );

  // ═══════════════════════════════════════════════════════════
  if (phase === "winConditionChoice") {
    const firstHuman = players.find(p => !p.isAI);
    const pickCondition = (cond, label) => {
      setWinCondition(cond);
      addLogH(`Win Condition: ${label}`, "year");
      addLog(firstHuman?.festivalName || "?", `chose "${label}" as the win condition`);
      // v154: if identities are enabled, players pick identities before setup begins.
      if (identitiesModeRef.current) {
        // Deal 3 unique identities to each player. AIs auto-pick randomly.
        const dealt = {};
        players.forEach(p => {
          const shuffled = [...ALL_IDENTITIES].sort(() => Math.random() - 0.5);
          dealt[p.id] = shuffled.slice(0, 3).map(i => i.id);
        });
        setIdentityDealt(dealt);
        setIdentityPickerIdx(0);
        // Auto-pick for AI at the front of the queue
        setPhase("identityChoice");
      } else {
        setPhase("setup"); addLogH("Setup Phase", "year");
      }
    };
    const opt = (cond, label, blurb, tie) => <button onClick={() => pickCondition(cond, label)} style={{
      padding: 18, borderRadius: 12, background: "linear-gradient(135deg, rgba(251,191,36,0.10), rgba(124,58,237,0.06))",
      border: "2px solid rgba(251,191,36,0.5)", color: "#e2e8f0", cursor: "pointer", textAlign: "left",
      transition: "all 0.15s", width: "100%"
    }}>
      <div style={{ fontWeight: 800, fontSize: 17, color: "#fbbf24", marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 13, color: "#e2e8f0", lineHeight: 1.5, marginBottom: 6 }}>{blurb}</div>
      <div style={{ fontSize: 11, color: "#94a3b8", fontStyle: "italic" }}>{tie}</div>
    </button>;
    return <div style={CS}>{utilButtons}{showLog && <GameLog log={gameLog} onClose={() => setShowLog(false)} />}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 24, minHeight: "100vh" }}>
        <div style={{ ...card, maxWidth: 640, width: "100%", textAlign: "center", marginTop: 24 }}>
          <div style={{ fontSize: 11, color: "#fbbf24", textTransform: "uppercase", letterSpacing: 1.4, fontWeight: 700, marginBottom: 4 }}>🏆 First Player's Choice</div>
          <h2 style={{ color: "#e2e8f0", fontSize: 26, margin: "0 0 6px" }}>Choose the win condition</h2>
          <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 20 }}><strong style={{ color: "#c4b5fd" }}>{firstHuman?.festivalName}</strong> picks how this game will be decided.</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {opt("consistency", "🎯 Consistency", "Have the most tickets sold in the most years to win. In a 3-year game, leading in tickets 2+ years wins. In a 4-year game, the most year-leads takes it.", "Ties broken by cumulative total.")}
            {opt("following", "📈 Following", "Add your ticket sales up from every year. The highest game total wins.", "The default rule — steady growth pays off.")}
            {opt("talkOfTheTown", "⭐ Talk of the Town", "The player with the highest single-year ticket count at game end wins — one huge festival is all you need.", "Ties broken by second-best year, then cumulative.")}
          </div>
        </div>
      </div>{anim}</div>;
  }

  // v154: identity picker — each player in turn picks 1 of 3 dealt festival identities
  // before setup begins. AIs auto-pick a random option.
  if (phase === "identityChoice") {
    const currentPicker = players[identityPickerIdx];
    const advance = () => {
      const next = identityPickerIdx + 1;
      if (next >= players.length) {
        setPhase("setup"); addLogH("Setup Phase", "year");
      } else {
        setIdentityPickerIdx(next);
      }
    };
    const pickIdentity = (identityId) => {
      const identity = getIdentity(identityId);
      setPlayerIdentities(prev => ({ ...prev, [currentPicker.id]: identityId }));
      addLog(currentPicker.festivalName, `chose the "${identity?.name}" festival identity`);
      setTimeout(advance, 300);
    };
    // If the current picker is AI, auto-pick a random option from the dealt three and advance.
    if (currentPicker?.isAI) {
      const options = identityDealt[currentPicker.id] || [];
      if (options.length > 0) {
        setTimeout(() => pickIdentity(options[Math.floor(Math.random() * options.length)]), 800);
      }
    }
    const options = (identityDealt[currentPicker?.id] || []).map(id => getIdentity(id)).filter(Boolean);
    return <div style={CS}>{utilButtons}{showLog && <GameLog log={gameLog} onClose={() => setShowLog(false)} />}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", padding: 24, minHeight: "100vh" }}>
        <div style={{ ...card, maxWidth: 760, width: "100%", textAlign: "center", marginTop: 24 }}>
          <div style={{ fontSize: 11, color: "#fbbf24", textTransform: "uppercase", letterSpacing: 1.4, fontWeight: 700, marginBottom: 4 }}>🎭 Festival Identity</div>
          <h2 style={{ color: "#e2e8f0", fontSize: 26, margin: "0 0 6px" }}>{currentPicker?.festivalName}: pick your festival's identity</h2>
          <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 18 }}>{currentPicker?.isAI ? "AI is choosing…" : "This identity will shape your festival's scoring for the whole game."} <span style={{ color: "#64748b" }}>Player {identityPickerIdx + 1} of {players.length}</span></p>
          {currentPicker?.isAI ? <div style={{ color: "#64748b", fontSize: 14, padding: 40 }}>⏳ Waiting for AI…</div> : <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {options.map(identity => <button key={identity.id} onClick={() => pickIdentity(identity.id)} style={{
              padding: 16, borderRadius: 12, background: "linear-gradient(135deg, rgba(251,191,36,0.10), rgba(124,58,237,0.06))",
              border: "2px solid rgba(251,191,36,0.5)", color: "#e2e8f0", cursor: "pointer", textAlign: "left",
              transition: "all 0.15s", width: "100%",
            }}>
              <div style={{ fontWeight: 800, fontSize: 17, color: "#fbbf24", marginBottom: 4 }}>{identity.name}</div>
              <div style={{ fontSize: 11, color: "#c4b5fd", fontStyle: "italic", marginBottom: 8 }}>Goal: {identity.goal}</div>
              <div style={{ fontSize: 12, color: "#86efac", lineHeight: 1.4, marginBottom: 4 }}><strong>✓</strong> {identity.benefit}</div>
              <div style={{ fontSize: 12, color: "#f87171", lineHeight: 1.4 }}><strong>✗</strong> {identity.penalty}</div>
            </button>)}
          </div>}
        </div>
      </div>{anim}</div>;
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER: SETUP
  // ═══════════════════════════════════════════════════════════
  if (phase === "setup") {
    const pd = playerData[currentSetupPlayer.id] || {};
    return (<div style={CS}>{utilButtons}{showLog && <GameLog log={gameLog} onClose={() => setShowLog(false)} />}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 24, minHeight: "100vh" }}>
        <h2 style={{ color: "#c4b5fd", fontSize: 24, fontWeight: 800, marginBottom: 4 }}>🎪 Setup — {currentSetupPlayer.festivalName}</h2>
        <p style={{ color: "#8b5cf6", fontSize: 13, marginBottom: 20 }}>Player {setupIndex + 1} of {players.length}</p>
        {setupStep === "viewObjective" && (() => {
          return <div style={{ ...card, maxWidth: 520, width: "100%", textAlign: "center" }}>
            <h3 style={{ color: "#fbbf24", marginBottom: 8, fontSize: 20 }}>🎯 Artist Objectives</h3>
            <p style={{ color: "#8b5cf6", fontSize: 12, marginBottom: 16 }}>After the draft, you'll choose an artist objective from a pair of options.</p>
            <button onClick={confirmViewObjective} style={{ ...bp, width: "100%" }}>Continue to Draft →</button>
          </div>;
        })()}
        {setupStep === "draftArtist" && <div style={{ ...card, maxWidth: 700, width: "100%", textAlign: "center" }}>
          <h3 style={{ color: "#e9d5ff", marginBottom: 8 }}>Draft your starting artists</h3>
          <p style={{ color: "#8b5cf6", fontSize: 12, marginBottom: 12 }}>Choose <strong style={{ color: "#fbbf24" }}>2</strong> of these 6 artists for your hand. The rest go back into the deck.</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
            {setupDraftOptions.map((a, i) => <ArtistCard key={i} artist={a} showCost selected={(setupDraftSelected || []).includes(i)} onClick={() => toggleDraftSelection(i)} />)}
          </div>
          <p style={{ color: "#94a3b8", fontSize: 11, marginBottom: 12 }}>{(setupDraftSelected || []).length}/2 selected</p>
          <button onClick={confirmSetupDraft} disabled={(setupDraftSelected || []).length !== 2} style={{ ...bp, width: "100%", opacity: (setupDraftSelected || []).length === 2 ? 1 : 0.4 }}>Draft 2 Artists →</button>
        </div>}

        {setupStep === "pickAmenity" && (() => {
          const pd = playerData[currentSetupPlayer.id] || {};
          return <div style={{ ...card, maxWidth: 520, width: "100%", textAlign: "center" }}>
            <h3 style={{ color: "#e9d5ff", marginBottom: 12 }}>Choose your starting amenity</h3>
            <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 16 }}>This will be placed in your festival grounds to help you court artists.</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>{AMENITY_TYPES.map(t => <button key={t} onClick={() => { setSetupSelectedAmenity(t); setSetupSelectedField(0); }} style={{ padding: 16, borderRadius: 12, border: setupSelectedAmenity === t ? `2px solid ${AMENITY_COLORS[t]}` : "2px solid #2a2a4a", background: setupSelectedAmenity === t ? "rgba(124,58,237,0.2)" : "#1a1a2e", color: "#e2e8f0", cursor: "pointer", textAlign: "center" }}><div style={{ fontSize: 28 }}>{AMENITY_ICONS[t]}</div><div style={{ fontWeight: 600, marginTop: 4 }}>{AMENITY_LABELS[t]}</div></button>)}</div>
            <button onClick={() => confirmSetupAmenity()} disabled={!setupSelectedAmenity} style={{ ...bp, marginTop: 12, width: "100%", opacity: setupSelectedAmenity ? 1 : 0.4 }}>Confirm →</button>
          </div>;
        })()}
        {setupStep === "confirm" && <div style={{ ...card, maxWidth: 520, width: "100%", textAlign: "center" }}>
          <p style={{ color: "#34d399", margin: 0, fontSize: 14, fontWeight: 600, marginBottom: 12 }}>✓ Confirm your starting setup.</p>
          <PlayerBoard pd={playerData[currentSetupPlayer.id] || {}} compact year={1} />
          <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 16 }}>
            <button onClick={undoSetupPlacement} style={bs}>↩ Undo</button>
            <button onClick={confirmSetupPlacement} style={bp}>{setupIndex < players.length - 1 ? "Confirm & Next →" : "Confirm & Start 🎶"}</button>
          </div>
        </div>}
      </div>{anim}</div>);
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER: OBJECTIVE CHOICE
  // ═══════════════════════════════════════════════════════════

  if (phase === "objectiveChoice" && pendingObjectiveChoice) {
    const choicePlayer = players.find(p => p.id === pendingObjectiveChoice.playerId);
    const choicePd = playerData[pendingObjectiveChoice.playerId] || {};
    const choiceHand = choicePd.hand || [];
    const isAI = choicePlayer?.isAI;
    
    const handleObjectivePick = (obj) => {
      const currentPid = pendingObjectiveChoice.playerId;
      chooseObjective(obj);
      setPendingObjectiveChoice(null);
      // Find next human player who hasn't chosen
      const currentIdx = players.findIndex(p => p.id === currentPid);
      let nextHuman = null;
      for (let i = currentIdx + 1; i < players.length; i++) {
        if (!players[i].isAI) { nextHuman = players[i]; break; }
      }
      if (nextHuman) {
        setTimeout(() => offerObjectiveChoice(nextHuman.id), 300);
      } else {
        setTimeout(() => setPhase("game"), 300);
      }
    };

    // Only human players reach this screen — AI objectives assigned in startGame
    return (<div style={CS}>{utilButtons}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24 }}>
        <div style={{ ...card, textAlign: "center", maxWidth: 550, width: "100%" }}>
          <h2 style={{ color: "#fbbf24", fontSize: 24, marginBottom: 8 }}>🎯 Choose Your Objective</h2>
          <h3 style={{ color: "#c4b5fd", fontSize: 16, marginBottom: 16 }}>{choicePlayer?.festivalName}</h3>
          
          {/* Show hand */}
          {!isAI && <div style={{ marginBottom: 16, padding: 10, borderRadius: 10, background: "rgba(124,58,237,0.08)", border: "1px solid #7c3aed30" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#8b5cf6", textTransform: "uppercase", marginBottom: 6 }}>Your Hand</div>
            <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
              {choiceHand.map((a, i) => <ArtistCard key={i} artist={a} small showCost />)}
            </div>
          </div>}

          <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 16 }}>Pick one objective to work toward. Complete it to earn VP and unlock a new one!</p>
          
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            {pendingObjectiveChoice.options.map((obj, i) => (
              <div key={i} onClick={() => {
                if (isAI) return;
                handleObjectivePick(obj);
              }} style={{ flex: "1 1 200px", maxWidth: 250, padding: 16, borderRadius: 12, background: "rgba(124,58,237,0.1)", border: "2px solid #7c3aed", cursor: isAI ? "default" : "pointer", textAlign: "left", transition: "all 0.15s", opacity: isAI ? 0.5 : 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#e9d5ff", marginBottom: 6 }}>{obj.name}</div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>{obj.req}</div>
                <div style={{ fontSize: 12, color: "#4ade80", fontWeight: 600 }}>{obj.reward}</div>
              </div>
            ))}
          </div>
        </div>
      </div>{anim}</div>);
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER: GAME
  // ═══════════════════════════════════════════════════════════
  if (phase === "game") {
    const handCards = currentPD.hand || [];
    const stageArtists = currentPD.stageArtists || currentPD.stages?.map(() => []) || [];
    return (<div style={CS}>{utilButtons}{updateNotesModal}
      {showLog && <GameLog log={gameLog} onClose={() => setShowLog(false)} />}
      {showDiscard && <DiscardViewer discard={discardPile} onClose={() => setShowDiscard(false)} />}
      {/* Headliner celebration */}
      {/* Dice Roll Overlay */}
      {pendingDiceRoll && <DiceRollOverlay
        pendingRoll={pendingDiceRoll}
        sfx={sfx}
        onRoll={(results) => setPendingDiceRoll(prev => ({ ...prev, results, rolled: true }))}
        onComplete={(results) => { if (pendingDiceRoll.callback) pendingDiceRoll.callback(results); setPendingDiceRoll(null); }}
      />}
      {showHeadliner && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 950, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowHeadliner(null)}>
        <div style={{ textAlign: "center", animation: "bookReveal 0.5s" }}>
          <div style={{ fontSize: 64, marginBottom: 12 }}>🌟🎤🌟</div>
          <h1 style={{ fontSize: 36, fontWeight: 900, color: "#fbbf24", margin: "0 0 12px", animation: "headlinerPulse 1s infinite" }}>HEADLINER!</h1>
          <div style={{ display: "inline-block", marginBottom: 12 }}><ArtistCard artist={showHeadliner.artist} showCost /></div>
          <p style={{ color: "#c4b5fd", fontSize: 16, marginBottom: 4 }}>Headlines at {showHeadliner.festival}!</p>
          {showHeadliner.artist.effect && <p style={{ color: "#fbbf24", fontSize: 14, padding: "8px 16px", borderRadius: 10, background: "rgba(251,191,36,0.1)", display: "inline-block" }}>✨ {showHeadliner.artist.effect}</p>}
          <p style={{ color: "#6b7280", fontSize: 12, marginTop: 12 }}>Click anywhere to continue</p>
        </div>
      </div>}
      {/* v197.13: Bouncer Rights (sec_1) — human picks any amenity type. */}
      {sec1Choice && (() => {
        const picker = players.find(p => p.id === sec1Choice.pid);
        const finalize = (chosen) => {
          const nd = [...dice]; nd.splice(sec1Choice.dieIdx, 1); setDice(nd);
          addLog(picker?.festivalName || "?", `Bouncer Rights: chose ${AMENITY_LABELS[chosen]} (substituting from ${AMENITY_LABELS[sec1Choice.origType]})`);
          // Traffic Flow (port_2) — draw 1 if also holding port_2.
          if (hasInfraReward(sec1Choice.pid, "port_2")) {
            const drawn = drawFromDeck(1);
            if (drawn.length > 0) {
              setPlayerData(p => ({ ...p, [sec1Choice.pid]: { ...p[sec1Choice.pid], hand: [...(p[sec1Choice.pid].hand || []), ...drawn] } }));
              addLog("🏗️ Reward", `${picker?.festivalName || "?"}: drew ${drawn[0].name} from Traffic Flow`);
            }
          }
          placeAmenityCounter(chosen, 0);
          setSelectedDie(null);
          setPickingFieldFor(null);
          setSec1Choice(null);
        };
        return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 960, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ ...card, textAlign: "center", maxWidth: 500, width: "100%" }}>
            <h3 style={{ color: "#fb923c", marginBottom: 8 }}>🛡️ Bouncer Rights</h3>
            <p style={{ color: "#c4b5fd", fontSize: 12, marginBottom: 4 }}>You rolled {AMENITY_EMOJI[sec1Choice.origType]} {AMENITY_LABELS[sec1Choice.origType]}, but Most Security lets you choose which amenity you receive.</p>
            <p style={{ color: "#94a3b8", fontSize: 11, marginBottom: 14 }}>Pick any amenity type:</p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              {["campsite", "portaloo", "catering", "security"].map(t => (
                <button key={t} onClick={() => finalize(t)} style={{
                  ...bp, padding: "12px 18px", fontSize: 13,
                  background: t === sec1Choice.origType ? "rgba(74,222,128,0.2)" : undefined,
                  border: t === sec1Choice.origType ? "2px solid #4ade80" : undefined,
                }}>
                  {AMENITY_EMOJI[t]} {AMENITY_LABELS[t]}
                  {t === sec1Choice.origType && <div style={{ fontSize: 9, marginTop: 2, opacity: 0.8 }}>(rolled)</div>}
                </button>
              ))}
            </div>
          </div>
        </div>;
      })()}
      {/* v197.13: Scouted Talent (sec_2) — draw 3, keep 1. */}
      {sec2Draw && (() => {
        const picker = players.find(p => p.id === sec2Draw.pid);
        const pickOne = (idx) => {
          const kept = sec2Draw.cards[idx];
          const discarded = sec2Draw.cards.filter((_, i) => i !== idx);
          setPlayerData(p => ({ ...p, [sec2Draw.pid]: { ...p[sec2Draw.pid], hand: [...(p[sec2Draw.pid].hand || []), kept] } }));
          setDiscardPile(prev => [...prev, ...discarded]);
          addLog("🏗️ Reward", `${picker?.festivalName || "?"}: kept ${kept.name} from Scouted Talent (discarded ${discarded.map(a => a.name).join(", ")})`);
          setSec2Draw(null);
        };
        return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 960, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ ...card, textAlign: "center", maxWidth: 700, width: "100%" }}>
            <h3 style={{ color: "#fb923c", marginBottom: 8 }}>🛡️ Scouted Talent</h3>
            <p style={{ color: "#c4b5fd", fontSize: 12, marginBottom: 14 }}>You drew 3 artists at the start of your turn — pick one to keep. The other two go to the discard pile.</p>
            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              {sec2Draw.cards.map((a, i) => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                  <ArtistCard artist={a} showCost onClick={() => pickOne(i)} />
                  <div style={{ fontSize: 10, color: "#fb923c", fontWeight: 700 }}>Click to keep</div>
                </div>
              ))}
            </div>
          </div>
        </div>;
      })()}
      {/* Booked artist popup (non-headliner) */}
      {showBookedArtist && !showHeadliner && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 945, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowBookedArtist(null)}>
        <div style={{ textAlign: "center", animation: "bookReveal 0.4s" }}>
          <p style={{ color: "#c4b5fd", fontSize: 14, marginBottom: 8 }}>🎤 Booked to {showBookedArtist.stageName}</p>
          <div style={{ display: "inline-block", marginBottom: 12 }}><ArtistCard artist={showBookedArtist.artist} showCost /></div>
          {showBookedArtist.artist.effect && <div style={{ marginTop: 4 }}>
            <p style={{ color: "#4ade80", fontSize: 13, padding: "6px 14px", borderRadius: 8, background: "rgba(34,197,94,0.1)", display: "inline-block" }}>✨ {showBookedArtist.artist.effect}</p>
          </div>}
          <p style={{ color: "#6b7280", fontSize: 11, marginTop: 12 }}>Click anywhere to continue</p>
        </div>
      </div>}
      {/* Council drawArtists bonus popup — shown to humans when bonus draws fire */}
      {showCouncilDrawBonus && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 955, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setShowCouncilDrawBonus(null)}>
        <div onClick={e => e.stopPropagation()} style={{ textAlign: "center", animation: "bookReveal 0.45s", maxWidth: 640, width: "100%" }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>📋✨</div>
          <h2 style={{ color: "#86efac", fontSize: 26, fontWeight: 900, margin: "0 0 6px" }}>Council Bonus!</h2>
          <p style={{ color: "#c4b5fd", fontSize: 14, marginBottom: 16 }}>{showCouncilDrawBonus.festival} drew +{showCouncilDrawBonus.drawn.length} extra artist{showCouncilDrawBonus.drawn.length === 1 ? "" : "s"} from the deck</p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center", marginBottom: 16 }}>
            {showCouncilDrawBonus.drawn.map((a, i) => <div key={i} style={{ animation: `bookReveal 0.5s ${i * 0.12}s both` }}><ArtistCard artist={a} showCost /></div>)}
          </div>
          <button onClick={() => setShowCouncilDrawBonus(null)} style={{ padding: "10px 24px", borderRadius: 10, border: "1px solid #86efac", background: "rgba(34,197,94,0.2)", color: "#86efac", cursor: "pointer", fontWeight: 700, fontSize: 14 }}>Continue ✓</button>
        </div>
      </div>}
      {/* Floating bonuses */}
      {floatingBonuses.map(fb => <div key={fb.id} style={{ position: "fixed", top: `calc(35% + ${fb.offset || 0}px)`, left: "50%", transform: "translateX(-50%)", zIndex: 999, pointerEvents: "none", animation: "floatUp 2.2s forwards" }}>
        <span style={{ fontSize: 28, fontWeight: 900, color: fb.color, textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>{fb.text}</span>
      </div>)}
      {/* Stage detail popup */}
      {showStageDetail && (() => {
        const sd = showStageDetail;
        const pd = playerData[sd.playerId] || {};
        const sa = (pd.stageArtists || [])[sd.stageIdx] || [];
        const sName = (pd.stageNames || [])[sd.stageIdx] || `Stage ${sd.stageIdx + 1}`;
        const sColor = (pd.stageColors || [])[sd.stageIdx] || "#7c3aed";
        const totalTickets = sa.reduce((s, a) => s + a.tickets, 0);
        const totalVP = sa.reduce((s, a) => s + a.vp, 0);
        const allGenres = new Set(); sa.forEach(a => getGenres(a.genre).forEach(g => allGenres.add(g)));
        return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 950, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setShowStageDetail(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#0f0e1a", border: `2px solid ${sColor}`, borderRadius: 20, padding: 28, maxWidth: 500, width: "100%", textAlign: "center" }}>
            <div style={{ width: 16, height: 16, borderRadius: "50%", background: sColor, margin: "0 auto 8px" }} />
            <h2 style={{ color: sColor, fontSize: 24, fontWeight: 900, margin: "0 0 4px" }}>{sName}</h2>
            <p style={{ color: "#8b5cf6", fontSize: 12, margin: "0 0 8px" }}>{sa.length === 3 ? "🎉 Full Lineup!" : `${sa.length}/3 artists booked`}</p>
            {allGenres.size > 0 && <div style={{ display: "flex", gap: 6, justifyContent: "center", marginBottom: 16, flexWrap: "wrap" }}>
              {[...allGenres].map(g => <span key={g} style={{ padding: "3px 10px", borderRadius: 20, background: GENRE_COLORS[g] || "#6b7280", color: "#fff", fontSize: 10, fontWeight: 700 }}>{g}</span>)}
            </div>}
            {sa.length === 0 && <p style={{ color: "#64748b", fontSize: 14, marginBottom: 16 }}>No artists booked yet. Book artists to fill your lineup!</p>}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              {sa.map((a, ai) => {
                const isHL = ai === 2;
                const gs = getGenres(a.genre);
                return <div key={ai} style={{ padding: 14, borderRadius: 14, background: genreGradient(a.genre), color: "#fff", textAlign: "left", position: "relative", border: isHL ? "3px solid #fbbf24" : "2px solid rgba(255,255,255,0.1)", boxShadow: isHL ? "0 0 20px rgba(251,191,36,0.3)" : "0 2px 8px rgba(0,0,0,0.3)" }}>
                  {isHL && <div style={{ position: "absolute", top: -10, right: 12, background: "linear-gradient(135deg, #fbbf24, #f59e0b)", color: "#000", fontSize: 10, fontWeight: 800, padding: "3px 10px", borderRadius: 10, textTransform: "uppercase", boxShadow: "0 2px 8px rgba(251,191,36,0.4)" }}>⭐ Headliner</div>}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 16, textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>{a.name}</div>
                      <div style={{ fontSize: 11, opacity: 0.9, marginTop: 2 }}>{gs.map(g => <span key={g} style={{ marginRight: 6 }}>{g}</span>)} • 🔥 {a.fame}</div>
                    </div>
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>🎟️ {(a.tickets || 0) + (a.vp || 0)}</div>
                    </div>
                  </div>
                  {a.effect && <div style={{ fontSize: 11, marginTop: 8, padding: "5px 10px", borderRadius: 8, background: "rgba(0,0,0,0.3)", fontStyle: "italic" }}>✨ {a.effect}</div>}
                </div>;
              })}
            </div>
            {sa.length > 0 && <div style={{ display: "flex", justifyContent: "center", gap: 24, padding: "12px 0", borderTop: "1px solid #2a2a4a", borderBottom: "1px solid #2a2a4a", marginBottom: 12 }}>
              <div style={{ textAlign: "center" }}><div style={{ fontSize: 10, color: "#8b5cf6", textTransform: "uppercase" }}>Tickets</div><div style={{ fontSize: 22, fontWeight: 900, color: "#fbbf24" }}>{totalTickets}</div></div>
              <div style={{ textAlign: "center" }}><div style={{ fontSize: 10, color: "#8b5cf6", textTransform: "uppercase" }}>VP</div><div style={{ fontSize: 22, fontWeight: 900, color: "#c4b5fd" }}>{totalVP}</div></div>
              <div style={{ textAlign: "center" }}><div style={{ fontSize: 10, color: "#8b5cf6", textTransform: "uppercase" }}>Genres</div><div style={{ fontSize: 22, fontWeight: 900, color: "#4ade80" }}>{allGenres.size}</div></div>
            </div>}
            <button onClick={() => setShowStageDetail(null)} style={{ ...bp }}>Close</button>
          </div>
        </div>;
      })()}
      {/* Pending Effect Resolution */}
      {pendingEffect && pendingEffectPid === currentPlayerId && (() => {
        const pe = pendingEffect;
        const pid = pendingEffectPid;
        const pd = playerData[pid] || {};

        const placeBonusAmenity = (aType, fieldIdx) => {
          if (!aType || fieldIdx == null) return;
          setPlayerData(p => {
            const cur = p[pid];
            let updated = mutateAmenity(cur, fieldIdx, aType, +1);
            if (aType === "security" && cur.vpPerSecurity > 0) {
              logTicketGain(pid, cur.vpPerSecurity, "Security placement bonus");
              updated = { ...updated, bonusTickets: (updated.bonusTickets || 0) + cur.vpPerSecurity };
              addLog("Effect", `+${cur.vpPerSecurity} 🎟️ tickets from security build!`);
            }
            return { ...p, [pid]: updated };
          });
          addLog("Effect", `Built bonus ${AMENITY_LABELS[aType]} in Field ${fieldIdx + 1}`);
          sfx.placeAmenity();
          const remaining = (pe.placeCount || 1) - 1;
          if (remaining > 0) {
            // Reset chosenType for placeAmenity (player picks again); keep amenityType for placeSpecific
            if (pe.type === "placeAmenity") setPendingEffect({ ...pe, placeCount: remaining, chosenType: null });
            else setPendingEffect({ ...pe, placeCount: remaining });
          } else {
            setPendingEffect(null); setPendingEffectPid(null);
          }
          setTimeout(() => recalcTickets(), 50);
        };

        // Reusable field picker — shows 3 field buttons with current counts and assigned council
        const fieldPicker = (aType) => {
          const fields = pd.fields || emptyFields();
          const councils = pd.councils || [];
          return <div style={{ marginTop: 12 }}>
            <div style={{ fontSize: 12, color: "#fbbf24", marginBottom: 8, fontWeight: 700 }}>Pick a field:</div>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${FIELD_COUNT}, 1fr)`, gap: 8 }}>
              {fields.map((f, fIdx) => {
                const fTotal = (f?.campsite || 0) + (f?.security || 0) + (f?.catering || 0) + (f?.portaloo || 0);
                const c = councils[fIdx];
                const fieldHypothetical = { ...f, [aType]: (f?.[aType] || 0) + 1 };
                const wouldQualify = c ? councilQualifies(c, fieldHypothetical, year || 1) : false;
                return <button key={fIdx} onClick={() => placeBonusAmenity(aType, fIdx)} style={{
                  padding: 10,
                  borderRadius: 10,
                  border: "2px solid #a78bfa",
                  background: "rgba(167,139,250,0.12)",
                  color: "#e9d5ff",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: 12,
                  textAlign: "left",
                }}>
                  <div style={{ textAlign: "center", marginBottom: 4 }}>Field {fIdx + 1}</div>
                  <div style={{ fontSize: 9, color: "#94a3b8", fontWeight: 500, textAlign: "center", marginBottom: 6 }}>{fTotal} amenit{fTotal === 1 ? "y" : "ies"}</div>
                  {c ? <div style={{
                    padding: 5,
                    borderRadius: 5,
                    background: wouldQualify ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.06)",
                    border: wouldQualify ? "1px solid #22c55e80" : "1px solid #ef444440",
                    boxShadow: wouldQualify ? "0 0 6px rgba(34,197,94,0.25)" : "none",
                  }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: wouldQualify ? "#86efac" : "#fca5a5", marginBottom: 1 }}>{wouldQualify ? "✓" : "✗"} {c.name}</div>
                    <div style={{ fontSize: 8, color: "#94a3b8", lineHeight: 1.2 }}>{formatCouncilCondition(c)}</div>
                    <div style={{ fontSize: 8, color: wouldQualify ? "#4ade80" : "#94a3b8", lineHeight: 1.2, marginTop: 1, opacity: wouldQualify ? 1 : 0.7 }}>{formatCouncilReward(c)}</div>
                  </div> : <div style={{ fontSize: 9, color: "#475569", textAlign: "center", fontStyle: "italic" }}>(no council)</div>}
                </button>;
              })}
            </div>
          </div>;
        };

        if (pe.type === "placeSpecific") {
          return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 960, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ ...card, textAlign: "center", maxWidth: 440 }}>
              <h3 style={{ color: "#4ade80", marginBottom: 12 }}>✨ {pe.artistName}</h3>
              <p style={{ color: "#c4b5fd", fontSize: 13, marginBottom: 4 }}>Build a bonus {AMENITY_ICONS[pe.amenityType]} {AMENITY_LABELS[pe.amenityType]}{(pe.placeCount || 1) > 1 ? ` (${pe.placeCount} remaining)` : ""}</p>
              {fieldPicker(pe.amenityType)}
            </div>
          </div>;
        }

        if (pe.type === "placeAmenity") {
          // Step 1: pick amenity type. Step 2: pick field (when chosenType is set).
          if (!pe.chosenType) {
            return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 960, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ ...card, textAlign: "center", maxWidth: 400 }}>
                <h3 style={{ color: "#4ade80", marginBottom: 12 }}>✨ {pe.artistName || "Effect"}: Choose an amenity to build!{(pe.placeCount || 1) > 1 ? ` (${pe.placeCount} remaining)` : ""}</h3>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {AMENITY_TYPES.map(t => <button key={t} onClick={() => setPendingEffect({ ...pe, chosenType: t })} style={{ padding: 14, borderRadius: 10, border: "2px solid #2a2a4a", background: "#1a1a2e", color: "#e2e8f0", cursor: "pointer", textAlign: "center" }}>
                    <div style={{ fontSize: 24 }}>{AMENITY_ICONS[t]}</div>
                    <div style={{ fontWeight: 600, marginTop: 4, fontSize: 12 }}>{AMENITY_LABELS[t]}</div>
                  </button>)}
                </div>
              </div>
            </div>;
          } else {
            return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 960, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ ...card, textAlign: "center", maxWidth: 440 }}>
                <h3 style={{ color: "#4ade80", marginBottom: 4 }}>✨ {pe.artistName || "Effect"}</h3>
                <p style={{ color: "#c4b5fd", fontSize: 13, marginBottom: 4 }}>{AMENITY_ICONS[pe.chosenType]} {AMENITY_LABELS[pe.chosenType]} selected</p>
                {fieldPicker(pe.chosenType)}
                <button onClick={() => setPendingEffect({ ...pe, chosenType: null })} style={{ ...bs, marginTop: 12, fontSize: 11 }}>← Change amenity</button>
              </div>
            </div>;
          }
        }

        if (pe.type === "pickIndieFromPool") {
          // v140: modal for "Choose an indie artist from the artist pool, if there is one."
          // Filters the current pool to Indie-genre artists (name-matched against snapshot
          // in case the pool shifted). Player clicks one to take it to hand.
          // v186: tempt/agent-protected artists are excluded from the choices.
          const protectedNames = getAgentProtectedNames();
          const indieArtists = artistPool.filter(a => getGenres(a.genre).includes("Indie") && !protectedNames.has(a.name));
          if (indieArtists.length === 0) {
            // Pool changed since queueing — nothing to pick anymore. Auto-close.
            setPendingEffect(null); setPendingEffectPid(null);
            return null;
          }
          return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 960, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ ...card, textAlign: "center", maxWidth: 600, width: "100%" }}>
              <h3 style={{ color: "#4ade80", marginBottom: 8 }}>🎸 {pe.artistName}: Choose an Indie artist to take</h3>
              <p style={{ color: "#8b5cf6", fontSize: 12, marginBottom: 12 }}>Pick one Indie artist from the pool. They'll go straight to your hand.</p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                {indieArtists.map((a, i) => <ArtistCard key={a.name + i} artist={a} small showCost onClick={() => {
                  setPlayerData(p => ({ ...p, [pid]: { ...p[pid], hand: [...(p[pid].hand || []), a] } }));
                  setArtistPool(prev => { const idx = prev.findIndex(x => x.name === a.name); if (idx < 0) return prev; const np = [...prev]; np.splice(idx, 1); return np; });
                  addLog("Effect", `Took ${a.name} into hand (via ${pe.artistName})`);
                  showFloatingBonus(`+${a.name} to hand`, "#4ade80");
                  setPendingEffect(null); setPendingEffectPid(null);
                }} />)}
              </div>
              <button onClick={() => { setPendingEffect(null); setPendingEffectPid(null); }} style={{ ...bs, marginTop: 12, fontSize: 11 }}>Skip (pass)</button>
            </div>
          </div>;
        }

        if (pe.type === "removeDieFromPool") {
          // v175: pick a die from the shared pool to remove (optional). Matching
          // dice are clickable; non-matching are shown grayed out for context. Skip
          // button declines the whole trade (no die removed, no benefit).
          const currentDice = dice || [];
          const filterType = pe.filterType; // "stage" | "fame" | "campsite" | "__anyAmenity__"
          const isMatch = (face) => filterType === "__anyAmenity__"
            ? (face !== "fame" && face !== "stage")
            : face === filterType;
          const faceLabel = (face) => {
            if (face === "fame") return "🔥 Fame";
            if (face === "stage") return "🎪 Stage";
            return `${AMENITY_ICONS[face] || "?"} ${AMENITY_LABELS[face] || face}`;
          };
          const targetLabel = filterType === "__anyAmenity__" ? "an amenity die (any)"
            : filterType === "fame" ? "a 🔥 Fame die"
            : filterType === "stage" ? "a 🎪 Stage die"
            : `a ${AMENITY_ICONS[filterType] || ""} ${AMENITY_LABELS[filterType] || filterType} die`;
          const benefitLabel = !pe.benefit ? "no bonus (effect check only)"
            : pe.benefit.type === "fame" ? `+${pe.benefit.amount} Fame`
            : pe.benefit.type === "ticket" ? `+${pe.benefit.amount} ticket sale${pe.benefit.amount === 1 ? "" : "s"}`
            : pe.benefit.type === "chainPlay" ? "play another artist from your hand"
            : "";
          const fireBenefit = () => {
            if (!pe.benefit) return;
            if (pe.benefit.type === "fame") {
              logFameGain(pid, pe.benefit.amount, `${pe.artistName} effect`);
              setPlayerData(p => ({ ...p, [pid]: { ...p[pid], baseFame: Math.min(FAME_MAX, (p[pid].baseFame || 0) + pe.benefit.amount) } }));
              addLog("Effect", `${pe.artistName}: +${pe.benefit.amount} Fame`);
              showFloatingBonus(`+${pe.benefit.amount} 🔥`, "#f97316");
              sfx.gainFame();
            } else if (pe.benefit.type === "ticket") {
              logTicketGain(pid, pe.benefit.amount, `${pe.artistName} effect`);
              setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + pe.benefit.amount } }));
              addLog("Effect", `${pe.artistName}: +${pe.benefit.amount} ticket sale${pe.benefit.amount === 1 ? "" : "s"}`);
              showFloatingBonus(`+${pe.benefit.amount} 🎟️`, "#fbbf24");
            } else if (pe.benefit.type === "chainPlay") {
              // Rage Against — respect 2-play cap.
              if ((playsThisTurnRef.current || 0) >= 2) {
                addLog("Effect", `${pe.artistName}: chain-play blocked (2-plays-per-turn cap)`);
                return;
              }
              setPendingEffect({
                type: "playFromHand",
                artistName: pe.artistName,
                free: false,
                suppressEffect: false,
              });
              // Note: setPendingEffectPid stays pid — already set from before.
              addLog("Effect", `${pe.artistName}: play another artist from your hand`);
              return; // don't clear pending — new pending has replaced it
            }
          };
          return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 960, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ ...card, textAlign: "center", maxWidth: 640, width: "100%" }}>
              <h3 style={{ color: "#c4b5fd", marginBottom: 8 }}>🎲 {pe.artistName}</h3>
              <p style={{ color: "#c4b5fd", fontSize: 13, marginBottom: 6 }}>Remove {targetLabel} from the shared pool for <b>{benefitLabel}</b>?</p>
              <p style={{ color: "#8b5cf6", fontSize: 11, marginBottom: 12 }}>Click a matching die to remove it, or Decline to skip the whole trade.</p>
              <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", marginBottom: 14 }}>
                {currentDice.map((face, di) => {
                  const match = isMatch(face);
                  return <button
                    key={di}
                    disabled={!match}
                    onClick={() => {
                      // Remove this die from the shared pool
                      setDice(prev => {
                        const nd = [...prev]; nd.splice(di, 1); return nd;
                      });
                      addLog("Effect", `${pe.artistName}: removed a ${faceLabel(face)} die from the pool`);
                      showFloatingBonus(`${faceLabel(face)} removed`, "#c4b5fd");
                      // Fire the benefit
                      fireBenefit();
                      // If benefit was chainPlay, it already set a new pending effect. Otherwise clear.
                      if (!pe.benefit || pe.benefit.type !== "chainPlay") {
                        setPendingEffect(null); setPendingEffectPid(null);
                      }
                    }}
                    style={{
                      padding: "10px 14px", borderRadius: 8,
                      border: match ? "2px solid #4ade80" : "1px solid #2a2a4a",
                      background: match ? "rgba(15,14,26,0.4)" : "rgba(15,14,26,0.4)",
                      color: match ? "#e9d5ff" : "#475569",
                      cursor: match ? "pointer" : "not-allowed",
                      fontSize: 13, fontWeight: 600,
                      opacity: match ? 1 : 0.4,
                      background: match ? "rgba(74,222,128,0.15)" : "rgba(15,14,26,0.4)",
                    }}
                  >{faceLabel(face)}</button>;
                })}
              </div>
              {/* v181: reroll button — offered when the shared pool has ≤2 amenity dice
                  (fame/stage don't count) AND the player hasn't already used their reroll
                  for this effect. Rerolling replaces the shared dice pool visible to all
                  players. Player still needs to click a matching die to remove afterward. */}
              {(() => {
                const amenityCount = currentDice.filter(d => d !== "fame" && d !== "stage").length;
                const canReroll = !pe.hasRerolled && amenityCount <= 2;
                if (!canReroll) return null;
                return <div style={{ marginBottom: 10 }}>
                  <button onClick={() => {
                    const fresh = rollDice();
                    setDice(fresh);
                    addLog("🎲 Reroll", `${pe.artistName}: rerolled the shared dice pool (was low on amenities)`);
                    sfx.rollDice && sfx.rollDice();
                    // Check if the new pool still has a matching die for this effect.
                    // If not, transition to the aborted modal instead of leaving the
                    // player in a picker with nothing to pick.
                    const has = pe.filterType === "__anyAmenity__"
                      ? fresh.some(d => d !== "fame" && d !== "stage")
                      : fresh.some(d => d === pe.filterType);
                    if (!has) {
                      const faceLabel = pe.filterType === "__anyAmenity__" ? "amenity" : pe.filterType;
                      setPendingEffect({
                        type: "effectAborted",
                        artistName: pe.artistName,
                        reason: pe.filterType === "__anyAmenity__"
                          ? "After reroll: still no amenity die in the shared pool."
                          : `After reroll: still no ${faceLabel === "fame" ? "🔥 Fame" : faceLabel === "stage" ? "🎪 Stage" : `${AMENITY_ICONS[faceLabel] || ""} ${AMENITY_LABELS[faceLabel] || faceLabel}`} die was rolled.`,
                        diceSnapshot: fresh,
                        filterType: pe.filterType,
                        benefit: pe.benefit,
                        hasRerolled: true, // reroll already spent
                      });
                    } else {
                      setPendingEffect({ ...pe, hasRerolled: true });
                    }
                  }} style={{ ...bp, fontSize: 11, padding: "6px 14px", background: "linear-gradient(135deg, #f97316, #ea580c)" }}>
                    🎲 Reroll shared dice (only {amenityCount} amenit{amenityCount === 1 ? "y" : "ies"} available)
                  </button>
                </div>;
              })()}
              {pe.hasRerolled && <p style={{ color: "#64748b", fontSize: 10, marginBottom: 8, fontStyle: "italic" }}>Reroll already used for this effect.</p>}
              <button onClick={() => {
                addLog("Effect", `${pe.artistName}: declined the trade — no die removed, no bonus`);
                setPendingEffect(null); setPendingEffectPid(null);
              }} style={{ ...bs, fontSize: 12 }}>Decline (skip effect)</button>
            </div>
          </div>;
        }

        if (pe.type === "drawFromPoolOrDeck") {
          // v172: player picks 1 artist at a time from either the pool (visible) or
          // the deck (blind draw). Repeats until drawsRemaining == 0.
          // v186: tempt/agent-protected artists are excluded from the pool panel.
          const remaining = pe.drawsRemaining || 1;
          const protectedNames = getAgentProtectedNames();
          const pool = (artistPool || []).filter(a => !protectedNames.has(a.name));
          return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 960, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ ...card, textAlign: "center", maxWidth: 720, width: "100%", maxHeight: "88vh", overflowY: "auto" }}>
              <h3 style={{ color: "#c4b5fd", marginBottom: 8 }}>🎴 {pe.artistName}: Draw {remaining} more</h3>
              <p style={{ color: "#8b5cf6", fontSize: 12, marginBottom: 12 }}>Pick from the pool below, or draw blind from the deck.{protectedNames.size > 0 ? " Tempted artists are hidden." : ""}</p>
              <button onClick={() => {
                const drawn = drawFromDeck(1);
                if (drawn.length > 0) {
                  setPlayerData(p => ({ ...p, [pid]: { ...p[pid], hand: [...(p[pid].hand || []), drawn[0]] } }));
                  addLog("Effect", `${pe.artistName}: drew ${drawn[0].name} from the deck`);
                }
                if (remaining > 1) setPendingEffect({ ...pe, drawsRemaining: remaining - 1 });
                else { setPendingEffect(null); setPendingEffectPid(null); }
              }} style={{ ...bp, marginBottom: 12, fontSize: 13, padding: "10px 20px" }}>🎴 Draw from Deck (blind)</button>
              {pool.length > 0 && <>
                <div style={{ color: "#94a3b8", fontSize: 11, marginBottom: 8 }}>— or pick from the pool —</div>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 8 }}>
                  {pool.map((a, i) => (
                    <div key={i} onClick={() => {
                      // v186: find by name in the FULL pool (display is filtered)
                      setArtistPool(prev => { const idx = prev.findIndex(x => x.name === a.name); if (idx < 0) return prev; const np = [...prev]; np.splice(idx, 1); return np; });
                      setPlayerData(p => ({ ...p, [pid]: { ...p[pid], hand: [...(p[pid].hand || []), a] } }));
                      addLog("Effect", `${pe.artistName}: picked ${a.name} from the pool`);
                      setLastActionFor(pid, `pulled ${a.name} from the pool (${pe.artistName} effect)`);
                      if (remaining > 1) setPendingEffect({ ...pe, drawsRemaining: remaining - 1 });
                      else { setPendingEffect(null); setPendingEffectPid(null); }
                    }} style={{ cursor: "pointer" }}>
                      <ArtistCard artist={a} showCost small />
                    </div>
                  ))}
                </div>
              </>}
              <button onClick={() => { setPendingEffect(null); setPendingEffectPid(null); }} style={{ ...bs, fontSize: 11, marginTop: 8 }}>Skip remaining draws</button>
            </div>
          </div>;
        }

        if (pe.type === "removeAmenities") {
          // v172: picker for sacrifice effects. v177 extended:
          //   - filterType: null = any amenity (Ms Banks, De La Soul), or a specific
          //     type ("catering" for Eve, "security" for Missy Elliott). Non-matching
          //     types are hidden.
          //   - benefit: fires on accept. { type: "fame"|"ticket", amount, thenDrawDeck?, thenDrawPool? }
          //   - followUp: legacy chain-play (Ms Banks) — set as next pending effect when done.
          //   - Decline button: aborts the whole trade (no sacrifice, no benefit).
          const fields = pd.fields || [{}, {}, {}];
          const remaining = pe.removalsRemaining || 0;
          const filterType = pe.filterType; // null = any, or a specific amenity type
          const showType = (t) => filterType == null || t === filterType;
          const benefitLabel = !pe.benefit ? ""
            : pe.benefit.type === "fame" ? `+${pe.benefit.amount} Fame${pe.benefit.thenDrawDeck ? `, then draw up to ${pe.benefit.thenDrawDeck} from the deck` : ""}`
            : pe.benefit.type === "ticket" ? `+${pe.benefit.amount} ticket sale${pe.benefit.amount === 1 ? "" : "s"}${pe.benefit.thenDrawPool ? `, then draw ${pe.benefit.thenDrawPool} from the pool` : ""}`
            : "";
          const fireBenefitAndAdvance = () => {
            // Fire the immediate part of the benefit (fame or ticket)
            if (pe.benefit) {
              if (pe.benefit.type === "fame") {
                logFameGain(pid, pe.benefit.amount, `${pe.artistName} effect`);
                setPlayerData(p => ({ ...p, [pid]: { ...p[pid], baseFame: Math.min(FAME_MAX, (p[pid].baseFame || 0) + pe.benefit.amount) } }));
                addLog("Effect", `${pe.artistName}: +${pe.benefit.amount} Fame`);
                showFloatingBonus(`+${pe.benefit.amount} 🔥`, "#f97316"); sfx.gainFame();
              } else if (pe.benefit.type === "ticket") {
                logTicketGain(pid, pe.benefit.amount, `${pe.artistName} effect`);
                setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + pe.benefit.amount } }));
                addLog("Effect", `${pe.artistName}: +${pe.benefit.amount} ticket sale${pe.benefit.amount === 1 ? "" : "s"}`);
                showFloatingBonus(`+${pe.benefit.amount} 🎟️`, "#fbbf24");
              }
              // Chain follow-up draws
              if (pe.benefit.thenDrawDeck) {
                // Blind draw N from deck immediately (no picker — deck draws are blind)
                const drawn = drawFromDeck(pe.benefit.thenDrawDeck);
                if (drawn.length > 0) {
                  setPlayerData(p => ({ ...p, [pid]: { ...p[pid], hand: [...(p[pid].hand || []), ...drawn] } }));
                  addLog("Effect", `${pe.artistName}: drew ${drawn.length} artist${drawn.length === 1 ? "" : "s"} from the deck`);
                  showFloatingBonus(`+${drawn.length} 🎴`, "#c4b5fd");
                }
                setPendingEffect(null); setPendingEffectPid(null);
                return;
              }
              if (pe.benefit.thenDrawPool) {
                // Set a follow-up pending effect: player picks N from the pool
                setPendingEffect({
                  type: "drawFromPool",
                  artistName: pe.artistName,
                  drawsRemaining: pe.benefit.thenDrawPool,
                });
                return;
              }
            }
            // No further follow-up — check for legacy followUp (Ms Banks chain-play)
            if (pe.followUp) {
              setPendingEffect(pe.followUp);
            } else {
              setPendingEffect(null); setPendingEffectPid(null);
            }
          };
          const advance = () => {
            if (remaining <= 1) {
              fireBenefitAndAdvance();
            } else {
              setPendingEffect({ ...pe, removalsRemaining: remaining - 1 });
            }
          };
          const targetLabel = filterType
            ? `${AMENITY_ICONS[filterType] || ""} ${AMENITY_LABELS[filterType] || filterType}`
            : "any amenity";
          return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 960, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ ...card, textAlign: "center", maxWidth: 640, width: "100%" }}>
              <h3 style={{ color: "#dc2626", marginBottom: 6 }}>💥 {pe.artistName}: Sacrifice {remaining > 1 ? `${remaining} ` : ""}{targetLabel}</h3>
              {benefitLabel && <p style={{ color: "#c4b5fd", fontSize: 12, marginBottom: 6 }}>Reward: <b>{benefitLabel}</b></p>}
              <p style={{ color: "#8b5cf6", fontSize: 11, marginBottom: 14 }}>Click an amenity to remove it, or Decline to skip the whole trade.</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 14 }}>
                {fields.map((f, fIdx) => {
                  const amTypes = ["campsite", "security", "catering", "portaloo"].filter(t => (f?.[t] || 0) > 0 && showType(t));
                  return <div key={fIdx} style={{ padding: 10, borderRadius: 8, background: "rgba(15,14,26,0.6)", border: "1px solid #2a2a4a" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#c4b5fd", marginBottom: 6 }}>Field {fIdx + 1}</div>
                    {amTypes.length === 0 && <div style={{ fontSize: 10, color: "#475569", fontStyle: "italic" }}>(no {filterType ? AMENITY_LABELS[filterType] : "amenities"})</div>}
                    {amTypes.map(t => <button key={t} onClick={() => {
                      setPlayerData(p => ({ ...p, [pid]: mutateAmenity(p[pid], fIdx, t, -1) }));
                      addLog("Effect", `${pe.artistName}: sacrificed 1 ${AMENITY_LABELS[t]} from Field ${fIdx + 1}`);
                      advance();
                    }} style={{ display: "block", width: "100%", padding: "6px 8px", marginBottom: 4, borderRadius: 6, border: "1px solid #dc2626", background: "rgba(220,38,38,0.15)", color: "#fca5a5", cursor: "pointer", fontSize: 11 }}>
                      {AMENITY_ICONS[t]} {AMENITY_LABELS[t]} × {f[t]}
                    </button>)}
                  </div>;
                })}
              </div>
              <button onClick={() => {
                addLog("Effect", `${pe.artistName}: declined the trade — no sacrifice, no bonus`);
                setPendingEffect(null); setPendingEffectPid(null);
              }} style={{ ...bs, fontSize: 12 }}>Decline (skip effect)</button>
            </div>
          </div>;
        }

        if (pe.type === "effectAborted") {
          // v177: acknowledgment modal for effects that couldn't fire (e.g. required
          // die not present in the shared pool). Shows a snapshot of the dice pool at
          // that moment so the player can see what was actually available.
          // v181: added a reroll button — clicking it rerolls the shared dice pool
          // (visible to all players from that point on) and re-checks whether the
          // effect can now fire. If yes, transitions to the picker modal. If no,
          // stays on this modal with the new snapshot. One reroll per effect firing.
          const snapshot = pe.diceSnapshot || [];
          const faceLabel = (face) => {
            if (face === "fame") return "🔥";
            if (face === "stage") return "🎪";
            return AMENITY_ICONS[face] || "?";
          };
          const canReroll = !pe.hasRerolled && pe.filterType;
          const handleReroll = () => {
            const fresh = rollDice();
            setDice(fresh);
            addLog("🎲 Reroll", `${pe.artistName}: rerolled the shared dice pool`);
            sfx.rollDice && sfx.rollDice();
            // Check if the new pool has a matching die
            const has = pe.filterType === "__anyAmenity__"
              ? fresh.some(d => d !== "fame" && d !== "stage")
              : fresh.some(d => d === pe.filterType);
            if (has) {
              // Transition to the picker modal — same benefit, but reroll is now used
              setPendingEffect({
                type: "removeDieFromPool",
                artistName: pe.artistName,
                filterType: pe.filterType,
                benefit: pe.benefit,
                hasRerolled: true,
              });
            } else {
              // Still no match. Update the snapshot; disable further rerolls.
              setPendingEffect({ ...pe, diceSnapshot: fresh, hasRerolled: true });
            }
          };
          return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 960, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ ...card, textAlign: "center", maxWidth: 500, width: "100%" }}>
              <h3 style={{ color: "#fbbf24", marginBottom: 8 }}>ℹ️ {pe.artistName}: effect could not fire</h3>
              <p style={{ color: "#c4b5fd", fontSize: 13, marginBottom: 12 }}>{pe.reason}</p>
              {snapshot.length > 0 && <>
                <p style={{ color: "#8b5cf6", fontSize: 11, marginBottom: 6 }}>The shared dice pool{pe.hasRerolled ? " (after reroll)" : ""}:</p>
                <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", marginBottom: 14 }}>
                  {snapshot.map((face, di) => <div key={di} style={{
                    padding: "8px 10px", borderRadius: 6, background: "rgba(15,14,26,0.6)",
                    border: "1px solid #2a2a4a", fontSize: 20,
                  }}>{faceLabel(face)}</div>)}
                </div>
              </>}
              {snapshot.length === 0 && pe.diceSnapshot !== undefined && <p style={{ color: "#475569", fontSize: 11, fontStyle: "italic", marginBottom: 14 }}>(the pool was empty)</p>}
              <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                {canReroll && <button onClick={handleReroll} style={{ ...bp, fontSize: 12, background: "linear-gradient(135deg, #f97316, #ea580c)" }}>🎲 Reroll shared dice</button>}
                <button onClick={() => { setPendingEffect(null); setPendingEffectPid(null); }} style={{ ...bs, fontSize: 12 }}>OK</button>
              </div>
              {pe.hasRerolled && <p style={{ color: "#64748b", fontSize: 10, marginTop: 8, fontStyle: "italic" }}>Reroll already used for this effect.</p>}
            </div>
          </div>;
        }

        if (pe.type === "drawFromPool") {
          // v177: pool-only picker (used by Missy Elliott's "draw 1 from the pool"
          // follow-up). Similar to drawFromPoolOrDeck but without the deck option.
          // v186: tempt/agent-protected artists are excluded from the choices.
          const remaining = pe.drawsRemaining || 1;
          const protectedNames = getAgentProtectedNames();
          const pool = (artistPool || []).filter(a => !protectedNames.has(a.name));
          if (pool.length === 0) {
            // Nothing to pick — auto-clear so we don't stall
            setTimeout(() => { setPendingEffect(null); setPendingEffectPid(null); }, 0);
            return null;
          }
          return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 960, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ ...card, textAlign: "center", maxWidth: 720, width: "100%", maxHeight: "88vh", overflowY: "auto" }}>
              <h3 style={{ color: "#c4b5fd", marginBottom: 8 }}>🎴 {pe.artistName}: Pick {remaining} from the pool</h3>
              <p style={{ color: "#8b5cf6", fontSize: 12, marginBottom: 12 }}>Click an artist to add them to your hand.{protectedNames.size > 0 ? " Tempted artists are hidden." : ""}</p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 8 }}>
                {pool.map((a, i) => (
                  <div key={i} onClick={() => {
                    // v186: find by name in the FULL pool (since our display is filtered)
                    setArtistPool(prev => { const idx = prev.findIndex(x => x.name === a.name); if (idx < 0) return prev; const np = [...prev]; np.splice(idx, 1); return np; });
                    setPlayerData(p => ({ ...p, [pid]: { ...p[pid], hand: [...(p[pid].hand || []), a] } }));
                    addLog("Effect", `${pe.artistName}: picked ${a.name} from the pool`);
                    setLastActionFor(pid, `pulled ${a.name} from the pool (${pe.artistName} effect)`);
                    if (remaining > 1) setPendingEffect({ ...pe, drawsRemaining: remaining - 1 });
                    else { setPendingEffect(null); setPendingEffectPid(null); }
                  }} style={{ cursor: "pointer" }}>
                    <ArtistCard artist={a} showCost small />
                  </div>
                ))}
              </div>
              <button onClick={() => { setPendingEffect(null); setPendingEffectPid(null); }} style={{ ...bs, fontSize: 11, marginTop: 8 }}>Skip remaining draws</button>
            </div>
          </div>;
        }

        if (pe.type === "playFromHand") {
          // v172: two-step picker. First step: pick artist from hand. Second step:
          // pick which stage to book on. If pe.chosenArtistIdx is set, we're on step 2.
          const hand = pd.hand || [];
          const stages = pd.stages || [];
          const openStages = stages.map((_, i) => i).filter(si => (pd.stageArtists?.[si] || []).length < 3);
          const isFree = !!pe.free;
          const stageForArtist = (a, si) => isFree || canBookArtistOnStage(a, pd, si);

          // Step 2: artist already chosen, now pick a stage
          if (pe.chosenArtistIdx != null && hand[pe.chosenArtistIdx]) {
            const a = hand[pe.chosenArtistIdx];
            const legalStages = openStages.filter(si => stageForArtist(a, si));
            return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 960, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
              <div style={{ ...card, textAlign: "center", maxWidth: 600, width: "100%" }}>
                <h3 style={{ color: "#a855f7", marginBottom: 8 }}>🎤 Book {a.name}</h3>
                <p style={{ color: "#c4b5fd", fontSize: 12, marginBottom: 14 }}>Which stage?</p>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 14 }}>
                  {legalStages.map(si => {
                    const stageName = (pd.stageNames || [])[si] || `Stage ${si + 1}`;
                    const occupancy = (pd.stageArtists?.[si] || []).length;
                    return <button key={si} onClick={() => {
                      setPlayerData(p => ({ ...p, [pid]: { ...p[pid], hand: p[pid].hand.filter((_, i) => i !== pe.chosenArtistIdx) } }));
                      const toPlay = pe.suppressEffect ? { ...a, effect: "" } : a;
                      setTimeout(() => bookArtistToStage(toPlay, si, pid, false, false), 200);
                      setPendingEffect(null); setPendingEffectPid(null);
                    }} style={{ ...bp, padding: "10px 16px", fontSize: 13, minWidth: 140 }}>
                      🎪 {stageName}<br/>
                      <span style={{ fontSize: 10, opacity: 0.7 }}>{occupancy}/3 booked</span>
                    </button>;
                  })}
                </div>
                <button onClick={() => setPendingEffect({ ...pe, chosenArtistIdx: null })} style={{ ...bs, fontSize: 11 }}>← Back</button>
                <button onClick={() => { setPendingEffect(null); setPendingEffectPid(null); }} style={{ ...bs, fontSize: 11, marginLeft: 8 }}>Skip chain-play</button>
              </div>
            </div>;
          }

          // Step 1: pick artist from hand
          const playable = hand
            .map((a, i) => ({ a, i }))
            .filter(({ a }) => {
              if (isFree) return true;
              if ((a.fame || 0) > (pd.fame || 0)) return false;
              return openStages.some(si => canBookArtistOnStage(a, pd, si));
            });
          return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 960, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ ...card, textAlign: "center", maxWidth: 700, width: "100%" }}>
              <h3 style={{ color: "#a855f7", marginBottom: 8 }}>🎤 {pe.artistName}: Chain-Play!</h3>
              <p style={{ color: "#c4b5fd", fontSize: 12, marginBottom: 14 }}>Pick another artist from your hand{isFree ? " to play for FREE (their effect will not fire)" : ""}:</p>
              {playable.length === 0 && <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 12 }}>No eligible artist in hand.</p>}
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 14 }}>
                {playable.map(({ a, i }) => (
                  <div key={i} onClick={() => setPendingEffect({ ...pe, chosenArtistIdx: i })} style={{ cursor: "pointer" }}>
                    <ArtistCard artist={a} showCost small />
                  </div>
                ))}
              </div>
              <button onClick={() => { setPendingEffect(null); setPendingEffectPid(null); }} style={{ ...bs, fontSize: 11 }}>Skip chain-play</button>
            </div>
          </div>;
        }

        if (pe.type === "selectHeadliner") {
          // v197.3: Eminem's headliner-copy picker. Shows all candidate headliners across
          // every stage (own other stages + all opponents' stages). Player clicks one to
          // copy its base ticket value.
          const cands = pe.candidates || [];
          return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 960, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ ...card, textAlign: "center", maxWidth: 700, width: "100%" }}>
              <h3 style={{ color: "#a855f7", marginBottom: 8 }}>🎤 {pe.artistName}: Copy a Headliner</h3>
              <p style={{ color: "#c4b5fd", fontSize: 12, marginBottom: 14 }}>Pick a headliner on any other stage (yours or an opponent's) to copy their base ticket value.</p>
              {cands.length === 0 && <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 12 }}>No eligible headliners — effect fizzles.</p>}
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 14 }}>
                {cands.map((c, i) => {
                  const isOwn = c.playerId === pid;
                  return <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ fontSize: 10, color: isOwn ? "#4ade80" : "#f87171", fontWeight: 700, textTransform: "uppercase", letterSpacing: 1 }}>
                      {isOwn ? "Your stage" : c.playerName}
                    </div>
                    <ArtistCard artist={c.artist} showCost small onClick={() => {
                      const X = c.artist.tickets || 0;
                      if (X > 0) {
                        logTicketGain(pid, X, `${pe.artistName} copied ${c.artist.name} (+${X} from ${c.playerName})`);
                        setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + X } }));
                        addLog("Effect", `${pe.artistName} copied ${c.artist.name}'s ${X} tickets from ${c.playerName}: +${X} 🎟️`);
                        showFloatingBonus(`+${X} 🎟️ copy!`, "#fbbf24"); sfx.gainTickets();
                      } else {
                        addLog("Effect", `${pe.artistName}: ${c.artist.name} had 0 tickets — nothing to copy`);
                      }
                      setPendingEffect(null); setPendingEffectPid(null);
                    }} />
                    <div style={{ fontSize: 10, color: "#fbbf24", fontWeight: 700 }}>+{c.artist.tickets || 0} 🎟️</div>
                  </div>;
                })}
              </div>
              <button onClick={() => { setPendingEffect(null); setPendingEffectPid(null); }} style={{ ...bs, fontSize: 11 }}>Skip</button>
            </div>
          </div>;
        }

        if (pe.type === "signArtist") {
          const remaining = pe.signCount || 1;
          return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 960, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ ...card, textAlign: "center", maxWidth: 600, width: "100%" }}>
              <h3 style={{ color: "#4ade80", marginBottom: 12 }}>✨ {pe.artistName}: Sign {remaining} artist{remaining > 1 ? "s" : ""}!</h3>
              <p style={{ color: "#8b5cf6", fontSize: 12, marginBottom: 12 }}>Pick an artist from the pool to add to your hand{remaining > 1 ? ` (${remaining} remaining)` : ""}:</p>
              {pe.canRefresh && !poolRefreshedByEffect && <button onClick={() => {
                refreshPool(); setPoolRefreshedByEffect(true);
                addLog("Effect", "Refreshed artist pool");
              }} style={{ ...bs, fontSize: 11, marginBottom: 10 }}>🔄 Refresh Pool First</button>}
              {poolRefreshedByEffect && <p style={{ color: "#4ade80", fontSize: 10, marginBottom: 8 }}>✓ Pool refreshed</p>}
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                {artistPool.map((a, i) => {
                  const claimedByOther = isAgentClaimedByOther(a.name, pid);
                  return <div key={i} style={{ position: "relative", opacity: claimedByOther ? 0.4 : 1, cursor: claimedByOther ? "not-allowed" : "pointer" }} title={claimedByOther ? "Claimed by another agent" : ""}>
                    <ArtistCard artist={a} showCost small onClick={() => {
                      if (claimedByOther) return;
                      const newPool = [...artistPool]; newPool.splice(i, 1);
                      setPlayerData(p => ({ ...p, [pid]: { ...p[pid], hand: [...p[pid].hand, a] } }));
                      addLog("Effect", `Signed ${a.name} from pool`);
                      refillPool(newPool);
                      if (remaining > 1) {
                        setPendingEffect({ ...pe, signCount: remaining - 1 });
                      } else {
                        setPendingEffect(null); setPendingEffectPid(null);
                        setDeferPoolRefresh(false);
                      }
                    }} />
                    {claimedByOther && <div style={{ position: "absolute", top: -4, right: -4, background: "#1d4ed8", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, border: "2px solid #60a5fa" }}>🕵️</div>}
                  </div>;
                })}
              </div>
              <button onClick={() => {
                const drawn = drawFromDeck(1);
                if (drawn.length > 0) { setPlayerData(p => ({ ...p, [pid]: { ...p[pid], hand: [...p[pid].hand, drawn[0]] } })); addLog("Effect", `Signed ${drawn[0].name} from deck`); }
                if (remaining > 1) {
                  setPendingEffect({ ...pe, signCount: remaining - 1 });
                } else {
                  setPendingEffect(null); setPendingEffectPid(null);
                  if (deferPoolRefresh) { refillPool(); setDeferPoolRefresh(false); }
                }
              }} style={{ ...bs, marginTop: 12, fontSize: 12 }}>📦 Draw from Deck instead</button>
            </div>
          </div>;
        }

        if (pe.type === "bonusBookGenre") {
          // Bonus booking from The Cure-style effects. Two phases:
          //  1) pick an eligible artist (matching genre + affordable) from hand or pool
          //  2) pick an open stage to book it onto
          // Booking is free (no turn cost) and goes through bookArtistToStage.
          const pd = playerData[pid] || {};
          const genreOk = (a) => pe.genres.length === 0 || getGenres(a.genre).some(g => pe.genres.includes(g));
          const bookedNames = new Set((pd.stageArtists || []).flat().map(a => a.name));
          // Phase 2: stage selection (an artist has been chosen)
          if (pe.selectedBonus) {
            const a = pe.selectedBonus.artist;
            const openStages = (pd.stageArtists || []).map((sa, i) => sa.length < 3 ? i : -1).filter(i => i >= 0);
            return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 960, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
              <div style={{ ...card, textAlign: "center", maxWidth: 460 }}>
                <h3 style={{ color: "#4ade80", marginBottom: 8 }}>🎤 Book {a.name} — pick a stage</h3>
                <ArtistCard artist={a} showCost />
                <p style={{ color: "#94a3b8", fontSize: 12, margin: "10px 0" }}>Choose an open stage:</p>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                  {openStages.map(si => <button key={si} onClick={() => {
                    // Remove from its source, then book.
                    if (pe.selectedBonus.source === "hand") {
                      setPlayerData(p => { const nh = [...(p[pid].hand || [])]; const hi = nh.findIndex(x => x.name === a.name); if (hi >= 0) nh.splice(hi, 1); return { ...p, [pid]: { ...p[pid], hand: nh } }; });
                    } else if (pe.selectedBonus.source === "pool") {
                      const newPool = [...artistPool]; const pi = newPool.findIndex(x => x.name === a.name); if (pi >= 0) newPool.splice(pi, 1); setArtistPool(newPool);
                    }
                    bookArtistToStage(a, si, pid);
                    const remaining = (pe.bookCount || 1) - 1;
                    if (remaining > 0) {
                      setPendingEffect({ ...pe, selectedBonus: null, bookCount: remaining });
                    } else {
                      setPendingEffect(null); setPendingEffectPid(null);
                    }
                    setTimeout(() => recalcTickets(), 50);
                  }} style={bp}>{(pd.stageNames || [])[si] || `Stage ${si + 1}`}</button>)}
                </div>
                {openStages.length === 0 && <p style={{ color: "#f87171", fontSize: 12, marginTop: 10 }}>No open stages available!</p>}
                <div><button onClick={() => setPendingEffect({ ...pe, selectedBonus: null })} style={{ ...bs, marginTop: 12, fontSize: 12 }}>← Back to artists</button></div>
                <div><button onClick={() => { setPendingEffect(null); setPendingEffectPid(null); }} style={{ ...bs, marginTop: 8, fontSize: 11, opacity: 0.7 }}>Skip bonus booking</button></div>
              </div>
            </div>;
          }
          // Phase 1: artist selection. Eligible = genre match + affordable + not already booked.
          const handEligible = (pd.hand || []).map((a, i) => ({ a, i })).filter(({ a }) => genreOk(a) && canAffordArtist(a, pd, sec3Reduction(pid)) && !bookedNames.has(a.name));
          const poolEligible = artistPool.map((a, i) => ({ a, i })).filter(({ a }) => genreOk(a) && canAffordArtist(a, pd, sec3Reduction(pid)) && !bookedNames.has(a.name) && !isAgentClaimedByOther(a.name, pid));
          const noneEligible = handEligible.length === 0 && poolEligible.length === 0;
          return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 960, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ ...card, textAlign: "center", maxWidth: 640, width: "100%" }}>
              <h3 style={{ color: "#4ade80", marginBottom: 6 }}>🎤 {pe.artistName}: Book a bonus {pe.genres.join(" or ")} artist!</h3>
              <p style={{ color: "#8b5cf6", fontSize: 12, marginBottom: 12 }}>Pick an eligible artist you can afford — you'll choose a stage next. Free booking, no turn cost.</p>
              {noneEligible
                ? <p style={{ color: "#f87171", fontSize: 13, margin: "16px 0" }}>No eligible {pe.genres.join(" or ")} artist you can afford right now (checks Fame + amenities).</p>
                : <>
                  {handEligible.length > 0 && <><p style={{ color: "#94a3b8", fontSize: 11, margin: "8px 0 4px" }}>From your hand:</p>
                    <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                      {handEligible.map(({ a, i }) => <ArtistCard key={`h${i}`} artist={a} showCost small onClick={() => setPendingEffect({ ...pe, selectedBonus: { artist: a, source: "hand" } })} />)}
                    </div></>}
                  {poolEligible.length > 0 && <><p style={{ color: "#94a3b8", fontSize: 11, margin: "12px 0 4px" }}>From the pool:</p>
                    <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                      {poolEligible.map(({ a, i }) => <ArtistCard key={`p${i}`} artist={a} showCost small onClick={() => setPendingEffect({ ...pe, selectedBonus: { artist: a, source: "pool" } })} />)}
                    </div></>}
                </>}
              <div><button onClick={() => { setPendingEffect(null); setPendingEffectPid(null); }} style={{ ...bs, marginTop: 14, fontSize: 12 }}>{noneEligible ? "Continue" : "Skip bonus booking"}</button></div>
            </div>
          </div>;
        }

        if (pe.type === "pickFromDrawn") {
          const keepCount = pe.keepCount || 1;
          const selected = pe.selected || [];
          return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 960, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
            <div style={{ ...card, textAlign: "center", maxWidth: 600 }}>
              <h3 style={{ color: "#4ade80", marginBottom: 12 }}>✨ {pe.artistName}: Pick {keepCount} to keep!</h3>
              <p style={{ color: "#94a3b8", fontSize: 11, marginBottom: 10 }}>{selected.length}/{keepCount} selected</p>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                {pe.drawn.map((a, i) => <ArtistCard key={i} artist={a} showCost
                  selected={selected.includes(i)}
                  onClick={() => {
                    if (keepCount === 1) {
                      // Single pick — instant
                      setPlayerData(p => ({ ...p, [pid]: { ...p[pid], hand: [...p[pid].hand, a] } }));
                      const other = pe.drawn.filter((_, j) => j !== i);
                      setDiscardPile(prev => [...prev, ...other]);
                      addLog("Effect", `Kept ${a.name}, discarded ${other.map(o => o.name).join(", ")}`);
                      setPendingEffect(null); setPendingEffectPid(null);
                    } else {
                      // Multi pick — toggle selection
                      const newSel = selected.includes(i) ? selected.filter(s => s !== i) : [...selected, i];
                      if (newSel.length <= keepCount) setPendingEffect({ ...pe, selected: newSel });
                    }
                  }} />)}
              </div>
              {keepCount > 1 && selected.length === keepCount && <button onClick={() => {
                const kept = selected.map(i => pe.drawn[i]);
                const other = pe.drawn.filter((_, i) => !selected.includes(i));
                setPlayerData(p => ({ ...p, [pid]: { ...p[pid], hand: [...p[pid].hand, ...kept] } }));
                setDiscardPile(prev => [...prev, ...other]);
                addLog("Effect", `Kept ${kept.map(a => a.name).join(", ")}`);
                setPendingEffect(null); setPendingEffectPid(null);
              }} style={{ ...bp, marginTop: 12 }}>Confirm Selection ✓</button>}
            </div>
          </div>;
        }

        // Funk: Discard hand artists for tickets (Teena Marie)
        if (pe.type === "discardHandForTickets") {
          const handCards = pd.hand || [];
          return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 950, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ ...card, textAlign: "center", maxWidth: 500 }}>
              <h3 style={{ color: "#a855f7", marginBottom: 8 }}>🎵 {pe.artistName}: Discard {pe.discardCount} artist for +{pe.ticketReward} tickets</h3>
              <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 12 }}>Click an artist from your hand to discard:</p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                {handCards.map((a, i) => <ArtistCard key={i} artist={a} small onClick={() => {
                  logTicketGain(pid, pe.ticketReward, `${pe.artistName} effect (discard for tickets)`);
                  setPlayerData(p => { const nh = [...p[pid].hand]; nh.splice(i, 1); return { ...p, [pid]: { ...p[pid], hand: nh, bonusTickets: (p[pid].bonusTickets || 0) + pe.ticketReward } }; });
                  setDiscardPile(prev => [...prev, a]);
                  addLog("Effect", `Discarded ${a.name} → +${pe.ticketReward} tickets`);
                  showFloatingBonus(`+${pe.ticketReward} 🎟️`, "#fbbf24");
                  setPendingEffect(null); setPendingEffectPid(null); setTimeout(() => recalcTickets(), 50);
                }} />)}
              </div>
              {handCards.length === 0 && <><p style={{ color: "#f87171", fontSize: 12 }}>No cards in hand to discard.</p><button onClick={() => { setPendingEffect(null); setPendingEffectPid(null); }} style={{ ...bs, marginTop: 8 }}>Skip</button></>}
            </div>
          </div>;
        }

        // Funk: Discard 2 hand artists, gain ticket value of one (Rick James)
        if (pe.type === "discardHandForTicketValue") {
          const handCards = pd.hand || [];
          const selected = pe.selected || [];
          return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 950, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ ...card, textAlign: "center", maxWidth: 500 }}>
              <h3 style={{ color: "#a855f7", marginBottom: 8 }}>🎵 {pe.artistName}: Discard 2 artists, gain tickets of one</h3>
              <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 12 }}>Select 2 artists to discard ({selected.length}/2). You'll gain the ticket value of one.</p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                {handCards.map((a, i) => <div key={i} style={{ border: selected.includes(i) ? "2px solid #fbbf24" : "2px solid transparent", borderRadius: 10 }}>
                  <ArtistCard artist={a} small onClick={() => {
                    const ns = selected.includes(i) ? selected.filter(x => x !== i) : [...selected, i];
                    if (ns.length <= 2) setPendingEffect({ ...pe, selected: ns });
                  }} />
                </div>)}
              </div>
              {selected.length === 2 && <div style={{ marginTop: 12 }}>
                <p style={{ color: "#fbbf24", fontSize: 12, marginBottom: 8 }}>Which artist's tickets do you want to gain?</p>
                {selected.map(si => <button key={si} onClick={() => {
                  const ticketGain = handCards[si].tickets || 0;
                  const toDiscard = selected.map(x => handCards[x]);
                  setPlayerData(p => {
                    const nh = [...p[pid].hand];
                    // Remove from end first to avoid index shift
                    selected.sort((a, b) => b - a).forEach(x => nh.splice(x, 1));
                    logTicketGain(pid, ticketGain, `${pe.artistName} effect (discard)`);
                    return { ...p, [pid]: { ...p[pid], hand: nh, bonusTickets: (p[pid].bonusTickets || 0) + ticketGain } };
                  });
                  setDiscardPile(prev => [...prev, ...toDiscard]);
                  addLog("Effect", `Discarded ${toDiscard.map(a=>a.name).join(", ")} → +${ticketGain} tickets (${handCards[si].name})`);
                  showFloatingBonus(`+${ticketGain} 🎟️`, "#fbbf24");
                  setPendingEffect(null); setPendingEffectPid(null); setTimeout(() => recalcTickets(), 50);
                }} style={{ ...bs, margin: 4 }}>{handCards[si].name} ({handCards[si].tickets} 🎟️)</button>)}
              </div>}
              {handCards.length < 2 && <><p style={{ color: "#f87171", fontSize: 12 }}>Need 2 cards in hand.</p><button onClick={() => { setPendingEffect(null); setPendingEffectPid(null); }} style={{ ...bs, marginTop: 8 }}>Skip</button></>}
            </div>
          </div>;
        }

        // Funk: Discard one amenity for tickets (Betty Davis)
        if (pe.type === "discardAmenityForTickets") {
          const am = pd.amenities || {};
          const owned = AMENITY_TYPES.filter(t => (am[t] || 0) > 0);
          return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 950, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ ...card, textAlign: "center", maxWidth: 400 }}>
              <h3 style={{ color: "#a855f7", marginBottom: 8 }}>🎵 {pe.artistName}: Discard 1 amenity for +{pe.ticketReward} tickets</h3>
              <p style={{ color: "#94a3b8", fontSize: 11, marginBottom: 12 }}>Pick which amenity to remove:</p>
              {owned.length === 0 ? <p style={{ color: "#f87171", fontSize: 12 }}>You have no amenities to discard.</p> :
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  {owned.map(t => <button key={t} onClick={() => {
                    setPlayerData(p => {
                      const cur = p[pid];
                      const fields = cur.fields || emptyFields();
                      let bestIdx = 0, bestCount = fields[0]?.[t] || 0;
                      for (let f = 1; f < fields.length; f++) {
                        const c = fields[f]?.[t] || 0;
                        if (c > bestCount) { bestCount = c; bestIdx = f; }
                      }
                      const updated = bestCount > 0 ? mutateAmenity(cur, bestIdx, t, -1) : cur;
                      logTicketGain(pid, pe.ticketReward, `${pe.artistName} effect (discard for tickets)`);
                      return { ...p, [pid]: { ...updated, bonusTickets: (cur.bonusTickets || 0) + pe.ticketReward } };
                    });
                    addLog("Effect", `Discarded ${AMENITY_LABELS[t]} → +${pe.ticketReward} tickets`);
                    showFloatingBonus(`+${pe.ticketReward} 🎟️`, "#fbbf24");
                    setPendingEffect(null); setPendingEffectPid(null); setTimeout(() => recalcTickets(), 50);
                  }} style={{ padding: 12, borderRadius: 10, border: `2px solid ${AMENITY_COLORS[t]}`, background: "#1a1a2e", color: "#e2e8f0", cursor: "pointer" }}>
                    <div style={{ fontSize: 22 }}>{AMENITY_ICONS[t]}</div>
                    <div style={{ fontSize: 11, fontWeight: 600 }}>{AMENITY_LABELS[t]} ({am[t]})</div>
                  </button>)}
                </div>}
              <button onClick={() => { setPendingEffect(null); setPendingEffectPid(null); }} style={{ ...bs, marginTop: 12 }}>Skip</button>
            </div>
          </div>;
        }

        // Funk: Discard 2 artists, draw and play 1 for free (Silk Sonic)
        if (pe.type === "discardHandDrawFree") {
          const handCards = pd.hand || [];
          const selected = pe.selected || [];
          if (!pe.drawnFree) {
            return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 950, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ ...card, textAlign: "center", maxWidth: 500 }}>
                <h3 style={{ color: "#fbbf24", marginBottom: 8 }}>🌟 {pe.artistName}: Discard 2 artists, play 1 free!</h3>
                <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 12 }}>Select 2 artists to discard ({selected.length}/2):</p>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                  {handCards.map((a, i) => <div key={i} style={{ border: selected.includes(i) ? "2px solid #fbbf24" : "2px solid transparent", borderRadius: 10 }}>
                    <ArtistCard artist={a} small onClick={() => {
                      const ns = selected.includes(i) ? selected.filter(x => x !== i) : [...selected, i];
                      if (ns.length <= 2) setPendingEffect({ ...pe, selected: ns });
                    }} />
                  </div>)}
                </div>
                {selected.length === 2 && <button onClick={() => {
                  const toDiscard = selected.map(x => handCards[x]);
                  setPlayerData(p => {
                    const nh = [...p[pid].hand];
                    selected.sort((a, b) => b - a).forEach(x => nh.splice(x, 1));
                    return { ...p, [pid]: { ...p[pid], hand: nh } };
                  });
                  setDiscardPile(prev => [...prev, ...toDiscard]);
                  const drawn = drawFromDeck(1);
                  if (drawn.length > 0) {
                    addLog("Effect", `Discarded ${toDiscard.map(a=>a.name).join(", ")} → drew ${drawn[0].name} (plays free!)`);
                    setPendingEffect({ ...pe, drawnFree: { ...drawn[0], freePlay: true } });
                  } else {
                    addLog("Effect", `No artists left in deck`);
                    setPendingEffect(null); setPendingEffectPid(null);
                  }
                }} style={{ ...bp, marginTop: 12 }}>Confirm Discard → Draw Free Artist</button>}
                {handCards.length < 2 && <><p style={{ color: "#f87171", fontSize: 12 }}>Need 2 cards in hand.</p><button onClick={() => { setPendingEffect(null); setPendingEffectPid(null); }} style={{ ...bs, marginTop: 8 }}>Skip</button></>}
              </div>
            </div>;
          } else {
            // Show drawn artist, player picks a stage
            const freeArtist = pe.drawnFree;
            const openStages = (pd.stageArtists || []).map((sa, i) => sa.length < 3 ? i : -1).filter(i => i >= 0);
            return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 950, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ ...card, textAlign: "center", maxWidth: 400 }}>
                <h3 style={{ color: "#fbbf24", marginBottom: 12 }}>🌟 Play for FREE!</h3>
                <ArtistCard artist={freeArtist} showCost />
                <p style={{ color: "#94a3b8", fontSize: 12, marginTop: 8, marginBottom: 12 }}>Select a stage:</p>
                <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                  {openStages.map(si => <button key={si} onClick={() => {
                    bookArtistToStage(freeArtist, si, pid);
                    addLog("Effect", `Played ${freeArtist.name} for FREE on stage ${si + 1}!`);
                    showFloatingBonus(`🌟 FREE!`, "#fbbf24");
                    setPendingEffect(null); setPendingEffectPid(null); setTimeout(() => recalcTickets(), 50);
                  }} style={bp}>{(pd.stageNames || [])[si] || `Stage ${si + 1}`}</button>)}
                </div>
                {openStages.length === 0 && <><p style={{ color: "#f87171", fontSize: 12 }}>No open stages! Artist goes to hand.</p><button onClick={() => {
                  setPlayerData(p => ({ ...p, [pid]: { ...p[pid], hand: [...p[pid].hand, freeArtist] } }));
                  setPendingEffect(null); setPendingEffectPid(null);
                }} style={{ ...bs, marginTop: 8 }}>Add to Hand</button></>}
              </div>
            </div>;
          }
        }

        return null;
      })()}
      {/* Year Announcement popup */}
      {showYearAnnouncement && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.9)", zIndex: 920, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div onClick={e => e.stopPropagation()} style={{ ...card, textAlign: "center", maxWidth: 500, width: "100%", animation: "fadeSlideIn 0.4s" }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🎪📢</div>
          <h2 style={{ color: "#fbbf24", fontSize: 26, margin: "0 0 4px" }}>Year {year} — What's Trending</h2>
          <p style={{ color: "#8b5cf6", fontSize: 12, marginBottom: 16 }}>Here's what the industry is buzzing about this year</p>
          {microtrends.length > 0 && <div style={{ padding: 12, borderRadius: 10, background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.2)", marginBottom: 10 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#e9d5ff", textTransform: "uppercase", letterSpacing: 1, marginBottom: 6 }}>🎵 Microtrends — First to Match → +1 Fame</div>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              {microtrends.map((mt, i) => mt.kind === "amenity"
                ? <span key={i} style={{ padding: "5px 14px", borderRadius: 20, background: "#1e293b", border: "1px solid #fbbf24", color: "#fbbf24", fontSize: 13, fontWeight: 700 }}>{AMENITY_ICONS[mt.amenity]} {AMENITY_LABELS[mt.amenity]}</span>
                : <span key={i} style={{ padding: "5px 14px", borderRadius: 20, background: GENRE_COLORS[mt.genre], color: "#fff", fontSize: 13, fontWeight: 700 }}>{mt.genre}</span>
              )}
            </div>
          </div>}
          <button onClick={() => { setShowYearAnnouncement(false); setShowTurnStart(true); }} style={{ ...bp, marginTop: 16 }}>Let's Go! 🎶</button>
        </div>
      </div>}
      {/* Turn start popup */}
      {showTurnStart && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ ...card, textAlign: "center", maxWidth: 440, animation: "fadeSlideIn 0.3s" }}>
          <h2 style={{ color: "#fbbf24", fontSize: 28, margin: "0 0 8px" }}>🎪 {currentPlayer?.festivalName}</h2>
          <p style={{ color: "#c4b5fd", fontSize: 16 }}>Year {year} — <strong style={{ color: "#fbbf24" }}>{turnsLeft[currentPlayerId]}</strong> turns left</p>
          {(playerObjectives[currentPlayerId] || []).length > 0 && (() => {
            const objs = playerObjectives[currentPlayerId] || [];
            return <div style={{ marginTop: 8, padding: 10, borderRadius: 10, background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.25)" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#c4b5fd", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>🎯 Your Objectives</div>
              {objs.map((entry, oi) => <div key={oi} style={{ marginBottom: 4 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: entry.completed ? "#4ade80" : "#e9d5ff" }}>{entry.completed ? "✅ " : ""}{entry.obj.name}</div>
                <div style={{ fontSize: 10, color: "#94a3b8" }}>{entry.obj.req}</div>
                <div style={{ fontSize: 10, color: "#4ade80" }}>{entry.obj.reward}</div>
              </div>)}
            </div>;
          })()}
          {microtrends.some(mt => mt.claimedBy === null) && <div style={{ marginTop: 8, padding: 10, borderRadius: 10, background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.15)" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#e9d5ff", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>🎵 Microtrends (first to match → +1 Fame)</div>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
              {microtrends.filter(mt => mt.claimedBy === null).map((mt, i) => mt.kind === "amenity"
                ? <span key={i} style={{ padding: "3px 10px", borderRadius: 20, background: "#1e293b", border: "1px solid #fbbf24", color: "#fbbf24", fontSize: 11, fontWeight: 700 }}>{AMENITY_ICONS[mt.amenity]} {AMENITY_LABELS[mt.amenity]}</span>
                : <span key={i} style={{ padding: "3px 10px", borderRadius: 20, background: GENRE_COLORS[mt.genre], color: "#fff", fontSize: 11, fontWeight: 700 }}>{mt.genre}</span>
              )}
            </div>
          </div>}
          <button onClick={() => {
            setShowTurnStart(false);
            setTurnNumber(prev => prev + 1);
            // v197.13: Scouted Talent (sec_2) — draw 3 artists at turn start, keep 1.
            // Fires once per turn per player. Modal for humans; AI auto-picks in aiStep.
            if (hasInfraReward(currentPlayerId, "sec_2")) {
              const usageKey = `sec_2:${currentPlayerId}:${turnNumber + 1}`;
              if (!infraRewardUsageRef.current[usageKey]) {
                infraRewardUsageRef.current[usageKey] = true;
                const drawn = drawFromDeck(3);
                if (drawn.length > 0) {
                  setSec2Draw({ pid: currentPlayerId, cards: drawn });
                  addLog("🏗️ Reward", `${currentPlayer.festivalName}: Scouted Talent — drew ${drawn.length} artists, keep 1`);
                }
              }
            }
            // v185: if a queued contest placement from an earlier turn already opened
            // a pendingAgentArtist for this player, DO NOT call resolvePoolAgents here.
            if (pendingAgentArtist) return;
            const resolution = resolvePoolAgents(currentPlayerId);
            if (resolution && resolution.type === "uncontested") {
              grantUncontestedTemptBonus(resolution.pid);
              setPendingAgentArtist({ pid: resolution.pid, artist: resolution.artist });
            } else if (resolution && resolution.type === "contested") {
              const contest = resolveAgentContestRoll(resolution.contestants, resolution.artist, resolution.poolIdx);
              const humanInvolved = contest.contestantData.some(c => !players.find(p => p.id === c.pid)?.isAI);
              setAgentContest({ ...contest, isAuto: !humanInvolved });
            }
          }} style={{ ...bp, marginTop: 16 }}>Let's Go! 🎶</button>
        </div>
      </div>}
      
      {/* Mid-game objective choice popup — v163: hard-gated off. The old (pre-v135)
          objective system is retired; this modal is preserved as dead code but cannot
          fire under any current toggle configuration. */}
      {false && pendingObjectiveChoice && pendingObjectiveChoice.options.length >= 2 && pendingObjectiveChoice.playerId === currentPlayerId && !showTurnStart && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 910, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
        <div style={{ ...card, textAlign: "center", maxWidth: 550, width: "100%", animation: "fadeSlideIn 0.3s" }}>
          <h2 style={{ color: "#fbbf24", fontSize: 22, marginBottom: 4 }}>🎯 New Objective!</h2>
          <p style={{ color: "#c4b5fd", fontSize: 13, marginBottom: 12 }}>You completed an objective! Choose your next one:</p>
          
          {/* Show hand */}
          <div style={{ marginBottom: 14, padding: 8, borderRadius: 10, background: "rgba(124,58,237,0.08)", border: "1px solid #7c3aed30" }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: "#8b5cf6", textTransform: "uppercase", marginBottom: 6 }}>Your Hand</div>
            <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap" }}>
              {(currentPD.hand || []).map((a, i) => <ArtistCard key={i} artist={a} small showCost />)}
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            {pendingObjectiveChoice.options.map((obj, i) => (
              <div key={i} onClick={() => {
                chooseObjective(obj);
                setPendingObjectiveChoice(null);
              }} style={{ flex: "1 1 200px", maxWidth: 250, padding: 16, borderRadius: 12, background: "rgba(124,58,237,0.1)", border: "2px solid #7c3aed", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#e9d5ff", marginBottom: 6 }}>{obj.name}</div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 8 }}>{obj.req}</div>
                <div style={{ fontSize: 12, color: "#4ade80", fontWeight: 600 }}>{obj.reward}</div>
              </div>
            ))}
          </div>
        </div>
      </div>}
      
      {/* Choice popup for OR dice */}
      {/* v166: compound-face choice modal removed — die faces are single-purpose now. */}

      {/* Viewing another player's board */}
      {viewingPlayerId !== null && viewingPlayerId !== currentPlayerId && (() => {
        const vp = players.find(p => p.id === viewingPlayerId);
        const vpd = playerData[viewingPlayerId] || {};
        const vsa = vpd.stageArtists || vpd.stages?.map(() => []) || [];
        return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 890, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }} onClick={() => setViewingPlayerId(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: "#0f0e1a", border: "1px solid #fbbf24", borderRadius: 20, padding: 24, maxWidth: 800, width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <h2 style={{ color: "#fbbf24", fontSize: 20, margin: 0 }}>👁️ {vp?.festivalName}'s Festival</h2>
              <button onClick={() => setViewingPlayerId(null)} style={{ background: "none", border: "none", color: "#c4b5fd", fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>
            <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
              <span style={{ padding: "4px 10px", borderRadius: 8, background: "rgba(124,58,237,0.15)", color: "#c4b5fd", fontSize: 11 }}>🎟️ {vpd.tickets || 0} tickets</span>
              <span style={{ padding: "4px 10px", borderRadius: 8, background: "rgba(124,58,237,0.15)", color: "#c4b5fd", fontSize: 11 }}>🔥 Fame {vpd.fame || 0}</span>
              <span style={{ padding: "4px 10px", borderRadius: 8, background: "rgba(124,58,237,0.15)", color: "#c4b5fd", fontSize: 11 }}>🃏 {(vpd.hand || []).length} in hand</span>
            </div>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", alignItems: "flex-start", flexWrap: "wrap" }}>
              <PlayerBoard pd={vpd} stageColors={vpd.stageColors || []} year={year} onStageClick={(si) => setShowStageDetail({ stageIdx: si, playerId: viewingPlayerId })} />
              <div style={{ display: "flex", flexDirection: "column", gap: 8, minWidth: 170 }}>
                {(vpd.stages || []).map((_, si) => {
                  const sa = vsa[si] || [];
                  const sName = (vpd.stageNames || [])[si] || `Stage ${si + 1}`;
                  const sColor = (vpd.stageColors || [])[si] || "#7c3aed";
                  return <div key={si} style={{ padding: 8, borderRadius: 10, background: `${sColor}15`, border: `1px solid ${sColor}50` }}>
                    <div style={{ fontSize: 11, fontWeight: 800, color: sColor, marginBottom: 4, display: "flex", alignItems: "center", gap: 4 }}>
                      <span style={{ width: 8, height: 8, borderRadius: "50%", background: sColor, display: "inline-block" }} />{sName} {sa.length === 3 ? <span style={{ fontSize: 9, color: "#34d399" }}>✅</span> : <span style={{ fontSize: 9, color: "#94a3b8" }}>({sa.length}/3)</span>}
                    </div>
                    {sa.map((a, ai) => <div key={ai} style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, marginBottom: 2, background: genreGradient(a.genre), color: "#fff" }}>{ai === 2 ? "⭐ " : ""}{a.name} <span style={{ fontSize: 8, opacity: 0.7 }}>{(a.tickets || 0) + (a.vp || 0)}🎟️</span></div>)}
                    {sa.length === 0 && <div style={{ fontSize: 10, color: "#64748b", fontStyle: "italic" }}>Empty</div>}
                  </div>;
                })}
              </div>
            </div>
          </div>
        </div>;
      })()}

      <div style={{ display: "flex", flexDirection: isMobile ? "column" : "row", minHeight: "100vh" }}>
        {/* Desktop: classic sidebar | Mobile: horizontal player bar */}
        {!isMobile ? <div style={{ width: 220, padding: 16, borderRight: "1px solid #2a2a4a", overflowY: "auto", flexShrink: 0 }}>
          {winCondition && <div style={{ padding: "6px 8px", borderRadius: 8, background: "linear-gradient(135deg, rgba(251,191,36,0.14), rgba(124,58,237,0.06))", border: "1px solid rgba(251,191,36,0.4)", marginBottom: 10, fontSize: 10, color: "#fbbf24", textAlign: "center", fontWeight: 700, letterSpacing: 0.5 }} title={winCondition === "consistency" ? "Most years led in tickets wins. Ties → cumulative total." : winCondition === "following" ? "Highest cumulative tickets across all years wins." : "Highest single-year ticket count wins."}>🏆 {winCondition === "consistency" ? "Consistency" : winCondition === "following" ? "Following" : "Talk of the Town"}</div>}
          <h3 style={{ color: "#c4b5fd", fontSize: 14, marginBottom: 12, letterSpacing: 2, textTransform: "uppercase" }}>Year {year} of {totalYears}</h3>
          {players.map(p => { const pd = playerData[p.id] || {}; const ic = p.id === currentPlayerId; const isViewing = viewingPlayerId === p.id; const fame = pd.fame || 0; const onFire = fame >= 5; const yellowed = fame >= 3 && fame < 5;
            const fameBg = onFire ? "linear-gradient(135deg, rgba(249,115,22,0.32) 0%, rgba(239,68,68,0.32) 100%)"
              : yellowed ? "rgba(251,191,36,0.16)"
              : ic ? "rgba(124,58,237,0.2)"
              : isViewing ? "rgba(251,191,36,0.1)"
              : "rgba(15,14,26,0.6)";
            const fameBorder = onFire ? "2px solid #f97316"
              : yellowed ? "1px solid #fbbf24"
              : ic ? "1px solid #7c3aed"
              : isViewing ? "1px solid #fbbf24"
              : "1px solid transparent";
            const fameAnim = onFire ? "fameOnFire 1.4s ease-in-out infinite" : "none";
            return (
            <div key={p.id} onClick={() => setViewingPlayerId(p.id === currentPlayerId ? null : (viewingPlayerId === p.id ? null : p.id))} style={{
              padding: 12, borderRadius: 12, marginBottom: 8,
              background: fameBg, border: fameBorder,
              animation: fameAnim,
              cursor: ic ? "default" : "pointer", transition: "all 0.15s",
            }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: onFire ? "#fde68a" : (ic || yellowed) ? "#fbbf24" : "#c4b5fd", marginBottom: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{onFire ? "🔥 " : ic ? "▶ " : ""}{p.festivalName}{p.isAI ? " 🤖" : ""}{onFire ? " 🔥" : ""}<StarBadge pid={p.id} size={13} /></span>
                {!ic && <span style={{ fontSize: 9, color: isViewing ? "#fbbf24" : "#64748b" }}>{isViewing ? "👁️" : "👁️"}</span>}
              </div>
              {/* v133: tickets are the score — promoted to hero display in every stat row.
                  The other stats are supporting context underneath. */}
              <TicketBreakdown pd={pd} pid={p.id} ticketsLog={ticketsLog} year={year} councilQualifies={councilQualifies} style={{ display: "block", marginBottom: 6 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 6, padding: "6px 10px", borderRadius: 8, background: "linear-gradient(135deg, rgba(96,165,250,0.14), rgba(251,191,36,0.08))", border: "1px solid rgba(96,165,250,0.35)" }}>
                  <span style={{ fontSize: 18 }}>🎟️</span>
                  <span style={{ fontSize: 22, fontWeight: 900, color: "#60a5fa", letterSpacing: -0.5 }}>{pd.tickets || 0}</span>
                  <span style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.6, marginLeft: "auto" }}>tickets</span>
                </div>
              </TicketBreakdown>
              <div style={{ fontSize: 11, color: "#94a3b8", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                <FameBreakdown pid={p.id} fameLog={fameLog} year={year} currentFame={pd.fame || 0}>
                  <span style={{ animation: onFire ? "fameFlicker 0.8s ease-in-out infinite" : "none", color: onFire ? "#fb923c" : "#94a3b8", fontWeight: onFire ? 700 : 400 }}>🔥 Fame {pd.fame || 0}</span>
                </FameBreakdown>
                <span>🔄 {turnsLeft[p.id] || 0} turns</span>
                {(pd.heldDice || 0) > 0 && <span style={{ color: "#fbbf24", fontWeight: 700 }}>🎲 {pd.heldDice} dice</span>}
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{AMENITY_TYPES.map(t => { const c = (pd.amenities?.[t]) || 0; return c > 0 ? <span key={t} style={{ marginRight: 8 }}>{AMENITY_ICONS[t]}×{c}</span> : null; })}</div>
              {/* v197.21: infrastructure reward badges. Prominent, orange, tooltipped —
                  shows exactly which rewards this player currently holds. Panel gives the
                  full picture; this makes the answer to "is X getting anything?" visible
                  at a glance next to their name without needing to look at the sidebar. */}
              {infraRewardsMode && infraRewards && (() => {
                const held = ["campsite", "portaloo", "catering", "security"]
                  .map(a => ({ amenity: a, rewardId: infraRewards[a], isLeader: getInfraLeader(a, playerData) === p.id }))
                  .filter(x => x.rewardId && x.isLeader)
                  .map(x => ({ ...x, reward: INFRA_REWARDS[x.rewardId] }));
                if (held.length === 0) return null;
                return <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {held.map(h => (
                    <span key={h.amenity} title={`${h.reward.label}: ${h.reward.desc}`} style={{
                      display: "inline-flex", alignItems: "center", gap: 3,
                      padding: "3px 8px", borderRadius: 6,
                      background: "linear-gradient(135deg, rgba(251,146,60,0.25), rgba(251,191,36,0.18))",
                      border: "1px solid rgba(251,146,60,0.6)",
                      fontSize: 10, fontWeight: 700, color: "#fed7aa",
                      boxShadow: "0 0 6px rgba(251,146,60,0.35)",
                    }}>
                      🏗️ {AMENITY_EMOJI[h.amenity]} {h.reward.label}
                    </span>
                  ))}
                </div>;
              })()}
              <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>🎤 {(pd.stageArtists || []).flat().length} artists • 🃏 {(pd.hand || []).length} in hand</div>
              {/* v132: pending-tempt notification (real-time, so other players can consider contesting) */}
              {temptMode && (temptPlacements[p.id] || []).length > 0 && <div style={{ marginTop: 4, padding: "3px 6px", borderRadius: 6, background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.4)", fontSize: 10, color: "#fbbf24", fontWeight: 600 }}>
                💫 {p.festivalName} is tempting {(temptPlacements[p.id] || []).map(x => x.artistName).join(" & ")}
              </div>}
              {/* v132: last-action line for spectator awareness */}
              {(() => {
                const acts = lastAction[p.id];
                if (!acts || ic) return null;
                const arr = Array.isArray(acts) ? acts : [acts];
                if (arr.length === 0) return null;
                return <div style={{ marginTop: 4, fontSize: 10, color: "#8b5cf6", fontStyle: "italic" }}>
                  <div style={{ fontWeight: 700, color: "#a78bfa", marginBottom: 2 }}>Last turn ({p.festivalName}):</div>
                  {arr.map((a, i) => <div key={i} style={{ marginLeft: 6 }}>• {a}</div>)}
                </div>;
              })()}
              {/* v135: alt-objectives — objectives are HIDDEN info; only the current player
                  sees their own. Opponents' objective panels stay hidden so nobody can
                  reverse-engineer what they're trying for. v138: completed objectives are
                  now bright green (was grey) to celebrate achievement. */}
              {altObjectivesMode && p.id === currentPlayerId && ((activeObjectives[p.id] || []).length > 0 || (completedObjectives[p.id] || []).length > 0) && <div style={{ marginTop: 6, padding: 6, borderRadius: 6, background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.28)" }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#4ade80", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>🎯 Your Objectives</div>
                {(activeObjectives[p.id] || []).map(e => {
                  const obj = getAltObjective(e.id);
                  if (!obj) return null;
                  return <div key={e.id} style={{ fontSize: 9, color: "#e2e8f0", padding: "1px 0", display: "flex", justifyContent: "space-between", gap: 6, cursor: "help" }} title={obj.req}>
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>◇ {obj.name}</span>
                    <span style={{ color: obj.source === "failure" ? "#f97316" : obj.source === "progression" ? "#c4b5fd" : "#94a3b8", flexShrink: 0 }}>{obj.source === "failure" ? "fail" : obj.source === "progression" ? "Y2+" : "start"}</span>
                  </div>;
                })}
                {(completedObjectives[p.id] || []).map(e => {
                  const obj = getAltObjective(e.id);
                  if (!obj) return null;
                  return <div key={e.id} style={{ fontSize: 9, color: "#4ade80", fontWeight: 700, padding: "1px 0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "help" }} title={obj.req}>✓ {obj.name}</div>;
                })}
              </div>}
              {/* v154: Festival Identity panel — shown for current player only when identities mode is on. */}
              {identitiesMode && p.id === currentPlayerId && playerIdentities[p.id] && (() => {
                const identity = getIdentity(playerIdentities[p.id]);
                if (!identity) return null;
                const log = identityLog[p.id] || [];
                const totalTickets = log.filter(e => e.kind === "ticket").reduce((s, e) => s + e.amount, 0);
                const totalFame = log.filter(e => e.kind === "fame").reduce((s, e) => s + e.amount, 0);
                return <div style={{ marginTop: 6, padding: 6, borderRadius: 6, background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.28)" }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "#fbbf24", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>🎭 Identity: {identity.name}</div>
                  <div style={{ fontSize: 9, color: "#c4b5fd", fontStyle: "italic", marginBottom: 3 }}>{identity.goal}</div>
                  <div style={{ display: "flex", gap: 8, fontSize: 10, fontWeight: 700 }}>
                    <span style={{ color: totalTickets >= 0 ? "#86efac" : "#f87171" }}>🎟️ {totalTickets >= 0 ? "+" : ""}{totalTickets}</span>
                    {totalFame !== 0 && <span style={{ color: totalFame >= 0 ? "#fb923c" : "#f87171" }}>🔥 {totalFame >= 0 ? "+" : ""}{totalFame}</span>}
                  </div>
                </div>;
              })()}
              {/* v155/v166: Stage-open progress panel — shown for current player when in "trends" mode. */}
              {stageOpenMode === "trends" && p.id === currentPlayerId && (() => {
                const stages = (playerData[p.id]?.stages || []).length;
                const credits = playerData[p.id]?.stageOpenCredits || 0;
                const progress = playerData[p.id]?.stageProgress || 0;
                if (stages >= 3 && credits === 0) return null;
                return <div style={{ marginTop: 6, padding: 6, borderRadius: 6, background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.28)" }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "#4ade80", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 3 }}>🎪 Stage Progress</div>
                  <div style={{ fontSize: 10, color: "#e2e8f0" }}>Stages: <strong style={{ color: "#86efac" }}>{stages}/3</strong></div>
                  {stages < 3 && <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 2 }}>Progress: <strong style={{ color: "#c4b5fd" }}>{progress}/3</strong> (microtrends + stage dice)</div>}
                  {credits > 0 && stages < 3 && <button onClick={() => spendStageCredit(p.id)} style={{ marginTop: 6, padding: "6px 10px", borderRadius: 6, background: "rgba(74,222,128,0.20)", border: "1px solid #4ade80", color: "#86efac", fontSize: 11, fontWeight: 700, cursor: "pointer", width: "100%" }}>🎪 Open a Stage ({credits} credit{credits === 1 ? "" : "s"})</button>}
                  {credits > 0 && stages >= 3 && <div style={{ fontSize: 9, color: "#f87171", marginTop: 3 }}>{credits} credit{credits === 1 ? "" : "s"} banked (max stages reached)</div>}
                </div>;
              })()}
            </div>); })}
          <div style={{ marginTop: 12, padding: 8, borderRadius: 8, background: "rgba(124,58,237,0.1)", fontSize: 11, color: "#8b5cf6" }}>
            📦 Deck: {artistDeck.length} • 🗑️ Discard: {discardPile.length} • <span style={{ color: "#fbbf24" }}>🎲 Pool: {dicePool}</span>
          </div>
          {/* ── Always-visible Trending Lineups panel (desktop). The trending-lineup race is
              the game's most engaging mechanic — promoted out of the tab system so players
              always see what they're racing for. ── */}
          {!isMobile && contractsMode && sharedContracts.length > 0 && <div style={{ marginTop: 12, padding: 10, borderRadius: 12, background: "linear-gradient(135deg, rgba(168,85,247,0.15), rgba(124,58,237,0.08))", border: "2px solid rgba(168,85,247,0.5)", boxShadow: "0 0 18px rgba(168,85,247,0.15)" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#a855f7", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, textAlign: "center" }}>📜 Council Contracts — First to satisfy claims!</div>
            {sharedContracts.map((cid, idx) => {
              const council = ALL_COUNCILS.find(c => c.id === cid);
              if (!council) return null;
              return <div key={idx} style={{ padding: 8, borderRadius: 10, marginBottom: 6, background: "rgba(15,14,26,0.5)", border: "1px solid rgba(168,85,247,0.4)" }}>
                <div style={{ fontWeight: 800, fontSize: 13, color: "#a855f7", marginBottom: 4 }}>{council.name}</div>
                <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 3, lineHeight: 1.3 }}>📋 {formatCouncilCondition(council)}</div>
                <div style={{ fontSize: 10, color: "#86efac", fontWeight: 600 }}>🎁 {formatCouncilReward(council)}</div>
              </div>;
            })}
          </div>}
          {!isMobile && !contractsMode && lineupObjectives.length > 0 && <div style={{ marginTop: 12, padding: 10, borderRadius: 12, background: "linear-gradient(135deg, rgba(251,191,36,0.12), rgba(236,72,153,0.08))", border: "2px solid rgba(251,191,36,0.4)", boxShadow: "0 0 18px rgba(251,191,36,0.12)" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#fbbf24", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, textAlign: "center" }}>🎯 Trending Lineups</div>
            {lineupObjectives.map((lo, oi) => {
              if (!lo) return null;
              const bothClaimed = lo.claimed1st !== null && lo.claimed2nd !== null;
              const oneClaimed = lo.claimed1st !== null && lo.claimed2nd === null;
              return <div key={oi} style={{ padding: 8, borderRadius: 10, marginBottom: 6, background: bothClaimed ? "rgba(107,114,128,0.1)" : oneClaimed ? "rgba(34,197,94,0.08)" : "rgba(15,14,26,0.5)", border: `1px solid ${bothClaimed ? "rgba(107,114,128,0.3)" : oneClaimed ? "rgba(34,197,94,0.4)" : "rgba(251,191,36,0.4)"}`, opacity: bothClaimed ? 0.5 : 1 }}>
                <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginBottom: 6 }}>
                  {lo.genres.map((g, i) => <span key={i} style={{ padding: "4px 10px", borderRadius: 8, background: GENRE_COLORS[g] || "#6b7280", color: "#fff", fontSize: 12, fontWeight: 800, letterSpacing: 0.3, boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>{g}</span>)}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4, fontSize: 10 }}>
                  <div style={{ padding: "3px 6px", borderRadius: 6, background: lo.claimed1st !== null ? "rgba(34,197,94,0.15)" : "rgba(251,191,36,0.15)", textAlign: "center" }}>
                    <div style={{ fontWeight: 800, color: lo.claimed1st !== null ? "#4ade80" : "#fbbf24" }}>{lo.claimed1st !== null ? "✓" : ""} 1st +5 tickets</div>
                    {lo.claimed1st !== null && <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 1 }}>{players.find(p => p.id === lo.claimed1st)?.festivalName}</div>}
                  </div>
                  <div style={{ padding: "3px 6px", borderRadius: 6, background: lo.claimed2nd !== null ? "rgba(34,197,94,0.15)" : "rgba(196,181,253,0.15)", textAlign: "center" }}>
                    <div style={{ fontWeight: 800, color: lo.claimed2nd !== null ? "#4ade80" : "#c4b5fd" }}>{lo.claimed2nd !== null ? "✓" : ""} 2nd +3 tickets</div>
                    {lo.claimed2nd !== null && <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 1 }}>{players.find(p => p.id === lo.claimed2nd)?.festivalName}</div>}
                  </div>
                </div>
              </div>;
            })}
          </div>}
          {/* Desktop sidebar tabs + content */}
          {!isMobile && <>
            <div style={{ display: "flex", gap: 4, marginTop: 10 }}>
              {/* v147: hide the "🎯 My" tab under altObjectivesMode — the objective/fame
                  info it used to hold now lives inline in the stat rows, so the tab
                  renders empty. Kept for the classic objective mode. */}
              {!altObjectivesMode && <button onClick={() => setSidebarTab(sidebarTab === "my" ? null : "my")} style={{ flex: 1, padding: "6px 0", borderRadius: 8, border: "none", background: sidebarTab === "my" ? "rgba(124,58,237,0.3)" : "rgba(124,58,237,0.08)", color: sidebarTab === "my" ? "#e9d5ff" : "#64748b", cursor: "pointer", fontSize: 10, fontWeight: 700 }}>🎯 My</button>}
              <button onClick={() => setSidebarTab(sidebarTab === "trending" ? null : "trending")} style={{ flex: 1, padding: "6px 0", borderRadius: 8, border: "none", background: sidebarTab === "trending" ? "rgba(251,191,36,0.3)" : "rgba(251,191,36,0.08)", color: sidebarTab === "trending" ? "#fbbf24" : "#64748b", cursor: "pointer", fontSize: 10, fontWeight: 700 }}>📢 Microtrends</button>
            </div>
            {/* v197.14: Infrastructure Rewards panel — moved OUT of the microtrends tab so
                it's always visible during gameplay regardless of which sidebar tab is
                selected. Shows current reward + leader per amenity. Refreshes live as
                amenities change (getInfraLeader reads playerDataRef for freshness). */}
            {infraRewardsMode && infraRewards && <div style={{ marginTop: 10, padding: 8, borderRadius: 8, background: "rgba(251,146,60,0.06)", border: "1px solid rgba(251,146,60,0.25)" }}>
              <div style={{ color: "#fb923c", fontWeight: 700, fontSize: 11, marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>🏗️ Infrastructure Rewards</div>
              {["campsite", "portaloo", "catering", "security"].map(amenity => {
                const rewardId = infraRewards[amenity];
                const r = INFRA_REWARDS[rewardId];
                if (!r) return null;
                // v197.17: pass the closure's playerData explicitly. Panel is rendered
                // BEFORE the playerDataRef useEffect syncs, so the ref is stale for the
                // current render — falling back to it gives a one-render-behind view that
                // shows "unclaimed" briefly right after amenity placements. Using the
                // closure playerData guarantees we render against the newest committed
                // state that triggered this render.
                const leaderPid = getInfraLeader(amenity, playerData);
                const leader = leaderPid ? players.find(p => p.id === leaderPid) : null;
                // v197.20: same ground-truth read as getInfraLeader — count from fields
                // directly rather than the potentially-stale amenities cache.
                const counts = players.map(p => {
                  const fields = playerData[p.id]?.fields || [];
                  const count = fields.reduce((sum, f) => sum + (f?.[amenity] || 0), 0);
                  return { name: p.festivalName, count };
                }).sort((a, b) => b.count - a.count);
                const countLine = counts.map(c => `${c.name}:${c.count}`).join(" · ");
                return <div key={amenity} style={{
                  padding: 8, borderRadius: 6, marginBottom: 6,
                  background: leaderPid ? "linear-gradient(135deg, rgba(34,197,94,0.15), rgba(251,146,60,0.08))" : "rgba(30,41,59,0.5)",
                  border: `1px solid ${leaderPid ? "rgba(34,197,94,0.5)" : "#334155"}`,
                  boxShadow: leaderPid ? "0 0 8px rgba(34,197,94,0.2)" : "none",
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                    <span style={{ fontSize: 10, color: "#fb923c", fontWeight: 700 }}>{AMENITY_EMOJI[amenity]} Most {AMENITY_LABELS[amenity]}s — {r.label}</span>
                  </div>
                  {/* v197.21: prominent holder banner. Was a tiny name in the corner —
                      now a full-width badge so "who's getting this" is impossible to miss. */}
                  {leader ? (
                    <div style={{
                      padding: "4px 8px", borderRadius: 4, marginBottom: 4,
                      background: "rgba(34,197,94,0.2)", border: "1px solid rgba(34,197,94,0.5)",
                      fontSize: 11, fontWeight: 800, color: "#86efac", textAlign: "center",
                    }}>
                      ✨ ACTIVE — {leader.festivalName} ✨
                    </div>
                  ) : (
                    <div style={{
                      padding: "3px 8px", borderRadius: 4, marginBottom: 4,
                      background: "rgba(100,116,139,0.15)",
                      fontSize: 10, fontWeight: 600, color: "#94a3b8", textAlign: "center",
                    }}>
                      — unclaimed —
                    </div>
                  )}
                  <div style={{ fontSize: 10, color: "#cbd5e1", lineHeight: 1.3 }}>{r.desc}</div>
                  <div style={{ fontSize: 9, color: "#64748b", marginTop: 3 }}>Requires 2+ owned & strict lead · {countLine}</div>
                </div>;
              })}
            </div>}
            {sidebarTab === "my" && <div style={{ marginTop: 6 }}>
              {(playerObjectives[currentPlayerId] || []).length > 0 && (() => { return <div style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#c4b5fd", textTransform: "uppercase" }}>🎯 Artist Objectives</div>
                {(playerObjectives[currentPlayerId] || []).map((entry, oi) => { const r = evalArtistObjective(entry.obj, currentPD); return <div key={oi} style={{ padding: 6, borderRadius: 6, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.3)", marginBottom: 4 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: entry.completed ? "#4ade80" : "#e9d5ff" }}>{entry.completed ? "✅ " : ""}{entry.obj.name}</div>
                  <div style={{ fontSize: 9, color: "#94a3b8" }}>{entry.obj.req}</div>
                  <div style={{ fontSize: 9, color: "#4ade80" }}>{entry.obj.reward}</div>
                </div>; })}
              </div>; })()}
              {!altObjectivesMode && <div style={{ padding: 6, borderRadius: 6, background: "rgba(251,191,36,0.08)", fontSize: 10, color: "#fbbf24" }}>🔥 Fame {currentPD.fame || 0} → {FAME_VP[Math.min(5, currentPD.fame || 0)]} VP</div>}
            </div>}
            {sidebarTab === "trending" && <div style={{ marginTop: 6 }}>
              {(() => {
                // v189: two-track display — Trending Genres + Council Incentives, each with active + upcoming
                const activeAmenity = microtrends.find(mt => mt.kind === "amenity");
                const activeGenre = microtrends.find(mt => mt.kind === "genre");
                const renderTrack = (title, active, forecast) => {
                  if (!active && !forecast) return null;
                  return <div style={{ marginBottom: 10 }}>
                    <div style={{ fontSize: 9, fontWeight: 700, color: "#e9d5ff", marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.6 }}>{title}</div>
                    {active && (() => {
                      const claimed = active.claimedBy !== null;
                      const claimer = claimed ? players.find(p => p.id === active.claimedBy)?.festivalName : null;
                      const isAmenity = active.kind === "amenity";
                      const accent = isAmenity ? "#fbbf24" : (GENRE_COLORS[active.genre] || "#fbbf24");
                      const action = isAmenity ? `Place ${AMENITY_ICONS[active.amenity]} ${AMENITY_LABELS[active.amenity]}` : `Book a ${active.genre} artist`;
                      return <div style={{ padding: 4, borderRadius: 6, marginBottom: 3, background: claimed ? "rgba(107,114,128,0.1)" : `${accent}15`, opacity: claimed ? 0.5 : 1 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: claimed ? "#6b7280" : accent }}>{claimed ? "✓" : "🔥"} {action}</div>
                        {claimed && <div style={{ fontSize: 8, color: "#6b7280" }}>Claimed by {claimer}</div>}
                        {!claimed && <div style={{ fontSize: 8, color: "#94a3b8" }}>First to match → +1 Fame</div>}
                      </div>;
                    })()}
                    {forecast && (() => {
                      const isAmenity = forecast.kind === "amenity";
                      const accent = isAmenity ? "#fbbf24" : (GENRE_COLORS[forecast.genre] || "#fbbf24");
                      const action = isAmenity ? `Place ${AMENITY_ICONS[forecast.amenity]} ${AMENITY_LABELS[forecast.amenity]}` : `Book a ${forecast.genre} artist`;
                      // Both amenity and genre forecasts are claimable under anti-lead now
                      const canClaim = canClaimForecast(currentPlayerId);
                      return <div style={{ marginTop: 3, padding: 4, borderRadius: 6, background: canClaim ? "rgba(74,222,128,0.10)" : "rgba(15,14,26,0.5)", border: canClaim ? `1px solid ${accent}` : `1px dashed ${accent}60` }}>
                        <div style={{ fontSize: 8, fontWeight: 700, color: canClaim ? "#4ade80" : "#64748b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>{canClaim ? "🎯 Anti-Lead: Claimable" : "⏭ Coming up next"}</div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: accent, opacity: canClaim ? 1 : 0.85 }}>{action}</div>
                      </div>;
                    })()}
                  </div>;
                };
                return <>
                  {renderTrack("🎸 Trending Genres", activeGenre, nextGenreMicrotrend)}
                  {renderTrack("🏛️ Council Incentives", activeAmenity, nextAmenityMicrotrend)}
                </>;
              })()}
            </div>}
            {sidebarTab === "goals" && <div style={{ marginTop: 6 }}>
              {lineupObjectives.map((lo, oi) => lo && <div key={oi} style={{ padding: 8, borderRadius: 8, background: lo.claimed1st !== null ? "rgba(34,197,94,0.08)" : "rgba(251,191,36,0.08)", border: `1px solid ${lo.claimed1st !== null ? "rgba(34,197,94,0.3)" : "rgba(251,191,36,0.3)"}`, marginBottom: 6 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#fbbf24", textTransform: "uppercase" }}>🎯 Lineup #{oi+1}</div>
                <div style={{ display: "flex", gap: 4, marginTop: 4, flexWrap: "wrap" }}>
                  {lo.genres.map((g, i) => <span key={i} style={{ padding: "3px 8px", borderRadius: 6, background: GENRE_COLORS[g] || "#6b7280", color: "#fff", fontSize: 10, fontWeight: 700 }}>{g}</span>)}
                </div>
                <div style={{ fontSize: 9, marginTop: 3 }}>
                  <span style={{ color: lo.claimed1st !== null ? "#4ade80" : "#fbbf24" }}>1st: +5VP {lo.claimed1st !== null && `→ ${players.find(p => p.id === lo.claimed1st)?.festivalName}`}</span>
                  {" | "}
                  <span style={{ color: lo.claimed2nd !== null ? "#4ade80" : "#c4b5fd" }}>2nd: +3VP {lo.claimed2nd !== null && `→ ${players.find(p => p.id === lo.claimed2nd)?.festivalName}`}</span>
                </div>
              </div>)}
            </div>}
          </>}
        </div> : <div style={{ padding: "10px 12px", borderBottom: "1px solid #2a2a4a", overflowX: "auto", WebkitOverflowScrolling: "touch" }}>
          <div style={{ display: "flex", gap: 8, alignItems: "stretch", minWidth: "max-content" }}>
            <div style={{ padding: "6px 12px", borderRadius: 10, background: "rgba(124,58,237,0.15)", border: "1px solid #7c3aed40", whiteSpace: "nowrap" }}>
              <span style={{ color: "#c4b5fd", fontWeight: 700, fontSize: 13 }}>Year {year}/{totalYears}</span>
              {winCondition && <span title={winCondition === "consistency" ? "Most years led in tickets wins" : winCondition === "following" ? "Highest cumulative tickets wins" : "Highest single-year tickets wins"} style={{ color: "#fbbf24", fontSize: 11, marginLeft: 8, fontWeight: 700 }}>🏆 {winCondition === "consistency" ? "Consistency" : winCondition === "following" ? "Following" : "Talk of Town"}</span>}
              <span style={{ color: "#64748b", fontSize: 11, marginLeft: 8 }}>📦{artistDeck.length}</span>
              <span style={{ color: "#fbbf24", fontSize: 11, marginLeft: 8 }} title="Star Dice pool">🎲{dicePool}</span>
            </div>
            {players.map(p => { const pd = playerData[p.id] || {}; const ic = p.id === currentPlayerId; const fame = pd.fame || 0; const onFire = fame >= 5; const yellowed = fame >= 3 && fame < 5;
              const cBg = onFire ? "linear-gradient(135deg, rgba(249,115,22,0.32) 0%, rgba(239,68,68,0.32) 100%)"
                : yellowed ? "rgba(251,191,36,0.16)"
                : ic ? "rgba(124,58,237,0.25)"
                : "rgba(15,14,26,0.6)";
              const cBorder = onFire ? "2px solid #f97316"
                : yellowed ? "1px solid #fbbf24"
                : ic ? "2px solid #7c3aed"
                : "1px solid #2a2a4a";
              return (
              <div key={p.id} onClick={() => setViewingPlayerId(p.id === currentPlayerId ? null : (viewingPlayerId === p.id ? null : p.id))} style={{
                padding: "6px 12px", borderRadius: 10,
                background: cBg, border: cBorder,
                animation: onFire ? "fameOnFire 1.4s ease-in-out infinite" : "none",
                cursor: "pointer", whiteSpace: "nowrap", minWidth: 120,
              }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: onFire ? "#fde68a" : (ic || yellowed) ? "#fbbf24" : "#c4b5fd" }}>{onFire ? "🔥 " : ic ? "▶ " : ""}{p.festivalName}{p.isAI ? " 🤖" : ""}{onFire ? " 🔥" : ""}<StarBadge pid={p.id} size={12} /></div>
                <TicketBreakdown pd={pd} pid={p.id} ticketsLog={ticketsLog} year={year} councilQualifies={councilQualifies} style={{ display: "block", marginTop: 4, marginBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4, padding: "4px 8px", borderRadius: 6, background: "linear-gradient(135deg, rgba(96,165,250,0.14), rgba(251,191,36,0.08))", border: "1px solid rgba(96,165,250,0.35)" }}>
                    <span style={{ fontSize: 14 }}>🎟️</span>
                    <span style={{ fontSize: 18, fontWeight: 900, color: "#60a5fa", letterSpacing: -0.5 }}>{pd.tickets || 0}</span>
                    <span style={{ fontSize: 9, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.4, marginLeft: 3 }}>tix</span>
                  </div>
                </TicketBreakdown>
                <div style={{ fontSize: 11, color: "#94a3b8", display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <FameBreakdown pid={p.id} fameLog={fameLog} year={year} currentFame={pd.fame || 0}>
                    <span style={{ color: onFire ? "#fb923c" : "#94a3b8", fontWeight: onFire ? 700 : 400, animation: onFire ? "fameFlicker 0.8s ease-in-out infinite" : "none" }}>🔥{pd.fame||0}</span>
                  </FameBreakdown>
                  <span>🔄{turnsLeft[p.id]||0}</span>{(pd.heldDice||0) > 0 && <span style={{ color: "#fbbf24" }}>🎲{pd.heldDice}</span>}{(() => { const aLeft = getAgentActionsLeft(p.id); return <span style={{ color: aLeft > 0 ? "#93c5fd" : "#475569" }} title={aLeft > 0 ? `${aLeft} agent action${aLeft === 1 ? "" : "s"} left this year` : "Agent exhausted until next year"}>🕵️{aLeft}</span>; })()}
                </div>
                {temptMode && (temptPlacements[p.id] || []).length > 0 && <div style={{ marginTop: 3, padding: "2px 5px", borderRadius: 5, background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.4)", fontSize: 9, color: "#fbbf24", fontWeight: 600 }}>💫 tempting {(temptPlacements[p.id] || []).map(x => x.artistName).join(" & ")}</div>}
                {(() => {
                  const acts = lastAction[p.id];
                  if (!acts || ic) return null;
                  const arr = Array.isArray(acts) ? acts : [acts];
                  if (arr.length === 0) return null;
                  return <div style={{ marginTop: 3, fontSize: 9, color: "#8b5cf6", fontStyle: "italic" }}>
                    <div style={{ fontWeight: 700, color: "#a78bfa" }}>Last turn:</div>
                    {arr.map((a, i) => <div key={i} style={{ marginLeft: 4 }}>• {a}</div>)}
                  </div>;
                })()}
                {altObjectivesMode && p.id === currentPlayerId && ((activeObjectives[p.id] || []).length > 0 || (completedObjectives[p.id] || []).length > 0) && <div style={{ marginTop: 4, padding: 4, borderRadius: 5, background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.28)" }}>
                  <div style={{ fontSize: 8, fontWeight: 700, color: "#4ade80", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 2 }}>🎯 Your Objectives</div>
                  {(activeObjectives[p.id] || []).map(e => { const obj = getAltObjective(e.id); return obj ? <div key={e.id} style={{ fontSize: 8, color: "#e2e8f0", cursor: "help" }} title={obj.req}>◇ {obj.name}</div> : null; })}
                  {(completedObjectives[p.id] || []).map(e => { const obj = getAltObjective(e.id); return obj ? <div key={e.id} style={{ fontSize: 8, color: "#4ade80", fontWeight: 700, cursor: "help" }} title={obj.req}>✓ {obj.name}</div> : null; })}
                </div>}
                {identitiesMode && p.id === currentPlayerId && playerIdentities[p.id] && (() => {
                  const identity = getIdentity(playerIdentities[p.id]);
                  if (!identity) return null;
                  const log = identityLog[p.id] || [];
                  const totalTickets = log.filter(e => e.kind === "ticket").reduce((s, e) => s + e.amount, 0);
                  const totalFame = log.filter(e => e.kind === "fame").reduce((s, e) => s + e.amount, 0);
                  return <div style={{ marginTop: 4, padding: 4, borderRadius: 5, background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.28)" }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: "#fbbf24", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 2 }}>🎭 {identity.name}</div>
                    <div style={{ fontSize: 8, color: "#c4b5fd", fontStyle: "italic", marginBottom: 2 }}>{identity.goal}</div>
                    <div style={{ display: "flex", gap: 6, fontSize: 9, fontWeight: 700 }}>
                      <span style={{ color: totalTickets >= 0 ? "#86efac" : "#f87171" }}>🎟️ {totalTickets >= 0 ? "+" : ""}{totalTickets}</span>
                      {totalFame !== 0 && <span style={{ color: totalFame >= 0 ? "#fb923c" : "#f87171" }}>🔥 {totalFame >= 0 ? "+" : ""}{totalFame}</span>}
                    </div>
                  </div>;
                })()}
                {stageOpenMode === "trends" && p.id === currentPlayerId && (() => {
                  const stages = (playerData[p.id]?.stages || []).length;
                  const credits = playerData[p.id]?.stageOpenCredits || 0;
                  const progress = playerData[p.id]?.stageProgress || 0;
                  if (stages >= 3 && credits === 0) return null;
                  return <div style={{ marginTop: 4, padding: 4, borderRadius: 5, background: "rgba(74,222,128,0.06)", border: "1px solid rgba(74,222,128,0.28)" }}>
                    <div style={{ fontSize: 8, fontWeight: 700, color: "#4ade80", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 2 }}>🎪 Stages: {stages}/3</div>
                    {stages < 3 && <div style={{ fontSize: 8, color: "#94a3b8" }}>Progress: {progress}/3 to next credit</div>}
                    {credits > 0 && stages < 3 && <button onClick={() => spendStageCredit(p.id)} style={{ marginTop: 4, padding: "4px 8px", borderRadius: 5, background: "rgba(74,222,128,0.20)", border: "1px solid #4ade80", color: "#86efac", fontSize: 9, fontWeight: 700, cursor: "pointer", width: "100%" }}>Open Stage ({credits})</button>}
                  </div>;
                })()}
              </div>); })}
          </div>
        </div>}

          {/* Always-visible Trending Lineups card on mobile too — the game's most important
              shared state, doesn't belong hidden in a collapsed accordion. */}
          {isMobile && contractsMode && sharedContracts.length > 0 && <div style={{ marginTop: 8, padding: 10, borderRadius: 12, background: "linear-gradient(135deg, rgba(168,85,247,0.15), rgba(124,58,237,0.08))", border: "2px solid rgba(168,85,247,0.5)" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#a855f7", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, textAlign: "center" }}>📜 Council Contracts</div>
            {sharedContracts.map((cid, idx) => {
              const council = ALL_COUNCILS.find(c => c.id === cid);
              if (!council) return null;
              return <div key={idx} style={{ padding: 8, borderRadius: 10, marginBottom: 6, background: "rgba(15,14,26,0.5)", border: "1px solid rgba(168,85,247,0.4)" }}>
                <div style={{ fontWeight: 800, fontSize: 12, color: "#a855f7", marginBottom: 3 }}>{council.name}</div>
                <div style={{ fontSize: 9, color: "#94a3b8", marginBottom: 2, lineHeight: 1.3 }}>📋 {formatCouncilCondition(council)}</div>
                <div style={{ fontSize: 9, color: "#86efac", fontWeight: 600 }}>🎁 {formatCouncilReward(council)}</div>
              </div>;
            })}
          </div>}
          {isMobile && !contractsMode && lineupObjectives.length > 0 && <div style={{ marginTop: 8, padding: 10, borderRadius: 12, background: "linear-gradient(135deg, rgba(251,191,36,0.12), rgba(236,72,153,0.08))", border: "2px solid rgba(251,191,36,0.4)" }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#fbbf24", textTransform: "uppercase", letterSpacing: 1, marginBottom: 8, textAlign: "center" }}>🎯 Trending Lineups</div>
            {lineupObjectives.map((lo, oi) => {
              if (!lo) return null;
              const bothClaimed = lo.claimed1st !== null && lo.claimed2nd !== null;
              const oneClaimed = lo.claimed1st !== null && lo.claimed2nd === null;
              return <div key={oi} style={{ padding: 8, borderRadius: 10, marginBottom: 6, background: bothClaimed ? "rgba(107,114,128,0.1)" : oneClaimed ? "rgba(34,197,94,0.08)" : "rgba(15,14,26,0.5)", border: `1px solid ${bothClaimed ? "rgba(107,114,128,0.3)" : oneClaimed ? "rgba(34,197,94,0.4)" : "rgba(251,191,36,0.4)"}`, opacity: bothClaimed ? 0.5 : 1 }}>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 6 }}>
                  {lo.genres.map((g, i) => <span key={i} style={{ padding: "4px 12px", borderRadius: 8, background: GENRE_COLORS[g] || "#6b7280", color: "#fff", fontSize: 13, fontWeight: 800, letterSpacing: 0.3, boxShadow: "0 1px 4px rgba(0,0,0,0.3)" }}>{g}</span>)}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, fontSize: 11 }}>
                  <div style={{ padding: "4px 8px", borderRadius: 6, background: lo.claimed1st !== null ? "rgba(34,197,94,0.15)" : "rgba(251,191,36,0.15)", textAlign: "center" }}>
                    <div style={{ fontWeight: 800, color: lo.claimed1st !== null ? "#4ade80" : "#fbbf24" }}>{lo.claimed1st !== null ? "✓" : ""} 1st +5 tickets</div>
                    {lo.claimed1st !== null && <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>{players.find(p => p.id === lo.claimed1st)?.festivalName}</div>}
                  </div>
                  <div style={{ padding: "4px 8px", borderRadius: 6, background: lo.claimed2nd !== null ? "rgba(34,197,94,0.15)" : "rgba(196,181,253,0.15)", textAlign: "center" }}>
                    <div style={{ fontWeight: 800, color: lo.claimed2nd !== null ? "#4ade80" : "#c4b5fd" }}>{lo.claimed2nd !== null ? "✓" : ""} 2nd +3 tickets</div>
                    {lo.claimed2nd !== null && <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>{players.find(p => p.id === lo.claimed2nd)?.festivalName}</div>}
                  </div>
                </div>
              </div>;
            })}
          </div>}

          {/* Accordion info panels — mobile only. v147: filter out "My" tab under
              altObjectivesMode; info renders inline in the stat rows there. */}
          {isMobile && <>{[
            { key: "my", label: "🎯 My Festival", color: "#c4b5fd", bg: "rgba(124,58,237,0.3)" },
            { key: "trending", label: "📢 Microtrends", color: "#fbbf24", bg: "rgba(251,191,36,0.3)" },
          ].filter(tab => tab.key !== "my" || !altObjectivesMode).map(tab => (
            <div key={tab.key} style={{ marginTop: 6 }}>
              <button onClick={() => setSidebarTab(sidebarTab === tab.key ? null : tab.key)} style={{ width: "100%", padding: "10px 14px", borderRadius: 10, border: "none", background: sidebarTab === tab.key ? tab.bg : "rgba(124,58,237,0.08)", color: sidebarTab === tab.key ? tab.color : "#64748b", cursor: "pointer", fontSize: 13, fontWeight: 700, textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span>{tab.label}</span>
                <span style={{ fontSize: 10, transition: "transform 0.2s", transform: sidebarTab === tab.key ? "rotate(180deg)" : "rotate(0)" }}>▼</span>
              </button>
              {sidebarTab === tab.key && <div style={{ padding: "8px 12px", borderRadius: "0 0 10px 10px", background: "rgba(15,14,26,0.5)", borderLeft: `2px solid ${tab.color}30` }}>

          {tab.key === "my" && <>
            {/* Personal Objectives */}
            {(playerObjectives[currentPlayerId] || []).length > 0 && <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#c4b5fd", textTransform: "uppercase", marginBottom: 4 }}>🎯 Artist Objectives</div>
                {(playerObjectives[currentPlayerId] || []).map((entry, oi) => { const r = evalArtistObjective(entry.obj, currentPD); return <div key={oi} style={{ padding: 8, borderRadius: 8, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.3)", marginBottom: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: entry.completed ? "#4ade80" : "#e9d5ff" }}>{entry.completed ? "✅ " : ""}{entry.obj.name}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{entry.obj.req}</div>
                  <div style={{ fontSize: 11, color: "#4ade80", marginTop: 2 }}>{entry.obj.reward}</div>
                </div>; })}
            </div>}
            {/* Fame breakdown */}
            {!altObjectivesMode && <div style={{ padding: 10, borderRadius: 8, background: "rgba(251,191,36,0.08)", fontSize: 13, color: "#fbbf24" }}>
              🔥 Fame {currentPD.fame || 0} → {FAME_VP[Math.min(5, currentPD.fame || 0)]} VP at year end
            </div>}
          </>}

          {tab.key === "trending" && <>
            {/* Microtrends */}
            {microtrends.length > 0 && <div style={{ padding: 10, borderRadius: 10, background: "rgba(124,58,237,0.06)", border: "1px solid rgba(124,58,237,0.15)" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#e9d5ff", marginBottom: 6, textTransform: "uppercase", letterSpacing: 1 }}>🎵 Microtrend</div>
              {microtrends.map((mt, i) => {
                const claimed = mt.claimedBy !== null;
                const claimer = claimed ? players.find(p => p.id === mt.claimedBy)?.festivalName : null;
                const isAmenity = mt.kind === "amenity";
                const accent = isAmenity ? "#fbbf24" : (GENRE_COLORS[mt.genre] || "#fbbf24");
                const action = isAmenity ? `Place ${AMENITY_ICONS[mt.amenity]} ${AMENITY_LABELS[mt.amenity]}` : `Book a ${mt.genre} artist`;
                return <div key={i} style={{ padding: "6px 10px", borderRadius: 8, marginBottom: 4, background: claimed ? "rgba(107,114,128,0.15)" : `${accent}15`, border: `1px solid ${claimed ? "#4b5563" : accent}40`, opacity: claimed ? 0.5 : 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: claimed ? "#6b7280" : accent }}>
                    {claimed ? "✓" : "🔥"} {action}
                  </div>
                  {claimed && <div style={{ fontSize: 11, color: "#6b7280" }}>Claimed by {claimer}</div>}
                  {!claimed && <div style={{ fontSize: 11, color: "#94a3b8" }}>First to match → +1 Fame</div>}
                </div>;
              })}
              {nextMicrotrend && (() => {
                const nmt = nextMicrotrend;
                const isAmenity = nmt.kind === "amenity";
                const accent = isAmenity ? "#fbbf24" : (GENRE_COLORS[nmt.genre] || "#fbbf24");
                const action = isAmenity ? `Place ${AMENITY_ICONS[nmt.amenity]} ${AMENITY_LABELS[nmt.amenity]}` : `Book a ${nmt.genre} artist`;
                const canClaim = !isAmenity && canClaimForecast(currentPlayerId);
                return <div style={{ marginTop: 6, padding: "6px 10px", borderRadius: 8, background: canClaim ? "rgba(74,222,128,0.10)" : "rgba(15,14,26,0.5)", border: canClaim ? `1px solid ${accent}` : `1px dashed ${accent}60` }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: canClaim ? "#4ade80" : "#64748b", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 2 }}>{canClaim ? "🎯 Anti-Lead: Claimable" : "⏭ Coming up next"}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: accent, opacity: canClaim ? 1 : 0.85 }}>{action}</div>
                  {canClaim && <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 2 }}>Match to claim early → +1 Fame</div>}
                </div>;
              })()}
            </div>}
          </>}

          {tab.key === "goals" && <>
            {lineupObjectives.map((lo, oi) => lo && <div key={oi} style={{ padding: 12, borderRadius: 10, background: lo.claimed1st !== null ? "rgba(34,197,94,0.08)" : "rgba(251,191,36,0.08)", border: `1px solid ${lo.claimed1st !== null ? "rgba(34,197,94,0.3)" : "rgba(251,191,36,0.3)"}`, marginBottom: 8 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#fbbf24", marginBottom: 6, textTransform: "uppercase" }}>🎯 Lineup #{oi+1}</div>
              <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap" }}>
                {lo.genres.map((g, i) => <span key={i} style={{ padding: "5px 12px", borderRadius: 8, background: GENRE_COLORS[g] || "#6b7280", color: "#fff", fontSize: 13, fontWeight: 700 }}>{g}</span>)}
              </div>
              <div style={{ fontSize: 12 }}>
                <span style={{ color: lo.claimed1st !== null ? "#4ade80" : "#fbbf24", fontWeight: 600 }}>1st: +5VP {lo.claimed1st !== null && `→ ${players.find(p => p.id === lo.claimed1st)?.festivalName}`}</span>
                {" | "}
                <span style={{ color: lo.claimed2nd !== null ? "#4ade80" : "#c4b5fd", fontWeight: 600 }}>2nd: +3VP {lo.claimed2nd !== null && `→ ${players.find(p => p.id === lo.claimed2nd)?.festivalName}`}</span>
              </div>
            </div>)}
          </>}

              </div>}
            </div>
          ))}</>}

        {/* Main area */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: isMobile ? "12px 16px" : 16, overflow: "auto" }}>
          <div style={{ marginBottom: 10, textAlign: "center" }}>
            <h2 style={{ color: "#fbbf24", fontSize: isMobile ? 22 : 20, margin: 0 }}>{currentPlayer?.festivalName}'s Turn</h2>
            <p style={{ color: "#8b5cf6", fontSize: isMobile ? 13 : 12, margin: "4px 0" }}>{turnsLeft[currentPlayerId]} turns remaining</p>
          </div>

          {/* Board + stage artists */}
          <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 12 : 16, justifyContent: "center", alignItems: "center" }}>
            <PlayerBoard
              pd={currentPD}
              stageColors={currentPD.stageColors || []}
              pickStageMode={artistAction === "pickStage"}
              pickFieldMode={pickingFieldFor != null}
              onFieldClick={handleFieldClickForPlacement}
              year={year}
              genreMatchStages={(() => {
                // v124: compute which stages allow the currently-selected artist via the
                // genre-match headliner rule, so PlayerBoard can render them with the gold
                // "Genre Match" accent. Only relevant when picking a stage.
                if (artistAction !== "pickStage" || !selectedArtist) return null;
                const set = new Set();
                (currentPD.stageArtists || []).forEach((sa, si) => {
                  // Amenity path takes precedence — if affordable, it's a "normal" bookable
                  // stage, not a genre-match stage. This keeps the UI's colour intent clear:
                  // gold means "you're getting a discount here."
                  if (canAffordArtist(selectedArtist.artist, currentPD, sec3Reduction(currentPlayerId))) return;
                  if (canBookHeadlinerViaGenre(selectedArtist.artist, currentPD, si)) set.add(si);
                });
                return set;
              })()}
              onStageClick={(si) => {
                const sa = (currentPD.stageArtists || [])[si] || [];
                if (artistAction === "pickStage" && sa.length < 3) {
                  handleStageSelect(si);
                } else {
                  setShowStageDetail({ stageIdx: si, playerId: currentPlayerId });
                }
              }}
            />
          </div>

          {/* Available Artist Pool */}
          <div style={{ marginTop: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#c4b5fd" }}>Available Artists ({artistPool.length})</div>
              {/* v197.13: Quick Turnaround (port_1) — free pool refresh once per turn */}
              {(() => {
                if (!hasInfraReward(currentPlayerId, "port_1")) return null;
                const usageKey = `port_1:${currentPlayerId}:${turnNumber}`;
                const used = infraRewardUsageRef.current[usageKey];
                return <button onClick={() => {
                  if (used) return;
                  infraRewardUsageRef.current[usageKey] = true;
                  refreshPool();
                  addLog("🏗️ Reward", `${currentPlayer.festivalName}: refreshed pool via Quick Turnaround (Most Portaloos)`);
                }} disabled={used} style={{
                  ...bs, fontSize: 11, padding: "6px 12px",
                  opacity: used ? 0.4 : 1,
                  cursor: used ? "not-allowed" : "pointer",
                  background: used ? "#2a2a4a" : "rgba(251,146,60,0.2)",
                  border: used ? "1px solid #334155" : "1px solid rgba(251,146,60,0.5)",
                  color: used ? "#94a3b8" : "#fb923c",
                }} title={used ? "Already used this turn" : "Refresh the artist pool for free (once per turn)"}>
                  🔄 {used ? "Used" : "Refresh Pool"}
                </button>;
              })()}
            </div>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
              {artistPool.map((a, i) => {
                const agentsOnThis = getPlacementsOnArtist(a.name).map(x => [x.pid, x.placement]);
                return <div key={i} style={{ position: "relative" }}>
                  <ArtistCard artist={a} showCost small
                    affordable={canBookArtistAnywhere(a, currentPD)}
                    genreMatchGlow={hasGenreMatchBonusAvailable(a, currentPD)}
                    disabled={actionTaken || turnAction !== "artist" || artistAction === "pickStage"}
                    onClick={() => {
                      if (artistAction === null && !actionTaken) {
                        // Show book/reserve choice
                      }
                    }}
                  />
                  {agentsOnThis.length > 0 && <div style={{ position: "absolute", top: -4, right: -4, display: "flex", gap: 2 }}>
                    {agentsOnThis.map(([pid, p], ai) => {
                      const pColor = players.find(pl => pl.id === parseInt(pid))?.color || "#60a5fa";
                      return <div key={ai} style={{ background: pColor, borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, border: "2px solid #1e1b4b" }}>🕵️</div>;
                    })}
                  </div>}
                </div>;
              })}
            </div>
          </div>

          {/* Player Hand */}
          {handCards.length > 0 && <div style={{ marginTop: 8 }}>
            <button onClick={() => setShowHand(!showHand)} style={{ ...bs, padding: "4px 12px", fontSize: 11, marginBottom: 6 }}>
              {showHand ? "Hide" : "Show"} Hand ({handCards.length} cards)
            </button>
            {showHand && <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
              {handCards.map((a, i) => <ArtistCard key={i} artist={a} showCost small
                affordable={canBookArtistAnywhere(a, currentPD)}
                genreMatchGlow={hasGenreMatchBonusAvailable(a, currentPD)}
                disabled={actionTaken || turnAction !== "artist" || artistAction === "pickStage"}
                onClick={() => artistAction === null && !actionTaken && handleBookFromHand(i)}
              />)}
            </div>}
          </div>}

          {/* Action bar */}
          <div style={{ ...card, width: "100%", maxWidth: 700, marginTop: 12, padding: 16, alignSelf: "center" }}>
            {/* v131: pending-tempt undo — visible whenever the current player has any pending
                tempts, regardless of whether they've taken their turn action. Refunds 1 Fame
                per undo click, popping the most recent placement. Safe to use before ending turn. */}
            {temptMode && (temptPlacements[currentPlayerId] || []).length > 0 && <div style={{ marginBottom: 10, padding: 10, borderRadius: 8, background: "rgba(251,191,36,0.08)", border: "1px solid rgba(251,191,36,0.35)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <div style={{ fontSize: 12, color: "#fbbf24", fontWeight: 600 }}>
                💫 Pending tempts: {(temptPlacements[currentPlayerId] || []).map(p => p.artistName).join(", ")}
              </div>
              <button onClick={() => undoLastTempt(currentPlayerId)} style={{ ...bs, fontSize: 11, padding: "4px 10px", color: "#fbbf24", border: "1px solid #fbbf24", background: "rgba(251,191,36,0.15)" }}>↩️ Undo Last Tempt</button>
            </div>}
            {actionTaken && !noTurnsLeft && <div style={{ textAlign: "center" }}>
              <p style={{ color: "#34d399", fontSize: 14, fontWeight: 600, marginBottom: 4 }}>✓ Action complete! Review your board, then end your turn.</p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 8, flexWrap: "wrap" }}>
                {undoSnapshot && <button onClick={handleUndo} style={{ ...bs, color: "#fbbf24", border: "1px solid #fbbf24", background: "rgba(251,191,36,0.1)" }}>↩️ Undo</button>}
                {hasAgent(currentPlayerId) && !turnAction && <button onClick={() => setTurnAction("deployAgent")} style={{ ...bs, fontSize: 12, background: temptMode ? "rgba(251,191,36,0.15)" : "rgba(96,165,250,0.15)", border: `1px solid ${temptMode ? "#fbbf24" : "#60a5fa"}`, color: temptMode ? "#fbbf24" : "#60a5fa" }}>{temptMode ? `💫 Tempt Artist (1 🔥, ${getAgentActionsLeft(currentPlayerId)} left)` : `🕵️ Deploy Agent (free, ${getAgentActionsLeft(currentPlayerId)} left)`}</button>}
                <button onClick={() => { setUndoSnapshot(null); endTurn(); }} style={bd}>End Turn →</button>
              </div>
            </div>}

            {!actionTaken && !turnAction && !noTurnsLeft && <div>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={handlePickAmenity} style={bp}>🎲 Pick Amenity</button>
                {hasAgent(currentPlayerId) && <button onClick={() => setTurnAction("deployAgent")} style={{ ...bs, background: temptMode ? "rgba(251,191,36,0.15)" : "rgba(96,165,250,0.15)", border: `1px solid ${temptMode ? "#fbbf24" : "#60a5fa"}`, color: temptMode ? "#fbbf24" : "#60a5fa" }}>{temptMode ? `💫 Tempt Artist (1 🔥, ${getAgentActionsLeft(currentPlayerId)} left)` : `🕵️ Deploy Agent (free, ${getAgentActionsLeft(currentPlayerId)} left)`}</button>}
                <button onClick={handleArtistAction} style={{ ...bs, background: "linear-gradient(135deg, rgba(236,72,153,0.3), rgba(249,115,22,0.3))", border: "1px solid #ec4899" }}>🎤 Book / Reserve Artist</button>
              </div>
            </div>}

            {/* Pick Amenity */}
            {!actionTaken && turnAction === "pickAmenity" && pickingFieldFor == null && <div style={{ textAlign: "center" }}>
              <p style={{ color: "#c4b5fd", fontSize: 13, marginBottom: 12 }}>Pick a die to build that amenity:</p>
              <DiceDisplay dice={dice} onPick={handleDiePick} canReroll={diceNeedReroll(dice)} onReroll={handleRerollDice} />
              {(() => {
                // Council "refreshDice" charges available this turn. Stacks across multiple
                // qualifying councils (3 possible: Secret Sauce / Quiet Camping / Urinals).
                // Mirrors the refreshPool button pattern.
                const fields = currentPD?.fields || [];
                const cap = (currentPD?.councils || []).reduce((acc, c, i) => acc + (c?.reward?.type === "refreshDice" && councilQualifies(c, fields[i], year || 1) ? 1 : 0), 0);
                const remaining = cap - councilDiceRefreshesUsedThisTurn;
                if (cap <= 0 || remaining <= 0) return null;
                return <button onClick={() => {
                  setDice(rollDice());
                  setCouncilDiceRefreshesUsedThisTurn(n => n + 1);
                  addLog(currentPlayer.festivalName, `🎲 Refreshed amenity dice (Council reward — free, ${remaining - 1} left)`);
                  sfx.placeAmenity();
                }} style={{ ...bs, fontSize: 12, marginTop: 10, background: "rgba(34,197,94,0.15)", border: "1px solid #22c55e", color: "#86efac" }}>🎲 Refresh Dice (Council, free — {remaining} left)</button>;
              })()}
              <div><button onClick={() => setTurnAction(null)} style={{ ...bs, marginTop: 12, fontSize: 12 }}>← Cancel</button></div>
            </div>}

            {!actionTaken && turnAction === "pickAmenity" && pickingFieldFor != null && <div style={{ textAlign: "center", padding: 14, borderRadius: 12, background: "rgba(167,139,250,0.12)", border: "1px solid #a78bfa", marginBottom: 12 }}>
              <p style={{ color: "#fbbf24", fontSize: 14, fontWeight: 700, margin: 0 }}>{AMENITY_ICONS[pickingFieldFor]} Click a field below to place your {AMENITY_LABELS[pickingFieldFor]}</p>
              <button onClick={cancelFieldPlacement} style={{ ...bs, marginTop: 8, fontSize: 11 }}>← Cancel</button>
            </div>}

            {/* Deploy Agent / Tempt — pool claim only */}
            {(turnAction === "deployAgent" || turnAction === "agentPool") && <div style={{ textAlign: "center" }}>
              <p style={{ color: temptMode ? "#fbbf24" : "#60a5fa", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{temptMode ? "💫 Tempt a Pool Artist" : "🕵️ Claim a Pool Artist"}</p>
              <p style={{ color: "#94a3b8", fontSize: 11, marginBottom: 12 }}>{temptMode ? "Spend 2 🔥 Fame to court a pool artist. Next turn: uncontested → book to stage (+2 🔥 Fame refunded, net 0). If contested → dice roll decides, 1 🔥 Fame refunded to contestants." : "Place your agent on an artist you can afford. Next turn: uncontested → book to stage. Contested → dice roll tiebreak (earliest placer wins ties)."}</p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                {artistPool.map((a, i) => {
                  const canAfford = canAffordArtist(a, currentPD, sec3Reduction(currentPlayerId));
                  const canTempt = temptMode ? ((currentPD.fame || 0) >= 2) : true;
                  const clickable = temptMode ? canTempt : canAfford;
                  const agentsOnIt = getPlacementsOnArtist(a.name).map(x => [x.pid, x.placement]);
                  return <div key={i} style={{ position: "relative" }}>
                    <ArtistCard artist={a} showCost small onClick={() => {
                      if (!clickable) return;
                      placeAgentOnArtist(currentPlayerId, i);
                      setTurnAction(null);
                    }} />
                    {!clickable && <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#f87171" }}>{temptMode ? "Need 2 🔥 Fame" : "Can't afford"}</div>}
                    {agentsOnIt.length > 0 && <div style={{ position: "absolute", top: -4, right: -4, display: "flex", gap: 2 }}>
                      {agentsOnIt.map(([pid], ai) => {
                        const pColor = players.find(pl => pl.id === parseInt(pid))?.color || "#60a5fa";
                        return <div key={ai} style={{ background: pColor, borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, border: "2px solid #1e1b4b" }} title={players.find(pl => pl.id === parseInt(pid))?.festivalName}>{temptMode ? "💫" : "🕵️"}</div>;
                      })}
                    </div>}
                  </div>;
                })}
              </div>
              {agentMicrotrendClaim && !temptMode && (() => {
                // Always-visible microtrend block in the Deploy Agent UI. Previously this
                // hid when no microtrend was unclaimed — which silently confused players
                // who'd just claimed the active trend via a book/amenity on the same turn,
                // because they'd open Deploy Agent expecting the option and see nothing.
                // Now we always show the block, and explain why the action is unavailable
                // when it is.
                const active = microtrends.find(mt => mt.claimedBy === null);
                if (active) {
                  const isAmenity = active.kind === "amenity";
                  const trendLabel = isAmenity ? `Place ${AMENITY_ICONS[active.amenity]} ${AMENITY_LABELS[active.amenity]}` : `Book a ${active.genre} artist`;
                  const accent = isAmenity ? "#fbbf24" : (GENRE_COLORS[active.genre] || "#fbbf24");
                  return <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px dashed rgba(124,58,237,0.3)" }}>
                    <p style={{ color: "#c4b5fd", fontSize: 12, fontWeight: 600, marginBottom: 8 }}>— or instead, place your agent on the active microtrend —</p>
                    <div style={{ display: "inline-block", padding: "10px 14px", borderRadius: 10, border: `1px dashed ${accent}80`, background: `${accent}10`, marginBottom: 8 }}>
                      <div style={{ fontSize: 10, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>🎵 Active Microtrend</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: accent }}>{trendLabel}</div>
                    </div>
                    <div>
                      <button onClick={() => { placeAgentOnMicrotrend(currentPlayerId); setTurnAction(null); }} style={{ ...bp, fontSize: 12, padding: "8px 14px" }}>🎵 Place on Microtrend (+1 🔥 Fame, +1 🎟️ tickets)</button>
                    </div>
                    <p style={{ color: "#64748b", fontSize: 10, marginTop: 8, fontStyle: "italic" }}>The trend advances to the forecast at end of turn.</p>
                  </div>;
                }
                // No unclaimed microtrend — explain why. The forecast (if any) shows what
                // will become active at end-of-turn, so the player understands the state.
                const claimed = microtrends.find(mt => mt.claimedBy !== null);
                const claimerName = claimed ? (players.find(p => p.id === claimed.claimedBy)?.festivalName || "?") : null;
                const claimedSelf = claimed && claimed.claimedBy === currentPlayerId;
                const upcoming = nextMicrotrend;
                return <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px dashed rgba(124,58,237,0.3)" }}>
                  <p style={{ color: "#94a3b8", fontSize: 12, fontWeight: 600, marginBottom: 8 }}>— microtrend agent placement —</p>
                  <div style={{ padding: "10px 14px", borderRadius: 10, border: "1px solid rgba(148,163,184,0.2)", background: "rgba(148,163,184,0.05)", marginBottom: 8 }}>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 4 }}>
                      {claimed
                        ? (claimedSelf
                          ? <>You've already claimed the active microtrend this turn — your agent can't double-dip on the same one.</>
                          : <>The active microtrend has been claimed by {claimerName}.</>)
                        : <>No microtrend is active right now.</>}
                    </div>
                    {upcoming && <div style={{ fontSize: 10, color: "#64748b", fontStyle: "italic" }}>
                      A new {upcoming.kind === "amenity" ? AMENITY_LABELS[upcoming.amenity] : upcoming.genre} microtrend becomes active at end of turn — your next agent action could claim that one.
                    </div>}
                  </div>
                  <button disabled style={{ ...bp, fontSize: 12, padding: "8px 14px", opacity: 0.35, cursor: "not-allowed" }}>🎵 Place on Microtrend — unavailable</button>
                </div>;
              })()}
              <button onClick={() => setTurnAction(null)} style={{ ...bs, fontSize: 12, marginTop: 12 }}>← Cancel</button>
            </div>}

            {/* Pending agent artist booking (uncontested) */}
            {/* v133: fame-gain popup — click-through celebration whenever the current
                player gains Fame. Queue-based so multiple gains chain sequentially. Only
                shows when the front-of-queue entry is for THIS player and their turn is
                the active one. Higher z-index than other modals so it sits above them.
                v138: rendered via a portal to document.body so it escapes any transformed
                ancestor that would clip it to the action-bar box. */}
            {fameGainQueue.length > 0 && fameGainQueue[0].pid === currentPlayerId && typeof document !== "undefined" && createPortal((() => {
              const fg = fameGainQueue[0];
              return <div style={{ position: "fixed", inset: 0, background: "rgba(15,14,26,0.92)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, animation: "fadeSlideIn 0.35s", overflowY: "auto" }}>
                <div style={{ padding: "24px 26px", borderRadius: 16, background: "linear-gradient(135deg, rgba(251,146,60,0.18), rgba(249,115,22,0.08))", border: "2px solid #f97316", boxShadow: "0 0 50px rgba(249,115,22,0.4)", textAlign: "center", maxWidth: 440, width: "100%", margin: "auto" }}>
                  <div style={{ fontSize: 48, marginBottom: 4, animation: "fameFlicker 0.9s ease-in-out infinite" }}>🔥</div>
                  <h2 style={{ color: "#fb923c", fontSize: 20, margin: "0 0 10px", fontWeight: 800, letterSpacing: -0.3 }}>Your festival is becoming more famous.</h2>
                  <p style={{ color: "#e2e8f0", fontSize: 14, margin: "0 0 4px", lineHeight: 1.4 }}>
                    <span style={{ color: "#fbbf24", fontWeight: 700 }}>{fg.source}</span> has provided
                    <span style={{ color: "#fb923c", fontWeight: 900, fontSize: 22, margin: "0 6px" }}>+{fg.amount}</span>
                    Fame
                  </p>
                  {fameGainQueue.length > 1 && <p style={{ color: "#94a3b8", fontSize: 11, margin: "8px 0 0", fontStyle: "italic" }}>{fameGainQueue.length - 1} more fame gain{fameGainQueue.length - 1 === 1 ? "" : "s"} queued</p>}
                  <button onClick={() => setFameGainQueue(prev => prev.slice(1))} style={{ ...bp, marginTop: 18, background: "linear-gradient(135deg, #f97316, #ef4444)", border: "none", padding: "10px 26px", fontSize: 14, fontWeight: 700 }}>Continue →</button>
                </div>
              </div>;
            })(), document.body)}

            {/* v135: Alternative Artist Objectives picker — shown whenever a human has
                an objective choice to make (game start / year 2+/failure). Player picks
                one of the two dealt objectives; the other returns to the deck. */}
            {/* v142: hand-cap discard picker. Blocks the current player's turn until
                they've clicked N cards to discard from their hand. AI never sees this. */}
            {pendingHandDiscard && pendingHandDiscard.pid === currentPlayerId && (() => {
              const phd = pendingHandDiscard;
              const pd = playerData[phd.pid] || {};
              const hand = pd.hand || [];
              return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 970, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
                <div style={{ padding: 20, borderRadius: 16, background: "rgba(20,18,34,0.98)", border: "2px solid rgba(239,68,53,0.6)", boxShadow: "0 0 40px rgba(239,68,53,0.25)", maxWidth: 720, width: "100%", maxHeight: "90vh", overflowY: "auto" }}>
                  <div style={{ fontSize: 11, color: "#f97316", textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 700, marginBottom: 4, textAlign: "center" }}>🎴 Hand over 8</div>
                  <h2 style={{ color: "#e2e8f0", fontSize: 20, margin: "0 0 6px", textAlign: "center" }}>Discard {phd.needToDiscard} card{phd.needToDiscard === 1 ? "" : "s"}</h2>
                  <p style={{ color: "#94a3b8", fontSize: 12, textAlign: "center", margin: "0 0 14px" }}>You have {hand.length} cards but the hand limit is 8. Click cards to discard them.</p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                    {hand.map((a, i) => <ArtistCard key={i} artist={a} small showCost onClick={() => {
                      const newHand = [...hand]; newHand.splice(i, 1);
                      setPlayerData(p => ({ ...p, [phd.pid]: { ...p[phd.pid], hand: newHand } }));
                      setDiscardPile(prev => [...(prev || []), a]);
                      addLog(players.find(pl => pl.id === phd.pid)?.festivalName || "?", `Discarded ${a.name}`);
                      const remaining = phd.needToDiscard - 1;
                      if (remaining <= 0) setPendingHandDiscard(null);
                      else setPendingHandDiscard({ ...phd, needToDiscard: remaining });
                    }} />)}
                  </div>
                </div>
              </div>;
            })()}

            {false && pendingObjectivePicker && pendingObjectivePicker.pid === currentPlayerId && (() => {
              const p = pendingObjectivePicker;
              const opts = p.options.map(id => getAltObjective(id)).filter(Boolean);
              const sourceLabel = p.source === "starter" ? "Starter objective" : p.source === "failure" ? "Failure objective (bonus reward)" : "Year " + (yearRef.current || year || 2) + " objective";
              const rewardLine = p.source === "failure"
                ? "Complete this → open a new stage AND draw 3 artists (or +10 tickets if 3 stages already open)."
                : "Complete this → open a new stage (or +10 tickets if 3 stages already open).";
              return <div style={{ position: "fixed", inset: 0, background: "rgba(15,14,26,0.92)", zIndex: 970, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
                <div style={{ padding: 24, borderRadius: 16, background: "rgba(20,18,34,0.98)", border: "2px solid rgba(74,222,128,0.6)", boxShadow: "0 0 40px rgba(74,222,128,0.25)", maxWidth: 620, width: "100%" }}>
                  <div style={{ fontSize: 11, color: "#4ade80", textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 700, marginBottom: 4, textAlign: "center" }}>🎯 {sourceLabel}</div>
                  <h2 style={{ color: "#e2e8f0", fontSize: 20, margin: "0 0 6px", textAlign: "center" }}>Pick your artist objective</h2>
                  <p style={{ color: "#94a3b8", fontSize: 12, textAlign: "center", margin: "0 0 18px" }}>{rewardLine}</p>
                  <div style={{ display: "grid", gap: 12, gridTemplateColumns: "1fr 1fr" }}>
                    {opts.map((obj, i) => (
                      <button key={i} onClick={() => chooseAltObjective(obj.id)} style={{ padding: 16, borderRadius: 12, background: "linear-gradient(135deg, rgba(74,222,128,0.10), rgba(96,165,250,0.06))", border: "2px solid rgba(74,222,128,0.5)", color: "#e2e8f0", cursor: "pointer", textAlign: "left", transition: "all 0.15s" }}>
                        <div style={{ fontWeight: 800, fontSize: 15, color: "#4ade80", marginBottom: 6 }}>{obj.name}</div>
                        <div style={{ fontSize: 12, color: "#e2e8f0", lineHeight: 1.4 }}>{obj.req}</div>
                      </button>
                    ))}
                  </div>
                  <p style={{ color: "#64748b", fontSize: 10, marginTop: 14, textAlign: "center", fontStyle: "italic" }}>The objective you don't pick goes back into the shared deck.</p>
                </div>
              </div>;
            })()}

            {pendingContractClaim && (() => {
              const claim = pendingContractClaim;
              const council = ALL_COUNCILS.find(c => c.id === claim.contractId);
              const claimerPlayer = players.find(p => p.id === claim.pid);
              if (!council || !claimerPlayer) return null;
              const isAI = claimerPlayer.isAI;
              if (isAI) {
                setTimeout(() => claimContract(claim.pid, claim.contractId, claim.fieldIdx), 800);
              }
              return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 950, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
                <div style={{ ...card, maxWidth: 480, textAlign: "center", border: "2px solid #a855f7" }}>
                  <div style={{ fontSize: 11, color: "#c4b5fd", textTransform: "uppercase", letterSpacing: 1.2, fontWeight: 700, marginBottom: 4 }}>📜 Council Contract Satisfied</div>
                  <h2 style={{ color: "#e2e8f0", fontSize: 22, margin: "0 0 8px" }}>{claimerPlayer.festivalName}</h2>
                  <div style={{ padding: 12, borderRadius: 10, background: "rgba(168,85,247,0.10)", border: "1px solid rgba(168,85,247,0.35)", margin: "8px 0 12px" }}>
                    <div style={{ fontWeight: 800, fontSize: 18, color: "#a855f7", marginBottom: 6 }}>{council.name}</div>
                    <div style={{ fontSize: 12, color: "#c4b5fd", marginBottom: 4 }}>📋 {formatCouncilCondition(council)}</div>
                    <div style={{ fontSize: 12, color: "#86efac", fontWeight: 600, marginBottom: 6 }}>🎁 {formatCouncilReward(council)}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>Reward fires each year the condition remains met on Field {claim.fieldIdx + 1}.</div>
                  </div>
                  {isAI ? <div style={{ color: "#64748b", fontSize: 12, padding: 8 }}>⏳ AI deciding…</div> : <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                    <button onClick={() => claimContract(claim.pid, claim.contractId, claim.fieldIdx)} style={{ ...bp, padding: "10px 20px", background: "linear-gradient(135deg, rgba(168,85,247,0.25), rgba(124,58,237,0.15))", border: "2px solid #a855f7" }}>Claim it 📜</button>
                    <button onClick={declineContract} style={{ ...bs, padding: "10px 20px" }}>Skip</button>
                  </div>}
                </div>
              </div>;
            })()}

            {pendingAgentArtist && (() => {
              const pa = pendingAgentArtist;
              const pd = playerData[pa.pid];
              // v194: tempt-to-stage now requires genre-match (see canTemptDirectToStage).
              // The stage must already have 1-2 artists whose combined genres are a subset
              // of the tempted artist's genres. Empty stages don't qualify — you can't
              // "seed" a stage via tempt. If no stage matches, artist goes to hand.
              const allOpen = (pd?.stageArtists || []).map((sa, i) => sa.length < 3 ? i : -1).filter(i => i >= 0);
              const openStages = allOpen.filter(i => canTemptDirectToStage(pa.artist, pd || {}, i));
              const isTempt = temptMode;
              const playable = openStages.length > 0;
              const popTemptPlacement = () => {
                if (!isTempt) return;
                setTemptPlacements(prev => ({ ...prev, [pa.pid]: (prev[pa.pid] || []).filter(p => !(p.type === "pool" && p.artistName === pa.artist.name)) }));
              };
              // v197.20: unify hand-placement into a single callback. Always offered as
              // an option — even when a stage is a genre match, the player might prefer
              // to hold the artist for later (fame timing, better stage arrangement).
              // Previously "Add to Hand" only appeared when no stage was playable, forcing
              // an immediate stage decision the moment the tempt resolved.
              const goToHand = () => {
                setPlayerData(p => ({ ...p, [pa.pid]: { ...p[pa.pid], hand: [...p[pa.pid].hand, pa.artist] } }));
                const newPool = [...artistPool]; const idx = newPool.findIndex(a => a.name === pa.artist.name);
                if (idx >= 0) newPool.splice(idx, 1); setArtistPool(newPool);
                if (isTempt) { popTemptPlacement(); } else { exhaustAgent(pa.pid); }
                addLog(isTempt ? "💫 Tempt" : "🕵️ Agent", `Added ${pa.artist.name} to hand`);
                setPendingAgentArtist(null);
                if (isTempt) checkNextTempt(pa.pid);
              };
              return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 950, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ ...card, textAlign: "center", maxWidth: 400 }}>
                  <h3 style={{ color: isTempt ? "#fbbf24" : "#60a5fa", marginBottom: 12 }}>{isTempt ? "💫" : "🕵️"} {isTempt ? "Tempted" : "Agent Secured"} {pa.artist.name}!</h3>
                  <ArtistCard artist={pa.artist} showCost />
                  <p style={{ color: "#94a3b8", fontSize: 12, marginTop: 8, marginBottom: 12 }}>
                    {playable ? "Book onto a genre-match stage, or add to your hand:" : `No stage is a genre match — ${pa.artist.name} can go to your hand.`}
                  </p>
                  {playable && <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 10 }}>
                    {openStages.map(si => <button key={si} onClick={() => {
                      const newPool = [...artistPool]; const idx = newPool.findIndex(a => a.name === pa.artist.name);
                      if (idx >= 0) newPool.splice(idx, 1); setArtistPool(newPool);
                      const viaGenreMatch = canBookHeadlinerViaGenre(pa.artist, pd || {}, si);
                      bookArtistToStage(pa.artist, si, pa.pid, true, viaGenreMatch);
                      if (isTempt) { popTemptPlacement(); } else { exhaustAgent(pa.pid); }
                      addLog(isTempt ? "💫 Tempt" : "🕵️ Agent", `Booked ${pa.artist.name} (uncontested ${isTempt ? "tempt" : "agent"} claim, genre match${viaGenreMatch ? " — headliner bonus" : ""})`);
                      setPendingAgentArtist(null);
                      setTimeout(() => recalcTickets(), 50);
                      if (isTempt) checkNextTempt(pa.pid);
                    }} style={bp}>{(pd.stageNames || [])[si] || `Stage ${si + 1}`}</button>)}
                  </div>}
                  <button onClick={goToHand} style={{ ...bs, marginTop: playable ? 4 : 8 }}>Add to Hand</button>
                </div>
              </div>;
            })()}

            {/* Pending agent-amenity placement modal — surfaced when an agent-booked artist's
                effect grants the player a free amenity (FISHER, Beastie Boys, Lil Dicky).
                Player picks which field receives the amenity. AI auto-resolves, never shows. */}
            {pendingAgentAmenity.length > 0 && pendingAgentAmenity[0].pid === currentPlayerId && (() => {
              const pa = pendingAgentAmenity[0];
              const pd = playerData[pa.pid] || {};
              const fields = pd.fields || [];
              const stageNames = pd.stageNames || [];
              const placeAndPop = (fIdx) => {
                setPlayerData(p => ({ ...p, [pa.pid]: mutateAmenity(p[pa.pid], fIdx, pa.amenityType, +1) }));
                addLog("🕵️ Agent Effect", `${pa.artistName}: +1 ${AMENITY_LABELS[pa.amenityType]} → F${fIdx + 1}`);
                setPendingAgentAmenity(prev => prev.slice(1));
                setTimeout(() => recalcTickets(), 50);
              };
              return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 955, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
                <div style={{ ...card, textAlign: "center", maxWidth: 440, width: "100%", border: `2px solid ${AMENITY_COLORS[pa.amenityType]}80` }}>
                  <h3 style={{ color: AMENITY_COLORS[pa.amenityType], marginBottom: 6 }}>🕵️ Agent Bonus: +1 {AMENITY_ICONS[pa.amenityType]} {AMENITY_LABELS[pa.amenityType]}</h3>
                  <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 14 }}>From <strong style={{ color: "#e9d5ff" }}>{pa.artistName}</strong> — choose which field receives it.</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {fields.map((field, fi) => {
                      const counts = sumFields([field]);
                      const stageName = stageNames[fi] || `Stage ${fi + 1}`;
                      return <button key={fi} onClick={() => placeAndPop(fi)} style={{ ...bp, padding: "10px 14px", textAlign: "left", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 700 }}>Field {fi + 1} <span style={{ color: "#94a3b8", fontWeight: 500, fontSize: 11 }}>({stageName})</span></span>
                        <span style={{ fontSize: 11, color: "#94a3b8" }}>
                          ⛺{counts.campsite || 0} 🚽{counts.portaloo || 0} 👮‍♀️{counts.security || 0} 🍔{counts.catering || 0}
                        </span>
                      </button>;
                    })}
                  </div>
                  {pendingAgentAmenity.length > 1 && <div style={{ marginTop: 10, fontSize: 11, color: "#94a3b8", fontStyle: "italic" }}>{pendingAgentAmenity.length - 1} more agent bonus{pendingAgentAmenity.length > 2 ? "es" : ""} to place after this.</div>}
                </div>
              </div>;
            })()}

            {/* Agent contest resolution modal — shows the contest die roll, contestant
                breakdown, and the winner. For human-involved contests, the human clicks
                Continue. For AI-vs-AI, auto-dismisses after a short reveal. */}
            {agentContest && (() => {
              const ac = agentContest;
              const faceInfo = getContestFaceLabel(ac.rolledFace);
              const winner = ac.contestantData.find(c => c.isWinner);
              const tie = ac.contestantData.filter(c => c.value === winner.value).length > 1;
              const ticketTie = tie && ac.contestantData.filter(c => c.value === winner.value && c.tickets === winner.tickets).length > 1;
              const commitAndClose = () => {
                const currentPid = ac.contestantData?.find(c => c.pid === currentPlayerId)?.pid;
                commitAgentContest(ac);
                setAgentContest(null);
                setTimeout(() => recalcTickets(), 50);
                if (temptMode && currentPid != null) checkNextTempt(currentPid);
              };
              return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 960, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, animation: "fadeSlideIn 0.3s" }}>
                <div style={{ ...card, textAlign: "center", maxWidth: 560, width: "100%", border: "2px solid rgba(251,191,36,0.5)", boxShadow: "0 0 30px rgba(251,191,36,0.15)" }}>
                  <h2 style={{ color: "#fbbf24", fontSize: 22, marginBottom: 4 }}>🕵️ Agent Contest!</h2>
                  <p style={{ color: "#c4b5fd", fontSize: 12, marginBottom: 10 }}>Two or more agents converged on the same artist</p>
                  <div style={{ padding: "6px 10px", borderRadius: 8, background: "rgba(249,115,22,0.12)", border: "1px solid rgba(249,115,22,0.4)", marginBottom: 12, fontSize: 11, color: "#fbbf24", fontWeight: 600 }}>
                    🔥 Industry buzz: every contestant gains +1 Fame
                  </div>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                    <ArtistCard artist={ac.artist} showCost />
                  </div>
                  <div style={{ padding: 10, borderRadius: 10, background: `${faceInfo.color}18`, border: `2px solid ${faceInfo.color}80`, marginBottom: 12 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>Contest die rolled</div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: faceInfo.color }}>{faceInfo.icon} {faceInfo.label}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{faceInfo.statHint}</div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                    {ac.contestantData.map(c => <div key={c.pid} style={{ padding: 10, borderRadius: 10, background: c.isWinner ? "rgba(34,197,94,0.15)" : "rgba(107,114,128,0.1)", border: c.isWinner ? "2px solid #4ade80" : "1px solid rgba(107,114,128,0.3)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                      <div style={{ textAlign: "left", flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 700, color: c.isWinner ? "#4ade80" : "#c4b5fd" }}>{c.isWinner ? "🏆 " : ""}{c.festivalName}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>{faceInfo.label}: <strong style={{ color: "#fff" }}>{c.value}</strong> · 🎟️ Tickets: <strong style={{ color: "#fff" }}>{c.tickets}</strong></div>
                      </div>
                      <div style={{ fontSize: 11, color: "#f97316", fontWeight: 700, whiteSpace: "nowrap" }}>+1 🔥{c.isWinner ? " + 🎤" : ""}</div>
                    </div>)}
                  </div>
                  {tie && <div style={{ fontSize: 11, color: "#fbbf24", marginBottom: 10, fontStyle: "italic" }}>
                    {ticketTie ? `Tied on ${faceInfo.label} AND tickets — earliest agent placement wins` : `Tied on ${faceInfo.label} — highest tickets wins`}
                  </div>}
                  {!ac.isAuto && <button onClick={commitAndClose} style={{ ...bp, marginTop: 4 }}>Continue 🎶</button>}
                  {ac.isAuto && <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, fontStyle: "italic" }}>Resolving…</div>}
                </div>
              </div>;
            })()}

            {/* Agent indicators on pool artists */}

            {/* Artist Action */}
            {/* Unified Artist Action Panel */}
            {!actionTaken && turnAction === "artist" && (artistAction === null || artistAction === "bookHand" || artistAction === "draw2") && !selectedArtist && <div style={{ textAlign: "center" }}>
              <p style={{ color: "#ec4899", fontSize: 14, fontWeight: 600, marginBottom: 4 }}>🎤 Artist Action</p>
              <p style={{ color: "#94a3b8", fontSize: 11, marginBottom: 12 }}>Book from hand, take 1 from pool, or draw {getDeckDrawCount(currentPD)} from deck ({currentPD?.fame >= 4 ? "Fame 4-5" : "Fame 1-3"})</p>
              
              {/* Hand */}
              {handCards.length > 0 && <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#ec4899", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Your Hand — click to book</div>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                  {handCards.map((a, i) => {
                    // v124.1 hotfix: the actionable hand card needs to allow clicks when
                    // the artist is bookable via EITHER amenities OR the genre-match headliner
                    // rule. The earlier fix only touched the other hand display; this one was
                    // still gating on canAffordArtistOrFree alone, greying out any headliner
                    // whose amenity costs weren't fully met — even when a stage on the board
                    // had two matching-genre artists ready to accept them.
                    const canBook = canAffordArtistOrFree(a, currentPD) || canBookArtistAnywhere(a, currentPD);
                    return <ArtistCard key={i} artist={a} showCost small affordable={canBook} genreMatchGlow={hasGenreMatchBonusAvailable(a, currentPD)} disabled={!canBook} onClick={() => handleBookFromHand(i)} />;
                  })}
                </div>
              </div>}
              
              {/* Reveal strip — briefly shows what was drawn before finishDraw2 clears it */}
              {draw2Picks.length > 0 && <div style={{ marginBottom: 12, padding: 8, borderRadius: 10, background: "rgba(34,197,94,0.1)", border: "1px solid #22c55e40" }}>
                <div style={{ fontSize: 10, color: "#22c55e", fontWeight: 700 }}>Drew {draw2Picks.length} artist{draw2Picks.length === 1 ? "" : "s"}</div>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 4 }}>
                  {draw2Picks.map((a, i) => <ArtistCard key={i} artist={a} showCost small />)}
                </div>
              </div>}

              {/* Pool + Deck row — v196: pool = 1 card, deck = 2 or 3 based on Fame */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#22c55e", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Pool (1 card) or Deck ({getDeckDrawCount(currentPD)} cards)</div>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", alignItems: "flex-start" }}>
                  {artistPool.map((a, i) => {
                    const agentsOnIt = getPlacementsOnArtist(a.name).map(x => [x.pid, x.placement]);
                    const claimedByOther = isAgentClaimedByOther(a.name, currentPlayerId);
                    return <div key={i} style={{ position: "relative", opacity: claimedByOther ? 0.4 : 1, cursor: claimedByOther ? "not-allowed" : "pointer" }} title={claimedByOther ? "Claimed by another agent" : ""}>
                      <ArtistCard artist={a} showCost small onClick={() => { if (!claimedByOther && draw2Picks.length === 0) draw2PickFromPool(i); }} />
                      {agentsOnIt.length > 0 && <div style={{ position: "absolute", top: -4, right: -4, display: "flex", gap: 2 }}>
                        {agentsOnIt.map(([pid], ai) => {
                          const pColor = players.find(pl => pl.id === parseInt(pid))?.color || "#60a5fa";
                          return <div key={ai} style={{ background: pColor, borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, border: "2px solid #1e1b4b" }}>🕵️</div>;
                        })}
                      </div>}
                    </div>;
                  })}
                  <button onClick={() => { if (draw2Picks.length === 0) draw2PickFromDeck(); }} disabled={artistDeck.length === 0 || draw2Picks.length > 0} style={{ ...bs, fontSize: 24, padding: "16px 20px", minHeight: 80, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "rgba(124,58,237,0.1)", border: "1px dashed #7c3aed", color: "#c4b5fd", opacity: (artistDeck.length === 0 || draw2Picks.length > 0) ? 0.3 : 1 }}>
                    📦<span style={{ fontSize: 10 }}>Deck ({artistDeck.length}) → +{getDeckDrawCount(currentPD)}</span>
                  </button>
                </div>
              </div>
              
              {((currentPD.amenities?.portaloo) || 0) > 0 && draw2Picks.length === 0 && <button onClick={() => {
                setPlayerData(p => {
                  const cur = p[currentPlayerId];
                  const fields = cur.fields || emptyFields();
                  let bestIdx = 0, bestCount = fields[0]?.portaloo || 0;
                  for (let f = 1; f < fields.length; f++) {
                    const c = fields[f]?.portaloo || 0;
                    if (c > bestCount) { bestCount = c; bestIdx = f; }
                  }
                  const updated = bestCount > 0 ? mutateAmenity(cur, bestIdx, "portaloo", -1) : cur;
                  return { ...p, [currentPlayerId]: updated };
                });
                addLog(currentPlayer.festivalName, `Sacrificed 🚽 portaloo to refresh pool`);
                sfx.placeAmenity();
                refreshPool(1);
                trackGoalProgress(currentPlayerId, "portalooRefreshes");
                setTimeout(() => recalcTickets(), 50);
              }} style={{ ...bs, fontSize: 12, marginTop: 6, background: "rgba(96,165,250,0.15)", border: "1px solid #60a5fa", color: "#60a5fa" }}>🚽 Refresh Pool ({(currentPD.amenities?.portaloo) || 0} left)</button>}
              {(() => {
                // Count qualifying refreshPool councils — that's how many free refreshes
                // the player has this turn. Stacks naturally.
                const fields = currentPD?.fields || [];
                const refreshCap = (currentPD?.councils || []).reduce((acc, c, i) => acc + (c?.reward?.type === "refreshPool" && councilQualifies(c, fields[i], year || 1) ? 1 : 0), 0);
                const remaining = refreshCap - councilRefreshesUsedThisTurn;
                if (refreshCap <= 0 || remaining <= 0 || draw2Picks.length > 0) return null;
                return <button onClick={() => {
                  refreshPool(1);
                  setCouncilRefreshesUsedThisTurn(n => n + 1);
                  addLog(currentPlayer.festivalName, `🔄 Refreshed pool (Council reward — free, ${remaining - 1} left)`);
                  sfx.placeAmenity();
                }} style={{ ...bs, fontSize: 12, marginTop: 6, marginLeft: 6, background: "rgba(34,197,94,0.15)", border: "1px solid #22c55e", color: "#86efac" }}>📋 Refresh Pool (Council, free — {remaining} left)</button>;
              })()}
              {objectivesToggle}{popupObjectivesPanel}
              <div><button onClick={() => {
                draw2Picks.forEach(a => setArtistPool(prev => [...prev, a]));
                setDraw2Picks([]); setDraw2DeckCard(null); setTurnAction(null); setArtistAction(null);
              }} style={{ ...bs, marginTop: 8, fontSize: 12 }}>← Cancel</button></div>
            </div>}


            {!actionTaken && turnAction === "artist" && artistAction === "deckReveal" && <div style={{ textAlign: "center" }}>
              <p style={{ color: "#ec4899", fontSize: 13, marginBottom: 12 }}>You drew {Array.isArray(deckDrawnCard) ? deckDrawnCard.length : 1} card{Array.isArray(deckDrawnCard) && deckDrawnCard.length > 1 ? "s" : ""} from the deck!</p>
              {!deckCardRevealed ? (
                <div onClick={handleRevealDeckCard} style={{
                  width: 150, height: 190, borderRadius: 12, margin: "0 auto", cursor: "pointer",
                  background: "linear-gradient(135deg, #312e81, #1e1b4b)", border: "2px solid #7c3aed",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 4px 20px rgba(124,58,237,0.4)", transition: "transform 0.2s",
                }}>
                  <div style={{ fontSize: 40, marginBottom: 8 }}>🎴</div>
                  <p style={{ color: "#c4b5fd", fontSize: 13, fontWeight: 600 }}>Click to reveal!</p>
                </div>
              ) : (
                <div>
                  <p style={{ color: "#c4b5fd", fontSize: 12, marginBottom: 8 }}>Choose 1 to keep. The other will replace a pool artist.</p>
                  <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                    {(Array.isArray(deckDrawnCard) ? deckDrawnCard : [deckDrawnCard]).map((a, i) => <div key={i} style={{ cursor: "pointer" }} onClick={() => Array.isArray(deckDrawnCard) && deckDrawnCard.length > 1 ? handlePickDeckCard(i) : handlePickDeckCard(0)}>
                      <ArtistCard artist={a} showCost />
                      <button style={{ ...bp, marginTop: 4, width: "100%", fontSize: 11 }}>Keep {a.name}</button>
                    </div>)}
                  </div>
                </div>
              )}
              <button onClick={() => { if (deckDrawnCard) { const cards = Array.isArray(deckDrawnCard) ? deckDrawnCard : [deckDrawnCard]; setArtistDeck(prev => [...prev, ...cards]); } setArtistAction(null); setDeckDrawnCard(null); setDeckCardRevealed(false); }} style={{ ...bs, marginTop: 12, fontSize: 12 }}>← Cancel (put back)</button>
            </div>}

            {!actionTaken && turnAction === "artist" && artistAction === "deckSwapPool" && <div style={{ textAlign: "center" }}>
              <p style={{ color: "#fbbf24", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>Choose a pool artist to replace with {(Array.isArray(deckDrawnCard) ? deckDrawnCard[0] : deckDrawnCard)?.name}</p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 8 }}>
                <div style={{ padding: 8, borderRadius: 10, background: "rgba(251,191,36,0.1)", border: "1px solid #fbbf2440" }}>
                  <p style={{ fontSize: 10, color: "#fbbf24", marginBottom: 4 }}>Going to pool:</p>
                  <ArtistCard artist={Array.isArray(deckDrawnCard) ? deckDrawnCard[0] : deckDrawnCard} small />
                </div>
              </div>
              <p style={{ color: "#94a3b8", fontSize: 11, marginBottom: 8 }}>Click a pool artist to discard and swap (🕵️ = agent claimed, can't swap):</p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                {artistPool.map((a, i) => {
                  const hasAgentOn = getPlacementsOnArtist(a.name).length > 0;
                  return <div key={i} style={{ cursor: hasAgentOn ? "not-allowed" : "pointer", opacity: hasAgentOn ? 0.4 : 1, position: "relative" }} onClick={() => { if (!hasAgentOn) handleDeckSwapPool(i); }}>
                    <ArtistCard artist={a} small />
                    {hasAgentOn && <div style={{ position: "absolute", top: -4, right: -4, background: "#1d4ed8", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, border: "2px solid #60a5fa" }}>🕵️</div>}
                  </div>;
                })}
              </div>
            </div>}

            {!actionTaken && turnAction === "artist" && artistAction === "pickStage" && <div style={{ textAlign: "center" }}>
              <p style={{ color: "#fbbf24", fontSize: 14, fontWeight: 600 }}>Select a stage for {selectedArtist?.artist?.name} (click a stage on the right)</p>
              <button onClick={() => { setArtistAction(null); setSelectedArtist(null); }} style={{ ...bs, marginTop: 8, fontSize: 12 }}>← Cancel</button>
            </div>}

            {noTurnsLeft && <div style={{ textAlign: "center" }}>
              <p style={{ color: "#f87171", fontSize: 14, fontWeight: 600, marginBottom: 4 }}>⚠️ No turns remaining!</p>
              <button onClick={endTurn} style={{ ...bd, marginTop: 8 }}>End Turn →</button>
            </div>}
          </div>
        </div>
      </div>{anim}</div>);
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER: EVENTS (placeholder)
  // ═══════════════════════════════════════════════════════════
  // ═══════════════════════════════════════════════════════════
  // RENDER: SPECIAL GUEST PHASE
  // ═══════════════════════════════════════════════════════════
  if (phase === "specialGuest") {
    const sgPlayer = players[specialGuestPlayer];
    const sgPd = sgPlayer ? playerData[sgPlayer.id] : {};
    const sgArtist = specialGuestCard;
    const affordable = sgArtist ? canAffordSpecialGuest(sgArtist, sgPd) : false;

    // If no card drawn yet AND no picker pool, trigger setup for current player
    if (!sgArtist && sgPlayer && specialGuestDrawnPool.length === 0) {
      setTimeout(() => setupSpecialGuestForPlayer(specialGuestPlayer), 100);
    }

    return (
    <div style={CS}>{utilButtons}{showLog && <GameLog log={gameLog} onClose={() => setShowLog(false)} />}
      {floatingBonuses.map(fb => <div key={fb.id} style={{ position: "fixed", top: `calc(35% + ${fb.offset || 0}px)`, left: "50%", transform: "translateX(-50%)", zIndex: 999, pointerEvents: "none", animation: "floatUp 2.2s forwards" }}>
        <span style={{ fontSize: 28, fontWeight: 900, color: fb.color, textShadow: "0 2px 10px rgba(0,0,0,0.5)" }}>{fb.text}</span>
      </div>)}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24 }}>
        {/* Multi-draw picker (council bonus) — shown before regular SG flow */}
        {specialGuestDrawnPool.length > 0 && !sgArtist ? <div style={{ ...card, textAlign: "center", maxWidth: 720, width: "100%" }}>
          <h2 style={{ color: "#fbbf24", fontSize: 22, marginBottom: 4 }}>🌟 Special Guest — Year {year}</h2>
          <h3 style={{ color: "#c4b5fd", fontSize: 16, marginBottom: 8 }}>{sgPlayer?.festivalName}</h3>
          <p style={{ color: "#86efac", fontSize: 12, marginBottom: 4, fontWeight: 700 }}>📋 Council bonus: drew {specialGuestDrawnPool.length} options</p>
          <p style={{ color: "#94a3b8", fontSize: 11, marginBottom: 16 }}>Pick one to consider as your guest. The rest go to discard.</p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
            {specialGuestDrawnPool.map((a, i) => {
              const canAfford = sgPd ? canAffordSpecialGuest(a, sgPd) : false;
              return <div key={i} onClick={() => pickSpecialGuestFromPool(i)} style={{ cursor: "pointer", transition: "transform 0.15s", position: "relative", padding: 4, borderRadius: 10, border: canAfford ? "2px solid #4ade80" : "2px solid rgba(248,113,113,0.4)", background: canAfford ? "rgba(34,197,94,0.08)" : "rgba(248,113,113,0.05)" }} title={canAfford ? "You can afford this guest" : "You can't afford this guest's amenities"}>
                <ArtistCard artist={a} showCost />
                <div style={{ marginTop: 4, fontSize: 11, fontWeight: 700, color: canAfford ? "#4ade80" : "#f87171" }}>
                  {canAfford ? "✅ Can afford" : "❌ Can't afford"}
                </div>
              </div>;
            })}
          </div>
          <p style={{ color: "#94a3b8", fontSize: 10, fontStyle: "italic" }}>Affordability is checked against amenities only — fame doesn't matter for special guests.</p>
        </div> : sgArtist ? (() => {
          // v134: detect whether the current player has a free-special-guests council qualifying.
          // If so, the affordability copy shifts — guests are always free, but their effects
          // don't fire (unchanged behavior — placeSpecialGuest never routes through applyEffect).
          const y = year || 1;
          const councils = (sgPd?.councils) || [];
          const fields = (sgPd?.fields) || [];
          const hasFreeSG = councils.some((c, i) => c?.reward?.type === "freeSpecialGuests" && councilQualifies(c, fields[i], y));
          return <div style={{ ...card, textAlign: "center", maxWidth: 520, width: "100%" }}>
          <h2 style={{ color: "#fbbf24", fontSize: 24, marginBottom: 4 }}>🌟 Special Guest — Year {year}</h2>
          <h3 style={{ color: "#c4b5fd", fontSize: 18, marginBottom: 16 }}>{sgPlayer?.festivalName}</h3>
          <p style={{ color: "#8b5cf6", fontSize: 12, marginBottom: 12 }}>
            {hasFreeSG
              ? <>📋 <strong style={{ color: "#4ade80" }}>Council bonus:</strong> guest is FREE — no amenities required, but their effect won't fire. Ticket sales are still counted.</>
              : <>A special guest wants to headline! Fame level is ignored — you just need the amenities.</>}
          </p>
          <div style={{ display: "inline-block", marginBottom: 16 }}><ArtistCard artist={sgArtist} showCost /></div>
          {affordable ? <>
            <p style={{ color: "#4ade80", fontSize: 14, fontWeight: 600, marginBottom: 12 }}>{hasFreeSG ? "✅ Free to place!" : "✅ You can afford this guest!"}</p>
            <p style={{ color: "#c4b5fd", fontSize: 12, marginBottom: 8 }}>Choose a stage (must have exactly 2 artists):</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 16 }}>
              {specialGuestEligible.map(si => {
                const sName = (sgPd.stageNames || [])[si] || `Stage ${si + 1}`;
                const sColor = (sgPd.stageColors || [])[si] || "#7c3aed";
                const sa = (sgPd.stageArtists || [])[si] || [];
                return <button key={si} onClick={() => placeSpecialGuest(si)} style={{ padding: 12, borderRadius: 12, border: `2px solid ${sColor}`, background: `${sColor}20`, color: "#e2e8f0", cursor: "pointer", minWidth: 140, textAlign: "center" }}>
                  <div style={{ fontWeight: 700, color: sColor, fontSize: 13 }}>{sName}</div>
                  <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 4 }}>{sa.map(a => a.name).join(", ")}</div>
                </button>;
              })}
            </div>
          </> : <p style={{ color: "#f87171", fontSize: 14, fontWeight: 600, marginBottom: 16 }}>❌ You can't afford this guest's amenity requirements.</p>}
          <button onClick={declineSpecialGuest} style={{ ...bs, fontSize: 13 }}>{affordable ? "Decline Guest" : "Continue →"}</button>
        </div>;
        })() : <div style={{ ...card, textAlign: "center", maxWidth: 400 }}>
          <h2 style={{ color: "#fbbf24", fontSize: 24 }}>🌟 Special Guests</h2>
          <p style={{ color: "#8b5cf6", marginTop: 8 }}>Checking for eligible festivals...</p>
        </div>}
      </div>{anim}</div>
    );
  }

  if (phase === "yearEndEffects") {
    const yep = players[yearEndEffectsPlayer];
    const yepd = yep ? playerData[yep.id] : {};
    const effects = yearEndEffectsList[yep?.id] || [];
    const currentEffect = effects[yearEndEffectIdx];

    return (<div style={CS}>{utilButtons}{showLog && <GameLog log={gameLog} onClose={() => setShowLog(false)} />}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24 }}>
        <div style={{ ...card, textAlign: "center", maxWidth: 550, width: "100%" }}>
          <h2 style={{ color: "#fbbf24", fontSize: 24, marginBottom: 4 }}>🎸 Year-End Effects — Year {year}</h2>
          <h3 style={{ color: "#c4b5fd", fontSize: 18, marginBottom: 16 }}>{yep?.festivalName}</h3>
          
          {currentEffect && <div style={{ animation: "fadeSlideIn 0.3s" }}>
            <div style={{ display: "inline-block", marginBottom: 12 }}><ArtistCard artist={currentEffect.artist} showCost /></div>
            <p style={{ color: "#e9d5ff", fontSize: 14, fontWeight: 600, marginBottom: 4 }}>✨ {currentEffect.artist.effect}</p>
            <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 16 }}>{currentEffect.desc}</p>

            {/* Auto-resolve effects — just show result and continue button */}
            {(currentEffect.type === "autoVP" || currentEffect.type === "fameVP" || currentEffect.type === "autoVPTix") && <div>
              <div style={{ padding: 16, borderRadius: 12, background: "rgba(124,58,237,0.15)", marginBottom: 16 }}>
                {currentEffect.autoVP > 0 && <p style={{ color: "#4ade80", fontSize: 20, fontWeight: 900 }}>+{currentEffect.autoVP} 🎟️ tickets</p>}
                {currentEffect.autoVP < 0 && <p style={{ color: "#ef4444", fontSize: 20, fontWeight: 900 }}>{currentEffect.autoVP} 🎟️ tickets</p>}
                {currentEffect.autoTix > 0 && <p style={{ color: "#fbbf24", fontSize: 20, fontWeight: 900 }}>+{currentEffect.autoTix} 🎟️ Tickets</p>}
              </div>
              <button onClick={() => resolveYearEndEffect()} style={bp}>Continue →</button>
            </div>}

            {/* Dice roll effects — interactive */}
            {(currentEffect.type === "rollUnique" || currentEffect.type === "rollCommon") && !yearEndDiceRoll && <div>
              <button onClick={() => {
                const rollCount = 5;
                setYearEndDiceRoll({ count: rollCount, rolled: false, results: null });
              }} style={{ ...bp, fontSize: 18, padding: "14px 32px", animation: "pulse 1.5s infinite" }}>🎲 ROLL {5} DICE!</button>
            </div>}

            {yearEndDiceRoll && !yearEndDiceRoll.rolled && <div>
              <button onClick={() => {
                const results = shuffle([...DICE_OPTIONS, ...DICE_OPTIONS]).slice(0, yearEndDiceRoll.count);
                setYearEndDiceRoll({ ...yearEndDiceRoll, results, rolled: true });
                sfx.rollDice();
              }} style={{ ...bp, fontSize: 18, padding: "14px 32px", animation: "pulse 1.5s infinite" }}>🎲 ROLL!</button>
            </div>}

            {yearEndDiceRoll?.rolled && <div style={{ animation: "fadeSlideIn 0.3s" }}>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 16 }}>
                {yearEndDiceRoll.results.map((d, i) => <div key={i} style={{
                  width: 56, height: 56, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28,
                  background: d === "fame" ? "linear-gradient(135deg, #422006, #713f12)" : "linear-gradient(135deg, #1e1b4b, #312e81)",
                  border: d === "fame" ? "2px solid #fbbf24" : "2px solid #7c3aed",
                }}>{d === "fame" ? "🔥" : AMENITY_ICONS[d] || "?"}</div>)}
              </div>
              {(() => {
                let vpGain = 0;
                if (currentEffect.type === "rollUnique") {
                  vpGain = new Set(yearEndDiceRoll.results).size;
                } else {
                  const c = {}; yearEndDiceRoll.results.forEach(d => { c[d]=(c[d]||0)+1; }); vpGain = Math.max(...Object.values(c));
                }
                return <div style={{ padding: 16, borderRadius: 12, background: "rgba(124,58,237,0.15)", marginBottom: 16 }}>
                  <p style={{ color: "#4ade80", fontSize: 20, fontWeight: 900 }}>+{vpGain} 🎟️ tickets</p>
                  <p style={{ color: "#94a3b8", fontSize: 12 }}>{currentEffect.type === "rollUnique" ? `${vpGain} unique results` : `Best streak of ${vpGain}`}</p>
                </div>;
              })()}
              <button onClick={() => {
                let vpGain = 0;
                if (currentEffect.type === "rollUnique") vpGain = new Set(yearEndDiceRoll.results).size;
                else { const c = {}; yearEndDiceRoll.results.forEach(d => { c[d]=(c[d]||0)+1; }); vpGain = Math.max(...Object.values(c)); }
                resolveYearEndEffect({ vp: vpGain });
                setYearEndDiceRoll(null);
              }} style={bp}>Continue →</button>
            </div>}
          </div>}

          {!currentEffect && <div>
            <p style={{ color: "#64748b", fontSize: 14, marginBottom: 16 }}>No year-end effects for this player.</p>
            <button onClick={() => advanceYearEndEffect()} style={bp}>Continue →</button>
          </div>}

          <p style={{ color: "#64748b", fontSize: 10, marginTop: 16 }}>Effect {yearEndEffectIdx + 1}/{effects.length} • Player {yearEndEffectsPlayer + 1}/{players.length}</p>
        </div>
      </div>{anim}</div>);
  }

  if (phase === "starDice") {
    const rollPlayer = players[starRollPlayer];
    const rollPid = rollPlayer?.id;
    const rollPd = rollPid !== undefined ? playerData[rollPid] : null;
    const isAI = rollPlayer?.isAI;

    // INTRO: announce roll for this player
    if (starRollPhase === "intro" && rollPlayer) {
      return (
      <div style={CS}>{utilButtons}{showLog && <GameLog log={gameLog} onClose={() => setShowLog(false)} />}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24 }}>
          <div style={{ ...card, textAlign: "center", maxWidth: 600, width: "100%" }}>
            <div style={{ fontSize: 50, marginBottom: 8 }}>🎲</div>
            <h2 style={{ color: "#fbbf24", fontSize: 24, marginBottom: 4 }}>Star Dice — Year {year}</h2>
            <h3 style={{ color: "#c4b5fd", fontSize: 18, marginBottom: 12 }}>{rollPlayer.festivalName}</h3>
            <p style={{ color: "#94a3b8", fontSize: 13, marginBottom: 16 }}>You have <strong style={{ color: "#fbbf24" }}>{rollPd?.heldDice || 0} Star Dice</strong> to roll.</p>
            <div style={{ padding: 12, borderRadius: 10, background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", marginBottom: 16, fontSize: 11, color: "#c4b5fd" }}>
              ⭐ Star face = +VP &nbsp; • &nbsp; ⬜ Blank = nothing &nbsp; • &nbsp; 🎪 Amenity face = lose 1 of that amenity (security can absorb non-security)
            </div>
            {!isAI && <button onClick={() => performStarRoll(rollPid)} disabled={(rollPd?.heldDice || 0) === 0} style={{ ...bp, fontSize: 16, padding: "12px 32px", opacity: (rollPd?.heldDice || 0) === 0 ? 0.5 : 1 }}>{(rollPd?.heldDice || 0) === 0 ? "Skip (no dice)" : "Roll the dice! 🎲"}</button>}
            {!isAI && (rollPd?.heldDice || 0) === 0 && <button onClick={() => {
              const empty = { pid: rollPid, faces: [], stars: 0, amenityFaces: [], resolvable: [], ignored: 0, decisions: [] };
              applyStarRoll(empty);
            }} style={{ ...bs, marginLeft: 8 }}>Continue →</button>}
          </div>
        </div>{anim}</div>
      );
    }

    // ROLLING: animation phase
    if (starRollPhase === "rolling") {
      return (
      <div style={CS}>{utilButtons}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24 }}>
          <div style={{ ...card, textAlign: "center", maxWidth: 600 }}>
            <div style={{ fontSize: 60, marginBottom: 12, animation: "spin 0.4s linear infinite" }}>🎲</div>
            <p style={{ color: "#fbbf24", fontSize: 16, fontWeight: 700 }}>Rolling {starRollResult?.faces?.length || 0} dice...</p>
          </div>
        </div>{anim}</div>
      );
    }

    // RESOLVING: show result + take amenity face decisions
    if (starRollPhase === "resolving" && starRollResult) {
      const r = starRollResult;
      const pd = playerData[r.pid] || {};
      const secAvail = (pd.amenities?.security) || 0;
      const usedShields = r.decisions.filter(d => d.decision === "absorb").length;
      const remainingShields = secAvail - usedShields;
      const allDecided = r.decisions.every(d => d.decision === 'absorb' || (d.decision === 'lose' && d.lostFromField != null));
      const vpFromStars = starVP(r.stars);

      // (AI auto-resolve handled by useEffect to avoid render-side-effect double-firing)

      // Render face icon
      const faceIcon = (f) => {
        if (f === "star") return <span style={{ fontSize: 22, color: "#fbbf24" }}>⭐</span>;
        if (f === "blank") return <span style={{ fontSize: 22, color: "#475569" }}>⬜</span>;
        return <span style={{ fontSize: 22 }}>{AMENITY_ICONS[f]}</span>;
      };

      return (
      <div style={CS}>{utilButtons}{showLog && <GameLog log={gameLog} onClose={() => setShowLog(false)} />}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24 }}>
          <div style={{ ...card, textAlign: "center", maxWidth: 640, width: "100%" }}>
            <h2 style={{ color: "#fbbf24", fontSize: 22, marginBottom: 4 }}>{rollPlayer?.festivalName} rolled!</h2>
            {/* All faces */}
            <div style={{ display: "flex", gap: 6, justifyContent: "center", flexWrap: "wrap", padding: 14, borderRadius: 12, background: "rgba(0,0,0,0.3)", border: "1px solid #2a2a4a", marginBottom: 14 }}>
              {r.faces.map((f, i) => <div key={i} style={{ width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8, background: "#1a1a2e", border: "1px solid #2a2a4a" }}>{faceIcon(f)}</div>)}
            </div>
            <div style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 14, fontSize: 14 }}>
              <span style={{ color: "#fbbf24" }}>⭐ {r.stars} stars → <strong>+{vpFromStars} tickets</strong></span>
              {r.stars >= 5 && <span style={{ color: "#22c55e", fontWeight: 700 }}>🎉 MAX!</span>}
            </div>

            {/* Amenity face decisions */}
            {r.decisions.length > 0 && <div style={{ padding: 12, borderRadius: 10, background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.25)", marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: "#fca5a5", fontWeight: 700, marginBottom: 8 }}>Amenity faces — choose for each:</div>
              <div style={{ fontSize: 11, color: "#94a3b8", marginBottom: 10 }}>You have {secAvail} 👮‍♀️ shield{secAvail !== 1 ? "s" : ""} available — {remainingShields} remaining.</div>
              {r.decisions.map((d, i) => {
                const isSec = d.amenity === "security";
                const fields = pd.fields || emptyFields();
                const needsField = d.decision === "lose" && d.lostFromField == null;
                return <div key={i} style={{ display: "flex", flexDirection: "column", gap: 6, padding: 8, borderRadius: 8, background: "rgba(0,0,0,0.25)", marginBottom: 4 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                      <span style={{ fontSize: 18 }}>{AMENITY_ICONS[d.amenity]}</span>
                      <span style={{ color: "#e9d5ff" }}>{AMENITY_LABELS[d.amenity]}</span>
                      {d.decision === "lose" && d.lostFromField != null && <span style={{ fontSize: 10, color: "#fca5a5" }}>→ Field {d.lostFromField + 1}</span>}
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      {!isSec && <button onClick={() => {
                        const newDecisions = [...r.decisions];
                        newDecisions[i] = { ...d, decision: "absorb", lostFromField: null };
                        setStarRollResult({ ...r, decisions: newDecisions });
                      }} disabled={d.decision !== "absorb" && remainingShields <= 0} style={{ ...bs, fontSize: 11, padding: "4px 10px", background: d.decision === "absorb" ? "#22c55e30" : undefined, border: d.decision === "absorb" ? "1px solid #22c55e" : undefined, opacity: (d.decision !== "absorb" && remainingShields <= 0) ? 0.4 : 1 }}>🛡️ Absorb</button>}
                      <button onClick={() => {
                        const newDecisions = [...r.decisions];
                        newDecisions[i] = { ...d, decision: "lose", lostFromField: null };
                        setStarRollResult({ ...r, decisions: newDecisions });
                      }} style={{ ...bs, fontSize: 11, padding: "4px 10px", background: d.decision === "lose" ? "#ef444430" : undefined, border: d.decision === "lose" ? "1px solid #ef4444" : undefined }}>💔 Lose 1</button>
                    </div>
                  </div>
                  {needsField && <div style={{ display: "flex", alignItems: "center", gap: 6, paddingLeft: 30 }}>
                    <span style={{ fontSize: 10, color: "#fbbf24" }}>From which field?</span>
                    {fields.map((f, fIdx) => {
                      const c = f?.[d.amenity] || 0;
                      const enabled = c > 0;
                      return <button key={fIdx} onClick={() => {
                        if (!enabled) return;
                        const newDecisions = [...r.decisions];
                        newDecisions[i] = { ...d, decision: "lose", lostFromField: fIdx };
                        setStarRollResult({ ...r, decisions: newDecisions });
                      }} disabled={!enabled} style={{ ...bs, fontSize: 10, padding: "3px 8px", opacity: enabled ? 1 : 0.3, cursor: enabled ? "pointer" : "not-allowed" }}>F{fIdx + 1} ({c})</button>;
                    })}
                  </div>}
                </div>;
              })}
            </div>}

            {r.ignored > 0 && <p style={{ color: "#64748b", fontSize: 11, marginBottom: 10 }}>{r.ignored} amenity face{r.ignored > 1 ? "s" : ""} ignored — you have none of those.</p>}

            {!isAI && <button onClick={() => applyStarRoll()} disabled={!allDecided} style={{ ...bp, opacity: allDecided ? 1 : 0.4 }}>{starRollPlayer < players.length - 1 ? "Confirm & Next Player →" : "Confirm & Go to Scoring →"}</button>}
          </div>
        </div>{anim}</div>
      );
    }

    return null;
  }


  // ═══════════════════════════════════════════════════════════
  // RENDER: ROUND END
  // ═══════════════════════════════════════════════════════════
  if (phase === "roundEnd") return (
    <div style={CS}>{utilButtons}{showLog && <GameLog log={gameLog} onClose={() => setShowLog(false)} />}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24 }}>
        <div style={{ ...card, maxWidth: 650, width: "100%", textAlign: "center" }}>
          <h2 style={{ color: "#fbbf24", fontSize: 28, marginBottom: 4 }}>🎉 Year {year} Complete!</h2>
          <p style={{ color: "#8b5cf6", marginBottom: 20, fontSize: 14 }}>Results revealed lowest → highest tickets sold</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
            {sortedPlayersForReveal.map((p, idx) => {
              const rev = idx <= revealIndex;
              const td = allTickets[p.id]?.[year] || {};
              const preTickets = td.preYearVP || 0; // legacy field name; now holds pre-year tickets
              const pd = playerData[p.id] || {};
              return <div key={p.id} style={{ padding: 14, borderRadius: 12, background: rev ? "rgba(124,58,237,0.12)" : "rgba(15,14,26,0.4)", border: rev ? "1px solid #7c3aed" : "1px solid #2a2a4a", opacity: rev ? 1 : 0.25, transition: "all 0.5s", textAlign: "left" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: rev ? 10 : 0 }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: rev ? "#e9d5ff" : "#4a4568" }}>{rev ? p.festivalName : "???"}{p.isAI ? " 🤖" : ""}</span>
                  <span style={{ fontWeight: 800, fontSize: 18, color: rev ? "#60a5fa" : "#4a4568" }}>{rev ? `🎟️ ${pd.tickets || 0}` : "?"}</span>
                </div>
                {rev && <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, color: "#94a3b8", fontSize: 12 }}>
                    🔥 Fame {td.fame || 0} • 📢 {pd.microtrendsCompletedCount || 0} microtrends completed
                  </div>
                </div>}
              </div>;
            })}
          </div>
          {!leaderboardRevealed ? <button onClick={revealNext} style={bp}>{revealIndex < players.length - 1 ? "Reveal Next 🥁" : "Reveal All! 🎉"}</button> : <button onClick={proceedFromRoundEnd} style={bp}>{year >= totalYears ? "See Final Results 🏆" : "Continue →"}</button>}
        </div>
      </div>{anim}</div>
  );

  // ═══════════════════════════════════════════════════════════
  // RENDER: BETWEEN-YEAR DRAFT (v197.9)
  // ═══════════════════════════════════════════════════════════
  if (phase === "draft") {
    const currentPickerPid = draftOrder[draftIndex];
    const currentPicker = players.find(p => p.id === currentPickerPid);
    const isAIPicker = currentPicker?.isAI;
    const isMyTurn = currentPickerPid === currentPlayerId || (!isAIPicker && currentPicker); // human picks route through their own click
    // For a stacked-vertical roster showing pick order + who's picked.
    const roster = draftOrder.map((pid, idx) => {
      const p = players.find(pl => pl.id === pid);
      const pd = playerData[pid] || {};
      const picked = idx < draftIndex;
      const active = idx === draftIndex;
      return { pid, name: p?.festivalName || "?", isAI: p?.isAI, fame: pd.fame || 0, tickets: pd.tickets || 0, picked, active, order: idx + 1 };
    });
    return (<div style={CS}>{utilButtons}{showLog && <GameLog log={gameLog} onClose={() => setShowLog(false)} />}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24, gap: 20 }}>
        <div style={{ ...card, textAlign: "center", maxWidth: 900, width: "100%" }}>
          <h2 style={{ color: "#a855f7", fontSize: 26, marginBottom: 4 }}>🎴 Between-Year Draft</h2>
          <p style={{ color: "#c4b5fd", fontSize: 13, marginBottom: 16 }}>Each player picks one artist in order of end-of-year Fame (ties broken by tickets sold). The new year begins after everyone picks.</p>
          {/* Pick-order roster */}
          <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", marginBottom: 18 }}>
            {roster.map(r => (
              <div key={r.pid} style={{
                padding: "6px 12px", borderRadius: 8,
                background: r.active ? "rgba(168,85,247,0.25)" : r.picked ? "rgba(74,222,128,0.15)" : "rgba(30,41,59,0.6)",
                border: r.active ? "2px solid #a855f7" : r.picked ? "1px solid #4ade80" : "1px solid #334155",
                fontSize: 12, color: r.active ? "#e9d5ff" : r.picked ? "#86efac" : "#94a3b8",
                fontWeight: r.active ? 700 : 500,
                minWidth: 130,
              }}>
                <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, marginBottom: 2 }}>#{r.order} {r.active ? "· picking" : r.picked ? "· done" : "· waiting"}</div>
                <div>{r.name}{r.isAI ? " 🤖" : ""}</div>
                <div style={{ fontSize: 10, opacity: 0.7 }}>🔥{r.fame} · 🎟️{r.tickets}</div>
              </div>
            ))}
          </div>
          {/* Current picker prompt */}
          {currentPicker && draftCards.length > 0 && <div style={{ padding: "12px 16px", borderRadius: 10, background: "rgba(168,85,247,0.1)", border: "1px solid #a855f740", marginBottom: 16 }}>
            <p style={{ color: "#a855f7", fontSize: 15, fontWeight: 700, margin: 0 }}>
              {isAIPicker ? `${currentPicker.festivalName} is picking…` : `${currentPicker.festivalName} — pick one artist`}
            </p>
          </div>}
          {/* Draft card grid */}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            {draftCards.map((a, i) => (
              <div key={`${a.name}-${i}`} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                <ArtistCard
                  artist={a}
                  showCost
                  onClick={!isAIPicker ? () => pickDraftCard(currentPickerPid, i) : undefined}
                />
                {!isAIPicker && <div style={{ fontSize: 10, color: "#a855f7", fontWeight: 700 }}>Click to draft</div>}
              </div>
            ))}
          </div>
        </div>
      </div>{anim}</div>);
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER: PRE-ROUND
  // ═══════════════════════════════════════════════════════════
  if (phase === "preRound") {
    const prp = currentPreRoundPlayer; const prpd = prp ? playerData[prp.id] : {};
    const stageCount = (prpd.stages || []).length;
    const freeCount = getPreRoundDrawCount(prpd);
    return (<div style={CS}>{utilButtons}{showLog && <GameLog log={gameLog} onClose={() => setShowLog(false)} />}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24 }}>
        {preRoundStep === "notify" && prp && <div style={{ ...card, textAlign: "center", maxWidth: 480 }}>
          <h2 style={{ color: "#fbbf24", fontSize: 24, marginBottom: 8 }}>🎪 {prp.festivalName} — Between Years</h2>
          <p style={{ color: "#c4b5fd", fontSize: 14, marginBottom: 4 }}>Fame: {prpd.fame || 0} | Stages: {stageCount}</p>
          {canOpenStage && <div style={{ padding: 12, borderRadius: 10, background: "rgba(251,191,36,0.1)", border: "1px solid #fbbf2440", marginBottom: 12 }}>
            <p style={{ color: "#fbbf24", fontSize: 14, fontWeight: 700, margin: "0 0 4px" }}>🔥 Fame 3+ — You can open a new stage!</p>
            <p style={{ color: "#94a3b8", fontSize: 11 }}>Opening a stage gives +1 Fame and more artist slots.</p>
          </div>}
          {(() => {
            // Always-visible status of any qualifying-and-unused freeStageOpenOnce charges.
            // Surfaces the charge's existence even when the player can open via Fame, so
            // they know it's sitting in their pocket for future years. Without this, a
            // player who hits Fame 3 early never sees the charge UI and forgets they have it.
            const fields = prpd.fields || [];
            const consumed = prpd.freeStageOpensUsed || [];
            const stageRoom = (prpd.stages || []).length < 3;
            const unusedCharges = (prpd.councils || []).filter((c, i) => c?.reward?.type === "freeStageOpenOnce" && councilQualifies(c, fields[i], year || 1) && !consumed.includes(c.id));
            if (unusedCharges.length === 0) return null;
            // Three states: (a) can-open-via-fame → preserved, (b) can't open via fame but
            // stage room → actionable, (c) no stage room → just informational ("saved for later").
            if (canOpenStage) {
              return <div style={{ padding: 10, borderRadius: 10, background: "rgba(34,197,94,0.06)", border: "1px solid #22c55e30", marginBottom: 12 }}>
                <p style={{ color: "#86efac", fontSize: 12, fontWeight: 700, margin: "0 0 4px" }}>📋 {unusedCharges.length} free stage charge{unusedCharges.length > 1 ? "s" : ""} — preserved for future years</p>
                <p style={{ color: "#94a3b8", fontSize: 11, margin: 0 }}>You'll open via Fame this year. Your {unusedCharges.map(c => c.name).join(", ")} charge{unusedCharges.length > 1 ? "s stay" : " stays"} ready for any year you can't reach Fame 3.</p>
              </div>;
            }
            if (!stageRoom) {
              return <div style={{ padding: 10, borderRadius: 10, background: "rgba(34,197,94,0.06)", border: "1px solid #22c55e30", marginBottom: 12 }}>
                <p style={{ color: "#86efac", fontSize: 12, fontWeight: 700, margin: "0 0 4px" }}>📋 {unusedCharges.length} free stage charge{unusedCharges.length > 1 ? "s" : ""} — saved (no stage room this year)</p>
                <p style={{ color: "#94a3b8", fontSize: 11, margin: 0 }}>You've already opened 3 stages. Charges from {unusedCharges.map(c => c.name).join(", ")} stay until a future year where you have room.</p>
              </div>;
            }
            // Actionable state: can't open via fame, but charges are available and there's stage room.
            return <div style={{ padding: 12, borderRadius: 10, background: "rgba(34,197,94,0.1)", border: "1px solid #22c55e40", marginBottom: 12 }}>
              <p style={{ color: "#4ade80", fontSize: 14, fontWeight: 700, margin: "0 0 6px" }}>📋 Free Stage Charge Available</p>
              <p style={{ color: "#94a3b8", fontSize: 11, marginBottom: 8 }}>One of your councils lets you open a stage regardless of Fame. Single-use per game.</p>
              {unusedCharges.map(c => <button key={c.id} onClick={() => {
                setPlayerData(prev => ({ ...prev, [prp.id]: { ...prev[prp.id], freeStageOpensUsed: [...(prev[prp.id]?.freeStageOpensUsed || []), c.id] } }));
                addLog(prp.festivalName, `📋 Opened a free stage (Council reward: ${c.name})`);
                showFloatingBonus(`📋 ${c.name} charge spent!`, "#86efac");
                acceptNewStage();
              }} style={{ ...bs, fontSize: 12, padding: "8px 14px", marginRight: 6, background: "rgba(34,197,94,0.15)", border: "1px solid #22c55e", color: "#86efac" }}>🎤 Open Stage — Free ({c.name})</button>)}
            </div>;
          })()}
          {freeCount > 0 && <div style={{ padding: 12, borderRadius: 10, background: "rgba(34,197,94,0.1)", border: "1px solid #22c55e40", marginBottom: 12 }}>
            <p style={{ color: "#4ade80", fontSize: 14, fontWeight: 700, margin: "0 0 4px" }}>🎤 Draw {freeCount} free artist{freeCount > 1 ? "s" : ""}!</p>
            <p style={{ color: "#94a3b8", fontSize: 11 }}>1 free draw per stage ({stageCount} stage{stageCount > 1 ? "s" : ""}) — pick from pool or deck</p>
          </div>}
          {!canOpenStage && freeCount === 0 && <p style={{ color: "#64748b", fontSize: 12, marginBottom: 12 }}>No stage to open and no free draws this round.</p>}
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            {canOpenStage && <button onClick={acceptNewStage} style={bp}>Open New Stage 🎤</button>}
            {canOpenStage && <button onClick={declineNewStage} style={bs}>Decline Stage</button>}
            {!canOpenStage && <button onClick={() => startPreRoundDraws()} style={bp}>{freeCount > 0 ? "Draw Free Artists →" : "Continue →"}</button>}
          </div>
        </div>}
        {/* Pre-round stage placement is now non-spatial: handled by acceptNewStage which auto-advances */}
        {preRoundStep === "preRoundDrawChoose" && prp && <div style={{ ...card, textAlign: "center", maxWidth: 440 }}>
          <h3 style={{ color: "#4ade80", marginBottom: 8 }}>🎤 Free Artist Draw ({freeAmenityPlaced + 1}/{freeAmenityCount})</h3>
          <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 16 }}>Draw 1 artist per stage you own. Pick from the pool or draw from the deck:</p>
          {artistPool.length > 0 && <div style={{ marginBottom: 12 }}>
            <p style={{ color: "#c4b5fd", fontSize: 11, marginBottom: 8 }}>Pick from Pool:</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
              {artistPool.map((a, i) => {
                const claimedByOther = isAgentClaimedByOther(a.name, prp.id);
                return <div key={i} style={{ position: "relative", opacity: claimedByOther ? 0.4 : 1, cursor: claimedByOther ? "not-allowed" : "pointer" }} title={claimedByOther ? "Claimed by another agent" : ""}>
                  <ArtistCard artist={a} showCost small onClick={() => {
                    if (claimedByOther) return;
                    setFreeAmenityPlaced(prev => {
                      if (prev >= freeAmenityCount) return prev; // already done
                      const newPool = [...artistPool]; newPool.splice(i, 1); setArtistPool(newPool);
                      setPlayerData(p => ({ ...p, [prp.id]: { ...p[prp.id], hand: [...(p[prp.id].hand || []), a] } }));
                      addLog(prp.festivalName, `drew ${a.name} from pool (free draw)`);
                      const newPlaced = prev + 1;
                      if (newPlaced < freeAmenityCount) setTimeout(() => setPreRoundStep("preRoundDrawChoose"), 50);
                      else setTimeout(() => nextPreRound(), 50);
                      return newPlaced;
                    });
                  }} />
                  {claimedByOther && <div style={{ position: "absolute", top: -4, right: -4, background: "#1d4ed8", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, border: "2px solid #60a5fa" }}>🕵️</div>}
                </div>;
              })}
            </div>
          </div>}
          <button onClick={() => {
            setFreeAmenityPlaced(prev => {
              if (prev >= freeAmenityCount) return prev; // already done
              const drawn = drawFromDeck(1);
              if (drawn.length > 0) {
                setPlayerData(p => ({ ...p, [prp.id]: { ...p[prp.id], hand: [...(p[prp.id].hand || []), drawn[0]] } }));
                addLog(prp.festivalName, `drew ${drawn[0].name} from deck (free draw)`);
              }
              const newPlaced = prev + 1;
              if (newPlaced < freeAmenityCount) setTimeout(() => setPreRoundStep("preRoundDrawChoose"), 50);
              else setTimeout(() => nextPreRound(), 50);
              return newPlaced;
            });
          }} style={{ ...bp, fontSize: 14 }}>📦 Draw from Deck</button>
        </div>}
      </div>{anim}</div>);
  }

  // ═══════════════════════════════════════════════════════════
  // RENDER: GAME OVER
  // ═══════════════════════════════════════════════════════════
  // v190: game data table — replaces the old CSV export with the format River
  // requested. Structure: win condition, per-player year-by-year breakdown
  // (tickets/fame/microtrends/stages/tempts/artist tickets/artist names/identity/
  // genres played), then a global genre-averages block (mean/median/mode of tickets
  // per genre across all players, sorted highest first).
  const exportGameData = () => {
    const rows = [];
    const totalYearsPlayed = totalYears || 3;
    const yearRange = Array.from({ length: totalYearsPlayed }, (_, i) => i + 1);

    // ── HEADER: win condition ──
    const winConditionLabel = ({
      following: "Following (cumulative tickets)",
      consistency: "Consistency (most year-leads)",
      "talk-of-town": "Talk of the Town (highest single-year peak)",
    }[winCondition] || winCondition || "N/A");
    rows.push(["HEADLINERS — Game Data Table"]);
    rows.push([`Date: ${new Date().toISOString().slice(0, 10)}`]);
    rows.push([`Win Condition: ${winConditionLabel}`]);
    rows.push([]);

    // ── Determine placement order per win condition ──
    // Reuse the same logic the game-over screen uses.
    const perPlayer = players.map(p => {
      const byYear = allTickets[p.id] || {};
      const yearTickets = yearRange.map(y => byYear[y]?.raw || 0);
      const total = yearTickets.reduce((s, t) => s + t, 0);
      const peak = Math.max(...yearTickets, 0);
      return { player: p, total, peak, yearTickets, byYear };
    });
    // years-led per player (for Consistency)
    const yearsLed = {}; players.forEach(p => { yearsLed[p.id] = 0; });
    yearRange.forEach(y => {
      let best = -1; let leaders = [];
      players.forEach(p => {
        const t = allTickets[p.id]?.[y]?.raw || 0;
        if (t > best) { best = t; leaders = [p.id]; }
        else if (t === best && t > 0) leaders.push(p.id);
      });
      if (leaders.length === 1 && best > 0) yearsLed[leaders[0]] += 1;
    });
    let ordered;
    if (winCondition === "consistency") {
      ordered = [...perPlayer].sort((a, b) => (yearsLed[b.player.id] - yearsLed[a.player.id]) || (b.total - a.total));
    } else if (winCondition === "talk-of-town") {
      ordered = [...perPlayer].sort((a, b) => (b.peak - a.peak) || (b.total - a.total));
    } else {
      ordered = [...perPlayer].sort((a, b) => b.total - a.total);
    }
    const placeOrdinal = (i) => ["1st", "2nd", "3rd", "4th", "5th"][i] || `${i + 1}th`;

    // ── Per-player block ──
    ordered.forEach((entry, placeIdx) => {
      const p = entry.player;
      const pid = p.id;
      const pd = playerData[pid] || {};
      const yStats = yearlyStats[pid] || {};

      rows.push([`═══════ ${p.festivalName}${p.isAI ? " (AI)" : ""} — ${placeOrdinal(placeIdx).toUpperCase()} PLACE ═══════`]);

      // Year headers
      const yearHeader = ["Metric", ...yearRange.map(y => `Year ${y}`)];
      rows.push(yearHeader);

      // Tickets per year
      rows.push(["Tickets", ...yearRange.map(y => allTickets[pid]?.[y]?.raw || 0)]);
      // Fame per year (end-of-year fame from snapshot)
      rows.push(["Fame (year-end)", ...yearRange.map(y => allTickets[pid]?.[y]?.fame ?? "")]);
      // Microtrends per year
      rows.push(["Microtrends claimed", ...yearRange.map(y => (yStats[y]?.microtrends) || 0)]);
      // Stage quantity per year
      rows.push(["Stage count", ...yearRange.map(y => {
        // Fall back to current stage count for the final year if snapshot missed
        return (yStats[y]?.stageCount) ?? (y === yearRange[yearRange.length - 1] ? (pd.stages || []).length : "");
      })]);
      // Tempts successful / total per year
      // v196.2: format as "N of M" instead of "N / M" — Excel was interpreting
      // "2 / 3" as "2 March" (date auto-parse) when opening the CSV.
      rows.push(["Tempts won / placed", ...yearRange.map(y => {
        const won = (yStats[y]?.temptsWon) || 0;
        const placed = (yStats[y]?.temptsPlaced) || 0;
        return `${won} of ${placed}`;
      })]);
      // Tickets from artists per year — base (from artist tickets+vp) and effect tickets separately.
      // "Tickets from artists" = sum of a.tickets + a.vp for each artist on stage that year.
      // "Effect tickets" = pd.bonusTickets snapshot at year end.
      rows.push(["Tickets from artists (effect tickets)", ...yearRange.map(y => {
        const arts = yStats[y]?.artistsOnStages || [];
        const artistBase = arts.reduce((s, a) => s + (a.tickets || 0) + (a.vp || 0), 0);
        const effectTickets = yStats[y]?.ticketsFromArtists || 0;
        return `${artistBase} (${effectTickets})`;
      })]);
      // Artist names on stage per year
      yearRange.forEach(y => {
        const arts = yStats[y]?.artistsOnStages || [];
        // Final year isn't snapshotted (game ends before endTurn's year snapshot on the final year end)
        // — fall back to current stageArtists on the final year if empty
        let names;
        if (arts.length > 0) names = arts.map(a => a.name);
        else if (y === yearRange[yearRange.length - 1]) {
          names = (pd.stageArtists || []).flat().map(a => a.name);
        } else names = [];
        rows.push([`Year ${y} Artists on Stage`, names.length > 0 ? names.join(", ") : "(none)"]);
      });

      // Identity + total gain/loss
      const idId = playerIdentities[pid];
      const identityName = idId ? (ALL_IDENTITIES.find(i => i.id === idId)?.name || idId) : "None";
      const iLog = identityLog[pid] || [];
      const totalGain = iLog.filter(e => e.amount > 0).reduce((s, e) => s + e.amount, 0);
      const totalLoss = iLog.filter(e => e.amount < 0).reduce((s, e) => s + Math.abs(e.amount), 0);
      rows.push(["Identity", `${identityName} — total gain ${totalGain} (total loss ${totalLoss})`]);

      // Genres played breakdown (whole game, aggregated from year-end snapshots + final-year fallback)
      const genreCounts = { Pop: { count: 0, tickets: 0 }, Rock: { count: 0, tickets: 0 }, "Hip Hop": { count: 0, tickets: 0 }, Electronic: { count: 0, tickets: 0 }, Indie: { count: 0, tickets: 0 }, Funk: { count: 0, tickets: 0 } };
      yearRange.forEach(y => {
        let arts = yStats[y]?.artistsOnStages;
        if ((!arts || arts.length === 0) && y === yearRange[yearRange.length - 1]) {
          // Final-year fallback: read current stageArtists (game ended before snapshot)
          arts = (pd.stageArtists || []).flat();
        }
        (arts || []).forEach(a => {
          const genres = getGenres(a.genre || "");
          const per = ((a.tickets || 0) + (a.vp || 0)) / Math.max(1, genres.length);
          genres.forEach(g => {
            if (!genreCounts[g]) genreCounts[g] = { count: 0, tickets: 0 };
            genreCounts[g].count += 1 / Math.max(1, genres.length); // split multi-genre artists across genres
            genreCounts[g].tickets += per;
          });
        });
      });
      const genreLine = Object.entries(genreCounts)
        .filter(([_, v]) => v.count > 0)
        .map(([g, v]) => `${g} (${Math.round(v.count * 10) / 10} artists / ${Math.round(v.tickets)} tickets)`)
        .join(" · ");
      rows.push(["Genres played", genreLine || "(none)"]);

      rows.push([]);
    });

    // ── Global genre averages ──
    rows.push(["═══════ GLOBAL GENRE AVERAGES ═══════"]);
    rows.push(["Across all players — tickets contributed per genre (mean / median / mode), sorted by mean descending"]);
    // Collect per-player per-genre ticket contributions
    const perGenreSamples = {}; // { genre: [ticketAmountPerPlayer] }
    ordered.forEach(entry => {
      const pid = entry.player.id;
      const pd = playerData[pid] || {};
      const yStats = yearlyStats[pid] || {};
      const pgTotals = {}; // per player, per genre
      yearRange.forEach(y => {
        let arts = yStats[y]?.artistsOnStages;
        if ((!arts || arts.length === 0) && y === yearRange[yearRange.length - 1]) {
          arts = (pd.stageArtists || []).flat();
        }
        (arts || []).forEach(a => {
          const genres = getGenres(a.genre || "");
          const per = ((a.tickets || 0) + (a.vp || 0)) / Math.max(1, genres.length);
          genres.forEach(g => { pgTotals[g] = (pgTotals[g] || 0) + per; });
        });
      });
      Object.entries(pgTotals).forEach(([g, t]) => {
        if (!perGenreSamples[g]) perGenreSamples[g] = [];
        perGenreSamples[g].push(t);
      });
    });
    // Compute stats
    const stats = Object.entries(perGenreSamples).map(([g, samples]) => {
      const sorted = [...samples].sort((a, b) => a - b);
      const mean = samples.reduce((s, v) => s + v, 0) / samples.length;
      const mid = Math.floor(sorted.length / 2);
      const median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
      // Mode — round to nearest integer for meaningful mode
      const buckets = {};
      samples.forEach(v => { const k = Math.round(v); buckets[k] = (buckets[k] || 0) + 1; });
      const maxFreq = Math.max(...Object.values(buckets));
      const modes = Object.entries(buckets).filter(([_, c]) => c === maxFreq).map(([k]) => parseInt(k));
      // v196.2: join modes with " · " instead of "/" — Excel was interpreting
      // multi-mode results like "1/8/11" as a date. Middle-dot is unambiguous text.
      return { genre: g, mean, median, mode: modes.join(" · "), samples };
    });
    stats.sort((a, b) => b.mean - a.mean);
    rows.push(["Genre", "Mean tickets", "Median tickets", "Mode tickets", "Sample count"]);
    stats.forEach(s => rows.push([s.genre, Math.round(s.mean * 10) / 10, Math.round(s.median * 10) / 10, s.mode, s.samples.length]));

    // ── Serialize + download ──
    // v196.2: Excel auto-parses cells like "2/3" as dates ("2 March"). Any cell
    // whose entire content matches a "digit / digit" or "digit-Mon-digit" pattern
    // gets force-quoted with a leading tab so Excel treats it as text.
    // Existing " / " → " of " and mode "/" → " · " changes cover most cases; this
    // is a defensive net for anything future authors might add.
    const looksDatey = (s) => /^\s*\d+\s*[\/\-]\s*\d+(\s*[\/\-]\s*\d+)?\s*$/.test(s);
    const csv = rows.map(r => r.map(c => {
      let s = String(c ?? "");
      if (looksDatey(s)) s = "\t" + s; // leading tab forces text in Excel
      return s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\t")
        ? `"${s.replace(/"/g, '""')}"`
        : s;
    }).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `headliners_game_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  if (phase === "gameOver") {
    // v142/v143: winner selection depends on the active win condition.
    // Following (default): highest cumulative tickets across all years.
    // Consistency: most year-leads. Ties → cumulative.
    // Talk of the Town: highest single-year peak. Ties → second-best year, then cumulative.
    const perPlayer = players.map(p => {
      const byYear = allTickets[p.id] || {};
      const yearTickets = [1,2,3,4].map(y => byYear[y]?.raw || 0);
      const total = yearTickets.reduce((s, t) => s + t, 0);
      const peak = Math.max(...yearTickets, 0);
      return { player: p, total, peak, yearTickets, byYear };
    });
    // Compute per-year winners for the "years led" count
    const yearsLed = {}; players.forEach(p => { yearsLed[p.id] = 0; });
    [1,2,3,4].forEach(y => {
      const played = players.some(p => allTickets[p.id]?.[y]?.raw != null);
      if (!played) return;
      let maxT = -Infinity;
      players.forEach(p => { const t = allTickets[p.id]?.[y]?.raw ?? -Infinity; if (t > maxT) maxT = t; });
      players.forEach(p => { if ((allTickets[p.id]?.[y]?.raw ?? -Infinity) === maxT && maxT !== -Infinity) yearsLed[p.id]++; });
    });

    const cond = winCondition || "following";
    let ranked;
    if (cond === "consistency") {
      ranked = [...perPlayer].sort((a, b) => (yearsLed[b.player.id] - yearsLed[a.player.id]) || (b.total - a.total));
    } else if (cond === "talkOfTheTown") {
      ranked = [...perPlayer].sort((a, b) => {
        if (b.peak !== a.peak) return b.peak - a.peak;
        // Tiebreak: second-highest year
        const secondBestA = [...a.yearTickets].sort((x, y) => y - x)[1] || 0;
        const secondBestB = [...b.yearTickets].sort((x, y) => y - x)[1] || 0;
        if (secondBestB !== secondBestA) return secondBestB - secondBestA;
        return b.total - a.total;
      });
    } else {
      ranked = [...perPlayer].sort((a, b) => b.total - a.total);
    }
    const winnerRow = ranked[0];
    const condLabel = cond === "consistency" ? "Consistency — most years led" : cond === "talkOfTheTown" ? "Talk of the Town — highest single-year peak" : "Following — highest cumulative tickets";
    return (
    <div style={CS}>{utilButtons}{showLog && <GameLog log={gameLog} onClose={() => setShowLog(false)} />}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "center", minHeight: "100vh", padding: 24 }}>
        <div style={{ ...card, textAlign: "center", maxWidth: 780, width: "100%", marginTop: 24 }}>
          <h1 style={{ fontSize: 44, fontWeight: 900, margin: "0 0 4px", background: "linear-gradient(135deg, #fbbf24, #f472b6, #c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>🏆 GAME OVER</h1>
          <p style={{ color: "#94a3b8", fontSize: 12, marginBottom: 14, fontStyle: "italic" }}>Win Condition: <strong style={{ color: "#fbbf24" }}>{condLabel}</strong></p>
          {winnerRow && <div style={{ marginBottom: 20 }}>
            <p style={{ color: "#fbbf24", fontSize: 22, fontWeight: 700, margin: "8px 0 4px" }}>{winnerRow.player.festivalName} Wins!</p>
            <p style={{ color: "#60a5fa", fontSize: 13, margin: 0 }}>
              {cond === "consistency" && `Led in tickets across ${yearsLed[winnerRow.player.id]} year${yearsLed[winnerRow.player.id] === 1 ? "" : "s"}`}
              {cond === "talkOfTheTown" && `Peak year: ${(winnerRow.peak * 100).toLocaleString()} tickets sold`}
              {cond === "following" && `${(winnerRow.total * 100).toLocaleString()} tickets sold across the run`}
            </p>
          </div>}
          {/* Full leaderboard — always shows per-year, total, peak, years led so players
              can see how they'd have placed under each rule. */}
          <div style={{ marginTop: 12, marginBottom: 20, textAlign: "left", borderRadius: 12, background: "rgba(20,18,34,0.6)", border: "1px solid rgba(124,58,237,0.35)", padding: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr repeat(4, minmax(48px, 1fr)) minmax(60px, auto) minmax(50px, auto) minmax(70px, auto)", gap: 6, alignItems: "center", fontSize: 12 }}>
              <div style={{ color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, fontSize: 9 }}>#</div>
              <div style={{ color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, fontSize: 9 }}>Festival</div>
              {[1,2,3,4].map(y => <div key={y} style={{ color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, fontSize: 9, textAlign: "right" }}>Y{y}</div>)}
              <div style={{ color: cond === "following" ? "#fbbf24" : "#94a3b8", fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.6, fontSize: 9, textAlign: "right" }}>Total</div>
              <div style={{ color: cond === "talkOfTheTown" ? "#fbbf24" : "#94a3b8", fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.6, fontSize: 9, textAlign: "right" }}>Peak</div>
              <div style={{ color: cond === "consistency" ? "#fbbf24" : "#94a3b8", fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.6, fontSize: 9, textAlign: "right" }}>Years Led</div>
              {ranked.map((row, idx) => <React.Fragment key={row.player.id}>
                <div style={{ color: idx === 0 ? "#fbbf24" : "#c4b5fd", fontWeight: 800, fontSize: 14 }}>{idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : idx + 1}</div>
                <div style={{ color: "#e2e8f0", fontWeight: 700, fontSize: 12 }}>{row.player.festivalName}{row.player.isAI ? " 🤖" : ""}</div>
                {[1,2,3,4].map(y => {
                  const t = row.byYear[y]?.raw;
                  return <div key={y} style={{ color: t != null ? "#e2e8f0" : "#475569", textAlign: "right", fontSize: 11 }}>{t != null ? t.toLocaleString() : "—"}</div>;
                })}
                <div style={{ color: cond === "following" && idx === 0 ? "#fbbf24" : "#60a5fa", fontWeight: cond === "following" ? 800 : 600, textAlign: "right", fontSize: 12 }}>{row.total.toLocaleString()}</div>
                <div style={{ color: cond === "talkOfTheTown" && idx === 0 ? "#fbbf24" : "#60a5fa", fontWeight: cond === "talkOfTheTown" ? 800 : 600, textAlign: "right", fontSize: 12 }}>{row.peak.toLocaleString()}</div>
                <div style={{ color: cond === "consistency" && idx === 0 ? "#fbbf24" : "#60a5fa", fontWeight: cond === "consistency" ? 800 : 600, textAlign: "right", fontSize: 12 }}>{yearsLed[row.player.id]}</div>
              </React.Fragment>)}
            </div>
            <p style={{ color: "#64748b", fontSize: 10, margin: "10px 2px 0", fontStyle: "italic" }}>Highlighted column decides the winner under the active condition. Other columns show how you would have ranked under the alternatives.</p>
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={exportGameData} style={{ ...bs, padding: "12px 20px", fontSize: 14 }}>📊 Download Game Data</button>
            <button onClick={() => {
              // v150: comprehensive reset for Play Again. Previously only cleared phase,
              // gameLog, allTickets, year, and winCondition — everything else (objectives,
              // fame log, tempts, player data, deck, dice, contest queue, etc.) leaked
              // into the next game. Now we wipe every game-scoped state variable.
              setPhase("lobby"); setGameLog([]); setAllTickets({}); setYear(1); setWinCondition(null);
              setActiveObjectives({}); setCompletedObjectives({}); setYearObjectiveAssignments({});
              setPendingObjectivePickerQueue([]); setPendingObjectivePicker(null); setAltObjectiveDeck([]);
              setPendingHandDiscard(null); setPendingContestPlacements([]); setPendingAgentArtist(null);
              setAgentContest(null); setTemptPlacements({}); setAgentPlacements({});
              setFameLog({}); setTicketsLog({}); setPlayerData({});
              setPlayerIdentities({}); setIdentityLog({}); setIdentityDealt({}); setIdentityPickerIdx(0);
              setSharedContracts([]); setPendingContractClaim(null);
              setArtistDeck([]); setArtistPool([]); setDiscardPile([]);
              setPlayerObjectives({}); setYearEvents({}); setDicePool(0); setTurnOrder([]);
              setCurrentPlayerIdx(0); setTurnsLeft({}); setActionTaken(false); setTurnAction(null);
              setAgentBookedThisYear({}); setAgentExhausted({}); setShowTurnStart(false);
              setSetupIndex(0); setSetupStep("viewObjective"); setMicrotrends([]); setNextAmenityMicrotrend(null); setNextGenreMicrotrend(null);
              setMicrotrendHistory([]); setFameGainQueue([]); setFloatingBonuses([]);
              setYearEndEffectsList([]); setYearEndEffectIdx(0); setYearEndEffectsPlayer(0);
              setRevealIndex(0); setLeaderboardRevealed(false); setTurnNumber(0);
              setLastAction({}); setCurrentTurnActions({}); setYearlyStats({}); setUndoSnapshot(null); setPendingDiceRoll(null);
            }} style={{ ...bp, padding: "12px 20px", fontSize: 14 }}>Play Again 🎪</button>
          </div>
        </div>
      </div>{anim}</div>
    );
  }

  return null;
}
