import MapView, { Marker, Region } from 'react-native-maps';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { MONTREAL_LOC, useSearchGeoLoc } from './hooks/useSearchGeoLoc';
import { useEffect, useRef, useState } from 'react';
import { AutocompleteDropdown, TAutocompleteDropdownItem } from 'react-native-autocomplete-dropdown'
import { useSearchParkingPlacesAroundLoc } from './hooks/useSearchParkingPlaceAroundLoc';
import { useAutoCompleteAddress } from './hooks/useAutocompleteAddress';
import Icon from 'react-native-vector-icons/FontAwesome5';

export default function App() {
  const mapRef = useRef<MapView>(null)

  const {
    location,
    loading: locationLoading,
    setLocation,
    setLocationToActualPosition
  } = useSearchGeoLoc()

  const {
    parkingPlacesLoc,
    searchParkingPlacesAroundLoc
  } = useSearchParkingPlacesAroundLoc()

  const {
    proposals,
    loading: proposalsLoading,
    getAutocompleteAddress
  } = useAutoCompleteAddress()

  const [selectedProposal, setSelectedProposal] = useState<TAutocompleteDropdownItem | null>(null)

  const onChangeSearch = (query: string) => getAutocompleteAddress(query);

  const onLocalizeButtonPress = () => {
    setLocationToActualPosition()
  }

  useEffect(() => {
    searchParkingPlacesAroundLoc(location);
    if (!mapRef.current) return

    const region: Region = {
      longitude: location[0],
      longitudeDelta: 0.01,
      latitude: location[1],
      latitudeDelta: 0.01,
    }

    mapRef.current.animateToRegion(region, 1000)
  }, [location])



  useEffect(() => {
    if (!selectedProposal) return;

    const proposal = proposals.find((p) => p.id === selectedProposal.id)

    if (!proposal) return;

    const { longitude, latitude } = proposal.coords;

    setLocation([longitude, latitude])
  }, [selectedProposal])

  return (
    <View style={styles.container} >
      <MapView
        ref={mapRef}
        style={styles.map}

        initialRegion={{
          longitude: MONTREAL_LOC[0],
          longitudeDelta: 0.01,
          latitude: MONTREAL_LOC[1],
          latitudeDelta: 0.01,
        }}
      >
        {parkingPlacesLoc.map((parkingPlaceLoc, index) => (
          <Marker
            key={index}
            coordinate={{
              longitude: parkingPlaceLoc[0],
              latitude: parkingPlaceLoc[1],
            }} ></Marker>
        ))}
      </MapView>

      <AutocompleteDropdown
        containerStyle={styles.searchContainer}
        inputContainerStyle={styles.searchInput}
        onSelectItem={setSelectedProposal}
        onChangeText={onChangeSearch}
        loading={proposalsLoading && locationLoading}
        dataSet={proposals.map((p) => ({ id: p.id, title: p.address }))}

        clearOnFocus={false}
        closeOnBlur={true}
      />

      <TouchableOpacity style={styles.localizeButton} onPress={onLocalizeButtonPress}>
        <Icon name='map-marker-alt' style={styles.localizeIcon} size={50} color='#CD0404' />
      </TouchableOpacity>
    </View >
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
  searchContainer: {
    top: 50,
    position: 'absolute',
    width: '90%',
    alignSelf: 'center',
    backgroundColor: 'white',
  },
  searchInput: {
    backgroundColor: 'white',
  },
  localizeButton: {
    position: 'absolute',
    width: 80,
    height: 80,
    backgroundColor: 'pink',
    borderRadius: 100,
    bottom: 70,
    right: 50,
    justifyContent: 'center'
  },
  localizeIcon: {
    alignSelf: 'center',
    justifyContent: 'center'
  }


});