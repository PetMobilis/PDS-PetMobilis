import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { socket } from "./socket.js";
import { googleApi } from "./config";

const TelaCorridaAceita = ({ route }) => {
  const [driverLocation, setDriverLocation] = useState(null);
  const [destination, setDestination] = useState(route.params.origin); // A origem é passada como um parâmetro

  useEffect(() => {
    // Ouvir atualizações de localização do motorista
    socket.on('driverLocationUpdate', (location) => {
      console.log('Localização do motorista recebida:', location);
      setDriverLocation(location);
    });

    // Limpar o listener quando o componente for desmontado
    return () => {
      socket.off('driverLocationUpdate');
    };
  }, []);
  
  useEffect(() => {
    // Ouvir o evento 'driverArrived'
    socket.on('driverArrived', () => {
      setDestination(route.params.destination);
    });
  
    // Limpar o listener quando o componente for desmontado
    return () => {
      socket.off('driverArrived');
    };
  }, []);
  

  const onArrival = () => {
    setDestination(route.params.destination);
  };

  return (
    <View style={{ flex: 1 }}>
      {driverLocation && destination && (
        <MapView
          style={{ flex: 1 }}
          region={driverLocation}
        >
          <Marker coordinate={driverLocation} title="Localização do motorista" />
          <Marker coordinate={destination} title="Destino" />
          <MapViewDirections
            origin={driverLocation}
            destination={destination}
            apikey={googleApi} // Substitua por sua chave API do Google Maps
            strokeWidth={3}
            strokeColor="hotpink"
          />
        </MapView>
      )}
    </View>
  );
};

export default TelaCorridaAceita;
