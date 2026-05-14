/**
 * HEADLINERS — A Festival-Building Board Game Prototype
 * =====================================================
 * Build the biggest and best festival over 4 years (rounds).
 * 2–5 players compete to earn Victory Points through ticket sales,
 * amenity placement, artist booking, and fame.
 *
 * Core mechanics:
 *  - Hex-grid festival board (13×13) with stage placement
 *  - 1 action per turn: Pick Amenity (dice), Move Amenity, or Book/Reserve Artist
 *  - Artists have costs (fame + amenities), genres, VP, tickets, and effects
 *  - 3 artists per stage; the 3rd is the Headliner (effect triggers twice)
 *  - First full lineup bonus: +5 tickets
 *  - Campsites generate 5 tickets each
 *  - 10 tickets = 1 VP at year end
 *  - Fame level 5 unlocks new stage placement between rounds
 *  - After 4 years, highest VP wins (tiebreak: most tickets)
 */

import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";

// ═══════════════════════════════════════════════════════════
// ARTIST DATA (75 artists from spreadsheet)
// ═══════════════════════════════════════════════════════════
const ALL_ARTISTS = [{"name": "Kara Okay", "fame": 0, "vp": 0, "campCost": 0, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Pop", "tickets": 2, "effect": "+1 Star Die"}, {"name": "Sadchild", "fame": 0, "vp": 0, "campCost": 0, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Pop", "tickets": 2, "effect": "+1 ticket sale for all players"}, {"name": "Mikerophone", "fame": 0, "vp": 0, "campCost": 0, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Pop", "tickets": 2, "effect": ""}, {"name": "Rebecca Black", "fame": 1, "vp": 1, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Pop", "tickets": 2, "effect": ""}, {"name": "Jamiroquai", "fame": 1, "vp": 1, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Pop, Funk", "tickets": 2, "effect": "+1 Fame if you have played 2 Pop artists this year"}, {"name": "Jonas Brothers", "fame": 1, "vp": 1, "campCost": 0, "securityCost": 1, "cateringCost": 0, "portalooCost": 1, "genre": "Pop", "tickets": 2, "effect": "", "agentEffect": "+2 VP"}, {"name": "Remi Wolf", "fame": 1, "vp": 1, "campCost": 0, "securityCost": 1, "cateringCost": 1, "portalooCost": 0, "genre": "Pop", "tickets": 2, "effect": ""}, {"name": "Maroon 5", "fame": 1, "vp": 1, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Pop", "tickets": 2, "effect": "+1 VP per other pop act on this stage"}, {"name": "Dua Lipa", "fame": 2, "vp": 2, "campCost": 1, "securityCost": 1, "cateringCost": 1, "portalooCost": 0, "genre": "Pop", "tickets": 3, "effect": ""}, {"name": "Scissor Sisters", "fame": 2, "vp": 2, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 1, "genre": "Pop", "tickets": 3, "effect": ""}, {"name": "Chappell Roan", "fame": 2, "vp": 2, "campCost": 1, "securityCost": 2, "cateringCost": 0, "portalooCost": 1, "genre": "Pop", "tickets": 3, "effect": ""}, {"name": "Clairo", "fame": 2, "vp": 2, "campCost": 1, "securityCost": 1, "cateringCost": 1, "portalooCost": 1, "genre": "Pop, Indie", "tickets": 3, "effect": "+1 ticket sale / Current Fame Level"}, {"name": "RAYE", "fame": 2, "vp": 2, "campCost": 1, "securityCost": 2, "cateringCost": 1, "portalooCost": 0, "genre": "Pop", "tickets": 3, "effect": ""}, {"name": "Nelly", "fame": 3, "vp": 3, "campCost": 1, "securityCost": 1, "cateringCost": 1, "portalooCost": 2, "genre": "Pop, Hip Hop", "tickets": 4, "effect": "-4 VP / +1 Fame"}, {"name": "Harry Styles", "fame": 3, "vp": 3, "campCost": 2, "securityCost": 2, "cateringCost": 0, "portalooCost": 1, "genre": "Pop", "tickets": 4, "effect": "", "agentEffect": "+2 star die"}, {"name": "Billie Eilish", "fame": 4, "vp": 4, "campCost": 1, "securityCost": 3, "cateringCost": 0, "portalooCost": 1, "genre": "Pop", "tickets": 4, "effect": "Sign 1 artist from the artist deck or the available artist pool."}, {"name": "Beyonce", "fame": 4, "vp": 4, "campCost": 1, "securityCost": 2, "cateringCost": 1, "portalooCost": 1, "genre": "Pop", "tickets": 4, "effect": "+1 Fame if you have played 2 Pop artists this year"}, {"name": "Olivia Dean", "fame": 4, "vp": 4, "campCost": 1, "securityCost": 3, "cateringCost": 1, "portalooCost": 0, "genre": "Pop", "tickets": 4, "effect": ""}, {"name": "Coldplay", "fame": 5, "vp": 5, "campCost": 1, "securityCost": 3, "cateringCost": 2, "portalooCost": 1, "genre": "Pop, Rock", "tickets": 5, "effect": "Year End: '+1 VP / Fame gained this year"}, {"name": "Lady Gaga", "fame": 5, "vp": 5, "campCost": 2, "securityCost": 2, "cateringCost": 2, "portalooCost": 1, "genre": "Pop, Electronic", "tickets": 5, "effect": "Year End: '+1 VP if you have the highest Fame. '+3 VP if you have the highest Fame AND the most tickets."}, {"name": "Sitting Ducks", "fame": 0, "vp": 0, "campCost": 0, "securityCost": 0, "cateringCost": 0, "portalooCost": 1, "genre": "Rock", "tickets": 2, "effect": "All players draw 1 artist from the artist deck"}, {"name": "Beababdoobee", "fame": 0, "vp": 0, "campCost": 0, "securityCost": 0, "cateringCost": 0, "portalooCost": 1, "genre": "Rock", "tickets": 2, "effect": ""}, {"name": "Limp Bizkit", "fame": 0, "vp": 0, "campCost": 0, "securityCost": 0, "cateringCost": 0, "portalooCost": 1, "genre": "Rock", "tickets": 2, "effect": "", "agentEffect": "draw 3 artists from the deck"}, {"name": "No Doubt", "fame": 1, "vp": 1, "campCost": 0, "securityCost": 1, "cateringCost": 0, "portalooCost": 1, "genre": "Rock", "tickets": 2, "effect": ""}, {"name": "Vampire Weekend", "fame": 1, "vp": 1, "campCost": 0, "securityCost": 0, "cateringCost": 1, "portalooCost": 1, "genre": "Rock", "tickets": 2, "effect": ""}, {"name": "The Darkness", "fame": 1, "vp": 1, "campCost": 1, "securityCost": 0, "cateringCost": 0, "portalooCost": 1, "genre": "Rock", "tickets": 2, "effect": ""}, {"name": "Royal Blood", "fame": 1, "vp": 1, "campCost": 1, "securityCost": 0, "cateringCost": 0, "portalooCost": 1, "genre": "Rock", "tickets": 2, "effect": ""}, {"name": "Heart", "fame": 1, "vp": 1, "campCost": 1, "securityCost": 0, "cateringCost": 0, "portalooCost": 1, "genre": "Rock, Indie", "tickets": 2, "effect": "Roll 3 Amenity dice and then gain 2 tickets / Each Fame shown"}, {"name": "Wolf Alice", "fame": 2, "vp": 2, "campCost": 1, "securityCost": 0, "cateringCost": 1, "portalooCost": 1, "genre": "Rock, Indie", "tickets": 3, "effect": ""}, {"name": "Wet Leg", "fame": 2, "vp": 2, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 1, "genre": "Rock", "tickets": 3, "effect": "+1 VP per other Rock act on this stage"}, {"name": "Blondie", "fame": 2, "vp": 2, "campCost": 1, "securityCost": 0, "cateringCost": 1, "portalooCost": 2, "genre": "Rock", "tickets": 3, "effect": ""}, {"name": "Rage Against the Machine", "fame": 2, "vp": 2, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 2, "genre": "Rock, Funk", "tickets": 3, "effect": "Roll 3 Amenity dice and then gain 2 tickets / Each Fame shown"}, {"name": "Beastie Boys", "fame": 3, "vp": 3, "campCost": 1, "securityCost": 0, "cateringCost": 1, "portalooCost": 2, "genre": "Rock, Hip Hop", "tickets": 3, "effect": "", "agentEffect": "+1 Portaloo. Place it this turn"}, {"name": "David Bowie", "fame": 3, "vp": 3, "campCost": 1, "securityCost": 1, "cateringCost": 1, "portalooCost": 2, "genre": "Rock", "tickets": 4, "effect": "Roll all amenity dice and gain 1 Fame if a Fame shows."}, {"name": "Slipknot", "fame": 3, "vp": 3, "campCost": 1, "securityCost": 2, "cateringCost": 0, "portalooCost": 2, "genre": "Rock", "tickets": 4, "effect": "Roll 3 Amenity dice and then gain 2 tickets / Each Fame shown"}, {"name": "Olivia Rodrigo", "fame": 3, "vp": 3, "campCost": 1, "securityCost": 1, "cateringCost": 1, "portalooCost": 2, "genre": "Rock, Pop", "tickets": 4, "effect": "+1 ticket sale / Current Fame Level"}, {"name": "Radiohead", "fame": 4, "vp": 4, "campCost": 1, "securityCost": 0, "cateringCost": 2, "portalooCost": 2, "genre": "Rock, Electronic", "tickets": 4, "effect": ""}, {"name": "Arctic Monkeys", "fame": 4, "vp": 4, "campCost": 1, "securityCost": 1, "cateringCost": 1, "portalooCost": 2, "genre": "Rock", "tickets": 4, "effect": ""}, {"name": "Foo Fighters", "fame": 5, "vp": 5, "campCost": 2, "securityCost": 2, "cateringCost": 1, "portalooCost": 2, "genre": "Rock", "tickets": 5, "effect": "Year End: Roll all 5 Amenity Dice. +1VP for each unique amenity that shows"}, {"name": "Fleetwood Mac", "fame": 5, "vp": 5, "campCost": 2, "securityCost": 1, "cateringCost": 1, "portalooCost": 3, "genre": "Rock", "tickets": 5, "effect": "Year End: Roll all 5 dice. +1 VP per die showing the most common result"}, {"name": "Lil Angry", "fame": 0, "vp": 0, "campCost": 0, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Hip Hop", "tickets": 2, "effect": ""}, {"name": "Loosey Goosey", "fame": 0, "vp": 0, "campCost": 0, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Hip Hop, Pop", "tickets": 2, "effect": ""}, {"name": "Knucks", "fame": 0, "vp": 0, "campCost": 0, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Hip Hop", "tickets": 2, "effect": ""}, {"name": "Eve", "fame": 1, "vp": 1, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Hip Hop", "tickets": 2, "effect": "-1 VP. Sell 3 tickets."}, {"name": "KAYTRANADA", "fame": 1, "vp": 1, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Hip Hop, Electronic", "tickets": 2, "effect": ""}, {"name": "Lil Dicky", "fame": 1, "vp": 1, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Hip Hop", "tickets": 2, "effect": "", "agentEffect": "+1 security. Place it this turn"}, {"name": "Salt-N-Pepa", "fame": 1, "vp": 1, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Hip Hop", "tickets": 2, "effect": ""}, {"name": "Ja Rule", "fame": 1, "vp": 1, "campCost": 0, "securityCost": 1, "cateringCost": 1, "portalooCost": 0, "genre": "Hip Hop", "tickets": 2, "effect": ""}, {"name": "Ms Banks", "fame": 1, "vp": 1, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Hip Hop", "tickets": 2, "effect": ""}, {"name": "Doja Cat", "fame": 2, "vp": 2, "campCost": 1, "securityCost": 1, "cateringCost": 1, "portalooCost": 0, "genre": "Hip Hop", "tickets": 3, "effect": ""}, {"name": "De La Soul", "fame": 2, "vp": 2, "campCost": 0, "securityCost": 1, "cateringCost": 1, "portalooCost": 1, "genre": "Hip Hop", "tickets": 3, "effect": "+1 VP per other Hip Hop act on this stage"}, {"name": "Snoop Dogg", "fame": 2, "vp": 2, "campCost": 1, "securityCost": 1, "cateringCost": 1, "portalooCost": 0, "genre": "Hip Hop, Funk", "tickets": 3, "effect": ""}, {"name": "Loyle Carner", "fame": 2, "vp": 2, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 1, "genre": "Hip Hop, Rock", "tickets": 3, "effect": "-2 VP for 1 Fame. Roll 1 amenity dice and gain 1 Fame for each Fame shown."}, {"name": "Little Simz", "fame": 3, "vp": 3, "campCost": 1, "securityCost": 1, "cateringCost": 1, "portalooCost": 1, "genre": "Hip Hop, Indie", "tickets": 3, "effect": ""}, {"name": "Dave", "fame": 3, "vp": 3, "campCost": 1, "securityCost": 2, "cateringCost": 1, "portalooCost": 0, "genre": "Hip Hop", "tickets": 3, "effect": "-3 VP. Gain 1 Fame."}, {"name": "Missy Elliott", "fame": 4, "vp": 4, "campCost": 1, "securityCost": 2, "cateringCost": 1, "portalooCost": 1, "genre": "Hip Hop", "tickets": 4, "effect": "-2 VP. +1 Star Die"}, {"name": "Lauryn Hill", "fame": 4, "vp": 4, "campCost": 2, "securityCost": 2, "cateringCost": 1, "portalooCost": 0, "genre": "Hip Hop", "tickets": 4, "effect": ""}, {"name": "Nas", "fame": 4, "vp": 4, "campCost": 2, "securityCost": 3, "cateringCost": 0, "portalooCost": 0, "genre": "Hip Hop", "tickets": 4, "effect": ""}, {"name": "Kendrick Lamar", "fame": 5, "vp": 5, "campCost": 2, "securityCost": 3, "cateringCost": 1, "portalooCost": 1, "genre": "Hip Hop", "tickets": 5, "effect": "Year End: -3 VP. Sell 15 tickets", "agentEffect": "+8 VP at Year End"}, {"name": "Eminem", "fame": 5, "vp": 5, "campCost": 3, "securityCost": 3, "cateringCost": 1, "portalooCost": 0, "genre": "Hip Hop", "tickets": 5, "effect": "Year End: +1 VP / Hip Hop artist you've played this Year"}, {"name": "CRUEL MISTRESS", "fame": 0, "vp": 0, "campCost": 1, "securityCost": 0, "cateringCost": 0, "portalooCost": 0, "genre": "Electronic", "tickets": 2, "effect": "+1 ticket sale for all players"}, {"name": "808 DYLAN", "fame": 0, "vp": 0, "campCost": 1, "securityCost": 0, "cateringCost": 0, "portalooCost": 0, "genre": "Electronic", "tickets": 2, "effect": "+1 Star Die"}, {"name": "Horsegiirl", "fame": 0, "vp": 0, "campCost": 1, "securityCost": 0, "cateringCost": 0, "portalooCost": 0, "genre": "Electronic", "tickets": 2, "effect": ""}, {"name": "Grimes", "fame": 1, "vp": 1, "campCost": 1, "securityCost": 0, "cateringCost": 0, "portalooCost": 1, "genre": "Electronic", "tickets": 2, "effect": ""}, {"name": "FISHER", "fame": 1, "vp": 1, "campCost": 1, "securityCost": 0, "cateringCost": 1, "portalooCost": 0, "genre": "Electronic", "tickets": 2, "effect": "", "agentEffect": "+1 campsite. Place this turn"}, {"name": "Romy", "fame": 1, "vp": 1, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Electronic", "tickets": 2, "effect": ""}, {"name": "The Chainsmokers", "fame": 1, "vp": 1, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Electronic", "tickets": 2, "effect": "+1 ticket / amenity"}, {"name": "CHVRCHES", "fame": 1, "vp": 1, "campCost": 1, "securityCost": 0, "cateringCost": 1, "portalooCost": 0, "genre": "Electronic", "tickets": 2, "effect": "+1 ticket / amenity adjacent to this artists stage"}, {"name": "Jamie xx", "fame": 2, "vp": 2, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 1, "genre": "Electronic, Indie", "tickets": 3, "effect": ""}, {"name": "Pink Pantheress", "fame": 2, "vp": 2, "campCost": 1, "securityCost": 1, "cateringCost": 1, "portalooCost": 0, "genre": "Electronic, Pop", "tickets": 3, "effect": "+1 VP per other Electronic artist on this stage"}, {"name": "Flume", "fame": 2, "vp": 2, "campCost": 1, "securityCost": 1, "cateringCost": 1, "portalooCost": 1, "genre": "Electronic, Hip Hop", "tickets": 3, "effect": "-1 VP. Gain +2 tickets / amenity"}, {"name": "Opolopo", "fame": 2, "vp": 2, "campCost": 2, "securityCost": 1, "cateringCost": 0, "portalooCost": 1, "genre": "Electronic, Funk", "tickets": 3, "effect": ""}, {"name": "Peggy Gou", "fame": 2, "vp": 2, "campCost": 2, "securityCost": 0, "cateringCost": 2, "portalooCost": 0, "genre": "Electronic", "tickets": 3, "effect": "+1 ticket / amenity adjacent to this artists stage"}, {"name": "Chase & Status", "fame": 2, "vp": 2, "campCost": 2, "securityCost": 1, "cateringCost": 1, "portalooCost": 0, "genre": "Electronic", "tickets": 3, "effect": "+1 VP per other Electronic artist on this stage"}, {"name": "Charli XCX", "fame": 3, "vp": 3, "campCost": 2, "securityCost": 0, "cateringCost": 0, "portalooCost": 2, "genre": "Electronic, Pop", "tickets": 3, "effect": "+1 Fame if you have played 2 artists of either Electronic or Pop."}, {"name": "The Chemical Brothers", "fame": 3, "vp": 3, "campCost": 2, "securityCost": 2, "cateringCost": 0, "portalooCost": 0, "genre": "Electronic", "tickets": 3, "effect": "Draw two artists from either the available artist pool or deck. Sign one."}, {"name": "Linkin Park", "fame": 3, "vp": 3, "campCost": 2, "securityCost": 1, "cateringCost": 1, "portalooCost": 0, "genre": "Electronic, Rock", "tickets": 3, "effect": "+1 Fame"}, {"name": "Skrillex", "fame": 3, "vp": 3, "campCost": 3, "securityCost": 0, "cateringCost": 0, "portalooCost": 1, "genre": "Electronic", "tickets": 3, "effect": ""}, {"name": "Daft Punk", "fame": 5, "vp": 5, "campCost": 3, "securityCost": 0, "cateringCost": 2, "portalooCost": 2, "genre": "Electronic", "tickets": 5, "effect": "Year End: '+1 VP / 2 Amenities"}, {"name": "Fatboy Slim", "fame": 5, "vp": 5, "campCost": 3, "securityCost": 1, "cateringCost": 2, "portalooCost": 1, "genre": "Electronic", "tickets": 5, "effect": "Year End: '+2 VP / Council Objective that is currently giving you a benefit"}, {"name": "Bruised Brothers", "fame": 0, "vp": 0, "campCost": 0, "securityCost": 0, "cateringCost": 0, "portalooCost": 1, "genre": "Indie", "tickets": 2, "effect": ""}, {"name": "Ayle", "fame": 0, "vp": 0, "campCost": 0, "securityCost": 0, "cateringCost": 1, "portalooCost": 0, "genre": "Indie, Hip Hop", "tickets": 2, "effect": "Sign one artist. You may refresh the available artists before or after you draw."}, {"name": "Mickey Raven", "fame": 0, "vp": 0, "campCost": 0, "securityCost": 0, "cateringCost": 0, "portalooCost": 1, "genre": "Indie", "tickets": 2, "effect": "+1 Star Die"}, {"name": "Djo", "fame": 1, "vp": 1, "campCost": 1, "securityCost": 0, "cateringCost": 1, "portalooCost": 0, "genre": "Indie", "tickets": 2, "effect": ""}, {"name": "Two Door Cinema Club", "fame": 1, "vp": 1, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 0, "genre": "Indie", "tickets": 2, "effect": ""}, {"name": "Boygenius", "fame": 1, "vp": 1, "campCost": 1, "securityCost": 0, "cateringCost": 0, "portalooCost": 1, "genre": "Indie", "tickets": 2, "effect": ""}, {"name": "The Kooks", "fame": 1, "vp": 1, "campCost": 0, "securityCost": 1, "cateringCost": 0, "portalooCost": 1, "genre": "Indie", "tickets": 2, "effect": ""}, {"name": "Christine & The Queens", "fame": 1, "vp": 1, "campCost": 1, "securityCost": 0, "cateringCost": 0, "portalooCost": 2, "genre": "Indie", "tickets": 3, "effect": ""}, {"name": "Angine de Poitrine", "fame": 2, "vp": 2, "campCost": 1, "securityCost": 0, "cateringCost": 1, "portalooCost": 1, "genre": "Indie", "tickets": 3, "effect": ""}, {"name": "Suki Waterhouse", "fame": 2, "vp": 2, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 1, "genre": "Indie", "tickets": 3, "effect": "+1 VP per other Indie artist on this stage"}, {"name": "Mitski", "fame": 2, "vp": 2, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 1, "genre": "Indie", "tickets": 3, "effect": ""}, {"name": "CMAT", "fame": 2, "vp": 2, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 2, "genre": "Indie, Pop", "tickets": 3, "effect": "+1 Star Die"}, {"name": "Florence & The Machine", "fame": 2, "vp": 2, "campCost": 1, "securityCost": 0, "cateringCost": 1, "portalooCost": 1, "genre": "Indie", "tickets": 3, "effect": "+5 ticket sales"}, {"name": "Lana Del Rey", "fame": 3, "vp": 3, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 2, "genre": "Indie", "tickets": 3, "effect": "+1 Fame", "agentEffect": "+1 Fame"}, {"name": "Hozier", "fame": 3, "vp": 2, "campCost": 1, "securityCost": 0, "cateringCost": 0, "portalooCost": 2, "genre": "Indie", "tickets": 3, "effect": "+1 VP"}, {"name": "Joy Division", "fame": 4, "vp": 4, "campCost": 1, "securityCost": 1, "cateringCost": 1, "portalooCost": 2, "genre": "Indie", "tickets": 4, "effect": ""}, {"name": "Tame Impala", "fame": 4, "vp": 4, "campCost": 2, "securityCost": 0, "cateringCost": 1, "portalooCost": 2, "genre": "Indie, Electronic", "tickets": 4, "effect": "+1 Amenity"}, {"name": "The Strokes", "fame": 4, "vp": 4, "campCost": 1, "securityCost": 1, "cateringCost": 0, "portalooCost": 3, "genre": "Indie", "tickets": 4, "effect": ""}, {"name": "Gorillaz", "fame": 5, "vp": 5, "campCost": 1, "securityCost": 2, "cateringCost": 2, "portalooCost": 2, "genre": "Indie", "tickets": 5, "effect": "Gain 2 VP per existing campsite in your festival."}, {"name": "The Cure", "fame": 5, "vp": 5, "campCost": 1, "securityCost": 2, "cateringCost": 1, "portalooCost": 3, "genre": "Indie, Rock", "tickets": 5, "effect": "Immediately book another Indie or Rock artist."}, {"name": "Bella Labelle", "fame": 0, "vp": 0, "campCost": 0, "securityCost": 0, "cateringCost": 1, "portalooCost": 0, "genre": "Funk", "tickets": 2, "effect": "All players draw 1 artist from the artist deck."}, {"name": "Redcar", "fame": 0, "vp": 0, "campCost": 0, "securityCost": 0, "cateringCost": 1, "portalooCost": 0, "genre": "Funk", "tickets": 2, "effect": "All players draw 1 artist from the artist deck"}, {"name": "Backseat", "fame": 0, "vp": 0, "campCost": 0, "securityCost": 0, "cateringCost": 1, "portalooCost": 0, "genre": "Funk", "tickets": 2, "effect": ""}, {"name": "Teena Marie", "fame": 1, "vp": 1, "campCost": 1, "securityCost": 0, "cateringCost": 1, "portalooCost": 0, "genre": "Funk", "tickets": 2, "effect": "Discard one artist from your hand to gain 3 tickets."}, {"name": "Commodores", "fame": 1, "vp": 0, "campCost": 0, "securityCost": 0, "cateringCost": 1, "portalooCost": 0, "genre": "Funk", "tickets": 2, "effect": ""}, {"name": "Rick James", "fame": 1, "vp": 0, "campCost": 0, "securityCost": 0, "cateringCost": 0, "portalooCost": 1, "genre": "Funk", "tickets": 2, "effect": "Discard two artists from your hand to gain the ticket cost of one of them."}, {"name": "Vulfpeck", "fame": 1, "vp": 0, "campCost": 0, "securityCost": 0, "cateringCost": 1, "portalooCost": 0, "genre": "Funk, Indie", "tickets": 2, "effect": ""}, {"name": "War", "fame": 1, "vp": 1, "campCost": 1, "securityCost": 0, "cateringCost": 2, "portalooCost": 0, "genre": "Funk", "tickets": 3, "effect": ""}, {"name": "Parliament", "fame": 1, "vp": 1, "campCost": 0, "securityCost": 1, "cateringCost": 2, "portalooCost": 0, "genre": "Funk", "tickets": 3, "effect": ""}, {"name": "Evelyn \"Champagne\" King:", "fame": 2, "vp": 2, "campCost": 1, "securityCost": 1, "cateringCost": 1, "portalooCost": 0, "genre": "Funk", "tickets": 3, "effect": "+1 VP per other Funk artist on this stage"}, {"name": "Cameo", "fame": 2, "vp": 2, "campCost": 1, "securityCost": 0, "cateringCost": 1, "portalooCost": 1, "genre": "Funk", "tickets": 3, "effect": ""}, {"name": "Khruangbin", "fame": 2, "vp": 2, "campCost": 1, "securityCost": 0, "cateringCost": 2, "portalooCost": 0, "genre": "Funk, Electronic", "tickets": 3, "effect": "Draw two artists from either the available artist pool or deck. Sign one."}, {"name": "Sly & The Family Stone", "fame": 2, "vp": 2, "campCost": 0, "securityCost": 1, "cateringCost": 1, "portalooCost": 1, "genre": "Funk", "tickets": 3, "effect": "+1 VP"}, {"name": "Betty Davis", "fame": 3, "vp": 3, "campCost": 1, "securityCost": 1, "cateringCost": 2, "portalooCost": 1, "genre": "Funk, Rock", "tickets": 4, "effect": "Discard one amenity, gain 5 tickets"}, {"name": "Thundercat", "fame": 3, "vp": 3, "campCost": 1, "securityCost": 1, "cateringCost": 3, "portalooCost": 0, "genre": "Funk", "tickets": 4, "effect": "+4 ticket sales"}, {"name": "Earth, Wind & Fire", "fame": 4, "vp": 4, "campCost": 0, "securityCost": 2, "cateringCost": 2, "portalooCost": 1, "genre": "Funk", "tickets": 4, "effect": ""}, {"name": "Chaka Khan", "fame": 4, "vp": 4, "campCost": 2, "securityCost": 1, "cateringCost": 2, "portalooCost": 0, "genre": "Funk", "tickets": 4, "effect": "+1 Star Die"}, {"name": "Nile Rogers & Chic", "fame": 4, "vp": 4, "campCost": 1, "securityCost": 1, "cateringCost": 3, "portalooCost": 0, "genre": "Funk", "tickets": 4, "effect": "+1 Fame"}, {"name": "Silk Sonic", "fame": 5, "vp": 5, "campCost": 2, "securityCost": 2, "cateringCost": 2, "portalooCost": 1, "genre": "Funk, Pop", "tickets": 5, "effect": "Discard two artists from your hand, then draw the top artist from the deck and play it for free."}, {"name": "Prince", "fame": 5, "vp": 5, "campCost": 1, "securityCost": 2, "cateringCost": 3, "portalooCost": 1, "genre": "Funk", "tickets": 5, "effect": "+1 VP per other artist on all of your stages."}];

