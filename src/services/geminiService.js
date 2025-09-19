import { GoogleGenerativeAI } from '@google/generative-ai'

const API_KEY = 'AIzaSyC9iaN93rPoak8KL0vEcTNtQiG-fEMNpIY'
const genAI = new GoogleGenerativeAI(API_KEY)

const SYSTEM_PROMPT = `You are a data visualization expert analyzing ride-sharing and location data for Austin, TX. Your job is to:

1. Analyze the provided text/data and determine if it can be visualized
2. If visualization is possible, decide the best visualization type
3. Extract and structure the data for visualization

VISUALIZATION TYPES:
- "map": For location-based data with addresses/coordinates and visit counts
- "bar": For comparing quantities across categories
- "pie": For showing proportions/percentages of a whole
- "line": For trends over time
- "none": If data cannot be meaningfully visualized

RESPONSE FORMAT (JSON only):
{
  "canVisualize": boolean,
  "visualizationType": "map" | "bar" | "pie" | "line" | "none",
  "title": "Chart/Map Title",
  "data": [...], // Structured data for the visualization
  "reasoning": "Brief explanation of why this visualization was chosen"
}

FOR MAP DATA FORMAT:
{
  "canVisualize": true,
  "visualizationType": "map",
  "title": "Popular Locations",
  "data": [
    {
      "name": "Location Name or Business Name",
      "address": "Full Address",
      "visits": number,
      "lat": null,
      "lng": null,
      "category": "inferred category like Restaurant, Bar, Entertainment, etc."
    }
  ]
}

FOR CHART DATA FORMAT:
{
  "canVisualize": true,
  "visualizationType": "bar",
  "title": "Visit Distribution",
  "data": [
    { "name": "Category", "value": number }
  ]
}

EXAMPLES OF WHAT TO EXTRACT:
- "The most popular drop-off location was 403 E 6th St, Austin, TX" → Extract as map data with address "403 E 6th St, Austin, TX", infer visits as high number like 150
- "Top locations include Downtown (45%), East Austin (30%)" → Extract as pie chart
- "Visits increased from 100 to 200 over 6 months" → Extract as line chart

IMPORTANT:
- ALWAYS look for addresses, street names, or location names in the text
- If you find location information, use "map" visualization type
- Infer reasonable visit counts if not explicitly stated (popular = 150+, moderate = 50-100, etc.)
- Categorize locations based on context (6th Street = Entertainment, Restaurant areas, etc.)
- Only respond with valid JSON
- Set lat/lng to null - they will be geocoded later`

export const analyzeDataForVisualization = async (textData) => {
  console.log('🔍 Analyzing text data:', textData)
  
  // Show expected data structure
  console.log('📋 MAP EXPECTS THIS STRUCTURE:')
  console.log(`[
    {
      name: "Business/Location Name",        // String - displayed in popup
      address: "Full Address",              // String - displayed in popup  
      visits: 150,                          // Number - determines marker size/color
      lat: 30.2669,                        // Number - latitude coordinate
      lng: -97.7403,                       // Number - longitude coordinate
      category: "Entertainment"             // String - determines marker category color
    }
  ]`)
  console.log('🎯 REQUIRED FIELDS: lat, lng, visits')
  console.log('📍 OPTIONAL FIELDS: name, address, category')
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' })
    
    const prompt = `${SYSTEM_PROMPT}\n\nAnalyze this data:\n${textData}`
    console.log('📤 Sending prompt to Gemini...')
    
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text()
    
    console.log('📥 Gemini raw response:', text)
    
    // Clean up the response to extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('❌ No valid JSON found in Gemini response')
      throw new Error('No valid JSON found in response')
    }
    
    console.log('🔧 Extracted JSON:', jsonMatch[0])
    const analysisResult = JSON.parse(jsonMatch[0])
    console.log('✅ Parsed analysis result:', analysisResult)
    
    // If map data but missing coordinates, try to geocode
    if (analysisResult.visualizationType === 'map' && analysisResult.data) {
      console.log('🗺️ Enriching with coordinates...')
      console.log('📥 Data before enrichment:', analysisResult.data)
      analysisResult.data = await enrichWithCoordinates(analysisResult.data)
      console.log('📍 Final map data with coordinates:', analysisResult.data)
      
      // Validate each location has required fields
      analysisResult.data.forEach((location, index) => {
        const isValid = location.lat && location.lng && location.visits
        console.log(`✅ Location ${index} validation:`, {
          hasName: !!location.name,
          hasAddress: !!location.address,
          hasVisits: !!location.visits,
          hasCoords: !!(location.lat && location.lng),
          isValid
        })
      })
    }
    
    return analysisResult
  } catch (error) {
    console.error('❌ Error analyzing data:', error)
    return {
      canVisualize: false,
      visualizationType: 'none',
      title: 'Analysis Error',
      data: [],
      reasoning: `Failed to analyze the provided data: ${error.message}`
    }
  }
}

// Simple geocoding for Austin addresses
const enrichWithCoordinates = async (locations) => {
  const austinCoordinates = {
    // Common Austin locations with approximate coordinates
    '612 nueces st': { lat: 30.2701, lng: -97.7472 },
    '314 e 6th st': { lat: 30.2669, lng: -97.7418 },
    '403 e 6th st': { lat: 30.2669, lng: -97.7403 },
    '6013 loyola ln': { lat: 30.2234, lng: -97.7456 },
    '610 nueces st': { lat: 30.2701, lng: -97.7471 },
    '700 w 6th st': { lat: 30.2695, lng: -97.7512 },
    '720 w 6th st': { lat: 30.2695, lng: -97.7518 },
    '501 w 6th st': { lat: 30.2695, lng: -97.7489 },
    '360 nueces st': { lat: 30.2701, lng: -97.7465 },
    // Add more variations
    '403 east 6th street': { lat: 30.2669, lng: -97.7403 },
    '403 e 6th street': { lat: 30.2669, lng: -97.7403 }
  }
  
  return locations.map(location => {
    console.log('🏠 Processing location:', location)
    
    if (location.lat && location.lng) {
      console.log('✅ Location already has coordinates')
      return location
    }
    
    // Try multiple address formats
    const address = location.address || location.name || ''
    const addressVariations = [
      address.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim(),
      address.toLowerCase().replace(/street/g, 'st').replace(/[^a-z0-9\s]/g, '').trim(),
      address.toLowerCase().replace(/east/g, 'e').replace(/west/g, 'w').replace(/[^a-z0-9\s]/g, '').trim()
    ]
    
    console.log('🔍 Trying address variations:', addressVariations)
    
    for (const variation of addressVariations) {
      const coords = austinCoordinates[variation]
      if (coords) {
        console.log('✅ Found coordinates for:', variation, coords)
        return { ...location, ...coords }
      }
    }
    
    console.log('⚠️ No coordinates found, using Austin downtown default')
    // Default to Austin downtown if no match
    return {
      ...location,
      lat: 30.2672,
      lng: -97.7431
    }
  })
}