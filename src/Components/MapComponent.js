import { StyleSheet, View, Image } from 'react-native';
import React, { Component } from 'react';
import { mapStyle } from '../Global/mapStyle';
import MapView, { Marker } from 'react-native-maps';
import { colors } from '../Global/Styles';
import MapViewDirections from 'react-native-maps-directions';
import {GOOGLE_MAPS_APIKEY} from "@env"

export default class MapComponent extends Component {

      constructor(props) {
        super(props); // ✅ Now you can safely use this.props
        this.state = {};
        this._map = React.createRef();
      }
  
      componentDidUpdate(prevProps) {
        if (
          this.props.userDestination?.latitude != null &&
          prevProps.userDestination?.latitude !== this.props.userDestination?.latitude &&
          this._map.current // ✅ check if map ref is available
        ) {
          this._map.current.fitToCoordinates(
            [this.props.userOrigin, this.props.userDestination],
            {
              edgePadding: { top: 150, right: 50, left: 50, bottom: 150 },
              animated: true,
            }
          );
        }
      }
      

  render() {
    return (
      <View style={styles.container}>
        <MapView
          style={styles.map}
          customMapStyle={mapStyle}
          ref ={this._map}
          showsUserLocation
          initialRegion={{
            latitude: 33.6844,
            longitude: 73.0479,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          {
            this.props.userOrigin.latitude != null &&
          
          <Marker coordinate={this.props.userOrigin} anchor = {{x:0.5, y:0.5}}>
            {/* Make sure Image is rendered properly */}
            <Image
              source={require('../../assets/images/location.png')}
              style={styles.markerOrigin2} // Ensure these are numeric values
              resizeMode='cover'
            />
          </Marker>
  }

  {
            this.props.userDestination.latitude != null &&
          
          <Marker coordinate={this.props.userDestination} anchor = {{x:0.5, y:0.5}}>
            {/* Make sure Image is rendered properly */}
            <Image
              source={require('../../assets/images/location.png')}
              style={styles.markerDestination} // Ensure these are numeric values
              resizeMode='cover'
            />
          </Marker>
  }
  
  {
    this.props.userDestination.latitude !== null && 
    <MapViewDirections
      origin={this.props.userOrigin}
      destination={this.props.userDestination}
      apikey={GOOGLE_MAPS_APIKEY}
      strokeWidth={4}
      strokeColor={colors.black}
    />
  }
        </MapView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  map: {
       height:"100%",
        width:"100%"
       },

       
         markerWrapOrigin: {
          //  alignItems: "center",
           // justifyContent: "center",
             width:40,
            height:20,
           // marginTop:0
           },
           markerOrigin: {
              width: 16,
              height: 16,
              borderRadius:8
           },
     
           destination: {
              width:20,
             height:20,
             backgroundColor:colors.black,
             alignItems:"center",
             justifyContent:"center"
            },
  
            view1: {
              width:7,
             height:7,
             backgroundColor:colors.white
            },
            markerDestination: {
             width: 16,
             height: 16,
             
            },
            
            markerOrigin2: {
              width: 20,
              height:20,
              borderRadius:10
             },
  
      car:{
          paddingTop:0,
          width: 40,
          height: 20,
         },
  
         view2:{
          position:"absolute",
          top:10,
          right:12,
          backgroundColor:colors.white,
          height:40,
          width:180,
          borderRadius:20,
          justifyContent:"center",
          alignItems:"center",
          marginTop:2, 
          zIndex: 8
          
        },    
   
  view3:{ flexDirection:"row",
  alignItems:"center",
  //marginRight:15,
  //backgroundColor:"white",
  //paddingHorizontal:2,
  paddingVertical:2,
  //borderRadius:20
  },
  
  view4:{
      position:"absolute",
      top:50,
      left:12,
      backgroundColor:colors.white,
      height:40,
      width:140,
      borderRadius:20,
      justifyContent:"center",
      alignItems:"center",
      marginTop:2, 
      zIndex: 8
      
    }, 
  
    location: {
      width: 20,
      height: 20,
      borderRadius:9,
      backgroundColor:colors.black,
      alignItems:"center",
      justifyContent:"center"
      
      }, 
      
  view9:{width:6,
    height:6,
    borderRadius:4,
    backgroundColor:"white"
  }     
});