// ═══════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════
const AMENITY_TYPES = ["campsite", "security", "catering", "portaloo"];
// Each player has 3 fields. Each field is an independent counter object.
// pd.fields[i] is the source of truth for amenity placement; pd.amenities is the
// derived sum across fields, kept in sync by computeTicketsForPlayer / setPlayerData.
const FIELD_COUNT = 3;
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
const AMENITY_ICONS = { campsite: "⛺", portaloo: "🚽", security: "👮‍♀️", catering: "🍔" };
const AMENITY_COLORS = { campsite: "#4ade80", portaloo: "#60a5fa", security: "#f87171", catering: "#fbbf24" };
const DICE_OPTIONS = ["campsite", "portaloo", "security", "catering", "catering_or_portaloo", "security_or_campsite", "fame"];
const TURNS_PER_YEAR = { 1: 6, 2: 7, 3: 8, 4: 9 };
const FAME_MAX = 5;
const GENRE_COLORS = { Pop: "#ec4899", Rock: "#ef4444", Electronic: "#94a3b8", "Hip Hop": "#f97316", Indie: "#22c55e", Funk: "#a855f7" };
const ALL_GENRES = ["Pop", "Rock", "Electronic", "Hip Hop", "Indie", "Funk"];

// ─── Council Objectives ───
// 24 unique council cards. Each player gets 5 dealt at game start, keeps 3, assigns 1 per field.
// Conditions are evaluated per-field; rewards are year-scaled where indicated by perYear arrays.
// Year is 1-indexed (year 1 = perYear[0]).
const ALL_COUNCILS = [
  { id: "glamping", name: "Glamping", condition: { type: "thresholdPaired", a: "campsite", b: "portaloo", perYear: [1,1,2,2] }, reward: { type: "fame", perYear: [1,1,2,2] } },
  { id: "foodCourts", name: "Food Courts", condition: { type: "thresholdSingle", amenity: "catering", perYear: [1,2,3,4] }, reward: { type: "starDice", perYear: [1,2,2,3] } },
  { id: "muscleFood", name: "Muscle Food", condition: { type: "comparative", greater: "catering", lesser: "security" }, reward: { type: "agents", perYear: [1,1,1,2] } },
  { id: "shepherds", name: "Shepherds", condition: { type: "comparative", greater: "campsite", lesser: "security" }, reward: { type: "refreshPool" } },
  { id: "goodForBusiness", name: "Good For Business", condition: { type: "comparative", greater: "campsite", lesser: "catering" }, reward: { type: "drawSpecialGuests", perYear: [1,2,3,4] } },
  { id: "extendedDancefloor", name: "Extended Dancefloor", condition: { type: "emptyField" }, reward: { type: "agents", perYear: [1,1,1,2] } },
  { id: "homeSecurity", name: "Home Security", condition: { type: "thresholdPaired", a: "campsite", b: "security", perYear: [1,1,2,2] }, reward: { type: "fame", perYear: [1,1,2,2] } },
  { id: "officialPartner", name: "Official Partner", condition: { type: "thresholdFixed", amenity: "catering", count: 1 }, reward: { type: "drawArtists", perYear: [1,1,2,2] } },
  { id: "staffArea", name: "Staff Area", condition: { type: "thresholdFixed", amenity: "security", count: 1 }, reward: { type: "drawSpecialGuests", perYear: [1,2,3,4] } },
  { id: "snifferDogs", name: "Sniffer Dogs", condition: { type: "thresholdFixed", amenity: "security", count: 2 }, reward: { type: "refreshPool" } },
  { id: "competitiveSteak", name: "Competitive Steak", condition: { type: "thresholdFixed", amenity: "catering", count: 2 }, reward: { type: "agentFame" } },
  { id: "liquidLunches", name: "Liquid Lunches", condition: { type: "thresholdPaired", a: "portaloo", b: "catering", perYear: [1,1,2,2] }, reward: { type: "drawArtists", perYear: [1,1,2,2] } },
  { id: "luxuryLoos", name: "Luxury Loos", condition: { type: "thresholdPaired", a: "security", b: "portaloo", perYear: [1,1,2,2] }, reward: { type: "starDice", perYear: [1,2,2,3] } },
  { id: "wellStaffed", name: "Well Staffed", condition: { type: "thresholdSingle", amenity: "security", perYear: [1,2,3,4] }, reward: { type: "fame", perYear: [1,1,2,2] } },
  { id: "neighbourhoodWatch", name: "Neighbourhood Watch", condition: { type: "comparative", greater: "security", lesser: "campsite" }, reward: { type: "agents", perYear: [1,1,1,2] } },
  { id: "vipee", name: "VIPee", condition: { type: "comparative", greater: "security", lesser: "portaloo" }, reward: { type: "drawSpecialGuests", perYear: [1,2,3,4] } },
  { id: "secretSauce", name: "Secret Sauce", condition: { type: "comparative", greater: "security", lesser: "catering" }, reward: { type: "starDice", perYear: [1,2,2,3] } },
  { id: "funkyFood", name: "Funky Food", condition: { type: "comparative", greater: "portaloo", lesser: "catering" }, reward: { type: "refreshPool" } },
  { id: "numberOneFans", name: "Number One Fans", condition: { type: "comparative", greater: "portaloo", lesser: "campsite" }, reward: { type: "drawArtists", perYear: [1,1,2,2] } },
  { id: "wellEquipped", name: "Well Equipped", condition: { type: "thresholdSingle", amenity: "portaloo", perYear: [1,2,3,4] }, reward: { type: "starDice", perYear: [1,2,2,3] } },
  { id: "plentyForEveryone", name: "Plenty For Everyone", condition: { type: "thresholdPaired", a: "catering", b: "campsite", perYear: [1,1,2,2] }, reward: { type: "drawSpecialGuests", perYear: [1,2,3,4] } },
  { id: "quietCamping", name: "Quiet Camping", condition: { type: "thresholdFixed", amenity: "campsite", count: 1 }, reward: { type: "agentFame" } },
  { id: "spoiltForChoice", name: "Spoilt for Choice", condition: { type: "comparative", greater: "catering", lesser: "campsite" }, reward: { type: "refreshPool" } },
  { id: "urinalsAndCubicles", name: "Urinals and Cubicles", condition: { type: "thresholdFixed", amenity: "portaloo", count: 2 }, reward: { type: "agentFame" } },
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
  if (r.type === "drawArtists") return `Draw +${r.perYear.join("/")} artist(s) when drawing`;
  if (r.type === "drawSpecialGuests") return `Draw +${r.perYear.join("/")} special guest(s)`;
  if (r.type === "agents") return `+${r.perYear.join("/")} 🕵️ Agent use(s) / year`;
  if (r.type === "agentFame") return `+1 🔥 Fame per successful 🕵️ Agent action`;
  return "?";
}

// Evaluate whether a field qualifies for a council in the given year (1-indexed)
function councilQualifies(council, field, year) {
  if (!council || !field) return false;
  const cond = council.condition;
  const yIdx = Math.max(0, Math.min(3, (year || 1) - 1));
  const c = (t) => field[t] || 0;
  if (cond.type === "thresholdSingle") return c(cond.amenity) >= cond.perYear[yIdx];
  if (cond.type === "thresholdPaired") return c(cond.a) >= cond.perYear[yIdx] && c(cond.b) >= cond.perYear[yIdx];
  if (cond.type === "comparative") return c(cond.greater) > c(cond.lesser);
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
  { id: "local_talent", name: "Local Talent", req: "Play a 0-1 Fame artist as a headliner", reward: "+3 VP" },
  { id: "popstars", name: "Popstars", req: "Feature a full Pop lineup", reward: "+3 VP" },
  { id: "rock_on", name: "Rock On", req: "Feature a full Rock lineup", reward: "+3 VP" },
  { id: "disc_jockeys", name: "Disc Jockeys", req: "Feature a full Electronic lineup", reward: "+3 VP" },
  { id: "fire_verses", name: "Fire Verses", req: "Feature a full Hip Hop lineup", reward: "+3 VP" },
  { id: "indiependent", name: "Indiependent", req: "Feature a full Indie lineup", reward: "+3 VP" },
  { id: "funky_town", name: "Funky Town", req: "Feature a full Funk lineup", reward: "+3 VP" },
  { id: "eclectic", name: "Eclectic", req: "Lineups with at least 3 different genres", reward: "+3 VP" },
  { id: "friends_special", name: "Friends in Special Places", req: "Finish a lineup with a special guest", reward: "+3 VP" },
  { id: "leading_example", name: "Leading by Example", req: "2nd and 3rd artists on a stage have lower Fame cost than the 1st", reward: "+3 VP" },
  { id: "switching_up", name: "Switching it Up", req: "Feature a balanced lineup of 2 genres (e.g. 1 pop, 1 rock, 1 pop-rock)", reward: "+3 VP" },
  { id: "music_speaks", name: "Music that Speaks for Itself", req: "Feature a lineup with no effects", reward: "+3 VP" },
  { id: "high_profile", name: "High Profile", req: "Feature a lineup with at least 5 security in combined cost", reward: "+3 VP" },
  { id: "foodies", name: "Foodies", req: "Feature a lineup with at least 5 catering in combined cost", reward: "+3 VP" },
  { id: "pampered", name: "Pampered", req: "Feature a lineup with at least 5 portaloos in combined cost", reward: "+3 VP" },
  { id: "price_fame", name: "The Price of Fame", req: "Feature a lineup with a total cost of 20 amenities", reward: "+3 VP" },
  { id: "industry_friends", name: "Industry Friends", req: "Feature two lineups with a headliner in the same genre", reward: "+3 VP" },
  { id: "same_song_sheet", name: "Singing From The Same Song Sheet", req: "Feature a lineup where each artist has the same exact amenity requirements", reward: "+3 VP" },
  { id: "experimental", name: "Experimental", req: "Feature a lineup where each artist is a mix of two genres", reward: "+3 VP" },
  { id: "fair_share", name: "Fair Share", req: "Feature a lineup where each artist requires the same number of amenities", reward: "+3 VP" },
];

const FAME_VP = { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 };

const LINEUP_GENRE_DECK = ["Pop","Pop","Pop","Rock","Rock","Rock","Hip Hop","Hip Hop","Hip Hop","Electronic","Electronic","Electronic","Indie","Indie","Indie","Funk","Funk","Funk"];



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
function canAffordArtist(artist, pd) {
  if (pd.fame < artist.fame) return false;
  const a = pd.amenities || {};
  return (a.campsite||0) >= artist.campCost && (a.security||0) >= artist.securityCost && (a.catering||0) >= artist.cateringCost && (a.portaloo||0) >= artist.portalooCost;
}
function getAvailableStages(pd) {
  return pd.stages.filter((_, i) => (pd.stageArtists?.[i] || []).length < 3);
}

