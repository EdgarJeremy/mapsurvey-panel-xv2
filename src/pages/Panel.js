import React from 'react';
import { Container, Segment, Menu, Icon, Button } from 'semantic-ui-react';
import { Link, Switch, Route } from 'react-router-dom';

import { Public } from '../services/requests';
import Wait from '../components/Wait';
import UserSub from './subpages/UserSub';
import SurveyorSub from './subpages/SurveyorSub';
import RentSub from './subpages/RentSub';
import SiteSub from './subpages/SiteSub';

export default class Panel extends React.Component {

    state = {
        loading: true,
        loadingText: 'Mengecek session..',
        user: null
    }

    componentDidMount() {
        document.title = "Panel MapSurvey";
        let { history } = this.props;
        Public.check().then((res) => {
            if (!res.status) {
                history.push('/');
            } else {
                this.setState({
                    user: res.data
                }, () => this._setLoading(false));
            }
        });
    }

    _setLoading(loading, loadingText) {
        this.setState({ loading, loadingText });
    }

    _onLogout() {
        let { history } = this.props;
        this._setLoading(true, 'Menghubungi server..');
        Public.logout().then(() => {
            history.push('/');
            this._setLoading(false);
        });
    }

    _currentRoute() {
        let path = this.props.location.pathname;
        let thispath = this.props.match.path;
        return path.replace(thispath, '');
    }

    render() {
        const { loading, loadingText, user } = this.state;
        return (
            <div className="container-panel">
                {loading ? <Wait visible={true} text={loadingText} /> :
                    <Container>
                        {/* Header */}
                        <Segment color="black" style={{ borderRadius: 0, borderBottomColor: '#ecf0f1', borderBottomWidth: 1, borderBottomStyle: 'solid' }} inverted>
                            <h1 style={{ textAlign: 'center', fontWeight: 'lighter' }}>MapSurvey Panel</h1>
                        </Segment>
                        {/* Menu */}
                        <Menu style={{ borderRadius: 0 }} pointing inverted>
                            {user.type === 'root' ? (
                                // Root menu
                                <Container>
                                    <Menu.Item content={(<Link to={`${this.props.match.path}/`}>Sewaan</Link>)} active={this._currentRoute() === '/' || this._currentRoute() === ''} />
                                </Container>
                            ) : (
                                    // Tenant menu
                                    <Container>
                                        <Menu.Item content={(<Link to={`${this.props.match.path}/`}>Site</Link>)} active={this._currentRoute() === '/' || this._currentRoute() === ''} />
                                        <Menu.Item content={(<Link to={`${this.props.match.path}/users`}>Akun Surveyor</Link>)} active={this._currentRoute() === '/users'} />
                                        <Menu.Item content={(<Link to={`${this.props.match.path}/surveyor`}>Pantau</Link>)} active={this._currentRoute() === '/surveyor'} />
                                    </Container>
                                )}
                            <Menu.Menu position="right">
                                <Menu.Item>
                                    <Button animated color="red" onClick={this._onLogout.bind(this)}>
                                        <Button.Content visible>Keluar</Button.Content>
                                        <Button.Content hidden>
                                            <Icon name="sign out" />
                                        </Button.Content>
                                    </Button>
                                </Menu.Item>
                            </Menu.Menu>
                        </Menu>
                        {/* Content */}
                        {user.type === 'root' ? (
                            // Root pages
                            <Switch>
                                <Route exact path={`${this.props.match.path}/`} render={(props) => <RentSub {...props} me={this.state.user} setLoading={this._setLoading.bind(this)} socket={this.props.socket} />} />
                            </Switch>
                        ) : (
                                // Tenant pages
                                <Switch>
                                    <Route exact path={`${this.props.match.path}/`} render={(props) => <SiteSub {...props} me={this.state.user} socket={this.props.socket} />} />
                                    <Route path={`${this.props.match.path}/users`} render={(props) => <UserSub {...props} me={this.state.user} socket={this.props.socket} />} />
                                    <Route path={`${this.props.match.path}/surveyor`} render={(props) => <SurveyorSub {...props} me={this.state.user} socket={this.props.socket} />} />
                                </Switch>
                            )}

                    </Container>}
            </div>
        );
    }

}