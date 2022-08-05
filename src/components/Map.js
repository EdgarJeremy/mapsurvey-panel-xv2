import React from 'react';
import ReactMapboxGL, { Marker } from 'react-mapbox-gl';
import StandPerson from '../assets/surveyor-marker.png';

const MapGL = ReactMapboxGL({
    accessToken: 'pk.eyJ1IjoiZWRnYXJqZXJlbXkiLCJhIjoiY2psM25nenhmMjMwYzN2cWs1NDdpeXZyMCJ9.T-PUQmpNdO3cMRGeMtfzQQ'
});

export default class Map extends React.Component {

    state = {
        markers: [],
        center: [125.401008, 2.458137],
        zoom: [8],
        map: null
    }

    updateMarker(markers = []) {
        this.setState({ markers });
    }

    onReady(map) {
        this.setState({ map });
    }

    render() {
        const { markers, center, zoom, map } = this.state;
        const { url } = this.props;
        return (
            <MapGL center={center} zoom={zoom} {...this.props} style={url} containerStyle={{
                height: '500px',
                overflow: 'hidden'
            }} onStyleLoad={this.onReady.bind(this)}>
                {markers.map((marker, i) => {
                    return marker.location_info ?
                        <Marker key={i} coordinates={[marker.location_info.longitude, marker.location_info.latitude]} anchor="bottom">
                            <div className='marker-container'>
                                <div>{marker.name}</div>
                                <img alt="" src={StandPerson} />
                            </div>
                        </Marker> : null;
                })}
            </MapGL>
        );
    }

}