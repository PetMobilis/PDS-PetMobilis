import React, { useEffect, useState } from 'react';
import { View, Text, Button } from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import MapViewDirections from 'react-native-maps-directions';
import { socket } from "./socket.js";

import { googleApi } from './config';
import { getStreetName } from './utils.js';

const TelaIndoAoPassageiro = ({ route }) => {
  const [location, setLocation] = useState(null);
  const [destination, setDestination] = useState(route.params.destination);
  useEffect(() => {
    let watchId;

    const getLocationAsync = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status === 'granted') {
          watchId = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.High,
              timeInterval: 1000,
            },
            async (location) => {
              const originStreetNameResponse = await getStreetName(
                location.coords.latitude,
                location.coords.longitude
              );

              const locationData = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
                streetName: originStreetNameResponse,
              };
              setLocation(locationData);

              // Emitir evento de atualização de localização
              socket.emit('updateLocation', locationData);
            }
          );
        } else {
          throw new Error('Location permission not granted');
        }
      } catch (error) {
        console.error('Error fetching location:', error.message);
      }
    };

    getLocationAsync();

    return () => {
      if (watchId) {
        watchId.remove();
      }
    };
  }, []);

  const onArrival = () => {
    setDestination(route.params.finalDestination);
    // Emitir evento quando o motorista chegar ao local de embarque
    socket.emit('driverArrived');
  };

  return (
    <View style={{ flex: 1 }}>
      {location && (
        <MapView
          style={{ flex: 1 }}
          region={location}
        >
          <Marker coordinate={location} title="Localização do motorista" />
          <Marker coordinate={destination} title="Localização do passageiro" />
          <MapViewDirections
            key={`${destination.latitude},${destination.longitude}`}
            origin={location}
            destination={destination}
            apikey={googleApi}
            strokeWidth={3}
          />
        </MapView>
      )}
      <Button title="Estou no local de embarque" onPress={onArrival} />
    </View>
  );
};

export default TelaIndoAoPassageiro;
