import React from 'react';
import { Segment, Divider } from 'semantic-ui-react';
import Map from '../../components/Map';

export default class SurveyorSub extends React.Component {

    componentDidMount() {
        const { socket } = this.props;
        if (socket) {
            socket.emit('ask_points');
            socket.on('update_points', (data) => {
                console.log(data);
                if (this.mMap) {
                    this.mMap.updateMarker(data);
                }
            });
        }
    }

    render() {
        return (
            <div>
                <Segment>
                    <Divider />
                    <h2>Surveyor Aktif</h2>
                    <Divider />
                    <Map ref={(e) => this.mMap = e} />
                </Segment>
            </div>
        );
    }

}