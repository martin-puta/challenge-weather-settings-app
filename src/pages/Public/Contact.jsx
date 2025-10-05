import React, { useState } from 'react';
import '../Public/Contact.css'


const UnitSelector = ({ title, options, currentOption, onChange }) => (
    <div className="app-weather-settings-unit-section">
        <h3 className="app-weather-settings-section-title">{title}</h3>
        <div className="app-weather-settings-unit-buttons-wrapper">
            {options.map((option) => (
                <button
                    key={option.value}
                    className={`app-weather-settings-unit-button ${currentOption === option.value ? 'app-weather-settings-unit-button-active' : ''}`}
                    onClick={() => onChange(option.value)}
                >
                    {option.label}
                </button>
            ))}
        </div>
    </div>
);


const AdvancedCard = () => (
    <div className="app-weather-settings-advanced-card">
        <h2 className="app-weather-settings-advanced-title">Advanced</h2>
        <h3 className="app-weather-settings-new-experience-title">Get new experience</h3>
        <ul className="app-weather-settings-feature-list">
            <li>Ad free</li>
            <li>Health activities overview</li>
            <li>Severe weather notifications</li>
        </ul>
        <div className="app-weather-settings-price-box">
            <span className="app-weather-settings-price">$5.99</span>
            <span className="app-weather-settings-price-suffix">/month</span>
        </div>
    </div>
);


const NewsletterCard = () => (
    <div className="app-weather-settings-newsletter-card">
        <h3 className="app-weather-settings-newsletter-title">Never forget your umbrella!</h3>
        <p className="app-weather-settings-newsletter-description">
            Sign up for our daily weather newsletter personalized just for you.
        </p>
        <button className="app-weather-settings-signup-button">Sign up</button>
    </div>
);



function Settings() {

    const [tempUnit, setTempUnit] = useState('celsius');
    const [windUnit, setWindUnit] = useState('m/s');
    const [pressureUnit, setPressureUnit] = useState('hPa');
    const [precipitationUnit, setPrecipitationUnit] = useState('millimeters');
    const [distanceUnit, setDistanceUnit] = useState('kilometers');
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    return (
        <div className="app-weather-settings-main-container">
            
            
            <div className="app-weather-settings-left-panel">
                
                <h2 className="app-weather-settings-panel-title">Units</h2>

                <UnitSelector 
                    title="TEMPERATURE"
                    options={[{ label: 'Celsius', value: 'celsius' }, { label: 'Fahrenheit', value: 'fahrenheit' }]}
                    currentOption={tempUnit}
                    onChange={setTempUnit}
                />

                <UnitSelector 
                    title="WIND SPEED"
                    options={[{ label: 'km/h', value: 'km/h' }, { label: 'm/s', value: 'm/s' }, { label: 'Knots', value: 'knots' }]}
                    currentOption={windUnit}
                    onChange={setWindUnit}
                />
                
                <UnitSelector 
                    title="PRESSURE"
                    options={[{ label: 'hPa', value: 'hPa' }, { label: 'Inches', value: 'inches' }, { label: 'kPa', value: 'kPa' }, { label: 'mm', value: 'mm' }]}
                    currentOption={pressureUnit}
                    onChange={setPressureUnit}
                />

                <UnitSelector 
                    title="PRECIPITATION"
                    options={[{ label: 'Millimeters', value: 'millimeters' }, { label: 'Inches', value: 'inches' }]}
                    currentOption={precipitationUnit}
                    onChange={setPrecipitationUnit}
                />

                <UnitSelector 
                    title="DISTANCE"
                    options={[{ label: 'Kilometers', value: 'kilometers' }, { label: 'Miles', value: 'miles' }]}
                    currentOption={distanceUnit}
                    onChange={setDistanceUnit}
                />

               
                <div className="app-weather-settings-notification-section">
                    <h3 className="app-weather-settings-section-title">Notifications</h3>
                    <div className="app-weather-settings-notification-toggle-wrapper">
                        <span className="app-weather-settings-notification-label">
                            Be aware of the weather
                        </span>
                        
                        <label className="app-weather-settings-switch">
                            <input 
                                type="checkbox" 
                                checked={notificationsEnabled} 
                                onChange={() => setNotificationsEnabled(!notificationsEnabled)} 
                            />
                            <span className="app-weather-settings-slider"></span>
                        </label>
                    </div>
                </div>

            </div>

           
            <div className="app-weather-settings-right-panel">
                <AdvancedCard />
                <NewsletterCard />
            </div>
            
        </div>
    );
}

export default Settings;