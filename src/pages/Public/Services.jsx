import React, { useState, useEffect, useCallback } from 'react';
import '../Public/Services.css';

// 🛑 API Open-Meteo : Pas besoin de clé API. 🛑

// --- CONFIGURATION INITIALE ---
const INITIAL_CITY_NAME = "Lubumbashi";

// Structure de données par défaut
const initialDataPlaceholder = {
    current: { name: "", temp: 0, chanceOfRain: 0, time: "00:00", weather_code: 0, is_day: 1, realFeel: 0, windSpeed: 0, uvi: 0 },
    hourlyForecast: [],
    sevenDayForecast: [],
};

const initialCityList = [
    { name: "kolwezi", temperature: 18, time: "09:23", weather_code: 3, active: true },
    { name: "Likasi", temperature: 22, time: "10:23", weather_code: 2, active: false },
    { name: "Kipushi", temperature: 25, time: "17:23", weather_code: 0, active: false },
];

// ----------------------------------------------------------------------
// --- FONCTIONS UTILITAIRES DE MAPPAGE & FORMATAGE ---
// ----------------------------------------------------------------------

const getIcon = (wmoCode, isDay = true) => {
    if (wmoCode <= 1) return isDay ? "☀️" : "🌙";
    if (wmoCode >= 2 && wmoCode <= 3) return "☁️";
    if (wmoCode >= 51 && wmoCode <= 65) return "🌧️";
    if (wmoCode >= 71 && wmoCode <= 75) return "❄️";
    if (wmoCode >= 95 && wmoCode <= 99) return "⛈️";
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

const processOpenMeteoData = (data, cityName) => {
    if (!data || !data.current || !data.hourly || !data.daily) {
        throw new Error("Données météo incomplètes de l'API.");
    }
   
    const now = new Date();
    const currentEntry = data.current;
   
    const current = {
        name: cityName,
        temp: currentEntry.temperature_2m,
        time: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        weather_code: currentEntry.weather_code,
        is_day: currentEntry.is_day,
        chanceOfRain: data.daily.precipitation_probability_max[0] / 100,
        realFeel: currentEntry.apparent_temperature,
        windSpeed: currentEntry.wind_speed_10m * 3.6,
        uvi: currentEntry.uv_index,
    };

    const hourlyForecast = [];
    const startIndex = data.hourly.time.findIndex(time => new Date(time) > now);
   
    for (let i = startIndex; i < startIndex + 6; i++) {
        if (i < data.hourly.time.length) {
            hourlyForecast.push({
                time: new Date(data.hourly.time[i]).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
                temperature: data.hourly.temperature_2m[i],
                icon: getIcon(data.hourly.weather_code[i], current.is_day),
            });
        }
    }

    const DAYS = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
    const sevenDayForecast = data.daily.time.slice(0, 7).map((time, index) => {
        const dayDate = new Date(time);
        return {
            day: index === 0 ? "Aujourd'hui" : DAYS[dayDate.getDay()],
            high: Math.round(data.daily.temperature_2m_max[index]),
            low: Math.round(data.daily.temperature_2m_min[index]),
            condition: getDescription(data.daily.weather_code[index]),
            icon: getIcon(data.daily.weather_code[index], current.is_day),
        };
    });

    return { current, hourlyForecast, sevenDayForecast };
};

// ----------------------------------------------------------------------
// --- COMPOSANTS DE PRÉSENTATION ---
// ----------------------------------------------------------------------

const CityCard = React.memo(({ city, onClick }) => {
    return (
        <div
            className={`city-card ${city.active ? 'city-card--active' : ''}`}
            onClick={() => onClick(city.name)}
        >
            <div className="city-card__left">
                <span className="city-card__icon">{getIcon(city.weather_code, true)}</span>
                <div className="city-card__info">
                    <div className="city-card__name">
                        {city.name}
                        {city.active && <span className="city-card__arrow">▲</span>}
                    </div>
                    <div className="city-card__time">{city.time}</div>
                </div>
            </div>
            <div className="city-card__temp">{Math.round(city.temperature)}°</div>
        </div>
    );
});

const MainWeatherPanel = React.memo(({ data, isLoading, error }) => {
    if (isLoading) {
        return <div className="main-panel loading">Chargement des données...</div>;
    }
    if (error) {
        return <div className="main-panel error">Erreur: {error}</div>;
    }
   
    if (!data || !data.current || !data.current.name) {
        return <div className="main-panel no-data">Sélectionnez une ville ou effectuez une recherche.</div>;
    }

    const { current, hourlyForecast, sevenDayForecast } = data;
   
    const chanceOfRain = Math.round(current.chanceOfRain * 100);
    const windSpeed = current.windSpeed.toFixed(1);
    const currentIcon = getIcon(current.weather_code, current.is_day);

    return (
        <div className="main-panel">
            <div className="main-panel__header">
                <div>
                    <h2 className="main-panel__city-name">{current.name}</h2>
                    <p className="main-panel__rain-chance">Chance de pluie: {chanceOfRain}%</p>
                    <h1 className="main-panel__temp">{Math.round(current.temp)}°</h1>
                </div>
                <div className="main-panel__icon">{currentIcon}</div>
            </div>

            <hr className="divider" />

            <h3 className="forecast-title">PRÉVISIONS AUJOURD'HUI</h3>
            <div className="hourly-forecast">
                {hourlyForecast.map((hour, index) => (
                    <div key={index} className="hourly-forecast__item">
                        <p className="hourly-forecast__time">{hour.time}</p>
                        <span className="icon">{hour.icon}</span>
                        <p className="hourly-forecast__temp">{Math.round(hour.temperature)}°</p>
                    </div>
                ))}
            </div>

            <hr className="divider" />
           
            <h3 className="forecast-title">CONDITIONS AÉRIENNES</h3>
            <div className="air-conditions-grid">
                 <div className="condition-item">
                    <p className="label">🌡️ Ressenti Réel</p>
                    <p className="value">{Math.round(current.realFeel)}°</p>
                </div>
                <div className="condition-item">
                    <p className="label">💨 Vent</p>
                    <p className="value">{windSpeed} km/h</p>
                </div>
                <div className="condition-item">
                    <p className="label">🔆 Indice UV</p>
                    <p className="value">{current.uvi.toFixed(0)}</p>
                </div>
            </div>

            <hr className="divider" />

            <h3 className="forecast-title">PRÉVISIONS SUR 7 JOURS</h3>
            <div className="seven-day-forecast">
                {sevenDayForecast.map((day, index) => (
                    <div key={index} className="day-item">
                        <span className="day-name">{day.day}</span>
                        <span className="day-icon">{day.icon}</span>
                        <span className="day-condition">{day.condition}</span>
                        <span className="day-temps">
                            <span className="day-high">{day.high}</span>/<span className="day-low">{day.low}</span>
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
});

// ----------------------------------------------------------------------
// --- COMPOSANT PRINCIPAL (Services) ---
// ----------------------------------------------------------------------

function Services() {
    const [currentWeather, setCurrentWeather] = useState(initialDataPlaceholder);
    const [cityList, setCityList] = useState(initialCityList);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Fonction stable pour récupérer les données météo
    const fetchWeatherAndGeo = useCallback(async (cityName) => {
        setError(null);
        setLoading(true);

        try {
            const geocodingUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName.trim())}&count=1&language=fr&format=json`;
            const geoResponse = await fetch(geocodingUrl);
            const geoData = await geoResponse.json();

            if (!geoResponse.ok || !geoData.results || geoData.results.length === 0) {
                throw new Error("Ville non trouvée.");
            }

            const { latitude, longitude, name } = geoData.results[0];
           
            const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,apparent_temperature,wind_speed_10m,weather_code,uv_index,is_day&hourly=temperature_2m,weather_code&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&temperature_unit=celsius&wind_speed_unit=ms`;
            const weatherResponse = await fetch(weatherUrl);
           
            if (!weatherResponse.ok) {
                throw new Error(`Erreur HTTP: ${weatherResponse.status}`);
            }
            const data = await weatherResponse.json();
           
            const processedData = processOpenMeteoData(data, name);
            setCurrentWeather(processedData);
            return processedData.current;

        } catch (err) {
            console.error("Erreur de recherche:", err);
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    // Gestion stable de la sélection de ville
    const handleCitySelection = useCallback(async (cityName) => {
        const cityInfo = await fetchWeatherAndGeo(cityName);

        if (cityInfo) {
            setCityList(prevList => {
                const updatedList = prevList.map(city => ({...city, active: false}));
                const existsIndex = updatedList.findIndex(city => 
                    city.name.toLowerCase() === cityInfo.name.toLowerCase()
                );

                if (existsIndex !== -1) {
                    // Ville existe déjà - mise à jour
                    updatedList[existsIndex] = {
                        ...updatedList[existsIndex],
                        active: true,
                        temperature: cityInfo.temp,
                        time: cityInfo.time,
                        weather_code: cityInfo.weather_code
                    };
                    return updatedList;
                } else {
                    // Nouvelle ville - ajout en tête
                    const newCity = {
                        name: cityInfo.name,
                        temperature: cityInfo.temp,
                        time: cityInfo.time,
                        weather_code: cityInfo.weather_code,
                        active: true
                    };
                    return [newCity, ...updatedList.slice(0, 2)]; // Garde seulement 3 villes max
                }
            });
        }
    }, [fetchWeatherAndGeo]);

    // Gestion de la recherche
    const handleSearchSubmit = useCallback((e) => {
        e.preventDefault();
        if (searchTerm.trim() === '') return;
       
        handleCitySelection(searchTerm.trim());
        setSearchTerm('');
    }, [searchTerm, handleCitySelection]);

    // Chargement initial
    useEffect(() => {
        handleCitySelection(INITIAL_CITY_NAME);
    }, [handleCitySelection]);

    return (
        <div className="weather-dashboard">
            <form onSubmit={handleSearchSubmit} className="search-bar">
                <input
                    type="text"
                    placeholder="Rechercher une ville..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                    disabled={loading}
                />
                <button type="submit" className="search-button" disabled={loading}>
                    {loading ? "⏳" : "🔍"}
                </button>
            </form>
           
            <div className="weather-content">
                <div className="city-list-panel">
                    <h3 className="panel-header">Villes Actives</h3>
                    {cityList.map((city) => (
                        <CityCard
                            key={city.name}
                            city={city}
                            onClick={handleCitySelection}
                        />
                    ))}
                </div>

                <MainWeatherPanel
                    data={currentWeather}
                    isLoading={loading}
                    error={error}
                />
            </div>
        </div>
    );
}

export default Services;