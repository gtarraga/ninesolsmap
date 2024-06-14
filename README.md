# Nine Sols Interactive Map

This is an interactive map to mark items, clues, bosses and others. It's built on Next.js using Leaflet.js for the map and a React wrapper for it, supabase for the database.

It's currently hosted at [ninesolsmap.com](ninesolsmap.com)


## Features

- Displays a map using Leaflet with a custom tile layer.
- Fetches marker data from a REST API and groups them by type.
- Able to quickly share a single marker location with a unique URL.
- Supports showing all markers or focusing on a single marker based on URL parameters.
- Provides a Layers Control to toggle visibility of marker types.