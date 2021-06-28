import React, { Component } from 'react';
import { HashRouter, Switch, Route } from 'react-router-dom';
import io from 'socket.io-client';
import 'semantic-ui-css/semantic.min.css';

import routes from './routes';
import config from './config.json';
import './css/app.css';
import Wait from './components/Wait';

class App extends Component {

	state = {
		socket: null,
		loading: true
	}

	componentDidMount() {
		this.setState({
			socket: io(config.baseBackend)
		}, () => {
			const { socket } = this.state;
			socket.on('connect', () => {
				localStorage.setItem('socketid', socket.id);
				this.setState({ loading: false });
				console.log('done loading');
			});
		});
	}

	render() {
		const { loading, socket } = this.state;
		return (
			<div>
				{loading ? <Wait /> :
					<HashRouter>
						<Switch>
							{routes.map((route, i) => (
								<Route key={i} path={route.path} exact={route.exact} render={(props) => <route.component {...props} socket={socket} />} />
							))}
						</Switch>
					</HashRouter>}
			</div>
		);
	}
}

export default App;
