import React, { useState, useEffect } from 'react'
import RideMap from './components/RideMap'
import N8nChatWidget from './components/N8nChatWidget'
import VisualizationPanel from './components/VisualizationPanel'
import { analyzeDataForVisualization } from './services/geminiService'

function App() {
  const [mapLocations, setMapLocations] = useState([])
  const [currentVisualization, setCurrentVisualization] = useState(null)
  const [loading, setLoading] = useState(false)
  const [debugInfo, setDebugInfo] = useState('App loaded')

  // IMMEDIATE DEBUG - This should show up right away
  console.log('🚀 APP COMPONENT LOADED!')
  console.log('🏠 App state - mapLocations:', mapLocations)
  console.log('📊 App state - currentVisualization:', currentVisualization)
  
  // Add debug info to state so we can see it on screen
  useEffect(() => {
    console.log('🔥 APP USEEFFECT RUNNING!')
    setDebugInfo(`App initialized at ${new Date().toLocaleTimeString()}`)
  }, [])

  const handleChatMessage = async (messageContent) => {
    console.log('🚨 HANDLE CHAT MESSAGE CALLED!')
    console.log('📨 Received chat message:', messageContent)
    console.log('📨 Message type:', typeof messageContent)
    console.log('📨 Message length:', messageContent?.length)
    
    // Update debug info immediately
    setDebugInfo(`Message received: ${messageContent?.substring(0, 50)}...`)
    setLoading(true)

    try {
      // Analyze the chat response with Gemini
      const analysis = await analyzeDataForVisualization(messageContent)
      console.log('🧠 Gemini analysis result:', analysis)

      if (analysis.canVisualize) {
        if (analysis.visualizationType === 'map') {
          // Update map with new locations
          console.log('🗺️ Updating map with locations:', analysis.data)
          setMapLocations(analysis.data)
          setCurrentVisualization(null) // Close any open chart panel
        } else {
          // Show chart visualization
          console.log('📊 Showing chart visualization:', analysis)
          setCurrentVisualization(analysis)
        }
      } else {
        console.log('❌ Analysis determined data cannot be visualized:', analysis.reasoning)
      }
    } catch (error) {
      console.error('💥 Error analyzing chat response:', error)
    } finally {
      setLoading(false)
    }
  }

  const closeVisualization = () => {
    setCurrentVisualization(null)
  }

  // Test function to show expected map data structure
  const testMapData = () => {
    console.log('🧪 TESTING: Expected map data structure')
    
    const exampleMapData = [
      {
        name: "The Aquarium on 6th",
        address: "403 E 6th St, Austin, TX 78701",
        visits: 150,
        lat: 30.2669,
        lng: -97.7403,
        category: "Entertainment"
      },
      {
        name: "Downtown Location",
        address: "612 Nueces St, Austin, TX",
        visits: 85,
        lat: 30.2701,
        lng: -97.7472,
        category: "Restaurant"
      }
    ]
    
    console.log('📋 Example data structure:', exampleMapData)
    console.log('🎯 Setting test data to map...')
    setMapLocations(exampleMapData)
  }

  // Add test functions in development
  if (process.env.NODE_ENV === 'development') {
    window.testMapData = testMapData
    window.testChatMessage = (message) => {
      console.log('🧪 TESTING: Simulating chat message')
      handleChatMessage(message || "The most popular drop-off location was 403 E 6th St, Austin, TX with 150 visits")
    }
    console.log('🔧 DEV MODE: Available test functions:')
    console.log('  - window.testMapData() - Test map with sample data')
    console.log('  - window.testChatMessage() - Test chat message processing')
  }



  return (
    <div className="app">
      <header className="header">
        <h1>Fetii AI</h1>
      </header>



      <div className="main-content" style={{ height: 'calc(100vh - 80px)' }}>
        {/* DEBUG PANEL - VISIBLE ON SCREEN */}
        <div style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          background: 'rgba(0,0,0,0.8)',
          color: 'white',
          padding: '10px',
          borderRadius: '5px',
          zIndex: 10000,
          fontSize: '12px',
          maxWidth: '300px'
        }}>
          <div><strong>🐛 DEBUG INFO:</strong></div>
          <div>Status: {debugInfo}</div>
          <div>Map Locations: {mapLocations.length}</div>
          <div>Loading: {loading ? 'YES' : 'NO'}</div>
          <div>Visualization: {currentVisualization ? 'YES' : 'NO'}</div>
          <button onClick={() => window.testMapData && window.testMapData()} 
                  style={{marginTop: '5px', padding: '2px 5px'}}>
            Test Map
          </button>
        </div>

        <div className="map-container" style={{ width: '100%', height: '100%' }}>
          <RideMap locations={mapLocations} />
        </div>

        <N8nChatWidget onMessageReceived={handleChatMessage} />

        {loading && (
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'rgba(0,0,0,0.8)',
            color: 'white',
            padding: '20px',
            borderRadius: '8px',
            zIndex: 10000
          }}>
            Analyzing response and updating map...
          </div>
        )}
      </div>

      {currentVisualization && (
        <VisualizationPanel
          visualization={currentVisualization}
          onClose={closeVisualization}
        />
      )}
    </div>
  )
}

export default App