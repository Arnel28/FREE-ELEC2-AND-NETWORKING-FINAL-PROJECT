import React, { useState } from 'react';
import './App.css';

function App() {
    const [currentPhase, setCurrentPhase] = useState('home');
    const [installationProgress, setInstallationProgress] = useState({
        windows: false,
        linux: false,
        dualBoot: false
    });
    const [networkConfig, setNetworkConfig] = useState({
        networkAddress: '192.168.10.0',
        cidr: '/28',
        subnetMask: '255.255.255.240',
        computers: [
            { id: 1, ip: '192.168.10.1', status: 'disconnected' },
            { id: 2, ip: '192.168.10.2', status: 'disconnected' }
        ]
    });

    const handleInstallationComplete = (os) => {
        setInstallationProgress(prev => ({
            ...prev,
            [os]: true
        }));
    };

    const handleNetworkSetup = (config) => {
        setNetworkConfig(config);
    };

    const handlePingTest = (from, to) => {
        const fromComputer = networkConfig.computers.find(c