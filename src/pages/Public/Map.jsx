import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'; // Ajout des imports Leaflet
import '../Public/Map.css';

// Fix pour les icônes Leaflet cassées dans React
import L from 'leaflet';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});


// Composant de Carte Leaflet
const WeatherMapComponent = ({ cityData, apiKey, getWeatherIcon }) => {
    // Coordonnées pour centrer la carte sur l'Espagne (Madrid)
    const center = [40.4168, -3.7038]; 
    const zoomLevel = 6; 

    // Les tuiles météo d'OpenWeatherMap
    const weatherTileUrl = `https://tile.openweathermap.org/map/temp_new/{z}/{x}/{y}.png?appid=${apiKey}`;

    return (
        // La div du panneau de carte utilise la classe CSS existante pour le style du conteneur
        <MapContainer 
            center={center} 
            zoom={zoomLevel} 
            scrollWheelZoom={true} 
            className="app-weather-map-ui-map-visualization-panel" // Réutilise la classe du panneau
        >
            {/* 1. La couche de carte de base (ex: OpenStreetMap) */}
            <TileLayer
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* 2. La couche de données météo (Température dans cet exemple) */}
            {/* ATTENTION : Cette couche nécessite un compte payant pour être utilisée en production. 
               Pour les tests, la couche OSM suffira, ou vous devrez utiliser un autre service. */}
            {/* <TileLayer
                attribution='Weather data © <a href="https://openweathermap.org/">OpenWeatherMap</a>'
                url={weatherTileUrl}
                opacity={0.6}
            />
            */}

            {/* Marqueurs pour chaque ville */}
            {cityData.map(city => (
                <Marker key={city.name} position={[city.lat, city.lon]}>
                    <Popup>
                        <div className="app-weather-map-ui-map-popup">
                            <h4 className="app-weather-map-ui-map-popup-title">{city.name}</h4>
                            <p>{city.temp}°C | {city.description}</p>
                            <p>Vent: {city.wind} m/s</p>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </MapContainer>
    );
};


/**
 * Composant principal de l'application météo.
 */
function Map() {
  const [cityData, setCityData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Clé API OpenWeatherMap (remplacez par votre clé)
  // ATTENTION: Une clé API doit toujours être stockée dans des variables d'environnement.
  const API_KEY = '39fde1af902a8413615c0ad8aa307451'; // <<< CLÉ MISE À JOUR

  // Villes espagnoles avec leurs coordonnées (avec lat/lon pour Leaflet)
  const spanishCities = [
    { name: 'Bilbao', lat: 43.2627, lon: -2.9253 },
    { name: 'Barcelona', lat: 41.3851, lon: 2.1734 },
    { name: 'Madrid', lat: 40.4168, lon: -3.7038 },
    { name: 'Malaga', lat: 36.7194, lon: -4.4200 },
  ];

  const getWeatherIcon = (iconType) => {
    // Logique d'icône (inchangée)
    const mainIcon = iconType ? iconType.toLowerCase() : '';
    switch (mainIcon) {
      case 'clear': return '☀️';
      case 'clouds': return '☁️';
      case 'rain': return '🌧️';
      case 'drizzle': return '🌦️';
      case 'thunderstorm': return '⛈️';
      case 'snow': return '❄️';
      case 'mist': 
      case 'fog': 
      case 'haze': return '🌫️';
      default: return '🌈';
    }
  };

  const fetchWeatherData = async () => {
    // ... (Logique de fetch inchangée, utilise API_KEY) ...
    try {
        setLoading(true);
        const promises = spanishCities.map(city =>
          fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${API_KEY}&units=metric&lang=fr`)
            .then(response => {
              if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
              return response.json();
            })
        );
  
        const results = await Promise.all(promises);
        
        const weatherData = results.map((data, index) => ({
          name: spanishCities[index].name,
          temp: Math.round(data.main.temp),
          feels_like: Math.round(data.main.feels_like),
          description: data.weather[0].description,
          icon: data.weather[0].main.toLowerCase(),
          wind: data.wind.speed.toFixed(1),
          timestamp: new Date(data.dt * 1000).toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
          }),
          lat: spanishCities[index].lat, // Ajout des coordonnées pour la carte
          lon: spanishCities[index].lon, // Ajout des coordonnées pour la carte
        }));
  
        const sortedData = ['Bilbao', 'Barcelona', 'Madrid', 'Malaga'].map(name => 
            weatherData.find(d => d.name === name)
        ).filter(Boolean);
  
        setCityData(sortedData);
        setError(null);
      } catch (err) {
        setError(`Erreur lors du chargement des données météo. ${err.message}`);
        console.error('Erreur:', err);
      } finally {
        setLoading(false);
      }
  };

  useEffect(() => {
    fetchWeatherData();
    const interval = setInterval(fetchWeatherData, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Composant WeatherCard pour la LISTE de droite (simplifié pour l'image)
  const WeatherCard = ({ name, temp, icon, timestamp }) => (
    <div className={`app-weather-map-ui-city-detail-card app-weather-map-ui-city-${name.toLowerCase()}`}>
      <div className="app-weather-map-ui-card-primary-info">
        <span className="app-weather-map-ui-weather-icon">{getWeatherIcon(icon)}</span>
        <span className="app-weather-map-ui-time-stamp">{timestamp}</span>
      </div>
      <div className="app-weather-map-ui-city-temperature-data">
        <span className="app-weather-map-ui-city-name-label">{name}</span>
        <span className="app-weather-map-ui-temperature-value">{temp}°</span>
      </div>
    </div>
  );

  // Gestion des états
  if (loading || error) {
    return (
        <div className="app-weather-map-ui-main-container">
          <div className="app-weather-map-ui-content-wrapper app-weather-map-ui-loading-error-state">
              {loading && <div className="app-weather-map-ui-loading">Chargement des données météo... ⏳</div>}
              {error && (
                  <div className="app-weather-map-ui-error">
                      {error} 😞
                      <button 
                          onClick={fetchWeatherData}
                          className="app-weather-map-ui-retry-button"
                      >
                          Réessayer
                      </button>
                  </div>
              )}
          </div>
        </div>
    );
  }

  // Rendu principal
  return (
    <div className="app-weather-map-ui-main-container">
      {/* Header */}
      <header className="app-weather-map-ui-application-header">
        <span className="app-weather-map-ui-location-filter-label">Espagne | {cityData.length} Villes</span>
      </header>

      <div className="app-weather-map-ui-content-wrapper">
        
        {/* Left section: Map visualization area (REMPLACÉ par le composant Leaflet) */}
        <WeatherMapComponent 
            cityData={cityData} 
            apiKey={API_KEY} 
            getWeatherIcon={getWeatherIcon}
        />

        {/* Right section: List of detailed weather cards */}
        <div className="app-weather-map-ui-city-list-detail-panel">
          {cityData.map((city) => (
            <WeatherCard
              key={city.name}
              name={city.name}
              temp={city.temp}
              icon={city.icon}
              timestamp={city.timestamp}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Map;