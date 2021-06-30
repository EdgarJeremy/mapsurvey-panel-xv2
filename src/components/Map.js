import React from 'react';
import ReactMapboxGL, { Marker } from 'react-mapbox-gl';

const MapGL = ReactMapboxGL({
    accessToken: 'pk.eyJ1IjoiZWRnYXJqZXJlbXkiLCJhIjoiY2psM25nenhmMjMwYzN2cWs1NDdpeXZyMCJ9.T-PUQmpNdO3cMRGeMtfzQQ'
});

export default class Map extends React.Component {

    state = {
        markers: [],
        center: [124.85221914419435, 1.494208940690413],
        zoom: [12]
    }

    componentDidMount() {

    }

    updateMarker(markers = []) {
        this.setState({ markers });
    }

    onReady(map) {
        // map.setPaintProperty('tc-basemap-layer-land', 'fill-color', '#2f353a');
    }

    render() {
        const { markers, center, zoom } = this.state;
        const { url } = this.props;
        return (
            <MapGL center={center} zoom={zoom} {...this.props} style={url} containerStyle={{
                height: '500px'
            }} onStyleLoad={this.onReady.bind(this)}>
                {markers.map((marker, i) => {
                    return marker.location_info ?
                        <Marker key={i} coordinates={[marker.location_info.longitude, marker.location_info.latitude]} anchor={'bottom'}>
                            <div className="marker-container">
                                <span>{marker.name}</span>
                                <img alt="" src={require('../assets/stand-person.png')} />
                            </div>
                        </Marker> : null;
                })}
            </MapGL>
        );
    }

}