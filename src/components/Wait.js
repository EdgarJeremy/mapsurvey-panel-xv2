import React from 'react';
import { Dimmer, Loader } from 'semantic-ui-react';

export default class Wait extends React.Component {

    render() {
        return (
            <Dimmer active={this.props.visible}>
                <Loader size='large'>{this.props.text || 'Loading..'}</Loader>
            </Dimmer>
        );
    }

}