import React, { useState, useEffect, useCallback } from 'react';
import '../Public/Home.css';

// 🛑 Utilisation de l'API Open-Meteo : Pas besoin de clé API. 🛑
// On utilise l'API Geocoding et l'API de prévisions.

// Coordonnées de départ (Madrid)
const INITIAL_LAT = -11.67; 
const INITIAL_LON = 27.47;
const INITIAL_CITY_NAME = "Lubumbashi";


// NOTE: Les fonctions getIcon/getDescription du précédent exemple sont toujours valides 
// car nous utilisons la même API (Open-Meteo).

const Home = () => {
    const [weatherData, setWeatherData] = useState(null);
    const [city, setCity] = useState(INITIAL_CITY_NAME);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState(INITIAL_CITY_NAME); // État pour la barre de recherche
    
    // ----------------------------------------------------------------------
    // --- 1. FONCTIONS DE MAPPAGE (MANTENUES DE L'EXEMPLE PRÉCÉDENT) ---
    // ----------------------------------------------------------------------

    // Fonction pour mapper les codes météo (WMO) d'Open-Meteo à des icônes
    const getIcon = (wmoCode, isDay = true) => {
        if (wmoCode <= 1) return isDay ? "☀️" : "🌙"; // Clear/Mostly Clear
        if (wmoCode >= 2 && wmoCode <= 3) return "☁️"; // Cloudy
        if (wmoCode >= 51 && wmoCode <= 65) return "🌧️"; // Drizzle/Rain
        if (wmoCode >= 71 && wmoCode <= 75) return "❄️"; // Snow
        if (wmoCode >= 95 && wmoCode <= 99) return "⛈️"; // Thunderstorm
        return "❓";
    };

    const getDescription = (wmoCode) => {
        if (wmoCode <= 1) return "Ciel dégagé";
        if (wmoCode <= 3) return "Nuageux";
        if (wmoCode <= 48) return "Brouillard";
        if (wmoCode <= 65) return "Pluie";
        if (wmoCode <= 75) return "Neige";
        if (wmoCode <= 99) return "Orage";
        return "Inconnu";
    };

    // Fonction de traitement pour adapter Open-Meteo à la structure de votre composant
    const processOpenMeteoData = (data) => {
        const now = new Date();
        
        const current = {
            temp: data.current.temperature_2m,
            feels_like: data.current.apparent_temperature,
            wind_speed: data.current.wind_speed_10m,
            uvi: data.current.uv_index,
            weather_code: data.current.weather_code,
            is_day: data.current.is_day,
        };

        const hourlyForecast = [];
        const startIndex = data.hourly.time.findIndex(time => new Date(time) > now);
        
        for (let i = startIndex; i < startIndex + 6; i++) {
            if (i < data.hourly.time.length) {
                hourlyForecast.push({
                    time: new Date(data.hourly.time[i]).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                    temp: data.hourly.temperature_2m[i],
                    weather_code: data.hourly.weather_code[i],
                });
            }
        }

        const sevenDayForecast = data.daily.time.slice(0, 7).map((time, index) => ({
            day: index === 0 ? "Aujourd'hui" : new Date(time).toLocaleDateString('fr-FR', { weekday: 'short' }),
            max: Math.round(data.daily.temperature_2m_max[index]),
            min: Math.round(data.daily.temperature_2m_min[index]),
            weather_code: data.daily.weather_code[index],
            pop: data.daily.precipitation_probability_max[index] / 100,
        }));

        return { current, hourlyForecast, sevenDayForecast };
    };

    // ----------------------------------------------------------------------
    // --- 2. LOGIQUE DE RECHERCHE DYNAMIQUE (LE CŒUR DE LA MODIFICATION) ---
    // ----------------------------------------------------------------------

    // Fonction principale pour récupérer les données météo
    const fetchWeather = useCallback(async (lat, lon) => {
        if (!lat || !lon) return;

        setLoading(true);
        setError(null);

        try {
            // Endpoint Open-Meteo pour les données Current, Hourly, et Daily
            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,apparent_temperature,wind_speed_10m,weather_code,uv_index,is_day&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=Europe%2FBerlin`;
            
            const weatherResponse = await fetch(weatherUrl);
            
            if (!weatherResponse.ok) {
                throw new Error(`Erreur HTTP: ${weatherResponse.status}`);
            }
            const data = await weatherResponse.json();
            
            const processedData = processOpenMeteoData(data);
            setWeatherData(processedData);

        } catch (err) {
            console.error("Erreur lors du chargement des données météo :", err);
            setError("Erreur de chargement des données météo.");
        } finally {
            setLoading(false);
        }
    }, []);

    // Fonction pour gérer la recherche (Geocoding + Fetch Weather)
    const handleSearch = async (e) => {
        if (e) e.preventDefault();
        
        if (searchTerm.trim() === "") return;

        setLoading(true);
        setError(null);
        
        try {
            // ÉTAPE 1: GÉOCODAGE (Conversion du nom de ville en coordonnées)
            const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(searchTerm.trim())}&count=1&language=fr&format=json`;
            const geoResponse = await fetch(geocodingUrl);
            const geoData = await geoResponse.json();

            if (!geoResponse.ok || !geoData.results || geoData.results.length === 0) {
                throw new Error("Ville non trouvée.");
            }

            const { latitude, longitude, name, country } = geoData.results[0];
            
            // ÉTAPE 2: MISE À JOUR DE LA VILLE ET RÉCUPÉRATION DE LA MÉTÉO
            setCity(`${name}, ${country}`);
            await fetchWeather(latitude, longitude);

        } catch (err) {
            console.error("Erreur de recherche:", err);
            setError(err.message === "Ville non trouvée." ? "Ville non trouvée." : "Erreur lors de la recherche.");
            setLoading(false);
            setWeatherData(null); // Clear old data
        }
    };

    // Lancement au montage du composant (avec les coordonnées initiales de Madrid)
    useEffect(() => {
        handleSearch(); // Exécute une recherche initiale sur 'Madrid' (searchTerm initial)
    }, []); // Dépendance vide : s'exécute une seule fois au montage


    // ----------------------------------------------------------------------
    // --- 3. RENDU DU COMPOSANT (MISE À JOUR DE LA BARRE DE RECHERCHE) ---
    // ----------------------------------------------------------------------

    // Affichage des états de chargement et d'erreur
    if (loading && !weatherData) { // Afficher l'écran de chargement complet seulement si aucune donnée n'est disponible
        return <div className="weather-app loading">Chargement des données météo pour {city}...</div>;
    }
    
    // Si l'application a échoué à charger les données initiales
    if (error && !weatherData) {
        return <div className="weather-app error">Erreur : {error}. Veuillez réessayer.</div>;
    }

    // Données d'affichage
    const current = weatherData ? weatherData.current : {};
    const currentTemp = Math.round(current.temp || 0);
    const mainWeatherCode = current.weather_code || 0;
    const isDay = current.is_day === 1;
    const chanceOfRain = weatherData && weatherData.sevenDayForecast ? Math.round(weatherData.sevenDayForecast[0].pop * 100) : 0; 
    const realFeel = Math.round(current.feels_like || 0);
    const windSpeed = (current.wind_speed * 3.6 || 0).toFixed(1); 
    const uvIndex = (current.uvi || 0).toFixed(0);

    return (
        <div className="weather-app">
            {/* BARRE DE RECHERCHE DYNAMIQUE */}
            <form className="search-barre" onSubmit={handleSearch}>
                <input
                    type="text"
                    placeholder="Rechercher une ville (ex: Paris, Tokyo, Malaga)"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button type="submit">🔍</button>
            </form>
            {error && <div className="search-error">{error}</div>}

            {weatherData && (
                <div className="main-content-grid">
                    {/* Colonne Gauche */}
                    <div className="left-panel">
                        <div className="main-info">
                            <h2>{city}</h2>
                            <p className="rain-chance">Chance de pluie: {chanceOfRain}%</p>
                            <div className="temp-section">
                                <span className="current-temp">{currentTemp}°</span>
                                <div className="main-icon">{getIcon(mainWeatherCode, isDay)}</div>
                            </div>
                        </div>

                        <div className="hourly-forecast-container">
                            <h3>PRÉVISIONS AUJOURD'HUI</h3>
                            <div className="hourly-grid">
                                {weatherData.hourlyForecast.map((item, index) => (
                                    <div className="hourly-item" key={index}>
                                        <p className="time">{item.time}</p>
                                        <span className="icon">{getIcon(item.weather_code, isDay)}</span>
                                        <p className="temp">{Math.round(item.temp)}°</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="air-conditions-container">
                            <div className="air-conditions-header">
                                <h3>CONDITIONS AÉRIENNES</h3>
                                <button className="see-more">Voir plus</button>
                            </div>
                            <div className="air-conditions-grid">
                                <div className="condition-item">
                                    <p className="label">🌡️ Ressenti Réel</p>
                                    <p className="value">{realFeel}°</p>
                                </div>
                                <div className="condition-item">
                                    <p className="label">💨 Vent</p>
                                    <p className="value">{windSpeed} km/h</p>
                                </div>
                                <div className="condition-item">
                                    <p className="label">💧 Probabilité de pluie</p>
                                    <p className="value">{chanceOfRain}%</p>
                                </div>
                                <div className="condition-item">
                                    <p className="label">🔆 Indice UV</p>
                                    <p className="value">{uvIndex}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Colonne Droite */}
                    <div className="right-panel">
                        <h3>PRÉVISIONS SUR 7 JOURS</h3>
                        <div className="seven-day-list">
                            {weatherData.sevenDayForecast.map((item, index) => (
                                <div className="day-item" key={index}>
                                    <span className="day-name">{item.day}</span>
                                    <span className="day-icon">{getIcon(item.weather_code, isDay)}</span>
                                    <span className="day-status">{getDescription(item.weather_code)}</span>
                                    <span className="day-temps">
                                        <span className="max-temp">{item.max}</span>/<span className="min-temp">{item.min}</span>
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {!weatherData && !loading && (
                <div className="no-data">
                    Aucune donnée météo à afficher. Veuillez effectuer une recherche valide.
                </div>
            )}
        </div>
    );
};

export default Home;