// ═══════════════════════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════════════════════
function ArtistCard({ artist, onClick, small, disabled, selected, showCost, affordable }) {
  const gs = getGenres(artist.genre);
  const bg = gs.length === 1 ? GENRE_COLORS[gs[0]] || "#6b7280" : null;
  const grad = gs.length > 1 ? `linear-gradient(135deg, ${GENRE_COLORS[gs[0]] || "#6b7280"} 50%, ${GENRE_COLORS[gs[1]] || "#6b7280"} 50%)` : undefined;
  const mob = typeof window !== 'undefined' && window.innerWidth < 768;
  const sz = small
    ? (mob ? { width: 140, minHeight: 100, padding: "8px 10px", fontSize: 12 } : { width: 110, minHeight: 90, padding: "6px 8px", fontSize: 10 })
    : (mob ? { width: 170, minHeight: 140, padding: "10px 12px", fontSize: 13 } : { width: 150, minHeight: 130, padding: "8px 10px", fontSize: 11 });
  const fs = mob ? { name: small?12:14, meta: small?10:11, cost: 11, effect: small?9:10 } : { name: small?10:12, meta: small?8:9, cost: 10, effect: small?7:8 };
  return (
    <div onClick={disabled ? undefined : onClick} style={{
      ...sz, borderRadius: mob?12:10, border: selected ? "2px solid #fbbf24" : affordable ? "2px solid rgba(251,191,36,0.5)" : "2px solid rgba(255,255,255,0.15)",
      background: grad || bg, color: "#fff", cursor: disabled ? "default" : "pointer",
      opacity: disabled ? 0.4 : 1, display: "flex", flexDirection: "column", gap: mob?3:2,
      position: "relative", overflow: "hidden", transition: "all 0.15s", flexShrink: 0,
      boxShadow: selected ? "0 0 12px rgba(251,191,36,0.4)" : "0 2px 8px rgba(0,0,0,0.3)",
      animation: affordable && !disabled && !selected ? "affordPulse 2s ease-in-out infinite" : "none",
    }}>
      <div style={{ fontWeight: 800, fontSize: fs.name, lineHeight: 1.2, textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>{artist.name}</div>
      <div style={{ fontSize: fs.meta, opacity: 0.9 }}>🔥{artist.fame} • {artist.genre}</div>
      <div style={{ fontSize: fs.meta, display: "flex", gap: mob?6:4, flexWrap: "wrap" }}>
        <span>🎟️{artist.tickets}</span><span>⭐{artist.vp}VP</span>
      </div>
      {showCost && <div style={{ fontSize: fs.cost, opacity: 0.85, marginTop: 2 }}>
        {artist.campCost > 0 && <span>⛺{artist.campCost} </span>}
        {artist.securityCost > 0 && <span>👮‍♀️{artist.securityCost} </span>}
        {artist.cateringCost > 0 && <span>🍔{artist.cateringCost} </span>}
        {artist.portalooCost > 0 && <span>🚽{artist.portalooCost}</span>}
      </div>}
      {artist.effect && <div style={{ fontSize: fs.effect, fontStyle: "italic", opacity: 0.9, marginTop: "auto", textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>✨ {artist.effect}</div>}
      {artist.agentEffect && <div style={{ fontSize: fs.effect, fontStyle: "italic", opacity: 0.95, marginTop: artist.effect ? 2 : "auto", color: "#fbbf24", textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}>🕵️ Via agent: {artist.agentEffect}</div>}
    </div>
  );
}

function DiceDisplay({ dice, onPick, disabled, onReroll, canReroll }) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", alignItems: "center" }}>
      {dice.map((d, i) => {
        const isC = d === "catering_or_portaloo" || d === "security_or_campsite";
        const isFame = d === "fame";
        const label = isFame ? "🔥" : isC ? (d === "catering_or_portaloo" ? "🍔 OR 🚽" : "👮‍♀️ OR ⛺") : AMENITY_ICONS[d];
        const sub = isFame ? "Fame" : isC ? (d === "catering_or_portaloo" ? "Van / Loo" : "Sec / Camp") : AMENITY_LABELS[d];
        return <button key={i} onClick={() => !disabled && onPick(i, d)} disabled={disabled} style={{
          width: 72, height: 80, borderRadius: 12, border: isFame ? "2px solid #fbbf24" : "2px solid #7c3aed",
          background: isFame ? "linear-gradient(135deg, #422006, #713f12)" : "linear-gradient(135deg, #1e1b4b, #312e81)", color: isFame ? "#fbbf24" : "#e9d5ff",
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
    if (d === "catering_or_portaloo") return "🍔/🚽";
    if (d === "security_or_campsite") return "👮‍♀️/⛺";
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
function PlayerBoard({ pd, compact, stageColors, onStageClick, highlightStageIdx, pickStageMode, pickFieldMode, onFieldClick, fieldsDisabled, year }) {
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
          return <div key={si} onClick={() => onStageClick && onStageClick(si)} style={{
            ...stageBox,
            borderColor: isBookable ? stageColor : (isHL ? stageColor : "#2a2a4a"),
            borderWidth: isBookable ? 2 : 1,
            background: isBookable ? `${stageColor}15` : stageBox.background,
            boxShadow: isBookable ? `0 0 12px ${stageColor}80` : (isHL ? `0 0 12px ${stageColor}80` : "none"),
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
            {isBookable && <div style={{ fontSize: 9, color: "#fbbf24", fontStyle: "italic", marginTop: 4, textAlign: "center" }}>↑ Click to book here</div>}
          </div>;
        })}
      </div>}
      {/* Three Fields side by side — sized to match stage card proportions */}
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${FIELD_COUNT}, minmax(0, 1fr))`, gap: 10, maxWidth: 620, margin: "0 auto" }}>
        {fields.map((field, fIdx) => {
          const fieldTotal = (field?.campsite || 0) + (field?.security || 0) + (field?.catering || 0) + (field?.portaloo || 0);
          const disabled = fieldsDisabled && fieldsDisabled(fIdx, field);
          const clickable = pickFieldMode && !disabled;
          const council = (pd?.councils || [])[fIdx];
          const councilActive = council ? councilQualifies(council, field, year || 1) : false;
          return <div key={fIdx} onClick={() => clickable && onFieldClick && onFieldClick(fIdx)} style={{
            padding: compact ? 10 : 12,
            borderRadius: 12,
            background: clickable ? "rgba(124,58,237,0.18)" : "rgba(15,14,26,0.6)",
            border: clickable ? "2px solid #a78bfa" : "1px solid rgba(124,58,237,0.2)",
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
            cursor: clickable ? "pointer" : (disabled ? "not-allowed" : "default"),
            opacity: disabled ? 0.45 : 1,
            boxShadow: clickable ? "0 0 12px rgba(167,139,250,0.5)" : "none",
            animation: clickable ? "affordPulse 1.5s ease-in-out infinite" : "none",
            transition: "all 0.2s",
          }}>
            <div style={{ fontSize: 10, color: clickable ? "#fbbf24" : "#a78bfa", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6, textAlign: "center" }}>Field {fIdx + 1}{clickable ? " ↓" : ""}</div>
            {council && <div style={{
              marginBottom: 8,
              padding: 6,
              borderRadius: 6,
              background: councilActive ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.06)",
              border: councilActive ? "1px solid #22c55e80" : "1px solid #ef444440",
              boxShadow: councilActive ? "0 0 8px rgba(34,197,94,0.25)" : "none",
              transition: "all 0.3s",
            }}>
              <div style={{ fontSize: 10, fontWeight: 800, color: councilActive ? "#86efac" : "#fca5a5", marginBottom: 2 }}>{councilActive ? "✓" : "✗"} {council.name}</div>
              <div style={{ fontSize: 9, color: "#94a3b8", lineHeight: 1.3 }}>{formatCouncilCondition(council)}</div>
              <div style={{ fontSize: 9, color: councilActive ? "#4ade80" : "#94a3b8", lineHeight: 1.3, marginTop: 2, opacity: councilActive ? 1 : 0.7 }}>{formatCouncilReward(council)}</div>
            </div>}
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {AMENITY_TYPES.map(t => {
                const c = field?.[t] || 0;
                return <div key={t} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "3px 7px", borderRadius: 6, background: c > 0 ? `${AMENITY_COLORS[t]}18` : "rgba(0,0,0,0.18)", opacity: c > 0 ? 1 : 0.4, minHeight: compact ? 22 : 26 }}>
                  <span style={{ fontSize: 11, color: AMENITY_COLORS[t], fontWeight: 700 }}>{AMENITY_ICONS[t]} {c}</span>
                  {c > 0 && renderFieldTokens(field, t)}
                </div>;
              })}
            </div>
            {fieldTotal === 0 && <div style={{ fontSize: 10, color: "#475569", textAlign: "center", marginTop: 6, fontStyle: "italic" }}>empty</div>}
          </div>;
        })}
      </div>
      {totalAmenities === 0 && stages.length === 0 && <div style={{ textAlign: "center", color: "#6b7280", fontSize: 12, padding: 20 }}>No stages or amenities yet</div>}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════
// AI ENGINE
// ═══════════════════════════════════════════════════════════

/** Find a valid hex to place an amenity (not on stage, not occupied) */
function aiPickAmenityType(pd) {
  const a = pd.amenities || {};
  const c = (t) => a[t] || 0;
  // Priority: security for events, campsites for tickets, then balance
  const needs = [
    { type: "security", need: Math.max(0, 3 - c("security")) * 10 + Math.random() * 3 },
    { type: "campsite", need: Math.max(0, 4 - c("campsite")) * 8 + Math.random() * 3 },
    { type: "catering", need: Math.max(0, 2 - c("catering")) * 6 + Math.random() * 3 },
    { type: "portaloo", need: Math.max(0, 2 - c("portaloo")) * 5 + Math.random() * 3 },
  ];
  needs.sort((a, b) => b.need - a.need);
  return needs[0].type;
}

/** AI decides which die to pick from available dice */
function aiPickDie(dice, pd, preferredType) {
  const wanted = preferredType || aiPickAmenityType(pd);
  // Find a die that gives the wanted type
  for (let i = 0; i < dice.length; i++) {
    if (dice[i] === wanted) return { idx: i, type: wanted };
    if (dice[i] === "catering_or_portaloo" && (wanted === "catering" || wanted === "portaloo")) return { idx: i, type: wanted };
    if (dice[i] === "security_or_campsite" && (wanted === "security" || wanted === "campsite")) return { idx: i, type: wanted };
  }
  // Fallback: pick fame die if available (free fame is good)
  for (let i = 0; i < dice.length; i++) {
    if (dice[i] === "fame") return { idx: i, type: "fame" };
  }
  // Fallback: pick first available
  for (let i = 0; i < dice.length; i++) {
    if (dice[i] === "catering_or_portaloo") return { idx: i, type: "catering" };
    if (dice[i] === "security_or_campsite") return { idx: i, type: "security" };
    if (dice[i] !== "fame") return { idx: i, type: dice[i] };
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
    drawArtists: 9,
    drawSpecialGuests: 13,
    agents: 11,      // extra agent uses — useful for snatching pool artists
    agentFame: 10,   // +1 fame each agent success — niche but stacks
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
  if (!council) return 1; // no council on field → neutral baseline
  const post = { ...field, [amenityType]: (field[amenityType] || 0) + 1 };
  const wasQualifying = councilQualifies(council, field, year);
  const willQualify = councilQualifies(council, post, year);
  if (wasQualifying && !willQualify) return -1000; // breaks active council — never
  if (!wasQualifying && willQualify) return 100; // newly activates
  if (wasQualifying && willQualify) return 25; // maintains
  // Both inactive — check progression toward goal
  const cond = council.condition;
  if (cond.type === "emptyField") return -800; // never break empty-field
  let relevant = false;
  if (cond.type === "thresholdSingle" || cond.type === "thresholdFixed") relevant = (cond.amenity === amenityType);
  else if (cond.type === "thresholdPaired") relevant = (cond.a === amenityType || cond.b === amenityType);
  else if (cond.type === "comparative") {
    relevant = (cond.greater === amenityType || cond.lesser === amenityType);
    if (cond.lesser === amenityType) return -10; // worsens the ratio
  }
  return relevant ? 10 : 2;
}

// AI picks the best field to place a given amenity. Iterates fields, picks max score.
function aiPickFieldForAmenity(pd, amenityType, year) {
  const fields = pd?.fields || [];
  const councils = pd?.councils || [];
  if (fields.length === 0) return 0;
  let bestIdx = 0, bestScore = -Infinity;
  for (let i = 0; i < fields.length; i++) {
    const score = aiScorePlacement(amenityType, fields[i], councils[i], year);
    if (score > bestScore) { bestScore = score; bestIdx = i; }
  }
  return bestIdx;
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
function aiDecideTurn(pd, artistPool, dice, year, lineupObjectives) {
  const sa = pd.stageArtists || [];
  const openStages = sa.filter(s => s.length < 3);
  const counts = { campsite: 0, portaloo: 0, security: 0, catering: 0, ...(pd.amenities || {}) };
  const totalAmenities = Object.values(counts).reduce((s, v) => s + v, 0);
  const fame = pd.fame || 0;

  // Only book from HAND (no direct pool booking)
  const bookedNames = new Set(sa.flat().map(a => a.name));
  const bookableHand = (pd.hand || []).filter(a => !bookedNames.has(a.name) && fame >= a.fame && counts.campsite >= a.campCost && counts.security >= a.securityCost && counts.catering >= a.cateringCost && counts.portaloo >= a.portalooCost);
  const hasOpenStage = openStages.length > 0;

  // PRIORITY 1: Book from hand if possible — score now includes lineup objective fit + council impact
  if (bookableHand.length > 0 && hasOpenStage) {
    bookableHand.sort((x, y) => {
      const xLineup = aiScoreArtistForLineupObjectives(x, pd, lineupObjectives) * 4;
      const xCouncil = aiScoreArtistForCouncilProgress(x, pd, year);
      const xScore = (x.vp * 3 + x.tickets * 2) + (x.effect ? 5 : 0) + xLineup + xCouncil;
      const yLineup = aiScoreArtistForLineupObjectives(y, pd, lineupObjectives) * 4;
      const yCouncil = aiScoreArtistForCouncilProgress(y, pd, year);
      const yScore = (y.vp * 3 + y.tickets * 2) + (y.effect ? 5 : 0) + yLineup + yCouncil;
      return yScore - xScore;
    });
    const pick = bookableHand[0];
    const idx = (pd.hand || []).indexOf(pick);
    // Smart stage pick: choose the stage where this artist would BEST progress a lineup objective
    // (prefer 2/3-full stages that complete an objective, then 1/3-full, then empty)
    let bestStage = -1, bestStageScore = -Infinity;
    for (let si = 0; si < sa.length; si++) {
      const stage = sa[si] || [];
      if (stage.length >= 3) continue;
      const hypothetical = [...stage, pick];
      // Score: completing a lineup at stage[2] is best, then proximity to lineup objective match
      let score = stage.length * 10; // prefer fuller stages (more proximate to completion)
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
    if (bestStage < 0) bestStage = 0;
    return { action: "book", source: "hand", artistIdx: idx, stageIdx: bestStage };
  }

  // PRIORITY 2: Pick up from pool or draw from deck if hand is small
  const handSize = (pd.hand || []).length;
  if (handSize < 5) {
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

  // PRIORITY 3: Get amenities — only consider artists we could actually book (fame-wise)
  const neededForArtists = { campsite: 0, portaloo: 0, security: 0, catering: 0 };
  [...(pd.hand || [])].filter(a => fame >= a.fame).forEach(a => {
    if (a.campCost > counts.campsite) neededForArtists.campsite++;
    if (a.securityCost > counts.security) neededForArtists.security++;
    if (a.cateringCost > counts.catering) neededForArtists.catering++;
    if (a.portalooCost > counts.portaloo) neededForArtists.portaloo++;
  });

  return { action: "amenity", preferredType: Object.entries(neededForArtists).sort((a, b) => b[1] - a[1])[0]?.[0] };
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
  // totalYears: how many rounds the game lasts. 4 is standard; 3 is a shorter format.
  const [stageOpenFameBonus, setStageOpenFameBonus] = useState(true);
  const [preRoundArtistDraws, setPreRoundArtistDraws] = useState(true);
  const [stagesProvideNoFame, setStagesProvideNoFame] = useState(false);
  const [agentEffectsEnabled, setAgentEffectsEnabled] = useState(true);
  const [totalYears, setTotalYears] = useState(4);
  const totalYearsRef = useRef(4);
  const stageOpenFameBonusRef = useRef(true);
  const preRoundArtistDrawsRef = useRef(true);
  const stagesProvideNoFameRef = useRef(false);
  const agentEffectsEnabledRef = useRef(true);
  useEffect(() => { totalYearsRef.current = totalYears; }, [totalYears]);
  useEffect(() => { stageOpenFameBonusRef.current = stageOpenFameBonus; }, [stageOpenFameBonus]);
  useEffect(() => { preRoundArtistDrawsRef.current = preRoundArtistDraws; }, [preRoundArtistDraws]);
  useEffect(() => { stagesProvideNoFameRef.current = stagesProvideNoFame; }, [stagesProvideNoFame]);
  useEffect(() => { agentEffectsEnabledRef.current = agentEffectsEnabled; }, [agentEffectsEnabled]);
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
  const [choiceAmenity, setChoiceAmenity] = useState(null);
  const [pickingFieldFor, setPickingFieldFor] = useState(null); // amenityType when waiting for field click
  // (placingAmenity / placingStage / movingFrom / movedThisTurn / hoverHex removed —
  //  amenities are now counters, no spatial picking required)
  const [pendingDiceRoll, setPendingDiceRoll] = useState(null); // { count, results, rolled, pid, artistName, callback }
  const [pendingPortalooRefresh, setPendingPortalooRefresh] = useState(0);
  
  // Agent system: each player has 1 agent they can deploy for free
  // agentPlacements: { pid: { type: "dice"|"pool", amenityType?: string, poolIdx?: number, artistName?: string, placedTurn?: number } | null }
  const [agentPlacements, setAgentPlacements] = useState({});
  // Tracks which players have successfully used their agent this year (exhausted until next year)
  const [agentExhausted, setAgentExhausted] = useState({});
  // Tracks how many bonus agent uses each player has consumed this year (granted by "+N Agents" councils).
  // Each qualifying "agents" council reward provides perYear[yIdx] extra deployments after the base agent
  // is exhausted. Resets to {} each year transition.
  const [agentBonusUsesUsed, setAgentBonusUsesUsed] = useState({});
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
      commitAgentContest(agentContest);
      setAgentContest(null);
      setTimeout(() => recalcTickets(), 50);
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
  const [microtrends, setMicrotrends] = useState([]); // [{ kind, genre|amenity, claimedBy }]
  // Forecast — the microtrend that will replace the currently active one when it's claimed.
  // Visible to all players so they can plan ahead and pre-position for the upcoming trend.
  const [nextMicrotrend, setNextMicrotrend] = useState(null);
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
  const [councilRefreshUsedThisTurn, setCouncilRefreshUsedThisTurn] = useState(false);

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
  function computeTicketsForPlayer(pd, yearOverride) {
    if (!pd) return pd;
    // Read year from a ref so callers wrapped in useCallback([]) (which captured an old
    // closure) still get today's year. yearOverride wins if explicitly provided.
    const y = (yearOverride != null) ? yearOverride : (yearRef.current || year || 1);
    const fields = pd.fields || emptyFields();
    const am = sumFields(fields);
    let t = (am.campsite || 0) * 2;
    (pd.stageArtists || []).forEach(sa => sa.forEach(a => { t += a.tickets; }));
    t += pd.bonusTickets || 0;
    // Council ticket bonuses (year-scaled, applies if field qualifies in current year)
    const councils = pd.councils || [];
    const yIdx = Math.max(0, Math.min(3, y - 1));
    let councilTickets = 0;
    let councilFame = 0;
    for (let i = 0; i < councils.length; i++) {
      const c = councils[i];
      if (!c) continue;
      const qualifies = councilQualifies(c, fields[i], y);
      if (!qualifies) continue;
      if (c.reward?.type === "tickets") councilTickets += c.reward.perYear[yIdx] || 0;
      if (c.reward?.type === "fame") councilFame += c.reward.perYear[yIdx] || 0;
    }
    t += councilTickets;
    let fame = pd.baseFame || 0;
    fame += Math.floor(t / 10);
    fame += councilFame;
    fame = Math.min(FAME_MAX, fame);
    return { ...pd, fields, amenities: am, tickets: t, rawTickets: t, fame, councilTicketsThisYear: councilTickets, councilFameThisYear: councilFame };
  }

  // Recalculate ALL players' tickets using latest state
  const recalcTickets = useCallback(() => {
    setPlayerData(prev => {
      const next = { ...prev };
      for (const pid of Object.keys(next)) {
        next[pid] = computeTicketsForPlayer(next[pid]);
      }
      return next;
    });
  }, []);

  // Helper: update player data AND recalculate tickets in one atomic setPlayerData call
  const recalcAfterUpdate = useCallback((pid, updater) => {
    setPlayerData(prev => {
      const next = { ...prev };
      next[pid] = updater(next[pid]);
      for (const p of Object.keys(next)) {
        next[p] = computeTicketsForPlayer(next[p]);
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
  const hasAgent = (pid) => !agentPlacements[pid] && !agentExhausted[pid]; // available if not deployed AND not exhausted this year
  const getAgentPlacement = (pid) => agentPlacements[pid] || null;
  
  // Place agent on pool artist — start 2-step booking claim
  const placeAgentOnArtist = (pid, poolIdx) => {
    const artist = artistPool[poolIdx];
    if (!artist) return false;
    setAgentPlacements(prev => ({ ...prev, [pid]: { type: "pool", poolIdx, artistName: artist.name, placedTurn: turnNumber } }));
    const pName = players.find(p => p.id === pid)?.festivalName || "?";
    addLog("🕵️ Agent", `${pName} deployed agent to claim ${artist.name}`);
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
      // Use a bonus charge — agent returns instead of exhausting
      setAgentBonusUsesUsed(prev => ({ ...prev, [pid]: usedSoFar + 1 }));
      setAgentPlacements(prev => { const n = { ...prev }; delete n[pid]; return n; });
      addLog("🕵️ Agent", `${pName}: agent returns (bonus charge ${usedSoFar + 1}/${totalBonusCharges} used — Council)`);
      showFloatingBonus("🕵️ Agent returns!", "#86efac");
      return;
    }

    // Standard exhaustion
    setAgentPlacements(prev => { const n = { ...prev }; delete n[pid]; return n; });
    setAgentExhausted(prev => ({ ...prev, [pid]: true }));
    addLog("🕵️ Agent", `${pName}'s agent exhausted until next year`);
  };
  
  // Track turn number for agent ordering
  const [turnNumber, setTurnNumber] = useState(0);
  
  // Resolve pool artist agents at start of a player's turn
  const resolvePoolAgents = (pid) => {
    const placement = agentPlacements[pid];
    if (!placement || placement.type !== "pool") return null;
    
    // Find the artist in the pool by name (index may have shifted)
    const poolIdx = artistPool.findIndex(a => a.name === placement.artistName);
    if (poolIdx < 0) {
      // Artist no longer in pool — agent is redundant
      returnAgent(pid);
      addLog("🕵️ Agent", `Artist ${placement.artistName} no longer available — agent returned`);
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
  //   1. Roll one die from the standard 7-face DICE_OPTIONS pool (same as the game dice).
  //   2. Compare each contestant's value on that face:
  //      - pure amenity face (campsite/portaloo/security/catering) → that amenity's count
  //      - "or" face (catering_or_portaloo, security_or_campsite) → max of the two amenities
  //      - fame face → the player's current Fame
  //   3. Highest value wins.
  //   4. Tiebreaker 1: most tickets this year
  //   5. Tiebreaker 2: agent placed first (lowest placedTurn)
  // Returns the same `resolution` shape with rolledFace, contestantData, winnerId attached
  // so the UI can show the breakdown and the dispatcher can commit the result.
  const getContestValue = (pd, face) => {
    const am = pd?.amenities || {};
    switch (face) {
      case "campsite": return am.campsite || 0;
      case "portaloo": return am.portaloo || 0;
      case "security": return am.security || 0;
      case "catering": return am.catering || 0;
      case "catering_or_portaloo": return Math.max(am.catering || 0, am.portaloo || 0);
      case "security_or_campsite": return Math.max(am.security || 0, am.campsite || 0);
      case "fame": return pd?.fame || 0;
      default: return 0;
    }
  };
  const getContestFaceLabel = (face) => {
    switch (face) {
      case "campsite": return { icon: AMENITY_ICONS.campsite, label: AMENITY_LABELS.campsite, color: AMENITY_COLORS.campsite, statHint: "Highest Campsite count wins" };
      case "portaloo": return { icon: AMENITY_ICONS.portaloo, label: AMENITY_LABELS.portaloo, color: AMENITY_COLORS.portaloo, statHint: "Highest Portaloo count wins" };
      case "security": return { icon: AMENITY_ICONS.security, label: AMENITY_LABELS.security, color: AMENITY_COLORS.security, statHint: "Highest Security count wins" };
      case "catering": return { icon: AMENITY_ICONS.catering, label: AMENITY_LABELS.catering, color: AMENITY_COLORS.catering, statHint: "Highest Catering count wins" };
      case "catering_or_portaloo": return { icon: `${AMENITY_ICONS.catering}/${AMENITY_ICONS.portaloo}`, label: "Catering or Portaloo", color: "#fbbf24", statHint: "Highest of either Catering or Portaloo wins" };
      case "security_or_campsite": return { icon: `${AMENITY_ICONS.security}/${AMENITY_ICONS.campsite}`, label: "Security or Campsite", color: "#4ade80", statHint: "Highest of either Security or Campsite wins" };
      case "fame": return { icon: "🔥", label: "Fame", color: "#f97316", statHint: "Highest 🔥 Fame wins" };
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
  const commitAgentContest = (contest) => {
    const { artist, contestantData, winnerId } = contest;
    const newPool = [...artistPool];
    const idx = newPool.findIndex(a => a.name === artist.name);
    if (idx >= 0) newPool.splice(idx, 1);
    setArtistPool(newPool);
    const winPd = playerDataRef.current?.[winnerId] || playerData[winnerId] || {};
    const openStages = (winPd.stageArtists || []).map((sa, i) => sa.length < 3 ? i : -1).filter(i => i >= 0);
    if (openStages.length > 0) {
      bookArtistToStage(artist, openStages[0], winnerId, true);
    } else {
      setPlayerData(p => ({ ...p, [winnerId]: { ...p[winnerId], hand: [...p[winnerId].hand, artist] } }));
    }
    exhaustAgent(winnerId);
    contestantData.filter(c => c.pid !== winnerId).forEach(c => returnAgent(c.pid));
    // Buzz reward: +1 Fame to every contestant (winner and losers alike).
    setPlayerData(p => {
      const next = { ...p };
      contestantData.forEach(c => {
        const opd = next[c.pid] || {};
        next[c.pid] = { ...opd, baseFame: Math.min(FAME_MAX, (opd.baseFame || 0) + 1) };
      });
      return next;
    });
    const winnerName = players.find(p => p.id === winnerId)?.festivalName;
    const faceLabel = getContestFaceLabel(contest.rolledFace);
    const winnerValue = contestantData.find(c => c.pid === winnerId).value;
    addLog("🕵️ Agent Contest", `${winnerName} won ${artist.name} on the ${faceLabel.label} roll (${winnerValue}). All contestants gained +1 🔥 Fame (industry buzz).`);
  };

  function checkSecurityVPBonus(pid, amenityType) {
    if (amenityType !== "security") return;
    const pd = playerData[pid];
    if (pd && pd.vpPerSecurity > 0) {
      setPlayerData(p => ({ ...p, [pid]: { ...p[pid], vp: (p[pid].vp || 0) + p[pid].vpPerSecurity } }));
      addLog("Effect", `+${pd.vpPerSecurity} VP from security placement!`);
      showFloatingBonus(`+${pd.vpPerSecurity} ⭐ (security)`, "#c4b5fd");
    }
  }
  
  // AI agent deployment logic
  function aiDeployAgent(pid) {
    const pd = playerData[pid] || {};
    const openStages = (pd.stageArtists || []).filter(s => s.length < 3);
    
    if (openStages.length === 0) return; // no point claiming if no stages
    
    // Use canAffordArtist for parity with the human UI — checks fame AND amenity costs
    const affordable = artistPool.filter(a => canAffordArtist(a, pd));
    const bestPool = affordable.sort((a, b) => (b.vp * 2 + b.tickets) - (a.vp * 2 + a.tickets))[0];
    if (!bestPool || (bestPool.vp * 2 + bestPool.tickets) <= 8) return;
    
    // Will contest if the artist is very valuable (fame 4-5), otherwise only claim unclaimed
    const alreadyClaimed = Object.values(agentPlacements).some(p => p && p.type === "pool" && p.artistName === bestPool.name);
    const worthContesting = (bestPool.vp * 2 + bestPool.tickets) > 14;
    if (!alreadyClaimed || worthContesting) {
      const poolIdx = artistPool.indexOf(bestPool);
      if (poolIdx >= 0) placeAgentOnArtist(pid, poolIdx);
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
    return names;
  }

  // True iff artist `name` has at least one agent on it placed by a player OTHER than `byPid`.
  // Used to gate human pool-pickup paths so you can't snatch an artist another player's agent has reserved.
  // Note: doesn't block your OWN agent — you may still book your own claim through the normal agent flow.
  function isAgentClaimedByOther(name, byPid) {
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
        setPlayerData(p => ({ ...p, [pid]: { ...p[pid], vp: (p[pid].vp || 0) + 5 } }));
        addLog("🎯 LINEUP OBJECTIVE", `${pName} FIRST to match ${lo.genres.join("+")} → +5 VP!`);
        showFloatingBonus("🎯 +5 VP!", "#fbbf24"); sfx.headliner();
      } else if (lo.claimed2nd === null && lo.claimed1st !== pid) {
        setLineupObjectives(prev => {
          const next = [...prev];
          next[oi] = { ...next[oi], claimed2nd: pid };
          return next;
        });
        setPlayerData(p => ({ ...p, [pid]: { ...p[pid], vp: (p[pid].vp || 0) + 3 } }));
        addLog("🎯 LINEUP OBJECTIVE", `${pName} SECOND to match ${lo.genres.join("+")} → +3 VP!`);
        showFloatingBonus("🎯 +3 VP!", "#c4b5fd"); sfx.headliner();
      }
      return; // only match one objective per lineup
    }
  }

  /** Check if an artist is free to play (won from goal) */
  function canAffordArtistOrFree(artist, pd) {
    if (artist.freePlay) return true;
    return canAffordArtist(artist, pd);
  }

  function triggerDiceRoll(count, pid, artistName, resultText, callback) {
    setPendingDiceRoll({ count, pid, artistName, resultText, callback, rolled: false });
  }

  // ─── Apply artist effects ───
  function applyEffect(artist, pid, times = 1, stageIdx = -1, viaAgent = false) {
    const eff = (artist.effect || "").trim();
    // Agent-conditional effects: trigger ONLY when booked via an agent AND the lobby toggle
    // is on. Built as a separate, simple parser since the agent effect strings are scoped
    // (we authored them) — no need for the full pattern-matching surface of the base effect.
    if (viaAgent && agentEffectsEnabledRef.current && artist.agentEffect) {
      const ae = artist.agentEffect.trim();
      const ael = ae.toLowerCase();
      const festival = players.find(p => p.id === pid)?.festivalName || "?";
      // +N VP (year-end or immediate VP grant)
      const vpMatch = ae.match(/\+(\d+)\s*VP/i);
      if (vpMatch) {
        const amount = parseInt(vpMatch[1]);
        setPlayerData(p => ({ ...p, [pid]: { ...p[pid], vp: (p[pid].vp || 0) + amount } }));
        addLog("🕵️ Agent Effect", `${artist.name}: +${amount} VP (agent booking)`);
        showFloatingBonus(`+${amount} ⭐ Agent!`, "#c4b5fd");
      }
      // +N Fame
      const fameMatch = ae.match(/\+(\d+)\s*Fame/i);
      if (fameMatch) {
        const amount = parseInt(fameMatch[1]);
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
        const drawn = [];
        for (let i = 0; i < amount; i++) {
          const card = drawFromDeck();
          if (card) drawn.push(card);
        }
        if (drawn.length > 0) {
          setPlayerData(p => ({ ...p, [pid]: { ...p[pid], hand: [...(p[pid].hand || []), ...drawn] } }));
          addLog("🕵️ Agent Effect", `${artist.name}: drew ${drawn.length} artist${drawn.length > 1 ? "s" : ""} from deck (agent booking)`);
        }
      }
      setTimeout(() => recalcTickets(), 60);
    }

    if (!eff) return;
    const el = eff.toLowerCase();
    // For effects that are cumulative (VP, fame, tickets, events), apply `times` iterations
    // For interactive effects (sign, draw, place), scale the amount instead of looping
    for (let t = 0; t < times; t++) {
      // === Fame effects ===
      if (el.includes("+fame") || (el.includes("+1 fame") && !el.includes("fame if"))) {
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
        setPlayerData(p => ({ ...p, [pid]: { ...p[pid], vp: (p[pid].vp || 0) + 1 } }));
        addLog("Effect", `${artist.name}: +1 VP`); showFloatingBonus("+1 ⭐", "#c4b5fd");
      }
      if (el.includes("gain 1vp per existing campsite")) {
        const camps = (playerData[pid]?.amenities?.campsite) || 0;
        setPlayerData(p => ({ ...p, [pid]: { ...p[pid], vp: (p[pid].vp || 0) + camps } }));
        addLog("Effect", `${artist.name}: +${camps} VP (1 per campsite)`);
      }
      // "+1 VP per other [Genre] act on this stage" (genre synergy)
      {
        const genreSynergyMatch = eff.match(/\+1 VP per other (\w+) (?:act|artist) on this stage/i);
        if (genreSynergyMatch && stageIdx >= 0) {
          const targetGenre = genreSynergyMatch[1];
          const stageArtists = (playerData[pid]?.stageArtists || [])[stageIdx] || [];
          const otherCount = stageArtists.filter(a => a.name !== artist.name && getGenres(a.genre).includes(targetGenre)).length;
          if (otherCount > 0) {
            setPlayerData(p => ({ ...p, [pid]: { ...p[pid], vp: (p[pid].vp || 0) + otherCount } }));
            addLog("Effect", `${artist.name}: +${otherCount} VP (${otherCount} other ${targetGenre} on stage)`);
            showFloatingBonus(`+${otherCount} ⭐`, "#c4b5fd");
          }
        }
      }
      // "+1 VP per other artist on all of your stages" (Prince)
      if (el.includes("vp per other artist on all")) {
        const totalOthers = (playerData[pid]?.stageArtists || []).flat().filter(a => a.name !== artist.name).length;
        if (totalOthers > 0) {
          setPlayerData(p => ({ ...p, [pid]: { ...p[pid], vp: (p[pid].vp || 0) + totalOthers } }));
          addLog("Effect", `${artist.name}: +${totalOthers} VP (${totalOthers} other artists on stages)`);
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
          (results) => { if (results.some(d => d === "fame")) { setPlayerData(p => ({ ...p, [pid]: { ...p[pid], baseFame: Math.min(FAME_MAX, (p[pid].baseFame || 0) + 1) } })); showFloatingBonus("+1 🔥", "#f97316"); } setTimeout(() => recalcTickets(), 50); }
        );
      }
      // "-2 VP. Draw an artist objective" (Missy Elliott) — append to player's objectives list
      if (el.includes("draw an artist objective")) {
        // Draw from objective deck if available
        if (objectiveDeck && objectiveDeck.length > 0) {
          const newObj = objectiveDeck[Math.floor(Math.random() * objectiveDeck.length)];
          // playerObjectives[pid] is an ARRAY of { obj, completed, vpAwarded } — append, don't overwrite.
          // Previous bug: this assigned the raw newObj object directly, breaking subsequent .map() calls.
          setPlayerObjectives(prev => {
            const existing = Array.isArray(prev[pid]) ? prev[pid] : [];
            return { ...prev, [pid]: [...existing, { obj: newObj, completed: false, vpAwarded: false }] };
          });
          addLog("Effect", `${artist.name}: Drew new artist objective: ${newObj.name}`);
          showFloatingBonus(`📋 ${newObj.name}`, "#c4b5fd");
        } else {
          addLog("Effect", `${artist.name}: No objectives available to draw`);
        }
      }
      // === -VP effects (Hip Hop risk/reward) ===
      // "-X VP" — generic VP loss patterns
      {
        const vpLossMatch = eff.match(/-(\d+)\s*VP/i);
        if (vpLossMatch) {
          const vpLoss = parseInt(vpLossMatch[1]);
          setPlayerData(p => ({ ...p, [pid]: { ...p[pid], vp: Math.max(0, (p[pid].vp || 0) - vpLoss) } }));
          addLog("Effect", `${artist.name}: -${vpLoss} VP`);
          showFloatingBonus(`-${vpLoss} ⭐`, "#ef4444");
        }
      }
      // "Sell X tickets" — bonus tickets from -VP effects
      {
        const sellMatch = eff.match(/[Ss]ell\s+(\d+)\s+tickets?/i);
        if (sellMatch) {
          const tix = parseInt(sellMatch[1]);
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
          setPlayerData(p => ({ ...p, [pid]: { ...p[pid], baseFame: Math.min(FAME_MAX, (p[pid].baseFame || 0) + fameGain) } }));
          addLog("Effect", `${artist.name}: +${fameGain} Fame`);
          showFloatingBonus(`+${fameGain} 🔥`, "#f97316"); sfx.gainFame();
        }
      }
      // "Roll 1 amenity dice and gain 1 Fame for each Fame shown" (Loyle Carner)
      if (el.includes("roll 1 amenity dice") || el.includes("roll 1 amenity die")) {
        triggerDiceRoll(1, pid, artist.name, "+1 Fame per Fame shown",
          (results) => { const fameCount = results.filter(d => d === "fame").length; if (fameCount > 0) { setPlayerData(p => ({ ...p, [pid]: { ...p[pid], baseFame: Math.min(FAME_MAX, (p[pid].baseFame || 0) + fameCount) } })); showFloatingBonus(`+${fameCount} 🔥`, "#f97316"); } setTimeout(() => recalcTickets(), 50); }
        );
      }
      // === Ticket effects ===
      if (el.includes("+4 ticket sales")) {
        setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + 4 } }));
        addLog("Effect", `${artist.name}: +4 ticket sales`); showFloatingBonus("+4 🎟️", "#fbbf24");
      }
      if (el.includes("+5 ticket sales")) {
        setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + 5 } }));
        addLog("Effect", `${artist.name}: +5 ticket sales`); showFloatingBonus("+5 🎟️", "#fbbf24");
      }
      // "+1 ticket sale for all players"
      if (el.includes("ticket sale for all players") || el.includes("ticket sales for all players")) {
        players.forEach(p => {
          setPlayerData(prev => ({ ...prev, [p.id]: { ...prev[p.id], bonusTickets: (prev[p.id].bonusTickets || 0) + 1 } }));
        });
        addLog("Effect", `${artist.name}: +1 ticket for ALL players!`);
        showFloatingBonus("+1 🎟️ all!", "#fbbf24");
      }
      // "+1 ticket sale / Current Fame Level"
      if (el.includes("ticket sale / current fame") || el.includes("ticket / current fame")) {
        const fame = playerData[pid]?.fame || 0;
        if (fame > 0) {
          setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + fame } }));
          addLog("Effect", `${artist.name}: +${fame} tickets (1 per Fame level)`);
          showFloatingBonus(`+${fame} 🎟️`, "#fbbf24");
        }
      }
      // "+1 ticket / Negative Star Face avoided this year" (rethemed from event)
      if (el.includes("ticket / negative event this year") || el.includes("ticket / negative event") || el.includes("ticket / negative star")) {
        const avoidedCount = negStarFacesAvoidedThisYear[pid] || 0;
        if (avoidedCount > 0) {
          setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + avoidedCount } }));
          addLog("Effect", `${artist.name}: +${avoidedCount} tickets (1 per neg. star avoided)`);
          showFloatingBonus(`+${avoidedCount} 🎟️`, "#fbbf24");
        }
      }
      // "+1 ticket / amenity adjacent to this artist's stage"
      if (el.includes("ticket / amenity adjacent") || el.includes("ticket/ amenity adjacent")) {
        const pd = playerData[pid];
        const am = pd.amenities || {};
        // Total amenities the player has built (no longer spatial — flat sum)
        const adjCount = (am.campsite || 0) + (am.security || 0) + (am.catering || 0) + (am.portaloo || 0);
        if (adjCount > 0) {
          setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + adjCount } }));
          addLog("Effect", `${artist.name}: +${adjCount} tickets (per amenity)`);
          showFloatingBonus(`+${adjCount} 🎟️`, "#fbbf24");
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
    if (el.includes("+1 amenity") || el.includes("gain 1 amenity")) {
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
      setPendingEffect({ type: "signArtist", artistName: artist.name, canRefresh: false, signCount: times });
      setPendingEffectPid(pid);
      addLog("Effect", `${artist.name}: Immediately book ${times > 1 ? times + " artists" : "another artist"}!`);
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
            (results) => { const fameCount = results.filter(d => d === "fame").length; if (fameCount > 0) { setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + fameCount * 2 } })); showFloatingBonus(`+${fameCount * 2} 🎟️`, "#fbbf24"); } setTimeout(() => recalcTickets(), 50); }
          );
        } else if (el.includes("most common") || el.includes("best streak")) {
          triggerDiceRoll(rollCount, pid, artist.name,
            (results) => { const counts = {}; results.forEach(d => { counts[d] = (counts[d] || 0) + 1; }); const best = Math.max(...Object.values(counts)); return `Best streak: ${best} = +${best} VP`; },
            (results) => { const counts = {}; results.forEach(d => { counts[d] = (counts[d] || 0) + 1; }); const best = Math.max(...Object.values(counts)); if (best > 0) { setPlayerData(p => ({ ...p, [pid]: { ...p[pid], vp: (p[pid].vp || 0) + best } })); showFloatingBonus(`+${best} ⭐`, "#c4b5fd"); sfx.gainVP(); } setTimeout(() => recalcTickets(), 50); }
          );
        } else if (el.includes("unique") && el.includes("ticket")) {
          triggerDiceRoll(rollCount, pid, artist.name,
            (results) => { const unique = new Set(results).size; return `${unique} unique results = +${unique} tickets`; },
            (results) => { const unique = new Set(results).size; if (unique > 0) { setPlayerData(p => ({ ...p, [pid]: { ...p[pid], bonusTickets: (p[pid].bonusTickets || 0) + unique } })); showFloatingBonus(`+${unique} 🎟️`, "#fbbf24"); } setTimeout(() => recalcTickets(), 50); }
          );
        } else if (el.includes("unique") && el.includes("vp")) {
          triggerDiceRoll(rollCount, pid, artist.name,
            (results) => { const unique = new Set(results).size; return `${unique} unique results = +${unique} VP`; },
            (results) => { const unique = new Set(results).size; if (unique > 0) { setPlayerData(p => ({ ...p, [pid]: { ...p[pid], vp: (p[pid].vp || 0) + unique } })); showFloatingBonus(`+${unique} ⭐`, "#c4b5fd"); sfx.gainVP(); } setTimeout(() => recalcTickets(), 50); }
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
  function bookArtistToStage(artist, stageIdx, pid, viaAgent = false) {
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
      if (isFullLineup) {
        addLog("🎤 Full Lineup", `${players.find(p => p.id === pid)?.festivalName} completed a lineup!`);
      }
      return { ...prev, [pid]: pd };
    });

    const pd = playerData[pid];
    const sa = pd.stageArtists || pd.stages.map(() => []);
    const slotCount = (sa[stageIdx] || []).length + 1;
    const isHeadliner = slotCount === 3;
    const sName = (pd.stageNames || [])[stageIdx] || `Stage ${stageIdx + 1}`;
    const festival = players.find(p => p.id === pid)?.festivalName;

    // Show the booking popup (headliner popup takes priority if headliner)
    if (isHeadliner) {
      setShowHeadliner({ artist, festival });
      addLog("🌟 HEADLINER", `${artist.name} headlines at ${festival}!`);
      sfx.headliner();
      // Genre beat — kicks in after the headliner sting so they don't clash.
      // Picks the artist's primary (first) genre for multi-genre artists.
      setTimeout(() => sfx.genreBeat(artist.genre), 520);
      applyEffect(artist, pid, 1, stageIdx, viaAgent);
    } else {
      setShowBookedArtist({ artist, stageName: sName, isHeadliner: false, festival });
      sfx.bookArtist();
      applyEffect(artist, pid, 1, stageIdx, viaAgent);
    }

    // Floating bonuses for VP and tickets
    // VP tallied at year end — show ticket bonus only
    if (artist.tickets > 0) { showFloatingBonus(`+${artist.tickets} 🎟️`, "#fbbf24"); sfx.gainTickets(); }

    addLog(festival, `booked ${artist.name} to ${sName}${isHeadliner ? " as HEADLINER!" : ""}`);

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
          let vpGain = 0;
          const updatedObjs = objs.map(entry => {
            if (entry.completed) return entry;
            const result = evalArtistObjective(entry.obj, pd2);
            if (result.completed) { vpGain += 3; return { ...entry, completed: true, vpAwarded: true }; }
            return entry;
          });
          if (vpGain > 0) {
            setPlayerObjectives(prev => ({ ...prev, [pid]: updatedObjs }));
            addLog(festival, `🎯 Completed objective! +${vpGain} VP`);
            showFloatingBonus(`+${vpGain} VP 🎯`, "#c4b5fd");
            // Flag that this player needs a new objective choice
            setPendingObjectiveChoice(prev => prev || { playerId: pid, options: [], needsDraw: true });
            return { ...latestPd, [pid]: { ...pd2, vp: (pd2.vp || 0) + vpGain } };
          }
          return latestPd;
        });
      }, 200);
    }
    // Check microtrends — first player to book matching genre claims a genre-kind microtrend.
    // Amenity-kind microtrends are claimed via amenity placement (handled separately).
    setMicrotrends(prev => prev.map(mt => {
      if (mt.claimedBy !== null) return mt;
      if (mt.kind !== "genre") return mt;
      if (getGenres(artist.genre).includes(mt.genre)) {
        setPlayerData(p => ({ ...p, [pid]: { ...p[pid], baseFame: Math.min(FAME_MAX, (p[pid].baseFame || 0) + 1) } }));
        addLog("🎵 Microtrend", `${festival} claimed "${mt.genre}" microtrend → +1 🔥 Fame!`);
        showFloatingBonus(`🎵 ${mt.genre} Microtrend!`, GENRE_COLORS[mt.genre] || "#fbbf24");
        return { ...mt, claimedBy: pid };
      }
      return mt;
    }));

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
          setPlayerData(prev => ({ ...prev, [p.id]: { ...prev[p.id], vp: (prev[p.id].vp || 0) + 3 } }));
          addLog(p.festivalName, `🎯 Completed "${entry.obj.name}" → +3 VP!`);
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
      data[p.id] = { stages: [], fields, amenities: sumFields(fields), fame: 0, baseFame: 0, vpPerSecurity: 0, vp: 0, tickets: 0, rawTickets: 0, setupAmenity: null, setupField: null, hand: [], stageArtists: [], bonusTickets: 0, stageNames: [], stageColors: [], heldDice: 0, fameHighWater: 0, filledStagesHighWater: 0, councilsDealt: dealt, councils: [null, null, null], councilDiceGrantedThisYear: [false, false, false] };
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

    // Initialize 3 Lineup Objectives
    drawInitialLineupObjectives();
    setActiveGoals([]);
    setGoalProgress({});

    // Skip straight to objective view (no council step)
    setSetupStep("viewObjective");
    setSetupDraftOptions([]); setSetupDraftSelected([]);
    setPhase("setup"); addLogH("Setup Phase", "year");
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
    setSetupStep("councilDraft");
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
      setSetupDraftOptions([]); setSetupDraftSelected([]);
      setSetupCouncilSelected([]); setSetupCouncilAssignments({});
      setSetupStep("viewObjective");
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
        setPlayerData(prev => ({ ...prev, [pid]: { ...prev[pid], vp: (prev[pid].vp || 0) + vpGain } }));
        addLog(players.find(p => p.id === pid)?.festivalName || "", `🎯 Completed objective! +${vpGain} VP`);
        showFloatingBonus(`+${vpGain} VP 🎯`, "#c4b5fd");
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

    const order = players.map(p => p.id); setTurnOrder(order); setCurrentPlayerIdx(0);
    const tl = {}; order.forEach(id => { tl[id] = TURNS_PER_YEAR[1]; }); setTurnsLeft(tl);
    setYear(1); setDice(rollDice()); setShowTurnStart(false); setTurnAction(null); setActionTaken(false);
    // Reset year-scoped latches
    positionalGrantedYearRef.current = 0;
    // Init Star Dice shared pool (replaces old event deck)
    const poolSize = STAR_DICE_POOL_BY_PLAYER_COUNT[players.length] || 12;
    setDicePool(poolSize);
    setNegStarFacesAvoidedThisYear({});
    // Init microtrends — active trend now + one forecast for the "coming up next" preview
    const mt = generateMicrotrends();
    setMicrotrends(mt);
    // Forecast: a peek at what will replace the active microtrend after it's claimed.
    // Built to avoid duplicating any currently active trend.
    const usedGenres = new Set(mt.filter(m => m.kind === "genre").map(m => m.genre));
    const usedAmenities = new Set(mt.filter(m => m.kind === "amenity").map(m => m.amenity));
    const nextMt = makeMicrotrend(usedGenres, usedAmenities);
    setNextMicrotrend(nextMt);
    const describeMt = (m) => m.kind === "amenity" ? `Place a ${AMENITY_LABELS[m.amenity]}` : `Book a ${m.genre} artist`;
    addLog("🎵 Microtrend", `${mt.map(describeMt).join(" • ")} (coming up: ${describeMt(nextMt)})`);
    // Offer first human player their objective choice, auto-assign AI
    let firstHumanId = null;
    const order0 = players.map(p => p.id);
    for (const p of players) {
      if (p.isAI) {
        // Auto-assign: draw 2, pick random
        const d = [...objectiveDeck];
        if (d.length >= 2) {
          const opt1 = d.pop(); const opt2 = d.pop();
          const pick = Math.random() < 0.5 ? opt1 : opt2;
          const reject = pick === opt1 ? opt2 : opt1;
          setPlayerObjectives(prev => ({ ...prev, [p.id]: [{ obj: pick, completed: false, vpAwarded: false }] }));
          setObjectiveDeck(shuffle([...d, reject]));
          addLog(p.festivalName, `chose objective: ${pick.name}`);
        }
      } else if (!firstHumanId) {
        firstHumanId = p.id;
      }
    }
    if (firstHumanId !== null) {
      offerObjectiveChoice(firstHumanId);
      setPhase("objectiveChoice");
    } else {
      // All AI — skip to game
      setPhase("game");
    }
    setTimeout(() => recalcTickets(), 50); addLogH("Year 1 Begins", "year"); addLogH(`${players[0]?.festivalName}'s Turn`, "turn");
    setShowYearAnnouncement(true);
  };

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

  const isCurrentPlayerAI = () => {
    if (phase === "setup") return players[setupIndex]?.isAI;
    if (phase === "game") return currentPlayer?.isAI;
    // Pre-round: each player walks the stage-open + free-draw flow in turn.
    // The "current" player is the one preRoundIndex points at, not the regular turn order.
    if (phase === "preRound") return currentPreRoundPlayer?.isAI || false;
    // Year-end effects auto-resolve for AI within their flow.
    if (phase === "yearEndEffects") return true;
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
            updated = { ...updated, vp: (updated.vp || 0) + cur.vpPerSecurity };
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
      if (pe.type === "signArtist") {
        const remaining = pe.signCount || 1;
        const eligible = artistPool.filter(a => !isAgentClaimedByOther(a.name, pid));
        if (eligible.length > 0) {
          const best = [...eligible].sort((a, b) => (b.vp + b.tickets) - (a.vp + a.tickets))[0];
          const idx = artistPool.indexOf(best);
          const np = [...artistPool]; np.splice(idx, 1);
          setPlayerData(p => ({ ...p, [pid]: { ...p[pid], hand: [...p[pid].hand, best] } }));
          addLog("🤖 AI", `Signed ${best.name} from pool`);
          refillPool(np);
        } else if (artistDeck.length > 0) {
          // No eligible pool artist — fall back to deck
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
      const pid = players[setupIndex]?.id;
      if (setupStep === "viewObjective") { confirmViewObjective(); scheduleNext(400); return; }
      if (setupStep === "draftArtist" && setupDraftOptions.length >= 2) {
        const picks = aiDraftSelect(setupDraftOptions);
        setSetupDraftSelected(picks);
        aiProcessing.current = false;
        setTimeout(() => { confirmSetupDraft(); aiTimer.current = setTimeout(() => aiStep(), 500); }, 300);
        return;
      }
      if (setupStep === "councilDraft") {
        // Smart AI: rank councils by score (reward value − condition difficulty), keep top 3
        const pid = currentSetupPlayer.id;
        const dealt = playerData[pid]?.councilsDealt || [];
        if (dealt.length < 3) { aiProcessing.current = false; return; }
        const picks = aiPickCouncilsToKeep(dealt);
        setSetupCouncilSelected(picks);
        aiProcessing.current = false;
        setTimeout(() => { setSetupStep("councilAssign"); aiTimer.current = setTimeout(() => aiStep(), 500); }, 400);
        return;
      }
      if (setupStep === "councilAssign") {
        // Smart AI: assign councils to fields by pickup order (highest-scoring on F0)
        const ids = setupCouncilSelected;
        if (ids.length !== 3) { aiProcessing.current = false; return; }
        const assignments = aiAssignCouncilsToFields(ids);
        setSetupCouncilAssignments(assignments);
        aiProcessing.current = false;
        setTimeout(() => {
          // Manually finalize since confirmCouncilAssign reads state which may not have flushed yet
          const councilsByField = [null, null, null];
          ids.forEach(cid => {
            const fIdx = assignments[cid];
            if (fIdx != null) councilsByField[fIdx] = getCouncilById(cid);
          });
          const pid = currentSetupPlayer.id;
          setPlayerData(p => ({ ...p, [pid]: { ...p[pid], councils: councilsByField, councilsDealt: [] } }));
          addLog(currentSetupPlayer.festivalName, `🤖 assigned councils: ${councilsByField.map((c, i) => `F${i + 1}=${c.name}`).join(", ")}`);
          setSetupCouncilSelected([]); setSetupCouncilAssignments({});
          setSetupStep("pickAmenity");
          aiTimer.current = setTimeout(() => aiStep(), 500);
        }, 500);
        return;
      }
      if (setupStep === "pickAmenity") {
        // Smart AI: pick amenity that progresses the most councils, then best field for it
        const pid = currentSetupPlayer.id;
        const pd = playerData[pid];
        const amenityChoice = aiPickSetupAmenityWithCouncils(pd);
        const fieldChoice = aiPickFieldForAmenity(pd, amenityChoice, year || 1);
        setSetupSelectedAmenity(amenityChoice);
        setSetupSelectedField(fieldChoice);
        aiProcessing.current = false;
        setTimeout(() => { confirmSetupAmenity(amenityChoice, fieldChoice); aiTimer.current = setTimeout(() => aiStep(), 500); }, 300);
        return;
      }
      if (setupStep === "confirm") { confirmSetupPlacement(); scheduleNext(600); return; }
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
        setShowTurnStart(false);
        setTurnNumber(prev => prev + 1);
        // AI: resolve pool agent claims at turn start
        const resolution = resolvePoolAgents(currentPlayerId);
        if (resolution && resolution.type === "uncontested") {
          // Auto-book uncontested agent claim
          const artist = resolution.artist;
          const pd2 = playerData[currentPlayerId] || {};
          const openStages = (pd2.stageArtists || []).map((sa, i) => sa.length < 3 ? i : -1).filter(i => i >= 0);
          if (openStages.length > 0) {
            const si = openStages[0];
            const newPool = [...artistPool]; const idx = newPool.findIndex(a => a.name === artist.name);
            if (idx >= 0) newPool.splice(idx, 1); setArtistPool(newPool);
            bookArtistToStage(artist, si, currentPlayerId, true);
            exhaustAgent(currentPlayerId);
            addLog("🕵️ AI Agent", `${currentPlayer?.festivalName} booked ${artist.name} (uncontested claim)`);
          } else {
            // No open stages — add to hand
            setPlayerData(p => ({ ...p, [currentPlayerId]: { ...p[currentPlayerId], hand: [...p[currentPlayerId].hand, artist] } }));
            const newPool = [...artistPool]; const idx = newPool.findIndex(a => a.name === artist.name);
            if (idx >= 0) newPool.splice(idx, 1); setArtistPool(newPool);
            exhaustAgent(currentPlayerId);
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
      if (pendingAgentArtist) {
        const pa = pendingAgentArtist;
        const pd2 = playerData[pa.pid] || {};
        const openStages = (pd2.stageArtists || []).map((sa, i) => sa.length < 3 ? i : -1).filter(i => i >= 0);
        if (openStages.length > 0) {
          const newPool = [...artistPool]; const idx = newPool.findIndex(a => a.name === pa.artist.name);
          if (idx >= 0) newPool.splice(idx, 1); setArtistPool(newPool);
          bookArtistToStage(pa.artist, openStages[0], pa.pid, true);
          exhaustAgent(pa.pid);
          addLog("🕵️ AI Agent", `Booked ${pa.artist.name} (agent claim)`);
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
      const decision = aiDecideTurn(pd, artistPool, dice, year, lineupObjectives);
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
            const pk = aiPickDie(cd2, pd, null);
            const nd2 = [...cd2]; nd2.splice(pk.idx, 1); setDice(nd2);
            if (pk.type === "fame") {
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
        // AI Draw 2: pick best combo from pool + deck
        const protectedNames = getAgentProtectedNames();
        const pickable = artistPool.filter(a => !protectedNames.has(a.name));
        const drawn = [];
        
        // Strategy: take best from pool, then best from remaining pool or deck
        if (pickable.length >= 2) {
          const sorted = [...pickable].sort((a, b) => (b.vp + b.tickets) - (a.vp + a.tickets));
          const deckTop = artistDeck.length > 0 ? artistDeck[artistDeck.length - 1] : null;
          // Compare: 2 pool vs 1 pool + 1 deck
          const twoPoolVal = sorted[0].vp + sorted[0].tickets + sorted[1].vp + sorted[1].tickets;
          const mixedVal = sorted[0].vp + sorted[0].tickets + (deckTop ? deckTop.vp + deckTop.tickets : 0);
          if (twoPoolVal >= mixedVal) {
            drawn.push(sorted[0], sorted[1]);
            const newPool = artistPool.filter(a => a !== sorted[0] && a !== sorted[1]);
            setArtistPool(newPool);
          } else {
            drawn.push(sorted[0]);
            setArtistPool(artistPool.filter(a => a !== sorted[0]));
            const deckDrawn = drawFromDeck(1);
            if (deckDrawn.length > 0) drawn.push(deckDrawn[0]);
          }
        } else if (pickable.length === 1) {
          drawn.push(pickable[0]);
          setArtistPool(artistPool.filter(a => a !== pickable[0]));
          const deckDrawn = drawFromDeck(1);
          if (deckDrawn.length > 0) drawn.push(deckDrawn[0]);
        } else {
          // No pickable pool artists — draw 2 from deck
          const deckDrawn = drawFromDeck(2);
          drawn.push(...deckDrawn);
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
      const pick = aiPickDie(currentDice, pd, decision.preferredType);
      const dieVal = currentDice[pick.idx];

      if (dieVal === "fame" || pick.type === "fame") {
        // Fame die
        const nd = [...currentDice]; nd.splice(pick.idx, 1); setDice(nd);
        setPlayerData(p => ({ ...p, [currentPlayerId]: { ...p[currentPlayerId], baseFame: Math.min(FAME_MAX, (p[currentPlayerId].baseFame || 0) + 1) } }));
        addLog("🤖 AI", `Rolled 🔥 Fame!`);
        trackGoalProgress(currentPlayerId, "fameDieRolls");
        setTurnsLeft(p => ({ ...p, [currentPlayerId]: p[currentPlayerId] - 1 }));
        setActionTaken(true); setTimeout(() => recalcTickets(), 50);
        scheduleNext(500); return;
      }

      // Resolve die to amenity type — use the AI's preferred type for OR dice
      let amenityType = pick.type || dieVal;
      if (dieVal === "catering_or_portaloo") amenityType = pick.type || "catering";
      else if (dieVal === "security_or_campsite") amenityType = pick.type || "security";

      // Remove die, increment amenity counter directly — pick smart field based on councils
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
  }, [phase, setupStep, setupIndex, currentPlayerIdx, showTurnStart, actionTaken, noTurnsLeft, pendingEffect, pendingDiceRoll, showHeadliner, showBookedArtist, showCouncilDrawBonus, showYearAnnouncement, preRoundStep, preRoundIndex, freeAmenityPlaced, agentContest]);

  // AI objective choices are handled in startGame — no useEffect needed

  // ═══════════════════════════════════════════════════════════
  // TURN ACTIONS
  // ═══════════════════════════════════════════════════════════
  const handlePickAmenity = () => { setTurnAction("pickAmenity"); if (dice.length === 0) setDice(rollDice()); };
  // Direct amenity placement when player picks a die. Build 1: defaults to field 0.
  // Build 2 will accept a fieldIdx parameter and the UI will prompt for selection.
  // Check microtrends — amenity-kind microtrends are claimed by the first player to place
  // a matching amenity. Reward is +1 Fame, same as genre microtrends. The trigger fires
  // from any deliberate amenity placement (turn action, dice placement, effect-driven gain).
  const claimAmenityMicrotrend = (pid, amenityType) => {
    const festival = players.find(p => p.id === pid)?.festivalName || "?";
    setMicrotrends(prev => prev.map(mt => {
      if (mt.claimedBy !== null) return mt;
      if (mt.kind !== "amenity") return mt;
      if (mt.amenity !== amenityType) return mt;
      setPlayerData(p => ({ ...p, [pid]: { ...p[pid], baseFame: Math.min(FAME_MAX, (p[pid].baseFame || 0) + 1) } }));
      addLog("🎵 Microtrend", `${festival} claimed "${AMENITY_LABELS[amenityType]}" microtrend → +1 🔥 Fame!`);
      showFloatingBonus(`🎵 ${AMENITY_LABELS[amenityType]} Microtrend!`, "#fbbf24");
      setTimeout(() => recalcTickets(), 50);
      return { ...mt, claimedBy: pid };
    }));
  };

  const placeAmenityCounter = (amenityType, fieldIdx = 0) => {
    recalcAfterUpdate(currentPlayerId, pd => mutateAmenity(pd, fieldIdx, amenityType, +1));
    addLog(currentPlayer.festivalName, `built ${AMENITY_LABELS[amenityType]}`);
    checkSecurityVPBonus(currentPlayerId, amenityType);
    claimAmenityMicrotrend(currentPlayerId, amenityType);
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
      setPlayerData(p => ({ ...p, [currentPlayerId]: { ...p[currentPlayerId], baseFame: Math.min(FAME_MAX, (p[currentPlayerId].baseFame || 0) + 1) } }));
      addLog(currentPlayer.festivalName, `rolled 🔥 Fame! +1 Fame this year`);
      trackGoalProgress(currentPlayerId, "fameDieRolls");
      showFloatingBonus("+1 🔥 Fame!", "#f97316");
      sfx.gainFame();
      setTurnsLeft(p => ({ ...p, [currentPlayerId]: p[currentPlayerId] - 1 })); setTurnAction(null); setActionTaken(true); setTimeout(() => recalcTickets(), 50);
      return;
    }
    if (dv === "catering_or_portaloo" || dv === "security_or_campsite") {
      // Player must choose between two amenity types first
      setSelectedDie(idx);
      setChoiceAmenity(dv);
    } else {
      // Lock in amenity, defer to field-pick step
      setSelectedDie(idx);
      setPickingFieldFor(dv);
    }
  };
  const handleChoiceSelect = (type) => {
    setChoiceAmenity(null);
    setPickingFieldFor(type); // selectedDie already set
  };
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
    setChoiceAmenity(null);
  };
  const handleRerollDice = () => {
    setDice(rollDice());
    addLog("Dice", "Rerolled all amenity dice");
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
    if (!canAffordArtist(artist, currentPD)) return;
    const avail = currentPD.stages.map((_, i) => (currentPD.stageArtists?.[i] || []).length < 3 ? i : -1).filter(i => i >= 0);
    if (avail.length === 0) return;
    setSelectedArtist({ artist, source: "pool", poolIdx: idx }); setArtistAction("pickStage");
  };
  const handleBookFromHand = (idx) => {
    const artist = currentPD.hand[idx];
    if (!canAffordArtistOrFree(artist, currentPD)) return;
    const avail = currentPD.stages.map((_, i) => (currentPD.stageArtists?.[i] || []).length < 3 ? i : -1).filter(i => i >= 0);
    if (avail.length === 0) return;
    setSelectedArtist({ artist, source: "hand", handIdx: idx }); setArtistAction("pickStage");
  };
  const handleBookFromDiscard = () => {
    if (discardPile.length === 0) return;
    const artist = discardPile[discardPile.length - 1]; // top of discard
    if (!canAffordArtist(artist, currentPD)) return;
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
    trackGoalProgress(currentPlayerId, "artistsSigned");
    // Council reward: drawArtists councils give +N additional artists from the deck
    applyDrawArtistsBonus(currentPlayerId);
    setTurnsLeft(p => ({ ...p, [currentPlayerId]: p[currentPlayerId] - 1 })); setTurnAction(null); setActionTaken(true); setArtistAction(null);
    setTimeout(() => recalcTickets(), 50);
  };

  // ── DRAW 2 FLOW ──
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
    const newPicks = [...draw2Picks, artist];
    setDraw2Picks(newPicks);
    addLog(currentPlayer.festivalName, `drew ${artist.name} from pool (${newPicks.length}/2)`);
    if (newPicks.length >= 2) finishDraw2(newPicks);
  };
  const draw2PickFromDeck = () => {
    const drawn = drawFromDeck(1);
    if (drawn.length === 0) { addLog("Deck", "No artists left!"); return; }
    // Drawing from deck = no undo (hidden information revealed) and no put back
    setUndoSnapshot(null);
    const newPicks = [...draw2Picks, drawn[0]];
    setDraw2Picks(newPicks);
    addLog(currentPlayer.festivalName, `drew ${drawn[0].name} from deck (${newPicks.length}/2)`);
    if (newPicks.length >= 2) finishDraw2(newPicks);
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
    bookArtistToStage(artist, stageIdx, currentPlayerId);
    setTurnsLeft(p => ({ ...p, [currentPlayerId]: p[currentPlayerId] - 1 })); setTurnAction(null); setActionTaken(true); setArtistAction(null); setSelectedArtist(null); setSelectedStageIdx(null);
  };

  // ═══════════════════════════════════════════════════════════
  // END TURN / ROUND END
  // ═══════════════════════════════════════════════════════════
  const endTurn = () => {
    setUndoSnapshot(null);
    addLog(currentPlayer?.festivalName || "?", "ended their turn");
    setTurnAction(null); setSelectedDie(null); setChoiceAmenity(null); setPickingFieldFor(null); setActionTaken(false); setArtistAction(null); setSelectedArtist(null); setShowHand(false); setDeckDrawnCard(null); setDeckCardRevealed(false); setViewingPlayerId(null); setCouncilRefreshUsedThisTurn(false);
    setPendingEffect(null); setPendingEffectPid(null); setPendingDiceRoll(null);

    // Evaluate council objectives for current player before moving on
    evaluateCouncils(currentPlayerId);

    // Microtrend overhaul: any claimed microtrend is replaced by the FORECAST microtrend
    // at the end of the claimer's turn — so the previously-shown "Coming Up Next" becomes
    // the new active trend, and a fresh forecast is rolled. This gives players advance
    // notice of what's coming and lets them position to contest the next trend.
    setMicrotrends(prev => {
      let anyReplaced = false;
      const next = prev.map(mt => {
        if (mt.claimedBy === null) return mt;
        anyReplaced = true;
        return nextMicrotrend || makeMicrotrend(new Set(), new Set());
      });
      return anyReplaced ? next : prev;
    });
    // Generate a new forecast that doesn't duplicate the (newly active) trend.
    if (microtrends.some(mt => mt.claimedBy !== null)) {
      const promoted = nextMicrotrend;
      if (promoted) {
        const usedGenres = new Set();
        const usedAmenities = new Set();
        if (promoted.kind === "genre") usedGenres.add(promoted.genre);
        if (promoted.kind === "amenity") usedAmenities.add(promoted.amenity);
        const fresh = makeMicrotrend(usedGenres, usedAmenities);
        setNextMicrotrend(fresh);
        if (fresh.kind === "genre") {
          addLog("🎵 Forecast", `Next microtrend: book a ${fresh.genre} artist`);
        } else {
          addLog("🎵 Forecast", `Next microtrend: place a ${AMENITY_LABELS[fresh.amenity]}`);
        }
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

    // Refill pool to 5 before next player's turn
    refillPool();

    setCurrentPlayerIdx(ni);
    const np = players.find(p => p.id === turnOrder[ni]);
    addLogH(`${np?.festivalName || "?"}'s Turn`, "turn");
    
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
        } else {
          // Generic year-end: -VP / sell tickets
          const vpLoss = rawEff.match(/Year End:.*-(\d+)\s*VP/i);
          const sellTix = rawEff.match(/Year End:.*[Ss]ell\s+(\d+)\s+tickets?/i);
          if (vpLoss || sellTix) {
            const vp = vpLoss ? -parseInt(vpLoss[1]) : 0;
            const tix = sellTix ? parseInt(sellTix[1]) : 0;
            effects.push({ artist: a, type: "autoVPTix", desc: `${vpLoss ? `-${vpLoss[1]} VP` : ""}${vpLoss && sellTix ? " / " : ""}${sellTix ? `+${sellTix[1]} tickets` : ""}`, autoVP: vp, autoTix: tix });
          }
        }
      }));
      allEffects[p.id] = effects;
      if (effects.length > 0) anyEffects = true;
    });

    if (!anyEffects) {
      // No year-end artist effects — but still need fresh tickets/fame snapshot for positional grants
      const prev = playerDataRef.current || {};
      const fresh = {};
      Object.keys(prev).forEach(pid => { fresh[pid] = computeTicketsForPlayer(prev[pid]); });
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
        setPlayerData(p => ({ ...p, [pid]: { ...p[pid], vp: Math.max(0, (p[pid].vp || 0) + (effect.autoVP || 0)) } }));
        addLog("🎸 Year End", `${players[yearEndEffectsPlayer]?.festivalName}: ${effect.artist?.name} → +${effect.autoVP} VP`);
      } else if (effect.type === "autoVPTix") {
        setPlayerData(p => ({
          ...p, [pid]: {
            ...p[pid],
            vp: Math.max(0, (p[pid].vp || 0) + (effect.autoVP || 0)),
            bonusTickets: (p[pid].bonusTickets || 0) + (effect.autoTix || 0)
          }
        }));
        addLog("🎸 Year End", `${players[yearEndEffectsPlayer]?.festivalName}: ${effect.artist?.name} → ${effect.desc}`);
      } else if (effect.type === "rollUnique" || effect.type === "rollCommon") {
        if (result?.vp) {
          setPlayerData(p => ({ ...p, [pid]: { ...p[pid], vp: (p[pid].vp || 0) + result.vp } }));
          addLog("🎸 Year End", `${players[yearEndEffectsPlayer]?.festivalName}: ${effect.artist?.name} → +${result.vp} VP`);
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
          // Compute the fresh snapshot synchronously and prime playerDataRef so grantPositionalDice
          // (which runs inside beginStarDicePhase via the ref) reads the just-recomputed values
          // rather than the pre-recalc closure / pre-render React state.
          setTimeout(() => {
            try {
              const prev = playerDataRef.current || {};
              const fresh = {};
              Object.keys(prev).forEach(pid => { fresh[pid] = computeTicketsForPlayer(prev[pid]); });
              setPlayerData(fresh);
              playerDataRef.current = fresh;
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
    // Evaluate councils before rolling so ticket counts are final
    players.forEach(p => evaluateCouncils(p.id));
    addLogH(`Year ${year} — Star Dice Roll`, "round");
    // Grant positional rewards (most fame, most/least tickets) BEFORE rolling so they're rolled this year
    grantPositionalDice();
    setStarRollPlayer(0);
    setStarRollResult(null);
    setStarRollPhase("intro");
    setNegStarFacesAvoidedThisYear({});
    setPhase("starDice");
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
      return { ...p, [pid]: {
        ...updated,
        vp: (updated.vp || 0) + vpFromStars,
        starDiceVPThisYear: (updated.starDiceVPThisYear || 0) + vpFromStars,
        heldDice: 0,
      } };
    });
    // Return dice to pool
    setDicePool(pool => pool + faces.length);
    // Track avoided count for "+VP per neg star avoided" effects
    setNegStarFacesAvoidedThisYear(prev => ({ ...prev, [pid]: (prev[pid] || 0) + absorbed }));
    const pName = players.find(p => p.id === pid)?.festivalName || "?";
    const lostStr = lossesByField.map(d => `${AMENITY_LABELS[d.amenity]} (F${(d.lostFromField ?? 0) + 1})`).join(", ");
    addLog(pName, `🎲 Rolled ${stars} stars (+${vpFromStars} VP)${absorbed ? `, absorbed ${absorbed}` : ""}${lostStr ? `, lost ${lostStr}` : ""}`);
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
    // Collect all data BEFORE any setState
    const logs = [];
    const nat = { ...allTickets };
    // Use ref-fresh playerData rather than closure-captured. beginRoundEnd is invoked via
    // setTimeout from applyStarRoll, so the closure-captured `playerData` predates the
    // last star-roll's setPlayerData update. Reading from the ref ensures the most recent
    // star-VP additions (and any other in-flight player state) are visible in the leaderboard.
    const latestPD = playerDataRef.current || playerData;
    const snap = JSON.parse(JSON.stringify(latestPD));
    
    // PASS 1: Calculate tickets for all players
    const playerTickets = {};
    for (const p of players) {
      const pd = snap[p.id];
      if (!pd) continue;
      let t = ((pd.amenities?.campsite) || 0) * 2;
      (pd.stageArtists || []).forEach(sa => sa.forEach(a => { t += a.tickets || 0; }));
      t += pd.bonusTickets || 0;
      playerTickets[p.id] = t;
    }
    
    // Find player(s) with most tickets
    const maxTickets = Math.max(...Object.values(playerTickets));
    const ticketLeaders = players.filter(p => playerTickets[p.id] === maxTickets);
    
    // PASS 2: Calculate VP
    for (const p of players) {
      const pd = snap[p.id];
      if (!pd) continue;
      let vpBonus = 0;
      const rawT = playerTickets[p.id];
      
      const computeFame = (pdata, tickets) => {
        let f = pdata.baseFame || 0;
        f += Math.floor((tickets || 0) / 10);
        return Math.min(FAME_MAX, f);
      };

      const fame = computeFame(pd, rawT);
      // Artist VP
      let artistVP = 0;
      (pd.stageArtists || []).forEach(sa => sa.forEach(a => { artistVP += a.vp || 0; }));
      vpBonus += artistVP;
      const fameVP = FAME_VP[Math.min(5, fame)] || 0;
      // Most-tickets no longer awards VP (still triggers positional Star Dice via grantPositionalDice)
      const ticketVP = 0;
      vpBonus += fameVP + ticketVP;
      // Year-end artist effects
      let effectVP = 0;
      (pd.stageArtists || []).forEach(sa => sa.forEach(a => {
        try {
          const eff = (a.effect || "").toLowerCase();
          // Reflavored from "neg event avoided" → "neg star face avoided" — 2 VP each
          if (eff.includes("vp / negative event avoided") || eff.includes("vp / negative star")) {
            effectVP += 2 * (negStarFacesAvoidedThisYear?.[p.id] || 0);
          }
          // Old "vp / negative event that hit" effect retired (no longer a thing)
        } catch(err) { /* skip */ }
      }));
      vpBonus += effectVP;
      if (!nat[p.id]) nat[p.id] = {};
      // Recalculate after year-end effects
      const finalFame = computeFame(pd, rawT);
      const finalFameVP = FAME_VP[Math.min(5, finalFame)] || 0;
      vpBonus += (finalFameVP - fameVP);
      // Star dice VP was applied to pd.vp during the roll phase, before this scoring runs.
      // For the year-end breakdown, we want to show "preYearVP" as the score going INTO this year,
      // then add starDiceVP + other bonuses on top — so we subtract starDiceVP from the visible preYearVP
      // and include it in totalYearVP. This keeps the equation preVP + totalYearVP = currentVP truthful.
      const starDiceVP = pd.starDiceVPThisYear || 0;
      const preYearVP = (pd.vp || 0) - starDiceVP;
      // totalYearVP is for the breakdown display (shows everything earned this year, including
      // the star-dice VP that was already added in applyStarRoll). yearEndDelta is the actual
      // VP delta to ADD to cur.vp during the merge — it excludes starDiceVP because that's
      // already part of cur.vp. Using totalYearVP in the merge would double-count star VP.
      nat[p.id][year] = { raw: rawT, fame: finalFame, fameVP: finalFameVP, ticketVP, artistVP, councilVP: 0, effectVP, starDiceVP, preYearVP, totalYearVP: vpBonus + starDiceVP, yearEndDelta: vpBonus };
      logs.push({ type: "entry", who: p.festivalName, text: `🎟️ ${rawT} tickets${ticketVP ? " 👑+1VP" : ""} | 🔥${finalFame}→${finalFameVP}VP | Artists+${artistVP}VP` });
      // Store computed values back into snap for use by subsequent players
      snap[p.id] = { ...pd, tickets: rawT, rawTickets: rawT, fame: finalFame, vp: (pd.vp || 0) + vpBonus };
    }
    
    if (ticketLeaders.length === 1) {
      logs.push({ type: "entry", who: "🎟️ Tickets", text: `${ticketLeaders[0].festivalName} sold the most tickets (${maxTickets}) → +1 VP!` });
    }

    // Merge year-end calc fields into current playerData via callback form.
    // Important: do NOT overwrite the whole playerData with `snap`, because applyStarRoll's
    // updates (heldDice=0, VP from stars, lost amenities) may not yet be reflected in the
    // closure-captured `playerData` we used to build snap. Only update the recomputed fields,
    // and ADD the year-end VP bonus to whatever cur.vp now is (which already includes star VP).
    setPlayerData(prev => {
      const next = { ...prev };
      for (const p of players) {
        const cur = prev[p.id];
        const sn = snap[p.id];
        if (!cur || !sn) continue;
        const bonus = nat[p.id]?.[year]?.yearEndDelta || 0;
        next[p.id] = {
          ...cur,
          tickets: sn.tickets,
          rawTickets: sn.rawTickets,
          fame: sn.fame,
          vp: (cur.vp || 0) + bonus,
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
    const fameDiffs = []; // { id, festivalName, fameEnd, target } for the log line
    setPlayerData(prev => {
      const next = { ...prev };
      for (const p of players) {
        const pd = next[p.id];
        const fameEnd = pd.fame || 0;
        const target = Math.max(0, fameEnd - 2);
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
    fameDiffs.forEach(({ festivalName, fameEnd, target }) => {
      const delta = target - fameEnd; // negative
      addLog(festivalName, `Year transition: 🔥 Fame ${fameEnd} → ${target} (${delta} carryover)`);
    });
    setPreRoundIndex(0); setPreRoundStep("notify");
    setFreeAmenityCount(0); setFreeAmenityPlaced(0); setFreeAmenityType(null);
    setPhase("preRound");
  };

  // Pre-round — ALL players participate
  const preRoundPlayers = players; // everyone now
  const currentPreRoundPlayer = preRoundPlayers[preRoundIndex];
  const canOpenStage = currentPreRoundPlayer && (playerData[currentPreRoundPlayer.id]?.fame || 0) >= 3 && (playerData[currentPreRoundPlayer.id]?.stages || []).length < 3;

  const getPreRoundDrawCount = (pd) => {
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
    // Apply artist objective rewards from last year's lineups (BEFORE clearing stages)
    applyObjectiveRewards();
    // Capture pre-round baseFame (from opening stages) BEFORE resetting
    const preRoundFame = {};
    players.forEach(p => { preRoundFame[p.id] = playerData[p.id]?.baseFame || 0; });
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
        const reset = { ...pd, stageArtists: emptyStages, bonusTickets: 0, baseFame: preRoundFame[p.id] || 0, vpPerSecurity: 0, fameHighWater: 0, filledStagesHighWater: 0, starDiceVPThisYear: 0, councilDiceGrantedThisYear: [false, false, false] };
        // Recompute tickets/fame for the NEW year so council ticket/fame bonuses fire immediately
        // (closure's `year` is still the old year here — pass `ny` explicitly)
        next[p.id] = computeTicketsForPlayer(reset, ny);
      }
      return next;
    });
    // Clear the dice trigger latch so the useEffect re-fires for the new year
    diceTriggerLatchRef.current = {};
    setDiscardPile(newDiscard);
    addLog("🔄 New Year", "All stages cleared — artists moved to discard pile");

    // Replace any fully claimed lineup objectives (both 1st and 2nd taken)
    lineupObjectives.forEach((lo, idx) => {
      if (lo && lo.claimed1st !== null) {
        replaceLineupObjective(idx);
      }
    });

    const sorted = [...players].sort((a, b) => (allTickets[a.id]?.[year] || 0) - (allTickets[b.id]?.[year] || 0));
    const no = sorted.map(p => p.id); setTurnOrder(no); setCurrentPlayerIdx(0);
    const tl = {}; no.forEach(id => { tl[id] = TURNS_PER_YEAR[ny]; }); setTurnsLeft(tl);
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
    return [...players].sort((a, b) => { const vd = (playerData[b.id]?.vp || 0) - (playerData[a.id]?.vp || 0); if (vd !== 0) return vd; return Object.values(allTickets[b.id] || {}).reduce((s, v) => s + v, 0) - Object.values(allTickets[a.id] || {}).reduce((s, v) => s + v, 0); })[0];
  }, [phase, players, playerData, allTickets]);

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
  const logBtn = <button onClick={() => setShowLog(!showLog)} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #7c3aed", background: "rgba(124,58,237,0.2)", color: "#c4b5fd", cursor: "pointer", fontWeight: 600, fontSize: 12 }}>📜</button>;
  const discardBtn = phase !== "lobby" && phase !== "setup" ? <button onClick={() => setShowDiscard(true)} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #6b7280", background: "rgba(107,114,128,0.2)", color: "#94a3b8", cursor: "pointer", fontWeight: 600, fontSize: 12 }}>🗑️</button> : null;
  const updateNotesBtn = <button onClick={() => setShowUpdateNotes(true)} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #22c55e", background: "rgba(34,197,94,0.2)", color: "#4ade80", cursor: "pointer", fontWeight: 600, fontSize: 12 }}>📋</button>;
  const leaderboardBtn = phase !== "lobby" && phase !== "setup" ? <button onClick={() => setShowLeaderboard(true)} title="Leaderboard" style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #fbbf24", background: "rgba(251,191,36,0.2)", color: "#fbbf24", cursor: "pointer", fontWeight: 600, fontSize: 12 }}>🏆</button> : null;
  const leaderboardModal = showLeaderboard ? (() => {
    // Live leaderboard — sorted by VP, then tickets, then fame as tiebreakers
    const ranked = [...players].map(p => {
      const pd = playerData[p.id] || {};
      const activeCouncils = (pd.councils || []).filter((c, i) => c && councilQualifies(c, (pd.fields || [])[i], year || 1)).length;
      return { p, pd, vp: pd.vp || 0, tickets: pd.tickets || 0, fame: pd.fame || 0, dice: pd.heldDice || 0, activeCouncils };
    }).sort((a, b) => (b.vp - a.vp) || (b.tickets - a.tickets) || (b.fame - a.fame));
    return <div onClick={() => setShowLeaderboard(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 970, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ ...card, maxWidth: 560, width: "100%", maxHeight: "85vh", overflowY: "auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h2 style={{ color: "#fbbf24", fontSize: 22, margin: 0 }}>🏆 Leaderboard</h2>
          <button onClick={() => setShowLeaderboard(false)} style={{ ...bs, fontSize: 11, padding: "4px 10px" }}>Close ✕</button>
        </div>
        <p style={{ color: "#8b5cf6", fontSize: 11, marginBottom: 12 }}>Year {year} of 4 — sorted by VP, ties broken by tickets then fame</p>
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
              <span style={{ fontSize: 22, fontWeight: 900, color: "#fbbf24" }}>⭐ {r.vp}</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 4, fontSize: 11, color: "#94a3b8" }}>
              <div><span style={{ color: "#60a5fa" }}>🎟️</span> {r.tickets}</div>
              <div style={{ color: onFire ? "#fb923c" : "#94a3b8", animation: onFire ? "fameFlicker 0.8s ease-in-out infinite" : "none" }}>🔥 {r.fame}</div>
              <div><span style={{ color: "#a78bfa" }}>🎲</span> {r.dice}</div>
              <div><span style={{ color: "#86efac" }}>📋</span> {r.activeCouncils}/3</div>
            </div>
          </div>;
        })}
      </div>
    </div>;
  })() : null;
  const utilButtons = <><div style={{ display: "flex", gap: 6, justifyContent: "flex-end", padding: "4px 12px" }}>{updateNotesBtn}{leaderboardBtn}{discardBtn}{logBtn}</div>{leaderboardModal}</>;
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
  const anim = <style>{`@keyframes fadeSlideIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } } @keyframes headlinerPulse { 0%,100% { transform:scale(1); } 50% { transform:scale(1.05); } } @keyframes affordPulse { 0%,100% { box-shadow: 0 0 4px rgba(251,191,36,0.3); } 50% { box-shadow: 0 0 16px rgba(251,191,36,0.7); } } .obj-hover-parent:hover .obj-hover-tip { display: block !important; max-height: 300px !important; padding: 10px !important; margin-top: 8px !important; opacity: 1 !important; } @keyframes floatUp { 0% { opacity:1; transform:translateY(0) scale(1); } 50% { opacity:1; transform:translateY(-30px) scale(1.2); } 100% { opacity:0; transform:translateY(-60px) scale(0.8); } } @keyframes bookReveal { 0% { opacity:0; transform:scale(0.5) rotate(-5deg); } 50% { transform:scale(1.1) rotate(2deg); } 100% { opacity:1; transform:scale(1) rotate(0deg); } } @keyframes pulse { 0%,100% { transform:scale(1); box-shadow: 0 0 8px rgba(251,191,36,0.3); } 50% { transform:scale(1.05); box-shadow: 0 0 20px rgba(251,191,36,0.6); } } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } @keyframes fameOnFire { 0%,100% { box-shadow: 0 0 12px rgba(249,115,22,0.6), 0 0 24px rgba(239,68,68,0.4); border-color: #f97316; } 50% { box-shadow: 0 0 18px rgba(249,115,22,0.9), 0 0 36px rgba(239,68,68,0.7); border-color: #fbbf24; } } @keyframes fameFlicker { 0%,100% { opacity: 1; } 25% { opacity: 0.85; } 50% { opacity: 1; } 75% { opacity: 0.92; } }`}</style>;

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
      {/* ── Game Options ── */}
      <div style={{ ...card, maxWidth: 520, width: "100%", marginTop: 12 }}>
        <div style={{ color: "#c4b5fd", fontWeight: 700, fontSize: 13, marginBottom: 12, textTransform: "uppercase", letterSpacing: 1 }}>⚙️ Game Options</div>
        {/* Game length */}
        <div style={{ marginBottom: 14 }}>
          <label style={{ color: "#a78bfa", fontWeight: 600, fontSize: 12, display: "block", marginBottom: 6 }}>Game Length</label>
          <div style={{ display: "flex", gap: 8 }}>
            {[3, 4].map(n => <button key={n} onClick={() => setTotalYears(n)} style={{ ...bs, background: totalYears === n ? "linear-gradient(135deg, #7c3aed, #6d28d9)" : "rgba(124,58,237,0.15)", flex: 1, padding: "10px 12px", fontSize: 13 }}>{n} Years</button>)}
          </div>
          <div style={{ color: "#64748b", fontSize: 10, marginTop: 4 }}>{totalYears === 3 ? "Shorter game — faster, fewer rounds to build" : "Standard length"}</div>
        </div>
        {/* Two independent gameplay toggles — were previously bundled as "Tactical Mode" */}
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <label onClick={() => setStageOpenFameBonus(!stageOpenFameBonus)} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10, padding: 10, borderRadius: 10, border: !stageOpenFameBonus ? "2px solid #fbbf24" : "1px solid #4c1d95", background: !stageOpenFameBonus ? "rgba(251,191,36,0.08)" : "rgba(124,58,237,0.05)" }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${stageOpenFameBonus ? "#22c55e" : "#fbbf24"}`, background: stageOpenFameBonus ? "#22c55e" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#1a1a2e", fontWeight: 800 }}>{stageOpenFameBonus ? "✓" : ""}</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: stageOpenFameBonus ? "#86efac" : "#fbbf24", fontWeight: 700, fontSize: 13 }}>+1 Fame when opening a new stage</div>
              <div style={{ color: "#64748b", fontSize: 11, marginTop: 2 }}>{stageOpenFameBonus ? "Standard — opening a stage during the pre-round grants +1 Fame." : "Off — opening a stage costs the action but gives no Fame. Fame is scarcer."}</div>
            </div>
          </label>
          <label onClick={() => setPreRoundArtistDraws(!preRoundArtistDraws)} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10, padding: 10, borderRadius: 10, border: !preRoundArtistDraws ? "2px solid #fbbf24" : "1px solid #4c1d95", background: !preRoundArtistDraws ? "rgba(251,191,36,0.08)" : "rgba(124,58,237,0.05)" }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${preRoundArtistDraws ? "#22c55e" : "#fbbf24"}`, background: preRoundArtistDraws ? "#22c55e" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#1a1a2e", fontWeight: 800 }}>{preRoundArtistDraws ? "✓" : ""}</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: preRoundArtistDraws ? "#86efac" : "#fbbf24", fontWeight: 700, fontSize: 13 }}>Free artist draws between years</div>
              <div style={{ color: "#64748b", fontSize: 11, marginTop: 2 }}>{preRoundArtistDraws ? "Standard — players get one free artist draw per stage in the pre-round." : "Off — artists only come from turn actions. Tighter card economy."}</div>
            </div>
          </label>
          <label onClick={() => setStagesProvideNoFame(!stagesProvideNoFame)} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10, padding: 10, borderRadius: 10, border: stagesProvideNoFame ? "2px solid #fbbf24" : "1px solid #4c1d95", background: stagesProvideNoFame ? "rgba(251,191,36,0.08)" : "rgba(124,58,237,0.05)" }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${stagesProvideNoFame ? "#fbbf24" : "#4c1d95"}`, background: stagesProvideNoFame ? "#fbbf24" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#1a1a2e", fontWeight: 800 }}>{stagesProvideNoFame ? "✓" : ""}</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: stagesProvideNoFame ? "#fbbf24" : "#c4b5fd", fontWeight: 700, fontSize: 13 }}>Stages provide no base Fame</div>
              <div style={{ color: "#64748b", fontSize: 11, marginTop: 2 }}>{stagesProvideNoFame ? "On — master switch: no Fame can come from stages regardless of the toggle above. Fame must come from artists, microtrends, dice, councils." : "Off — stage Fame follows the toggle above. Default."}</div>
            </div>
          </label>
          <label onClick={() => setAgentEffectsEnabled(!agentEffectsEnabled)} style={{ cursor: "pointer", display: "flex", alignItems: "center", gap: 10, padding: 10, borderRadius: 10, border: !agentEffectsEnabled ? "2px solid #fbbf24" : "1px solid #4c1d95", background: !agentEffectsEnabled ? "rgba(251,191,36,0.08)" : "rgba(124,58,237,0.05)" }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, border: `2px solid ${agentEffectsEnabled ? "#22c55e" : "#fbbf24"}`, background: agentEffectsEnabled ? "#22c55e" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#1a1a2e", fontWeight: 800 }}>{agentEffectsEnabled ? "✓" : ""}</div>
            <div style={{ flex: 1 }}>
              <div style={{ color: agentEffectsEnabled ? "#86efac" : "#fbbf24", fontWeight: 700, fontSize: 13 }}>🕵️ Agent-booking effects</div>
              <div style={{ color: "#64748b", fontSize: 11, marginTop: 2 }}>{agentEffectsEnabled ? "Standard — 8 artists have bonus effects when booked via an agent (encourages agent play and contests)." : "Off — those artists have only their base effects. Costs stay the same either way."}</div>
            </div>
          </label>
        </div>
      </div>
    </div>{anim}</div>
  );

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

        {setupStep === "councilDraft" && (() => {
          const dealt = playerData[currentSetupPlayer.id]?.councilsDealt || [];
          return <div style={{ ...card, maxWidth: 760, width: "100%", textAlign: "center" }}>
            <h3 style={{ color: "#e9d5ff", marginBottom: 4 }}>Choose your Council Objectives</h3>
            <p style={{ color: "#8b5cf6", fontSize: 12, marginBottom: 12 }}>Keep <strong style={{ color: "#fbbf24" }}>3</strong> of these 5. The other 2 are out of the game.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginBottom: 14 }}>
              {dealt.map(c => {
                const sel = setupCouncilSelected.includes(c.id);
                return <div key={c.id} onClick={() => toggleCouncilKeep(c.id)} style={{
                  padding: 12, borderRadius: 10,
                  border: sel ? "2px solid #fbbf24" : "2px solid #2a2a4a",
                  background: sel ? "rgba(251,191,36,0.12)" : "#1a1a2e",
                  cursor: "pointer", textAlign: "left",
                  boxShadow: sel ? "0 0 12px rgba(251,191,36,0.3)" : "none",
                  transition: "all 0.15s",
                }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: sel ? "#fbbf24" : "#c4b5fd", marginBottom: 6 }}>{sel ? "✓ " : ""}{c.name}</div>
                  <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 4 }}>📋 {formatCouncilCondition(c)}</div>
                  <div style={{ fontSize: 10, color: "#4ade80", fontWeight: 600 }}>🎁 {formatCouncilReward(c)}</div>
                </div>;
              })}
            </div>
            <p style={{ color: "#94a3b8", fontSize: 11, marginBottom: 10 }}>{setupCouncilSelected.length}/3 kept</p>
            <button onClick={confirmCouncilDraft} disabled={setupCouncilSelected.length !== 3} style={{ ...bp, width: "100%", opacity: setupCouncilSelected.length === 3 ? 1 : 0.4 }}>Continue →</button>
          </div>;
        })()}

        {setupStep === "councilAssign" && (() => {
          const kept = setupCouncilSelected.map(id => getCouncilById(id)).filter(Boolean);
          const allAssigned = setupCouncilSelected.every(id => setupCouncilAssignments[id] != null);
          return <div style={{ ...card, maxWidth: 760, width: "100%", textAlign: "center" }}>
            <h3 style={{ color: "#e9d5ff", marginBottom: 4 }}>Assign each Council to a field</h3>
            <p style={{ color: "#8b5cf6", fontSize: 12, marginBottom: 14 }}>One council per field. The amenities you build in that field count toward this council.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginBottom: 14 }}>
              {kept.map(c => {
                const assignedField = setupCouncilAssignments[c.id];
                return <div key={c.id} style={{ padding: 12, borderRadius: 10, border: "1px solid #2a2a4a", background: "#1a1a2e", textAlign: "left" }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: "#c4b5fd", marginBottom: 6 }}>{c.name}</div>
                  <div style={{ fontSize: 10, color: "#94a3b8", marginBottom: 3 }}>📋 {formatCouncilCondition(c)}</div>
                  <div style={{ fontSize: 10, color: "#4ade80", fontWeight: 600, marginBottom: 8 }}>🎁 {formatCouncilReward(c)}</div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {[0, 1, 2].map(fIdx => {
                      const isAssigned = assignedField === fIdx;
                      // Field is taken by another council if any other id maps to it
                      const takenByOther = Object.entries(setupCouncilAssignments).some(([id, f]) => id !== c.id && f === fIdx);
                      return <button key={fIdx} onClick={() => assignCouncilToField(c.id, fIdx)} disabled={takenByOther && !isAssigned} style={{
                        flex: 1,
                        padding: "8px 4px",
                        borderRadius: 8,
                        border: isAssigned ? "2px solid #a78bfa" : (takenByOther ? "2px solid #2a2a4a" : "2px solid #4c1d95"),
                        background: isAssigned ? "rgba(167,139,250,0.18)" : "#0f0e1a",
                        color: isAssigned ? "#fbbf24" : (takenByOther ? "#475569" : "#c4b5fd"),
                        cursor: (takenByOther && !isAssigned) ? "not-allowed" : "pointer",
                        fontSize: 11, fontWeight: 700,
                        opacity: (takenByOther && !isAssigned) ? 0.4 : 1,
                      }}>F{fIdx + 1}{isAssigned ? " ✓" : (takenByOther ? " 🚫" : "")}</button>;
                    })}
                  </div>
                </div>;
              })}
            </div>
            <button onClick={confirmCouncilAssign} disabled={!allAssigned} style={{ ...bp, width: "100%", opacity: allAssigned ? 1 : 0.4 }}>Lock in Councils →</button>
          </div>;
        })()}
        {setupStep === "pickAmenity" && (() => {
          const pd = playerData[currentSetupPlayer.id] || {};
          const councils = pd.councils || [];
          return <div style={{ ...card, maxWidth: 720, width: "100%", textAlign: "center" }}>
            <h3 style={{ color: "#e9d5ff", marginBottom: 12 }}>Choose your starting amenity</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>{AMENITY_TYPES.map(t => <button key={t} onClick={() => setSetupSelectedAmenity(t)} style={{ padding: 16, borderRadius: 12, border: setupSelectedAmenity === t ? `2px solid ${AMENITY_COLORS[t]}` : "2px solid #2a2a4a", background: setupSelectedAmenity === t ? "rgba(124,58,237,0.2)" : "#1a1a2e", color: "#e2e8f0", cursor: "pointer", textAlign: "center" }}><div style={{ fontSize: 28 }}>{AMENITY_ICONS[t]}</div><div style={{ fontWeight: 600, marginTop: 4 }}>{AMENITY_LABELS[t]}</div></button>)}</div>
            {setupSelectedAmenity && <>
              <div style={{ fontSize: 12, color: "#fbbf24", marginBottom: 8, fontWeight: 700 }}>Now pick which field to place it in:</div>
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${FIELD_COUNT}, 1fr)`, gap: 10, marginBottom: 12 }}>
                {Array.from({ length: FIELD_COUNT }).map((_, fIdx) => {
                  const c = councils[fIdx];
                  // We're checking what the field WOULD look like AFTER placement of the selected amenity
                  const fieldNow = pd.fields?.[fIdx] || { campsite: 0, security: 0, catering: 0, portaloo: 0 };
                  const fieldHypothetical = setupSelectedAmenity ? { ...fieldNow, [setupSelectedAmenity]: (fieldNow[setupSelectedAmenity] || 0) + 1 } : fieldNow;
                  const wouldQualify = c ? councilQualifies(c, fieldHypothetical, 1) : false;
                  const isSelected = setupSelectedField === fIdx;
                  return <button key={fIdx} onClick={() => setSetupSelectedField(fIdx)} style={{
                    padding: 12,
                    borderRadius: 10,
                    border: isSelected ? "2px solid #a78bfa" : "2px solid #2a2a4a",
                    background: isSelected ? "rgba(167,139,250,0.18)" : "#1a1a2e",
                    color: "#e9d5ff",
                    cursor: "pointer",
                    fontWeight: 700,
                    fontSize: 13,
                    textAlign: "left",
                    boxShadow: isSelected ? "0 0 12px rgba(167,139,250,0.3)" : "none",
                  }}>
                    <div style={{ textAlign: "center", color: isSelected ? "#fbbf24" : "#c4b5fd", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.6, fontSize: 11 }}>Field {fIdx + 1}</div>
                    {c ? <div style={{
                      padding: 6,
                      borderRadius: 6,
                      background: wouldQualify ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.06)",
                      border: wouldQualify ? "1px solid #22c55e80" : "1px solid #ef444440",
                      boxShadow: wouldQualify ? "0 0 8px rgba(34,197,94,0.25)" : "none",
                    }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: wouldQualify ? "#86efac" : "#fca5a5", marginBottom: 3 }}>{wouldQualify ? "✓" : "✗"} {c.name}</div>
                      <div style={{ fontSize: 9, color: "#94a3b8", lineHeight: 1.3, marginBottom: 2 }}>{formatCouncilCondition(c)}</div>
                      <div style={{ fontSize: 9, color: wouldQualify ? "#4ade80" : "#94a3b8", lineHeight: 1.3, opacity: wouldQualify ? 1 : 0.7 }}>{formatCouncilReward(c)}</div>
                    </div> : <div style={{ fontSize: 10, color: "#475569", textAlign: "center", fontStyle: "italic" }}>(no council)</div>}
                  </button>;
                })}
              </div>
            </>}
            <button onClick={() => confirmSetupAmenity()} disabled={!setupSelectedAmenity || setupSelectedField == null} style={{ ...bp, marginTop: 12, width: "100%", opacity: (setupSelectedAmenity && setupSelectedField != null) ? 1 : 0.4 }}>Confirm →</button>
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
                      <div style={{ fontSize: 13, fontWeight: 700 }}>🎟️ {a.tickets}</div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>⭐ {a.vp} VP</div>
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
              updated = { ...updated, vp: (updated.vp || 0) + cur.vpPerSecurity };
              addLog("Effect", `+${cur.vpPerSecurity} VP from security build!`);
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
            // Check if this player has an agent on a pool artist to resolve
            const resolution = resolvePoolAgents(currentPlayerId);
            if (resolution && resolution.type === "uncontested") {
              setPendingAgentArtist({ pid: resolution.pid, artist: resolution.artist });
            } else if (resolution && resolution.type === "contested") {
              const contest = resolveAgentContestRoll(resolution.contestants, resolution.artist, resolution.poolIdx);
              const humanInvolved = contest.contestantData.some(c => !players.find(p => p.id === c.pid)?.isAI);
              setAgentContest({ ...contest, isAuto: !humanInvolved });
            }
          }} style={{ ...bp, marginTop: 16 }}>Let's Go! 🎶</button>
        </div>
      </div>}
      
      {/* Mid-game objective choice popup */}
      {pendingObjectiveChoice && pendingObjectiveChoice.options.length >= 2 && pendingObjectiveChoice.playerId === currentPlayerId && !showTurnStart && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 910, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
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
      {choiceAmenity && <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ ...card, textAlign: "center", maxWidth: 360 }}><h3 style={{ color: "#c4b5fd", marginBottom: 16 }}>Choose one:</h3>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            {choiceAmenity === "catering_or_portaloo" ? <><button onClick={() => handleChoiceSelect("catering")} style={{ ...bs, fontSize: 24, padding: "16px 24px" }}>🍔<br /><span style={{ fontSize: 12 }}>Catering</span></button><button onClick={() => handleChoiceSelect("portaloo")} style={{ ...bs, fontSize: 24, padding: "16px 24px" }}>🚽<br /><span style={{ fontSize: 12 }}>Portaloo</span></button></> : <><button onClick={() => handleChoiceSelect("security")} style={{ ...bs, fontSize: 24, padding: "16px 24px" }}>👮‍♀️<br /><span style={{ fontSize: 12 }}>Security</span></button><button onClick={() => handleChoiceSelect("campsite")} style={{ ...bs, fontSize: 24, padding: "16px 24px" }}>⛺<br /><span style={{ fontSize: 12 }}>Campsite</span></button></>}
          </div></div>
      </div>}

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
              <span style={{ padding: "4px 10px", borderRadius: 8, background: "rgba(124,58,237,0.15)", color: "#c4b5fd", fontSize: 11 }}>⭐ {vpd.vp || 0} VP</span>
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
                    {sa.map((a, ai) => <div key={ai} style={{ fontSize: 10, padding: "2px 6px", borderRadius: 4, marginBottom: 2, background: genreGradient(a.genre), color: "#fff" }}>{ai === 2 ? "⭐ " : ""}{a.name} <span style={{ fontSize: 8, opacity: 0.7 }}>{a.vp}VP</span></div>)}
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
          <h3 style={{ color: "#c4b5fd", fontSize: 14, marginBottom: 12, letterSpacing: 2, textTransform: "uppercase" }}>Year {year} of 4</h3>
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
                <span>{onFire ? "🔥 " : ic ? "▶ " : ""}{p.festivalName}{p.isAI ? " 🤖" : ""}{onFire ? " 🔥" : ""}</span>
                {!ic && <span style={{ fontSize: 9, color: isViewing ? "#fbbf24" : "#64748b" }}>{isViewing ? "👁️" : "👁️"}</span>}
              </div>
              <div style={{ fontSize: 11, color: "#94a3b8", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
                <span>🎟️ {pd.tickets || 0}</span><span>⭐ {pd.vp || 0} VP</span>
                <span style={{ animation: onFire ? "fameFlicker 0.8s ease-in-out infinite" : "none", color: onFire ? "#fb923c" : "#94a3b8", fontWeight: onFire ? 700 : 400 }}>🔥 Fame {pd.fame || 0}</span><span>🔄 {turnsLeft[p.id] || 0} turns</span>
                {(pd.heldDice || 0) > 0 && <span style={{ color: "#fbbf24", fontWeight: 700 }}>🎲 {pd.heldDice} dice</span>}
              </div>
              <div style={{ fontSize: 12, color: "#64748b", marginTop: 4 }}>{AMENITY_TYPES.map(t => { const c = (pd.amenities?.[t]) || 0; return c > 0 ? <span key={t} style={{ marginRight: 8 }}>{AMENITY_ICONS[t]}×{c}</span> : null; })}</div>
              <div style={{ fontSize: 10, color: "#64748b", marginTop: 2 }}>🎤 {(pd.stageArtists || []).flat().length} artists • 🃏 {(pd.hand || []).length} in hand</div>
            </div>); })}
          <div style={{ marginTop: 12, padding: 8, borderRadius: 8, background: "rgba(124,58,237,0.1)", fontSize: 11, color: "#8b5cf6" }}>
            📦 Deck: {artistDeck.length} • 🗑️ Discard: {discardPile.length} • <span style={{ color: "#fbbf24" }}>🎲 Pool: {dicePool}</span>
          </div>
          {/* ── Always-visible Trending Lineups panel (desktop). The trending-lineup race is
              the game's most engaging mechanic — promoted out of the tab system so players
              always see what they're racing for. ── */}
          {!isMobile && lineupObjectives.length > 0 && <div style={{ marginTop: 12, padding: 10, borderRadius: 12, background: "linear-gradient(135deg, rgba(251,191,36,0.12), rgba(236,72,153,0.08))", border: "2px solid rgba(251,191,36,0.4)", boxShadow: "0 0 18px rgba(251,191,36,0.12)" }}>
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
                    <div style={{ fontWeight: 800, color: lo.claimed1st !== null ? "#4ade80" : "#fbbf24" }}>{lo.claimed1st !== null ? "✓" : ""} 1st +5 VP</div>
                    {lo.claimed1st !== null && <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 1 }}>{players.find(p => p.id === lo.claimed1st)?.festivalName}</div>}
                  </div>
                  <div style={{ padding: "3px 6px", borderRadius: 6, background: lo.claimed2nd !== null ? "rgba(34,197,94,0.15)" : "rgba(196,181,253,0.15)", textAlign: "center" }}>
                    <div style={{ fontWeight: 800, color: lo.claimed2nd !== null ? "#4ade80" : "#c4b5fd" }}>{lo.claimed2nd !== null ? "✓" : ""} 2nd +3 VP</div>
                    {lo.claimed2nd !== null && <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 1 }}>{players.find(p => p.id === lo.claimed2nd)?.festivalName}</div>}
                  </div>
                </div>
              </div>;
            })}
          </div>}
          {/* Desktop sidebar tabs + content */}
          {!isMobile && <>
            <div style={{ display: "flex", gap: 4, marginTop: 10 }}>
              <button onClick={() => setSidebarTab(sidebarTab === "my" ? null : "my")} style={{ flex: 1, padding: "6px 0", borderRadius: 8, border: "none", background: sidebarTab === "my" ? "rgba(124,58,237,0.3)" : "rgba(124,58,237,0.08)", color: sidebarTab === "my" ? "#e9d5ff" : "#64748b", cursor: "pointer", fontSize: 10, fontWeight: 700 }}>🎯 My</button>
              <button onClick={() => setSidebarTab(sidebarTab === "trending" ? null : "trending")} style={{ flex: 1, padding: "6px 0", borderRadius: 8, border: "none", background: sidebarTab === "trending" ? "rgba(251,191,36,0.3)" : "rgba(251,191,36,0.08)", color: sidebarTab === "trending" ? "#fbbf24" : "#64748b", cursor: "pointer", fontSize: 10, fontWeight: 700 }}>📢 Microtrends</button>
            </div>
            {sidebarTab === "my" && <div style={{ marginTop: 6 }}>
              {(playerObjectives[currentPlayerId] || []).length > 0 && (() => { return <div style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 9, fontWeight: 700, color: "#c4b5fd", textTransform: "uppercase" }}>🎯 Artist Objectives</div>
                {(playerObjectives[currentPlayerId] || []).map((entry, oi) => { const r = evalArtistObjective(entry.obj, currentPD); return <div key={oi} style={{ padding: 6, borderRadius: 6, background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.3)", marginBottom: 4 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: entry.completed ? "#4ade80" : "#e9d5ff" }}>{entry.completed ? "✅ " : ""}{entry.obj.name}</div>
                  <div style={{ fontSize: 9, color: "#94a3b8" }}>{entry.obj.req}</div>
                  <div style={{ fontSize: 9, color: "#4ade80" }}>{entry.obj.reward}</div>
                </div>; })}
              </div>; })()}
              <div style={{ padding: 6, borderRadius: 6, background: "rgba(251,191,36,0.08)", fontSize: 10, color: "#fbbf24" }}>🔥 Fame {currentPD.fame || 0} → {FAME_VP[Math.min(5, currentPD.fame || 0)]} VP</div>
            </div>}
            {sidebarTab === "trending" && <div style={{ marginTop: 6 }}>
              {microtrends.length > 0 && <div style={{ fontSize: 9, fontWeight: 700, color: "#e9d5ff", marginBottom: 4, textTransform: "uppercase" }}>🎵 Microtrend</div>}
              {microtrends.map((mt, i) => {
                const claimed = mt.claimedBy !== null;
                const claimer = claimed ? players.find(p => p.id === mt.claimedBy)?.festivalName : null;
                const isAmenity = mt.kind === "amenity";
                const accent = isAmenity ? "#fbbf24" : (GENRE_COLORS[mt.genre] || "#fbbf24");
                const action = isAmenity ? `Place ${AMENITY_ICONS[mt.amenity]} ${AMENITY_LABELS[mt.amenity]}` : `Book a ${mt.genre} artist`;
                return <div key={i} style={{ padding: 4, borderRadius: 6, marginBottom: 3, background: claimed ? "rgba(107,114,128,0.1)" : `${accent}15`, opacity: claimed ? 0.5 : 1 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: claimed ? "#6b7280" : accent }}>{claimed ? "✓" : "🔥"} {action}</div>
                  {claimed && <div style={{ fontSize: 8, color: "#6b7280" }}>Claimed by {claimer}</div>}
                  {!claimed && <div style={{ fontSize: 8, color: "#94a3b8" }}>First to match → +1 Fame</div>}
                </div>;
              })}
              {nextMicrotrend && (() => {
                const nmt = nextMicrotrend;
                const isAmenity = nmt.kind === "amenity";
                const accent = isAmenity ? "#fbbf24" : (GENRE_COLORS[nmt.genre] || "#fbbf24");
                const action = isAmenity ? `Place ${AMENITY_ICONS[nmt.amenity]} ${AMENITY_LABELS[nmt.amenity]}` : `Book a ${nmt.genre} artist`;
                return <div style={{ marginTop: 6, padding: 4, borderRadius: 6, background: "rgba(15,14,26,0.5)", border: `1px dashed ${accent}60` }}>
                  <div style={{ fontSize: 8, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>⏭ Coming up next</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: accent, opacity: 0.85 }}>{action}</div>
                </div>;
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
                <div style={{ fontWeight: 700, fontSize: 13, color: onFire ? "#fde68a" : (ic || yellowed) ? "#fbbf24" : "#c4b5fd" }}>{onFire ? "🔥 " : ic ? "▶ " : ""}{p.festivalName}{p.isAI ? " 🤖" : ""}{onFire ? " 🔥" : ""}</div>
                <div style={{ fontSize: 12, color: "#94a3b8", display: "flex", gap: 8 }}>
                  <span>🎟️{pd.tickets||0}</span><span>⭐{pd.vp||0}</span><span style={{ color: onFire ? "#fb923c" : "#94a3b8", fontWeight: onFire ? 700 : 400, animation: onFire ? "fameFlicker 0.8s ease-in-out infinite" : "none" }}>🔥{pd.fame||0}</span><span>🔄{turnsLeft[p.id]||0}</span>{(pd.heldDice||0) > 0 && <span style={{ color: "#fbbf24" }}>🎲{pd.heldDice}</span>}
                </div>
              </div>); })}
          </div>
        </div>}

          {/* Always-visible Trending Lineups card on mobile too — the game's most important
              shared state, doesn't belong hidden in a collapsed accordion. */}
          {isMobile && lineupObjectives.length > 0 && <div style={{ marginTop: 8, padding: 10, borderRadius: 12, background: "linear-gradient(135deg, rgba(251,191,36,0.12), rgba(236,72,153,0.08))", border: "2px solid rgba(251,191,36,0.4)" }}>
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
                    <div style={{ fontWeight: 800, color: lo.claimed1st !== null ? "#4ade80" : "#fbbf24" }}>{lo.claimed1st !== null ? "✓" : ""} 1st +5 VP</div>
                    {lo.claimed1st !== null && <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>{players.find(p => p.id === lo.claimed1st)?.festivalName}</div>}
                  </div>
                  <div style={{ padding: "4px 8px", borderRadius: 6, background: lo.claimed2nd !== null ? "rgba(34,197,94,0.15)" : "rgba(196,181,253,0.15)", textAlign: "center" }}>
                    <div style={{ fontWeight: 800, color: lo.claimed2nd !== null ? "#4ade80" : "#c4b5fd" }}>{lo.claimed2nd !== null ? "✓" : ""} 2nd +3 VP</div>
                    {lo.claimed2nd !== null && <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 1 }}>{players.find(p => p.id === lo.claimed2nd)?.festivalName}</div>}
                  </div>
                </div>
              </div>;
            })}
          </div>}

          {/* Accordion info panels — mobile only */}
          {isMobile && <>{[
            { key: "my", label: "🎯 My Festival", color: "#c4b5fd", bg: "rgba(124,58,237,0.3)" },
            { key: "trending", label: "📢 Microtrends", color: "#fbbf24", bg: "rgba(251,191,36,0.3)" },
          ].map(tab => (
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
            <div style={{ padding: 10, borderRadius: 8, background: "rgba(251,191,36,0.08)", fontSize: 13, color: "#fbbf24" }}>
              🔥 Fame {currentPD.fame || 0} → {FAME_VP[Math.min(5, currentPD.fame || 0)]} VP at year end
            </div>
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
                return <div style={{ marginTop: 6, padding: "6px 10px", borderRadius: 8, background: "rgba(15,14,26,0.5)", border: `1px dashed ${accent}60` }}>
                  <div style={{ fontSize: 9, fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 2 }}>⏭ Coming up next</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: accent, opacity: 0.85 }}>{action}</div>
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
            <div style={{ fontSize: 12, fontWeight: 700, color: "#c4b5fd", marginBottom: 6 }}>Available Artists ({artistPool.length})</div>
            <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 8 }}>
              {artistPool.map((a, i) => {
                const agentsOnThis = Object.entries(agentPlacements).filter(([pid, p]) => p && p.type === "pool" && p.artistName === a.name);
                return <div key={i} style={{ position: "relative" }}>
                  <ArtistCard artist={a} showCost small
                    affordable={canAffordArtist(a, currentPD)}
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
                affordable={canAffordArtist(a, currentPD)}
                disabled={actionTaken || turnAction !== "artist" || artistAction === "pickStage"}
                onClick={() => artistAction === null && !actionTaken && handleBookFromHand(i)}
              />)}
            </div>}
          </div>}

          {/* Action bar */}
          <div style={{ ...card, width: "100%", maxWidth: 700, marginTop: 12, padding: 16, alignSelf: "center" }}>
            {actionTaken && !noTurnsLeft && <div style={{ textAlign: "center" }}>
              <p style={{ color: "#34d399", fontSize: 14, fontWeight: 600, marginBottom: 4 }}>✓ Action complete! Review your board, then end your turn.</p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 8, flexWrap: "wrap" }}>
                {undoSnapshot && <button onClick={handleUndo} style={{ ...bs, color: "#fbbf24", border: "1px solid #fbbf24", background: "rgba(251,191,36,0.1)" }}>↩️ Undo</button>}
                {hasAgent(currentPlayerId) && !turnAction && <button onClick={() => setTurnAction("deployAgent")} style={{ ...bs, fontSize: 12, background: "rgba(96,165,250,0.15)", border: "1px solid #60a5fa", color: "#60a5fa" }}>🕵️ Deploy Agent (free)</button>}
                <button onClick={() => { setUndoSnapshot(null); endTurn(); }} style={bd}>End Turn →</button>
              </div>
            </div>}

            {!actionTaken && !turnAction && !noTurnsLeft && <div>
              <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                <button onClick={handlePickAmenity} style={bp}>🎲 Pick Amenity</button>
                {hasAgent(currentPlayerId) && <button onClick={() => setTurnAction("deployAgent")} style={{ ...bs, background: "rgba(96,165,250,0.15)", border: "1px solid #60a5fa", color: "#60a5fa" }}>🕵️ Deploy Agent (free)</button>}
                <button onClick={handleArtistAction} style={{ ...bs, background: "linear-gradient(135deg, rgba(236,72,153,0.3), rgba(249,115,22,0.3))", border: "1px solid #ec4899" }}>🎤 Book / Reserve Artist</button>
              </div>
            </div>}

            {/* Pick Amenity */}
            {!actionTaken && turnAction === "pickAmenity" && pickingFieldFor == null && <div style={{ textAlign: "center" }}>
              <p style={{ color: "#c4b5fd", fontSize: 13, marginBottom: 12 }}>Pick a die to build that amenity:</p>
              <DiceDisplay dice={dice} onPick={handleDiePick} canReroll={diceNeedReroll(dice)} onReroll={handleRerollDice} />
              <button onClick={() => setTurnAction(null)} style={{ ...bs, marginTop: 12, fontSize: 12 }}>← Cancel</button>
            </div>}

            {!actionTaken && turnAction === "pickAmenity" && pickingFieldFor != null && <div style={{ textAlign: "center", padding: 14, borderRadius: 12, background: "rgba(167,139,250,0.12)", border: "1px solid #a78bfa", marginBottom: 12 }}>
              <p style={{ color: "#fbbf24", fontSize: 14, fontWeight: 700, margin: 0 }}>{AMENITY_ICONS[pickingFieldFor]} Click a field below to place your {AMENITY_LABELS[pickingFieldFor]}</p>
              <button onClick={cancelFieldPlacement} style={{ ...bs, marginTop: 8, fontSize: 11 }}>← Cancel</button>
            </div>}

            {/* Deploy Agent — pool claim only */}
            {(turnAction === "deployAgent" || turnAction === "agentPool") && <div style={{ textAlign: "center" }}>
              <p style={{ color: "#60a5fa", fontSize: 14, fontWeight: 600, marginBottom: 8 }}>🕵️ Claim a Pool Artist</p>
              <p style={{ color: "#94a3b8", fontSize: 11, marginBottom: 12 }}>Place your agent on an artist you can afford. Next turn: uncontested → book to stage. Contested → dice roll tiebreak (earliest placer wins ties).</p>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                {artistPool.map((a, i) => {
                  const canAfford = canAffordArtist(a, currentPD);
                  const agentsOnIt = Object.entries(agentPlacements).filter(([pid, p]) => p && p.type === "pool" && p.artistName === a.name);
                  return <div key={i} style={{ position: "relative" }}>
                    <ArtistCard artist={a} showCost small onClick={() => {
                      if (!canAfford) return;
                      placeAgentOnArtist(currentPlayerId, i);
                      setTurnAction(null);
                    }} />
                    {!canAfford && <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.6)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, color: "#f87171" }}>Can't afford</div>}
                    {agentsOnIt.length > 0 && <div style={{ position: "absolute", top: -4, right: -4, display: "flex", gap: 2 }}>
                      {agentsOnIt.map(([pid], ai) => {
                        const pColor = players.find(pl => pl.id === parseInt(pid))?.color || "#60a5fa";
                        return <div key={ai} style={{ background: pColor, borderRadius: "50%", width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, border: "2px solid #1e1b4b" }} title={players.find(pl => pl.id === parseInt(pid))?.festivalName}>🕵️</div>;
                      })}
                    </div>}
                  </div>;
                })}
              </div>
              <button onClick={() => setTurnAction(null)} style={{ ...bs, fontSize: 12, marginTop: 12 }}>← Cancel</button>
            </div>}

            {/* Pending agent artist booking (uncontested) */}
            {pendingAgentArtist && (() => {
              const pa = pendingAgentArtist;
              const pd = playerData[pa.pid];
              const openStages = (pd?.stageArtists || []).map((sa, i) => sa.length < 3 ? i : -1).filter(i => i >= 0);
              return <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 950, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ ...card, textAlign: "center", maxWidth: 400 }}>
                  <h3 style={{ color: "#60a5fa", marginBottom: 12 }}>🕵️ Agent Secured {pa.artist.name}!</h3>
                  <ArtistCard artist={pa.artist} showCost />
                  <p style={{ color: "#94a3b8", fontSize: 12, marginTop: 8, marginBottom: 12 }}>Uncontested! Select a stage:</p>
                  <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                    {openStages.map(si => <button key={si} onClick={() => {
                      // Remove from pool
                      const newPool = [...artistPool]; const idx = newPool.findIndex(a => a.name === pa.artist.name);
                      if (idx >= 0) newPool.splice(idx, 1); setArtistPool(newPool);
                      bookArtistToStage(pa.artist, si, pa.pid, true);
                      exhaustAgent(pa.pid);
                      addLog("🕵️ Agent", `Booked ${pa.artist.name} (uncontested agent claim)`);
                      setPendingAgentArtist(null);
                      setTimeout(() => recalcTickets(), 50);
                    }} style={bp}>{(pd.stageNames || [])[si] || `Stage ${si + 1}`}</button>)}
                  </div>
                  {openStages.length === 0 && <><p style={{ color: "#f87171", fontSize: 12 }}>No open stages! Artist goes to hand.</p><button onClick={() => {
                    setPlayerData(p => ({ ...p, [pa.pid]: { ...p[pa.pid], hand: [...p[pa.pid].hand, pa.artist] } }));
                    const newPool = [...artistPool]; const idx = newPool.findIndex(a => a.name === pa.artist.name);
                    if (idx >= 0) newPool.splice(idx, 1); setArtistPool(newPool);
                    exhaustAgent(pa.pid);
                    setPendingAgentArtist(null);
                  }} style={{ ...bs, marginTop: 8 }}>Add to Hand</button></>}
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
                commitAgentContest(ac);
                setAgentContest(null);
                setTimeout(() => recalcTickets(), 50);
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
              <p style={{ color: "#94a3b8", fontSize: 11, marginBottom: 12 }}>Book from hand, or draw 2 from pool/deck</p>
              
              {/* Hand */}
              {handCards.length > 0 && <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#ec4899", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Your Hand — click to book</div>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                  {handCards.map((a, i) => <ArtistCard key={i} artist={a} showCost small affordable={canAffordArtistOrFree(a, currentPD)} disabled={!canAffordArtistOrFree(a, currentPD)} onClick={() => handleBookFromHand(i)} />)}
                </div>
              </div>}
              
              {/* Draw 2 progress */}
              {draw2Picks.length > 0 && <div style={{ marginBottom: 12, padding: 8, borderRadius: 10, background: "rgba(34,197,94,0.1)", border: "1px solid #22c55e40" }}>
                <div style={{ fontSize: 10, color: "#22c55e", fontWeight: 700 }}>Drawing: {draw2Picks.length}/2 picked</div>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 4 }}>
                  {draw2Picks.map((a, i) => <ArtistCard key={i} artist={a} showCost small />)}
                </div>
              </div>}

              {/* Deck card reveal */}
              {/* Pool + Deck row */}
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#22c55e", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Pool & Deck — click to draw ({2 - draw2Picks.length} remaining)</div>
                <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap", alignItems: "flex-start" }}>
                  {artistPool.map((a, i) => {
                    const agentsOnIt = Object.entries(agentPlacements).filter(([pid, p]) => p && p.type === "pool" && p.artistName === a.name);
                    const claimedByOther = isAgentClaimedByOther(a.name, currentPlayerId);
                    return <div key={i} style={{ position: "relative", opacity: claimedByOther ? 0.4 : 1, cursor: claimedByOther ? "not-allowed" : "pointer" }} title={claimedByOther ? "Claimed by another agent" : ""}>
                      <ArtistCard artist={a} showCost small onClick={() => { if (!claimedByOther && draw2Picks.length < 2) draw2PickFromPool(i); }} />
                      {agentsOnIt.length > 0 && <div style={{ position: "absolute", top: -4, right: -4, display: "flex", gap: 2 }}>
                        {agentsOnIt.map(([pid], ai) => {
                          const pColor = players.find(pl => pl.id === parseInt(pid))?.color || "#60a5fa";
                          return <div key={ai} style={{ background: pColor, borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, border: "2px solid #1e1b4b" }}>🕵️</div>;
                        })}
                      </div>}
                    </div>;
                  })}
                  <button onClick={() => { if (draw2Picks.length < 2) draw2PickFromDeck(); }} disabled={artistDeck.length === 0 || draw2Picks.length >= 2} style={{ ...bs, fontSize: 24, padding: "16px 20px", minHeight: 80, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, background: "rgba(124,58,237,0.1)", border: "1px dashed #7c3aed", color: "#c4b5fd", opacity: (artistDeck.length === 0 || draw2Picks.length >= 2) ? 0.3 : 1 }}>
                    📦<span style={{ fontSize: 10 }}>Deck ({artistDeck.length})</span>
                  </button>
                </div>
              </div>
              
              {((currentPD.amenities?.portaloo) || 0) > 0 && draw2Picks.length < 2 && <button onClick={() => {
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
              {hasQualifyingCouncilOfType(currentPD, year, "refreshPool") && !councilRefreshUsedThisTurn && draw2Picks.length < 2 && <button onClick={() => {
                refreshPool(1);
                setCouncilRefreshUsedThisTurn(true);
                addLog(currentPlayer.festivalName, `🔄 Refreshed pool (Council reward — free)`);
                sfx.placeAmenity();
              }} style={{ ...bs, fontSize: 12, marginTop: 6, marginLeft: 6, background: "rgba(34,197,94,0.15)", border: "1px solid #22c55e", color: "#86efac" }}>📋 Refresh Pool (Council, free)</button>}
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
                  const hasAgentOn = Object.values(agentPlacements).some(p => p && p.type === "pool" && p.artistName === a.name);
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
        </div> : sgArtist ? <div style={{ ...card, textAlign: "center", maxWidth: 520, width: "100%" }}>
          <h2 style={{ color: "#fbbf24", fontSize: 24, marginBottom: 4 }}>🌟 Special Guest — Year {year}</h2>
          <h3 style={{ color: "#c4b5fd", fontSize: 18, marginBottom: 16 }}>{sgPlayer?.festivalName}</h3>
          <p style={{ color: "#8b5cf6", fontSize: 12, marginBottom: 12 }}>A special guest wants to headline! Fame level is ignored — you just need the amenities.</p>
          <div style={{ display: "inline-block", marginBottom: 16 }}><ArtistCard artist={sgArtist} showCost /></div>
          {affordable ? <>
            <p style={{ color: "#4ade80", fontSize: 14, fontWeight: 600, marginBottom: 12 }}>✅ You can afford this guest!</p>
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
        </div> : <div style={{ ...card, textAlign: "center", maxWidth: 400 }}>
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
                {currentEffect.autoVP > 0 && <p style={{ color: "#4ade80", fontSize: 20, fontWeight: 900 }}>+{currentEffect.autoVP} ⭐ VP</p>}
                {currentEffect.autoVP < 0 && <p style={{ color: "#ef4444", fontSize: 20, fontWeight: 900 }}>{currentEffect.autoVP} ⭐ VP</p>}
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
                  <p style={{ color: "#4ade80", fontSize: 20, fontWeight: 900 }}>+{vpGain} ⭐ VP</p>
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
              <span style={{ color: "#fbbf24" }}>⭐ {r.stars} stars → <strong>+{vpFromStars} VP</strong></span>
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
          <p style={{ color: "#8b5cf6", marginBottom: 20, fontSize: 14 }}>Results revealed lowest → highest tickets</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
            {sortedPlayersForReveal.map((p, idx) => {
              const rev = idx <= revealIndex;
              const td = allTickets[p.id]?.[year] || {};
              const preVP = td.preYearVP || 0;
              const pd = playerData[p.id] || {};
              return <div key={p.id} style={{ padding: 14, borderRadius: 12, background: rev ? "rgba(124,58,237,0.12)" : "rgba(15,14,26,0.4)", border: rev ? "1px solid #7c3aed" : "1px solid #2a2a4a", opacity: rev ? 1 : 0.25, transition: "all 0.5s", textAlign: "left" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: rev ? 10 : 0 }}>
                  <span style={{ fontWeight: 700, fontSize: 15, color: rev ? "#e9d5ff" : "#4a4568" }}>{rev ? p.festivalName : "???"}{p.isAI ? " 🤖" : ""}</span>
                  <span style={{ fontWeight: 800, fontSize: 18, color: rev ? "#fbbf24" : "#4a4568" }}>{rev ? `${pd.vp || 0} VP` : "?"}</span>
                </div>
                {rev && <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, color: "#94a3b8", fontSize: 12 }}>
                    🎟️ {td.raw || 0} tickets{td.ticketVP > 0 ? " 👑" : ""} • 🔥 Fame {td.fame || 0}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 4 }}>Starting: {preVP} VP</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {td.artistVP > 0 && <span style={{ padding: "4px 10px", borderRadius: 8, background: "rgba(236,72,153,0.15)", border: "1px solid #ec489940", color: "#f472b6", fontSize: 12, fontWeight: 600 }}>🎤 +{td.artistVP}</span>}
                    {td.fameVP > 0 && <span style={{ padding: "4px 10px", borderRadius: 8, background: "rgba(251,191,36,0.15)", border: "1px solid #fbbf2440", color: "#fbbf24", fontSize: 12, fontWeight: 600 }}>🔥 +{td.fameVP}</span>}
                    {td.councilVP > 0 && <span style={{ padding: "4px 10px", borderRadius: 8, background: "rgba(34,197,94,0.15)", border: "1px solid #22c55e40", color: "#4ade80", fontSize: 12, fontWeight: 600 }}>📋 +{td.councilVP}</span>}
                    {td.starDiceVP > 0 && <span style={{ padding: "4px 10px", borderRadius: 8, background: "rgba(168,85,247,0.15)", border: "1px solid #a855f740", color: "#c084fc", fontSize: 12, fontWeight: 600 }}>🎲 +{td.starDiceVP}</span>}
                    {td.effectVP > 0 && <span style={{ padding: "4px 10px", borderRadius: 8, background: "rgba(124,58,237,0.15)", border: "1px solid #7c3aed40", color: "#c4b5fd", fontSize: 12, fontWeight: 600 }}>✨ +{td.effectVP}</span>}
                    {td.ticketVP > 0 && <span style={{ padding: "4px 10px", borderRadius: 8, background: "rgba(96,165,250,0.15)", border: "1px solid #60a5fa40", color: "#60a5fa", fontSize: 12, fontWeight: 600 }}>👑 +{td.ticketVP}</span>}
                  </div>
                  <div style={{ marginTop: 6, fontSize: 11, color: "#8b5cf6" }}>= {preVP} + {td.totalYearVP || 0} = <strong style={{ color: "#fbbf24" }}>{pd.vp || 0} VP</strong></div>
                </div>}
              </div>;
            })}
          </div>
          {!leaderboardRevealed ? <button onClick={revealNext} style={bp}>{revealIndex < players.length - 1 ? "Reveal Next 🥁" : "Reveal All! 🎉"}</button> : <button onClick={proceedFromRoundEnd} style={bp}>{year >= totalYears ? "See Final Results 🏆" : "Continue →"}</button>}
        </div>
      </div>{anim}</div>
  );

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
  const exportGameData = () => {
    const rows = [];
    rows.push(["HEADLINERS — Game Summary"]);
    rows.push([`Winner: ${winner?.festivalName || "N/A"}`, `VP: ${winner ? playerData[winner.id]?.vp || 0 : 0}`]);
    rows.push([]);

    // Scoreboard
    const headers = ["Festival", "AI?"];
    for (let y = 1; y <= 4; y++) headers.push(`Yr${y} Raw Tickets`, `Yr${y} Fame`, `Yr${y} Multiplier`, `Yr${y} Final Tickets`);
    headers.push("Total VP");
    rows.push(headers);

    players.forEach(p => {
      const pd = playerData[p.id] || {};
      const row = [p.festivalName, p.isAI ? "Yes" : "No"];
      for (let y = 1; y <= 4; y++) {
        const td = allTickets[p.id]?.[y];
        if (td && typeof td === "object") { row.push(td.raw, td.fame, td.fameVP, td.ticketVP); }
        else { row.push(td || 0, "?", "?", td || 0); }
      }
      row.push(pd.vp || 0);
      rows.push(row);
    });

    rows.push([]); rows.push(["— Festival Details —"]); rows.push([]);

    players.forEach(p => {
      const pd = playerData[p.id] || {};
      rows.push([`Festival: ${p.festivalName}`, p.isAI ? "(AI)" : ""]);
      rows.push(["Final VP", pd.vp || 0, "Final Fame", pd.fame || 0, "Stages", (pd.stages || []).length]);
      rows.push([]);
      rows.push(["Amenity", "Count"]);
      AMENITY_TYPES.forEach(t => rows.push([AMENITY_LABELS[t], (pd.amenities?.[t]) || 0]));
      rows.push([]);

      (pd.stages || []).forEach((_, si) => {
        const sName = (pd.stageNames || [])[si] || `Stage ${si + 1}`;
        const sa = (pd.stageArtists || [])[si] || [];
        rows.push([`${sName} Lineup`]);
        if (sa.length === 0) { rows.push(["  (empty)"]); }
        else {
          rows.push(["  Artist", "Genre", "Fame", "Tickets", "VP", "Effect", "Role"]);
          sa.forEach((a, ai) => rows.push(["  " + a.name, a.genre, a.fame, a.tickets, a.vp, a.effect || "", ai === 2 ? "HEADLINER" : `Slot ${ai + 1}`]));
        }
        rows.push([]);
      });

      if ((pd.hand || []).length > 0) {
        rows.push(["Remaining Hand"]); rows.push(["  Artist", "Genre", "Fame", "VP"]);
        pd.hand.forEach(a => rows.push(["  " + a.name, a.genre, a.fame, a.vp]));
        rows.push([]);
      }
      const objs = playerObjectives[p.id] || [];
      if (objs.length > 0) { rows.push(["Artist Objectives"]); objs.forEach(entry => rows.push(["  " + entry.obj.name, entry.obj.req, entry.completed ? "Completed" : "Incomplete", entry.obj.reward])); }
      // Council objectives removed
      rows.push([]); rows.push(["───────────"]); rows.push([]);
    });

    rows.push(["— Game Log —"]);
    gameLog.forEach(e => {
      if (e.type === "header") rows.push([`[${(e.ht || "").toUpperCase()}] ${e.text}`]);
      else rows.push(["", e.label, e.text]);
    });

    const csv = rows.map(r => r.map(c => { const s = String(c ?? ""); return s.includes(",") || s.includes('"') || s.includes("\n") ? `"${s.replace(/"/g, '""')}"` : s; }).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url;
    a.download = `headliners_game_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  if (phase === "gameOver") return (
    <div style={CS}>{utilButtons}{showLog && <GameLog log={gameLog} onClose={() => setShowLog(false)} />}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh", padding: 24 }}>
        <div style={{ ...card, textAlign: "center", maxWidth: 600, width: "100%" }}>
          <h1 style={{ fontSize: 48, fontWeight: 900, margin: "0 0 8px", background: "linear-gradient(135deg, #fbbf24, #f472b6, #c4b5fd)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>🏆 GAME OVER</h1>
          {winner && <div style={{ marginBottom: 24 }}><p style={{ color: "#fbbf24", fontSize: 22, fontWeight: 700 }}>{winner.festivalName} Wins!</p><p style={{ color: "#8b5cf6", fontSize: 14 }}>with {playerData[winner.id]?.vp || 0} VP</p></div>}
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <button onClick={exportGameData} style={{ ...bs, padding: "12px 20px", fontSize: 14 }}>📊 Download Game Data</button>
            <button onClick={() => { setPhase("lobby"); setGameLog([]); setAllTickets({}); setYear(1); }} style={{ ...bp, padding: "12px 20px", fontSize: 14 }}>Play Again 🎪</button>
          </div>
        </div>
      </div>{anim}</div>
  );

  return null;
}
