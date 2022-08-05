import React from 'react';
import { Segment, Divider, Button, Icon, Input } from 'semantic-ui-react';
import { Rent } from '../../services/requests';
import Map from '../../components/Map';

export default class SurveyorSub extends React.Component {

    state = {
        map_id: null
    }

    componentDidMount() {
        const { socket, me } = this.props;
        this.setState({ map_id: me.rent.map_id });
        if (socket) {
            socket.on('update_points', (data) => {
                console.log(data);
                if (this.mMap) {
                    this.mMap.updateMarker(data);
                }
            });
        }
    }

    onChangeMap() {
        const { map_id } = this.state;
        const { me } = this.props;
        Rent.edit(me.rent_id, { ...me.rent, map_id });
    }

    render() {
        const { map_id } = this.state;
        return (
            <div>
                <Segment>
                    <h2>Surveyor Aktif</h2>
                    <h3>Style URL</h3>
                    <Input style={{ width: 500 }} value={map_id} onChange={(e) => this.setState({ map_id: e.target.value })} />{' '}
                    <Button primary onClick={this.onChangeMap.bind(this)}>Simpan</Button>
                    <Divider />
                    {map_id ? <Map url={map_id} ref={(e) => this.mMap = e} /> : (
                        <div>
                            <h5><Icon name="arrow up" />Isi URL peta yang valid</h5>
                        </div>
                    )}
                </Segment>
            </div>
        );
    }

}